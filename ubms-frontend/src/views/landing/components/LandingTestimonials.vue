<template>
  <section id="reviews" class="py-24 relative overflow-hidden bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800/80">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Heading (Clean Centered Layout) -->
      <div data-aos="fade-up" class="text-center max-w-3xl mx-auto space-y-4 mb-12">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/20">
          <Star class="w-3.5 h-3.5 fill-current text-amber-500" />
          <span>Real Tadbirkorlar Fikrlari (12+ Sharhlar)</span>
        </div>
        <h2 class="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          O'zbekiston Tadbirkorlari <br class="hidden sm:inline" />
          <span class="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-500 bg-clip-text text-transparent">
            Boshqar.uz Haqida Nima Deydi?
          </span>
        </h2>
        <p class="text-slate-600 dark:text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
          Har kuni minglab savdo do'konlari, restoranlar, dorixonalar va servislar biz orqali o'z daromadini oshirmoqda.
        </p>
      </div>

      <!-- Trust Key Metrics Bar -->
      <div data-aos="fade-up" data-aos-delay="100" class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-12">
        <div class="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center space-y-1">
          <div class="text-xl sm:text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">99.8%</div>
          <div class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold">Mijozlar Qoniqishi</div>
        </div>
        <div class="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center space-y-1">
          <div class="text-xl sm:text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">100 000+</div>
          <div class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold">Kunlik Cheklar</div>
        </div>
        <div class="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center space-y-1">
          <div class="text-xl sm:text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">5 daqiqa</div>
          <div class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold">O'rganish Osonligi</div>
        </div>
        <div class="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center space-y-1">
          <div class="text-xl sm:text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">24 / 7</div>
          <div class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold">AI & Telegram Bot</div>
        </div>
      </div>

      <!-- Testimonials Carousel Viewport -->
      <div
        class="overflow-hidden relative min-h-[220px]"
        @mouseenter="pauseAutoPlay"
        @mouseleave="resumeAutoPlay"
      >
        <Transition name="tab-slide" mode="out-in">
          <div
            :key="currentSlide"
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 px-0.5"
          >
            <div
              v-for="(t, tIdx) in slideGroups[currentSlide]"
              :key="tIdx"
              class="p-6 sm:p-7 rounded-3xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4 shadow-xs hover:-translate-y-1 hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300 text-left"
            >
              <div class="space-y-3">
                <!-- Stars & Badge -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-1 text-amber-400">
                    <Star v-for="s in 5" :key="s" class="w-4 h-4 fill-current" />
                  </div>
                  <span class="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                    {{ t.sector }}
                  </span>
                </div>

                <!-- Quote Text -->
                <p class="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                  "{{ t.quote }}"
                </p>
              </div>

              <!-- Author Info -->
              <div class="pt-4 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-xs"
                  :class="t.avatarBg || 'bg-gradient-to-tr from-emerald-500 to-teal-400'"
                >
                  {{ t.name[0] }}
                </div>
                <div class="min-w-0">
                  <div class="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">{{ t.name }}</div>
                  <div class="text-[11px] text-slate-500 dark:text-slate-400 truncate">{{ t.business }} • {{ t.city }}</div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Carousel Navigation & Pagination Bar -->
      <div class="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/60">
        <div class="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Sahifa <span class="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{{ currentSlide + 1 }}</span> / {{ totalSlides }} (Jami 12 ta sharh)
        </div>

        <!-- Pagination Indicators (Dots / Pills) -->
        <div class="flex items-center gap-2">
          <button
            v-for="(_, sIdx) in totalSlides"
            :key="sIdx"
            type="button"
            @click="currentSlide = sIdx"
            :class="[
              'h-2.5 rounded-full transition-all duration-300 cursor-pointer',
              currentSlide === sIdx ? 'w-8 bg-emerald-500 shadow-xs' : 'w-2.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
            ]"
            :aria-label="`Slayd ${sIdx + 1}`"
          />
        </div>

        <!-- Prev / Next Action Buttons -->
        <div class="flex items-center gap-2.5">
          <button
            type="button"
            @click="prevSlide"
            class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
          >
            <ChevronLeft class="w-4 h-4" />
            <span>Oldingisi</span>
          </button>
          <button
            type="button"
            @click="nextSlide"
            class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>Keyingisi</span>
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Star, ChevronLeft, ChevronRight } from 'lucide-vue-next';

const currentSlide = ref(0);
let autoPlayTimer: any = null;

// 12 Real Uzbekistan Businesses Testimonials
const testimonials = [
  {
    name: "Alisher Qodirov",
    business: "\"Baraka Market\" supermarket",
    city: "Toshkent",
    sector: "Oziq-ovqat",
    avatarBg: "bg-gradient-to-tr from-emerald-600 to-teal-500",
    quote: "Avval nasiyalarni daftarga yozardik, oxirida kim qancha qarzdorligi chalkashib, oyiga 3-4 million zarar bo'lardi. Boshqar.uz da nasiya bitta tugma bilan yoziladi va Telegram bot orqali har kuni 21:00 da hisobot keladi. Juda mamnunmiz!",
  },
  {
    name: "Jasur Bekmurodov",
    business: "\"Milliy Taomlar\" restorani",
    city: "Samarqand",
    sector: "Restoran",
    avatarBg: "bg-gradient-to-tr from-amber-600 to-orange-500",
    quote: "Ofitsiantlarimiz stollardan buyurtmani to'g'ridan-to'g'ri planshetda oladi, oshpazga sekundiga yetib boradi. Shovqin-suron va adashishlar to'xtadi. Ayniqsa pre-chek chiqarish va kassa yopish juda oson.",
  },
  {
    name: "Dilnoza Rahimova",
    business: "\"Shifo Farm\" dorixonasi",
    city: "Farg'ona",
    sector: "Dorixona",
    avatarBg: "bg-gradient-to-tr from-cyan-600 to-blue-500",
    quote: "Dorilarning yaroqlilik muddati o'tib ketishi eng katta muammo edi. Boshqar.uz muddati yaqinlashgan dorilarni oldindan ogohlantiradi. Qoldiqlar va analog dorilar qidiruvi ajoyib ishlaydi.",
  },
  {
    name: "Otabek Karimov",
    business: "\"Terra Pro Style\" kiyim do'koni",
    city: "Toshkent",
    sector: "Kiyim-kechak",
    avatarBg: "bg-gradient-to-tr from-indigo-600 to-purple-500",
    quote: "Razmerlar, ranglar va tovar qoldiqlarini nazorat qilish juda osonlashdi. Shtrix-kod skaneri bir zumda o'qiydi. Savdo tushumi 25% ga oshdi, chunki mijoz kutib qolmaydi.",
  },
  {
    name: "Nigora Saidova",
    business: "\"Beauty Queen\" go'zallik saloni",
    city: "Buxoro",
    sector: "Go'zallik & Salon",
    avatarBg: "bg-gradient-to-tr from-pink-600 to-rose-500",
    quote: "Mijozlarimiz Telegram orqali oldindan yozilishadi. Qaysi usta qancha xizmat ko'rsatganini va ularning oylik foizini dastur o'zi avtomatik hisoblab beradi. Bosh og'rig'idan qutuldik!",
  },
  {
    name: "Rustam Xalilov",
    business: "\"Avto Master 777\" ustaxonasi",
    city: "Andijon",
    sector: "Avtoservis",
    avatarBg: "bg-gradient-to-tr from-slate-700 to-slate-900",
    quote: "Ehtiyot qismlar hisobi va ustalarga beriladigan ish haqi to'liq tartibga tushdi. Mijoz mashinasini qabul qilib olganda unga chek va qilingan ishlar ro'yxati beriladi. Ishonch oshdi!",
  },
  {
    name: "Farhod Yusupov",
    business: "\"Fast Burger & Lavash\"",
    city: "Namangan",
    sector: "Fast-Food",
    avatarBg: "bg-gradient-to-tr from-yellow-600 to-amber-500",
    quote: "Kassa tezligi daxshat! 1 kunda 400 dan ortiq mijozga xizmat ko'rsatamiz, POS kassa 1 soniyada chek chiqaradi va KDS ekraniga buyurtma uzatadi. Qotish yoki xatolar umuman yo'q.",
  },
  {
    name: "Aziza Umarova",
    business: "\"Shirin Dunyo\" qandolatchilik",
    city: "Qarshi",
    sector: "Qandolatchilik",
    avatarBg: "bg-gradient-to-tr from-purple-600 to-pink-500",
    quote: "Xomashyo (un, shakar, sariyog') qoldig'i har bir tort sotilganda avtomatik kamayadi. Retseptura kalkulyatsiyasi orqali har bir shirinlikning tannarxini aniq bilib turamiz.",
  },
  {
    name: "Sardor Mahmudov",
    business: "\"Stroy Market\" qurilish mollari",
    city: "Urganch",
    sector: "Qurilish mollari",
    avatarBg: "bg-gradient-to-tr from-emerald-700 to-teal-600",
    quote: "Menda 3 ta filial bor. Barcha omborlardagi mahsulotlarni uydan turib telefonimda ko'rib turaman. Filiallararo transfer juda qulay qilingan.",
  },
  {
    name: "Shavkat Zokirov",
    business: "\"Techno Smart\" telefonlar",
    city: "Qo'qon",
    sector: "Elektronika",
    avatarBg: "bg-gradient-to-tr from-blue-600 to-indigo-500",
    quote: "IMEI kodlar va seriya raqamlari bo'yicha kafolatli savdo qilish funksiyasi ajoyib. Qaysi telefon qachon kimga sotilganini 1 sekundda topib beradi.",
  },
  {
    name: "Malika Toshpo'latova",
    business: "\"Baby Land\" bolalar olami",
    city: "Navoiy",
    sector: "Bolalar mollari",
    avatarBg: "bg-gradient-to-tr from-teal-600 to-emerald-500",
    quote: "Mijozlarga chegirma kartalari va cashback tizimi ulash orqali doimiy mijozlarimiz sonini 2 barobarga oshirdik. Kassirlarimiz dasturni 1 kunda o'rganib olishdi.",
  },
  {
    name: "Ulug'bek Ergashev",
    business: "\"Comfort Mebel\" mebel sexi",
    city: "Jizzax",
    sector: "Ishlab chiqarish",
    avatarBg: "bg-gradient-to-tr from-amber-700 to-yellow-600",
    quote: "Buyurtmalar holatini (qabul qilindi -> yig'ilmoqda -> yetkazildi) kuzatish juda oson. Mijozlarga o'z vaqtida yetkazib berish bo'yicha tartib o'rnatdik.",
  },
];

// Chunk testimonials into groups of 3 for desktop slider
const slideGroups = computed(() => {
  const chunks: typeof testimonials[] = [];
  const chunkSize = 3;
  for (let i = 0; i < testimonials.length; i += chunkSize) {
    chunks.push(testimonials.slice(i, i + chunkSize));
  }
  return chunks;
});

const totalSlides = computed(() => slideGroups.value.length);

const nextSlide = () => {
  if (currentSlide.value < totalSlides.value - 1) {
    currentSlide.value++;
  } else {
    currentSlide.value = 0; // loop back to first
  }
};

const prevSlide = () => {
  if (currentSlide.value > 0) {
    currentSlide.value--;
  } else {
    currentSlide.value = totalSlides.value - 1; // loop to last
  }
};

const startAutoPlay = () => {
  stopAutoPlay();
  autoPlayTimer = setInterval(() => {
    nextSlide();
  }, 4500);
};

const stopAutoPlay = () => {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer);
    autoPlayTimer = null;
  }
};

const pauseAutoPlay = () => {
  stopAutoPlay();
};

const resumeAutoPlay = () => {
  startAutoPlay();
};

onMounted(() => {
  startAutoPlay();
});

onUnmounted(() => {
  stopAutoPlay();
});
</script>

<style scoped>
.tab-slide-enter-active,
.tab-slide-leave-active {
  transition: all 0.45s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-slide-enter-from {
  opacity: 0;
  transform: translateX(24px) scale(0.99);
}

.tab-slide-leave-to {
  opacity: 0;
  transform: translateX(-24px) scale(0.99);
}
</style>
