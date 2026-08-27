<template>
  <GlobalErrorBoundary>
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
  </GlobalErrorBoundary>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import GlobalErrorBoundary from './components/GlobalErrorBoundary.vue';
import MaintenanceOverlay from './components/MaintenanceOverlay.vue';
import ToastContainer from './components/ToastContainer.vue';
import FloatingStockAlert from './components/FloatingStockAlert.vue';
import CookieConsentBanner from './components/CookieConsentBanner.vue';
import OfflineStatusBar from './components/OfflineStatusBar.vue';
import PwaInstallPrompt from './components/PwaInstallPrompt.vue';
import { useRealtimeSync } from './composables/useRealtimeSync';

// Enable application-wide real-time sync with backend WebSockets
useRealtimeSync();

onMounted(() => {
  // Register Service Worker for PWA Offline caching only in production mode
  if (import.meta.env.PROD && 'serviceWorker' in navigator && typeof window !== 'undefined') {
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
  } else if (import.meta.env.DEV && 'serviceWorker' in navigator && typeof window !== 'undefined') {
    // Unregister any active service worker during local development to ensure fresh hot-reloading
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
        console.log('[PWA Dev] Unregistered existing Service Worker for hot reload');
      }
    });
  }
});
</script>
