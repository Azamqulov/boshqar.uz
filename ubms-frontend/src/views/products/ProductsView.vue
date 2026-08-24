<template>
  <div class="space-y-5">
    <!-- Header with Action Buttons -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Mahsulotlar va Taomnoma</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Barcha tovarlar, tayyorlanadigan taomlar, kategoriyalar va qoldiqlar boshqaruvi</p>
      </div>

      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
        <button
          v-if="isFeatureVisible('ai_import')"
          type="button"
          @click="handleAiImportClick"
          class="flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 transition btn-interactive w-full sm:w-auto"
        >
          <Sparkles class="w-4 h-4 text-emerald-500" />
          <span>AI Aqlli Kiritish</span>
          <span
            v-if="isFeatureEnabled('ai_import')"
            class="px-1.5 py-0.2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase"
          >
            AI
          </span>
          <div
            v-else
            class="p-1 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0"
            title="Obunada qulflangan"
          >
            <Lock class="w-3 h-3" />
          </div>
        </button>

        <button
          v-if="isFeatureVisible('export_reports')"
          type="button"
          @click="openExcelImportModal"
          class="flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 transition btn-interactive w-full sm:w-auto"
        >
          <FileSpreadsheet class="w-4 h-4 text-emerald-500" />
          <span>Excel / 1C Import</span>
          <div
            v-if="isFeatureDisabled('export_reports') || authStore.isDemo"
            class="p-1 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0"
            title="Obunada qulflangan"
          >
            <Lock class="w-3 h-3" />
          </div>
        </button>

        <router-link
          to="/categories"
          class="flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 transition btn-interactive w-full sm:w-auto"
        >
          <FolderTree class="w-4 h-4 text-emerald-500" />
          <span>Kategoriyalar ({{ categories.length }})</span>
        </router-link>

        <button
          v-if="canCreate('products')"
          @click="openCreateModal"
          class="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition btn-interactive w-full sm:w-auto"
        >
          <Plus class="w-4 h-4" />
          <span>Yangi Mahsulot Qo'shish</span>
        </button>
      </div>
    </div>

    <!-- Top Stat Cards Grid -->
    <ProductStatsCards
      :products-count="products.length"
      :active-products-count="products.filter((p: any) => p.status !== 'inactive' && p.isActive !== false).length"
      :low-stock-count="lowStockCount"
      :out-of-stock-count="outOfStockCount"
    />

    <!-- Search, Category Filter and View Toggle (ProductFilterBar Component) -->
    <ProductFilterBar
      v-model:search-query="searchQuery"
      v-model:selected-category-id="selectedCategoryId"
      :category-filter-options="categoryFilterOptions"
      v-model:view-mode="viewMode"
    />

    <!-- Products Container -->
    <SkeletonLoader v-if="loading" variant="table" :rows="8" />

    <!-- Empty State when filter yields 0 items -->
    <AppEmptyState
      v-else-if="filteredProducts.length === 0"
      :title="searchQuery || selectedCategoryId ? 'Mahsulotlar topilmadi' : 'Mahsulotlar yo\'q'"
      :description="searchQuery || selectedCategoryId ? 'Qidiruv yoki tanlangan kategoriya bo\'yicha hech narsa topilmadi. Qidiruvni tozalang.' : 'Hozircha hech qanday mahsulot kiritilmagan. Birinchi mahsulotingizni qo\'shib boshlang.'"
      :button-text="searchQuery || selectedCategoryId ? '' : 'Yangi Mahsulot Qo\'shish'"
      :variant="searchQuery || selectedCategoryId ? 'search' : 'products'"
      @action="openCreateModal"
    >
      <template v-if="searchQuery || selectedCategoryId" #action>
        <button
          type="button"
          @click="resetFilters"
          class="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition btn-interactive cursor-pointer"
        >
          Filtrlarni tozalash
        </button>
      </template>
    </AppEmptyState>

    <!-- 1. Table View -->
    <ProductTableView
      v-else-if="viewMode === 'table'"
      :products="paginatedProducts"
      @toggle-availability="toggleAvailability"
      @edit="editProduct"
      @delete="deleteProduct"
    />

    <!-- 2. Grid/Cards View -->
    <ProductGridView
      v-else-if="viewMode === 'grid'"
      :products="paginatedProducts"
      @edit="editProduct"
      @delete="deleteProduct"
    />

    <!-- Pagination -->
    <AppPagination
      v-if="!loading && filteredProducts.length > 0"
      v-model:current-page="pagination.currentPage.value"
      v-model:page-size="pagination.pageSize.value"
      :total-items="filteredProducts.length"
      item-name="tovar"
    />

    <!-- Product Create/Edit Modal -->
    <ProductFormModal
      :is-open="isModalOpen"
      :editing-id="editingId"
      :form="form"
      :category-options="categoryOptions"
      :unit-options="units"
      :fast-image-presets="fastImagePresets"
      :loading="isSavingProduct"
      @close="isModalOpen = false"
      @save="saveProduct"
    />

    <!-- Confirm Dialog Component -->
    <AppConfirmDialog
      :open="isDeleteModalOpen"
      title="Mahsulotni o'chirish"
      :message="productToDelete ? `&quot;${productToDelete.name}&quot; mahsulotini o'chirishni tasdiqlaysizmi?` : ''"
      variant="danger"
      confirm-text="Ha, o'chirish"
      cancel-text="Bekor qilish"
      :loading="isDeleting"
      @confirm="executeDeleteProduct"
      @cancel="isDeleteModalOpen = false"
    />

    <!-- PRO Upgrade Modal for Demo Limit & Excel Import -->
    <ProUpgradeModal
      :is-open="showProModal"
      :title="proModalTitle"
      :subtitle="proModalSubtitle"
      :feature-title="proModalFeature"
      @close="showProModal = false"
    />

    <!-- Excel & 1C Batch Import Modal -->
    <ExcelImportModal
      :is-open="isExcelImportOpen"
      @close="isExcelImportOpen = false"
      @imported="dataStore.fetchProducts(true)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import api, { getErrorMessage } from '../../services/api';
import { Plus, FolderTree, FileSpreadsheet, Sparkles, Lock } from 'lucide-vue-next';

import SkeletonLoader from '../../components/SkeletonLoader.vue';
import { SelectOption } from '../../components/AppSelect.vue';
import AppConfirmDialog from '../../components/AppConfirmDialog.vue';
import AppPagination from '../../components/AppPagination.vue';
import ProUpgradeModal from '../../components/ProUpgradeModal.vue';
import ExcelImportModal from './components/ExcelImportModal.vue';
import { useToast } from '../../composables/useToast';
import { useDataStore } from '../../stores/data.store';
import { useAuthStore } from '../../stores/auth.store';
import { getCategoryIcon } from '../../composables/useCategoryIcon';
import { usePersistentViewMode } from '../../composables/usePersistentViewMode';
import { usePermissions } from '../../composables/usePermissions';
import { usePagination } from '../../composables/usePagination';
import { usePlanFeatures } from '../../composables/usePlanFeatures';

import AppEmptyState from '../../components/AppEmptyState.vue';
import ProductStatsCards from './components/ProductStatsCards.vue';
import ProductFilterBar from './components/ProductFilterBar.vue';
import ProductTableView from './components/ProductTableView.vue';
import ProductGridView from './components/ProductGridView.vue';
import ProductFormModal from './components/ProductFormModal.vue';

const router = useRouter();
const toast = useToast();
const dataStore = useDataStore();
const authStore = useAuthStore();
const { canCreate } = usePermissions();
const { isFeatureEnabled, isFeatureDisabled, isFeatureVisible } = usePlanFeatures();

const showProModal = ref(false);
const proModalTitle = ref('');
const proModalSubtitle = ref('');
const proModalFeature = ref('');
const isExcelImportOpen = ref(false);

const handleAiImportClick = () => {
  if (isFeatureDisabled('ai_import') && isFeatureDisabled('ai_assistant')) {
    proModalTitle.value = "AI Aqlli Kiritish Tizimi Cheklangan!";
    proModalSubtitle.value = "AI yordamida mahsulotlarni tez va oson kiritish moduli sizning korxona tarifingizda faollashtirilmagan. Tarifni PRO/AI darajasiga oshiring yoki tizim administratoridan ushbu imkoniyatni yoqishni so'rang.";
    proModalFeature.value = "AI Aqlli Kiritish Moduli";
    showProModal.value = true;
    return;
  }

  if (authStore.isSubscriptionExpired) {
    proModalTitle.value = "Obuna Muddati Tugagan!";
    proModalSubtitle.value = "AI imkoniyatlaridan foydalanish uchun korxona obuna muddatini uzaytiring.";
    proModalFeature.value = "AI Moduli";
    showProModal.value = true;
    return;
  }

  router.push('/products/ai-import');
};

const openExcelImportModal = () => {
  if (isFeatureDisabled('export_reports')) {
    proModalTitle.value = "Excel & 1C Import Tarifingizda O'chirilgan!";
    proModalSubtitle.value = "Ushbu xizmatdan foydalanish uchun «Excel / PDF Hisobotlar va Import» xizmatini yoqing yoki tarifni yangilang.";
    proModalFeature.value = "Excel & 1C Sinxronizatsiya";
    showProModal.value = true;
    return;
  }

  if (authStore.isDemo || authStore.isSubscriptionExpired) {
    proModalTitle.value = "Excel & 1C Import Faqat PRO Tarifda!";
    proModalSubtitle.value = "Minglab tovarlarni 1 ta tugma bilan Excel orqali tizimga yuklang va 1C bazangiz bilan sinxronlang.";
    proModalFeature.value = "1C & Excel Sinxronizatsiya";
    showProModal.value = true;
    return;
  }

  isExcelImportOpen.value = true;
};

const viewMode = usePersistentViewMode('products', 'table');
const loading = ref(dataStore.products.length === 0);
const products = computed(() => dataStore.products);
const categories = computed(() => dataStore.categories);

const getStockQty = (p: any) => {
  if (p.stockQty !== undefined && p.stockQty !== null) return Number(p.stockQty);
  if (p.stock !== undefined && p.stock !== null) return Number(p.stock);
  if (p.quantity !== undefined && p.quantity !== null) return Number(p.quantity);
  if (p.availableQty !== undefined && p.availableQty !== null) return Number(p.availableQty);
  return 0;
};

const isSpecialItem = (p: any) => {
  return p.brand === 'dish' || p.brand === 'service' || p.unit?.shortName === 'por';
};

const lowStockCount = computed(() => {
  return products.value.filter((p: any) => {
    if (isSpecialItem(p)) return false;
    const qty = getStockQty(p);
    const min = Number(p.minStock ?? 5);
    return qty > 0 && qty <= min;
  }).length;
});

const outOfStockCount = computed(() => {
  return products.value.filter((p: any) => {
    if (isSpecialItem(p)) return false;
    const qty = getStockQty(p);
    return qty <= 0;
  }).length;
});

const isModalOpen = ref(false);
const editingId = ref<string | null>(null);

// Biznes turiga qarab tayyor rasm shablonlari
const restaurantImagePresets = [
  { name: 'Pitsa', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300' },
  { name: 'Burger', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300' },
  { name: 'Lavash', url: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=300' },
  { name: 'Shashlik', url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300' },
  { name: 'Somsa', url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300' },
  { name: 'Ichimlik', url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300' },
  { name: 'Qahva', url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=300' },
  { name: 'Non', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300' },
];

const shopImagePresets = [
  { name: 'Kiyim', url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300' },
  { name: 'Elektronika', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300' },
  { name: 'Oziq-ovqat', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300' },
  { name: 'Kosmetika', url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=300' },
  { name: 'Tovar', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300' },
  { name: 'Qurilish', url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=300' },
  { name: 'Sport', url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300' },
  { name: 'Kitob', url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=300' },
];

const pharmacyImagePresets = [
  { name: 'Dori', url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300' },
  { name: 'Vitamin', url: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=300' },
  { name: 'Shpris', url: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=300' },
  { name: 'Bandaj', url: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=300' },
  { name: 'Malham', url: 'https://images.unsplash.com/photo-1616671276441-2f2c277b8bf6?w=300' },
  { name: 'Toniometer', url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300' },
  { name: 'Mask', url: 'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=300' },
  { name: 'Quti', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300' },
];

const barbershopImagePresets = [
  { name: 'Soch', url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=300' },
  { name: 'Soqol', url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=300' },
  { name: 'Shampun', url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=300' },
  { name: 'Moshinka', url: 'https://images.unsplash.com/photo-1626808642875-0aa545482dfb?w=300' },
  { name: 'Makiyaj', url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=300' },
  { name: 'Tirnoq', url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=300' },
  { name: 'Krem', url: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300' },
  { name: 'Xizmat', url: 'https://images.unsplash.com/photo-1560066984-138daaa70c8f?w=300' },
];

const serviceImagePresets = [
  { name: 'Ta\'mirlash', url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=300' },
  { name: 'Kompyuter', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300' },
  { name: 'Telefon', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300' },
  { name: 'Avto', url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=300' },
  { name: 'Kir yuvish', url: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=300' },
  { name: 'Tozalash', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300' },
  { name: 'Yetkazib berish', url: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=300' },
  { name: 'Xizmat', url: 'https://images.unsplash.com/photo-1560066984-138daaa70c8f?w=300' },
];

const fastImagePresets = computed(() => {
  const bType = authStore.businessType;
  if (bType === 'restaurant' || bType === 'cafe') return restaurantImagePresets;
  if (bType === 'pharmacy') return pharmacyImagePresets;
  if (bType === 'barbershop') return barbershopImagePresets;
  if (bType === 'service') return serviceImagePresets;
  return shopImagePresets;
});

const isDeleteModalOpen = ref(false);
const productToDelete = ref<any>(null);
const isDeleting = ref(false);

const searchQuery = ref('');
const selectedCategoryId = ref('');
const units = ref<any[]>([]);

const form = ref({
  name: '',
  sku: '',
  barcode: '',
  categoryId: '',
  unitId: '',
  imageUrl: '',
  productType: 'goods' as 'goods' | 'dish' | 'service',
  purchasePrice: 0,
  salePrice: 0,
  minStock: 5,
  initialStock: 10,
});

const categoryFilterOptions = computed<SelectOption[]>(() => {
  const opts: SelectOption[] = [{ value: '', label: 'Barcha Kategoriyalar' }];
  categories.value.forEach((cat) => {
    opts.push({
      value: cat.id,
      label: `${getCategoryIcon(cat.icon)} ${cat.name}`,
      color: cat.color || '#10b981',
      badge: cat.productsCount !== undefined ? `${cat.productsCount} ta` : undefined,
    });
  });
  return opts;
});

const categoryOptions = computed<SelectOption[]>(() => {
  return categories.value.map((cat) => ({
    value: cat.id,
    label: `${getCategoryIcon(cat.icon)} ${cat.name}`,
    color: cat.color || '#10b981',
  }));
});

const loadUnits = async () => {
  try {
    const { data } = await api.get('/units');
    units.value = Array.isArray(data) ? data : [];
  } catch (e) {
    console.warn('Load units error:', e);
  }
};

const loadProducts = async (force = false) => {
  if (dataStore.products.length === 0) {
    loading.value = true;
  }
  try {
    await Promise.all([
      dataStore.fetchProducts(force),
      dataStore.fetchCategories(force),
      loadUnits(),
    ]);
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const filteredProducts = computed(() => {
  const query = searchQuery.value?.trim().toLowerCase() || '';
  const catId = selectedCategoryId.value;

  return products.value.filter((p: any) => {
    if (!p) return false;

    const name = (p.name || '').toLowerCase();
    const sku = (p.sku || '').toLowerCase();
    const barcode = (p.barcode || '').toLowerCase();
    const categoryName = (typeof p.category === 'object' ? p.category?.name : p.category || '').toLowerCase();

    const matchesSearch =
      !query ||
      name.includes(query) ||
      sku.includes(query) ||
      barcode.includes(query) ||
      categoryName.includes(query);

    const productCatId = p.categoryId || p.category?.id || (typeof p.category === 'string' ? p.category : '');
    const matchesCategory = !catId || productCatId === catId;

    return matchesSearch && matchesCategory;
  });
});

const pagination = usePagination(filteredProducts);

// Guaranteed fresh reactive array for table and grid views
const paginatedProducts = computed(() => {
  const items = filteredProducts.value || [];
  const size = Number(pagination.pageSize.value) || 20;
  const page = Number(pagination.currentPage.value) || 1;
  const start = (page - 1) * size;
  return items.slice(start, start + size);
});

const resetFilters = () => {
  searchQuery.value = '';
  selectedCategoryId.value = '';
};

watch([searchQuery, selectedCategoryId], () => {
  pagination.resetPage();
});

const openCreateModal = () => {
  if (authStore.isDemo && products.value.length >= 15) {
    proModalTitle.value = "Demoda Mahsulotlar Limiti (15 ta) To'lgan!";
    proModalSubtitle.value = "Jonli demo hisobda maksimal 15 ta tovar sinash uchun berilgan. Cheksiz tovarlar va ko'p omborli tarmoq uchun 14 kunlik bepul sinovni boshlang.";
    proModalFeature.value = "Cheksiz Mahsulotlar & Sklad";
    showProModal.value = true;
    return;
  }

  editingId.value = null;
  form.value = {
    name: '',
    sku: '',
    barcode: '',
    categoryId: categories.value[0]?.id || '',
    unitId: units.value[0]?.id || '00000000-0000-0000-0000-000000000020',
    imageUrl: '',
    productType: 'goods',
    purchasePrice: 0,
    salePrice: 0,
    minStock: 5,
    initialStock: 10,
  };
  isModalOpen.value = true;
};

const editProduct = (prod: any) => {
  editingId.value = prod.id;
  const isDish = prod.brand === 'dish' || prod.unit?.shortName === 'por';
  const isService = prod.brand === 'service';
  
  form.value = {
    name: prod.name,
    sku: prod.sku,
    barcode: prod.barcode || '',
    categoryId: prod.categoryId || '',
    unitId: prod.unitId || prod.unit?.id || units.value[0]?.id || '00000000-0000-0000-0000-000000000020',
    imageUrl: prod.imageUrl || '',
    productType: isDish ? 'dish' : isService ? 'service' : 'goods',
    purchasePrice: Number(prod.purchasePrice) || 0,
    salePrice: Number(prod.salePrice) || 0,
    minStock: Number(prod.minStock) || 0,
    initialStock: prod.stockQty !== undefined ? Number(prod.stockQty) : (prod.availableQty !== undefined ? Number(prod.availableQty) : 0),
  };
  isModalOpen.value = true;
};

const isSavingProduct = ref(false);

const saveProduct = async () => {
  if (isSavingProduct.value) return;
  if (!form.value.name.trim()) {
    toast.warning('Mahsulot nomini kiriting', 'Mahsulot');
    return;
  }
  if (!form.value.salePrice || Number(form.value.salePrice) <= 0) {
    toast.warning('Sotuv narxini to\'g\'ri kiriting', 'Mahsulot');
    return;
  }

  isSavingProduct.value = true;
  try {
    const payload = {
      name: form.value.name.trim(),
      sku: form.value.sku || undefined,
      barcode: form.value.barcode || undefined,
      categoryId: form.value.categoryId || undefined,
      unitId: form.value.unitId || undefined,
      imageUrl: form.value.imageUrl || undefined,
      brand: form.value.productType,
      productType: form.value.productType,
      purchasePrice: Number(form.value.purchasePrice) || 0,
      salePrice: Number(form.value.salePrice) || 0,
      minStockLevel: form.value.productType === 'goods' ? Number(form.value.minStock) || 0 : 0,
      initialStock: form.value.productType === 'goods' ? Number(form.value.initialStock) || 0 : 0,
    };

    if (editingId.value) {
      const { data: updated } = await api.put(`/products/${editingId.value}`, payload);
      const idx = dataStore.products.findIndex((p: any) => p.id === editingId.value);
      if (idx !== -1 && updated) {
        dataStore.products[idx] = { ...dataStore.products[idx], ...updated };
      }
      toast.success(`"${form.value.name}" muvaffaqiyatli yangilandi`, 'Mahsulot');
    } else {
      const { data: created } = await api.post('/products', payload);
      if (created) {
        dataStore.products.unshift(created);
      }
      toast.success(`"${form.value.name}" muvaffaqiyatli qo'shildi`, 'Mahsulot');
    }

    isModalOpen.value = false;
    dataStore.invalidate('products');
    dataStore.invalidate('dashboard');
    dataStore.invalidate('inventory');
    dataStore.fetchProducts(true).catch(console.error);
  } catch (err: any) {
    toast.error(getErrorMessage(err, 'Mahsulotni saqlashda xatolik yuz berdi'), 'Xatolik');
  } finally {
    isSavingProduct.value = false;
  }
};

const deleteProduct = (prodIdOrProd: any) => {
  const id = typeof prodIdOrProd === 'string' ? prodIdOrProd : prodIdOrProd.id;
  const prod = products.value.find((p: any) => p.id === id);
  productToDelete.value = prod || { id, name: 'Mahsulot' };
  isDeleteModalOpen.value = true;
};

const executeDeleteProduct = async () => {
  if (!productToDelete.value?.id) return;
  const id = productToDelete.value.id;
  const name = productToDelete.value.name || 'Mahsulot';

  if (productToDelete.value?.isDemo || id.startsWith('p-')) {
    toast.warning("Demo rejimida asosiy demo mahsulotlarni o'chirib bo'lmaydi. Savdo, kassa, chek urish va hisobotlarni bemalol sinab ko'ring!", "Demo Rejim");
    isDeleteModalOpen.value = false;
    productToDelete.value = null;
    return;
  }

  isDeleting.value = true;
  try {
    dataStore.products = dataStore.products.filter((p: any) => p.id !== id);
    isDeleteModalOpen.value = false;
    productToDelete.value = null;

    await api.delete(`/products/${id}`);
    
    toast.success(`"${name}" muvaffaqiyatli o'chirildi`, 'Mahsulot');
    dataStore.invalidate('products');
    dataStore.invalidate('dashboard');
    dataStore.invalidate('inventory');
    dataStore.fetchProducts(true).catch(console.error);
  } catch (err: any) {
    console.error('Delete product error:', err);
    toast.error(getErrorMessage(err, "Mahsulotni o'chirishda xatolik yuz berdi"), 'Xatolik');
    dataStore.fetchProducts(true);
  } finally {
    isDeleting.value = false;
  }
};

const toggleAvailability = async (prod: any) => {
  try {
    const nextStatus = prod.status === 'active' ? 'inactive' : 'active';
    await api.patch(`/products/${prod.id}/toggle-availability`, { status: nextStatus });
    prod.status = nextStatus;
    toast.success(
      `"${prod.name}" ${nextStatus === 'active' ? 'sotuvga chiqarildi (Mavjud)' : 'stop-listga olindi (Tugagan)'}!`,
      'Status'
    );
    dataStore.invalidate('products');
  } catch (err: any) {
    toast.error(getErrorMessage(err, 'Statusni o\'zgartirishda xatolik'), 'Xatolik');
  }
};

onMounted(() => {
  loadProducts();
});
</script>
