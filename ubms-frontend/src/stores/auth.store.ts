import { defineStore } from 'pinia';
import api from '../services/api';
import { useDataStore } from './data.store';

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
  plan?: string;
  planId?: string;
  branchId?: string;
  branches?: any[];
  allowedModules?: string[];
  actionPermissions?: Record<string, { create?: boolean; edit?: boolean; delete?: boolean }>;
  subscription?: {
    status: string;
    currentPeriodEnd: string;
    daysLeft: number | null;
    isExpired: boolean;
  } | null;
  isSubscriptionExpired?: boolean;
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
    isDemo: (state) =>
      state.user?.phone === '+998900000000' ||
      state.user?.id === 'demo-user-id' ||
      state.user?.email === 'demo@boshqar.uz' ||
      (state.token?.startsWith('demo-session') ?? false),
    isSubscriptionExpired: (state): boolean => {
      if (state.user?.isSuperAdmin) return false;
      if (!state.activeBusiness) return false;
      if (state.activeBusiness.plan === 'Free') return false;
      return !!state.activeBusiness.isSubscriptionExpired || !!state.activeBusiness.subscription?.isExpired;
    },
  },
  actions: {
    async login(loginData: any) {
      this.isLoading = true;
      try {
        const { data } = await api.post('/auth/login', loginData);
        this.setAuthData(data);
        this.fetchBusinesses().catch(() => {});
        return data;
      } finally {
        this.isLoading = false;
      }
    },
    async demoLogin() {
      this.isLoading = true;
      try {
        const { data } = await api.post('/auth/demo-guest', {
          companyName: 'Baraka Market (Demo)',
          businessType: 'shop',
        });
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
      // Clear previous user data cache from RAM memory and storage
      try {
        const dataStore = useDataStore();
        dataStore.clearLocalCache();
      } catch (e) {}

      this.user = data.user;
      this.token = data.accessToken;
      this.businesses = (data.businesses && data.businesses.length > 0)
        ? data.businesses
        : (data.activeBusiness ? [data.activeBusiness] : []);
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
      if (!business) return;
      const isChanged = this.activeBusiness?.id !== business.id;
      this.activeBusiness = business;
      localStorage.setItem('ubms_active_business', JSON.stringify(business));
      localStorage.setItem('ubms_active_business_id', business.id);

      if (business.branchId) {
        this.setActiveBranch(business.branchId);
      } else if (business.branches && business.branches.length > 0) {
        this.setActiveBranch(business.branches[0].id);
      }

      if (isChanged) {
        try {
          const dataStore = useDataStore();
          dataStore.invalidate();
        } catch (e) {}
      }
    },
    setActiveBranch(branchId: string) {
      this.activeBranchId = branchId;
      localStorage.setItem('ubms_active_branch_id', branchId);
    },
    logout() {
      try {
        const dataStore = useDataStore();
        dataStore.clearLocalCache();
      } catch (e) {}

      this.user = null;
      this.token = null;
      this.activeBusiness = null;
      this.businesses = [];
      this.activeBranchId = null;

      // Purge all local and session storage caches completely
      localStorage.clear();
      sessionStorage.clear();
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
    async fetchBusinesses() {
      try {
        const { data } = await api.get('/businesses');
        if (Array.isArray(data)) {
          this.businesses = data;
          localStorage.setItem('ubms_businesses', JSON.stringify(data));

          if (data.length > 0) {
            const currentValid = data.find((b: any) => b.id === this.activeBusiness?.id);
            if (currentValid) {
              this.setActiveBusiness(currentValid);
            } else {
              this.setActiveBusiness(data[0]);
            }
          } else {
            this.activeBusiness = null;
            this.activeBranchId = null;
            localStorage.removeItem('ubms_active_business');
            localStorage.removeItem('ubms_active_business_id');
            localStorage.removeItem('ubms_active_branch_id');
          }
        }
        return data;
      } catch (e) {
        console.error('Fetch businesses failed:', e);
      }
    },
    async startDemoWorkspace(companyName: string, phone: string, businessType: string) {
      try {
        const { data } = await api.post('/auth/demo-guest', {
          companyName: companyName || 'Baraka Market',
          phone: phone || '+998901234567',
          businessType: businessType || 'shop',
        });
        if (data && data.accessToken) {
          this.setAuthData(data);
          return data;
        }
      } catch (err) {
        console.warn('Backend demo-guest offline, using local demo workspace fallback:', err);
      }

      const demoUser: UserProfile = {
        id: 'demo-user-id',
        fullName: companyName || 'Demo Tadbirkor',
        phone: phone || '+998 90 123-45-67',
        isSuperAdmin: false,
      };

      const demoBiz: BusinessItem = {
        id: 'demo-business-id',
        name: companyName || 'Boshqar.uz Demo Korxona',
        businessType: businessType || 'shop',
        currency: 'UZS',
        role: 'Owner',
        allowedModules: ['all'],
      };

      this.user = demoUser;
      this.token = 'demo-session-token-' + Date.now();
      this.businesses = [demoBiz];
      this.activeBusiness = demoBiz;

      localStorage.setItem('ubms_access_token', this.token);
      localStorage.setItem('ubms_user', JSON.stringify(demoUser));
      localStorage.setItem('ubms_businesses', JSON.stringify([demoBiz]));
      localStorage.setItem('ubms_active_business', JSON.stringify(demoBiz));
      localStorage.setItem('ubms_active_business_id', demoBiz.id);
    },
    async fetchProfile() {
      try {
        const { data } = await api.get('/auth/profile/me');
        if (data) {
          this.user = { ...this.user, ...data };
          localStorage.setItem('ubms_user', JSON.stringify(this.user));
        }
        return data;
      } catch (err) {
        // ignore
      }
    },
    async updateBusinessCurrency(currency: string) {
      if (this.activeBusiness) {
        this.activeBusiness = { ...this.activeBusiness, currency };
        localStorage.setItem('ubms_active_business', JSON.stringify(this.activeBusiness));

        const idx = this.businesses.findIndex((b) => b.id === this.activeBusiness?.id);
        if (idx !== -1) {
          this.businesses[idx] = { ...this.businesses[idx], currency };
          localStorage.setItem('ubms_businesses', JSON.stringify(this.businesses));
        }

        try {
          await api.patch(`/businesses/${this.activeBusiness.id}`, { currency });
        } catch (err) {
          console.error('Failed to update business currency on backend:', err);
        }
      }
    },
  },
});
