import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token and active business/branch
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ubms_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const businessId = localStorage.getItem('ubms_active_business_id');
  if (businessId) {
    config.headers['x-business-id'] = businessId;
  }

  const branchId = localStorage.getItem('ubms_active_branch_id');
  if (branchId) {
    config.headers['x-branch-id'] = branchId;
  }

  return config;
});

// Response interceptor for token refresh / redirect to login
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      const refreshToken = localStorage.getItem('ubms_refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${api.defaults.baseURL}/auth/refresh`,
            { refreshToken },
          );
          localStorage.setItem('ubms_access_token', data.accessToken);
          localStorage.setItem('ubms_refresh_token', data.refreshToken);
          error.config.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(error.config);
        } catch {
          localStorage.removeItem('ubms_access_token');
          localStorage.removeItem('ubms_refresh_token');
          window.location.href = '/auth/login';
        }
      } else {
        localStorage.removeItem('ubms_access_token');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;
