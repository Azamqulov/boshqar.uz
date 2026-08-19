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
    const isAuthRoute =
      error.config?.url?.includes('/auth/login') ||
      error.config?.url?.includes('/auth/register') ||
      error.config?.url?.includes('/auth/refresh') ||
      error.config?.url?.includes('/auth/forgot-password') ||
      error.config?.url?.includes('/auth/reset-password');

    if (error.response?.status === 401 && !error.config?._retry && !isAuthRoute) {
      error.config._retry = true;

      // Demo rejimida bo'lsa, foydalanuvchini loginga haydama!
      const userStr = localStorage.getItem('ubms_user');
      const token = localStorage.getItem('ubms_access_token');
      let isDemoUser = false;
      try {
        if (userStr) {
          const u = JSON.parse(userStr);
          if (u.id === 'demo-user-id' || u.phone === '+998900000000' || u.email === 'demo@boshqar.uz') {
            isDemoUser = true;
          }
        }
      } catch (e) {}
      if (token && (token.startsWith('demo-session') || isDemoUser)) {
        return Promise.reject(error);
      }

      // Public sahifalarda turganda loginga haydama!
      const publicPaths = ['/', '/landing', '/legal', '/privacy', '/cookies', '/security', '/terms', '/guide', '/about', '/auth/login', '/auth/register'];
      const isPublicPath = publicPaths.some(p => window.location.pathname === p || window.location.pathname.startsWith('/auth'));

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
          if (!isPublicPath) {
            window.location.href = '/auth/login';
          }
        }
      } else {
        localStorage.removeItem('ubms_access_token');
        if (!isPublicPath) {
          window.location.href = '/auth/login';
        }
      }
    }

    // Handle 403 Subscription Expired
    if (
      error.response?.status === 403 &&
      (error.response?.data?.code === 'SUBSCRIPTION_EXPIRED' ||
        error.response?.data?.error?.code === 'SUBSCRIPTION_EXPIRED')
    ) {
      window.dispatchEvent(
        new CustomEvent('ubms:subscription-expired', {
          detail: error.response?.data?.error || error.response?.data,
        }),
      );
    }

    return Promise.reject(error);
  },
);

export function getErrorMessage(err: any, defaultMsg = 'Xatolik yuz berdi'): string {
  if (!err) return defaultMsg;
  if (typeof err === 'string') return err;

  const res = err.response?.data;
  if (res) {
    if (typeof res === 'string') return res;
    if (res.error?.message) {
      return Array.isArray(res.error.message) ? res.error.message.join(', ') : res.error.message;
    }
    if (res.message) {
      return Array.isArray(res.message) ? res.message.join(', ') : res.message;
    }
  }

  const rawMsg = String(err.message || '');
  if (rawMsg.includes('Network Error') || rawMsg.includes('ERR_CONNECTION_REFUSED')) {
    return 'Internet yoki server bilan aloqa yo\'q. Iltimos, ulanishni tekshiring.';
  }
  if (rawMsg.includes('timeout') || rawMsg.includes('timed out')) {
    return 'Server javob berish vaqti tugadi. Qaytadan urinib ko\'ring.';
  }
  if (
    rawMsg.includes('is not a function') ||
    rawMsg.includes('Cannot read') ||
    rawMsg.includes('undefined') ||
    rawMsg.includes('null') ||
    rawMsg.includes('TypeError') ||
    rawMsg.includes('ReferenceError')
  ) {
    return defaultMsg || 'Tizimda vaqtinchalik xatolik yuz berdi. Iltimos, qaytadan urinib ko\'ring.';
  }

  return rawMsg || defaultMsg;
}

export default api;
