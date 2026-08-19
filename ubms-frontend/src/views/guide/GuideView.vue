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
  Truck,
  DollarSign,
  Clock,
  UtensilsCrossed,
  Calendar,
  LayoutDashboard,
  Bot,
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

const iconMap: Record<string, any> = {
  pos: ShoppingCart,
  products: Package,
  inventory: Store,
  customers: Users,
  suppliers: Truck,
  finance: DollarSign,
  shifts: Clock,
  restaurant: UtensilsCrossed,
  appointments: Calendar,
  dashboard: LayoutDashboard,
  telegram: Bot,
  settings: Settings,
};

const iconStyleMap: Record<string, { bg: string; color: string }> = {
  pos: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400',
    color: 'text-emerald-600 dark:text-emerald-400',
  },
  products: {
    bg: 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400',
    color: 'text-blue-600 dark:text-blue-400',
  },
  inventory: {
    bg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400',
    color: 'text-amber-600 dark:text-amber-400',
  },
  customers: {
    bg: 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400',
    color: 'text-purple-600 dark:text-purple-400',
  },
  suppliers: {
    bg: 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400',
    color: 'text-cyan-600 dark:text-cyan-400',
  },
  finance: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400',
    color: 'text-emerald-600 dark:text-emerald-400',
  },
  shifts: {
    bg: 'bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400',
    color: 'text-orange-600 dark:text-orange-400',
  },
  restaurant: {
    bg: 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400',
    color: 'text-rose-600 dark:text-rose-400',
  },
  appointments: {
    bg: 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400',
    color: 'text-purple-600 dark:text-purple-400',
  },
  dashboard: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400',
    color: 'text-indigo-600 dark:text-indigo-400',
  },
  telegram: {
    bg: 'bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400',
    color: 'text-sky-600 dark:text-sky-400',
  },
  settings: {
    bg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
    color: 'text-slate-600 dark:text-slate-400',
  },
};

const guideTopics = computed(() => {
  return GUIDE_MODULES.map((m) => {
    const style = iconStyleMap[m.id] || {
      bg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
      color: 'text-slate-600 dark:text-slate-400',
    };
    return {
      id: m.id,
      title: m.title,
      desc: m.shortDesc,
      count: m.steps.length + m.faq.length,
      icon: iconMap[m.id] || Settings,
      iconBg: style.bg,
      iconColor: style.color,
      route: m.route,
      steps: m.steps,
      faq: m.faq,
    };
  });
});

const filteredTopics = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  if (!q) return guideTopics.value;
  return guideTopics.value.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.desc.toLowerCase().includes(q) ||
      t.steps.some(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
      ) ||
      t.faq.some(
        (f) =>
          f.q.toLowerCase().includes(q) ||
          f.a.toLowerCase().includes(q)
      )
  );
});

const switchToCatalog = () => {
  viewMode.value = 'guides';
  selectedTopic.value = null;
};
</script>
