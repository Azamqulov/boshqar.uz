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
        Kichik qishloq do'konidan tortib yirik supermarket va restoranlargacha: Kassa (POS), Nasiya daftari, Ombor hisobi, Moliya va Boshqar AI — barchasi bitta qulay tizimda!
      </p>

      <!-- CTA Buttons (1-row sleek buttons) -->
      <div
        data-aos="fade-up"
        data-aos-delay="300"
        class="mt-8 flex flex-wrap items-center justify-center gap-3 max-w-xl mx-auto"
      >
        <button
          type="button"
          @click="$emit('openDemo')"
          class="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 hover:scale-105 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <Play class="w-3.5 h-3.5 fill-current shrink-0" />
          <span>O'z Do'koningizda Sinab Ko'ring</span>
        </button>

        <router-link
          to="/auth/register"
          class="h-10 px-5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105 active:scale-95 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-xs"
        >
          <span>14 Kun Bepul Ro'yxatdan O'tish</span>
        </router-link>
      </div>

      <!-- Trust Badges -->
      <div
        data-aos="fade-up"
        data-aos-delay="400"
        class="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400"
      >
        <div class="flex items-center gap-2 hover:text-emerald-500 transition-colors">
          <CheckCircle2 class="w-4 h-4 text-emerald-500" />
          <span>15 ta tayyor mahsulot bilan demo</span>
        </div>
        <div class="flex items-center gap-2 hover:text-emerald-500 transition-colors">
          <CheckCircle2 class="w-4 h-4 text-emerald-500" />
          <span>Telefon va kompyuterda ishlaydi</span>
        </div>
        <div class="flex items-center gap-2 hover:text-emerald-500 transition-colors">
          <CheckCircle2 class="w-4 h-4 text-emerald-500" />
          <span>O'zbek tilida 100% tushunarli</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Sparkles, Play, CheckCircle2 } from 'lucide-vue-next';

defineEmits<{
  (e: 'openDemo'): void;
}>();
</script>
