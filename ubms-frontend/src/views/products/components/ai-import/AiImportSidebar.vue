<template>
  <div class="space-y-3.5">
    <!-- 1. Stats Widget -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-3 shadow-xs">
      <div class="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
        <div class="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <BarChart3 class="w-3.5 h-3.5" />
        </div>
        <h4 class="font-bold text-xs text-slate-800 dark:text-slate-200">
          Umumiy ma'lumot
        </h4>
      </div>

      <div class="space-y-2 text-xs">
        <div class="flex items-center justify-between py-1">
          <div class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Sparkles class="w-3.5 h-3.5 text-emerald-500" />
            <span>Jami mahsulotlar</span>
          </div>
          <span class="font-black text-slate-900 dark:text-white font-mono">
            {{ totalProducts }}
          </span>
        </div>

        <div class="flex items-center justify-between py-1">
          <div class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Boxes class="w-3.5 h-3.5 text-blue-500" />
            <span>Jami miqdor</span>
          </div>
          <span class="font-black text-slate-900 dark:text-white font-mono">
            {{ totalQuantity }}
          </span>
        </div>

        <div class="flex items-center justify-between py-1">
          <div class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Percent class="w-3.5 h-3.5 text-amber-500" />
            <span>O'rtacha marja</span>
          </div>
          <span class="font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {{ averageMargin }}%
          </span>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Coins class="w-3.5 h-3.5 text-emerald-500" />
            <span>Jami qiymat</span>
          </div>
          <span class="font-black text-slate-900 dark:text-white font-mono text-xs">
            {{ totalValueFormatted }}
          </span>
        </div>
      </div>
    </div>

    <!-- 2. Categories List Widget -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-3 shadow-xs">
      <div class="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
        <div class="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <Layers class="w-3.5 h-3.5" />
        </div>
        <h4 class="font-bold text-xs text-slate-800 dark:text-slate-200">
          Kategoriyalar
        </h4>
      </div>

      <div class="space-y-1">
        <!-- All Categories Option -->
        <button
          type="button"
          @click="$emit('select-category', '')"
          class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all"
          :class="
            !selectedCategory
              ? 'bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
          "
        >
          <div class="flex items-center gap-2 truncate">
            <FolderTree class="w-3.5 h-3.5 text-emerald-500" />
            <span class="truncate">Barcha kategoriyalar</span>
          </div>
          <span
            class="px-2 py-0.5 rounded-full text-[10px] font-bold"
            :class="!selectedCategory ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'"
          >
            {{ totalProducts }}
          </span>
        </button>

        <!-- Dynamic Category Items -->
        <button
          v-for="cat in categoryListWithCounts"
          :key="cat.name"
          type="button"
          @click="$emit('select-category', cat.name)"
          class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all"
          :class="
            selectedCategory === cat.name
              ? 'bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-bold'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
          "
        >
          <div class="flex items-center gap-2 truncate">
            <span
              class="w-2 h-2 rounded-full shrink-0"
              :style="{ backgroundColor: cat.color || '#10b981' }"
            ></span>
            <span class="truncate">{{ cat.name }}</span>
          </div>
          <span
            class="px-2 py-0.5 rounded-full text-[10px] font-bold"
            :class="selectedCategory === cat.name ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'"
          >
            {{ cat.count }}
          </span>
        </button>
      </div>
    </div>

    <!-- 3. Quick Actions Widget -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-3 shadow-xs">
      <div class="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
        <div class="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <Zap class="w-3.5 h-3.5 fill-amber-500" />
        </div>
        <h4 class="font-bold text-xs text-slate-800 dark:text-slate-200">
          Tezkor amallar
        </h4>
      </div>

      <div class="space-y-2">
        <button
          type="button"
          @click="$emit('open-excel-import')"
          class="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800/60 transition shadow-2xs"
        >
          <FileSpreadsheet class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Excel'dan import</span>
        </button>

        <button
          type="button"
          @click="$emit('apply-margin')"
          class="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition shadow-2xs"
        >
          <TrendingUp class="w-4 h-4 text-amber-500" />
          <span>+25% Marja qo'yish</span>
        </button>

        <button
          type="button"
          @click="$emit('save-all')"
          :disabled="saving || totalProducts === 0"
          class="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-black shadow-lg shadow-emerald-500/25 transition btn-interactive"
        >
          <Check class="w-4 h-4" />
          <span>{{ saving ? 'Saqlanmoqda...' : `Barchasini Saqlash (${totalProducts} ta)` }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  BarChart3,
  Sparkles,
  Boxes,
  Percent,
  Coins,
  Layers,
  FolderTree,
  Zap,
  FileSpreadsheet,
  TrendingUp,
  Check,
} from 'lucide-vue-next';

defineProps<{
  totalProducts: number;
  totalQuantity: number;
  averageMargin: number;
  totalValueFormatted: string;
  selectedCategory: string;
  categoryListWithCounts: { name: string; count: number; color?: string }[];
  saving: boolean;
}>();

defineEmits<{
  (e: 'select-category', cat: string): void;
  (e: 'open-excel-import'): void;
  (e: 'apply-margin'): void;
  (e: 'save-all'): void;
}>();
</script>
