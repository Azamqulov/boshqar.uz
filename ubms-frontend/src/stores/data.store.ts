import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../services/api';

export const useDataStore = defineStore('ubms_data', () => {
  const products = ref<any[]>([]);
  const categories = ref<any[]>([]);
  const tables = ref<any[]>([]);
  const customers = ref<any[]>([]);
  const suppliers = ref<any[]>([]);
  
  const lastFetched = ref<Record<string, number>>({});

  const isCacheValid = (key: string, ttlMs = 60000) => {
    const timestamp = lastFetched.value[key];
    if (!timestamp) return false;
    return Date.now() - timestamp < ttlMs;
  };

  // 1. Fetch Products with instant cache
  const fetchProducts = async (force = false) => {
    if (!force && products.value.length > 0 && isCacheValid('products')) {
      return products.value;
    }
    try {
      const { data } = await api.get('/products');
      products.value = data.items || [];
      lastFetched.value['products'] = Date.now();
    } catch (e) {
      console.error(e);
    }
    return products.value;
  };

  // 2. Fetch Categories
  const fetchCategories = async (force = false) => {
    if (!force && categories.value.length > 0 && isCacheValid('categories', 300000)) {
      return categories.value;
    }
    try {
      const { data } = await api.get('/products/categories');
      categories.value = data || [];
      lastFetched.value['categories'] = Date.now();
    } catch (e) {
      console.error(e);
    }
    return categories.value;
  };

  // 3. Fetch Tables
  const fetchTables = async (force = false) => {
    if (!force && tables.value.length > 0 && isCacheValid('tables', 15000)) {
      return tables.value;
    }
    try {
      const { data } = await api.get('/restaurant/tables');
      tables.value = data || [];
      lastFetched.value['tables'] = Date.now();
    } catch (e) {
      console.error(e);
    }
    return tables.value;
  };

  // 4. Fetch Customers
  const fetchCustomers = async (force = false) => {
    if (!force && customers.value.length > 0 && isCacheValid('customers', 60000)) {
      return customers.value;
    }
    try {
      const { data } = await api.get('/customers');
      customers.value = data || [];
      lastFetched.value['customers'] = Date.now();
    } catch (e) {
      console.error(e);
    }
    return customers.value;
  };

  const invalidate = (key: string) => {
    delete lastFetched.value[key];
  };

  return {
    products,
    categories,
    tables,
    customers,
    suppliers,
    fetchProducts,
    fetchCategories,
    fetchTables,
    fetchCustomers,
    invalidate,
  };
});
