<template>
  <div class="h-[calc(100vh-5.5rem)] flex flex-col space-y-4 overflow-hidden">
    <!-- Top Bar -->
    <div class="flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20">
          <UtensilsCrossed class="w-6 h-6" />
        </div>
        <div>
          <h1 class="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Ofitsiant & Stollar Boshqaruvi
            <span class="text-[10px] uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold">
              Waiter POS
            </span>
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400">Stolni tanlang, taomlarni qo'shing va bir tugma bilan oshxonaga yuboring</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="selectedTable"
          @click="selectedTable = null"
          class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition border border-slate-200 dark:border-slate-700"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>Stollar Xaritasiga Qaytish</span>
        </button>
        <button
          @click="loadTables(true)"
          :disabled="loading"
          class="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition border border-slate-200 dark:border-slate-700"
          title="Yangilash"
        >
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
        </button>
      </div>
    </div>

    <!-- MAIN VIEW 1: STOLLAR XARITASI (TABLES MAP) -->
    <div v-if="!selectedTable" class="flex-1 overflow-y-auto pr-1">
      <SkeletonLoader v-if="loading" variant="grid" :count="10" />

      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div
          v-for="table in tables"
          :key="table.id"
          @click="selectTable(table)"
          class="p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden h-44 btn-interactive"
          :class="[
            table.status === 'occupied'
              ? 'bg-rose-500/5 dark:bg-rose-950/20 border-rose-500/40 hover:border-rose-500 shadow-sm'
              : table.status === 'cleaning'
              ? 'bg-blue-500/5 dark:bg-blue-950/20 border-blue-500/40 hover:border-blue-500'
              : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 shadow-sm'
          ]"
        >
          <!-- Top table header -->
          <div class="flex items-start justify-between">
            <div>
              <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Sig'im: {{ table.capacity }} kishi</span>
              <h3 class="text-base font-black text-slate-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition mt-0.5">{{ table.name }}</h3>
            </div>
            <span
              class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
              :class="[
                table.status === 'occupied'
                  ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30'
                  : table.status === 'cleaning'
                  ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30'
                  : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
              ]"
            >
              {{ table.status === 'occupied' ? 'Band' : table.status === 'cleaning' ? 'Tozalanmoqda' : 'Bo\'sh' }}
            </span>
          </div>

          <!-- Active Order Info -->
          <div v-if="table.orders?.[0]" class="my-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-1">
            <div class="flex items-center justify-between text-[11px]">
              <span class="text-slate-500 dark:text-slate-400 font-mono">{{ table.orders[0].orderNumber }}</span>
              <span class="font-bold text-amber-600 dark:text-amber-400 font-mono">{{ formatCurrency(table.orders[0].total) }}</span>
            </div>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 truncate">Ofitsiant: {{ table.orders[0].waiter?.fullName || 'Jasur' }}</p>
          </div>

          <div v-else class="text-center py-3 text-slate-400 dark:text-slate-600 text-xs">
            Buyurtma yo'q
          </div>

          <!-- Bottom Action prompt -->
          <div class="pt-2 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition">
            <span>{{ table.status === 'occupied' ? 'Buyurtmani ko\'rish' : 'Buyurtma olish' }}</span>
            <ArrowRight class="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </div>
        </div>
      </div>
    </div>

    <!-- MAIN VIEW 2: STOL BUYURTMA OLISH OYNASI (WAITER POS) -->
    <div v-else class="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
      <!-- Left Menu & Dishes (60%) -->
      <div class="flex-1 flex flex-col glass-card rounded-2xl p-4 overflow-hidden">
        <!-- Category Selector & Search -->
        <div class="flex flex-col sm:flex-row gap-3 mb-4">
          <div class="flex-1">
            <AppInput
              v-model="menuSearch"
              placeholder="Taom yoki ichimlik qidirish..."
              :icon="Search"
            />
          </div>

          <div class="flex items-center space-x-1.5 overflow-x-auto">
            <button
              @click="selectedCategory = ''"
              class="px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition"
              :class="selectedCategory === '' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
            >
              Barchasi
            </button>
            <button
              v-for="cat in categories"
              :key="cat.id"
              @click="selectedCategory = cat.id"
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
              v-for="item in filteredMenu"
              :key="item.id"
              @click="addDishToTable(item)"
              class="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/90 dark:bg-slate-800/70 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/70 hover:border-amber-500/50 cursor-pointer transition flex flex-col justify-between group shadow-sm"
            >
              <div class="w-full h-24 rounded-lg bg-slate-100 dark:bg-slate-900 overflow-hidden mb-2 relative flex items-center justify-center">
                <img
                  v-if="item.imageUrl"
                  :src="item.imageUrl"
                  class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  @error="item.imageUrl = null"
                />
                <UtensilsCrossed v-else class="w-7 h-7 text-slate-400 dark:text-slate-600 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition" />
              </div>

              <div>
                <h4 class="font-bold text-xs text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 line-clamp-1">{{ item.name }}</h4>
              </div>

              <div class="mt-2 flex items-center justify-between">
                <span class="text-xs font-black text-amber-600 dark:text-amber-400 font-mono">{{ formatCurrency(item.salePrice) }}</span>
                <span class="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition">+</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Table Order Drawer (40%) -->
      <div class="w-full lg:w-96 flex flex-col glass-card rounded-2xl p-4 overflow-hidden border border-slate-200 dark:border-slate-800">
        <!-- Table & Order Status Header -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 class="font-black text-base text-slate-900 dark:text-white flex items-center gap-1.5">
              {{ selectedTable.name }}
            </h3>
            <span class="text-[11px] text-slate-500 dark:text-slate-400">Sig'im: {{ selectedTable.capacity }} kishi</span>
          </div>
          <span
            class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
            :class="selectedTable.status === 'occupied' ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'"
          >
            {{ selectedTable.status === 'occupied' ? 'Band' : 'Bo\'sh' }}
          </span>
        </div>

        <!-- Selected Items List -->
        <div class="flex-1 overflow-y-auto py-3 space-y-2">
          <!-- Newly added items (Waiting to be sent to Kitchen) -->
          <div v-if="newItems.length > 0" class="space-y-1.5">
            <span class="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400 tracking-wider">Yangi qo'shilgan (Oshxonaga yuborilmagan):</span>
            <div
              v-for="(item, idx) in newItems"
              :key="idx"
              class="p-2.5 rounded-xl bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/30 flex items-center justify-between text-xs"
            >
              <div class="flex-1 pr-2">
                <span class="font-bold text-slate-900 dark:text-white block truncate">{{ item.product.name }}</span>
                <span class="text-[11px] text-amber-600 dark:text-amber-400 font-mono">{{ formatCurrency(item.product.salePrice * item.quantity) }}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <button @click="item.quantity > 1 ? item.quantity-- : newItems.splice(idx, 1)" class="w-6 h-6 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold">-</button>
                <span class="font-mono font-bold text-slate-900 dark:text-white w-5 text-center">{{ item.quantity }}</span>
                <button @click="item.quantity++" class="w-6 h-6 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold">+</button>
              </div>
            </div>
          </div>

          <!-- Previously Ordered items (Already sent to kitchen) -->
          <div v-if="existingItems.length > 0" class="space-y-1.5 pt-2">
            <span class="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Oshxonadagi taomlar:</span>
            <div
              v-for="item in existingItems"
              :key="item.id"
              class="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
            >
              <div class="truncate flex-1">
                <span class="text-slate-800 dark:text-slate-200 block truncate">{{ item.product?.name }}</span>
                <span class="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{{ item.quantity }} x {{ formatCurrency(item.unitPrice) }}</span>
              </div>
              <span
                class="px-2 py-0.5 rounded text-[10px] font-bold"
                :class="[
                  item.kitchenOrder?.status === 'ready'
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    : item.kitchenOrder?.status === 'cooking'
                    ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                    : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                ]"
              >
                {{ item.kitchenOrder?.status === 'ready' ? 'Tayyor' : item.kitchenOrder?.status === 'cooking' ? 'Pishmoqda' : 'Yangi' }}
              </span>
            </div>
          </div>

          <div v-if="newItems.length === 0 && existingItems.length === 0" class="h-40 flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs">
            Taomnoma bo'limidan taomlarni tanlang
          </div>
        </div>

        <!-- Action Buttons & Subtotal -->
        <div class="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs">
          <div class="flex items-center justify-between font-mono">
            <span class="text-slate-500 dark:text-slate-400">Jami Hisob:</span>
            <span class="text-lg font-black text-emerald-600 dark:text-emerald-400">{{ formatCurrency(orderTotalSum) }}</span>
          </div>

          <!-- SEND TO KITCHEN BUTTON -->
          <button
            v-if="newItems.length > 0"
            @click="sendToKitchen"
            :disabled="sending"
            class="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 transition flex items-center justify-center gap-2 btn-interactive"
          >
            <Flame class="w-5 h-5" />
            <span>{{ sending ? 'Yuborilmoqda...' : 'Oshxonaga Yuborish' }}</span>
          </button>

          <!-- PRE-BILL / CLOSE TABLE BUTTONS -->
          <div v-if="existingItems.length > 0" class="grid grid-cols-2 gap-2 pt-1">
            <button
              @click="openPreBillModal"
              class="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 transition"
            >
              <Receipt class="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>Pre-chek</span>
            </button>
            <button
              @click="redirectToCheckout"
              class="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20 transition"
            >
              <CreditCard class="w-4 h-4" />
              <span>To'lov / Kassa</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- PRE-BILL MODAL -->
    <div v-if="showPreBillModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm">
      <div class="glass-card rounded-2xl max-w-sm w-full p-6 space-y-4 border border-slate-200 dark:border-slate-700 font-mono text-xs shadow-2xl">
        <div class="text-center border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 class="text-base font-bold text-slate-900 dark:text-white font-sans">boshqar.uz Restaurant</h3>
          <p class="text-slate-500 dark:text-slate-400 text-[11px]">PRE-CHEK (Oraliq hisob)</p>
          <div class="mt-2 text-[10px] text-slate-500 dark:text-slate-400 flex justify-between">
            <span>Stol: {{ preBillData?.tableName }}</span>
            <span>Chek: {{ preBillData?.orderNumber }}</span>
          </div>
        </div>

        <div class="divide-y divide-slate-200 dark:divide-slate-800 space-y-1">
          <div v-for="(item, idx) in preBillData?.items" :key="idx" class="flex justify-between py-1 text-slate-800 dark:text-slate-200">
            <span>{{ item.name }} x{{ item.quantity }}</span>
            <span class="font-bold">{{ formatCurrency(item.total) }}</span>
          </div>
        </div>

        <div class="border-t border-slate-200 dark:border-slate-800 pt-2 space-y-1 text-slate-700 dark:text-slate-300">
          <div class="flex justify-between">
            <span>Taomlar jami:</span>
            <span>{{ formatCurrency(preBillData?.subtotal) }}</span>
          </div>
          <div class="flex justify-between text-amber-600 dark:text-amber-400">
            <span>Xizmat haqi ({{ preBillData?.serviceChargePercent }}%):</span>
            <span>+{{ formatCurrency(preBillData?.serviceFee) }}</span>
          </div>
          <div class="flex justify-between text-base font-black text-emerald-600 dark:text-emerald-400 border-t border-slate-200 dark:border-slate-800 pt-1.5">
            <span>JAMI TO'LOV:</span>
            <span>{{ formatCurrency(preBillData?.grandTotal) }}</span>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-3 font-sans">
          <button @click="showPreBillModal = false" class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
            Yopish
          </button>
          <button @click="printReceipt" class="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold flex items-center gap-1.5 btn-interactive">
            <Printer class="w-4 h-4" />
            <span>Chop Etish</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../services/api';
import { useFormat } from '../../composables/useFormat';
import {
  UtensilsCrossed,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Search,
  Flame,
  Receipt,
  CreditCard,
  Printer,
} from 'lucide-vue-next';

import SkeletonLoader from '../../components/SkeletonLoader.vue';
import AppInput from '../../components/AppInput.vue';
import { useToast } from '../../composables/useToast';
import { useDataStore } from '../../stores/data.store';

const router = useRouter();
const toast = useToast();
const dataStore = useDataStore();
const { formatCurrency } = useFormat();

const loading = ref(false);
const sending = ref(false);
const tables = computed(() => dataStore.tables);
const categories = computed(() => dataStore.categories);
const products = computed(() => dataStore.products);

const selectedTable = ref<any>(null);
const selectedCategory = ref('');
const menuSearch = ref('');

const newItems = ref<any[]>([]);
const existingItems = ref<any[]>([]);

const showPreBillModal = ref(false);
const preBillData = ref<any>(null);

const loadTables = async (force = false) => {
  if (dataStore.tables.length === 0) {
    loading.value = true;
  }
  try {
    await dataStore.fetchTables(force);
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const loadMenu = async () => {
  try {
    await Promise.all([
      dataStore.fetchCategories(),
      dataStore.fetchProducts(),
    ]);
  } catch (err) {
    console.error(err);
  }
};

const filteredMenu = computed(() => {
  return products.value.filter((p) => {
    if (p.status === 'inactive') return false;
    const matchSearch = !menuSearch.value || p.name.toLowerCase().includes(menuSearch.value.toLowerCase());
    const matchCat = !selectedCategory.value || p.categoryId === selectedCategory.value;
    return matchSearch && matchCat;
  });
});

const selectTable = (table: any) => {
  selectedTable.value = table;
  newItems.value = [];
  existingItems.value = table.orders?.[0]?.items || [];
};

const addDishToTable = (prod: any) => {
  const existing = newItems.value.find((i) => i.product.id === prod.id);
  if (existing) {
    existing.quantity++;
  } else {
    newItems.value.push({
      product: prod,
      quantity: 1,
    });
  }
  toast.info(`"${prod.name}" stol buyurtmasiga qo'shildi`, selectedTable.value.name);
};

const orderTotalSum = computed(() => {
  const newSum = newItems.value.reduce((sum, i) => sum + i.product.salePrice * i.quantity, 0);
  const existingSum = existingItems.value.reduce((sum, i) => sum + Number(i.total), 0);
  return newSum + existingSum;
});

const sendToKitchen = async () => {
  if (!selectedTable.value || newItems.value.length === 0) return;

  sending.value = true;
  try {
    const payload = {
      items: newItems.value.map((i) => ({
        productId: i.product.id,
        quantity: i.quantity,
      })),
    };

    const { data } = await api.post(`/restaurant/tables/${selectedTable.value.id}/order`, payload);
    newItems.value = [];
    existingItems.value = data.items || [];
    selectedTable.value.status = 'occupied';
    await loadTables();
    toast.success('🔥 Buyurtma oshxonaga (KDS) muvaffaqiyatli yuborildi!', selectedTable.value.name);
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Buyurtmani oshxonaga yuborishda xatolik yuz berdi', 'Xatolik');
  } finally {
    sending.value = false;
  }
};

const openPreBillModal = async () => {
  if (!selectedTable.value) return;
  try {
    const { data } = await api.get(`/restaurant/tables/${selectedTable.value.id}/pre-bill`);
    preBillData.value = data;
    showPreBillModal.value = true;
    toast.info('Pre-chek hisobi shakllantirildi', 'Oraliq hisob');
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Pre-chek ma\'lumotlarini yuklashda xatolik', 'Xatolik');
  }
};

const printReceipt = () => {
  window.print();
};

const redirectToCheckout = () => {
  router.push('/pos');
};

onMounted(() => {
  loadTables();
  loadMenu();
});
</script>
