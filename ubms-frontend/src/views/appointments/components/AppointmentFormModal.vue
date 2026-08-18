<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container max-w-lg" @click.stop>
      <div class="modal-header">
        <h3 class="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Calendar class="w-5 h-5 text-emerald-500" />
          <span>Yangi Bandlov Qo'shish</span>
        </h3>
        <button @click="$emit('close')" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white">
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="modal-body space-y-4">
        <form @submit.prevent="handleSubmit" class="space-y-3.5 text-xs">
          <!-- 1. Mijoz -->
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

          <!-- 2. Xizmat turi -->
          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Xizmat turi *</label>
            <AppSelect
              :model-value="form.serviceId"
              @update:model-value="form.serviceId = $event"
              :options="services.map(s => ({ value: s.id, label: `${s.name} — ${formatCurrency(s.price)} (${s.durationMinutes || 30} daqiqa)` }))"
              placeholder="Xizmatni tanlang..."
            />
          </div>

          <!-- 3. Usta / Mutaxassis -->
          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Usta / Mutaxassis *</label>
            <AppSelect
              :model-value="form.employeeId"
              @update:model-value="form.employeeId = $event"
              :options="employees.map(e => ({ value: e.id, label: `${e.fullName} (${e.position || 'Usta'})` }))"
              placeholder="Ustani tanlang..."
            />
          </div>

          <!-- 4. Zamonaviy O'zbekcha Sana Tanlash -->
          <div class="space-y-2 pt-1 border-t border-slate-200/60 dark:border-slate-800">
            <div class="flex items-center justify-between">
              <label class="font-bold text-slate-700 dark:text-slate-200">Sana *</label>
              <!-- Quick Date Selectors -->
              <div class="flex items-center gap-1">
                <button
                  type="button"
                  @click="setDateShortcut(0)"
                  class="px-2 py-0.5 rounded-lg text-[11px] font-semibold border transition"
                  :class="selectedDateType === 0 ? 'bg-emerald-500 text-slate-950 border-emerald-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'"
                >
                  Bugun
                </button>
                <button
                  type="button"
                  @click="setDateShortcut(1)"
                  class="px-2 py-0.5 rounded-lg text-[11px] font-semibold border transition"
                  :class="selectedDateType === 1 ? 'bg-emerald-500 text-slate-950 border-emerald-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'"
                >
                  Ertaga
                </button>
              </div>
            </div>

            <input
              type="date"
              v-model="selectedDate"
              required
              class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs"
            />
          </div>

          <!-- 5. Zamonaviy Vaqt Slotlari (Time Grid) -->
          <div class="space-y-1.5">
            <label class="block font-bold text-slate-700 dark:text-slate-200">Bandlov Vaqti *</label>
            <div class="grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
              <button
                v-for="time in timeSlots"
                :key="time"
                type="button"
                @click="selectedTime = time"
                class="py-1.5 px-2 rounded-lg text-xs font-semibold font-mono transition text-center border"
                :class="selectedTime === time
                  ? 'bg-emerald-500 text-slate-950 border-emerald-500 font-bold shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500/50'"
              >
                {{ time }}
              </button>
            </div>
          </div>

          <!-- 6. Izoh -->
          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Izoh</label>
            <textarea
              v-model="form.notes"
              rows="2"
              placeholder="Mijoz istaklari yoki qo'shimcha eslatma..."
              class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            ></textarea>
          </div>

          <div class="pt-2">
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
import { ref, watch } from 'vue';
import { X, Calendar } from 'lucide-vue-next';
import AppButton from '../../../components/AppButton.vue';
import AppSelect from '../../../components/AppSelect.vue';
import { useFormat } from '../../../composables/useFormat';

const props = defineProps<{
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

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save'): void;
}>();

const { formatCurrency } = useFormat();

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'
];

const selectedDateType = ref<number>(0);
const selectedDate = ref(new Date().toISOString().split('T')[0]);
const selectedTime = ref('11:00');

const setDateShortcut = (days: number) => {
  selectedDateType.value = days;
  const d = new Date();
  d.setDate(d.getDate() + days);
  selectedDate.value = d.toISOString().split('T')[0];
};

watch(() => props.isOpen, (open) => {
  if (open) {
    if (props.form.scheduledAt) {
      try {
        const dt = new Date(props.form.scheduledAt);
        selectedDate.value = dt.toISOString().split('T')[0];
        const hours = String(dt.getHours()).padStart(2, '0');
        const mins = String(dt.getMinutes()).padStart(2, '0');
        selectedTime.value = `${hours}:${mins}`;
      } catch (e) {
        setDateShortcut(0);
        selectedTime.value = '11:00';
      }
    } else {
      setDateShortcut(0);
      selectedTime.value = '11:00';
    }
  }
});

const handleSubmit = () => {
  // Combine selectedDate + selectedTime into ISO String
  const [hours, mins] = selectedTime.value.split(':');
  const d = new Date(selectedDate.value);
  d.setHours(Number(hours), Number(mins), 0, 0);
  props.form.scheduledAt = d.toISOString();
  emit('save');
};
</script>
