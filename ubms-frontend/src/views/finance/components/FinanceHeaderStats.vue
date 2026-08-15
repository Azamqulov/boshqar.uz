<template>
  <div class="space-y-4">
    <!-- Top 4 Primary KPI Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <AppStatCard
        title="Jami Tushum (Revenue)"
        :value="formatCurrency(summary.totalRevenue || 0)"
        :subtitle="`${summary.salesCount || 0} ta chek savdo`"
        variant="emerald"
        :icon="DollarSign"
      />

      <AppStatCard
        title="Sotilgan Mahsulot Tannarxi"
        :value="formatCurrency(summary.cogs || 0)"
        subtitle="Jami sotilgan tovarlar tannarxi (COGS)"
        variant="amber"
        :icon="Boxes"
      />

      <AppStatCard
        title="Operatsion Xarajatlar"
        :value="formatCurrency(summary.totalExpenses || 0)"
        subtitle="Ijara, maosh, kommunal va boshqalar"
        variant="rose"
        :icon="TrendingDown"
      />

      <AppStatCard
        title="Sof Foyda (Net Profit)"
        :value="formatCurrency(summary.netProfit || 0)"
        :subtitle="(summary.netProfit || 0) < 0 ? 'Xarajat tushumdan yuqori (Zarar)' : `Rentabellik (Marja): ${summary.profitMargin || 0}%`"
        :variant="(summary.netProfit || 0) >= 0 ? 'emerald' : 'rose'"
        :icon="(summary.netProfit || 0) >= 0 ? TrendingUp : TrendingDown"
      />
    </div>

    <!-- 4 Sub-metrics Mini Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
          <Banknote class="w-5 h-5" />
        </div>
        <div class="min-w-0">
          <span class="text-[10px] font-bold text-slate-400 uppercase">Naqd Pulda</span>
          <p class="text-sm font-black text-slate-800 dark:text-slate-100 font-mono truncate">
            {{ formatCurrency(summary.paymentBreakdown?.cash || 0) }}
          </p>
        </div>
      </div>

      <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
          <CreditCard class="w-5 h-5" />
        </div>
        <div class="min-w-0">
          <span class="text-[10px] font-bold text-slate-400 uppercase">Plastik Karta</span>
          <p class="text-sm font-black text-slate-800 dark:text-slate-100 font-mono truncate">
            {{ formatCurrency(summary.paymentBreakdown?.card || 0) }}
          </p>
        </div>
      </div>

      <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
          <Smartphone class="w-5 h-5" />
        </div>
        <div class="min-w-0">
          <span class="text-[10px] font-bold text-slate-400 uppercase">Click / Payme</span>
          <p class="text-sm font-black text-slate-800 dark:text-slate-100 font-mono truncate">
            {{ formatCurrency(summary.paymentBreakdown?.other || 0) }}
          </p>
        </div>
      </div>

      <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
          <Receipt class="w-5 h-5" />
        </div>
        <div class="min-w-0">
          <span class="text-[10px] font-bold text-slate-400 uppercase">O'rtacha Chek</span>
          <p class="text-sm font-black text-slate-800 dark:text-slate-100 font-mono truncate">
            {{ formatCurrency(summary.averageTicket || 0) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DollarSign, Boxes, TrendingDown, TrendingUp, Banknote, CreditCard, Smartphone, Receipt } from 'lucide-vue-next';
import AppStatCard from '../../../components/AppStatCard.vue';
import { useFormat } from '../../../composables/useFormat';

defineProps<{
  summary: any;
}>();

const { formatCurrency } = useFormat();
</script>
