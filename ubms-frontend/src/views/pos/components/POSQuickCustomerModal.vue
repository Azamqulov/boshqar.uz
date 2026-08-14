<template>
  <Teleport to="body">
    <div v-if="isOpen" @click.self="$emit('close')" class="modal-overlay">
      <div class="modal-container max-w-sm" @click.stop>
        <div class="modal-header">
          <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Users class="w-4 h-4 text-amber-500" />
            <span>Yangi Mijoz Qo'shish</span>
          </h3>
          <button @click="$emit('close')" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X class="w-4 h-4" />
          </button>
        </div>

        <form @submit.prevent="$emit('save')" class="p-4 space-y-3 text-xs">
          <AppInput
            :model-value="newCustomerForm.fullName"
            @update:model-value="newCustomerForm.fullName = $event"
            label="Mijoz Ismi-Familiyasi *"
            placeholder="Masalan: Alisher Vohidov"
            :required="true"
          />
          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Telefon Raqami *</label>
            <PhoneInput
              :model-value="newCustomerForm.phone"
              @update:model-value="newCustomerForm.phone = $event"
              placeholder="90 123 45 67"
              :required="true"
            />
          </div>
          <div class="pt-2">
            <AppButton
              type="submit"
              variant="primary"
              class="w-full"
              :loading="savingCustomer"
            >
              {{ savingCustomer ? 'Saqlanmoqda...' : 'Mijozni Saqlash & Tanlash' }}
            </AppButton>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { Users, X } from 'lucide-vue-next';
import AppInput from '../../../components/AppInput.vue';
import AppButton from '../../../components/AppButton.vue';
import PhoneInput from '../../../components/PhoneInput.vue';

defineProps<{
  isOpen: boolean;
  newCustomerForm: { fullName: string; phone: string };
  savingCustomer: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'save'): void;
}>();
</script>
