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

export function listUsersByRole(role) {
  const roleValue = String(role || "").toLowerCase();
  const qs = new URLSearchParams({ role: roleValue });
  return apiFetchWithAuth(`/api/admin/users/?${qs.toString()}`, { method: "GET" });
}

export function getUserDetail(userId) {
  return apiFetchWithAuth(`/api/admin/users/${Number(userId)}/`, { method: "GET" });
}

export function promoteAdmin(userId) {
  return apiFetchWithAuth("/api/admin/users/promote-admin/", {
    method: "POST",
    body: { user_id: Number(userId) },
  });
}
