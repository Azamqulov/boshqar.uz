<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div class="glass-card rounded-2xl p-5 space-y-2.5">
      <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
        <ShieldCheck class="w-5 h-5" />
      </div>
      <h3 class="font-bold text-sm text-slate-900 dark:text-white">Xavfsizlik & Huquqlar</h3>
      <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        Xodimlar faqat o‘zlariga ruxsat berilgan modullar bilan ishlaydi. Har bir harakat Audit tarixida qat'iy saqlanadi.
      </p>
    </div>

    <div class="glass-card rounded-2xl p-5 space-y-2.5">
      <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
        <Zap class="w-5 h-5" />
      </div>
      <h3 class="font-bold text-sm text-slate-900 dark:text-white">Tezkor & Offline-First</h3>
      <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        Kassada navbat kutib qolmaydi. Shtrix-kod va to‘lov operatsiyalari minimal kechikish bilan bir zumda saqlanadi.
      </p>
    </div>

    <div class="glass-card rounded-2xl p-5 space-y-2.5">
      <div class="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
        <Headphones class="w-5 h-5" />
      </div>
      <h3 class="font-bold text-sm text-slate-900 dark:text-white">24/7 Qo‘llab-quvvatlash</h3>
      <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        Har qanday savol yoki yordam uchun Boshqar AI hamda rasmiy Telegram botimiz tunu-kun xizmatingizda.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ShieldCheck,
  Zap,
  Headphones,
} from 'lucide-vue-next';
</script>
