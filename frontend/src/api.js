// import axios from 'axios';

// const api = axios.create({
//   baseURL: 'http://127.0.0.1:8000',
//   headers: {
//     'Content-Type': 'application/json'
//   }
// });

// // 🔐 Attach tokens
// api.interceptors.request.use((config) => {

//   const token = localStorage.getItem('access_token');
//   const sessionToken = localStorage.getItem('session_token');

//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }

//   if (sessionToken) {
//     config.headers['Session-Token'] = sessionToken;
//   }

//   return config;
// });

// // 🚨 Handle session expiry
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {

//       alert("Session expired. Please login again.");

//       localStorage.clear();

//       if (window.location.pathname !== '/') {
//         window.location.href = '/';
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;


import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json'
  }
});


// 🔐 Attach tokens
api.interceptors.request.use((config) => {

  const url = config.url || '';
  
  if (!url.includes('/login')) {
    
    const token = localStorage.getItem('access_token');
    const sessionToken = localStorage.getItem('session_token');

    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
    }

    if (sessionToken) {
      config.headers['Session-Token'] = sessionToken;
    }
    
    // 🔥 ADD THIS
    console.log("SESSION TOKEN:", sessionToken);
    console.log("HEADERS SENT:", config.headers);
  }

  return config;
});

// 🚨 Handle session expiry (IMPROVED)
let isRedirecting = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {

    const status = error.response?.status;
    const url = error.config?.url || '';

    // ❗ Ignore login endpoint
    if (url.includes('/login')) {
      return Promise.reject(error);
    }

    // 🔐 Handle expired/invalid session
    if (status === 401 && !isRedirecting) {

      const url = error.config?.url || '';
      // ❗ Skip logout for safe endpoints (like initial load)
      if (url.includes('/login')) {
        return Promise.reject(error);
      }

      // ❗ Only logout if token actually exists
      const token = localStorage.getItem('access_token');

      if (!token) {
        return Promise.reject(error);
      }

      isRedirecting = true;

      console.warn("Session expired → clearing tokens");

      // Remove auth and user cache to avoid stale app state
      localStorage.removeItem('access_token');
      localStorage.removeItem('session_token');
      localStorage.removeItem('user');

      alert("Session expired. Please login again.");

      // Avoid redirect loop
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }

    return Promise.reject(error);
  }
);

export default api;