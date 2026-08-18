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
    <div class="relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <BrainCircuit class="w-4 h-4" />
          </div>
          <div>
            <h3 class="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>Sun'iy Intellekt (AI) Tahlillari va Bashorati</span>
              <span class="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-600 dark:text-amber-300 text-[10px] font-black uppercase">PRO</span>
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Raqobatchilarda yo'q chuqur savdo va kamomad tahlili</p>
          </div>
        </div>
      </div>

      <!-- Content Grid (Simulated Live Data) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 filter" :class="{ 'blur-[6px] select-none pointer-events-none': authStore.isDemo }">
        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 space-y-2">
          <div class="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>ABC Tahlil (A-Group)</span>
            <span class="text-emerald-500">82% daromad</span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400">Top 5 ta tovar jami daromadning asosiy qismini bermoqda. Zaxirasini 20% ga oshirish tavsiya etiladi.</p>
        </div>

        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 space-y-2">
          <div class="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>Dead-Stock (Muzlagan Pul)</span>
            <span class="text-amber-500">3,420,000 UZS</span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400">4 ta mahsulot 45 kundan beri sotilmagan. Chegirma bilan pullash tavsiya etiladi.</p>
        </div>

        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 space-y-2">
          <div class="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>Telegram Bot Monitoringi</span>
            <span class="text-purple-500">Faol</span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400">Har kuni soat 22:00 da xo'jayin Telegramiga kassa auditi va qarz hisoboti avtomatik yuboriladi.</p>
        </div>
      </div>

      <!-- BLUR OVERLAY FOR DEMO MODE -->
      <div
        v-if="authStore.isDemo"
        @click="openProModal"
        class="absolute inset-0 bg-slate-950/40 backdrop-blur-[4px] flex flex-col items-center justify-center p-6 text-center cursor-pointer group transition-all"
      >
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20 mb-3 group-hover:scale-110 transition-transform">
          <Lock class="w-6 h-6" />
        </div>
        <h4 class="text-base sm:text-lg font-black text-white leading-tight">
          Sun'iy Intellekt Tahlillari Faqat PRO Tarifda Ochiq!
        </h4>
        <p class="text-xs text-slate-200 max-w-md mt-1 mb-3">
          Muzlagan pulni aniqlash, AI savdo bashorati va Telegram avtomatlashtirishni yoqish uchun 14 kunlik bepul sinovga o'ting.
        </p>
        <button
          type="button"
          class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition"
        >
          <Sparkles class="w-4 h-4" />
          <span>14 Kun Bepul Sinash & Funksiyalarni Ochish</span>
        </button>
      </div>
    </div>

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
import { ShoppingCart, BrainCircuit, Lock, Sparkles } from 'lucide-vue-next';
import { useDataStore } from '../../stores/data.store';
import { useAuthStore } from '../../stores/auth.store';
import { useFormat } from '../../composables/useFormat';
import SkeletonLoader from '../../components/SkeletonLoader.vue';
import ProUpgradeModal from '../../components/ProUpgradeModal.vue';

import DashboardKpiGrid from './components/DashboardKpiGrid.vue';
import DashboardSalesChart from './components/DashboardSalesChart.vue';
import DashboardBestsellers from './components/DashboardBestsellers.vue';
import DashboardAlerts from './components/DashboardAlerts.vue';

const { formatCurrency } = useFormat();
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

