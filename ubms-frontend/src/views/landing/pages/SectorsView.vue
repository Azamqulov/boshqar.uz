<template>
  <div class="min-h-screen pt-20 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
    <!-- Unified Top Header Navigation -->
    <LandingHeader
      :is-authenticated="isAuthenticated"
      @open-demo="openDemoModal"
    />

    <section class="py-16 sm:py-24 relative overflow-hidden bg-gradient-to-b from-emerald-500/10 via-slate-50 to-slate-50 dark:from-emerald-950/20 dark:via-slate-950 dark:to-slate-950">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/30">
          <Layers class="w-4 h-4" />
          <span>Sohalarga Moslashtirilgan Tayyor Tizimlar</span>
        </div>

        <h1 class="text-3xl sm:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto">
          Har Bir Biznes Turi Uchun <br class="hidden sm:inline" />
          <span class="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 bg-clip-text text-transparent">
            Maxsus Ishlab Chiqilgan Yechimlar
          </span>
        </h1>

        <p class="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Chakana savdodan tortib restoran va ustaxonalargacha — har bir sohaning o'ziga xos xususiyatlari, hisobotlari va kassa talablari e'tiborga olingan.
        </p>
      </div>
    </section>

    <!-- 6 Detailed Sectors Showcase Grid -->
    <section class="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div
        v-for="s in detailedSectors"
        :key="s.id"
        class="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm hover:shadow-md transition"
      >
        <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <component :is="s.icon" class="w-6 h-6" />
            </div>
            <div>
              <h2 class="text-xl sm:text-2xl font-black">{{ s.title }}</h2>
              <p class="text-xs text-slate-500">{{ s.category }}</p>
            </div>
          </div>
          <router-link
            to="/auth/register"
            class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition flex items-center gap-2"
          >
            <span>Demoni Sinash</span>
            <ArrowRight class="w-4 h-4" />
          </router-link>
        </div>

        <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{{ s.desc }}</p>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div v-for="(feat, fIdx) in s.features" :key="fIdx" class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-1">
            <div class="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 class="w-4 h-4" />
              <span>{{ feat.title }}</span>
            </div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{{ feat.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <footer class="py-8 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
      © 2026 Boshqar.uz — Barcha huquqlar himoyalangan.
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { Layers, ShoppingBag, UtensilsCrossed, Coffee, Pill, Scissors, Wrench, CheckCircle2, ArrowRight, Sparkles } from 'lucide-vue-next';
import LandingHeader from '../components/LandingHeader.vue';
import { useAuthStore } from '../../../stores/auth.store';

const router = useRouter();
const authStore = useAuthStore();

const isAuthenticated = computed(() => {
  return !!authStore.token && !!authStore.user;
});

const openDemoModal = () => {
  router.push('/#demo');
};

const detailedSectors = [
  {
    id: 'retail',
    title: "Chakana Savdo, Supermarket va Do'konlar",
    category: "Savdo & Sklad",
    icon: ShoppingBag,
    desc: "Oziq-ovqat, kiyim-kechak, maishiy texnika va qurilish mollari do'konlari uchun tezkor POS kassa va ombor nazorati.",
    features: [
      { title: "Shtrix-kod skaneri (50ms)", desc: "Xitoy va Yevropa skanerlarini avtomatik o'qish va tovar topish." },
      { title: "Nasiya Daftari (CRM)", desc: "Mijozlar qarzi, limitlar va Telegram bildirishnomalari." },
      { title: "Termal Chek Print", desc: "58mm va 80mm ESC/POS printerlarda brauzersiz to'g'ridan-to'g'ri chop etish." },
      { title: "Soliq OFD Fiskallash", desc: "Fiskal belgilar va QR-kodli rasmiy cheklar berish." },
    ],
  },
  {
    id: 'restaurant',
    title: "Restoran, Choyxona va Kafe",
    category: "Umumiy Ovqatlanish",
    icon: UtensilsCrossed,
    desc: "Zallar va stollar xaritasi, ofitsiantlar interfeysi va oshxona oshpazi ekrani (KDS).",
    features: [
      { title: "Stollar Xaritasi", desc: "Band va bo'sh stollarni real vaqtda ko'rib turish." },
      { title: "Ofitsiant Plansheti", desc: "Buyurtmani stol yonida olib oshxonaga 1 soniyada uzatish." },
      { title: "KDS Oshxona Monitori", desc: "Oshpazlar uchun tayyorlanayotgan taomlar ekrani." },
      { title: "Pre-chek & Bo'lish", desc: "Mijozlarga hisobni bo'lib berish va pre-chek chiqarish." },
    ],
  },
  {
    id: 'fastfood',
    title: "Fast-Food, Pitsa va Qahvaxona",
    category: "Ekspress Kassa",
    icon: Coffee,
    desc: "Yuqori oqimdagi mijozlar uchun 1-click tezkor kassa va modifikatorlar.",
    features: [
      { title: "Modifikatorlar", desc: "Souslar, pishloq va taom o'lchamlarini tanlash." },
      { title: "Navbat Raqamlari", desc: "Olib ketish (takeaway) uchun chekda navbat raqami." },
      { title: "X-Z Smena Hisoboti", desc: "Kassa yopilganda naqd pul va karta farqlarini aniqlash." },
      { title: "Retseptura Kalkulyatsiyasi", desc: "Taom sotilganda xomashyo qoldig'ini avtomatik ayirish." },
    ],
  },
  {
    id: 'pharmacy',
    title: "Dorixona va Farmatsevtika",
    category: "Dori Nazorati",
    icon: Pill,
    desc: "Yaroqlilik muddati nazorati, analog dorilar va partiyalar hisobi.",
    features: [
      { title: "Muddati O'tishi Signali", desc: "Dorilar muddati tugashidan 30 kun oldin ogohlantirish." },
      { title: "Analog Qidiruvi", desc: "Faol moddalar bo'yicha analog dorilarni topib berish." },
      { title: "Partiya Raqamlari", desc: "Har bir kirim partiyasi va seriyalar bo'yicha hisob." },
      { title: "Blister Sotish", desc: "Qadoqni bo'lib, dona va tabletka shaklida sotish." },
    ],
  },
  {
    id: 'salon',
    title: "Sartaroshxona va Go'zallik Saloni",
    category: "Xizmat & Bron",
    icon: Scissors,
    desc: "Ustalar bandlik jadvali, mijozlar yozilishi (appointment) va foizli maosh.",
    features: [
      { title: "Ustalar Jadvali", desc: "Har bir ustanikunlik bandlik soatlarini kuzatish." },
      { title: "Mijoz Bron Tizimi", desc: "Telegram yoki telefon orqali oldindan yozib qo'yish." },
      { title: "Ustalar Foizi", desc: "Ustalarning kunlik bajargan xizmat foizini avto-hisoblash." },
      { title: "Materiallar Sarfi", desc: "Ishlatilgan shampun va bo'yoqlar sarfi nazorati." },
    ],
  },
  {
    id: 'service',
    title: "Avtoservis va Ta'mirlash Ustaxonalari",
    category: "Servis Markaz",
    icon: Wrench,
    desc: "Buyurtma-naryadlar, ehtiyot qismlar va ustalar maoshi.",
    features: [
      { title: "Buyurtma-Naryad", desc: "Qabul qilingan texnika yoki avto bo'yicha naryad ochish." },
      { title: "Ehtiyot Qismlar", desc: "Ombordan ehtiyot qismlarni naryadga biriktirish." },
      { title: "Ta'mirlash Holati", desc: "Mijozga ta'mirlash tayyor bo'lgani haqida Telegram xabar." },
      { title: "To'liq Tarix", desc: "Har bir texnikaning oldingi ta'mirlanish tarixi." },
    ],
  },
];
</script>
