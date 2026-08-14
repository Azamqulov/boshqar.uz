<template>
  <!-- Only render when authenticated and setting is ON and there is at least 1 alert -->
  <div
    v-if="authStore.isAuthenticated && posSettings?.allowZeroStockSale !== false && (totalAlertCount > 0 || isOpen)"
    class="font-sans select-none"
  >
    
    <!-- 1. FLOATING DOCKED TRIGGER (Non-intrusive, smart-positioned) -->
    <div
      ref="widgetTriggerRef"
      class="fixed z-40 transition-all duration-300 pointer-events-auto"
      :class="[
        isPosPage
          ? 'bottom-3 left-3 sm:left-4 md:left-64'
          : 'bottom-20 md:bottom-6 right-3 sm:right-5'
      ]"
      :style="customPositionStyle"
    >
      <!-- Minimized Slim Pill (Takes almost 0 space) -->
      <div
        v-if="isMinimized"
        @click="isMinimized = false"
        class="cursor-pointer px-2.5 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-900 dark:bg-slate-800/95 text-white shadow-lg border border-amber-500/40 text-[11px] font-black flex items-center gap-1.5 hover:scale-105 transition active:scale-95 group backdrop-blur-md"
        title="Ombor ogohlantirishini ochish"
      >
        <span class="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
        <AlertTriangle class="w-3.5 h-3.5 text-amber-400" />
        <span>{{ totalAlertCount }}</span>
      </div>

      <!-- Standard Floating Round Widget -->
      <div v-else class="flex flex-col items-end group/dock">
        <!-- Floating Action Button -->
        <div class="flex items-center gap-1.5">
          <!-- Quick Minimize Button (visible on hover) -->
          <button
            type="button"
            @click.stop="isMinimized = true"
            class="opacity-0 group-hover/dock:opacity-100 p-1 rounded-full bg-slate-800/80 hover:bg-slate-900 text-slate-300 hover:text-white transition shadow-sm text-[10px]"
            title="Kichraytirish (Yig'ib qo'yish)"
          >
            <Minus class="w-3 h-3" />
          </button>

          <!-- Main Circle Trigger -->
          <button
            type="button"
            @click="toggleDrawer"
            class="relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl shadow-xl flex items-center justify-center transition-all duration-300 transform active:scale-95 btn-interactive"
            :class="[
              totalAlertCount > 0
                ? 'bg-gradient-to-tr from-amber-600 via-rose-500 to-rose-600 text-white shadow-rose-500/25 ring-2 ring-rose-500/20'
                : 'bg-slate-900/90 dark:bg-emerald-600/90 text-white shadow-slate-900/20 ring-2 ring-slate-900/10'
            ]"
            title="Ombor holati va kam qolgan tovarlar"
          >
            <AlertTriangle v-if="totalAlertCount > 0" class="w-5 h-5 animate-pulse" />
            <Boxes v-else class="w-5 h-5" />

            <!-- Badge Count Indicator -->
            <span
              v-if="totalAlertCount > 0"
              class="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 rounded-full bg-rose-600 text-white font-black text-[10px] border-2 border-white dark:border-slate-900 shadow-md min-w-[18px] text-center"
            >
              {{ totalAlertCount > 99 ? '99+' : totalAlertCount }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- 2. POPUP DRAWER (Non-intrusive modal that doesn't block whole screen) -->
    <transition name="drawer-anim">
      <div
        v-if="isOpen"
        class="fixed z-50 w-[calc(100vw-1.5rem)] sm:w-[390px] max-h-[80vh] h-[540px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col overflow-hidden animate-in duration-200"
        :class="[
          isPosPage
            ? 'bottom-16 left-3 sm:left-4 md:left-64'
            : 'bottom-20 md:bottom-20 right-3 sm:right-5'
        ]"
      >
        <!-- Header -->
        <div class="p-3.5 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-2.5">
            <div
              class="w-8 h-8 rounded-xl flex items-center justify-center shadow-inner"
              :class="totalAlertCount > 0 ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400' : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'"
            >
              <AlertTriangle v-if="totalAlertCount > 0" class="w-4 h-4" />
              <PackageCheck v-else class="w-4 h-4" />
            </div>
            <div>
              <h3 class="font-black text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Ombor Ogohlantirishi</span>
                <span
                  v-if="totalAlertCount > 0"
                  class="text-[9px] px-1.5 py-0.2 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-mono font-bold"
                >
                  {{ totalAlertCount }} ta tovar
                </span>
              </h3>
              <p class="text-[10px] text-slate-400">Tugagan va kam qolgan tovarlar nazorati</p>
            </div>
          </div>

          <div class="flex items-center gap-1">
            <button
              type="button"
              @click="refreshData"
              class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Yangilash"
            >
              <RotateCw class="w-3.5 h-3.5" :class="{ 'animate-spin': isRefreshing }" />
            </button>
            <button
              type="button"
              @click="isOpen = false"
              class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Yopish"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Filter Tabs & Quick Search -->
        <div class="p-2.5 border-b border-slate-200/60 dark:border-slate-800/60 space-y-2 bg-slate-50/40 dark:bg-slate-900/40 shrink-0">
          <!-- Search Bar -->
          <div class="relative">
            <Search class="absolute left-2.5 top-2 w-3 h-3 text-slate-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Ogohlantirishdagi tovarlarni qidirish..."
              class="w-full pl-8 pr-7 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
            />
            <button
              v-if="searchQuery"
              @click="searchQuery = ''"
              class="absolute right-2 top-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X class="w-3 h-3" />
            </button>
          </div>

          <!-- Tabs -->
          <div class="grid grid-cols-3 gap-1 p-0.5 rounded-xl bg-slate-200/70 dark:bg-slate-800 text-[10px] font-bold">
            <button
              type="button"
              @click="filterTab = 'all'"
              class="py-1 rounded-lg transition text-center"
              :class="filterTab === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'"
            >
              Barchasi ({{ totalAlertCount }})
            </button>
            <button
              type="button"
              @click="filterTab = 'out_of_stock'"
              class="py-1 rounded-lg transition text-center flex items-center justify-center gap-1 text-rose-600 dark:text-rose-400"
              :class="filterTab === 'out_of_stock' ? 'bg-rose-500 text-white shadow-xs !text-white' : ''"
            >
              <span>Tugagan</span>
              <span class="font-mono">({{ outOfStockList.length }})</span>
            </button>
            <button
              type="button"
              @click="filterTab = 'low_stock'"
              class="py-1 rounded-lg transition text-center flex items-center justify-center gap-1 text-amber-600 dark:text-amber-400"
              :class="filterTab === 'low_stock' ? 'bg-amber-500 text-slate-950 shadow-xs !text-slate-950' : ''"
            >
              <span>Kam qolgan</span>
              <span class="font-mono">({{ lowStockList.length }})</span>
            </button>
          </div>
        </div>

        <!-- Products Alert List -->
        <div class="flex-1 overflow-y-auto p-2.5 space-y-1.5">
          <!-- Empty State when All Good -->
          <div
            v-if="totalAlertCount === 0"
            class="h-full flex flex-col items-center justify-center text-center p-6 space-y-2"
          >
            <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 class="w-6 h-6" />
            </div>
            <div>
              <h4 class="font-bold text-xs text-slate-900 dark:text-white">Omborda kamomad yo'q</h4>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">Barcha tovarlar yetarli miqdorda mavjud.</p>
            </div>
          </div>

          <!-- Filter Empty -->
          <div
            v-else-if="filteredItems.length === 0"
            class="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400 text-xs"
          >
            <p>Hech narsa topilmadi</p>
          </div>

          <!-- Alert Item Cards -->
          <div
            v-for="prod in filteredItems"
            :key="prod.id"
            class="p-2 rounded-xl border transition-all flex items-center justify-between gap-2.5"
            :class="[
              Number(prod.stockQty ?? 0) <= 0
                ? 'bg-rose-500/5 dark:bg-rose-950/20 border-rose-500/30'
                : 'bg-amber-500/5 dark:bg-amber-950/20 border-amber-500/30'
            ]"
          >
            <!-- Left: Image & Info -->
            <div class="flex items-center gap-2 min-w-0 flex-1">
              <div class="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                <img
                  v-if="prod.imageUrl"
                  :src="prod.imageUrl"
                  :alt="prod.name"
                  class="w-full h-full object-cover"
                  @error="prod.imageUrl = null"
                />
                <Package v-else class="w-4 h-4 text-slate-400" />
              </div>

              <div class="min-w-0 flex-1">
                <h5 class="font-bold text-xs text-slate-900 dark:text-white truncate">
                  {{ prod.name }}
                </h5>
                <div class="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                  <span v-if="prod.category?.name" class="truncate max-w-[100px]">{{ prod.category.name }}</span>
                  <span v-if="prod.category?.name">•</span>
                  <span class="font-mono font-semibold">{{ formatCurrency(prod.salePrice) }}</span>
                </div>
              </div>
            </div>

            <!-- Right: Stock status -->
            <div class="text-right shrink-0">
              <span
                class="px-1.5 py-0.5 rounded-md text-[9px] font-black font-mono inline-block shadow-2xs"
                :class="[
                  Number(prod.stockQty ?? 0) <= 0
                    ? 'bg-rose-500 text-white'
                    : 'bg-amber-500 text-slate-950'
                ]"
              >
                {{ Number(prod.stockQty ?? 0) <= 0 ? '0 dona' : `${prod.stockQty} ${prod.unit?.shortName || 'dona'}` }}
              </span>
              <span class="text-[8px] text-slate-400 font-mono block mt-0.5">
                Min: {{ prod.minStock || 5 }}
              </span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-2.5 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex items-center justify-between shrink-0">
          <span class="text-[10px] text-slate-500 font-medium">
            Jami: <strong class="text-slate-900 dark:text-white font-mono">{{ totalAlertCount }} ta</strong>
          </span>

          <router-link
            to="/inventory"
            @click="isOpen = false"
            class="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition flex items-center gap-1 shadow-sm shadow-emerald-500/20 btn-interactive"
          >
            <Boxes class="w-3.5 h-3.5" />
            <span>Omborga O'tish</span>
          </router-link>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';
import { useDataStore } from '../stores/data.store';
import { useFormat } from '../composables/useFormat';
import { usePosSettings } from '../composables/usePosSettings';
import {
  Boxes,
  PackageCheck,
  AlertTriangle,
  Package,
  X,
  Search,
  CheckCircle2,
  RotateCw,
  Minus,
} from 'lucide-vue-next';

const route = useRoute();
const authStore = useAuthStore();
const dataStore = useDataStore();
const { posSettings } = usePosSettings();
const { formatCurrency } = useFormat();

const isOpen = ref(false);
const isMinimized = ref(false);
const searchQuery = ref('');
const filterTab = ref<'all' | 'out_of_stock' | 'low_stock'>('all');
const isRefreshing = ref(false);

const isPosPage = computed(() => route.path.startsWith('/pos'));

const customPositionStyle = computed(() => {
  return {};
});

const toggleDrawer = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    dataStore.fetchProducts();
  }
};

const refreshData = async () => {
  isRefreshing.value = true;
  await Promise.allSettled([
    dataStore.fetchProducts(true),
    dataStore.fetchInventory(true),
  ]);
  isRefreshing.value = false;
};

// Compute all alert products
const alertProducts = computed(() => {
  const prods = dataStore.products || [];
  return prods.filter((p) => {
    if (p.brand === 'service' || p.brand === 'dish' || p.brand === 'kitchen' || p.isMadeToOrder) {
      return false;
    }
    const qty = Number(p.stockQty ?? 0);
    const min = Number(p.minStock ?? 5);
    return qty <= 0 || qty <= min;
  });
});

const outOfStockList = computed(() => {
  return alertProducts.value.filter((p) => Number(p.stockQty ?? 0) <= 0);
});

const lowStockList = computed(() => {
  return alertProducts.value.filter((p) => {
    const qty = Number(p.stockQty ?? 0);
    const min = Number(p.minStock ?? 5);
    return qty > 0 && qty <= min;
  });
});

const totalAlertCount = computed(() => alertProducts.value.length);

const filteredItems = computed(() => {
  let list = alertProducts.value;
  if (filterTab.value === 'out_of_stock') {
    list = outOfStockList.value;
  } else if (filterTab.value === 'low_stock') {
    list = lowStockList.value;
  }

  if (!searchQuery.value.trim()) return list;
  const q = searchQuery.value.toLowerCase();
  return list.filter(
    (p) =>
      p.name?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q) ||
      p.barcode?.includes(q) ||
      p.category?.name?.toLowerCase().includes(q)
  );
});

onMounted(() => {
  if (authStore.isAuthenticated) {
    dataStore.fetchProducts();
  }
});
</script>

<style scoped>
.drawer-anim-enter-active,
.drawer-anim-leave-active {
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.drawer-anim-enter-from,
.drawer-anim-leave-to {
  opacity: 0;
  transform: translateY(15px) scale(0.97);
}
</style>
