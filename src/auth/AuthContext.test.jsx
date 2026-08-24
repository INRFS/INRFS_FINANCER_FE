import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from './AuthContext';
import { useAuth } from './authState';
import { api, sessionStore } from '../common/services/apiClient';

describe('AuthContext and AuthProvider', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    sessionStore.clear();
  });

  it('restores authenticated user on mount when refresh succeeds', async () => {
    vi.spyOn(sessionStore, 'getAccessToken').mockReturnValue('valid_token');
    vi.spyOn(api, 'get').mockResolvedValueOnce({
      id: 'u1',
      firstName: 'Ramesh',
      roles: ['FinancerOwner'],
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      // wait for async restore
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toEqual({
      id: 'u1',
      firstName: 'Ramesh',
      roles: ['FinancerOwner'],
    });
    expect(result.current.hasRole('FinancerOwner')).toBe(true);
    expect(result.current.hasRole('Admin')).toBe(false);
  });

  it('handles completeLogin, updateUser, and logout flows', async () => {
    vi.spyOn(sessionStore, 'getAccessToken').mockReturnValue(null);
    vi.spyOn(api, 'get').mockRejectedValueOnce(new Error('Unauthorized'));
    vi.spyOn(api, 'post').mockResolvedValueOnce({});

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {});

    expect(result.current.user).toBeNull();

    // Complete login
    act(() => {
      result.current.completeLogin({
        accessToken: 'new_token',
        expiresAt: '2030-01-01',
        user: { id: 'u2', firstName: 'Asha', roles: ['Admin'] },
      });
    });

    expect(result.current.user.firstName).toBe('Asha');
    expect(result.current.hasRole('Admin')).toBe(true);

    // Update user
    act(() => {
      result.current.updateUser({ lastName: 'Rao' });
    });
    expect(result.current.user.lastName).toBe('Rao');

    // Logout
    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(sessionStore.getAccessToken()).toBeNull();
  });

  it('clears session upon inrfs-session-expired event', async () => {
    vi.spyOn(sessionStore, 'getAccessToken').mockReturnValue('mock_token');
    vi.spyOn(api, 'get').mockResolvedValueOnce({ id: 'u3' });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {});
    expect(result.current.user).toEqual({ id: 'u3' });

    act(() => {
      window.dispatchEvent(new Event('inrfs-session-expired'));
    });

    expect(result.current.user).toBeNull();
  });
});
