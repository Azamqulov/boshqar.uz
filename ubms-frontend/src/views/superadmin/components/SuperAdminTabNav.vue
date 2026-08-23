<template>
  <div>
    <!-- 1. MOBILE VIEW (Native App Style Horizontal Scroll with active emerald pills) -->
    <div class="block sm:hidden w-full -mx-1">
      <div
        ref="mobileTabContainerRef"
        class="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 px-1 snap-x snap-mandatory"
        style="-webkit-overflow-scrolling: touch;"
      >
        <button
          v-for="tab in adminTabs"
          :key="'mob-' + tab.id"
          :ref="(el) => setMobileTabRef(el, tab.id)"
          @click="$emit('selectTab', tab.id)"
          type="button"
          class="snap-start shrink-0 px-3.5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all duration-200 active:scale-95 shadow-xs border"
          :class="activeTab === tab.id
            ? 'bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/25 font-black'
            : 'bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border-slate-200/90 dark:border-slate-700/80'"
        >
          <component
            :is="tab.icon"
            class="w-4 h-4 shrink-0"
            :class="activeTab === tab.id ? 'text-white' : 'text-emerald-500'"
          />
          <span class="whitespace-nowrap">{{ tab.label }}</span>
          <span
            v-if="tab.count !== undefined"
            class="px-1.5 py-0.5 rounded-full text-[10px] font-mono leading-none font-black"
            :class="activeTab === tab.id
              ? 'bg-white/20 text-white'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'"
          >
            {{ tab.count }}
          </span>
        </button>
      </div>
    </div>

    <!-- 2. DESKTOP VIEW (Sliding Animated Pill & Next/Prev Controls) -->
    <div class="hidden sm:flex items-center gap-1.5 w-full">
      <!-- Left Prev Button -->
      <button
        type="button"
        @click="$emit('prevTab')"
        :disabled="currentTabIndex <= 0"
        class="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-700 dark:text-slate-200 transition shrink-0 btn-interactive shadow-2xs cursor-pointer"
        title="Oldingi bo'lim"
      >
        <ChevronLeft class="w-4 h-4" />
      </button>

      <!-- Scrollable container -->
      <div
        ref="tabContainerRef"
        class="relative flex-1 flex items-center gap-1 p-1.5 rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 text-xs overflow-x-auto scrollbar-none scroll-smooth"
      >
        <!-- Animated Sliding Background Pill -->
        <div
          v-if="pillStyle"
          class="absolute rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-slate-200/70 dark:border-slate-700 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none"
          :style="pillStyle"
        ></div>

        <button
          v-for="tab in adminTabs"
          :key="tab.id"
          :ref="(el) => setTabRef(el, tab.id)"
          type="button"
          @click="$emit('selectTab', tab.id)"
          class="relative z-10 flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all duration-200 whitespace-nowrap shrink-0 btn-interactive cursor-pointer"
          :class="activeTab === tab.id
            ? 'text-emerald-600 dark:text-emerald-400 font-black'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'"
        >
          <component
            :is="tab.icon"
            class="w-4 h-4 transition-colors"
            :class="activeTab === tab.id ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500'"
          />
          <span>{{ tab.label }}</span>
          <span
            v-if="tab.count !== undefined"
            class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold transition-colors"
            :class="activeTab === tab.id
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
              : 'bg-slate-200/70 dark:bg-slate-800 text-slate-500 dark:text-slate-400'"
          >
            {{ tab.count }}
          </span>
        </button>
      </div>

      <!-- Right Next Button -->
      <button
        type="button"
        @click="$emit('nextTab')"
        :disabled="currentTabIndex >= adminTabs.length - 1"
        class="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-700 dark:text-slate-200 transition shrink-0 btn-interactive shadow-2xs cursor-pointer"
        title="Keyingi bo'lim"
      >
        <ChevronRight class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

const props = defineProps<{
  activeTab: string;
  currentTabIndex: number;
  adminTabs: any[];
}>();

defineEmits<{
  (e: 'selectTab', tabId: string): void;
  (e: 'prevTab'): void;
  (e: 'nextTab'): void;
}>();

const tabContainerRef = ref<HTMLElement | null>(null);
const mobileTabContainerRef = ref<HTMLElement | null>(null);
const tabRefs = ref<Record<string, HTMLElement | null>>({});
const mobileTabRefs = ref<Record<string, HTMLElement | null>>({});
const pillStyle = ref<{ left: string; width: string; height: string; top: string } | null>(null);

const setTabRef = (el: any, tabId: string) => {
  if (el) tabRefs.value[tabId] = el as HTMLElement;
};

const setMobileTabRef = (el: any, tabId: string) => {
  if (el) mobileTabRefs.value[tabId] = el as HTMLElement;
};

const updatePillPosition = () => {
  nextTick(() => {
    const activeEl = tabRefs.value[props.activeTab];
    if (activeEl && tabContainerRef.value) {
      pillStyle.value = {
        left: `${activeEl.offsetLeft}px`,
        top: `${activeEl.offsetTop}px`,
        width: `${activeEl.offsetWidth}px`,
        height: `${activeEl.offsetHeight}px`,
      };
    }
  });
};

watch(() => props.activeTab, updatePillPosition);
onMounted(updatePillPosition);
</script>
