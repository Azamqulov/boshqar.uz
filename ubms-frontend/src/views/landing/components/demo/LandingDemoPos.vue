<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
    <!-- Left: Product Catalog & Category Filter (8 cols) -->
    <div class="lg:col-span-8 space-y-3">
      <!-- Search & Quick Action Header -->
      <div class="flex items-center gap-2">
        <div class="relative flex-1">
          <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Mahsulot nomi yoki shtrixkodi bo'yicha qidiring..."
            class="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>
        <button
          type="button"
          class="px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <Barcode class="w-4 h-4 text-emerald-500" />
          <span class="hidden sm:inline">Skaner</span>
        </button>
      </div>

      <!-- Category Chips Bar -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
        <button
          v-for="cat in categories"
          :key="cat.id"
          type="button"
          @click="activeCategory = cat.id"
          :class="[
            'px-3.5 py-1.5 rounded-xl font-medium whitespace-nowrap transition cursor-pointer',
            activeCategory === cat.id
              ? 'bg-emerald-600 text-white shadow-xs font-bold'
              : 'bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
          ]"
        >
          {{ cat.label }}
        </button>
      </div>

      <!-- Product Cards Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
        <div
          v-for="prod in filteredProducts"
          :key="prod.id"
          @click="addToCart(prod)"
          class="p-2.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 transition-all cursor-pointer group flex flex-col justify-between shadow-xs"
        >
          <div class="w-full h-24 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center relative mb-2 group-hover:scale-[1.02] transition-transform overflow-hidden">
            <img
              v-if="prod.image"
              :src="prod.image"
              :alt="prod.name"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            <Package v-else class="w-9 h-9 text-slate-400 dark:text-slate-600" />
            <span class="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-lg bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-mono font-bold shadow-xs">
              {{ prod.stock }}
            </span>
          </div>

          <div>
            <h4 class="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
              {{ prod.name }}
            </h4>
            <p class="text-[10px] text-slate-400 font-mono mt-0.5">{{ prod.code }}</p>
          </div>

          <div class="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 dark:border-slate-900">
            <span class="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {{ formatSum(prod.price) }} so'm
            </span>
            <button type="button" class="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs group-hover:bg-emerald-600 group-hover:text-white transition">
              +
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Right: Shopping Cart & Checkout (4 cols) -->
    <div class="lg:col-span-4 p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3 shadow-xs">
      <div>
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2.5">
          <div class="flex items-center gap-2">
            <ShoppingCart class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span class="font-bold text-xs text-slate-900 dark:text-white">Savat</span>
            <span class="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
              {{ cart.length }}
            </span>
          </div>
          <button type="button" v-if="cart.length > 0" @click="cart = []" class="text-[11px] text-rose-500 hover:underline cursor-pointer">
            Tozalash
          </button>
        </div>

        <!-- Action Quick Buttons -->
        <div class="grid grid-cols-2 gap-2 my-2.5">
          <button
            type="button"
            class="py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px] border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-1 transition cursor-pointer"
          >
            <Tag class="w-3 h-3 text-amber-500" />
            <span>Kutishga Qo'yish</span>
          </button>
          <button
            type="button"
            class="py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px] border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-1 transition cursor-pointer"
          >
            <Percent class="w-3 h-3 text-purple-500" />
            <span>Chegirma (0%)</span>
          </button>
        </div>

        <!-- Cart Item List -->
        <div class="space-y-2 max-h-56 overflow-y-auto pr-1">
          <div
            v-for="item in cart"
            :key="item.id"
            class="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/60"
          >
            <div class="min-w-0 pr-2">
              <h5 class="font-bold text-xs text-slate-900 dark:text-white truncate">{{ item.name }}</h5>
              <p class="text-[10px] text-slate-400 font-mono">{{ formatSum(item.price) }} so'm</p>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                @click="changeQty(item, -1)"
                class="w-6 h-6 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                -
              </button>
              <span class="font-mono text-xs font-bold w-5 text-center text-slate-900 dark:text-white">{{ item.qty }}</span>
              <button
                type="button"
                @click="changeQty(item, 1)"
                class="w-6 h-6 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          <div v-if="cart.length === 0" class="py-8 text-center text-slate-400 text-xs">
            Savat bo'sh. Mahsulot ustiga bosib qo'shing.
          </div>
        </div>
      </div>

      <!-- Total & Checkout Pay Button -->
      <div class="border-t border-slate-200 dark:border-slate-800/80 pt-3 space-y-2.5">
        <div class="flex justify-between items-center text-xs">
          <span class="text-slate-500">Jami hisob:</span>
          <span class="font-black text-sm text-emerald-600 dark:text-emerald-400 font-mono">
            {{ formatSum(cartTotal) }} so'm
          </span>
        </div>
        <button
          type="button"
          @click="$emit('checkout')"
          :disabled="cart.length === 0"
          class="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
        >
          <CreditCard class="w-4 h-4" />
          <span>To'lov Qilish (F12)</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Search, Barcode, Package, ShoppingCart, Tag, Percent, CreditCard } from 'lucide-vue-next';
import { INITIAL_DEMO_PRODUCTS, type DemoProduct } from './demoData';

const emit = defineEmits<{
  (e: 'checkout'): void;
}>();

const searchQuery = ref('');
const activeCategory = ref('all');
const products = ref<DemoProduct[]>(INITIAL_DEMO_PRODUCTS);

const categories = [
  { id: 'all', label: 'Barchasi' },
  { id: 'top', label: 'Top Tovar' },
  { id: 'drinks', label: 'Ichimliklar va Sharbatlar' },
  { id: 'dairy', label: 'Sut va Qatiq Mahsulotlari' },
  { id: 'bakery', label: 'Non va Shirinliklar' },
];

const filteredProducts = computed(() => {
  let list = products.value;
  if (activeCategory.value !== 'all') {
    list = list.filter((p) => p.category === activeCategory.value);
  }
  if (!searchQuery.value.trim()) return list;
  const q = searchQuery.value.toLowerCase().trim();
  return list.filter((p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q));
});

const cart = ref<any[]>([
  { id: '6', name: 'Coca-Cola 1.5L', price: 14000, qty: 2 },
  { id: '3', name: 'Banan Ekvador (Shirin)', price: 25000, qty: 1 },
]);

const cartTotal = computed(() => {
  return cart.value.reduce((sum, item) => sum + item.price * item.qty, 0);
});

const addToCart = (prod: DemoProduct) => {
  const existing = cart.value.find((i) => i.id === prod.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.value.push({ ...prod, qty: 1 });
  }
};

const changeQty = (item: any, delta: number) => {
  item.qty += delta;
  if (item.qty <= 0) {
    cart.value = cart.value.filter((i) => i.id !== item.id);
  }
};

const formatSum = (val: number) => {
  return new Intl.NumberFormat('uz-UZ').format(val || 0);
};
</script>
