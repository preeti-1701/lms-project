import { apiFetch, getStoredAuth, setStoredAuth } from "./client";
import { refreshAccessToken } from "./auth";

async function apiFetchWithAuth(path, options = {}) {
  const { access } = getStoredAuth();
  try {
    return await apiFetch(path, { ...options, accessToken: access });
  } catch (err) {
    if (err?.status === 401) {
      const newAccess = await refreshAccessToken().catch(() => "");
      if (!newAccess) throw err;
      setStoredAuth({ access: newAccess });
      return apiFetch(path, { ...options, accessToken: newAccess });
    }
    throw err;
  }
}

export function pendingTrainers() {
  return apiFetchWithAuth("/api/admin/trainers/pending/", { method: "GET" });
}

export function approveTrainer(userId) {
  return apiFetchWithAuth("/api/admin/trainers/approve/", {
    method: "POST",
    body: { user_id: Number(userId) },
  });
}

export function listEnrollments() {
  return apiFetchWithAuth("/api/admin/enrollments/", { method: "GET" });
}

export function listUsers() {
  return apiFetchWithAuth("/api/admin/users/", { method: "GET" });
}
