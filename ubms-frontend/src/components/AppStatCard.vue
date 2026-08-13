<template>
  <div
    class="glass-card rounded-2xl p-4 flex flex-col justify-between h-full min-h-[104px] border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
    :class="cardClass"
  >
    <!-- Top Row: Title & Top-Right Icon Badge -->
    <div class="flex items-center justify-between gap-2">
      <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 line-clamp-1">
        {{ title }}
      </span>

      <div
        v-if="icon"
        class="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
        :class="badgeClasses"
      >
        <component :is="icon" class="w-4 h-4" />
      </div>
    </div>

    <!-- Value & Subtitle -->
    <div class="mt-2">
      <div
        class="text-xl font-black font-mono tracking-tight line-clamp-1"
        :class="valueClass || 'text-slate-900 dark:text-white'"
      >
        {{ value }}
      </div>

      <p
        v-if="subtitle"
        class="text-[11px] font-medium mt-1 truncate"
        :class="subtitleClass || defaultSubtitleClass"
      >
        {{ subtitle }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type StatVariant = 'emerald' | 'rose' | 'blue' | 'purple' | 'amber' | 'indigo' | 'cyan' | 'slate';

const props = withDefaults(
  defineProps<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: any;
    variant?: StatVariant;
    valueClass?: string;
    subtitleClass?: string;
    cardClass?: string;
  }>(),
  {
    variant: 'emerald',
  }
);

const badgeClasses = computed(() => {
  switch (props.variant) {
    case 'rose':
      return 'bg-rose-500/15 text-rose-600 dark:text-rose-400';
    case 'blue':
      return 'bg-blue-500/15 text-blue-600 dark:text-blue-400';
    case 'purple':
      return 'bg-purple-500/15 text-purple-600 dark:text-purple-400';
    case 'amber':
      return 'bg-amber-500/15 text-amber-600 dark:text-amber-400';
    case 'indigo':
      return 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400';
    case 'cyan':
      return 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400';
    case 'slate':
      return 'bg-slate-500/15 text-slate-600 dark:text-slate-400';
    case 'emerald':
    default:
      return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400';
  }
});

const defaultSubtitleClass = computed(() => {
  switch (props.variant) {
    case 'rose':
      return 'text-rose-600 dark:text-rose-400';
    case 'blue':
      return 'text-blue-600 dark:text-blue-400';
    case 'purple':
      return 'text-purple-600 dark:text-purple-400';
    case 'amber':
      return 'text-amber-600 dark:text-amber-400';
    case 'indigo':
      return 'text-indigo-600 dark:text-indigo-400';
    case 'cyan':
      return 'text-cyan-600 dark:text-cyan-400';
    case 'slate':
      return 'text-slate-500 dark:text-slate-400';
    case 'emerald':
    default:
      return 'text-emerald-600 dark:text-emerald-400';
  }
});
</script>
