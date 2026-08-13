<template>
  <!-- 1. WORKER FULL-SCREEN NAVBAR LAYOUT (Kassir, Sotuvchi, Ofitsiant, Oshpaz, Omborchi va h.k.) -->
  <div v-if="isWorker" class="flex flex-col h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-200">
    <!-- Top Full-Width Navbar -->
    <header class="h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 flex items-center justify-between z-30 flex-shrink-0 shadow-sm dark:shadow-lg">
      <!-- Left: Logo & Business Name -->
      <div class="flex items-center space-x-3">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20 text-white font-bold text-lg">
          B
        </div>
        <div>
          <h1 class="font-black text-sm tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
            boshqar.uz
            <span class="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">Terminal</span>
          </h1>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[150px]">{{ authStore.activeBusiness?.name }}</p>
        </div>
      </div>

      <!-- Center: Allowed Module Tabs (Horizontal Navigation) -->
      <nav class="hidden md:flex items-center space-x-1.5 overflow-x-auto px-2">
        <router-link
          v-for="item in visibleNavItems"
          :key="item.name"
          :to="item.to"
          class="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap btn-interactive"
          :class="[
            $route.path === item.to || $route.path.startsWith(item.to + '/')
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 ring-2 ring-emerald-500/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80'
          ]"
        >
          <component :is="item.icon" class="w-4 h-4" />
          <span>{{ item.label }}</span>
        </router-link>
      </nav>

      <!-- Right: Quick POS shortcut, Theme Toggle, User Badge & Logout -->
      <div class="flex items-center space-x-2.5 sm:space-x-3">
        <!-- Quick Kassa button if not already active -->
        <router-link
          to="/pos"
          class="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold transition btn-interactive"
          :class="{ 'ring-2 ring-emerald-500': $route.path === '/pos' }"
        >
          <ShoppingCart class="w-3.5 h-3.5" />
          <span class="hidden sm:inline">Kassa (POS)</span>
        </router-link>

        <!-- Theme Toggle -->
        <ThemeToggle />

        <div class="hidden sm:block text-right text-xs">
          <p class="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">{{ authStore.user?.fullName }}</p>
          <p class="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase">{{ authStore.activeBusiness?.role || 'Xodim / Sotuvchi' }}</p>
        </div>

        <button
          @click="handleLogout"
          title="Tizimdan chiqish"
          class="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-500/15 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-500/20 dark:hover:text-rose-400 text-slate-600 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 transition btn-interactive"
        >
          <LogOut class="w-4 h-4" />
          <span class="hidden sm:inline">Chiqish</span>
        </button>
      </div>
    </header>

    <!-- Mobile Sub-Navbar for Worker -->
    <div class="md:hidden flex items-center space-x-1 px-3 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
      <router-link
        v-for="item in visibleNavItems"
        :key="item.name"
        :to="item.to"
        class="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition"
        :class="[
          $route.path === item.to || $route.path.startsWith(item.to + '/')
            ? 'bg-emerald-500 text-white'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
        ]"
      >
        <component :is="item.icon" class="w-3.5 h-3.5" />
        <span>{{ item.label }}</span>
      </router-link>
    </div>

    <!-- Main Full-Width Content Area -->
    <main class="flex-1 overflow-y-auto p-3 sm:p-5 bg-slate-100/70 dark:bg-slate-950">
      <router-view />
    </main>
  </div>

  <!-- 2. OWNER / ADMIN / SUPERADMIN SIDEBAR LAYOUT -->
  <div v-else class="flex h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-200">
    <!-- Sidebar -->
    <aside
      class="w-64 bg-white/95 dark:bg-slate-900/90 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 z-20"
      :class="{ '-ml-64 md:ml-0': !isMobileSidebarOpen }"
    >
      <!-- Logo & Business Name -->
      <div class="h-16 flex items-center justify-between px-5 border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60">
        <div class="flex items-center space-x-3">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20 text-white font-bold text-lg">
            B
          </div>
          <div>
            <h1 class="font-bold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              boshqar.uz
              <span class="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">v2.0</span>
            </h1>
            <p class="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[120px]">{{ authStore.activeBusiness?.name || 'UBMS SaaS' }}</p>
          </div>
        </div>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <template v-for="item in visibleNavItems" :key="item.name">
          <router-link
            :to="item.to"
            v-slot="{ isActive }"
            class="flex items-center px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group btn-interactive"
            :class="[
              $route.path === item.to || $route.path.startsWith(item.to + '/')
                ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-500/30 shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            ]"
          >
            <component
              :is="item.icon"
              class="w-5 h-5 mr-3 transition-colors"
              :class="[
                $route.path === item.to || $route.path.startsWith(item.to + '/')
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
              ]"
            />
            <span class="truncate">{{ item.label }}</span>
            <span
              v-if="item.badge"
              class="ml-auto px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
            >
              {{ item.badge }}
            </span>
          </router-link>
        </template>
      </nav>

      <!-- Bottom User / Quick POS -->
      <div class="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/60 space-y-2">
        <router-link
          to="/pos"
          class="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-sm shadow-md shadow-emerald-500/20 transition-all btn-interactive"
        >
          <ShoppingCart class="w-4 h-4" />
          <span>Kassa (POS)</span>
        </router-link>

        <div class="flex items-center justify-between px-2 pt-1 text-xs text-slate-500 dark:text-slate-400">
          <div class="truncate">
            <p class="font-medium text-slate-800 dark:text-slate-200 truncate">{{ authStore.user?.fullName }}</p>
            <p class="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">{{ authStore.activeBusiness?.role || 'Owner' }}</p>
          </div>
          <button
            @click="handleLogout"
            title="Chiqish"
            class="p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-500 dark:hover:bg-red-500/20 dark:hover:text-red-400 text-slate-400 transition"
          >
            <LogOut class="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Top Header -->
      <header class="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-6 z-10">
        <div class="flex items-center space-x-3">
          <button
            @click="isMobileSidebarOpen = !isMobileSidebarOpen"
            class="md:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
          >
            <Menu class="w-5 h-5" />
          </button>

          <!-- Branch badge -->
          <div class="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
            <Store class="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
            <span class="text-slate-700 dark:text-slate-300 font-medium">{{ authStore.activeBusiness?.name }}</span>
            <span class="text-slate-400 dark:text-slate-500">•</span>
            <span class="text-emerald-600 dark:text-emerald-400 font-semibold uppercase">{{ authStore.activeBusiness?.businessType }}</span>
          </div>
        </div>

        <!-- Right Header Actions: POS, Theme Toggle, Settings -->
        <div class="flex items-center space-x-2 sm:space-x-3">
          <router-link
            to="/pos"
            class="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition btn-interactive"
          >
            <Zap class="w-3.5 h-3.5" />
            <span>Tezkor Sotuv</span>
          </router-link>

          <!-- Theme Toggle Switcher -->
          <ThemeToggle />

          <router-link
            to="/settings"
            class="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Sozlamalar"
          >
            <Settings class="w-5 h-5" />
          </router-link>
        </div>
      </header>

      <!-- Main Router View -->
      <main class="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-100/70 dark:bg-slate-950">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';
import ThemeToggle from '../components/ThemeToggle.vue';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
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
  Zap,
} from 'lucide-vue-next';

const authStore = useAuthStore();
const router = useRouter();
const isMobileSidebarOpen = ref(false);

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

const allNavItems: NavItem[] = [
  { name: 'pos', label: 'Kassa (POS)', to: '/pos', icon: ShoppingCart, types: ['all'] },
  { name: 'dashboard', label: 'Boshqaruv Paneli', to: '/dashboard', icon: LayoutDashboard, types: ['all'] },
  { name: 'products', label: 'Mahsulotlar', to: '/products', icon: Package, types: ['shop', 'restaurant', 'cafe', 'pharmacy', 'confectionery', 'other'] },
  { name: 'inventory', label: 'Omborxona', to: '/inventory', icon: Boxes, types: ['shop', 'restaurant', 'cafe', 'pharmacy', 'confectionery', 'other'] },
  { name: 'tables', label: 'Stollar xaritasi', to: '/restaurant/tables', icon: UtensilsCrossed, types: ['restaurant', 'cafe'] },
  { name: 'kds', label: 'Oshxona (KDS)', to: '/restaurant/kds', icon: Flame, types: ['restaurant', 'cafe'] },
  { name: 'appointments', label: 'Bandlovlar', to: '/appointments', icon: Calendar, types: ['barbershop', 'service'] },
  { name: 'services', label: 'Xizmatlar', to: '/appointments/services', icon: Scissors, types: ['barbershop', 'service'] },
  { name: 'customers', label: 'Mijozlar (CRM)', to: '/customers', icon: Users, types: ['all'] },
  { name: 'suppliers', label: 'Ta\'minotchilar', to: '/suppliers', icon: Truck, types: ['shop', 'restaurant', 'pharmacy', 'confectionery', 'other'] },
  { name: 'finance', label: 'Moliya & Hisobot', to: '/finance', icon: DollarSign, types: ['all'] },
  { name: 'settings', label: 'Sozlamalar', to: '/settings', icon: Settings, types: ['all'] },
  { name: 'superadmin', label: 'SuperAdmin', to: '/superadmin', icon: ShieldCheck, types: ['superadmin'] },
];

const visibleNavItems = computed(() => {
  const currentType = businessType.value;
  const isSuper = authStore.user?.isSuperAdmin;
  const userRole = (authStore.activeBusiness?.role || '').toLowerCase();
  const allowed = authStore.activeBusiness?.allowedModules || [];

  // 1. If SuperAdmin or Owner, show all for this business type
  if (isSuper || userRole === 'owner' || userRole === 'admin' || allowed.includes('all')) {
    return allNavItems.filter((item) => {
      if (item.types.includes('superadmin')) return isSuper;
      return item.types.includes('all') || item.types.includes(currentType);
    });
  }

  // 2. If Worker (Sotuvchi, Kassir, Ofitsiant, Oshpaz, Omborchi va h.k.)
  // Always include POS for sellers / cashiers / workers if allowed or default
  const workerItems = allNavItems.filter((item) => {
    // POS is always visible for sellers/cashiers or if pos is in allowed or if allowed is empty
    if (item.name === 'pos') {
      return (
        allowed.includes('pos') ||
        allowed.length === 0 ||
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
      (item.name === 'inventory' && allowed.includes('inventory')) ||
      (item.name === 'customers' && allowed.includes('customers')) ||
      (item.name === 'tables' && allowed.includes('tables')) ||
      (item.name === 'kds' && allowed.includes('kds')) ||
      (item.name === 'appointments' && allowed.includes('appointments')) ||
      (item.name === 'finance' && allowed.includes('finance'))
    );
  });

  // Guarantee at least POS is present if nothing else matched
  if (workerItems.length === 0) {
    const posItem = allNavItems.find(i => i.name === 'pos');
    return posItem ? [posItem] : [];
  }

  return workerItems;
});

const handleLogout = () => {
  authStore.logout();
  router.push('/auth/login');
};
</script>
