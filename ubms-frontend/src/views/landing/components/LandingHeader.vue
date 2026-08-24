<template>
  <header class="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/95 dark:bg-slate-950/95 border-b border-slate-200/80 dark:border-slate-800/80 transition-all duration-300 shadow-xs">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
      <!-- Brand Logo -->
      <div class="shrink-0">
        <AppLogo size="lg" />
      </div>

      <!-- Desktop Navigation Links with animated dropdown & hover lifts -->
      <nav class="hidden lg:flex items-center gap-4 xl:gap-6 text-xs xl:text-sm font-semibold text-slate-600 dark:text-slate-300 shrink-0">
        <!-- Xizmatlar Dropdown -->
        <div class="relative group py-2" @mouseenter="isDropdownOpen = true" @mouseleave="isDropdownOpen = false">
          <button
            type="button"
            class="flex items-center gap-1.5 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all cursor-pointer whitespace-nowrap"
          >
            <span>Xizmatlar & Yechimlar</span>
            <ChevronDown class="w-4 h-4 transition-transform duration-200" :class="{ 'rotate-180': isDropdownOpen }" />
          </button>

          <!-- Dropdown Card -->
          <div
            v-if="isDropdownOpen"
            class="absolute top-full left-0 w-64 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-1 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <router-link
              to="/telegram-bot"
              class="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              <Send class="w-4 h-4 text-emerald-500" />
              <div>
                <div class="font-bold text-xs">Telegram Bot</div>
                <div class="text-[10px] text-slate-400">Kunlik hisobotlar & TMA POS</div>
              </div>
            </router-link>

            <router-link
              to="/sohalar"
              class="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              <Layers class="w-4 h-4 text-teal-500" />
              <div>
                <div class="font-bold text-xs">Sohalar & Modullar</div>
                <div class="text-[10px] text-slate-400">Do'kon, Restoran, Dorixona...</div>
              </div>
            </router-link>

            <router-link
              to="/tahlil"
              class="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              <Calculator class="w-4 h-4 text-amber-500" />
              <div>
                <div class="font-bold text-xs">Kalkulyator & Taqqoslash</div>
                <div class="text-[11px] text-slate-400">Daromad tahlili va matrisa</div>
              </div>
            </router-link>
          </div>
        </div>

        <router-link to="/tariflar" class="hover:text-emerald-500 dark:hover:text-emerald-400 transition-all duration-200 hover:-translate-y-0.5 relative group py-1 whitespace-nowrap">
          <span>Tariflar</span>
          <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 rounded-full transition-all duration-300 group-hover:w-full"></span>
        </router-link>

        <router-link to="/yordam" class="hover:text-emerald-500 dark:hover:text-emerald-400 transition-all duration-200 hover:-translate-y-0.5 relative group py-1 whitespace-nowrap">
          <span>Sharhlar & FAQ</span>
          <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 rounded-full transition-all duration-300 group-hover:w-full"></span>
        </router-link>

        <router-link to="/aloqa" class="hover:text-emerald-500 dark:hover:text-emerald-400 transition-all duration-200 hover:-translate-y-0.5 relative group py-1 whitespace-nowrap">
          <span>Aloqa</span>
          <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 rounded-full transition-all duration-300 group-hover:w-full"></span>
        </router-link>
      </nav>

      <!-- Right Side: ThemeToggle & Auth Actions -->
      <div class="flex items-center gap-2 sm:gap-3 shrink-0">
        <!-- Theme Toggle (Light / Dark mode) -->
        <ThemeToggle />

        <router-link
          v-if="isAuthenticated"
          to="/dashboard"
          class="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 hover:scale-105 active:scale-95 text-white shadow-xs transition-all flex items-center gap-1.5"
        >
          <span>Boshqaruv Paneli</span>
          <ArrowRight class="w-4 h-4" />
        </router-link>

        <template v-else>
          <!-- Quick Virtual Demo Trigger -->
          <button
            type="button"
            @click="$emit('openDemo')"
            class="px-2.5 sm:px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 transition hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <Play class="w-3.5 h-3.5 fill-current" />
            <span class="hidden sm:inline">Jonli Demo</span>
            <span class="sm:hidden">Demo</span>
          </button>

          <!-- Login Link -->
          <router-link
            to="/auth/login"
            class="px-2.5 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition hover:scale-105 active:scale-95"
          >
            Kirish
          </router-link>

          <!-- Real Account Registration Button (14 days free trial) -->
          <router-link
            to="/auth/register"
            class="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 hover:scale-105 active:scale-95 text-white shadow-sm transition-all flex items-center gap-1.5"
          >
            <Sparkles class="w-3.5 h-3.5" />
            <span>14 Kun Bepul</span>
          </router-link>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Play, ArrowRight, Sparkles, ChevronDown, Send, Layers, Calculator } from 'lucide-vue-next';
import AppLogo from '../../../components/AppLogo.vue';
import ThemeToggle from '../../../components/ThemeToggle.vue';

defineProps<{
  isAuthenticated: boolean;
}>();

defineEmits<{
  (e: 'openDemo'): void;
}>();

const isDropdownOpen = ref(false);
</script>
