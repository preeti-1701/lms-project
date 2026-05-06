import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});


// ✅ Attach JWT token
axiosInstance.interceptors.request.use(

  (config) => {

    const token =
      localStorage.getItem("access") ||
      sessionStorage.getItem("access");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);


// ✅ Handle unauthorized
axiosInstance.interceptors.response.use(

  (response) => response,

  (error) => {

    if (
      error.response &&
      error.response.status === 401
    ) {

      console.log("401 Unauthorized");

      localStorage.clear();
      sessionStorage.clear();

      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;