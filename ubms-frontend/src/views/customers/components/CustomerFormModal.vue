<template>
  <Teleport to="body">
    <div v-if="isOpen" @click.self="$emit('close')" class="modal-overlay">
      <div class="modal-container max-w-md" @click.stop>
        <div class="modal-header">
          <h3 class="text-base font-bold text-slate-900 dark:text-white">
            {{ editingCustomerId ? 'Mijoz Ma\'lumotlarini Tahrirlash' : 'Yangi Mijoz Qo\'shish' }}
          </h3>
          <button @click="$emit('close')" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"><X class="w-5 h-5" /></button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="$emit('save')" class="space-y-3.5 text-xs">
            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Mijoz Ism Familiyasi *</label>
              <input
                v-model="customerForm.fullName"
                required
                placeholder="Masalan: Jamshid Aliyev"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Telefon Raqami</label>
              <PhoneInput v-model="customerForm.phone" placeholder="90 123 45 67" />
            </div>

            <div v-if="!editingCustomerId">
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Boshlang'ich Qarz Summasi (agar mavjud bo'lsa)</label>
              <CurrencyInput
                v-model="customerForm.debt"
                placeholder="0"
                suffix="so'm"
                inputClass="font-bold text-rose-600 dark:text-rose-400"
              />
            </div>

            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Izoh / Eslatma</label>
              <textarea
                v-model="customerForm.notes"
                rows="2"
                placeholder="Mijoz haqida qo'shimcha ma'lumot (manzil, do'kon, qo'shimcha kontakt)..."
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              ></textarea>
            </div>

            <div class="pt-2">
              <AppButton
                type="submit"
                variant="primary"
                size="md"
                class="w-full"
                :loading="submitting"
              >
                {{ submitting ? 'Saqlanmoqda...' : (editingCustomerId ? 'O\'zgarishlarni Saqlash' : 'Mijozni Saqlash') }}
              </AppButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next';
import AppButton from '../../../components/AppButton.vue';
import PhoneInput from '../../../components/PhoneInput.vue';
import CurrencyInput from '../../../components/CurrencyInput.vue';

defineProps<{
  isOpen: boolean;
  editingCustomerId: string | null;
  customerForm: {
    fullName: string;
    phone: string;
    debt?: number;
    notes: string;
  };
  submitting: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'save'): void;
}>();
</script>
