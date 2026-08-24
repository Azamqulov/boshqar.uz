<template>
  <div class="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
    <div class="flex items-center gap-4">
      <div class="w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
        <img
          src="/topa-olmadingizmi-transparent.webp"
          alt="Topa olmadingizmi?"
          class="w-full h-full object-contain select-none drop-shadow-sm"
        />
      </div>
      <div>
        <h3 class="font-black text-sm sm:text-base text-slate-900 dark:text-white">
          Topa olmadingizmi?
        </h3>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Boshqar AI sizga yordam beradi.
        </p>
      </div>
    </div>

    <button
      type="button"
      @click="$emit('ask-ai')"
      class="px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/25 transition flex items-center justify-center gap-2 shrink-0"
    >
      <Sparkles class="w-4 h-4 text-emerald-200" />
      <span>AI bilan so‘rashni boshlash</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next';

defineEmits<{
  (e: 'ask-ai'): void;
}>();
</script>
