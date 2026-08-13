<template>
  <!-- KPI Skeleton Cards -->
  <div v-if="variant === 'kpi'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <div v-for="i in 4" :key="i" class="glass-card rounded-2xl p-5 space-y-3">
      <div class="flex items-center justify-between">
        <div class="h-3.5 w-24 rounded-lg skeleton"></div>
        <div class="w-8 h-8 rounded-xl skeleton"></div>
      </div>
      <div class="h-7 w-36 rounded-lg skeleton"></div>
      <div class="h-3 w-28 rounded-lg skeleton"></div>
    </div>
  </div>

  <!-- Table Skeleton -->
  <div v-else-if="variant === 'table'" class="glass-card rounded-2xl overflow-hidden p-4 space-y-3">
    <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
      <div class="h-4 w-32 rounded skeleton"></div>
      <div class="h-8 w-48 rounded-xl skeleton"></div>
    </div>
    <div class="space-y-2">
      <div v-for="i in rows || 6" :key="i" class="h-12 w-full rounded-xl skeleton"></div>
    </div>
  </div>

  <!-- Cards Grid Skeleton -->
  <div v-else-if="variant === 'grid'" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
    <div v-for="i in count || 10" :key="i" class="glass-card rounded-xl p-3 space-y-3">
      <div class="w-full h-24 rounded-lg skeleton"></div>
      <div class="h-4 w-3/4 rounded skeleton"></div>
      <div class="flex justify-between items-center pt-2">
        <div class="h-4 w-16 rounded skeleton"></div>
        <div class="h-5 w-8 rounded skeleton"></div>
      </div>
    </div>
  </div>

  <!-- Generic Box Skeleton -->
  <div v-else class="w-full rounded-2xl skeleton" :style="{ height: height || '200px' }"></div>
</template>

<script setup lang="ts">
defineProps<{
  variant?: 'kpi' | 'table' | 'grid' | 'box';
  rows?: number;
  count?: number;
  height?: string;
}>();
</script>
