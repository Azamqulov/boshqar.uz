<template>
  <div class="space-y-6 max-w-6xl mx-auto pb-16">
    <!-- Top Hero Banner Card -->
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

    <!-- 6 Key Modules Grid -->
    <div class="space-y-3">
      <h2 class="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
        <Layers class="w-4.5 h-4.5 text-emerald-500" />
        <span>Tizimning Asosiy Modullari</span>
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="mod in modulesList"
          :key="mod.title"
          class="glass-card rounded-2xl p-5 hover:shadow-md hover:border-emerald-500/40 transition flex flex-col justify-between space-y-3"
        >
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div :class="['w-10 h-10 rounded-xl flex items-center justify-center font-bold', mod.iconBg]">
                <component :is="mod.icon" :class="['w-5 h-5', mod.iconColor]" />
              </div>
              <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {{ mod.tag }}
              </span>
            </div>

            <div>
              <h3 class="font-extrabold text-sm text-slate-900 dark:text-white">{{ mod.title }}</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{{ mod.desc }}</p>
            </div>
          </div>

          <router-link
            :to="mod.route"
            class="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline pt-2 border-t border-slate-100 dark:border-slate-800"
          >
            <span>Bo‘limga o‘tish</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </router-link>
        </div>
      </div>
    </div>

    <!-- Security & Architecture Guarantee Cards -->
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

    <!-- Support and Contact Footer Card -->
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
  </div>
</template>

<script setup lang="ts">
import {
  Sparkles,
  BookOpen,
  Bot,
  ExternalLink,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Headphones,
  ShoppingCart,
  Package,
  Store,
  Users,
  DollarSign,
  UtensilsCrossed,
} from 'lucide-vue-next';

const modulesList = [
  {
    title: 'Kassa (POS)',
    tag: 'Tezkor Sotuv',
    desc: 'Naqd, karta, o‘tkazma, nasiya to‘lovlari, chek chiqarish va smena boshqaruvi.',
    icon: ShoppingCart,
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/50',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    route: '/pos',
  },
  {
    title: 'Mahsulotlar & Narxlar',
    tag: 'Katalog',
    desc: 'Shtrix-kod, toifalar, ulgurji va chakana narxlar, qoldiqlar monitoringi.',
    icon: Package,
    iconBg: 'bg-blue-50 dark:bg-blue-950/50',
    iconColor: 'text-blue-600 dark:text-blue-400',
    route: '/products',
  },
  {
    title: 'Omborxona & Kirim',
    tag: 'Ombor',
    desc: 'Yetkazib beruvchilardan kirim qilish, qoldiqlar harakati va inventarizatsiya.',
    icon: Store,
    iconBg: 'bg-amber-50 dark:bg-amber-950/50',
    iconColor: 'text-amber-600 dark:text-amber-500',
    route: '/inventory',
  },
  {
    title: 'Restoran & Ofitsiant',
    tag: 'HORECA',
    desc: 'Stollar xaritasi, ofitsiant menyusi, oshxona (KDS) va buyurtma cheklari.',
    icon: UtensilsCrossed,
    iconBg: 'bg-orange-50 dark:bg-orange-950/50',
    iconColor: 'text-orange-600 dark:text-orange-400',
    route: '/restaurant/tables',
  },
  {
    title: 'Mijozlar & Nasiya (CRM)',
    tag: 'Mijozlar',
    desc: 'Mijozlar bazasi, qarzlar daftari, to‘lovlar tarixi va chegirmalar.',
    icon: Users,
    iconBg: 'bg-purple-50 dark:bg-purple-950/50',
    iconColor: 'text-purple-600 dark:text-purple-400',
    route: '/customers',
  },
  {
    title: 'Moliya & Xarajatlar',
    tag: 'Hisobot',
    desc: 'Sof foyda, tannarx (COGS), xarajatlar tahlili va to‘liq moliyaviy hisobotlar.',
    icon: DollarSign,
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/50',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    route: '/finance',
  },
];
</script>
