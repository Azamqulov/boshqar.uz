<template>
  <div class="space-y-6">
    <!-- Search Input -->
    <div class="relative">
      <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
      <input
        :value="searchQuery"
        @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
        type="text"
        placeholder="Nima haqida izlamoqchisiz? (masalan: tovar qo‘shish, chek chiqarish, nasiyaga savdo...)"
        class="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs sm:text-sm font-medium shadow-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
      />
      <button
        v-if="searchQuery"
        type="button"
        @click="$emit('update:searchQuery', '')"
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
        v-if="searchQuery"
        type="button"
        @click="$emit('update:searchQuery', '')"
        class="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
      >
        <span>Barchasini ko‘rish</span>
        <ArrowRight class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- 6 Topic Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      <div
        v-for="item in topics"
        :key="item.id"
        @click="$emit('select-topic', item)"
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

    <!-- Bottom Help Banner Component -->
    <GuideHelpBanner @ask-ai="$emit('ask-ai')" />
  </div>
</template>

<script setup lang="ts">
import {
  Search,
  Flame,
  ArrowRight,
  X,
} from 'lucide-vue-next';
import GuideHelpBanner from './GuideHelpBanner.vue';

defineProps<{
  searchQuery: string;
  topics: any[];
}>();

defineEmits<{
  (e: 'update:searchQuery', val: string): void;
  (e: 'select-topic', topic: any): void;
  (e: 'ask-ai'): void;
}>();
</script>
