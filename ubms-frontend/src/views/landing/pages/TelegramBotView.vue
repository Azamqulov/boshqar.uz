<template>
  <div class="min-h-screen pt-20 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
    <!-- Unified Top Header Navigation -->
    <LandingHeader
      :is-authenticated="isAuthenticated"
      @open-demo="openDemoModal"
    />

    <!-- Hero Banner -->
    <section class="py-16 sm:py-24 relative overflow-hidden bg-gradient-to-b from-emerald-500/10 via-slate-50 to-slate-50 dark:from-emerald-950/20 dark:via-slate-950 dark:to-slate-950">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/30">
          <Send class="w-4 h-4" />
          <span>Rasmiy Telegram Bot & Mini-App Integratsiyasi</span>
        </div>

        <h1 class="text-3xl sm:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto">
          Telegram Orqali Butun Biznesingizni <br class="hidden sm:inline" />
          <span class="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 bg-clip-text text-transparent">
            Telefoningizdan Boshqaring
          </span>
        </h1>

        <p class="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Dunyoning qaysi nuqtasida bo'lishingizdan qat'i nazar, do'kondagi har bir savdo cheki, smena yopilishi, qarzlar va moliyaviy hisobotlar Telegram botingizga sekundiga yetib keladi.
        </p>

        <div class="pt-4 flex flex-wrap justify-center items-center gap-4">
          <a
            href="https://t.me/Boshqar_uzbot"
            target="_blank"
            rel="noopener noreferrer"
            class="px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-emerald-600/25 transition hover:scale-105 active:scale-95 flex items-center gap-3"
          >
            <Send class="w-5 h-5" />
            <span>@Boshqar_uzbot ni Ishga Tushirish</span>
          </a>
          <router-link
            to="/auth/register"
            class="px-8 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold text-sm sm:text-base shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-2"
          >
            <Sparkles class="w-5 h-5 text-emerald-500" />
            <span>14 Kun Bepul Ro'yxatdan O'tish</span>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Deep Feature Grid Section -->
    <section class="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div class="text-center max-w-3xl mx-auto space-y-3">
        <h2 class="text-2xl sm:text-4xl font-black">Telegram Bot Ning Barcha Imkoniyatlari</h2>
        <p class="text-slate-600 dark:text-slate-400 text-sm">Biznes egalari, menejerlar va kassirlar uchun maxsus ishlab chiqilgan vositalar:</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm hover:border-emerald-500/50 transition">
          <div class="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Receipt class="w-6 h-6" />
          </div>
          <h3 class="text-lg font-bold">1. Real-Time Savdo Bildirishnomalari</h3>
          <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Kassir har bir chekni urishi bilan savdo summasi, to'lov turi (naqd, karta, nasiya), sotilgan tovarlar va mijoz ismi Telegramga push-bildirishnoma bo'lib tushadi.
          </p>
        </div>

        <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm hover:border-emerald-500/50 transition">
          <div class="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <BarChart3 class="w-6 h-6" />
          </div>
          <h3 class="text-lg font-bold">2. Avtomatik 21:00 Kunlik Hisobot</h3>
          <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Har kuni kechqurun soat 21:00 da bot sizga kunlik jami tushum, sof foyda, tushum taqsimoti va sotilgan top 5 ta tovarlar ro'yxatini ASCII progress bar bilan tayyorlab beradi.
          </p>
        </div>

        <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm hover:border-emerald-500/50 transition">
          <div class="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <AlertTriangle class="w-6 h-6" />
          </div>
          <h3 class="text-lg font-bold">3. Kam Qolgan Tovar Ogohlantirishi</h3>
          <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Omborda biror tovar belgilangan minimal miqdordan kam qolsa, bot ta'minotchiga yangi partiya buyurtma berishingiz uchun zudlik bilan signal beradi.
          </p>
        </div>

        <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm hover:border-emerald-500/50 transition">
          <div class="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <ShieldCheck class="w-6 h-6" />
          </div>
          <h3 class="text-lg font-bold">4. Smena Yopilishi va Kassa Farqi</h3>
          <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Kassir smenani yopganida kassa boshlang'ich summasi, kunlik naqd tushum va kassadagi haqiqiy pul mosligi tekshirilib, farq va xatolar hisoboti yuboriladi.
          </p>
        </div>

        <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm hover:border-emerald-500/50 transition">
          <div class="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <Bot class="w-6 h-6" />
          </div>
          <h3 class="text-lg font-bold">5. Boshqar AI Intellect Assistenti</h3>
          <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            `/ai` buyrug'i orqali sun'iy intellectdan "Qaysi tovarlar ko'proq foyda keltiryapti?" yoki "Keyingi oyga qancha zaxira olish kerak?" kabi biznes tahlillarni so'rang.
          </p>
        </div>

        <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm hover:border-emerald-500/50 transition">
          <div class="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Smartphone class="w-6 h-6" />
          </div>
          <h3 class="text-lg font-bold">6. Telegram Mini-App (TMA) POS</h3>
          <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Mobil brauzer yoki Telegram ichida 1-click orqali to'liq POS kassaga o'ting, tovarlarni savatga soling va chek chiqaring.
          </p>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-8 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
      © 2026 Boshqar.uz — Barcha huquqlar himoyalangan.
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { Send, Receipt, BarChart3, AlertTriangle, ShieldCheck, Bot, Smartphone, Sparkles } from 'lucide-vue-next';
import LandingHeader from '../components/LandingHeader.vue';
import { useAuthStore } from '../../../stores/auth.store';

const router = useRouter();
const authStore = useAuthStore();

const isAuthenticated = computed(() => {
  return !!authStore.token && !!authStore.user;
});

const openDemoModal = () => {
  router.push('/#demo');
};
</script>
