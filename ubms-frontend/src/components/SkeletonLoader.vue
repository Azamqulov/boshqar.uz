<template>
  <div class="relative w-full overflow-hidden my-3 select-none">
    <!-- 1. Central Ultra-Premium Glassmorphism Card -->
    <div class="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 sm:p-10 shadow-xl shadow-emerald-500/5 flex flex-col items-center justify-center text-center">
      
      <!-- Background Ambient Aurora Glows -->
      <div class="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 blur-3xl pointer-events-none animate-pulse"></div>
      <div class="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-teal-500/15 dark:bg-teal-500/20 blur-3xl pointer-events-none animate-pulse [animation-delay:1s]"></div>

      <!-- Top Shimmer Border Beam -->
      <div class="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-80 animate-shimmer-beam"></div>

      <!-- 2. Interactive Multi-Layer Orbital Spinner -->
      <div class="relative w-20 h-20 mb-5 flex items-center justify-center">
        <!-- Outer Glowing Pulse Ring -->
        <div class="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500/30 to-teal-400/20 blur-md animate-ping opacity-60 [animation-duration:2.5s]"></div>

        <!-- Outer Rotating Dashed Ring -->
        <div class="absolute inset-0 rounded-full border-2 border-dashed border-emerald-500/30 dark:border-emerald-400/25 animate-spin [animation-duration:8s]"></div>

        <!-- Middle Smooth Gradient Orbit Ring -->
        <div class="absolute inset-1.5 rounded-full border-2 border-transparent border-t-emerald-500 border-r-teal-400 border-b-transparent border-l-transparent animate-spin [animation-duration:1.2s]"></div>
        
        <!-- Counter-rotating Inner Ring -->
        <div class="absolute inset-3.5 rounded-full border-2 border-transparent border-b-emerald-400 border-l-teal-500 border-t-transparent border-r-transparent animate-spin-reverse [animation-duration:1.8s]"></div>

        <!-- Central Core Icon Container with 3D Glass Surface -->
        <div class="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center transform hover:scale-105 transition duration-300">
          <Sparkles class="w-5 h-5 animate-pulse text-white drop-shadow-md" />
        </div>
      </div>

      <!-- 3. Typography with Subtle Gradient Accent -->
      <div class="space-y-1.5 max-w-sm">
        <h4 class="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
          <span>{{ text || "Ma'lumotlar yuklanmoqda" }}</span>
          <span class="inline-flex gap-0.5">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0ms]"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:150ms]"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:300ms]"></span>
          </span>
        </h4>
        <p class="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-500/80 animate-ping shrink-0"></span>
          <span>Iltimos, kuting • Boshqaruv tizimi sinxronlanmoqda</span>
        </p>
      </div>

      <!-- 4. High-Tech Animated Gradient Progress Line -->
      <div class="w-48 sm:w-64 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-5 relative shadow-inner">
        <div class="h-full w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 rounded-full animate-progress-indeterminate"></div>
      </div>

      <!-- 5. Contextual Skeleton Structure Wireframe -->
      <!-- A. Table Variant Shimmer -->
      <div v-if="variant === 'table'" class="w-full max-w-2xl mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5 opacity-70">
        <div class="grid grid-cols-5 gap-3 py-1">
          <div class="h-3 bg-slate-200 dark:bg-slate-800 rounded-lg col-span-2 skeleton-shimmer"></div>
          <div class="h-3 bg-slate-200 dark:bg-slate-800 rounded-lg skeleton-shimmer"></div>
          <div class="h-3 bg-slate-200 dark:bg-slate-800 rounded-lg skeleton-shimmer"></div>
          <div class="h-3 bg-slate-200 dark:bg-slate-800 rounded-lg skeleton-shimmer"></div>
        </div>
        <div v-for="i in Math.min(rows || 3, 4)" :key="i" class="grid grid-cols-5 gap-3 py-1.5">
          <div class="h-3.5 bg-slate-200/70 dark:bg-slate-800/70 rounded-lg col-span-2 skeleton-shimmer"></div>
          <div class="h-3.5 bg-slate-200/70 dark:bg-slate-800/70 rounded-lg skeleton-shimmer"></div>
          <div class="h-3.5 bg-slate-200/70 dark:bg-slate-800/70 rounded-lg skeleton-shimmer"></div>
          <div class="h-3.5 bg-slate-200/70 dark:bg-slate-800/70 rounded-lg skeleton-shimmer"></div>
        </div>
      </div>

      <!-- B. Grid Variant Shimmer -->
      <div v-else-if="variant === 'grid'" class="w-full max-w-2xl mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 opacity-70">
        <div v-for="i in 4" :key="i" class="p-3 rounded-2xl bg-slate-100/60 dark:bg-slate-800/40 space-y-2">
          <div class="h-16 rounded-xl bg-slate-200/80 dark:bg-slate-800 skeleton-shimmer"></div>
          <div class="h-3 w-3/4 bg-slate-200/80 dark:bg-slate-800 rounded-md skeleton-shimmer"></div>
          <div class="h-3 w-1/2 bg-slate-200/80 dark:bg-slate-800 rounded-md skeleton-shimmer"></div>
        </div>
      </div>

      <!-- C. KPI Variant Shimmer -->
      <div v-else-if="variant === 'kpi'" class="w-full max-w-2xl mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 opacity-70">
        <div v-for="i in 4" :key="i" class="p-3 rounded-2xl bg-slate-100/60 dark:bg-slate-800/40 space-y-2 text-left">
          <div class="h-3 w-1/2 bg-slate-200/80 dark:bg-slate-800 rounded-md skeleton-shimmer"></div>
          <div class="h-6 w-3/4 bg-slate-200/80 dark:bg-slate-800 rounded-lg skeleton-shimmer"></div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next';

defineProps<{
  variant?: 'kpi' | 'table' | 'grid' | 'cards' | 'box' | 'spinner';
  rows?: number;
  count?: number;
  height?: string;
  text?: string;
}>();
</script>

<style scoped>
@keyframes spinReverse {
  from {
    transform: rotate(360deg);
  }
  to {
    transform: rotate(0deg);
  }
}

.animate-spin-reverse {
  animation: spinReverse 1.8s linear infinite;
}

@keyframes shimmerBeam {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer-beam {
  animation: shimmerBeam 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes progressIndeterminate {
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-progress-indeterminate {
  animation: progressIndeterminate 1.6s cubic-bezier(0.65, 0, 0.35, 1) infinite;
}

.skeleton-shimmer {
  position: relative;
  overflow: hidden;
}

.skeleton-shimmer::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: translateX(-100%);
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.4) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  animation: shimmerAnim 1.5s infinite;
}

.dark .skeleton-shimmer::after {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.08) 50%,
    rgba(255, 255, 255, 0) 100%
  );
}

@keyframes shimmerAnim {
  100% {
    transform: translateX(100%);
  }
}
</style>

