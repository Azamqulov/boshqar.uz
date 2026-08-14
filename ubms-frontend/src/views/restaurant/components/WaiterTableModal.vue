<template>
  <Teleport to="body">
    <div v-if="isOpen" @click.self="$emit('close')" class="modal-overlay">
      <div class="modal-container max-w-md" @click.stop>
        <div class="modal-header">
          <h3 class="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <UtensilsCrossed class="w-5 h-5 text-amber-500" />
            <span>{{ editingTableId ? 'Stol Ma\'lumotlarini Tahrirlash' : 'Yangi Stol Qo\'shish' }}</span>
          </h3>
          <button @click="$emit('close')" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="modal-body space-y-4">
          <form @submit.prevent="$emit('save')" class="space-y-4 text-xs">
            <!-- Fast Name Presets -->
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tezkor Nomi Shablonlari:</label>
              <div class="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  v-for="preset in ['Stol', 'VIP Zal', 'Terassa', 'Xontaxta', 'Kabina']"
                  :key="preset"
                  @click="$emit('applyPreset', preset)"
                  class="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:text-amber-600 border border-slate-200 dark:border-slate-700 transition"
                >
                  + {{ preset }}
                </button>
              </div>
            </div>

            <!-- Table Name -->
            <div>
              <AppInput
                :model-value="tableForm.name"
                @update:model-value="tableForm.name = $event"
                label="Stol Nomi / Raqami *"
                placeholder="Masalan: Stol #5, VIP Zal 1, Terassa 2"
                :required="true"
              />
            </div>

            <!-- Capacity (Number of Seats) -->
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Sig'im (O'rindiqlar soni) *</label>
              <div class="flex items-center gap-2 mb-2">
                <input
                  v-model.number="tableForm.capacity"
                  type="number"
                  min="1"
                  max="100"
                  required
                  class="w-24 px-3 py-2 rounded-xl text-center font-bold text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
                <span class="text-xs text-slate-500 dark:text-slate-400">kishilik stol</span>
              </div>

              <!-- Fast Capacity Presets -->
              <div class="flex gap-1.5">
                <button
                  type="button"
                  v-for="cap in [2, 4, 6, 8, 12]"
                  :key="cap"
                  @click="tableForm.capacity = cap"
                  class="px-3 py-1 rounded-lg text-xs font-bold transition"
                  :class="tableForm.capacity === cap ? 'bg-amber-500 text-slate-950 shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200'"
                >
                  {{ cap }} kishi
                </button>
              </div>
            </div>

            <div class="pt-2">
              <AppButton type="submit" variant="primary" size="lg" class="w-full" :loading="savingTable">
                {{ savingTable ? 'Saqlanmoqda...' : (editingTableId ? 'Stolni Yangilash' : 'Stolni Saqlash') }}
              </AppButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { UtensilsCrossed, X } from 'lucide-vue-next';
import AppInput from '../../../components/AppInput.vue';
import AppButton from '../../../components/AppButton.vue';

defineProps<{
  isOpen: boolean;
  editingTableId: string | null;
  tableForm: { name: string; capacity: number };
  savingTable: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'applyPreset', preset: string): void;
  (e: 'save'): void;
}>();
</script>
