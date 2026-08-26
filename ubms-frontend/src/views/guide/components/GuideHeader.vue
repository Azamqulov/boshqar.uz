<template>
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
        Foydalanish Qo‘llanmasi
      </h1>
      <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
        Tizimdan foydalanishni o‘rganing yoki Boshqar AI'dan so‘rang.
      </p>
    </div>

    <!-- Segmented Mode Switcher with Fullscreen and Hotkeys -->
    <div class="flex flex-wrap items-center gap-2.5">
      <button
        type="button"
        @click="toggleFullscreen"
        class="px-3 py-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition shadow-2xs border border-slate-200 dark:border-slate-700 cursor-pointer"
        :title="isFullscreen ? 'To\'liq ekrandan chiqish (F11 / Esc)' : 'To\'liq ekran rejimi (F11)'"
      >
        <Maximize class="w-3.5 h-3.5 text-blue-500" />
        <span>{{ isFullscreen ? 'Kichraytirish' : 'To\'liq Ekran' }}</span>
        <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-mono">F11</span>
      </button>

      <div class="relative inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-full border border-slate-200/80 dark:border-slate-700/80 shrink-0 shadow-2xs">
        <!-- Animated Sliding Background Pill -->
        <div
          class="absolute top-1 bottom-1 rounded-full bg-emerald-600 shadow-md shadow-emerald-600/30 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none"
          :style="pillStyle"
        ></div>

        <button
          ref="guidesBtnRef"
          type="button"
          @click="$emit('switch-to-catalog')"
          class="relative z-10 flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-colors duration-300"
          :class="viewMode === 'guides' ? 'text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
        >
          <BookOpen :class="['w-4 h-4 transition-colors duration-300', viewMode === 'guides' ? 'text-white' : 'text-slate-500 dark:text-slate-400']" />
          <span>Qo‘llanmalar Katalogi</span>
        </button>

        <button
          ref="aiBtnRef"
          type="button"
          @click="$emit('update:viewMode', 'ai')"
          class="relative z-10 flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-colors duration-300"
          :class="viewMode === 'ai' ? 'text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
        >
          <Sparkles :class="['w-4 h-4 transition-colors duration-300', viewMode === 'ai' ? 'text-white' : 'text-slate-500 dark:text-slate-400']" />
          <span>Boshqar AI bilan so‘rash</span>
        </button>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { BookOpen, Sparkles, Maximize } from 'lucide-vue-next';

const isFullscreen = ref(false);

const toggleFullscreen = () => {
  if (typeof document === 'undefined') return;
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
    isFullscreen.value = true;
  } else {
    document.exitFullscreen().catch(() => {});
    isFullscreen.value = false;
  }
};


const props = defineProps<{
  viewMode: 'guides' | 'ai';
}>();

defineEmits<{
  (e: 'update:viewMode', val: 'guides' | 'ai'): void;
  (e: 'switch-to-catalog'): void;
}>();

const guidesBtnRef = ref<HTMLElement | null>(null);
const aiBtnRef = ref<HTMLElement | null>(null);
const isMounted = ref(false);

onMounted(() => {
  isMounted.value = true;
});

const pillStyle = computed(() => {
  const target = props.viewMode === 'guides' ? guidesBtnRef.value : aiBtnRef.value;
  if (!target || !isMounted.value) {
    return props.viewMode === 'guides'
      ? { left: '4px', width: '185px' }
      : { left: '193px', width: '215px' };
  }
  return {
    left: `${target.offsetLeft}px`,
    width: `${target.offsetWidth}px`,
  };
});
</script>
