<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-200">
    <!-- Top Right Theme Switcher -->
    <div class="absolute top-4 right-4 z-20">
      <ThemeToggle />
    </div>

    <!-- Background decorative ambient blobs -->
    <div class="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500/10 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

    <div class="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6 z-10">
      <div class="flex justify-center mb-2">
        <AppLogo size="xl" />
      </div>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Universal Biznes Boshqaruv Tizimi</p>
    </div>

    <div class="sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0">
      <div class="glass-card rounded-2xl p-6 sm:p-8">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ThemeToggle from '../components/ThemeToggle.vue';
import AppLogo from '../components/AppLogo.vue';
</script>
