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

          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Chiqim Miqdori ({{ currentUnit }}) *
            </label>
            <div class="relative flex items-center">
              <input
                type="number"
                v-model.number="stockOutForm.quantity"
                :step="isDecimal ? '0.001' : '1'"
                :min="isDecimal ? '0.001' : '1'"
                placeholder="0"
                required
                class="w-full px-3 py-2.5 pr-14 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-rose-500 transition shadow-inner"
              />
              <span class="absolute right-3 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-rose-600 dark:text-rose-400 border border-slate-200 dark:border-slate-700 pointer-events-none uppercase">
                {{ currentUnit }}
              </span>
            </div>
          </div>

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
import { computed } from 'vue';
import { X } from 'lucide-vue-next';
import AppButton from '../../../components/AppButton.vue';
import AppSelect from '../../../components/AppSelect.vue';

const props = defineProps<{
  isOpen: boolean;
  stockOutForm: any;
  inventoryOutOptions: any[];
  submitting: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'submit'): void;
}>();

const selectedItem = computed(() => {
  return props.inventoryOutOptions.find((opt) => opt.value === props.stockOutForm.productId);
});

const currentUnit = computed(() => {
  return selectedItem.value?.unit || 'dona';
});

const isDecimal = computed(() => {
  return selectedItem.value?.allowDecimal === true || ['kg', 'l', 'g', 'm', 'ml'].includes(currentUnit.value.toLowerCase());
});
</script>
