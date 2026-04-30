import { apiFetch, clearStoredAuth, getStoredAuth, setStoredAuth } from "./client";

export async function login({ identifier, password }) {
  const data = await apiFetch("/api/auth/login/", {
    method: "POST",
    body: { identifier, password },
  });

  setStoredAuth({ access: data.access, refresh: data.refresh, user: data.user });
  return data;
}

export async function signup({ role, name, email, username, password }) {
  return apiFetch("/api/auth/signup/", {
    method: "POST",
    body: { role, name, email, username, password },
  });
}

export async function refreshAccessToken() {
  const { refresh } = getStoredAuth();
  if (!refresh) throw new Error("Missing refresh token");
  const data = await apiFetch("/api/auth/refresh/", { method: "POST", body: { refresh } });
  setStoredAuth({ access: data.access });
  return data.access;
}

export async function me() {
  const { access } = getStoredAuth();
  const data = await apiFetch("/api/auth/me/", { method: "GET", accessToken: access });
  setStoredAuth({ user: data });
  return data;
}

export async function logout() {
  const { access } = getStoredAuth();
  try {
    if (access) await apiFetch("/api/auth/logout/", { method: "POST", accessToken: access });
  } finally {
    clearStoredAuth();
  }
}
