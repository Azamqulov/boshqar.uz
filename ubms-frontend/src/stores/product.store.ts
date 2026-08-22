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

export const useProductStore = defineStore('ubms_product', () => {
  const products = ref<any[]>(loadFromStorage('products', []));
  const categories = ref<any[]>(loadFromStorage('categories', []));
  const isLoading = ref(false);
  const lastFetched = ref<Record<string, number>>({});
  const inFlightPromises: Record<string, Promise<any> | null> = {};

  const isCacheValid = (key: string, ttlMs = 60000) => {
    const timestamp = lastFetched.value[key];
    if (!timestamp) return false;
    return Date.now() - timestamp < ttlMs;
  };

  const fetchProducts = async (force = false) => {
    if (!force && products.value.length > 0 && isCacheValid('products', 60000)) {
      return products.value;
    }
    if (inFlightPromises['products']) {
      return inFlightPromises['products'];
    }
    if (products.value.length === 0) {
      isLoading.value = true;
    }
    const p = (async () => {
      try {
        const { data } = await api.get('/products/lite?limit=1000');
        const items = Array.isArray(data) ? data : data?.items || [];
        products.value = items;
        saveToStorage('products', items);
        lastFetched.value['products'] = Date.now();
      } catch (e) {
        try {
          const { data } = await api.get('/products?limit=100');
          const items = Array.isArray(data) ? data : data?.items || [];
          products.value = items;
          saveToStorage('products', items);
          lastFetched.value['products'] = Date.now();
        } catch (fallbackErr) {
          console.error('Fetch products failed:', fallbackErr);
        }
      } finally {
        inFlightPromises['products'] = null;
        isLoading.value = false;
      }
      return products.value;
    })();
    inFlightPromises['products'] = p;
    return p;
  };

  const fetchCategories = async (force = false) => {
    if (!force && categories.value.length > 0 && isCacheValid('categories', 300000)) {
      return categories.value;
    }
    if (inFlightPromises['categories']) {
      return inFlightPromises['categories'];
    }
    const p = (async () => {
      try {
        const { data } = await api.get('/products/categories');
        const items = Array.isArray(data) ? data : data?.items || [];
        categories.value = items;
        saveToStorage('categories', items);
        lastFetched.value['categories'] = Date.now();
      } catch (e) {
        console.error('Fetch categories failed:', e);
      } finally {
        inFlightPromises['categories'] = null;
      }
      return categories.value;
    })();
    inFlightPromises['categories'] = p;
    return p;
  };

  const addProductLocally = (newProduct: any) => {
    products.value = [newProduct, ...products.value];
    saveToStorage('products', products.value);
  };

  const updateProductLocally = (id: string, updated: any) => {
    const idx = products.value.findIndex((p) => p.id === id);
    if (idx !== -1) {
      products.value[idx] = { ...products.value[idx], ...updated };
      products.value = [...products.value];
      saveToStorage('products', products.value);
    }
  };

  const deleteProductLocally = (id: string) => {
    products.value = products.value.filter((p) => p.id !== id);
    saveToStorage('products', products.value);
  };

  return {
    products,
    categories,
    isLoading,
    fetchProducts,
    fetchCategories,
    addProductLocally,
    updateProductLocally,
    deleteProductLocally,
  };
});
