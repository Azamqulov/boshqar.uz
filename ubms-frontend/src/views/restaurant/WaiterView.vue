<template>
  <div class="h-[calc(100vh-5.5rem)] flex flex-col space-y-4 overflow-hidden">
    <!-- Top Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 py-1">
      <div class="flex items-center gap-3">
        <div class="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20">
          <UtensilsCrossed class="w-6 h-6" />
        </div>
        <div>
          <h1 class="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Ofitsiant & Stollar Boshqaruvi
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400">Stolni tanlang, taomlarni qo'shing va bir tugma bilan oshxonaga yuboring</p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <!-- Shift Controls in WaiterView (Only when shift is open) -->
        <div v-if="currentShift" class="flex items-center gap-1.5">
          <button
            type="button"
            @click="openShiftModal('report')"
            class="px-2.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition btn-interactive border border-slate-200 dark:border-slate-700"
          >
            <Receipt class="w-3.5 h-3.5" />
            <span>Z-Hisobot</span>
          </button>
          <button
            type="button"
            @click="openShiftModal('close')"
            class="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center gap-1.5 transition btn-interactive border border-rose-500/20"
          >
            <Moon class="w-3.5 h-3.5" />
            <span>Yopish</span>
          </button>
        </div>

        <button
          v-if="selectedTable"
          @click="selectedTable = null"
          class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition border border-slate-200 dark:border-slate-700"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>Stollar Xaritasiga Qaytish</span>
        </button>

        <button
          v-else
          @click="openCreateTableModal"
          class="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-xs font-bold transition shadow-lg shadow-emerald-500/25 btn-interactive"
        >
          <Plus class="w-4 h-4" />
          <span>Yangi Stol Qo'shish</span>
        </button>

        <button
          @click="loadTables(true)"
          :disabled="loading"
          class="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition border border-slate-200 dark:border-slate-700"
          title="Yangilash"
        >
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
        </button>
      </div>
    </div>

    <!-- Closed Shift Warning Banner in WaiterView -->
    <div
      v-if="!currentShift"
      class="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0"
    >
      <div class="flex items-center gap-2.5">
        <div class="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
          <Lock class="w-5 h-5" />
        </div>
        <div>
          <h4 class="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
            <span>Kassa Smenasi Ochilmagan</span>
            <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300">Stollar bloklangan</span>
          </h4>
          <p class="text-slate-500 dark:text-slate-400 mt-0.5">
            Stollarni band qilish, buyurtma qabul qilish va to'lov olish uchun avval kassa smenasini oching.
          </p>
        </div>
      </div>
      <button
        type="button"
        @click="openShiftModal('open')"
        class="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black text-xs shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-1.5 btn-interactive"
      >
        <Sun class="w-4 h-4" />
        <span>Smenani Ochish</span>
      </button>
    </div>

    <!-- MAIN VIEW 1: STOLLAR XARITASI (TABLES MAP) -->
    <div v-if="!selectedTable" class="flex-1 flex flex-col space-y-4 overflow-hidden">
      <!-- 1. KPI Status Cards -->
      <WaiterTableStats
        :tables-count="tables.length"
        :free-tables-count="freeTablesCount"
        :occupied-tables-count="occupiedTablesCount"
        :total-capacity="totalCapacity"
      />

      <!-- 2. Tables Grid & Search -->
      <WaiterTableGrid
        v-model:status-filter="statusFilter"
        v-model:table-search="tableSearch"
        :tables="tables"
        :free-tables-count="freeTablesCount"
        :occupied-tables-count="occupiedTablesCount"
        :filtered-tables="filteredTables"
        :loading="loading"
        @select-table="selectTable"
        @open-create-table="openCreateTableModal"
        @edit-table="openEditTableModal"
        @delete-table="confirmDeleteTable"
      />
    </div>

    <!-- MAIN VIEW 2: STOL BUYURTMA OLISH OYNASI (WAITER POS) -->
    <WaiterOrderScreen
      v-else
      v-model:menu-search="menuSearch"
      v-model:selected-category="selectedCategory"
      :categories="categories"
      :filtered-menu="filteredMenu"
      :selected-table="selectedTable"
      :existing-items="existingItems"
      :new-items="newItems"
      :order-total-sum="orderTotalSum"
      :sending="sending"
      :paying-table="payingTable"
      @add-dish="addDishToTable"
      @increase-new-item="$event.quantity++"
      @decrease-new-item="$event.quantity > 1 ? $event.quantity-- : newItems = newItems.filter(i => i.product.id !== $event.product.id)"
      @send-to-kitchen="sendToKitchen"
      @open-pre-bill="openPreBillModal"
      @open-pay-modal="openTablePayModal"
    />

    <!-- PRE-BILL MODAL COMPONENT -->
    <WaiterPreBillModal
      :is-open="showPreBillModal"
      :selected-table="selectedTable"
      :pre-bill-data="preBillData"
      :format-currency="formatCurrency"
      @close="showPreBillModal = false"
      @print="printReceipt"
    />

    <!-- TABLE CREATE / EDIT MODAL -->
    <WaiterTableModal
      :is-open="isTableModalOpen"
      :editing-table-id="editingTableId"
      :table-form="tableForm"
      :saving-table="savingTable"
      @close="isTableModalOpen = false"
      @apply-preset="applyTablePreset"
      @save="saveTable"
    />

    <!-- TABLE PAY / CLOSE BILL MODAL -->
    <WaiterPaymentModal
      :is-open="showTablePayModal"
      :selected-table="selectedTable"
      :order-total-sum="orderTotalSum"
      v-model:table-payment-method="tablePaymentMethod"
      v-model:selected-customer-id="selectedCustomerId"
      :selected-customer-obj="selectedCustomerObj"
      :customer-select-options="customerSelectOptions"
      :nasiya-calc-amount="nasiyaCalcAmount"
      v-model:table-cash-received="tableCashReceived"
      :quick-cash-presets="quickCashPresets"
      :paying-table="payingTable"
      @close="showTablePayModal = false"
      @open-new-customer="isNewCustomerModalOpen = true"
      @pay-and-close="handlePayAndCloseTable"
    />

    <!-- QUICK NEW CUSTOMER MODAL -->
    <POSQuickCustomerModal
      :is-open="isNewCustomerModalOpen"
      :new-customer-form="newCustomerForm"
      :saving-customer="savingCustomer"
      @close="isNewCustomerModalOpen = false"
      @save="saveNewCustomer"
    />

    <!-- Final Receipt Modal (Official check) -->
    <ReceiptModal
      v-if="completedTableOrder"
      :order="completedTableOrder"
      @close="completedTableOrder = null"
    />

    <!-- Shift Modal -->
    <ShiftModal
      :is-open="shiftModal.open"
      :mode="shiftModal.mode"
      :shift-data="currentShift"
      @close="shiftModal.open = false"
      @shift-opened="onShiftOpened"
      @shift-closed="onShiftClosed"
    />

    <!-- Delete Confirmation Modal -->
    <AppConfirmDialog
      :open="confirmModal.open"
      :title="confirmModal.title"
      :message="confirmModal.message"
      variant="danger"
      confirm-text="Ha, o'chirish"
      @confirm="confirmModal.onConfirm"
      @cancel="confirmModal.open = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../services/api';
import { useFormat } from '../../composables/useFormat';
import {
  UtensilsCrossed,
  RefreshCw,
  ArrowLeft,
  Receipt,
  Plus,
  Moon,
  Sun,
  Lock,
} from 'lucide-vue-next';

import AppConfirmDialog from '../../components/AppConfirmDialog.vue';
import ReceiptModal from '../../components/ReceiptModal.vue';
import ShiftModal from '../../components/ShiftModal.vue';
import { useToast } from '../../composables/useToast';
import { useDataStore } from '../../stores/data.store';
import { useShiftStore } from '../../stores/shift.store';

import WaiterTableStats from './components/WaiterTableStats.vue';
import WaiterTableGrid from './components/WaiterTableGrid.vue';
import WaiterOrderScreen from './components/WaiterOrderScreen.vue';
import WaiterTableModal from './components/WaiterTableModal.vue';
import WaiterPaymentModal from './components/WaiterPaymentModal.vue';
import WaiterPreBillModal from './components/WaiterPreBillModal.vue';
import POSQuickCustomerModal from '../pos/components/POSQuickCustomerModal.vue';

const router = useRouter();
const toast = useToast();
const dataStore = useDataStore();
const shiftStore = useShiftStore();
const { formatCurrency, formatDateTime } = useFormat();

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
  toast.success('Kassa smenasi muvaffaqiyatli ochildi! Endi stollarni band qilishingiz mumkin.', 'Smena Ochildi');
};

const onShiftClosed = () => {
  shiftStore.currentShift = null;
  shiftModal.value.open = false;
  selectedTable.value = null;
  toast.info('Kassa smenasi yopildi.', 'Smena Yopildi');
};

const loading = ref(dataStore.tables.length === 0);
const sending = ref(false);
const savingTable = ref(false);
const tables = computed(() => dataStore.tables);
const categories = computed(() => dataStore.categories);
const products = computed(() => dataStore.products);
const customers = computed(() => dataStore.customers || []);

const selectedTable = ref<any>(null);
const selectedCategory = ref('');
const menuSearch = ref('');
const tableSearch = ref('');
const statusFilter = ref<'all' | 'available' | 'occupied'>('all');

const newItems = ref<any[]>([]);
const existingItems = ref<any[]>([]);

const showPreBillModal = ref(false);
const preBillData = ref<any>(null);

// Table Pay state & Customer / Nasiya
const showTablePayModal = ref(false);
const tablePaymentMethod = ref('1');
const tableCashReceived = ref<number>(0);
const payingTable = ref(false);
const completedTableOrder = ref<any | null>(null);

const selectedCustomerId = ref('');
const selectedCustomerObj = computed(() => customers.value.find(c => c.id === selectedCustomerId.value));
const isNewCustomerModalOpen = ref(false);
const newCustomerForm = ref({ fullName: '', phone: '' });
const savingCustomer = ref(false);

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

const nasiyaCalcAmount = computed(() => {
  if (!selectedCustomerId.value) return 0;
  const cash = tableCashReceived.value || 0;
  return Math.max(0, orderTotalSum.value - cash);
});

// Table Modal & Form state
const isTableModalOpen = ref(false);
const editingTableId = ref<string | null>(null);
const tableForm = ref({
  name: '',
  capacity: 4,
});

const confirmModal = ref<{
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => Promise<void> | void;
}>({
  open: false,
  title: 'Tasdiqlash',
  message: '',
  onConfirm: () => {},
});

// KPI Computeds
const freeTablesCount = computed(() => {
  return tables.value.filter((t) => t.status !== 'occupied').length;
});

const occupiedTablesCount = computed(() => {
  return tables.value.filter((t) => t.status === 'occupied').length;
});

const totalCapacity = computed(() => {
  return tables.value.reduce((sum, t) => sum + (Number(t.capacity) || 4), 0);
});

// Filtered Tables
const filteredTables = computed(() => {
  return tables.value.filter((t) => {
    // Status filter
    if (statusFilter.value === 'available' && t.status === 'occupied') return false;
    if (statusFilter.value === 'occupied' && t.status !== 'occupied') return false;

    // Search filter
    if (tableSearch.value) {
      return t.name.toLowerCase().includes(tableSearch.value.toLowerCase());
    }
    return true;
  });
});

const loadTables = async (force = false) => {
  if (dataStore.tables.length === 0) {
    loading.value = true;
  }
  try {
    await dataStore.fetchTables(force);
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const loadMenu = async () => {
  try {
    await Promise.all([
      dataStore.fetchCategories(),
      dataStore.fetchProducts(),
    ]);
  } catch (err) {
    console.error(err);
  }
};

const filteredMenu = computed(() => {
  return products.value.filter((p) => {
    if (p.status === 'inactive') return false;
    const matchSearch = !menuSearch.value || p.name.toLowerCase().includes(menuSearch.value.toLowerCase());
    const matchCat = !selectedCategory.value || p.categoryId === selectedCategory.value;
    return matchSearch && matchCat;
  });
});

// Table CRUD Handlers
const openCreateTableModal = () => {
  editingTableId.value = null;
  tableForm.value = {
    name: `Stol #${tables.value.length + 1}`,
    capacity: 4,
  };
  isTableModalOpen.value = true;
};

const openEditTableModal = (table: any) => {
  editingTableId.value = table.id;
  tableForm.value = {
    name: table.name,
    capacity: table.capacity || 4,
  };
  isTableModalOpen.value = true;
};

const applyTablePreset = (prefix: string) => {
  const count = tables.value.filter((t) => t.name.startsWith(prefix)).length + 1;
  tableForm.value.name = `${prefix} #${count}`;
};

const saveTable = async () => {
  if (!tableForm.value.name) {
    toast.warning('Stol nomini kiriting!', 'Ogohlantirish');
    return;
  }

  savingTable.value = true;
  try {
    if (editingTableId.value) {
      await api.patch(`/restaurant/tables/${editingTableId.value}`, {
        name: tableForm.value.name,
        capacity: Number(tableForm.value.capacity) || 4,
      });
      toast.success(`"${tableForm.value.name}" muvaffaqiyatli yangilandi!`, 'Stollar');
    } else {
      await api.post('/restaurant/tables', {
        name: tableForm.value.name,
        capacity: Number(tableForm.value.capacity) || 4,
      });
      toast.success(`Yangi "${tableForm.value.name}" muvaffaqiyatli qo'shildi!`, 'Stollar');
    }

    isTableModalOpen.value = false;
    dataStore.invalidate('tables');
    await loadTables(true);
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Stolni saqlashda xatolik', 'Xatolik');
  } finally {
    savingTable.value = false;
  }
};

const confirmDeleteTable = (table: any) => {
  confirmModal.value = {
    open: true,
    title: 'Stolni o\'chirish',
    message: `Haqiqatan ham "${table.name}" stolini tizimdan o'chirmoqchimisiz?`,
    onConfirm: async () => {
      try {
        await api.delete(`/restaurant/tables/${table.id}`);
        toast.success(`"${table.name}" o'chirildi!`, 'O\'chirildi');
        confirmModal.value.open = false;
        dataStore.invalidate('tables');
        await loadTables(true);
      } catch (err: any) {
        toast.error(err.response?.data?.message || err.message || 'Stolni o\'chirishda xatolik', 'Xatolik');
      }
    },
  };
};

const selectTable = (table: any) => {
  if (!shiftStore.currentShift) {
    toast.warning('Stolni band qilish yoki buyurtma kiritish uchun avval Kassa Smenasini oching!', 'Smena Yopiq');
    openShiftModal('open');
    return;
  }
  selectedTable.value = table;
  newItems.value = [];
  existingItems.value = table.orders?.[0]?.items || [];
};

const addDishToTable = (prod: any) => {
  if (!shiftStore.currentShift) {
    toast.warning('Taom qo\'shish uchun avval Kassa Smenasini oching!', 'Smena Yopiq');
    openShiftModal('open');
    return;
  }
  const existing = newItems.value.find((i) => i.product.id === prod.id);
  if (existing) {
    existing.quantity++;
  } else {
    newItems.value.push({
      product: prod,
      quantity: 1,
    });
  }
  toast.info(`"${prod.name}" stol buyurtmasiga qo'shildi`, selectedTable.value.name);
};

const orderTotalSum = computed(() => {
  const newSum = newItems.value.reduce((sum, i) => sum + i.product.salePrice * i.quantity, 0);
  const existingSum = existingItems.value.reduce((sum, i) => sum + Number(i.total), 0);
  return newSum + existingSum;
});

const sendToKitchen = async () => {
  if (!shiftStore.currentShift) {
    toast.warning('Buyurtmani oshxonaga yuborish uchun avval smenani oching!', 'Smena Yopiq');
    openShiftModal('open');
    return;
  }
  if (!selectedTable.value || newItems.value.length === 0) return;

  sending.value = true;
  try {
    const payload = {
      items: newItems.value.map((i) => ({
        productId: i.product.id,
        quantity: i.quantity,
      })),
    };

    const { data } = await api.post(`/restaurant/tables/${selectedTable.value.id}/order`, payload);
    newItems.value = [];
    existingItems.value = data.items || [];
    selectedTable.value.status = 'occupied';
    dataStore.invalidate('tables');
    await loadTables(true);
    toast.success('Buyurtma oshxonaga (KDS) muvaffaqiyatli yuborildi!', selectedTable.value.name);
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Buyurtmani oshxonaga yuborishda xatolik yuz berdi', 'Xatolik');
  } finally {
    sending.value = false;
  }
};

const openPreBillModal = async () => {
  if (!selectedTable.value) return;
  try {
    const { data } = await api.get(`/restaurant/tables/${selectedTable.value.id}/pre-bill`);
    preBillData.value = data;
    showPreBillModal.value = true;
    toast.info('Pre-chek hisobi shakllantirildi', 'Oraliq hisob');
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Pre-chek ma\'lumotlarini yuklashda xatolik', 'Xatolik');
  }
};

const printReceipt = () => {
  window.print();
};

const quickCashPresets = computed(() => {
  const total = orderTotalSum.value;
  if (total <= 0) return [50000, 100000, 200000];
  const presets: number[] = [];
  const candidateBills = [50000, 100000, 200000, 500000];
  for (const b of candidateBills) {
    if (b > total && presets.length < 3) {
      presets.push(b);
    }
  }
  if (presets.length === 0) {
    const nextRound = Math.ceil(total / 50000) * 50000;
    presets.push(nextRound, nextRound + 50000);
  }
  return presets;
});

const openTablePayModal = () => {
  if (!shiftStore.currentShift) {
    toast.warning('Hisobni yopish uchun avval kassa smenasini oching!', 'Smena Yopiq');
    openShiftModal('open');
    return;
  }
  tableCashReceived.value = orderTotalSum.value;
  showTablePayModal.value = true;
};

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

const handlePayAndCloseTable = async () => {
  if (!selectedTable.value || orderTotalSum.value <= 0) return;

  payingTable.value = true;
  try {
    // If customer selected, allow partial paid / nasiya. Otherwise full paid.
    const actualPaid = tablePaymentMethod.value === '1'
      ? (selectedCustomerId.value ? Math.min(tableCashReceived.value || 0, orderTotalSum.value) : orderTotalSum.value)
      : orderTotalSum.value;

    let completedOrderData: any = null;
    const existingOrderId = selectedTable.value.orders?.[0]?.id;

    if (existingOrderId) {
      // 1. If there are new items, send them first
      if (newItems.value.length > 0) {
        await api.post(`/restaurant/tables/${selectedTable.value.id}/order`, {
          items: newItems.value.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity,
          })),
        }).catch(() => {});
        newItems.value = [];
      }

      // Attach customer if selected
      if (selectedCustomerId.value) {
        await api.patch(`/orders/${existingOrderId}`, { customerId: selectedCustomerId.value }).catch(() => {});
      }

      // 2. Complete active order via /orders/:id/complete
      const { data } = await api.post(`/orders/${existingOrderId}/complete`, {
        payments: [
          {
            paymentMethodId: tablePaymentMethod.value,
            amount: actualPaid,
          },
        ],
      });
      completedOrderData = data;
    } else {
      // Direct create & complete via /orders
      const orderItems = [
        ...existingItems.value.map((i: any) => ({
          productId: i.productId || i.product?.id,
          quantity: i.quantity,
          unitPrice: Number(i.unitPrice || i.price),
        })),
        ...newItems.value.map((i: any) => ({
          productId: i.product?.id,
          quantity: i.quantity,
          unitPrice: Number(i.product?.salePrice),
        })),
      ];

      const { data } = await api.post('/orders', {
        orderType: 'restaurant',
        customerId: selectedCustomerId.value || undefined,
        tableId: selectedTable.value.id,
        tableName: selectedTable.value.name,
        tableNumber: selectedTable.value.name,
        items: orderItems,
        payments: [
          {
            paymentMethodId: tablePaymentMethod.value,
            amount: actualPaid,
          },
        ],
      });
      completedOrderData = data;
    }

    // Free table status
    await api.patch(`/restaurant/tables/${selectedTable.value.id}/status`, { status: 'available' }).catch(() => {});

    completedOrderData.orderType = 'restaurant';
    completedOrderData.tableNumber = selectedTable.value.name;
    if (selectedCustomerObj.value) {
      completedOrderData.customer = selectedCustomerObj.value;
    }

    completedTableOrder.value = completedOrderData;
    showTablePayModal.value = false;
    showPreBillModal.value = false;

    // 3. Record in active shift
    if (actualPaid > 0) {
      shiftStore.recordSale(
        actualPaid,
        tablePaymentMethod.value === '1' ? 'cash' : (tablePaymentMethod.value === '2' ? 'card' : 'other')
      );
    }

    if (selectedCustomerId.value && nasiyaCalcAmount.value > 0) {
      toast.info(
        `"${selectedTable.value.name}" hisobi yopildi. Qolgan ${formatCurrency(nasiyaCalcAmount.value)} "${selectedCustomerObj.value?.fullName}" nomiga nasiya qilib yozildi!`,
        'Nasiyaga Yopildi'
      );
      dataStore.invalidate('customers');
    } else {
      toast.success(`"${selectedTable.value.name}" hisobi muvaffaqiyatli yopildi!`, 'Hisob Yopildi');
    }

    // 4. Refresh table list and clear selection
    dataStore.invalidate('tables');
    await loadTables(true);
    selectedTable.value = null;
    newItems.value = [];
    existingItems.value = [];
    selectedCustomerId.value = '';
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Hisobni yopishda xatolik', 'Xatolik');
  } finally {
    payingTable.value = false;
  }
};

const redirectToCheckout = () => {
  router.push('/pos');
};

onMounted(() => {
  loadTables();
  loadMenu();
  dataStore.fetchCustomers();
  shiftStore.fetchCurrentShift();
});
</script>
