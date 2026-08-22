import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../services/api';

const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(`ubms_cache_${key}`);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(`ubms_cache_${key}`, JSON.stringify(data));
  } catch (e) {}
};

export const useFinanceStore = defineStore('ubms_finance', () => {
  const financeSummary = ref<any>(loadFromStorage('financeSummary', null));
  const financeExpenses = ref<any[]>(loadFromStorage('financeExpenses', []));
  const dashboardSummary = ref<any>(loadFromStorage('dashboardSummary', null));
  const dashboardCharts = ref<any>(loadFromStorage('dashboardCharts', null));
  const isLoading = ref(false);
  const lastFetched = ref<Record<string, number>>({});
  const inFlightPromises: Record<string, Promise<any> | null> = {};

  const isCacheValid = (key: string, ttlMs = 60000) => {
    const timestamp = lastFetched.value[key];
    if (!timestamp) return false;
    return Date.now() - timestamp < ttlMs;
  };

  const fetchFinanceSummary = async (periodOrForce: string | boolean = 'month', forceParam = false) => {
    const period = typeof periodOrForce === 'string' ? periodOrForce : 'month';
    const force = typeof periodOrForce === 'boolean' ? periodOrForce : forceParam;
    const cacheKey = `finance_summary_${period}`;
    if (!force && financeSummary.value && isCacheValid(cacheKey, 60000)) {
      return financeSummary.value;
    }
    if (inFlightPromises[cacheKey]) {
      return inFlightPromises[cacheKey];
    }
    const p = (async () => {
      try {
        const { data } = await api.get(`/finance/summary?period=${period}`);
        financeSummary.value = data;
        saveToStorage('financeSummary', data);
        lastFetched.value[cacheKey] = Date.now();
      } catch (e) {
        console.error('Fetch finance summary failed:', e);
      } finally {
        inFlightPromises[cacheKey] = null;
      }
      return financeSummary.value;
    })();
    inFlightPromises[cacheKey] = p;
    return p;
  };

  const fetchFinanceExpenses = async (period = 'month', force = false) => {
    const cacheKey = `finance_expenses_${period}`;
    if (!force && financeExpenses.value.length > 0 && isCacheValid(cacheKey, 60000)) {
      return financeExpenses.value;
    }
    if (inFlightPromises[cacheKey]) {
      return inFlightPromises[cacheKey];
    }
    const p = (async () => {
      try {
        const { data } = await api.get(`/finance/expenses?period=${period}`);
        const items = Array.isArray(data) ? data : data?.items || [];
        financeExpenses.value = items;
        saveToStorage('financeExpenses', items);
        lastFetched.value[cacheKey] = Date.now();
      } catch (e) {
        console.error('Fetch finance expenses failed:', e);
      } finally {
        inFlightPromises[cacheKey] = null;
      }
      return financeExpenses.value;
    })();
    inFlightPromises[cacheKey] = p;
    return p;
  };

  const fetchDashboardSummary = async (forceOrPeriod?: any, periodOrDays?: any) => {
    const force = typeof forceOrPeriod === 'boolean' ? forceOrPeriod : typeof periodOrDays === 'boolean' ? periodOrDays : false;
    const period = typeof forceOrPeriod === 'string' ? forceOrPeriod : typeof periodOrDays === 'string' || typeof periodOrDays === 'number' ? String(periodOrDays) : undefined;
    const cacheKey = period ? `dashboard_summary_${period}` : 'dashboardSummary';
    if (!force && dashboardSummary.value && isCacheValid(cacheKey, 30000)) {
      return dashboardSummary.value;
    }
    if (inFlightPromises[cacheKey]) {
      return inFlightPromises[cacheKey];
    }
    const p = (async () => {
      try {
        const url = period ? `/dashboard/summary?period=${period}` : '/dashboard/summary';
        const { data } = await api.get(url);
        dashboardSummary.value = data;
        saveToStorage('dashboardSummary', data);
        lastFetched.value[cacheKey] = Date.now();
      } catch (e) {
        console.error('Fetch dashboard summary failed:', e);
      } finally {
        inFlightPromises[cacheKey] = null;
      }
      return dashboardSummary.value;
    })();
    inFlightPromises[cacheKey] = p;
    return p;
  };

  const fetchDashboardCharts = async (daysOrForce?: number | boolean, forceParam = false) => {
    const days = typeof daysOrForce === 'number' ? daysOrForce : undefined;
    const force = typeof daysOrForce === 'boolean' ? daysOrForce : forceParam;
    const cacheKey = days ? `dashboard_charts_${days}` : 'dashboardCharts';
    if (!force && dashboardCharts.value && isCacheValid(cacheKey, 60000)) {
      return dashboardCharts.value;
    }
    if (inFlightPromises[cacheKey]) {
      return inFlightPromises[cacheKey];
    }
    const p = (async () => {
      try {
        const url = days ? `/dashboard/charts?days=${days}` : '/dashboard/charts';
        const { data } = await api.get(url);
        dashboardCharts.value = data;
        saveToStorage('dashboardCharts', data);
        lastFetched.value[cacheKey] = Date.now();
      } catch (e) {
        console.error('Fetch dashboard charts failed:', e);
      } finally {
        inFlightPromises[cacheKey] = null;
      }
      return dashboardCharts.value;
    })();
    inFlightPromises[cacheKey] = p;
    return p;
  };

  return {
    financeSummary,
    financeExpenses,
    dashboardSummary,
    dashboardCharts,
    isLoading,
    fetchFinanceSummary,
    fetchFinanceExpenses,
    fetchDashboardSummary,
    fetchDashboardCharts,
  };
});
