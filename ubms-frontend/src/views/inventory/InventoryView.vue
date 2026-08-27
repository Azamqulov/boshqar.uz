<template>
  <div class="space-y-5">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Omborxona Boshqaruvi</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Real-time qoldiqlar, kirim va chiqim operatsiyalari</p>
      </div>

      <div class="flex items-center gap-2">
        <AppButton v-if="canCreate('inventory')" variant="primary" size="md" :icon="ArrowDownLeft" @click="openStockInModal">
          Kirim Qilish
        </AppButton>
        <AppButton v-if="canCreate('inventory')" variant="danger" size="md" :icon="ArrowUpRight" @click="openStockOutModal">
          Chiqim Qilish
        </AppButton>
      </div>
    </div>

    <!-- Top Stat Cards Grid -->
    <InventoryStatsCards
      :total-inventory-value="totalInventoryValue"
      :inventory-count="inventory.length"
      :low-stock-count="lowStockCount"
      :out-of-stock-count="outOfStockCount"
    />

    <!-- Search, Filter Tabs and View Toggle -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <div class="w-full sm:w-80 shrink-0">
        <AppInput
          v-model="searchQuery"
          placeholder="Mahsulot nomi yoki SKU bo'yicha qidiruv..."
          :icon="Search"
        />
      </div>

      <div class="flex items-center gap-2 max-w-full overflow-hidden">
        <!-- Status Filter Tabs -->
        <div class="flex-1 sm:flex-initial flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs overflow-x-auto scrollbar-none">
          <button
            type="button"
            @click="activeStatusFilter = 'all'"
            class="flex-1 sm:flex-initial px-2.5 py-1.5 rounded-lg font-bold transition whitespace-nowrap btn-interactive text-center"
            :class="activeStatusFilter === 'all' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
          >
            Barchasi
          </button>
          <button
            type="button"
            @click="activeStatusFilter = 'low'"
            class="flex-1 sm:flex-initial px-2.5 py-1.5 rounded-lg font-bold transition whitespace-nowrap flex items-center justify-center gap-1 btn-interactive"
            :class="activeStatusFilter === 'low' ? 'bg-amber-500 text-white shadow-sm' : 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'"
          >
            <AlertTriangle class="w-3.5 h-3.5" />
            <span>Kam Qolgan</span>
          </button>
        </div>

        <!-- View Mode Toggle (Hidden on mobile < sm) -->
        <AppViewToggle class="inline-flex shrink-0" v-model="viewMode" />
      </div>
    </div>

    <!-- Inventory Container -->
    <SkeletonLoader v-if="loading" variant="table" :rows="8" />

    <!-- Empty State -->
    <AppEmptyState
      v-else-if="filteredInventory.length === 0"
      :title="searchQuery || activeStatusFilter !== 'all' ? 'Ombor qoldiqlari topilmadi' : 'Omborxona bo\'sh'"
      :description="searchQuery || activeStatusFilter !== 'all' ? 'Qidiruv bo\'yicha hech qanday tovar topilmadi. Qidiruvni tozalang.' : 'Hozircha omborga hech qanday tovar kirim qilinmagan. Birinchi tovaringizni kirim qiling.'"
      :button-text="searchQuery || activeStatusFilter !== 'all' ? '' : 'Kirim qilish'"
      :variant="searchQuery || activeStatusFilter !== 'all' ? 'search' : 'inventory'"
      @action="openStockInModal"
    >
      <template v-if="searchQuery || activeStatusFilter !== 'all'" #action>
        <button
          type="button"
          @click="searchQuery = ''; activeStatusFilter = 'all'"
          class="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition btn-interactive cursor-pointer"
        >
          Filtrlarni tozalash
        </button>
      </template>
    </AppEmptyState>

    <!-- 1. Table View -->
    <InventoryTableView
      v-else-if="viewMode === 'table'"
      :inventory="pagination.paginatedItems.value"
      :can-edit="canEdit('inventory')"
      :can-delete="canDelete('inventory')"
      @edit="openEditModal"
      @delete="confirmDeleteProduct"
    />

    <!-- 2. Grid/Cards View -->
    <InventoryGridView
      v-else-if="viewMode === 'grid'"
      :inventory="pagination.paginatedItems.value"
      :can-edit="canEdit('inventory')"
      :can-delete="canDelete('inventory')"
      @edit="openEditModal"
      @delete="confirmDeleteProduct"
    />

    <!-- Pagination -->
    <AppPagination
      v-if="!loading"
      v-model:current-page="pagination.currentPage.value"
      v-model:page-size="pagination.pageSize.value"
      :total-items="filteredInventory.length"
      item-name="tovar"
    />

    <!-- Stock In Modal -->
    <StockInModal
      :is-open="isStockInOpen"
      :stock-form="stockForm"
      :inventory-in-options="inventoryInOptions"
      :submitting="submitting"
      @close="isStockInOpen = false"
      @submit="submitStockIn"
    />

    <!-- Stock Out Modal -->
    <StockOutModal
      :is-open="isStockOutOpen"
      :stock-out-form="stockOutForm"
      :inventory-out-options="inventoryOutOptions"
      :submitting="submitting"
      @close="isStockOutOpen = false"
      @submit="submitStockOut"
    />

    <!-- Edit Item Modal -->
    <InventoryEditModal
      :is-open="isEditModalOpen"
      :edit-form="editForm"
      :submitting="submitting"
      @close="isEditModalOpen = false"
      @submit="saveEditProduct"
    />

    <!-- Confirm Delete Dialog -->
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
import { ref, computed, onMounted, watch } from 'vue';
import { useFormat } from '../../composables/useFormat';
import { ArrowDownLeft, ArrowUpRight, Search, AlertTriangle } from 'lucide-vue-next';
import SkeletonLoader from '../../components/SkeletonLoader.vue';
import AppInput from '../../components/AppInput.vue';
import AppButton from '../../components/AppButton.vue';
import AppViewToggle from '../../components/AppViewToggle.vue';
import AppConfirmDialog from '../../components/AppConfirmDialog.vue';
import AppPagination from '../../components/AppPagination.vue';
import AppEmptyState from '../../components/AppEmptyState.vue';
import { useDataStore } from '../../stores/data.store';
import { useToast } from '../../composables/useToast';
import { usePermissions } from '../../composables/usePermissions';
import { usePersistentViewMode } from '../../composables/usePersistentViewMode';
import { usePagination } from '../../composables/usePagination';
import api from '../../services/api';

import InventoryStatsCards from './components/InventoryStatsCards.vue';
import InventoryTableView from './components/InventoryTableView.vue';
import InventoryGridView from './components/InventoryGridView.vue';
import StockInModal from './components/StockInModal.vue';
import StockOutModal from './components/StockOutModal.vue';
import InventoryEditModal from './components/InventoryEditModal.vue';

const toast = useToast();
const dataStore = useDataStore();
const { formatCurrency } = useFormat();
const { canCreate, canEdit, canDelete } = usePermissions();

const getErrorMessage = (err: any, defaultMsg: string) => {
  return err.response?.data?.message || err.message || defaultMsg;
};

const viewMode = usePersistentViewMode('inventory', 'table');
const activeStatusFilter = ref<'all' | 'low'>('all');
const loading = ref(dataStore.inventory.length === 0);
const submitting = ref(false);
const searchQuery = ref('');
const inventory = computed(() => dataStore.inventory);
const isStockInOpen = ref(false);
const isStockOutOpen = ref(false);

// Edit & Delete State
const isEditModalOpen = ref(false);
const editingItem = ref<any>(null);
const editForm = ref({
  name: '',
  sku: '',
  purchasePrice: 0,
  quantity: 0,
  minStock: 5,
  unit: 'dona',
  allowDecimal: false,
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

const totalInventoryValue = computed(() => {
  return inventory.value.reduce((acc: number, inv: any) => {
    return acc + ((Number(inv.quantity) || 0) * Number(inv.purchasePrice || inv.product?.purchasePrice || 0));
  }, 0);
});

const lowStockCount = computed(() => {
  return inventory.value.filter((inv: any) => inv.isLowStock || (Number(inv.quantity) <= (inv.product?.minStock || 5))).length;
});

const outOfStockCount = computed(() => {
  return inventory.value.filter((inv: any) => (Number(inv.quantity) || 0) <= 0).length;
});

const stockForm = ref({
  productId: '',
  quantity: 1 as number,
  purchasePrice: 0,
  reason: 'manual',
});

const stockOutForm = ref({
  productId: '',
  quantity: 1 as number,
  reason: 'damage',
});

const inventoryInOptions = computed(() => {
  return inventory.value.map((inv) => {
    const unit = inv.unit || inv.product?.unit?.shortName || inv.product?.unit?.name || inv.product?.unit || 'dona';
    return {
      value: inv.productId || inv.product?.id,
      label: `${inv.productName || inv.product?.name} (${inv.sku || inv.product?.sku || 'SKU yoq'}) - ${unit}`,
      unit,
      allowDecimal: inv.allowDecimal || inv.product?.unit?.allowDecimal || ['kg', 'l', 'g', 'm', 'ml'].includes(unit),
      purchasePrice: Number(inv.purchasePrice || inv.product?.purchasePrice) || 0,
    };
  });
});

const inventoryOutOptions = computed(() => {
  return inventory.value.map((inv) => {
    const unit = inv.unit || inv.product?.unit?.shortName || inv.product?.unit?.name || inv.product?.unit || 'dona';
    return {
      value: inv.productId || inv.product?.id,
      label: `${inv.productName || inv.product?.name} (Qoldiq: ${inv.quantity} ${unit})`,
      unit,
      allowDecimal: inv.allowDecimal || inv.product?.unit?.allowDecimal || ['kg', 'l', 'g', 'm', 'ml'].includes(unit),
    };
  });
});

const filteredInventory = computed(() => {
  let list = [...inventory.value];

  if (activeStatusFilter.value === 'low') {
    list = list.filter((inv: any) => inv.isLowStock || (Number(inv.quantity) <= (inv.product?.minStock || 5)));
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter((inv) => {
      const name = (inv.productName || inv.product?.name || '').toLowerCase();
      const sku = (inv.sku || inv.product?.sku || '').toLowerCase();
      return name.includes(q) || sku.includes(q);
    });
  }

  return list;
});

const pagination = usePagination(filteredInventory);

watch([searchQuery, activeStatusFilter], () => {
  pagination.resetPage();
});

const loadInventory = async (force = false) => {
  if (dataStore.inventory.length === 0) {
    loading.value = true;
  }
  try {
    await dataStore.fetchInventory(force);
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const openStockInModal = () => {
  if (inventory.value.length > 0) {
    stockForm.value.productId = inventory.value[0].productId || inventory.value[0].product?.id;
    stockForm.value.purchasePrice = Number(inventory.value[0].purchasePrice || inventory.value[0].product?.purchasePrice) || 0;
  }
  stockForm.value.quantity = 1;
  isStockInOpen.value = true;
};

const openStockOutModal = () => {
  if (inventory.value.length > 0) {
    stockOutForm.value.productId = inventory.value[0].productId || inventory.value[0].product?.id;
  }
  stockOutForm.value.quantity = 1;
  isStockOutOpen.value = true;
};

const submitStockIn = async () => {
  if (!stockForm.value.productId) {
    toast.warning('Mahsulotni tanlang', 'Omborxona');
    return;
  }
  if (!stockForm.value.quantity || Number(stockForm.value.quantity) <= 0) {
    toast.warning('Miqdorni to\'g\'ri kiriting', 'Omborxona');
    return;
  }

  submitting.value = true;
  try {
    await api.post('/inventory/in', {
      ...stockForm.value,
      quantity: Number(stockForm.value.quantity),
      purchasePrice: Number(stockForm.value.purchasePrice) || 0,
    });
    toast.success('Omborga muvaffaqiyatli kirim qilindi!', 'Omborxona');
    // Optimistic: update quantity in the store immediately
    const inv = inventory.value.find((i: any) => (i.productId || i.product?.id) === stockForm.value.productId);
    if (inv) inv.quantity = Number(inv.quantity || 0) + Number(stockForm.value.quantity);
    isStockInOpen.value = false;
    dataStore.invalidate('products');
    dataStore.invalidate('inventory');
    dataStore.invalidate('dashboard');
    loadInventory(true); // background refresh
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Kirim qilishda xatolik yuz berdi', 'Xatolik');
  } finally {
    submitting.value = false;
  }
};

const submitStockOut = async () => {
  if (!stockOutForm.value.productId) {
    toast.warning('Mahsulotni tanlang', 'Omborxona');
    return;
  }
  if (!stockOutForm.value.quantity || Number(stockOutForm.value.quantity) <= 0) {
    toast.warning('Miqdorni to\'g\'ri kiriting', 'Omborxona');
    return;
  }

  submitting.value = true;
  try {
    await api.post('/inventory/out', {
      ...stockOutForm.value,
      quantity: Number(stockOutForm.value.quantity),
    });
    toast.success('Ombordan muvaffaqiyatli chiqim qilindi!', 'Omborxona');
    // Optimistic: reduce quantity in store immediately
    const inv = inventory.value.find((i: any) => (i.productId || i.product?.id) === stockOutForm.value.productId);
    if (inv) inv.quantity = Math.max(0, Number(inv.quantity || 0) - Number(stockOutForm.value.quantity));
    isStockOutOpen.value = false;
    dataStore.invalidate('products');
    dataStore.invalidate('inventory');
    dataStore.invalidate('dashboard');
    loadInventory(true); // background refresh
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Chiqim qilishda xatolik yuz berdi', 'Xatolik');
  } finally {
    submitting.value = false;
  }
};

const openEditModal = (inv: any) => {
  editingItem.value = inv;
  const unit = inv.unit || inv.product?.unit?.shortName || inv.product?.unit?.name || inv.product?.unit || 'dona';
  editForm.value = {
    name: inv.productName || inv.product?.name || '',
    sku: inv.sku || inv.product?.sku || '',
    purchasePrice: Number(inv.purchasePrice || inv.product?.purchasePrice) || 0,
    quantity: Number(inv.quantity) || 0,
    minStock: Number(inv.product?.minStock) || 5,
    unit: unit,
    allowDecimal: inv.allowDecimal || inv.product?.unit?.allowDecimal || ['kg', 'l', 'g', 'm', 'ml'].includes(unit.toLowerCase()),
  };
  isEditModalOpen.value = true;
};

const saveEditProduct = async () => {
  if (!editingItem.value) return;
  const productId = editingItem.value.productId || editingItem.value.product?.id || editingItem.value.id;
  if (!editForm.value.name.trim()) {
    toast.warning('Mahsulot nomini kiriting', 'Tahrirlash');
    return;
  }

  submitting.value = true;
  try {
    const payload = {
      name: editForm.value.name.trim(),
      sku: editForm.value.sku || undefined,
      purchasePrice: Number(editForm.value.purchasePrice) || 0,
      initialStock: Number(editForm.value.quantity) || 0,
      minStockLevel: Number(editForm.value.minStock) || 0,
    };

    if (productId) {
      await api.put(`/products/${productId}`, payload);
    }

    // Optimistic update local item
    editingItem.value.productName = editForm.value.name;
    if (editingItem.value.product) {
      editingItem.value.product.name = editForm.value.name;
      editingItem.value.product.sku = editForm.value.sku;
      editingItem.value.product.purchasePrice = editForm.value.purchasePrice;
    }
    editingItem.value.quantity = Number(editForm.value.quantity);
    editingItem.value.purchasePrice = editForm.value.purchasePrice;

    toast.success(`"${editForm.value.name}" muvaffaqiyatli saqlandi!`, 'Omborxona');
    isEditModalOpen.value = false;

    dataStore.invalidate('products');
    dataStore.invalidate('inventory');
    dataStore.invalidate('dashboard');
    dataStore.fetchInventory(true).catch(console.error);
  } catch (err: any) {
    toast.error(getErrorMessage(err, 'Mahsulotni saqlashda xatolik yuz berdi'), 'Xatolik');
  } finally {
    submitting.value = false;
  }
};

const confirmDeleteProduct = (inv: any) => {
  const name = inv.productName || inv.product?.name || 'ushbu mahsulot';
  const productId = inv.productId || inv.product?.id || inv.id;

  confirmModal.value = {
    open: true,
    title: 'Mahsulotni O\'chirish',
    message: `Rostdan ham "${name}" mahsulotini ombordan va katalogdan o'chirmoqchimisiz? Ushbu amalni ortga qaytarib bo'lmaydi.`,
    onConfirm: async () => {
      confirmModal.value.open = false;
      // Optimistic remove from local list & store immediately
      dataStore.inventory = dataStore.inventory.filter((i: any) => (i.productId || i.product?.id || i.id) !== productId);
      dataStore.products = dataStore.products.filter((p: any) => p.id !== productId);
      toast.success(`"${name}" muvaffaqiyatli o'chirildi`, 'Omborxona');

      try {
        if (productId) {
          await api.delete(`/products/${productId}`);
        }
        dataStore.invalidate('products');
        dataStore.invalidate('inventory');
        dataStore.invalidate('dashboard');
        dataStore.fetchInventory(true).catch(console.error);
      } catch (err: any) {
        toast.error(getErrorMessage(err, 'Mahsulotni o\'chirishda xatolik yuz berdi'), 'Xatolik');
        loadInventory(true);
      }
    },
  };
};

onMounted(() => {
  loadInventory();
});
</script>
