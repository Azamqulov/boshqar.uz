<template>
  <div class="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-sm bg-white dark:bg-slate-900 space-y-2.5">
    <div class="flex items-center gap-2">
      <div class="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
        <BarChart3 class="w-3.5 h-3.5" />
      </div>
      <h3 class="text-xs font-bold text-slate-900 dark:text-white">Umumiy ma'lumot</h3>
    </div>

    <div class="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
      <div class="flex items-center justify-between py-2">
        <div class="flex items-center gap-1.5 text-slate-500">
          <Package class="w-3.5 h-3.5 text-slate-400" />
          <span>Jami mahsulotlar</span>
        </div>
        <span class="font-black text-slate-900 dark:text-white font-mono text-xs">{{ totalProducts }}</span>
      </div>

      <div class="flex items-center justify-between py-2">
        <div class="flex items-center gap-1.5 text-slate-500">
          <Boxes class="w-3.5 h-3.5 text-slate-400" />
          <span>Jami blok</span>
        </div>
        <span class="font-black text-slate-900 dark:text-white font-mono text-xs">{{ totalPacks }}</span>
      </div>

      <div class="flex items-center justify-between py-2">
        <div class="flex items-center gap-1.5 text-slate-500">
          <CheckCircle2 class="w-3.5 h-3.5 text-slate-400" />
          <span>Jami miqdor</span>
        </div>
        <span class="font-black text-slate-900 dark:text-white font-mono text-xs">{{ totalQuantity }} ta</span>
      </div>

      <div class="flex items-center justify-between py-2">
        <div class="flex items-center gap-1.5 text-slate-500">
          <Percent class="w-3.5 h-3.5 text-slate-400" />
          <span>Jami marja</span>
        </div>
        <span class="font-black text-emerald-600 dark:text-emerald-400 font-mono text-xs">{{ averageMargin }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BarChart3, Package, Boxes, CheckCircle2, Percent } from 'lucide-vue-next';

defineProps<{
  totalProducts: number;
  totalPacks: number;
  totalQuantity: number;
  averageMargin: number;
}>();
</script>
