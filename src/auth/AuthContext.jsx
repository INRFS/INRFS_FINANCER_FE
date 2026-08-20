import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { api, refreshSession, sessionStore } from '../common/services/apiClient';
import { AuthContext } from './authState';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => sessionStore.getSession());
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    sessionStore.clear();
    setSession(null);
  }, []);

  useEffect(() => {
    const expired = () => clearSession();
    window.addEventListener('inrfs-session-expired', expired);
    const restore = async () => {
      try {
        if (!sessionStore.getAccessToken()) await refreshSession();
        const user = await api.get('/auth/me');
        setSession((current) => ({ ...current, user }));
      } catch {
        // A fast password login can complete while the initial cookie refresh is
        // still in flight. Do not erase that newer in-memory session.
        if (!sessionStore.getAccessToken()) clearSession();
      } finally {
        setLoading(false);
      }
    };
    restore();
    return () => window.removeEventListener('inrfs-session-expired', expired);
  }, [clearSession]);

  const completeLogin = useCallback((tokens) => {
    sessionStore.save(tokens);
    const next = { user: tokens.user, expiresAt: tokens.expiresAt };
    setSession(next);
    return next;
  }, []);

  const updateUser = useCallback((user) => {
    setSession((current) => current ? { ...current, user: { ...current.user, ...user } } : current);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/revoke', {}, { retryAuth: false });
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const hasRole = useCallback((...roles) => roles.some((role) => session?.user?.roles?.includes(role)), [session]);
  const value = useMemo(() => ({ session, user: session?.user ?? null, loading, completeLogin, updateUser, logout, hasRole }), [session, loading, completeLogin, updateUser, logout, hasRole]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
