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

export function listCourses() {
  return apiFetchWithAuth("/api/courses/", { method: "GET" });
}

export function createCourse(course) {
  return apiFetchWithAuth("/api/courses/", { method: "POST", body: course });
}

export function getCourse(courseId) {
  return apiFetchWithAuth(`/api/courses/${courseId}/`, { method: "GET" });
}

export function getCourseItems(courseId) {
  return apiFetchWithAuth(`/api/courses/${courseId}/items/`, { method: "GET" });
}

export function enroll(courseId) {
  return apiFetchWithAuth(`/api/courses/${courseId}/enroll/`, { method: "POST" });
}

export function myEnrollments() {
  return apiFetchWithAuth("/api/me/enrollments/", { method: "GET" });
}

export function adminPendingCourses() {
  return apiFetchWithAuth("/api/admin/courses/pending/", { method: "GET" });
}

export function adminApproveCourse(courseId) {
  return apiFetchWithAuth(`/api/admin/courses/${courseId}/approve/`, { method: "POST" });
}

export function adminRejectCourse(courseId, reason) {
  return apiFetchWithAuth(`/api/admin/courses/${courseId}/reject/`, { method: "POST", body: { reason } });
}
