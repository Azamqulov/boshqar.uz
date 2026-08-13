<script setup lang="ts">
interface Props {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverEffect?: boolean;
}

withDefaults(defineProps<Props>(), {
  padding: 'md',
  hoverEffect: false,
});
</script>

<template>
  <div
    class="glass-card rounded-2xl transition duration-200"
    :class="[
      padding === 'none' && 'p-0',
      padding === 'sm' && 'p-3',
      padding === 'md' && 'p-4 sm:p-5',
      padding === 'lg' && 'p-6 sm:p-8',
      hoverEffect && 'hover:shadow-lg hover:border-emerald-500/30 cursor-pointer',
    ]"
  >
    <slot />
  </div>
</template>
