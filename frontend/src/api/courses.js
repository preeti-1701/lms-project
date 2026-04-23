import api from './axios'

export const getCourses = () => api.get('/courses/')
export const getCourse = (slug) => api.get(`/courses/${slug}/`)
export const createCourse = (data) => api.post('/courses/create/', data)
export const updateCourse = (slug, data) => api.patch(`/courses/${slug}/`, data)
export const deleteCourse = (slug) => api.delete(`/courses/${slug}/`)
export const getMyCourses = () => api.get('/courses/my-courses/')
export const createLesson = (slug, data) => api.post(`/courses/${slug}/lessons/`, data)
export const updateLesson = (slug, id, data) => api.patch(`/courses/${slug}/lessons/${id}/`, data)
export const deleteLesson = (slug, id) => api.delete(`/courses/${slug}/lessons/${id}/`)