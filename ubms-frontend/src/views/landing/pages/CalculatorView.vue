<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
    <header class="sticky top-0 z-50 backdrop-blur-xl bg-white/95 dark:bg-slate-950/95 border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        <router-link to="/" class="flex items-center gap-2 group">
          <AppLogo size="lg" />
        </router-link>

        <nav class="hidden md:flex items-center gap-6 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
          <router-link to="/" class="hover:text-emerald-500 transition">Bosh Sahifa</router-link>
          <router-link to="/telegram-bot" class="hover:text-emerald-500 transition">Telegram Bot</router-link>
          <router-link to="/sohalar" class="hover:text-emerald-500 transition">Sohalar</router-link>
          <router-link to="/kalkulyator" class="text-emerald-600 dark:text-emerald-400 font-bold border-b-2 border-emerald-500 py-1">Kalkulyator</router-link>
          <router-link to="/taqqoslash" class="hover:text-emerald-500 transition">Taqqoslash</router-link>
          <router-link to="/tariflar" class="hover:text-emerald-500 transition">Tariflar</router-link>
          <router-link to="/sharhlar" class="hover:text-emerald-500 transition">Sharhlar</router-link>
          <router-link to="/faq" class="hover:text-emerald-500 transition">FAQ</router-link>
        </nav>

        <div class="flex items-center gap-3">
          <ThemeToggle />
          <router-link
            to="/auth/register"
            class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-1.5"
          >
            <Sparkles class="w-4 h-4" />
            <span>14 Kun Bepul</span>
          </router-link>
        </div>
      </div>
    </header>

    <section class="py-16 sm:py-24 relative overflow-hidden bg-gradient-to-b from-emerald-500/10 via-slate-50 to-slate-50 dark:from-emerald-950/20 dark:via-slate-950 dark:to-slate-950">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/30">
          <Calculator class="w-4 h-4" />
          <span>Interaktiv ROI & Daromad Kalkulyatori</span>
        </div>

        <h1 class="text-3xl sm:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto">
          Boshqar.uz Tizimi Oylik Daromadingizni <br class="hidden sm:inline" />
          <span class="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 bg-clip-text text-transparent">
            Qanchaga Oshirishini Hisoblang
          </span>
        </h1>

        <p class="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Nasiyalarni nazorat qilish, kamomad va xatolarni yo'qotish va kassa unumdorligi oshishi hisobiga oyiga qancha sof tejamkorlikka erishishingizni ko'ring.
        </p>
      </div>
    </section>

    <section class="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Left Controls -->
          <div class="space-y-6">
            <div class="space-y-2">
              <label class="text-xs font-bold text-slate-700 dark:text-slate-300 flex justify-between">
                <span>Oylik Tushum (Savdo):</span>
                <span class="font-mono text-emerald-600 dark:text-emerald-400">{{ formatSum(monthlyRevenue) }} so'm</span>
              </label>
              <input
                type="range"
                min="10000000"
                max="500000000"
                step="5000000"
                v-model.number="monthlyRevenue"
                class="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div class="space-y-2">
              <label class="text-xs font-bold text-slate-700 dark:text-slate-300 flex justify-between">
                <span>Kunlik Cheklar Soni:</span>
                <span class="font-mono text-emerald-600 dark:text-emerald-400">{{ dailyReceipts }} ta</span>
              </label>
              <input
                type="range"
                min="10"
                max="1000"
                step="10"
                v-model.number="dailyReceipts"
                class="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div class="space-y-2">
              <label class="text-xs font-bold text-slate-700 dark:text-slate-300 flex justify-between">
                <span>Nasiya (Qarz) Ulushi (%):</span>
                <span class="font-mono text-amber-500">{{ debtShare }}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                v-model.number="debtShare"
                class="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          <!-- Right Calculation Results -->
          <div class="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4 flex flex-col justify-between">
            <div class="space-y-4">
              <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
                <span class="text-xs font-bold text-slate-500 uppercase">Kutilayotgan Oylik Sof Iqtisod:</span>
                <p class="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">+{{ formatSum(calculatedSavings) }} so'm / oy</p>
              </div>

              <div class="space-y-2 text-xs">
                <div class="flex items-center justify-between">
                  <span class="text-slate-500">Nasiya yo'qotishlarini qaytarish:</span>
                  <span class="font-bold font-mono text-slate-900 dark:text-white">+{{ formatSum(debtSavings) }} so'm</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500">Kamomad va xatolarni oldini olish (2%):</span>
                  <span class="font-bold font-mono text-slate-900 dark:text-white">+{{ formatSum(errorSavings) }} so'm</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500">Kassir vaqti tejalishi (soat):</span>
                  <span class="font-bold font-mono text-slate-900 dark:text-white">{{ savedHours }} soat / oy</span>
                </div>
              </div>
            </div>

            <router-link
              to="/auth/register"
              class="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm text-center shadow-md transition flex items-center justify-center gap-2"
            >
              <span>Ushbu Foydani 14 Kun Bepul Sinash</span>
              <ArrowRight class="w-4 h-4" />
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <footer class="py-8 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
      © 2026 Boshqar.uz — Barcha huquqlar himoyalangan.
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Calculator, Sparkles, ArrowRight } from 'lucide-vue-next';
import AppLogo from '../../../components/AppLogo.vue';
import ThemeToggle from '../../../components/ThemeToggle.vue';

const monthlyRevenue = ref(50000000);
const dailyReceipts = ref(150);
const debtShare = ref(20);

const debtSavings = computed(() => Math.round(monthlyRevenue.value * (debtShare.value / 100) * 0.15));
const errorSavings = computed(() => Math.round(monthlyRevenue.value * 0.025));
const calculatedSavings = computed(() => debtSavings.value + errorSavings.value);
const savedHours = computed(() => Math.round((dailyReceipts.value * 30 * 20) / 3600));

const formatSum = (val: number) => {
  return new Intl.NumberFormat('uz-UZ').format(val || 0);
};
</script>
