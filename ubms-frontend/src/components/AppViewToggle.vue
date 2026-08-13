<template>
  <div class="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs shrink-0">
    <button
      type="button"
      @click="$emit('update:modelValue', 'table')"
      class="px-2.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 btn-interactive"
      :class="[
        modelValue === 'table'
          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
      ]"
      title="Jadval / Ro'yxat ko'rinishi"
    >
      <List class="w-4 h-4" />
      <span class="hidden sm:inline">Jadval</span>
    </button>

    <button
      type="button"
      @click="$emit('update:modelValue', 'grid')"
      class="px-2.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 btn-interactive"
      :class="[
        modelValue === 'grid'
          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
      ]"
      title="Kartalar ko'rinishi"
    >
      <LayoutGrid class="w-4 h-4" />
      <span class="hidden sm:inline">Kartalar</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { List, LayoutGrid } from 'lucide-vue-next';

defineProps<{
  modelValue: 'table' | 'grid';
}>();

defineEmits<{
  (e: 'update:modelValue', val: 'table' | 'grid'): void;
}>();
</script>
