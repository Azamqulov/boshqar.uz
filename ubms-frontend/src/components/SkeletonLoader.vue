<template>
  <div class="relative w-full overflow-hidden rounded-2xl">
    <!-- Centered Animated Rotating Sync / Refresh Badge -->
    <div class="glass-card rounded-2xl p-8 border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 shadow-sm flex flex-col items-center justify-center text-center my-2 space-y-3">
      <!-- Animated Spinning Circular Arrows Icon -->
      <div class="relative flex items-center justify-center">
        <!-- Glow ring -->
        <div class="absolute inset-0 w-12 h-12 rounded-2xl bg-emerald-500/20 blur-md animate-pulse"></div>
        
        <!-- Rotating Sync Icon Container -->
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500/15 via-teal-500/20 to-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner">
          <RefreshCw class="w-6 h-6 animate-spin [animation-duration:1.2s] stroke-[2.2]" />
        </div>
      </div>

      <!-- Text -->
      <div class="space-y-0.5">
        <h4 class="font-bold text-xs text-slate-800 dark:text-slate-200">
          {{ text || "Ma'lumotlar yuklanmoqda..." }}
        </h4>
        <p class="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
          Iltimos, kuting...
        </p>
      </div>

      <!-- Subtle Skeleton Wireframe underneath for visual structure -->
      <div v-if="variant === 'table'" class="w-full max-w-md pt-2 space-y-1.5 opacity-60">
        <div class="h-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full skeleton"></div>
        <div class="h-2.5 w-4/5 mx-auto bg-slate-200 dark:bg-slate-800 rounded-full skeleton"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RefreshCw } from 'lucide-vue-next';

defineProps<{
  variant?: 'kpi' | 'table' | 'grid' | 'cards' | 'box' | 'spinner';
  rows?: number;
  count?: number;
  height?: string;
  text?: string;
}>();
</script>

