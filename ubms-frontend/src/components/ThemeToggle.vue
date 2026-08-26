<template>
  <button
    type="button"
    role="switch"
    :aria-checked="themeStore.isDark"
    :aria-label="themeStore.isDark ? 'Yorug\' rejimga o\'tish' : 'Tungi rejimga o\'tish'"
    @click="themeStore.toggleTheme"
    :title="themeStore.isDark ? 'Yorug\' rejimga o\'tish (Light mode)' : 'Tungi rejimga o\'tish (Dark mode)'"
    class="relative p-2 rounded-xl border transition-all duration-200 flex items-center justify-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 btn-interactive"
    :class="[
      themeStore.isDark
        ? 'bg-slate-800/80 hover:bg-slate-700/80 text-amber-400 border-slate-700 hover:border-amber-400/50 shadow-sm'
        : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900 border-slate-300 shadow-sm'
    ]"
  >
    <Sun
      v-if="themeStore.isDark"
      class="w-4 h-4 transition-transform duration-300 group-hover:rotate-45 group-hover:scale-110"
    />
    <Moon
      v-else
      class="w-4 h-4 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110 text-slate-700"
    />
  </button>
</template>

<script setup lang="ts">
import { Sun, Moon } from 'lucide-vue-next';
import { useThemeStore } from '../stores/theme.store';

const themeStore = useThemeStore();
</script>
