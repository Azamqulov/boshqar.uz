<template>
  <div class="glass-card rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div class="flex items-center gap-3">
      <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
        <Bot class="w-6 h-6" />
      </div>
      <div>
        <h4 class="font-bold text-sm text-slate-900 dark:text-white">Savollaringiz bormi?</h4>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Telegram orqali biz bilan to‘g‘ridan-to‘g‘ri bog‘lanishingiz yoki Boshqar AI'dan foydalanishingiz mumkin.
        </p>
      </div>
    </div>

    <div class="flex items-center gap-2 shrink-0">
      <router-link
        to="/guide"
        class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition"
      >
        Qo‘llanmani ochish
      </router-link>
      <a
        href="https://t.me/Boshqar_uzbot"
        target="_blank"
        rel="noopener noreferrer"
        class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
      >
        <span>Telegram Bot</span>
        <ExternalLink class="w-3.5 h-3.5" />
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Bot, ExternalLink } from 'lucide-vue-next';
</script>
