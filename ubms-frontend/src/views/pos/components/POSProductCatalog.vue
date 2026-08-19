<template>
  <div
    class="flex-1 flex-col glass-card rounded-2xl p-3 sm:p-4 overflow-hidden"
    :class="mobileViewTab === 'catalog' ? 'flex' : 'hidden lg:flex'"
  >
    <!-- Search, Category Filters & Desktop PC Grid Density Toggle -->
    <div class="space-y-2.5 mb-3.5 shrink-0">
      <!-- Search Input + Grid Size Toggle -->
      <div class="flex items-center gap-2">
        <div class="relative flex-1">
          <Search class="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            id="pos-search-input"
            ref="searchInputRef"
            :value="searchQuery"
            @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
            @keydown.enter="$emit('barcodeScan')"
            type="text"
            :placeholder="posSettings?.enableHotkeys !== false ? 'Mahsulot nomi yoki Shtrix-kodni skanerlang (F2 / Enter)...' : 'Mahsulot nomi yoki Shtrix-kodni skanerlang (Enter)...'"
            class="w-full pl-10 pr-20 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-xs"
          />
          <div class="absolute right-3 top-2.5 flex items-center gap-1.5">
            <kbd
              v-if="posSettings?.enableHotkeys !== false"
              class="hidden sm:inline-block px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] text-slate-500 dark:text-slate-400 font-mono font-bold"
            >
              F2
            </kbd>
            <button
              v-if="searchQuery"
              @click="$emit('update:searchQuery', '')"
              class="text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- PC Terminal Grid Density Controls -->
        <div class="hidden sm:flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-xs shrink-0">
          <button
            type="button"
            @click="setGridDensity('compact')"
            class="px-2 py-1.5 rounded-lg font-bold transition flex items-center gap-1"
            :class="gridDensity === 'compact' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
            title="Kichik kartalar (ko'proq tovar ko'rsatish)"
          >
            <LayoutGrid class="w-3.5 h-3.5" />
            <span class="hidden xl:inline text-[11px]">Kichik</span>
          </button>
          <button
            type="button"
            @click="setGridDensity('standard')"
            class="px-2 py-1.5 rounded-lg font-bold transition flex items-center gap-1"
            :class="gridDensity === 'standard' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
            title="Standart kartalar"
          >
            <Grid class="w-3.5 h-3.5" />
            <span class="hidden xl:inline text-[11px]">O'rtacha</span>
          </button>
          <button
            type="button"
            @click="setGridDensity('large')"
            class="px-2 py-1.5 rounded-lg font-bold transition flex items-center gap-1"
            :class="gridDensity === 'large' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
            title="Sensorli (Touch) ekran uchun katta tugmalar"
          >
            <Maximize2 class="w-3.5 h-3.5" />
            <span class="hidden xl:inline text-[11px]">Katta (Touch)</span>
          </button>
        </div>
      </div>

      <!-- Category Filter Tabs with Horizontal Smooth Scroll & Navigation Arrows -->
      <div class="relative flex items-center group/cat">
        <!-- Left Arrow Button -->
        <button
          v-if="canScrollLeft"
          type="button"
          @click="scrollCategories('left')"
          class="absolute left-0 z-10 p-1.5 rounded-full bg-white/95 dark:bg-slate-900/95 shadow-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-emerald-500 hover:scale-110 transition -translate-x-1"
          title="Chapga surish"
        >
          <ChevronLeft class="w-3.5 h-3.5" />
        </button>

        <!-- Scrollable Category Track -->
        <div
          ref="categoryScrollContainer"
          @wheel="onCategoryWheel"
          @scroll="checkScroll"
          @mousedown="onMouseDown"
          @mouseleave="onMouseLeave"
          @mouseup="onMouseUp"
          @mousemove="onMouseMove"
          class="flex items-center space-x-2 overflow-x-auto pb-1.5 pt-0.5 w-full cursor-grab active:cursor-grabbing select-none scroll-smooth scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700"
        >
          <button
            @click="$emit('update:selectedCategory', '')"
            class="px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition shrink-0"
            :class="selectedCategory === '' ? 'bg-emerald-500 text-white shadow-sm font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'"
          >
            Barchasi
          </button>

          <!-- Bestseller Fast Filter -->
          <button
            @click="$emit('update:selectedCategory', '__bestsellers__')"
            class="px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 shrink-0"
            :class="selectedCategory === '__bestsellers__' ? 'bg-amber-500 text-slate-950 font-black shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300'"
          >
            <Flame class="w-3.5 h-3.5" />
            <span>Top Tovar</span>
          </button>

          <button
            v-for="cat in categories"
            :key="cat.id"
            @click="$emit('update:selectedCategory', cat.id)"
            class="px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition shrink-0 flex items-center gap-1.5"
            :class="selectedCategory === cat.id ? 'bg-emerald-500 text-white shadow-sm font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'"
          >
            <span v-if="cat.icon">{{ cat.icon }}</span>
            <span>{{ cat.name }}</span>
          </button>
        </div>

        <!-- Right Arrow Button -->
        <button
          v-if="canScrollRight"
          type="button"
          @click="scrollCategories('right')"
          class="absolute right-0 z-10 p-1.5 rounded-full bg-white/95 dark:bg-slate-900/95 shadow-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-emerald-500 hover:scale-110 transition translate-x-1"
          title="O'ngga surish"
        >
          <ChevronRight class="w-3.5 h-3.5" />
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

      <div
        v-else
        class="grid transition-all duration-200"
        :class="[
          gridDensity === 'compact'
            ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2'
            : gridDensity === 'large'
            ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3.5 sm:gap-4'
            : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2.5 sm:gap-3.5'
        ]"
      >
        <div
          v-for="prod in filteredProducts"
          :key="prod.id"
          @click="$emit('productClick', prod)"
          class="rounded-2xl border transition-all flex flex-col justify-between group relative select-none"
          :class="[
            gridDensity === 'compact' ? 'p-2' : gridDensity === 'large' ? 'p-3.5 sm:p-4' : 'p-2.5 sm:p-3',
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
          <div
            class="w-full rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden flex items-center justify-center relative"
            :class="[
              gridDensity === 'compact' ? 'h-18 sm:h-20 mb-1.5' : gridDensity === 'large' ? 'h-32 sm:h-36 md:h-40 mb-3' : 'h-24 sm:h-28 md:h-32 mb-2 sm:mb-2.5'
            ]"
          >
            <img
              v-if="prod.imageUrl"
              :src="prod.imageUrl"
              class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              @error="prod.imageUrl = null"
            />
            <Package v-else class="w-8 h-8 sm:w-10 sm:h-10 text-slate-400 dark:text-slate-600 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition" />
            
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
              <span v-else>{{ prod.stockQty <= 0 ? 'Qolmagan' : formatStock(prod.stockQty, prod.unit?.shortName || 'dona') }}</span>
            </span>

            <!-- Bestseller Flame Badge if in top selling -->
            <span
              v-if="(prod.soldCount || prod.soldCount30d) && (prod.soldCount || prod.soldCount30d) > 0"
              class="absolute top-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950 flex items-center gap-0.5 shadow-sm"
              title="Ko'p sotilgan mahsulot"
            >
              <Flame class="w-2.5 h-2.5 fill-slate-950" />
              <span>{{ prod.soldCount || prod.soldCount30d }}</span>
            </span>
          </div>

          <div>
            <h4
              class="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 line-clamp-1"
              :class="gridDensity === 'compact' ? 'text-[11px]' : gridDensity === 'large' ? 'text-sm' : 'text-xs'"
            >
              {{ prod.name }}
            </h4>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{{ prod.sku }}</p>
          </div>

          <div class="mt-2 flex items-center justify-between">
            <div>
              <span
                class="font-black text-emerald-600 dark:text-emerald-400 font-mono"
                :class="gridDensity === 'compact' ? 'text-[11px]' : gridDensity === 'large' ? 'text-sm' : 'text-xs'"
              >
                {{ formatCurrency(prod.salePrice) }}
              </span>
              <span v-if="prod.unit?.shortName && prod.unit.shortName !== 'dona'" class="text-[9px] text-slate-400 font-bold ml-1">/ {{ prod.unit.shortName }}</span>
            </div>
            <span
              class="text-[10px] font-bold px-2 py-0.5 rounded-lg"
              :class="!isItemAvailable(prod) ? 'bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition'"
            >+</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { Search, X, Flame, Package, ChevronLeft, ChevronRight, LayoutGrid, Grid, Maximize2 } from 'lucide-vue-next';
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

const { formatCurrency } = useFormat();

const formatStock = (qty: number | string | null | undefined, unit = 'dona') => {
  const val = Number(qty || 0);
  if (val <= 0) return '0 ' + unit;
  return `${val} ${unit}`;
};

const searchInputRef = ref<HTMLInputElement | null>(null);
const categoryScrollContainer = ref<HTMLElement | null>(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);

// PC Grid Density preference
const savedGrid = localStorage.getItem('pos_grid_density') as 'compact' | 'standard' | 'large' | null;
const gridDensity = ref<'compact' | 'standard' | 'large'>(savedGrid || 'standard');

const setGridDensity = (density: 'compact' | 'standard' | 'large') => {
  gridDensity.value = density;
  try {
    localStorage.setItem('pos_grid_density', density);
  } catch (e) {}
};

// Check if item is available for sale
const isItemAvailable = (prod: any) => {
  if (prod.status === 'inactive') return false;
  if (props.posSettings?.allowZeroStockSale !== false) return true;
  if (prod.brand === 'service' || isDishItem(prod)) return true;
  return prod.stockQty > 0;
};

const isDishItem = (prod: any) => {
  const brand = (prod.brand || '').toLowerCase();
  const catName = (prod.category?.name || '').toLowerCase();
  return (
    brand.includes('kitchen') ||
    brand.includes('bar') ||
    brand.includes('dish') ||
    catName.includes('ovqat') ||
    catName.includes('ichimlik') ||
    catName.includes('fast food') ||
    catName.includes('taom')
  );
};

// Category Horizontal Scrolling Helpers
const checkScroll = () => {
  const el = categoryScrollContainer.value;
  if (!el) return;
  canScrollLeft.value = el.scrollLeft > 10;
  canScrollRight.value = el.scrollLeft < el.scrollWidth - el.clientWidth - 10;
};

const scrollCategories = (direction: 'left' | 'right') => {
  const el = categoryScrollContainer.value;
  if (!el) return;
  const scrollAmount = 250;
  el.scrollBy({
    left: direction === 'left' ? -scrollAmount : scrollAmount,
    behavior: 'smooth',
  });
  setTimeout(checkScroll, 300);
};

const onCategoryWheel = (e: WheelEvent) => {
  const el = categoryScrollContainer.value;
  if (!el) return;
  if (e.deltaY !== 0) {
    el.scrollLeft += e.deltaY;
    e.preventDefault();
    checkScroll();
  }
};

// Drag-to-scroll for category track
let isDragging = false;
let startX = 0;
let scrollLeftInit = 0;

const onMouseDown = (e: MouseEvent) => {
  const el = categoryScrollContainer.value;
  if (!el) return;
  isDragging = true;
  startX = e.pageX - el.offsetLeft;
  scrollLeftInit = el.scrollLeft;
};

const onMouseLeave = () => {
  isDragging = false;
};

const onMouseUp = () => {
  isDragging = false;
};

const onMouseMove = (e: MouseEvent) => {
  if (!isDragging) return;
  e.preventDefault();
  const el = categoryScrollContainer.value;
  if (!el) return;
  const x = e.pageX - el.offsetLeft;
  const walk = (x - startX) * 1.5;
  el.scrollLeft = scrollLeftInit - walk;
  checkScroll();
};

onMounted(() => {
  nextTick(() => {
    checkScroll();
  });
  window.addEventListener('resize', checkScroll);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkScroll);
});

watch(
  () => props.categories,
  () => {
    nextTick(checkScroll);
  },
  { deep: true }
);

defineExpose({
  focusSearch: () => {
    searchInputRef.value?.focus();
    searchInputRef.value?.select();
  },
});
</script>
