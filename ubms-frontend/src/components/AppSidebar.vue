<template>
  <div class="h-full flex shrink-0">
    <!-- Mobile Backdrop for Sidebar -->
    <teleport to="body">
      <div
        v-if="isMobileSidebarOpen"
        class="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
        @click="$emit('update:isMobileSidebarOpen', false)"
      />
    </teleport>

    <!-- Sidebar (Collapsible on desktop, fixed drawer on mobile) -->
    <aside
      class="h-full bg-white/95 dark:bg-slate-900/95 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 z-50 md:z-20 shrink-0 fixed md:relative inset-y-0 left-0"
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
          @click="$emit('update:isMobileSidebarOpen', false)"
          class="md:hidden p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
        >
          <X class="w-5 h-5" />
        </button>

        <!-- Sidebar Collapse / Expand Toggle Button -->
        <button
          @click="$emit('update:isSidebarCollapsed', !isSidebarCollapsed)"
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
          <div v-for="item in group.items" :key="item.name" class="space-y-1">
            <router-link
              :to="item.to"
              @click="$emit('update:isMobileSidebarOpen', false)"
              class="flex items-center rounded-xl text-sm font-medium transition-all group btn-interactive"
              :class="[
                isSidebarCollapsed && !isMobileSidebarOpen ? 'justify-center px-0 py-2.5' : 'px-3.5 py-2',
                isItemActive(item)
                  ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-500/30 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              ]"
              :title="isSidebarCollapsed && !isMobileSidebarOpen ? item.label : ''"
            >
              <div class="relative shrink-0 flex items-center">
                <component
                  :is="item.icon"
                  class="w-5 h-5 transition-colors shrink-0"
                  :class="[
                    isSidebarCollapsed && !isMobileSidebarOpen ? 'mr-0' : 'mr-3',
                    isItemActive(item)
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                  ]"
                />
                <!-- Collapsed mode dot indicator: Red if out of stock, Amber if low stock -->
                <span
                  v-if="item.name === 'inventory' && (outOfStockCount > 0 || lowStockCount > 0) && isSidebarCollapsed && !isMobileSidebarOpen"
                  class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 animate-ping"
                  :class="outOfStockCount > 0 ? 'bg-rose-500' : 'bg-amber-500'"
                />
                <span
                  v-if="item.name === 'inventory' && (outOfStockCount > 0 || lowStockCount > 0) && isSidebarCollapsed && !isMobileSidebarOpen"
                  class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-900"
                  :class="outOfStockCount > 0 ? 'bg-rose-500' : 'bg-amber-500'"
                />

                <!-- Collapsed mode dot indicator for billing (red if expired, amber if 1-3 days left) -->
                <span
                  v-if="item.name === 'billing' && (isSubscriptionExpired || isSubscriptionExpiringSoon) && isSidebarCollapsed && !isMobileSidebarOpen"
                  class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 animate-ping"
                  :class="isSubscriptionExpired ? 'bg-rose-500' : 'bg-amber-500'"
                />
                <span
                  v-if="item.name === 'billing' && (isSubscriptionExpired || isSubscriptionExpiringSoon) && isSidebarCollapsed && !isMobileSidebarOpen"
                  class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-900"
                  :class="isSubscriptionExpired ? 'bg-rose-500' : 'bg-amber-500'"
                />
              </div>

              <span v-if="!isSidebarCollapsed || isMobileSidebarOpen" class="truncate text-xs font-semibold" :class="{ 'text-slate-400 dark:text-slate-500': isItemLocked(item) }">
                {{ item.label }}
              </span>

              <!-- 0. Locked Badge when Subscription Expired -->
              <span
                v-if="(!isSidebarCollapsed || isMobileSidebarOpen) && isItemLocked(item)"
                class="ml-auto w-5 h-5 rounded-lg shrink-0 inline-flex items-center justify-center bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/20"
                title="Obuna muddati tugagan. Bo'lim qulflangan."
              >
                <Lock class="w-3 h-3" />
              </span>

              <!-- 1. Out of stock (Tugagan) -> RED exact circle badge -->
              <span
                v-else-if="(!isSidebarCollapsed || isMobileSidebarOpen) && item.name === 'inventory' && outOfStockCount > 0"
                class="ml-auto w-6 h-6 rounded-full shrink-0 inline-flex items-center justify-center text-[10px] font-black bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse shadow-2xs"
                :title="`Omborda ${outOfStockCount} ta mahsulot butunlay tugagan!`"
              >
                {{ outOfStockCount }}
              </span>

              <!-- 2. Low stock (Kam qolgan) -> AMBER exact circle badge -->
              <span
                v-else-if="(!isSidebarCollapsed || isMobileSidebarOpen) && item.name === 'inventory' && lowStockCount > 0"
                class="ml-auto w-6 h-6 rounded-full shrink-0 inline-flex items-center justify-center text-[10px] font-black bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse shadow-2xs"
                :title="`Omborda ${lowStockCount} ta mahsulot kam qolgan!`"
              >
                {{ lowStockCount }}
              </span>

              <!-- 3. Billing Expiry Exclamation Badge (!) -> EXACT MATCHING CIRCLE -->
              <span
                v-else-if="(!isSidebarCollapsed || isMobileSidebarOpen) && item.name === 'billing' && (isSubscriptionExpiringSoon || isSubscriptionExpired)"
                class="ml-auto w-6 h-6 rounded-full shrink-0 inline-flex items-center justify-center text-xs font-black shadow-2xs animate-pulse"
                :class="isSubscriptionExpired
                  ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                  : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'"
                :title="isSubscriptionExpired ? 'Obunangiz muddati tugagan!' : 'Obunangiz tugashiga 1 kun qoldi!'"
              >
                !
              </span>

              <!-- 4. Standard badge (AI on Qo'llanma) -> GREEN exact circle badge -->
              <span
                v-else-if="(!isSidebarCollapsed || isMobileSidebarOpen) && item.badge"
                class="ml-auto w-6 h-6 rounded-full shrink-0 inline-flex items-center justify-center text-[10px] font-black bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-2xs"
              >
                {{ item.badge }}
              </span>
            </router-link>
          </div>
        </div>
      </nav>

      <!-- Bottom User Profile & Logout -->
      <div class="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/60">
        <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400"
          :class="isSidebarCollapsed && !isMobileSidebarOpen ? 'justify-center px-0' : 'px-1.5'">
          <div v-if="!isSidebarCollapsed || isMobileSidebarOpen" class="truncate flex-1 min-w-0 mr-2">
            <p class="font-bold text-slate-800 dark:text-slate-200 truncate">{{ userFullName }}</p>
            <p class="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider">{{
              userRole || 'Owner' }}</p>
          </div>
          <button @click="$emit('logout')" title="Tizimdan chiqish"
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
  </div>
</template>

<script setup lang="ts">
import {
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Lock,
  LogOut,
} from 'lucide-vue-next';
import AppLogo from './AppLogo.vue';

defineProps<{
  isSidebarCollapsed: boolean;
  isMobileSidebarOpen: boolean;
  visibleNavGroups: any[];
  outOfStockCount: number;
  lowStockCount: number;
  isSubscriptionExpired: boolean;
  isSubscriptionExpiringSoon: boolean;
  isItemActive: (item: any) => boolean;
  isItemLocked: (item: any) => boolean;
  userFullName?: string;
  userRole?: string;
}>();

defineEmits<{
  (e: 'update:isSidebarCollapsed', val: boolean): void;
  (e: 'update:isMobileSidebarOpen', val: boolean): void;
  (e: 'logout'): void;
}>();
</script>
