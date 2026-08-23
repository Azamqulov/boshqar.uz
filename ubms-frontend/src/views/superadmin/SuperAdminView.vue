<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <div class="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
            <ShieldCheck class="w-6 h-6" />
          </div>
          <div>
            <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              SuperAdmin Nazorat Markazi
              <span class="text-xs uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 font-mono font-bold">
                Platform Gov
              </span>
            </h1>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Barcha bizneslar, firma egalari (owners), foydalanuvchilar va umumiy monitoring</p>
          </div>
        </div>
      </div>

      <button
        @click="loadAllData"
        :disabled="loading"
        class="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition border border-slate-200 dark:border-slate-700 btn-interactive"
      >
        <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
        <span>Yangilash</span>
      </button>
    </div>

    <!-- Global Stats Cards -->
    <SuperAdminHeaderStats :stats="stats" />

    <!-- Navigation Tabs: Responsive Mobile Carousel + Desktop Slider -->
    <SuperAdminTabNav
      :active-tab="activeTab"
      :current-tab-index="currentTabIndex"
      :admin-tabs="adminTabs"
      @select-tab="selectTab"
      @prev-tab="selectPrevTab"
      @next-tab="selectNextTab"
    />

    <!-- TAB 1: DEMO LEADS & PROSPECTS -->
    <SuperAdminLeadsTab
      v-if="activeTab === 'leads'"
    />

    <!-- TAB 2: OWNERS MONITORING -->
    <SuperAdminOwnersTab
      v-else-if="activeTab === 'owners'"
      :owners="owners"
      :loading="loading"
      v-model:search="ownerSearch"
      v-model:plan-filter="ownerPlanFilter"
      v-model:status-filter="ownerStatusFilter"
      v-model:view-mode="viewMode"
      @filter-changed="loadOwners"
      @open-detail-modal="openOwnerDetailModal"
    />

    <!-- TAB 3: BUSINESSES -->
    <SuperAdminBusinessesTab
      v-else-if="activeTab === 'businesses'"
      :businesses="businesses"
      :loading="loading"
      v-model:search="businessSearch"
      v-model:status-filter="businessStatusFilter"
      v-model:view-mode="viewMode"
      @open-plan-modal="openPlanModal"
      @toggle-status="toggleBusinessStatus"
    />

    <!-- TAB 4: USERS -->
    <SuperAdminUsersTab
      v-else-if="activeTab === 'users'"
      :users="users"
      :loading="loading"
      v-model:search="userSearch"
      v-model:view-mode="viewMode"
      @toggle-super-admin="toggleSuperAdminPrivilege"
      @toggle-status="toggleUserStatus"
    />

    <!-- TAB 5: AUDIT LOGS -->
    <SuperAdminAuditTab
      v-else-if="activeTab === 'audit'"
      :audit-logs="auditLogs"
      :loading="loading"
      v-model:view-mode="viewMode"
      @refresh="loadAllData"
    />

    <!-- TAB 6: BUSINESS TYPES CONFIGURATION -->
    <SuperAdminBusinessTypesTab
      v-else-if="activeTab === 'businessTypes'"
      :business-types-list="businessTypesList"
      :loading-type-toggle="loadingTypeToggle"
      @toggle="toggleBusinessTypeAction"
    />

    <!-- TAB 7: BILLING & PAYMENT REQUISITES -->
    <SuperAdminBillingTab
      v-else-if="activeTab === 'billing'"
    />

    <!-- TAB 8: DATABASE BACKUPS -->
    <SuperAdminBackupsTab
      v-else-if="activeTab === 'backups'"
    />

    <!-- TAB 9: MAINTENANCE MODE -->
    <SuperAdminMaintenanceTab
      v-else-if="activeTab === 'maintenance'"
    />

    <!-- OWNER DETAIL & MONITORING MODAL -->
    <SuperAdminOwnerDetailModal
      :is-open="showOwnerModal"
      :owner-detail="ownerDetail"
      :plans="plans"
      :loading="isSavingOwnerAction"
      @close="showOwnerModal = false"
      @save-plan="saveOwnerPlan"
      @toggle-status="toggleOwnerStatusAction"
    />

    <!-- Modal: Change Plan for Business -->
    <div v-if="showPlanModal" @click.self="showPlanModal = false" class="modal-overlay">
      <div class="modal-container max-w-md" @click.stop>
        <div class="modal-header">
          <h3 class="text-base font-bold text-slate-900 dark:text-white">Tarif Rejasini O'zgartirish</h3>
          <button @click="showPlanModal = false" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"><X class="w-5 h-5" /></button>
        </div>

        <div class="modal-body">
          <p class="text-xs text-slate-600 dark:text-slate-300">
            <strong>{{ selectedBusiness?.name }}</strong> biznesi uchun yangi tarif rejasini tanlang:
          </p>

          <div class="space-y-2">
            <label
              v-for="p in plans"
              :key="p.id"
              class="flex items-center justify-between p-3 rounded-xl border transition cursor-pointer"
              :class="selectedPlanId === p.id ? 'border-emerald-500 bg-emerald-500/10 text-slate-900 dark:text-white' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'"
            >
              <div class="flex items-center gap-3">
                <input type="radio" :value="p.id" v-model="selectedPlanId" class="text-emerald-600 focus:ring-emerald-500" />
                <div>
                  <span class="font-bold text-sm block">{{ p.name }}</span>
                  <span class="text-[11px] text-slate-400">{{ Number(p.priceMonthly) === 0 ? 'Bepul' : formatCurrency(p.priceMonthly) + ' / oy' }}</span>
                </div>
              </div>
            </label>
          </div>

          <!-- Duration / Period Selector -->
          <div class="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <div class="flex items-center justify-between">
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Faollashtirish Muddati:
              </label>
              <button
                type="button"
                @click="selectedDurationDays = 0"
                class="text-[11px] font-bold px-2 py-0.5 rounded-lg transition"
                :class="selectedDurationDays === 0 ? 'bg-rose-500 text-white' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20'"
              >
                0 kun (Tugatish)
              </button>
            </div>
            <div class="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-xs">
              <button
                type="button"
                @click="selectedDurationDays = 0"
                class="py-2 px-1 rounded-xl font-bold transition text-center border"
                :class="selectedDurationDays === 0 ? 'bg-rose-500 text-white border-rose-500 shadow-sm' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:border-rose-500'"
              >
                0 kun
              </button>
              <button
                type="button"
                v-for="d in [15, 30, 90, 180, 365]"
                :key="d"
                @click="selectedDurationDays = d"
                class="py-2 px-1 rounded-xl font-bold transition text-center border"
                :class="selectedDurationDays === d ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500'"
              >
                {{ d === 15 ? '15 kun (Trial)' : d === 30 ? '1 oy' : d === 90 ? '3 oy' : d === 180 ? '6 oy' : '1 yil' }}
              </button>
            </div>
            <div class="flex items-center gap-2 pt-1">
              <span class="text-[11px] text-slate-500 dark:text-slate-400 shrink-0">Ixtiyoriy kun soni:</span>
              <input
                type="number"
                v-model.number="selectedDurationDays"
                min="0"
                max="3650"
                class="w-24 px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500"
              />
              <span class="text-[11px] text-slate-500 font-bold">kun</span>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button
            @click="showPlanModal = false"
            class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Bekor qilish
          </button>
          <button
            @click="saveBusinessPlan"
            :disabled="isSavingBusinessPlan"
            class="px-4 py-2 rounded-xl text-xs font-bold transition btn-interactive disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none flex items-center gap-1.5"
            :class="selectedDurationDays === 0 ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/25' : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'"
          >
            <span v-if="isSavingBusinessPlan" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>{{ selectedDurationDays === 0 ? 'Tarifni Tugatish (Expire)' : 'Saqlash' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../../services/api';
import { useFormat } from '../../composables/useFormat';
import { useToast } from '../../composables/useToast';
import AppSelect from '../../components/AppSelect.vue';
import AppInput from '../../components/AppInput.vue';
import AppViewToggle from '../../components/AppViewToggle.vue';
import SuperAdminHeaderStats from './components/SuperAdminHeaderStats.vue';
import SuperAdminTabNav from './components/SuperAdminTabNav.vue';
import SuperAdminLeadsTab from './components/SuperAdminLeadsTab.vue';
import SuperAdminOwnersTab from './components/SuperAdminOwnersTab.vue';
import SuperAdminBusinessesTab from './components/SuperAdminBusinessesTab.vue';
import SuperAdminUsersTab from './components/SuperAdminUsersTab.vue';
import SuperAdminAuditTab from './components/SuperAdminAuditTab.vue';
import SuperAdminBusinessTypesTab from './components/SuperAdminBusinessTypesTab.vue';
import SuperAdminBillingTab from './components/SuperAdminBillingTab.vue';
import SuperAdminBackupsTab from './components/SuperAdminBackupsTab.vue';
import SuperAdminMaintenanceTab from './components/SuperAdminMaintenanceTab.vue';
import SuperAdminOwnerDetailModal from './components/SuperAdminOwnerDetailModal.vue';
import {
  ShieldCheck,
  Building2,
  Users,
  CreditCard,
  Receipt,
  RefreshCw,
  Crown,
  X,
  Sliders,
  Database,
  UtensilsCrossed,
  Coffee,
  Scissors,
  Pill,
  Wrench,
  ShoppingBag,
  Target,
  ChevronLeft,
  ChevronRight,
} from 'lucide-vue-next';

import { usePersistentTab } from '../../composables/usePersistentTab';
import { usePersistentViewMode } from '../../composables/usePersistentViewMode';

const toast = useToast();
const route = useRoute();
const router = useRouter();
const { formatCurrency, formatDate } = useFormat();

const validTabs = ['leads', 'owners', 'businesses', 'users', 'billing', 'audit', 'businessTypes', 'backups', 'maintenance'] as const;
type SuperAdminTab = typeof validTabs[number];

const activeTab = usePersistentTab<SuperAdminTab>('superadmin', 'leads', validTabs);

const tabRefs = reactive<Record<string, HTMLElement>>({});
const mobileTabRefs = reactive<Record<string, HTMLElement>>({});
const isMounted = ref(false);

const setTabRef = (el: any, id: string) => {
  if (el) tabRefs[id] = el;
};

const setMobileTabRef = (el: any, id: string) => {
  if (el) mobileTabRefs[id] = el;
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

const adminTabs = computed(() => [
  { id: 'leads' as const, label: 'Demo & Leadlar', icon: Target },
  { id: 'owners' as const, label: 'Mijozlar CRM', icon: Crown, count: owners.value.length },
  { id: 'businesses' as const, label: 'Korxonalar & Obunalar', icon: Building2, count: businesses.value.length },
  { id: 'users' as const, label: 'Xodimlar & Rollar', icon: Users, count: users.value.length },
  { id: 'billing' as const, label: "To'lovlar & Rekvizitlar", icon: Receipt },
  { id: 'audit' as const, label: 'Audit Tarixi', icon: ShieldCheck },
  { id: 'businessTypes' as const, label: 'Biznes Turlari', icon: Sliders },
  { id: 'backups' as const, label: 'Baza Zaxiralari', icon: Database },
  { id: 'maintenance' as const, label: 'Texnik Rejim', icon: Wrench },
]);

const tabContainerRef = ref<HTMLElement | null>(null);
const mobileTabContainerRef = ref<HTMLElement | null>(null);

const currentTabIndex = computed(() => {
  return adminTabs.value.findIndex((t) => t.id === activeTab.value);
});

const selectTab = (tabId: SuperAdminTab) => {
  activeTab.value = tabId;
  scrollActiveTabIntoView();
};

const selectPrevTab = () => {
  const idx = currentTabIndex.value;
  if (idx > 0) {
    selectTab(adminTabs.value[idx - 1].id);
  }
};

const selectNextTab = () => {
  const idx = currentTabIndex.value;
  if (idx >= 0 && idx < adminTabs.value.length - 1) {
    selectTab(adminTabs.value[idx + 1].id);
  }
};

const scrollActiveTabIntoView = () => {
  setTimeout(() => {
    // Desktop container scroll
    const el = tabRefs[activeTab.value];
    if (el && tabContainerRef.value) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    // Mobile container scroll
    const mobEl = mobileTabRefs[activeTab.value];
    if (mobEl && mobileTabContainerRef.value) {
      mobEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, 50);
};

watch(() => activeTab.value, () => {
  scrollActiveTabIntoView();
});

// Sync with route query tab
watch(
  () => route.query.tab,
  (newTab) => {
    if (newTab && validTabs.includes(newTab as SuperAdminTab)) {
      activeTab.value = newTab as SuperAdminTab;
    }
  },
  { immediate: true }
);

watch(activeTab, (tab) => {
  if (route.path === '/superadmin' && route.query.tab !== tab) {
    router.replace({ query: { ...route.query, tab } });
  }
  loadActiveTabData(tab);
});
const viewMode = usePersistentViewMode('superadmin', 'table');
const loading = ref(true);

const stats = ref<any>({});
const owners = ref<any[]>([]);
const businesses = ref<any[]>([]);
const users = ref<any[]>([]);
const plans = ref<any[]>([]);
const auditLogs = ref<any[]>([]);
const businessTypesList = ref<any[]>([]);
const loadingTypeToggle = ref<string | null>(null);

const ownerSearch = ref('');
const ownerPlanFilter = ref('');
const ownerStatusFilter = ref('');

const businessSearch = ref('');
const businessStatusFilter = ref('');
const userSearch = ref('');

const showPlanModal = ref(false);
const selectedBusiness = ref<any>(null);
const selectedPlanId = ref('');
const selectedDurationDays = ref(30);

// Owner Detail & Stats Modal
const showOwnerModal = ref(false);
const ownerDetail = ref<any | null>(null);

const maxOwnerChartValue = computed(() => {
  if (!ownerDetail.value?.chartData || ownerDetail.value.chartData.length === 0) return 1;
  const max = Math.max(...ownerDetail.value.chartData.map((c: any) => c.sales));
  return max === 0 ? 100000 : max;
});

const getBusinessTypeIcon = (type: string) => {
  switch (type) {
    case 'restaurant': return UtensilsCrossed;
    case 'cafe': return Coffee;
    case 'barbershop': return Scissors;
    case 'pharmacy': return Pill;
    case 'service': return Wrench;
    case 'shop':
    default:
      return ShoppingBag;
  }
};

const loadStats = async () => {
  try {
    const { data } = await api.get('/superadmin/stats');
    stats.value = data || {};
  } catch (err) {
    console.error('Failed to load stats', err);
  }
};

const loadPlans = async () => {
  try {
    const { data } = await api.get('/superadmin/plans');
    plans.value = data || [];
  } catch (err) {
    console.error('Failed to load plans', err);
  }
};

const loadOwners = async () => {
  try {
    const params = new URLSearchParams();
    if (ownerSearch.value) params.append('search', ownerSearch.value);
    if (ownerPlanFilter.value) params.append('plan', ownerPlanFilter.value);
    if (ownerStatusFilter.value) params.append('status', ownerStatusFilter.value);

    const { data } = await api.get(`/superadmin/owners?${params.toString()}`);
    owners.value = data?.items || [];
  } catch (err) {
    console.error('Failed to load owners', err);
  }
};

const loadBusinesses = async () => {
  try {
    const { data } = await api.get('/superadmin/businesses');
    businesses.value = data || [];
  } catch (err) {
    console.error('Failed to load businesses', err);
  }
};

const loadUsers = async () => {
  try {
    const { data } = await api.get('/superadmin/users');
    users.value = data || [];
  } catch (err) {
    console.error('Failed to load users', err);
  }
};

const loadAuditLogs = async () => {
  try {
    const { data } = await api.get('/superadmin/audit-logs');
    auditLogs.value = data || [];
  } catch (err) {
    console.error('Failed to load audit logs', err);
  }
};

const loadBusinessTypes = async () => {
  try {
    const { data } = await api.get('/superadmin/business-types');
    businessTypesList.value = data || [];
  } catch (err) {
    console.error('Failed to load business types', err);
  }
};

const loadedTabs = reactive<Record<string, boolean>>({});

const loadActiveTabData = async (tab = activeTab.value, force = false) => {
  if (loadedTabs[tab] && !force) return;

  loading.value = true;
  try {
    switch (tab) {
      case 'leads':
        break;
      case 'owners':
        await Promise.all([loadOwners(), plans.value.length === 0 ? loadPlans() : Promise.resolve()]);
        break;
      case 'businesses':
        await Promise.all([loadBusinesses(), plans.value.length === 0 ? loadPlans() : Promise.resolve()]);
        break;
      case 'users':
        await loadUsers();
        break;
      case 'audit':
        await loadAuditLogs();
        break;
      case 'businessTypes':
        await loadBusinessTypes();
        break;
      case 'billing':
      case 'backups':
        break;
    }
    loadedTabs[tab] = true;
  } catch (err) {
    console.error(`Failed to load tab data: ${tab}`, err);
  } finally {
    loading.value = false;
  }
};

const loadAllData = async () => {
  await Promise.allSettled([
    loadActiveTabData(activeTab.value, true),
    loadStats(),
    loadPlans(),
  ]);
};

const toggleBusinessTypeAction = async (bt: any) => {
  loadingTypeToggle.value = bt.type;
  try {
    const newStatus = !bt.isEnabled;
    await api.patch(`/superadmin/business-types/${bt.type}/toggle`, { isEnabled: newStatus });
    bt.isEnabled = newStatus;
    toast.success(
      `«${bt.label}» biznes turi muvaffaqiyatli ${bt.isEnabled ? 'faollashtirildi (ruxsat berildi)' : 'to\'xtatildi (taqiqlandi)'}!`,
      'Biznes Turi Sozlamasi'
    );
  } catch (err) {
    toast.error('Biznes turi sozlamasini o\'zgartirishda xatolik', 'Xatolik');
  } finally {
    loadingTypeToggle.value = null;
  }
};

const openOwnerDetailModal = async (ownerId: string) => {
  try {
    const { data } = await api.get(`/superadmin/owners/${ownerId}/stats`);
    ownerDetail.value = data;
    showOwnerModal.value = true;
  } catch (err) {
    toast.error('Firma egasi statistikasini yuklashda xatolik', 'Xatolik');
  }
};

const isSavingOwnerAction = ref(false);

const toggleOwnerStatusAction = async (ownerId: string, currentStatus: string) => {
  if (isSavingOwnerAction.value) return;
  isSavingOwnerAction.value = true;
  const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
  // Optimistic update
  if (ownerDetail.value?.owner) {
    ownerDetail.value.owner.status = newStatus;
  }
  const targetOwner = owners.value.find((o: any) => o.id === ownerId);
  if (targetOwner) {
    targetOwner.status = newStatus;
  }
  toast.success(`Firma egasi muvaffaqiyatli ${newStatus === 'active' ? 'faollashtirildi' : 'bloklandi'}!`, 'Owner Status');

  try {
    await api.patch(`/superadmin/owners/${ownerId}/status`, { status: newStatus });
  } catch (err) {
    toast.error('Statusni o\'zgartirishda xatolik', 'Xatolik');
    loadOwners();
  } finally {
    isSavingOwnerAction.value = false;
  }
};

const saveOwnerPlan = async (ownerId: string, planId: string, durationDays?: number) => {
  if (isSavingOwnerAction.value) return;
  isSavingOwnerAction.value = true;
  const days = durationDays !== undefined && durationDays !== null ? durationDays : 30;
  const isExpiring = days === 0;

  // Optimistic update
  const chosenPlan = plans.value.find((p: any) => p.id === planId);
  const targetOwner = owners.value.find((o: any) => o.id === ownerId);
  if (targetOwner) {
    targetOwner.plan = chosenPlan?.name || targetOwner.plan;
  }
  if (ownerDetail.value?.business) {
    ownerDetail.value.business.plan = chosenPlan?.name || ownerDetail.value.business.plan;
    ownerDetail.value.business.planId = planId;
  }

  if (isExpiring) {
    toast.warning('Firma egasining obuna muddati darhol tugatildi!', 'Obuna Tugatildi');
  } else {
    toast.success(`Tarif rejasi muvaffaqiyatli yangilandi (${days} kunga)!`, 'Tarif');
  }

  try {
    await api.patch(`/superadmin/owners/${ownerId}/plan`, {
      planId,
      durationDays: days,
    });
  } catch (err) {
    toast.error('Tarifni yangilashda xatolik', 'Xatolik');
    loadOwners();
  } finally {
    isSavingOwnerAction.value = false;
  }
};

const filteredBusinesses = computed(() => {
  return businesses.value.filter((b) => {
    const matchesSearch =
      !businessSearch.value ||
      b.name.toLowerCase().includes(businessSearch.value.toLowerCase()) ||
      b.owner?.fullName?.toLowerCase().includes(businessSearch.value.toLowerCase()) ||
      b.owner?.phone?.includes(businessSearch.value);

    const matchesStatus =
      !businessStatusFilter.value || b.status === businessStatusFilter.value;

    return matchesSearch && matchesStatus;
  });
});

const filteredUsers = computed(() => {
  return users.value.filter((u) => {
    return (
      !userSearch.value ||
      u.fullName.toLowerCase().includes(userSearch.value.toLowerCase()) ||
      u.phone?.includes(userSearch.value) ||
      u.email?.toLowerCase().includes(userSearch.value.toLowerCase())
    );
  });
});

const getPlanBadgeClass = (planName: string) => {
  if (planName === 'Business') return 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30';
  if (planName === 'Pro') return 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30';
  return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
};

const toggleBusinessStatus = async (b: any) => {
  const newStatus = b.status === 'active' ? 'suspended' : 'active';
  b.status = newStatus;
  toast.success(`Biznes holati «${newStatus === 'active' ? 'Faol' : 'To\'xtatilgan'}» ga o'zgartirildi`, 'Biznes');
  try {
    await api.patch(`/superadmin/businesses/${b.id}/status`, { status: newStatus });
  } catch (err) {
    toast.error('Biznes statusini o\'zgartirishda xatolik', 'Xatolik');
    b.status = newStatus === 'active' ? 'suspended' : 'active';
  }
};

const toggleUserStatus = async (u: any) => {
  const newStatus = u.status === 'active' ? 'blocked' : 'active';
  u.status = newStatus;
  toast.success(`Foydalanuvchi «${newStatus === 'active' ? 'Faol' : 'Bloklangan'}» ga o'zgartirildi`, 'Foydalanuvchi');
  try {
    await api.patch(`/superadmin/users/${u.id}/status`, { status: newStatus });
  } catch (err) {
    toast.error('Foydalanuvchi statusini o\'zgartirishda xatolik', 'Xatolik');
    u.status = newStatus === 'active' ? 'blocked' : 'active';
  }
};

const toggleSuperAdminPrivilege = async (u: any) => {
  try {
    const { data } = await api.patch(`/superadmin/users/${u.id}/toggle-superadmin`);
    u.isSuperAdmin = data.isSuperAdmin;
    toast.success('SuperAdmin huquqi o\'zgartirildi', 'Huquq');
  } catch (err) {
    toast.error('SuperAdmin huquqini o\'zgartirishda xatolik', 'Xatolik');
  }
};

const openPlanModal = (b: any) => {
  selectedBusiness.value = b;
  selectedPlanId.value = b.planId || plans.value[0]?.id;
  selectedDurationDays.value = 30;
  showPlanModal.value = true;
};

const isSavingBusinessPlan = ref(false);

const saveBusinessPlan = async () => {
  if (!selectedBusiness.value || !selectedPlanId.value || isSavingBusinessPlan.value) return;
  isSavingBusinessPlan.value = true;
  const biz = selectedBusiness.value;
  const pId = selectedPlanId.value;
  const days = selectedDurationDays.value ?? 30;
  const isExpiring = days === 0;

  // Optimistic update
  const chosenPlan = plans.value.find((p: any) => p.id === pId);
  biz.planId = pId;
  biz.plan = chosenPlan?.name || biz.plan;
  if (biz.subscription) {
    biz.subscription.isExpired = isExpiring;
    biz.subscription.daysLeft = days;
    biz.subscription.status = isExpiring ? 'past_due' : 'active';
  }
  showPlanModal.value = false;

  if (isExpiring) {
    toast.warning(`«${biz.name}» biznesining obuna muddati darhol tugatildi!`, 'Obuna Tugatildi');
  } else {
    toast.success(`Biznes tarifi muvaffaqiyatli saqlandi (${days} kunga faollashtirildi)`, 'Tarif');
  }

  try {
    await api.patch(`/superadmin/businesses/${biz.id}/plan`, {
      planId: pId,
      durationDays: days,
    });
  } catch (err) {
    toast.error('Tarifni saqlashda xatolik', 'Xatolik');
    loadAllData();
  } finally {
    isSavingBusinessPlan.value = false;
  }
};

onMounted(() => {
  isMounted.value = true;
  // 1. Priority: Instantly load the active tab's data
  loadActiveTabData(activeTab.value, true);
  // 2. Background async load for stats and plans
  loadStats();
  loadPlans();
});
</script>
