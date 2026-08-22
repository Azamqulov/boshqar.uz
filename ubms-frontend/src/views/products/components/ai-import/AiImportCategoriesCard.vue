<template>
  <div class="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-sm bg-white dark:bg-slate-900 flex-1 flex flex-col justify-between space-y-2">
    <div class="flex items-center justify-between shrink-0">
      <div class="flex items-center gap-2">
        <div class="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <FolderTree class="w-3.5 h-3.5" />
        </div>
        <h3 class="text-xs font-bold text-slate-900 dark:text-white">Kategoriyalar</h3>
      </div>

      <button
        v-if="selectedCategoryFilter"
        type="button"
        @click="$emit('toggle-category', '')"
        class="text-[10px] font-bold text-emerald-600 hover:underline"
      >
        Tozalash
      </button>
    </div>

    <div class="space-y-1 overflow-y-auto max-h-[220px] pr-0.5">
      <button
        v-for="cat in categoriesList"
        :key="cat.name"
        type="button"
        @click="$emit('toggle-category', cat.name)"
        class="w-full flex items-center justify-between px-2 py-1.5 rounded-xl text-[11px] font-semibold transition"
        :class="selectedCategoryFilter === cat.name
          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs font-bold'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'"
      >
        <div class="flex items-center gap-1.5 truncate">
          <CupSoda v-if="cat.name === 'Ichimliklar'" class="w-3 h-3 text-emerald-500 shrink-0" />
          <UtensilsCrossed v-else-if="cat.name === 'Oziq-ovqat'" class="w-3 h-3 text-amber-500 shrink-0" />
          <Zap v-else-if="cat.name === 'Maishiy kimyo'" class="w-3 h-3 text-blue-500 shrink-0" />
          <Package v-else class="w-3 h-3 text-slate-400 shrink-0" />
          <span class="truncate">{{ cat.name }}</span>
        </div>
        <span
          class="px-1.5 py-0.2 rounded-full text-[10px] font-bold shrink-0 ml-1"
          :class="cat.count > 0 ? 'bg-emerald-200/80 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'"
        >
          {{ cat.count }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FolderTree, CupSoda, UtensilsCrossed, Zap, Package } from 'lucide-vue-next';

defineProps<{
  categoriesList: Array<{ name: string; count: number }>;
  selectedCategoryFilter: string;
}>();

defineEmits<{
  (e: 'toggle-category', name: string): void;
}>();
</script>
