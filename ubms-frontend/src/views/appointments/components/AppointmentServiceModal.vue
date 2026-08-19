<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-container max-w-md" @click.stop>
        <div class="modal-header">
          <h3 class="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Scissors class="w-5 h-5 text-emerald-500" />
            <span>Yangi Xizmat Qo'shish</span>
          </h3>
          <button @click="$emit('close')" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="$emit('save')" class="modal-body space-y-3.5 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Xizmat nomi *</label>
            <input
              type="text"
              v-model="serviceForm.name"
              required
              placeholder="Masalan: Soch turmaklash (Fade)"
              class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-bold"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Narxi (UZS) *</label>
              <input
                type="number"
                v-model.number="serviceForm.price"
                required
                min="0"
                step="1000"
                placeholder="50000"
                class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Davomiyligi (daqiqa) *</label>
              <input
                type="number"
                v-model.number="serviceForm.durationMinutes"
                required
                min="5"
                step="5"
                placeholder="30"
                class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div class="pt-2">
            <AppButton type="submit" variant="primary" size="lg" class="w-full" :loading="submitting">
              {{ submitting ? 'Saqlanmoqda...' : 'Xizmatni Saqlash' }}
            </AppButton>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { Scissors, X } from 'lucide-vue-next';
import AppButton from '../../../components/AppButton.vue';

defineProps<{
  isOpen: boolean;
  serviceForm: {
    name: string;
    price: number;
    durationMinutes: number;
  };
  submitting: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'save'): void;
}>();
</script>
