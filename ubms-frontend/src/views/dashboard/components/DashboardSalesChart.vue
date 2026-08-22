<template>
  <div class="glass-card rounded-2xl p-5 relative overflow-hidden">
    <!-- Top Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
      <div>
        <div class="flex items-center gap-2">
          <h3 class="font-bold text-base text-slate-900 dark:text-white">Savdo va Foyda Dinamikasi</h3>
          <span
            v-if="selectedDay"
            class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white animate-pulse shadow-sm"
          >
            ● {{ formatChartDate(selectedDay.date) }}
          </span>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Oxirgi {{ chartPeriodLabel }} — ustun ustiga bosib <span class="text-emerald-500 font-semibold">kunlik taqsimotni</span> ko'ring
        </p>
      </div>

      <!-- Period Filter Tabs -->
      <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
        <button
          v-for="period in chartPeriods"
          :key="period.days"
          @click="selectPeriod(period.days)"
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

    <!-- Period Totals Summary (default) or INLINE ON-SPOT CARD (when day clicked) -->
    <transition name="fade-slide" mode="out-in">
      <!-- 1. KUNLIK SAVDO VA FOYDA DOIRAVIY BLOKI (Faqat Savdo va Sof Foyda) -->
      <div
        v-if="selectedDay"
        key="inline-breakdown"
        class="mb-4 p-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-blue-500/10 border border-emerald-500/20 backdrop-blur-sm relative"
      >
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <!-- Doiraviy (Donut) Ko'rinish -->
          <div class="flex items-center gap-3 w-full sm:w-auto">
            <div class="relative w-16 h-16 flex-shrink-0">
              <svg viewBox="0 0 100 100" class="w-full h-full transform -rotate-90">
                <!-- Savdo Aylana (Asos) -->
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  pathLength="100"
                  fill="transparent"
                  stroke="#10B981"
                  stroke-width="16"
                  class="opacity-30 dark:opacity-40"
                />
                <!-- Sof Foyda Segmenti -->
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  pathLength="100"
                  fill="transparent"
                  stroke="#3B82F6"
                  stroke-width="16"
                  :stroke-dasharray="`${dayProfitPercent} ${100 - dayProfitPercent}`"
                  class="transition-all duration-700 ease-out"
                />
              </svg>
              <!-- Markaziy Foiz -->
              <div class="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span class="text-xs font-black text-blue-600 dark:text-blue-400 leading-none">
                  {{ dayProfitPercent }}%
                </span>
                <span class="text-[8px] text-slate-400 font-bold uppercase mt-0.5">Foyda</span>
              </div>
            </div>

            <div>
              <div class="flex items-center gap-1.5">
                <span class="text-xs font-black text-slate-900 dark:text-white">
                  {{ formatFullDate(selectedDay.date) }}
                </span>
                <span
                  v-if="isToday(selectedDay.date)"
                  class="px-1.5 py-0.2 text-[9px] font-extrabold rounded-md bg-emerald-500 text-white"
                >
                  Bugun
                </span>
              </div>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">Kunlik taqsimot</p>
            </div>
          </div>

          <!-- Faqat 2 ta Karta: Savdo va Sof Foyda -->
          <div class="grid grid-cols-2 gap-2.5 w-full sm:w-auto flex-1 max-w-sm">
            <!-- Savdo -->
            <div class="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-emerald-500/20 shadow-sm">
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-sm bg-gradient-to-t from-emerald-600 to-teal-400"></span>
                <span class="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Savdo</span>
              </div>
              <p class="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                {{ formatCurrency(selectedDay.sales || 0) }}
              </p>
            </div>

            <!-- Sof Foyda -->
            <div class="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-blue-500/20 shadow-sm">
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-sm bg-gradient-to-t from-blue-600 to-sky-400"></span>
                <span class="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Sof Foyda</span>
              </div>
              <p class="text-sm font-black text-blue-600 dark:text-blue-400 mt-0.5">
                {{ formatCurrency(selectedDay.profit || 0) }}
              </p>
            </div>
          </div>

          <!-- Yopish tugmasi -->
          <button
            @click="selectedDay = null"
            class="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition flex-shrink-0"
            title="Yopish"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- 2. DEFAULT PERIOD SUMMARY (Hech qaysi kun tanlanmaganda) -->
      <div v-else key="period-summary" class="grid grid-cols-3 gap-2.5 mb-4">
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
    </transition>

    <!-- Chart Legend & Tap Hint -->
    <div class="flex items-center justify-between mb-3 px-1">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
          <span class="w-2.5 h-2.5 rounded-sm bg-gradient-to-t from-emerald-600 to-teal-400 inline-block"></span>
          Savdo
        </div>
        <div class="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
          <span class="w-2.5 h-2.5 rounded-sm bg-gradient-to-t from-blue-600 to-sky-400 inline-block"></span>
          Sof Foyda
        </div>
      </div>
      <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
        <MousePointerClick class="w-3 h-3" />
        <span>Kun ustiga bosing</span>
      </span>
    </div>

    <!-- Chart Loading State -->
    <div v-if="chartLoading" class="h-60 flex items-center justify-center">
      <div class="flex items-center gap-2 text-xs text-slate-400">
        <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Grafik ma'lumotlari yuklanmoqda...
      </div>
    </div>

    <!-- Dual Bar Chart -->
    <div v-else class="h-60 flex items-end gap-1.5 sm:gap-2 pt-8 px-2 relative overflow-visible">
      <div
        v-for="(item, idx) in displayChartData"
        :key="idx"
        @click="toggleDaySelection(item)"
        class="flex-1 flex flex-col items-center group relative h-full justify-end cursor-pointer p-0.5 rounded-xl transition-all duration-200"
        :class="[
          selectedDay?.date === item.date
            ? 'bg-emerald-500/15 dark:bg-emerald-500/20 ring-2 ring-emerald-500/50 shadow-md'
            : 'hover:bg-slate-100 dark:hover:bg-slate-800/60'
        ]"
      >
        <!-- Tooltip with Boundary Clamping -->
        <div
          class="absolute -top-14 hidden group-hover:flex flex-col bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md border border-slate-700/80 text-[10px] p-2 rounded-xl text-white shadow-2xl z-30 whitespace-nowrap gap-0.5 pointer-events-none transition-all"
          :class="[
            idx >= displayChartData.length - 2
              ? 'right-0 items-end'
              : idx <= 1
              ? 'left-0 items-start'
              : 'left-1/2 -translate-x-1/2 items-center'
          ]"
        >
          <span class="font-bold text-slate-300">{{ formatChartDate(item.date) }}</span>
          <span class="text-emerald-400 font-black">Savdo: {{ formatCurrency(item.sales) }}</span>
          <span class="text-sky-400 font-bold">Foyda: {{ formatCurrency(item.profit) }}</span>
        </div>

        <!-- Dual Bars Container -->
        <div class="w-full flex items-end justify-center gap-[3px] h-full pb-1">
          <!-- Sales Bar -->
          <div
            class="flex-1 bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-md transition-all duration-300 group-hover:brightness-125 group-hover:scale-y-[1.03] origin-bottom shadow-sm"
            :class="[
              { 'brightness-125 ring-1 ring-emerald-400': selectedDay?.date === item.date },
              barMaxWidthClass
            ]"
            :style="{ height: `${Math.max(4, (item.sales / maxChartSalesValue) * 100)}%` }"
          ></div>
          <!-- Profit Bar -->
          <div
            class="flex-1 bg-gradient-to-t from-blue-600 to-sky-400 rounded-t-md transition-all duration-300 group-hover:brightness-125 group-hover:scale-y-[1.03] origin-bottom shadow-sm"
            :class="[
              { 'brightness-125 ring-1 ring-blue-400': selectedDay?.date === item.date },
              barMaxWidthClass
            ]"
            :style="{ height: `${Math.max(4, ((item.profit || 0) / maxChartSalesValue) * 100)}%` }"
          ></div>
        </div>

        <!-- Date Labels -->
        <span
          class="text-[9px] mt-1 truncate transition-colors font-medium text-center"
          :class="[
            selectedDay?.date === item.date
              ? 'font-black text-emerald-600 dark:text-emerald-400 scale-105'
              : isToday(item.date)
              ? 'font-black text-emerald-600 dark:text-emerald-400'
              : 'text-slate-400 dark:text-slate-500 group-hover:text-emerald-500'
          ]"
          :style="{ transform: displayChartData.length > 20 ? 'rotate(45deg)' : 'none', transformOrigin: 'left top' }"
        >
          {{ formatChartDateShort(item.date) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { X, MousePointerClick } from 'lucide-vue-next';
import { useFormat } from '../../../composables/useFormat';

const props = defineProps<{
  chartData: any[];
  chartLoading: boolean;
  selectedChartPeriod: number;
  chartPeriods: Array<{ days: number; label: string }>;
}>();

const emit = defineEmits<{
  (e: 'changePeriod', days: number): void;
}>();

const { formatCurrency } = useFormat();

const selectedDay = ref<any | null>(null);

const selectPeriod = (days: number) => {
  selectedDay.value = null;
  emit('changePeriod', days);
};

const toggleDaySelection = (item: any) => {
  if (selectedDay.value?.date === item.date) {
    selectedDay.value = null;
  } else {
    selectedDay.value = item;
  }
};

const chartPeriodLabel = computed(() => {
  const found = props.chartPeriods.find(p => p.days === props.selectedChartPeriod);
  return found ? found.label : `${props.selectedChartPeriod} kun`;
});

// Strictly slice chart data to match the selected period
const displayChartData = computed(() => {
  const data = props.chartData || [];
  if (data.length <= props.selectedChartPeriod) {
    return data;
  }
  return data.slice(-props.selectedChartPeriod);
});

const barMaxWidthClass = computed(() => {
  const len = displayChartData.value.length;
  if (len <= 7) return 'max-w-[24px]';
  if (len <= 14) return 'max-w-[16px]';
  if (len <= 30) return 'max-w-[10px]';
  return 'max-w-[6px]';
});

const maxChartSalesValue = computed(() => {
  if (displayChartData.value.length === 0) return 1;
  const max = Math.max(...displayChartData.value.map((c: any) => Math.max(Number(c.sales) || 0, Number(c.profit) || 0)));
  return max === 0 ? 100000 : max;
});

const chartTotalSales = computed(() => {
  return displayChartData.value.reduce((sum: number, c: any) => sum + (Number(c.sales) || 0), 0);
});

const chartTotalProfit = computed(() => {
  return displayChartData.value.reduce((sum: number, c: any) => sum + (Number(c.profit) || 0), 0);
});

const chartTotalOrders = computed(() => {
  return displayChartData.value.reduce((sum: number, c: any) => sum + (Number(c.count) || 0), 0);
});

// Profit percentage and SVG Donut length (circumference = 2 * PI * 38 ≈ 238.76)
const CIRCUMFERENCE = 238.76;

const dayProfitPercent = computed(() => {
  if (!selectedDay.value || !selectedDay.value.sales || selectedDay.value.sales === 0) return 0;
  return Math.min(100, Math.max(0, Math.round(((selectedDay.value.profit || 0) / selectedDay.value.sales) * 100)));
});

const profitDashLength = computed(() => {
  return (dayProfitPercent.value / 100) * CIRCUMFERENCE;
});

const formatFullDate = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const months = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'];
  return `${d.getDate()}-${months[d.getMonth()]}`;
};

const formatChartDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const months = ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek'];
  return `${d.getDate()}-${months[d.getMonth()]}`;
};

const formatChartDateShort = (dateStr: string) => {
  const d = new Date(dateStr);
  const months = ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek'];
  if (props.selectedChartPeriod <= 30) {
    return `${d.getDate()}/${d.getMonth() + 1}`;
  }
  return `${d.getDate()}-${months[d.getMonth()]}`;
};

const isToday = (dateStr: string) => {
  const today = new Date().toISOString().split('T')[0];
  return dateStr === today;
};
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-6px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
