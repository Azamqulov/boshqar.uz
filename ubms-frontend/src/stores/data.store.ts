import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../services/api';
import { useProductStore } from './product.store';
import { useCustomerStore } from './customer.store';
import { useInventoryStore } from './inventory.store';
import { useFinanceStore } from './finance.store';

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

export const useDataStore = defineStore('ubms_data', () => {
  const productStore = useProductStore();
  const customerStore = useCustomerStore();
  const inventoryStore = useInventoryStore();
  const financeStore = useFinanceStore();

  const tables = ref<any[]>(loadFromStorage('tables', []));
  const appointments = ref<any[]>(loadFromStorage('appointments', []));
  const lastFetched = ref<Record<string, number>>({});
  const inFlightPromises: Record<string, Promise<any> | null> = {};

  const isCacheValid = (key: string, ttlMs = 60000) => {
    const timestamp = lastFetched.value[key];
    if (!timestamp) return false;
    return Date.now() - timestamp < ttlMs;
  };

  const fetchTables = async (force = false) => {
    if (!force && tables.value.length > 0 && isCacheValid('tables', 120000)) {
      return tables.value;
    }
    if (inFlightPromises['tables']) {
      return inFlightPromises['tables'];
    }
    const p = (async () => {
      try {
        const { data } = await api.get('/restaurant/tables');
        const items = Array.isArray(data) ? data : data?.items || [];
        tables.value = items;
        saveToStorage('tables', items);
        lastFetched.value['tables'] = Date.now();
      } catch (e) {
        console.error('Fetch tables failed:', e);
      } finally {
        inFlightPromises['tables'] = null;
      }
      return tables.value;
    })();
    inFlightPromises['tables'] = p;
    return p;
  };

  const fetchAppointments = async (force = false) => {
    if (!force && appointments.value.length > 0 && isCacheValid('appointments', 60000)) {
      return appointments.value;
    }
    if (inFlightPromises['appointments']) {
      return inFlightPromises['appointments'];
    }
    const p = (async () => {
      try {
        const { data } = await api.get('/appointments');
        const items = Array.isArray(data) ? data : data?.items || [];
        appointments.value = items;
        saveToStorage('appointments', items);
        lastFetched.value['appointments'] = Date.now();
      } catch (e) {
        console.error('Fetch appointments failed:', e);
      } finally {
        inFlightPromises['appointments'] = null;
      }
      return appointments.value;
    })();
    inFlightPromises['appointments'] = p;
    return p;
  };

  const prefetchAll = async (forceOrType?: boolean | string) => {
    const force = typeof forceOrType === 'boolean' ? forceOrType : false;
    try {
      await Promise.allSettled([
        productStore.fetchProducts(force),
        productStore.fetchCategories(force),
        inventoryStore.fetchInventory(1, 100, force),
        customerStore.fetchCustomers(force),
        financeStore.fetchDashboardSummary(force),
      ]);
    } catch (e) {
      console.warn('Prefetch completed with partial errors:', e);
    }
  };

  const clearLocalCache = () => {
    const keys = [
      'products',
      'categories',
      'inventory',
      'inventoryTotal',
      'inventoryMeta',
      'customers',
      'suppliers',
      'dashboardSummary',
      'dashboardCharts',
      'financeSummary',
      'financeExpenses',
      'tables',
      'appointments',
    ];
    keys.forEach((k) => {
      try {
        localStorage.removeItem(`ubms_cache_${k}`);
      } catch (e) {}
    });

    // Reset RAM memory state in all sub-stores
    productStore.resetStore();
    customerStore.resetStore();
    inventoryStore.resetStore();
    financeStore.resetStore();

    tables.value = [];
    appointments.value = [];
    lastFetched.value = {};
    for (const key in inFlightPromises) {
      delete inFlightPromises[key];
    }
  };


  const loadDemoData = (type = 'shop') => {
    // Populate rich initial data for demonstration mode
    productStore.products = [
      { id: '1', name: 'Nestle Sut 1L 3.2%', price: 12000, buyPrice: 9500, stock: 45, sku: 'NES-32', category: 'Sut mahsulotlari' },
      { id: '2', name: 'Tandir Non (Issiq)', price: 4000, buyPrice: 2800, stock: 80, sku: 'NON-01', category: 'Non mahsulotlari' },
      { id: '3', name: 'Banan Ekvador (Shirin)', price: 25000, buyPrice: 18000, stock: 12.5, sku: 'BAN-01', category: 'Mevalar' },
      { id: '4', name: 'Toshkent Choy Qora 100g', price: 8500, buyPrice: 6200, stock: 60, sku: 'CHOY-95', category: 'Choy' },
      { id: '5', name: 'President Sariyog 200g', price: 32000, buyPrice: 24000, stock: 24, sku: 'SAR-200', category: 'Sut mahsulotlari' },
      { id: '6', name: 'Coca-Cola 1.5L', price: 14000, buyPrice: 10500, stock: 150, sku: 'CC-15', category: 'Ichimliklar' },
    ];
    productStore.categories = [
      { id: '1', name: 'Barchasi' },
      { id: '2', name: 'Ichimliklar' },
      { id: '3', name: 'Sut mahsulotlari' },
      { id: '4', name: 'Non mahsulotlari' },
      { id: '5', name: 'Mevalar' },
    ];
    customerStore.customers = [
      { id: '1', fullName: 'Olim aka (Doimiy xaridor)', phone: '+998 90 123-45-67', balance: -340000 },
      { id: '2', fullName: "Jamshid (Qo'shni)", phone: '+998 93 987-65-43', balance: -150000 },
      { id: '3', fullName: 'Sarvar Qurilish Mollari', phone: '+998 97 555-44-33', balance: -1190000 },
    ];
    tables.value = [
      { id: '1', name: '1-Stol (Zal)', capacity: 4, occupied: true, orderNumber: '#ORD-104', orderTotal: 140000 },
      { id: '2', name: '2-Stol (Zal)', capacity: 4, occupied: false, orderNumber: '', orderTotal: 0 },
      { id: '3', name: '3-Stol (Terassa)', capacity: 6, occupied: true, orderNumber: '#ORD-108', orderTotal: 265000 },
      { id: '4', name: 'VIP Xona', capacity: 10, occupied: false, orderNumber: '', orderTotal: 0 },
    ];
  };

  const invalidate = (key?: string) => {
    if (!key) {
      clearLocalCache();
      return;
    }
    delete lastFetched.value[key];
    try {
      localStorage.removeItem(`ubms_cache_${key}`);
    } catch (e) {}
    if (key === 'products') productStore.fetchProducts(true);
    else if (key === 'categories') productStore.fetchCategories(true);
    else if (key.startsWith('inventory')) inventoryStore.fetchInventory(1, 100, true);
    else if (key === 'customers') customerStore.fetchCustomers(true);
    else if (key === 'suppliers') customerStore.fetchSuppliers(true);
    else if (key.startsWith('finance')) financeStore.fetchFinanceSummary('month', true);
    else if (key.startsWith('dashboard')) financeStore.fetchDashboardSummary(true);
  };

  return {
    // Composed reactive state (computed properties ensure 100% reactive sync with sub-stores)
    products: computed({
      get: () => productStore.products,
      set: (val: any[]) => { productStore.products = val; },
    }),
    categories: computed({
      get: () => productStore.categories,
      set: (val: any[]) => { productStore.categories = val; },
    }),
    customers: computed({
      get: () => customerStore.customers,
      set: (val: any[]) => { customerStore.customers = val; },
    }),
    suppliers: computed({
      get: () => customerStore.suppliers,
      set: (val: any[]) => { customerStore.suppliers = val; },
    }),
    inventory: computed({
      get: () => inventoryStore.inventory,
      set: (val: any[]) => { inventoryStore.inventory = val; },
    }),
    inventoryTotal: computed({
      get: () => inventoryStore.inventoryTotal,
      set: (val: number) => { inventoryStore.inventoryTotal = val; },
    }),
    inventoryMeta: computed({
      get: () => inventoryStore.inventoryMeta,
      set: (val: any) => { inventoryStore.inventoryMeta = val; },
    }),
    dashboardSummary: computed({
      get: () => financeStore.dashboardSummary,
      set: (val: any) => { financeStore.dashboardSummary = val; },
    }),
    dashboardCharts: computed({
      get: () => financeStore.dashboardCharts,
      set: (val: any) => { financeStore.dashboardCharts = val; },
    }),
    financeSummary: computed({
      get: () => financeStore.financeSummary,
      set: (val: any) => { financeStore.financeSummary = val; },
    }),
    financeExpenses: computed({
      get: () => financeStore.financeExpenses,
      set: (val: any[]) => { financeStore.financeExpenses = val; },
    }),
    tables,
    appointments,

    // Loading states
    loading: {
      get products() { return productStore.isLoading; },
      get categories() { return false; },
      get inventory() { return inventoryStore.isLoading; },
      get customers() { return customerStore.isLoading; },
      get suppliers() { return false; },
      get finance() { return financeStore.isLoading; },
      get dashboard() { return false; },
      get tables() { return false; },
      get appointments() { return false; },
    },

    // Forwarded action methods
    fetchProducts: productStore.fetchProducts,
    fetchCategories: productStore.fetchCategories,
    addProductLocally: productStore.addProductLocally,
    updateProductLocally: productStore.updateProductLocally,
    deleteProductLocally: productStore.deleteProductLocally,

    fetchCustomers: customerStore.fetchCustomers,
    fetchSuppliers: customerStore.fetchSuppliers,
    addCustomerLocally: customerStore.addCustomerLocally,
    updateCustomerLocally: customerStore.updateCustomerLocally,
    deleteCustomerLocally: customerStore.deleteCustomerLocally,

    fetchInventory: inventoryStore.fetchInventory,
    updateInventoryLocally: inventoryStore.updateInventoryLocally,

    fetchFinanceSummary: financeStore.fetchFinanceSummary,
    fetchFinanceExpenses: financeStore.fetchFinanceExpenses,
    deleteExpenseLocally: financeStore.deleteExpenseLocally,
    fetchDashboardSummary: financeStore.fetchDashboardSummary,
    fetchDashboardCharts: financeStore.fetchDashboardCharts,

    // Compatibility Aliases
    fetchChartData: financeStore.fetchDashboardCharts,
    fetchDashboard: financeStore.fetchDashboardSummary,
    fetchFinance: financeStore.fetchFinanceSummary,
    clearAll: clearLocalCache,
    loadDemoData,

    fetchTables,
    fetchAppointments,
    prefetchAll,
    clearLocalCache,
    invalidate,
  };
});
