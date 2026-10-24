// Centralized API client using Axios
// Base URL is read from the VITE_API_URL env variable (falls back to relative path for proxy setups)
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ───────────────────────────────────────────────────────
// Attach Bearer token and localized headers on every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const locale = localStorage.getItem('preferredLocale') || 'en';
    config.headers['x-locale'] = locale;
    config.headers['Accept-Language'] = locale;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ──────────────────────────────────────────────────────
// Normalise errors so consumers always get { message: string, status: number }
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';

    // 401: token expired or invalid — clear local auth state
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('sessionTimestamp');
      // Let the route guard handle redirection
    }

    const normalised = new Error(message);
    normalised.status = status;
    normalised.data = error.response?.data;
    return Promise.reject(normalised);
  }
);

export default api;
