<template>
  <div class="space-y-6 max-w-6xl mx-auto pb-16">

    <!-- 1. Header with Mode Switcher -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Foydalanish Qo‘llanmasi
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Tizimdan foydalanishni o‘rganing yoki Boshqar AI'dan so‘rang.
        </p>
      </div>

      <!-- Segmented Mode Switcher with Smooth Sliding Animation -->
      <div class="relative inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-full border border-slate-200/80 dark:border-slate-700/80 shrink-0 shadow-2xs">
        <!-- Animated Sliding Background Pill -->
        <div
          class="absolute top-1 bottom-1 rounded-full bg-emerald-600 shadow-md shadow-emerald-600/30 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none"
          :style="pillStyle"
        ></div>

        <button
          ref="guidesBtnRef"
          type="button"
          @click="switchToCatalog"
          class="relative z-10 flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-colors duration-300"
          :class="viewMode === 'guides' ? 'text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
        >
          <BookOpen :class="['w-4 h-4 transition-colors duration-300', viewMode === 'guides' ? 'text-white' : 'text-slate-500 dark:text-slate-400']" />
          <span>Qo‘llanmalar Katalogi</span>
        </button>

        <button
          ref="aiBtnRef"
          type="button"
          @click="viewMode = 'ai'"
          class="relative z-10 flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-colors duration-300"
          :class="viewMode === 'ai' ? 'text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
        >
          <Sparkles :class="['w-4 h-4 transition-colors duration-300', viewMode === 'ai' ? 'text-white' : 'text-slate-500 dark:text-slate-400']" />
          <span>Boshqar AI bilan so‘rash</span>
        </button>
      </div>
    </div>

    <!-- 2. AI Fullscreen View Mode -->
    <div v-if="viewMode === 'ai'" class="h-[720px] max-h-[82vh] animate-in fade-in duration-200">
      <BoshqarAIAssistant :is-floating="false" />
    </div>

    <!-- 3. TOPIC DETAIL PAGE VIEW (When a topic is selected - NO MODAL) -->
    <div v-else-if="selectedTopic" class="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-200">
      <!-- Back Button & Breadcrumb -->
      <div class="flex items-center justify-between">
        <button
          type="button"
          @click="selectedTopic = null"
          class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition shadow-2xs"
        >
          <ChevronLeft class="w-4 h-4" />
          <span>Barcha qo‘llanmalarga qaytish</span>
        </button>

        <router-link
          :to="selectedTopic.route"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition active:scale-95"
        >
          <span>{{ selectedTopic.title }} sahifasiga o‘tish</span>
          <ArrowRight class="w-4 h-4" />
        </router-link>
      </div>

      <!-- Topic Header Card -->
      <div class="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs">
        <div class="flex items-start gap-4">
          <div :class="['w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-xs', selectedTopic.iconBg]">
            <component :is="selectedTopic.icon" :class="['w-7 h-7', selectedTopic.iconColor]" />
          </div>
          <div>
            <div class="flex items-center gap-2.5 flex-wrap">
              <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {{ selectedTopic.title }}
              </h2>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/60">
                {{ selectedTopic.count }} ta ko‘rsatma
              </span>
            </div>
            <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              {{ selectedTopic.desc }}
            </p>
          </div>
        </div>
      </div>

      <!-- Step-by-Step Instructions -->
      <div class="space-y-3">
        <h3 class="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
          <ListChecks class="w-4.5 h-4.5 text-emerald-500" />
          <span>Bosqichma-bosqich ko‘rsatmalar:</span>
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="(step, sIdx) in selectedTopic.steps"
            :key="sIdx"
            class="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-2 shadow-xs"
          >
            <div class="flex items-center gap-2.5">
              <span class="w-7 h-7 rounded-full bg-emerald-500 text-white text-xs font-black flex items-center justify-center shadow-xs shrink-0">
                {{ sIdx + 1 }}
              </span>
              <h4 class="font-bold text-sm text-slate-900 dark:text-white">{{ step.title }}</h4>
            </div>
            <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-9.5">{{ step.description }}</p>
            <div
              v-if="step.tip"
              class="ml-9.5 mt-2 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2"
            >
              <Lightbulb class="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
              <span><strong>Maslahat:</strong> {{ step.tip }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Module FAQ if available -->
      <div v-if="selectedTopic.faq && selectedTopic.faq.length" class="space-y-3 pt-2">
        <h3 class="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
          <HelpCircle class="w-4.5 h-4.5 text-emerald-500" />
          <span>Ko‘p beriladigan savollar (FAQ):</span>
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div
            v-for="(f, fIdx) in selectedTopic.faq"
            :key="fIdx"
            class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-1.5 shadow-xs"
          >
            <h5 class="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-start gap-2.5">
              <span class="w-5 h-5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <HelpCircle class="w-3.5 h-3.5" />
              </span>
              <span class="leading-snug">{{ f.q }}</span>
            </h5>
            <p class="text-xs text-slate-500 dark:text-slate-400 pl-7.5 leading-relaxed">{{ f.a }}</p>
          </div>
        </div>
      </div>

      <!-- Bottom Help Banner -->
      <div class="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
            <img
              src="/topa_olmadingizmi_transparent.png"
              alt="Topa olmadingizmi?"
              class="w-full h-full object-contain select-none drop-shadow-sm"
            />
          </div>
          <div>
            <h3 class="font-black text-sm sm:text-base text-slate-900 dark:text-white">
              Topa olmadingizmi?
            </h3>
            <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Boshqar AI sizga yordam beradi.
            </p>
          </div>
        </div>

        <button
          type="button"
          @click="viewMode = 'ai'"
          class="px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/25 transition flex items-center justify-center gap-2 shrink-0"
        >
          <Sparkles class="w-4 h-4 text-emerald-200" />
          <span>AI bilan so‘rashni boshlash</span>
        </button>
      </div>
    </div>

    <!-- 4. MAIN CATALOG OVERVIEW VIEW (Matches User Screenshot 100%) -->
    <div v-else class="space-y-6">

      <!-- Search Input -->
      <div class="relative">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Nima haqida izlamoqchisiz? (masalan: tovar qo‘shish, chek chiqarish, nasiyaga savdo...)"
          class="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs sm:text-sm font-medium shadow-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
        />
        <button
          v-if="searchQuery"
          type="button"
          @click="searchQuery = ''"
          class="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Section Title Row -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 text-slate-900 dark:text-white font-black text-sm sm:text-base">
          <Flame class="w-4.5 h-4.5 text-emerald-500" />
          <span>Ko‘p so‘raladigan mavzular</span>
        </div>
        <button
          type="button"
          @click="searchQuery = ''"
          class="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
        >
          <span>Barchasini ko‘rish</span>
          <ArrowRight class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- 6 Topic Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        <div
          v-for="item in filteredTopics"
          :key="item.id"
          @click="selectedTopic = item"
          class="group p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-emerald-500/40 dark:hover:border-emerald-600/40 transition-all duration-200 cursor-pointer flex flex-col justify-between"
        >
          <div class="space-y-3">
            <!-- Icon Box -->
            <div
              :class="[
                'w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105',
                item.iconBg
              ]"
            >
              <component :is="item.icon" :class="['w-6 h-6', item.iconColor]" />
            </div>

            <!-- Title & Desc -->
            <div>
              <h3 class="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {{ item.title }}
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                {{ item.desc }}
              </p>
            </div>
          </div>

          <!-- Bottom Link -->
          <div class="pt-4 flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:underline">
            <span>{{ item.count }} ta qo‘llanma</span>
            <ArrowRight class="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      <!-- Bottom Help Banner -->
      <div class="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
            <img
              src="/topa_olmadingizmi_transparent.png"
              alt="Topa olmadingizmi?"
              class="w-full h-full object-contain select-none drop-shadow-sm"
            />
          </div>
          <div>
            <h3 class="font-black text-sm sm:text-base text-slate-900 dark:text-white">
              Topa olmadingizmi?
            </h3>
            <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Boshqar AI sizga yordam beradi.
            </p>
          </div>
        </div>

        <button
          type="button"
          @click="viewMode = 'ai'"
          class="px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/25 transition flex items-center justify-center gap-2 shrink-0"
        >
          <Sparkles class="w-4 h-4 text-emerald-200" />
          <span>AI bilan so‘rashni boshlash</span>
        </button>
      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  Search,
  BookOpen,
  Sparkles,
  Flame,
  ArrowRight,
  ShoppingCart,
  Package,
  Store,
  Users,
  DollarSign,
  Settings,
  ListChecks,
  Lightbulb,
  HelpCircle,
  ChevronLeft,
  X,
} from 'lucide-vue-next';
import { GUIDE_MODULES } from './guideData';
import BoshqarAIAssistant from '../../components/BoshqarAIAssistant.vue';

const searchQuery = ref('');
const viewMode = ref<'guides' | 'ai'>('guides');
const selectedTopic = ref<any>(null);

const guidesBtnRef = ref<HTMLElement | null>(null);
const aiBtnRef = ref<HTMLElement | null>(null);
const isMounted = ref(false);

onMounted(() => {
  isMounted.value = true;
});

const pillStyle = computed(() => {
  const target = viewMode.value === 'guides' ? guidesBtnRef.value : aiBtnRef.value;
  if (!target || !isMounted.value) {
    return viewMode.value === 'guides'
      ? { left: '4px', width: '185px' }
      : { left: '193px', width: '215px' };
  }
  return {
    left: `${target.offsetLeft}px`,
    width: `${target.offsetWidth}px`,
  };
});

const guideTopics = [
  {
    id: 'pos',
    title: 'Kassa (POS)',
    desc: 'Savdo qilish, chek chiqarish, to‘lov turlari va hisob-kitoblar.',
    count: 12,
    icon: ShoppingCart,
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    route: '/pos',
    steps: GUIDE_MODULES.find((m) => m.id === 'pos')?.steps || [],
    faq: GUIDE_MODULES.find((m) => m.id === 'pos')?.faq || [],
  },
  {
    id: 'products',
    title: 'Mahsulotlar',
    desc: 'Yangi mahsulot qo‘shish, tahrirlash, narx va shtrix-kodlar.',
    count: 8,
    icon: Package,
    iconBg: 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400',
    iconColor: 'text-blue-600 dark:text-blue-400',
    route: '/products',
    steps: GUIDE_MODULES.find((m) => m.id === 'products')?.steps || [],
    faq: GUIDE_MODULES.find((m) => m.id === 'products')?.faq || [],
  },
  {
    id: 'inventory',
    title: 'Omborxona',
    desc: 'Qabul qilish, qoldiqni ko‘rish, omborlar va harakatlar.',
    count: 7,
    icon: Store,
    iconBg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400',
    iconColor: 'text-amber-600 dark:text-amber-400',
    route: '/inventory',
    steps: GUIDE_MODULES.find((m) => m.id === 'inventory')?.steps || [],
    faq: GUIDE_MODULES.find((m) => m.id === 'inventory')?.faq || [],
  },
  {
    id: 'customers',
    title: 'Mijozlar (CRM)',
    desc: 'Mijozlarni boshqarish, qarzlar, nasiyalar va tarix.',
    count: 6,
    icon: Users,
    iconBg: 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400',
    iconColor: 'text-purple-600 dark:text-purple-400',
    route: '/customers',
    steps: GUIDE_MODULES.find((m) => m.id === 'customers')?.steps || [],
    faq: GUIDE_MODULES.find((m) => m.id === 'customers')?.faq || [],
  },
  {
    id: 'finance',
    title: 'Moliya & Hisobot',
    desc: 'Kirim-chiqimlar, foyda, xarajatlar va moliyaviy hisobotlar.',
    count: 10,
    icon: DollarSign,
    iconBg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-500',
    iconColor: 'text-amber-600 dark:text-amber-500',
    route: '/finance',
    steps: GUIDE_MODULES.find((m) => m.id === 'finance')?.steps || [],
    faq: GUIDE_MODULES.find((m) => m.id === 'finance')?.faq || [],
  },
  {
    id: 'settings',
    title: 'Sozlamalar',
    desc: 'Tizim sozlamalari, foydalanuvchilar, huquqlar va boshqa.',
    count: 9,
    icon: Settings,
    iconBg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
    iconColor: 'text-slate-600 dark:text-slate-400',
    route: '/settings',
    steps: GUIDE_MODULES.find((m) => m.id === 'settings')?.steps || [],
    faq: GUIDE_MODULES.find((m) => m.id === 'settings')?.faq || [],
  },
];

const filteredTopics = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  if (!q) return guideTopics;
  return guideTopics.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.desc.toLowerCase().includes(q) ||
      t.steps.some((s) => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q))
  );
});

const switchToCatalog = () => {
  viewMode.value = 'guides';
  selectedTopic.value = null;
};
</script>
