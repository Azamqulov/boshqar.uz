<template>
  <div class="flex flex-col shrink-0">
    <!-- DEMO WORKSPACE WATERMARK BANNER (CLICKABLE DIRECTLY TO REGISTER) -->
    <div
      v-if="isDemo"
      @click="$emit('goToRegister')"
      class="bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-900 text-white px-4 py-2 text-xs font-bold flex items-center justify-between gap-3 shadow-md shrink-0 z-20 hover:brightness-105 transition group cursor-pointer"
    >
      <div class="flex items-center gap-2.5 min-w-0">
        <span class="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shrink-0">Demo Rejim</span>
        <span class="truncate">
          Tizimni haqiqiy biznesingizda ishlatish, Telegram AI Bot va barcha PRO imkoniyatlarni ochish uchun ro'yxatdan o'ting.
        </span>
      </div>
      <div class="shrink-0 flex items-center gap-1.5 px-3.5 py-1 rounded-xl bg-white text-emerald-800 group-hover:bg-emerald-50 text-[11px] font-black shadow-sm transition">
        <Sparkles class="w-3.5 h-3.5 text-amber-500" />
        <span>14 Kun Bepul Boshlash →</span>
      </div>
    </div>

    <!-- Top Header -->
    <header
      class="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-3.5 sm:px-6 z-10 shrink-0">
      <div class="flex items-center space-x-2.5 sm:space-x-3">
        <button @click="$emit('toggleMobileSidebar')"
          class="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="Menyuni ochish">
          <Menu class="w-5 h-5" />
        </button>

        <!-- Quick Toggle button in topbar if collapsed -->
        <button v-if="isSidebarCollapsed" @click="$emit('expandSidebar')"
          class="hidden md:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          title="Sidebarni ochish">
          <PanelLeftOpen class="w-4 h-4 text-emerald-500" />
          <span>Kengaytirish</span>
        </button>

        <!-- Branch badge -->
        <div
          class="flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs truncate">
          <Store class="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
          <span class="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[120px] sm:max-w-[200px]">{{ activeBusinessName || 'Boshqar.uz' }}</span>
          <span class="hidden sm:inline text-slate-400 dark:text-slate-500">•</span>
          <span class="hidden sm:inline text-emerald-600 dark:text-emerald-400 font-semibold uppercase">{{ activeBusinessType || 'SHOP' }}</span>
        </div>

        <!-- Currency Rate Ticker Badge (Auto CBU vs Custom Manual) -->
        <router-link
          v-if="showCurrencyTicker"
          to="/settings?tab=profile"
          class="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition shadow-2xs group cursor-pointer"
          :class="currencyRateMode === 'custom'
            ? 'bg-gradient-to-r from-amber-500/15 via-orange-500/5 to-transparent border-amber-500/30 text-amber-900 dark:text-amber-200 hover:border-amber-500/60'
            : 'bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-500/20 text-slate-700 dark:text-slate-300 hover:border-emerald-500/40'"
          :title="currencyRateMode === 'custom'
            ? 'Maxsus (qo\'lda kiritilgan) kurs faol. O\'zgartirish uchun bosing.'
            : `Markaziy Bank (CBU) kursi faol. Sana: ${usdDate || 'Bugun'}`"
        >
          <span class="flex h-2 w-2 relative">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" :class="currencyRateMode === 'custom' ? 'bg-amber-400' : 'bg-emerald-400'"></span>
            <span class="relative inline-flex rounded-full h-2 w-2" :class="currencyRateMode === 'custom' ? 'bg-amber-500' : 'bg-emerald-500'"></span>
          </span>
          <span class="text-[11px] font-black" :class="currencyRateMode === 'custom' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'">
            {{ currencyRateMode === 'custom' ? 'Maxsus:' : 'CBU:' }}
          </span>
          <span class="text-[11px] text-slate-800 dark:text-slate-200">$1={{ usdRate.toLocaleString('uz-UZ') }}</span>
          <span class="text-slate-400">|</span>
          <span class="text-[11px] text-slate-800 dark:text-slate-200">₽1={{ rubRate.toLocaleString('uz-UZ') }}</span>
        </router-link>
      </div>

      <!-- Right Header Actions: POS, Theme Toggle, Settings -->
      <div class="flex items-center space-x-2 sm:space-x-3">
        <router-link to="/pos"
          class="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition btn-interactive">
          <Zap class="w-3.5 h-3.5" />
          <span>Tezkor Sotuv</span>
        </router-link>

        <!-- Theme Toggle Switcher -->
        <ThemeToggle />

        <!-- Guide & AI Center shortcut -->
        <router-link to="/guide"
          class="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
          :class="{ 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40': $route.path === '/guide' }"
          title="Qo'llanma & Boshqar AI">
          <BookOpen class="w-5 h-5" />
        </router-link>

        <router-link to="/settings"
          class="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="Sozlamalar">
          <Settings class="w-5 h-5" />
        </router-link>
      </div>
    </header>
  </div>
</template>

<script setup lang="ts">
import {
  Menu,
  PanelLeftOpen,
  Store,
  Zap,
  BookOpen,
  Settings,
  Sparkles,
} from 'lucide-vue-next';
import ThemeToggle from './ThemeToggle.vue';

defineProps<{
  isSidebarCollapsed: boolean;
  activeBusinessName?: string;
  activeBusinessType?: string;
  showCurrencyTicker?: boolean;
  currencyRateMode?: string;
  usdRate: number;
  rubRate: number;
  usdDate?: string;
  isDemo?: boolean;
}>();

defineEmits<{
  (e: 'toggleMobileSidebar'): void;
  (e: 'expandSidebar'): void;
  (e: 'goToRegister'): void;
}>();
</script>
