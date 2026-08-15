<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Ta'minotchilar va Xaridorlar Bazasi</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Mahsulot yetkazib beruvchilar, firmalar va hisob-kitoblar balansi</p>
      </div>

      <div class="flex items-center gap-2">
        <AppButton
          v-if="canCreate('suppliers')"
          variant="primary"
          size="md"
          :icon="Plus"
          @click="openCreateModal"
        >
          Yangi Ta'minotchi Qo'shish
        </AppButton>
      </div>
    </div>

    <!-- Quick Stats Cards -->
    <SupplierStatsCards
      :suppliers-count="suppliers.length"
      :total-supplier-debt="totalSupplierDebt"
      :debtor-suppliers-count="debtorSuppliersCount"
      :settled-suppliers-count="settledSuppliersCount"
    />

    <!-- Filters & Search Bar -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <!-- Search Input -->
      <div class="w-full sm:w-80">
        <AppInput
          v-model="searchQuery"
          placeholder="Ta'minotchi nomi, firma yoki tel..."
          :icon="Search"
        />
      </div>

      <div class="flex items-center gap-2">
        <!-- Filter Tabs -->
        <div class="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
          <button
            type="button"
            @click="activeFilter = 'all'"
            class="px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap btn-interactive"
            :class="activeFilter === 'all' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
          >
            Barchasi ({{ suppliers.length }})
          </button>
          <button
            type="button"
            @click="activeFilter = 'debtors'"
            class="px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 btn-interactive"
            :class="activeFilter === 'debtors' ? 'bg-rose-500 text-white shadow-sm' : 'text-rose-600 dark:text-rose-400 hover:bg-rose-500/10'"
          >
            <AlertCircle class="w-3.5 h-3.5" />
            <span>Qarzdorlar ({{ debtorSuppliersCount }})</span>
          </button>
          <button
            type="button"
            @click="activeFilter = 'clear'"
            class="px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap btn-interactive"
            :class="activeFilter === 'clear' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
          >
            Qarzsiz (Nol)
          </button>
        </div>

        <!-- View Mode Toggle -->
        <AppViewToggle v-model="viewMode" />
      </div>
    </div>

    <!-- Table Skeleton -->
    <SkeletonLoader v-if="loading" variant="table" :rows="6" />

    <!-- 1. Table View -->
    <SupplierTableView
      v-else-if="viewMode === 'table'"
      :suppliers="filteredSuppliers"
      @open-pay="openPayModal"
      @open-history="openHistoryModal"
      @open-statement="openStatementModal"
      @open-edit="openEditModal"
      @delete="confirmDeleteSupplier"
    />

    <!-- 2. Grid/Cards View -->
    <SupplierGridView
      v-else-if="viewMode === 'grid'"
      :suppliers="filteredSuppliers"
      @open-pay="openPayModal"
      @open-history="openHistoryModal"
      @open-statement="openStatementModal"
      @open-edit="openEditModal"
      @delete="confirmDeleteSupplier"
    />

    <!-- Modal 1: Create / Edit Supplier -->
    <SupplierFormModal
      :is-open="isCreateModalOpen"
      :editing-supplier="editingSupplier"
      :form-data="formData"
      :submitting="submitting"
      @close="isCreateModalOpen = false"
      @save="saveSupplier"
    />

    <!-- Modal 2: Pay Supplier -->
    <SupplierPayModal
      :is-open="isPayModalOpen"
      :active-supplier="activeSupplier"
      v-model:pay-amount="payAmount"
      v-model:payment-source="paymentSource"
      v-model:payment-description="paymentDescription"
      :submitting="submitting"
      @close="isPayModalOpen = false"
      @submit="submitPay"
    />

    <!-- Modal 3: Payment History -->
    <SupplierHistoryModal
      :is-open="isHistoryModalOpen"
      :history-supplier="historySupplier"
      :payment-history="paymentHistory"
      :total-paid="totalPaid"
      :loading="historyLoading"
      @close="isHistoryModalOpen = false"
    />

    <!-- Modal 4: Solishtirma Dalolatnoma (Akt Sverka) & Audit -->
    <SupplierStatementModal
      :is-open="isStatementModalOpen"
      :supplier="statementSupplier"
      @close="isStatementModalOpen = false"
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
import { ref, computed, onMounted } from 'vue';
import {
  AlertCircle,
  Search,
  Plus,
} from 'lucide-vue-next';
import AppButton from '../../components/AppButton.vue';
import AppInput from '../../components/AppInput.vue';
import SkeletonLoader from '../../components/SkeletonLoader.vue';
import AppViewToggle from '../../components/AppViewToggle.vue';
import AppConfirmDialog from '../../components/AppConfirmDialog.vue';
import { useDataStore } from '../../stores/data.store';
import { useToast } from '../../composables/useToast';
import { usePersistentViewMode } from '../../composables/usePersistentViewMode';
import { usePermissions } from '../../composables/usePermissions';
import api, { getErrorMessage } from '../../services/api';

import SupplierStatsCards from './components/SupplierStatsCards.vue';
import SupplierTableView from './components/SupplierTableView.vue';
import SupplierGridView from './components/SupplierGridView.vue';
import SupplierFormModal from './components/SupplierFormModal.vue';
import SupplierPayModal from './components/SupplierPayModal.vue';
import SupplierHistoryModal from './components/SupplierHistoryModal.vue';
import SupplierStatementModal from './components/SupplierStatementModal.vue';

const toast = useToast();
const dataStore = useDataStore();
const { canCreate } = usePermissions();

const viewMode = usePersistentViewMode('suppliers', 'table');
const loading = ref(false);
const submitting = ref(false);
const searchQuery = ref('');
const activeFilter = ref<'all' | 'debtors' | 'clear'>('all');

const isCreateModalOpen = ref(false);
const isPayModalOpen = ref(false);
const isHistoryModalOpen = ref(false);
const isStatementModalOpen = ref(false);

const editingSupplier = ref<any>(null);
const activeSupplier = ref<any>(null);
const historySupplier = ref<any>(null);
const statementSupplier = ref<any>(null);

const payAmount = ref<number | null>(null);
const paymentSource = ref<string>('cash');
const paymentDescription = ref<string>('');

const paymentHistory = ref<any[]>([]);
const historyLoading = ref(false);

const formData = ref({
  name: '',
  companyName: '',
  phone: '',
  address: '',
  balance: 0,
  notes: '',
});

const suppliers = computed(() => dataStore.suppliers || []);

const totalSupplierDebt = computed(() => {
  return suppliers.value.reduce((acc, s) => acc + Math.max(0, Number(s.balance || 0)), 0);
});

const debtorSuppliersCount = computed(() => {
  return suppliers.value.filter((s) => Number(s.balance || 0) > 0).length;
});

const settledSuppliersCount = computed(() => {
  return suppliers.value.filter((s) => Number(s.balance || 0) <= 0).length;
});

const filteredSuppliers = computed(() => {
  let list = [...suppliers.value];

  if (activeFilter.value === 'debtors') {
    list = list.filter((s) => Number(s.balance || 0) > 0);
  } else if (activeFilter.value === 'clear') {
    list = list.filter((s) => Number(s.balance || 0) <= 0);
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.companyName?.toLowerCase().includes(q) ||
        s.phone?.includes(q)
    );
  }

  return list;
});

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('uz-UZ').format(Math.round(val)) + " so'm";
};

const fetchSuppliers = async (force = false) => {
  if (suppliers.value.length === 0) {
    loading.value = true;
  }
  try {
    await dataStore.fetchSuppliers(force);
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  editingSupplier.value = null;
  formData.value = {
    name: '',
    companyName: '',
    phone: '',
    address: '',
    balance: 0,
    notes: '',
  };
  isCreateModalOpen.value = true;
};

const openEditModal = (s: any) => {
  editingSupplier.value = s;
  formData.value = {
    name: s.name || '',
    companyName: s.companyName || '',
    phone: s.phone || '',
    address: s.address || '',
    balance: Number(s.balance || 0),
    notes: s.notes || '',
  };
  isCreateModalOpen.value = true;
};

const saveSupplier = async () => {
  if (!formData.value.name.trim()) {
    toast.warning('Mas\'ul shaxs nomini kiriting', 'Ta\'minotchi');
    return;
  }
  submitting.value = true;
  try {
    if (editingSupplier.value) {
      const { data: updated } = await api.put(`/suppliers/${editingSupplier.value.id}`, {
        name: formData.value.name,
        companyName: formData.value.companyName,
        phone: formData.value.phone,
        address: formData.value.address,
        notes: formData.value.notes,
      });
      const idx = dataStore.suppliers.findIndex((s: any) => s.id === editingSupplier.value.id);
      if (idx !== -1) {
        dataStore.suppliers[idx] = { ...dataStore.suppliers[idx], ...formData.value, ...(updated || {}) };
      }
      toast.success('Ta\'minotchi ma\'lumotlari yangilandi!', 'Ta\'minotchi');
    } else {
      const { data: created } = await api.post('/suppliers', formData.value);
      if (created) {
        dataStore.suppliers.unshift(created);
      }
      toast.success('Yangi ta\'minotchi saqlandi!', 'Ta\'minotchi');
    }
    isCreateModalOpen.value = false;
    dataStore.invalidate('suppliers');
    dataStore.fetchSuppliers(true).catch(console.error);
  } catch (err: any) {
    toast.error(getErrorMessage(err, 'Ta\'minotchini saqlashda xatolik yuz berdi'), 'Xatolik');
  } finally {
    submitting.value = false;
  }
};

const openPayModal = (s: any) => {
  activeSupplier.value = s;
  payAmount.value = Number(s.balance || 0);
  paymentSource.value = 'cash';
  paymentDescription.value = '';
  isPayModalOpen.value = true;
};

const openStatementModal = (s: any) => {
  statementSupplier.value = s;
  isStatementModalOpen.value = true;
};

const totalPaid = computed(() => {
  return paymentHistory.value.reduce((acc: number, p: any) => acc + Number(p.amount || 0), 0);
});

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('uz-UZ', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};

const openHistoryModal = async (s: any) => {
  historySupplier.value = s;
  paymentHistory.value = [];
  isHistoryModalOpen.value = true;
  historyLoading.value = true;
  try {
    const res = await api.get(`/suppliers/${s.id}/payments`);
    paymentHistory.value = res.data;
  } catch (err: any) {
    toast.error(getErrorMessage(err, 'To\'lov tarixini yuklashda xatolik'), 'Xatolik');
  } finally {
    historyLoading.value = false;
  }
};

const submitPay = async () => {
  if (!activeSupplier.value || !payAmount.value || payAmount.value <= 0) return;
  const sId = activeSupplier.value.id;
  const amt = Number(payAmount.value);

  // Optimistic update supplier balance
  activeSupplier.value.balance = Math.max(0, (Number(activeSupplier.value.balance) || 0) - amt);
  const targetSup = dataStore.suppliers.find((s: any) => s.id === sId);
  if (targetSup) {
    targetSup.balance = Math.max(0, (Number(targetSup.balance) || 0) - amt);
  }

  isPayModalOpen.value = false;
  toast.success('To\'lov muvaffaqiyatli bajarildi va qayd etildi!', 'To\'lov');

  try {
    await api.post(`/suppliers/${sId}/pay`, {
      amount: amt,
      paymentSource: paymentSource.value,
      description: paymentDescription.value,
    });
    dataStore.invalidate('suppliers');
    dataStore.invalidate('finance');
    dataStore.fetchSuppliers(true).catch(console.error);
  } catch (err: any) {
    toast.error(getErrorMessage(err, 'To\'lovni amalga oshirishda xatolik'), 'Xatolik');
    fetchSuppliers(true);
  }
};

const confirmModal = ref({
  open: false,
  title: '',
  message: '',
  onConfirm: () => {},
});

const confirmDeleteSupplier = (s: any) => {
  confirmModal.value = {
    open: true,
    title: `"${s.name}" ni o'chirishni tasdiqlang`,
    message: `Bu ta'minotchi va unga tegishli barcha to'lov tarixi o'chiriladi. Bu amalni qaytarib bo'lmaydi.`,
    onConfirm: () => deleteSupplier(s.id),
  };
};

const deleteSupplier = async (id: string) => {
  confirmModal.value.open = false;
  // Optimistic removal
  dataStore.suppliers = dataStore.suppliers.filter((s: any) => s.id !== id);
  toast.success('Ta\'minotchi muvaffaqiyatli o\'chirildi!', 'O\'chirish');

  try {
    await api.delete(`/suppliers/${id}`);
    dataStore.invalidate('suppliers');
    dataStore.fetchSuppliers(true).catch(console.error);
  } catch (err: any) {
    toast.error(getErrorMessage(err, 'Ta\'minotchini o\'chirishda xatolik'), 'Xatolik');
    fetchSuppliers(true);
  }
};

onMounted(() => {
  fetchSuppliers();
});
</script>
