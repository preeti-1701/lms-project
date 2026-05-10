import api from './axios'

export const loginApi = (email, password) =>
  api.post('/accounts/login/', { email, password })

export const logoutApi = () =>
  api.post('/accounts/logout/')

export const getUsersApi = () =>
  api.get('/accounts/users/')

export const createUserApi = (data) =>
  api.post('/accounts/users/', data)

export const updateUserApi = (id, data) =>
  api.put(`/accounts/users/${id}/`, data)