<template>
  <header class="sticky top-0 z-50 backdrop-blur-xl bg-white/95 dark:bg-slate-950/95 border-b border-slate-200/80 dark:border-slate-800/80 transition-all duration-300 shadow-xs">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
      <!-- Brand Logo -->
      <div class="shrink-0">
        <router-link to="/">
          <AppLogo size="lg" />
        </router-link>
      </div>

      <!-- Desktop Navigation Links -->
      <nav class="hidden lg:flex items-center gap-4 xl:gap-6 text-xs xl:text-sm font-semibold text-slate-600 dark:text-slate-300 shrink-0">
        <router-link to="/#telegram" class="hover:text-emerald-500 dark:hover:text-emerald-400 transition-all duration-200 hover:-translate-y-0.5 relative group py-1 whitespace-nowrap">
          <span>Telegram Bot</span>
          <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 rounded-full transition-all duration-300 group-hover:w-full"></span>
        </router-link>
        <router-link to="/#sectors" class="hover:text-emerald-500 dark:hover:text-emerald-400 transition-all duration-200 hover:-translate-y-0.5 relative group py-1 whitespace-nowrap">
          <span>Sohalar</span>
          <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 rounded-full transition-all duration-300 group-hover:w-full"></span>
        </router-link>
        <router-link to="/#calculator" class="hover:text-emerald-500 dark:hover:text-emerald-400 transition-all duration-200 hover:-translate-y-0.5 relative group py-1 whitespace-nowrap">
          <span>Kalkulyator</span>
          <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 rounded-full transition-all duration-300 group-hover:w-full"></span>
        </router-link>
        <router-link to="/#pricing" class="hover:text-emerald-500 dark:hover:text-emerald-400 transition-all duration-200 hover:-translate-y-0.5 relative group py-1 whitespace-nowrap">
          <span>Tariflar</span>
          <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 rounded-full transition-all duration-300 group-hover:w-full"></span>
        </router-link>
        <router-link to="/#reviews" class="hover:text-emerald-500 dark:hover:text-emerald-400 transition-all duration-200 hover:-translate-y-0.5 relative group py-1 whitespace-nowrap">
          <span>Sharhlar</span>
          <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 rounded-full transition-all duration-300 group-hover:w-full"></span>
        </router-link>
        <router-link to="/guide" class="hover:text-emerald-500 dark:hover:text-emerald-400 transition-all duration-200 hover:-translate-y-0.5 relative group py-1 whitespace-nowrap">
          <span>Qo'llanma</span>
          <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 rounded-full transition-all duration-300 group-hover:w-full"></span>
        </router-link>
      </nav>

      <!-- Right Side: ThemeToggle & Auth Actions -->
      <div class="flex items-center gap-2 sm:gap-3 shrink-0">
        <ThemeToggle />

        <router-link
          to="/auth/login"
          class="px-2.5 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition hover:scale-105 active:scale-95"
        >
          Kirish
        </router-link>

        <router-link
          to="/auth/register"
          class="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 hover:scale-105 active:scale-95 text-white shadow-sm transition-all flex items-center gap-1.5"
        >
          <Sparkles class="w-3.5 h-3.5" />
          <span>14 Kun Bepul</span>
        </router-link>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next';
import AppLogo from '@/components/AppLogo.vue';
import ThemeToggle from '@/components/ThemeToggle.vue';
</script>
