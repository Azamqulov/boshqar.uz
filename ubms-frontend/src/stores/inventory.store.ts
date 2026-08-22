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

export const useInventoryStore = defineStore('ubms_inventory', () => {
  const inventory = ref<any[]>(loadFromStorage('inventory', []));
  const inventoryTotal = ref<number>(loadFromStorage('inventoryTotal', 0));
  const inventoryMeta = ref<any>(loadFromStorage('inventoryMeta', { page: 1, limit: 100, total: 0, totalPages: 1 }));
  const isLoading = ref(false);
  const lastFetched = ref<Record<string, number>>({});
  const inFlightPromises: Record<string, Promise<any> | null> = {};

  const isCacheValid = (key: string, ttlMs = 60000) => {
    const timestamp = lastFetched.value[key];
    if (!timestamp) return false;
    return Date.now() - timestamp < ttlMs;
  };

  const fetchInventory = async (pageOrForce: number | boolean = 1, limit = 100, forceParam = false) => {
    const page = typeof pageOrForce === 'number' ? pageOrForce : 1;
    const force = typeof pageOrForce === 'boolean' ? pageOrForce : forceParam;
    const cacheKey = `inventory_${page}_${limit}`;
    if (!force && inventory.value.length > 0 && isCacheValid(cacheKey, 60000)) {
      return inventory.value;
    }
    if (inFlightPromises[cacheKey]) {
      return inFlightPromises[cacheKey];
    }
    if (inventory.value.length === 0) {
      isLoading.value = true;
    }
    const p = (async () => {
      try {
        const { data } = await api.get(`/inventory?page=${page}&limit=${limit}`);
        const items = data?.items || (Array.isArray(data) ? data : []);
        inventory.value = items;
        inventoryTotal.value = data?.total || items.length;
        inventoryMeta.value = {
          page: data?.page || page,
          limit: data?.limit || limit,
          total: data?.total || items.length,
          totalPages: data?.totalPages || 1,
        };
        saveToStorage('inventory', items);
        saveToStorage('inventoryTotal', inventoryTotal.value);
        saveToStorage('inventoryMeta', inventoryMeta.value);
        lastFetched.value[cacheKey] = Date.now();
      } catch (e) {
        console.error('Fetch inventory failed:', e);
      } finally {
        inFlightPromises[cacheKey] = null;
        isLoading.value = false;
      }
      return inventory.value;
    })();
    inFlightPromises[cacheKey] = p;
    return p;
  };

  const updateInventoryLocally = (productId: string, newQty: number) => {
    const idx = inventory.value.findIndex((item) => item.productId === productId);
    if (idx !== -1) {
      inventory.value[idx].quantity = newQty;
      inventory.value = [...inventory.value];
      saveToStorage('inventory', inventory.value);
    }
  };

  return {
    inventory,
    inventoryTotal,
    inventoryMeta,
    isLoading,
    fetchInventory,
    updateInventoryLocally,
  };
});
