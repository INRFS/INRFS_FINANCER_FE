const DEFAULT_API_BASE_URL = 'https://app.inrfs.com/financer-api/api/v1';
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/$/, '');

const SESSION_KEY = 'inrfs_session';
let accessToken = null;

function readJson(key) {
  try {
    return JSON.parse(sessionStorage.getItem(key) || 'null');
  } catch {
    return null;
  }
}

export const sessionStore = {
  getAccessToken: () => accessToken,
  getSession: () => readJson(SESSION_KEY),
  save(tokens) {
    accessToken = tokens.accessToken;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ user: tokens.user, expiresAt: tokens.expiresAt }));
  },
  clear() {
    accessToken = null;
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem('inrfs_access_token');
    localStorage.removeItem('inrfs_refresh_token');
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem('inrfs_financer_authenticated');
    localStorage.removeItem('inrfs_admin_authenticated');
  },
};

export class ApiError extends Error {
  constructor(message, status, errors, traceId) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors || null;
    this.traceId = traceId || null;
  }
}

let refreshPromise = null;

async function parseResponse(response) {
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.success === false) {
    const unavailable = [502, 503, 504].includes(response.status);
    const validationMessage = payload?.errors && Object.values(payload.errors).flat().find(Boolean);
    const message = payload?.message || validationMessage || payload?.title
      || (unavailable ? 'The INRFS API is unavailable. Please start the backend service and try again.' : `Request failed (${response.status})`);
    throw new ApiError(message, response.status, payload?.errors, payload?.traceId);
  }
  return payload?.data ?? payload;
}

export async function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({}),
    }).then(parseResponse).then((tokens) => {
      sessionStore.save(tokens);
      return tokens.accessToken;
    }).finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const accessToken = sessionStore.getAccessToken();
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  let response = await fetch(`${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`, { credentials: 'include', ...options, headers });
  if (response.status === 401 && options.auth !== false && options.retryAuth !== false) {
    try {
      headers.set('Authorization', `Bearer ${await refreshSession()}`);
      response = await fetch(`${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`, { credentials: 'include', ...options, retryAuth: false, headers });
    } catch (error) {
      sessionStore.clear();
      window.dispatchEvent(new Event('inrfs-session-expired'));
      throw error;
    }
  }
  return parseResponse(response);
}

export const api = {
  get: (path, options) => apiRequest(path, { ...options, method: 'GET' }),
  post: (path, data, options) => apiRequest(path, { ...options, method: 'POST', body: data instanceof FormData ? data : JSON.stringify(data) }),
  put: (path, data, options) => apiRequest(path, { ...options, method: 'PUT', body: JSON.stringify(data) }),
  delete: (path, options) => apiRequest(path, { ...options, method: 'DELETE' }),
  download: async (path) => {
    const request = async (token) => fetch(`${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`, {
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    let response = await request(sessionStore.getAccessToken());
    if (response.status === 401) response = await request(await refreshSession());
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new ApiError(payload?.message || `Request failed (${response.status})`, response.status, payload?.errors, payload?.traceId);
    }
    return response.blob();
  },
};
