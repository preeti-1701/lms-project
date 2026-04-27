const DEFAULT_BASE_URL = "http://127.0.0.1:8000";

function getBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL;
}

export async function login({ identifier, password }) {
  const res = await fetch(`${getBaseUrl()}/api/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.detail || "Login failed");
  }

  localStorage.setItem("lms_access", data.access);
  localStorage.setItem("lms_refresh", data.refresh);
  localStorage.setItem("lms_user", JSON.stringify(data.user));

  return data;
}
