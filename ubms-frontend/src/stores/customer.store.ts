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

export const useCustomerStore = defineStore('ubms_customer', () => {
  const customers = ref<any[]>(loadFromStorage('customers', []));
  const suppliers = ref<any[]>(loadFromStorage('suppliers', []));
  const isLoading = ref(false);
  const lastFetched = ref<Record<string, number>>({});
  const inFlightPromises: Record<string, Promise<any> | null> = {};

  const isCacheValid = (key: string, ttlMs = 60000) => {
    const timestamp = lastFetched.value[key];
    if (!timestamp) return false;
    return Date.now() - timestamp < ttlMs;
  };

  const fetchCustomers = async (force = false) => {
    if (!force && customers.value.length > 0 && isCacheValid('customers', 60000)) {
      return customers.value;
    }
    if (inFlightPromises['customers']) {
      return inFlightPromises['customers'];
    }
    const p = (async () => {
      try {
        const { data } = await api.get('/customers?limit=500');
        const items = Array.isArray(data) ? data : data?.items || [];
        customers.value = items;
        saveToStorage('customers', items);
        lastFetched.value['customers'] = Date.now();
      } catch (e) {
        console.error('Fetch customers failed:', e);
      } finally {
        inFlightPromises['customers'] = null;
      }
      return customers.value;
    })();
    inFlightPromises['customers'] = p;
    return p;
  };

  const fetchSuppliers = async (force = false) => {
    if (!force && suppliers.value.length > 0 && isCacheValid('suppliers', 120000)) {
      return suppliers.value;
    }
    if (inFlightPromises['suppliers']) {
      return inFlightPromises['suppliers'];
    }
    const p = (async () => {
      try {
        const { data } = await api.get('/suppliers?limit=500');
        const items = Array.isArray(data) ? data : data?.items || [];
        suppliers.value = items;
        saveToStorage('suppliers', items);
        lastFetched.value['suppliers'] = Date.now();
      } catch (e) {
        console.error('Fetch suppliers failed:', e);
      } finally {
        inFlightPromises['suppliers'] = null;
      }
      return suppliers.value;
    })();
    inFlightPromises['suppliers'] = p;
    return p;
  };

  const resetStore = () => {
    customers.value = [];
    suppliers.value = [];
    lastFetched.value = {};
    for (const key in inFlightPromises) {
      delete inFlightPromises[key];
    }
  };

  const addCustomerLocally = (newCustomer: any) => {
    customers.value = [newCustomer, ...customers.value];
    saveToStorage('customers', customers.value);
  };

  const updateCustomerLocally = (id: string, updated: any) => {
    const idx = customers.value.findIndex((c) => c.id === id);
    if (idx !== -1) {
      customers.value[idx] = { ...customers.value[idx], ...updated };
      customers.value = [...customers.value];
      saveToStorage('customers', customers.value);
    }
  };

  const deleteCustomerLocally = (id: string) => {
    customers.value = customers.value.filter((c) => c.id !== id);
    saveToStorage('customers', customers.value);
  };

  return {
    customers,
    suppliers,
    isLoading,
    fetchCustomers,
    fetchSuppliers,
    addCustomerLocally,
    updateCustomerLocally,
    deleteCustomerLocally,
    resetStore,
  };
});

