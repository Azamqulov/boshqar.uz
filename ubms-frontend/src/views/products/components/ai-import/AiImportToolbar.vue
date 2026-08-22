<template>
  <div class="space-y-3.5">
    <!-- Top Row: Stats & Action Buttons with Emerald accents -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-slate-50/80 dark:from-emerald-950/20 dark:via-teal-950/10 dark:to-slate-800/40 p-3.5 rounded-2xl border border-emerald-500/15 dark:border-emerald-500/20 shadow-2xs">
      <!-- Summary stats badges -->
      <div class="flex items-center gap-2.5 flex-wrap">
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-500/20 shadow-2xs">
          <div class="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Boxes class="w-3.5 h-3.5" />
          </div>
          <span class="text-xs font-black text-slate-800 dark:text-slate-100">
            {{ totalCount }} ta tovar
          </span>
        </div>

        <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
          <div class="w-6 h-6 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Coins class="w-3.5 h-3.5" />
          </div>
          <div class="flex items-baseline gap-1.5">
            <span class="text-[11px] text-slate-500 dark:text-slate-400">Jami qiymat:</span>
            <span class="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {{ totalValueFormatted }}
            </span>
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          @click="$emit('add-row')"
          class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-2xs transition btn-interactive"
        >
          <Plus class="w-3.5 h-3.5 text-emerald-500" />
          <span>Qator qo'shish</span>
        </button>

        <button
          type="button"
          @click="$emit('apply-margin')"
          class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm shadow-emerald-500/20 transition btn-interactive"
          title="Tan narxga 25% ustama qo'shib sotish narxini hisoblash"
        >
          <Zap class="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
          <span>+25% Marja qo'yish</span>
        </button>

        <button
          type="button"
          @click="$emit('clear-all')"
          class="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/50 text-xs font-bold transition"
          title="Jadvalni tozalash"
        >
          <Trash2 class="w-3.5 h-3.5" />
          <span class="hidden sm:inline">Tozalash</span>
        </button>
      </div>
    </div>

    <!-- Filter & View Controls -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
      <!-- Search Input -->
      <div class="relative flex-1 sm:max-w-xs">
        <Search class="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
        <input
          :value="searchQuery"
          @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
          type="text"
          placeholder="Nomi, kategoriya yoki shtrixkod..."
          class="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 shadow-2xs transition"
        />
      </div>

      <div class="flex items-center gap-2 flex-wrap justify-between sm:justify-end">
        <!-- Category Filter Tabs with Tag Icon -->
        <div v-if="categoriesList.length > 1" class="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs overflow-x-auto scrollbar-none max-w-full">
          <button
            type="button"
            @click="$emit('update:selectedCategory', '')"
            class="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap"
            :class="!selectedCategory ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
          >
            <span>Barchasi ({{ totalCount }})</span>
          </button>
          <button
            v-for="cat in categoriesList"
            :key="cat"
            type="button"
            @click="$emit('update:selectedCategory', cat)"
            class="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap"
            :class="selectedCategory === cat ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
          >
            <Tag class="w-3 h-3 opacity-70" />
            <span>{{ cat }}</span>
          </button>
        </div>

        <!-- View Mode Toggle (Card vs Table) -->
        <AppViewToggle
          class="inline-flex shrink-0"
          :model-value="viewMode"
          @update:model-value="$emit('update:viewMode', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Boxes, Coins, Plus, Zap, Trash2, Search, Tag } from 'lucide-vue-next';
import AppViewToggle from '@/components/AppViewToggle.vue';

defineProps<{
  totalCount: number;
  totalValueFormatted: string;
  searchQuery: string;
  selectedCategory: string;
  categoriesList: string[];
  viewMode: 'table' | 'grid';
}>();

defineEmits<{
  (e: 'add-row'): void;
  (e: 'apply-margin'): void;
  (e: 'clear-all'): void;
  (e: 'update:searchQuery', val: string): void;
  (e: 'update:selectedCategory', val: string): void;
  (e: 'update:viewMode', val: 'table' | 'grid'): void;
}>();
</script>
