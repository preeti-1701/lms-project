/**
 * api.js  –  Thin wrapper around the Django REST API
 *
 * All functions return  { ok: true, data }  on success
 *                   or  { ok: false, msg }  on failure
 *
 * The Django base URL is read from the Vite env variable
 * VITE_API_URL (default = http://localhost:8000)
 */

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ── helpers ────────────────────────────────────────────────────────────────────

function getToken() {
  return localStorage.getItem("lms_token");
}

async function request(method, path, body = null, auth = true) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Token ${token}`;
  }

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  try {
    const res = await fetch(`${BASE}${path}`, opts);
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }

    if (!res.ok) {
      const msg =
        (data && (data.error || data.detail || data.non_field_errors?.[0])) ||
        `HTTP ${res.status}`;
      return { ok: false, msg };
    }
    return { ok: true, data };
  } catch (err) {
    return { ok: false, msg: err.message || "Network error" };
  }
}

const get    = (path, auth = true)         => request("GET",    path, null, auth);
const post   = (path, body, auth = true)   => request("POST",   path, body, auth);
const patch  = (path, body, auth = true)   => request("PATCH",  path, body, auth);
const del    = (path, auth = true)         => request("DELETE", path, null, auth);

// ── Auth ───────────────────────────────────────────────────────────────────────

export const apiRegisterStudent = (data) =>
  post("/api/auth/register/student/", data, false);

export const apiRegisterTrainer = (data) =>
  post("/api/auth/register/trainer/", data, false);

export const apiLogin = (identifier, password, role) =>
  post("/api/auth/login/", { identifier, password, role }, false);

export const apiLogout = () => post("/api/auth/logout/");

export const apiMe = () => get("/api/auth/me/");

// ── Courses ────────────────────────────────────────────────────────────────────

export const apiGetCourses = () => get("/api/courses/", false);

export const apiGetCourse = (id) => get(`/api/courses/${id}/`, false);

export const apiCreateCourse = (data) => post("/api/courses/", data);

export const apiUpdateCourse = (id, data) => patch(`/api/courses/${id}/`, data);

export const apiDeleteCourse = (id) => del(`/api/courses/${id}/`);

// ── Videos ────────────────────────────────────────────────────────────────────

export const apiAddVideo = (courseId, data) =>
  post(`/api/courses/${courseId}/videos/`, data);

export const apiDeleteVideo = (videoId) => del(`/api/videos/${videoId}/`);

// ── Enrollments ────────────────────────────────────────────────────────────────

export const apiGetEnrollments = () => get("/api/enrollments/");

export const apiEnroll = (course_id) => post("/api/enrollments/", { course_id });

export const apiUnenroll = (courseId) => del(`/api/enrollments/${courseId}/unenroll/`);

// ── Progress ───────────────────────────────────────────────────────────────────

export const apiGetProgress = (courseId) => get(`/api/progress/${courseId}/`);

export const apiMarkWatched = (video_id) =>
  post("/api/progress/mark-watched/", { video_id });

// ── Admin ──────────────────────────────────────────────────────────────────────

export const apiGetAllUsers = () => get("/api/admin/users/");

export const apiCreateUser = (data) => post("/api/admin/users/create/", data);

export const apiToggleUserStatus = (userId) =>
  post(`/api/admin/users/${userId}/toggle/`);

export const apiAssignCourses = (userId, course_ids) =>
  post(`/api/admin/users/${userId}/assign/`, { course_ids });

export const apiGetAuditLog = () => get("/api/admin/audit/");
