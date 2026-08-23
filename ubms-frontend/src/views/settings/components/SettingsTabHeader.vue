<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Tizim Sozlamalari</h1>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Shaxsiy profil, biznes parametrlari, interfeys mavzusi, xodimlar va ruxsatlar boshqaruvi</p>
    </div>

    <!-- Tabs with Smooth Sliding Animation and Next/Prev Navigation -->
    <div class="flex items-center gap-1.5 w-full border-b border-slate-200 dark:border-slate-800 pb-2">
      <!-- Left Prev Button -->
      <button
        type="button"
        @click="$emit('prevTab')"
        :disabled="currentTabIndex <= 0"
        class="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-700 dark:text-slate-200 transition shrink-0 btn-interactive shadow-2xs"
        title="Oldingi sozlama"
      >
        <ChevronLeft class="w-4 h-4" />
      </button>

      <!-- Scrollable container -->
      <div
        ref="tabContainerRef"
        class="relative flex-1 flex items-center space-x-1.5 text-xs overflow-x-auto scrollbar-none scroll-smooth"
      >
        <!-- Animated Sliding Background Pill -->
        <div
          v-if="pillStyle"
          class="absolute rounded-xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none"
          :class="activeTab === 'danger' ? 'bg-rose-500 shadow-md shadow-rose-500/25' : 'bg-emerald-500 shadow-md shadow-emerald-500/25'"
          :style="pillStyle"
        ></div>

        <button
          v-for="tab in settingsTabs"
          :key="tab.id"
          :ref="(el) => setTabRef(el, tab.id)"
          type="button"
          @click="$emit('selectTab', tab.id)"
          class="relative z-10 flex items-center space-x-2 px-4 py-2 rounded-xl font-bold transition-colors duration-300 whitespace-nowrap shrink-0 btn-interactive"
          :class="[
            activeTab === tab.id
              ? 'text-white'
              : tab.id === 'danger'
              ? 'text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          ]"
        >
          <component
            :is="tab.icon"
            class="w-4 h-4 transition-colors duration-300"
            :class="activeTab === tab.id ? 'text-white' : tab.id === 'danger' ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400'"
          />
          <span>{{ tab.label }}</span>
          <span
            v-if="tab.featureKey && isFeatureDisabled(tab.featureKey)"
            class="ml-1 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase inline-flex items-center gap-0.5"
            :class="activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-rose-500/15 text-rose-500 dark:text-rose-400'"
            title="Tarifingizda o'chirilgan"
          >
            <Lock class="w-2.5 h-2.5" />
            <span>OFF</span>
          </span>
        </button>
      </div>

      <!-- Right Next Button -->
      <button
        type="button"
        @click="$emit('nextTab')"
        :disabled="currentTabIndex >= settingsTabs.length - 1"
        class="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-700 dark:text-slate-200 transition shrink-0 btn-interactive shadow-2xs"
        title="Keyingi sozlama"
      >
        <ChevronRight class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-vue-next';

const props = defineProps<{
  activeTab: string;
  currentTabIndex: number;
  settingsTabs: any[];
  isFeatureDisabled: (key: string) => boolean;
}>();

defineEmits<{
  (e: 'selectTab', tabId: string): void;
  (e: 'prevTab'): void;
  (e: 'nextTab'): void;
}>();

const tabContainerRef = ref<HTMLElement | null>(null);
const tabRefs = ref<Record<string, HTMLElement | null>>({});
const pillStyle = ref<{ left: string; width: string; height: string; top: string } | null>(null);

const setTabRef = (el: any, tabId: string) => {
  if (el) tabRefs.value[tabId] = el as HTMLElement;
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
