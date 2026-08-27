<template>
  <div class="flex-1 flex flex-col gap-3 overflow-hidden">
    <!-- Mobile Tab Switcher (< lg) -->
    <div class="flex lg:hidden items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0 gap-1">
      <button
        @click="mobileWaiterTab = 'menu'"
        class="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
        :class="mobileWaiterTab === 'menu' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'"
      >
        <UtensilsCrossed class="w-3.5 h-3.5" />
        <span>Taomnoma ({{ filteredMenu.length }})</span>
      </button>
      <button
        @click="mobileWaiterTab = 'cart'"
        class="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
        :class="mobileWaiterTab === 'cart' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'"
      >
        <ShoppingCart class="w-3.5 h-3.5" />
        <span>Stol Savati ({{ existingItems.length + newItems.length }})</span>
        <span v-if="orderTotalSum > 0" class="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
          {{ formatCurrency(orderTotalSum) }}
        </span>
      </button>
    </div>

    <!-- Main Workspace -->
    <div class="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
      <!-- Left Menu & Dishes (60%) -->
      <div
        class="flex-1 flex-col glass-card rounded-2xl p-3 sm:p-4 overflow-hidden"
        :class="mobileWaiterTab === 'menu' ? 'flex' : 'hidden lg:flex'"
      >
      <!-- Search & Card Size Toggle -->
      <div class="flex items-center gap-2.5 mb-3 shrink-0">
        <div class="flex-1">
          <AppInput
            :model-value="menuSearch"
            @update:model-value="$emit('update:menuSearch', $event)"
            placeholder="Taom yoki ichimlik qidirish..."
            :icon="Search"
          />
        </div>

        <!-- Size Toggle (Kichik / O'rta / Keng) -->
        <div class="p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center shrink-0">
          <button
            type="button"
            @click="setCardSize('small')"
            class="px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
            :class="cardSize === 'small' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-black' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
            title="Kichik kartochkalar (Kompakt)"
          >
            <LayoutGrid class="w-3.5 h-3.5" />
            <span class="hidden sm:inline text-[11px]">Kichik</span>
          </button>

          <button
            type="button"
            @click="setCardSize('medium')"
            class="px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
            :class="cardSize === 'medium' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-black' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
            title="O'rtacha kartochkalar"
          >
            <Grid class="w-3.5 h-3.5" />
            <span class="hidden sm:inline text-[11px]">O'rta</span>
          </button>

          <button
            type="button"
            @click="setCardSize('large')"
            class="px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
            :class="cardSize === 'large' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-black' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
            title="Keng / Katta kartochkalar"
          >
            <Maximize2 class="w-3.5 h-3.5" />
            <span class="hidden sm:inline text-[11px]">Keng</span>
          </button>
        </div>
      </div>

      <!-- Categories Selector (Horizontally Scrollable Below Search Bar, Sorted by 7-Day Top Sales) -->
      <div class="flex items-center space-x-2 overflow-x-auto scrollbar-none pb-2 mb-3 shrink-0">
        <button
          type="button"
          @click="$emit('update:selectedCategory', '')"
          class="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 shadow-xs"
          :class="selectedCategory === '' ? 'bg-emerald-500 text-white font-black shadow-md shadow-emerald-500/25' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
        >
          Barchasi
        </button>
        <button
          v-for="(cat, idx) in sortedCategories"
          :key="cat.id"
          type="button"
          @click="$emit('update:selectedCategory', cat.id)"
          class="px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow-xs"
          :class="selectedCategory === cat.id ? 'bg-emerald-500 text-white font-black shadow-md shadow-emerald-500/25' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
        >
          <span>{{ cat.name }}</span>
          <span
            v-if="idx === 0 && sortedCategories.length > 1"
            class="inline-flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded-lg transition"
            :class="selectedCategory === cat.id ? 'bg-white/20 text-white' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25'"
            title="So'nggi 7 kunda eng ko'p sotilgan kategoriya"
          >
            <Flame class="w-3 h-3 fill-current" />
            <span>TOP</span>
          </span>
        </button>
      </div>

      <!-- Dishes Grid -->
      <div class="flex-1 overflow-y-auto pr-1">
        <div
          class="grid gap-3"
          :class="{
            'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2': cardSize === 'small',
            'grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3': cardSize === 'medium',
            'grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3.5': cardSize === 'large'
          }"
        >
          <div
            v-for="prod in filteredMenu"
            :key="prod.id"
            @click="handleAddDish(prod)"
            class="relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-500/60 hover:shadow-md hover:shadow-emerald-500/5 transition-all cursor-pointer flex flex-col justify-between group shadow-xs btn-interactive select-none"
            :class="{
              'p-2 rounded-xl': cardSize === 'small',
              'p-3 rounded-2xl': cardSize === 'medium',
              'p-3.5 rounded-2xl': cardSize === 'large',
              'ring-2 ring-emerald-500/40 border-emerald-500/60': getItemCartCount(prod.id) > 0
            }"
          >
            <!-- In-Cart Active Badge -->
            <span
              v-if="getItemCartCount(prod.id) > 0"
              class="absolute -top-1.5 -right-1.5 z-10 px-2 py-0.5 rounded-full bg-emerald-500 text-white font-black shadow-md shadow-emerald-500/30 flex items-center gap-0.5 animate-in fade-in zoom-in-75 duration-150"
              :class="cardSize === 'small' ? 'text-[9px] px-1.5 py-0.2' : 'text-[10px]'"
            >
              ✓ {{ getItemCartCount(prod.id) }} ta
            </span>

            <!-- Card Top: Image / Smart Placeholder -->
            <div
              class="w-full rounded-xl overflow-hidden relative transition group-hover:scale-[1.01] duration-300 border border-slate-100 dark:border-slate-800"
              :class="{
                'h-14 rounded-lg mb-1.5': cardSize === 'small',
                'h-24 rounded-xl mb-2': cardSize === 'medium',
                'h-32 rounded-2xl mb-2.5': cardSize === 'large'
              }"
            >
              <img
                v-if="prod.imageUrl && !failedImages[prod.id]"
                :src="prod.imageUrl"
                @error="onImageError(prod.id)"
                class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <!-- Smart Category-Themed Dynamic Placeholder -->
              <div
                v-else
                class="w-full h-full bg-gradient-to-br flex flex-col items-center justify-center relative p-2 select-none border"
                :class="[getCategoryTheme(prod).gradient, getCategoryTheme(prod).borderColor]"
              >
                <!-- Category Mini Pill in corner -->
                <span
                  class="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider backdrop-blur-xs shadow-2xs max-w-[85%] truncate"
                  :class="getCategoryTheme(prod).badgeBg"
                >
                  {{ getCategoryTheme(prod).categoryLabel }}
                </span>

                <!-- Center Initials & Icon Badge -->
                <div class="flex items-center gap-1 mt-1.5">
                  <div
                    class="rounded-lg flex items-center justify-center font-black shadow-xs bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs border border-white/50 dark:border-white/10"
                    :class="[
                      getCategoryTheme(prod).iconColor,
                      cardSize === 'small' ? 'w-5 h-5 text-[9px]' : cardSize === 'large' ? 'w-9 h-9 text-sm' : 'w-7 h-7 text-xs'
                    ]"
                  >
                    {{ getInitials(prod.name) }}
                  </div>
                  <UtensilsCrossed
                    v-if="cardSize !== 'small'"
                    class="opacity-60"
                    :class="[getCategoryTheme(prod).iconColor, cardSize === 'large' ? 'w-4 h-4' : 'w-3.5 h-3.5']"
                  />
                </div>
              </div>
            </div>

            <!-- Card Middle: Title & Metadata -->
            <div>
              <div class="flex items-center gap-1 mb-0.5">
                <span
                  v-if="getCategoryName(prod.categoryId) && cardSize !== 'small'"
                  class="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded"
                >
                  {{ getCategoryName(prod.categoryId) }}
                </span>
                <span v-if="prod.sku && cardSize === 'large'" class="text-[9px] text-slate-400 font-mono">
                  #{{ prod.sku }}
                </span>
              </div>

              <h4
                class="font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition"
                :class="cardSize === 'small' ? 'text-[11px]' : cardSize === 'large' ? 'text-sm' : 'text-xs'"
              >{{ prod.name }}</h4>

              <p
                v-if="prod.description && cardSize !== 'small'"
                class="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1 mt-0.5"
              >
                {{ prod.description }}
              </p>
            </div>

            <!-- Card Bottom: Price & Add Button -->
            <div
              class="flex items-center justify-between"
              :class="cardSize === 'small' ? 'mt-1' : 'mt-2 pt-1 border-t border-slate-100 dark:border-slate-800/80'"
            >
              <div>
                <span
                  class="font-black text-emerald-600 dark:text-emerald-400 font-mono block"
                  :class="cardSize === 'small' ? 'text-[11px]' : cardSize === 'large' ? 'text-sm' : 'text-xs'"
                >{{ formatCurrency(prod.salePrice) }}</span>
                <span v-if="prod.unit?.name && cardSize !== 'small'" class="text-[9px] text-slate-400 font-normal">
                  {{ prod.unit.name }} uchun
                </span>
              </div>

              <span
                class="bg-emerald-500 hover:bg-emerald-600 text-white font-black flex items-center justify-center transition shadow-xs shadow-emerald-500/25 active:scale-90"
                :class="{
                  'w-5 h-5 text-xs rounded-md': cardSize === 'small',
                  'w-6 h-6 text-xs rounded-lg': cardSize === 'medium',
                  'w-7 h-7 text-sm rounded-xl': cardSize === 'large'
                }"
              >
                +
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Table Order Cart & Controls (40%) -->
    <div
      class="w-full lg:w-96 flex-col glass-card rounded-2xl p-4 overflow-hidden shrink-0"
      :class="mobileWaiterTab === 'cart' ? 'flex' : 'hidden lg:flex'"
    >
      <!-- Table Cart Header -->
      <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span class="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Tanlangan Stol:</span>
          <h2 class="text-lg font-black text-slate-900 dark:text-white">{{ selectedTable.name }}</h2>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="$emit('clearTableOrder')"
            class="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            title="Stolni bo'shatish yoki savatni tozalash"
          >
            <Trash2 class="w-3.5 h-3.5" />
            <span>Tozalash</span>
          </button>
          <span
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
            :class="selectedTable.status === 'occupied' ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25' : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25'"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="selectedTable.status === 'occupied' ? 'bg-rose-500' : 'bg-emerald-500'"></span>
            <span>{{ selectedTable.status === 'occupied' ? 'Band' : 'Bo\'sh' }}</span>
          </span>
        </div>
      </div>


      <!-- Ordered Items list -->
      <div class="flex-1 overflow-y-auto py-3 space-y-3">
        <!-- Existing Order on Table -->
        <div v-if="existingItems.length > 0" class="space-y-1.5">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avval kiritilgan buyurtmalar:</span>
          <div
            v-for="item in existingItems"
            :key="item.id"
            class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
          >
            <div>
              <p class="font-bold text-slate-900 dark:text-white">{{ item.product?.name || item.name }}</p>
              <span class="text-[11px] text-slate-500 font-mono">{{ item.quantity }} x {{ formatCurrency(item.unitPrice || item.price) }}</span>
            </div>
            <div class="text-right">
              <span class="font-bold text-slate-900 dark:text-white font-mono">{{ formatCurrency(item.total || (item.quantity * item.unitPrice)) }}</span>
              <span class="block text-[9px] font-bold text-emerald-500">Oshxonada</span>
            </div>
          </div>
        </div>

        <!-- New Selected Dishes -->
        <div v-if="newItems.length > 0" class="space-y-1.5">
          <span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Yangi qo'shilganlar:</span>
          <div
            v-for="(item, idx) in newItems"
            :key="(item.product?.id || item.productId || idx) + '-' + item.quantity"
            class="p-2.5 rounded-xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/25 flex items-center justify-between text-xs"
          >
            <div class="flex-1 min-w-0 pr-2">
              <p class="font-bold text-slate-900 dark:text-white truncate">{{ item.product?.name || item.name }}</p>
              <span class="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">{{ formatCurrency(Number(item.product?.salePrice || item.product?.price || 0)) }}</span>
            </div>

            <!-- Quantity Controls -->
            <div class="flex items-center space-x-2">
              <div class="flex items-center space-x-1">
                <button
                  type="button"
                  @click.stop="handleDecrease(item)"
                  class="w-7 h-7 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-700 dark:text-emerald-400 hover:text-white dark:hover:text-white flex items-center justify-center text-xs font-bold transition active:scale-95 cursor-pointer select-none"
                >-</button>
                <span class="w-7 text-center font-bold font-mono text-xs select-none">{{ item.quantity }}</span>
                <button
                  type="button"
                  @click.stop="handleIncrease(item)"
                  class="w-7 h-7 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-700 dark:text-emerald-400 hover:text-white dark:hover:text-white flex items-center justify-center text-xs font-bold transition active:scale-95 cursor-pointer select-none"
                >+</button>
              </div>
              <span class="font-black text-slate-900 dark:text-white font-mono min-w-[70px] text-right text-xs">
                {{ formatCurrency(Number(item.product?.salePrice || item.product?.price || 0) * Number(item.quantity || 1)) }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="existingItems.length === 0 && newItems.length === 0" class="text-center py-12 text-slate-400 text-xs">
          Stolga qo'shish uchun chap tomondan taomlarni tanlang
        </div>
      </div>

      <!-- Total Sum & Action Buttons -->
      <div class="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3 shrink-0">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-500">Jami Stol Summasi:</span>
          <span class="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">{{ formatCurrency(orderTotalSum) }}</span>
        </div>

        <div class="grid grid-cols-3 gap-1.5">
          <!-- 1. Clear / Reset Table -->
          <button
            type="button"
            @click="$emit('clearTableOrder')"
            class="py-2.5 px-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-500/20 shadow-xs flex items-center justify-center gap-1 transition btn-interactive cursor-pointer"
            title="Stolni bo'shatish yoki savatni tozalash"
          >
            <Trash2 class="w-3.5 h-3.5" />
            <span>Tozalash</span>
          </button>

          <!-- 2. Send to Kitchen (KDS) -->
          <button
            @click="$emit('sendToKitchen')"
            :disabled="newItems.length === 0 || sending"
            class="py-2.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1 transition btn-interactive"
          >
            <Flame class="w-3.5 h-3.5 fill-white" />
            <span>{{ sending ? 'Yuborilmoqda...' : 'Oshxonaga' }}</span>
          </button>

          <!-- 3. Pre-Bill / Print Check -->
          <button
            @click="$emit('openPreBill')"
            :disabled="existingItems.length === 0 && newItems.length === 0"
            class="py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1 transition btn-interactive"
          >
            <Receipt class="w-3.5 h-3.5" />
            <span>Pre-Chek</span>
          </button>
        </div>


        <!-- Direct Table Payment & Close Bill Button -->
        <button
          @click="$emit('openPayModal')"
          :disabled="orderTotalSum <= 0 || payingTable"
          class="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-98 disabled:opacity-50 text-white font-black text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition btn-interactive"
        >
          <CheckCircle2 class="w-5 h-5" />
          <span>{{ payingTable ? 'Hisob yopilmoqda...' : 'To\'lovni Qabul Qilish (Hisobni Yopish)' }}</span>
        </button>
      </div>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

import { Search, Flame, Receipt, CheckCircle2, UtensilsCrossed, Trash2, LayoutGrid, Grid, Maximize2 } from 'lucide-vue-next';
import AppInput from '../../../components/AppInput.vue';
import { useFormat } from '../../../composables/useFormat';

const mobileWaiterTab = ref<'menu' | 'cart'>('menu');

// Card size preference: 'small' (compact) | 'medium' (standard) | 'large' (wide)
const cardSize = ref<'small' | 'medium' | 'large'>((localStorage.getItem('waiter_card_size') as any) || 'medium');

const setCardSize = (size: 'small' | 'medium' | 'large') => {
  cardSize.value = size;
  try {
    localStorage.setItem('waiter_card_size', size);
  } catch (e) {}
};

const props = defineProps<{
  menuSearch: string;
  selectedCategory: string;
  categories: any[];
  filteredMenu: any[];
  selectedTable: any;
  existingItems: any[];
  newItems: any[];
  orderTotalSum: number;
  sending: boolean;
  payingTable: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:menuSearch', val: string): void;
  (e: 'update:selectedCategory', val: string): void;
  (e: 'addDish', prod: any): void;
  (e: 'increaseNewItem', item: any): void;
  (e: 'decreaseNewItem', item: any): void;
  (e: 'sendToKitchen'): void;
  (e: 'openPreBill'): void;
  (e: 'openPayModal'): void;
  (e: 'clearTableOrder'): void;
}>();

// Sort categories dynamically based on sales / popularity (7-day top sales rank)
const sortedCategories = computed(() => {
  if (!props.categories || props.categories.length === 0) return [];
  
  const catSalesMap = new Map<string, number>();
  
  (props.filteredMenu || []).forEach((prod: any) => {
    const catId = prod.categoryId;
    if (!catId) return;
    const sold = Number(prod.soldCount || prod.salesCount || prod.ordersCount || prod.totalSold || 0);
    catSalesMap.set(catId, (catSalesMap.get(catId) || 0) + sold);
  });

  return [...props.categories].sort((a, b) => {
    const salesA = catSalesMap.get(a.id) || a.salesCount || a.popularity || 0;
    const salesB = catSalesMap.get(b.id) || b.salesCount || b.popularity || 0;
    if (salesB !== salesA) return salesB - salesA;
    return (a.sortOrder || 0) - (b.sortOrder || 0);
  });
});

const handleAddDish = (prod: any) => {
  emit('addDish', prod);
};

const handleIncrease = (item: any) => {
  emit('increaseNewItem', item);
};

const handleDecrease = (item: any) => {
  emit('decreaseNewItem', item);
};

const failedImages = ref<Record<string, boolean>>({});

const onImageError = (prodId: string) => {
  failedImages.value[prodId] = true;
};

const getCategoryTheme = (prod: any) => {
  const cat = props.categories?.find((c: any) => c.id === prod.categoryId);
  const catName = (cat?.name || '').toLowerCase();
  const prodName = (prod.name || '').toLowerCase();
  const text = catName + ' ' + prodName;

  if (text.includes('ichimlik') || text.includes('cola') || text.includes('fanta') || text.includes('sprite') || text.includes('choy') || text.includes('suv') || text.includes('sharbat') || text.includes('qahva') || text.includes('coffee') || text.includes('sok')) {
    return {
      gradient: 'from-cyan-500/20 via-sky-500/15 to-blue-500/20',
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      borderColor: 'border-cyan-500/30',
      badgeBg: 'bg-cyan-500/20 text-cyan-800 dark:text-cyan-200',
      categoryLabel: cat?.name || 'Ichimlik',
    };
  }
  if (text.includes('burger') || text.includes('lavash') || text.includes('donar') || text.includes('shaurma') || text.includes('sendvich') || text.includes('hot-dog')) {
    return {
      gradient: 'from-amber-500/20 via-orange-500/15 to-yellow-500/20',
      iconColor: 'text-amber-600 dark:text-amber-400',
      borderColor: 'border-amber-500/30',
      badgeBg: 'bg-amber-500/20 text-amber-800 dark:text-amber-200',
      categoryLabel: cat?.name || 'Fast Food',
    };
  }
  if (text.includes('fri') || text.includes('kartoshka') || text.includes('nagets') || text.includes('snek') || text.includes('halqa') || text.includes('pishloq')) {
    return {
      gradient: 'from-amber-500/20 via-yellow-500/15 to-orange-500/20',
      iconColor: 'text-amber-500 dark:text-amber-400',
      borderColor: 'border-amber-500/30',
      badgeBg: 'bg-amber-500/20 text-amber-800 dark:text-amber-200',
      categoryLabel: cat?.name || 'Snek & Fri',
    };
  }
  if (text.includes('sous') || text.includes('mayonez') || text.includes('ketchup') || text.includes('salat') || text.includes('desert') || text.includes('shirinlik')) {
    return {
      gradient: 'from-rose-500/20 via-pink-500/15 to-rose-500/20',
      iconColor: 'text-rose-600 dark:text-rose-400',
      borderColor: 'border-rose-500/30',
      badgeBg: 'bg-rose-500/20 text-rose-800 dark:text-rose-200',
      categoryLabel: cat?.name || 'Sous & Salat',
    };
  }
  return {
    gradient: 'from-emerald-500/20 via-teal-500/15 to-emerald-500/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-500/30',
    badgeBg: 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-200',
    categoryLabel: cat?.name || 'Taom',
  };
};

const getCategoryName = (catId?: string) => {
  if (!catId) return '';
  const cat = props.categories?.find((c: any) => c.id === catId);
  return cat?.name || '';
};

const getItemCartCount = (prodId: string) => {
  const item = props.newItems?.find((i: any) => (i.product?.id || i.productId) === prodId);
  return item ? Number(item.quantity || 0) : 0;
};

const getInitials = (name: string) => {
  if (!name) return '🍽️';
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const { formatCurrency } = useFormat();
</script>
