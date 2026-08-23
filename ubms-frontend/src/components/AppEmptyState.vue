<template>
  <div class="flex flex-col items-center justify-center text-center p-5 sm:p-7 my-3 glass-card rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs relative overflow-hidden group">
    <!-- Ambient Background Glow -->
    <div class="absolute -top-24 -right-24 w-40 h-40 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700"></div>
    <div class="absolute -bottom-24 -left-24 w-40 h-40 bg-teal-500/10 dark:bg-teal-500/15 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700"></div>

    <!-- UI Empty State Asset Container -->
    <div class="relative mb-3 flex items-center justify-center">
      <img
        :src="illustrationSrc"
        :alt="title"
        class="w-28 h-28 sm:w-36 sm:h-36 object-contain pointer-events-none transform group-hover:scale-105 transition-transform duration-300 drop-shadow-xs"
      />
    </div>

    <!-- Title & Message -->
    <h3 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">
      {{ title }}
    </h3>

    <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed mb-4">
      {{ description }}
    </p>

    <!-- Action Button or Custom Slot -->
    <slot name="action">
      <button
        v-if="buttonText"
        @click="emit('action')"
        type="button"
        class="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition btn-interactive cursor-pointer"
      >
        <span class="text-sm font-bold">+</span>
        <span>{{ buttonText }}</span>
      </button>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import suppliersImg from '../assets/images/illustrations/suppliers.png';
import productsImg from '../assets/images/illustrations/products.png';
import customersImg from '../assets/images/illustrations/customers.png';
import financeImg from '../assets/images/illustrations/finance.png';
import inventoryImg from '../assets/images/illustrations/inventory.png';

const props = withDefaults(
  defineProps<{
    title: string;
    description: string;
    buttonText?: string;
    variant?: 'products' | 'suppliers' | 'customers' | 'inventory' | 'finance' | 'employees' | 'search' | 'default';
  }>(),
  {
    buttonText: '',
    variant: 'products',
  }
);

const emit = defineEmits<{
  (e: 'action'): void;
}>();

const illustrationSrc = computed(() => {
  switch (props.variant) {
    case 'suppliers':
      return suppliersImg;
    case 'products':
      return productsImg;
    case 'customers':
    case 'employees':
      return customersImg;
    case 'finance':
      return financeImg;
    case 'inventory':
      return inventoryImg;
    case 'search':
      return productsImg;
    default:
      return productsImg;
  }
});
</script>
