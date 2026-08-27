<template>
  <div class="w-full">
    <!-- Responsive Tab Navigation Container -->
    <div class="w-full p-1.5 rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs">
      <!-- Scroll/Wrap Track -->
      <div
        ref="tabContainerRef"
        class="flex flex-nowrap lg:flex-wrap items-center gap-1.5 overflow-x-auto lg:overflow-x-visible scrollbar-none scroll-smooth p-0.5"
      >
        <button
          v-for="tab in adminTabs"
          :key="tab.id"
          :ref="(el) => setTabRef(el, tab.id)"
          type="button"
          @click="onSelectTab(tab.id)"
          class="relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer select-none"
          :class="activeTab === tab.id
            ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/90 dark:border-slate-700 font-black scale-[1.02]'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/60 border border-transparent'"
        >
          <component
            :is="tab.icon"
            class="w-4 h-4 shrink-0 transition-colors"
            :class="activeTab === tab.id ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500'"
          />
          <span class="whitespace-nowrap">{{ tab.label }}</span>
          <span
            v-if="tab.count !== undefined"
            class="px-2 py-0.5 rounded-full text-[10px] font-mono font-black transition-colors shrink-0"
            :class="activeTab === tab.id
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
              : 'bg-slate-200/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400'"
          >
            {{ tab.count }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue';

const props = defineProps<{
  activeTab: string;
  currentTabIndex: number;
  adminTabs: any[];
}>();

const emit = defineEmits<{
  (e: 'selectTab', tabId: string): void;
}>();

const tabContainerRef = ref<HTMLElement | null>(null);
const tabRefs = ref<Record<string, HTMLElement | null>>({});

const setTabRef = (el: any, tabId: string) => {
  if (el) tabRefs.value[tabId] = el as HTMLElement;
};

const onSelectTab = (tabId: string) => {
  emit('selectTab', tabId);
  scrollToTab(tabId);
};

const scrollToTab = (tabId: string) => {
  nextTick(() => {
    const el = tabRefs.value[tabId];
    if (el && tabContainerRef.value) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  });
};

watch(() => props.activeTab, (newTab) => {
  scrollToTab(newTab);
});

onMounted(() => {
  scrollToTab(props.activeTab);
});
</script>
