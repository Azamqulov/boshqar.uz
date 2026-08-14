<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- To'lov turlari bo'yicha tushum -->
    <div class="glass-card rounded-2xl p-5 space-y-5">
      <div>
        <h3 class="font-bold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <CreditCard class="w-4 h-4 text-emerald-500" />
          <span>To'lov Usullari Taqsimoti</span>
        </h3>

        <div class="space-y-4 text-xs">
          <!-- Cash -->
          <div>
            <div class="flex justify-between font-bold mb-1">
              <span class="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <Banknote class="w-3.5 h-3.5" /> Naqd pul
              </span>
              <span class="font-mono text-slate-900 dark:text-white">
                {{ formatCurrency(summary.paymentBreakdown?.cash || 0) }} ({{
                  calculateShare(summary.paymentBreakdown?.cash, summary.totalRevenue) }}%)
              </span>
            </div>
            <div class="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div class="h-full bg-emerald-500 rounded-full transition-all duration-500"
                :style="{ width: `${calculateShare(summary.paymentBreakdown?.cash, summary.totalRevenue)}%` }"></div>
            </div>
          </div>

          <!-- Card -->
          <div>
            <div class="flex justify-between font-bold mb-1">
              <span class="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                <CreditCard class="w-3.5 h-3.5" /> Plastik karta
              </span>
              <span class="font-mono text-slate-900 dark:text-white">
                {{ formatCurrency(summary.paymentBreakdown?.card || 0) }} ({{
                  calculateShare(summary.paymentBreakdown?.card, summary.totalRevenue) }}%)
              </span>
            </div>
            <div class="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div class="h-full bg-blue-500 rounded-full transition-all duration-500"
                :style="{ width: `${calculateShare(summary.paymentBreakdown?.card, summary.totalRevenue)}%` }"></div>
            </div>
          </div>

          <!-- Other / Click -->
          <div>
            <div class="flex justify-between font-bold mb-1">
              <span class="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                <Smartphone class="w-3.5 h-3.5" /> Click / Payme
              </span>
              <span class="font-mono text-slate-900 dark:text-white">
                {{ formatCurrency(summary.paymentBreakdown?.other || 0) }} ({{
                  calculateShare(summary.paymentBreakdown?.other, summary.totalRevenue) }}%)
              </span>
            </div>
            <div class="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div class="h-full bg-purple-500 rounded-full transition-all duration-500"
                :style="{ width: `${calculateShare(summary.paymentBreakdown?.other, summary.totalRevenue)}%` }"></div>
            </div>
          </div>

          <!-- Nasiya / Qarz -->
          <div v-if="((summary.paymentBreakdown?.debt || 0) > 0) || (summary.totalRevenue > ((summary.paymentBreakdown?.cash || 0) + (summary.paymentBreakdown?.card || 0) + (summary.paymentBreakdown?.other || 0)))">
            <div class="flex justify-between font-bold mb-1">
              <span class="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                <FileText class="w-3.5 h-3.5" /> Nasiya (Qarz)
              </span>
              <span class="font-mono text-slate-900 dark:text-white">
                {{ formatCurrency(summary.paymentBreakdown?.debt || Math.max(0, summary.totalRevenue - ((summary.paymentBreakdown?.cash || 0) + (summary.paymentBreakdown?.card || 0) + (summary.paymentBreakdown?.other || 0)))) }} ({{
                  calculateShare(summary.paymentBreakdown?.debt || Math.max(0, summary.totalRevenue - ((summary.paymentBreakdown?.cash || 0) + (summary.paymentBreakdown?.card || 0) + (summary.paymentBreakdown?.other || 0))), summary.totalRevenue) }}%)
              </span>
            </div>
            <div class="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div class="h-full bg-amber-500 rounded-full transition-all duration-500"
                :style="{ width: `${calculateShare(summary.paymentBreakdown?.debt || Math.max(0, summary.totalRevenue - ((summary.paymentBreakdown?.cash || 0) + (summary.paymentBreakdown?.card || 0) + (summary.paymentBreakdown?.other || 0))), summary.totalRevenue)}%` }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Interactive Round Pie Chart (2-rasmdagidek Dumaloq Diagramma) -->
      <div class="pt-4 border-t border-slate-200/80 dark:border-slate-800 space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <PieChart class="w-3.5 h-3.5 text-emerald-500" />
            <span>Dumaloq Taqsimot Diagrammasi (Pie Chart)</span>
          </span>
          <span class="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
            Jami: {{ formatCurrency(summary.totalRevenue || 0) }}
          </span>
        </div>

        <div v-if="paymentPieSlices.length === 0" class="p-6 text-center text-slate-400 text-xs">
          <PieChart class="w-8 h-8 mx-auto mb-1.5 opacity-30" />
          <span>Diagramma uchun ma'lumot mavjud emas</span>
        </div>

        <div v-else class="flex flex-col sm:flex-row items-center justify-center gap-6 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800">
          <!-- SVG Pie Chart -->
          <div class="relative w-40 h-40 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 200 200" class="w-full h-full drop-shadow-md">
              <g>
                <path
                  v-for="(slice, i) in paymentPieSlices"
                  :key="i"
                  :d="getPieSlicePath(100, 100, 85, slice.startAngle, slice.sliceAngle)"
                  :fill="slice.color"
                  class="transition-all duration-300 hover:opacity-90 hover:scale-105 origin-center cursor-pointer"
                  stroke="#ffffff"
                  stroke-width="2"
                >
                  <title>{{ slice.label }}: {{ formatCurrency(slice.amount) }} ({{ slice.percentage }}%)</title>
                </path>
              </g>
              <!-- Percentage Labels on slices >= 10% -->
              <g v-for="(slice, i) in paymentPieSlices" :key="'label-' + i">
                <text
                  v-if="slice.percentage >= 10"
                  :x="getSliceLabelPos(100, 100, 85, slice.startAngle, slice.sliceAngle).x"
                  :y="getSliceLabelPos(100, 100, 85, slice.startAngle, slice.sliceAngle).y"
                  text-anchor="middle"
                  dominant-baseline="central"
                  fill="#ffffff"
                  class="font-black font-mono text-[11px] drop-shadow-md pointer-events-none select-none"
                >
                  {{ slice.percentage }}%
                </text>
              </g>
            </svg>
          </div>

          <!-- Pie Chart Legend -->
          <div class="space-y-2 flex-1 w-full text-xs">
            <div
              v-for="(slice, i) in paymentPieSlices"
              :key="i"
              class="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-sm"
            >
              <div class="flex items-center gap-2 min-w-0">
                <span class="w-3 h-3 rounded-full shrink-0 shadow-sm" :style="{ backgroundColor: slice.color }"></span>
                <span class="font-bold text-slate-800 dark:text-slate-200 truncate">{{ slice.label }}</span>
              </div>
              <div class="text-right shrink-0 pl-2">
                <span class="font-mono font-black text-slate-900 dark:text-white block">{{ formatCurrency(slice.amount) }}</span>
                <span class="font-mono text-[10px] text-slate-500 dark:text-slate-400 font-bold">({{ slice.percentage }}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Xarajatlar toifalari bo'yicha taqsimot -->
    <div class="glass-card rounded-2xl p-5 space-y-5">
      <div>
        <h3 class="font-bold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingDown class="w-4 h-4 text-rose-500" />
          <span>Xarajatlar Toifalari Taqsimoti</span>
        </h3>

        <div v-if="Object.keys(summary.expenseBreakdown || {}).length === 0"
          class="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
          Xarajat toifalari mavjud emas
        </div>

        <div v-else class="space-y-3.5 text-xs">
          <div v-for="(amt, cat) in summary.expenseBreakdown" :key="cat">
            <div class="flex justify-between font-bold mb-1">
              <span class="text-slate-700 dark:text-slate-300">{{ getCategoryLabel(String(cat)) }}</span>
              <span class="font-mono text-rose-600 dark:text-rose-400">
                {{ formatCurrency(Number(amt)) }} ({{ calculateShare(Number(amt), summary.totalExpenses) }}%)
              </span>
            </div>
            <div class="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div class="h-full bg-rose-500 rounded-full transition-all duration-500"
                :style="{ width: `${calculateShare(Number(amt), summary.totalExpenses)}%` }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Interactive Round Pie Chart (2-rasmdagidek Dumaloq Diagramma) -->
      <div class="pt-4 border-t border-slate-200/80 dark:border-slate-800 space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <PieChart class="w-3.5 h-3.5 text-rose-500" />
            <span>Dumaloq Taqsimot Diagrammasi (Pie Chart)</span>
          </span>
          <span class="text-[11px] font-mono font-bold text-rose-600 dark:text-rose-400">
            Jami: {{ formatCurrency(summary.totalExpenses || 0) }}
          </span>
        </div>

        <div v-if="expensePieSlices.length === 0" class="p-6 text-center text-slate-400 text-xs">
          <PieChart class="w-8 h-8 mx-auto mb-1.5 opacity-30" />
          <span>Diagramma uchun ma'lumot mavjud emas</span>
        </div>

        <div v-else class="flex flex-col sm:flex-row items-center justify-center gap-6 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800">
          <!-- SVG Pie Chart -->
          <div class="relative w-40 h-40 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 200 200" class="w-full h-full drop-shadow-md">
              <g>
                <path
                  v-for="(slice, i) in expensePieSlices"
                  :key="i"
                  :d="getPieSlicePath(100, 100, 85, slice.startAngle, slice.sliceAngle)"
                  :fill="slice.color"
                  class="transition-all duration-300 hover:opacity-90 hover:scale-105 origin-center cursor-pointer"
                  stroke="#ffffff"
                  stroke-width="2"
                >
                  <title>{{ slice.label }}: {{ formatCurrency(slice.amount) }} ({{ slice.percentage }}%)</title>
                </path>
              </g>
              <!-- Percentage Labels on slices >= 10% -->
              <g v-for="(slice, i) in expensePieSlices" :key="'label-' + i">
                <text
                  v-if="slice.percentage >= 10"
                  :x="getSliceLabelPos(100, 100, 85, slice.startAngle, slice.sliceAngle).x"
                  :y="getSliceLabelPos(100, 100, 85, slice.startAngle, slice.sliceAngle).y"
                  text-anchor="middle"
                  dominant-baseline="central"
                  fill="#ffffff"
                  class="font-black font-mono text-[11px] drop-shadow-md pointer-events-none select-none"
                >
                  {{ slice.percentage }}%
                </text>
              </g>
            </svg>
          </div>

          <!-- Pie Chart Legend -->
          <div class="space-y-2 flex-1 w-full text-xs">
            <div
              v-for="(slice, i) in expensePieSlices"
              :key="i"
              class="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-sm"
            >
              <div class="flex items-center gap-2 min-w-0">
                <span class="w-3 h-3 rounded-full shrink-0 shadow-sm" :style="{ backgroundColor: slice.color }"></span>
                <span class="font-bold text-slate-800 dark:text-slate-200 truncate">{{ slice.label }}</span>
              </div>
              <div class="text-right shrink-0 pl-2">
                <span class="font-mono font-black text-rose-600 dark:text-rose-400 block">{{ formatCurrency(slice.amount) }}</span>
                <span class="font-mono text-[10px] text-slate-500 dark:text-slate-400 font-bold">({{ slice.percentage }}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { CreditCard, Banknote, Smartphone, FileText, PieChart, TrendingDown } from 'lucide-vue-next';
import { useFormat } from '../../../composables/useFormat';

const props = defineProps<{
  summary: any;
}>();

const { formatCurrency } = useFormat();

const getCategoryLabel = (category: string) => {
  const map: Record<string, string> = {
    purchase: 'Mahsulot xaridi / Kirim',
    salary: 'Xodimlar maoshi',
    rent: 'Ijara to\'lovi',
    utilities: 'Kommunal to\'lovlar',
    advertising: 'Reklama & Marketing',
    transport: 'Transport / Yetkazib berish',
    repairs: 'Ta\'mirlash va uskunalar',
    tax: 'Soliqlar va to\'lovlar',
    other: 'Boshqa xarajatlar',
  };
  return map[category] || category;
};

const calculateShare = (part: number | undefined, total: number | undefined) => {
  if (!part || !total || total <= 0) return 0;
  return Math.min(100, Math.round((part / total) * 100));
};

const getPieSlicePath = (cx: number, cy: number, r: number, startAngleDeg: number, angleDeg: number) => {
  if (angleDeg >= 359.9) {
    return `M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} Z`;
  }
  const startRad = ((startAngleDeg - 90) * Math.PI) / 180;
  const endRad = (((startAngleDeg + angleDeg) - 90) * Math.PI) / 180;

  const x1 = cx + r * Math.cos(startRad);
  const y1 = cy + r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad);
  const y2 = cy + r * Math.sin(endRad);

  const largeArcFlag = angleDeg > 180 ? 1 : 0;

  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
};

const getSliceLabelPos = (cx: number, cy: number, r: number, startAngleDeg: number, angleDeg: number) => {
  const midAngleDeg = startAngleDeg + angleDeg / 2;
  const midRad = ((midAngleDeg - 90) * Math.PI) / 180;
  const labelR = r * 0.62;
  return {
    x: cx + labelR * Math.cos(midRad),
    y: cy + labelR * Math.sin(midRad),
  };
};

const paymentPieSlices = computed(() => {
  const total = Number(props.summary?.totalRevenue || 0);
  const cash = Number(props.summary?.paymentBreakdown?.cash || 0);
  const card = Number(props.summary?.paymentBreakdown?.card || 0);
  const other = Number(props.summary?.paymentBreakdown?.other || 0);
  const rawDebt = Number(props.summary?.paymentBreakdown?.debt || 0);
  const debt = Math.max(rawDebt, Math.max(0, total - (cash + card + other)));

  const allItems = [
    { label: 'Naqd pul', amount: cash, color: '#10b981' },
    { label: 'Plastik karta', amount: card, color: '#0ea5e9' },
    { label: 'Click / Payme', amount: other, color: '#8b5cf6' },
    { label: 'Nasiya (Qarz)', amount: debt, color: '#f59e0b' },
  ].filter((item) => item.amount > 0);

  const effectiveTotal = allItems.reduce((sum, item) => sum + item.amount, 0) || total;
  if (effectiveTotal <= 0) return [];

  let cumulativeAngle = 0;
  return allItems.map((item, idx) => {
    const percentage = Math.round((item.amount / effectiveTotal) * 100);
    const startAngle = cumulativeAngle;
    const isLast = idx === allItems.length - 1;
    const sliceAngle = isLast ? Math.max(0, 360 - cumulativeAngle) : (item.amount / effectiveTotal) * 360;
    cumulativeAngle += sliceAngle;
    return {
      ...item,
      percentage,
      startAngle,
      sliceAngle,
    };
  });
});

const expenseColors = ['#10b981', '#f43f5e', '#f59e0b', '#06b6d4', '#8b5cf6', '#ec4899', '#64748b'];

const expensePieSlices = computed(() => {
  const total = Number(props.summary?.totalExpenses || 0);
  const breakdown = props.summary?.expenseBreakdown || {};
  const entries = Object.entries(breakdown)
    .map(([cat, amt]) => ({
      category: cat,
      label: getCategoryLabel(String(cat)),
      amount: Number(amt || 0),
    }))
    .filter((e) => e.amount > 0);

  const effectiveTotal = entries.reduce((sum, item) => sum + item.amount, 0) || total;
  if (effectiveTotal <= 0 || entries.length === 0) return [];

  let cumulativeAngle = 0;
  return entries.map((item, idx) => {
    const percentage = Math.round((item.amount / effectiveTotal) * 100);
    const startAngle = cumulativeAngle;
    const isLast = idx === entries.length - 1;
    const sliceAngle = isLast ? Math.max(0, 360 - cumulativeAngle) : (item.amount / effectiveTotal) * 360;
    cumulativeAngle += sliceAngle;
    const color = expenseColors[idx % expenseColors.length];
    return {
      ...item,
      percentage,
      color,
      startAngle,
      sliceAngle,
    };
  });
});
</script>
