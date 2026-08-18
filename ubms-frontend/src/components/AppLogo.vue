<template>
  <router-link :to="targetRoute" class="inline-flex items-center gap-2 select-none transition-transform duration-200 hover:scale-[1.02] cursor-pointer">
    <!-- Green Brand Icon -->
    <img
      src="/favicon.png"
      alt="Boshqar.uz"
      class="object-contain shrink-0"
      :class="iconSizeClass"
    />

    <!-- Brand Typography (Adaptive Light/Dark Theme) -->
    <div class="flex items-baseline font-black tracking-tight leading-none" :class="textSizeClass">
      <span class="text-slate-900 dark:text-white font-black">Boshqar</span>
      <span class="text-emerald-500 dark:text-emerald-400 font-black">.uz</span>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '../stores/auth.store';

const props = withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg' | 'xl';
    to?: string;
  }>(),
  {
    size: 'md',
  }
);

const authStore = useAuthStore();

const targetRoute = computed(() => {
  if (props.to) return props.to;
  return authStore.token && authStore.user ? '/dashboard' : '/';
});

const iconSizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'w-7 h-7';
    case 'lg':
      return 'w-9 h-9';
    case 'xl':
      return 'w-12 h-12';
    case 'md':
    default:
      return 'w-8 h-8';
  }
});

const textSizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'text-lg';
    case 'lg':
      return 'text-2xl';
    case 'xl':
      return 'text-3xl sm:text-4xl';
    case 'md':
    default:
      return 'text-xl';
  }
});
</script>
