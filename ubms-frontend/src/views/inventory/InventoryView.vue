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

    <!-- Top Stat Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <AppStatCard
        title="Ombor Qiymati (Tannarx)"
        :value="formatCurrency(totalInventoryValue)"
        subtitle="Jami ombor qoldig'i tannarxi"
        :icon="Boxes"
        variant="amber"
      />

      <AppStatCard
        title="Jami Pozitsiyalar"
        :value="`${inventory.length} ta`"
        subtitle="Ombordagi tovar turlari"
        :icon="Package"
        variant="blue"
      />

      <AppStatCard
        title="Kam Qolgan Pozitsiyalar"
        :value="`${lowStockCount} ta`"
        subtitle="Min-chegara ostidagi tovarlar"
        :icon="AlertTriangle"
        variant="rose"
      />

      <AppStatCard
        title="Tugagan Mahsulotlar"
        :value="`${outOfStockCount} ta`"
        subtitle="Nol qoldiq pozitsiyalar"
        :icon="XCircle"
        variant="slate"
      />
    </div>

    <!-- Search, Filter Tabs and View Toggle -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <div class="w-full sm:w-80">
        <AppInput
          v-model="searchQuery"
          placeholder="Mahsulot nomi yoki SKU bo'yicha qidiruv..."
          :icon="Search"
        />
      </div>

      <div class="flex items-center gap-2">
        <!-- Status Filter Tabs -->
        <div class="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
          <button
            type="button"
            @click="activeStatusFilter = 'all'"
            class="px-2.5 py-1.5 rounded-lg font-bold transition whitespace-nowrap btn-interactive"
            :class="activeStatusFilter === 'all' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
          >
            Barchasi
          </button>
          <button
            type="button"
            @click="activeStatusFilter = 'low'"
            class="px-2.5 py-1.5 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1 btn-interactive"
            :class="activeStatusFilter === 'low' ? 'bg-amber-500 text-white shadow-sm' : 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'"
          >
            <AlertTriangle class="w-3.5 h-3.5" />
            <span>Kam Qolgan</span>
          </button>
        </div>

        <!-- View Mode Toggle -->
        <AppViewToggle v-model="viewMode" />
      </div>
    </div>

    <!-- Inventory Container -->
    <SkeletonLoader v-if="loading" variant="table" :rows="8" />

    <!-- 1. Table View -->
    <div v-else-if="viewMode === 'table'" class="glass-card rounded-2xl overflow-hidden">
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
              <th class="py-3 px-4 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
            <tr v-if="filteredInventory.length === 0">
              <td colspan="7" class="py-8 text-center text-slate-400 dark:text-slate-500">Ombor ma'lumotlari topilmadi</td>
            </tr>
            <tr v-for="inv in filteredInventory" :key="inv.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
              <td class="py-3 px-4 font-bold text-slate-900 dark:text-white">{{ inv.productName || inv.product?.name }}</td>
              <td class="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono">{{ inv.sku || inv.product?.sku }}</td>
              <td class="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono">{{ formatCurrency(inv.purchasePrice || inv.product?.purchasePrice) }}</td>
              <td
                class="py-3 px-4 font-bold font-mono"
                :class="Number(inv.quantity) <= 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'"
              >
                {{ inv.quantity }} {{ inv.unit || inv.product?.unit?.shortName }}
              </td>
              <td class="py-3 px-4">
                <span
                  class="font-bold px-2 py-0.5 rounded text-[10px]"
                  :class="[
                    Number(inv.quantity) <= 0
                      ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                      : inv.isLowStock || (Number(inv.quantity) <= (inv.product?.minStock || 5))
                      ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  ]"
                >
                  {{ Number(inv.quantity) <= 0 ? 'Tugadi 🚫' : inv.isLowStock || (Number(inv.quantity) <= (inv.product?.minStock || 5)) ? 'Kam Qoldi ⚠️' : 'Yetarli ✓' }}
                </span>
              </td>
              <td
                class="py-3 px-4 font-bold font-mono"
                :class="Number(inv.quantity) <= 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'"
              >
                {{ formatCurrency((inv.quantity || 0) * Number(inv.purchasePrice || inv.product?.purchasePrice || 0)) }}
              </td>
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    v-if="canEdit('inventory')"
                    type="button"
                    @click="openEditModal(inv)"
                    class="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Tahrirlash"
                  >
                    <Edit2 class="w-4 h-4 text-blue-500" />
                  </button>
                  <button
                    v-if="canDelete('inventory')"
                    type="button"
                    @click="confirmDeleteProduct(inv)"
                    class="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                    title="O'chirish"
                  >
                    <Trash2 class="w-4 h-4 text-rose-500" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 2. Grid/Cards View -->
    <div v-else-if="viewMode === 'grid'">
      <div v-if="filteredInventory.length === 0" class="glass-card rounded-2xl p-12 text-center text-slate-400 dark:text-slate-500">
        <Boxes class="w-10 h-10 mx-auto mb-2 opacity-30" />
        <span>Ombor ma'lumotlari topilmadi</span>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div
          v-for="inv in filteredInventory"
          :key="inv.id"
          class="glass-card rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90"
        >
          <div>
            <div class="flex items-start justify-between gap-2 mb-2">
              <div>
                <h4 class="font-black text-sm text-slate-900 dark:text-white line-clamp-1">
                  {{ inv.productName || inv.product?.name }}
                </h4>
                <p class="text-[11px] font-mono text-slate-500">
                  SKU: {{ inv.sku || inv.product?.sku || '—' }}
                </p>
              </div>

              <span
                class="font-bold px-2 py-0.5 rounded text-[10px] shrink-0"
                :class="[
                  Number(inv.quantity) <= 0
                    ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                    : inv.isLowStock || (Number(inv.quantity) <= (inv.product?.minStock || 5))
                    ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                ]"
              >
                {{ Number(inv.quantity) <= 0 ? 'Tugadi 🚫' : inv.isLowStock || (Number(inv.quantity) <= (inv.product?.minStock || 5)) ? 'Kam Qoldi ⚠️' : 'Yetarli ✓' }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs">
              <div>
                <span class="text-[10px] text-slate-400 block font-semibold">Tannarx</span>
                <span class="font-bold font-mono text-slate-700 dark:text-slate-300">
                  {{ formatCurrency(inv.purchasePrice || inv.product?.purchasePrice) }}
                </span>
              </div>
              <div>
                <span class="text-[10px] text-slate-400 block font-semibold">Qoldiq</span>
                <span
                  class="font-black font-mono"
                  :class="Number(inv.quantity) <= 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'"
                >
                  {{ inv.quantity }} {{ inv.unit || inv.product?.unit?.shortName }}
                </span>
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span class="text-[10px] text-slate-400 block font-semibold">Jami Qiymat</span>
              <span
                class="text-sm font-black font-mono"
                :class="Number(inv.quantity) <= 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'"
              >
                {{ formatCurrency((inv.quantity || 0) * Number(inv.purchasePrice || inv.product?.purchasePrice || 0)) }}
              </span>
            </div>

            <div class="flex items-center gap-1">
              <button
                v-if="canEdit('inventory')"
                type="button"
                @click="openEditModal(inv)"
                class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
                title="Tahrirlash"
              >
                <Edit2 class="w-3.5 h-3.5 text-blue-500" />
              </button>
              <button
                v-if="canDelete('inventory')"
                type="button"
                @click="confirmDeleteProduct(inv)"
                class="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition"
                title="O'chirish"
              >
                <Trash2 class="w-3.5 h-3.5 text-rose-500" />
              </button>
            </div>
          </div>
        </div>
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

    <!-- Edit Item Modal -->
    <div v-if="isEditModalOpen" @click.self="isEditModalOpen = false" class="modal-overlay">
      <div class="modal-container max-w-md" @click.stop>
        <div class="modal-header">
          <h3 class="text-base font-bold text-slate-900 dark:text-white">Mahsulot va Ombor Qoldig'ini Tahrirlash</h3>
          <button @click="isEditModalOpen = false" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="saveEditProduct" class="modal-body space-y-3.5 text-xs">
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mahsulot Nomi *</label>
            <AppInput v-model="editForm.name" placeholder="Masalan: Coca-Cola 1.5L" required />
          </div>

          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">SKU / Shtrix-kod</label>
            <AppInput v-model="editForm.sku" placeholder="SKU kodi" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tannarx (so'm)</label>
              <CurrencyInput v-model="editForm.purchasePrice" placeholder="0" suffix="so'm" />
            </div>
            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Joriy Ombor Qoldig'i</label>
              <AppInput v-model.number="editForm.quantity" type="number" placeholder="0" required />
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Minimal Qoldiq Chegarasi (Kam qolish ogohlantirishi)</label>
            <AppInput v-model.number="editForm.minStock" type="number" placeholder="5" />
          </div>

          <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <AppButton variant="ghost" size="md" @click="isEditModalOpen = false" type="button">
              Bekor qilish
            </AppButton>
            <AppButton variant="primary" size="md" :loading="submitting" type="submit">
              Saqlash
            </AppButton>
          </div>
        </form>
      </div>
    </div>

    <!-- Confirm Delete Dialog -->
    <AppConfirmDialog
      :open="confirmModal.open"
      :title="confirmModal.title"
      :message="confirmModal.message"
      variant="danger"
      confirm-text="Ha, o'chirish"
      @confirm="confirmModal.onConfirm"
      @cancel="confirmModal.open = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useFormat } from '../../composables/useFormat';
import { ArrowDownLeft, ArrowUpRight, X, Search, Boxes, Package, AlertTriangle, XCircle, Edit2, Trash2 } from 'lucide-vue-next';
import SkeletonLoader from '../../components/SkeletonLoader.vue';
import AppSelect from '../../components/AppSelect.vue';
import AppInput from '../../components/AppInput.vue';
import AppButton from '../../components/AppButton.vue';
import AppStatCard from '../../components/AppStatCard.vue';
import AppViewToggle from '../../components/AppViewToggle.vue';
import CurrencyInput from '../../components/CurrencyInput.vue';
import AppConfirmDialog from '../../components/AppConfirmDialog.vue';
import { useDataStore } from '../../stores/data.store';
import { useToast } from '../../composables/useToast';
import { usePermissions } from '../../composables/usePermissions';
import api, { getErrorMessage } from '../../services/api';

const toast = useToast();
const dataStore = useDataStore();
const { formatCurrency } = useFormat();
const { canCreate, canEdit, canDelete } = usePermissions();

const viewMode = ref<'table' | 'grid'>('table');
const activeStatusFilter = ref<'all' | 'low'>('all');
const loading = ref(false);
const submitting = ref(false);
const searchQuery = ref('');
const inventory = computed(() => dataStore.inventory);
const isStockInOpen = ref(false);
const isStockOutOpen = ref(false);

// Edit & Delete State
const isEditModalOpen = ref(false);
const editingItem = ref<any>(null);
const editForm = ref({
  name: '',
  sku: '',
  purchasePrice: 0,
  quantity: 0,
  minStock: 5,
});

const confirmModal = ref<{
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => Promise<void> | void;
}>({
  open: false,
  title: 'Tasdiqlash',
  message: '',
  onConfirm: () => {},
});

const totalInventoryValue = computed(() => {
  return inventory.value.reduce((acc: number, inv: any) => {
    return acc + ((Number(inv.quantity) || 0) * Number(inv.purchasePrice || inv.product?.purchasePrice || 0));
  }, 0);
});

const lowStockCount = computed(() => {
  return inventory.value.filter((inv: any) => inv.isLowStock || (Number(inv.quantity) <= (inv.product?.minStock || 5))).length;
});

const outOfStockCount = computed(() => {
  return inventory.value.filter((inv: any) => (Number(inv.quantity) || 0) <= 0).length;
});

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
  let list = [...inventory.value];

  if (activeStatusFilter.value === 'low') {
    list = list.filter((inv: any) => inv.isLowStock || (Number(inv.quantity) <= (inv.product?.minStock || 5)));
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter((inv) => {
      const name = (inv.productName || inv.product?.name || '').toLowerCase();
      const sku = (inv.sku || inv.product?.sku || '').toLowerCase();
      return name.includes(q) || sku.includes(q);
    });
  }

  return list;
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

const openEditModal = (inv: any) => {
  editingItem.value = inv;
  editForm.value = {
    name: inv.productName || inv.product?.name || '',
    sku: inv.sku || inv.product?.sku || '',
    purchasePrice: Number(inv.purchasePrice || inv.product?.purchasePrice) || 0,
    quantity: Number(inv.quantity) || 0,
    minStock: Number(inv.product?.minStock) || 5,
  };
  isEditModalOpen.value = true;
};

const saveEditProduct = async () => {
  if (!editingItem.value) return;
  const productId = editingItem.value.productId || editingItem.value.product?.id || editingItem.value.id;
  if (!editForm.value.name.trim()) {
    toast.warning('Mahsulot nomini kiriting', 'Tahrirlash');
    return;
  }

  submitting.value = true;
  try {
    const payload = {
      name: editForm.value.name.trim(),
      sku: editForm.value.sku || undefined,
      purchasePrice: Number(editForm.value.purchasePrice) || 0,
      initialStock: Number(editForm.value.quantity) || 0,
      minStockLevel: Number(editForm.value.minStock) || 0,
    };

    if (productId) {
      await api.put(`/products/${productId}`, payload);
    }

    // Optimistic update local item
    editingItem.value.productName = editForm.value.name;
    if (editingItem.value.product) {
      editingItem.value.product.name = editForm.value.name;
      editingItem.value.product.sku = editForm.value.sku;
      editingItem.value.product.purchasePrice = editForm.value.purchasePrice;
    }
    editingItem.value.quantity = Number(editForm.value.quantity);
    editingItem.value.purchasePrice = editForm.value.purchasePrice;

    toast.success(`"${editForm.value.name}" muvaffaqiyatli saqlandi!`, 'Omborxona');
    isEditModalOpen.value = false;

    dataStore.invalidate('products');
    dataStore.invalidate('inventory');
    dataStore.invalidate('dashboard');
    await loadInventory(true);
  } catch (err: any) {
    toast.error(getErrorMessage(err, 'Mahsulotni saqlashda xatolik yuz berdi'), 'Xatolik');
  } finally {
    submitting.value = false;
  }
};

const confirmDeleteProduct = (inv: any) => {
  const name = inv.productName || inv.product?.name || 'ushbu mahsulot';
  const productId = inv.productId || inv.product?.id || inv.id;

  confirmModal.value = {
    open: true,
    title: 'Mahsulotni O\'chirish',
    message: `Rostdan ham "${name}" mahsulotini ombordan va katalogdan o'chirmoqchimisiz? Ushbu amalni ortga qaytarib bo'lmaydi.`,
    onConfirm: async () => {
      confirmModal.value.open = false;
      try {
        if (productId) {
          await api.delete(`/products/${productId}`);
        }
        toast.success(`"${name}" muvaffaqiyatli o'chirildi`, 'Omborxona');
        // Optimistic remove from local list & store
        dataStore.inventory = dataStore.inventory.filter((i: any) => (i.productId || i.product?.id || i.id) !== productId);
        dataStore.products = dataStore.products.filter((p: any) => p.id !== productId);

        dataStore.invalidate('products');
        dataStore.invalidate('inventory');
        dataStore.invalidate('dashboard');
        await loadInventory(true);
      } catch (err: any) {
        toast.error(getErrorMessage(err, 'Mahsulotni o\'chirishda xatolik yuz berdi'), 'Xatolik');
      }
    },
  };
};

onMounted(() => {
  loadInventory();
});
</script>
