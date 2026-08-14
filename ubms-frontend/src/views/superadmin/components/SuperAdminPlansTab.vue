<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div
      v-for="plan in plans"
      :key="plan.id"
      class="glass-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between border shadow-sm"
      :class="plan.name === 'Pro' ? 'border-emerald-500/50 shadow-emerald-500/10 ring-2 ring-emerald-500/20' : 'border-slate-200 dark:border-slate-800'"
    >
      <div>
        <div class="flex items-center justify-between mb-4">
          <span class="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider" :class="getPlanBadgeClass(plan.name)">
            {{ plan.name }}
          </span>
          <span class="text-xl font-black text-slate-900 dark:text-white font-mono">
            {{ Number(plan.priceMonthly) === 0 ? 'Bepul' : formatCurrency(plan.priceMonthly) }}
          </span>
        </div>

        <h3 class="text-base font-bold text-slate-900 dark:text-white mb-2">{{ plan.name }} Tarif Rejasi</h3>
        <ul class="space-y-2 text-xs text-slate-600 dark:text-slate-300">
          <li class="flex items-center gap-2">
            <CheckCircle class="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>Maksimal filiallar: <strong>{{ plan.maxBranches || 'Cheksiz' }}</strong></span>
          </li>
          <li class="flex items-center gap-2">
            <CheckCircle class="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>Maksimal xodimlar: <strong>{{ plan.maxUsers || 'Cheksiz' }}</strong></span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CheckCircle } from 'lucide-vue-next';
import { useFormat } from '../../../composables/useFormat';

defineProps<{
  plans: any[];
}>();

const { formatCurrency } = useFormat();

const getPlanBadgeClass = (plan: string) => {
  switch (plan?.toLowerCase()) {
    case 'business':
      return 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30';
    case 'pro':
      return 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30';
    default:
      return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
  }
};
</script>
