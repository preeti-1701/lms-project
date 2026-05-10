import axios from 'axios'
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../utils/tokenStorage'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Handle token expiry automatically
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refresh = getRefreshToken()
        const res = await axios.post('http://127.0.0.1:8000/api/accounts/login/refresh/', {
          refresh,
        })
        setTokens(res.data.access, refresh)
        original.headers.Authorization = `Bearer ${res.data.access}`
        return api(original)
      } catch {
        clearTokens()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api