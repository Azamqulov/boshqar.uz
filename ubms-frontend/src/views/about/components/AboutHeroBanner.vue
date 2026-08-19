<template>
  <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white p-6 sm:p-8 border border-emerald-500/30 shadow-xl">
    <!-- Decorative background blur blobs -->
    <div class="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-24 -left-24 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none"></div>

    <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div class="space-y-3 max-w-2xl">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold font-mono">
          <Sparkles class="w-3.5 h-3.5 text-emerald-400" />
          <span>Versiya 2.0.0 • Professional Edition</span>
        </div>

        <h1 class="text-2xl sm:text-4xl font-black tracking-tight text-white">
          Boshqar.uz — Universal Biznes Boshqaruv Tizimi
        </h1>

        <p class="text-sm sm:text-base text-slate-300 leading-relaxed">
          O‘zbekiston savdo do‘konlari, restoranlar, kafelar, dorixonalar va xizmat ko‘rsatish sohalari uchun maxsus ishlab chiqilgan yagona raqamli boshqaruv platformasi.
        </p>
      </div>

      <!-- Quick CTA Buttons -->
      <div class="flex flex-wrap md:flex-col gap-2.5 shrink-0">
        <router-link
          to="/guide"
          class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
        >
          <BookOpen class="w-4 h-4" />
          <span>Qo‘llanma & AI</span>
        </router-link>

        <a
          href="https://t.me/Boshqar_uzbot"
          target="_blank"
          rel="noopener noreferrer"
          class="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white border border-white/20 font-bold text-xs sm:text-sm backdrop-blur-md transition flex items-center justify-center gap-2"
        >
          <Bot class="w-4 h-4 text-emerald-400" />
          <span>Telegram Bot</span>
          <ExternalLink class="w-3.5 h-3.5 text-slate-400" />
        </a>
      </div>
    </div>

    <!-- System Status Indicators Bar -->
    <div class="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <span class="text-slate-300">Ma'lumotlar bazasi: <strong class="text-white">PostgreSQL</strong></span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
        <span class="text-slate-300">Real-vaqt: <strong class="text-white">WebSocket Faol</strong></span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
        <span class="text-slate-300">Markaziy Bank: <strong class="text-white">Sinxron</strong></span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
        <span class="text-slate-300">AI Yordamchi: <strong class="text-white">Boshqar AI v2</strong></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Sparkles,
  BookOpen,
  Bot,
  ExternalLink,
} from 'lucide-vue-next';
</script>
