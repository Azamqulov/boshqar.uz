<template>
  <div class="w-full">
    <table class="w-full text-left text-xs border-collapse">

      <!-- HEAD -->
      <thead class="sticky top-0 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <tr>
          <th class="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide text-slate-400 w-10 text-center">#</th>
          <th class="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide text-slate-400 min-w-[160px]">Nomi</th>
          <th class="px-2 py-2.5 text-[10px] font-bold uppercase tracking-wide text-slate-400 min-w-[130px]">Kategoriya</th>
          <th class="px-2 py-2.5 text-[10px] font-bold uppercase tracking-wide text-slate-400 w-24 text-center">Birlik</th>
          <th class="px-2 py-2.5 text-[10px] font-bold uppercase tracking-wide text-slate-400 w-16 text-center">Soni</th>
          <th class="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide text-slate-400 w-28 text-right">Tan narxi</th>
          <th class="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide text-emerald-500 w-28 text-right">Sotish</th>
          <th class="px-2 py-2.5 text-[10px] font-bold uppercase tracking-wide text-slate-400 w-16 text-center">Marja</th>
          <th class="w-10" />
        </tr>
      </thead>

      <!-- BODY -->
      <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
        <tr v-for="(item, idx) in items" :key="item._id || idx"
          class="group hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">

          <!-- # -->
          <td class="px-3 py-3 text-center text-slate-400 font-mono text-[11px]">
            {{ getItemIndex(item) + 1 }}
          </td>

          <!-- Name -->
          <td class="px-3 py-2">
            <input v-model="item.name" type="text" placeholder="Mahsulot nomi..."
              class="w-full bg-transparent text-slate-900 dark:text-white font-semibold placeholder-slate-300 outline-none px-1.5 py-1 rounded border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-emerald-400 focus:bg-emerald-50/50 dark:focus:bg-slate-800 transition-colors" />
          </td>

          <!-- Category -->
          <td class="px-2 py-2">
            <AppSelect
              v-model="item.categoryName"
              :options="categoryOptions"
              placeholder="Kategoriya"
              searchable size="sm"
              customClass="!text-xs !rounded-lg !py-1 !px-2"
            />
          </td>

          <!-- Unit -->
          <td class="px-1.5 py-2">
            <AppSelect
              v-model="item.unitName"
              :options="unitOptions"
              placeholder="Birlik"
              size="sm"
              customClass="!text-xs !rounded-lg !py-1 !px-2 text-center"
            />
          </td>

          <!-- Qty -->
          <td class="px-2 py-2 text-center">
            <input v-model.number="item.initialStock" type="number" min="0"
              class="w-14 text-center bg-transparent text-slate-800 dark:text-slate-200 font-mono font-semibold outline-none px-1 py-1 rounded border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-emerald-400 transition-colors" />
          </td>

          <!-- Purchase -->
          <td class="px-3 py-2 text-right">
            <input type="text" inputmode="numeric"
              :value="formatPrice(item.purchasePrice)"
              @input="handlePriceInput($event, item, 'purchasePrice')"
              placeholder="0"
              class="w-full text-right bg-transparent text-slate-500 dark:text-slate-400 font-mono outline-none px-1 py-1 rounded border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-emerald-400 transition-colors" />
          </td>

          <!-- Sale -->
          <td class="px-2 py-2">
            <input type="text" inputmode="numeric"
              :value="formatPrice(item.salePrice)"
              @input="handlePriceInput($event, item, 'salePrice')"
              placeholder="0"
              class="w-full text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 outline-none px-2 py-1.5 rounded-lg focus:ring-1 focus:ring-emerald-400 transition-colors" />
          </td>

          <!-- Margin -->
          <td class="px-2 py-2 text-center">
            <span class="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md font-mono"
              :class="calculateMargin(item) > 0
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                : 'bg-slate-100 text-slate-400 dark:bg-slate-800'">
              {{ calculateMargin(item) > 0 ? `+${calculateMargin(item)}%` : '—' }}
            </span>
          </td>

          <!-- Delete -->
          <td class="px-2 py-2 text-center">
            <button @click="$emit('remove-item', item)" type="button"
              class="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all">
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Empty -->
    <div v-if="items.length === 0" class="py-10 text-center text-sm text-slate-400">
      Mahsulotlar yo'q
    </div>
  </div>
</template>

<script setup lang="ts">
import { Trash2 } from 'lucide-vue-next';
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
}>();
</script>
