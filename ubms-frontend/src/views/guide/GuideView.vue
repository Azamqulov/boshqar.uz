<template>
  <div class="space-y-6 max-w-6xl mx-auto pb-16">
    <!-- 1. Header with Mode Switcher Component -->
    <GuideHeader
      v-model:view-mode="viewMode"
      @switch-to-catalog="switchToCatalog"
    />

    <!-- 2. AI Fullscreen View Mode -->
    <div v-if="viewMode === 'ai'" class="h-[720px] max-h-[82vh] animate-in fade-in duration-200">
      <BoshqarAIAssistant :is-floating="false" />
    </div>

    <!-- 3. TOPIC DETAIL PAGE VIEW Component -->
    <GuideTopicDetail
      v-else-if="selectedTopic"
      :topic="selectedTopic"
      @back="selectedTopic = null"
      @ask-ai="viewMode = 'ai'"
    />

    <!-- 4. MAIN CATALOG OVERVIEW VIEW Component -->
    <GuideCatalogGrid
      v-else
      v-model:search-query="searchQuery"
      :topics="filteredTopics"
      @select-topic="selectedTopic = $event"
      @ask-ai="viewMode = 'ai'"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  ShoppingCart,
  Package,
  Store,
  Users,
  DollarSign,
  Settings,
} from 'lucide-vue-next';
import { GUIDE_MODULES } from './guideData';
import BoshqarAIAssistant from '@/components/BoshqarAIAssistant.vue';
import GuideHeader from './components/GuideHeader.vue';
import GuideTopicDetail from './components/GuideTopicDetail.vue';
import GuideCatalogGrid from './components/GuideCatalogGrid.vue';

const searchQuery = ref('');
const viewMode = ref<'guides' | 'ai'>('guides');
const selectedTopic = ref<any>(null);

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
