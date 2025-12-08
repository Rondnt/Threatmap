import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('[API Interceptor] Token from localStorage:', token ? 'EXISTS' : 'NOT FOUND');
    console.log('[API Interceptor] Request URL:', config.url);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[API Interceptor] Token added to headers');
      console.log('[API Interceptor] Authorization header:', config.headers.Authorization);
    } else {
      console.log('[API Interceptor] No token to add');
    }
    console.log('[API Interceptor] Final headers:', config.headers);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login if we're not already on the login page
    // and if it's not the login/register request itself
    // AND we don't have a token (if we have a token, let the component handle it)
    const hasToken = localStorage.getItem('token');
    if (error.response?.status === 401 &&
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/register') &&
        !error.config?.url?.includes('/auth/login') &&
        !error.config?.url?.includes('/auth/register') &&
        !hasToken) {
      console.log('[API Interceptor] 401 error, no token found, redirecting to login');
      window.location.href = '/login';
    } else if (error.response?.status === 401) {
      console.log('[API Interceptor] 401 error but ignoring (hasToken:', hasToken, ', path:', window.location.pathname, ')');
    }
    return Promise.reject(error);
  }
);

export default api;
