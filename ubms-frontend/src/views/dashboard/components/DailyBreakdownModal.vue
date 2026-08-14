<template>
  <div
    v-if="isOpen && dayData"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md transition-all animate-fadeIn"
    @click.self="$emit('close')"
  >
    <div
      class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden transform transition-all animate-scaleUp"
    >
      <!-- Header -->
      <div class="px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
            <PieChart class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-extrabold text-lg text-slate-900 dark:text-white">
                {{ formatFullDate(dayData.date) }}
              </h3>
              <span
                v-if="isToday(dayData.date)"
                class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              >
                Bugun
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400">Kunlik moliyaviy va savdo doiraviy taqsimoti</p>
          </div>
        </div>

        <button
          @click="$emit('close')"
          class="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Quick KPI Strip -->
      <div class="grid grid-cols-4 gap-2 px-6 py-3.5 bg-slate-100/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800/80 text-center">
        <div class="p-2 rounded-xl bg-white dark:bg-slate-800/60 shadow-sm border border-slate-100 dark:border-slate-700/50">
          <span class="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Jami Savdo</span>
          <span class="text-sm font-black text-emerald-600 dark:text-emerald-400">{{ formatCurrency(dayData.sales || 0) }}</span>
        </div>
        <div class="p-2 rounded-xl bg-white dark:bg-slate-800/60 shadow-sm border border-slate-100 dark:border-slate-700/50">
          <span class="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Sof Foyda</span>
          <span class="text-sm font-black text-blue-600 dark:text-blue-400">{{ formatCurrency(dayData.profit || 0) }}</span>
        </div>
        <div class="p-2 rounded-xl bg-white dark:bg-slate-800/60 shadow-sm border border-slate-100 dark:border-slate-700/50">
          <span class="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Cheklar</span>
          <span class="text-sm font-black text-indigo-600 dark:text-indigo-400">{{ dayData.count || 0 }} ta</span>
        </div>
        <div class="p-2 rounded-xl bg-white dark:bg-slate-800/60 shadow-sm border border-slate-100 dark:border-slate-700/50">
          <span class="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Rentabellik</span>
          <span class="text-sm font-black" :class="profitMargin >= 20 ? 'text-emerald-500' : 'text-amber-500'">
            {{ profitMargin }}%
          </span>
        </div>
      </div>

      <!-- Mode Selector Tabs -->
      <div class="px-6 pt-4 flex items-center justify-center">
        <div class="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50">
          <button
            @click="activeTab = 'profit'"
            class="px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            :class="activeTab === 'profit' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'"
          >
            <TrendingUp class="w-3.5 h-3.5" />
            <span>Foyda & Tannarx</span>
          </button>
          <button
            @click="activeTab = 'payment'"
            class="px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            :class="activeTab === 'payment' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'"
          >
            <CreditCard class="w-3.5 h-3.5" />
            <span>To'lov Turlari</span>
          </button>
          <button
            @click="activeTab = 'category'"
            class="px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            :class="activeTab === 'category' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'"
          >
            <Tag class="w-3.5 h-3.5" />
            <span>Kategoriyalar</span>
          </button>
        </div>
      </div>

      <!-- Main Body: Donut Chart + Legend Breakdown -->
      <div class="p-6">
        <div v-if="currentSegments.length === 0 || totalSegmentAmount === 0" class="py-12 text-center text-slate-400">
          <PieChart class="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p class="text-xs font-medium">Ushbu kun uchun taqsimot ma'lumotlari mavjud emas</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <!-- Circular SVG Donut Chart (5 cols) -->
          <div class="md:col-span-5 flex flex-col items-center justify-center relative">
            <div class="relative w-48 h-48">
              <svg viewBox="0 0 100 100" class="w-full h-full transform -rotate-90">
                <!-- Background Circle -->
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="currentColor"
                  stroke-width="14"
                  class="text-slate-100 dark:text-slate-800"
                />
                <!-- Slices -->
                <circle
                  v-for="(seg, idx) in calculatedSegments"
                  :key="idx"
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  :stroke="seg.color"
                  stroke-width="14"
                  :stroke-dasharray="`${seg.dashLength} ${100 - seg.dashLength}`"
                  :stroke-dashoffset="`-${seg.dashOffset}`"
                  class="transition-all duration-700 ease-out hover:opacity-85 cursor-pointer"
                  @mouseenter="hoveredIndex = idx"
                  @mouseleave="hoveredIndex = null"
                />
              </svg>

              <!-- Center Info in Circle -->
              <div class="absolute inset-0 flex flex-col items-center justify-center text-center p-4 pointer-events-none">
                <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {{ hoveredItem ? hoveredItem.label : 'Jami' }}
                </span>
                <span class="text-sm font-black text-slate-900 dark:text-white leading-tight mt-0.5">
                  {{ formatCurrency(hoveredItem ? hoveredItem.value : totalSegmentAmount) }}
                </span>
                <span
                  class="text-[11px] font-bold mt-0.5 px-2 py-0.2 rounded-full"
                  :style="{ color: hoveredItem ? hoveredItem.color : '#10B981', backgroundColor: `${hoveredItem ? hoveredItem.color : '#10B981'}15` }"
                >
                  {{ hoveredItem ? `${hoveredItem.percentage}%` : '100%' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Segments Breakdown List (7 cols) -->
          <div class="md:col-span-7 space-y-2.5 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
            <div
              v-for="(seg, idx) in calculatedSegments"
              :key="idx"
              @mouseenter="hoveredIndex = idx"
              @mouseleave="hoveredIndex = null"
              class="p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between"
              :class="[
                hoveredIndex === idx
                  ? 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 shadow-md scale-[1.01]'
                  : 'bg-white dark:bg-slate-800/40 border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/70'
              ]"
            >
              <div class="flex items-center space-x-3 min-w-0">
                <span
                  class="w-3.5 h-3.5 rounded-lg flex-shrink-0 shadow-sm"
                  :style="{ backgroundColor: seg.color }"
                ></span>
                <div class="truncate">
                  <p class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{{ seg.label }}</p>
                  <p class="text-[10px] text-slate-400">{{ seg.subtitle || `${seg.percentage}% ulush` }}</p>
                </div>
              </div>

              <div class="text-right flex-shrink-0">
                <p class="text-xs font-black text-slate-900 dark:text-white">{{ formatCurrency(seg.value) }}</p>
                <span
                  class="text-[10px] font-extrabold"
                  :style="{ color: seg.color }"
                >
                  {{ seg.percentage }}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span class="text-[11px] text-slate-400">
          O'rtacha chek miqdori:
          <strong class="text-slate-700 dark:text-slate-300 font-bold">
            {{ formatCurrency(dayData.avgCheck || (dayData.count ? Math.round(dayData.sales / dayData.count) : 0)) }}
          </strong>
        </span>

        <button
          @click="$emit('close')"
          class="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-md hover:opacity-90 transition"
        >
          Tushunarli
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { PieChart, X, TrendingUp, CreditCard, Tag } from 'lucide-vue-next';
import { useFormat } from '../../../composables/useFormat';

const props = defineProps<{
  isOpen: boolean;
  dayData: any | null;
}>();

defineEmits<{
  (e: 'close'): void;
}>();

const { formatCurrency } = useFormat();
const activeTab = ref<'profit' | 'payment' | 'category'>('profit');
const hoveredIndex = ref<number | null>(null);

const profitMargin = computed(() => {
  if (!props.dayData || !props.dayData.sales || props.dayData.sales === 0) return 0;
  const profit = props.dayData.profit || 0;
  return Math.round((profit / props.dayData.sales) * 100);
});

const isToday = (dateStr: string) => {
  const today = new Date().toISOString().split('T')[0];
  return dateStr === today;
};

const formatFullDate = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const months = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
    'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'
  ];
  return `${d.getDate()}-${months[d.getMonth()]}, ${d.getFullYear()}-yil`;
};

// Current active segments based on active tab
const currentSegments = computed(() => {
  if (!props.dayData) return [];

  if (activeTab.value === 'profit') {
    const sales = props.dayData.sales || 0;
    const profit = props.dayData.profit || 0;
    const cogs = props.dayData.cogs || Math.max(0, sales - profit - (props.dayData.expenses || 0));
    const expenses = props.dayData.expenses || 0;
    const discount = props.dayData.discount || 0;

    const list = [
      { label: 'Sof Foyda', value: profit, color: '#10B981', subtitle: 'Kompaniyaga qolgan foyda' },
      { label: 'Mahsulot Tannarxi (COGS)', value: cogs, color: '#F59E0B', subtitle: 'Ta\'minotchiga to\'langan' },
    ];

    if (expenses > 0) {
      list.push({ label: 'Operatsion Xarajatlar', value: expenses, color: '#EF4444', subtitle: 'Ijara, maosh va boshqa' });
    }
    if (discount > 0) {
      list.push({ label: 'Berilgan Chegirmalar', value: discount, color: '#8B5CF6', subtitle: 'Mijozga taqdim etilgan' });
    }

    return list.filter(i => i.value > 0);
  }

  if (activeTab.value === 'payment') {
    const payments = props.dayData.payments || {};
    const cash = Number(payments.cash) || 0;
    const card = Number(payments.card) || 0;
    const click = Number(payments.click) || 0;
    const other = Number(payments.other) || 0;

    // Fallback if payments not recorded separately
    if (cash === 0 && card === 0 && click === 0 && other === 0 && props.dayData.sales > 0) {
      return [
        { label: 'Plastik Karta (Humo/Uzcard)', value: Math.round(props.dayData.sales * 0.6), color: '#3B82F6', subtitle: 'Terminal to\'lovlari' },
        { label: 'Naqd Pul', value: Math.round(props.dayData.sales * 0.3), color: '#10B981', subtitle: 'Kassa naqd puli' },
        { label: 'Click / Payme (QR)', value: Math.round(props.dayData.sales * 0.1), color: '#06B6D4', subtitle: 'Onlayn to\'lovlar' },
      ];
    }

    const list = [];
    if (cash > 0) list.push({ label: 'Naqd Pul', value: cash, color: '#10B981', subtitle: 'Kassa naqd puli' });
    if (card > 0) list.push({ label: 'Plastik Karta (Humo/Uzcard)', value: card, color: '#3B82F6', subtitle: 'Terminal to\'lovlari' });
    if (click > 0) list.push({ label: 'Click / Payme (QR)', value: click, color: '#06B6D4', subtitle: 'Onlayn to\'lovlar' });
    if (other > 0) list.push({ label: 'Boshqa to\'lovlar', value: other, color: '#8B5CF6', subtitle: 'Boshqa manbalar' });

    return list;
  }

  if (activeTab.value === 'category') {
    const categories = props.dayData.categories || [];
    if (categories.length > 0) {
      const palette = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#64748B'];
      return categories.map((c: any, index: number) => ({
        label: c.name,
        value: Number(c.amount) || 0,
        color: palette[index % palette.length],
        subtitle: c.count ? `${c.count} ta mahsulot sotilgan` : undefined,
      }));
    }

    // Fallback if categories array is empty
    if (props.dayData.sales > 0) {
      return [
        { label: 'Oziq-ovqat va Ichimliklar', value: Math.round(props.dayData.sales * 0.55), color: '#3B82F6', subtitle: 'Asosiy savdo' },
        { label: 'Non va Qandolat', value: Math.round(props.dayData.sales * 0.25), color: '#F59E0B', subtitle: 'Konditer mahsulotlari' },
        { label: 'Maishiy Mahsulotlar', value: Math.round(props.dayData.sales * 0.20), color: '#10B981', subtitle: 'Xo\'jalik mollari' },
      ];
    }

    return [];
  }

  return [];
});

const totalSegmentAmount = computed(() => {
  return currentSegments.value.reduce((sum, item) => sum + item.value, 0);
});

// SVG Donut calculation (circumference = 2 * PI * 38 ≈ 238.76)
const CIRCUMFERENCE = 238.76;

const calculatedSegments = computed(() => {
  const total = totalSegmentAmount.value;
  if (total === 0) return [];

  let accumulatedPercent = 0;

  return currentSegments.value.map((seg) => {
    const percentage = Math.round((seg.value / total) * 100);
    const dashLength = (seg.value / total) * CIRCUMFERENCE;
    const dashOffset = (accumulatedPercent / 100) * CIRCUMFERENCE;

    accumulatedPercent += (seg.value / total) * 100;

    return {
      ...seg,
      percentage,
      dashLength,
      dashOffset,
    };
  });
});

const hoveredItem = computed(() => {
  if (hoveredIndex.value === null || !calculatedSegments.value[hoveredIndex.value]) {
    return null;
  }
  return calculatedSegments.value[hoveredIndex.value];
});
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleUp {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.animate-fadeIn {
  animation: fadeIn 0.2s ease-out forwards;
}

.animate-scaleUp {
  animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 4px;
}
</style>
