<template>
  <div class="space-y-6">
    <!-- Top Welcome & Quick Actions -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Boshqaruv Paneli</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Bugungi operatsion ko'rsatkichlar va asosiy tahlil</p>
      </div>

      <div class="flex items-center space-x-2.5">
        <router-link
          to="/pos"
          class="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition btn-interactive"
        >
          <ShoppingCart class="w-4 h-4" />
          <span>Kassaga O'tish</span>
        </router-link>
      </div>
    </div>

    <!-- KPI Summary Grid (6 Cards) -->
    <SkeletonLoader v-if="loading" variant="kpi" />
    <DashboardKpiGrid v-else :summary="summary" />

    <!-- Middle Section: Chart & Bestsellers -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <DashboardSalesChart
        class="lg:col-span-2"
        :chart-data="chartData"
        :chart-loading="chartLoading"
        :selected-chart-period="selectedChartPeriod"
        :chart-periods="chartPeriods"
        @change-period="changeChartPeriod"
      />

      <DashboardBestsellers :top-bestsellers="topBestsellers" :period-days="selectedChartPeriod" />
    </div>

    <!-- Bottom Alerts Section -->
    <DashboardAlerts :summary="summary" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import api from '../../services/api';
import { ShoppingCart } from 'lucide-vue-next';
import { useDataStore } from '../../stores/data.store';
import { useFormat } from '../../composables/useFormat';
import SkeletonLoader from '../../components/SkeletonLoader.vue';

import DashboardKpiGrid from './components/DashboardKpiGrid.vue';
import DashboardSalesChart from './components/DashboardSalesChart.vue';
import DashboardBestsellers from './components/DashboardBestsellers.vue';
import DashboardAlerts from './components/DashboardAlerts.vue';

const { formatCurrency } = useFormat();
const dataStore = useDataStore();

const loading = ref(false);
const chartLoading = ref(false);
const topBestsellers = ref<any[]>([]);

// Chart period state with localStorage persistence
const savedPeriod = localStorage.getItem('dashboard_sales_period');
const selectedChartPeriod = ref(savedPeriod ? Number(savedPeriod) : 14);
const chartPeriods = [
  { days: 7, label: '7 kun' },
  { days: 14, label: '14 kun' },
  { days: 30, label: '30 kun' },
  { days: 90, label: '3 oy' },
];

const defaultSummary = {
  todaySales: 0,
  todayExpenses: 0,
  todayProfit: 0,
  todayOrdersCount: 0,
  newCustomersCount: 0,
  totalInventoryValue: 0,
  lowStockItemsCount: 0,
  totalCustomerDebt: 0,
  totalSupplierDebt: 0,
};

const summary = computed(() => dataStore.dashboardSummary || defaultSummary);
const chartData = computed(() => dataStore.dashboardCharts || []);

const chartPeriodLabel = computed(() => {
  const found = chartPeriods.find(p => p.days === selectedChartPeriod.value);
  return found ? found.label : `${selectedChartPeriod.value} kun`;
});

const maxChartSalesValue = computed(() => {
  if (chartData.value.length === 0) return 1;
  const max = Math.max(...chartData.value.map((c: any) => Math.max(Number(c.sales) || 0, Number(c.profit) || 0)));
  return max === 0 ? 100000 : max;
});

const chartTotalSales = computed(() => {
  return chartData.value.reduce((sum: number, c: any) => sum + (Number(c.sales) || 0), 0);
});

const chartTotalProfit = computed(() => {
  return chartData.value.reduce((sum: number, c: any) => sum + (Number(c.profit) || 0), 0);
});

const chartTotalOrders = computed(() => {
  return chartData.value.reduce((sum: number, c: any) => sum + (Number(c.count) || 0), 0);
});

// Date formatting helpers
const formatChartDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const months = ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek'];
  return `${d.getDate()}-${months[d.getMonth()]}`;
};

const formatChartDateShort = (dateStr: string) => {
  const d = new Date(dateStr);
  const months = ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek'];
  if (selectedChartPeriod.value <= 30) {
    return `${d.getDate()}/${d.getMonth() + 1}`;
  }
  return `${d.getDate()}-${months[d.getMonth()]}`;
};

const isToday = (dateStr: string) => {
  const today = new Date().toISOString().split('T')[0];
  return dateStr === today;
};

const bestsellersLoading = ref(false);

const fetchBestsellers = async (days: number) => {
  bestsellersLoading.value = true;
  try {
    const period = days <= 7 ? '7d' : days <= 14 ? '14d' : days <= 30 ? '30d' : '90d';
    const res = await api.get(`/products/bestsellers?limit=5&period=${period}`).catch(() => ({ data: [] }));
    topBestsellers.value = res.data || [];
  } finally {
    bestsellersLoading.value = false;
  }
};

const changeChartPeriod = async (days: number) => {
  selectedChartPeriod.value = days;
  localStorage.setItem('dashboard_sales_period', String(days));
  chartLoading.value = true;
  try {
    await Promise.all([
      dataStore.fetchChartData(days),
      fetchBestsellers(days),
    ]);
  } finally {
    chartLoading.value = false;
  }
};

const loadDashboard = async (force = false) => {
  if (!dataStore.dashboardSummary) {
    loading.value = true;
  }
  try {
    const period = selectedChartPeriod.value <= 7 ? '7d' : selectedChartPeriod.value <= 14 ? '14d' : selectedChartPeriod.value <= 30 ? '30d' : '90d';
    await Promise.all([
      dataStore.fetchDashboard(force, selectedChartPeriod.value),
      fetchBestsellers(selectedChartPeriod.value),
    ]);
  } catch (err) {
    console.error('Failed to load dashboard data', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadDashboard();
});
</script>

