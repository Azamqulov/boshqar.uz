<template>
  <div class="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-xs font-bold w-full overflow-x-auto scrollbar-none shadow-inner">
    <button
      type="button"
      @click="$emit('update:modelValue', 'prompt')"
      class="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl transition-all duration-200 whitespace-nowrap group"
      :class="
        modelValue === 'prompt'
          ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-500/20 dark:border-emerald-500/30'
          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/50'
      "
    >
      <div
        class="w-6 h-6 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
        :class="modelValue === 'prompt' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-slate-200/60 dark:bg-slate-700 text-slate-500'"
      >
        <Sparkles class="w-3.5 h-3.5" />
      </div>
      <span class="font-bold">Ovoz & Matn (AI)</span>
    </button>

    <button
      type="button"
      @click="$emit('update:modelValue', 'paste')"
      class="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl transition-all duration-200 whitespace-nowrap group"
      :class="
        modelValue === 'paste'
          ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-blue-500/20 dark:border-blue-500/30'
          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/50'
      "
    >
      <div
        class="w-6 h-6 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
        :class="modelValue === 'paste' ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400' : 'bg-slate-200/60 dark:bg-slate-700 text-slate-500'"
      >
        <FileText class="w-3.5 h-3.5" />
      </div>
      <span class="font-bold">Faktura & Chek</span>
    </button>

    <button
      type="button"
      @click="$emit('update:modelValue', 'templates')"
      class="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl transition-all duration-200 whitespace-nowrap group"
      :class="
        modelValue === 'templates'
          ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm border border-amber-500/20 dark:border-amber-500/30'
          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/50'
      "
    >
      <div
        class="w-6 h-6 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
        :class="modelValue === 'templates' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' : 'bg-slate-200/60 dark:bg-slate-700 text-slate-500'"
      >
        <Layers class="w-3.5 h-3.5" />
      </div>
      <span class="font-bold">Tayyor Shablonlar</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { Sparkles, FileText, Layers } from 'lucide-vue-next';

defineProps<{
  modelValue: 'prompt' | 'paste' | 'templates';
}>();

defineEmits<{
  (e: 'update:modelValue', val: 'prompt' | 'paste' | 'templates'): void;
}>();
</script>
