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

    <!-- Quick Stats Cards (AppStatCard) -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <AppStatCard
        title="Jami Kategoriyalar"
        :value="`${categories.length} ta`"
        subtitle="Mavjud toifalar soni"
        :icon="FolderTree"
        variant="blue"
      />

      <AppStatCard
        title="Mahsulotli Kategoriyalar"
        :value="`${activeCategoriesCount} ta`"
        subtitle="Faol tovarlar biriktirilgan"
        :icon="CheckCircle2"
        variant="emerald"
      />

      <AppStatCard
        title="Biriktirilgan Mahsulotlar"
        :value="`${totalAssociatedProducts} ta`"
        subtitle="Kategoriyalardagi tovarlar"
        :icon="Package"
        variant="amber"
      />
    </div>

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

    <!-- Loading State with Rotating Sync Icon -->
    <SkeletonLoader v-if="loading" variant="table" :rows="6" />

    <!-- Empty State -->
    <div v-else-if="filteredCategories.length === 0" class="glass-card rounded-2xl p-12 text-center text-slate-400 dark:text-slate-500">
      <FolderTree class="w-12 h-12 mx-auto mb-3 opacity-30" />
      <h3 class="text-sm font-bold text-slate-700 dark:text-slate-300">Kategoriyalar Topilmadi</h3>
      <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
        Hali hech qanday kategoriya yaratilmagan yoki qidiruv mos kelmadi. Yuqoridagi tugma orqali yangi kategoriya qo'shing.
      </p>
    </div>

    <!-- 1. Table View -->
    <div v-else-if="viewMode === 'table'" class="glass-card rounded-2xl overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-semibold">
            <tr>
              <th class="py-3.5 px-4">Kategoriya Nomi</th>
              <th class="py-3.5 px-4">Rang Tusi</th>
              <th class="py-3.5 px-4">Mahsulotlar Soni</th>
              <th class="py-3.5 px-4 text-center">Holati</th>
              <th class="py-3.5 px-4 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
            <tr
              v-for="cat in filteredCategories"
              :key="cat.id"
              class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition group"
            >
              <!-- Name & Emoji -->
              <td class="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-sm border border-slate-200/80 dark:border-slate-700 overflow-hidden"
                    :style="{ backgroundColor: (cat.color || '#10b981') + '18' }"
                  >
                    <span>{{ getCategoryIcon(cat.icon) }}</span>
                  </div>
                  <div class="min-w-0">
                    <span class="block text-slate-900 dark:text-white font-bold text-sm truncate">{{ cat.name }}</span>
                    <span v-if="cat.description" class="text-[11px] text-slate-400 truncate block">{{ cat.description }}</span>
                  </div>
                </div>
              </td>

              <!-- Color Badge -->
              <td class="py-3.5 px-4">
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold font-mono"
                  :style="{ backgroundColor: (cat.color || '#10b981') + '15', color: cat.color || '#10b981' }"
                >
                  <span class="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" :style="{ backgroundColor: cat.color || '#10b981' }"></span>
                  <span>{{ cat.color || '#10b981' }}</span>
                </span>
              </td>

              <!-- Product Count -->
              <td class="py-3.5 px-4 font-mono font-bold">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs">
                  <Package class="w-3.5 h-3.5 text-slate-400" />
                  <span>{{ getProductCount(cat.id) }} ta tovar</span>
                </span>
              </td>

              <!-- Status -->
              <td class="py-3.5 px-4 text-center">
                <span
                  class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border"
                  :class="getProductCount(cat.id) > 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'"
                >
                  {{ getProductCount(cat.id) > 0 ? 'Faol (Mahsulotli)' : 'Bo\'sh' }}
                </span>
              </td>

              <!-- Actions -->
              <td class="py-3.5 px-4 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    @click="editCategory(cat)"
                    class="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Tahrirlash"
                  >
                    <Edit2 class="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    @click="confirmDeleteCategory(cat)"
                    class="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    title="O'chirish"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 2. Grid / Cards View -->
    <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div
        v-for="cat in filteredCategories"
        :key="cat.id"
        class="glass-card rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition group border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90"
      >
        <div>
          <!-- Header Bar with Color Pill & Icon -->
          <div class="flex items-start justify-between gap-2 mb-3">
            <div class="flex items-center gap-2.5">
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-sm border border-slate-200/80 dark:border-slate-700"
                :style="{ backgroundColor: (cat.color || '#10b981') + '20' }"
              >
                <span>{{ getCategoryIcon(cat.icon) }}</span>
              </div>
              <div>
                <h4 class="font-black text-sm text-slate-900 dark:text-white line-clamp-1">
                  {{ cat.name }}
                </h4>
                <span class="text-[11px] text-slate-400 block font-mono">
                  {{ getProductCount(cat.id) }} ta mahsulot
                </span>
              </div>
            </div>

            <!-- Color dot -->
            <span
              class="w-3 h-3 rounded-full shrink-0 shadow-sm mt-1"
              :style="{ backgroundColor: cat.color || '#10b981' }"
              :title="cat.color || '#10b981'"
            ></span>
          </div>

          <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs flex justify-between items-center">
            <span class="text-slate-400">Holat:</span>
            <span
              class="font-bold text-[11px]"
              :class="getProductCount(cat.id) > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'"
            >
              {{ getProductCount(cat.id) > 0 ? 'Faol mahsulotlar bor' : 'Hozircha bo\'sh' }}
            </span>
          </div>
        </div>

        <div class="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-1">
          <button
            @click="editCategory(cat)"
            class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Tahrirlash"
          >
            <Edit2 class="w-4 h-4" />
          </button>
          <button
            @click="confirmDeleteCategory(cat)"
            class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
            title="O'chirish"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Create / Edit Category Modal (Teleport to body) -->
    <Teleport to="body">
      <div v-if="isFormOpen" @click.self="closeForm" class="modal-overlay">
        <div class="modal-container max-w-lg" @click.stop>
          <div class="modal-header">
            <div class="flex items-center gap-2.5">
              <div
                class="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-sm"
                :style="{ backgroundColor: (catForm.color || '#10b981') + '20' }"
              >
                <span>{{ catForm.icon || '📦' }}</span>
              </div>
              <div>
                <h3 class="text-base font-bold text-slate-900 dark:text-white">
                  {{ editingCatId ? 'Kategoriyani Tahrirlash' : 'Yangi Kategoriya Yaratish' }}
                </h3>
                <p class="text-xs text-slate-500 dark:text-slate-400">Nomi, belgisi va rangini tanlang</p>
              </div>
            </div>
            <button @click="closeForm" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition">
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="modal-body space-y-4">
            <!-- 1-Click Fast Category Presets -->
            <div class="space-y-1.5">
              <span class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Tezkor variantlar (1 bosishda to'ldirish):
              </span>
              <div class="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                <button
                  type="button"
                  v-for="preset in fastCategoryPresets"
                  :key="preset.name"
                  @click="applyPreset(preset)"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-800 dark:text-slate-200 text-xs font-medium transition btn-interactive"
                >
                  <span>{{ preset.icon }}</span>
                  <span>{{ preset.name }}</span>
                </button>
              </div>
            </div>

            <form @submit.prevent="saveCategory" class="space-y-4 text-xs">
              <!-- Name Input -->
              <div>
                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Kategoriya Nomi *</label>
                <input
                  v-model="catForm.name"
                  required
                  placeholder="Masalan: Pitsa & Fast Food, Ichimliklar, Shirinliklar..."
                  class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium"
                />
              </div>

              <!-- Emoji & Color Chooser in 2 Columns -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <!-- Emoji Selector -->
                <div>
                  <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Ikonka (Emoji)</label>
                  <div class="flex items-center gap-2">
                    <input
                      v-model="catForm.icon"
                      placeholder="🍕"
                      class="w-11 text-center text-lg py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 shrink-0"
                    />
                    <div class="flex flex-wrap gap-1 flex-1">
                      <button
                        type="button"
                        v-for="emoji in quickEmojis"
                        :key="emoji"
                        @click="catForm.icon = emoji"
                        class="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-sm transition"
                      >
                        {{ emoji }}
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Color Palette -->
                <div>
                  <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Rang Tusi (Badge)</label>
                  <div class="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      v-for="color in quickColors"
                      :key="color"
                      @click="catForm.color = color"
                      class="w-6 h-6 rounded-full border-2 transition transform hover:scale-110"
                      :class="catForm.color === color ? 'border-slate-900 dark:border-white ring-2 ring-emerald-500/30' : 'border-transparent'"
                      :style="{ backgroundColor: color }"
                    ></button>
                    <input
                      type="color"
                      v-model="catForm.color"
                      class="w-7 h-7 rounded-full cursor-pointer border border-slate-300 dark:border-slate-700 p-0 bg-transparent"
                      title="Boshqa maxsus rang tanlash"
                    />
                  </div>
                </div>
              </div>

              <!-- Form Buttons -->
              <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <AppButton
                  type="button"
                  variant="ghost"
                  size="md"
                  @click="closeForm"
                >
                  Bekor qilish
                </AppButton>
                <AppButton
                  type="submit"
                  variant="primary"
                  size="md"
                  :loading="saving"
                >
                  {{ saving ? 'Saqlanmoqda...' : (editingCatId ? 'Kategoriyani Yangilash' : 'Kategoriyani Saqlash') }}
                </AppButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>

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
import { ref, computed, onMounted } from 'vue';
import api, { getErrorMessage } from '../../services/api';
import { useAuthStore } from '../../stores/auth.store';
import { useDataStore } from '../../stores/data.store';
import { useToast } from '../../composables/useToast';
import { getCategoryIcon } from '../../composables/useCategoryIcon';
import AppInput from '../../components/AppInput.vue';
import AppButton from '../../components/AppButton.vue';
import AppStatCard from '../../components/AppStatCard.vue';
import AppViewToggle from '../../components/AppViewToggle.vue';
import AppConfirmDialog from '../../components/AppConfirmDialog.vue';
import SkeletonLoader from '../../components/SkeletonLoader.vue';
import {
  FolderTree,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Package,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-vue-next';

import { usePersistentViewMode } from '../../composables/usePersistentViewMode';

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

const loading = ref(false);
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
  if (t === 'restaurant' || t === 'cafe') return '🍕';
  if (t === 'pharmacy') return '💊';
  if (t === 'barbershop' || t === 'service') return '✂️';
  if (t === 'confectionery') return '🎂';
  return '📦';
});

const catForm = ref({
  name: '',
  icon: defaultIcon.value,
  color: '#10b981',
});

// Fast Presets by Business Type
const fastCategoryPresets = computed(() => {
  const t = currentBusinessType.value;

  if (t === 'restaurant' || t === 'cafe') {
    return [
      { name: 'Issiq Taomlar', icon: '🍲', color: '#10b981' },
      { name: 'Pitsa & Fast Food', icon: '🍕', color: '#f59e0b' },
      { name: 'Salatlar & Gazaklar', icon: '🥗', color: '#14b8a6' },
      { name: 'Ichimliklar & Choy', icon: '🥤', color: '#06b6d4' },
      { name: 'Shashlik & Kaboblar', icon: '🍢', color: '#ef4444' },
      { name: 'Desertlar', icon: '🍰', color: '#ec4899' },
    ];
  }

  if (t === 'pharmacy') {
    return [
      { name: 'Dori-Darmonlar', icon: '💊', color: '#10b981' },
      { name: 'Vitaminlar & BAD', icon: '🌿', color: '#14b8a6' },
      { name: 'Tibbiy vositalar', icon: '🩺', color: '#3b82f6' },
      { name: 'Gigiyena & Parvarish', icon: '🧼', color: '#ec4899' },
      { name: 'Bolalar uchun', icon: '🍼', color: '#f59e0b' },
    ];
  }

  if (t === 'confectionery') {
    return [
      { name: 'Tortlar & Pirojnoe', icon: '🎂', color: '#ec4899' },
      { name: 'Shokolad & Konfetlar', icon: '🍫', color: '#8b5cf6' },
      { name: 'Non & Pishiriqlar', icon: '🥐', color: '#f59e0b' },
      { name: 'Desertlar & Muzqaymoq', icon: '🍨', color: '#06b6d4' },
    ];
  }

  // Default Retail / Shop
  return [
    { name: 'Oziq-ovqat & Mevalar', icon: '🥦', color: '#10b981' },
    { name: 'Sut & Sut Mahsulotlari', icon: '🥛', color: '#3b82f6' },
    { name: 'Ichimliklar & Sharbatlar', icon: '🥤', color: '#06b6d4' },
    { name: 'Uy-ro\'zg\'or buyumlari', icon: '🧼', color: '#8b5cf6' },
    { name: 'Konditer & Shirinliklar', icon: '🍬', color: '#ec4899' },
    { name: 'Kanselyariya & Maishiy', icon: '📦', color: '#f59e0b' },
  ];
});

const quickEmojis = computed(() => {
  const t = currentBusinessType.value;
  if (t === 'restaurant' || t === 'cafe') {
    return ['🍕', '🍲', '🥣', '☕', '🥗', '🍰', '🍔', '🍟', '🥤', '🥩', '🍢', '🍦'];
  }
  if (t === 'pharmacy') {
    return ['💊', '🩺', '🧴', '🧼', '🍼', '🌿', '🧪', '🩹'];
  }
  if (t === 'barbershop' || t === 'service') {
    return ['✂️', '🧔', '💆‍♂️', '💅', '🧖‍♂️', '💈', '🧼', '🧴'];
  }
  if (t === 'confectionery') {
    return ['🎂', '🍫', '🥐', '🍨', '🍰', '🍬', '🍩', '🍪'];
  }
  return ['🥦', '🥛', '🥤', '🧼', '🍬', '📦', '🍎', '🥩', '🍞', '🍫', '🧴', '📱'];
});

const quickColors = ['#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444', '#64748b'];

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

const loadData = async (force = false) => {
  if (categories.value.length === 0) {
    loading.value = true;
  }
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
  };
  isFormOpen.value = true;
};

const editCategory = (cat: Category) => {
  editingCatId.value = cat.id;
  catForm.value = {
    name: cat.name,
    icon: cat.icon || defaultIcon.value,
    color: cat.color || '#10b981',
  };
  isFormOpen.value = true;
};

const closeForm = () => {
  isFormOpen.value = false;
  editingCatId.value = null;
};

const applyPreset = (preset: { name: string; icon: string; color: string }) => {
  catForm.value.name = preset.name;
  catForm.value.icon = preset.icon;
  catForm.value.color = preset.color;
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
    };

    if (editingCatId.value) {
      try {
        await api.patch(`/categories/${editingCatId.value}`, payload);
      } catch {
        await api.patch(`/products/categories/${editingCatId.value}`, payload);
      }
      toast.success(`"${name}" kategoriyasi muvaffaqiyatli yangilandi!`);
    } else {
      try {
        await api.post('/categories', payload);
      } catch {
        await api.post('/products/categories', payload);
      }
      toast.success(`"${name}" kategoriyasi muvaffaqiyatli yaratildi!`);
    }

    closeForm();
    await dataStore.fetchCategories(true);
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
  try {
    try {
      await api.delete(`/categories/${cat.id}`);
    } catch {
      await api.delete(`/products/categories/${cat.id}`);
    }
    toast.success(`"${cat.name}" kategoriyasi o'chirildi!`);
    await dataStore.fetchCategories(true);
  } catch (err: any) {
    console.error('Failed to delete category:', err);
    toast.error(getErrorMessage(err, 'Kategoriyani o\'chirishda xatolik yuz berdi.'));
  }
};

onMounted(() => {
  loadData();
});
</script>
