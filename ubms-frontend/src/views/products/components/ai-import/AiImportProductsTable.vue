<template>
  <div class="glass-card rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs bg-white dark:bg-slate-900 space-y-4">
    <!-- Table Card Top Header Row -->
    <div class="flex items-center justify-between gap-3 pb-1 border-b border-slate-100 dark:border-slate-800/60">
      <div class="flex items-center gap-2.5">
        <h3 class="text-sm font-bold text-slate-900 dark:text-white">Kiritilgan mahsulotlar</h3>
        <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
          {{ filteredParsedItems.length }} ta mahsulot
        </span>

        <!-- Clear All Button -->
        <button
          v-if="parsedItemsCount > 0"
          type="button"
          @click="$emit('reset-all')"
          class="px-2.5 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-400 text-xs font-bold transition flex items-center gap-1 shadow-2xs btn-interactive shrink-0"
          title="Barcha mahsulotlarni tozalash"
        >
          <Trash2 class="w-3.5 h-3.5" />
          <span>Tozalash</span>
        </button>
      </div>

      <!-- Save Button at Top Right -->
      <button
        v-if="parsedItemsCount > 0"
        type="button"
        @click="$emit('save-all')"
        :disabled="saving"
        class="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition btn-interactive shrink-0"
      >
        <Loader2 v-if="saving" class="w-3.5 h-3.5 animate-spin" />
        <Check v-else class="w-3.5 h-3.5" />
        <span>Katalogga saqlash ({{ parsedItemsCount }})</span>
      </button>
    </div>

    <!-- Bottom Controls Row (Search & View Toggle) -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
      <!-- Search Input -->
      <div class="relative flex-1 min-w-[200px]">
        <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          :value="searchQuery"
          @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
          type="text"
          placeholder="Kiritilgan mahsulotlarni qidirish..."
          class="w-full text-xs pl-10 pr-9 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition shadow-inner"
        />
        <button
          v-if="searchQuery"
          type="button"
          @click="$emit('update:searchQuery', '')"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- View Mode Toggle -->
      <div class="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shrink-0">
        <button
          type="button"
          @click="$emit('update:viewMode', 'table')"
          class="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition"
          :class="viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'"
        >
          <List class="w-4 h-4" />
          <span>Jadval</span>
        </button>
        <button
          type="button"
          @click="$emit('update:viewMode', 'grid')"
          class="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition"
          :class="viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'"
        >
          <LayoutGrid class="w-4 h-4" />
          <span>Kartalar</span>
        </button>
      </div>
    </div>

    <!-- 1. TABLE VIEW (Ixcham, Har doim Barcha Ustunlar 100% Sig'adigan Layout) -->
    <div v-if="viewMode === 'table'" class="overflow-x-auto hide-scrollbar pb-1 -mx-4 px-4 sm:-mx-5 sm:px-5">
      <table class="w-full text-left border-collapse table-auto">
        <thead>
          <tr class="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <th class="py-2.5 px-1 w-6 text-center">#</th>
            <th class="py-2.5 px-1 w-9 text-center">Rasm</th>
            <th class="py-2.5 px-1.5 min-w-[110px]">Mahsulot nomi</th>
            <th class="py-2.5 px-1 w-28">Kategoriya</th>
            <th class="py-2.5 px-1 w-20">Birlik</th>
            <th class="py-2.5 px-1 w-20 text-center">Miqdor</th>
            <th class="py-2.5 px-1 w-24">Tan narxi</th>
            <th class="py-2.5 px-1 w-24">Sotish narxi</th>
            <th class="py-2.5 px-1 w-12 text-center">Marja</th>
            <th class="py-2.5 px-1 w-24">Shtrixkod</th>
            <th class="py-2.5 px-1 w-10 text-center">Amallar</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
          <tr v-if="filteredParsedItems.length === 0">
            <td colspan="11" class="py-10 text-center text-slate-400 font-medium">
              {{ selectedCategoryFilter ? `"${selectedCategoryFilter}" bo'yicha mahsulotlar topilmadi.` : "Hozircha mahsulotlar kiritilmadi. Yuqoridagi chat orqali yozing." }}
            </td>
          </tr>

          <tr
            v-for="(item, idx) in paginatedItems"
            :key="item._id || idx"
            class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition group"
          >
            <td class="py-2 px-1 text-center font-mono text-[11px] text-slate-400 font-bold align-middle">
              {{ (currentPage - 1) * pageSize + idx + 1 }}
            </td>
            
            <!-- Rasm -->
            <td class="py-2 px-1 text-center align-middle">
              <button
                type="button"
                @click="$emit('open-image-modal', item)"
                class="relative w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden mx-auto group/img hover:border-emerald-500 transition shadow-2xs shrink-0"
                title="Rasmni yuklash / almashtirish"
              >
                <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" class="w-full h-full object-cover" />
                <Package v-else class="w-3.5 h-3.5 text-slate-400" />
                <div class="absolute inset-0 bg-slate-950/50 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity text-white backdrop-blur-2xs">
                  <Camera class="w-3 h-3 text-emerald-400" />
                </div>
              </button>
            </td>

            <!-- Mahsulot Nomi -->
            <td class="py-2 px-1.5 font-bold text-slate-900 dark:text-white align-middle">
              <input
                type="text"
                v-model="item.name"
                placeholder="Mahsulot nomi..."
                class="w-full bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-emerald-500 outline-none transition py-0.5 text-xs font-bold"
              />
            </td>

            <!-- Kategoriya -->
            <td class="py-2 px-1 align-middle">
              <AppSelect
                v-model="item.categoryName"
                :options="categorySelectOptions"
                placeholder="Tanlang"
                size="sm"
                class="w-full text-[11px]"
              />
            </td>

            <!-- Birlik -->
            <td class="py-2 px-1 align-middle">
              <AppSelect
                v-model="item.unitName"
                :options="unitSelectOptions"
                placeholder="Birlik"
                size="sm"
                class="w-full text-[11px]"
              />
            </td>

            <!-- Miqdor -->
            <td class="py-2 px-1 text-center align-middle">
              <div class="inline-flex items-center gap-0.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 shadow-2xs">
                <button
                  type="button"
                  @click="$emit('decrement-qty', item)"
                  class="w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  <Minus class="w-2.5 h-2.5" />
                </button>
                <span class="w-5 text-center font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                  {{ item.initialStock || 1 }}
                </span>
                <button
                  type="button"
                  @click="$emit('increment-qty', item)"
                  class="w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  <Plus class="w-2.5 h-2.5" />
                </button>
              </div>
            </td>

            <!-- Tan narxi -->
            <td class="py-2 px-1 align-middle">
              <div class="flex items-center gap-0.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-1.5 py-1 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/20 transition">
                <input
                  type="text"
                  inputmode="numeric"
                  :value="formatPrice(item.purchasePrice)"
                  @input="$emit('price-input', $event, item, 'purchasePrice')"
                  placeholder="0"
                  class="w-full bg-transparent font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200 outline-none text-right"
                />
                <span class="text-[10px] text-slate-400 font-bold shrink-0">{{ currencySymbol }}</span>
              </div>
            </td>

            <!-- Sotish narxi -->
            <td class="py-2 px-1 align-middle">
              <div class="flex items-center gap-0.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-1.5 py-1 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/20 transition">
                <input
                  type="text"
                  inputmode="numeric"
                  :value="formatPrice(item.salePrice)"
                  @input="$emit('price-input', $event, item, 'salePrice')"
                  placeholder="0"
                  class="w-full bg-transparent font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200 outline-none text-right"
                />
                <span class="text-[10px] text-slate-400 font-bold shrink-0">{{ currencySymbol }}</span>
              </div>
            </td>

            <!-- Marja -->
            <td class="py-2 px-1 text-center align-middle">
              <span
                class="px-1.5 py-0.5 rounded-full text-[10px] font-bold font-mono inline-block"
                :class="calculateMargin(item) > 0 ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'"
              >
                {{ calculateMargin(item) }}%
              </span>
            </td>

            <!-- Shtrixkod -->
            <td class="py-2 px-1 align-middle">
              <input
                type="text"
                v-model="item.barcode"
                placeholder="Shtrixkod..."
                class="w-full bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-emerald-500 outline-none transition py-0.5 text-[11px] font-mono"
              />
            </td>

            <!-- Amallar (O'chirish Trash Icon - Har Doim Qirqilmasdan Aniq Ko'rinadi) -->
            <td class="py-2 px-1 text-center align-middle">
              <button
                type="button"
                @click="$emit('remove-row', item)"
                class="w-7 h-7 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center justify-center transition shadow-2xs mx-auto btn-interactive shrink-0"
                title="Mahsulotni o'chirish"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 2. GRID CARDS VIEW -->
    <div v-else>
      <div v-if="filteredParsedItems.length === 0" class="py-12 text-center text-slate-400 font-medium">
        {{ selectedCategoryFilter ? `"${selectedCategoryFilter}" bo'yicha mahsulotlar topilmadi.` : "Hozircha mahsulotlar kiritilmadi. Yuqoridagi chat orqali yozing." }}
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <div
          v-for="(item, idx) in paginatedItems"
          :key="item._id || idx"
          class="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-emerald-500/50 hover:shadow-md transition group flex flex-col justify-between gap-3"
        >
          <div class="flex items-start gap-3">
            <button
              type="button"
              @click="$emit('open-image-modal', item)"
              class="relative w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs flex items-center justify-center shrink-0 overflow-hidden group/thumb hover:border-emerald-500 hover:ring-2 hover:ring-emerald-500/20 transition-all"
              title="Rasmni almashtirish"
            >
              <img
                v-if="item.imageUrl"
                :src="item.imageUrl"
                :alt="item.name"
                class="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-200"
                loading="lazy"
              />
              <Package v-else class="w-6 h-6 text-slate-400" />
              <div class="absolute inset-0 bg-slate-950/50 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity text-white backdrop-blur-2xs">
                <Camera class="w-4 h-4 text-emerald-400" />
              </div>
            </button>

            <div class="flex-1 min-w-0 space-y-1">
              <input
                type="text"
                v-model="item.name"
                placeholder="Mahsulot nomi..."
                class="w-full bg-transparent font-bold text-xs text-slate-900 dark:text-white border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-emerald-500 outline-none transition py-0.5"
              />

              <div class="flex items-center gap-1.5 pt-0.5">
                <div class="w-28">
                  <AppSelect
                    v-model="item.categoryName"
                    :options="categorySelectOptions"
                    placeholder="Kategoriya"
                    size="sm"
                    class="text-[11px]"
                  />
                </div>
                <div class="w-20">
                  <AppSelect
                    v-model="item.unitName"
                    :options="unitSelectOptions"
                    placeholder="Birlik"
                    size="sm"
                    class="text-[11px]"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              @click="$emit('remove-row', item)"
              class="w-8 h-8 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition shrink-0 flex items-center justify-center"
              title="O'chirish"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>

          <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
            <div class="space-y-1">
              <span class="text-[10px] text-slate-400 font-bold uppercase">Tan narxi</span>
              <div class="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5">
                <input
                  type="text"
                  inputmode="numeric"
                  :value="formatPrice(item.purchasePrice)"
                  @input="$emit('price-input', $event, item, 'purchasePrice')"
                  placeholder="0"
                  class="w-full bg-transparent font-mono text-xs font-bold text-slate-800 dark:text-slate-200 outline-none text-right"
                />
                <span class="text-xs text-slate-400 font-bold shrink-0">{{ currencySymbol }}</span>
              </div>
            </div>

            <div class="space-y-1">
              <span class="text-[10px] text-slate-400 font-bold uppercase">Sotish narxi</span>
              <div class="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5">
                <input
                  type="text"
                  inputmode="numeric"
                  :value="formatPrice(item.salePrice)"
                  @input="$emit('price-input', $event, item, 'salePrice')"
                  placeholder="0"
                  class="w-full bg-transparent font-mono text-xs font-bold text-slate-800 dark:text-slate-200 outline-none text-right"
                />
                <span class="text-xs text-slate-400 font-bold shrink-0">{{ currencySymbol }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination (Kartaning o'zining toza footeri) -->
    <AppPagination
      :current-page="currentPage"
      :page-size="pageSize"
      :total-items="filteredParsedItems.length"
      :inline="true"
      item-name="tovardan"
      @update:current-page="$emit('update:currentPage', $event)"
      @update:page-size="$emit('update:pageSize', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import {
  Package,
  Camera,
  Minus,
  Plus,
  Trash2,
  List,
  LayoutGrid,
  Search,
  X,
  Check,
  Loader2,
} from 'lucide-vue-next';
import AppSelect, { type SelectOption } from '@/components/AppSelect.vue';
import AppPagination from '@/components/AppPagination.vue';
import type { TableProductItem } from './types';

defineProps<{
  filteredParsedItems: TableProductItem[];
  paginatedItems: TableProductItem[];
  parsedItemsCount: number;
  viewMode: 'table' | 'grid';
  searchQuery: string;
  selectedCategoryFilter: string;
  currentPage: number;
  pageSize: number;
  saving: boolean;
  currencySymbol: string;
  categorySelectOptions: SelectOption[];
  unitSelectOptions: SelectOption[];
  formatPrice: (val: any) => string;
  calculateMargin: (item: any) => number;
}>();

defineEmits<{
  (e: 'save-all'): void;
  (e: 'reset-all'): void;
  (e: 'open-image-modal', item: TableProductItem): void;
  (e: 'remove-row', item: TableProductItem): void;
  (e: 'increment-qty', item: TableProductItem): void;
  (e: 'decrement-qty', item: TableProductItem): void;
  (e: 'price-input', event: Event, item: TableProductItem, field: 'purchasePrice' | 'salePrice'): void;
  (e: 'update:viewMode', mode: 'table' | 'grid'): void;
  (e: 'update:searchQuery', query: string): void;
  (e: 'update:currentPage', page: number): void;
  (e: 'update:pageSize', size: number): void;
}>();
</script>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}
.hide-scrollbar {
  -ms-overflow-style: none !important;
  scrollbar-width: none !important;
}
</style>
