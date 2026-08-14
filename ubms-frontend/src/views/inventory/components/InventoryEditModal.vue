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
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tannarx (so'm)</label>
            <CurrencyInput v-model="editForm.purchasePrice" placeholder="0" suffix="so'm" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Joriy Ombor Qoldig'i</label>
            <AppInput v-model.number="editForm.quantity" type="number" placeholder="0" required />
          </div>
        </div>

        <div>
          <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Minimal Qoldiq Chegarasi (Kam qolish ogohlantirishi)</label>
          <AppInput v-model.number="editForm.minStock" type="number" placeholder="5" />
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
import { X } from 'lucide-vue-next';
import AppButton from '../../../components/AppButton.vue';
import AppInput from '../../../components/AppInput.vue';
import CurrencyInput from '../../../components/CurrencyInput.vue';

defineProps<{
  isOpen: boolean;
  editForm: any;
  submitting: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'submit'): void;
}>();
</script>
