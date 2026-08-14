<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Mijozlar Bazasi (CRM)</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Mijozlar tarixi, xaridlar statistikasi va Nasiya / Qarz daftari</p>
      </div>

      <div class="flex items-center gap-2">
        <AppButton
          variant="primary"
          size="md"
          :icon="Plus"
          @click="openCreateModal"
        >
          Yangi Mijoz Qo'shish
        </AppButton>
      </div>
    </div>

    <!-- Quick Stats Cards (Debt & Customers Overview) -->
    <CustomerStatsCards
      :customers-count="customers.length"
      :total-debt-amount="totalDebtAmount"
      :debtor-customers-count="debtorCustomersCount"
      :total-customers-spent="totalCustomersSpent"
    />

    <!-- Filters & Search Bar -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <!-- Search Input -->
      <div class="w-full sm:w-80">
        <AppInput
          v-model="searchQuery"
          placeholder="Mijoz ismi yoki telefon raqami..."
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
            Barchasi ({{ customers.length }})
          </button>
          <button
            type="button"
            @click="activeFilter = 'debtors'"
            class="px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 btn-interactive"
            :class="activeFilter === 'debtors' ? 'bg-rose-500 text-white shadow-sm' : 'text-rose-600 dark:text-rose-400 hover:bg-rose-500/10'"
          >
            <AlertCircle class="w-3.5 h-3.5" />
            <span>Qarzdorlar ({{ debtorCustomersCount }})</span>
          </button>
          <button
            type="button"
            @click="activeFilter = 'clear'"
            class="px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap btn-interactive"
            :class="activeFilter === 'clear' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
          >
            Qarzsiz
          </button>
        </div>

        <!-- View Mode Toggle -->
        <AppViewToggle v-model="viewMode" />
      </div>
    </div>

    <!-- Customer Table Skeleton -->
    <SkeletonLoader v-if="loading" variant="table" :rows="6" />

    <!-- 1. Table View -->
    <CustomerTableView
      v-else-if="viewMode === 'table'"
      :customers="filteredCustomers"
      @open-add-debt="openAddDebtModal"
      @open-pay-debt="openPayDebtModal"
      @open-history="openHistoryModal"
      @open-edit="openEditModal"
      @delete="confirmDeleteCustomer"
    />

    <!-- 2. Grid/Cards View -->
    <CustomerGridView
      v-else-if="viewMode === 'grid'"
      :customers="filteredCustomers"
      @open-pay-debt="openPayDebtModal"
      @open-history="openHistoryModal"
      @open-edit="openEditModal"
    />

    <!-- 1. Create / Edit Customer Modal -->
    <CustomerFormModal
      :is-open="isCustomerModalOpen"
      :editing-customer-id="editingCustomerId"
      :customer-form="customerForm"
      :submitting="submitting"
      @close="isCustomerModalOpen = false"
      @save="saveCustomer"
    />

    <!-- 2. Debt Modals (Add Debt & Pay Debt) -->
    <CustomerDebtModal
      :is-add-debt-open="isAddDebtModalOpen"
      :is-pay-debt-open="isPayDebtModalOpen"
      :active-customer="activeCustomer"
      v-model:debt-add-amount="debtAddAmount"
      v-model:debt-add-notes="debtAddNotes"
      v-model:debt-pay-amount="debtPayAmount"
      v-model:debt-pay-notes="debtPayNotes"
      :submitting="submitting"
      @close-add-debt="isAddDebtModalOpen = false"
      @close-pay-debt="isPayDebtModalOpen = false"
      @submit-add-debt="submitAddDebt"
      @submit-pay-debt="submitPayDebt"
    />

    <!-- 3. Customer History & Debt Journal Modal -->
    <CustomerHistoryModal
      :is-open="isHistoryModalOpen"
      :active-customer="activeCustomer"
      :orders="customerOrders"
      :loading="customerOrdersLoading"
      @close="isHistoryModalOpen = false"
    />

    <!-- Delete Confirmation Dialog -->
    <AppConfirmDialog
      :open="isDeleteDialogOpen"
      title="Mijozni o'chirish"
      :message="customerToDelete ? `'${customerToDelete.fullName}' mijozini tizimdan o'chirishni tasdiqlaysizmi? Barcha qarz va xarid tarixlari saqlanadi.` : ''"
      confirm-text="Ha, o'chirish"
      cancel-text="Bekor qilish"
      variant="danger"
      @confirm="executeDeleteCustomer"
      @cancel="isDeleteDialogOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../services/api';
import { useFormat } from '../../composables/useFormat';
import {
  Plus,
  Search,
  AlertCircle,
} from 'lucide-vue-next';
import SkeletonLoader from '../../components/SkeletonLoader.vue';
import AppButton from '../../components/AppButton.vue';
import AppInput from '../../components/AppInput.vue';
import AppViewToggle from '../../components/AppViewToggle.vue';
import AppConfirmDialog from '../../components/AppConfirmDialog.vue';
import { useDataStore } from '../../stores/data.store';
import { useToast } from '../../composables/useToast';
import { cleanUzbekPhone } from '../../composables/usePhoneMask';
import { usePersistentViewMode } from '../../composables/usePersistentViewMode';

import CustomerStatsCards from './components/CustomerStatsCards.vue';
import CustomerTableView from './components/CustomerTableView.vue';
import CustomerGridView from './components/CustomerGridView.vue';
import CustomerFormModal from './components/CustomerFormModal.vue';
import CustomerDebtModal from './components/CustomerDebtModal.vue';
import CustomerHistoryModal from './components/CustomerHistoryModal.vue';

const toast = useToast();
const dataStore = useDataStore();
const { formatCurrency, formatDate } = useFormat();

const viewMode = usePersistentViewMode('customers', 'table');
const loading = ref(false);
const submitting = ref(false);
const searchQuery = ref('');
const activeFilter = ref<'all' | 'debtors' | 'clear'>('all');
const customers = computed(() => dataStore.customers || []);

// Customer Form (Create/Edit)
const isCustomerModalOpen = ref(false);
const editingCustomerId = ref<string | null>(null);
const customerForm = ref({
  fullName: '',
  phone: '+998 ',
  notes: '',
  debt: 0,
});

// Add Debt State
const isAddDebtModalOpen = ref(false);
const debtAddAmount = ref<number>(0);
const debtAddNotes = ref('');

// Pay Debt State
const isPayDebtModalOpen = ref(false);
const debtPayAmount = ref<number>(0);
const debtPayNotes = ref('');

// History Modal State
const isHistoryModalOpen = ref(false);
const activeCustomer = ref<any | null>(null);
const customerOrders = ref<any[]>([]);
const customerOrdersLoading = ref(false);

// KPI Computations
const totalDebtAmount = computed(() => {
  return customers.value.reduce((sum, c) => sum + Number(c.debt || 0), 0);
});

const debtorCustomersCount = computed(() => {
  return customers.value.filter((c) => Number(c.debt || 0) > 0).length;
});

const totalCustomersSpent = computed(() => {
  return customers.value.reduce((sum, c) => sum + Number(c.totalSpent || 0), 0);
});

// Filtered List
const filteredCustomers = computed(() => {
  let list = customers.value;

  if (activeFilter.value === 'debtors') {
    list = list.filter((c) => Number(c.debt || 0) > 0);
  } else if (activeFilter.value === 'clear') {
    list = list.filter((c) => Number(c.debt || 0) <= 0);
  }

  if (!searchQuery.value.trim()) return list;
  const q = searchQuery.value.toLowerCase().trim();
  return list.filter((c) => {
    return c.fullName.toLowerCase().includes(q) || (c.phone && c.phone.includes(q));
  });
});

const loadCustomers = async (force = false) => {
  if (dataStore.customers.length === 0) {
    loading.value = true;
  }
  try {
    await dataStore.fetchCustomers(force);
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// 1. Create / Edit handlers
const openCreateModal = () => {
  editingCustomerId.value = null;
  customerForm.value = {
    fullName: '',
    phone: '+998 ',
    notes: '',
    debt: 0,
  };
  isCustomerModalOpen.value = true;
};

const openEditModal = (c: any) => {
  editingCustomerId.value = c.id;
  customerForm.value = {
    fullName: c.fullName,
    phone: c.phone || '+998 ',
    notes: c.notes || '',
    debt: Number(c.debt) || 0,
  };
  isCustomerModalOpen.value = true;
};

const saveCustomer = async () => {
  if (!customerForm.value.fullName.trim()) {
    toast.warning('Mijoz ismini kiriting', 'Mijoz');
    return;
  }
  submitting.value = true;
  try {
    const cleanPhone = customerForm.value.phone ? cleanUzbekPhone(customerForm.value.phone) : undefined;
    if (editingCustomerId.value) {
      await api.put(`/customers/${editingCustomerId.value}`, {
        fullName: customerForm.value.fullName.trim(),
        phone: cleanPhone,
        notes: customerForm.value.notes,
      });
      toast.success('Mijoz ma\'lumotlari yangilandi!', 'CRM');
    } else {
      await api.post('/customers', {
        fullName: customerForm.value.fullName.trim(),
        phone: cleanPhone,
        notes: customerForm.value.notes,
        debt: Number(customerForm.value.debt) || 0,
      });
      toast.success(`"${customerForm.value.fullName}" mijozlar bazasiga qo'shildi!`, 'CRM');
    }
    isCustomerModalOpen.value = false;
    dataStore.invalidate('customers');
    loadCustomers(true);
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Mijozni saqlashda xatolik yuz berdi', 'Xatolik');
  } finally {
    submitting.value = false;
  }
};

// 2. Add Debt handlers
const openAddDebtModal = (c: any) => {
  activeCustomer.value = c;
  debtAddAmount.value = 0;
  debtAddNotes.value = '';
  isAddDebtModalOpen.value = true;
};

const submitAddDebt = async () => {
  if (!activeCustomer.value) return;
  if (!debtAddAmount.value || debtAddAmount.value <= 0) {
    toast.warning('Qarz summasini to\'g\'ri kiriting', 'Nasiya / Qarz');
    return;
  }

  submitting.value = true;
  try {
    await api.post(`/customers/${activeCustomer.value.id}/add-debt`, {
      amount: Number(debtAddAmount.value),
      notes: debtAddNotes.value || undefined,
    });
    toast.success(
      `"${activeCustomer.value.fullName}" hisobiga ${formatCurrency(debtAddAmount.value)} qarz kiritildi!`,
      'Nasiya Daftari'
    );
    isAddDebtModalOpen.value = false;
    dataStore.invalidate('customers');
    loadCustomers(true);
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Qarz kiritishda xatolik yuz berdi', 'Xatolik');
  } finally {
    submitting.value = false;
  }
};

// 3. Pay Debt handlers
const openPayDebtModal = (c: any) => {
  activeCustomer.value = c;
  debtPayAmount.value = Number(c.debt) || 0;
  debtPayNotes.value = '';
  isPayDebtModalOpen.value = true;
};

const submitPayDebt = async () => {
  if (!activeCustomer.value) return;
  if (!debtPayAmount.value || debtPayAmount.value <= 0) {
    toast.warning('To\'lov summasini to\'g\'ri kiriting', 'Qarz To\'lovi');
    return;
  }

  submitting.value = true;
  try {
    await api.post(`/customers/${activeCustomer.value.id}/pay-debt`, {
      amount: Number(debtPayAmount.value),
      notes: debtPayNotes.value || undefined,
    });
    toast.success(
      `"${activeCustomer.value.fullName}" uchun ${formatCurrency(debtPayAmount.value)} qarz to'lovi qabul qilindi!`,
      'Qarz Daftari'
    );
    isPayDebtModalOpen.value = false;
    dataStore.invalidate('customers');
    dataStore.invalidate('finance');
    dataStore.invalidate('dashboard');
    loadCustomers(true);
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Qarz to\'lovini kiritishda xatolik yuz berdi', 'Xatolik');
  } finally {
    submitting.value = false;
  }
};

// 4. History modal handler
const openHistoryModal = async (c: any) => {
  activeCustomer.value = c;
  isHistoryModalOpen.value = true;
  customerOrdersLoading.value = true;
  try {
    const { data } = await api.get(`/customers/${c.id}`);
    customerOrders.value = data.orders || [];
    if (data.notes) {
      activeCustomer.value.notes = data.notes;
    }
  } catch (err) {
    console.error(err);
  } finally {
    customerOrdersLoading.value = false;
  }
};

// 5. Delete Customer
const isDeleteDialogOpen = ref(false);
const customerToDelete = ref<any>(null);

const confirmDeleteCustomer = (c: any) => {
  customerToDelete.value = c;
  isDeleteDialogOpen.value = true;
};

const executeDeleteCustomer = async () => {
  if (!customerToDelete.value) return;
  const c = customerToDelete.value;
  isDeleteDialogOpen.value = false;
  try {
    await api.delete(`/customers/${c.id}`);
    toast.success('Mijoz muvaffaqiyatli o\'chirildi', 'CRM');
    dataStore.invalidate('customers');
    loadCustomers(true);
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Mijozni o\'chirishda xatolik yuz berdi', 'Xatolik');
  } finally {
    customerToDelete.value = null;
  }
};

onMounted(() => {
  loadCustomers();
});
</script>
