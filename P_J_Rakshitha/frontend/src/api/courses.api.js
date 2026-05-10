import api from './axios'

export const getCoursesApi = () =>
  api.get('/courses/')

export const createCourseApi = (data) =>
  api.post('/courses/', data)

export const getMyCoursesApi = () =>
  api.get('/courses/my-courses/')

export const getTrainerCoursesApi = () =>
  api.get('/courses/trainer-courses/')

export const getCourseVideosApi = (courseId) =>
  api.get(`/courses/${courseId}/videos/`)

export const addVideoApi = (courseId, data) =>
  api.post(`/courses/${courseId}/videos/`, data)

export const getVideoTokenApi = (videoId) =>
  api.get(`/courses/video-token/${videoId}/`)

export const assignCourseApi = (data) =>
  api.post('/courses/assignments/', data)

export const markVideoWatchedApi = (videoId) =>
  api.post(`/courses/mark-watched/${videoId}/`)

export const getCourseProgressApi = (courseId) =>
  api.get(`/courses/${courseId}/progress/`)