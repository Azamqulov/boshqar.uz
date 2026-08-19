<template>
  <section class="space-y-6 animate-in fade-in duration-200">
    <div class="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
      <div class="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
        <Shield class="w-6 h-6" />
      </div>
      <div>
        <h2 class="text-xl font-bold text-slate-900 dark:text-white">Axborot Xavfsizligi va Serverlar Himoyasi</h2>
        <p class="text-xs text-slate-500">Biznesingiz ma'lumotlari 24/7 shifrlangan va himoyalangan</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
      <div class="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
        <div class="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
          <Lock class="w-4 h-4 text-emerald-500" />
          <span>256-Bit SSL/TLS Shifrlash</span>
        </div>
        <p class="text-xs text-slate-600 dark:text-slate-400 leading-normal">
          Sizning brauzeringiz va serverlarimiz o'rtasidagi har qanday aloqa eng zamonaviy 256-bitli TLS shifrlash protokoli orqali amalga oshiriladi. Ma'lumotlarni yo'lda tutib olish yoki o'zgartirish mutlaqo imkonsiz.
        </p>
      </div>

      <div class="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
        <div class="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
          <Database class="w-4 h-4 text-emerald-500" />
          <span>Kunlik Avtomatik Zaxira (Backup)</span>
        </div>
        <p class="text-xs text-slate-600 dark:text-slate-400 leading-normal">
          Har kuni tungi vaqtda barcha tovarlar, savdolar va moliya ma'lumotlarining xavfsiz zaxira nusxasi olinadi. Qurilmangiz yo'qolsa yoki buzilsa ham, ma'lumotlaringiz 100% xavfsiz saqlanadi.
        </p>
      </div>

      <div class="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
        <div class="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
          <KeyRound class="w-4 h-4 text-emerald-500" />
          <span>Xodimlar Huquqlari & PIN Kod Nazorati</span>
        </div>
        <p class="text-xs text-slate-600 dark:text-slate-400 leading-normal">
          Har bir xodim (kassir, ofitsiant, oshpaz) faqat o'ziga ruxsat etilgan bo'limlarni ko'ra oladi. Kassirlar foyda, tannarx yoki boshqa maxfiy moliyaviy hisobotlarni ko'ra olmaydi.
        </p>
      </div>

      <div class="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
        <div class="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
          <Server class="w-4 h-4 text-emerald-500" />
          <span>99.9% Uptime Kafolati</span>
        </div>
        <p class="text-xs text-slate-600 dark:text-slate-400 leading-normal">
          Serverlarimiz yuqori tezlikdagi zamonaviy bulutli infratuzilmada joylashgan bo'lib, uzluksiz 24/7 ishlash darajasini ta'minlaydi.
        </p>
      </div>
    </div>

    <div class="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
      <h3 class="font-bold text-emerald-800 dark:text-emerald-400 text-sm">O'zbekiston Qonunchiligiga Muvofiqlik</h3>
      <p class="text-xs text-slate-600 dark:text-slate-400">
        Boshqar.uz tizimi O'zbekiston Respublikasining 2019-yil 2-iyuldagi "Shaxsga doir ma'lumotlar to'g'risida"gi № O'RQ-547-sonli Qonuni talablariga to'liq mos keladi. Barcha ma'lumotlar qonuniy me'yorlar asosida qayta ishlanadi.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  Shield,
  Lock,
  Database,
  KeyRound,
  Server,
} from 'lucide-vue-next';
</script>
