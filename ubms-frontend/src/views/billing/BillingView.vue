<template>
  <div class="space-y-8 max-w-6xl mx-auto pb-20">
    <!-- Clean Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
      <div>
        <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <span>Obuna va Tariflar</span>
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Biznesingiz obuna muddati, tarif rejalarini boshqarish va to'lovlar tizimi
        </p>
      </div>

      <button
        type="button"
        @click="loadBillingStatus(false)"
        :disabled="loading || isRefreshing"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition border border-slate-200 dark:border-slate-700 shadow-2xs self-start sm:self-auto"
      >
        <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isRefreshing || loading }" />
        <span>Yangilash</span>
      </button>
    </div>

    <!-- Skeleton loader when no cached data is available yet -->
    <SkeletonLoader
      v-if="loading && !subscription"
      variant="cards"
      text="Obuna va tarif ma'lumotlari yuklanmoqda..."
    />

    <template v-else>
      <!-- SECTION 1: Senior SaaS Subscription Status & Active Services Cockpit Component -->
      <BillingStatusCockpit
        v-if="subscription"
        :subscription="subscription"
        :business="business"
        :current-active-plan="currentActivePlan"
        :usage="usage"
        :payable-plans="payablePlans"
        :pending-request="pendingRequest"
        :format-money="formatMoney"
        :format-date="formatDate"
        @open-payment="openPaymentModal"
      />

      <!-- SECTION 2: Plans Pricing Table Component -->
      <BillingPlansGrid
        :plans="plans"
        :current-active-plan-id="currentActivePlanId"
        :current-active-plan="currentActivePlan"
        :is-super-admin="isSuperAdmin"
        :format-money="formatMoney"
        @open-payment="openPaymentModal"
        @open-edit-plan="openEditPlanModal"
      />

      <!-- MODAL 1: Premium Step-by-Step Payment Wizard Component -->
      <BillingCheckoutModal
        :is-open="showPaymentModal"
        :payment-step="paymentStep"
        :payment-form="paymentForm"
        :payable-plans="payablePlans"
        :current-active-plan-id="currentActivePlanId"
        :current-active-plan="currentActivePlan"
        :requisites="requisites"
        :selected-plan="selectedPlan"
        :selected-discount-percent="selectedDiscountPercent"
        :selected-discount-savings="selectedDiscountSavings"
        :selected-original-total="selectedOriginalTotal"
        :selected-total-amount="selectedTotalAmount"
        :submitting-receipt="submittingReceipt"
        :is-image-file="isImageFile"
        :receipt-file-name="receiptFileName"
        :receipt-file-size="receiptFileSize"
        :format-money="formatMoney"
        @close="showPaymentModal = false"
        @update:payment-step="paymentStep = $event"
        @copy-text="copyText"
        @trigger-file-input="triggerFileInput"
        @remove-file="removeFile"
        @on-file-drop="onFileDrop"
        @submit-receipt="submitReceipt"
        @next-step="nextStep"
        @prev-step="prevStep"
      />

      <!-- Hidden Real File Input for upload bridge -->
      <input
        ref="fileInputRef"
        type="file"
        accept="image/png, image/jpeg, image/webp, image/heic, application/pdf"
        class="hidden"
        @change="onFileSelected"
      />

      <!-- MODAL 2: SuperAdmin Edit Plan Details & Feature Toggles Component -->
      <BillingEditPlanModal
        :editing-plan="editingPlan"
        :edit-plan-step="editPlanStep"
        :edit-plan-form="editPlanForm"
        :saving-plan="savingPlan"
        :all-available-features="ALL_AVAILABLE_FEATURES"
        @close="editingPlan = null"
        @update:edit-plan-step="editPlanStep = $event"
        @save="savePlanChanges"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  RefreshCw,
  ShoppingCart,
  FolderTree,
  PieChart,
  Send,
  Users,
  Building2,
  Sparkles,
  FileText,
  ShieldCheck,
  Lock,
} from 'lucide-vue-next';
import api from '@/services/api';
import { useToast } from '@/composables/useToast';
import { useAuthStore } from '@/stores/auth.store';
import SkeletonLoader from '@/components/SkeletonLoader.vue';

import BillingStatusCockpit from './components/BillingStatusCockpit.vue';
import BillingPlansGrid from './components/BillingPlansGrid.vue';
import BillingCheckoutModal from './components/BillingCheckoutModal.vue';
import BillingEditPlanModal from './components/BillingEditPlanModal.vue';

const toast = useToast();
const authStore = useAuthStore();
const isSuperAdmin = computed(() => !!authStore.user?.isSuperAdmin);

// All toggleable system features
const ALL_AVAILABLE_FEATURES = [
  { key: 'pos', label: 'POS Kassa & Chek chiqarish', description: 'Kassa savdolari, chek printer, to\'lov turlari', icon: ShoppingCart },
  { key: 'inventory', label: 'Ombor & Mahsulotlar nazorati', description: 'Inventarizatsiya, qoldiqlar, barkod skaner', icon: FolderTree },
  { key: 'finance', label: 'Moliya & Kunlik hisobotlar', description: 'Tushumlar, xarajatlar, kassa balansi tahlili', icon: PieChart },
  { key: 'telegram_bot', label: 'Telegram Bot bildirishnomalari', description: 'Kunlik avto-hisobotlar va savdo xabarlari', icon: Send },
  { key: 'customer_loyalty', label: 'Mijozlar bazasi va Cashback', description: 'Sodiqlik tizimi va mijozlar qarz daftari', icon: Users },
  { key: 'suppliers', label: 'Ta\'minotchilar & Xaridlar', description: 'Ta\'minotchi hisob-kitoblari va partiyalar', icon: Building2 },
  { key: 'ai_assistant', label: 'Boshqar AI Aqlli Yordamchisi', description: 'AI savdo bashorati va biznes maslahatchisi', icon: Sparkles },
  { key: 'export_reports', label: 'Excel / PDF Hisobotlar', description: 'Barcha hisobotlarni eksport qilish va chop etish', icon: FileText },
  { key: 'vip_support', label: '24/7 Shaxsiy VIP Menejer', description: 'Doimiy shaxsiy aloqa va texnik ko\'mak', icon: ShieldCheck },
  { key: 'cloud_backup', label: 'Avtomatik Bulutli Zaxira', description: 'Kunlik xavfsiz cloud backup nusxalari', icon: Lock },
];

const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(`ubms_cache_${key}`);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(`ubms_cache_${key}`, JSON.stringify(data));
  } catch (e) {}
};

const cachedBilling = loadFromStorage<any>('billing_status', null);

const loading = ref(!cachedBilling?.subscription);
const isRefreshing = ref(false);
const business = ref<any>(cachedBilling?.business || null);
const subscription = ref<any>(cachedBilling?.subscription || null);
const usage = ref<any>(cachedBilling?.usage || { branches: 1, users: 1 });
const plans = ref<any[]>(cachedBilling?.plans || []);
const requisites = ref<any>(cachedBilling?.requisites || null);
const pendingRequest = ref<any>(cachedBilling?.pendingRequest || null);

// Payment Wizard Step (1: Plan, 2: Requisites, 3: Receipt)
const paymentStep = ref(1);

// SuperAdmin Plan Edit state
const editingPlan = ref<any>(null);
const editPlanStep = ref(1);
const savingPlan = ref(false);
const editPlanForm = ref({
  name: '',
  priceMonthly: 0,
  maxBranches: 0,
  maxUsers: 0,
  features: {} as Record<string, boolean>,
});

const showPaymentModal = ref(false);
const submittingReceipt = ref(false);
const paymentForm = ref({
  planId: '',
  durationMonths: 1,
  senderName: '',
  senderCard: '',
  receiptUrl: '',
  notes: '',
});

// File upload states
const fileInputRef = ref<HTMLInputElement | null>(null);
const receiptFileName = ref('');
const receiptFileSize = ref('');
const isImageFile = ref(true);

const currentActivePlanId = computed(() => {
  if (subscription.value?.planId) return subscription.value.planId;
  if (subscription.value?.planName) {
    const matched = plans.value.find(
      (p) => p.name.toLowerCase() === subscription.value.planName.toLowerCase()
    );
    if (matched) return matched.id;
  }
  if (business.value?.plan?.id) return business.value.plan.id;
  if (business.value?.planId) return business.value.planId;
  return null;
});

const currentActivePlan = computed(() => {
  return plans.value.find((p) => p.id === currentActivePlanId.value) || null;
});

const payablePlans = computed(() => {
  return plans.value.filter((p) => Number(p.priceMonthly) > 0);
});

const selectedPlan = computed(() => {
  return plans.value.find((item) => item.id === paymentForm.value.planId) || null;
});

const selectedDiscountPercent = computed(() => {
  if (paymentForm.value.durationMonths === 12) return 15;
  if (paymentForm.value.durationMonths === 6) return 5;
  return 0;
});

const selectedOriginalTotal = computed(() => {
  if (!selectedPlan.value) return 0;
  return Number(selectedPlan.value.priceMonthly || 0) * (paymentForm.value.durationMonths || 1);
});

const selectedDiscountSavings = computed(() => {
  if (!selectedDiscountPercent.value) return 0;
  return Math.round(selectedOriginalTotal.value * (selectedDiscountPercent.value / 100));
});

const selectedTotalAmount = computed(() => {
  return selectedOriginalTotal.value - selectedDiscountSavings.value;
});

const openEditPlanModal = (plan: any) => {
  editingPlan.value = plan;
  editPlanStep.value = 1;

  const defaultFeatures: Record<string, boolean> = {
    pos: true,
    inventory: true,
    finance: true,
    customer_loyalty: true,
    suppliers: true,
    export_reports: true,
    cloud_backup: true,
    telegram_bot: plan.name !== 'Free',
    ai_assistant: plan.name !== 'Free',
    vip_support: plan.name === 'Business',
  };

  if (plan.features && typeof plan.features === 'object') {
    Object.assign(defaultFeatures, plan.features);
  }

  editPlanForm.value = {
    name: plan.name,
    priceMonthly: Number(plan.priceMonthly || 0),
    maxBranches: plan.maxBranches || 0,
    maxUsers: plan.maxUsers || 0,
    features: defaultFeatures,
  };
};

const savePlanChanges = async () => {
  if (!editingPlan.value) return;
  savingPlan.value = true;
  try {
    const payload = {
      name: editPlanForm.value.name,
      priceMonthly: editPlanForm.value.priceMonthly,
      maxBranches: editPlanForm.value.maxBranches ? Number(editPlanForm.value.maxBranches) : null,
      maxUsers: editPlanForm.value.maxUsers ? Number(editPlanForm.value.maxUsers) : null,
      features: editPlanForm.value.features,
    };
    await api.patch(`/superadmin/plans/${editingPlan.value.id}`, payload);
    toast.success(`«${editPlanForm.value.name}» tarifi muvaffaqiyatli saqlandi!`);
    editingPlan.value = null;
    await loadBillingStatus();
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Xatolik yuz berdi');
  } finally {
    savingPlan.value = false;
  }
};

const loadBillingStatus = async (silent = false) => {
  if (!silent && !subscription.value) {
    loading.value = true;
  } else {
    isRefreshing.value = true;
  }
  try {
    const { data } = await api.get('/billing/status');
    if (data) {
      business.value = data.business;
      subscription.value = data.subscription;
      usage.value = data.usage || { branches: 1, users: 1 };
      plans.value = Array.isArray(data.plans) ? data.plans : [];
      requisites.value = data.requisites;
      pendingRequest.value = data.pendingRequest;
      saveToStorage('billing_status', data);
    }
  } catch (err: any) {
    console.error('Billing status error:', err);
  } finally {
    loading.value = false;
    isRefreshing.value = false;
  }
};

const openPaymentModal = (targetPlan?: any) => {
  const chosen =
    targetPlan ||
    (currentActivePlan.value && Number(currentActivePlan.value.priceMonthly) > 0
      ? currentActivePlan.value
      : payablePlans.value[0]);
  if (chosen) {
    paymentForm.value.planId = chosen.id;
  }
  paymentForm.value.durationMonths = 1;
  paymentStep.value = 1;
  removeFile();
  showPaymentModal.value = true;
};

const nextStep = () => {
  if (paymentStep.value === 1) {
    if (!paymentForm.value.planId) {
      toast.warning('Iltimos, tarifni tanlang');
      return;
    }
    paymentStep.value = 2;
  } else if (paymentStep.value === 2) {
    if (!paymentForm.value.senderName.trim()) {
      toast.warning('Iltimos, to\'lovchi ismingizni kiriting');
      return;
    }
    paymentStep.value = 3;
  }
};

const prevStep = () => {
  if (paymentStep.value > 1) {
    paymentStep.value--;
  }
};

// File Upload Handlers
const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    img.onload = () => {
      const maxWidth = 1400;
      const maxHeight = 1400;
      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(img.src);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const handleFileProcess = async (file: File) => {
  if (!file) return;

  if (file.size > 15 * 1024 * 1024) {
    toast.error('Fayl hajmi 15 MB dan oshmasligi kerak');
    return;
  }

  receiptFileName.value = file.name;
  receiptFileSize.value = formatBytes(file.size);

  if (file.type.startsWith('image/')) {
    isImageFile.value = true;
    try {
      const compressed = await compressImage(file);
      paymentForm.value.receiptUrl = compressed;
      toast.info('Chek rasmi muvaffaqiyatli yuklandi');
    } catch {
      const reader = new FileReader();
      reader.onload = (e) => {
        paymentForm.value.receiptUrl = (e.target?.result as string) || '';
      };
      reader.readAsDataURL(file);
    }
  } else {
    isImageFile.value = false;
    const reader = new FileReader();
    reader.onload = (e) => {
      paymentForm.value.receiptUrl = (e.target?.result as string) || '';
    };
    reader.readAsDataURL(file);
    toast.info('Hujjat fayli yuklandi');
  }
};

const onFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    handleFileProcess(target.files[0]);
  }
};

const onFileDrop = (event: DragEvent) => {
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    handleFileProcess(event.dataTransfer.files[0]);
  }
};

const removeFile = () => {
  paymentForm.value.receiptUrl = '';
  receiptFileName.value = '';
  receiptFileSize.value = '';
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};

const submitReceipt = async () => {
  if (!paymentForm.value.receiptUrl) {
    toast.warning('Iltimos, to\'lov cheki rasmi yoki faylini yuklang.');
    return;
  }

  submittingReceipt.value = true;
  try {
    await api.post('/billing/request', {
      ...paymentForm.value,
      amount: selectedTotalAmount.value,
    });
    showPaymentModal.value = false;
    toast.success('To\'lov so\'rovingiz va chekingiz qabul qilindi! Administrator tasdiqlashi bilan obunangiz faollashadi.');
    await loadBillingStatus();
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Xatolik yuz berdi');
  } finally {
    submittingReceipt.value = false;
  }
};

const copyText = (txt: string, label: string) => {
  if (!txt) return;
  navigator.clipboard.writeText(txt);
  toast.success(`${label} buferga nusxalandi!`);
};

const formatMoney = (amount: any) => {
  const num = Math.round(Number(amount || 0));
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + " so'm";
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '--.--.----';
  const d = new Date(dateStr);
  return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

onMounted(() => {
  loadBillingStatus(true);
});
</script>
