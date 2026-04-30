const DEFAULT_BASE_URL = "http://127.0.0.1:8000";

export function getBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL;
}

export function getStoredAuth() {
  const access = localStorage.getItem("lms_access") || "";
  const refresh = localStorage.getItem("lms_refresh") || "";
  let user;
  try {
    user = JSON.parse(localStorage.getItem("lms_user") || "null");
  } catch {
    user = null;
  }
  return { access, refresh, user };
}

export function setStoredAuth({ access, refresh, user }) {
  if (typeof access === "string") localStorage.setItem("lms_access", access);
  if (typeof refresh === "string") localStorage.setItem("lms_refresh", refresh);
  if (user !== undefined) localStorage.setItem("lms_user", JSON.stringify(user));
}

export function clearStoredAuth() {
  localStorage.removeItem("lms_access");
  localStorage.removeItem("lms_refresh");
  localStorage.removeItem("lms_user");
}

async function parseJson(res) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

export async function apiFetch(path, { method = "GET", body, accessToken } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const res = await fetch(`${getBaseUrl()}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const data = await parseJson(res);
  if (!res.ok) {
    const message = data?.detail || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}
