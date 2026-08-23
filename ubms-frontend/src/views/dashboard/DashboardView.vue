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

    <!-- AI SMART ANALYTICS & PREDICTIONS (PRO FEATURE / BLUR PAYWALL IN DEMO) -->
    <DashboardAiSmartCard
      :is-demo="authStore.isDemo"
      @open-pro="openProModal"
    />

    <!-- Bottom Alerts Section -->
    <DashboardAlerts :summary="summary" />

    <!-- PRO UPGRADE MODAL -->
    <ProUpgradeModal
      :is-open="showProModal"
      title="Sun'iy Intellekt & Eksklyuziv Imkoniyatlar!"
      subtitle="Barcha AI bashoratlari, Telegram bot avtomatizatsiyasi va cheksiz tovarlar faqat PRO tarifda."
      feature-title="AI & Telegram Eksklyuziv"
      @close="showProModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import api from '../../services/api';
import { ShoppingCart } from 'lucide-vue-next';
import { useDataStore } from '../../stores/data.store';
import { useAuthStore } from '../../stores/auth.store';
import SkeletonLoader from '../../components/SkeletonLoader.vue';
import ProUpgradeModal from '../../components/ProUpgradeModal.vue';

import DashboardKpiGrid from './components/DashboardKpiGrid.vue';
import DashboardSalesChart from './components/DashboardSalesChart.vue';
import DashboardBestsellers from './components/DashboardBestsellers.vue';
import DashboardAiSmartCard from './components/DashboardAiSmartCard.vue';
import DashboardAlerts from './components/DashboardAlerts.vue';

const dataStore = useDataStore();
const authStore = useAuthStore();

const loading = ref(false);
const chartLoading = ref(false);
const showProModal = ref(false);
const topBestsellers = ref<any[]>([]);

const openProModal = () => {
  showProModal.value = true;
};

// Chart period state with localStorage persistence
const savedPeriod = localStorage.getItem('dashboard_sales_period');
const selectedChartPeriod = ref(savedPeriod ? Number(savedPeriod) : 7);
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
      dataStore.fetchChartData(days, true),
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
