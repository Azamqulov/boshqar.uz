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
      <router-view />
    </main>
  </div>

  <!-- 2. OWNER / ADMIN / SUPERADMIN SIDEBAR LAYOUT -->
  <div v-else
    class="flex flex-col h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-200">
    <div class="flex-1 flex overflow-hidden relative">
      <!-- Mobile Backdrop for Sidebar -->
      <div
        v-if="isMobileSidebarOpen"
        class="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
        @click="isMobileSidebarOpen = false"
      />

      <!-- Sidebar (Collapsible on desktop, fixed drawer on mobile) -->
      <aside
        class="bg-white/95 dark:bg-slate-900/95 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 z-50 md:z-20 shrink-0 fixed md:relative inset-y-0 left-0"
        :class="[
          isSidebarCollapsed ? 'md:w-20' : 'md:w-64',
          isMobileSidebarOpen ? 'w-72 translate-x-0 shadow-2xl' : 'w-72 -translate-x-full md:translate-x-0 md:w-auto'
        ]">
        <!-- Logo Header (Start-aligned wide logo with sidebar toggle button) -->
        <div
          class="h-16 flex items-center border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 overflow-hidden"
          :class="isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-3.5'">
          <!-- Expanded view: Logo aligned to start -->
          <div v-if="!isSidebarCollapsed || isMobileSidebarOpen" class="flex items-center gap-2 overflow-hidden min-w-0">
            <AppLogo size="lg" />
          </div>

          <!-- Mobile Close Button -->
          <button
            @click="isMobileSidebarOpen = false"
            class="md:hidden p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
          >
            <X class="w-5 h-5" />
          </button>

          <!-- Sidebar Collapse / Expand Toggle Button -->
          <button
            @click="isSidebarCollapsed = !isSidebarCollapsed"
            class="hidden md:flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
            :class="isSidebarCollapsed ? 'w-10 h-10' : 'ml-1'"
            :title="isSidebarCollapsed ? 'Sidebarni kengaytirish' : 'Sidebarni yopish'">
            <PanelLeftClose v-if="!isSidebarCollapsed" class="w-5 h-5" />
            <PanelLeftOpen v-else class="w-5 h-5 text-emerald-500" />
          </button>
        </div>

        <!-- Navigation Links (Grouped Sections) -->
        <nav class="flex-1 px-3 py-3 space-y-3 overflow-y-auto">
          <div v-for="(group, gIdx) in visibleNavGroups" :key="gIdx" class="space-y-0.5">
            <!-- Section Header -->
            <div
              v-if="group.title && (!isSidebarCollapsed || isMobileSidebarOpen)"
              class="px-3.5 pt-2.5 pb-1 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider select-none"
            >
              {{ group.title }}
            </div>
            <div
              v-else-if="group.title && isSidebarCollapsed && !isMobileSidebarOpen"
              class="my-1.5 border-t border-slate-200 dark:border-slate-800 mx-2"
            ></div>

            <!-- Group Items -->
            <router-link
              v-for="item in group.items"
              :key="item.name"
              :to="item.to"
              @click="isMobileSidebarOpen = false"
              class="flex items-center rounded-xl text-sm font-medium transition-all group btn-interactive"
              :class="[
                isSidebarCollapsed && !isMobileSidebarOpen ? 'justify-center px-0 py-2.5' : 'px-3.5 py-2',
                $route.path === item.to || ($route.path.startsWith(item.to + '/') && item.to !== '/')
                  ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-500/30 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              ]"
              :title="isSidebarCollapsed && !isMobileSidebarOpen ? item.label : ''"
            >
              <component
                :is="item.icon"
                class="w-5 h-5 transition-colors shrink-0"
                :class="[
                  isSidebarCollapsed && !isMobileSidebarOpen ? 'mr-0' : 'mr-3',
                  $route.path === item.to || ($route.path.startsWith(item.to + '/') && item.to !== '/')
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                ]"
              />
              <span v-if="!isSidebarCollapsed || isMobileSidebarOpen" class="truncate text-xs font-semibold">{{ item.label }}</span>
              <span
                v-if="(!isSidebarCollapsed || isMobileSidebarOpen) && item.badge"
                class="ml-auto px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              >
                {{ item.badge }}
              </span>
            </router-link>
          </div>
        </nav>

        <!-- Bottom User Profile & Logout -->
        <div class="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/60">
          <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400"
            :class="isSidebarCollapsed && !isMobileSidebarOpen ? 'justify-center px-0' : 'px-1.5'">
            <div v-if="!isSidebarCollapsed || isMobileSidebarOpen" class="truncate flex-1 min-w-0 mr-2">
              <p class="font-bold text-slate-800 dark:text-slate-200 truncate">{{ authStore.user?.fullName }}</p>
              <p class="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider">{{
                authStore.activeBusiness?.role ||
                'Owner' }}</p>
            </div>
            <button @click="handleLogout" title="Tizimdan chiqish"
              class="transition flex items-center justify-center btn-interactive"
              :class="[
                isSidebarCollapsed && !isMobileSidebarOpen
                  ? 'w-10 h-10 mx-auto rounded-xl bg-slate-100 hover:bg-rose-500/15 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 shadow-sm'
                  : 'p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 dark:hover:bg-rose-500/20'
              ]">
              <LogOut class="w-4 h-4 shrink-0" />
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- Top Header -->
        <header
          class="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-3.5 sm:px-6 z-10 shrink-0">
          <div class="flex items-center space-x-2.5 sm:space-x-3">
            <button @click="isMobileSidebarOpen = !isMobileSidebarOpen"
              class="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Menyuni ochish">
              <Menu class="w-5 h-5" />
            </button>

            <!-- Quick Toggle button in topbar if collapsed -->
            <button v-if="isSidebarCollapsed" @click="isSidebarCollapsed = false"
              class="hidden md:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              title="Sidebarni ochish">
              <PanelLeftOpen class="w-4 h-4 text-emerald-500" />
              <span>Kengaytirish</span>
            </button>

            <!-- Branch badge -->
            <div
              class="flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs truncate">
              <Store class="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
              <span class="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[120px] sm:max-w-[200px]">{{ authStore.activeBusiness?.name }}</span>
              <span class="hidden sm:inline text-slate-400 dark:text-slate-500">•</span>
              <span class="hidden sm:inline text-emerald-600 dark:text-emerald-400 font-semibold uppercase">{{
                authStore.activeBusiness?.businessType }}</span>
            </div>
          </div>

          <!-- Right Header Actions: POS, Theme Toggle, Settings -->
          <div class="flex items-center space-x-2 sm:space-x-3">
            <router-link to="/pos"
              class="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition btn-interactive">
              <Zap class="w-3.5 h-3.5" />
              <span>Tezkor Sotuv</span>
            </router-link>

            <!-- Theme Toggle Switcher -->
            <ThemeToggle />

            <router-link to="/settings"
              class="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Sozlamalar">
              <Settings class="w-5 h-5" />
            </router-link>
          </div>
        </header>

        <!-- Main Router View -->
        <main class="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 bg-slate-100/70 dark:bg-slate-950 pb-20 md:pb-6">
          <router-view />
        </main>
      </div>
    </div>

    <!-- Mobile Bottom Navigation Bar -->
    <nav class="md:hidden flex items-center justify-around bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 z-30 shrink-0">
      <router-link to="/pos" class="flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-bold transition" :class="$route.path === '/pos' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' : 'text-slate-500 dark:text-slate-400'">
        <ShoppingCart class="w-4 h-4 mb-0.5" />
        <span>Kassa</span>
      </router-link>
      <router-link to="/dashboard" class="flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-bold transition" :class="$route.path === '/dashboard' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' : 'text-slate-500 dark:text-slate-400'">
        <LayoutDashboard class="w-4 h-4 mb-0.5" />
        <span>Asosiy</span>
      </router-link>
      <router-link to="/products" class="flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-bold transition" :class="$route.path.startsWith('/products') ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' : 'text-slate-500 dark:text-slate-400'">
        <Package class="w-4 h-4 mb-0.5" />
        <span>Tovarlar</span>
      </router-link>
      <router-link to="/finance" class="flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-bold transition" :class="$route.path === '/finance' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' : 'text-slate-500 dark:text-slate-400'">
        <DollarSign class="w-4 h-4 mb-0.5" />
        <span>Moliya</span>
      </router-link>
      <button @click="isMobileSidebarOpen = true" class="flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-bold text-slate-500 dark:text-slate-400 transition hover:text-slate-900 dark:hover:text-white">
        <Menu class="w-4 h-4 mb-0.5" />
        <span>Menyu</span>
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';
import { useDataStore } from '../stores/data.store';
import ThemeToggle from '../components/ThemeToggle.vue';
import AppLogo from '../components/AppLogo.vue';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  FolderTree,
  Boxes,
  Users,
  Truck,
  DollarSign,
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
} from 'lucide-vue-next';

const authStore = useAuthStore();
const dataStore = useDataStore();
const router = useRouter();
const route = useRoute();
const isMobileSidebarOpen = ref(false);
const isSidebarCollapsed = ref(false);

watch(() => route.path, () => {
  isMobileSidebarOpen.value = false;
});

const businessType = computed(() => authStore.businessType);

// Determine if logged-in user is a worker or owner
const isWorker = computed(() => {
  const role = (authStore.activeBusiness?.role || '').toLowerCase();
  const isSuper = authStore.user?.isSuperAdmin;
  if (isSuper) return false;
  return role !== 'owner' && role !== 'admin';
});

interface NavItem {
  name: string;
  label: string;
  to: string;
  icon: any;
  types: string[];
  badge?: string;
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
      { name: 'products', label: 'Mahsulotlar', to: '/products', icon: Package, types: ['shop', 'restaurant', 'cafe', 'pharmacy', 'confectionery', 'other'] },
      { name: 'categories', label: 'Kategoriyalar', to: '/categories', icon: FolderTree, types: ['shop', 'restaurant', 'cafe', 'pharmacy', 'confectionery', 'other'] },
      { name: 'inventory', label: 'Omborxona', to: '/inventory', icon: Boxes, types: ['shop', 'restaurant', 'cafe', 'pharmacy', 'confectionery', 'other'] },
      { name: 'suppliers', label: 'Ta\'minotchilar', to: '/suppliers', icon: Truck, types: ['shop', 'restaurant', 'pharmacy', 'confectionery', 'other'] },
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
    if (item.types.includes('superadmin')) return isSuper;
    const typeMatch = item.types.includes('all') || item.types.includes(currentType);
    if (!typeMatch) return false;

    // 1. If SuperAdmin or Owner/Admin
    if (isSuper || userRole === 'owner' || userRole === 'admin' || allowed.includes('all')) {
      return true;
    }

    // 2. If Worker
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
      (item.name === 'products' && (allowed.includes('products') || allowed.includes('inventory'))) ||
      (item.name === 'categories' && (allowed.includes('products') || allowed.includes('categories'))) ||
      (item.name === 'inventory' && (allowed.includes('inventory') || allowed.includes('products'))) ||
      (item.name === 'suppliers' && (allowed.includes('suppliers') || allowed.includes('inventory'))) ||
      (item.name === 'customers' && allowed.includes('customers')) ||
      (item.name === 'tables' && (allowed.includes('tables') || allowed.includes('restaurant'))) ||
      (item.name === 'kds' && (allowed.includes('kds') || allowed.includes('restaurant'))) ||
      (item.name === 'appointments' && (allowed.includes('appointments') || allowed.includes('services'))) ||
      (item.name === 'services' && (allowed.includes('services') || allowed.includes('appointments'))) ||
      (item.name === 'finance' && allowed.includes('finance')) ||
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

const handleLogout = () => {
  dataStore.clearAll();
  authStore.logout();
  window.location.href = '/auth/login';
};

onMounted(async () => {
  await authStore.fetchBusinesses();
  // Background prefetching for 0ms instant navigation
  dataStore.prefetchAll(businessType.value || 'shop');
});
</script>
