<template>
  <div class="space-y-6 pb-12">
    <!-- Top Header & Actions -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <span>Moliya va Savdo Hisoboti</span>
          <span
            class="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
            Real-vaqt
          </span>
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Tushumlar, sotilgan tovarlar, tannarx (COGS), xarajatlar va sof foyda hisoboti
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <!-- Date Period Selector -->
        <div
          class="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
          <button v-for="p in periods" :key="p.id" @click="selectPeriod(p.id)"
            class="px-2.5 py-1.5 rounded-lg transition" :class="[
              activePeriod === p.id
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            ]">
            {{ p.label }}
          </button>
        </div>

        <button @click="loadFinance(true)" :disabled="loading"
          class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
          title="Yangilash">
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
        </button>

        <AppButton variant="danger" size="md" :icon="Plus" @click="isExpenseModalOpen = true">
          Xarajat Kiritish
        </AppButton>
      </div>
    </div>

    <!-- 1 & 2. Primary KPI Stat Cards & Payment Breakdown Bar -->
    <FinanceHeaderStats :summary="summary" />

    <!-- 3. Navigation Tabs & Global Controls with Sliding Animation -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
      <div class="relative flex items-center space-x-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
        <!-- Animated Sliding Background Pill -->
        <div
          v-if="pillStyle"
          class="absolute rounded-xl bg-emerald-500 shadow-md shadow-emerald-500/20 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none"
          :style="pillStyle"
        ></div>

        <button
          v-for="tab in tabs"
          :key="tab.id"
          :ref="(el) => setTabRef(el, tab.id)"
          @click="activeTab = tab.id"
          class="relative z-10 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors duration-300 whitespace-nowrap btn-interactive"
          :class="[
            activeTab === tab.id
              ? 'text-white'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          ]"
        >
          <component :is="tab.icon" class="w-4 h-4" />
          <span>{{ tab.label }}</span>
          <span v-if="tab.badge !== undefined" class="px-1.5 py-0.2 rounded-full text-[10px] font-mono transition-colors duration-300" :class="[
            activeTab === tab.id
              ? 'bg-white/20 text-white'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
          ]">
            {{ tab.badge }}
          </span>
        </button>
      </div>

      <!-- View Mode Switcher (Jadval / Kartalar) -->
      <AppViewToggle v-if="activeTab !== 'breakdown'" v-model="viewMode" />
    </div>

    <!-- 4. Tab 1: Sotilgan Mahsulotlar (Sold Products Breakdown) -->
    <FinanceProductsTab
      v-if="activeTab === 'products'"
      :sold-products="summary.soldProducts || []"
      :view-mode="viewMode"
    />

    <!-- 5. Tab 2: Savdo & Cheklar Jurnali (Sales Orders Journal) -->
    <FinanceOrdersTab
      v-else-if="activeTab === 'orders'"
      :orders="summary.recentOrders || []"
      :view-mode="viewMode"
      @view-receipt="viewReceipt"
      @cancel-order="promptCancelOrder"
    />

    <!-- 6. Tab 3: Xarajatlar Jurnali (Expenses Journal) -->
    <FinanceExpensesTab
      v-else-if="activeTab === 'expenses'"
      :expenses="expenses"
      :view-mode="viewMode"
      @open-expense-modal="isExpenseModalOpen = true"
      @delete-expense="promptDeleteExpense"
    />

    <!-- 7. Tab 4: Moliyaviy Taqsimot & Tahlil (Analytics & Breakdown) -->
    <FinanceBreakdownTab
      v-else-if="activeTab === 'breakdown'"
      :summary="summary"
    />

    <!-- 8. Tab 5: Smenalar Jurnali & Z-Hisobotlar (Shifts & Reconciliation Log) -->
    <FinanceShiftsTab
      v-else-if="activeTab === 'shifts'"
      :shifts="shiftsList"
      :loading="loadingShifts"
      :view-mode="viewMode"
      :cashier-default-name="authStore.user?.fullName"
      @refresh="loadShifts"
      @view-report="viewShiftReport"
      @delete-shift="promptDeleteShift"
    />

    <!-- Receipt Details Modal (Using unified ReceiptModal component) -->
    <ReceiptModal v-if="selectedOrderForReceipt" :order="selectedOrderForReceipt"
      @close="selectedOrderForReceipt = null" />

    <!-- Shift Z-Report Modal -->
    <ShiftModal
      :is-open="isShiftReportModalOpen"
      mode="report"
      :shift-data="selectedShiftForReport"
      @close="isShiftReportModalOpen = false"
    />

    <!-- Confirm Dialog for Delete Actions -->
    <AppConfirmDialog
      :open="confirmState.open"
      :title="confirmState.title"
      :message="confirmState.message"
      :variant="confirmState.variant"
      :loading="confirmState.loading"
      confirmText="Ha, o'chirish"
      cancelText="Bekor qilish"
      @confirm="executeConfirmAction"
      @cancel="confirmState.open = false"
    />

    <!-- Expense Creation Modal -->
    <Teleport to="body">
      <div v-if="isExpenseModalOpen" @click.self="isExpenseModalOpen = false" class="modal-overlay">
        <div class="modal-container max-w-md" @click.stop>
          <div class="modal-header">
            <h3 class="text-base font-bold text-slate-900 dark:text-white">Yangi Xarajat Kiritish</h3>
            <button @click="isExpenseModalOpen = false"
              class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition">
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="modal-body">
            <form @submit.prevent="createExpense" class="space-y-3 text-xs">
              <div>
                <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Xarajat Kategoriyasi</label>
                <AppSelect v-model="expenseForm.category" :options="[
                  { value: 'salary', label: 'Xodimlar maoshi' },
                  { value: 'rent', label: 'Ijara to\'lovi' },
                  { value: 'utilities', label: 'Kommunal to\'lovlar' },
                  { value: 'advertising', label: 'Reklama va marketing' },
                  { value: 'transport', label: 'Transport / Yetkazib berish' },
                  { value: 'other', label: 'Boshqa xarajatlar' }
                ]" />
              </div>

              <div>
                <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Summa *</label>
                <CurrencyInput v-model="expenseForm.amount" placeholder="0" suffix="so'm" :required="true"
                  inputClass="font-bold text-rose-600 dark:text-rose-400" />
              </div>

              <div>
                <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Izoh / Tafsilot</label>
                <textarea v-model="expenseForm.description" rows="2" placeholder="Xarajat haqida izoh..."
                  class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"></textarea>
              </div>

              <div class="mt-4">
                <AppButton type="submit" variant="danger" size="lg" class="w-full" :loading="submitting">
                  {{ submitting ? 'Saqlanmoqda...' : 'Xarajatni Saqlash' }}
                </AppButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import api, { getErrorMessage } from '../../services/api';
import { useFormat } from '../../composables/useFormat';
import {
  DollarSign,
  Boxes,
  TrendingDown,
  TrendingUp,
  PackageCheck,
  Receipt,
  CreditCard,
  Banknote,
  Smartphone,
  PieChart,
  Plus,
  RefreshCw,
  Search,
  Eye,
  Printer,
  X,
  ShoppingCart,
  History,
  Sun,
  Moon,
  Trash2,
} from 'lucide-vue-next';
import AppButton from '../../components/AppButton.vue';
import SkeletonLoader from '../../components/SkeletonLoader.vue';
import AppStatCard from '../../components/AppStatCard.vue';
import AppSelect from '../../components/AppSelect.vue';
import AppConfirmDialog from '../../components/AppConfirmDialog.vue';
import CurrencyInput from '../../components/CurrencyInput.vue';
import ReceiptModal from '../../components/ReceiptModal.vue';
import ShiftModal from '../../components/ShiftModal.vue';
import AppViewToggle from '../../components/AppViewToggle.vue';
import FinanceHeaderStats from './components/FinanceHeaderStats.vue';
import FinanceProductsTab from './components/FinanceProductsTab.vue';
import FinanceOrdersTab from './components/FinanceOrdersTab.vue';
import FinanceExpensesTab from './components/FinanceExpensesTab.vue';
import FinanceBreakdownTab from './components/FinanceBreakdownTab.vue';
import FinanceShiftsTab from './components/FinanceShiftsTab.vue';
import { useDataStore } from '../../stores/data.store';
import { useShiftStore } from '../../stores/shift.store';
import { useAuthStore } from '../../stores/auth.store';
import { useToast } from '../../composables/useToast';

import { usePersistentTab } from '../../composables/usePersistentTab';
import { usePersistentViewMode } from '../../composables/usePersistentViewMode';

const toast = useToast();
const dataStore = useDataStore();
const shiftStore = useShiftStore();
const authStore = useAuthStore();
const { formatCurrency, formatDate, formatDateTime } = useFormat();

const loading = ref(false);
const submitting = ref(false);
const viewMode = usePersistentViewMode('finance', 'table');

const getCategoryLabel = (cat: string) => {
  const map: Record<string, string> = {
    rent: 'Ijara',
    salary: 'Ish haqi',
    utilities: 'Kommunal',
    marketing: 'Marketing',
    supplies: 'Xom-ashyo / Mahsulot',
    maintenance: 'Ta\'mirlash',
    other: 'Boshqa',
  };
  return map[cat] || cat || 'Xarajat';
};

const periods = [
  { id: 'all', label: 'Barchasi' },
  { id: 'today', label: 'Bugun' },
  { id: '7days', label: '7 kun' },
  { id: 'month', label: 'Bu oy' },
];

const summary = computed(() => dataStore.financeSummary || {
  totalRevenue: 0,
  cogs: 0,
  grossProfit: 0,
  totalExpenses: 0,
  netProfit: 0,
  salesCount: 0,
  soldProducts: [],
  recentOrders: [],
});

const expenses = computed(() => dataStore.financeExpenses || []);

const validTabs = ['products', 'orders', 'expenses', 'shifts', 'breakdown'] as const;
type FinanceTab = typeof validTabs[number];

const activeTab = usePersistentTab<FinanceTab>('finance', 'products', validTabs);
const activePeriod = ref<'all' | 'today' | '7days' | 'month'>('all');

const tabRefs = reactive<Record<string, HTMLElement>>({});
const isMounted = ref(false);

onMounted(() => {
  isMounted.value = true;
});

const setTabRef = (el: any, id: string) => {
  if (el) tabRefs[id] = el;
};

const pillStyle = computed(() => {
  const activeEl = tabRefs[activeTab.value];
  if (!activeEl || !isMounted.value) return null;
  return {
    left: `${activeEl.offsetLeft}px`,
    width: `${activeEl.offsetWidth}px`,
    top: `${activeEl.offsetTop}px`,
    height: `${activeEl.offsetHeight}px`,
  };
});

const selectedOrderForReceipt = ref<any | null>(null);
const isExpenseModalOpen = ref(false);

const shiftsList = computed(() => {
  const list = [...(shiftStore.shiftsHistory || [])];
  if (shiftStore.currentShift) {
    const exists = list.some((s) => s.id === shiftStore.currentShift?.id);
    if (!exists) {
      list.unshift(shiftStore.currentShift);
    }
  }
  return list;
});
const loadingShifts = ref(false);
const isShiftReportModalOpen = ref(false);
const selectedShiftForReport = ref<any | null>(null);

const viewShiftReport = (shift: any) => {
  selectedShiftForReport.value = shift;
  isShiftReportModalOpen.value = true;
};

const loadShifts = async () => {
  loadingShifts.value = true;
  try {
    await Promise.allSettled([
      shiftStore.fetchCurrentShift(),
      shiftStore.fetchShifts(),
    ]);
  } catch (err) {
    console.error('Failed to load shifts:', err);
  } finally {
    loadingShifts.value = false;
  }
};

const tabs = computed(() => [
  {
    id: 'products' as const,
    label: 'Sotilgan Mahsulotlar',
    icon: PackageCheck,
    badge: summary.value.soldProducts?.length || 0,
  },
  {
    id: 'orders' as const,
    label: 'Savdo & Cheklar',
    icon: Receipt,
    badge: summary.value.salesCount || 0,
  },
  {
    id: 'expenses' as const,
    label: 'Xarajatlar Jurnali',
    icon: TrendingDown,
    badge: expenses.value?.length || 0,
  },
  {
    id: 'shifts' as const,
    label: 'Smenalar Jurnali (Z-Reports)',
    icon: History,
    badge: shiftsList.value?.length || 0,
  },
  {
    id: 'breakdown' as const,
    label: 'Tahlil & Taqsimot',
    icon: PieChart,
  },
]);

const expenseForm = ref({
  category: 'rent',
  amount: 0,
  description: '',
});

const selectPeriod = async (periodId: any) => {
  activePeriod.value = periodId;
  let dateFrom: string | undefined;
  let dateTo: string | undefined;

  const now = new Date();
  if (periodId === 'today') {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    dateFrom = today.toISOString();
  } else if (periodId === '7days') {
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    dateFrom = sevenDaysAgo.toISOString();
  } else if (periodId === 'month') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    dateFrom = startOfMonth.toISOString();
  }

  loading.value = true;
  try {
    const params = new URLSearchParams();
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);

    const [sumRes, expRes] = await Promise.all([
      api.get(`/finance/summary?${params.toString()}`),
      api.get('/finance/expenses'),
    ]);

    dataStore.financeSummary = sumRes.data;
    dataStore.financeExpenses = expRes.data || [];
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const loadFinance = async (force = false) => {
  if (!dataStore.financeSummary || force) {
    loading.value = true;
  }
  try {
    await dataStore.fetchFinance(force);
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const viewReceipt = (order: any) => {
  selectedOrderForReceipt.value = order;
};

const printReceipt = () => {
  window.print();
};

const createExpense = async () => {
  if (!expenseForm.value.amount || Number(expenseForm.value.amount) <= 0) {
    toast.warning('Xarajat summasini to\'g\'ri kiriting', 'Moliya');
    return;
  }

  submitting.value = true;
  try {
    const { data: created } = await api.post('/finance/expenses', {
      ...expenseForm.value,
      amount: Number(expenseForm.value.amount),
    });
    if (created && dataStore.financeExpenses) {
      dataStore.financeExpenses.unshift(created);
    }
    toast.success('Yangi xarajat muvaffaqiyatli saqlandi!', 'Moliya');
    isExpenseModalOpen.value = false;
    expenseForm.value = { category: 'rent', amount: 0, description: '' };
    dataStore.invalidate('finance');
    dataStore.invalidate('dashboard');
    dataStore.fetchFinance(true).catch(console.error);
  } catch (err: any) {
    toast.error(getErrorMessage(err, 'Xarajatni saqlashda xatolik yuz berdi'), 'Xatolik');
  } finally {
    submitting.value = false;
  }
};

const confirmState = ref<{
  open: boolean;
  title: string;
  message: string;
  variant: 'danger' | 'default';
  loading: boolean;
  action: () => Promise<void>;
}>({
  open: false,
  title: '',
  message: '',
  variant: 'danger',
  loading: false,
  action: async () => {},
});

const executeConfirmAction = async () => {
  confirmState.value.loading = true;
  try {
    await confirmState.value.action();
    confirmState.value.open = false;
  } catch (err: any) {
    toast.error(getErrorMessage(err, 'Amalni bajarishda xatolik yuz berdi'), 'Xatolik');
  } finally {
    confirmState.value.loading = false;
  }
};

// 1. Delete Expense
const promptDeleteExpense = (exp: any) => {
  confirmState.value = {
    open: true,
    title: 'Xarajatni o\'chirish',
    message: `${formatCurrency(exp.amount)} miqdoridagi "${getCategoryLabel(exp.category)}" xarajatini o'chirishni tasdiqlaysizmi?`,
    variant: 'danger',
    loading: false,
    action: async () => {
      await api.delete(`/finance/expenses/${exp.id}`);
      if (dataStore.financeExpenses) {
        dataStore.financeExpenses = dataStore.financeExpenses.filter((e: any) => e.id !== exp.id);
      }
      toast.success('Xarajat muvaffaqiyatli o\'chirildi', 'Moliya');
      dataStore.invalidate('finance');
      dataStore.invalidate('dashboard');
      loadFinance(true);
    },
  };
};

// 2. Cancel Order
const promptCancelOrder = (order: any) => {
  confirmState.value = {
    open: true,
    title: 'Chek / Savdoni bekor qilish',
    message: `#${order.orderNumber} raqamli (${formatCurrency(order.total)}) chekni bekor qilishni tasdiqlaysizmi?`,
    variant: 'danger',
    loading: false,
    action: async () => {
      try {
        await api.post(`/orders/${order.id}/cancel`);
      } catch (err: any) {
        if (err.response?.status === 404) {
          await api.delete(`/orders/${order.id}`);
        } else {
          throw err;
        }
      }
      toast.success(`Chek #${order.orderNumber} bekor qilindi`, 'Savdo & Cheklar');
      dataStore.invalidate('finance');
      dataStore.invalidate('orders');
      dataStore.invalidate('dashboard');
      loadFinance(true);
    },
  };
};

// 3. Delete Shift
const promptDeleteShift = (shift: any) => {
  const shiftLabel = shift.shiftNumber ? `#${shift.shiftNumber}` : `#${shift.id?.substring(0, 8)}`;
  confirmState.value = {
    open: true,
    title: 'Smena yozuvini o\'chirish',
    message: `${shiftLabel} raqamli smena yozuvini tarixdan o'chirishni tasdiqlaysizmi?`,
    variant: 'danger',
    loading: false,
    action: async () => {
      shiftStore.shiftsHistory = shiftStore.shiftsHistory.filter((s: any) => s.id !== shift.id);
      localStorage.setItem('ubms_shifts_history', JSON.stringify(shiftStore.shiftsHistory));
      try {
        await api.delete(`/shifts/${shift.id}`);
      } catch {
        // Local removed
      }
      toast.success(`Smena ${shiftLabel} tarixdan o'chirildi`, 'Smenalar Jurnali');
    },
  };
};

watch(activeTab, (tab) => {
  if (tab === 'shifts') {
    loadShifts();
  }
});

onMounted(() => {
  loadFinance(true);
  loadShifts();
});
</script>
