<template>
  <div class="space-y-4">
    <div class="glass-card rounded-2xl overflow-hidden p-4 space-y-4">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt class="w-4 h-4 text-blue-500" />
            <span>Savdolar va Cheklar Jurnali</span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">Kassadan chiqarilgan barcha cheklar va sotuv tafsilotlari</p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <!-- Payment Filter Pills -->
          <div class="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
            <button
              type="button"
              @click="orderPaymentFilter = 'all'"
              class="px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap"
              :class="orderPaymentFilter === 'all' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
            >
              Barchasi
            </button>
            <button
              type="button"
              @click="orderPaymentFilter = 'cash'"
              class="px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap"
              :class="orderPaymentFilter === 'cash' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
            >
              Naqd
            </button>
            <button
              type="button"
              @click="orderPaymentFilter = 'card'"
              class="px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap"
              :class="orderPaymentFilter === 'card' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
            >
              Plastik
            </button>
          </div>

          <!-- Search input -->
          <div class="relative w-full sm:w-56">
            <Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" v-model="orderSearch" placeholder="Chek #, kassir yoki mijoz..."
              class="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100/80 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500" />
          </div>
        </div>
      </div>
      <!-- Skeleton -->
      <SkeletonLoader v-if="loading" variant="table" :rows="6" />

      <!-- Empty State -->
      <AppEmptyState
        v-else-if="filteredOrders.length === 0"
        :title="orderSearch || orderPaymentFilter !== 'all' ? 'Cheklar topilmadi' : 'Cheklar yo\'q'"
        :description="orderSearch || orderPaymentFilter !== 'all' ? 'Qidiruv yoki filtr bo\'yicha chek topilmadi. Qidiruvni tozalang.' : 'Hozircha hech qanday sotuv cheki rasmiylashtirilmagan.'"
        :variant="orderSearch || orderPaymentFilter !== 'all' ? 'search' : 'finance'"
      >
        <template v-if="orderSearch || orderPaymentFilter !== 'all'" #action>
          <button
            type="button"
            @click="orderSearch = ''; orderPaymentFilter = 'all'"
            class="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition btn-interactive cursor-pointer"
          >
            Filtrlarni tozalash
          </button>
        </template>
      </AppEmptyState>

      <!-- 2.1 TABLE VIEW (Desktop Table + Mobile Cards) -->
      <div v-else-if="viewMode === 'table'" class="w-full">
        <!-- Mobile cards when on small screens (< md) -->
        <div class="block md:hidden space-y-3">
          <div v-if="!loading && filteredOrders.length === 0" class="py-8 text-center text-slate-400 dark:text-slate-500">
            <Receipt class="w-8 h-8 mx-auto mb-2 opacity-30" />
            <span>Cheklar mavjud emas</span>
          </div>

          <div
            v-for="order in pagination.paginatedItems.value"
            :key="order.id"
            class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs"
          >
            <div class="flex items-center justify-between">
              <span class="font-black font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                {{ order.orderNumber }}
              </span>
              <span class="text-[10px] text-slate-400 font-mono">
                {{ formatDate(order.completedAt || order.createdAt) }}
              </span>
            </div>

            <div class="space-y-1 text-xs">
              <p class="font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Kassir:</span>
                <span class="font-bold">{{ order.cashier?.fullName || 'Kassir' }}</span>
              </p>
              <p v-if="order.customer?.fullName" class="text-slate-500 flex items-center justify-between">
                <span>Mijoz:</span>
                <span class="font-medium text-slate-700 dark:text-slate-300">{{ order.customer.fullName }}</span>
              </p>
              <div class="text-[11px] text-slate-500 truncate pt-0.5">
                <span v-for="(item, i) in order.items" :key="item.id">
                  {{ item.quantity }}x {{ item.product?.name || item.service?.name }}<span v-if="i < order.items.length - 1">, </span>
                </span>
              </div>
            </div>

            <div class="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div class="flex flex-wrap gap-1">
                <span v-for="pay in order.payments" :key="pay.id"
                  class="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold" :class="[
                    pay.paymentMethod?.type === 'cash'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : pay.paymentMethod?.type === 'card'
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                  ]">
                  {{ pay.paymentMethod?.name || 'To\'lov' }}
                </span>
              </div>
              <span class="font-black text-sm text-slate-900 dark:text-white font-mono">
                {{ formatCurrency(order.total) }}
              </span>
            </div>

            <div class="flex items-center gap-2 pt-1">
              <button
                type="button"
                @click="$emit('viewReceipt', order)"
                class="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5 btn-interactive"
              >
                <Eye class="w-3.5 h-3.5" />
                <span>Chekni ko'rish</span>
              </button>
              <button
                type="button"
                @click="$emit('cancelOrder', order)"
                class="p-2 rounded-xl text-rose-500 bg-rose-500/10 transition"
                title="Chekni bekor qilish"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Desktop Table View (>= md) -->
        <div class="hidden md:block overflow-x-auto max-w-full w-full">
          <table class="w-full text-left text-xs border-collapse min-w-[650px]">
            <thead class="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-semibold whitespace-nowrap">
              <tr>
                <th class="py-3 px-4">Chek #</th>
                <th class="py-3 px-4">Sana va Vaqt</th>
                <th class="py-3 px-4">Kassir / Mas'ul</th>
                <th class="py-3 px-4">Mahsulotlar</th>
                <th class="py-3 px-4">To'lov Turi</th>
                <th class="py-3 px-4 text-right">Summa</th>
                <th class="py-3 px-4 text-center">Harakat</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200 text-xs">
              <tr v-if="!loading && filteredOrders.length === 0">
                <td colspan="7" class="py-12 text-center text-slate-400 dark:text-slate-500">
                  <Receipt class="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <span>Cheklar mavjud emas</span>
                </td>
              </tr>
              <tr v-for="order in pagination.paginatedItems.value" :key="order.id"
                class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                <td class="py-3.5 px-4 font-black font-mono text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                  {{ order.orderNumber }}
                </td>
                <td class="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono whitespace-nowrap">
                  {{ formatDate(order.completedAt || order.createdAt) }}
                </td>
                <td class="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                  {{ order.cashier?.fullName || 'Kassir' }}
                </td>
                <td class="py-3.5 px-4 max-w-xs whitespace-nowrap">
                  <div class="truncate text-slate-600 dark:text-slate-300 max-w-[200px]">
                    <span v-for="(item, i) in order.items" :key="item.id">
                      {{ item.quantity }}x {{ item.product?.name || item.service?.name }}<span
                        v-if="i < order.items.length - 1">, </span>
                    </span>
                  </div>
                </td>
                <td class="py-3.5 px-4 whitespace-nowrap">
                  <span v-for="pay in order.payments" :key="pay.id"
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold mr-1 whitespace-nowrap" :class="[
                      pay.paymentMethod?.type === 'cash'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : pay.paymentMethod?.type === 'card'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                    ]">
                    {{ pay.paymentMethod?.name || 'To\'lov' }}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-right font-black text-slate-900 dark:text-white font-mono whitespace-nowrap">
                  {{ formatCurrency(order.total) }}
                </td>
                <td class="py-3.5 px-4 text-center whitespace-nowrap">
                  <div class="flex items-center justify-center gap-1.5">
                    <button @click="$emit('viewReceipt', order)"
                      class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition flex items-center gap-1">
                      <Eye class="w-3.5 h-3.5" />
                      <span>Ko'rish</span>
                    </button>
                    <button @click="$emit('cancelOrder', order)"
                      class="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      title="Chekni bekor qilish / o'chirish">
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 2.2 CARD / GRID VIEW -->
      <div v-else-if="viewMode === 'grid'">
        <SkeletonLoader v-if="loading" variant="cards" :count="6" />

        <div v-else-if="filteredOrders.length === 0" class="p-12 text-center text-slate-400 dark:text-slate-500 glass-card rounded-2xl">
          <Receipt class="w-10 h-10 mx-auto mb-2 opacity-30" />
          <span>Cheklar mavjud emas</span>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="order in pagination.paginatedItems.value"
          :key="order.id"
          class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 hover:border-blue-500/50 transition"
        >
          <div class="flex items-center justify-between">
            <span class="font-black font-mono text-emerald-600 dark:text-emerald-400 text-sm">
              {{ order.orderNumber }}
            </span>
            <span class="text-[10px] text-slate-400 font-mono">
              {{ formatDate(order.completedAt || order.createdAt) }}
            </span>
          </div>

          <div class="space-y-1 py-1">
            <p class="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Kassir: <span class="font-bold">{{ order.cashier?.fullName || 'Kassir' }}</span>
            </p>
            <p v-if="order.customer?.fullName" class="text-xs text-slate-500">
              Mijoz: {{ order.customer.fullName }}
            </p>
            <div class="text-xs text-slate-500 truncate">
              <span v-for="(item, i) in order.items" :key="item.id">
                {{ item.quantity }}x {{ item.product?.name || item.service?.name }}<span
                  v-if="i < order.items.length - 1">, </span>
              </span>
            </div>
          </div>

          <div class="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div class="flex flex-wrap gap-1">
              <span v-for="pay in order.payments" :key="pay.id"
                class="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold" :class="[
                  pay.paymentMethod?.type === 'cash'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : pay.paymentMethod?.type === 'card'
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                ]">
                {{ pay.paymentMethod?.name || 'To\'lov' }}
              </span>
            </div>
            <span class="font-black text-sm text-slate-900 dark:text-white font-mono">
              {{ formatCurrency(order.total) }}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <button @click="$emit('viewReceipt', order)"
              class="flex-1 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center justify-center gap-1.5">
              <Eye class="w-3.5 h-3.5" />
              <span>Chekni Ko'rish</span>
            </button>
            <button @click="$emit('cancelOrder', order)"
              class="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition"
              title="Chekni bekor qilish">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>

    <!-- Pagination (cleanly placed outside the table card) -->
    <AppPagination
      v-if="!loading"
      v-model:current-page="pagination.currentPage.value"
      v-model:page-size="pagination.pageSize.value"
      :total-items="filteredOrders.length"
      item-name="chek"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Receipt, Search, Eye, Trash2 } from 'lucide-vue-next';
import SkeletonLoader from '../../../components/SkeletonLoader.vue';
import AppPagination from '../../../components/AppPagination.vue';
import AppEmptyState from '../../../components/AppEmptyState.vue';
import { useFormat } from '../../../composables/useFormat';
import { usePagination } from '../../../composables/usePagination';

const props = defineProps<{
  orders: any[];
  viewMode: 'table' | 'grid';
  loading?: boolean;
}>();

defineEmits<{
  (e: 'viewReceipt', order: any): void;
  (e: 'cancelOrder', order: any): void;
}>();

const { formatCurrency, formatDate } = useFormat();

const orderSearch = ref('');
const orderPaymentFilter = ref<'all' | 'cash' | 'card' | 'other'>('all');

const filteredOrders = computed(() => {
  let list = props.orders || [];

  if (orderPaymentFilter.value !== 'all') {
    list = list.filter((o: any) => {
      const payments = o.payments || [];
      return payments.some((p: any) => {
        const t = (p.paymentMethod?.type || '').toLowerCase();
        if (orderPaymentFilter.value === 'cash') return t === 'cash';
        if (orderPaymentFilter.value === 'card') return t === 'card';
        if (orderPaymentFilter.value === 'other') return t !== 'cash' && t !== 'card';
        return true;
      });
    });
  }

  if (!orderSearch.value) return list;
  const q = orderSearch.value.toLowerCase().trim();
  return list.filter(
    (o: any) =>
      o.orderNumber?.toLowerCase().includes(q) ||
      o.cashier?.fullName?.toLowerCase().includes(q) ||
      o.customer?.fullName?.toLowerCase().includes(q),
  );
});

const pagination = usePagination(filteredOrders);

watch([orderSearch, orderPaymentFilter], () => {
  pagination.resetPage();
});
</script>
