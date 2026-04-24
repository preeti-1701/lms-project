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
