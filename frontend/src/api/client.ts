import axios from 'axios';

// Avoid double-prefixing /api when Vite proxy is already handling it.
// In dev, leave baseURL empty so requests like "/api/suppliers" go straight through.
// In prod, set VITE_API_BASE_URL to your backend origin (e.g., https://api.example.com).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach auth token from session/local storage on each request
api.interceptors.request.use((config) => {
  const token =
    sessionStorage.getItem('token') ||
    (localStorage.getItem('rememberMe') === 'true' ? localStorage.getItem('token') : null);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresh token on 401 once per request
let isRefreshing = false;
let queuedRequests: ((token: string | null) => void)[] = [];

const processQueue = (token: string | null) => {
  queuedRequests.forEach((cb) => cb(token));
  queuedRequests = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error?.response?.status === 401 && !originalRequest?._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          queuedRequests.push((token) => {
            if (token) originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const storedRefresh =
          sessionStorage.getItem('refreshToken') ||
          (localStorage.getItem('rememberMe') === 'true' ? localStorage.getItem('refreshToken') : null);
        if (!storedRefresh) {
          processQueue(null);
          isRefreshing = false;
          return Promise.reject(error);
        }
        const res = await axios.post('/api/auth/refresh-token', { refreshToken: storedRefresh });
        const { accessToken, refreshToken } = res.data?.data || {};
        if (accessToken) {
          sessionStorage.setItem('token', accessToken);
          api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
          if (localStorage.getItem('rememberMe') === 'true') {
            localStorage.setItem('token', accessToken);
          }
        }
        if (refreshToken) {
          sessionStorage.setItem('refreshToken', refreshToken);
          if (localStorage.getItem('rememberMe') === 'true') {
            localStorage.setItem('refreshToken', refreshToken);
          }
        }
        processQueue(accessToken || null);
        isRefreshing = false;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(null);
        isRefreshing = false;
        // Clear storage on failed refresh
        sessionStorage.clear();
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('rememberMe');
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
