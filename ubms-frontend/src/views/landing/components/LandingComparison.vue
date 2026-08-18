<template>
  <section id="compare" class="py-24 relative overflow-hidden bg-white dark:bg-slate-950">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Heading -->
      <div data-aos="fade-up" class="text-center max-w-3xl mx-auto space-y-4 mb-16">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-500/20">
          <Scale class="w-3.5 h-3.5" />
          <span>Ochiq Taqqoslash</span>
        </div>
        <h2 class="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Nega Aynan <span class="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-500 bg-clip-text text-transparent">Boshqar.uz</span>?
        </h2>
        <p class="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
          2026-yilgi zamonaviy biznesingiz uchun eski usullardan voz kechish vaqti keldi.
        </p>
      </div>

      <!-- Comparison Matrix Table / Cards -->
      <div data-aos="fade-up" data-aos-delay="100" class="overflow-x-auto pb-4">
        <table class="w-full min-w-[700px] text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-200 dark:border-slate-800">
              <th class="py-4 px-4 text-xs font-black uppercase tracking-wider text-slate-400 w-1/3">
                Xususiyatlar va Imkoniyatlar
              </th>
              <th class="py-4 px-4 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 w-1/5 text-center">
                Qog'oz Daftar / Excel
              </th>
              <th class="py-4 px-4 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 w-1/5 text-center">
                Eski Dasturlar (1C va b.)
              </th>
              <th class="py-4 px-6 text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 w-1/4 text-center bg-emerald-500/10 rounded-t-2xl border-x-2 border-t-2 border-emerald-500">
                boshqar.uz SaaS v2.0
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs sm:text-sm">
            <tr v-for="(row, idx) in comparisonRows" :key="idx" class="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
              <!-- Feature Name & Description -->
              <td class="py-4 px-4 font-semibold text-slate-900 dark:text-white">
                <div>{{ row.title }}</div>
                <div class="text-[11px] text-slate-400 font-normal mt-0.5">{{ row.desc }}</div>
              </td>

              <!-- Paper / Excel -->
              <td class="py-4 px-4 text-center text-slate-500 dark:text-slate-400">
                <div class="inline-flex items-center justify-center gap-1">
                  <XCircle v-if="row.paper === false" class="w-5 h-5 text-rose-500" />
                  <CheckCircle2 v-else-if="row.paper === true" class="w-5 h-5 text-emerald-500" />
                  <span v-else class="text-xs font-medium">{{ row.paper }}</span>
                </div>
              </td>

              <!-- Legacy Apps (1C etc.) -->
              <td class="py-4 px-4 text-center text-slate-500 dark:text-slate-400">
                <div class="inline-flex items-center justify-center gap-1">
                  <XCircle v-if="row.legacy === false" class="w-5 h-5 text-rose-500" />
                  <CheckCircle2 v-else-if="row.legacy === true" class="w-5 h-5 text-emerald-500" />
                  <span v-else class="text-xs font-medium">{{ row.legacy }}</span>
                </div>
              </td>

              <!-- Boshqar.uz Column -->
              <td class="py-4 px-6 text-center font-bold text-slate-900 dark:text-white bg-emerald-500/10 border-x-2 border-emerald-500" :class="idx === comparisonRows.length - 1 ? 'border-b-2 rounded-b-2xl' : ''">
                <div class="inline-flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 class="w-5 h-5 shrink-0" />
                  <span class="text-xs sm:text-sm font-black">{{ row.boshqar }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Quick Summary Banner -->
      <div data-aos="fade-up" data-aos-delay="200" class="mt-12 p-6 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Sparkles class="w-6 h-6" />
          </div>
          <div>
            <h4 class="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
              Hech qanday o'rnatish yoki murakkab server xarajatlarisiz!
            </h4>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Brauzer orqali oching yoki telefoningizdan kiring — 14 kun bepul sinab ko'ring.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3 shrink-0">
          <button
            type="button"
            @click="$emit('openDemo')"
            class="px-5 py-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-700 font-bold text-xs sm:text-sm transition cursor-pointer"
          >
            Jonli Demo
          </button>
          <router-link
            to="/auth/register"
            class="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer"
          >
            14 Kun Bepul Boshlash
          </router-link>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Scale, CheckCircle2, XCircle, Sparkles } from 'lucide-vue-next';

defineEmits<{
  (e: 'openDemo'): void;
}>();

const comparisonRows = [
  {
    title: "Ishga Tushirish Tezligi",
    desc: "Dasturni o'rnatish va foydalanishni boshlash",
    paper: "1-2 kun (daftar chizish)",
    legacy: "1-3 hafta (mutaxassis kerak)",
    boshqar: "5 daqiqada tayyor",
  },
  {
    title: "Boshlang'ich va Server Xarajati",
    desc: "Qimmat server, litsenziya va texnik xizmat",
    paper: "Daftar va ruchka narxi",
    legacy: "5 000 000 - 20 000 000+ so'm",
    boshqar: "0 so'm (Bulutda bepul)",
  },
  {
    title: "Har Qanday Qurilmada Ishlash",
    desc: "Telefon, planshet, noutbuk, monoblok",
    paper: "Faqat qog'ozda",
    legacy: "Faqat 1 ta kompyuterda",
    boshqar: "Barcha qurilmalarda 100%",
  },
  {
    title: "Telegram Bot Xabarlari",
    desc: "Har bir chek va 21:00 kunlik hisobot",
    paper: false,
    legacy: false,
    boshqar: "Avtomatik Telegram Bot",
  },
  {
    title: "Nasiya Daftari va Balans",
    desc: "Qarzdorlik limitlari va to'lovlar tarixi",
    paper: "Chalkashib ketadi",
    legacy: "Qisman mavjud",
    boshqar: "Aniq va xavfsiz CRM",
  },
  {
    title: "Boshqar AI Yordamchisi",
    desc: "O'zbek tilida savollarga tezkor javoblar",
    paper: false,
    legacy: false,
    boshqar: "24/7 AI maslahatchi",
  },
  {
    title: "O'g'rilik va Xatolikdan Himoya",
    desc: "Har bir xodim harakatining to'liq audit jurnali",
    paper: false,
    legacy: "Qisman",
    boshqar: "100% Xavfsiz Audit",
  },
];
</script>
