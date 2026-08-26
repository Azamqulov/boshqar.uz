<template>
  <div class="space-y-6">
    <!-- Header with Breadcrumbs & Action Controls -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
          <router-link to="/products" class="hover:text-emerald-500 transition flex items-center gap-1 font-medium">
            <Package class="w-3.5 h-3.5" />
            <span>Mahsulotlar</span>
          </router-link>
          <span>/</span>
          <span class="text-slate-800 dark:text-slate-200 font-semibold">Kategoriyalar</span>
        </div>
        <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 shadow-sm">
            <FolderTree class="w-5 h-5" />
          </div>
          <span>Kategoriyalar Boshqaruvi</span>
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Mahsulotlarni toifalar bo'yicha guruhlash, saralash va qulay boshqarish
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2">
        <router-link
          to="/products"
          class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition btn-interactive"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>Mahsulotlarga qaytish</span>
        </router-link>

        <AppButton
          variant="primary"
          size="md"
          :icon="Plus"
          @click="openCreateForm"
        >
          Yangi Kategoriya Qo'shish
        </AppButton>
      </div>
    </div>

    <!-- Quick Stats Cards Component -->
    <CategoryStatsCards
      :total-count="categories.length"
      :active-count="activeCategoriesCount"
      :associated-products-count="totalAssociatedProducts"
    />

    <!-- Search, Filters & View Mode Toggles -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <!-- Search Input -->
      <div class="w-full sm:w-80">
        <AppInput
          v-model="searchQuery"
          placeholder="Kategoriya nomi bo'yicha qidiruv..."
          :icon="Search"
        />
      </div>

      <!-- Filter Tabs & View Mode Switcher -->
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
          <button
            type="button"
            @click="activeFilter = 'all'"
            class="px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap btn-interactive"
            :class="activeFilter === 'all' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
          >
            Barchasi ({{ categories.length }})
          </button>
          <button
            type="button"
            @click="activeFilter = 'with_products'"
            class="px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap btn-interactive"
            :class="activeFilter === 'with_products' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
          >
            Mahsulotli ({{ activeCategoriesCount }})
          </button>
          <button
            type="button"
            @click="activeFilter = 'empty'"
            class="px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap btn-interactive"
            :class="activeFilter === 'empty' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
          >
            Bo'sh ({{ emptyCategoriesCount }})
          </button>
        </div>

        <AppViewToggle v-model="viewMode" />
      </div>
    </div>

    <!-- Loading State -->
    <SkeletonLoader v-if="loading" variant="table" :rows="6" />

    <!-- Empty State -->
    <AppEmptyState
      v-else-if="filteredCategories.length === 0"
      :title="searchQuery ? 'Kategoriyalar topilmadi' : 'Kategoriyalar yo\'q'"
      :description="searchQuery ? 'Qidiruv bo\'yicha hech qanday kategoriya topilmadi. Qidiruvni tozalang.' : 'Hali hech qanday kategoriya yaratilmagan. Birinchi kategoriyangizni qo\'shib boshlang.'"
      :button-text="searchQuery ? '' : 'Kategoriya qo\'shish'"
      :variant="searchQuery ? 'search' : 'products'"
      @action="openCreateForm"
    >
      <template v-if="searchQuery" #action>
        <button
          type="button"
          @click="searchQuery = ''"
          class="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition btn-interactive cursor-pointer"
        >
          Qidiruvni tozalash
        </button>
      </template>
    </AppEmptyState>

    <!-- 1. Table View Component -->
    <CategoryTableView
      v-else-if="viewMode === 'table'"
      :categories="pagination.paginatedItems.value"
      :get-product-count="getProductCount"
      @edit="editCategory"
      @delete="confirmDeleteCategory"
    />

    <!-- 2. Grid / Cards View Component -->
    <CategoryGridView
      v-else-if="viewMode === 'grid'"
      :categories="pagination.paginatedItems.value"
      :get-product-count="getProductCount"
      @edit="editCategory"
      @delete="confirmDeleteCategory"
    />

    <!-- Pagination -->
    <AppPagination
      v-if="!loading"
      v-model:current-page="pagination.currentPage.value"
      v-model:page-size="pagination.pageSize.value"
      :total-items="filteredCategories.length"
      item-name="kategoriya"
    />

    <!-- Create / Edit Category Modal Component -->
    <CategoryFormModal
      :is-open="isFormOpen"
      :editing-cat-id="editingCatId"
      :cat-form="catForm"
      :saving="saving"
      :available-category-icons="availableCategoryIcons"
      :fast-category-presets="fastCategoryPresets"
      :quick-colors="quickColors"
      @close="closeForm"
      @save="saveCategory"
      @apply-preset="applyPreset"
    />

    <!-- Delete Confirmation Modal -->
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
import { ref, computed, onMounted, watch } from 'vue';
import api, { getErrorMessage } from '../../services/api';
import { useAuthStore } from '../../stores/auth.store';
import { useDataStore } from '../../stores/data.store';
import { useToast } from '../../composables/useToast';
import AppInput from '../../components/AppInput.vue';
import AppButton from '../../components/AppButton.vue';
import AppViewToggle from '../../components/AppViewToggle.vue';
import AppConfirmDialog from '../../components/AppConfirmDialog.vue';
import AppPagination from '../../components/AppPagination.vue';
import SkeletonLoader from '../../components/SkeletonLoader.vue';
import AppEmptyState from '../../components/AppEmptyState.vue';
import { usePagination } from '../../composables/usePagination';
import { usePersistentViewMode } from '../../composables/usePersistentViewMode';

import CategoryStatsCards from './components/CategoryStatsCards.vue';
import CategoryTableView from './components/CategoryTableView.vue';
import CategoryGridView from './components/CategoryGridView.vue';
import CategoryFormModal from './components/CategoryFormModal.vue';

import {
  FolderTree,
  Plus,
  Search,
  Package,
  Apple,
  UtensilsCrossed,
  CupSoda,
  Coffee,
  Milk,
  Cookie,
  Flame,
  ShoppingBag,
  Shirt,
  Pill,
  Sparkles,
  Scissors,
  BookOpen,
  Laptop,
  Wrench,
  ArrowLeft,
} from 'lucide-vue-next';

interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  description?: string;
  productsCount?: number;
}

const authStore = useAuthStore();
const dataStore = useDataStore();
const toast = useToast();

const loading = ref(dataStore.categories.length === 0);
const saving = ref(false);
const searchQuery = ref('');
const activeFilter = ref<'all' | 'with_products' | 'empty'>('all');
const viewMode = usePersistentViewMode('categories', 'table');
const isFormOpen = ref(false);
const editingCatId = ref<string | null>(null);

const categories = computed(() => (dataStore.categories || []) as Category[]);
const productsList = computed(() => dataStore.products || []);

const currentBusinessType = computed(() => {
  return (authStore.activeBusiness?.businessType || authStore.businessType || 'shop').toLowerCase();
});

const defaultIcon = computed(() => {
  const t = currentBusinessType.value;
  if (t === 'restaurant' || t === 'cafe') return 'UtensilsCrossed';
  if (t === 'pharmacy') return 'Pill';
  if (t === 'barbershop' || t === 'service') return 'Scissors';
  if (t === 'confectionery') return 'Cookie';
  return 'Package';
});

const catForm = ref({
  name: '',
  icon: defaultIcon.value,
  color: '#10b981',
  defaultTrackInventory: true,
});

// SVG Icons List for Category Picker
const availableCategoryIcons = [
  { name: 'Package', label: 'Tovar / Paket', component: Package },
  { name: 'Apple', label: 'Oziq-ovqat / Mevalar', component: Apple },
  { name: 'UtensilsCrossed', label: 'Taom / Restoran', component: UtensilsCrossed },
  { name: 'CupSoda', label: 'Ichimliklar / Suv', component: CupSoda },
  { name: 'Coffee', label: 'Qahva / Choy', component: Coffee },
  { name: 'Milk', label: 'Sut mahsulotlari', component: Milk },
  { name: 'Cookie', label: 'Shirinliklar / Pishiriq', component: Cookie },
  { name: 'Flame', label: 'Issiq ovqatlar', component: Flame },
  { name: 'ShoppingBag', label: 'Do\'kon / Savdo', component: ShoppingBag },
  { name: 'Shirt', label: 'Kiyim-kechak', component: Shirt },
  { name: 'Pill', label: 'Dorixona / Meditsina', component: Pill },
  { name: 'Sparkles', label: 'Parfyum / Go\'zallik', component: Sparkles },
  { name: 'Scissors', label: 'Salon / Go\'zallik', component: Scissors },
  { name: 'BookOpen', label: 'Kanselyariya / Kitob', component: BookOpen },
  { name: 'Laptop', label: 'Elektronika / Texnika', component: Laptop },
  { name: 'Wrench', label: 'Xizmatlar / Ustaxona', component: Wrench },
];

// Fast Presets with clean Lucide SVG icons and trackInventory defaults
const fastCategoryPresets = computed(() => {
  const t = currentBusinessType.value;

  if (t === 'restaurant' || t === 'cafe') {
    return [
      { name: 'Issiq Taomlar', icon: 'Flame', color: '#10b981', defaultTrackInventory: false },
      { name: 'Pitsa & Fast Food', icon: 'UtensilsCrossed', color: '#f59e0b', defaultTrackInventory: false },
      { name: 'Salatlar & Gazaklar', icon: 'Apple', color: '#14b8a6', defaultTrackInventory: false },
      { name: 'Ichimliklar & Choy', icon: 'CupSoda', color: '#06b6d4', defaultTrackInventory: true },
      { name: 'Qahva & Kofe', icon: 'Coffee', color: '#8b5cf6', defaultTrackInventory: true },
      { name: 'Desertlar', icon: 'Cookie', color: '#ec4899', defaultTrackInventory: false },
    ];
  }

  if (t === 'pharmacy') {
    return [
      { name: 'Dori-Darmonlar', icon: 'Pill', color: '#10b981', defaultTrackInventory: true },
      { name: 'Vitaminlar & BAD', icon: 'Apple', color: '#14b8a6', defaultTrackInventory: true },
      { name: 'Tibbiy vositalar', icon: 'Package', color: '#3b82f6', defaultTrackInventory: true },
      { name: 'Gigiyena & Parvarish', icon: 'Sparkles', color: '#ec4899', defaultTrackInventory: true },
      { name: 'Bolalar parvarishi', icon: 'Milk', color: '#f59e0b', defaultTrackInventory: true },
    ];
  }

  return [
    { name: 'Oziq-ovqat & Mevalar', icon: 'Apple', color: '#10b981', defaultTrackInventory: true },
    { name: 'Sut Mahsulotlari', icon: 'Milk', color: '#06b6d4', defaultTrackInventory: true },
    { name: 'Ichimliklar & Sharbatlar', icon: 'CupSoda', color: '#3b82f6', defaultTrackInventory: true },
    { name: 'Konditer & Shirinliklar', icon: 'Cookie', color: '#ec4899', defaultTrackInventory: true },
    { name: 'Uy-ro\'zg\'or & Ximya', icon: 'Sparkles', color: '#8b5cf6', defaultTrackInventory: true },
    { name: 'Kanselyariya & Boshqa', icon: 'BookOpen', color: '#f59e0b', defaultTrackInventory: true },
  ];
});

const quickColors = [
  '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444', '#64748b', '#14b8a6', '#059669'
];

const getProductCount = (catId: string) => {
  return productsList.value.filter(p => p.categoryId === catId || p.category?.id === catId).length;
};

const totalAssociatedProducts = computed(() => {
  return categories.value.reduce((acc, cat) => acc + getProductCount(cat.id), 0);
});

const activeCategoriesCount = computed(() => {
  return categories.value.filter(c => getProductCount(c.id) > 0).length;
});

const emptyCategoriesCount = computed(() => {
  return categories.value.filter(c => getProductCount(c.id) === 0).length;
});

const filteredCategories = computed(() => {
  let list = categories.value;

  if (activeFilter.value === 'with_products') {
    list = list.filter(c => getProductCount(c.id) > 0);
  } else if (activeFilter.value === 'empty') {
    list = list.filter(c => getProductCount(c.id) === 0);
  }

  if (!searchQuery.value.trim()) return list;
  const q = searchQuery.value.toLowerCase().trim();
  return list.filter(c => c.name.toLowerCase().includes(q) || (c.icon && c.icon.includes(q)));
});

const pagination = usePagination(filteredCategories);

watch([searchQuery, activeFilter], () => {
  pagination.resetPage();
});

const loadData = async (force = false) => {
  loading.value = true;
  try {
    await Promise.allSettled([dataStore.fetchCategories(force), dataStore.fetchProducts(force)]);
  } finally {
    loading.value = false;
  }
};

const openCreateForm = () => {
  editingCatId.value = null;
  catForm.value = {
    name: '',
    icon: defaultIcon.value,
    color: '#10b981',
    defaultTrackInventory: currentBusinessType.value === 'restaurant' || currentBusinessType.value === 'cafe' ? false : true,
  };
  isFormOpen.value = true;
};

const editCategory = (cat: any) => {
  editingCatId.value = cat.id;
  catForm.value = {
    name: cat.name,
    icon: cat.icon || defaultIcon.value,
    color: cat.color || '#10b981',
    defaultTrackInventory: cat.defaultTrackInventory !== undefined ? cat.defaultTrackInventory : true,
  };
  isFormOpen.value = true;
};

const closeForm = () => {
  isFormOpen.value = false;
  editingCatId.value = null;
};

const applyPreset = (preset: any) => {
  catForm.value.name = preset.name;
  catForm.value.icon = preset.icon;
  catForm.value.color = preset.color;
  catForm.value.defaultTrackInventory = preset.defaultTrackInventory !== undefined ? preset.defaultTrackInventory : true;
};

const saveCategory = async () => {
  const name = catForm.value.name.trim();
  if (!name) {
    toast.error('Iltimos, kategoriya nomini kiriting!');
    return;
  }

  saving.value = true;
  try {
    const payload = {
      name,
      icon: catForm.value.icon || null,
      color: catForm.value.color || '#10b981',
      defaultTrackInventory: catForm.value.defaultTrackInventory !== false,
    };

    if (editingCatId.value) {
      let updatedRes: any = null;
      try {
        const { data } = await api.patch(`/categories/${editingCatId.value}`, payload);
        updatedRes = data;
      } catch {
        const { data } = await api.patch(`/products/categories/${editingCatId.value}`, payload);
        updatedRes = data;
      }
      const idx = dataStore.categories.findIndex((c: any) => c.id === editingCatId.value);
      if (idx !== -1) {
        dataStore.categories[idx] = { ...dataStore.categories[idx], ...payload, ...(updatedRes || {}) };
      }
      toast.success(`"${name}" kategoriyasi muvaffaqiyatli yangilandi!`);
    } else {
      let createdRes: any = null;
      try {
        const { data } = await api.post('/categories', payload);
        createdRes = data;
      } catch {
        const { data } = await api.post('/products/categories', payload);
        createdRes = data;
      }
      if (createdRes) {
        dataStore.categories.unshift(createdRes);
      }
      toast.success(`"${name}" kategoriyasi muvaffaqiyatli yaratildi!`);
    }

    closeForm();
    dataStore.invalidate('categories');
    dataStore.fetchCategories(true).catch(console.error);
  } catch (err: any) {
    console.error('Failed to save category:', err);
    toast.error(getErrorMessage(err, 'Kategoriyani saqlashda xatolik yuz berdi.'));
  } finally {
    saving.value = false;
  }
};

const confirmModal = ref({
  open: false,
  title: '',
  message: '',
  onConfirm: () => {},
});

const confirmDeleteCategory = (cat: Category) => {
  const count = getProductCount(cat.id);
  confirmModal.value = {
    open: true,
    title: `"${cat.name}" kategoriyasini o'chirish`,
    message: count > 0
      ? `Bu kategoriyada ${count} ta mahsulot mavjud. O'chirilsa, mahsulotlar toifasiz qoladi. O'chirishni tasdiqlaysizmi?`
      : `"${cat.name}" kategoriyasini o'chirishni tasdiqlaysizmi?`,
    onConfirm: () => deleteCategory(cat),
  };
};

const deleteCategory = async (cat: Category) => {
  confirmModal.value.open = false;
  // Immediate optimistic removal from Pinia store
  dataStore.categories = dataStore.categories.filter((c: any) => c.id !== cat.id);

  try {
    try {
      await api.delete(`/categories/${cat.id}`);
    } catch {
      await api.delete(`/products/categories/${cat.id}`);
    }
    toast.success(`"${cat.name}" kategoriyasi o'chirildi!`);
    dataStore.invalidate('categories');
    dataStore.fetchCategories(true).catch(console.error);
  } catch (err: any) {
    console.error('Failed to delete category:', err);
    toast.error(getErrorMessage(err, 'Kategoriyani o\'chirishda xatolik yuz berdi.'));
    dataStore.fetchCategories(true);
  }
};

onMounted(() => {
  loadData();
});
</script>
