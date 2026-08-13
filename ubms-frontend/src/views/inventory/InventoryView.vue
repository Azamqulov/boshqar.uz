<template>
  <div class="space-y-5">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Omborxona Boshqaruvi</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Real-time qoldiqlar, kirim va chiqim operatsiyalari</p>
      </div>

      <div class="flex items-center space-x-2">
        <button
          @click="openStockInModal"
          class="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition btn-interactive"
        >
          <ArrowDownLeft class="w-4 h-4" />
          <span>Kirim Qilish</span>
        </button>
        <button
          @click="openStockOutModal"
          class="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-500/20 transition btn-interactive"
        >
          <ArrowUpRight class="w-4 h-4" />
          <span>Chiqim Qilish</span>
        </button>
      </div>
    </div>

    <!-- Search input -->
    <div class="relative max-w-md">
      <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Mahsulot nomi yoki SKU bo'yicha qidiruv..."
        class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
      />
    </div>

    <!-- Inventory Table with Skeleton Loader -->
    <SkeletonLoader v-if="loading" variant="table" :rows="8" />

    <div v-else class="glass-card rounded-2xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-semibold">
            <tr>
              <th class="py-3 px-4">Mahsulot</th>
              <th class="py-3 px-4">SKU</th>
              <th class="py-3 px-4">Tannarx</th>
              <th class="py-3 px-4">Joriy Qoldiq</th>
              <th class="py-3 px-4">Holat</th>
              <th class="py-3 px-4">Jami Qiymat</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
            <tr v-if="filteredInventory.length === 0">
              <td colspan="6" class="py-8 text-center text-slate-400 dark:text-slate-500">Ombor ma'lumotlari topilmadi</td>
            </tr>
            <tr v-for="inv in filteredInventory" :key="inv.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
              <td class="py-3 px-4 font-bold text-slate-900 dark:text-white">{{ inv.productName || inv.product?.name }}</td>
              <td class="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono">{{ inv.sku || inv.product?.sku }}</td>
              <td class="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono">{{ formatCurrency(inv.purchasePrice || inv.product?.purchasePrice) }}</td>
              <td class="py-3 px-4 font-bold font-mono">{{ inv.quantity }} {{ inv.unit || inv.product?.unit?.shortName }}</td>
              <td class="py-3 px-4">
                <span
                  class="font-bold px-2 py-0.5 rounded text-[10px]"
                  :class="inv.isLowStock || (inv.quantity <= (inv.product?.minStock || 5)) ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'"
                >
                  {{ inv.isLowStock || (inv.quantity <= (inv.product?.minStock || 5)) ? 'Kam Qoldi ⚠️' : 'Yetarli ✓' }}
                </span>
              </td>
              <td class="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {{ formatCurrency((inv.quantity || 0) * Number(inv.purchasePrice || inv.product?.purchasePrice || 0)) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Stock In Modal -->
    <div v-if="isStockInOpen" @click.self="isStockInOpen = false" class="modal-overlay">
      <div class="modal-container max-w-md" @click.stop>
        <div class="modal-header">
          <h3 class="text-base font-bold text-slate-900 dark:text-white">Omborga Kirim Qilish</h3>
          <button @click="isStockInOpen = false" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"><X class="w-5 h-5" /></button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="submitStockIn" class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Mahsulotni tanlang *</label>
              <AppSelect
                v-model="stockForm.productId"
                :options="inventoryInOptions"
                :searchable="true"
                placeholder="Mahsulotni tanlang..."
                required
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kirim Miqdori *</label>
                <input type="number" step="any" required v-model.number="stockForm.quantity" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kirim Narxi (Tannarx)</label>
                <CurrencyInput
                  v-model="stockForm.purchasePrice"
                  placeholder="0"
                  suffix="so'm"
                />
              </div>
            </div>

            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kirim Sababi</label>
              <AppSelect
                v-model="stockForm.reason"
                :options="[
                  { value: 'manual', label: 'Inventarizatsiya / Qo\'lda kirim' },
                  { value: 'purchase', label: 'Ta\'minotchidan xarid' }
                ]"
              />
            </div>

            <button
              type="submit"
              :disabled="submitting"
              class="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition mt-4 btn-interactive"
            >
              {{ submitting ? 'Kirim qilinmoqda...' : 'Kirimni Tasdiqlash' }}
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- Stock Out Modal -->
    <div v-if="isStockOutOpen" @click.self="isStockOutOpen = false" class="modal-overlay">
      <div class="modal-container max-w-md" @click.stop>
        <div class="modal-header">
          <h3 class="text-base font-bold text-slate-900 dark:text-white">Ombordan Chiqim / Hisobdan Chiqarish</h3>
          <button @click="isStockOutOpen = false" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"><X class="w-5 h-5" /></button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="submitStockOut" class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Mahsulotni tanlang *</label>
              <AppSelect
                v-model="stockOutForm.productId"
                :options="inventoryOutOptions"
                :searchable="true"
                placeholder="Mahsulotni tanlang..."
                required
              />
            </div>

            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Chiqim Miqdori *</label>
              <input type="number" step="any" required v-model.number="stockOutForm.quantity" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20" />
            </div>

            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Chiqim Sababi</label>
              <AppSelect
                v-model="stockOutForm.reason"
                :options="[
                  { value: 'damage', label: 'Yaroqsiz / Buzilgan' },
                  { value: 'loss', label: 'Yo\'qolgan / Kamomad' },
                  { value: 'expired', label: 'Muddati o\'tgan' },
                  { value: 'internal_use', label: 'Xodimlar / Ichki foydalanish' }
                ]"
              />
            </div>

            <button
              type="submit"
              :disabled="submitting"
              class="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-lg shadow-rose-500/25 transition mt-4 btn-interactive"
            >
              {{ submitting ? 'Chiqim qilinmoqda...' : 'Chiqimni Tasdiqlash' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../services/api';
import { useFormat } from '../../composables/useFormat';
import { ArrowDownLeft, ArrowUpRight, X, Search } from 'lucide-vue-next';
import SkeletonLoader from '../../components/SkeletonLoader.vue';
import AppSelect from '../../components/AppSelect.vue';
import CurrencyInput from '../../components/CurrencyInput.vue';
import { useToast } from '../../composables/useToast';

const toast = useToast();
const { formatCurrency } = useFormat();

const loading = ref(false);
const submitting = ref(false);
const searchQuery = ref('');
const inventory = ref<any[]>([]);
const isStockInOpen = ref(false);
const isStockOutOpen = ref(false);

const stockForm = ref({
  productId: '',
  quantity: 1,
  purchasePrice: 0,
  reason: 'manual',
});

const stockOutForm = ref({
  productId: '',
  quantity: 1,
  reason: 'damage',
});

const inventoryInOptions = computed(() => {
  return inventory.value.map((inv) => ({
    value: inv.productId || inv.product?.id,
    label: `${inv.productName || inv.product?.name} (${inv.sku || inv.product?.sku || 'SKU yoq'})`,
  }));
});

const inventoryOutOptions = computed(() => {
  return inventory.value.map((inv) => ({
    value: inv.productId || inv.product?.id,
    label: `${inv.productName || inv.product?.name} (Qoldiq: ${inv.quantity})`,
  }));
});

const filteredInventory = computed(() => {
  if (!searchQuery.value) return inventory.value;
  return inventory.value.filter((inv) => {
    const name = (inv.productName || inv.product?.name || '').toLowerCase();
    const sku = (inv.sku || inv.product?.sku || '').toLowerCase();
    return name.includes(searchQuery.value.toLowerCase()) || sku.includes(searchQuery.value.toLowerCase());
  });
});

const loadInventory = async () => {
  loading.value = true;
  try {
    const { data } = await api.get('/inventory');
    inventory.value = data || [];
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const openStockInModal = () => {
  if (inventory.value.length > 0) {
    stockForm.value.productId = inventory.value[0].productId || inventory.value[0].product?.id;
  }
  isStockInOpen.value = true;
};

const openStockOutModal = () => {
  if (inventory.value.length > 0) {
    stockOutForm.value.productId = inventory.value[0].productId || inventory.value[0].product?.id;
  }
  isStockOutOpen.value = true;
};

const submitStockIn = async () => {
  if (!stockForm.value.productId) {
    toast.warning('Mahsulotni tanlang', 'Omborxona');
    return;
  }
  if (!stockForm.value.quantity || Number(stockForm.value.quantity) <= 0) {
    toast.warning('Miqdorni to\'g\'ri kiriting', 'Omborxona');
    return;
  }

  submitting.value = true;
  try {
    await api.post('/inventory/in', {
      ...stockForm.value,
      quantity: Number(stockForm.value.quantity),
      purchasePrice: Number(stockForm.value.purchasePrice) || 0,
    });
    toast.success('Omborga muvaffaqiyatli kirim qilindi!', 'Omborxona');
    isStockInOpen.value = false;
    await loadInventory();
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Kirim qilishda xatolik yuz berdi', 'Xatolik');
  } finally {
    submitting.value = false;
  }
};

const submitStockOut = async () => {
  if (!stockOutForm.value.productId) {
    toast.warning('Mahsulotni tanlang', 'Omborxona');
    return;
  }
  if (!stockOutForm.value.quantity || Number(stockOutForm.value.quantity) <= 0) {
    toast.warning('Miqdorni to\'g\'ri kiriting', 'Omborxona');
    return;
  }

  submitting.value = true;
  try {
    await api.post('/inventory/out', {
      ...stockOutForm.value,
      quantity: Number(stockOutForm.value.quantity),
    });
    toast.success('Ombordan muvaffaqiyatli chiqim qilindi!', 'Omborxona');
    isStockOutOpen.value = false;
    await loadInventory();
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Chiqim qilishda xatolik yuz berdi', 'Xatolik');
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  loadInventory();
});
</script>
