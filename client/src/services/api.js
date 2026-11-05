import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('portify_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error message handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred. Please try again.';
    const customError = new Error(message);
    if (error.response?.data) {
      customError.response = error.response;
      customError.isScanned = Boolean(error.response.data.isScanned);
      customError.isMalformed = Boolean(error.response.data.isMalformed);
      customError.status = error.response.status;
    }
    return Promise.reject(customError);
  }
);

export default api;

