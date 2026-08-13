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

    <div v-else class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
      <!-- 1. Bugungi Savdo -->
      <div class="glass-card rounded-2xl p-4 flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Bugungi Savdo</span>
          <div class="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <DollarSign class="w-4 h-4" />
          </div>
        </div>
        <div class="mt-3">
          <h3 class="text-lg font-black text-slate-900 dark:text-white truncate">{{ formatCurrency(summary.todaySales) }}</h3>
          <p class="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">Yopilgan cheklar</p>
        </div>
      </div>

      <!-- 2. Bugungi Xarajat -->
      <div class="glass-card rounded-2xl p-4 flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Bugungi Xarajat</span>
          <div class="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <TrendingDown class="w-4 h-4" />
          </div>
        </div>
        <div class="mt-3">
          <h3 class="text-lg font-black text-slate-900 dark:text-white truncate">{{ formatCurrency(summary.todayExpenses) }}</h3>
          <p class="text-[10px] text-rose-600 dark:text-rose-400 font-medium mt-0.5">Operatsion xarajatlar</p>
        </div>
      </div>

      <!-- 3. Bugungi Sof Foyda -->
      <div class="glass-card rounded-2xl p-4 flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sof Foyda</span>
          <div class="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <TrendingUp class="w-4 h-4" />
          </div>
        </div>
        <div class="mt-3">
          <h3 class="text-lg font-black text-slate-900 dark:text-white truncate">{{ formatCurrency(summary.todayProfit) }}</h3>
          <p class="text-[10px] text-blue-600 dark:text-blue-400 font-medium mt-0.5">Savdo − COGS − Xarajat</p>
        </div>
      </div>

      <!-- 4. Buyurtmalar Soni -->
      <div class="glass-card rounded-2xl p-4 flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Buyurtmalar</span>
          <div class="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <ShoppingBag class="w-4 h-4" />
          </div>
        </div>
        <div class="mt-3">
          <h3 class="text-lg font-black text-slate-900 dark:text-white">{{ summary.todayOrdersCount }} ta</h3>
          <p class="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">Bugungi kassa tranzaksiyalari</p>
        </div>
      </div>

      <!-- 5. Ombor Qiymati -->
      <div class="glass-card rounded-2xl p-4 flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ombor Qiymati</span>
          <div class="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Boxes class="w-4 h-4" />
          </div>
        </div>
        <div class="mt-3">
          <h3 class="text-lg font-black text-slate-900 dark:text-white truncate">{{ formatCurrency(summary.totalInventoryValue) }}</h3>
          <p class="text-[10px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">Tannarx bo'yicha qoldiq</p>
        </div>
      </div>

      <!-- 6. Nasiyalar / Qarzlar -->
      <div class="glass-card rounded-2xl p-4 flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mijoz Qarzdorligi</span>
          <div class="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Users class="w-4 h-4" />
          </div>
        </div>
        <div class="mt-3">
          <h3 class="text-lg font-black text-slate-900 dark:text-white truncate">{{ formatCurrency(summary.totalCustomerDebt) }}</h3>
          <p class="text-[10px] text-purple-600 dark:text-purple-400 font-medium mt-0.5">Nasiya daftari</p>
        </div>
      </div>
    </div>

    <!-- Middle Section: Chart & Bestsellers / Alerts -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Sales Chart (2 cols) -->
      <div class="lg:col-span-2 glass-card rounded-2xl p-5">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="font-bold text-base text-slate-900 dark:text-white">Savdo va Foyda Dinamikasi</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Oxirgi 14 kunlik sotuvlar grafigi</p>
          </div>
        </div>

        <div class="h-64 flex items-end justify-between gap-1 pt-6 px-2">
          <div
            v-for="(item, idx) in chartData"
            :key="idx"
            class="flex-1 flex flex-col items-center group relative h-full justify-end"
          >
            <!-- Tooltip -->
            <div class="absolute -top-10 hidden group-hover:flex flex-col items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] p-1.5 rounded-lg text-slate-900 dark:text-white shadow-xl z-20 whitespace-nowrap">
              <span>{{ item.date }}</span>
              <span class="font-bold text-emerald-600 dark:text-emerald-400">{{ formatCurrency(item.sales) }}</span>
            </div>

            <!-- Bar -->
            <div
              class="w-full max-w-[24px] bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-md transition-all group-hover:opacity-80"
              :style="{ height: `${Math.max(8, (item.sales / maxChartValue) * 100)}%` }"
            ></div>
            <span class="text-[9px] text-slate-400 dark:text-slate-500 mt-2 rotate-45 truncate">{{ item.date.slice(5) }}</span>
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

const { formatCurrency } = useFormat();
const dataStore = useDataStore();

const loading = ref(false);
const topBestsellers = ref<any[]>([]);

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

const maxChartValue = computed(() => {
  if (chartData.value.length === 0) return 1;
  const max = Math.max(...chartData.value.map((c: any) => Number(c.sales) || 0));
  return max === 0 ? 100000 : max;
});

const loadDashboard = async (force = false) => {
  if (!dataStore.dashboardSummary) {
    loading.value = true;
  }
  try {
    const [dashRes, bestRes] = await Promise.all([
      dataStore.fetchDashboard(force),
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
