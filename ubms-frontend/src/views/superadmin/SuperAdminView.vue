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

    <!-- Navigation Tabs -->
    <div class="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs overflow-x-auto">
      <button
        @click="activeTab = 'owners'"
        class="px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 whitespace-nowrap btn-interactive"
        :class="activeTab === 'owners' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'"
      >
        <Crown class="w-4 h-4" />
        <span>Firma Egalari (Owners)</span>
      </button>

      <button
        @click="activeTab = 'businesses'"
        class="px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 whitespace-nowrap btn-interactive"
        :class="activeTab === 'businesses' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'"
      >
        <Building2 class="w-4 h-4" />
        <span>Barcha Bizneslar ({{ businesses.length }})</span>
      </button>

      <button
        @click="activeTab = 'users'"
        class="px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 whitespace-nowrap btn-interactive"
        :class="activeTab === 'users' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'"
      >
        <Users class="w-4 h-4" />
        <span>Foydalanuvchilar ({{ users.length }})</span>
      </button>

      <button
        @click="activeTab = 'plans'"
        class="px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 whitespace-nowrap btn-interactive"
        :class="activeTab === 'plans' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'"
      >
        <CreditCard class="w-4 h-4" />
        <span>Tarif Rejalari (SaaS)</span>
      </button>

      <button
        @click="activeTab = 'audit'"
        class="px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 whitespace-nowrap btn-interactive"
        :class="activeTab === 'audit' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'"
      >
        <ShieldCheck class="w-4 h-4" />
        <span>Global Audit Tarixi</span>
      </button>

      <button
        @click="activeTab = 'businessTypes'"
        class="px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 whitespace-nowrap btn-interactive"
        :class="activeTab === 'businessTypes' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'"
      >
        <Sliders class="w-4 h-4" />
        <span>Biznes Turlari Sozlamalari</span>
      </button>
    </div>

    <!-- TAB 1: OWNERS MONITORING -->
    <SuperAdminOwnersTab
      v-if="activeTab === 'owners'"
      :owners="owners"
      v-model:search="ownerSearch"
      v-model:plan-filter="ownerPlanFilter"
      v-model:status-filter="ownerStatusFilter"
      v-model:view-mode="viewMode"
      @filter-changed="loadOwners"
      @open-detail-modal="openOwnerDetailModal"
    />

    <!-- TAB 2: BUSINESSES -->
    <SuperAdminBusinessesTab
      v-else-if="activeTab === 'businesses'"
      :businesses="businesses"
      v-model:search="businessSearch"
      v-model:status-filter="businessStatusFilter"
      v-model:view-mode="viewMode"
      @open-plan-modal="openPlanModal"
      @toggle-status="toggleBusinessStatus"
    />

    <!-- TAB 3: USERS -->
    <SuperAdminUsersTab
      v-else-if="activeTab === 'users'"
      :users="users"
      v-model:search="userSearch"
      v-model:view-mode="viewMode"
      @toggle-super-admin="toggleSuperAdminPrivilege"
      @toggle-status="toggleUserStatus"
    />

    <!-- TAB 4: PLANS -->
    <SuperAdminPlansTab
      v-else-if="activeTab === 'plans'"
      :plans="plans"
    />

    <!-- TAB 5: AUDIT LOGS -->
    <SuperAdminAuditTab
      v-else-if="activeTab === 'audit'"
      :audit-logs="auditLogs"
      v-model:view-mode="viewMode"
    />

    <!-- TAB 6: BUSINESS TYPES CONFIGURATION -->
    <SuperAdminBusinessTypesTab
      v-else-if="activeTab === 'businessTypes'"
      :business-types-list="businessTypesList"
      :loading-type-toggle="loadingTypeToggle"
      @toggle="toggleBusinessTypeAction"
    />

    <!-- OWNER DETAIL & MONITORING MODAL -->
    <SuperAdminOwnerDetailModal
      :is-open="showOwnerModal"
      :owner-detail="ownerDetail"
      :plans="plans"
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
            class="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 transition btn-interactive"
          >
            Saqlash
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../services/api';
import { useFormat } from '../../composables/useFormat';
import { useToast } from '../../composables/useToast';
import AppSelect from '../../components/AppSelect.vue';
import AppInput from '../../components/AppInput.vue';
import AppViewToggle from '../../components/AppViewToggle.vue';
import SuperAdminHeaderStats from './components/SuperAdminHeaderStats.vue';
import SuperAdminOwnersTab from './components/SuperAdminOwnersTab.vue';
import SuperAdminBusinessesTab from './components/SuperAdminBusinessesTab.vue';
import SuperAdminUsersTab from './components/SuperAdminUsersTab.vue';
import SuperAdminPlansTab from './components/SuperAdminPlansTab.vue';
import SuperAdminAuditTab from './components/SuperAdminAuditTab.vue';
import SuperAdminBusinessTypesTab from './components/SuperAdminBusinessTypesTab.vue';
import SuperAdminOwnerDetailModal from './components/SuperAdminOwnerDetailModal.vue';
import {
  ShieldCheck,
  Building2,
  Users,
  CreditCard,
  RefreshCw,
  Crown,
  X,
  Sliders,
  UtensilsCrossed,
  Coffee,
  Scissors,
  Pill,
  Wrench,
  ShoppingBag,
} from 'lucide-vue-next';

import { usePersistentTab } from '../../composables/usePersistentTab';
import { usePersistentViewMode } from '../../composables/usePersistentViewMode';

const toast = useToast();
const { formatCurrency, formatDate } = useFormat();

const validTabs = ['owners', 'businesses', 'users', 'plans', 'audit', 'businessTypes'] as const;
type SuperAdminTab = typeof validTabs[number];

const activeTab = usePersistentTab<SuperAdminTab>('superadmin', 'owners', validTabs);
const viewMode = usePersistentViewMode('superadmin', 'table');
const loading = ref(false);

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

const loadAllData = async () => {
  loading.value = true;
  try {
    const [statsRes, ownersRes, bizRes, usersRes, plansRes, auditRes, typesRes] = await Promise.all([
      api.get('/superadmin/stats'),
      api.get('/superadmin/owners'),
      api.get('/superadmin/businesses'),
      api.get('/superadmin/users'),
      api.get('/superadmin/plans'),
      api.get('/superadmin/audit-logs'),
      api.get('/superadmin/business-types'),
    ]);
    stats.value = statsRes.data || {};
    owners.value = ownersRes.data?.items || [];
    businesses.value = bizRes.data || [];
    users.value = usersRes.data || [];
    plans.value = plansRes.data || [];
    auditLogs.value = auditRes.data || [];
    businessTypesList.value = typesRes.data || [];
  } catch (err) {
    console.error('Failed to load superadmin data', err);
  } finally {
    loading.value = false;
  }
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


const loadOwners = async () => {
  try {
    const params = new URLSearchParams();
    if (ownerSearch.value) params.append('search', ownerSearch.value);
    if (ownerPlanFilter.value) params.append('plan', ownerPlanFilter.value);
    if (ownerStatusFilter.value) params.append('status', ownerStatusFilter.value);

    const { data } = await api.get(`/superadmin/owners?${params.toString()}`);
    owners.value = data?.items || [];
  } catch (err) {
    console.error(err);
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

const toggleOwnerStatusAction = async (ownerId: string, currentStatus: string) => {
  const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
  try {
    await api.patch(`/superadmin/owners/${ownerId}/status`, { status: newStatus });
    toast.success(`Firma egasi muvaffaqiyatli ${newStatus === 'active' ? 'faollashtirildi' : 'bloklandi'}!`, 'Owner Status');
    if (ownerDetail.value) {
      ownerDetail.value.owner.status = newStatus;
    }
    loadOwners();
    loadAllData();
  } catch (err) {
    toast.error('Statusni o\'zgartirishda xatolik', 'Xatolik');
  }
};

const saveOwnerPlan = async (ownerId: string, planId: string) => {
  try {
    await api.patch(`/superadmin/owners/${ownerId}/plan`, { planId });
    toast.success('Tarif rejasi muvaffaqiyatli yangilandi!', 'Tarif');
    loadOwners();
    loadAllData();
  } catch (err) {
    toast.error('Tarifni yangilashda xatolik', 'Xatolik');
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
  try {
    await api.patch(`/superadmin/businesses/${b.id}/status`, { status: newStatus });
    b.status = newStatus;
  } catch (err) {
    toast.error('Biznes statusini o\'zgartirishda xatolik', 'Xatolik');
  }
};

const toggleUserStatus = async (u: any) => {
  const newStatus = u.status === 'active' ? 'blocked' : 'active';
  try {
    await api.patch(`/superadmin/users/${u.id}/status`, { status: newStatus });
    u.status = newStatus;
  } catch (err) {
    toast.error('Foydalanuvchi statusini o\'zgartirishda xatolik', 'Xatolik');
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
  showPlanModal.value = true;
};

const saveBusinessPlan = async () => {
  if (!selectedBusiness.value || !selectedPlanId.value) return;
  try {
    await api.patch(`/superadmin/businesses/${selectedBusiness.value.id}/plan`, {
      planId: selectedPlanId.value,
    });
    showPlanModal.value = false;
    toast.success('Biznes tarifi muvaffaqiyatli saqlandi', 'Tarif');
    loadAllData();
  } catch (err) {
    toast.error('Tarifni saqlashda xatolik', 'Xatolik');
  }
};

onMounted(() => {
  loadAllData();
});
</script>
