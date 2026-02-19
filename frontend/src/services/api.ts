import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login on 401 if we're on a protected page
    // Don't redirect for public pages like community/view
    if (error.response?.status === 401) {
      const publicPaths = ['/community', '/view', '/login', '/signup', '/pricing', '/'];
      const currentPath = window.location.pathname;
      const isPublicPath = publicPaths.some((p) => currentPath.startsWith(p));

      if (!isPublicPath) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
