import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../services/api';

export const useDataStore = defineStore('ubms_data', () => {
  const products = ref<any[]>([]);
  const categories = ref<any[]>([]);
  const tables = ref<any[]>([]);
  const customers = ref<any[]>([]);
  const suppliers = ref<any[]>([]);
  
  const dashboardSummary = ref<any>(null);
  const dashboardCharts = ref<any>(null);
  const inventory = ref<any[]>([]);
  const financeSummary = ref<any>(null);
  const financeExpenses = ref<any[]>([]);
  const appointments = ref<any[]>([]);

  const lastFetched = ref<Record<string, number>>({});

  const isCacheValid = (key: string, ttlMs = 60000) => {
    const timestamp = lastFetched.value[key];
    if (!timestamp) return false;
    return Date.now() - timestamp < ttlMs;
  };

  // 1. Fetch Products with instant cache
  const fetchProducts = async (force = false) => {
    if (!force && products.value.length > 0 && isCacheValid('products', 60000)) {
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
      const { data } = await api.get('/categories');
      categories.value = data || [];
      lastFetched.value['categories'] = Date.now();
    } catch (e) {
      console.error(e);
    }
    return categories.value;
  };

  // 3. Fetch Dashboard Summary & Charts
  const fetchDashboard = async (force = false) => {
    if (!force && dashboardSummary.value && isCacheValid('dashboard', 30000)) {
      return { summary: dashboardSummary.value, charts: dashboardCharts.value };
    }
    try {
      const [sumRes, chartRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/dashboard/charts?days=14'),
      ]);
      dashboardSummary.value = sumRes.data;
      dashboardCharts.value = chartRes.data;
      lastFetched.value['dashboard'] = Date.now();
    } catch (e) {
      console.error(e);
    }
    return { summary: dashboardSummary.value, charts: dashboardCharts.value };
  };

  // 4. Fetch Inventory
  const fetchInventory = async (force = false) => {
    if (!force && inventory.value.length > 0 && isCacheValid('inventory', 60000)) {
      return inventory.value;
    }
    try {
      const { data } = await api.get('/inventory');
      inventory.value = data || [];
      lastFetched.value['inventory'] = Date.now();
    } catch (e) {
      console.error(e);
    }
    return inventory.value;
  };

  // 5. Fetch Finance Summary & Expenses
  const fetchFinance = async (force = false) => {
    if (!force && financeSummary.value && isCacheValid('finance', 30000)) {
      return { summary: financeSummary.value, expenses: financeExpenses.value };
    }
    try {
      const [sumRes, expRes] = await Promise.all([
        api.get('/finance/summary'),
        api.get('/finance/expenses'),
      ]);
      financeSummary.value = sumRes.data;
      financeExpenses.value = expRes.data || [];
      lastFetched.value['finance'] = Date.now();
    } catch (e) {
      console.error(e);
    }
    return { summary: financeSummary.value, expenses: financeExpenses.value };
  };

  // 6. Fetch Customers
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

  // 7. Fetch Appointments
  const fetchAppointments = async (force = false) => {
    if (!force && appointments.value.length > 0 && isCacheValid('appointments', 60000)) {
      return appointments.value;
    }
    try {
      const { data } = await api.get('/appointments');
      appointments.value = data || [];
      lastFetched.value['appointments'] = Date.now();
    } catch (e) {
      console.error(e);
    }
    return appointments.value;
  };

  // 8. Fetch Tables
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

  // 9. Invalidate Cache Key
  const invalidate = (key: string) => {
    delete lastFetched.value[key];
  };

  return {
    products,
    categories,
    tables,
    customers,
    suppliers,
    dashboardSummary,
    dashboardCharts,
    inventory,
    financeSummary,
    financeExpenses,
    appointments,
    fetchProducts,
    fetchCategories,
    fetchDashboard,
    fetchInventory,
    fetchFinance,
    fetchCustomers,
    fetchAppointments,
    fetchTables,
    invalidate,
  };
});
