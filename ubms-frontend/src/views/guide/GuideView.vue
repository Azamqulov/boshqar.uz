<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in duration-300">
    <!-- Hero Header Banner -->
    <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white p-6 sm:p-8 lg:p-10 shadow-xl">
      <div class="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />
      <div class="absolute right-1/4 -bottom-16 w-80 h-80 rounded-full bg-teal-300/15 blur-3xl pointer-events-none" />

      <div class="relative z-10 max-w-3xl space-y-4">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-emerald-100 text-xs font-bold">
          <Sparkles class="w-4 h-4 text-amber-300" />
          <span>Foydalanish Qo'llanmasi & Boshqar AI Markazi</span>
        </div>

        <h1 class="text-2xl sm:text-4xl font-extrabold tracking-tight">
          Boshqar.uz dan to'liq va oson foydalanish
        </h1>

        <p class="text-emerald-100/90 text-xs sm:text-sm md:text-base leading-relaxed">
          Kassa, Ombor, Moliya, Nasiya va Restoran bo'yicha bosqichma-bosqich qo'llanmalar. Saytda qiynalgan har qanday masalani <span class="font-bold text-white underline decoration-emerald-400">Boshqar AI</span> orqali bir zumda hal qiling!
        </p>

        <!-- Search Bar -->
        <div class="pt-2">
          <div class="relative max-w-xl">
            <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Qidiruv: Masalan 'tovar qo'shish', 'chek chiqarish', 'nasiya'..."
              class="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs sm:text-sm font-medium border-0 shadow-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
            />
            <button
              v-if="searchQuery"
              @click="searchQuery = ''"
              class="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Top Mode Switcher (Qo'llanmalar vs Katta AI Suhbat vs FAQ) -->
    <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
      <div class="flex items-center gap-2 p-1 bg-slate-200/70 dark:bg-slate-800/70 rounded-2xl">
        <button
          @click="viewMode = 'guides'"
          :class="[
            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all',
            viewMode === 'guides'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          ]"
        >
          <BookOpen class="w-4 h-4" />
          <span>Qo'llanmalar Katalogi</span>
        </button>

        <button
          @click="viewMode = 'ai'"
          :class="[
            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all',
            viewMode === 'ai'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          ]"
        >
          <Bot class="w-4 h-4" />
          <span>Boshqar AI Suhbat</span>
          <span class="px-1.5 py-0.2 text-[10px] font-extrabold bg-amber-400 text-slate-950 rounded-full">AI</span>
        </button>
      </div>

      <div class="hidden sm:flex items-center gap-2 text-xs text-slate-500">
        <span>Jami <strong>{{ GUIDE_MODULES.length }}</strong> ta asosiy modul</span>
      </div>
    </div>

    <!-- 1. FULLSCREEN AI CHAT MODE -->
    <div v-if="viewMode === 'ai'" class="h-[680px] max-h-[80vh] animate-in fade-in duration-200">
      <BoshqarAIAssistant :is-floating="false" />
    </div>

    <!-- 2. GUIDES CATALOG MODE -->
    <div v-else class="space-y-6">
      <!-- Horizontal Scrollable Tabs with Smooth Arrow Controls -->
      <div class="relative flex items-center group">
        <!-- Left Arrow Scroll -->
        <button
          @click="scrollTabs('left')"
          class="shrink-0 mr-1 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-xs transition"
          title="Chapga surish"
        >
          <ChevronLeft class="w-4 h-4" />
        </button>

        <!-- Tabs Container -->
        <div
          ref="tabsContainer"
          class="flex-1 flex items-center gap-2 overflow-x-auto py-1 px-1 scroll-smooth no-scrollbar"
        >
          <button
            v-for="tab in filterTabs"
            :key="tab.id"
            @click="activeCategory = tab.id"
            :class="[
              'px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-150 flex items-center gap-2 shadow-2xs shrink-0',
              activeCategory === tab.id
                ? 'bg-emerald-600 text-white shadow-emerald-500/25 ring-2 ring-emerald-500/30'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            ]"
          >
            <span>{{ tab.label }}</span>
            <span
              v-if="tab.count"
              :class="[
                'px-1.5 py-0.5 rounded-md text-[10px] font-extrabold',
                activeCategory === tab.id
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              ]"
            >
              {{ tab.count }}
            </span>
          </button>
        </div>

        <!-- Right Arrow Scroll -->
        <button
          @click="scrollTabs('right')"
          class="shrink-0 ml-1 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-xs transition"
          title="O'ngga surish"
        >
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>

      <!-- Main Layout: Module Cards (8 cols) + Side AI helper / Hotkeys (4 cols) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <!-- Left Column: Modules & FAQ (8 cols) -->
        <div class="lg:col-span-7 xl:col-span-8 space-y-6">
          <!-- No Results Warning -->
          <div
            v-if="filteredModules.length === 0"
            class="p-10 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm"
          >
            <div class="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Search class="w-7 h-7" />
            </div>
            <h3 class="font-bold text-slate-800 dark:text-slate-200 text-base">Hech qanday qo'llanma topilmadi</h3>
            <p class="text-xs text-slate-500 max-w-md mx-auto">
              "{{ searchQuery }}" bo'yicha natija yo'q. Qidiruv so'zini o'zgartiring yoki yuqoridagi <strong>"Boshqar AI Suhbat"</strong> tabiga o'tib savol bering.
            </p>
          </div>

          <!-- Module Cards List -->
          <div class="space-y-4">
            <div
              v-for="mod in filteredModules"
              :key="mod.id"
              class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-200 hover:border-emerald-500/40"
            >
              <!-- Header -->
              <div
                @click="toggleModule(mod.id)"
                class="p-4 sm:p-6 flex items-center justify-between cursor-pointer select-none bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div class="flex items-center gap-4 min-w-0">
                  <div
                    :class="[
                      'w-11 h-11 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center shrink-0 shadow-sm font-bold text-white',
                      getModuleBg(mod.color)
                    ]"
                  >
                    <component :is="getIconComponent(mod.icon)" class="w-6 h-6" />
                  </div>
                  <div class="min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <h3 class="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate">
                        {{ mod.title }}
                      </h3>
                      <span class="px-2.5 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700">
                        {{ mod.badge }}
                      </span>
                    </div>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                      {{ mod.shortDesc }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-2 shrink-0 ml-3">
                  <router-link
                    :to="mod.route"
                    @click.stop
                    class="hidden sm:inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white text-slate-700 dark:text-slate-300 text-xs font-bold transition-all shadow-2xs"
                    title="Bo'limga o'tish"
                  >
                    <span>Ochish</span>
                    <ArrowUpRight class="w-3.5 h-3.5" />
                  </router-link>

                  <div
                    :class="[
                      'p-2 rounded-xl text-slate-400 transition-transform duration-200',
                      expandedModules[mod.id] ? 'rotate-180 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200' : ''
                    ]"
                  >
                    <ChevronDown class="w-5 h-5" />
                  </div>
                </div>
              </div>

              <!-- Expanded Body -->
              <div
                v-show="expandedModules[mod.id]"
                class="px-4 sm:px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/30 space-y-5"
              >
                <!-- Role Badges -->
                <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2 flex-wrap">
                  <Shield class="w-3.5 h-3.5 text-emerald-500" />
                  <span>Ruxsat etilgan rollar:</span>
                  <span
                    v-for="role in mod.roles"
                    :key="role"
                    class="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]"
                  >
                    {{ role }}
                  </span>
                </div>

                <!-- Step-by-Step Sequence -->
                <div class="space-y-3">
                  <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Bosqichma-bosqich ko'rsatma:
                  </h4>
                  <div class="grid grid-cols-1 gap-3">
                    <div
                      v-for="(step, sIdx) in mod.steps"
                      :key="sIdx"
                      class="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 space-y-2 shadow-2xs"
                    >
                      <div class="flex items-center justify-between">
                        <h5 class="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                          {{ step.title }}
                        </h5>
                      </div>
                      <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {{ step.description }}
                      </p>
                      <div v-if="step.tip" class="flex items-start gap-2 pt-1 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50/60 dark:bg-amber-950/20 p-2.5 rounded-xl border border-amber-200/50 dark:border-amber-900/40">
                        <Lightbulb class="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                        <span><strong>Maslahat:</strong> {{ step.tip }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- FAQ under module -->
                <div v-if="mod.faq && mod.faq.length" class="space-y-2.5 pt-2">
                  <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Ko'p beriladigan savollar:
                  </h4>
                  <div
                    v-for="(f, fIdx) in mod.faq"
                    :key="fIdx"
                    class="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 text-xs space-y-1"
                  >
                    <p class="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <HelpCircle class="w-4 h-4 text-emerald-500 shrink-0" />
                      {{ f.q }}
                    </p>
                    <p class="text-slate-600 dark:text-slate-400 pl-6 leading-relaxed">
                      {{ f.a }}
                    </p>
                  </div>
                </div>

                <!-- Footer button -->
                <div class="pt-2 flex justify-end">
                  <router-link
                    :to="mod.route"
                    class="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md active:scale-95"
                  >
                    <span>{{ mod.title }} sahifasiga o'tish</span>
                    <ArrowRight class="w-4 h-4" />
                  </router-link>
                </div>
              </div>
            </div>
          </div>

          <!-- General FAQ Section -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 space-y-5 shadow-sm">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <HelpCircle class="w-5 h-5" />
              </div>
              <div>
                <h3 class="font-bold text-base text-slate-900 dark:text-slate-100">Umumiy Savol-Javoblar</h3>
                <p class="text-xs text-slate-500">Tizim ishlashi bo'yicha ko'p beriladigan texnik savollar</p>
              </div>
            </div>

            <div class="space-y-3 pt-2">
              <div
                v-for="(item, idx) in generalFaq"
                :key="idx"
                class="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2"
              >
                <h4 class="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                  {{ item.q }}
                </h4>
                <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {{ item.a }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Embedded Compact AI Assistant + Hotkeys (4 cols) -->
        <div class="lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-4">
          <!-- Embedded AI Assistant Box -->
          <div class="h-[580px] max-h-[75vh]">
            <BoshqarAIAssistant :is-floating="false" />
          </div>

          <!-- Keyboard Hotkeys Cheat Sheet -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 space-y-3.5 shadow-sm">
            <div class="flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <Zap class="w-4 h-4 text-amber-500" />
              <h4 class="font-bold text-xs uppercase tracking-wider">Tezkor tugmalar (Hotkeys)</h4>
            </div>

            <div class="space-y-2 text-xs">
              <div class="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span class="text-slate-600 dark:text-slate-400">Kassa qidiruvi</span>
                <kbd class="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-[11px] font-bold border border-slate-200 dark:border-slate-700">F3 yoki /</kbd>
              </div>
              <div class="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span class="text-slate-600 dark:text-slate-400">Kassada to'lov oynasi</span>
                <kbd class="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-[11px] font-bold border border-slate-200 dark:border-slate-700">F2 yoki Enter</kbd>
              </div>
              <div class="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span class="text-slate-600 dark:text-slate-400">Yangi tovar qo'shish</span>
                <kbd class="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-[11px] font-bold border border-slate-200 dark:border-slate-700">Ctrl + N</kbd>
              </div>
              <div class="flex items-center justify-between py-1.5">
                <span class="text-slate-600 dark:text-slate-400">Tungi / Yorug' rejim</span>
                <kbd class="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-[11px] font-bold border border-slate-200 dark:border-slate-700">Ctrl + D</kbd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  Search,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowRight,
  Shield,
  Lightbulb,
  HelpCircle,
  Zap,
  X,
  BookOpen,
  Bot,
  ShoppingCart,
  Package,
  Boxes,
  Users,
  DollarSign,
  UtensilsCrossed,
  Calendar,
  Settings,
} from 'lucide-vue-next';
import { GUIDE_MODULES } from './guideData';
import BoshqarAIAssistant from '../../components/BoshqarAIAssistant.vue';

const searchQuery = ref('');
const activeCategory = ref('all');
const viewMode = ref<'guides' | 'ai'>('guides');
const tabsContainer = ref<HTMLElement | null>(null);

const expandedModules = ref<Record<string, boolean>>({
  pos: true,
  products: true,
});

const filterTabs = [
  { id: 'all', label: 'Barcha qo\'llanmalar', count: 8 },
  { id: 'pos', label: 'Kassa & Savdo', count: 1 },
  { id: 'products', label: 'Mahsulotlar', count: 1 },
  { id: 'inventory', label: 'Omborxona', count: 1 },
  { id: 'customers', label: 'Mijozlar & Nasiya', count: 1 },
  { id: 'finance', label: 'Moliya & Foyda', count: 1 },
  { id: 'restaurant', label: 'Restoran & Kafe', count: 1 },
  { id: 'appointments', label: 'Xizmatlar', count: 1 },
  { id: 'settings', label: 'Sozlamalar', count: 1 },
];

const scrollTabs = (direction: 'left' | 'right') => {
  if (!tabsContainer.value) return;
  const offset = direction === 'left' ? -220 : 220;
  tabsContainer.value.scrollBy({ left: offset, behavior: 'smooth' });
};

const toggleModule = (id: string) => {
  expandedModules.value[id] = !expandedModules.value[id];
};

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'ShoppingCart':
      return ShoppingCart;
    case 'Package':
      return Package;
    case 'Boxes':
      return Boxes;
    case 'Users':
      return Users;
    case 'DollarSign':
      return DollarSign;
    case 'UtensilsCrossed':
      return UtensilsCrossed;
    case 'Calendar':
      return Calendar;
    case 'Settings':
      return Settings;
    default:
      return HelpCircle;
  }
};

const getModuleBg = (color: string) => {
  switch (color) {
    case 'emerald':
      return 'bg-emerald-500';
    case 'blue':
      return 'bg-blue-500';
    case 'amber':
      return 'bg-amber-500';
    case 'indigo':
      return 'bg-indigo-500';
    case 'rose':
      return 'bg-rose-500';
    case 'purple':
      return 'bg-purple-500';
    default:
      return 'bg-slate-600';
  }
};

const filteredModules = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();

  return GUIDE_MODULES.filter((m) => {
    const matchesCategory = activeCategory.value === 'all' || m.id === activeCategory.value;
    const matchesSearch =
      !q ||
      m.title.toLowerCase().includes(q) ||
      m.shortDesc.toLowerCase().includes(q) ||
      m.steps.some(
        (s) => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
      ) ||
      (m.faq && m.faq.some((f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)));

    return matchesCategory && matchesSearch;
  });
});

const generalFaq = [
  {
    q: 'Internet uzilib qolsa tizim ishlaydimi?',
    a: 'Boshqar.uz Desktop (Tauri) va Web ilovasi qisman mahalliy kesh orqali kassa savdosini amalga oshirish va internet tiklanganda serverga sinxronizatsiya qilish imkoniyatiga ega.'
  },
  {
    q: 'Bitta login bilan bir vaqtda bir nechta qurilmadan kirsa bo\'ladimi?',
    a: 'Ha, multi-tenant arxitekturamiz tufayli do\'kon egasi telefondan, kassir esa noutbuk yoki monoblokdan bir vaqtda bemalol ishlay oladi.'
  },
  {
    q: 'Xavfsizlik va ma\'lumotlar daxlsizligi qanday ta\'minlanadi?',
    a: 'Har bir korxona ma\'lumotlari mustaqil ravishda PostgreSQL multi-tenancy darajasida izolyatsiya qilingan va barcha o\'zgarishlar Audit jurnaliga qayd etiladi.'
  }
];
</script>
