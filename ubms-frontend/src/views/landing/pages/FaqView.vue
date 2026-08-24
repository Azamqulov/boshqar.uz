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
          <router-link to="/taqqoslash" class="hover:text-emerald-500 transition">Taqqoslash</router-link>
          <router-link to="/tariflar" class="hover:text-emerald-500 transition">Tariflar</router-link>
          <router-link to="/sharhlar" class="hover:text-emerald-500 transition">Sharhlar</router-link>
          <router-link to="/faq" class="text-emerald-600 dark:text-emerald-400 font-bold border-b-2 border-emerald-500 py-1">FAQ</router-link>
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
          <HelpCircle class="w-4 h-4" />
          <span>Ko'p Beriladigan Savollar va Javoblar</span>
        </div>

        <h1 class="text-3xl sm:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto">
          Savollaringiz Bormi? <br class="hidden sm:inline" />
          <span class="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 bg-clip-text text-transparent">
            Barcha Savollarga Aniq Javoblar
          </span>
        </h1>

        <p class="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Agar savolingizga javob topa olmasangiz, 24/7 qo'llab-quvvatlash xizmatimizga murojaat qiling.
        </p>
      </div>
    </section>

    <!-- FAQ Accordion Grid -->
    <section class="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
      <div
        v-for="(item, idx) in faqItems"
        :key="idx"
        class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm"
      >
        <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span class="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono text-xs flex items-center justify-center font-bold">?</span>
          <span>{{ item.q }}</span>
        </h3>
        <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-8">{{ item.a }}</p>
      </div>
    </section>

    <footer class="py-8 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
      © 2026 Boshqar.uz — Barcha huquqlar himoyalangan.
    </footer>
  </div>
</template>

<script setup lang="ts">
import { HelpCircle, Sparkles } from 'lucide-vue-next';
import AppLogo from '../../../components/AppLogo.vue';
import ThemeToggle from '../../../components/ThemeToggle.vue';

const faqItems = [
  { q: "Tizimni sinab ko'rish bepulmi?", a: "Ha! Ro'yxatdan o'tganingizdan so'ng 14 kun davomida tizimning barcha imkoniyatlari to'liq va bepul taqdim etiladi." },
  { q: "Termal chek printer va shtrix-kod skanerini qanday ulayman?", a: "Boshqar.uz standart USB va Bluetooth termal printerlarni (58mm/80mm) hamda barcha turdagi shtrix-kod skanerlarini qo'shimcha drayversiz avtomatik taniydi." },
  { q: "Soliq OFD fiskal cheklarini chiqarish majburiymi?", a: "Soliq sozlamalari bo'limida Soliq OFD tokenini kiritish orqali avtomatik fiskallashtirishni yoqishingiz yoki faqat ichki chek urish rejimida ishlashingiz mumkin." },
  { q: "Internet o'chib qolsa tizim ishlaydimi?", a: "Ha, POS kassa PWA texnologiyasi asosida offline rejimda ham ishlaydi va internet yonganda ma'lumotlarni bulutga sinxronlaydi." },
  { q: "Nasiyalarni nazorat qilish qanday ishlaydi?", a: "Har bir mijozga limit va muddat belgilanadi. Nasiya vaqti yetganda Telegram bot va SMS orqali mijozga hamda sizga eslatma boradi." },
  { q: "Ma'lumotlarim xavfsizligi va zaxirasi qanday ta'minlanadi?", a: "Barcha ma'lumotlar shifrlangan bulutli serverlarda saqlanadi va har kuni soat 03:00 da avtomatik zaxiralanadi (backup)." },
];
</script>
