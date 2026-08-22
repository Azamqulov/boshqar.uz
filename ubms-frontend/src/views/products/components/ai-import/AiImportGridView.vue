<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <!-- Product Cards -->
    <div
      v-for="item in items"
      :key="getItemIndex(item)"
      class="p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 hover:shadow-lg hover:shadow-emerald-500/5 transition-all space-y-3.5 group relative"
    >
      <!-- Top Accent Bar -->
      <div class="absolute top-0 left-4 right-4 h-1 bg-gradient-to-r from-emerald-500/40 via-teal-500/40 to-emerald-500/20 rounded-b-full group-hover:from-emerald-500 group-hover:to-teal-500 transition-all"></div>

      <!-- Top Bar: Index, Category & Delete -->
      <div class="flex items-center justify-between gap-2 pt-1">
        <div class="flex items-center gap-1.5 flex-1 min-w-0">
          <span class="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-mono text-[11px] font-bold shrink-0 border border-emerald-500/20">
            #{{ getItemIndex(item) + 1 }}
          </span>
          <div class="flex-1 min-w-0 max-w-[170px]">
            <AppSelect
              v-model="item.categoryName"
              :options="categoryOptions"
              placeholder="Kategoriya"
              searchable
              size="sm"
              customClass="!py-1 !px-2 !rounded-lg text-xs font-semibold !border-slate-200 dark:!border-slate-700"
            />
          </div>
        </div>

        <button
          type="button"
          @click="$emit('remove-item', item)"
          class="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition shrink-0"
          title="Mahsulotni o'chirish"
        >
          <Trash2 class="w-4 h-4" />
        </button>
      </div>

      <!-- Product Name Input with Icon -->
      <div>
        <label class="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
          <Package class="w-3 h-3 text-emerald-500" />
          <span>Mahsulot Nomi *</span>
        </label>
        <input
          v-model="item.name"
          type="text"
          placeholder="Masalan: Kola 1.5L"
          class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500 text-slate-900 dark:text-white font-bold text-sm outline-none transition"
        />
      </div>

      <!-- Stock & Unit -->
      <div class="grid grid-cols-2 gap-2 bg-slate-50/70 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
        <div>
          <label class="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
            <Boxes class="w-3 h-3 text-slate-400" />
            <span>Omborda</span>
          </label>
          <input
            v-model.number="item.initialStock"
            type="number"
            min="0"
            placeholder="0"
            class="w-full px-2.5 py-1 text-right rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-xs outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label class="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
            <Scale class="w-3 h-3 text-amber-500" />
            <span>Birlik</span>
          </label>
          <AppSelect
            v-model="item.unitName"
            :options="unitOptions"
            placeholder="Birlik"
            size="sm"
            customClass="!py-1 !px-2 !rounded-lg text-xs font-semibold !bg-white dark:!bg-slate-800"
          />
        </div>
      </div>

      <!-- Price Breakdown: Purchase & Sale Price -->
      <div class="grid grid-cols-2 gap-2">
        <div class="p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <label class="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
            <ArrowDownRight class="w-3 h-3 text-slate-400" />
            <span>Tan Narxi</span>
          </label>
          <input
            type="text"
            inputmode="numeric"
            :value="formatPrice(item.purchasePrice)"
            @input="handlePriceInput($event, item, 'purchasePrice')"
            placeholder="0"
            class="w-full px-2 py-1 text-right rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono font-bold text-xs outline-none focus:border-emerald-500"
          />
        </div>

        <div class="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 dark:from-emerald-950/30 dark:to-teal-950/10 border border-emerald-500/25">
          <div class="flex items-center justify-between mb-1">
            <label class="flex items-center gap-1 text-[10px] font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
              <TrendingUp class="w-3 h-3 text-emerald-600" />
              <span>Sotish *</span>
            </label>
            <span
              v-if="calculateMargin(item) > 0"
              class="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-emerald-600 text-white font-mono shadow-2xs"
            >
              +{{ calculateMargin(item) }}%
            </span>
          </div>
          <input
            type="text"
            inputmode="numeric"
            :value="formatPrice(item.salePrice)"
            @input="handlePriceInput($event, item, 'salePrice')"
            placeholder="0"
            class="w-full px-2 py-1 text-right rounded-lg border border-emerald-500/30 bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 font-mono font-black text-xs outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>
      </div>

      <!-- Barcode -->
      <div class="relative flex items-center">
        <Barcode class="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
        <input
          v-model="item.barcode"
          type="text"
          placeholder="Shtrixkod (ixtiyoriy)..."
          class="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 font-mono text-xs outline-none focus:border-emerald-500"
        />
      </div>
    </div>

    <!-- Quick Add New Product Card -->
    <button
      type="button"
      @click="$emit('add-empty')"
      class="min-h-[220px] rounded-2xl border-2 border-dashed border-emerald-500/30 dark:border-emerald-500/30 hover:border-emerald-500 dark:hover:border-emerald-400 bg-emerald-500/5 dark:bg-emerald-950/10 hover:bg-emerald-500/10 dark:hover:bg-emerald-950/20 transition-all flex flex-col items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 group cursor-pointer shadow-2xs"
    >
      <div class="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-emerald-500/30 group-hover:border-emerald-500 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
        <Plus class="w-6 h-6" />
      </div>
      <span class="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
        + Yangi Mahsulot Qo'shish
      </span>
      <span class="text-[10px] text-slate-400 dark:text-slate-500">
        Qo'lda yana bitta tovar kiritish
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import {
  Trash2,
  Barcode,
  Plus,
  Package,
  Boxes,
  Scale,
  ArrowDownRight,
  TrendingUp,
} from 'lucide-vue-next';
import AppSelect from '@/components/AppSelect.vue';
import type { TableProductItem } from './types';
import type { SelectOption } from '@/components/AppSelect.vue';

defineProps<{
  items: TableProductItem[];
  categoryOptions: SelectOption[];
  unitOptions: SelectOption[];
  getItemIndex: (item: TableProductItem) => number;
  calculateMargin: (item: TableProductItem) => number;
  formatPrice: (val: number | undefined | null) => string;
  handlePriceInput: (event: Event, item: TableProductItem, field: 'purchasePrice' | 'salePrice') => void;
}>();

defineEmits<{
  (e: 'remove-item', item: TableProductItem): void;
  (e: 'add-empty'): void;
}>();
</script>
