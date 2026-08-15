<template>
  <header class="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/95 dark:bg-slate-950/95 border-b border-slate-200/80 dark:border-slate-800/80 transition-all duration-300 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
      <!-- Brand Logo (Official AppLogo) -->
      <AppLogo size="lg" />

      <!-- Desktop Navigation Links with animated underlines & hover lifts -->
      <nav class="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
        <a href="#about" class="hover:text-emerald-500 dark:hover:text-emerald-400 transition-all duration-200 hover:-translate-y-0.5 relative group py-1">
          <span>Biz Haqimizda</span>
          <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 rounded-full transition-all duration-300 group-hover:w-full"></span>
        </a>
        <a href="#features" class="hover:text-emerald-500 dark:hover:text-emerald-400 transition-all duration-200 hover:-translate-y-0.5 relative group py-1">
          <span>Imkoniyatlar</span>
          <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 rounded-full transition-all duration-300 group-hover:w-full"></span>
        </a>
        <a href="#pricing" class="hover:text-emerald-500 dark:hover:text-emerald-400 transition-all duration-200 hover:-translate-y-0.5 relative group py-1">
          <span>Tariflar</span>
          <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 rounded-full transition-all duration-300 group-hover:w-full"></span>
        </a>
        <a href="#faq" class="hover:text-emerald-500 dark:hover:text-emerald-400 transition-all duration-200 hover:-translate-y-0.5 relative group py-1">
          <span>Savol-Javob</span>
          <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 rounded-full transition-all duration-300 group-hover:w-full"></span>
        </a>
        <button
          type="button"
          @click="$emit('openDemo')"
          class="hover:text-emerald-500 dark:hover:text-emerald-400 transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold cursor-pointer hover:scale-105 active:scale-95"
        >
          <Play class="w-3.5 h-3.5 fill-current" />
          <span>Jonli Demo Ochish</span>
        </button>
      </nav>

      <!-- Right Side: ThemeToggle & Auth Actions -->
      <div class="flex items-center gap-3">
        <!-- Theme Toggle (Light / Dark mode) -->
        <ThemeToggle />

        <router-link
          v-if="isAuthenticated"
          to="/dashboard"
          class="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 hover:scale-105 active:scale-95 text-white shadow-sm transition-all flex items-center gap-1.5"
        >
          <span>Boshqaruv Paneli</span>
          <ArrowRight class="w-4 h-4" />
        </router-link>

        <template v-else>
          <router-link
            to="/auth/login"
            class="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-300 dark:border-slate-800 transition hover:scale-105 active:scale-95"
          >
            Kirish
          </router-link>

          <button
            type="button"
            @click="$emit('openDemo')"
            class="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 hover:scale-105 active:scale-95 text-white shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Play class="w-3.5 h-3.5 fill-current" />
            <span>Demoni Boshlash</span>
          </button>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Play, ArrowRight } from 'lucide-vue-next';
import AppLogo from '../../../components/AppLogo.vue';
import ThemeToggle from '../../../components/ThemeToggle.vue';

defineProps<{
  isAuthenticated: boolean;
}>();

defineEmits<{
  (e: 'openDemo'): void;
}>();
</script>
