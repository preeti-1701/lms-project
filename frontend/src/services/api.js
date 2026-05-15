import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : 'http://localhost:5001/api',
});

// ── Request Interceptor: attach JWT token to every request ────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: handle session expiry / force-logout ────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 1. Handle Network/Connection Errors (Backend down)
    if (!error.response) {
      error.networkError = true;
      error.message = 'Server unreachable. Please ensure the backend is running on port 5001.';
      return Promise.reject(error);
    }

    // 2. Handle 401 Unauthorized (Session Expired / Invalid Token)
    if (error.response.status === 401) {
      // Avoid redirecting if we are already on the login process
      const isLoginRequest = error.config.url.includes('/auth/login');
      
      if (!isLoginRequest) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        const path = window.location.pathname;
        if (path.startsWith('/admin')) {
          window.location.href = '/admin-login';
        } else if (path.startsWith('/trainer')) {
          window.location.href = '/trainer-login';
        } else {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
