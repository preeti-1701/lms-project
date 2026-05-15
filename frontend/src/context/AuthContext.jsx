import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const heartbeatRef          = useRef(null);

  // ── Session Heartbeat ──────────────────────────────────────────────────────
  // Every 60 s, ping /auth/me to confirm session is still active in the DB.
  // If the admin force-logged out the user, the backend returns 401 and the
  // axios interceptor in api.js clears localStorage + redirects to /login.
  const startHeartbeat = useCallback(() => {
    stopHeartbeat();
    heartbeatRef.current = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { stopHeartbeat(); return; }
        await api.get('/auth/me');
      } catch (err) {
        // 401 is handled by api.js interceptor — it clears token + redirects
        stopHeartbeat();
      }
    }, 60_000); // 60 seconds
  }, []);

  const stopHeartbeat = () => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  };

  // ── Re-validate session when tab becomes visible again ────────────────────
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
        } catch {
          // 401 interceptor handles redirect
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // ── On app mount: check if token is still valid ───────────────────────────
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Set a timeout for the initial auth check to prevent hanging
          const authPromise = api.get('/auth/me');
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Auth Timeout')), 5000)
          );
          
          const response = await Promise.race([authPromise, timeoutPromise]);
          setUser(response.data);
          startHeartbeat();
        } catch (err) {
          console.warn('Initial auth check failed or timed out:', err.message);
          // Only clear token if it was a real 401/403, not a network timeout
          if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            localStorage.removeItem('token');
          }
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkUserLoggedIn();
    return () => stopHeartbeat();
  }, [startHeartbeat]);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
    startHeartbeat(); // begin heartbeat after login
    return response.data.user;
  };

  // ── Register ──────────────────────────────────────────────────────────────
  const register = async (name, email, password, role) => {
    const response = await api.post('/auth/register', { name, email, password, role });
    return response.data;
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = async (redirectUrl = '/login') => {
    stopHeartbeat();
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      if (redirectUrl) window.location.href = redirectUrl;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
