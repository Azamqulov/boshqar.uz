<template>
  <div class="space-y-5">
    <!-- Header with Action Buttons -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Mahsulotlar va Taomnoma</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Barcha tovarlar, tayyorlanadigan taomlar, kategoriyalar va qoldiqlar boshqaruvi</p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <router-link
          to="/categories"
          class="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 transition btn-interactive"
        >
          <FolderTree class="w-4 h-4 text-emerald-500" />
          <span>Kategoriyalar ({{ categories.length }})</span>
        </router-link>

        <button
          v-if="canCreate('products')"
          @click="openCreateModal"
          class="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition btn-interactive"
        >
          <Plus class="w-4 h-4" />
          <span>Yangi Mahsulot Qo'shish</span>
        </button>
      </div>
    </div>

    <!-- Top Stat Cards Grid -->
    <ProductStatsCards
      :products-count="products.length"
      :active-products-count="products.filter((p: any) => p.isActive !== false).length"
      :low-stock-count="products.filter((p: any) => p.minStock && p.stock <= p.minStock).length"
      :categories-count="categories.length"
    />

    <!-- Search, Category Filter and View Toggle -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      <div class="flex-1">
        <AppInput
          v-model="searchQuery"
          placeholder="Mahsulot nomi, SKU yoki shtrix-kod bo'yicha qidiruv..."
          :icon="Search"
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
      <AppViewToggle v-model="viewMode" />
    </div>

    <!-- Products Container -->
    <SkeletonLoader v-if="loading" variant="table" :rows="8" />

    <!-- 1. Table View -->
    <ProductTableView
      v-else-if="viewMode === 'table'"
      :products="filteredProducts"
      @toggle-availability="toggleAvailability"
      @edit="editProduct"
      @delete="deleteProduct"
    />

    <!-- 2. Grid/Cards View -->
    <ProductGridView
      v-else-if="viewMode === 'grid'"
      :products="filteredProducts"
      @edit="editProduct"
      @delete="deleteProduct"
    />

    <!-- Product Create/Edit Modal -->
    <ProductFormModal
      :is-open="isModalOpen"
      :editing-id="editingId"
      :form="form"
      :category-options="categoryOptions"
      :fast-image-presets="fastImagePresets"
      @close="isModalOpen = false"
      @save="saveProduct"
    />

    <!-- Category Management Modal -->
    <CategoryManageModal
      :is-open="isCategoryModalOpen"
      :editing-cat-id="editingCatId"
      :cat-form="catForm"
      :saving-category="savingCategory"
      :categories="categories"
      :filtered-modal-categories="filteredModalCategories"
      v-model:category-search="categorySearch"
      :fast-category-presets="fastCategoryPresets"
      :quick-emojis="quickEmojis"
      :quick-colors="quickColors"
      :get-category-icon="getCategoryIcon"
      @close="isCategoryModalOpen = false"
      @apply-preset="applyPreset"
      @save-category="saveCategory"
      @reset-category-form="resetCategoryForm"
      @edit-category="editCategory"
      @delete-category="deleteCategory"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api, { getErrorMessage } from '../../services/api';
import { useFormat } from '../../composables/useFormat';
import { Plus, Search, FolderTree } from 'lucide-vue-next';

import SkeletonLoader from '../../components/SkeletonLoader.vue';
import AppSelect, { SelectOption } from '../../components/AppSelect.vue';
import AppInput from '../../components/AppInput.vue';
import AppViewToggle from '../../components/AppViewToggle.vue';
import AppConfirmDialog from '../../components/AppConfirmDialog.vue';
import { useToast } from '../../composables/useToast';
import { useDataStore } from '../../stores/data.store';
import { useAuthStore } from '../../stores/auth.store';
import { getCategoryIcon } from '../../composables/useCategoryIcon';
import { usePersistentViewMode } from '../../composables/usePersistentViewMode';
import { usePermissions } from '../../composables/usePermissions';

import ProductStatsCards from './components/ProductStatsCards.vue';
import ProductTableView from './components/ProductTableView.vue';
import ProductGridView from './components/ProductGridView.vue';
import ProductFormModal from './components/ProductFormModal.vue';
import CategoryManageModal from './components/CategoryManageModal.vue';

const toast = useToast();
const dataStore = useDataStore();
const authStore = useAuthStore();
const { formatCurrency } = useFormat();
const { canCreate } = usePermissions();

const viewMode = usePersistentViewMode('products', 'table');
const loading = ref(false);
const products = computed(() => dataStore.products);
const categories = computed(() => dataStore.categories);

const isModalOpen = ref(false);
const isCategoryModalOpen = ref(false);
const editingId = ref<string | null>(null);
const editingCatId = ref<string | null>(null);
const savingCategory = ref(false);

const imageInputMode = ref<'upload' | 'url'>('upload');
const fileInputRef = ref<HTMLInputElement | null>(null);

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const removeImage = () => {
  form.value.imageUrl = '';
  if (fileInputRef.value) fileInputRef.value.value = '';
};

const handleImageFileUpload = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    toast.warning("Iltimos, rasm faylini tanlang (JPG, PNG, WebP)!", "Fayl formati");
    return;
  }

  // Optimize and compress image using HTML5 Canvas
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxDim = 600;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        }
      } else {
        if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        form.value.imageUrl = compressedDataUrl;
        toast.success("Rasm muvaffaqiyatli yuklandi!", "Rasm");
      }
    };
    img.src = event.target?.result as string;
  };
  reader.readAsDataURL(file);
};

// Biznes turiga qarab tayyor rasm shablonlari
const restaurantImagePresets = [
  { name: 'Pitsa 🍕', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300' },
  { name: 'Burger 🍔', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300' },
  { name: 'Lavash 🌯', url: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=300' },
  { name: 'Shashlik 🍢', url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300' },
  { name: 'Somsa 🥟', url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300' },
  { name: 'Ichimlik 🥤', url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300' },
  { name: 'Qahva ☕', url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=300' },
  { name: 'Non 🍞', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300' },
];

const shopImagePresets = [
  { name: 'Kiyim 👕', url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300' },
  { name: 'Elektronika 📱', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300' },
  { name: 'Oziq-ovqat 🛒', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300' },
  { name: 'Kosmetika 💄', url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=300' },
  { name: 'Tovar 📦', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300' },
  { name: 'Qurilish 🔧', url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=300' },
  { name: 'Sport 🏋️', url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300' },
  { name: 'Kitob 📚', url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=300' },
];

const pharmacyImagePresets = [
  { name: 'Dori 💊', url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300' },
  { name: 'Vitamin 🧴', url: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=300' },
  { name: 'Shpris 💉', url: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=300' },
  { name: 'Bandaj 🩹', url: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=300' },
  { name: 'Malham 🧪', url: 'https://images.unsplash.com/photo-1616671276441-2f2c277b8bf6?w=300' },
  { name: 'Toniometer 🩺', url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300' },
  { name: 'Mask 😷', url: 'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=300' },
  { name: 'Quti 📦', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300' },
];

const barbershopImagePresets = [
  { name: 'Soch 💈', url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=300' },
  { name: 'Soqol ✂️', url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=300' },
  { name: 'Shampun 🧴', url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=300' },
  { name: 'Moshinka 🪒', url: 'https://images.unsplash.com/photo-1626808642875-0aa545482dfb?w=300' },
  { name: 'Makiyaj 💄', url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=300' },
  { name: 'Tirnoq 💅', url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=300' },
  { name: 'Krem 🧪', url: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300' },
  { name: 'Xizmat 🛠', url: 'https://images.unsplash.com/photo-1560066984-138daaa70c8f?w=300' },
];

const serviceImagePresets = [
  { name: 'Ta\'mirlash 🔧', url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=300' },
  { name: 'Kompyuter 💻', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300' },
  { name: 'Telefon 📱', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300' },
  { name: 'Avto 🚗', url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=300' },
  { name: 'Kir yuvish 🧺', url: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=300' },
  { name: 'Tozalash 🧹', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300' },
  { name: 'Yetkazib berish 📦', url: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=300' },
  { name: 'Xizmat 🛠', url: 'https://images.unsplash.com/photo-1560066984-138daaa70c8f?w=300' },
];

const fastImagePresets = computed(() => {
  const bType = authStore.businessType;
  if (bType === 'restaurant' || bType === 'cafe') return restaurantImagePresets;
  if (bType === 'pharmacy') return pharmacyImagePresets;
  if (bType === 'barbershop') return barbershopImagePresets;
  if (bType === 'service') return serviceImagePresets;
  return shopImagePresets; // shop (default)
});

const isDeleteModalOpen = ref(false);
const productToDelete = ref<any>(null);
const isDeleting = ref(false);

const searchQuery = ref('');
const selectedCategoryId = ref('');
const categorySearch = ref('');

const quickEmojis = ['🍕', '🍔', '🍲', '🥗', '🥤', '☕', '🍰', '🍞', '🥩', '🧴', '👕', '📦'];
const quickColors = ['#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444', '#64748b'];

const fastCategoryPresets = [
  { name: 'Pitsa & Fast Food', icon: '🍕', color: '#f59e0b' },
  { name: 'Milliy Taomlar', icon: '🍲', color: '#10b981' },
  { name: 'Salatlar & Gazaklar', icon: '🥗', color: '#14b8a6' },
  { name: 'Ichimliklar & Choy', icon: '🥤', color: '#06b6d4' },
  { name: 'Desertlar & Shirinliklar', icon: '🍰', color: '#ec4899' },
  { name: 'Non Mahsulotlari', icon: '🍞', color: '#d97706' },
  { name: 'Go\'sht & Yarim tayyor', icon: '🥩', color: '#ef4444' },
  { name: 'Maishiy & Tozalash', icon: '🧴', color: '#6366f1' },
  { name: 'Umumiy Tovarlar', icon: '📦', color: '#8b5cf6' },
];

const photoPresets = [
  { name: 'Osh', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200' },
  { name: 'Pitsa', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200' },
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
  productType: 'goods' as 'goods' | 'dish' | 'service',
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

const categoryFormOptions = categoryOptions;

const filteredModalCategories = computed(() => {
  if (!categorySearch.value) return categories.value;
  return categories.value.filter((c) =>
    c.name.toLowerCase().includes(categorySearch.value.toLowerCase()),
  );
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

const loadCategories = async (force = false) => {
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
  imageInputMode.value = 'upload';
  if (fileInputRef.value) fileInputRef.value.value = '';
  form.value = {
    name: '',
    sku: '',
    barcode: '',
    categoryId: categories.value[0]?.id || '',
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
  imageInputMode.value = prod.imageUrl?.startsWith('http') ? 'url' : 'upload';
  if (fileInputRef.value) fileInputRef.value.value = '';
  const isDish = prod.brand === 'dish' || prod.unit?.shortName === 'por';
  const isService = prod.brand === 'service';
  
  form.value = {
    name: prod.name,
    sku: prod.sku,
    barcode: prod.barcode || '',
    categoryId: prod.categoryId || '',
    imageUrl: prod.imageUrl || '',
    productType: isDish ? 'dish' : isService ? 'service' : 'goods',
    purchasePrice: Number(prod.purchasePrice) || 0,
    salePrice: Number(prod.salePrice) || 0,
    minStock: Number(prod.minStock) || 0,
    initialStock: prod.stockQty !== undefined ? Number(prod.stockQty) : 0,
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
      name: form.value.name.trim(),
      sku: form.value.sku || undefined,
      barcode: form.value.barcode || undefined,
      categoryId: form.value.categoryId || undefined,
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
      // Optimistic: update store immediately so table refreshes right away
      const idx = dataStore.products.findIndex((p: any) => p.id === editingId.value);
      if (idx !== -1 && updated) {
        dataStore.products[idx] = { ...dataStore.products[idx], ...updated };
      }
      toast.success(`"${form.value.name}" muvaffaqiyatli yangilandi`, 'Mahsulot');
    } else {
      const { data: created } = await api.post('/products', payload);
      // Optimistic: push new product to top of list immediately
      if (created) {
        dataStore.products.unshift(created);
      }
      toast.success(`"${form.value.name}" muvaffaqiyatli qo'shildi`, 'Mahsulot');
    }

    isModalOpen.value = false;
    // Invalidate then background-refresh for server-side accuracy
    dataStore.invalidate('products');
    dataStore.invalidate('dashboard');
    dataStore.invalidate('inventory');
    await dataStore.fetchProducts(true);
  } catch (err: any) {
    toast.error(getErrorMessage(err, 'Mahsulotni saqlashda xatolik yuz berdi'), 'Xatolik');
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

  isDeleting.value = true;
  try {
    await api.delete(`/products/${id}`);
    
    // Immediate reactive removal from Pinia store
    dataStore.products = dataStore.products.filter((p: any) => p.id !== id);
    
    toast.success(`"${name}" muvaffaqiyatli o'chirildi`, 'Mahsulot');
    dataStore.invalidate('products');
    dataStore.invalidate('dashboard');
    dataStore.invalidate('inventory');
    isDeleteModalOpen.value = false;
    productToDelete.value = null;
    await dataStore.fetchProducts(true);
  } catch (err: any) {
    console.error('Delete product error:', err);
    toast.error(getErrorMessage(err, "Mahsulotni o'chirishda xatolik yuz berdi"), 'Xatolik');
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

const applyPreset = async (preset: { name: string; icon: string; color: string }) => {
  catForm.value = {
    name: preset.name,
    icon: preset.icon,
    color: preset.color,
  };
  await saveCategory();
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

    let savedId: string | null = null;
    if (editingCatId.value) {
      const { data } = await api.patch(`/categories/${editingCatId.value}`, payload);
      savedId = data?.id || editingCatId.value;
      toast.success(`"${payload.name}" kategoriyasi muvaffaqiyatli yangilandi!`, 'Kategoriya');
    } else {
      const { data } = await api.post('/categories', payload);
      savedId = data?.id;
      toast.success(`"${payload.name}" kategoriyasi muvaffaqiyatli yaratildi!`, 'Kategoriya');
    }
    
    resetCategoryForm();
    await loadCategories(true);
    await loadProducts(true);

    // If product modal is open, auto select this category
    if (isModalOpen.value && savedId) {
      form.value.categoryId = savedId;
    }
  } catch (err: any) {
    toast.error(getErrorMessage(err, 'Kategoriyani saqlashda xatolik'), 'Xatolik');
  } finally {
    savingCategory.value = false;
  }
};

const deleteCategory = async (cat: any) => {
  if (!window.confirm(`"${cat.name}" kategoriyasini o'chirishni tasdiqlaysizmi? (Unga tegishli tovarlar saqlanadi)`)) {
    return;
  }
  try {
    await api.delete(`/categories/${cat.id}`);
    toast.success(`"${cat.name}" kategoriyasi o'chirildi`, 'Kategoriya');
    dataStore.invalidate('categories');
    await loadCategories(true);
    await loadProducts(true);
  } catch (err: any) {
    toast.error(getErrorMessage(err, 'Kategoriyani o\'chirishda xatolik'), 'Xatolik');
  }
};

onMounted(() => {
  loadProducts();
  loadCategories();
});
</script>
