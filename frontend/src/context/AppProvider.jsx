import { useCallback, useEffect, useMemo, useState } from "react";

import * as authApi from "../api/auth";
import * as adminApi from "../api/admin";
import * as coursesApi from "../api/courses";
import { getStoredAuth } from "../api/client";
import { AppContext } from "./AppContext";

export function AppProvider({ children }) {
  const stored = getStoredAuth();

  const [auth, setAuth] = useState({
    access: stored.access,
    refresh: stored.refresh,
    user: stored.user,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const syncFromStorage = useCallback(() => {
    const latest = getStoredAuth();
    setAuth({ access: latest.access, refresh: latest.refresh, user: latest.user });
  }, []);

  useEffect(() => {
    const onStorage = (e) => {
      if (["lms_access", "lms_refresh", "lms_user"].includes(e.key)) syncFromStorage();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [syncFromStorage]);

  const login = useCallback(
    async ({ identifier, password }) => {
      setLoading(true);
      setError("");
      try {
        const data = await authApi.login({ identifier, password });
        syncFromStorage();
        return data;
      } catch (e) {
        setError(e?.message || "Login failed");
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [syncFromStorage],
  );

  const signup = useCallback(async (payload) => {
    setLoading(true);
    setError("");
    try {
      return await authApi.signup(payload);
    } catch (e) {
      setError(e?.message || "Signup failed");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      await authApi.logout();
      syncFromStorage();
    } finally {
      setLoading(false);
    }
  }, [syncFromStorage]);

  const value = useMemo(() => {
    return {
      auth,
      loading,
      error,
      actions: {
        login,
        signup,
        logout,
        refreshMe: async () => {
          const data = await authApi.me();
          syncFromStorage();
          return data;
        },
      },
      api: {
        courses: {
          list: coursesApi.listCourses,
          create: coursesApi.createCourse,
          get: coursesApi.getCourse,
          items: coursesApi.getCourseItems,
          enroll: coursesApi.enroll,
          myEnrollments: coursesApi.myEnrollments,
        },
        admin: {
          pendingCourses: coursesApi.adminPendingCourses,
          approveCourse: coursesApi.adminApproveCourse,
          rejectCourse: coursesApi.adminRejectCourse,
          pendingTrainers: adminApi.pendingTrainers,
          approveTrainer: adminApi.approveTrainer,
          enrollments: adminApi.listEnrollments,
          users: adminApi.listUsers,
          usersByRole: adminApi.listUsersByRole,
          userDetail: adminApi.getUserDetail,
          promoteAdmin: adminApi.promoteAdmin,
        },
      },
    };
  }, [auth, loading, error, login, signup, logout, syncFromStorage]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
