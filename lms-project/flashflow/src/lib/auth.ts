export type Role = "admin" | "trainer" | "student";

export type StoredUser = { email: string; role: Role };

export function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem("lumen_user");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredUser;
    if (!parsed?.email || !parsed?.role) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearStoredUser() {
  try {
    sessionStorage.removeItem("lumen_user");
  } catch {
    /* ignore */
  }
}
