import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// 🔐 Attach tokens
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  const sessionToken = localStorage.getItem('session_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (sessionToken) {
    config.headers['Session-Token'] = sessionToken;
  }

  return config;
});

// 🚨 Handle session expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {

      alert("Session expired. Please login again.");

      localStorage.clear();

      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }

    return Promise.reject(error);
  }
);

export default api;