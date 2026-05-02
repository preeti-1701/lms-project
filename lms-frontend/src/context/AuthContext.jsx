import { createContext, useContext, useState, useCallback } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      const parsed = stored ? JSON.parse(stored) : null;
      // If stored user has no role, clear stale cache and treat as logged out
      if (parsed && !parsed.role) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  });

  const login = useCallback(async (username, password) => {
    const { data } = await api.post("/auth/login/", { username, password });
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user; // return so caller can redirect by role
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout/");
    } catch {
      // silently fail — clear local state regardless
    } finally {
      // Only remove auth keys — preserve progress data (lms_progress_<userId>)
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("user");
      setUser(null);
    }
  }, []);

  const forceLogout = useCallback(async (userId) => {
    await api.post("/auth/force-logout/", { user_id: userId });
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, forceLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}