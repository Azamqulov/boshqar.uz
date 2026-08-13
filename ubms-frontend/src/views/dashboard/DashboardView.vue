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

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-3.5">
      <AppStatCard
        title="Bugungi Savdo"
        :value="formatCurrency(summary.todaySales)"
        subtitle="Yopilgan cheklar"
        :icon="DollarSign"
        variant="emerald"
      />

      <AppStatCard
        title="Bugungi Xarajat"
        :value="formatCurrency(summary.todayExpenses)"
        subtitle="Operatsion xarajatlar"
        :icon="TrendingDown"
        variant="rose"
      />

      <AppStatCard
        title="Sof Foyda"
        :value="formatCurrency(summary.todayProfit)"
        subtitle="Savdo − COGS − Xarajat"
        :icon="TrendingUp"
        variant="blue"
      />

      <AppStatCard
        title="Buyurtmalar"
        :value="`${summary.todayOrdersCount} ta`"
        subtitle="Bugungi kassa tranzaksiyalari"
        :icon="ShoppingBag"
        variant="purple"
      />

      <AppStatCard
        title="Ombor Qiymati"
        :value="formatCurrency(summary.totalInventoryValue)"
        subtitle="Tannarx bo'yicha qoldiq"
        :icon="Boxes"
        variant="amber"
      />

      <AppStatCard
        title="Mijoz Qarzdorligi"
        :value="formatCurrency(summary.totalCustomerDebt)"
        subtitle="Nasiya daftari"
        :icon="Users"
        variant="indigo"
      />
    </div>

    <!-- Middle Section: Chart & Bestsellers / Alerts -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Sales Chart (2 cols) -->
      <div class="lg:col-span-2 glass-card rounded-2xl p-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 class="font-bold text-base text-slate-900 dark:text-white">Savdo va Foyda Dinamikasi</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Oxirgi {{ chartPeriodLabel }} — sotuvlar va sof foyda grafigi
            </p>
          </div>

          <!-- Period Filter Tabs -->
          <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            <button
              v-for="period in chartPeriods"
              :key="period.days"
              @click="changeChartPeriod(period.days)"
              class="px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition whitespace-nowrap"
              :class="[
                selectedChartPeriod === period.days
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              ]"
            >
              {{ period.label }}
            </button>
          </div>
        </div>

        <!-- Period Totals Summary (mini KPIs) -->
        <div class="grid grid-cols-3 gap-2.5 mb-4">
          <div class="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
            <span class="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Jami Savdo</span>
            <p class="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{{ formatCurrency(chartTotalSales) }}</p>
          </div>
          <div class="p-2.5 rounded-xl bg-blue-500/5 border border-blue-500/10">
            <span class="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Sof Foyda</span>
            <p class="text-sm font-black text-blue-600 dark:text-blue-400 mt-0.5">{{ formatCurrency(chartTotalProfit) }}</p>
          </div>
          <div class="p-2.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
            <span class="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Buyurtmalar</span>
            <p class="text-sm font-black text-indigo-600 dark:text-indigo-400 mt-0.5">{{ chartTotalOrders }} ta</p>
          </div>
        </div>

        <!-- Chart Legend -->
        <div class="flex items-center gap-4 mb-3 px-1">
          <div class="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            <span class="w-2.5 h-2.5 rounded-sm bg-gradient-to-t from-emerald-600 to-teal-400 inline-block"></span>
            Savdo
          </div>
          <div class="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            <span class="w-2.5 h-2.5 rounded-sm bg-gradient-to-t from-blue-600 to-sky-400 inline-block"></span>
            Sof Foyda
          </div>
        </div>

        <!-- Chart Loading State -->
        <div v-if="chartLoading" class="h-64 flex items-center justify-center">
          <div class="flex items-center gap-2 text-xs text-slate-400">
            <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Grafik ma'lumotlari yuklanmoqda...
          </div>
        </div>

        <!-- Dual Bar Chart -->
        <div v-else class="h-64 flex items-end gap-1 pt-12 px-2 relative overflow-visible">
          <div
            v-for="(item, idx) in chartData"
            :key="idx"
            class="flex-1 flex flex-col items-center group relative h-full justify-end"
          >
            <!-- Tooltip with Boundary Clamping -->
            <div
              class="absolute -top-14 hidden group-hover:flex flex-col bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md border border-slate-700/80 text-[10px] p-2.5 rounded-xl text-white shadow-2xl z-30 whitespace-nowrap gap-0.5 pointer-events-none transition-all"
              :class="[
                idx >= chartData.length - 2
                  ? 'right-0 items-end'
                  : idx <= 1
                  ? 'left-0 items-start'
                  : 'left-1/2 -translate-x-1/2 items-center'
              ]"
            >
              <span class="font-bold text-slate-300">{{ formatChartDate(item.date) }}</span>
              <span class="text-emerald-400 font-black">Savdo: {{ formatCurrency(item.sales) }}</span>
              <span class="text-sky-400 font-bold">Foyda: {{ formatCurrency(item.profit) }}</span>
              <span class="text-slate-400 text-[9px]">{{ item.count || 0 }} ta chek</span>
            </div>

            <!-- Dual Bars Container -->
            <div class="w-full flex items-end justify-center gap-[3px] h-full pb-1">
              <!-- Sales Bar -->
              <div
                class="flex-1 max-w-[14px] bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-md transition-all duration-300 group-hover:brightness-110"
                :style="{ height: `${Math.max(4, (item.sales / maxChartSalesValue) * 100)}%` }"
              ></div>
              <!-- Profit Bar -->
              <div
                class="flex-1 max-w-[14px] bg-gradient-to-t from-blue-600 to-sky-400 rounded-t-md transition-all duration-300 group-hover:brightness-110"
                :style="{ height: `${Math.max(4, ((item.profit || 0) / maxChartSalesValue) * 100)}%` }"
              ></div>
            </div>

            <!-- Date Labels -->
            <span
              class="text-[9px] text-slate-400 dark:text-slate-500 mt-1 truncate"
              :class="{ 'font-black text-emerald-600 dark:text-emerald-400': isToday(item.date) }"
              :style="{ transform: chartData.length > 20 ? 'rotate(45deg)' : 'none', transformOrigin: 'left top' }"
            >
              {{ formatChartDateShort(item.date) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Top Bestsellers Widget (1 col) -->
      <div class="glass-card rounded-2xl p-5 flex flex-col justify-between space-y-4">
        <div>
          <div class="flex items-center justify-between mb-3 border-b border-slate-200 dark:border-slate-800 pb-2.5">
            <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Flame class="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Eng Ko'p Sotilganlar (Trend)</span>
            </h3>
            <span class="text-[10px] text-slate-400">30 kunlik</span>
          </div>

          <div v-if="topBestsellers.length === 0" class="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
            Hozircha sotuvlar mavjud emas
          </div>

          <div v-else class="space-y-2.5">
            <div
              v-for="(item, idx) in topBestsellers"
              :key="item.id"
              class="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs"
            >
              <div class="flex items-center gap-2.5 truncate">
                <span
                  class="w-5 h-5 rounded-lg flex items-center justify-center font-black text-[10px]"
                  :class="[
                    idx === 0
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : idx === 1
                      ? 'bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                      : idx === 2
                      ? 'bg-amber-700 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  ]"
                >
                  {{ idx + 1 }}
                </span>
                <div class="truncate">
                  <h5 class="font-bold text-slate-900 dark:text-white truncate">{{ item.name }}</h5>
                  <span class="text-[10px] text-slate-400">{{ formatCurrency(item.salePrice) }}</span>
                </div>
              </div>

              <div class="text-right flex-shrink-0 pl-2">
                <span class="font-black text-emerald-600 dark:text-emerald-400 block">{{ item.soldCount30d || 0 }} ta</span>
                <span class="text-[9px] text-slate-400">{{ formatCurrency(item.salesTotal30d || 0) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="pt-2 border-t border-slate-200 dark:border-slate-800">
          <router-link
            to="/products"
            class="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition flex items-center justify-center space-x-1.5"
          >
            <span>Barcha Mahsulotlarni Ko'rish →</span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Bottom Alerts Section -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start space-x-3">
        <Boxes class="w-5 h-5 text-amber-500 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <div class="flex-1">
          <h4 class="text-xs font-bold text-amber-700 dark:text-amber-300">Kam qolgan tovarlar</h4>
          <p class="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
            Omborda <span class="font-bold text-slate-900 dark:text-white">{{ summary.lowStockItemsCount }} ta</span> mahsulot minimal me'yordan kam qoldi.
          </p>
          <router-link to="/inventory" class="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold mt-1.5 inline-block">
            Omborga kirim qilish →
          </router-link>
        </div>
      </div>

      <div class="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-start space-x-3">
        <Users class="w-5 h-5 text-purple-500 dark:text-purple-400 mt-0.5 flex-shrink-0" />
        <div class="flex-1">
          <h4 class="text-xs font-bold text-purple-700 dark:text-purple-300">Mijozlar qarzdorligi (Nasiya)</h4>
          <p class="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
            Jami nasiya summasi: <span class="font-bold text-slate-900 dark:text-white">{{ formatCurrency(summary.totalCustomerDebt) }}</span>
          </p>
          <router-link to="/customers" class="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold mt-1.5 inline-block">
            Mijozlar ro'yxati va qarz yopish →
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import api from '../../services/api';
import { useFormat } from '../../composables/useFormat';
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  ShoppingBag,
  Boxes,
  Users,
  AlertTriangle,
  ShoppingCart,
  Flame,
} from 'lucide-vue-next';

import { useDataStore } from '../../stores/data.store';
import SkeletonLoader from '../../components/SkeletonLoader.vue';
import AppStatCard from '../../components/AppStatCard.vue';

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
  { days: 180, label: '6 oy' },
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

const changeChartPeriod = async (days: number) => {
  selectedChartPeriod.value = days;
  localStorage.setItem('dashboard_sales_period', String(days));
  chartLoading.value = true;
  try {
    await dataStore.fetchChartData(days);
  } finally {
    chartLoading.value = false;
  }
};

const loadDashboard = async (force = false) => {
  if (!dataStore.dashboardSummary) {
    loading.value = true;
  }
  try {
    const [dashRes, bestRes] = await Promise.all([
      dataStore.fetchDashboard(force, selectedChartPeriod.value),
      api.get('/products/bestsellers?limit=5&period=30d').catch(() => ({ data: [] })),
    ]);
    topBestsellers.value = bestRes.data || [];
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

