<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container max-w-md" @click.stop>
      <div class="modal-header">
        <h3 class="font-bold text-base text-slate-900 dark:text-white">Yangi Bandlov Qo'shish</h3>
        <button @click="$emit('close')" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white">
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="modal-body space-y-4">
        <form @submit.prevent="$emit('save')" class="space-y-3 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Mijoz *</label>
            <AppSelect
              :model-value="form.customerId"
              @update:model-value="form.customerId = $event"
              :options="customers.map(c => ({ value: c.id, label: `${c.fullName} (${c.phone || 'Tel yo\'q'})` }))"
              :searchable="true"
              placeholder="Mijozni tanlang..."
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Xizmat turi *</label>
            <AppSelect
              :model-value="form.serviceId"
              @update:model-value="form.serviceId = $event"
              :options="services.map(s => ({ value: s.id, label: `${s.name} - ${formatCurrency(s.price)}` }))"
              placeholder="Xizmatni tanlang..."
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Usta / Mutaxassis</label>
            <AppSelect
              :model-value="form.employeeId"
              @update:model-value="form.employeeId = $event"
              :options="employees.map(e => ({ value: e.id, label: e.fullName }))"
              placeholder="Ustani tanlang (ixtiyoriy)..."
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Sana va Vaqt *</label>
            <input
              type="datetime-local"
              v-model="form.scheduledAt"
              required
              class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Izoh</label>
            <textarea
              v-model="form.notes"
              rows="2"
              placeholder="Mijoz istaklari yoki qo'shimcha eslatma..."
              class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            ></textarea>
          </div>

          <div class="mt-4">
            <AppButton type="submit" variant="primary" size="lg" class="w-full" :loading="submitting">
              {{ submitting ? 'Saqlanmoqda...' : 'Bandlovni Saqlash' }}
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
import AppSelect from '../../../components/AppSelect.vue';
import { useFormat } from '../../../composables/useFormat';

defineProps<{
  isOpen: boolean;
  form: {
    customerId: string;
    serviceId: string;
    employeeId: string;
    scheduledAt: string;
    notes: string;
  };
  customers: any[];
  services: any[];
  employees: any[];
  submitting: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'save'): void;
}>();

const { formatCurrency } = useFormat();
</script>
