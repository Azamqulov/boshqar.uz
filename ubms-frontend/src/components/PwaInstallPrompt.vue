<template>
  <transition
    enter-active-class="transition-all duration-500 ease-out"
    enter-from-class="translate-y-8 opacity-0 scale-95"
    enter-to-class="translate-y-0 opacity-100 scale-100"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="translate-y-0 opacity-100 scale-100"
    leave-to-class="translate-y-8 opacity-0 scale-95"
  >
    <div
      v-if="showInstallPrompt && !isDismissed"
      class="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white border border-slate-200 dark:border-emerald-500/30 shadow-2xl backdrop-blur-xl space-y-3"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <Smartphone class="w-5 h-5" />
          </div>
          <div>
            <h4 class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Boshqar.uz Ilovasini O'rnatish</span>
              <span class="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500 text-white dark:text-slate-950 uppercase">PWA</span>
            </h4>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Tezkor POS Kassa va internetsiz oflayn ishlash uchun ilovani telefon yoki kompyuteringizga o'rnating!
            </p>
          </div>
        </div>

        <button
          @click="dismiss"
          class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <div class="flex items-center justify-end gap-2 pt-1">
        <button
          @click="dismiss"
          class="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          Keyinroq
        </button>
        <button
          @click="installPwa"
          class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 dark:hover:bg-emerald-400 text-white dark:text-slate-950 shadow-md shadow-emerald-500/25 transition flex items-center gap-1.5 hover:scale-105 active:scale-95"
        >
          <Download class="w-3.5 h-3.5" />
          <span>Ilovani O'rnatish</span>
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Smartphone, Download, X } from 'lucide-vue-next';

const deferredPrompt = ref<any>(null);
const showInstallPrompt = ref(false);
const isDismissed = ref(false);

onMounted(() => {
  // Check if dismissed previously within 24 hours
  const dismissedTime = localStorage.getItem('ubms_pwa_dismissed');
  if (dismissedTime && Date.now() - Number(dismissedTime) < 24 * 60 * 60 * 1000) {
    isDismissed.value = true;
  }

  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    deferredPrompt.value = e;
    if (!isDismissed.value) {
      showInstallPrompt.value = true;
    }
  });

  window.addEventListener('appinstalled', () => {
    showInstallPrompt.value = false;
    deferredPrompt.value = null;
  });
});

const installPwa = async () => {
  if (!deferredPrompt.value) return;
  deferredPrompt.value.prompt();
  const { outcome } = await deferredPrompt.value.userChoice;
  if (outcome === 'accepted') {
    showInstallPrompt.value = false;
  }
  deferredPrompt.value = null;
};

const dismiss = () => {
  isDismissed.value = true;
  showInstallPrompt.value = false;
  localStorage.setItem('ubms_pwa_dismissed', Date.now().toString());
};
</script>
