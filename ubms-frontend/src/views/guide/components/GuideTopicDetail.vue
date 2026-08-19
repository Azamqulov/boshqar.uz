<template>
  <div class="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-200">
    <!-- Back Button & Breadcrumb -->
    <div class="flex items-center justify-between">
      <button
        type="button"
        @click="$emit('back')"
        class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition shadow-2xs cursor-pointer"
      >
        <ChevronLeft class="w-4 h-4" />
        <span>Barcha qo‘llanmalarga qaytish</span>
      </button>

      <router-link
        :to="topic.route"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition active:scale-95"
      >
        <span>{{ topic.title }} sahifasiga o‘tish</span>
        <ArrowRight class="w-4 h-4" />
      </router-link>
    </div>

    <!-- Topic Header Card -->
    <div class="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs">
      <div class="flex items-start gap-4">
        <div :class="['w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-xs', topic.iconBg]">
          <component :is="topic.icon" :class="['w-7 h-7', topic.iconColor]" />
        </div>
        <div>
          <div class="flex items-center gap-2.5 flex-wrap">
            <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {{ topic.title }}
            </h2>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/60">
              {{ topic.count }} ta ko‘rsatma
            </span>
          </div>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            {{ topic.desc }}
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
          v-for="(step, sIdx) in topic.steps"
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
    <div v-if="topic.faq && topic.faq.length" class="space-y-3 pt-2">
      <h3 class="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
        <HelpCircle class="w-4.5 h-4.5 text-emerald-500" />
        <span>Ko‘p beriladigan savollar (FAQ):</span>
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div
          v-for="(f, fIdx) in topic.faq"
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

    <!-- Bottom Help Banner Component -->
    <GuideHelpBanner @ask-ai="$emit('ask-ai')" />
  </div>
</template>

<script setup lang="ts">
import {
  ChevronLeft,
  ArrowRight,
  ListChecks,
  Lightbulb,
  HelpCircle,
} from 'lucide-vue-next';
import GuideHelpBanner from './GuideHelpBanner.vue';

defineProps<{
  topic: any;
}>();

defineEmits<{
  (e: 'back'): void;
  (e: 'ask-ai'): void;
}>();
</script>
