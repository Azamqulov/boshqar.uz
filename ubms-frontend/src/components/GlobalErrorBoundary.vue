<template>
  <div v-if="hasError" class="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden text-slate-900 dark:text-slate-100 select-none transition-colors duration-300 z-50">
    <!-- Top Right Theme Toggle -->
    <div class="absolute top-5 right-5 z-20">
      <ThemeToggle />
    </div>

    <!-- Ambient Background Glows -->
    <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/10 dark:bg-rose-500/15 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-1/4 left-1/3 w-80 h-80 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>

    <div class="max-w-md w-full text-center relative z-10 space-y-6 animate-fade-in">
      <!-- Error Icon & Shield -->
      <div class="relative inline-block">
        <div class="w-24 h-24 rounded-3xl bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/30 dark:border-rose-500/40 backdrop-blur-md flex items-center justify-center text-rose-500 dark:text-rose-400 shadow-xl mx-auto">
          <ShieldAlert class="w-12 h-12 animate-pulse" />
        </div>
      </div>

      <!-- Title & User-friendly description -->
      <div class="space-y-2">
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Tizimda Kichik Uzilish Bo'ldi
        </h1>
        <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
          Sahifani yuklashda yoki ma'lumotlarni qayta ishlashda xatolik yuz berdi. Xavotir olmang, ma'lumotlaringiz xavfsiz.
        </p>
      </div>

      <!-- Actions (Self-healing & Recovery) -->
      <div class="flex flex-col gap-2.5 pt-2">
        <button
          type="button"
          @click="reloadPage"
          class="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/25 transition active:scale-95 cursor-pointer"
        >
          <RotateCw class="w-4 h-4" />
          <span>Sahifani Yangilash (Qayta Yuklash)</span>
        </button>

        <button
          type="button"
          @click="repairAndReset"
          class="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-900/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-95 cursor-pointer"
        >
          <Wrench class="w-4 h-4 text-emerald-500" />
          <span>Keshni Tozalash va Tizimni Qayta Tiklash</span>
        </button>

        <button
          type="button"
          @click="goHome"
          class="w-full py-2.5 px-4 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
        >
          <Home class="w-4 h-4" />
          <span>Boshqaruv Paneliga O'tish</span>
        </button>
      </div>

      <!-- Collapsible Technical Error Details -->
      <div class="pt-2 text-left">
        <button
          type="button"
          @click="showDetails = !showDetails"
          class="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1 mx-auto cursor-pointer"
        >
          <ChevronDown class="w-3.5 h-3.5 transition-transform" :class="{ 'rotate-180': showDetails }" />
          <span>{{ showDetails ? 'Texnik tafsilotlarni yashirish' : 'Texnik tafsilotlarni ko\'rish' }}</span>
        </button>

        <div
          v-if="showDetails"
          class="mt-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-mono text-rose-600 dark:text-rose-400 overflow-x-auto max-h-36 select-text"
        >
          <p class="font-bold mb-1">Xatolik:</p>
          <p>{{ errorMessage || 'Noma\'lum xatolik yuz berdi' }}</p>
          <p v-if="errorInfo" class="mt-2 text-slate-500 text-[9px]">{{ errorInfo }}</p>
        </div>
      </div>

      <!-- Footer Brand -->
      <div class="pt-4 text-[11px] text-slate-400 dark:text-slate-600 flex items-center justify-center gap-1.5 font-mono">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        <span>boshqar.uz — Avtomatik o'z-o'zini tiklash tizimi</span>
      </div>
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue';
import { ShieldAlert, RotateCw, Wrench, Home, ChevronDown } from 'lucide-vue-next';
import ThemeToggle from './ThemeToggle.vue';

const hasError = ref(false);
const errorMessage = ref('');
const errorInfo = ref('');
const showDetails = ref(false);

onErrorCaptured((err: any, _instance: any, info: string) => {
  console.error('[GlobalErrorBoundary Captured Error]:', err, info);
  
  // Auto-recovery for Vite dynamic import ChunkLoadErrors
  const isChunkError = /loading chunk|fetch dynamically imported module|Importing a module script failed/i.test(err?.message || '');
  if (isChunkError) {
    const reloadKey = 'ubms_auto_chunk_repair';
    const alreadyDone = sessionStorage.getItem(reloadKey);
    if (!alreadyDone) {
      sessionStorage.setItem(reloadKey, 'true');
      window.location.reload();
      return false;
    }
  }

  hasError.value = true;
  errorMessage.value = err?.message || String(err);
  errorInfo.value = info || '';
  return false; // Prevent further bubbling to avoid crashing the entire app
});

const reloadPage = () => {
  window.location.reload();
};

const repairAndReset = () => {
  // Clear any potentially corrupted view caches but preserve credentials if possible
  const token = localStorage.getItem('ubms_access_token');
  const user = localStorage.getItem('ubms_user');
  const biz = localStorage.getItem('ubms_active_business');

  localStorage.clear();
  sessionStorage.clear();

  if (token) localStorage.setItem('ubms_access_token', token);
  if (user) localStorage.setItem('ubms_user', user);
  if (biz) localStorage.setItem('ubms_active_business', biz);

  window.location.reload();
};

const goHome = () => {
  hasError.value = false;
  window.location.href = '/dashboard';
};
</script>
