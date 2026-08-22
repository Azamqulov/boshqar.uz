<template>
  <div class="space-y-6 pb-12 text-slate-800 dark:text-slate-100">
    <!-- 1. BREADCRUMB & HEADER -->
    <AiImportHeader
      :categories-count="categoriesCount"
      @open-excel="isExcelImportOpen = true"
      @open-create="openCreateProductModal"
    />

    <!-- 2. ROW 1: AI CHAT & SUMMARY/CATEGORIES -->
    <div class="grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-12 gap-5 items-stretch">
      <!-- LEFT: AI CHAT CARD (10 Cols on XL, 9 on LG) -->
      <div class="lg:col-span-8 xl:col-span-9 flex flex-col">
        <AiImportChatCard
          :chat-messages="chatMessages"
          :parsing="parsing"
          :quick-chips="quickChips"
          @reset-all="resetAll"
          @open-excel="isExcelImportOpen = true"
          @increment-qty="incrementQty"
          @decrement-qty="decrementQty"
          @send-prompt="parsePromptText"
        />
      </div>

      <!-- RIGHT: SUMMARY & CATEGORIES (3 Cols on XL, 4 on LG) -->
      <div class="lg:col-span-4 xl:col-span-3 flex flex-col justify-between gap-4 h-full">
        <AiImportSummaryCard
          :total-products="parsedItems.length"
          :total-packs="totalPacks"
          :total-quantity="totalQuantity"
          :average-margin="averageMargin"
        />

        <AiImportCategoriesCard
          :categories-list="categoriesList"
          :selected-category-filter="selectedCategoryFilter"
          @toggle-category="toggleCategory"
        />
      </div>
    </div>

    <!-- 3. ROW 2: PRODUCTS TABLE & QUICK ACTIONS -->
    <div class="grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-12 gap-5 items-start">
      <!-- LEFT: PRODUCTS TABLE & PAGINATION (9 Cols on XL, 8 on LG) -->
      <div class="lg:col-span-8 xl:col-span-9 space-y-4">
        <AiImportProductsTable
          v-model:view-mode="viewMode"
          v-model:search-query="searchQuery"
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :filtered-parsed-items="filteredParsedItems"
          :paginated-items="paginatedItems"
          :parsed-items-count="parsedItems.length"
          :selected-category-filter="selectedCategoryFilter"
          :saving="saving"
          :currency-symbol="currencySymbol"
          :category-select-options="categorySelectOptions"
          :unit-select-options="unitSelectOptions"
          :format-price="formatPrice"
          :calculate-margin="calculateMargin"
          @save-all="saveAllProducts"
          @reset-all="resetAll"
          @open-image-modal="openImageModal"
          @remove-row="removeRow"
          @increment-qty="incrementQty"
          @decrement-qty="decrementQty"
          @price-input="handlePriceInput"
        />
      </div>

      <!-- RIGHT: TEZKOR AMALLAR & AI MASLAHAT (3 Cols on XL, 4 on LG) -->
      <div class="lg:col-span-4 xl:col-span-3">
        <AiImportQuickActionsCard
          @open-excel="isExcelImportOpen = true"
          @download-report="exportToExcel"
        />
      </div>
    </div>

    <!-- Modals -->
    <ExcelImportModal
      :is-open="isExcelImportOpen"
      @close="isExcelImportOpen = false"
      @imported="handleExcelImported"
    />

    <ProductImageModal
      :is-open="isImageModalOpen"
      :product="selectedProductForImage"
      @close="isImageModalOpen = false"
      @update:image="handleImageUpdated"
    />

    <ProductFormModal
      :is-open="isCreateProductModalOpen"
      :editing-id="null"
      :form="defaultProductForm"
      :category-options="categorySelectOptions"
      :unit-options="unitSelectOptions"
      :fast-image-presets="[]"
      @close="isCreateProductModalOpen = false"
      @save="handleSaveProductFromModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import * as XLSX from 'xlsx';
import api from '@/services/api';
import { useToast } from '@/composables/useToast';
import { useDataStore } from '@/stores/data.store';
import { useAuthStore } from '@/stores/auth.store';
import { useCurrencyStore } from '@/stores/currency.store';
import type { SelectOption } from '@/components/AppSelect.vue';

// Sub-components
import AiImportHeader from './components/ai-import/AiImportHeader.vue';
import AiImportChatCard, { type ChatMessage } from './components/ai-import/AiImportChatCard.vue';
import AiImportSummaryCard from './components/ai-import/AiImportSummaryCard.vue';
import AiImportCategoriesCard from './components/ai-import/AiImportCategoriesCard.vue';
import AiImportQuickActionsCard from './components/ai-import/AiImportQuickActionsCard.vue';
import AiImportProductsTable from './components/ai-import/AiImportProductsTable.vue';
import ExcelImportModal from './components/ExcelImportModal.vue';
import ProductImageModal from './components/ProductImageModal.vue';
import ProductFormModal from './components/ProductFormModal.vue';

import type { TableProductItem } from './components/ai-import/types';
import {
  detectPackaging,
  detectVolume,
  detectQuantityPerPack,
  detectProductImage,
} from './components/ai-import/useAiProductParser';

const router = useRouter();
const toast = useToast();
const dataStore = useDataStore();
const authStore = useAuthStore();
const currencyStore = useCurrencyStore();

const activeCurrency = computed(() => {
  return ((authStore.activeBusiness as any)?.currency || (authStore.user as any)?.business?.currency || 'UZS').toUpperCase();
});

const currencySymbol = computed(() => {
  const c = activeCurrency.value;
  if (c === 'USD') return '$';
  if (c === 'RUB') return '₽';
  if (c === 'EUR') return '€';
  if (c === 'USDT') return 'USDT';
  return "so'm";
});

const isExcelImportOpen = ref(false);
const isImageModalOpen = ref(false);
const isCreateProductModalOpen = ref(false);
const viewMode = ref<'table' | 'grid'>('table');

const categoriesCount = computed(() => {
  return dataStore.categories?.length || 7;
});

const defaultProductForm = ref({
  name: '',
  categoryId: '',
  unitId: '00000000-0000-0000-0000-000000000020',
  sku: '',
  barcode: '',
  costPrice: 0,
  salePrice: 0,
  minStock: 0,
  description: '',
  imageUrl: '',
  hasVariants: false,
  variants: [],
});

const openCreateProductModal = () => {
  defaultProductForm.value = {
    name: '',
    categoryId: '',
    unitId: '00000000-0000-0000-0000-000000000020',
    sku: '',
    barcode: '',
    costPrice: 0,
    salePrice: 0,
    minStock: 0,
    description: '',
    imageUrl: '',
    hasVariants: false,
    variants: [],
  };
  isCreateProductModalOpen.value = true;
};

const handleSaveProductFromModal = async () => {
  await dataStore.fetchProducts(true);
  isCreateProductModalOpen.value = false;
  toast.success("Yangi mahsulot muvaffaqiyatli saqlandi!");
};

const selectedProductForImage = ref<TableProductItem | null>(null);
const parsing = ref(false);
const saving = ref(false);
const searchQuery = ref('');
const selectedCategoryFilter = ref('');
const currentPage = ref(1);
const pageSize = ref(10);

const openImageModal = (item: TableProductItem) => {
  selectedProductForImage.value = item;
  isImageModalOpen.value = true;
};

const handleImageUpdated = (newUrl: string) => {
  if (selectedProductForImage.value) {
    selectedProductForImage.value.imageUrl = newUrl;
    toast.success("Mahsulot rasmi yangilandi!");
  }
};

const quickChips = [
  '2 blok Kola 1.5L, har blokda 6 ta',
  '3 blok Pepsi 1L, 1 blok Fanta 1L',
  'Snickers Super 24 dona, Twix 24 dona',
  'Lavash 32 000, Gamburger 25 000',
];

onMounted(() => {
  dataStore.fetchCategories();
  currencyStore.fetchRates();
});

const toggleCategory = (name: string) => {
  if (selectedCategoryFilter.value === name) {
    selectedCategoryFilter.value = '';
  } else {
    selectedCategoryFilter.value = name;
  }
};

const STORAGE_KEY_ITEMS = 'ubms_ai_import_items_v2';
const STORAGE_KEY_CHAT = 'ubms_ai_import_chat_v2';

const loadSavedItems = (): TableProductItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ITEMS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
};

const loadSavedChat = (): ChatMessage[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CHAT);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [
    {
      id: 'welcome',
      role: 'ai',
      text: "Mahsulotlaringizni oddiy so'z bilan yozing — masalan: «2 blok Kola 1.5L, 3 blok Pepsi 1L». AI siz uchun tayyor kartalar va jadval yaratadi.",
      timestamp: new Date(),
    },
  ];
};

const parsedItems = ref<TableProductItem[]>(loadSavedItems());
const chatMessages = ref<ChatMessage[]>(loadSavedChat());

watch(
  parsedItems,
  (newItems) => {
    try {
      localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(newItems));
    } catch {}
  },
  { deep: true }
);

watch(
  chatMessages,
  (newChat) => {
    try {
      localStorage.setItem(STORAGE_KEY_CHAT, JSON.stringify(newChat));
    } catch {}
  },
  { deep: true }
);

const unitOptions = ['dona', 'kg', 'litr', 'blok', 'metr', 'quti', 'por', 'gr'];

const availableCategoryNames = computed(() => {
  const storeCats = (dataStore.categories || []).map((c: any) => c.name).filter(Boolean);
  const defaultList = ['Ichimliklar', 'Oziq-ovqat', 'Maishiy kimyo', 'Shirinliklar', 'Boshqa'];
  const currentItemCats = (parsedItems.value || []).map((i) => i.categoryName).filter(Boolean);
  return Array.from(new Set([...storeCats, ...defaultList, ...currentItemCats]));
});

const categorySelectOptions = computed<SelectOption[]>(() => {
  return availableCategoryNames.value.map((name) => ({
    value: name,
    label: name,
  }));
});

const unitSelectOptions = computed<SelectOption[]>(() => {
  return unitOptions.map((u) => ({
    value: u,
    label: u,
  }));
});

const categoriesList = computed(() => {
  const counts: Record<string, number> = {};
  availableCategoryNames.value.forEach((name) => {
    counts[name] = 0;
  });

  (parsedItems.value || []).forEach((item) => {
    const cName = item.categoryName || 'Boshqa';
    counts[cName] = (counts[cName] || 0) + 1;
  });

  return availableCategoryNames.value.map((name) => ({
    name,
    count: counts[name] || 0,
  }));
});

const filteredParsedItems = computed(() => {
  let list = parsedItems.value || [];
  if (selectedCategoryFilter.value) {
    list = list.filter((i) => (i.categoryName || 'Boshqa') === selectedCategoryFilter.value);
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(
      (i) =>
        i.name?.toLowerCase().includes(q) ||
        i.categoryName?.toLowerCase().includes(q) ||
        i.barcode?.toLowerCase().includes(q)
    );
  }
  return list;
});

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredParsedItems.value.slice(start, start + pageSize.value);
});

const totalQuantity = computed(() => {
  return (parsedItems.value || []).reduce((acc, curr) => {
    return acc + (Number(curr.initialStock) || Number(curr.quantityPerPack) || 1);
  }, 0);
});

const totalPacks = computed(() => {
  if (!parsedItems.value || parsedItems.value.length === 0) return 0;
  return parsedItems.value.filter((item) => item && (item.packaging?.toLowerCase() === 'blok' || item.unitName?.toLowerCase() === 'blok')).length;
});

const averageMargin = computed(() => {
  const items = parsedItems.value || [];
  if (items.length === 0) return 0;
  const margins = items.map(calculateMargin);
  const sum = margins.reduce((a, b) => a + b, 0);
  return Math.round(sum / items.length) || 0;
});

const calculateMargin = (item: TableProductItem | any) => {
  if (!item) return 0;
  const cost = Number(item.purchasePrice) || 0;
  const sale = Number(item.salePrice) || 0;
  if (!cost || !sale || cost >= sale) return 0;
  return Math.round(((sale - cost) / cost) * 100);
};

const formatPrice = (val: number | string | undefined | null) => {
  if (val === undefined || val === null || val === '') return '';
  const num = Number(val);
  if (isNaN(num) || num === 0) return '';

  if (activeCurrency.value === 'UZS') {
    return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  if (num % 1 !== 0) {
    const parts = num.toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return parts.join('.');
  }
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

const handlePriceInput = (event: Event, item: TableProductItem, field: 'purchasePrice' | 'salePrice') => {
  if (!item) return;
  const target = event.target as HTMLInputElement;
  const rawVal = target.value.replace(/\s/g, '');
  const num = parseFloat(rawVal);
  item[field] = isNaN(num) ? 0 : num;
};

const removeRow = (item: TableProductItem) => {
  if (!item) return;
  parsedItems.value = parsedItems.value.filter((i) => i._id !== item._id);
  toast.info("Mahsulot ro'yxatdan olib tashlandi");
};

const incrementQty = (item: TableProductItem) => {
  if (!item) return;
  item.initialStock = (item.initialStock || 1) + 1;
};

const decrementQty = (item: TableProductItem) => {
  if (!item) return;
  if ((item.initialStock || 1) > 1) {
    item.initialStock = (item.initialStock || 1) - 1;
  }
};

const resetAll = () => {
  parsedItems.value = [];
  chatMessages.value = [
    {
      id: 'welcome',
      role: 'ai',
      text: "Mahsulotlaringizni oddiy so'z bilan yozing — masalan: «2 blok Kola 1.5L, 3 blok Pepsi 1L». AI siz uchun tayyor kartalar va jadval yaratadi.",
      timestamp: new Date(),
    },
  ];
  try {
    localStorage.removeItem(STORAGE_KEY_ITEMS);
    localStorage.removeItem(STORAGE_KEY_CHAT);
  } catch {}
  toast.success("AI chat va jadval toza holatga keltirildi");
};

const handleExcelImported = () => {
  isExcelImportOpen.value = false;
};

const parsePromptText = async (prompt: string) => {
  if (!prompt || !prompt.trim()) return;

  chatMessages.value.push({
    id: `user-${Date.now()}`,
    role: 'user',
    text: prompt,
    timestamp: new Date(),
  });
  parsing.value = true;

  try {
    let createdProducts: TableProductItem[] = [];

    // Try backend API first
    try {
      const { data } = await api.post('/ai/parse-products', { prompt });
      if (data && data.products && data.products.length > 0) {
        createdProducts = data.products.map((p: any) => ({
          ...p,
          _id: p._id || `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          packaging: p.packaging || detectPackaging(p.name),
          volume: p.volume || detectVolume(p.name),
          quantityPerPack: p.quantityPerPack || detectQuantityPerPack(p.name),
          imageUrl: p.imageUrl || detectProductImage(p.name),
        }));
      }
    } catch (e) {
      console.warn('Backend AI API unavailable, fallbacking to client-side smart parser', e);
    }

    // Client-side fallback if backend didn't return products
    if (createdProducts.length === 0) {
      // Split prompt by commas or line breaks if multiple items sent
      const rawSegments = prompt.split(/,|\n|\band\b/i).map(s => s.trim()).filter(Boolean);
      
      createdProducts = rawSegments.map((segment, idx) => {
        const detectedName = segment.replace(/(\d+\s*(dona|kg|litr|blok|por|quti|metr))/gi, '').trim() || segment;
        const qtyMatch = segment.match(/(\d+)\s*(dona|kg|litr|blok|por|quti|metr)/i);
        const qty = qtyMatch ? Number(qtyMatch[1]) : detectQuantityPerPack(segment);
        const unit = qtyMatch ? qtyMatch[2].toLowerCase() : 'dona';

        let categoryName = 'Shirinliklar va Gazaklar';
        const lower = segment.toLowerCase();
        if (lower.includes('kola') || lower.includes('pepsi') || lower.includes('fanta') || lower.includes('suv') || lower.includes('sprite')) {
          categoryName = 'Ichimliklar';
        } else if (lower.includes('lavash') || lower.includes('burger') || lower.includes('somsa') || lower.includes('pizza')) {
          categoryName = 'Oziq-ovqat';
        } else if (lower.includes('ariel') || lower.includes('persil') || lower.includes('kukun') || lower.includes('tish') || lower.includes('colgate')) {
          categoryName = 'Maishiy kimyo';
        }

        return {
          _id: `item-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 7)}`,
          name: detectedName || segment,
          categoryName,
          packaging: detectPackaging(segment),
          volume: detectVolume(segment),
          quantityPerPack: qty,
          initialStock: qty,
          purchasePrice: 9500,
          salePrice: 12000,
          unitName: unit,
          imageUrl: detectProductImage(segment),
        };
      });
    }

    // Add to main table items!
    parsedItems.value = [...createdProducts, ...parsedItems.value];

    chatMessages.value.push({
      id: `ai-${Date.now()}`,
      role: 'ai',
      text: `Tushunarli! ${createdProducts.length} ta mahsulot muvaffaqiyatli aniqlandi va jadvalga joylandi.`,
      productCount: createdProducts.length,
      products: createdProducts,
      timestamp: new Date(),
    });

    toast.success(`${createdProducts.length} ta mahsulot jadvalga qo'shildi!`);
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'AI tahlilida xatolik yuz berdi');
  } finally {
    parsing.value = false;
  }
};

const exportToExcel = () => {
  if (parsedItems.value.length === 0) {
    toast.warning("Eksport qilish uchun mahsulotlar yo'q!");
    return;
  }

  const exportData = parsedItems.value.map((item, idx) => ({
    "№": idx + 1,
    "Mahsulot nomi": item.name || '',
    "Kategoriya": item.categoryName || 'Boshqa',
    "Birlik": item.unitName || 'dona',
    "Miqdor": Number(item.initialStock) || 1,
    [`Tan narxi (${currencySymbol.value})`]: Number(item.purchasePrice) || 0,
    [`Sotish narxi (${currencySymbol.value})`]: Number(item.salePrice) || 0,
    "Marja": calculateMargin(item) + '%',
    "Shtrixkod": item.barcode || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Mahsulotlar');

  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 32 },
    { wch: 20 },
    { wch: 10 },
    { wch: 10 },
    { wch: 18 },
    { wch: 18 },
    { wch: 12 },
    { wch: 18 },
  ];

  const fileName = `Mahsulotlar_Hisoboti_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
  toast.success(`${parsedItems.value.length} ta mahsulot Excel (.xlsx) fayl sifatida yuklab olindi!`);
};

const saveAllProducts = async () => {
  const validItems = parsedItems.value.filter((i) => i.name && i.name.trim().length > 1);
  if (validItems.length === 0) {
    toast.warning("Kamida bitta tovar nomini to'g'ri kiriting");
    return;
  }

  saving.value = true;
  try {
    const { data } = await api.post('/products/batch-import', {
      items: validItems.map((item) => ({
        name: item.name.trim(),
        categoryName: item.categoryName?.trim() || 'Umumiy',
        unitName: item.unitName?.trim() || 'dona',
        purchasePrice: Number(item.purchasePrice) || 0,
        salePrice: Number(item.salePrice) || 0,
        initialStock: Number(item.initialStock) || 0,
        minStock: Number(item.minStock) || 0,
        barcode: item.barcode?.trim() || undefined,
        sku: item.sku?.trim() || undefined,
      })),
    });

    toast.success(`${data.imported || validItems.length} ta mahsulot bazaga muvaffaqiyatli saqlandi!`);
    await Promise.all([dataStore.fetchProducts(true), dataStore.fetchCategories(true)]);
    router.push('/products');
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Saqlashda xatolik yuz berdi');
  } finally {
    saving.value = false;
  }
};
</script>
