import { defineStore } from 'pinia';
import api from '../services/api';

export interface UserProfile {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  avatarUrl?: string;
  isSuperAdmin?: boolean;
}

export interface BusinessItem {
  id: string;
  name: string;
  businessType: string;
  currency: string;
  role: string;
  branchId?: string;
  branches?: any[];
  allowedModules?: string[];
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('ubms_user') || 'null') as UserProfile | null,
    token: localStorage.getItem('ubms_access_token') || null,
    businesses: JSON.parse(localStorage.getItem('ubms_businesses') || '[]') as BusinessItem[],
    activeBusiness: JSON.parse(localStorage.getItem('ubms_active_business') || 'null') as BusinessItem | null,
    activeBranchId: localStorage.getItem('ubms_active_branch_id') || null,
    isLoading: false,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    hasBusiness: (state) => !!state.activeBusiness,
    businessType: (state) => state.activeBusiness?.businessType || 'shop',
  },
  actions: {
    async login(loginData: any) {
      this.isLoading = true;
      try {
        const { data } = await api.post('/auth/login', loginData);
        this.setAuthData(data);
        return data;
      } finally {
        this.isLoading = false;
      }
    },
    async register(registerData: any) {
      this.isLoading = true;
      try {
        const { data } = await api.post('/auth/register', registerData);
        localStorage.setItem('ubms_access_token', data.accessToken);
        localStorage.setItem('ubms_refresh_token', data.refreshToken);
        if (data.user) {
          localStorage.setItem('ubms_user', JSON.stringify(data.user));
          this.user = data.user;
        }
        this.token = data.accessToken;
        return data;
      } finally {
        this.isLoading = false;
      }
    },
    setAuthData(data: any) {
      this.user = data.user;
      this.token = data.accessToken;
      this.businesses = data.businesses || [];
      this.activeBusiness = data.activeBusiness || (this.businesses[0] ?? null);

      localStorage.setItem('ubms_access_token', data.accessToken);
      localStorage.setItem('ubms_refresh_token', data.refreshToken);
      localStorage.setItem('ubms_user', JSON.stringify(data.user));
      localStorage.setItem('ubms_businesses', JSON.stringify(this.businesses));

      if (this.activeBusiness) {
        this.setActiveBusiness(this.activeBusiness);
      }
    },
    setActiveBusiness(business: BusinessItem) {
      this.activeBusiness = business;
      localStorage.setItem('ubms_active_business', JSON.stringify(business));
      localStorage.setItem('ubms_active_business_id', business.id);

      if (business.branchId) {
        this.setActiveBranch(business.branchId);
      }
    },
    setActiveBranch(branchId: string) {
      this.activeBranchId = branchId;
      localStorage.setItem('ubms_active_branch_id', branchId);
    },
    logout() {
      this.user = null;
      this.token = null;
      this.activeBusiness = null;
      this.businesses = [];
      this.activeBranchId = null;

      localStorage.removeItem('ubms_access_token');
      localStorage.removeItem('ubms_refresh_token');
      localStorage.removeItem('ubms_user');
      localStorage.removeItem('ubms_businesses');
      localStorage.removeItem('ubms_active_business');
      localStorage.removeItem('ubms_active_business_id');
      localStorage.removeItem('ubms_active_branch_id');
    },
    async updateProfile(profileData: { fullName?: string; phone?: string; email?: string }) {
      const { data } = await api.post('/auth/profile/me', profileData);
      this.user = { ...this.user, ...data };
      localStorage.setItem('ubms_user', JSON.stringify(this.user));
      return data;
    },
    async changePassword(passwordData: { currentPassword: string; newPassword: string }) {
      const { data } = await api.post('/auth/change-password', passwordData);
      return data;
    },
  },
});
