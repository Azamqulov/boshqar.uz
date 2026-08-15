<template>
  <router-view v-slot="{ Component }">
    <transition name="page" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
  <FloatingStockAlert />
  <ToastContainer />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import ToastContainer from './components/ToastContainer.vue';
import FloatingStockAlert from './components/FloatingStockAlert.vue';
import { applyGlobalScript, useLanguage } from './composables/useLanguage';

const { scriptMode } = useLanguage();

// Sahifa yuklanganda saqlangan til rejimini butun DOM ga qo'llash
onMounted(() => {
  if (scriptMode.value === 'cyrillic') {
    // Kichik kechikish bilan — DOM to'liq render bo'lgandan keyin
    setTimeout(() => {
      applyGlobalScript('cyrillic');
    }, 100);
  }
});
</script>
