<template>
  <div
    class="w-full lg:w-80 xl:w-96 flex-col glass-card rounded-2xl p-3 sm:p-4 overflow-hidden shrink-0"
    :class="mobileViewTab === 'cart' ? 'flex' : 'hidden lg:flex'"
  >
    <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
      <div class="flex items-center space-x-2">
        <ShoppingCart class="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
        <h3 class="font-bold text-sm text-slate-900 dark:text-white">Savat</h3>
        <span class="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
          {{ cartStore.itemCount }}
        </span>
      </div>
      <button
        v-if="cartStore.items.length > 0"
        @click="cartStore.clearCart"
        class="text-xs text-rose-500 hover:text-rose-600 dark:text-rose-400 font-medium"
      >
        Tozalash
      </button>
    </div>

    <!-- Restaurant Service / Table Selector -->
    <div v-if="isRestaurant && enabledServiceTypes.length > 0" class="my-2.5 p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-2 shrink-0">
      <div class="flex items-center justify-between">
        <span class="text-[11px] font-bold text-slate-600 dark:text-slate-300">Xizmat turi:</span>
        <span v-if="orderType === 'dine_in'" class="text-[10px] font-black px-2 py-0.5 rounded-md" :class="currentTableDisplayName ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white animate-pulse'">
          🍽️ {{ currentTableDisplayName || 'Stol tanlanmagan!' }}
        </span>
        <span v-else-if="orderType === 'takeaway'" class="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-500 text-slate-950">
          🥡 Saboy (Olib ketish)
        </span>
        <span v-else-if="orderType === 'delivery'" class="text-[10px] font-black px-2 py-0.5 rounded-md bg-sky-500 text-white">
          🛵 Yetkazib berish
        </span>
      </div>

      <!-- Service Type Toggle Buttons -->
      <div class="grid grid-cols-3 gap-1 p-0.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-[11px]">
        <button
          v-if="enabledServiceTypes.includes('dine_in')"
          type="button"
          @click="$emit('update:orderType', 'dine_in')"
          class="py-1.5 px-2 rounded-lg font-bold transition flex items-center justify-center gap-1"
          :class="orderType === 'dine_in' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
        >
          <span>🍽️</span>
          <span>Zalda</span>
        </button>
        <button
          v-if="enabledServiceTypes.includes('takeaway')"
          type="button"
          @click="$emit('update:orderType', 'takeaway')"
          class="py-1.5 px-2 rounded-lg font-bold transition flex items-center justify-center gap-1"
          :class="orderType === 'takeaway' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
        >
          <span>🥡</span>
          <span>Saboy</span>
        </button>
        <button
          v-if="enabledServiceTypes.includes('delivery')"
          type="button"
          @click="$emit('update:orderType', 'delivery')"
          class="py-1.5 px-2 rounded-lg font-bold transition flex items-center justify-center gap-1"
          :class="orderType === 'delivery' ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
        >
          <span>🛵</span>
          <span>Dostavka</span>
        </button>
      </div>

      <!-- Dine-in Table Selector Pills -->
      <div v-if="orderType === 'dine_in'" class="pt-1.5 border-t border-slate-200 dark:border-slate-700/80 space-y-1.5">
        <div class="flex items-center justify-between text-[11px]">
          <span class="font-bold text-slate-700 dark:text-slate-300">Stol:</span>
          <span v-if="!currentTableDisplayName" class="text-rose-500 font-extrabold animate-pulse">
            Iltimos stolni tanlang!
          </span>
        </div>
        <div class="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5">
          <button
            v-for="tbl in availableTables"
            :key="tbl.id || tbl.name"
            type="button"
            @click="$emit('selectTable', tbl.name)"
            class="px-2.5 py-1 rounded-lg text-xs font-bold transition shrink-0"
            :class="selectedTableNumber === tbl.name ? 'bg-emerald-500 text-white shadow-xs' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 border border-slate-200 dark:border-slate-600'"
          >
            {{ tbl.name }}
          </button>
        </div>
      </div>
    </div>

    <!-- Hold & Recall Orders Bar -->
    <div class="flex items-center justify-between gap-1.5 my-2 shrink-0">
      <button
        type="button"
        @click="$emit('holdCart')"
        :disabled="cartStore.items.length === 0"
        class="flex-1 py-1.5 px-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 disabled:opacity-40 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center justify-center gap-1 border border-amber-500/20 transition btn-interactive"
        title="Joriy savatni kutish rejimiga saqlash"
      >
        <PauseCircle class="w-3.5 h-3.5" />
        <span>Kutishga Qo'yish</span>
      </button>

      <button
        type="button"
        @click="$emit('openHeldOrders')"
        class="py-1.5 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1 transition relative btn-interactive"
        title="Kutishdagi savatlar ro'yxati"
      >
        <History class="w-3.5 h-3.5" />
        <span>Kutishdagilar</span>
        <span
          v-if="heldOrdersCount > 0"
          class="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center -mr-1"
        >
          {{ heldOrdersCount }}
        </span>
      </button>
    </div>

    <!-- Cart Items List -->
    <div class="flex-1 overflow-y-auto space-y-2 py-2 pr-1">
      <div v-if="cartStore.items.length === 0" class="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-xs">
        <ShoppingBag class="w-8 h-8 stroke-1 mb-2" />
        <span>Savat bo'sh</span>
      </div>

      <div
        v-for="item in cartStore.items"
        :key="item.id"
        class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1 pr-2">
            <h5 class="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{{ item.name }}</h5>
            <span class="text-[10px] text-slate-500 dark:text-slate-400">{{ formatCurrency(item.price) }} / {{ item.unit }}</span>
          </div>
          <button
            @click="cartStore.removeItem(item.id)"
            class="text-slate-400 hover:text-rose-500 transition"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>

        <div class="flex items-center justify-between pt-1">
          <div class="flex items-center space-x-1.5">
            <button
              @click="cartStore.updateQuantity(item.id, item.quantity - 1)"
              class="w-6 h-6 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 flex items-center justify-center text-xs text-slate-800 dark:text-white"
            >
              -
            </button>
            <input
              type="number"
              v-model.number="item.quantity"
              class="w-12 text-center py-0.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white font-bold"
            />
            <button
              @click="cartStore.updateQuantity(item.id, item.quantity + 1)"
              class="w-6 h-6 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 flex items-center justify-center text-xs text-slate-800 dark:text-white"
            >
              +
            </button>
          </div>
          <span class="text-xs font-black text-slate-900 dark:text-white">{{ formatCurrency(item.price * item.quantity - item.discount) }}</span>
        </div>
      </div>
    </div>

    <!-- Cart Totals & Checkout -->
    <div class="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3 shrink-0">
      <div class="space-y-1 text-xs">
        <div class="flex justify-between text-slate-500 dark:text-slate-400">
          <span>Oraliq summa:</span>
          <span class="text-slate-800 dark:text-slate-200 font-medium">{{ formatCurrency(cartStore.subtotal) }}</span>
        </div>
        <div class="flex justify-between text-slate-500 dark:text-slate-400">
          <span>Chegirma:</span>
          <span class="text-rose-500">-{{ formatCurrency(cartStore.discountTotal) }}</span>
        </div>
        <div class="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-800">
          <span>Jami to'lov:</span>
          <span class="text-emerald-600 dark:text-emerald-400 font-black">{{ formatCurrency(cartStore.grandTotal) }}</span>
        </div>
      </div>

      <button
        @click="$emit('openCheckout')"
        :disabled="cartStore.items.length === 0"
        class="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm shadow-lg shadow-emerald-500/25 transition flex items-center justify-center space-x-2 btn-interactive"
      >
        <CreditCard class="w-4 h-4" />
        <span>To'lovga O'tish (F10)</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ShoppingCart,
  ShoppingBag,
  Trash2,
  CreditCard,
  PauseCircle,
  History,
} from 'lucide-vue-next';
import { useFormat } from '../../../composables/useFormat';

defineProps<{
  mobileViewTab: 'catalog' | 'cart';
  cartStore: any;
  isRestaurant: boolean;
  enabledServiceTypes: string[];
  orderType: string;
  currentTableDisplayName: string;
  availableTables: any[];
  selectedTableNumber: string;
  heldOrdersCount: number;
}>();

defineEmits<{
  (e: 'update:orderType', val: string): void;
  (e: 'selectTable', tableName: string): void;
  (e: 'holdCart'): void;
  (e: 'openHeldOrders'): void;
  (e: 'openCheckout'): void;
}>();

const { formatCurrency } = useFormat();
</script>
