<template>
  <div class="relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
          <BrainCircuit class="w-4 h-4" />
        </div>
        <div>
          <h3 class="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <span>Sun'iy Intellekt (AI) Tahlillari va Bashorati</span>
            <span class="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-600 dark:text-amber-300 text-[10px] font-black uppercase">PRO</span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">Raqobatchilarda yo'q chuqur savdo va kamomad tahlili</p>
        </div>
      </div>
    </div>

    <!-- Content Grid (Simulated Live Data) -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 filter" :class="{ 'blur-[6px] select-none pointer-events-none': isDemo }">
      <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 space-y-2">
        <div class="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
          <span>ABC Tahlil (A-Group)</span>
          <span class="text-emerald-500">82% daromad</span>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400">Top 5 ta tovar jami daromadning asosiy qismini bermoqda. Zaxirasini 20% ga oshirish tavsiya etiladi.</p>
      </div>

      <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 space-y-2">
        <div class="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
          <span>Dead-Stock (Muzlagan Pul)</span>
          <span class="text-amber-500">3,420,000 UZS</span>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400">4 ta mahsulot 45 kundan beri sotilmagan. Chegirma bilan pullash tavsiya etiladi.</p>
      </div>

      <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 space-y-2">
        <div class="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
          <span>Telegram Bot Monitoringi</span>
          <span class="text-purple-500">Faol</span>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400">Har kuni soat 22:00 da xo'jayin Telegramiga kassa auditi va qarz hisoboti avtomatik yuboriladi.</p>
      </div>
    </div>

    <!-- BLUR OVERLAY FOR DEMO MODE -->
    <div
      v-if="isDemo"
      @click="$emit('open-pro')"
      class="absolute inset-0 bg-slate-950/40 backdrop-blur-[4px] flex flex-col items-center justify-center p-6 text-center cursor-pointer group transition-all"
    >
      <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20 mb-3 group-hover:scale-110 transition-transform">
        <Lock class="w-6 h-6" />
      </div>
      <h4 class="text-base sm:text-lg font-black text-white leading-tight">
        Sun'iy Intellekt Tahlillari Faqat PRO Tarifda Ochiq!
      </h4>
      <p class="text-xs text-slate-200 max-w-md mt-1 mb-3">
        Muzlagan pulni aniqlash, AI savdo bashorati va Telegram avtomatlashtirishni yoqish uchun 14 kunlik bepul sinovga o'ting.
      </p>
      <button
        type="button"
        class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition"
      >
        <Sparkles class="w-4 h-4 text-amber-300" />
        <span>PRO Tarifga Ulanish</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrainCircuit, Lock, Sparkles } from 'lucide-vue-next';

defineProps<{
  isDemo: boolean;
}>();

defineEmits<{
  (e: 'open-pro'): void;
}>();
</script>
