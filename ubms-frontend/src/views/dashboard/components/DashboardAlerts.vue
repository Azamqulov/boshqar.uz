<template>
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
</template>

<script setup lang="ts">
import { Boxes, Users } from 'lucide-vue-next';
import { useFormat } from '../../../composables/useFormat';

defineProps<{
  summary: any;
}>();

const { formatCurrency } = useFormat();
</script>
