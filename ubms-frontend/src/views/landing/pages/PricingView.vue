<template>
  <div class="min-h-screen pt-24 sm:pt-28 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 flex flex-col justify-between">
    <div>
      <!-- Unified Top Header Navigation -->
      <LandingHeader
        :is-authenticated="isAuthenticated"
        @open-demo="openDemoModal"
      />

    <section class="py-16 sm:py-24 relative overflow-hidden bg-gradient-to-b from-emerald-500/10 via-slate-50 to-slate-50 dark:from-emerald-950/20 dark:via-slate-950 dark:to-slate-950">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/30">
          <CreditCard class="w-4 h-4" />
          <span>Shaffof va Hamyonbop Obuna Tariflari</span>
        </div>

        <h1 class="text-3xl sm:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto">
          Biznesingiz Hajmiga Mos <br class="hidden sm:inline" />
          <span class="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 bg-clip-text text-transparent">
            Cheksiz Imkoniyatli Tariflar
          </span>
        </h1>

        <p class="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Yashirin to'lovlar yo'q. 14 kun bepul sinov muddatidan so'ng istalgan vaqtda obunani o'zgartirishingiz mumkin.
        </p>

        <!-- Annual Billing Discount Toggle -->
        <div class="flex items-center justify-center gap-3 pt-4">
          <span class="text-xs font-bold" :class="!isAnnual ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'">Oylik to'lov</span>
          <button
            type="button"
            @click="isAnnual = !isAnnual"
            class="w-12 h-6 rounded-full bg-slate-300 dark:bg-slate-700 p-0.5 transition cursor-pointer flex items-center"
            :class="{ 'bg-emerald-600!': isAnnual }"
          >
            <div class="w-5 h-5 rounded-full bg-white transition-transform duration-300" :class="{ 'translate-x-6': isAnnual }"></div>
          </button>
          <span class="text-xs font-bold flex items-center gap-1" :class="isAnnual ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'">
            Yillik to'lov
            <span class="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-600 text-[10px] font-black font-mono">-20% Chegirma</span>
          </span>
        </div>
      </div>
    </section>

    <!-- 3 Main Pricing Cards -->
    <section class="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Starter Plan -->
      <div class="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm flex flex-col justify-between">
        <div class="space-y-4">
          <span class="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">Starter</span>
          <h2 class="text-2xl font-black">Kichik Do'kon</h2>
          <p class="text-xs text-slate-500">1 ta kassa va kichik savdo shoxobchalari uchun.</p>
          <div class="pt-2">
            <span class="text-3xl font-black font-mono">{{ isAnnual ? '152,000' : '190,000' }}</span>
            <span class="text-xs text-slate-500"> so'm / oy</span>
          </div>
          <div class="space-y-2.5 pt-4 text-xs">
            <div class="flex items-center gap-2"><CheckCircle2 class="w-4 h-4 text-emerald-500 shrink-0" /><span>1 ta Filial & 1 ta Kassa</span></div>
            <div class="flex items-center gap-2"><CheckCircle2 class="w-4 h-4 text-emerald-500 shrink-0" /><span>2 ta Xodim ruxsati</span></div>
            <div class="flex items-center gap-2"><CheckCircle2 class="w-4 h-4 text-emerald-500 shrink-0" /><span>1 000 ta Tovar sklad</span></div>
            <div class="flex items-center gap-2"><CheckCircle2 class="w-4 h-4 text-emerald-500 shrink-0" /><span>Telegram Bildirishnomalar</span></div>
          </div>
        </div>
        <router-link to="/auth/register" class="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs text-center hover:bg-emerald-600 hover:text-white transition">Boshlash (14 Kun Bepul)</router-link>
      </div>

      <!-- PRO Plan (Most Popular) -->
      <div class="p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-emerald-500 relative space-y-6 shadow-xl flex flex-col justify-between scale-105">
        <div class="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-black uppercase tracking-wider shadow-sm">Eng Ommabop</div>
        <div class="space-y-4">
          <span class="px-3 py-1 rounded-lg bg-emerald-500/15 text-xs font-bold text-emerald-600 dark:text-emerald-400">PRO Plan</span>
          <h2 class="text-2xl font-black">Rivojlangan Biznes</h2>
          <p class="text-xs text-slate-500">O'rtacha do'konlar, restoran va dorixonalar uchun.</p>
          <div class="pt-2">
            <span class="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">{{ isAnnual ? '312,000' : '390,000' }}</span>
            <span class="text-xs text-slate-500"> so'm / oy</span>
          </div>
          <div class="space-y-2.5 pt-4 text-xs">
            <div class="flex items-center gap-2"><CheckCircle2 class="w-4 h-4 text-emerald-500 shrink-0" /><span>3 ta Filial & 5 ta Kassa</span></div>
            <div class="flex items-center gap-2"><CheckCircle2 class="w-4 h-4 text-emerald-500 shrink-0" /><span>Cheksiz Tovar va Sklad</span></div>
            <div class="flex items-center gap-2"><CheckCircle2 class="w-4 h-4 text-emerald-500 shrink-0" /><span>Soliq OFD Fiskallash</span></div>
            <div class="flex items-center gap-2"><CheckCircle2 class="w-4 h-4 text-emerald-500 shrink-0" /><span>Telegram Bot & Mini-App POS</span></div>
            <div class="flex items-center gap-2"><CheckCircle2 class="w-4 h-4 text-emerald-500 shrink-0" /><span>Nasiya CRM & Limitlar</span></div>
          </div>
        </div>
        <router-link to="/auth/register" class="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs text-center shadow-md transition">14 Kun Bepul Boshlash</router-link>
      </div>

      <!-- Enterprise Plan -->
      <div class="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm flex flex-col justify-between">
        <div class="space-y-4">
          <span class="px-3 py-1 rounded-lg bg-purple-500/15 text-xs font-bold text-purple-600 dark:text-purple-400">Enterprise</span>
          <h2 class="text-2xl font-black">Yirik Tarmoq</h2>
          <p class="text-xs text-slate-500">Supermarketlar va tarmoq korxonalar uchun.</p>
          <div class="pt-2">
            <span class="text-3xl font-black font-mono">{{ isAnnual ? '632,000' : '790,000' }}</span>
            <span class="text-xs text-slate-500"> so'm / oy</span>
          </div>
          <div class="space-y-2.5 pt-4 text-xs">
            <div class="flex items-center gap-2"><CheckCircle2 class="w-4 h-4 text-emerald-500 shrink-0" /><span>Cheksiz Filial va Kassalar</span></div>
            <div class="flex items-center gap-2"><CheckCircle2 class="w-4 h-4 text-emerald-500 shrink-0" /><span>Uzcard / Humo POS Terminal</span></div>
            <div class="flex items-center gap-2"><CheckCircle2 class="w-4 h-4 text-emerald-500 shrink-0" /><span>Shaxsiy Menejer & Support</span></div>
            <div class="flex items-center gap-2"><CheckCircle2 class="w-4 h-4 text-emerald-500 shrink-0" /><span>API Integratsiya ruxsati</span></div>
          </div>
        </div>
        <router-link to="/auth/register" class="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs text-center hover:bg-emerald-600 hover:text-white transition">Bog'lanish va Sinash</router-link>
      </div>
    </section>
    </div>
    <LandingFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { CreditCard, CheckCircle2, Sparkles } from 'lucide-vue-next';
import LandingHeader from '../components/LandingHeader.vue';
import LandingFooter from '../components/LandingFooter.vue';
import { useAuthStore } from '../../../stores/auth.store';

const router = useRouter();
const authStore = useAuthStore();

const isAuthenticated = computed(() => {
  return !!authStore.token && !!authStore.user;
});

const openDemoModal = () => {
  router.push('/#demo');
};

const isAnnual = ref(false);
</script>
