<template>
  <div class="glass-card rounded-2xl p-5">
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
          @click="$emit('changePeriod', period.days)"
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
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useFormat } from '../../../composables/useFormat';

const props = defineProps<{
  chartData: any[];
  chartLoading: boolean;
  selectedChartPeriod: number;
  chartPeriods: Array<{ days: number; label: string }>;
}>();

defineEmits<{
  (e: 'changePeriod', days: number): void;
}>();

const { formatCurrency } = useFormat();

const chartPeriodLabel = computed(() => {
  const found = props.chartPeriods.find(p => p.days === props.selectedChartPeriod);
  return found ? found.label : `${props.selectedChartPeriod} kun`;
});

const maxChartSalesValue = computed(() => {
  if (props.chartData.length === 0) return 1;
  const max = Math.max(...props.chartData.map((c: any) => Math.max(Number(c.sales) || 0, Number(c.profit) || 0)));
  return max === 0 ? 100000 : max;
});

const chartTotalSales = computed(() => {
  return props.chartData.reduce((sum: number, c: any) => sum + (Number(c.sales) || 0), 0);
});

const chartTotalProfit = computed(() => {
  return props.chartData.reduce((sum: number, c: any) => sum + (Number(c.profit) || 0), 0);
});

const chartTotalOrders = computed(() => {
  return props.chartData.reduce((sum: number, c: any) => sum + (Number(c.count) || 0), 0);
});

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
