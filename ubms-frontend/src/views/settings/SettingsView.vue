<template>
  <div class="space-y-6">
    <SettingsTabHeader
      :active-tab="activeTab"
      :current-tab-index="currentTabIndex"
      :settings-tabs="settingsTabs"
      :is-feature-disabled="isFeatureDisabled"
      @select-tab="selectTab"
      @prev-tab="selectPrevTab"
      @next-tab="selectNextTab"
    />

    <!-- Tab 0: Mening Profilim -->
    <SettingsProfileTab
      v-if="activeTab === 'my-profile'"
      :profile-form="profileForm"
      :password-form="passwordForm"
      v-model:selected-currency="selectedCurrency"
      :currency-options="currencyOptions"
      :saving-profile="savingProfile"
      :changing-password="changingPassword"
      @currency-change="handleCurrencyChange"
      @save-unified-profile="handleSaveUnifiedProfile"
    />

    <!-- Tab 1: Ko'rinish & Xizmatlar -->
    <SettingsAppearanceTab
      v-else-if="activeTab === 'appearance'"
      :pos-settings="posSettings"
      @toggle-pos-setting="togglePosSetting"
      @set-debt-limit="handleSetDebtLimit"
    />

    <!-- Tab 2: Xodimlar va Ruxsatlar -->
    <SettingsEmployeesTab
      v-else-if="activeTab === 'employees'"
      :employees="employees"
      :loading="loadingEmployees"
      :get-module-label="getModuleLabel"
      @open-add-modal="openAddEmployeeModal"
      @edit="editEmployee"
      @delete="deleteEmployee"
    />

    <!-- Tab 3: Chek & Printer -->
    <SettingsReceiptTab
      v-else-if="activeTab === 'receipt'"
      :receipt-settings="receiptSettings"
      :business-name="authStore.activeBusiness?.name"
      @save="saveReceiptSettings"
      @test-print="triggerTestPrint"
    />

    <!-- Hidden Receipt Modal for Test Print -->
    <ReceiptModal
      v-if="testOrderForReceipt"
      :order="testOrderForReceipt"
      @close="testOrderForReceipt = null"
    />

    <!-- Tab 4: Telegram Bot -->
    <div v-else-if="activeTab === 'telegram'" class="relative">
      <div
        v-if="isFeatureDisabled('telegram_bot')"
        class="glass-card rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 text-center space-y-4 max-w-md mx-auto my-8 shadow-xl"
      >
        <div class="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto shadow-inner">
          <Lock class="w-8 h-8 text-amber-500" />
        </div>
        <div>
          <h3 class="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            «Telegram Bot» xizmati o'chirilgan
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            Telegram bot orqali savdo xabarnomalari va avtomatik hisobotlar olish uchun joriy tarifingizda ushbu xizmatni yoqing yoki yuqoriroq tarifga o'ting.
          </p>
        </div>
        <div class="pt-2">
          <router-link
            to="/billing"
            class="w-full py-3.5 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition transform active:scale-98 btn-interactive"
          >
            <CreditCard class="w-5 h-5" />
            <span>Tariflarni Ko'rish</span>
          </router-link>
        </div>
      </div>
      <SettingsTelegramTab v-else />
    </div>

    <!-- Tab 5: Audit Jurnallari -->
    <SettingsAuditTab
      v-else-if="activeTab === 'audit'"
      :audit-logs="auditLogs"
      :loading="loadingAudit"
      @refresh="loadAudit"
    />

    <!-- Tab 6: Xavfli Hudud -->
    <SettingsDangerTab
      v-else-if="activeTab === 'danger'"
      @open-delete-business="openDeleteBusinessModal"
      @open-delete-account="openDeleteAccountModal"
    />

    <!-- Add/Edit Employee Modal -->
    <EmployeeModal
      :is-open="showEmployeeModal"
      :editing-emp-id="editingEmpId"
      :emp-form="empForm"
      :available-modules="availableModules"
      :saving="savingEmp"
      :get-module-label="getModuleLabel"
      :get-action-perm="getActionPerm"
      @close="showEmployeeModal = false"
      @save="saveEmployee"
    />

    <!-- Confirm Modal -->
    <div v-if="showConfirmModal" @click.self="showConfirmModal = false" class="modal-overlay">
      <div class="modal-container max-w-sm" @click.stop>
        <div class="modal-header border-rose-500/20">
          <h3 class="text-base font-bold text-rose-600 dark:text-rose-400">Tasdiqlash kerak</h3>
          <button @click="showConfirmModal = false" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"><X class="w-5 h-5" /></button>
        </div>

        <div class="modal-body">
          <p class="text-xs text-slate-600 dark:text-slate-300">
            O'chirishni tasdiqlash uchun quyidagi maydonga <strong class="text-slate-900 dark:text-white font-mono">OCHIRISH</strong> so'zini yozing:
          </p>

          <input
            v-model="confirmInput"
            placeholder="OCHIRISH"
            class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-center font-bold tracking-widest uppercase focus:outline-none focus:border-rose-500"
          />
        </div>

        <div class="modal-footer">
          <button
            @click="showConfirmModal = false"
            class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Bekor qilish
          </button>
          <button
            @click="executeDeletion"
            :disabled="confirmInput !== 'OCHIRISH' || deleting"
            class="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-lg shadow-rose-600/30 btn-interactive"
          >
            {{ deleting ? 'O\'chirilmoqda...' : 'O\'chirish' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Confirm Dialog -->
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
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth.store';
import { useThemeStore } from '../../stores/theme.store';
import { useToast } from '../../composables/useToast';
import { useFormat } from '../../composables/useFormat';
import api from '../../services/api';
import { cleanUzbekPhone } from '../../utils/phone';
import AppConfirmDialog from '../../components/AppConfirmDialog.vue';
import ReceiptModal from '../../components/ReceiptModal.vue';
import { usePosSettings, type PosSettings } from '../../composables/usePosSettings';
import { usePersistentTab } from '../../composables/usePersistentTab';
import { useLanguage } from '../../composables/useLanguage';
import { usePlanFeatures } from '../../composables/usePlanFeatures';

import SettingsProfileTab from './components/SettingsProfileTab.vue';
import SettingsTabHeader from './components/SettingsTabHeader.vue';
import SettingsAppearanceTab from './components/SettingsAppearanceTab.vue';
import SettingsEmployeesTab from './components/SettingsEmployeesTab.vue';
import SettingsReceiptTab from './components/SettingsReceiptTab.vue';
import SettingsTelegramTab from './components/SettingsTelegramTab.vue';
import SettingsAuditTab from './components/SettingsAuditTab.vue';
import SettingsDangerTab from './components/SettingsDangerTab.vue';
import EmployeeModal from './components/EmployeeModal.vue';

import {
  UserCircle,
  Palette,
  Users,
  Printer,
  Bot,
  ScrollText,
  Trash2,
  X,
  Coins,
  Package,
  Boxes,
  Truck,
  UtensilsCrossed,
  Flame,
  Calendar,
  DollarSign,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  Lock,
} from 'lucide-vue-next';

const { isFeatureDisabled } = usePlanFeatures();

const settingsTabs = [
  { id: 'my-profile' as const, label: 'Mening Profilim', icon: UserCircle },
  { id: 'appearance' as const, label: "Ko'rinish & Xizmatlar", icon: Palette },
  { id: 'employees' as const, label: 'Xodimlar va Ruxsatlar', icon: Users },
  { id: 'receipt' as const, label: 'Chek & Printer', icon: Printer },
  { id: 'telegram' as const, label: 'Telegram Bot', icon: Bot, featureKey: 'telegram_bot' },
  { id: 'audit' as const, label: 'Audit Jurnallari', icon: ScrollText },
  { id: 'danger' as const, label: "O'chirish", icon: Trash2 },
];

const validTabs = ['my-profile', 'appearance', 'employees', 'receipt', 'telegram', 'audit', 'danger'] as const;
type SettingsTab = typeof validTabs[number];
const activeTab = usePersistentTab<SettingsTab>('settings', 'my-profile', validTabs);

const tabContainerRef = ref<HTMLElement | null>(null);

const currentTabIndex = computed(() => {
  return settingsTabs.findIndex((t) => t.id === activeTab.value);
});

const selectTab = (tabId: SettingsTab) => {
  activeTab.value = tabId;
  scrollActiveTabIntoView();
};

const selectPrevTab = () => {
  const idx = currentTabIndex.value;
  if (idx > 0) {
    selectTab(settingsTabs[idx - 1].id);
  }
};

const selectNextTab = () => {
  const idx = currentTabIndex.value;
  if (idx >= 0 && idx < settingsTabs.length - 1) {
    selectTab(settingsTabs[idx + 1].id);
  }
};

const scrollActiveTabIntoView = () => {
  setTimeout(() => {
    const el = tabRefs[activeTab.value];
    if (el && tabContainerRef.value) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, 50);
};

watch(() => activeTab.value, () => {
  scrollActiveTabIntoView();
});

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

const currencyOptions = [
  { value: 'UZS', label: "UZS (So'm)", icon: Coins },
  { value: 'USD', label: "USD ($ Dollar)", icon: Coins },
  { value: 'RUB', label: "RUB (₽ Rubl)", icon: Coins },
  { value: 'EUR', label: "EUR (€ Evro)", icon: Coins },
];

const router = useRouter();
const authStore = useAuthStore();
const themeStore = useThemeStore();
const langStore = useLanguage();
const toast = useToast();
const { formatDate } = useFormat();
const { posSettings, saveSettings } = usePosSettings();

const posSettingInfo: Partial<Record<keyof PosSettings, { title: string; label: string; desc: string }>> = {
  allowDineIn: {
    title: 'Zalda xizmatni o\'chirish',
    label: 'Zalda Xizmat',
    desc: 'Kassada zal stollari bo\'yicha buyurtma qabul qilish va stollar xaritasi yashiriladi.',
  },
  allowTakeaway: {
    title: 'Saboy xizmatini o\'chirish',
    label: 'Saboy (Olib ketish)',
    desc: 'Kassada saboy buyurtma rejimi yashiriladi.',
  },
  allowDelivery: {
    title: 'Yetkazib berish xizmatini o\'chirish',
    label: 'Dostavka (Yetkazib berish)',
    desc: 'Kassada yetkazib berish (dostavka) buyurtma rejimi yashiriladi.',
  },
  allowDebt: {
    title: 'Nasiyani o\'chirish',
    label: 'Nasiya (Qarzga sotish)',
    desc: 'Kassada mijozlarga qarzga sotish imkoniyati o\'chiriladi va to\'lov turlarida Nasiya tugmasi chiqmaydi.',
  },
  allowDiscounts: {
    title: 'Chegirmalarni o\'chirish',
    label: 'Chegirmalar berish',
    desc: 'Kassirlar savatga yoki chek summasiga qo\'lda chegirma qo\'llay olmaydi.',
  },
  quickBarcode: {
    title: 'Tezkor skanerni o\'chirish',
    label: 'Tezkor shtrix-kod skaneri',
    desc: 'Skanerlangan tovarlarni avtomatik savatga qo\'shish to\'xtatiladi.',
  },
  allowZeroStockSale: {
    title: '0 qoldiqli sotishni o\'chirish',
    label: '0 qoldiqli tovarlarni sotish',
    desc: 'Omborda qoldig\'i 0 bo\'lgan mahsulotlarni kassada sotish bloklanadi.',
  },
};

const togglePosSetting = (key: keyof PosSettings) => {
  // If currently active and user wants to turn OFF -> show confirmation modal!
  if (posSettings.value[key]) {
    const info = posSettingInfo[key] || {
      title: 'Sozlamani o\'chirish',
      label: 'Ushbu funksiya',
      desc: 'Ushbu imkoniyat kassada o\'chiriladi.',
    };

    confirmModal.value = {
      open: true,
      title: info.title,
      message: `"${info.label}" funksiyasini o'chirmoqchimisiz? ${info.desc}`,
      onConfirm: () => {
        (posSettings.value as any)[key] = false;
        saveSettings();
        confirmModal.value.open = false;
        toast.info(`"${info.label}" muvaffaqiyatli o'chirildi`, 'Kassa sozlamalari');
      },
    };
    return;
  }

  // If turning ON -> direct enable
  (posSettings.value as any)[key] = true;
  saveSettings();
  const info = posSettingInfo[key];
  toast.success(`"${info?.label || 'Funksiya'}" faollashtirildi!`, 'Kassa sozlamalari');
};

const handleSetDebtLimit = (val: number) => {
  const limit = Math.max(0, val || 0);
  saveSettings({ maxDebtLimit: limit });
  if (limit > 0) {
    toast.success(`Qarz limiti ${limit.toLocaleString('uz-UZ')} so'mga o'rnatildi!`, 'Qarz Limiti');
  } else {
    toast.info('Qarz limiti olib tashlandi (cheksiz)', 'Qarz Limiti');
  }
};

const loading = ref(false);
const loadingEmployees = ref(true);
const loadingAudit = ref(true);
const savingEmp = ref(false);
const deleting = ref(false);

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

// Phase 6: User profile & password states
const savingProfile = ref(false);
const changingPassword = ref(false);

const profileForm = ref({
  fullName: authStore.user?.fullName || '',
  phone: authStore.user?.phone || '',
  email: authStore.user?.email || '',
});

watch(
  () => authStore.user,
  (u) => {
    if (u) {
      profileForm.value = {
        fullName: u.fullName || '',
        phone: u.phone || '',
        email: u.email || '',
      };
    }
  },
  { immediate: true, deep: true },
);

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const selectedCurrency = ref(authStore.activeBusiness?.currency || 'UZS');

watch(
  () => authStore.activeBusiness?.currency,
  (cur) => {
    if (cur) selectedCurrency.value = cur;
  },
  { immediate: true },
);

const handleCurrencyChange = async () => {
  await authStore.updateBusinessCurrency(selectedCurrency.value);
  toast.success(`Valyuta ${selectedCurrency.value} ga o'zgartirildi!`, "Valyuta");
};

const handleSaveUnifiedProfile = async () => {
  savingProfile.value = true;
  try {
    // 1. Update basic profile info
    const cleanPhone = cleanUzbekPhone(profileForm.value.phone);
    await authStore.updateProfile({
      fullName: profileForm.value.fullName,
      phone: cleanPhone,
    });

    // 2. Update currency if changed
    if (selectedCurrency.value !== authStore.activeBusiness?.currency) {
      await authStore.updateBusinessCurrency(selectedCurrency.value);
    }

    // 3. If new password is entered, update password
    if (passwordForm.value.newPassword) {
      if (passwordForm.value.newPassword.length < 4) {
        toast.warning("Yangi parol kamida 4 ta belgidan iborat bo'lishi kerak", "Parol");
        savingProfile.value = false;
        return;
      }

      changingPassword.value = true;
      try {
        await authStore.changePassword({
          currentPassword: passwordForm.value.currentPassword || 'placeholder',
          newPassword: passwordForm.value.newPassword,
        });
      } finally {
        changingPassword.value = false;
      }
    }

    // 4. Save POS / Card settings
    await saveSettings();

    toast.success("Profil va sozlamalar muvaffaqiyatli saqlandi!", "Profil");
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || "Profilni saqlashda xatolik", "Xatolik");
  } finally {
    savingProfile.value = false;
  }
};

const handleUpdateProfile = async () => {
  savingProfile.value = true;
  try {
    const cleanPhone = cleanUzbekPhone(profileForm.value.phone);
    await authStore.updateProfile({
      fullName: profileForm.value.fullName,
      phone: cleanPhone,
    });
    toast.success('Shaxsiy ma\'lumotlaringiz muvaffaqiyatli yangilandi!', 'Profil');
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Profilni yangilashda xatolik', 'Xatolik');
  } finally {
    savingProfile.value = false;
  }
};

const handleChangePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    toast.warning('Yangi parol va tasdiqlovchi parol bir-biriga mos kelmadi!', 'Parol');
    return;
  }
  if (passwordForm.value.newPassword.length < 4) {
    toast.warning('Yangi parol kamida 4 ta belgidan iborat bo\'lishi kerak', 'Parol');
    return;
  }

  changingPassword.value = true;
  try {
    await authStore.changePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword,
    });
    toast.success('Parolingiz muvaffaqiyatli o\'zgartirildi!', 'Xavfsizlik');
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Parolni o\'zgartirishda xatolik', 'Xatolik');
  } finally {
    changingPassword.value = false;
  }
};

const employees = ref<any[]>([]);
const auditLogs = ref<any[]>([]);

const showEmployeeModal = ref(false);
const showConfirmModal = ref(false);
const confirmType = ref<'business' | 'account'>('business');
const confirmInput = ref('');

const empForm = ref({
  fullName: '',
  phone: '+998 ',
  password: '',
  position: 'Sotuvchi',
  allowedModules: ['pos', 'products'],
  actionPermissions: {} as Record<string, { create: boolean; edit: boolean; delete: boolean }>,
});

const getActionPerm = (modId: string) => {
  if (!empForm.value.actionPermissions[modId]) {
    empForm.value.actionPermissions[modId] = { create: true, edit: true, delete: false };
  }
  return empForm.value.actionPermissions[modId];
};

const availableModules = [
  { id: 'pos', label: 'Kassa (POS)', icon: Package },
  { id: 'products', label: 'Mahsulotlar', icon: Package },
  { id: 'inventory', label: 'Ombor & Kirim', icon: Boxes },
  { id: 'customers', label: 'Mijozlar (CRM)', icon: Users },
  { id: 'suppliers', label: 'Ta\'minotchilar', icon: Truck },
  { id: 'tables', label: 'Stollar & Ofitsiant', icon: UtensilsCrossed },
  { id: 'kds', label: 'Oshxona (KDS)', icon: Flame },
  { id: 'appointments', label: 'Bandlovlar', icon: Calendar },
  { id: 'finance', label: 'Moliya & Xarajatlar', icon: DollarSign },
  { id: 'dashboard', label: 'Boshqaruv Paneli', icon: LayoutDashboard },
];

const getModuleLabel = (modId: string) => {
  if (modId === 'tables' || modId === 'restaurant') return 'Stollar & Ofitsiant';
  if (modId === 'kds') return 'Oshxona (KDS)';
  if (modId === 'pos' || modId === 'orders') return 'Kassa (POS)';
  if (modId === 'products') return 'Mahsulotlar';
  if (modId === 'inventory') return 'Ombor & Kirim';
  if (modId === 'customers') return 'Mijozlar (CRM)';
  if (modId === 'suppliers') return 'Ta\'minotchilar';
  if (modId === 'appointments') return 'Bandlovlar';
  if (modId === 'finance') return 'Moliya & Xarajatlar';
  if (modId === 'dashboard') return 'Boshqaruv Paneli';
  if (modId === 'all') return 'Barchasi (Admin)';
  const m = availableModules.find((item) => item.id === modId);
  return m ? m.label : modId;
};

const loadEmployees = async () => {
  loadingEmployees.value = true;
  try {
    const { data } = await api.get('/employees');
    employees.value = data || [];
  } catch (err) {
    console.error(err);
  } finally {
    loadingEmployees.value = false;
  }
};

const editingEmpId = ref<string | null>(null);

const openAddEmployeeModal = () => {
  editingEmpId.value = null;
  empForm.value = {
    fullName: '',
    phone: '+998 ',
    password: '',
    position: 'Sotuvchi',
    allowedModules: ['pos', 'products'],
    actionPermissions: {
      pos: { create: true, edit: true, delete: false },
      products: { create: true, edit: true, delete: false },
      inventory: { create: true, edit: true, delete: false },
      customers: { create: true, edit: true, delete: false },
      suppliers: { create: true, edit: true, delete: false },
      finance: { create: true, edit: true, delete: false },
    },
  };
  showEmployeeModal.value = true;
};

const editEmployee = (emp: any) => {
  editingEmpId.value = emp.id;
  const validModuleIds = new Set(availableModules.map((item) => item.id));
  let modules = (emp.allowedModules && emp.allowedModules.length > 0 ? emp.allowedModules : ['pos', 'products'])
    .filter((m: string) => validModuleIds.has(m));
  
  if (modules.length === 0) modules = ['pos'];

  const basePermissions: Record<string, { create: boolean; edit: boolean; delete: boolean }> = {
    pos: { create: true, edit: true, delete: false },
    products: { create: true, edit: true, delete: false },
    inventory: { create: true, edit: true, delete: false },
    customers: { create: true, edit: true, delete: false },
    suppliers: { create: true, edit: true, delete: false },
    tables: { create: true, edit: true, delete: false },
    kds: { create: true, edit: true, delete: false },
    finance: { create: true, edit: true, delete: false },
    appointments: { create: true, edit: true, delete: false },
  };

  const currentPermissions = emp.actionPermissions ? JSON.parse(JSON.stringify(emp.actionPermissions)) : {};
  for (const key of Object.keys(basePermissions)) {
    if (!currentPermissions[key]) {
      currentPermissions[key] = { ...basePermissions[key] };
    }
  }

  empForm.value = {
    fullName: emp.fullName,
    phone: emp.phone,
    password: '',
    position: emp.position || 'Sotuvchi',
    allowedModules: [...modules],
    actionPermissions: currentPermissions,
  };
  showEmployeeModal.value = true;
};

const saveEmployee = async () => {
  if (savingEmp.value) return;
  if (!empForm.value.fullName.trim()) {
    toast.warning('Xodimning ism va familiyasini kiriting', 'Ism');
    return;
  }

  if (empForm.value.allowedModules.length === 0) {
    toast.warning('Kamida bitta bo\'limni tanlashingiz kerak', 'Ruxsat');
    return;
  }

  const clean = cleanUzbekPhone(empForm.value.phone);
  if (clean.length < 13) {
    toast.warning('Telefon raqamni to\'liq 9 ta raqamda kiriting (+998 90 123 45 67)', 'Telefon');
    return;
  }

  if (!editingEmpId.value && (!empForm.value.password || empForm.value.password.length < 4)) {
    toast.warning('Yangi xodim uchun kamida 4 yoki 6 xonali parol kiriting', 'Parol');
    return;
  }

  savingEmp.value = true;
  try {
    const payload: any = {
      fullName: empForm.value.fullName.trim(),
      phone: clean,
      position: empForm.value.position,
      allowedModules: empForm.value.allowedModules,
      actionPermissions: empForm.value.actionPermissions,
    };
    if (empForm.value.password && empForm.value.password.trim()) {
      payload.password = empForm.value.password.trim();
    }

    if (editingEmpId.value) {
      await api.put(`/employees/${editingEmpId.value}`, payload);
      toast.success(`"${empForm.value.fullName}" ma'lumotlari muvaffaqiyatli yangilandi!`, 'Xodim');
    } else {
      await api.post('/employees', payload);
      toast.success(`"${empForm.value.fullName}" muvaffaqiyatli xodim sifatida qo'shildi!`, 'Xodim');
    }
    showEmployeeModal.value = false;
    await loadEmployees();
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Xodimni saqlashda xatolik yuz berdi', 'Xatolik');
  } finally {
    savingEmp.value = false;
  }
};

const deleteEmployee = (emp: any) => {
  confirmModal.value = {
    open: true,
    title: "Xodimni o'chirish",
    message: `Haqiqatan ham "${emp.fullName}" xodimini o'chirmoqchimisiz?`,
    onConfirm: async () => {
      try {
        await api.delete(`/employees/${emp.id}`);
        toast.success('Xodim muvaffaqiyatli o\'chirildi', 'O\'chirildi');
        await loadEmployees();
      } catch (err: any) {
        toast.error(err.response?.data?.message || err.message || 'Xodimni o\'chirishda xatolik yuz berdi', 'Xatolik');
      } finally {
        confirmModal.value.open = false;
      }
    },
  };
};

const loadAudit = async () => {
  loadingAudit.value = true;
  try {
    const { data } = await api.get('/audit-logs');
    auditLogs.value = data || [];
  } catch (err) {
    console.error(err);
  } finally {
    loadingAudit.value = false;
  }
};

const openDeleteBusinessModal = () => {
  confirmType.value = 'business';
  confirmInput.value = '';
  showConfirmModal.value = true;
};

const openDeleteAccountModal = () => {
  confirmType.value = 'account';
  confirmInput.value = '';
  showConfirmModal.value = true;
};

const executeDeletion = async () => {
  if (confirmInput.value !== 'OCHIRISH') return;

  deleting.value = true;
  try {
    if (confirmType.value === 'business') {
      const bizId = authStore.activeBusiness?.id;
      if (!bizId) throw new Error('Biznes topilmadi');
      await api.delete(`/businesses/${bizId}`);
      toast.success('Biznes va barcha ma\'lumotlar muvaffaqiyatli o\'chirildi', 'O\'chirildi');
      showConfirmModal.value = false;
      
      // Refresh user auth state
      authStore.logout();
      window.location.href = '/auth/login';
    } else {
      await api.delete('/businesses/account/me');
      toast.success('Hisobingiz muvaffaqiyatli o\'chirildi', 'O\'chirildi');
      showConfirmModal.value = false;
      authStore.logout();
      window.location.href = '/auth/register';
    }
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'O\'chirishda xatolik yuz berdi', 'Xatolik');
  } finally {
    deleting.value = false;
  }
};

// Receipt & Printer Settings State
const testOrderForReceipt = ref<any | null>(null);

const receiptSettings = ref({
  enableReceiptPrinting: true,
  paperSize: '58mm',
  headerTitle: '',
  headerSubtitle: '',
  footerText: 'Xaridingiz uchun rahmat! Qaytarish 24 soat ichida chek bilan.',
  showBarcode: true,
  showQrCode: true,
  showCashier: true,
  showCustomer: true,
  autoPrint: false,
});

const loadReceiptSettings = () => {
  try {
    const raw = localStorage.getItem('ubms_receipt_settings');
    if (raw) {
      receiptSettings.value = { ...receiptSettings.value, ...JSON.parse(raw) };
    } else {
      receiptSettings.value.enableReceiptPrinting = posSettings.value.enableReceiptPrinting !== false;
      receiptSettings.value.paperSize = posSettings.value.receiptWidth || '58mm';
      receiptSettings.value.headerTitle = posSettings.value.receiptHeaderTitle || '';
      receiptSettings.value.headerSubtitle = posSettings.value.receiptAddress || '';
      receiptSettings.value.footerText = posSettings.value.receiptFooterMessage || 'Xaridingiz uchun rahmat! Qaytarish 24 soat ichida chek bilan.';
      receiptSettings.value.autoPrint = posSettings.value.autoPrintReceipt || false;
      receiptSettings.value.showCashier = posSettings.value.showCashierName !== false;
    }
  } catch (e) {}
};

const saveReceiptSettings = () => {
  localStorage.setItem('ubms_receipt_settings', JSON.stringify(receiptSettings.value));
  saveSettings({
    enableReceiptPrinting: receiptSettings.value.enableReceiptPrinting,
    autoPrintReceipt: receiptSettings.value.autoPrint,
    receiptWidth: (receiptSettings.value.paperSize as any) || '58mm',
    receiptHeaderTitle: receiptSettings.value.headerTitle,
    receiptAddress: receiptSettings.value.headerSubtitle,
    receiptFooterMessage: receiptSettings.value.footerText,
    showCashierName: receiptSettings.value.showCashier,
  });
  toast.success('Chek va printer sozlamalari muvaffaqiyatli saqlandi!', 'Chek Sozlamalari');
};

const triggerTestPrint = () => {
  testOrderForReceipt.value = {
    orderNumber: '#0042',
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    subtotal: 42000,
    discountAmount: 0,
    total: 42000,
    cashier: { fullName: authStore.user?.fullName || 'BOT (Kassir)' },
    customer: { fullName: 'Alisherjon Habibullayev', phone: '+998 90 123 45 67' },
    items: [
      { id: '1', product: { name: 'Coca-Cola 1.5L' }, quantity: 2, unitPrice: 14000, total: 28000 },
      { id: '2', product: { name: 'Nestle Sut 1L' }, quantity: 1, unitPrice: 14000, total: 14000 },
    ],
    payments: [
      { id: 'p1', paymentMethod: { name: 'Naqd pul', type: 'cash' }, amount: 42000 },
    ],
  };
  setTimeout(() => {
    window.print();
  }, 150);
};

watch(
  () => authStore.activeBusiness?.id,
  (newId) => {
    if (newId) {
      if (activeTab.value === 'employees') loadEmployees();
      if (activeTab.value === 'audit') loadAudit();
    }
  },
);

watch(activeTab, (tab) => {
  if (tab === 'employees' && employees.value.length === 0) {
    loadEmployees();
  } else if (tab === 'audit' && auditLogs.value.length === 0) {
    loadAudit();
  }
});

onMounted(async () => {
  loadReceiptSettings();
  await authStore.fetchBusinesses();
  await authStore.fetchProfile();
  if (activeTab.value === 'employees') {
    loadEmployees();
  } else if (activeTab.value === 'audit') {
    loadAudit();
  }
});
</script>
