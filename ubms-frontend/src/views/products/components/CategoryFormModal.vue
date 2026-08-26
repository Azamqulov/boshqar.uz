<template>
  <Teleport to="body">
    <div v-if="isOpen" @click.self="$emit('close')" class="modal-overlay">
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
          <button @click="$emit('close')" class="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Modal Body (Compact & No Scroll) -->
        <div class="modal-body p-4 space-y-3 text-xs">
          
          <!-- 1. Tezkor Shablonlar -->
          <div class="space-y-1.5" v-if="fastCategoryPresets && fastCategoryPresets.length > 0">
            <span class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Tezkor Shablonlar:
            </span>
            <div class="flex flex-wrap gap-1.5">
              <button
                type="button"
                v-for="preset in fastCategoryPresets"
                :key="preset.name"
                @click="$emit('apply-preset', preset)"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20 border border-slate-200/80 dark:border-slate-700 hover:border-emerald-500/40 text-slate-700 dark:text-slate-200 text-[11px] font-semibold transition btn-interactive"
              >
                <CategoryIcon :icon="preset.icon" iconClass="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>{{ preset.name }}</span>
              </button>
            </div>
          </div>

          <!-- Form Fields -->
          <form @submit.prevent="$emit('save')" class="space-y-3">
            
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
                    <Palette class="w-3.5 h-3.5 text-slate-500" />
                  </label>
                </div>
              </div>
            </div>

            <!-- Ombor Qoldig'i Standarti (defaultTrackInventory) -->
            <div class="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
              <div class="space-y-0.5">
                <label class="block font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                  Standart Ombor Qoldig'i
                </label>
                <p class="text-[10px] text-slate-500 dark:text-slate-400">
                  {{ catForm.defaultTrackInventory !== false ? "Ushbu turkum tovarlari uchun qoldiq hisoblanadi" : "Buyurtma asosida tayyorlanadi (qoldiq hisoblanmaydi)" }}
                </p>
              </div>
              <button
                type="button"
                @click="catForm.defaultTrackInventory = catForm.defaultTrackInventory === false ? true : false"
                class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                :class="catForm.defaultTrackInventory !== false ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'"
              >
                <span
                  class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                  :class="catForm.defaultTrackInventory !== false ? 'translate-x-4' : 'translate-x-0'"
                />
              </button>
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
                @click="$emit('close')"
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
</template>

<script setup lang="ts">
import { X, CheckCircle2, Palette } from 'lucide-vue-next';
import CategoryIcon from '../../../components/CategoryIcon.vue';
import AppButton from '../../../components/AppButton.vue';

defineProps<{
  isOpen: boolean;
  editingCatId: string | null;
  catForm: {
    name: string;
    icon: string;
    color: string;
    description?: string;
    defaultTrackInventory?: boolean;
  };
  saving: boolean;
  availableCategoryIcons: any[];
  fastCategoryPresets: any[];
  quickColors: string[];
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'save'): void;
  (e: 'apply-preset', preset: any): void;
}>();
</script>
