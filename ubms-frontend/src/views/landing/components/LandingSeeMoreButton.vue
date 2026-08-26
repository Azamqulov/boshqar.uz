<template>
  <div class="text-center pt-6">
    <router-link
      :to="to"
      class="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold text-xs shadow-sm hover:shadow-md transition-all group"
    >
      <span>{{ label || 'Batafsil ma\'lumot' }}</span>
      <ArrowRight class="w-4 h-4 text-emerald-500 group-hover:translate-x-1 transition-transform" />
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next';

defineProps<{
  to: string;
  label?: string;
}>();
</script>
