<template>
  <!-- 1. WORKER FULL-SCREEN NAVBAR LAYOUT (Kassir, Sotuvchi, Ofitsiant, Oshpaz, Omborchi va h.k.) -->
  <div v-if="isWorker"
    class="flex flex-col h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-200">
    <!-- Top Full-Width Navbar -->
    <header
      class="h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 flex items-center justify-between z-30 flex-shrink-0 shadow-sm dark:shadow-lg">
      <!-- Left: Logo -->
      <AppLogo size="md" />

      <!-- Center: Allowed Module Tabs (Horizontal Navigation) -->
      <nav class="hidden md:flex items-center space-x-1.5 overflow-x-auto px-2">
        <router-link v-for="item in visibleNavItems" :key="item.name" :to="item.to"
          class="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap btn-interactive"
          :class="[
            $route.path === item.to || $route.path.startsWith(item.to + '/')
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 ring-2 ring-emerald-500/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80'
          ]">
          <component :is="item.icon" class="w-4 h-4" />
          <span>{{ item.label }}</span>
        </router-link>
      </nav>

      <!-- Right: Quick POS shortcut, Theme Toggle, User Badge & Logout -->
      <div class="flex items-center space-x-2.5 sm:space-x-3">
        <!-- Quick Kassa button if not already active -->
        <router-link to="/pos"
          class="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold transition btn-interactive"
          :class="{ 'ring-2 ring-emerald-500': $route.path === '/pos' }">
          <ShoppingCart class="w-3.5 h-3.5" />
          <span class="hidden sm:inline">Kassa (POS)</span>
        </router-link>

        <!-- Theme Toggle -->
        <ThemeToggle />

        <!-- Quick Guide button for workers -->
        <router-link to="/guide"
          class="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
          title="Qo'llanma & AI">
          <BookOpen class="w-4 h-4" />
        </router-link>

        <div class="hidden sm:block text-right text-xs">
          <p class="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">{{ authStore.user?.fullName }}
          </p>
          <p class="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase">{{
            authStore.activeBusiness?.role || 'Xodim / Sotuvchi' }}</p>
        </div>

        <button @click="handleLogout" title="Tizimdan chiqish"
          class="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-500/15 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-500/20 dark:hover:text-rose-400 text-slate-600 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 transition btn-interactive">
          <LogOut class="w-4 h-4" />
          <span class="hidden sm:inline">Chiqish</span>
        </button>
      </div>
    </header>

    <!-- Mobile Sub-Navbar for Worker -->
    <div
      class="md:hidden flex items-center space-x-1 px-3 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
      <router-link v-for="item in visibleNavItems" :key="item.name" :to="item.to"
        class="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition"
        :class="[
          $route.path === item.to || $route.path.startsWith(item.to + '/')
            ? 'bg-emerald-500 text-white'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
        ]">
        <component :is="item.icon" class="w-3.5 h-3.5" />
        <span>{{ item.label }}</span>
      </router-link>
    </div>

    <!-- Main Full-Width Content Area -->
    <main class="flex-1 overflow-y-auto p-3 sm:p-5 bg-slate-100/70 dark:bg-slate-950 relative z-50">
      <!-- Full Screen Subscription Expired Blocking Guard Overlay for Workers -->
      <div
        v-if="isSubscriptionExpired && !authStore.user?.isSuperAdmin"
        class="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
      >
        <div class="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-rose-500/30 shadow-2xl text-center space-y-5">
          <div class="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mx-auto">
            <AlertTriangle class="w-8 h-8 animate-bounce" />
          </div>

          <div class="space-y-2">
            <h3 class="text-xl font-black text-slate-900 dark:text-white">
              Korxona Obunasi Yakunlandi
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Hurmatli xodim, siz ishlayotgan <strong class="text-slate-800 dark:text-slate-200">{{ authStore.activeBusiness?.name }}</strong> korxonasining dastur obuna muddati tugagan. Iltimos, do'kon rahbari bilan bog'laning.
            </p>
          </div>

          <div class="pt-2">
            <button
              @click="handleLogout"
              class="w-full py-3 px-4 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition"
            >
              Hisobdan Chiqish
            </button>
          </div>
        </div>
      </div>

      <router-view v-slot="{ Component, route }">
        <transition name="page-fade" mode="out-in">
          <div :key="route.path" class="w-full">
            <component :is="Component" />
          </div>
        </transition>
      </router-view>
    </main>
  </div>

  <!-- 2. OWNER / ADMIN / SUPERADMIN SIDEBAR LAYOUT -->
  <div v-else
    class="flex flex-col h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-200">
    <div class="flex-1 flex overflow-hidden relative">
      <!-- AppSidebar Component -->
      <AppSidebar
        v-model:is-sidebar-collapsed="isSidebarCollapsed"
        v-model:is-mobile-sidebar-open="isMobileSidebarOpen"
        :visible-nav-groups="visibleNavGroups"
        :out-of-stock-count="outOfStockCount"
        :low-stock-count="lowStockCount"
        :is-subscription-expired="isSubscriptionExpired"
        :is-subscription-expiring-soon="isSubscriptionExpiringSoon"
        :is-item-active="isItemActive"
        :is-item-locked="isItemLocked"
        :user-full-name="authStore.user?.fullName"
        :user-role="authStore.activeBusiness?.role"
        @logout="handleLogout"
      />

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- AppHeader Component -->
        <AppHeader
          :is-sidebar-collapsed="isSidebarCollapsed"
          :active-business-name="authStore.activeBusiness?.name"
          :active-business-type="authStore.activeBusiness?.businessType"
          :show-currency-ticker="posSettings.showCurrencyTicker !== false"
          :currency-rate-mode="currencyStore.rateMode"
          :usd-rate="currencyStore.usdRate"
          :rub-rate="currencyStore.rubRate"
          :usd-date="currencyStore.rates.USD?.date"
          :is-demo="authStore.isDemo"
          @toggle-mobile-sidebar="isMobileSidebarOpen = !isMobileSidebarOpen"
          @expand-sidebar="isSidebarCollapsed = false"
          @go-to-register="goToRegister"
        />

        <!-- Main Router View -->
        <main class="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 bg-slate-100/70 dark:bg-slate-950 pb-28 md:pb-6 relative">
          <!-- Full Screen Feature / Subscription Expired Blur & Lock Overlay -->
          <AppLockOverlay
            :is-current-route-locked="isCurrentRouteLocked"
            :current-disabled-feature="currentDisabledFeature"
          />

          <!-- Page Content with Smooth Transition Animation -->
          <div :class="{ 'filter blur-[5px] pointer-events-none select-none opacity-60 transition-all duration-300': isCurrentRouteLocked }">
            <router-view v-slot="{ Component, route }">
              <transition name="page-fade" mode="out-in">
                <div :key="route.path" class="w-full">
                  <component :is="Component" />
                </div>
              </transition>
            </router-view>
          </div>
        </main>
      </div>
      <!-- Floating Curved Mobile Bottom Dock Navigation Bar Component -->
      <AppMobileBottomDock @openMobileSidebar="isMobileSidebarOpen = true" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';
import { useDataStore } from '../stores/data.store';
import { useCurrencyStore } from '../stores/currency.store';
import ThemeToggle from '../components/ThemeToggle.vue';
import AppLogo from '../components/AppLogo.vue';
import AppHeader from '../components/AppHeader.vue';
import AppSidebar from '../components/AppSidebar.vue';
import AppLockOverlay from '../components/AppLockOverlay.vue';
import AppMobileBottomDock from '../components/AppMobileBottomDock.vue';
import { useLanguage } from '../composables/useLanguage';
import { usePosSettings } from '../composables/usePosSettings';
import api from '../services/api';

const langStore = useLanguage();
const currencyStore = useCurrencyStore();
const { posSettings } = usePosSettings();
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  FolderTree,
  Boxes,
  Users,
  Truck,
  DollarSign,
  Wallet,
  UtensilsCrossed,
  Flame,
  Scissors,
  Calendar,
  Settings,
  ShieldCheck,
  LogOut,
  Menu,
  Store,
  Building2,
  Zap,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  Crown,
  CreditCard,
  Sliders,
  X,
  BookOpen,
  Sparkles,
  AlertTriangle,
  AlertCircle,
  ArrowRight,
  Lock,
} from 'lucide-vue-next';

import { usePlanFeatures } from '@/composables/usePlanFeatures';

const authStore = useAuthStore();
const dataStore = useDataStore();
const router = useRouter();
const route = useRoute();
const { hideLockedFeatures } = usePlanFeatures();
const isMobileSidebarOpen = ref(false);
const isSidebarCollapsed = ref(false);

const goToRegister = () => {
  localStorage.removeItem('ubms_access_token');
  localStorage.removeItem('ubms_refresh_token');
  localStorage.removeItem('ubms_user');
  localStorage.removeItem('ubms_businesses');
  localStorage.removeItem('ubms_active_business');
  authStore.token = null;
  authStore.user = null;
  authStore.activeBusiness = null;
  router.push('/auth/register');
};

watch(() => route.path, () => {
  isMobileSidebarOpen.value = false;
  fetchBillingStatus();
});

const businessType = computed(() => authStore.businessType);

// Determine if logged-in user is a worker or owner
const isWorker = computed(() => {
  const role = (authStore.activeBusiness?.role || '').toLowerCase();
  const isSuper = authStore.user?.isSuperAdmin;
  if (isSuper) return false;
  return role !== 'owner' && role !== 'admin';
});

// Compute out of stock items count (quantity <= 0) -> RED
const outOfStockCount = computed(() => {
  const prods = dataStore.products || [];
  return prods.filter((p: any) => {
    if (p.brand === 'service' || p.brand === 'dish' || p.brand === 'kitchen' || p.isMadeToOrder) {
      return false;
    }
    const qty = Number(p.stockQty ?? 0);
    return qty <= 0;
  }).length;
});

// Compute low stock items count (0 < quantity <= minStock) -> AMBER
const lowStockCount = computed(() => {
  const prods = dataStore.products || [];
  return prods.filter((p: any) => {
    if (p.brand === 'service' || p.brand === 'dish' || p.brand === 'kitchen' || p.isMadeToOrder) {
      return false;
    }
    const qty = Number(p.stockQty ?? 0);
    const min = Number(p.minStock ?? 5);
    return qty > 0 && qty <= min;
  }).length;
});

// Subscription & Plan Features Tracking
const billingSubscription = ref<any>(null);
const billingStatusData = ref<any>(null);

const fetchBillingStatus = async () => {
  if (!authStore.isAuthenticated) return;
  try {
    const cached = localStorage.getItem('ubms_cache_billing_status');
    if (cached) {
      const parsed = JSON.parse(cached);
      billingStatusData.value = parsed;
      billingSubscription.value = parsed.subscription;
    }
  } catch (e) {}

  try {
    const { data } = await api.get('/billing/status');
    if (data) {
      billingStatusData.value = data;
      billingSubscription.value = data.subscription;
      localStorage.setItem('ubms_cache_billing_status', JSON.stringify(data));
    }
  } catch (err) {
    // silently fail
  }
};

const activePlanFeatures = computed<Record<string, boolean>>(() => {
  const data = billingStatusData.value;
  // 1. From active business plan features
  if (data?.business?.plan?.features && typeof data.business.plan.features === 'object') {
    return data.business.plan.features;
  }
  // 2. From matching plan in plans list
  if (data?.plans && Array.isArray(data.plans)) {
    const planName = billingSubscription.value?.planName || data?.business?.plan?.name || authStore.activeBusiness?.plan;
    if (planName) {
      const matched = data.plans.find(
        (p: any) => p.name?.toLowerCase() === planName.toLowerCase()
      );
      if (matched?.features && typeof matched.features === 'object') {
        return matched.features;
      }
    }
  }
  return {
    pos: true,
    inventory: true,
    finance: true,
    customer_loyalty: true,
    suppliers: true,
    telegram_bot: true,
    ai_assistant: true,
    export_reports: true,
    vip_support: true,
    cloud_backup: true,
  };
});

const getDisabledFeatureForPath = (path: string): { key: string; label: string } | null => {
  const feats = activePlanFeatures.value;
  if (!feats) return null;

  if ((path === '/pos' || path.startsWith('/restaurant')) && feats.pos === false) {
    return { key: 'pos', label: 'POS Kassa & Chek chiqarish' };
  }
  if ((path.startsWith('/products') || path.startsWith('/categories') || path === '/inventory') && feats.inventory === false) {
    return { key: 'inventory', label: 'Omborxona & Mahsulotlar nazorati' };
  }
  if (path.startsWith('/finance') && feats.finance === false) {
    return { key: 'finance', label: 'Moliya & Kunlik hisobotlar' };
  }
  if (path.startsWith('/customers') && feats.customer_loyalty === false) {
    return { key: 'customer_loyalty', label: 'Mijozlar bazasi va Nasiya (CRM)' };
  }
  if (path.startsWith('/suppliers') && feats.suppliers === false) {
    return { key: 'suppliers', label: 'Ta\'minotchilar & Xaridlar' };
  }
  return null;
};

const currentDisabledFeature = computed(() => {
  return getDisabledFeatureForPath(route.path);
});

const subscriptionDaysLeft = computed(() => {
  if (!billingSubscription.value) return null;
  if (billingSubscription.value.planName === 'Free') return null;
  return typeof billingSubscription.value.daysLeft === 'number' ? billingSubscription.value.daysLeft : null;
});

const isSubscriptionExpiringSoon = computed(() => {
  if (subscriptionDaysLeft.value === null) return false;
  return subscriptionDaysLeft.value <= 1;
});

const isSubscriptionExpired = computed(() => {
  if (authStore.isSubscriptionExpired) return true;
  if (!billingSubscription.value) return false;
  if (billingSubscription.value.planName === 'Free') return false;
  return Boolean(
    billingSubscription.value.isExpired ||
    (subscriptionDaysLeft.value !== null && subscriptionDaysLeft.value <= 0) ||
    billingSubscription.value.status === 'cancelled' ||
    billingSubscription.value.status === 'expired'
  );
});

const isItemLocked = (item: NavItem) => {
  if (isSubscriptionExpired.value) {
    const allowed = ['billing', 'settings', 'guide', 'superadmin'];
    return !allowed.includes(item.name);
  }
  const feats = activePlanFeatures.value;
  if (item.name === 'pos' && feats.pos === false) return true;
  if ((item.name === 'inventory' || item.name === 'products') && feats.inventory === false) return true;
  if (item.name === 'finance' && feats.finance === false) return true;
  if (item.name === 'customers' && feats.customer_loyalty === false) return true;
  if (item.name === 'suppliers' && feats.suppliers === false) return true;
  return false;
};

const isAllowedExpiredRoute = computed(() => {
  const currentPath = route.path;
  return (
    currentPath.startsWith('/billing') ||
    currentPath.startsWith('/settings') ||
    currentPath.startsWith('/guide') ||
    currentPath.startsWith('/superadmin')
  );
});

const isCurrentRouteLocked = computed(() => {
  if (isSubscriptionExpired.value && !isAllowedExpiredRoute.value) {
    return true;
  }
  if (currentDisabledFeature.value) {
    return true;
  }
  return false;
});

watch(() => authStore.activeBusiness?.id, () => {
  fetchBillingStatus();
});

onMounted(() => {
  if (authStore.isAuthenticated) {
    dataStore.fetchProducts();
    fetchBillingStatus();
  }
  window.addEventListener('billing-updated', fetchBillingStatus);
  window.addEventListener('storage', fetchBillingStatus);
});

onUnmounted(() => {
  window.removeEventListener('billing-updated', fetchBillingStatus);
  window.removeEventListener('storage', fetchBillingStatus);
});

interface NavSubItem {
  name: string;
  label: string;
  to: string;
  icon: any;
  tab?: string;
}

interface NavItem {
  name: string;
  label: string;
  to: string;
  icon: any;
  types: string[];
  badge?: string;
  children?: NavSubItem[];
}

interface NavGroup {
  id: string;
  title?: string;
  items: NavItem[];
}

const allNavGroups: NavGroup[] = [
  {
    id: 'main',
    items: [
      { name: 'dashboard', label: 'Boshqaruv Paneli', to: '/dashboard', icon: LayoutDashboard, types: ['all'] },
      { name: 'pos', label: 'Kassa (POS)', to: '/pos', icon: ShoppingCart, types: ['all'] },
    ],
  },
  {
    id: 'ombor',
    title: 'OMBOR',
    items: [
      { name: 'products', label: 'Mahsulotlar', to: '/products', icon: Package, types: ['all'] },
      { name: 'categories', label: 'Kategoriyalar', to: '/categories', icon: FolderTree, types: ['all'] },
      { name: 'inventory', label: 'Omborxona', to: '/inventory', icon: Boxes, types: ['all'] },
      { name: 'suppliers', label: 'Ta\'minotchilar', to: '/suppliers', icon: Truck, types: ['all'] },
    ],
  },
  {
    id: 'restaurant',
    title: 'RESTORAN',
    items: [
      { name: 'tables', label: 'Stollar xaritasi', to: '/restaurant/tables', icon: UtensilsCrossed, types: ['restaurant', 'cafe'] },
      { name: 'kds', label: 'Oshxona (KDS)', to: '/restaurant/kds', icon: Flame, types: ['restaurant', 'cafe'] },
    ],
  },
  {
    id: 'service',
    title: 'XIZMATLAR',
    items: [
      { name: 'appointments', label: 'Bandlovlar', to: '/appointments', icon: Calendar, types: ['barbershop', 'service'] },
      { name: 'services', label: 'Xizmatlar', to: '/appointments/services', icon: Scissors, types: ['barbershop', 'service'] },
    ],
  },
  {
    id: 'crm',
    title: 'MIJOZLAR',
    items: [
      { name: 'customers', label: 'Mijozlar (CRM)', to: '/customers', icon: Users, types: ['all'] },
    ],
  },
  {
    id: 'hisob',
    title: 'HISOB',
    items: [
      { name: 'finance', label: 'Moliya & Hisobot', to: '/finance', icon: DollarSign, types: ['all'] },
    ],
  },
  {
    id: 'sozlamalar',
    title: 'SOZLAMALAR',
    items: [
      { name: 'billing', label: 'Obuna & Tariflar', to: '/billing', icon: CreditCard, types: ['all'] },
      { name: 'guide', label: 'Qo\'llanma & AI', to: '/guide', icon: BookOpen, types: ['all'], badge: 'AI' },
      { name: 'settings', label: 'Sozlamalar', to: '/settings', icon: Settings, types: ['all'] },
      { name: 'superadmin', label: 'SuperAdmin', to: '/superadmin', icon: ShieldCheck, types: ['superadmin'] },
    ],
  },
];

const visibleNavGroups = computed(() => {
  const currentType = businessType.value;
  const isSuper = authStore.user?.isSuperAdmin;
  const userRole = (authStore.activeBusiness?.role || '').toLowerCase();
  const allowed = authStore.activeBusiness?.allowedModules || [];

  const filterItem = (item: NavItem) => {
    if (hideLockedFeatures.value && isItemLocked(item)) {
      return false;
    }
    if (item.types.includes('superadmin')) return isSuper;
    const typeMatch = item.types.includes('all') || item.types.includes(currentType);
    if (!typeMatch) return false;

    // 1. If SuperAdmin or Owner/Admin
    if (isSuper || userRole === 'owner' || userRole === 'admin' || allowed.includes('all')) {
      return true;
    }

    // 2. Universal items accessible to ALL users (Guide & AI)
    if (item.name === 'guide' || item.to === '/guide') {
      return true;
    }

    // 3. If Worker
    if (item.name === 'pos') {
      return (
        allowed.includes('pos') ||
        allowed.includes('orders') ||
        userRole.includes('sotuvchi') ||
        userRole.includes('kassir') ||
        userRole.includes('cashier') ||
        userRole.includes('seller') ||
        userRole.includes('xodim') ||
        userRole.includes('worker') ||
        userRole.includes('waiter') ||
        userRole.includes('ofitsiant')
      );
    }
    return (
      allowed.includes(item.name) ||
      (item.name === 'products' && allowed.includes('products')) ||
      (item.name === 'categories' && (allowed.includes('products') || allowed.includes('categories'))) ||
      (item.name === 'inventory' && allowed.includes('inventory')) ||
      (item.name === 'suppliers' && allowed.includes('suppliers')) ||
      (item.name === 'customers' && allowed.includes('customers')) ||
      (item.name === 'tables' && (allowed.includes('tables') || allowed.includes('restaurant'))) ||
      (item.name === 'kds' && allowed.includes('kds')) ||
      (item.name === 'appointments' && allowed.includes('appointments')) ||
      (item.name === 'services' && (allowed.includes('services') || allowed.includes('appointments'))) ||
      (item.name === 'finance' && allowed.includes('finance')) ||
      (item.name === 'dashboard' && allowed.includes('dashboard')) ||
      (item.name === 'settings' && allowed.includes('settings'))
    );
  };

  return allNavGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(filterItem),
    }))
    .filter((group) => group.items.length > 0);
});

const visibleNavItems = computed(() => {
  const items = visibleNavGroups.value.flatMap((g) => g.items);
  if (items.length === 0) {
    const posGroup = allNavGroups.find((g) => g.items.some((i) => i.name === 'pos'));
    const posItem = posGroup?.items.find((i) => i.name === 'pos');
    return posItem ? [posItem] : [];
  }
  return items;
});

const isItemActive = (item: NavItem) => {
  if (route.path === item.to) return true;

  // Agar boshqa aniqroq nav item mavjud bo'lsa (masalan /appointments/services),
  // /appointments ochilmagan bo'lsa, /appointments ni active qilmaslik
  const allItemTos = allNavGroups.flatMap((g) => g.items.map((i) => i.to));
  const hasMoreSpecificSibling = allItemTos.some(
    (to) => to !== item.to && to.startsWith(item.to + '/') && (route.path === to || route.path.startsWith(to + '/'))
  );

  if (hasMoreSpecificSibling) {
    return false;
  }

  if (item.to !== '/' && route.path.startsWith(item.to + '/')) {
    return true;
  }

  return false;
};

const handleLogout = () => {
  dataStore.clearAll();
  authStore.logout();
  window.location.href = '/auth/login';
};

onMounted(async () => {
  if (authStore.user?.id === 'demo-user-id') {
    dataStore.loadDemoData(businessType.value || 'shop');
    return;
  }
  await authStore.fetchBusinesses();
  // Background prefetching for 0ms instant navigation
  dataStore.prefetchAll(businessType.value || 'shop');
});
</script>

<style>
/* Modern Smooth Page Transition Animation */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.22s cubic-bezier(0.4, 0, 0.2, 1), transform 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(6px) scale(0.996);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.996);
}

/* Water Drop Liquid Animation when switching tabs */
@keyframes liquidDrop {
  0% {
    transform: scale(0.4) translateY(-10px);
    border-radius: 40% 40% 55% 55% / 60% 60% 40% 40%;
  }
  45% {
    transform: scale(1.18) translateY(2px);
    border-radius: 35% 35% 65% 65% / 45% 45% 55% 55%;
  }
  75% {
    transform: scale(0.92) translateY(-1px);
    border-radius: 55% 55% 45% 45% / 55% 55% 45% 45%;
  }
  100% {
    transform: scale(1) translateY(0);
    border-radius: 9999px;
  }
}

@keyframes waterRipple {
  0% {
    transform: scale(0.6);
    opacity: 0.9;
  }
  100% {
    transform: scale(1.8);
    opacity: 0;
  }
}

.animate-liquid-drop {
  animation: liquidDrop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.animate-water-ripple {
  animation: waterRipple 0.45s ease-out forwards;
}
</style>
