<template>
  <div class="h-[calc(100vh-5.5rem)] flex flex-col gap-2.5 overflow-hidden">
    <!-- Top Shift Status Bar -->
    <POSShiftBar
      :current-shift="currentShift"
      :cashier-name="authStore.user?.fullName"
      @open-shift="openShiftModal"
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
        @select-table="selectedTableNumber = $event; isCustomTableInput = false;"
        @hold-cart="holdCurrentCart"
        @open-held-orders="isHeldOrdersOpen = true"
        @open-checkout="openCheckoutModal"
      />
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
      @close="isCheckoutOpen = false"
      @open-new-customer="isNewCustomerModalOpen = true"
      @complete-order="handleCompleteOrder"
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
      @close="shiftModal.open = false"
      @shift-opened="onShiftOpened"
      @shift-closed="onShiftClosed"
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
import { ref, computed, onMounted, watch } from 'vue';
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

const mobileViewTab = ref<'catalog' | 'cart'>('catalog');
const cartStore = useCartStore();
const dataStore = useDataStore();
const shiftStore = useShiftStore();
const authStore = useAuthStore();
const toast = useToast();
const { formatCurrency, formatDate, formatDateTime } = useFormat();

const loading = ref(false);
const products = computed(() => dataStore.products);
const categories = computed(() => dataStore.categories);
const customers = computed(() => dataStore.customers || []);
const bestsellers = ref<any[]>([]);

// Customer Selection & Quick Add State
const selectedCustomerId = ref('');
const selectedCustomer = computed(() => customers.value.find((c) => c.id === selectedCustomerId.value) || null);
const isNewCustomerModalOpen = ref(false);
const newCustomerForm = ref({ fullName: '', phone: '' });
const savingCustomer = ref(false);

// Held orders state with localStorage persistence
const isHeldOrdersOpen = ref(false);
const heldOrders = ref<any[]>(JSON.parse(localStorage.getItem('pos_held_orders') || '[]'));

const saveHeldOrdersToStorage = () => {
  localStorage.setItem('pos_held_orders', JSON.stringify(heldOrders.value));
};

const holdCurrentCart = () => {
  if (cartStore.items.length === 0) return;
  heldOrders.value.push({
    id: 'held-' + Date.now(),
    items: [...cartStore.items],
    orderType: orderType.value,
    tableNumber: currentTableDisplayName.value,
    customerId: selectedCustomerId.value,
    grandTotal: cartStore.grandTotal,
    savedAt: new Date().toISOString(),
  });
  saveHeldOrdersToStorage();
  cartStore.clearCart();
  toast.success('Buyurtma kutish rejimiga olindi', 'Kutish');
};

const recallHeldOrder = (order: any) => {
  cartStore.clearCart();
  order.items.forEach((item: any) => {
    cartStore.addItem(item, item.quantity);
  });
  if (order.tableNumber) {
    selectedTableNumber.value = order.tableNumber;
  }
  if (order.customerId) {
    selectedCustomerId.value = order.customerId;
  }
  if (order.orderType) {
    orderType.value = order.orderType;
  }
  heldOrders.value = heldOrders.value.filter((o) => o.id !== order.id);
  saveHeldOrdersToStorage();
  isHeldOrdersOpen.value = false;
  toast.success('Buyurtma savatga qaytarildi', 'Kutish');
};

const deleteHeldOrder = (idx: number) => {
  heldOrders.value.splice(idx, 1);
  saveHeldOrdersToStorage();
  toast.info('Kutishdagi buyurtma o\'chirildi');
};

const customerSelectOptions = computed(() => {
  return [
    { value: '', label: '— Mijoz tanlanmagan (Oddiy to\'lov) —' },
    ...customers.value.map((c) => ({
      value: c.id,
      label: `${c.fullName} (${c.phone || 'Tel yo\'q'})`,
      badge: Number(c.debt || 0) > 0 ? `Qarzi: ${formatCurrency(c.debt)}` : undefined,
    })),
  ];
});

const saveNewCustomer = async () => {
  if (!newCustomerForm.value.fullName) {
    toast.warning('Mijoz ismini kiriting!', 'Ogohlantirish');
    return;
  }
  savingCustomer.value = true;
  try {
    const { data } = await api.post('/customers', {
      fullName: newCustomerForm.value.fullName,
      phone: newCustomerForm.value.phone || undefined,
    });
    toast.success(`"${data.fullName}" muvaffaqiyatli saqlandi!`, 'Yangi Mijoz');
    dataStore.invalidate('customers');
    await dataStore.fetchCustomers(true);
    selectedCustomerId.value = data.id;
    isNewCustomerModalOpen.value = false;
    newCustomerForm.value = { fullName: '', phone: '' };
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Mijozni saqlashda xatolik', 'Xatolik');
  } finally {
    savingCustomer.value = false;
  }
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
  if (posSettings.value.allowDineIn) list.push({ key: 'dine_in', label: 'Zalda', icon: '🍽️' });
  if (posSettings.value.allowTakeaway) list.push({ key: 'takeaway', label: 'Saboy', icon: '🥡' });
  if (posSettings.value.allowDelivery) list.push({ key: 'delivery', label: 'Dostavka', icon: '🛵' });
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
  if (selectedPaymentMethod.value === '4') return true;
  if (selectedPaymentMethod.value === '1' && cashReceived.value < cartStore.grandTotal) return true;
  return false;
});

const currentNasiyaAmount = computed(() => {
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
  if (cartStore.items.length === 0) return;
  if (isRestaurant.value && orderType.value === 'dine_in' && !currentTableDisplayName.value) {
    toast.warning('Iltimos, avval qaysi stol band qilinganligini belgilang!', 'Stol belgilanmagan');
    return;
  }
  cashReceived.value = cartStore.grandTotal;
  selectedPaymentMethod.value = '1';
  isCheckoutOpen.value = true;
};

const paymentMethods = ref([
  { id: '1', name: 'Naqd pul', type: 'cash' },
  { id: '2', name: 'Plastik karta', type: 'card' },
  { id: '3', name: 'Click / Payme', type: 'click' },
  { id: '4', name: 'Nasiya (Qarz)', type: 'debt' },
]);
const selectedPaymentMethod = ref('1');

const loadProducts = async () => {
  if (dataStore.products.length === 0) {
    loading.value = true;
  }
  try {
    const promises: Promise<any>[] = [
      dataStore.fetchProducts(),
      dataStore.fetchCategories(),
    ];
    if (isRestaurant.value) {
      promises.push(dataStore.fetchTables());
    }
    await Promise.all(promises);
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
  return (prod.stockQty ?? 0) > 0;
};

const handleProductClick = (product: any) => {
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
  const isDish = isDishItem(product) || product.brand === 'service';
  const existingInCart = cartStore.items.find((i) => (i.productId || i.id) === product.id);
  const currentInCartQty = existingInCart ? existingInCart.quantity : 0;

  // Only check physical stock bounds for tracked goods
  if (!isDish && currentInCartQty + 1 > product.stockQty) {
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
  if (cartStore.items.length === 0) return;

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
    const { data } = await api.post('/orders', {
      orderType: apiOrderType,
      customerId: selectedCustomerId.value || undefined,
      tableNumber: resolvedTableNumber,
      tableName: resolvedTableNumber,
      items: cartStore.items.map((i) => ({
        productId: i.productId || i.id,
        serviceId: i.serviceId,
        quantity: i.quantity,
        unitPrice: i.price,
      })),
      payments: [
        {
          paymentMethodId: selectedPaymentMethod.value,
          amount: actualPaid,
        },
      ],
    });

    data.orderType = isRestaurant.value ? orderType.value : 'pos';
    data.tableNumber = resolvedTableNumber;
    if (selectedCustomer.value) {
      data.customer = selectedCustomer.value;
    }

    // Ensure payment method details exist on completed order
    if (!data.payments || data.payments.length === 0) {
      const pmObj = paymentMethods.value.find((p) => p.id === selectedPaymentMethod.value);
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
      const pmObj = paymentMethods.value.find((p) => p.id === selectedPaymentMethod.value);
      data.payments[0].paymentMethod = {
        name: pmObj?.name || (selectedPaymentMethod.value === '3' ? 'Click / Payme' : 'Naqd pul'),
        type: pmObj?.type || (selectedPaymentMethod.value === '3' ? 'click' : 'cash'),
      };
    }

    completedOrder.value = data;
    isCheckoutOpen.value = false;
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
    await Promise.allSettled([loadProducts(), fetchCurrentShift(), dataStore.fetchCustomers()]);
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
  fetchCurrentShift();
  dataStore.fetchCustomers();
  searchInputRef.value?.focus();
});
</script>
