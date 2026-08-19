<template>
  <div class="mb-8">
    <div class="flex items-center justify-between">
      <div v-for="s in 3" :key="s" class="flex items-center">
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all"
          :class="[
            step === s
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 ring-4 ring-emerald-500/20'
              : step > s
              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700'
          ]"
        >
          <Check v-if="step > s" class="w-5 h-5" />
          <span v-else>{{ s }}</span>
        </div>
        <div
          v-if="s < 3"
          class="w-16 sm:w-24 h-1 mx-2 rounded-full"
          :class="step > s ? 'bg-emerald-500/40' : 'bg-slate-200 dark:bg-slate-800'"
        ></div>
      </div>
    </div>
    <div class="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
      <span>1. Biznes turi</span>
      <span>2. Filial</span>
      <span>3. Boshlash</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check } from 'lucide-vue-next';

defineProps<{
  step: number;
}>();
</script>
