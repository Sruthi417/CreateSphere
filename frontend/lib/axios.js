import axios from 'axios';

// Backend API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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
      const adminToken = localStorage.getItem('adminToken');
      const authToken = localStorage.getItem('authToken');

      // Select the appropriate token based on the API target
      const isAdminApi = config.url.startsWith('/admin');
      const token = isAdminApi ? (adminToken || authToken) : authToken;

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
    // Check if it's a 401 Unauthorized error
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const isAdminRoute = window.location.pathname.startsWith('/admin');
        const isAdminApi = error.config?.url?.startsWith('/admin');

        // Only clear the relevant token
        if (isAdminApi || isAdminRoute) {
          localStorage.removeItem('adminToken');
        } else {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userRole');
        }

        // Redirect to appropriate login if not already there and not currently on an auth page
        const isAuthPage = window.location.pathname.includes('/auth/') || window.location.pathname.includes('/login');

        if (!isAuthPage) {
          if (isAdminRoute) {
            window.location.href = '/admin/login';
          } else {
            window.location.href = '/auth/login';
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
