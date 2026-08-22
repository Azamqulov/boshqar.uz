<template>
  <div class="flex-1 flex flex-col gap-3 overflow-hidden">
    <!-- Mobile Tab Switcher (< lg) -->
    <div class="flex lg:hidden items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0 gap-1">
      <button
        @click="mobileWaiterTab = 'menu'"
        class="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
        :class="mobileWaiterTab === 'menu' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'"
      >
        <UtensilsCrossed class="w-3.5 h-3.5" />
        <span>Taomnoma ({{ filteredMenu.length }})</span>
      </button>
      <button
        @click="mobileWaiterTab = 'cart'"
        class="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
        :class="mobileWaiterTab === 'cart' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'"
      >
        <ShoppingCart class="w-3.5 h-3.5" />
        <span>Stol Savati ({{ existingItems.length + newItems.length }})</span>
        <span v-if="orderTotalSum > 0" class="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
          {{ formatCurrency(orderTotalSum) }}
        </span>
      </button>
    </div>

    <!-- Main Workspace -->
    <div class="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
      <!-- Left Menu & Dishes (60%) -->
      <div
        class="flex-1 flex-col glass-card rounded-2xl p-3 sm:p-4 overflow-hidden"
        :class="mobileWaiterTab === 'menu' ? 'flex' : 'hidden lg:flex'"
      >
      <!-- Category Selector & Search -->
      <div class="flex flex-col sm:flex-row gap-3 mb-4 shrink-0">
        <div class="flex-1">
          <AppInput
            :model-value="menuSearch"
            @update:model-value="$emit('update:menuSearch', $event)"
            placeholder="Taom yoki ichimlik qidirish..."
            :icon="Search"
          />
        </div>

        <div class="flex items-center space-x-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          <button
            @click="$emit('update:selectedCategory', '')"
            class="px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition"
            :class="selectedCategory === '' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
          >
            Barchasi
          </button>
          <button
            v-for="cat in categories"
            :key="cat.id"
            @click="$emit('update:selectedCategory', cat.id)"
            class="px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition"
            :class="selectedCategory === cat.id ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
          >
            {{ cat.name }}
          </button>
        </div>
      </div>

      <!-- Dishes Grid -->
      <div class="flex-1 overflow-y-auto pr-1">
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <div
            v-for="prod in filteredMenu"
            :key="prod.id"
            @click="$emit('addDish', prod)"
            class="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 transition cursor-pointer flex flex-col justify-between group shadow-sm btn-interactive"
          >
            <div class="w-full h-20 rounded-xl bg-slate-200 dark:bg-slate-900 overflow-hidden mb-2 relative">
              <img v-if="prod.imageUrl" :src="prod.imageUrl" class="w-full h-full object-cover group-hover:scale-105 transition" />
              <div v-else class="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-600">
                <UtensilsCrossed class="w-7 h-7" />
              </div>
            </div>

            <div>
              <h4 class="font-bold text-xs text-slate-900 dark:text-white line-clamp-1 group-hover:text-amber-500 transition">{{ prod.name }}</h4>
              <p class="text-[11px] font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">{{ formatCurrency(prod.salePrice) }}</p>
            </div>

            <div class="mt-2 flex justify-end">
              <span class="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 font-bold flex items-center justify-center text-xs transition">
                +
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Table Order Cart & Controls (40%) -->
    <div
      class="w-full lg:w-96 flex-col glass-card rounded-2xl p-4 overflow-hidden shrink-0"
      :class="mobileWaiterTab === 'cart' ? 'flex' : 'hidden lg:flex'"
    >
      <!-- Table Cart Header -->
      <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span class="text-xs font-bold text-amber-500 uppercase tracking-wider">Tanlangan Stol:</span>
          <h2 class="text-lg font-black text-slate-900 dark:text-white">{{ selectedTable.name }}</h2>
        </div>
        <span
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
          :class="selectedTable.status === 'occupied' ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25' : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25'"
        >
          <span class="w-1.5 h-1.5 rounded-full" :class="selectedTable.status === 'occupied' ? 'bg-rose-500' : 'bg-emerald-500'"></span>
          <span>{{ selectedTable.status === 'occupied' ? 'Band' : 'Bo\'sh' }}</span>
        </span>
      </div>

      <!-- Ordered Items list -->
      <div class="flex-1 overflow-y-auto py-3 space-y-3">
        <!-- Existing Order on Table -->
        <div v-if="existingItems.length > 0" class="space-y-1.5">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avval kiritilgan buyurtmalar:</span>
          <div
            v-for="item in existingItems"
            :key="item.id"
            class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
          >
            <div>
              <p class="font-bold text-slate-900 dark:text-white">{{ item.product?.name || item.name }}</p>
              <span class="text-[11px] text-slate-500 font-mono">{{ item.quantity }} x {{ formatCurrency(item.unitPrice || item.price) }}</span>
            </div>
            <div class="text-right">
              <span class="font-bold text-slate-900 dark:text-white font-mono">{{ formatCurrency(item.total || (item.quantity * item.unitPrice)) }}</span>
              <span class="block text-[9px] font-bold text-emerald-500">Oshxonada</span>
            </div>
          </div>
        </div>

        <!-- New Selected Dishes -->
        <div v-if="newItems.length > 0" class="space-y-1.5">
          <span class="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">Yangi qo'shilganlar:</span>
          <div
            v-for="item in newItems"
            :key="item.product.id"
            class="p-2.5 rounded-xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/30 flex items-center justify-between text-xs"
          >
            <div class="flex-1 min-w-0 pr-2">
              <p class="font-bold text-slate-900 dark:text-white truncate">{{ item.product.name }}</p>
              <span class="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">{{ formatCurrency(item.product.salePrice) }}</span>
            </div>

            <!-- Quantity Controls -->
            <div class="flex items-center space-x-2">
              <div class="flex items-center space-x-1">
                <button
                  @click="$emit('decreaseNewItem', item)"
                  class="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold"
                >-</button>
                <span class="w-6 text-center font-bold font-mono">{{ item.quantity }}</span>
                <button
                  @click="$emit('increaseNewItem', item)"
                  class="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold"
                >+</button>
              </div>
              <span class="font-black text-slate-900 dark:text-white font-mono min-w-[60px] text-right">
                {{ formatCurrency(item.product.salePrice * item.quantity) }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="existingItems.length === 0 && newItems.length === 0" class="text-center py-12 text-slate-400 text-xs">
          Stolga qo'shish uchun chap tomondan taomlarni tanlang
        </div>
      </div>

      <!-- Total Sum & Action Buttons -->
      <div class="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3 shrink-0">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-500">Jami Stol Summasi:</span>
          <span class="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">{{ formatCurrency(orderTotalSum) }}</span>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <!-- Send to Kitchen (KDS) -->
          <button
            @click="$emit('sendToKitchen')"
            :disabled="newItems.length === 0 || sending"
            class="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black text-xs shadow-md flex items-center justify-center gap-1.5 transition btn-interactive"
          >
            <Flame class="w-4 h-4 fill-slate-950" />
            <span>{{ sending ? 'Yuborilmoqda...' : 'Oshxonaga Yuborish' }}</span>
          </button>

          <!-- Pre-Bill / Print Check -->
          <button
            @click="$emit('openPreBill')"
            :disabled="existingItems.length === 0 && newItems.length === 0"
            class="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition btn-interactive"
          >
            <Receipt class="w-4 h-4" />
            <span>Pre-Chek (Hisob)</span>
          </button>
        </div>

        <!-- Direct Table Payment & Close Bill Button -->
        <button
          @click="$emit('openPayModal')"
          :disabled="orderTotalSum <= 0 || payingTable"
          class="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-98 disabled:opacity-50 text-white font-black text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition btn-interactive"
        >
          <CheckCircle2 class="w-5 h-5" />
          <span>{{ payingTable ? 'Hisob yopilmoqda...' : 'To\'lovni Qabul Qilish (Hisobni Yopish)' }}</span>
        </button>
      </div>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Search, Flame, Receipt, CheckCircle2, UtensilsCrossed } from 'lucide-vue-next';
import AppInput from '../../../components/AppInput.vue';
import { useFormat } from '../../../composables/useFormat';

const mobileWaiterTab = ref<'menu' | 'cart'>('menu');

defineProps<{
  menuSearch: string;
  selectedCategory: string;
  categories: any[];
  filteredMenu: any[];
  selectedTable: any;
  existingItems: any[];
  newItems: any[];
  orderTotalSum: number;
  sending: boolean;
  payingTable: boolean;
}>();

defineEmits<{
  (e: 'update:menuSearch', val: string): void;
  (e: 'update:selectedCategory', val: string): void;
  (e: 'addDish', prod: any): void;
  (e: 'increaseNewItem', item: any): void;
  (e: 'decreaseNewItem', item: any): void;
  (e: 'sendToKitchen'): void;
  (e: 'openPreBill'): void;
  (e: 'openPayModal'): void;
}>();

const { formatCurrency } = useFormat();
</script>
