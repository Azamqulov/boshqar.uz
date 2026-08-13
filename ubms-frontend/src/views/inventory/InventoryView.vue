<template>
  <div class="space-y-5">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Omborxona Boshqaruvi</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Real-time qoldiqlar, kirim va chiqim operatsiyalari</p>
      </div>

      <div class="flex items-center gap-2">
        <AppButton variant="primary" size="md" :icon="ArrowDownLeft" @click="openStockInModal">
          Kirim Qilish
        </AppButton>
        <AppButton variant="danger" size="md" :icon="ArrowUpRight" @click="openStockOutModal">
          Chiqim Qilish
        </AppButton>
      </div>
    </div>

    <!-- Search input -->
    <div class="max-w-md">
      <AppInput
        v-model="searchQuery"
        placeholder="Mahsulot nomi yoki SKU bo'yicha qidiruv..."
        :icon="Search"
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
          <form @submit.prevent="submitStockIn" class="space-y-3.5 text-xs">
            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Mahsulotni tanlang *</label>
              <AppSelect
                v-model="stockForm.productId"
                :options="inventoryInOptions"
                :searchable="true"
                placeholder="Mahsulotni tanlang..."
                required
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <AppInput
                v-model="stockForm.quantity"
                label="Kirim Miqdori *"
                type="number"
                placeholder="0"
                :required="true"
              />
              <div>
                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Kirim Narxi (Tannarx)</label>
                <CurrencyInput
                  v-model="stockForm.purchasePrice"
                  placeholder="0"
                  suffix="so'm"
                />
              </div>
            </div>

            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Kirim Sababi</label>
              <AppSelect
                v-model="stockForm.reason"
                :options="[
                  { value: 'manual', label: 'Inventarizatsiya / Qo\'lda kirim' },
                  { value: 'purchase', label: 'Ta\'minotchidan xarid' }
                ]"
              />
            </div>

            <div class="pt-2">
              <AppButton type="submit" variant="primary" size="lg" class="w-full" :loading="submitting">
                {{ submitting ? 'Kirim qilinmoqda...' : 'Kirimni Tasdiqlash' }}
              </AppButton>
            </div>
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
          <form @submit.prevent="submitStockOut" class="space-y-3.5 text-xs">
            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Mahsulotni tanlang *</label>
              <AppSelect
                v-model="stockOutForm.productId"
                :options="inventoryOutOptions"
                :searchable="true"
                placeholder="Mahsulotni tanlang..."
                required
              />
            </div>

            <AppInput
              v-model="stockOutForm.quantity"
              label="Chiqim Miqdori *"
              type="number"
              placeholder="0"
              :required="true"
            />

            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Chiqim Sababi</label>
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

            <div class="pt-2">
              <AppButton type="submit" variant="danger" size="lg" class="w-full" :loading="submitting">
                {{ submitting ? 'Chiqim qilinmoqda...' : 'Chiqimni Tasdiqlash' }}
              </AppButton>
            </div>
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
import AppInput from '../../components/AppInput.vue';
import AppButton from '../../components/AppButton.vue';
import CurrencyInput from '../../components/CurrencyInput.vue';
import { useDataStore } from '../../stores/data.store';
import { useToast } from '../../composables/useToast';

const toast = useToast();
const dataStore = useDataStore();
const { formatCurrency } = useFormat();

const loading = ref(false);
const submitting = ref(false);
const searchQuery = ref('');
const inventory = computed(() => dataStore.inventory);
const isStockInOpen = ref(false);
const isStockOutOpen = ref(false);

const stockForm = ref({
  productId: '',
  quantity: 1 as number,
  purchasePrice: 0,
  reason: 'manual',
});

const stockOutForm = ref({
  productId: '',
  quantity: 1 as number,
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

const loadInventory = async (force = false) => {
  if (dataStore.inventory.length === 0) {
    loading.value = true;
  }
  try {
    await dataStore.fetchInventory(force);
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const openStockInModal = () => {
  if (inventory.value.length > 0) {
    stockForm.value.productId = inventory.value[0].productId || inventory.value[0].product?.id;
    stockForm.value.purchasePrice = Number(inventory.value[0].purchasePrice || inventory.value[0].product?.purchasePrice) || 0;
  }
  stockForm.value.quantity = 1;
  isStockInOpen.value = true;
};

const openStockOutModal = () => {
  if (inventory.value.length > 0) {
    stockOutForm.value.productId = inventory.value[0].productId || inventory.value[0].product?.id;
  }
  stockOutForm.value.quantity = 1;
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
    // Optimistic: update quantity in the store immediately
    const inv = inventory.value.find((i: any) => (i.productId || i.product?.id) === stockForm.value.productId);
    if (inv) inv.quantity = Number(inv.quantity || 0) + Number(stockForm.value.quantity);
    isStockInOpen.value = false;
    dataStore.invalidate('products');
    dataStore.invalidate('inventory');
    dataStore.invalidate('dashboard');
    loadInventory(true); // background refresh
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
    // Optimistic: reduce quantity in store immediately
    const inv = inventory.value.find((i: any) => (i.productId || i.product?.id) === stockOutForm.value.productId);
    if (inv) inv.quantity = Math.max(0, Number(inv.quantity || 0) - Number(stockOutForm.value.quantity));
    isStockOutOpen.value = false;
    dataStore.invalidate('products');
    dataStore.invalidate('inventory');
    dataStore.invalidate('dashboard');
    loadInventory(true); // background refresh
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
