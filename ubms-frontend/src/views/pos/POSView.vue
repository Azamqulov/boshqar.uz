<template>
  <div class="h-[calc(100dvh-8.5rem)] md:h-[calc(100vh-5.5rem)] flex flex-col gap-2 sm:gap-2.5 overflow-hidden">
    <!-- Top Shift Status Bar -->
    <POSShiftBar
      :current-shift="currentShift"
      :cashier-name="authStore.user?.fullName"
      :enable-hotkeys="posSettings.enableHotkeys"
      :is-online="isOnline"
      :pending-count="pendingCount"
      :is-syncing="isSyncing"
      @open-shift="openShiftModal"
      @open-hotkeys="isHotkeysModalOpen = true"
      @sync-offline="syncOfflineOrders(api)"
    />

    <!-- Mobile Tab Toggle (< lg) -->
    <div class="flex lg:hidden items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0 gap-1">
      <button
        @click="mobileViewTab = 'catalog'"
        class="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
        :class="mobileViewTab === 'catalog' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'"
      >
        <Package class="w-3.5 h-3.5" />
        <span>Katalog ({{ filteredProducts.length }})</span>
      </button>
      <button
        @click="mobileViewTab = 'cart'"
        class="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
        :class="mobileViewTab === 'cart' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'"
      >
        <ShoppingCart class="w-3.5 h-3.5" />
        <span>Savat ({{ cartStore.itemCount }})</span>
        <span v-if="cartStore.itemCount > 0" class="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
          {{ formatCurrency(cartStore.grandTotal) }}
        </span>
      </button>
    </div>

    <!-- Main POS Workspace -->
    <div class="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden relative">
      <!-- Locked Screen Overlay when Shift is Closed -->
      <div
        v-if="!currentShift"
        class="absolute inset-0 z-20 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 rounded-2xl animate-fade-in"
      >
        <div class="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 shadow-2xl text-center space-y-4">
          <div class="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto shadow-inner">
            <Lock class="w-8 h-8" />
          </div>

          <div>
            <h3 class="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Kassa Smenasi Ochilmagan
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Mahsulotlarni tanlash va savdo qilish uchun avval kassa smenasini oching. Boshlang'ich kassa qoldig'i qayd etiladi.
            </p>
          </div>

          <div class="pt-2">
            <button
              type="button"
              @click="openShiftModal('open')"
              class="w-full py-3.5 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition transform active:scale-98 btn-interactive"
            >
              <Sun class="w-5 h-5" />
              <span>Yangi Smenani Ochish</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Left Catalog Area (65%) -->
      <POSProductCatalog
        ref="catalogRef"
        :mobile-view-tab="mobileViewTab"
        v-model:search-query="searchQuery"
        v-model:selected-category="selectedCategory"
        :categories="categories"
        :filtered-products="filteredProducts"
        :loading="loading"
        :pos-settings="posSettings"
        @barcode-scan="handleBarcodeScan"
        @product-click="handleProductClick"
      />

      <!-- Right Cart & Payment Area -->
      <POSCartSidebar
        :mobile-view-tab="mobileViewTab"
        :cart-store="cartStore"
        :is-restaurant="isRestaurant"
        :enabled-service-types="enabledServiceTypes.map(t => t.key)"
        v-model:order-type="orderType"
        :current-table-display-name="currentTableDisplayName"
        :available-tables="availableTables"
        :selected-table-number="selectedTableNumber"
        :held-orders-count="heldOrders.length"
        :allow-discounts="posSettings.allowDiscounts"
        :enable-hotkeys="posSettings.enableHotkeys"
        @select-table="selectedTableNumber = $event; isCustomTableInput = false;"
        @hold-cart="holdCurrentCart"
        @open-held-orders="isHeldOrdersOpen = true"
        @open-checkout="openCheckoutModal"
        @open-discount-modal="isDiscountModalOpen = true"
      />
    </div>

    <!-- Mobile Floating Sticky Cart Bar (When in catalog tab and cart has items) -->
    <div
      v-if="mobileViewTab === 'catalog' && cartStore.itemCount > 0"
      class="lg:hidden fixed bottom-3 left-3 right-3 z-30 animate-slide-up"
    >
      <button
        type="button"
        @click="mobileViewTab = 'cart'"
        class="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs shadow-xl shadow-emerald-500/30 flex items-center justify-between transition active:scale-98"
      >
        <div class="flex items-center gap-2">
          <span class="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-mono">
            {{ cartStore.itemCount }}
          </span>
          <span>Savatga o'tish</span>
        </div>
        <div class="flex items-center gap-1.5 font-mono text-sm">
          <span>{{ formatCurrency(cartStore.grandTotal) }}</span>
          <span>➔</span>
        </div>
      </button>
    </div>

    <!-- Checkout Modal -->
    <POSCheckoutModal
      :is-open="isCheckoutOpen"
      :cart-store="cartStore"
      :is-restaurant="isRestaurant"
      :enabled-service-types="enabledServiceTypes.map(t => t.key)"
      :order-type="orderType"
      :current-table-display-name="currentTableDisplayName"
      :available-tables="availableTables"
      :selected-table-number="selectedTableNumber"
      :is-custom-table-input="isCustomTableInput"
      v-model:custom-table-number="customTableNumber"
      @enable-custom-table="isCustomTableInput = true"
      @select-table="selectedTableNumber = $event; isCustomTableInput = false;"
      :payment-methods="paymentMethods"
      :selected-payment-method="selectedPaymentMethod"
      @select-payment-method="selectPaymentMethod"
      v-model:cash-received="cashReceived"
      :is-nasiya-needed="isNasiyaNeeded"
      v-model:selected-customer-id="selectedCustomerId"
      :customer-select-options="customerSelectOptions"
      :selected-customer="selectedCustomer"
      :current-nasiya-amount="currentNasiyaAmount"
      :is-processing="isProcessing"
      :allow-debt="effectiveAllowDebt"
      :allow-discounts="posSettings.allowDiscounts"
      @close="isCheckoutOpen = false"
      @open-new-customer="isNewCustomerModalOpen = true"
      @open-discount-modal="isDiscountModalOpen = true"
      @complete-order="handleCompleteOrder"
    />

    <!-- Discount Modal (% / so'm) -->
    <POSDiscountModal
      :is-open="isDiscountModalOpen"
      :subtotal="cartStore.subtotal"
      :current-type="cartStore.discountType"
      :current-value="cartStore.discountValue"
      @apply="onApplyDiscount"
      @clear="cartStore.clearDiscount()"
      @close="isDiscountModalOpen = false"
    />

    <!-- Held Orders Modal -->
    <POSHeldOrdersModal
      :is-open="isHeldOrdersOpen"
      :held-orders="heldOrders"
      @close="isHeldOrdersOpen = false"
      @recall="recallHeldOrder"
      @delete="deleteHeldOrder"
    />

    <!-- Quick New Customer Modal -->
    <POSQuickCustomerModal
      :is-open="isNewCustomerModalOpen"
      :new-customer-form="newCustomerForm"
      :saving-customer="savingCustomer"
      @close="isNewCustomerModalOpen = false"
      @save="saveNewCustomer"
    />

    <!-- Unified Receipt Modal -->
    <ReceiptModal
      v-if="completedOrder"
      :order="completedOrder"
      @close="completedOrder = null"
    />

    <!-- Shift Modal (Open / Close / Z-Report) -->
    <ShiftModal
      :is-open="shiftModal.open"
      :mode="shiftModal.mode"
      :shift-data="currentShift"
      :cart-items-count="cartStore.itemCount"
      :held-orders-count="heldOrders.length"
      @close="shiftModal.open = false"
      @shift-opened="onShiftOpened"
      @shift-closed="onShiftClosed"
      @go-to-cart="mobileViewTab = 'cart'"
      @go-to-held-orders="isHeldOrdersOpen = true"
    />

    <!-- Hotkeys Help Modal -->
    <POSHotkeysModal
      :is-open="isHotkeysModalOpen"
      @close="isHotkeysModalOpen = false"
    />

    <!-- Mobile Floating Checkout Bar (< lg) -->
    <div
      v-if="cartStore.itemCount > 0 && mobileViewTab === 'catalog'"
      class="lg:hidden fixed bottom-16 left-3 right-3 z-30 p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-2xl flex items-center justify-between animate-in slide-in-from-bottom-3 duration-200"
    >
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-black text-xs">
          {{ cartStore.itemCount }}
        </div>
        <div>
          <p class="text-xs font-bold leading-tight">{{ formatCurrency(cartStore.grandTotal) }}</p>
          <p class="text-[10px] text-emerald-100">Savatda tovarlar bor</p>
        </div>
      </div>
      <button
        @click="mobileViewTab = 'cart'"
        class="px-3.5 py-1.5 rounded-xl bg-white text-emerald-700 font-black text-xs shadow-md transition active:scale-95 flex items-center gap-1"
      >
        <span>Savatga O'tish</span>
        <ArrowRight class="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import api from '../../services/api';
import { useCartStore } from '../../stores/cart.store';
import { useDataStore } from '../../stores/data.store';
import { useShiftStore } from '../../stores/shift.store';
import { useAuthStore } from '../../stores/auth.store';
import { useFormat } from '../../composables/useFormat';
import { useToast } from '../../composables/useToast';
import ReceiptModal from '../../components/ReceiptModal.vue';
import ShiftModal from '../../components/ShiftModal.vue';
import { usePosSettings } from '../../composables/usePosSettings';
import {
  Package,
  ShoppingCart,
  Sun,
  Lock,
  ArrowRight,
} from 'lucide-vue-next';

import POSShiftBar from './components/POSShiftBar.vue';
import POSProductCatalog from './components/POSProductCatalog.vue';
import POSCartSidebar from './components/POSCartSidebar.vue';
import POSCheckoutModal from './components/POSCheckoutModal.vue';
import POSHeldOrdersModal from './components/POSHeldOrdersModal.vue';
import POSQuickCustomerModal from './components/POSQuickCustomerModal.vue';
import POSDiscountModal from './components/POSDiscountModal.vue';
import POSHotkeysModal from './components/POSHotkeysModal.vue';
import { useOfflinePOS } from '../../composables/useOfflinePOS';
import { usePlanFeatures } from '../../composables/usePlanFeatures';

const mobileViewTab = ref<'catalog' | 'cart'>('catalog');
const cartStore = useCartStore();
const dataStore = useDataStore();
const shiftStore = useShiftStore();
const authStore = useAuthStore();
const toast = useToast();
const { formatCurrency, formatDate, formatDateTime } = useFormat();
const { isFeatureEnabled } = usePlanFeatures();

const isCustomerLoyaltyAllowed = computed(() => isFeatureEnabled('customer_loyalty'));
const effectiveAllowDebt = computed(() => {
  return Boolean(posSettings.value?.allowDebt && isCustomerLoyaltyAllowed.value);
});
const {
  isOnline,
  isSyncing,
  pendingCount,
  cacheCatalog,
  getCachedCatalog,
  enqueueOfflineOrder,
  syncOfflineOrders,
  setupListeners,
} = useOfflinePOS();

const isDiscountModalOpen = ref(false);
const isHotkeysModalOpen = ref(false);

const onApplyDiscount = (payload: { type: 'percent' | 'fixed'; value: number }) => {
  cartStore.setDiscount(payload.type, payload.value);
  if (selectedPaymentMethod.value === '1') {
    cashReceived.value = cartStore.grandTotal;
  }
  toast.success(
    `Chegirma qo'llandi: ${payload.type === 'percent' ? payload.value + '%' : formatCurrency(payload.value)} (-${formatCurrency(cartStore.generalDiscount)})`,
    'Chegirma'
  );
};

const loading = ref(dataStore.products.length === 0);
const products = computed(() => dataStore.products);
const categories = computed(() => dataStore.categories);
const customers = computed(() => dataStore.customers || []);
const bestsellers = ref<any[]>([]);

import { usePOSCustomer } from './composables/usePOSCustomer';
import { usePOSHeldOrders } from './composables/usePOSHeldOrders';

const {
  selectedCustomerId,
  selectedCustomer,
  isNewCustomerModalOpen,
  newCustomerForm,
  savingCustomer,
  customerSelectOptions,
  saveNewCustomer,
} = usePOSCustomer();

const {
  isHeldOrdersOpen,
  heldOrders,
  holdCurrentCart: rawHoldCart,
  recallHeldOrder: rawRecallHeldOrder,
  deleteHeldOrder,
} = usePOSHeldOrders();

const holdCurrentCart = () => {
  rawHoldCart(orderType.value, currentTableDisplayName.value, selectedCustomerId.value);
};

const recallHeldOrder = (order: any) => {
  rawRecallHeldOrder(order, selectedTableNumber, selectedCustomerId, orderType);
};

const currentShift = computed(() => shiftStore.currentShift);
const shiftModal = ref<{ open: boolean; mode: 'open' | 'close' | 'report' }>({
  open: false,
  mode: 'open',
});

const openShiftModal = (mode: 'open' | 'close' | 'report') => {
  shiftModal.value = { open: true, mode };
};

const onShiftOpened = (newShift: any) => {
  shiftStore.currentShift = newShift;
  shiftModal.value.open = false;
};

const onShiftClosed = async () => {
  shiftStore.currentShift = null;
  shiftModal.value.open = false;
  await shiftStore.fetchShifts();
};

const fetchCurrentShift = async () => {
  await shiftStore.fetchCurrentShift();
};

const searchQuery = ref('');
const selectedCategory = ref('');
const searchInputRef = ref<HTMLInputElement | null>(null);

const isRestaurant = computed(() => {
  const type = (authStore.businessType || authStore.activeBusiness?.businessType || '').toLowerCase();
  return ['restaurant', 'cafe', 'fastfood', 'coffee', 'restaran'].includes(type);
});

const { posSettings } = usePosSettings();

const enabledServiceTypes = computed(() => {
  const list: { key: 'dine_in' | 'takeaway' | 'delivery'; label: string; icon: string }[] = [];
  if (posSettings.value.allowDineIn) list.push({ key: 'dine_in', label: 'Zalda', icon: 'UtensilsCrossed' });
  if (posSettings.value.allowTakeaway) list.push({ key: 'takeaway', label: 'Saboy', icon: 'ShoppingBag' });
  if (posSettings.value.allowDelivery) list.push({ key: 'delivery', label: 'Dostavka', icon: 'Truck' });
  return list;
});

const orderType = ref<'dine_in' | 'takeaway' | 'delivery'>(
  posSettings.value.allowDineIn ? 'dine_in' : posSettings.value.allowTakeaway ? 'takeaway' : 'delivery'
);

watch(
  enabledServiceTypes,
  (types) => {
    if (types.length > 0 && !types.some((t) => t.key === orderType.value)) {
      orderType.value = types[0].key;
    }
  },
  { immediate: true }
);

const selectedTableNumber = ref<string>('');
const customTableNumber = ref<string>('');
const isCustomTableInput = ref<boolean>(false);

const currentTableDisplayName = computed(() => {
  if (isCustomTableInput.value && customTableNumber.value) {
    return customTableNumber.value;
  }
  return selectedTableNumber.value || '';
});

const availableTables = computed(() => {
  if (dataStore.tables && dataStore.tables.length > 0) {
    return dataStore.tables.map((t: any) => ({
      id: t.id,
      name: t.name || `Stol #${t.number || t.id}`,
    }));
  }
  return [
    { id: '1', name: 'Stol 1' },
    { id: '2', name: 'Stol 2' },
    { id: '3', name: 'Stol 3' },
    { id: '4', name: 'Stol 4' },
    { id: '5', name: 'Stol 5' },
    { id: '6', name: 'Stol 6' },
    { id: 'vip-1', name: 'VIP 1' },
    { id: 'vip-2', name: 'VIP 2' },
    { id: 'terrace-1', name: 'Terassa 1' },
  ];
});

const isCheckoutOpen = ref(false);
const isProcessing = ref(false);
const completedOrder = ref<any | null>(null);
const cashReceived = ref<number>(0);

const isNasiyaNeeded = computed(() => {
  if (!effectiveAllowDebt.value) return false;
  if (selectedPaymentMethod.value === '4') return true;
  if (selectedPaymentMethod.value === '1' && cashReceived.value < cartStore.grandTotal) return true;
  return false;
});

const currentNasiyaAmount = computed(() => {
  if (!effectiveAllowDebt.value) return 0;
  if (selectedPaymentMethod.value === '4') return cartStore.grandTotal;
  if (selectedPaymentMethod.value === '1' && cashReceived.value < cartStore.grandTotal) {
    return Math.max(0, cartStore.grandTotal - (cashReceived.value || 0));
  }
  return 0;
});

const selectPaymentMethod = (id: string) => {
  selectedPaymentMethod.value = id;
  if (id === '4') {
    cashReceived.value = 0;
  } else if (id === '1') {
    if (cashReceived.value === 0) {
      cashReceived.value = cartStore.grandTotal;
    }
  }
};

const openCheckoutModal = () => {
  if (!currentShift.value) {
    toast.warning('Kassa smenasi ochilmagan! Savdo qilish uchun avval smenani oching.', 'Smena Ochilmagan');
    openShiftModal('open');
    return;
  }
  if (cartStore.items.length === 0) return;
  if (isRestaurant.value && orderType.value === 'dine_in' && !currentTableDisplayName.value) {
    toast.warning('Iltimos, avval qaysi stol band qilinganligini belgilang!', 'Stol belgilanmagan');
    return;
  }
  cashReceived.value = cartStore.grandTotal;
  if (selectedPaymentMethod.value === '4' && !effectiveAllowDebt.value) {
    selectedPaymentMethod.value = '1';
  } else if (!paymentMethods.value.some(pm => pm.id === selectedPaymentMethod.value)) {
    selectedPaymentMethod.value = '1';
  }
  isCheckoutOpen.value = true;
};

const paymentMethods = computed(() => {
  const methods = [
    { id: '1', name: 'Naqd pul', type: 'cash' },
    { id: '2', name: 'Plastik karta', type: 'card' },
    { id: '3', name: 'Click / Payme', type: 'click' },
  ];
  if (effectiveAllowDebt.value) {
    methods.push({ id: '4', name: 'Nasiya (Qarz)', type: 'debt' });
  }
  return methods;
});
const selectedPaymentMethod = ref('1');

const loadProducts = async (force = false) => {
  if (dataStore.products.length === 0) {
    loading.value = true;
  }
  try {
    const promises: Promise<any>[] = [
      dataStore.fetchProducts(force),
      dataStore.fetchCategories(force),
    ];
    if (isRestaurant.value) {
      promises.push(dataStore.fetchTables(force));
    }
    await Promise.all(promises);
    cacheCatalog(dataStore.products, dataStore.categories);
  } catch (err) {
    console.warn('Network error loading products, attempting offline cache recovery...', err);
    const cached = getCachedCatalog();
    if (cached.products && cached.products.length > 0 && dataStore.products.length === 0) {
      dataStore.products = cached.products;
      dataStore.categories = cached.categories;
      toast.info('Katalog offline keshdan muvaffaqiyatli yuklandi', 'Offline Rejim');
    }
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
  const bestsellersMap = new Map(bestsellers.value.map((b) => [b.id, b.soldCount ?? b.soldCount30d ?? 0]));
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

const isDishItem = (prod: any) => {
  return (
    prod.isMadeToOrder ||
    prod.brand === 'dish' ||
    prod.brand === 'kitchen' ||
    prod.unit?.shortName === 'por' ||
    prod.unitId === '00000000-0000-0000-0000-000000000024'
  );
};

const isItemAvailable = (prod: any) => {
  if (prod.status === 'inactive') return false;
  if (isDishItem(prod) || prod.brand === 'service') return true;
  if (posSettings.value?.allowZeroStockSale) return true;
  return (prod.stockQty ?? 0) > 0;
};

const handleProductClick = (product: any) => {
  if (!currentShift.value) {
    toast.warning('Kassa smenasi ochilmagan! Mahsulot tanlash uchun avval smenani oching.', 'Smena Ochilmagan');
    openShiftModal('open');
    return;
  }
  if (!isItemAvailable(product)) {
    if (product.status === 'inactive') {
      toast.warning(`"${product.name}" hozirda stop-listda (oshxonada tugagan)!`, 'Stop-list');
    } else {
      toast.warning(`"${product.name}" mahsulotidan omborda qoldiq qolmagan!`, 'Qoldiq tugagan');
    }
    return;
  }
  addToCart(product);
};

const addToCart = (product: any) => {
  if (!currentShift.value) {
    toast.warning('Kassa smenasi ochilmagan! Mahsulotlarni savatga qo\'shish uchun avval smenani oching.', 'Smena Ochilmagan');
    openShiftModal('open');
    return;
  }
  const isDish = isDishItem(product) || product.brand === 'service';
  const existingInCart = cartStore.items.find((i) => (i.productId || i.id) === product.id);
  const currentInCartQty = existingInCart ? existingInCart.quantity : 0;

  // Only check physical stock bounds for tracked goods if 0-stock sale is not allowed
  if (!isDish && !posSettings.value?.allowZeroStockSale && currentInCartQty + 1 > product.stockQty) {
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
  if (!currentShift.value) {
    toast.warning('Kassa smenasi ochilmagan! Shtrix-kod skanerlashdan oldin smenani oching.', 'Smena Ochilmagan');
    openShiftModal('open');
    return;
  }
  const exact = products.value.find((p) => p.barcode === searchQuery.value || p.sku === searchQuery.value);
  if (exact) {
    if (!isItemAvailable(exact)) {
      if (exact.status === 'inactive') {
        toast.warning(`"${exact.name}" hozirda stop-listda (sotuv to'xtatilgan)!`, 'Stop-list');
      } else {
        toast.warning(`"${exact.name}" mahsulotidan omborda qoldiq qolmagan!`, 'Qoldiq tugagan');
      }
    } else {
      addToCart(exact);
    }
    searchQuery.value = '';
  } else {
    toast.warning(`Shtrix-kod (${searchQuery.value}) bo'yicha tovar topilmadi`, 'Skaner');
  }
};

const handleCompleteOrder = async () => {
  if (isProcessing.value || cartStore.items.length === 0) return;

  // Determine actual paid amount based on payment method
  const total = cartStore.grandTotal;
  let actualPaid = total;

  if (selectedPaymentMethod.value === '4') {
    // 100% Nasiya / Debt
    if (!selectedCustomerId.value) {
      toast.warning('Nasiyaga (qarzga) yozish uchun avval Mijozni tanlang yoki yangi mijoz qo\'shing!', 'Mijoz tanlanmagan');
      return;
    }
    actualPaid = 0;
    toast.info(
      `Jami ${formatCurrency(total)} summa mijozning (${selectedCustomer.value?.fullName}) nasiya (qarz) hisobiga yozildi.`,
      'Nasiya savdo'
    );
  } else if (selectedPaymentMethod.value === '1') {
    // If cash received is less than total
    if (cashReceived.value < total) {
      if (!selectedCustomerId.value) {
        toast.warning(
          `Mijoz to'liq summa bermadi (${formatCurrency(cashReceived.value || 0)} / ${formatCurrency(total)}). Qolgan ${formatCurrency(total - (cashReceived.value || 0))} qaysi mijozning qarziga yozilsin? Iltimos, mijozni tanlang!`,
          'Mijoz tanlanmagan'
        );
        return;
      }
      actualPaid = Math.max(0, cashReceived.value || 0);
      const nasiyaAmount = total - actualPaid;
      toast.info(
        `Mijoz ${formatCurrency(actualPaid)} to'ladi. Qolgan ${formatCurrency(nasiyaAmount)} mijozning (${selectedCustomer.value.fullName}) nasiya hisobiga yozildi.`,
        'Qisman to\'lov / Nasiya'
      );
    } else {
      actualPaid = total;
    }
  } else {
    actualPaid = total;
  }

  if (actualPaid <= 0 && selectedPaymentMethod.value !== '4') {
    toast.warning('To\'lov summasi 0 bo\'lishi mumkin emas!', 'Xatolik');
    return;
  }

  if (isRestaurant.value && orderType.value === 'dine_in' && !currentTableDisplayName.value) {
    toast.warning('Iltimos, buyurtma qaysi stol uchun ekanligini belgilang!', 'Stol belgilanmagan');
    return;
  }

  const resolvedTableNumber = (isRestaurant.value && orderType.value === 'dine_in')
    ? currentTableDisplayName.value
    : null;

  const apiOrderType = isRestaurant.value ? 'restaurant' : 'pos';

  isProcessing.value = true;
  try {
    const pmObj = paymentMethods.value.find((p) => p.id === selectedPaymentMethod.value);
    let data: any;

    if (!isOnline.value) {
      data = enqueueOfflineOrder({
        orderType: isRestaurant.value ? orderType.value : 'pos',
        customerId: selectedCustomerId.value || undefined,
        customer: selectedCustomer.value,
        tableNumber: resolvedTableNumber,
        items: cartStore.items.map((i) => ({
          productId: i.productId || i.id,
          serviceId: i.serviceId,
          name: i.name,
          quantity: i.quantity,
          unitPrice: i.price,
          isManualPrice: Boolean(i.isManualPrice),
          discountAmount: i.discount || 0,
        })),
        discountAmount: cartStore.generalDiscount || 0,
        payments: [
          {
            paymentMethodId: selectedPaymentMethod.value,
            amount: actualPaid,
            paymentMethodName: pmObj?.name || 'Naqd pul (Offline)',
            paymentMethodType: pmObj?.type || 'cash',
          },
        ],
        cashierName: authStore.user?.fullName || 'Kassir',
      });
    } else {
      try {
        const res = await api.post('/orders', {
          orderType: apiOrderType,
          customerId: selectedCustomerId.value || undefined,
          tableNumber: resolvedTableNumber,
          tableName: resolvedTableNumber,
          items: cartStore.items.map((i) => ({
            productId: i.productId || i.id,
            serviceId: i.serviceId,
            quantity: i.quantity,
            unitPrice: i.price,
            isManualPrice: Boolean(i.isManualPrice),
            discountAmount: i.discount || 0,
          })),
          discountAmount: cartStore.generalDiscount || 0,
          payments: [
            {
              paymentMethodId: selectedPaymentMethod.value,
              amount: actualPaid,
            },
          ],
        });
        data = res.data;
      } catch (postErr: any) {
        if (!navigator.onLine || postErr.code === 'ERR_NETWORK' || postErr.message?.includes('Network')) {
          data = enqueueOfflineOrder({
            orderType: isRestaurant.value ? orderType.value : 'pos',
            customerId: selectedCustomerId.value || undefined,
            customer: selectedCustomer.value,
            tableNumber: resolvedTableNumber,
            items: cartStore.items.map((i) => ({
              productId: i.productId || i.id,
              serviceId: i.serviceId,
              name: i.name,
              quantity: i.quantity,
              unitPrice: i.price,
              isManualPrice: Boolean(i.isManualPrice),
              discountAmount: i.discount || 0,
            })),
            discountAmount: cartStore.generalDiscount || 0,
            payments: [
              {
                paymentMethodId: selectedPaymentMethod.value,
                amount: actualPaid,
                paymentMethodName: pmObj?.name || 'Naqd pul (Offline)',
                paymentMethodType: pmObj?.type || 'cash',
              },
            ],
            cashierName: authStore.user?.fullName || 'Kassir',
          });
          toast.warning('Internet uzildi, savdo offline navbatga saqlandi!', 'Offline Saqlandi');
        } else {
          throw postErr;
        }
      }
    }

    data.orderType = isRestaurant.value ? orderType.value : 'pos';
    data.tableNumber = resolvedTableNumber;
    if (selectedCustomer.value) {
      data.customer = selectedCustomer.value;
    }

    // Ensure payment method details exist on completed order
    if (!data.payments || data.payments.length === 0) {
      data.payments = [
        {
          id: 'pay-' + Date.now(),
          amount: actualPaid,
          paymentMethod: {
            name: pmObj?.name || (selectedPaymentMethod.value === '3' ? 'Click / Payme' : 'Naqd pul'),
            type: pmObj?.type || (selectedPaymentMethod.value === '3' ? 'click' : 'cash'),
          },
        },
      ];
    } else if (data.payments[0] && !data.payments[0].paymentMethod) {
      data.payments[0].paymentMethod = {
        name: pmObj?.name || (selectedPaymentMethod.value === '3' ? 'Click / Payme' : 'Naqd pul'),
        type: pmObj?.type || (selectedPaymentMethod.value === '3' ? 'click' : 'cash'),
      };
    }

    const posSet = posSettings.value;
    // Check if receipt printing is enabled
    if (posSet.enableReceiptPrinting !== false && posSet.autoShowReceipt !== false) {
      completedOrder.value = data;
      if (posSet.autoPrintReceipt) {
        setTimeout(() => {
          window.print();
        }, 300);
      }
    } else {
      completedOrder.value = null;
    }

    isCheckoutOpen.value = false;
    isProcessing.value = false;
    cartStore.clearCart();
    selectedCustomerId.value = '';
    selectedTableNumber.value = '';
    customTableNumber.value = '';

    shiftStore.recordSale(
      actualPaid,
      selectedPaymentMethod.value === '1' ? 'cash' : (selectedPaymentMethod.value === '2' ? 'card' : 'other')
    );
    toast.success(`Savdo muvaffaqiyatli yakunlandi! Chek: ${data.orderNumber || '#001'}`, 'Kassa (POS)');
    dataStore.invalidate('products');
    dataStore.invalidate('customers');
    dataStore.invalidate('dashboard');
    dataStore.invalidate('inventory');
    dataStore.invalidate('finance');

    // Run catalog & shift refreshes in background without blocking the UI
    if (isOnline.value) {
      setTimeout(() => {
        Promise.allSettled([loadProducts(true), fetchCurrentShift(), dataStore.fetchCustomers(true)]).catch(console.error);
      }, 50);
    }
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Savdoni yakunlashda xatolik', 'Xatolik');
  } finally {
    isProcessing.value = false;
  }
};

import { usePOSKeyboard } from './composables/usePOSKeyboard';
import { useBarcodeScanner } from './composables/useBarcodeScanner';

// Global Barcode Hardware Scanner listener
useBarcodeScanner({
  onScan: (scannedCode) => {
    const matched = dataStore.products.find(
      (p) => p.barcode === scannedCode || p.sku?.toLowerCase() === scannedCode.toLowerCase()
    );
    if (matched) {
      handleProductClick(matched);
      toast.success(`Sktrix-kod o'qildi: "${matched.name}"`, 'Skaner');
    } else {
      toast.warning(`Shtrix-kod bo'yicha mahsulot topilmadi: ${scannedCode}`, 'Skaner');
    }
  },
});

// Setup POS Keyboard hotkeys composable
usePOSKeyboard({
  enableHotkeys: computed(() => posSettings.value?.enableHotkeys),
  isCheckoutOpen,
  isDiscountModalOpen,
  isHotkeysModalOpen,
  isHeldOrdersOpen,
  isNewCustomerModalOpen,
  completedOrder,
  allowDiscounts: computed(() => posSettings.value?.allowDiscounts),
  allowDebt: effectiveAllowDebt,
  cartItemsCount: computed(() => cartStore.items.length),
  onCompleteOrder: handleCompleteOrder,
  onSelectPaymentMethod: selectPaymentMethod,
  onOpenCheckout: openCheckoutModal,
  onClearCart: () => cartStore.clearCart(),
  onHoldCart: holdCurrentCart,
  toast,
});

let cleanupOfflineListeners: (() => void) | null = null;

onMounted(() => {
  cleanupOfflineListeners = setupListeners(api);
  loadProducts();
  fetchCurrentShift();
  dataStore.fetchCustomers();
  setTimeout(() => {
    document.getElementById('pos-search-input')?.focus();
  }, 300);
});

onUnmounted(() => {
  if (cleanupOfflineListeners) {
    cleanupOfflineListeners();
  }
});
</script>
