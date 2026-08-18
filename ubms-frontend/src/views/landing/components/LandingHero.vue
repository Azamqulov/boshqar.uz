<template>
  <section class="relative pt-12 pb-16 sm:pt-20 sm:pb-24 overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
      <!-- Top Badge -->
      <div
        data-aos="fade-down"
        data-aos-duration="600"
        class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-bold mb-8 shadow-inner hover:scale-105 transition-transform cursor-default"
      >
        <Sparkles class="w-4 h-4 animate-spin [animation-duration:6s]" />
        <span>O'zbekistonning Har Qanday Biznesi Uchun 1-Raqamli Dastur</span>
      </div>

      <!-- Main Title -->
      <h1
        data-aos="fade-up"
        data-aos-delay="100"
        class="text-3xl sm:text-5xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white max-w-5xl mx-auto leading-[1.15]"
      >
        Savdo, Ombor va Nasiyani <br />
        <span class="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-500 bg-clip-text text-transparent">
          Bir Zumda Boshqaring!
        </span>
      </h1>

      <!-- Subtitle -->
      <p
        data-aos="fade-up"
        data-aos-delay="200"
        class="mt-6 text-sm sm:text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto font-medium leading-relaxed"
      >
        Kichik qishloq do'konidan tortib yirik supermarket va restoranlargacha: Kassa (POS), Nasiya daftari, Ombor hisobi, Telegram Bot va Boshqar AI — barchasi bitta qulay tizimda!
      </p>

      <!-- CTA Buttons -->
      <div
        data-aos="fade-up"
        data-aos-delay="300"
        class="mt-8 flex flex-wrap items-center justify-center gap-3.5 max-w-2xl mx-auto"
      >
        <!-- Primary Action: Real Account Registration with 14 days free trial -->
        <router-link
          to="/auth/register"
          class="h-12 px-7 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 hover:scale-105 active:scale-95 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
        >
          <Sparkles class="w-4 h-4" />
          <span>14 Kun Bepul Boshlash</span>
        </router-link>

        <!-- Secondary Action: Virtual Interactive Demo -->
        <button
          type="button"
          @click="$emit('openDemo')"
          class="h-12 px-6 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 hover:scale-105 active:scale-95 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-xs cursor-pointer"
        >
          <Play class="w-4 h-4 fill-current text-emerald-600 dark:text-emerald-400" />
          <span>Jonli Demoni Sinash</span>
        </button>

        <!-- Telegram Bot Demo Anchor -->
        <a
          href="#telegram"
          class="h-12 px-5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:scale-105 active:scale-95 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
        >
          <Send class="w-4 h-4 text-emerald-500" />
          <span>Telegram Bot Demo</span>
        </a>
      </div>

      <!-- Trust Badges -->
      <div
        data-aos="fade-up"
        data-aos-delay="400"
        class="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400"
      >
        <div class="flex items-center gap-2 hover:text-emerald-500 transition-colors">
          <CheckCircle2 class="w-4 h-4 text-emerald-500" />
          <span>14 kunlik to'liq bepul sinov davri</span>
        </div>
        <div class="flex items-center gap-2 hover:text-emerald-500 transition-colors">
          <CheckCircle2 class="w-4 h-4 text-emerald-500" />
          <span>Hech qanday karta talab etilmaydi</span>
        </div>
        <div class="flex items-center gap-2 hover:text-emerald-500 transition-colors">
          <CheckCircle2 class="w-4 h-4 text-emerald-500" />
          <span>Telefon, planshet va kompyuterda ishlaydi</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Sparkles, Play, CheckCircle2, Send } from 'lucide-vue-next';

defineEmits<{
  (e: 'openDemo'): void;
}>();
</script>
