<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'warning' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: any;
  type?: 'button' | 'submit' | 'reset';
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  type: 'button',
});

defineEmits<{ (e: 'click', event: MouseEvent): void }>();
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="inline-flex items-center justify-center gap-2 rounded-xl font-bold transition btn-interactive disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none select-none"
    :class="[
      // Variants
      variant === 'primary' && 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25',
      variant === 'secondary' && 'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80',
      variant === 'danger' && 'bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white shadow-lg shadow-rose-500/25',
      variant === 'warning' && 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 shadow-lg shadow-amber-500/25',
      variant === 'success' && 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25',
      variant === 'ghost' && 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-300',

      // Sizes
      size === 'sm' && 'h-[36px] px-3.5 text-xs',
      size === 'md' && 'h-[40px] px-4 text-xs',
      size === 'lg' && 'h-[48px] px-6 text-sm',
    ]"
    @click="(e) => { if (disabled || loading) { e.preventDefault(); e.stopPropagation(); return; } $emit('click', e); }"
  >
    <component :is="icon" v-if="icon && !loading" class="w-4 h-4 flex-shrink-0" />
    <span
      v-if="loading"
      class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0"
    />
    <slot />
  </button>
</template>
