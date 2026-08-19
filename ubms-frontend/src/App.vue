<template>
  <MaintenanceOverlay />
  <OfflineStatusBar />
  <router-view v-slot="{ Component }">
    <transition name="page" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
  <FloatingStockAlert />
  <ToastContainer />
  <CookieConsentBanner />
  <PwaInstallPrompt />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import MaintenanceOverlay from './components/MaintenanceOverlay.vue';
import ToastContainer from './components/ToastContainer.vue';
import FloatingStockAlert from './components/FloatingStockAlert.vue';
import CookieConsentBanner from './components/CookieConsentBanner.vue';
import OfflineStatusBar from './components/OfflineStatusBar.vue';
import PwaInstallPrompt from './components/PwaInstallPrompt.vue';

onMounted(() => {
  // Register Service Worker for PWA Offline caching
  if ('serviceWorker' in navigator && typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registered successfully:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker registration failed:', err);
        });
    });
  }
});
</script>
