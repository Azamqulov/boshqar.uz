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

export const useDataStore = defineStore('ubms_data', () => {
  const products = ref<any[]>(loadFromStorage('products', []));
  const categories = ref<any[]>(loadFromStorage('categories', []));
  const tables = ref<any[]>(loadFromStorage('tables', []));
  const customers = ref<any[]>(loadFromStorage('customers', []));
  const suppliers = ref<any[]>(loadFromStorage('suppliers', []));
  
  const dashboardSummary = ref<any>(loadFromStorage('dashboardSummary', null));
  const dashboardCharts = ref<any>(loadFromStorage('dashboardCharts', null));
  const inventory = ref<any[]>(loadFromStorage('inventory', []));
  const inventoryTotal = ref<number>(loadFromStorage('inventoryTotal', 0));
  const inventoryMeta = ref<any>(loadFromStorage('inventoryMeta', { page: 1, limit: 100, total: 0, totalPages: 1 }));
  const financeSummary = ref<any>(loadFromStorage('financeSummary', null));
  const financeExpenses = ref<any[]>(loadFromStorage('financeExpenses', []));
  const appointments = ref<any[]>(loadFromStorage('appointments', []));

  const loading = ref({
    products: false,
    categories: false,
    inventory: false,
    customers: false,
    suppliers: false,
    finance: false,
    dashboard: false,
    tables: false,
    appointments: false,
  });

  const lastFetched = ref<Record<string, number>>({});
  const inFlightPromises: Record<string, Promise<any> | null> = {};

  const isCacheValid = (key: string, ttlMs = 60000) => {
    const timestamp = lastFetched.value[key];
    if (!timestamp) return false;
    return Date.now() - timestamp < ttlMs;
  };

  // 1. Fetch Products with instant cache & in-flight deduplication
  const fetchProducts = async (force = false) => {
    if (!force && products.value.length > 0 && isCacheValid('products', 60000)) {
      return products.value;
    }
    if (inFlightPromises['products']) {
      return inFlightPromises['products'];
    }
    // Only show full loading spinner if local cache is completely empty
    if (products.value.length === 0) {
      loading.value.products = true;
    }
    const p = (async () => {
      try {
        const { data } = await api.get('/products/lite?limit=1000');
        const items = Array.isArray(data) ? data : (data?.items || []);
        products.value = items;
        saveToStorage('products', items);
        lastFetched.value['products'] = Date.now();
      } catch (e) {
        // Fallback to standard /products if /products/lite not reachable
        try {
          const { data } = await api.get('/products?limit=100');
          const items = Array.isArray(data) ? data : (data?.items || []);
          products.value = items;
          saveToStorage('products', items);
          lastFetched.value['products'] = Date.now();
        } catch (fallbackErr) {
          console.error('Fetch products failed:', fallbackErr);
        }
      } finally {
        inFlightPromises['products'] = null;
        loading.value.products = false;
      }
      return products.value;
    })();
    inFlightPromises['products'] = p;
    return p;
  };

  // 2. Fetch Categories with deduplication
  const fetchCategories = async (force = false) => {
    if (!force && categories.value.length > 0 && isCacheValid('categories', 300000)) {
      return categories.value;
    }
    if (inFlightPromises['categories']) {
      return inFlightPromises['categories'];
    }
    if (categories.value.length === 0) {
      loading.value.categories = true;
    }
    const p = (async () => {
      try {
        const { data } = await api.get('/categories');
        const items = Array.isArray(data) ? data : (data?.items || []);
        categories.value = items;
        saveToStorage('categories', items);
        lastFetched.value['categories'] = Date.now();
      } catch (e) {
        console.error('Fetch categories failed:', e);
      } finally {
        inFlightPromises['categories'] = null;
        loading.value.categories = false;
      }
      return categories.value;
    })();
    inFlightPromises['categories'] = p;
    return p;
  };

  // 3. Fetch Dashboard Summary & Charts
  const fetchDashboard = async (force = false, days = 14) => {
    if (!force && dashboardSummary.value && isCacheValid('dashboard', 30000)) {
      return { summary: dashboardSummary.value, charts: dashboardCharts.value };
    }
    if (!dashboardSummary.value) {
      loading.value.dashboard = true;
    }
    try {
      const [sumRes, chartRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get(`/dashboard/charts?days=${days}`),
      ]);
      dashboardSummary.value = sumRes.data;
      dashboardCharts.value = chartRes.data;
      saveToStorage('dashboardSummary', sumRes.data);
      saveToStorage('dashboardCharts', chartRes.data);
      lastFetched.value['dashboard'] = Date.now();
    } catch (e) {
      console.error('Fetch dashboard failed:', e);
    } finally {
      loading.value.dashboard = false;
    }
    return { summary: dashboardSummary.value, charts: dashboardCharts.value };
  };

  // 3b. Fetch Chart Data with custom period (bypasses cache)
  const fetchChartData = async (days: number) => {
    try {
      const { data } = await api.get(`/dashboard/charts?days=${days}`);
      dashboardCharts.value = data;
      saveToStorage('dashboardCharts', data);
      return data;
    } catch (e) {
      console.error('Fetch chart data failed:', e);
      return dashboardCharts.value || [];
    }
  };

  // 4. Fetch Inventory with pagination support
  const fetchInventory = async (force = false, page = 1, limit = 100) => {
    const cacheKey = `inventory_${page}_${limit}`;
    if (!force && inventory.value.length > 0 && isCacheValid(cacheKey, 60000)) {
      return inventory.value;
    }
    if (inFlightPromises[cacheKey]) {
      return inFlightPromises[cacheKey];
    }
    if (inventory.value.length === 0) {
      loading.value.inventory = true;
    }
    const p = (async () => {
      try {
        const { data } = await api.get(`/inventory?page=${page}&limit=${limit}`);
        const items = Array.isArray(data) ? data : (data?.items || []);
        inventory.value = items;
        saveToStorage('inventory', items);
        if (data?.total !== undefined || data?.totalPages !== undefined) {
          inventoryMeta.value = {
            page: data.page || page,
            limit: data.limit || limit,
            total: data.total || items.length,
            totalPages: data.totalPages || Math.ceil((data.total || items.length) / limit),
          };
          inventoryTotal.value = data.total || items.length;
          saveToStorage('inventoryMeta', inventoryMeta.value);
          saveToStorage('inventoryTotal', inventoryTotal.value);
        } else {
          inventoryTotal.value = items.length;
          saveToStorage('inventoryTotal', items.length);
        }
        lastFetched.value[cacheKey] = Date.now();
      } catch (e) {
        console.error('Fetch inventory failed:', e);
      } finally {
        inFlightPromises[cacheKey] = null;
        loading.value.inventory = false;
      }
      return inventory.value;
    })();
    inFlightPromises[cacheKey] = p;
    return p;
  };

  // 5. Fetch Finance Summary & Expenses
  const fetchFinance = async (force = false) => {
    if (!force && financeSummary.value && isCacheValid('finance', 30000)) {
      return { summary: financeSummary.value, expenses: financeExpenses.value };
    }
    if (inFlightPromises['finance']) {
      return inFlightPromises['finance'];
    }
    if (!financeSummary.value) {
      loading.value.finance = true;
    }
    const p = (async () => {
      try {
        const [sumRes, expRes] = await Promise.all([
          api.get('/finance/summary'),
          api.get('/finance/expenses'),
        ]);
        financeSummary.value = sumRes.data;
        financeExpenses.value = Array.isArray(expRes.data) ? expRes.data : (expRes.data?.items || []);
        saveToStorage('financeSummary', financeSummary.value);
        saveToStorage('financeExpenses', financeExpenses.value);
        lastFetched.value['finance'] = Date.now();
      } catch (e) {
        console.error('Fetch finance failed:', e);
      } finally {
        inFlightPromises['finance'] = null;
        loading.value.finance = false;
      }
      return { summary: financeSummary.value, expenses: financeExpenses.value };
    })();
    inFlightPromises['finance'] = p;
    return p;
  };

  // 6. Fetch Customers
  const fetchCustomers = async (force = false) => {
    if (!force && customers.value.length > 0 && isCacheValid('customers', 60000)) {
      return customers.value;
    }
    if (inFlightPromises['customers']) {
      return inFlightPromises['customers'];
    }
    if (customers.value.length === 0) {
      loading.value.customers = true;
    }
    const p = (async () => {
      try {
        const { data } = await api.get('/customers?limit=200');
        const items = Array.isArray(data) ? data : (data?.items || []);
        customers.value = items;
        saveToStorage('customers', items);
        lastFetched.value['customers'] = Date.now();
      } catch (e) {
        console.error('Fetch customers failed:', e);
      } finally {
        inFlightPromises['customers'] = null;
        loading.value.customers = false;
      }
      return customers.value;
    })();
    inFlightPromises['customers'] = p;
    return p;
  };

  // 6b. Fetch Suppliers
  const fetchSuppliers = async (force = false) => {
    if (!force && suppliers.value.length > 0 && isCacheValid('suppliers', 60000)) {
      return suppliers.value;
    }
    if (inFlightPromises['suppliers']) {
      return inFlightPromises['suppliers'];
    }
    if (suppliers.value.length === 0) {
      loading.value.suppliers = true;
    }
    const p = (async () => {
      try {
        const { data } = await api.get('/suppliers?limit=200');
        const items = Array.isArray(data) ? data : (data?.items || []);
        suppliers.value = items;
        saveToStorage('suppliers', items);
        lastFetched.value['suppliers'] = Date.now();
      } catch (e) {
        console.error('Fetch suppliers failed:', e);
      } finally {
        inFlightPromises['suppliers'] = null;
        loading.value.suppliers = false;
      }
      return suppliers.value;
    })();
    inFlightPromises['suppliers'] = p;
    return p;
  };

  // 7. Fetch Appointments
  const fetchAppointments = async (force = false) => {
    if (!force && appointments.value.length > 0 && isCacheValid('appointments', 60000)) {
      return appointments.value;
    }
    if (inFlightPromises['appointments']) {
      return inFlightPromises['appointments'];
    }
    loading.value.appointments = true;
    const p = (async () => {
      try {
        const { data } = await api.get('/appointments?limit=200');
        const items = Array.isArray(data) ? data : (data?.items || []);
        appointments.value = items;
        lastFetched.value['appointments'] = Date.now();
      } catch (e) {
        console.error('Fetch appointments failed:', e);
      } finally {
        inFlightPromises['appointments'] = null;
        loading.value.appointments = false;
      }
      return appointments.value;
    })();
    inFlightPromises['appointments'] = p;
    return p;
  };

  // 8. Fetch Tables
  const fetchTables = async (force = false) => {
    if (!force && tables.value.length > 0 && isCacheValid('tables', 15000)) {
      return tables.value;
    }
    if (inFlightPromises['tables']) {
      return inFlightPromises['tables'];
    }
    loading.value.tables = true;
    const p = (async () => {
      try {
        const { data } = await api.get('/restaurant/tables');
        const items = Array.isArray(data) ? data : (data?.items || []);
        tables.value = items;
        lastFetched.value['tables'] = Date.now();
      } catch (e) {
        console.error('Fetch tables failed:', e);
      } finally {
        inFlightPromises['tables'] = null;
        loading.value.tables = false;
      }
      return tables.value;
    })();
    inFlightPromises['tables'] = p;
    return p;
  };

  // 9. Invalidate Cache Key
  const invalidate = (key: string) => {
    delete lastFetched.value[key];
  };

  // 10. Smart Background Prefetcher (Critical first, background non-blocking)
  const prefetchAll = async (businessType = 'shop') => {
    // 1. Critical requests: needed immediately for landing navigation and initial render
    try {
      await Promise.allSettled([
        fetchCategories(),
        fetchProducts(),
      ]);
    } catch (err) {
      console.warn('Critical prefetch warning:', err);
    }

    // 2. Background requests: fire-and-forget in background without blocking UI
    setTimeout(() => {
      const bgPromises: Promise<any>[] = [
        fetchCustomers(),
        fetchSuppliers(),
        fetchInventory(false, 1, 100),
        fetchFinance(),
      ];

      if (businessType === 'restaurant' || businessType === 'cafe') {
        bgPromises.push(fetchTables());
      } else if (businessType === 'barbershop' || businessType === 'service') {
        bgPromises.push(fetchAppointments());
      }

      Promise.allSettled(bgPromises).catch((err) => {
        console.warn('Background prefetch warning:', err);
      });
    }, 60);
  };

  // 11. Clear all on logout
  const clearAll = () => {
    products.value = [];
    categories.value = [];
    tables.value = [];
    customers.value = [];
    suppliers.value = [];
    dashboardSummary.value = null;
    dashboardCharts.value = null;
    inventory.value = [];
    financeSummary.value = null;
    financeExpenses.value = [];
    appointments.value = [];
    lastFetched.value = {};
  };

  // 12. Load Demo Sector Data (15 realistic preloaded products, categories & customers)
  const loadDemoData = (businessType = 'shop') => {
    let demoProds: any[] = [];
    let demoCats: any[] = [];

    if (businessType === 'restaurant') {
      demoCats = [
        { id: 'cat-1', name: 'Milliy Taomlar', code: 'MT' },
        { id: 'cat-2', name: 'Kaboblar & Qozon', code: 'KQ' },
        { id: 'cat-3', name: 'Salatlar & Gazaklar', code: 'SG' },
        { id: 'cat-4', name: 'Ichimliklar & Choy', code: 'ICH' },
      ];
      demoProds = [
        { id: 'p-1', name: 'To\'y Oshi Maxsus (1 porsiya)', price: 38000, costPrice: 24000, stockQty: 60, categoryId: 'cat-1', barcode: '4780001', isDemo: true },
        { id: 'p-2', name: 'Qozon Kabob Qo\'y Go\'shti', price: 56000, costPrice: 38000, stockQty: 30, categoryId: 'cat-2', barcode: '4780002', isDemo: true },
        { id: 'p-3', name: 'Sho\'rva Go\'shtli', price: 32000, costPrice: 20000, stockQty: 40, categoryId: 'cat-1', barcode: '4780003', isDemo: true },
        { id: 'p-4', name: 'Manti Go\'shtli (5 dona)', price: 35000, costPrice: 22000, stockQty: 50, categoryId: 'cat-1', barcode: '4780004', isDemo: true },
        { id: 'p-5', name: 'Lag\'mon Cho\'zma', price: 34000, costPrice: 21000, stockQty: 35, categoryId: 'cat-1', barcode: '4780005', isDemo: true },
        { id: 'p-6', name: 'Shashlik Qiyma', price: 18000, costPrice: 11000, stockQty: 90, categoryId: 'cat-2', barcode: '4780006', isDemo: true },
        { id: 'p-7', name: 'Shashlik Jaz Mol Go\'shti', price: 24000, costPrice: 15000, stockQty: 75, categoryId: 'cat-2', barcode: '4780007', isDemo: true },
        { id: 'p-8', name: 'Shashlik Tovuq', price: 16000, costPrice: 9500, stockQty: 80, categoryId: 'cat-2', barcode: '4780008', isDemo: true },
        { id: 'p-9', name: 'Achichuk Pomidor Salati', price: 12000, costPrice: 6000, stockQty: 60, categoryId: 'cat-3', barcode: '4780009', isDemo: true },
        { id: 'p-10', name: 'Suzma Ko\'katli', price: 10000, costPrice: 5000, stockQty: 40, categoryId: 'cat-3', barcode: '4780010', isDemo: true },
        { id: 'p-11', name: 'Fransuzcha Salat', price: 22000, costPrice: 13000, stockQty: 30, categoryId: 'cat-3', barcode: '4780011', isDemo: true },
        { id: 'p-12', name: 'Ko\'k Choy Limonli (Choynak)', price: 8000, costPrice: 2000, stockQty: 120, categoryId: 'cat-4', barcode: '4780012', isDemo: true },
        { id: 'p-13', name: 'Qora Choy (Choynak)', price: 6000, costPrice: 1500, stockQty: 120, categoryId: 'cat-4', barcode: '4780013', isDemo: true },
        { id: 'p-14', name: 'Moxito Ichimligi 0.5L', price: 18000, costPrice: 9000, stockQty: 45, categoryId: 'cat-4', barcode: '4780014', isDemo: true },
        { id: 'p-15', name: 'Issiq Tandir Non', price: 4000, costPrice: 2500, stockQty: 100, categoryId: 'cat-1', barcode: '4780015', isDemo: true },
      ];
    } else if (businessType === 'cafe') {
      demoCats = [
        { id: 'cat-1', name: 'Fast Food & Lavash', code: 'FF' },
        { id: 'cat-2', name: 'Pitsa & Burger', code: 'PB' },
        { id: 'cat-3', name: 'Ichimliklar & Kofe', code: 'IK' },
        { id: 'cat-4', name: 'Desertlar', code: 'DES' },
      ];
      demoProds = [
        { id: 'p-1', name: 'Lavash Standart Go\'shtli', price: 28000, costPrice: 18000, stockQty: 50, categoryId: 'cat-1', barcode: '4780101', isDemo: true },
        { id: 'p-2', name: 'Lavash Pishloqli (Sirli)', price: 32000, costPrice: 20000, stockQty: 40, categoryId: 'cat-1', barcode: '4780102', isDemo: true },
        { id: 'p-3', name: 'Gamburger Go\'shtli', price: 26000, costPrice: 16000, stockQty: 45, categoryId: 'cat-2', barcode: '4780103', isDemo: true },
        { id: 'p-4', name: 'Chizburger Double', price: 34000, costPrice: 21000, stockQty: 30, categoryId: 'cat-2', barcode: '4780104', isDemo: true },
        { id: 'p-5', name: 'Pizza Peperoni 30cm', price: 65000, costPrice: 38000, stockQty: 25, categoryId: 'cat-2', barcode: '4780105', isDemo: true },
        { id: 'p-6', name: 'Pizza Margarita 30cm', price: 52000, costPrice: 30000, stockQty: 20, categoryId: 'cat-2', barcode: '4780106', isDemo: true },
        { id: 'p-7', name: 'Kartoshka Fri', price: 16000, costPrice: 9000, stockQty: 70, categoryId: 'cat-1', barcode: '4780107', isDemo: true },
        { id: 'p-8', name: 'Tovuq Naggetslar (6 dona)', price: 22000, costPrice: 13000, stockQty: 40, categoryId: 'cat-1', barcode: '4780108', isDemo: true },
        { id: 'p-9', name: 'Hot Dog Maxi', price: 20000, costPrice: 12000, stockQty: 35, categoryId: 'cat-1', barcode: '4780109', isDemo: true },
        { id: 'p-10', name: 'Kofe Kapuchino', price: 18000, costPrice: 8000, stockQty: 99, categoryId: 'cat-3', barcode: '4780110', isDemo: true },
        { id: 'p-11', name: 'Kofe Latte Vanil', price: 20000, costPrice: 9000, stockQty: 99, categoryId: 'cat-3', barcode: '4780111', isDemo: true },
        { id: 'p-12', name: 'Pepsi Razliv 0.5L', price: 8000, costPrice: 5000, stockQty: 80, categoryId: 'cat-3', barcode: '4780112', isDemo: true },
        { id: 'p-13', name: 'Chizkeyk Nyu-York', price: 25000, costPrice: 14000, stockQty: 20, categoryId: 'cat-4', barcode: '4780113', isDemo: true },
        { id: 'p-14', name: 'Shokoladli Muffin', price: 15000, costPrice: 8000, stockQty: 25, categoryId: 'cat-4', barcode: '4780114', isDemo: true },
        { id: 'p-15', name: 'Muzqaymoq Qulupnayli', price: 12000, costPrice: 6000, stockQty: 40, categoryId: 'cat-4', barcode: '4780115', isDemo: true },
      ];
    } else if (businessType === 'pharmacy') {
      demoCats = [
        { id: 'cat-1', name: 'Dori-darmon', code: 'DD' },
        { id: 'cat-2', name: 'Gigiyena & Bog\'lov', code: 'GB' },
        { id: 'cat-3', name: 'Vitaminlar', code: 'VIT' },
      ];
      demoProds = [
        { id: 'p-1', name: 'Paratsetamol 500mg', price: 3500, costPrice: 2200, stockQty: 120, categoryId: 'cat-1', barcode: '4781001', isDemo: true },
        { id: 'p-2', name: 'Tsitramon P N10', price: 4000, costPrice: 2500, stockQty: 100, categoryId: 'cat-1', barcode: '4781002', isDemo: true },
        { id: 'p-3', name: 'Tibbiy Spirt 70% 100ml', price: 6000, costPrice: 4000, stockQty: 80, categoryId: 'cat-2', barcode: '4781003', isDemo: true },
        { id: 'p-4', name: 'Bint Steril 5x10', price: 3000, costPrice: 1800, stockQty: 150, categoryId: 'cat-2', barcode: '4781004', isDemo: true },
        { id: 'p-5', name: 'Mezim Forte N20', price: 24000, costPrice: 19000, stockQty: 40, categoryId: 'cat-1', barcode: '4781005', isDemo: true },
        { id: 'p-6', name: 'Nimesil Paket', price: 7500, costPrice: 5800, stockQty: 90, categoryId: 'cat-1', barcode: '4781006', isDemo: true },
        { id: 'p-7', name: 'Naftizin Tomchi 0.1%', price: 5000, costPrice: 3200, stockQty: 65, categoryId: 'cat-1', barcode: '4781007', isDemo: true },
        { id: 'p-8', name: 'Teraflu Paket Limon', price: 12000, costPrice: 9500, stockQty: 50, categoryId: 'cat-1', barcode: '4781008', isDemo: true },
        { id: 'p-9', name: 'Yod 5% 20ml', price: 4500, costPrice: 2800, stockQty: 70, categoryId: 'cat-2', barcode: '4781009', isDemo: true },
        { id: 'p-10', name: 'Analgin 500mg', price: 3000, costPrice: 1900, stockQty: 110, categoryId: 'cat-1', barcode: '4781010', isDemo: true },
        { id: 'p-11', name: 'Karbamazepin 200mg', price: 18000, costPrice: 14000, stockQty: 30, categoryId: 'cat-1', barcode: '4781011', isDemo: true },
        { id: 'p-12', name: 'Pampers 4-o\'lcham', price: 160000, costPrice: 135000, stockQty: 15, categoryId: 'cat-2', barcode: '4781012', isDemo: true },
        { id: 'p-13', name: 'Suprastin 25mg', price: 28000, costPrice: 22000, stockQty: 35, categoryId: 'cat-1', barcode: '4781013', isDemo: true },
        { id: 'p-14', name: 'Vodorod Peroksid 3%', price: 4000, costPrice: 2400, stockQty: 85, categoryId: 'cat-2', barcode: '4781014', isDemo: true },
        { id: 'p-15', name: 'Termometr Elektron', price: 35000, costPrice: 25000, stockQty: 20, categoryId: 'cat-2', barcode: '4781015', isDemo: true },
      ];
    } else if (businessType === 'barbershop') {
      demoCats = [
        { id: 'cat-1', name: 'Erkaklar Xizmati', code: 'EX' },
        { id: 'cat-2', name: 'Ayollar Xizmati', code: 'AX' },
        { id: 'cat-3', name: 'Kosmetika & Parvarish', code: 'KP' },
      ];
      demoProds = [
        { id: 'p-1', name: 'Soch Turmaklash (Erkaklar)', price: 40000, costPrice: 5000, stockQty: 999, categoryId: 'cat-1', barcode: '4782001', isDemo: true, brand: 'service' },
        { id: 'p-2', name: 'Soqol Tekislash va Dizayn', price: 25000, costPrice: 3000, stockQty: 999, categoryId: 'cat-1', barcode: '4782002', isDemo: true, brand: 'service' },
        { id: 'p-3', name: 'Yuz Massaji & Skrab', price: 50000, costPrice: 10000, stockQty: 999, categoryId: 'cat-1', barcode: '4782003', isDemo: true, brand: 'service' },
        { id: 'p-4', name: 'Bolalar Soch Olishi', price: 30000, costPrice: 3000, stockQty: 999, categoryId: 'cat-1', barcode: '4782004', isDemo: true, brand: 'service' },
        { id: 'p-5', name: 'Soch Bo\'yash Professional', price: 90000, costPrice: 35000, stockQty: 999, categoryId: 'cat-2', barcode: '4782005', isDemo: true, brand: 'service' },
        { id: 'p-6', name: 'Manikur Gel Lak', price: 80000, costPrice: 25000, stockQty: 999, categoryId: 'cat-2', barcode: '4782006', isDemo: true, brand: 'service' },
        { id: 'p-7', name: 'Pedikur To\'liq', price: 110000, costPrice: 35000, stockQty: 999, categoryId: 'cat-2', barcode: '4782007', isDemo: true, brand: 'service' },
        { id: 'p-8', name: 'Yuz Tozalash (Chistka)', price: 140000, costPrice: 45000, stockQty: 999, categoryId: 'cat-2', barcode: '4782008', isDemo: true, brand: 'service' },
        { id: 'p-9', name: 'Qosh Terish va Bo\'yash', price: 35000, costPrice: 8000, stockQty: 999, categoryId: 'cat-2', barcode: '4782009', isDemo: true, brand: 'service' },
        { id: 'p-10', name: 'Soch Yuvish & Fen', price: 20000, costPrice: 4000, stockQty: 999, categoryId: 'cat-1', barcode: '4782010', isDemo: true, brand: 'service' },
        { id: 'p-11', name: 'Shampun Soch Uchun 500ml', price: 65000, costPrice: 45000, stockQty: 20, categoryId: 'cat-3', barcode: '4782011', isDemo: true },
        { id: 'p-12', name: 'Soch Laki Taft 250ml', price: 48000, costPrice: 34000, stockQty: 25, categoryId: 'cat-3', barcode: '4782012', isDemo: true },
        { id: 'p-13', name: 'Soqol Losoni Nivea', price: 52000, costPrice: 38000, stockQty: 18, categoryId: 'cat-3', barcode: '4782013', isDemo: true },
        { id: 'p-14', name: 'Soch Mumi (Vosk)', price: 38000, costPrice: 25000, stockQty: 30, categoryId: 'cat-3', barcode: '4782014', isDemo: true },
        { id: 'p-15', name: 'Bosh Massaji Relaks', price: 45000, costPrice: 5000, stockQty: 999, categoryId: 'cat-1', barcode: '4782015', isDemo: true, brand: 'service' },
      ];
    } else if (businessType === 'service') {
      demoCats = [
        { id: 'cat-1', name: 'Ta\'mirlash & Texnika', code: 'TT' },
        { id: 'cat-2', name: 'Tozalash & Xizmat', code: 'TX' },
        { id: 'cat-3', name: 'O\'rnatish & Montaj', code: 'OM' },
      ];
      demoProds = [
        { id: 'p-1', name: 'Diagnostika va Tekshirish', price: 50000, costPrice: 5000, stockQty: 999, categoryId: 'cat-1', barcode: '4784001', isDemo: true, brand: 'service' },
        { id: 'p-2', name: 'Kompyuter / Noutbuk Sozlash', price: 80000, costPrice: 10000, stockQty: 999, categoryId: 'cat-1', barcode: '4784002', isDemo: true, brand: 'service' },
        { id: 'p-3', name: 'Format & Windows O\'rnatish', price: 60000, costPrice: 5000, stockQty: 999, categoryId: 'cat-1', barcode: '4784003', isDemo: true, brand: 'service' },
        { id: 'p-4', name: 'Telefon Ekranini Almashtirish', price: 180000, costPrice: 110000, stockQty: 999, categoryId: 'cat-1', barcode: '4784004', isDemo: true, brand: 'service' },
        { id: 'p-5', name: 'Akkumulyator Almashtirish', price: 120000, costPrice: 75000, stockQty: 999, categoryId: 'cat-1', barcode: '4784005', isDemo: true, brand: 'service' },
        { id: 'p-6', name: 'Printer Kartrij Zapravka', price: 40000, costPrice: 15000, stockQty: 999, categoryId: 'cat-1', barcode: '4784006', isDemo: true, brand: 'service' },
        { id: 'p-7', name: 'Avto Motor Moyini Almashtirish', price: 45000, costPrice: 10000, stockQty: 999, categoryId: 'cat-1', barcode: '4784007', isDemo: true, brand: 'service' },
        { id: 'p-8', name: 'Konditsioner Tozalash & Zapravka', price: 150000, costPrice: 50000, stockQty: 999, categoryId: 'cat-3', barcode: '4784008', isDemo: true, brand: 'service' },
        { id: 'p-9', name: 'Gilam Yuvish (1 kv.m)', price: 15000, costPrice: 5000, stockQty: 999, categoryId: 'cat-2', barcode: '4784009', isDemo: true, brand: 'service' },
        { id: 'p-10', name: 'Xonadon Tozalash (General)', price: 350000, costPrice: 100000, stockQty: 999, categoryId: 'cat-2', barcode: '4784010', isDemo: true, brand: 'service' },
        { id: 'p-11', name: 'Kiyim Kimyoviy Tozalash (Kostyum)', price: 65000, costPrice: 20000, stockQty: 999, categoryId: 'cat-2', barcode: '4784011', isDemo: true, brand: 'service' },
        { id: 'p-12', name: 'Santexnika Xizmati (Chaqiruv)', price: 90000, costPrice: 15000, stockQty: 999, categoryId: 'cat-3', barcode: '4784012', isDemo: true, brand: 'service' },
        { id: 'p-13', name: 'Elektr Montaj Ishlari', price: 110000, costPrice: 20000, stockQty: 999, categoryId: 'cat-3', barcode: '4784013', isDemo: true, brand: 'service' },
        { id: 'p-14', name: 'Kamera & Domofon O\'rnatish', price: 220000, costPrice: 60000, stockQty: 999, categoryId: 'cat-3', barcode: '4784014', isDemo: true, brand: 'service' },
        { id: 'p-15', name: 'Yuk Tashish Xizmati (1 soat)', price: 120000, costPrice: 40000, stockQty: 999, categoryId: 'cat-2', barcode: '4784015', isDemo: true, brand: 'service' },
      ];
    } else {
      // Default: Supermarket / Magazin
      demoCats = [
        { id: 'cat-1', name: 'Ichimliklar', code: 'ICH' },
        { id: 'cat-2', name: 'Oziq-ovqat', code: 'OZ' },
        { id: 'cat-3', name: 'Shirinliklar', code: 'SHIR' },
        { id: 'cat-4', name: 'Xo\'jalik mollari', code: 'XM' },
      ];
      demoProds = [
        { id: 'p-1', name: 'Coca-Cola 1.5L', price: 14000, costPrice: 11000, stockQty: 48, categoryId: 'cat-1', barcode: '4783001', isDemo: true },
        { id: 'p-2', name: 'Tandir Non (Issiq)', price: 4000, costPrice: 2800, stockQty: 150, categoryId: 'cat-2', barcode: '4783002', isDemo: true },
        { id: 'p-3', name: 'Oshiq Yog\'i 1L', price: 21000, costPrice: 17500, stockQty: 60, categoryId: 'cat-2', barcode: '4783003', isDemo: true },
        { id: 'p-4', name: 'Alpen Gold Shokolad', price: 16500, costPrice: 13000, stockQty: 35, categoryId: 'cat-3', barcode: '4783004', isDemo: true },
        { id: 'p-5', name: 'Guruch Alanga 1kg', price: 22000, costPrice: 18000, stockQty: 80, categoryId: 'cat-2', barcode: '4783005', isDemo: true },
        { id: 'p-6', name: 'Sut 3.2% 1L', price: 11000, costPrice: 8500, stockQty: 40, categoryId: 'cat-2', barcode: '4783006', isDemo: true },
        { id: 'p-7', name: 'Choco Pie pechene 12x', price: 24000, costPrice: 19000, stockQty: 28, categoryId: 'cat-3', barcode: '4783007', isDemo: true },
        { id: 'p-8', name: 'Jacobs Kofe 100g', price: 38000, costPrice: 31000, stockQty: 18, categoryId: 'cat-1', barcode: '4783008', isDemo: true },
        { id: 'p-9', name: 'Duru Sovun 4x', price: 18000, costPrice: 14000, stockQty: 45, categoryId: 'cat-4', barcode: '4783009', isDemo: true },
        { id: 'p-10', name: 'Dena Sharbat 1L', price: 13000, costPrice: 10000, stockQty: 55, categoryId: 'cat-1', barcode: '4783010', isDemo: true },
        { id: 'p-11', name: 'Pishloq Gollandskiy 1kg', price: 85000, costPrice: 70000, stockQty: 15, categoryId: 'cat-2', barcode: '4783011', isDemo: true },
        { id: 'p-12', name: 'Kolbasa Halol 500g', price: 34000, costPrice: 26000, stockQty: 22, categoryId: 'cat-2', barcode: '4783012', isDemo: true },
        { id: 'p-13', name: 'Selpak Salfetka', price: 7000, costPrice: 4800, stockQty: 90, categoryId: 'cat-4', barcode: '4783013', isDemo: true },
        { id: 'p-14', name: 'Makaron Makfa 500g', price: 9500, costPrice: 7200, stockQty: 75, categoryId: 'cat-2', barcode: '4783014', isDemo: true },
        { id: 'p-15', name: 'Tuxum 30talik (Yacheyka)', price: 42000, costPrice: 35000, stockQty: 20, categoryId: 'cat-2', barcode: '4783015', isDemo: true },
      ];
    }

    products.value = demoProds;
    categories.value = demoCats;
    customers.value = [
      { id: 'cust-1', name: 'Olim aka (Doimiy xaridor)', phone: '+998 90 123-45-67', balance: -340000, isDemo: true },
      { id: 'cust-2', name: 'Jamshid (Qo\'shni mahalla)', phone: '+998 93 987-65-43', balance: -150000, isDemo: true },
      { id: 'cust-3', name: 'Sarvar Qurilish Mollari', phone: '+998 97 555-44-33', balance: -1190000, isDemo: true },
    ];
    lastFetched.value['products'] = Date.now();
    lastFetched.value['categories'] = Date.now();
    lastFetched.value['customers'] = Date.now();
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
    fetchChartData,
    fetchInventory,
    fetchFinance,
    fetchCustomers,
    fetchSuppliers,
    fetchAppointments,
    fetchTables,
    invalidate,
    prefetchAll,
    clearAll,
    loadDemoData,
  };
});
