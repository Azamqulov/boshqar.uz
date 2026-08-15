<template>
  <Teleport to="body">
    <div v-if="isOpen" @click.self="$emit('close')" class="modal-overlay">
      <div class="modal-container max-w-lg" @click.stop>
        <!-- Modal Header -->
        <div class="modal-header pb-2.5 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Truck class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                {{ editingSupplier ? "Ta'minotchi Ma'lumotlarini Tahrirlash" : "Yangi Ta'minotchi Qo'shish" }}
              </h3>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">Yetkazib beruvchi firmasi va kontakt ma'lumotlari</p>
            </div>
          </div>
          <button @click="$emit('close')" class="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Form Body -->
        <form @submit.prevent="$emit('save')" class="modal-body p-4 space-y-3 text-xs">
          <!-- 1-Qator: Mas'ul Shaxs va Kompaniya -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                Mas'ul Shaxs Nomi (F.I.SH) *
              </label>
              <AppInput
                v-model="formData.name"
                placeholder="Masalan: Alisher Navoiy"
                required
              />
            </div>

            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                Kompaniya / Firma Nomi
              </label>
              <AppInput
                v-model="formData.companyName"
                placeholder="Masalan: OOO Food Logistics"
              />
            </div>
          </div>

          <!-- 2-Qator: Telefon va Manzil -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                Telefon Raqami (+998)
              </label>
              <PhoneInput
                v-model="formData.phone"
                placeholder="90 123 45 67"
              />
            </div>

            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                Manzil
              </label>
              <AppInput
                v-model="formData.address"
                placeholder="Toshkent shahri, Sergeli t-n"
              />
            </div>
          </div>

          <!-- 3-Qator: Dastlabki Balans va Izoh -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div v-if="!editingSupplier">
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                Dastlabki Qarz / Balans
              </label>
              <CurrencyInput
                v-model="formData.balance"
                placeholder="0"
                suffix="so'm"
                inputClass="font-bold text-rose-600 dark:text-rose-400"
              />
              <span class="text-[10px] text-slate-400 mt-0.5 block">+ summa bizning qarzimiz</span>
            </div>

            <div :class="editingSupplier ? 'sm:col-span-2' : ''">
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                Izoh / Qo'shimcha qaydlar
              </label>
              <input
                v-model="formData.notes"
                placeholder="Yetkazib berish shartlari, grafik..."
                class="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 font-medium shadow-inner"
              />
            </div>
          </div>

          <!-- Pastki Tugmalar -->
          <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition"
            >
              Bekor qilish
            </button>
            <AppButton
              variant="primary"
              size="md"
              class="px-6"
              :loading="submitting"
              type="submit"
            >
              {{ editingSupplier ? "O'zgarishlarni Saqlash" : "Ta'minotchini Qo'shish" }}
            </AppButton>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { X, Truck } from 'lucide-vue-next';
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
