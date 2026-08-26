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
          <router-link to="/kalkulyator" class="hover:text-emerald-500 transition">Kalkulyator</router-link>
          <router-link to="/taqqoslash" class="text-emerald-600 dark:text-emerald-400 font-bold border-b-2 border-emerald-500 py-1">Taqqoslash</router-link>
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
          <ArrowLeftRight class="w-4 h-4" />
          <span>Taqqoslash va Obyektiv Tahlil</span>
        </div>

        <h1 class="text-3xl sm:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto">
          Nega Minglab Tadbirkorlar <br class="hidden sm:inline" />
          <span class="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 bg-clip-text text-transparent">
            Boshqar.uz Ni Tanlamoqda?
          </span>
        </h1>

        <p class="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Eski daftarlar, qimmat chet el dasturlari va murakkab Excel jadvallarining kamchiliklariga nuqta qo'ying.
        </p>
      </div>
    </section>

    <!-- Detailed Comparison Matrix Table -->
    <section class="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr class="bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold">
                <th class="p-4 sm:p-6">Xususiyatlar va Imkoniyatlar</th>
                <th class="p-4 sm:p-6 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-center">Boshqar.uz 🟢</th>
                <th class="p-4 sm:p-6 text-center text-slate-500">Qog'oz Daftar / Excel 📓</th>
                <th class="p-4 sm:p-6 text-center text-slate-500">Chet el ERP (Poster/Jowi) 🌍</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              <tr>
                <td class="p-4 sm:p-6 font-bold">O'zbekiston Soliq OFD Fiskallash</td>
                <td class="p-4 text-center bg-emerald-500/5 text-emerald-600 font-bold">
                  <div class="inline-flex items-center gap-1.5 justify-center"><CheckCircle2 class="w-4 h-4 text-emerald-500" /> Bepul kiritilgan</div>
                </td>
                <td class="p-4 text-center text-rose-500">
                  <div class="inline-flex items-center gap-1.5 justify-center"><XCircle class="w-4 h-4 text-rose-500" /> Umuman yo'q</div>
                </td>
                <td class="p-4 text-center text-amber-500">
                  <div class="inline-flex items-center gap-1.5 justify-center"><AlertCircle class="w-4 h-4 text-amber-500" /> Qo'shimcha to'lov</div>
                </td>
              </tr>
              <tr>
                <td class="p-4 sm:p-6 font-bold">Telegram Bot & Mini-App (TMA)</td>
                <td class="p-4 text-center bg-emerald-500/5 text-emerald-600 font-bold">
                  <div class="inline-flex items-center gap-1.5 justify-center"><CheckCircle2 class="w-4 h-4 text-emerald-500" /> Barcha hisobotlar Telegramda</div>
                </td>
                <td class="p-4 text-center text-rose-500">
                  <div class="inline-flex items-center gap-1.5 justify-center"><XCircle class="w-4 h-4 text-rose-500" /> Yo'q</div>
                </td>
                <td class="p-4 text-center text-rose-500">
                  <div class="inline-flex items-center gap-1.5 justify-center"><XCircle class="w-4 h-4 text-rose-500" /> Yo'q</div>
                </td>
              </tr>
              <tr>
                <td class="p-4 sm:p-6 font-bold">Termal Chek Chop Etish (ESC/POS)</td>
                <td class="p-4 text-center bg-emerald-500/5 text-emerald-600 font-bold">
                  <div class="inline-flex items-center gap-1.5 justify-center"><CheckCircle2 class="w-4 h-4 text-emerald-500" /> Brauzersiz 1-click print</div>
                </td>
                <td class="p-4 text-center text-rose-500">
                  <div class="inline-flex items-center gap-1.5 justify-center"><XCircle class="w-4 h-4 text-rose-500" /> Qo'lda yoziladi</div>
                </td>
                <td class="p-4 text-center text-emerald-600">
                  <div class="inline-flex items-center gap-1.5 justify-center"><CheckCircle2 class="w-4 h-4 text-emerald-500" /> Mavjud</div>
                </td>
              </tr>
              <tr>
                <td class="p-4 sm:p-6 font-bold">Oylik Obuna Narxi</td>
                <td class="p-4 text-center bg-emerald-500/5 text-emerald-600 font-bold">190 000 so'mdan</td>
                <td class="p-4 text-center text-slate-500">0 so'm (lekin zarar ko'p)</td>
                <td class="p-4 text-center text-rose-500">$40 - $120 / oy</td>
              </tr>
              <tr>
                <td class="p-4 sm:p-6 font-bold">Nasiya (Qarz) Daftari & Ogohlantirish</td>
                <td class="p-4 text-center bg-emerald-500/5 text-emerald-600 font-bold">
                  <div class="inline-flex items-center gap-1.5 justify-center"><CheckCircle2 class="w-4 h-4 text-emerald-500" /> Avtomatik SMS & Telegram</div>
                </td>
                <td class="p-4 text-center text-amber-500">
                  <div class="inline-flex items-center gap-1.5 justify-center"><AlertCircle class="w-4 h-4 text-amber-500" /> Daftarda adashish ko'p</div>
                </td>
                <td class="p-4 text-center text-amber-500">
                  <div class="inline-flex items-center gap-1.5 justify-center"><AlertCircle class="w-4 h-4 text-amber-500" /> Murakkab va noqulay</div>
                </td>
              </tr>
              <tr>
                <td class="p-4 sm:p-6 font-bold">24/7 O'zbek Tilidagi Qo'llab-quvvatlash</td>
                <td class="p-4 text-center bg-emerald-500/5 text-emerald-600 font-bold">
                  <div class="inline-flex items-center gap-1.5 justify-center"><CheckCircle2 class="w-4 h-4 text-emerald-500" /> 100% O'zbek tilida</div>
                </td>
                <td class="p-4 text-center text-rose-500">
                  <div class="inline-flex items-center gap-1.5 justify-center"><XCircle class="w-4 h-4 text-rose-500" /> Yo'q</div>
                </td>
                <td class="p-4 text-center text-rose-500">
                  <div class="inline-flex items-center gap-1.5 justify-center"><XCircle class="w-4 h-4 text-rose-500" /> Faqat Rus/Ingliz</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <footer class="py-8 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
      © 2026 Boshqar.uz — Barcha huquqlar himoyalangan.
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeftRight, Sparkles, CheckCircle2, XCircle, AlertCircle } from 'lucide-vue-next';
import AppLogo from '../../../components/AppLogo.vue';
import ThemeToggle from '../../../components/ThemeToggle.vue';
</script>
