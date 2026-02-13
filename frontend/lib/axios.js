import axios from 'axios';

// Backend API base URL
const API_BASE_URL = 'http://localhost:5001/api';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds for AI operations
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      // Check for adminToken first if we're on an admin route, then fallback to authToken
      const adminToken = localStorage.getItem('adminToken');
      const authToken = localStorage.getItem('authToken');
      const token = adminToken || authToken;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const isAdminRoute = window.location.pathname.startsWith('/admin');

        localStorage.removeItem('authToken');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('userRole');

        // Redirect to appropriate login if not already there
        if (isAdminRoute) {
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/admin/login';
          }
        } else if (!window.location.pathname.includes('/auth/')) {
          window.location.href = '/auth/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
