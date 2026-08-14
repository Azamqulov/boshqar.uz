<template>
  <Teleport to="body">
    <div v-if="isOpen" @click.self="$emit('close')" class="modal-overlay">
      <div class="modal-container max-w-xl" @click.stop>
        <div class="modal-header">
          <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderTree class="w-5 h-5 text-emerald-500" />
            <span>Kategoriyalar Boshqaruvi</span>
          </h3>
          <button @click="$emit('close')" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"><X class="w-5 h-5" /></button>
        </div>

        <div class="modal-body space-y-4">
          <!-- 1-Click Fast Category Presets -->
          <div>
            <span class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
              Tezkor Kategoriya Qo'shish (1-bosishda):
            </span>
            <div class="flex flex-wrap gap-1.5">
              <button
                type="button"
                v-for="preset in fastCategoryPresets"
                :key="preset.name"
                @click="$emit('applyPreset', preset)"
                class="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-600 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1 transition btn-interactive"
              >
                <span>{{ preset.icon }}</span>
                <span>{{ preset.name }}</span>
              </button>
            </div>
          </div>

          <!-- Category Form -->
          <form @submit.prevent="$emit('saveCategory')" class="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div class="flex items-center justify-between">
              <span class="font-bold text-xs text-slate-800 dark:text-slate-200">
                {{ editingCatId ? 'Kategoriyani Tahrirlash' : 'Yangi Kategoriya Yaratish' }}
              </span>
              <button
                v-if="editingCatId"
                type="button"
                @click="$emit('resetCategoryForm')"
                class="text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline"
              >
                Bekor qilish
              </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <AppInput
                v-model="catForm.name"
                label="Kategoriya Nomi *"
                placeholder="Masalan: Ichimliklar, Shirinliklar..."
                :required="true"
              />

              <!-- Icon Selector -->
              <div>
                <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Ikonka (Emoji)</label>
                <div class="flex items-center gap-2">
                  <input
                    v-model="catForm.icon"
                    class="w-12 h-9 text-center text-lg bg-white dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-emerald-500"
                  />
                  <div class="flex items-center gap-1 overflow-x-auto py-1">
                    <button
                      type="button"
                      v-for="emoji in quickEmojis"
                      :key="emoji"
                      @click="catForm.icon = emoji"
                      class="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-sm transition"
                    >
                      {{ emoji }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Color Palette -->
              <div>
                <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Rang</label>
                <div class="flex items-center gap-1.5 flex-wrap">
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
                    class="w-6 h-6 rounded-full cursor-pointer border border-slate-300 dark:border-slate-700 p-0 bg-transparent"
                    title="Boshqa rang"
                  />
                </div>
              </div>
            </div>

            <div class="mt-2">
              <AppButton type="submit" variant="primary" size="md" class="w-full" :loading="savingCategory">
                {{ savingCategory ? 'Saqlanmoqda...' : (editingCatId ? 'Kategoriyani Yangilash' : 'Kategoriyani Saqlash') }}
              </AppButton>
            </div>
          </form>

          <!-- Existing Categories List -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Mavjud Kategoriyalar ({{ categories.length }} ta)
              </span>
              <div v-if="categories.length > 4" class="w-52">
                <AppInput
                  :model-value="categorySearch"
                  @update:model-value="$emit('update:categorySearch', $event)"
                  placeholder="Kategoriyalardan qidirish..."
                  :icon="Search"
                />
              </div>
            </div>

            <div v-if="filteredModalCategories.length === 0" class="p-6 text-center rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 text-xs">
              Kategoriyalar topilmadi
            </div>

            <div v-else class="max-h-56 overflow-y-auto space-y-1.5 pr-1">
              <div
                v-for="cat in filteredModalCategories"
                :key="cat.id"
                class="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500/50 transition group text-xs"
              >
                <div class="flex items-center gap-2.5 min-w-0">
                  <span
                    class="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 shadow-sm"
                    :style="{ backgroundColor: cat.color ? cat.color + '20' : '#10b98120', color: cat.color || '#10b981' }"
                  >
                    {{ getCategoryIcon(cat.icon) }}
                  </span>
                  <div class="min-w-0">
                    <span class="font-bold text-slate-900 dark:text-white block truncate">{{ cat.name }}</span>
                    <span class="text-[10px] text-slate-400 font-mono">{{ cat.productsCount || 0 }} ta mahsulot</span>
                  </div>
                </div>

                <div class="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                  <button
                    type="button"
                    @click="$emit('editCategory', cat)"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                    title="Tahrirlash"
                  >
                    <Edit2 class="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    @click="$emit('deleteCategory', cat)"
                    class="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
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
  </Teleport>
</template>

<script setup lang="ts">
import { FolderTree, X, Search, Edit2, Trash2 } from 'lucide-vue-next';
import AppButton from '../../../components/AppButton.vue';
import AppInput from '../../../components/AppInput.vue';

defineProps<{
  isOpen: boolean;
  editingCatId: string | null;
  catForm: any;
  savingCategory: boolean;
  categories: any[];
  filteredModalCategories: any[];
  categorySearch: string;
  fastCategoryPresets: Array<{ name: string; icon: string; color: string }>;
  quickEmojis: string[];
  quickColors: string[];
  getCategoryIcon: (icon: string) => string;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'applyPreset', preset: any): void;
  (e: 'saveCategory'): void;
  (e: 'resetCategoryForm'): void;
  (e: 'editCategory', cat: any): void;
  (e: 'deleteCategory', cat: any): void;
  (e: 'update:categorySearch', val: string): void;
}>();
</script>
