<template>
  <div v-if="isOpen" @click.self="$emit('close')" class="modal-overlay">
    <div class="modal-container max-w-md" @click.stop>
      <div class="modal-header">
        <h3 class="text-base font-bold text-slate-900 dark:text-white">Mahsulot va Ombor Qoldig'ini Tahrirlash</h3>
        <button @click="$emit('close')" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition">
          <X class="w-5 h-5" />
        </button>
      </div>

      <form @submit.prevent="$emit('submit')" class="modal-body space-y-3.5 text-xs">
        <div>
          <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mahsulot Nomi *</label>
          <AppInput v-model="editForm.name" placeholder="Masalan: Coca-Cola 1.5L" required />
        </div>

        <div>
          <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">SKU / Shtrix-kod</label>
          <AppInput v-model="editForm.sku" placeholder="SKU kodi" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Tannarx (1 {{ currentUnit }} uchun)
            </label>
            <CurrencyInput v-model="editForm.purchasePrice" placeholder="0" suffix="so'm" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Joriy Ombor Qoldig'i ({{ currentUnit }}) *
            </label>
            <div class="relative flex items-center">
              <input
                type="number"
                v-model.number="editForm.quantity"
                :step="isDecimal ? '0.001' : '1'"
                :min="isDecimal ? '0.001' : '0'"
                placeholder="0"
                required
                class="w-full px-3 py-2 pr-14 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 transition shadow-inner"
              />
              <span class="absolute right-2.5 px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-[10px] font-black text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 pointer-events-none uppercase">
                {{ currentUnit }}
              </span>
            </div>
          </div>
        </div>

        <div>
          <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">
            Minimal Qoldiq Chegarasi ({{ currentUnit }})
          </label>
          <div class="relative flex items-center">
            <input
              type="number"
              v-model.number="editForm.minStock"
              :step="isDecimal ? '0.001' : '1'"
              :min="isDecimal ? '0.001' : '0'"
              placeholder="5"
              class="w-full px-3 py-2 pr-14 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 transition shadow-inner"
            />
            <span class="absolute right-2.5 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 pointer-events-none uppercase">
              {{ currentUnit }}
            </span>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <AppButton variant="ghost" size="md" @click="$emit('close')" type="button">
            Bekor qilish
          </AppButton>
          <AppButton variant="primary" size="md" :loading="submitting" type="submit">
            Saqlash
          </AppButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { X } from 'lucide-vue-next';
import AppButton from '../../../components/AppButton.vue';
import AppInput from '../../../components/AppInput.vue';
import CurrencyInput from '../../../components/CurrencyInput.vue';

const props = defineProps<{
  isOpen: boolean;
  editForm: any;
  submitting: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'submit'): void;
}>();

const currentUnit = computed(() => {
  return props.editForm?.unit || 'dona';
});

const isDecimal = computed(() => {
  return props.editForm?.allowDecimal === true || ['kg', 'l', 'g', 'm', 'ml'].includes(currentUnit.value.toLowerCase());
});
</script>
