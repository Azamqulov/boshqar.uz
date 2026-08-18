<template>
  <footer data-aos="fade-up" class="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800/80 py-12 text-slate-500 dark:text-slate-400 text-xs">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div class="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div class="flex flex-col items-center md:items-start gap-2">
          <AppLogo size="md" />
          <p class="text-[11px] text-slate-400 max-w-sm">
            O'zbekistondagi savdo, restoran va xizmat ko'rsatish bizneslari uchun eng zamonaviy bulutli boshqaruv platformasi.
          </p>
        </div>

        <div class="flex flex-wrap items-center justify-center gap-5 sm:gap-7 font-semibold text-xs text-slate-600 dark:text-slate-300">
          <router-link to="/security" class="hover:text-emerald-500 dark:hover:text-emerald-400 transition">Xavfsizlik</router-link>
          <router-link to="/privacy" class="hover:text-emerald-500 dark:hover:text-emerald-400 transition">Maxfiylik Siyosati</router-link>
          <router-link to="/cookies" class="hover:text-emerald-500 dark:hover:text-emerald-400 transition">Cookie Siyosati</router-link>
          <router-link to="/terms" class="hover:text-emerald-500 dark:hover:text-emerald-400 transition">Foydalanish Shartlari</router-link>
          <router-link to="/guide" class="hover:text-emerald-500 dark:hover:text-emerald-400 transition">Qo'llanma</router-link>
        </div>
      </div>

      <div class="pt-6 border-t border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
        <div>
          © {{ new Date().getFullYear() }} Boshqar.uz. Barcha huquqlar himoyalangan.
        </div>
        <div class="flex items-center gap-5">
          <a href="tel:+998770404624" class="hover:text-emerald-500 transition font-semibold">+998 (77) 040-46-24</a>
          <a href="https://t.me/boshqaruz" target="_blank" rel="noopener noreferrer" class="hover:text-emerald-500 transition font-semibold">Telegram: @boshqaruz</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import AppLogo from '../../../components/AppLogo.vue';
</script>
