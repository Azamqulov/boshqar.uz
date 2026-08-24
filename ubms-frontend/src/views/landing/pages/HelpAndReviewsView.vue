<template>
  <div class="min-h-screen pt-20 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
    <!-- Unified Top Header Navigation -->
    <LandingHeader
      :is-authenticated="isAuthenticated"
      @open-demo="openDemoModal"
    />

    <!-- Page Banner & Tab Switcher -->
    <section class="py-12 bg-gradient-to-b from-emerald-500/10 via-slate-50 to-slate-50 dark:from-emerald-950/20 dark:via-slate-950 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h1 class="text-3xl sm:text-5xl font-black">Yordam Markazi, Sharhlar va FAQ</h1>
        <p class="text-slate-600 dark:text-slate-400 text-sm max-w-xl mx-auto">
          Tadbirkorlar tajribasi, fikrlari va eng ko'p beriladigan savollarga javoblar bilan tanishing:
        </p>

        <!-- Segmented Tab Switcher -->
        <div class="flex justify-center items-center gap-8 pt-4 border-b border-slate-200 dark:border-slate-800 max-w-xs mx-auto">
          <button
            type="button"
            @click="activeTab = 'reviews'"
            class="pb-3 text-lg font-bold transition-all cursor-pointer relative"
            :class="activeTab === 'reviews' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
          >
            <span>Sharhlar (12)</span>
            <span v-if="activeTab === 'reviews'" class="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-full transition-all"></span>
          </button>

          <button
            type="button"
            @click="activeTab = 'faq'"
            class="pb-3 text-lg font-bold transition-all cursor-pointer relative"
            :class="activeTab === 'faq' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
          >
            <span>FAQ Javoblar</span>
            <span v-if="activeTab === 'faq'" class="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-full transition-all"></span>
          </button>
        </div>
      </div>
    </section>

    <!-- Tab 1: Sharhlar (Testimonials Grid) -->
    <section v-if="activeTab === 'reviews'" class="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="(t, idx) in testimonials"
        :key="idx"
        class="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
      >
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1 text-amber-400">
              <Star v-for="s in 5" :key="s" class="w-4 h-4 fill-current" />
            </div>
            <span class="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">{{ t.sector }}</span>
          </div>
          <p class="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">"{{ t.quote }}"</p>
        </div>

        <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
            {{ t.name[0] }}
          </div>
          <div class="min-w-0">
            <div class="font-bold text-xs sm:text-sm truncate">{{ t.name }}</div>
            <div class="text-[11px] text-slate-500 truncate">{{ t.business }} • {{ t.city }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Tab 2: FAQ Accordion -->
    <section v-else class="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
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
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Star, Sparkles } from 'lucide-vue-next';
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

const activeTab = ref<'reviews' | 'faq'>('reviews');

const testimonials = [
  { name: "Alisher Qodirov", business: "\"Baraka Market\" supermarket", city: "Toshkent", sector: "Oziq-ovqat", quote: "Avval nasiyalarni daftarga yozardik, oxirida kim qancha qarzdorligi chalkashib, oyiga 3-4 million zarar bo'lardi. Boshqar.uz da nasiya bitta tugma bilan yoziladi va Telegram bot orqali har kuni 21:00 da hisobot keladi. Juda mamnunmiz!" },
  { name: "Jasur Bekmurodov", business: "\"Milliy Taomlar\" restorani", city: "Samarqand", sector: "Restoran", quote: "Ofitsiantlarimiz stollardan buyurtmani to'g'ridan-to'g'ri planshetda oladi, oshpazga sekundiga yetib boradi. Shovqin-suron va adashishlar to'xtadi. Ayniqsa pre-chek chiqarish va kassa yopish juda oson." },
  { name: "Dilnoza Rahimova", business: "\"Shifo Farm\" dorixonasi", city: "Farg'ona", sector: "Dorixona", quote: "Dorilarning yaroqlilik muddati o'tib ketishi eng katta muammo edi. Boshqar.uz muddati yaqinlashgan dorilarni oldindan ogohlantiradi. Qoldiqlar va analog dorilar qidiruvi ajoyib ishlaydi." },
  { name: "Otabek Karimov", business: "\"Terra Pro Style\" kiyim do'koni", city: "Toshkent", sector: "Kiyim-kechak", quote: "Razmerlar, ranglar va tovar qoldiqlarini nazorat qilish juda osonlashdi. Shtrix-kod skaneri bir zumda o'qiydi. Savdo tushumi 25% ga oshdi, chunki mijoz kutib qolmaydi." },
  { name: "Nigora Saidova", business: "\"Beauty Queen\" go'zallik saloni", city: "Buxoro", sector: "Go'zallik & Salon", quote: "Mijozlarimiz Telegram orqali oldindan yozilishadi. Qaysi usta qancha xizmat ko'rsatganini va ularning oylik foizini dastur o'zi avtomatik hisoblab beradi. Bosh og'rig'idan qutuldik!" },
  { name: "Rustam Xalilov", business: "\"Avto Master 777\" ustaxonasi", city: "Andijon", sector: "Avtoservis", quote: "Ehtiyot qismlar hisobi va ustalarga beriladigan ish haqi to'liq tartibga tushdi. Mijoz mashinasini qabul qilib olganda unga chek va qilingan ishlar ro'yxati beriladi. Ishonch oshdi!" },
];

const faqItems = [
  { q: "Tizimni sinab ko'rish bepulmi?", a: "Ha! Ro'yxatdan o'tganingizdan so'ng 14 kun davomida tizimning barcha imkoniyatlari to'liq va bepul taqdim etiladi." },
  { q: "Termal chek printer va shtrix-kod skanerini qanday ulayman?", a: "Boshqar.uz standart USB va Bluetooth termal printerlarni (58mm/80mm) hamda barcha turdagi shtrix-kod skanerlarini qo'shimcha drayversiz avtomatik taniydi." },
  { q: "Soliq OFD fiskal cheklarini chiqarish majburiymi?", a: "Soliq sozlamalari bo'limida Soliq OFD tokenini kiritish orqali avtomatik fiskallashtirishni yoqishingiz yoki faqat ichki chek urish rejimida ishlashingiz mumkin." },
  { q: "Internet o'chib qolsa tizim ishlaydimi?", a: "Ha, POS kassa PWA texnologiyasi asosida offline rejimda ham ishlaydi va internet yonganda ma'lumotlarni bulutga sinxronlaydi." },
  { q: "Nasiyalarni nazorat qilish qanday ishlaydi?", a: "Har bir mijozga limit va muddat belgilanadi. Nasiya vaqti yetganda Telegram bot va SMS orqali mijozga hamda sizga eslatma boradi." },
  { q: "Ma'lumotlarim xavfsizligi va zaxirasi qanday ta'minlanadi?", a: "Barcha ma'lumotlar shifrlangan bulutli serverlarda saqlanadi va har kuni soat 03:00 da avtomatik zaxiralanadi (backup)." },
];
</script>
