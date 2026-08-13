<template>
  <div class="h-[calc(100vh-5.5rem)] flex flex-col lg:flex-row gap-4 overflow-hidden">
    <!-- Left Catalog Area (65%) -->
    <div class="flex-1 flex flex-col glass-card rounded-2xl p-4 overflow-hidden">
      <!-- Search & Category Filters -->
      <div class="flex flex-col sm:flex-row gap-3 mb-4">
        <!-- Barcode / Search Input with auto-focus -->
        <div class="relative flex-1">
          <Search class="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            @keydown.enter="handleBarcodeScan"
            type="text"
            placeholder="Mahsulot nomi yoki Shtrix-kodni skanerlang (Enter)..."
            class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <!-- Category Filter Tabs -->
        <div class="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            @click="selectedCategory = ''"
            class="px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition"
            :class="selectedCategory === '' ? 'bg-emerald-500 text-white shadow-sm font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'"
          >
            Barchasi
          </button>

          <!-- Bestseller Fast Filter -->
          <button
            @click="selectedCategory = '__bestsellers__'"
            class="px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1"
            :class="selectedCategory === '__bestsellers__' ? 'bg-amber-500 text-slate-950 font-black shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300'"
          >
            <Flame class="w-3.5 h-3.5" />
            <span>Top Tovar</span>
          </button>

          <button
            v-for="cat in categories"
            :key="cat.id"
            @click="selectedCategory = cat.id"
            class="px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition"
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

        <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
          <div
            v-for="prod in filteredProducts"
            :key="prod.id"
            @click="handleProductClick(prod)"
            class="p-2.5 rounded-xl border transition-all flex flex-col justify-between group relative"
            :class="[
              prod.stockQty <= 0
                ? 'bg-slate-100/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800/80 opacity-60 cursor-not-allowed'
                : 'bg-slate-50 hover:bg-slate-100/90 dark:bg-slate-800/60 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700/60 hover:border-emerald-500/50 cursor-pointer shadow-sm hover:shadow-emerald-500/10 btn-interactive'
            ]"
          >
            <!-- Out of stock overlay badge -->
            <div
              v-if="prod.stockQty <= 0"
              class="absolute inset-0 z-10 rounded-xl bg-slate-950/20 dark:bg-slate-950/40 backdrop-blur-[1px] flex items-center justify-center pointer-events-none"
            >
              <span class="px-2.5 py-1 rounded-lg bg-rose-500/90 text-white font-bold text-[10px] tracking-wider uppercase shadow-md">
                Tugagan
              </span>
            </div>

            <!-- Product Image -->
            <div class="w-full h-24 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden mb-2 flex items-center justify-center relative">
              <img
                v-if="prod.imageUrl"
                :src="prod.imageUrl"
                class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                @error="prod.imageUrl = null"
              />
              <Package v-else class="w-8 h-8 text-slate-400 dark:text-slate-600 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition" />
              
              <!-- Stock Indicator -->
              <span
                class="absolute bottom-1 right-1 text-[9px] font-bold px-1.5 py-0.5 rounded backdrop-blur-md"
                :class="prod.stockQty <= 0 ? 'bg-rose-500 text-white' : 'bg-slate-900/80 text-white'"
              >
                {{ prod.stockQty <= 0 ? 'Qolmagan' : `${prod.stockQty} ${prod.unit?.shortName || 'dona'}` }}
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
                :class="prod.stockQty <= 0 ? 'bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition'"
              >+</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Cart & Payment Area (35%) -->
    <div class="w-full lg:w-96 flex flex-col glass-card rounded-2xl p-4 overflow-hidden">
      <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div class="flex items-center space-x-2">
          <ShoppingCart class="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
          <h3 class="font-bold text-sm text-slate-900 dark:text-white">Savat</h3>
          <span class="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
            {{ cartStore.itemCount }}
          </span>
        </div>
        <button
          v-if="cartStore.items.length > 0"
          @click="cartStore.clearCart"
          class="text-xs text-rose-500 hover:text-rose-600 dark:text-rose-400 font-medium"
        >
          Tozalash
        </button>
      </div>

      <!-- Cart Items List -->
      <div class="flex-1 overflow-y-auto py-2 space-y-2">
        <div v-if="cartStore.items.length === 0" class="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-xs">
          <span>Savat bo'sh. Mahsulotni bosing yoki skanerlang</span>
        </div>

        <div
          v-for="item in cartStore.items"
          :key="item.id"
          class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 flex flex-col space-y-2"
        >
          <div class="flex items-start justify-between gap-2">
            <div>
              <h5 class="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{{ item.name }}</h5>
              <p class="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">{{ formatCurrency(item.price) }}</p>
            </div>
            <button @click="cartStore.removeItem(item.id)" class="text-slate-400 hover:text-rose-500">
              <X class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- Quantity Stepper -->
          <div class="flex items-center justify-between pt-1">
            <div class="flex items-center space-x-1.5">
              <button
                @click="cartStore.updateQuantity(item.id, item.quantity - 1)"
                class="w-6 h-6 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 flex items-center justify-center text-xs text-slate-800 dark:text-white"
              >
                -
              </button>
              <input
                type="number"
                v-model.number="item.quantity"
                class="w-12 text-center py-0.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white font-bold"
              />
              <button
                @click="cartStore.updateQuantity(item.id, item.quantity + 1)"
                class="w-6 h-6 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 flex items-center justify-center text-xs text-slate-800 dark:text-white"
              >
                +
              </button>
            </div>
            <span class="text-xs font-black text-slate-900 dark:text-white">{{ formatCurrency(item.price * item.quantity - item.discount) }}</span>
          </div>
        </div>
      </div>

      <!-- Cart Totals & Checkout -->
      <div class="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
        <div class="space-y-1 text-xs">
          <div class="flex justify-between text-slate-500 dark:text-slate-400">
            <span>Oraliq summa:</span>
            <span class="text-slate-800 dark:text-slate-200 font-medium">{{ formatCurrency(cartStore.subtotal) }}</span>
          </div>
          <div class="flex justify-between text-slate-500 dark:text-slate-400">
            <span>Chegirma:</span>
            <span class="text-rose-500">-{{ formatCurrency(cartStore.discountTotal) }}</span>
          </div>
          <div class="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-800">
            <span>Jami to'lov:</span>
            <span class="text-emerald-600 dark:text-emerald-400 font-black">{{ formatCurrency(cartStore.grandTotal) }}</span>
          </div>
        </div>

        <button
          @click="openCheckoutModal"
          :disabled="cartStore.items.length === 0"
          class="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm shadow-lg shadow-emerald-500/25 transition flex items-center justify-center space-x-2 btn-interactive"
        >
          <CreditCard class="w-4 h-4" />
          <span>To'lovga O'tish (F10)</span>
        </button>
      </div>
    </div>

    <!-- Checkout Modal -->
    <div v-if="isCheckoutOpen" @click.self="isCheckoutOpen = false" class="modal-overlay">
      <div class="modal-container max-w-md" @click.stop>
        <div class="modal-header">
          <h3 class="font-black text-base text-slate-900 dark:text-white">To'lovni Tasdiqlash</h3>
          <button @click="isCheckoutOpen = false" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="modal-body space-y-4">
          <!-- Total display -->
          <div class="text-center py-4 bg-slate-100/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span class="text-xs text-slate-500 dark:text-slate-400">To'lanishi kerak bo'lgan summa:</span>
            <h2 class="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
              {{ formatCurrency(cartStore.grandTotal) }}
            </h2>
          </div>

          <!-- Payment Method Selection -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">To'lov Turi:</label>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="pm in paymentMethods"
                :key="pm.id"
                type="button"
                @click="selectedPaymentMethod = pm.id"
                class="p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1.5"
                :class="[
                  selectedPaymentMethod === pm.id
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                ]"
              >
                <Banknote v-if="pm.type === 'cash'" class="w-4 h-4" />
                <CreditCard v-else-if="pm.type === 'card'" class="w-4 h-4" />
                <Smartphone v-else class="w-4 h-4" />
                <span>{{ pm.name }}</span>
              </button>
            </div>
          </div>

          <!-- Cash change calculation if cash selected -->
          <div v-if="selectedPaymentMethod === '1'" class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div>
              <label class="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Mijoz bergan summa:</label>
              <CurrencyInput
                v-model="cashReceived"
                placeholder="0"
                suffix="so'm"
                inputClass="font-bold text-slate-900 dark:text-white"
              />
            </div>

            <!-- Quick Cash Buttons -->
            <div class="flex flex-wrap gap-1.5">
              <button
                type="button"
                @click="cashReceived = cartStore.grandTotal"
                class="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-semibold text-slate-700 dark:text-slate-300 hover:border-emerald-500 transition"
              >
                Aniq summa
              </button>
              <button
                type="button"
                v-for="amt in [50000, 100000, 200000]"
                :key="amt"
                @click="cashReceived = amt"
                class="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-700 dark:text-slate-300 hover:border-emerald-500 transition"
              >
                {{ formatCurrency(amt) }}
              </button>
            </div>

            <div v-if="cashReceived > cartStore.grandTotal" class="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800 text-xs">
              <span class="text-slate-500 dark:text-slate-400 font-semibold">Qaytim:</span>
              <span class="font-bold font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                {{ formatCurrency(cashReceived - cartStore.grandTotal) }}
              </span>
            </div>
          </div>

          <button
            @click="handleCompleteOrder"
            :disabled="isProcessing"
            class="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-black text-sm shadow-lg shadow-emerald-500/25 transition flex items-center justify-center space-x-2 btn-interactive"
          >
            <CheckCircle class="w-5 h-5" />
            <span>{{ isProcessing ? 'Chek chiqarilmoqda...' : 'To\'lovni Yakunlash (Chek Chiqarish)' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Thermal Print Receipt Modal -->
    <div v-if="completedOrder" @click.self="completedOrder = null" class="modal-overlay">
      <div class="modal-container max-w-sm" @click.stop>
        <div class="modal-header">
          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white font-sans">boshqar.uz POS</h3>
            <p class="text-slate-500 dark:text-slate-400 text-[11px]">Chek №: {{ completedOrder.orderNumber }}</p>
          </div>
          <button @click="completedOrder = null" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"><X class="w-5 h-5" /></button>
        </div>

        <div class="modal-body font-mono text-xs space-y-3">
          <div class="text-[10px] text-slate-500 dark:text-slate-400 flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <span>Sana:</span>
            <span>{{ formatDate(completedOrder.createdAt) }}</span>
          </div>

          <div class="divide-y divide-slate-200 dark:divide-slate-800 space-y-1">
            <div v-for="item in completedOrder.items" :key="item.id" class="flex justify-between py-1 text-slate-800 dark:text-slate-200">
              <span>{{ item.product?.name || item.service?.name }} x{{ item.quantity }}</span>
              <span class="font-bold">{{ formatCurrency(item.total) }}</span>
            </div>
          </div>

          <div class="border-t border-slate-200 dark:border-slate-800 pt-2 space-y-1 text-slate-700 dark:text-slate-300">
            <div class="flex justify-between font-bold text-sm text-slate-900 dark:text-white pt-1">
              <span>JAMI:</span>
              <span class="text-emerald-600 dark:text-emerald-400 font-mono">{{ formatCurrency(completedOrder.total) }}</span>
            </div>
          </div>
        </div>

        <div class="modal-footer font-sans">
          <button @click="completedOrder = null" class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs">
            Yopish
          </button>
          <button @click="printReceipt" class="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold flex items-center gap-1.5 text-xs shadow-md shadow-emerald-500/20 btn-interactive">
            <Printer class="w-4 h-4" />
            <span>Chop Etish</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../services/api';
import { useCartStore } from '../../stores/cart.store';
import { useDataStore } from '../../stores/data.store';
import { useFormat } from '../../composables/useFormat';
import { useToast } from '../../composables/useToast';
import {
  Search,
  ShoppingCart,
  Package,
  X,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle,
  Printer,
  Flame,
} from 'lucide-vue-next';

import SkeletonLoader from '../../components/SkeletonLoader.vue';
import CurrencyInput from '../../components/CurrencyInput.vue';

const cartStore = useCartStore();
const dataStore = useDataStore();
const toast = useToast();
const { formatCurrency, formatDate } = useFormat();

const loading = ref(false);
const products = computed(() => dataStore.products);
const categories = computed(() => dataStore.categories);
const bestsellers = ref<any[]>([]);

const searchQuery = ref('');
const selectedCategory = ref('');
const searchInputRef = ref<HTMLInputElement | null>(null);

const isCheckoutOpen = ref(false);
const isProcessing = ref(false);
const completedOrder = ref<any | null>(null);
const cashReceived = ref<number>(0);

const paymentMethods = ref([
  { id: '1', name: 'Naqd pul', type: 'cash' },
  { id: '2', name: 'Plastik karta', type: 'card' },
  { id: '3', name: 'Click / Payme', type: 'click' },
]);
const selectedPaymentMethod = ref('1');

const openCheckoutModal = () => {
  cashReceived.value = cartStore.grandTotal;
  isCheckoutOpen.value = true;
};

const loadProducts = async () => {
  if (dataStore.products.length === 0) {
    loading.value = true;
  }
  try {
    await Promise.all([
      dataStore.fetchProducts(),
      dataStore.fetchCategories(),
      fetchBestsellers(),
    ]);
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const fetchBestsellers = async () => {
  try {
    const { data } = await api.get('/products/bestsellers?limit=50&period=30d');
    bestsellers.value = data || [];
  } catch (err) {
    console.error('Failed to fetch bestsellers', err);
  }
};

const filteredProducts = computed(() => {
  let list = [...products.value];

  // Merge bestsellers sales stats into products list
  const bestsellersMap = new Map(bestsellers.value.map((b) => [b.id, b.soldCount30d || 0]));
  list = list.map((p) => ({
    ...p,
    soldCount30d: bestsellersMap.get(p.id) || 0,
  }));

  // Sort by popularity (bestsellers first) by default
  list.sort((a, b) => {
    const soldA = a.soldCount30d || 0;
    const soldB = b.soldCount30d || 0;
    if (soldA !== soldB) return soldB - soldA;
    return a.name.localeCompare(b.name);
  });

  return list.filter((p) => {
    if (selectedCategory.value === '__bestsellers__') {
      if (!p.soldCount30d || p.soldCount30d <= 0) return false;
    } else if (selectedCategory.value) {
      if (p.categoryId !== selectedCategory.value) return false;
    }

    const matchSearch =
      !searchQuery.value ||
      p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.barcode?.includes(searchQuery.value);

    return matchSearch;
  });
});

const handleProductClick = (product: any) => {
  if (product.stockQty <= 0) {
    toast.warning(`"${product.name}" mahsulotidan omborda qoldiq qolmagan!`, 'Qoldiq tugagan');
    return;
  }
  addToCart(product);
};

const addToCart = (product: any) => {
  const existingInCart = cartStore.items.find((i) => (i.productId || i.id) === product.id);
  const currentInCartQty = existingInCart ? existingInCart.quantity : 0;

  if (currentInCartQty + 1 > product.stockQty) {
    toast.warning(
      `Omborda faqat ${product.stockQty} dona mavjud. Savatga bundan ortiq qo'shib bo'lmaydi!`,
      'Qoldiq chegarasi'
    );
    return;
  }

  cartStore.addItem(product);
  toast.success(`"${product.name}" savatga qo'shildi`, 'Savat');
};

const handleBarcodeScan = async () => {
  if (!searchQuery.value) return;
  const exact = products.value.find((p) => p.barcode === searchQuery.value || p.sku === searchQuery.value);
  if (exact) {
    if (exact.stockQty <= 0) {
      toast.warning(`"${exact.name}" mahsulotidan omborda qoldiq qolmagan!`, 'Qoldiq tugagan');
    } else {
      addToCart(exact);
    }
    searchQuery.value = '';
  } else {
    toast.warning(`Shtrix-kod (${searchQuery.value}) bo'yicha tovar topilmadi`, 'Skaner');
  }
};

const handleCompleteOrder = async () => {
  if (cartStore.items.length === 0) return;
  isProcessing.value = true;
  try {
    const { data } = await api.post('/orders', {
      orderType: 'pos',
      items: cartStore.items.map((i) => ({
        productId: i.productId || i.id,
        serviceId: i.serviceId,
        quantity: i.quantity,
        unitPrice: i.price,
      })),
      payments: [
        {
          paymentMethodId: selectedPaymentMethod.value,
          amount: cartStore.grandTotal,
        },
      ],
    });

    completedOrder.value = data;
    isCheckoutOpen.value = false;
    cartStore.clearCart();
    toast.success(`Savdo muvaffaqiyatli yakunlandi! Chek: ${data.orderNumber || '#001'}`, 'Kassa (POS)');
    dataStore.invalidate('products');
    await loadProducts(); // refresh inventory and bestsellers
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Savdoni yakunlashda xatolik', 'Xatolik');
  } finally {
    isProcessing.value = false;
  }
};

const printReceipt = () => {
  window.print();
};

onMounted(() => {
  loadProducts();
  searchInputRef.value?.focus();
});
</script>
