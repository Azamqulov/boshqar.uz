<template>
  <section id="sectors" class="py-24 relative overflow-hidden bg-slate-50 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800/80">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Heading -->
      <div data-aos="fade-up" class="text-center max-w-3xl mx-auto space-y-4 mb-16">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-bold border border-teal-500/20">
          <Layers class="w-3.5 h-3.5" />
          <span>Soha Uchun Maxsus Moslashtirilgan</span>
        </div>
        <h2 class="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Har Qanday Soha Uchun <br class="hidden sm:inline" />
          <span class="bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-400 bg-clip-text text-transparent">
            Tayyor Biznes Modullari
          </span>
        </h2>
        <p class="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
          Biznesingiz yo'nalishini tanlang va unga xos barcha qulayliklarni ko'ring.
        </p>
      </div>

      <!-- Sector Tabs -->
      <div data-aos="fade-up" class="flex flex-wrap items-center justify-center gap-2 mb-10">
        <button
          v-for="s in sectors"
          :key="s.id"
          type="button"
          @click="selectSector(s.id)"
          class="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center gap-2"
          :class="activeSector === s.id
            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 scale-105'
            : 'bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'"
        >
          <component :is="s.icon" class="w-4 h-4" />
          <span>{{ s.name }}</span>
        </button>
      </div>

      <!-- Active Sector Showcase Card (Wrapped in Transition) -->
      <Transition name="tab-slide" mode="out-in">
        <div
          :key="activeSector"
          class="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm transition-all duration-300"
        >
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <!-- Left: Info & Key Features -->
            <div class="lg:col-span-7 space-y-6">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                <component :is="currentSector.icon" class="w-3.5 h-3.5" />
                <span>{{ currentSector.name }} uchun maxsus</span>
              </div>

              <h3 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {{ currentSector.title }}
              </h3>

              <p class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                {{ currentSector.description }}
              </p>

              <!-- Key Feature List -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div
                  v-for="(f, fIdx) in currentSector.features"
                  :key="fIdx"
                  class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5"
                >
                  <CheckCircle2 class="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span class="text-xs font-semibold text-slate-800 dark:text-slate-200">{{ f }}</span>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="pt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  @click="$emit('openDemo')"
                  class="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <span>Ushbu Sohada Demoni Sinash</span>
                  <ArrowRight class="w-4 h-4" />
                </button>
                <router-link
                  to="/sohalar"
                  class="px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 font-bold text-xs sm:text-sm transition flex items-center gap-1.5"
                >
                  <span>Barcha Sohalar</span>
                  <ArrowRight class="w-3.5 h-3.5" />
                </router-link>
              </div>
            </div>

            <!-- Right: Visual Feature Highlight Box -->
            <div class="lg:col-span-5 bg-slate-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white space-y-4 shadow-sm">
              <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div class="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                  <Zap class="w-3.5 h-3.5 text-amber-500" />
                  <span>Sektor Maxsus Imkoniyati</span>
                </div>
                <span class="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold">FAOL</span>
              </div>

              <div class="space-y-3">
                <div class="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 space-y-1 shadow-xs">
                  <div class="text-xs font-bold text-emerald-600 dark:text-emerald-400">{{ currentSector.boxTitle }}</div>
                  <div class="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">{{ currentSector.boxDesc }}</div>
                </div>

                <div class="grid grid-cols-2 gap-2 text-center text-xs">
                  <div class="p-3 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/30 shadow-xs">
                    <div class="text-lg font-black font-mono text-slate-900 dark:text-white">{{ currentSector.stat1Val }}</div>
                    <div class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{{ currentSector.stat1Label }}</div>
                  </div>
                  <div class="p-3 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/30 shadow-xs">
                    <div class="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">{{ currentSector.stat2Val }}</div>
                    <div class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{{ currentSector.stat2Label }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import {
  Layers,
  ShoppingBag,
  UtensilsCrossed,
  Pill,
  Scissors,
  Coffee,
  Wrench,
  CheckCircle2,
  ArrowRight,
  Zap,
} from 'lucide-vue-next';

defineEmits<{
  (e: 'openDemo'): void;
}>();

const activeSector = ref<string>('shop');
const sectorKeys = ['shop', 'restaurant', 'cafe', 'pharmacy', 'barbershop', 'service'];

let autoSlideTimer: any = null;
const isUserInteracting = ref(false);

function startAutoSlide() {
  stopAutoSlide();
  autoSlideTimer = setInterval(() => {
    if (!isUserInteracting.value) {
      const idx = sectorKeys.indexOf(activeSector.value);
      const nextIdx = (idx + 1) % sectorKeys.length;
      activeSector.value = sectorKeys[nextIdx];
    }
  }, 4000);
}

function stopAutoSlide() {
  if (autoSlideTimer) {
    clearInterval(autoSlideTimer);
    autoSlideTimer = null;
  }
}

function selectSector(id: string) {
  activeSector.value = id;
  isUserInteracting.value = true;
  setTimeout(() => {
    isUserInteracting.value = false;
  }, 8000);
}

onMounted(() => {
  startAutoSlide();
});

onUnmounted(() => {
  stopAutoSlide();
});

const sectors = [
  {
    id: 'shop',
    name: "Do'kon & Savdo",
    icon: ShoppingBag,
    title: "Chakana Savdo, Supermarket va Bozorlar",
    description: "Shtrix-kod skaneri, elektron tarozi, nasiya daftari va tezkor chek chiqarish bilan do'koningiz savdosi doim aniq va ravshan bo'ladi.",
    features: [
      "Shtrix-kod skanerlash va tezkor qidiruv",
      "Nasiya (qarz) daftari va limitlar nazorati",
      "Kam qolgan tovarlar bo'yicha ogohlantirish",
      "58mm / 80mm termal printerlarda chek urish",
    ],
    boxTitle: "Tezkor Savat & Nasiya CRM",
    boxDesc: "Xaridor nasiyaga olsa bir tugma bilan ro'yxatga qo'shiladi va balansi avtomatik hisoblanadi.",
    stat1Val: "0.2 soniya",
    stat1Label: "Skaner tezligi",
    stat2Val: "100%",
    stat2Label: "Nasiya nazorati",
  },
  {
    id: 'restaurant',
    name: "Restoran",
    icon: UtensilsCrossed,
    title: "Restoran va Choyxonalar",
    description: "Zallar va stollar xaritasi, ofitsiant ekrani, buyurtmalarni oshxonaga (KDS) yuborish va xizmat haqini avtomatik hisoblash.",
    features: [
      "Interaktiv stollar xaritasi (Band / Bo'sh)",
      "Ofitsiantlar uchun qulay planshet interfeysi",
      "Oshxona oshpazi ekrani (KDS) buyurtmalari",
      "Pre-chek chiqarish va bo'lib to'lash",
    ],
    boxTitle: "Oshxona & Stol Integratsiyasi",
    boxDesc: "Ofitsiant stolga buyurtma kiritishi bilan oshxonadagi printer yoki monitorda darhol chiqadi.",
    stat1Val: "0 navbat",
    stat1Label: "Oshxona uzatishi",
    stat2Val: "+40%",
    stat2Label: "Ofitsiant unumdorligi",
  },
  {
    id: 'cafe',
    name: "Kafe & Fast-Food",
    icon: Coffee,
    title: "Qahvaxona, Fast-food va Pitsa",
    description: "Tezkor taomlar, qo'shimcha modifikatorlar (sous, pishloq), navbat raqamlari va takeaway (olib ketish) tizimi.",
    features: [
      "1-click tezkor buyurtma olish tizimi",
      "Taom modifikatorlari (kichik, o'rta, katta)",
      "Buyurtma navbat raqami va chek urish",
      "Kassa smenasi X-Z hisoboti",
    ],
    boxTitle: "Ekspress Kassa & Modifikatorlar",
    boxDesc: "Kassir mijoz xohlagan sous yoki o'lchamni bir marta bosish orqali kiritadi.",
    stat1Val: "15 soniya",
    stat1Label: "1 ta chek urish",
    stat2Val: "3 barobar",
    stat2Label: "Kassa tezligi",
  },
  {
    id: 'pharmacy',
    name: "Dorixona",
    icon: Pill,
    title: "Dorixona va Farmatsevtika",
    description: "Yaroqlilik muddati nazorati, partiya raqamlari, faol moddalar bo'yicha analog dorilarni qidirish va qoldiqlar hisobi.",
    features: [
      "Yaroqlilik muddati tugashidan ogohlantirish",
      "Partiyalar (seriya) bo'yicha qoldiqlar",
      "Dori analoglari va o'xshashlarini qidirish",
      "Dona va qadoqda (blister) sotish",
    ],
    boxTitle: "Muddati O'tishidan 100% Himoya",
    boxDesc: "Dori muddati yaqinlashganda tizim avvalroq ogohlantiradi va zararni oldini oladi.",
    stat1Val: "0 ta xato",
    stat1Label: "Muddat nazorati",
    stat2Val: "100%",
    stat2Label: "Partiyalar hisobi",
  },
  {
    id: 'barbershop',
    name: "Sartaroshxona",
    icon: Scissors,
    title: "Sartaroshxona va Go'zallik Saloni",
    description: "Ustalarning bandlik taqvimi, mijozlar yozilishi (appointment), xizmatlar narxi va ustalarning foizli komissiya maoshi hisoboti.",
    features: [
      "Ustalar bo'yicha bandlik jadvali va soatlar",
      "Mijozlarni xizmatga yozish (Bron qilish)",
      "Har bir usta bo'yicha foizli daromad hisobi",
      "Ishlatilgan kosmetika va materiallar sarfi",
    ],
    boxTitle: "Usta & Mijoz Rejalashtiruvi",
    boxDesc: "Har bir usta kunlik bajargan xizmatlari va oladigan komissiyasini o'z telefonida ko'radi.",
    stat1Val: "100% aniq",
    stat1Label: "Usta foizlari",
    stat2Val: "0 chalkashlik",
    stat2Label: "Bandlik vaqtlari",
  },
  {
    id: 'service',
    name: "Xizmat Ko'rsatish",
    icon: Wrench,
    title: "Avtoservis, Ta'mirlash va Servis Markazlari",
    description: "Buyurtma-naryadlar, ishlatilgan ehtiyot qismlar, ustalarning ish haqi va mijozga ta'mirlash holati bo'yicha xabar berish.",
    features: [
      "Buyurtma-naryad yaratish va statuslar",
      "Ehtiyot qismlarni ombordan hisobdan chiqarish",
      "Ustalarning mehnati va xizmat narxi",
      "Mijozlar buyurtmalari to'liq tarixi",
    ],
    boxTitle: "Buyurtma-Naryad Nazorati",
    boxDesc: "Qabul qilingan mahsulot holati, sarflangan qismlar va jami summa bitta chekda chiqadi.",
    stat1Val: "1 daqiqa",
    stat1Label: "Naryad ochish",
    stat2Val: "To'liq",
    stat2Label: "Servis nazorati",
  },
];

const currentSector = computed(() => {
  return sectors.find(s => s.id === activeSector.value) || sectors[0];
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
