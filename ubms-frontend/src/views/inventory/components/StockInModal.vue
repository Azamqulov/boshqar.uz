<template>
  <div v-if="isOpen" @click.self="$emit('close')" class="modal-overlay">
    <div class="modal-container max-w-md overflow-visible" @click.stop>
      <div class="modal-header">
        <h3 class="text-base font-bold text-slate-900 dark:text-white">Omborga Kirim Qilish</h3>
        <button @click="$emit('close')" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"><X class="w-5 h-5" /></button>
      </div>

      <div class="modal-body overflow-visible">
        <form @submit.prevent="$emit('submit')" class="space-y-3.5 text-xs">
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Mahsulotni tanlang *</label>
            <AppSelect
              v-model="stockForm.productId"
              :options="inventoryInOptions"
              :searchable="true"
              placeholder="Mahsulotni tanlang..."
              required
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <AppInput
              v-model="stockForm.quantity"
              label="Kirim Miqdori"
              type="number"
              placeholder="0"
              :required="true"
            />
            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Kirim Narxi (Tannarx)</label>
              <CurrencyInput
                v-model="stockForm.purchasePrice"
                placeholder="0"
                suffix="so'm"
              />
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Kirim Sababi</label>
            <AppSelect
              v-model="stockForm.reason"
              :options="[
                { value: 'manual', label: 'Inventarizatsiya / Qo\'lda kirim' },
                { value: 'purchase', label: 'Ta\'minotchidan xarid' }
              ]"
            />
          </div>

          <div class="pt-2">
            <AppButton type="submit" variant="primary" size="lg" class="w-full" :loading="submitting">
              {{ submitting ? 'Kirim qilinmoqda...' : 'Kirimni Tasdiqlash' }}
            </AppButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next';
import AppButton from '../../../components/AppButton.vue';
import AppInput from '../../../components/AppInput.vue';
import AppSelect from '../../../components/AppSelect.vue';
import CurrencyInput from '../../../components/CurrencyInput.vue';

defineProps<{
  isOpen: boolean;
  stockForm: any;
  inventoryInOptions: any[];
  submitting: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'submit'): void;
}>();
</script>
