<template>
  <div v-if="isOpen" @click.self="$emit('close')" class="modal-overlay">
    <div class="modal-container max-w-md overflow-visible" @click.stop>
      <div class="modal-header">
        <h3 class="text-base font-bold text-slate-900 dark:text-white">Ombordan Chiqim / Hisobdan Chiqarish</h3>
        <button @click="$emit('close')" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"><X class="w-5 h-5" /></button>
      </div>

      <div class="modal-body overflow-visible">
        <form @submit.prevent="$emit('submit')" class="space-y-3.5 text-xs">
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Mahsulotni tanlang *</label>
            <AppSelect
              v-model="stockOutForm.productId"
              :options="inventoryOutOptions"
              :searchable="true"
              placeholder="Mahsulotni tanlang..."
              required
            />
          </div>

          <AppInput
            v-model="stockOutForm.quantity"
            label="Chiqim Miqdori"
            type="number"
            placeholder="0"
            :required="true"
          />

          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Chiqim Sababi</label>
            <AppSelect
              v-model="stockOutForm.reason"
              :options="[
                { value: 'damage', label: 'Yaroqsiz / Buzilgan' },
                { value: 'loss', label: 'Yo\'qolgan / Kamomad' },
                { value: 'expired', label: 'Muddati o\'tgan' },
                { value: 'internal_use', label: 'Xodimlar / Ichki foydalanish' }
              ]"
            />
          </div>

          <div class="pt-2">
            <AppButton type="submit" variant="danger" size="lg" class="w-full" :loading="submitting">
              {{ submitting ? 'Chiqim qilinmoqda...' : 'Chiqimni Tasdiqlash' }}
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

defineProps<{
  isOpen: boolean;
  stockOutForm: any;
  inventoryOutOptions: any[];
  submitting: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'submit'): void;
}>();
</script>
