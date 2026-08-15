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
                    class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-slate-200/80 dark:border-slate-700 overflow-hidden"
                    :style="{ backgroundColor: (cat.color || '#10b981') + '18', color: cat.color || '#10b981' }"
                  >
                    <CategoryIcon :icon="cat.icon" iconClass="w-5 h-5" />
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
                class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-slate-200/80 dark:border-slate-700"
                :style="{ backgroundColor: (cat.color || '#10b981') + '20', color: cat.color || '#10b981' }"
              >
                <CategoryIcon :icon="cat.icon" iconClass="w-5 h-5" />
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
          <!-- Modal Header -->
          <div class="modal-header pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <div class="flex items-center gap-2.5">
              <div
                class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-inner transition transform hover:scale-105"
                :style="{ backgroundColor: (catForm.color || '#10b981') + '20', color: catForm.color || '#10b981', border: `1.5px solid ${catForm.color || '#10b981'}40` }"
              >
                <CategoryIcon :icon="catForm.icon || 'Package'" iconClass="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 class="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                  {{ editingCatId ? 'Kategoriyani Tahrirlash' : 'Yangi Kategoriya Yaratish' }}
                </h3>
                <p class="text-[11px] text-slate-500 dark:text-slate-400">Nomi, belgisi va rangini tanlang</p>
              </div>
            </div>
            <button @click="closeForm" class="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition">
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Modal Body (Compact & No Scroll) -->
          <div class="modal-body p-4 space-y-3 text-xs">
            
            <!-- 1. Tezkor Shablonlar -->
            <div class="space-y-1.5">
              <span class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Tezkor Shablonlar:
              </span>
              <div class="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  v-for="preset in fastCategoryPresets"
                  :key="preset.name"
                  @click="applyPreset(preset)"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20 border border-slate-200/80 dark:border-slate-700 hover:border-emerald-500/40 text-slate-700 dark:text-slate-200 text-[11px] font-semibold transition btn-interactive"
                >
                  <CategoryIcon :icon="preset.icon" iconClass="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>{{ preset.name }}</span>
                </button>
              </div>
            </div>

            <!-- Form Fields -->
            <form @submit.prevent="saveCategory" class="space-y-3">
              
              <!-- 2. Kategoriya Nomi -->
              <div>
                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                  Kategoriya Nomi *
                </label>
                <input
                  v-model="catForm.name"
                  required
                  placeholder="Masalan: Pitsa & Fast Food, Ichimliklar, Shirinliklar..."
                  class="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 font-bold shadow-inner"
                />
              </div>

              <!-- 3. Ikonka va Rang Bo'limi -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
                
                <!-- SVG Ikonka Tanlash -->
                <div class="space-y-1.5">
                  <div class="flex items-center justify-between">
                    <label class="font-bold text-slate-700 dark:text-slate-300 text-[11px]">SVG Ikonka</label>
                    <span class="text-[10px] text-slate-400 font-mono">{{ catForm.icon || 'Package' }}</span>
                  </div>
                  <div class="grid grid-cols-4 gap-1">
                    <button
                      type="button"
                      v-for="item in availableCategoryIcons"
                      :key="item.name"
                      @click="catForm.icon = item.name"
                      :title="item.label"
                      class="h-8 rounded-lg border transition flex items-center justify-center btn-interactive"
                      :class="catForm.icon === item.name ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600'"
                    >
                      <component :is="item.component" class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <!-- Rang Tanlash -->
                <div class="space-y-1.5">
                  <div class="flex items-center justify-between">
                    <label class="font-bold text-slate-700 dark:text-slate-300 text-[11px]">Rang Tusi</label>
                    <span class="text-[10px] font-mono text-slate-400">{{ catForm.color || '#10b981' }}</span>
                  </div>
                  <div class="grid grid-cols-5 gap-1.5 pt-0.5">
                    <button
                      type="button"
                      v-for="color in quickColors"
                      :key="color"
                      @click="catForm.color = color"
                      class="w-6 h-6 rounded-lg border-2 transition transform hover:scale-110 shadow-xs flex items-center justify-center"
                      :class="catForm.color === color ? 'border-slate-900 dark:border-white ring-2 ring-emerald-500/40 scale-105' : 'border-transparent'"
                      :style="{ backgroundColor: color }"
                    >
                      <CheckCircle2 v-if="catForm.color === color" class="w-3 h-3 text-white drop-shadow" />
                    </button>
                    <label
                      class="w-6 h-6 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center cursor-pointer hover:border-emerald-500 transition bg-white dark:bg-slate-900 text-[10px]"
                      title="Maxsus rang"
                    >
                      <input
                        type="color"
                        v-model="catForm.color"
                        class="w-0 h-0 opacity-0"
                      />
                      <span>🎨</span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- 4. Kategoriya Prevyusi (Jonli Ko'rinishi) -->
              <div class="p-2.5 rounded-xl border flex items-center justify-between transition" :style="{ backgroundColor: (catForm.color || '#10b981') + '10', borderColor: (catForm.color || '#10b981') + '30' }">
                <div class="flex items-center gap-2">
                  <div
                    class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
                    :style="{ backgroundColor: (catForm.color || '#10b981') + '25', color: catForm.color || '#10b981' }"
                  >
                    <CategoryIcon :icon="catForm.icon || 'Package'" iconClass="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span class="font-black text-xs text-slate-900 dark:text-white block">{{ catForm.name || "Kategoriya Nomi" }}</span>
                    <span class="text-[10px] text-slate-400">Katalog va POS kassada shu tarzda ko'rinadi</span>
                  </div>
                </div>
                <span
                  class="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider"
                  :style="{ backgroundColor: (catForm.color || '#10b981') + '20', color: catForm.color || '#10b981' }"
                >
                  Faol
                </span>
              </div>

              <!-- 5. Tugmalar -->
              <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  @click="closeForm"
                  class="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition"
                >
                  Bekor qilish
                </button>
                <AppButton
                  type="submit"
                  variant="primary"
                  size="md"
                  class="px-6"
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
import CategoryIcon from '../../components/CategoryIcon.vue';
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

// Fast Presets with clean Lucide SVG icons
const fastCategoryPresets = computed(() => {
  const t = currentBusinessType.value;

  if (t === 'restaurant' || t === 'cafe') {
    return [
      { name: 'Issiq Taomlar', icon: 'Flame', color: '#10b981' },
      { name: 'Pitsa & Fast Food', icon: 'UtensilsCrossed', color: '#f59e0b' },
      { name: 'Salatlar & Gazaklar', icon: 'Apple', color: '#14b8a6' },
      { name: 'Ichimliklar & Choy', icon: 'CupSoda', color: '#06b6d4' },
      { name: 'Qahva & Kofe', icon: 'Coffee', color: '#8b5cf6' },
      { name: 'Desertlar', icon: 'Cookie', color: '#ec4899' },
    ];
  }

  if (t === 'pharmacy') {
    return [
      { name: 'Dori-Darmonlar', icon: 'Pill', color: '#10b981' },
      { name: 'Vitaminlar & BAD', icon: 'Apple', color: '#14b8a6' },
      { name: 'Tibbiy vositalar', icon: 'Package', color: '#3b82f6' },
      { name: 'Gigiyena & Parvarish', icon: 'Sparkles', color: '#ec4899' },
      { name: 'Bolalar parvarishi', icon: 'Milk', color: '#f59e0b' },
    ];
  }

  return [
    { name: 'Oziq-ovqat & Mevalar', icon: 'Apple', color: '#10b981' },
    { name: 'Sut Mahsulotlari', icon: 'Milk', color: '#06b6d4' },
    { name: 'Ichimliklar & Sharbatlar', icon: 'CupSoda', color: '#3b82f6' },
    { name: 'Konditer & Shirinliklar', icon: 'Cookie', color: '#ec4899' },
    { name: 'Uy-ro\'zg\'or & Ximya', icon: 'Sparkles', color: '#8b5cf6' },
    { name: 'Kanselyariya & Boshqa', icon: 'BookOpen', color: '#f59e0b' },
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
