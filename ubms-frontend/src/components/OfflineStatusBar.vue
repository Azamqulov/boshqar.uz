<template>
  <transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="-translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="-translate-y-full opacity-0"
  >
    <div
      v-if="!isOnline || pendingCount > 0"
      class="fixed top-0 inset-x-0 z-50 py-2 px-4 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-md"
      :class="!isOnline ? 'bg-amber-500 text-slate-950' : 'bg-emerald-600 text-white'"
    >
      <div v-if="!isOnline" class="flex items-center gap-2">
        <WifiOff class="w-4 h-4 animate-pulse" />
        <span>Oflayn Rejim (Internet yo'q) — Kassa to'liq ishlamoqda.</span>
        <span v-if="pendingCount > 0" class="px-2 py-0.5 rounded-full bg-slate-900/20 text-slate-950 font-mono text-[11px]">
          {{ pendingCount }} ta chek kutilmoqda
        </span>
      </div>

      <div v-else-if="pendingCount > 0" class="flex items-center gap-2">
        <RefreshCw class="w-4 h-4 animate-spin" />
        <span>Internet tiklandi — {{ pendingCount }} ta oflayn chek bazaga yuklanmoqda...</span>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useOfflinePOS } from '../composables/useOfflinePOS';
import { WifiOff, RefreshCw } from 'lucide-vue-next';

const { isOnline, pendingCount, setupListeners } = useOfflinePOS();

let cleanup: (() => void) | null = null;

onMounted(() => {
  cleanup = setupListeners();
});

onUnmounted(() => {
  if (cleanup) {
    cleanup();
  }
});
</script>
