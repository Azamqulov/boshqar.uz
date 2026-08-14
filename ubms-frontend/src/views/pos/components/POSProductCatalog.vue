<template>
  <div
    class="flex-1 flex-col glass-card rounded-2xl p-3 sm:p-4 overflow-hidden"
    :class="mobileViewTab === 'catalog' ? 'flex' : 'hidden lg:flex'"
  >
    <!-- Search & Category Filters -->
    <div class="space-y-2.5 mb-3.5 shrink-0">
      <!-- Full-Width Search Input with Barcode auto-focus and clear button -->
      <div class="relative w-full">
        <Search class="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        <input
          ref="searchInputRef"
          :value="searchQuery"
          @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
          @keydown.enter="$emit('barcodeScan')"
          type="text"
          placeholder="Mahsulot nomi yoki Shtrix-kodni skanerlang (Enter)..."
          class="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-xs"
        />
        <button
          v-if="searchQuery"
          @click="$emit('update:searchQuery', '')"
          class="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-white"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Category Filter Tabs -->
      <div class="flex items-center space-x-2 overflow-x-auto scrollbar-none pb-0.5">
        <button
          @click="$emit('update:selectedCategory', '')"
          class="px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition"
          :class="selectedCategory === '' ? 'bg-emerald-500 text-white shadow-sm font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'"
        >
          Barchasi
        </button>

        <!-- Bestseller Fast Filter -->
        <button
          @click="$emit('update:selectedCategory', '__bestsellers__')"
          class="px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1"
          :class="selectedCategory === '__bestsellers__' ? 'bg-amber-500 text-slate-950 font-black shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300'"
        >
          <Flame class="w-3.5 h-3.5" />
          <span>Top Tovar</span>
        </button>

        <button
          v-for="cat in categories"
          :key="cat.id"
          @click="$emit('update:selectedCategory', cat.id)"
          class="px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition"
          :class="selectedCategory === cat.id ? 'bg-emerald-500 text-white shadow-sm font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'"
        >
          {{ cat.name }}
        </button>
      </div>
    </div>

    <!-- Products Grid -->
    <div class="flex-1 overflow-y-auto pr-1">
      <SkeletonLoader v-if="loading" variant="grid" :count="10" />

      <div v-else-if="filteredProducts.length === 0" class="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-xs">
        <Package class="w-10 h-10 stroke-1 mb-2" />
        <span>Mahsulot topilmadi</span>
      </div>

      <div v-else class="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3 sm:gap-3.5">
        <div
          v-for="prod in filteredProducts"
          :key="prod.id"
          @click="$emit('productClick', prod)"
          class="p-3 rounded-2xl border transition-all flex flex-col justify-between group relative select-none"
          :class="[
            !isItemAvailable(prod)
              ? 'bg-slate-100/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800/80 opacity-60 cursor-not-allowed'
              : 'bg-slate-50 hover:bg-slate-100/90 dark:bg-slate-800/60 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700/60 hover:border-emerald-500/50 cursor-pointer shadow-xs hover:shadow-md hover:shadow-emerald-500/10 btn-interactive'
          ]"
        >
          <!-- Out of stock / Stop-list overlay badge -->
          <div
            v-if="!isItemAvailable(prod)"
            class="absolute inset-0 z-10 rounded-2xl bg-slate-950/20 dark:bg-slate-950/40 backdrop-blur-[1px] flex items-center justify-center pointer-events-none"
          >
            <span class="px-2.5 py-1 rounded-lg bg-rose-500/90 text-white font-bold text-[10px] tracking-wider uppercase shadow-md">
              {{ prod.status === 'inactive' ? 'Stop-List' : 'Tugagan' }}
            </span>
          </div>

          <!-- Product Image -->
          <div class="w-full h-28 sm:h-32 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden mb-2.5 flex items-center justify-center relative">
            <img
              v-if="prod.imageUrl"
              :src="prod.imageUrl"
              class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              @error="prod.imageUrl = null"
            />
            <Package v-else class="w-10 h-10 text-slate-400 dark:text-slate-600 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition" />
            
            <!-- Stock Indicator / Made-to-order badge -->
            <span
              class="absolute bottom-1 right-1 text-[9px] font-bold px-1.5 py-0.5 rounded backdrop-blur-md"
              :class="[
                !isItemAvailable(prod)
                  ? 'bg-rose-500 text-white'
                  : isDishItem(prod)
                  ? 'bg-amber-500/90 text-slate-950 font-bold'
                  : prod.brand === 'service'
                  ? 'bg-sky-500/90 text-white'
                  : 'bg-slate-900/80 text-white'
              ]"
            >
              <span v-if="prod.status === 'inactive'">Stop-list</span>
              <span v-else-if="isDishItem(prod)">🍕 Taom</span>
              <span v-else-if="prod.brand === 'service'">🛠 Xizmat</span>
              <span v-else>{{ prod.stockQty <= 0 ? 'Qolmagan' : `${prod.stockQty} ${prod.unit?.shortName || 'dona'}` }}</span>
            </span>

            <!-- Bestseller Flame Badge if in top selling -->
            <span
              v-if="prod.soldCount30d && prod.soldCount30d > 0"
              class="absolute top-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950 flex items-center gap-0.5 shadow-sm"
              title="Oxirgi 30 kunda ko'p sotilgan"
            >
              <Flame class="w-2.5 h-2.5 fill-slate-950" />
              <span>{{ prod.soldCount30d }}</span>
            </span>
          </div>

          <div>
            <h4 class="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 line-clamp-1">{{ prod.name }}</h4>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{{ prod.sku }}</p>
          </div>

          <div class="mt-2 flex items-center justify-between">
            <span class="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">{{ formatCurrency(prod.salePrice) }}</span>
            <span
              class="text-[10px] font-bold px-1.5 py-0.5 rounded"
              :class="!isItemAvailable(prod) ? 'bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition'"
            >+</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Search, X, Flame, Package } from 'lucide-vue-next';
import SkeletonLoader from '../../../components/SkeletonLoader.vue';
import { useFormat } from '../../../composables/useFormat';

const props = defineProps<{
  mobileViewTab: 'catalog' | 'cart';
  searchQuery: string;
  selectedCategory: string;
  categories: any[];
  filteredProducts: any[];
  loading: boolean;
  posSettings?: {
    allowZeroStockSale?: boolean;
    [key: string]: any;
  };
}>();

defineEmits<{
  (e: 'update:searchQuery', val: string): void;
  (e: 'update:selectedCategory', val: string): void;
  (e: 'barcodeScan'): void;
  (e: 'productClick', prod: any): void;
}>();

const searchInputRef = ref<HTMLInputElement | null>(null);
const { formatCurrency } = useFormat();

const isDishItem = (prod: any) => {
  return prod.brand === 'dish' || prod.brand === 'kitchen' || prod.isMadeToOrder;
};

const isItemAvailable = (prod: any) => {
  if (prod.status === 'inactive') return false;
  if (isDishItem(prod) || prod.brand === 'service') return true;
  if (props.posSettings?.allowZeroStockSale) return true;
  return prod.stockQty > 0;
};

defineExpose({
  focusSearch: () => searchInputRef.value?.focus(),
});
</script>
