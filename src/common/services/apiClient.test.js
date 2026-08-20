import { beforeEach, describe, expect, it, vi } from 'vitest';

const ok = (data) => Promise.resolve(new Response(JSON.stringify({ success: true, data }), {
  status: 200,
  headers: { 'Content-Type': 'application/json' },
}));

describe('secure API session handling', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    sessionStorage.clear();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('keeps access tokens in memory and never persists refresh tokens', async () => {
    const { sessionStore } = await import('./apiClient');
    sessionStore.save({ accessToken: 'access', refreshToken: 'refresh', expiresAt: '2030-01-01', user: { id: '1' } });

    expect(sessionStore.getAccessToken()).toBe('access');
    expect(localStorage.getItem('inrfs_access_token')).toBeNull();
    expect(localStorage.getItem('inrfs_refresh_token')).toBeNull();
    expect(sessionStorage.getItem('inrfs_session')).toContain('"id":"1"');
  });

  it('refreshes through credentials-enabled cookie requests', async () => {
    fetch.mockImplementationOnce(() => ok({ accessToken: 'rotated', expiresAt: '2030-01-01', user: { id: '1' } }));
    const { refreshSession, sessionStore } = await import('./apiClient');

    await expect(refreshSession()).resolves.toBe('rotated');
    expect(sessionStore.getAccessToken()).toBe('rotated');
    expect(fetch).toHaveBeenCalledWith('/api/v1/auth/refresh', expect.objectContaining({ credentials: 'include', method: 'POST' }));
  });
});
