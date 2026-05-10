// Central API client for talking to the Django backend.
const BASE = 'http://127.0.0.1:8000'

function getToken() {
  return localStorage.getItem('coursify_token')
}

export function setToken(token) {
  localStorage.setItem('coursify_token', token)
}

export function clearAuth() {
  localStorage.removeItem('coursify_token')
  localStorage.removeItem('coursify_user')
}

export function getStoredUser() {
  const u = localStorage.getItem('coursify_user')
  return u ? JSON.parse(u) : null
}

export function setStoredUser(user) {
  localStorage.setItem('coursify_user', JSON.stringify(user))
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }
  if (token) {
    headers['Authorization'] = `Token ${token}`
  }
  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    const err = new Error(error.error || error.detail || `HTTP ${response.status}`)
    err.data = error
    err.status = response.status
    // If token is invalid (probably logged in elsewhere), clear local state
    // The "/api/login/" path is excluded so failed login attempts don't redirect
    // 401/403 from /api/me/, /api/courses/, etc. means token is dead
    if ((response.status === 401 || response.status === 403) && !path.includes('/login/')) {
      const hadToken = !!getToken()
      if (hadToken) {
        clearAuth()
        window.dispatchEvent(new CustomEvent('coursify:force-logout', {
          detail: { reason: 'session-expired' }
        }))
      }
    }
    throw err
  }
  return response.json()
}

export const api = {
  login: (email, password) =>
    request('/api/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  signup: (data) =>
    request('/api/signup/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  verifyOtp: (email, code) =>
    request('/api/verify-otp/', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    }),

  resendOtp: (email) =>
    request('/api/resend-otp/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  me: () => request('/api/me/'),

  logout: () => request('/api/logout/', { method: 'POST' }),

  mySessions: () => request('/api/my-sessions/'),

  // ===== Instructor (SRS 2.2 Trainer role) =====
  instructorStats: () => request('/api/instructor/stats/'),
  instructorCourses: () => request('/api/instructor/courses/'),
  instructorCourse: (slug) => request(`/api/instructor/courses/${slug}/`),
  instructorCreateCourse: (data) =>
    request('/api/instructor/courses/create/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  instructorUpdateCourse: (slug, data) =>
    request(`/api/instructor/courses/${slug}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  instructorDeleteCourse: (slug) =>
    request(`/api/instructor/courses/${slug}/`, { method: 'DELETE' }),
  instructorCreateLesson: (slug, data) =>
    request(`/api/instructor/courses/${slug}/lessons/`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  instructorUpdateLesson: (lessonId, data) =>
    request(`/api/instructor/lessons/${lessonId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  instructorDeleteLesson: (lessonId) =>
    request(`/api/instructor/lessons/${lessonId}/`, { method: 'DELETE' }),
  instructorCreateQuiz: (slug, data) =>
    request(`/api/instructor/courses/${slug}/quizzes/`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  instructorQuiz: (quizId) => request(`/api/instructor/quizzes/${quizId}/`),
  instructorUpdateQuiz: (quizId, data) =>
    request(`/api/instructor/quizzes/${quizId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  instructorDeleteQuiz: (quizId) =>
    request(`/api/instructor/quizzes/${quizId}/`, { method: 'DELETE' }),

  courses: () => request('/api/courses/'),

  course: (slug) => request(`/api/courses/${slug}/`),

  quiz: (id) => request(`/api/quizzes/${id}/`),

  submitQuiz: (id, answers) =>
    request(`/api/quiz/${id}/submit/`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    }),

  markLessonComplete: (lessonId) =>
    request(`/api/lesson/${lessonId}/complete/`, {
      method: 'POST',
    }),

  enroll: (slug) =>
    request(`/api/courses/${slug}/enroll/`, {
      method: 'POST',
    }),
}
