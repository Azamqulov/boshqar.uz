<template>
  <Teleport to="body">
    <div v-if="isOpen" @click.self="$emit('close')" class="modal-overlay">
      <div class="modal-container max-w-md" @click.stop>
        <div class="modal-header">
          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white">
              {{ editingSupplier ? "Ta'minotchi Ma'lumotlarini Tahrirlash" : "Yangi Ta'minotchi Qo'shish" }}
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Yetkazib beruvchi firmasi va kontakt ma'lumotlari</p>
          </div>
          <button @click="$emit('close')" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="$emit('save')" class="modal-body space-y-4">
          <div>
            <label class="block font-bold text-xs text-slate-700 dark:text-slate-300 mb-1">Mas'ul Shaxs Nomi (F.I.SH) *</label>
            <AppInput v-model="formData.name" placeholder="Masalan: Alisher Navoiy" required />
          </div>

          <div>
            <label class="block font-bold text-xs text-slate-700 dark:text-slate-300 mb-1">Kompaniya / Firma Nomi</label>
            <AppInput v-model="formData.companyName" placeholder="Masalan: OOO Food Logistics" />
          </div>

          <div>
            <label class="block font-bold text-xs text-slate-700 dark:text-slate-300 mb-1">Telefon Raqami (+998)</label>
            <PhoneInput v-model="formData.phone" placeholder="90 123 45 67" />
          </div>

          <div>
            <label class="block font-bold text-xs text-slate-700 dark:text-slate-300 mb-1">Manzil</label>
            <AppInput v-model="formData.address" placeholder="Toshkent shahri, Sergeli t-n" />
          </div>

          <div v-if="!editingSupplier">
            <label class="block font-bold text-xs text-slate-700 dark:text-slate-300 mb-1">Dastlabki Qarz / Balans (so'm)</label>
            <CurrencyInput
              v-model="formData.balance"
              placeholder="0"
              suffix="so'm"
              inputClass="font-bold text-rose-600 dark:text-rose-400"
            />
            <span class="text-[11px] text-slate-400 mt-1 block">Musbat summa — bizning ta'minotchiga qarzimizni bildiradi</span>
          </div>

          <div>
            <label class="block font-bold text-xs text-slate-700 dark:text-slate-300 mb-1">Izoh / Qo'shimcha qaydlar</label>
            <textarea
              v-model="formData.notes"
              rows="3"
              placeholder="Yetkazib berish shartlari, grafik..."
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
            ></textarea>
          </div>

          <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <AppButton variant="ghost" size="md" @click="$emit('close')" type="button">
              Bekor qilish
            </AppButton>
            <AppButton variant="primary" size="md" :loading="submitting" type="submit">
              {{ editingSupplier ? "Saqlash" : "Qo'shish" }}
            </AppButton>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next';
import AppButton from '../../../components/AppButton.vue';
import AppInput from '../../../components/AppInput.vue';
import PhoneInput from '../../../components/PhoneInput.vue';
import CurrencyInput from '../../../components/CurrencyInput.vue';

defineProps<{
  isOpen: boolean;
  editingSupplier: any;
  formData: any;
  submitting: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'save'): void;
}>();
</script>
