<template>
  <div class="space-y-5">
    <!-- Header with Action Buttons -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Mahsulotlar va Taomnoma</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Barcha tovarlar, taomlar, kategoriyalar va ombor qoldiqlari boshqaruvi</p>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="openCategoryModal"
          class="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 transition btn-interactive"
        >
          <FolderTree class="w-4 h-4 text-emerald-500" />
          <span>Kategoriyalar</span>
        </button>

        <button
          @click="openCreateModal"
          class="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition btn-interactive"
        >
          <Plus class="w-4 h-4" />
          <span>Yangi Mahsulot Qo'shish</span>
        </button>
      </div>
    </div>

    <!-- Search and Category Filter -->
    <div class="flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Mahsulot nomi, SKU yoki shtrix-kod bo'yicha qidiruv..."
          class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
        />
      </div>
      <div class="w-full sm:w-64">
        <AppSelect
          v-model="selectedCategoryId"
          :options="categoryFilterOptions"
          :searchable="true"
          placeholder="Barcha Kategoriyalar"
        />
      </div>
    </div>

    <!-- Products Table -->
    <SkeletonLoader v-if="loading" variant="table" :rows="8" />

    <div v-else class="glass-card rounded-2xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-semibold">
            <tr>
              <th class="py-3 px-4">Rasm & Nomi</th>
              <th class="py-3 px-4">SKU / Shtrix-kod</th>
              <th class="py-3 px-4">Kategoriya</th>
              <th class="py-3 px-4">Tannarx</th>
              <th class="py-3 px-4">Sotuv Narxi</th>
              <th class="py-3 px-4">Qoldiq</th>
              <th class="py-3 px-4 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
            <tr v-if="filteredProducts.length === 0">
              <td colspan="7" class="py-8 text-center text-slate-400 dark:text-slate-500">Mahsulotlar topilmadi</td>
            </tr>
            <tr v-for="prod in filteredProducts" :key="prod.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
              <td class="py-3 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  <img
                    v-if="prod.imageUrl"
                    :src="prod.imageUrl"
                    :alt="prod.name"
                    class="w-full h-full object-cover"
                    @error="prod.imageUrl = null"
                  />
                  <Package v-else class="w-5 h-5 text-slate-400 dark:text-slate-500" />
                </div>
                <div>
                  <span class="block text-slate-900 dark:text-slate-100 font-semibold">{{ prod.name }}</span>
                  <span v-if="prod.brand" class="text-[10px] text-slate-500 dark:text-slate-400 font-normal">{{ prod.brand }}</span>
                </div>
              </td>
              <td class="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono">
                {{ prod.sku }}
                <span v-if="prod.barcode" class="block text-[10px] text-slate-400 dark:text-slate-500">{{ prod.barcode }}</span>
              </td>
              <td class="py-3 px-4 text-slate-700 dark:text-slate-300">
                <span
                  v-if="prod.category"
                  class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium"
                  :style="{ backgroundColor: (prod.category.color || '#10b981') + '15', color: prod.category.color || '#10b981' }"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: prod.category.color || '#10b981' }"></span>
                  <span>{{ prod.category.name }}</span>
                </span>
                <span v-else class="text-slate-400">-</span>
              </td>
              <td class="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono">{{ formatCurrency(prod.purchasePrice) }}</td>
              <td class="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400 font-mono">{{ formatCurrency(prod.salePrice) }}</td>
              <td class="py-3 px-4 font-mono">
                <span
                  class="font-bold px-2 py-0.5 rounded text-[11px]"
                  :class="prod.stockQty <= 0 ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30' : prod.stockQty <= prod.minStock ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'"
                >
                  {{ prod.stockQty <= 0 ? 'Tugagan (0)' : `${prod.stockQty} ${prod.unit?.shortName || 'dona'}` }}
                </span>
              </td>
              <td class="py-3 px-4 text-right space-x-1">
                <button
                  @click="editProduct(prod)"
                  class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
                  title="Tahrirlash"
                >
                  <Edit2 class="w-3.5 h-3.5" />
                </button>
                <button
                  @click="deleteProduct(prod.id)"
                  class="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition"
                  title="O'chirish"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Product Create/Edit Modal -->
    <div v-if="isModalOpen" @click.self="isModalOpen = false" class="modal-overlay">
      <div class="modal-container max-w-lg" @click.stop>
        <div class="modal-header">
          <h3 class="text-base font-bold text-slate-900 dark:text-white">{{ editingId ? 'Mahsulotni Tahrirlash' : 'Yangi Mahsulot / Taom' }}</h3>
          <button @click="isModalOpen = false" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"><X class="w-5 h-5" /></button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="saveProduct" class="space-y-3 text-xs">
            <!-- Image URL & Fast Presets -->
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Mahsulot / Taom Rasmi (URL)</label>
              <div class="flex items-center gap-3">
                <div class="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img v-if="form.imageUrl" :src="form.imageUrl" class="w-full h-full object-cover" />
                  <ImageIcon v-else class="w-6 h-6 text-slate-400 dark:text-slate-500" />
                </div>
                <div class="flex-1 space-y-1.5">
                  <input
                    v-model="form.imageUrl"
                    placeholder="https://... rasm havolasini kiriting"
                    class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <!-- Fast Photo Presets -->
                  <div class="flex items-center gap-1.5 overflow-x-auto text-[10px] text-slate-500 dark:text-slate-400">
                    <span>Tayyor:</span>
                    <button
                      type="button"
                      v-for="preset in photoPresets"
                      :key="preset.name"
                      @click="form.imageUrl = preset.url"
                      class="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
                    >
                      {{ preset.name }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Mahsulot Nomi *</label>
              <input v-model="form.name" required class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategoriya</label>
                <AppSelect
                  v-model="form.categoryId"
                  :options="categoryFormOptions"
                  :searchable="true"
                  placeholder="Tanlang..."
                />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Shtrix-kod</label>
                <input v-model="form.barcode" placeholder="EAN-13 / Barcode" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tannarx (Kirim)</label>
                <input type="number" v-model.number="form.purchasePrice" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Sotuv Narxi *</label>
                <input type="number" required v-model.number="form.salePrice" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Min. Qoldiq ogohlantirish</label>
                <input type="number" v-model.number="form.minStock" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
              </div>
              <div v-if="!editingId">
                <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Boshlang'ich qoldiq</label>
                <input type="number" v-model.number="form.initialStock" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
              </div>
            </div>

            <button type="submit" class="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition mt-4 btn-interactive">
              Saqlash
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- Category Management Modal -->
    <div v-if="isCategoryModalOpen" @click.self="isCategoryModalOpen = false" class="modal-overlay">
      <div class="modal-container max-w-lg" @click.stop>
        <div class="modal-header">
          <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderTree class="w-5 h-5 text-emerald-500" />
            <span>Kategoriyalar Boshqaruvi</span>
          </h3>
          <button @click="isCategoryModalOpen = false" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"><X class="w-5 h-5" /></button>
        </div>

        <div class="modal-body">
          <!-- Add/Edit Category Form -->
          <form @submit.prevent="saveCategory" class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-900 dark:text-white">{{ editingCatId ? 'Kategoriyani Tahrirlash' : 'Yangi Kategoriya Qo\'shish' }}</span>
              <button v-if="editingCatId" type="button" @click="resetCategoryForm" class="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Bekor qilish</button>
            </div>

            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategoriya Nomi *</label>
              <input
                v-model="catForm.name"
                required
                placeholder="Masalan: Issiq taomlar, Ichimliklar, Shaxsiy gigiyena"
                class="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <!-- Color & Icon Picker -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Rang belgisi</label>
                <div class="flex items-center gap-2">
                  <input
                    type="color"
                    v-model="catForm.color"
                    class="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 dark:border-slate-700 p-0.5 bg-white dark:bg-slate-800"
                  />
                  <span class="font-mono text-[11px] text-slate-600 dark:text-slate-400">{{ catForm.color }}</span>
                </div>
              </div>

              <div>
                <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Ikonka (Emoji / Matn)</label>
                <input
                  v-model="catForm.icon"
                  placeholder="🍕, 🥤, 📦"
                  class="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              :disabled="savingCategory"
              class="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition btn-interactive"
            >
              {{ savingCategory ? 'Saqlanmoqda...' : (editingCatId ? 'Kategoriyani Yangilash' : 'Kategoriyani Saqlash') }}
            </button>
          </form>

          <!-- Existing Categories List -->
          <div class="space-y-2 pt-2">
            <span class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">Mavjud Kategoriyalar ({{ categories.length }} ta)</span>

            <div class="max-h-60 overflow-y-auto space-y-1.5 pr-1">
              <div
                v-for="cat in categories"
                :key="cat.id"
                class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs"
              >
                <div class="flex items-center gap-2.5">
                  <span class="w-3 h-3 rounded-full flex-shrink-0" :style="{ backgroundColor: cat.color || '#10b981' }"></span>
                  <span class="text-base" v-if="cat.icon">{{ cat.icon }}</span>
                  <span class="font-bold text-slate-900 dark:text-white">{{ cat.name }}</span>
                  <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                    {{ cat.productsCount || 0 }} ta tovar
                  </span>
                </div>

                <div class="flex items-center gap-1">
                  <button
                    @click="editCategory(cat)"
                    class="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-500/10 transition"
                    title="Tahrirlash"
                  >
                    <Edit2 class="w-3.5 h-3.5" />
                  </button>
                  <button
                    @click="deleteCategory(cat)"
                    class="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-500/10 transition"
                    title="O'chirish"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../services/api';
import { useFormat } from '../../composables/useFormat';
import { Plus, Edit2, Trash2, X, Search, Package, Image as ImageIcon, FolderTree } from 'lucide-vue-next';

import SkeletonLoader from '../../components/SkeletonLoader.vue';
import AppSelect, { SelectOption } from '../../components/AppSelect.vue';
import { useToast } from '../../composables/useToast';

import { useDataStore } from '../../stores/data.store';

const toast = useToast();
const dataStore = useDataStore();
const { formatCurrency } = useFormat();

const loading = ref(false);
const products = computed(() => dataStore.products);
const categories = computed(() => dataStore.categories);

const isModalOpen = ref(false);
const isCategoryModalOpen = ref(false);
const editingId = ref<string | null>(null);
const editingCatId = ref<string | null>(null);
const savingCategory = ref(false);

const searchQuery = ref('');
const selectedCategoryId = ref('');

const photoPresets = [
  { name: 'Osh', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200' },
  { name: 'Shashlik', url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200' },
  { name: 'Somsa', url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200' },
  { name: 'Cola', url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=200' },
  { name: 'Choy/Qahva', url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=200' },
  { name: 'Non', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200' },
];

const form = ref({
  name: '',
  sku: '',
  barcode: '',
  categoryId: '',
  imageUrl: '',
  purchasePrice: 0,
  salePrice: 0,
  minStock: 5,
  initialStock: 10,
});

const catForm = ref({
  name: '',
  color: '#10b981',
  icon: '📦',
});

const categoryFilterOptions = computed<SelectOption[]>(() => {
  const opts: SelectOption[] = [{ value: '', label: 'Barcha Kategoriyalar' }];
  categories.value.forEach((cat) => {
    opts.push({
      value: cat.id,
      label: cat.name,
      color: cat.color || '#10b981',
      badge: cat.productsCount ? `${cat.productsCount} ta` : undefined,
    });
  });
  return opts;
});

const categoryFormOptions = computed<SelectOption[]>(() => {
  return categories.value.map((cat) => ({
    value: cat.id,
    label: cat.name,
    color: cat.color || '#10b981',
  }));
});

const loadProducts = async (force = false) => {
  if (dataStore.products.length === 0) {
    loading.value = true;
  }
  try {
    await Promise.all([
      dataStore.fetchProducts(force),
      dataStore.fetchCategories(force),
    ]);
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const loadCategories = async (force = true) => {
  try {
    await dataStore.fetchCategories(force);
  } catch (err) {
    console.error(err);
  }
};

const filteredProducts = computed(() => {
  return products.value.filter((p) => {
    const matchesSearch =
      !searchQuery.value ||
      p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.barcode?.includes(searchQuery.value);

    const matchesCategory =
      !selectedCategoryId.value || p.categoryId === selectedCategoryId.value;

    return matchesSearch && matchesCategory;
  });
});

const openCreateModal = () => {
  editingId.value = null;
  form.value = {
    name: '',
    sku: '',
    barcode: '',
    categoryId: categories.value[0]?.id || '',
    imageUrl: '',
    purchasePrice: 0,
    salePrice: 0,
    minStock: 5,
    initialStock: 10,
  };
  isModalOpen.value = true;
};

const editProduct = (prod: any) => {
  editingId.value = prod.id;
  form.value = {
    name: prod.name,
    sku: prod.sku,
    barcode: prod.barcode || '',
    categoryId: prod.categoryId || '',
    imageUrl: prod.imageUrl || '',
    purchasePrice: Number(prod.purchasePrice),
    salePrice: Number(prod.salePrice),
    minStock: Number(prod.minStock),
    initialStock: 0,
  };
  isModalOpen.value = true;
};

const saveProduct = async () => {
  if (!form.value.name.trim()) {
    toast.warning('Mahsulot nomini kiriting', 'Mahsulot');
    return;
  }
  if (!form.value.salePrice || Number(form.value.salePrice) <= 0) {
    toast.warning('Sotuv narxini to\'g\'ri kiriting', 'Mahsulot');
    return;
  }

  try {
    const payload = {
      ...form.value,
      name: form.value.name.trim(),
      categoryId: form.value.categoryId || undefined,
      purchasePrice: Number(form.value.purchasePrice) || 0,
      salePrice: Number(form.value.salePrice) || 0,
      minStock: Number(form.value.minStock) || 0,
      initialStock: Number(form.value.initialStock) || 0,
    };

    if (editingId.value) {
      await api.put(`/products/${editingId.value}`, payload);
      toast.success(`"${form.value.name}" muvaffaqiyatli yangilandi`, 'Mahsulot');
    } else {
      await api.post('/products', payload);
      toast.success(`"${form.value.name}" muvaffaqiyatli qo'shildi`, 'Mahsulot');
    }
    isModalOpen.value = false;
    await loadProducts(true);
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Mahsulotni saqlashda xatolik yuz berdi', 'Xatolik');
  }
};

const deleteProduct = async (id: string) => {
  if (confirm("Mahsulotni o'chirishni tasdiqlaysizmi?")) {
    try {
      await api.delete(`/products/${id}`);
      toast.success("Mahsulot o'chirildi", 'Mahsulot');
      await loadProducts(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "O'chirishda xatolik yuz berdi", 'Xatolik');
    }
  }
};

// Category Management Functions
const openCategoryModal = () => {
  resetCategoryForm();
  isCategoryModalOpen.value = true;
};

const resetCategoryForm = () => {
  editingCatId.value = null;
  catForm.value = {
    name: '',
    color: '#10b981',
    icon: '📦',
  };
};

const editCategory = (cat: any) => {
  editingCatId.value = cat.id;
  catForm.value = {
    name: cat.name,
    color: cat.color || '#10b981',
    icon: cat.icon || '📦',
  };
};

const saveCategory = async () => {
  if (!catForm.value.name.trim()) {
    toast.warning('Kategoriya nomini kiriting', 'Kategoriya');
    return;
  }

  savingCategory.value = true;
  try {
    const payload = {
      name: catForm.value.name.trim(),
      color: catForm.value.color || '#10b981',
      icon: catForm.value.icon || '📦',
    };

    if (editingCatId.value) {
      await api.patch(`/categories/${editingCatId.value}`, payload);
      toast.success(`"${payload.name}" kategoriyasi muvaffaqiyatli yangilandi!`, 'Kategoriya');
    } else {
      await api.post('/categories', payload);
      toast.success(`"${payload.name}" kategoriyasi muvaffaqiyatli yaratildi!`, 'Kategoriya');
    }
    resetCategoryForm();
    await loadCategories(true);
    await loadProducts(true);
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Kategoriyani saqlashda xatolik', 'Xatolik');
  } finally {
    savingCategory.value = false;
  }
};

const deleteCategory = async (cat: any) => {
  if (confirm(`"${cat.name}" kategoriyasini o'chirishni tasdiqlaysizmi? (Unga tegishli tovarlar saqlanadi)`)) {
    try {
      await api.delete(`/categories/${cat.id}`);
      toast.success(`"${cat.name}" kategoriyasi o'chirildi`, 'Kategoriya');
      await loadCategories(true);
      await loadProducts(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Kategoriyani o\'chirishda xatolik', 'Xatolik');
    }
  }
};

onMounted(() => {
  loadProducts();
  loadCategories();
});
</script>
