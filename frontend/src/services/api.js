import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data) => api.post('/user/register', data),
  login: (data) => api.post('/user/login', data),
  getMe: () => api.get('/user/me'),
  getMyEnrollments: () => api.get('/user/me/enrollments'),
};

// Course API
export const courseAPI = {
  list: () => api.get('/course/'),
  get: (id) => api.get(`/course/${id}`),
  create: (data) => api.post('/course/', data),
  delete: (id) => api.delete(`/course/${id}`),
  enroll: (id) => api.post(`/course/${id}/enroll`),
  complete: (id) => api.patch(`/course/${id}/complete`),
  getEnrollments: (id) => api.get(`/course/${id}/enrollments`),
};

// Content API
export const contentAPI = {
  list: (courseId) => api.get(`/course/${courseId}/content`),
  uploadFile: (courseId, formData) => 
    api.post(`/course/${courseId}/content/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  addYouTube: (courseId, data) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('youtube_url', data.youtube_url);
    formData.append('order', data.order || 0);
    return api.post(`/course/${courseId}/content/youtube`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (courseId, contentId) => api.delete(`/course/${courseId}/content/${contentId}`),
};

// Activity API
export const activityAPI = {
  log: (data) => api.post('/activity/log', data),
  myActivity: () => api.get('/activity/me'),
};

// Admin API
export const adminAPI = {
  dashboard: () => api.get('/admin/dashboard'),
  listUsers: () => api.get('/admin/users'),
  pendingUsers: () => api.get('/admin/users/pending'),
  approveUser: (userId) => api.put(`/admin/users/${userId}/approve`),
  createUser: (data) => api.post('/admin/users', data),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  changeRole: (userId, role) => api.put(`/admin/users/${userId}/role?new_role=${role}`),
  listCourses: () => api.get('/admin/courses'),
  deleteCourse: (courseId) => api.delete(`/admin/courses/${courseId}`),
  listEnrollments: () => api.get('/admin/enrollments'),
  enrollStudent: (userId, courseId) => 
    api.post(`/admin/enroll?user_id=${userId}&course_id=${courseId}`),
  removeEnrollment: (enrollmentId) => api.delete(`/admin/enrollments/${enrollmentId}`),
};

export default api;
