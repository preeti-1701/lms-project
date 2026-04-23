import api from './axios'

export const enroll = (courseId) => api.post(`/enrollment/enroll/${courseId}/`)
export const unenroll = (courseId) => api.delete(`/enrollment/unenroll/${courseId}/`)
export const getMyEnrollments = () => api.get('/enrollment/my-enrollments/')
export const updateProgress = (lessonId, data) => api.post(`/enrollment/progress/${lessonId}/`, data)
export const getCourseProgress = (courseId) => api.get(`/enrollment/progress/course/${courseId}/`)