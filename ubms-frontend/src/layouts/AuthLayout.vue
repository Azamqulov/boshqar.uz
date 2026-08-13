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
      <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-xl shadow-emerald-500/20 text-white font-extrabold text-2xl mb-3">
        B
      </div>
      <h2 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">boshqar.uz</h2>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Universal Biznes Boshqaruv Tizimi (UBMS SaaS)</p>
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
</script>
