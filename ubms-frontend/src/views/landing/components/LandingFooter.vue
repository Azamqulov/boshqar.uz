<template>
  <footer data-aos="fade-up" class="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800/80 py-12 text-slate-500 dark:text-slate-400 text-xs">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
      <div class="flex items-center gap-3">
        <AppLogo size="md" />
      </div>

      <div class="flex items-center gap-6 font-semibold">
        <a href="tel:+998901234567" class="hover:text-emerald-500 dark:hover:text-emerald-400 transition">+998 (90) 123-45-67</a>
        <a href="https://t.me/boshqaruz" target="_blank" rel="noopener noreferrer" class="hover:text-emerald-500 dark:hover:text-emerald-400 transition">Telegram: @boshqaruz</a>
        <router-link to="/guide" class="hover:text-emerald-500 dark:hover:text-emerald-400 transition">Qo'llanma</router-link>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import AppLogo from '../../../components/AppLogo.vue';
</script>
