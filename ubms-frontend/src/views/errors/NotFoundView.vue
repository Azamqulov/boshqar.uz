<template>
  <div class="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden text-slate-100 select-none">
    <!-- Ambient Background Glows -->
    <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-1/4 left-1/3 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

    <div class="max-w-md w-full text-center relative z-10 space-y-6 animate-fade-in">
      <!-- 404 Badge & Floating Icon -->
      <div class="relative inline-block">
        <div class="text-8xl sm:text-9xl font-black tracking-tighter bg-gradient-to-br from-emerald-400 via-teal-300 to-cyan-500 bg-clip-text text-transparent drop-shadow-2xl">
          404
        </div>
        <div class="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 backdrop-blur-md flex items-center justify-center text-emerald-400 shadow-lg animate-bounce">
          <Compass class="w-6 h-6" />
        </div>
      </div>

      <!-- Title & Description -->
      <div class="space-y-2">
        <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Sahifa Topilmadi
        </h1>
        <p class="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
          Siz qidirayotgan sahifa manzili noto'g'ri kiritilgan, nomi o'zgartirilgan yoki tizimdan o'chirilgan bo'lishi mumkin.
        </p>
      </div>

      <!-- Quick Action Buttons -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          type="button"
          @click="goBack"
          class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-95 btn-interactive"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>Orqaga Qaytish</span>
        </button>

        <button
          type="button"
          @click="goHome"
          class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition active:scale-95 btn-interactive"
        >
          <Home class="w-4 h-4" />
          <span>Boshqaruv Paneliga</span>
        </button>
      </div>

      <!-- Footer Brand -->
      <div class="pt-8 text-[11px] text-slate-600 flex items-center justify-center gap-1.5 font-mono">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        <span>boshqar.uz — Bulutli boshqaruv platformasi</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { Compass, ArrowLeft, Home } from 'lucide-vue-next';
import { useAuthStore } from '../../stores/auth.store';

const router = useRouter();
const authStore = useAuthStore();

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    goHome();
  }
};

const goHome = () => {
  const role = (authStore.activeBusiness?.role || '').toLowerCase();
  const isSuper = authStore.user?.isSuperAdmin;
  const isWorker = !isSuper && role !== 'owner' && role !== 'admin';
  if (isWorker) {
    router.push('/pos');
  } else {
    router.push('/dashboard');
  }
};
</script>
