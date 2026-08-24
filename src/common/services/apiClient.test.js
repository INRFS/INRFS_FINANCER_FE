import { beforeEach, describe, expect, it, vi } from 'vitest';

const ok = (data, status = 200) =>
  Promise.resolve(
    new Response(JSON.stringify({ success: true, data }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  );

const fail = (status, payload = {}) =>
  Promise.resolve(
    new Response(JSON.stringify(payload), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  );

describe('apiClient full suite', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    sessionStorage.clear();
    vi.stubGlobal('fetch', vi.fn());
  });

  describe('sessionStore', () => {
    it('saves and retrieves access token and session correctly', async () => {
      const { sessionStore } = await import('./apiClient');
      expect(sessionStore.getAccessToken()).toBeNull();
      expect(sessionStore.getSession()).toBeNull();

      sessionStore.save({
        accessToken: 'tok_123',
        expiresAt: '2030-01-01T00:00:00Z',
        user: { id: 'u1', email: 'test@inrfs.com' },
      });

      expect(sessionStore.getAccessToken()).toBe('tok_123');
      expect(sessionStore.getSession()).toEqual({
        user: { id: 'u1', email: 'test@inrfs.com' },
        expiresAt: '2030-01-01T00:00:00Z',
      });
    });

    it('clears all session and local storage tokens', async () => {
      const { sessionStore } = await import('./apiClient');
      sessionStore.save({ accessToken: 'tok_123', user: { id: 'u1' } });
      localStorage.setItem('inrfs_financer_authenticated', 'true');
      localStorage.setItem('inrfs_admin_authenticated', 'true');

      sessionStore.clear();

      expect(sessionStore.getAccessToken()).toBeNull();
      expect(sessionStore.getSession()).toBeNull();
      expect(localStorage.getItem('inrfs_financer_authenticated')).toBeNull();
      expect(localStorage.getItem('inrfs_admin_authenticated')).toBeNull();
    });

    it('handles corrupted JSON in sessionStorage gracefully', async () => {
      const { sessionStore } = await import('./apiClient');
      sessionStorage.setItem('inrfs_session', 'invalid{json');
      expect(sessionStore.getSession()).toBeNull();
    });
  });

  describe('ApiError', () => {
    it('instantiates with status, errors, and traceId', async () => {
      const { ApiError } = await import('./apiClient');
      const err = new ApiError('Validation failed', 422, { field: ['Required'] }, 'tr_999');
      expect(err.message).toBe('Validation failed');
      expect(err.status).toBe(422);
      expect(err.errors).toEqual({ field: ['Required'] });
      expect(err.traceId).toBe('tr_999');
      expect(err.name).toBe('ApiError');
    });
  });

  describe('HTTP methods (api.get, api.post, api.put, api.delete)', () => {
    it('executes GET request with bearer token and json response', async () => {
      fetch.mockImplementationOnce(() => ok({ customers: [1, 2] }));
      const { api, sessionStore } = await import('./apiClient');
      sessionStore.save({ accessToken: 'bearer_token_abc' });

      const result = await api.get('/customers');

      expect(result).toEqual({ customers: [1, 2] });
      expect(fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/customers$/),
        expect.objectContaining({
          method: 'GET',
          credentials: 'include',
          headers: expect.any(Headers),
        })
      );
      const callHeaders = fetch.mock.calls[0][1].headers;
      expect(callHeaders.get('Authorization')).toBe('Bearer bearer_token_abc');
      expect(callHeaders.get('Content-Type')).toBe('application/json');
    });

    it('executes GET request when path does not start with slash', async () => {
      fetch.mockImplementationOnce(() => ok({ ok: true }));
      const { api } = await import('./apiClient');
      const result = await api.get('loans/active');
      expect(result).toEqual({ ok: true });
      expect(fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/loans\/active$/),
        expect.anything()
      );
    });

    it('executes POST with JSON body', async () => {
      fetch.mockImplementationOnce(() => ok({ id: 'loan_123' }));
      const { api } = await import('./apiClient');

      const result = await api.post('/loans', { amount: 50000 });
      expect(result).toEqual({ id: 'loan_123' });
      expect(fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/loans$/),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ amount: 50000 }),
        })
      );
    });

    it('executes POST with FormData body without overriding Content-Type', async () => {
      fetch.mockImplementationOnce(() => ok({ uploaded: true }));
      const { api } = await import('./apiClient');

      const formData = new FormData();
      formData.append('file', new Blob(['test']), 'test.pdf');

      const result = await api.post('/documents', formData);
      expect(result).toEqual({ uploaded: true });
      const callHeaders = fetch.mock.calls[0][1].headers;
      expect(callHeaders.has('Content-Type')).toBe(false);
    });

    it('executes PUT with JSON body', async () => {
      fetch.mockImplementationOnce(() => ok({ updated: true }));
      const { api } = await import('./apiClient');

      const result = await api.put('/customers/1', { name: 'New Name' });
      expect(result).toEqual({ updated: true });
      expect(fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/customers\/1$/),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ name: 'New Name' }),
        })
      );
    });

    it('executes DELETE request', async () => {
      fetch.mockImplementationOnce(() => ok({ deleted: true }));
      const { api } = await import('./apiClient');

      const result = await api.delete('/documents/doc_1');
      expect(result).toEqual({ deleted: true });
      expect(fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/documents\/doc_1$/),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('Download method', () => {
    it('downloads blob content on 200 OK', async () => {
      const mockBlob = new Blob(['sample-data'], { type: 'application/pdf' });
      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          blob: async () => mockBlob,
          json: async () => null,
        })
      );

      const { api } = await import('./apiClient');
      const blob = await api.download('/documents/1/content');
      expect(blob).toBe(mockBlob);
    });

    it('retries download after 401 when refresh succeeds', async () => {
      const mockBlob = new Blob(['sample-data'], { type: 'application/pdf' });
      // 1. Initial download -> 401
      fetch.mockImplementationOnce(() => Promise.resolve({ ok: false, status: 401 }));
      // 2. Refresh call -> 200
      fetch.mockImplementationOnce(() =>
        ok({ accessToken: 'new_token', expiresAt: '2030-01-01', user: { id: '1' } })
      );
      // 3. Retried download -> 200
      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          blob: async () => mockBlob,
          json: async () => null,
        })
      );

      const { api } = await import('./apiClient');
      const blob = await api.download('documents/1/content');
      expect(blob).toBe(mockBlob);
    });

    it('throws ApiError when download response fails', async () => {
      fetch.mockImplementationOnce(() =>
        fail(404, { message: 'Document not found' })
      );
      const { api } = await import('./apiClient');
      await expect(api.download('/documents/999/content')).rejects.toThrow('Document not found');
    });
  });

  describe('Error handling and token refresh', () => {
    it('retries request upon 401 and succeeds if refresh succeeds', async () => {
      // First request -> 401
      fetch.mockImplementationOnce(() => Promise.resolve(new Response(null, { status: 401 })));
      // Refresh request -> 200
      fetch.mockImplementationOnce(() =>
        ok({ accessToken: 'refreshed_jwt', expiresAt: '2030-01-01', user: { id: '1' } })
      );
      // Retried request -> 200
      fetch.mockImplementationOnce(() => ok({ profile: 'success' }));

      const { api } = await import('./apiClient');
      const data = await api.get('/profile');
      expect(data).toEqual({ profile: 'success' });
    });

    it('clears session and dispatches session-expired event when refresh fails', async () => {
      const eventSpy = vi.fn();
      window.addEventListener('inrfs-session-expired', eventSpy);

      // First request -> 401
      fetch.mockImplementationOnce(() => Promise.resolve(new Response(null, { status: 401 })));
      // Refresh request -> 401 Failure
      fetch.mockImplementationOnce(() => fail(401, { message: 'Session expired' }));

      const { api, sessionStore } = await import('./apiClient');
      sessionStore.save({ accessToken: 'old_token' });

      await expect(api.get('/profile')).rejects.toThrow('Session expired');
      expect(sessionStore.getAccessToken()).toBeNull();
      expect(eventSpy).toHaveBeenCalled();

      window.removeEventListener('inrfs-session-expired', eventSpy);
    });

    it('throws ApiError with validation message from field error array', async () => {
      fetch.mockImplementationOnce(() =>
        fail(422, {
          errors: {
            mobileNumber: ['Mobile number is already registered'],
          },
        })
      );

      const { api } = await import('./apiClient');
      await expect(api.post('/customers', {})).rejects.toThrow(
        'Mobile number is already registered'
      );
    });

    it('throws special backend unavailable message for 502, 503, 504 status', async () => {
      fetch.mockImplementationOnce(() => Promise.resolve(new Response(null, { status: 503 })));

      const { api } = await import('./apiClient');
      await expect(api.get('/health')).rejects.toThrow(
        'The INRFS API is unavailable. Please start the backend service and try again.'
      );
    });

    it('throws generic request failed message when error response body is empty', async () => {
      fetch.mockImplementationOnce(() => Promise.resolve(new Response(null, { status: 500 })));

      const { api } = await import('./apiClient');
      await expect(api.get('/loans')).rejects.toThrow('Request failed (500)');
    });
  });
});
