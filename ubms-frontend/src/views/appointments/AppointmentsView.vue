<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Bandlovlar (Appointments)</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Ustalarning ish taqvimi, xizmatlar va mijozlar yozuvi</p>
      </div>

      <div class="flex items-center gap-2">
        <AppButton variant="primary" size="md" :icon="Plus" @click="openCreateModal">
          Yangi Bandlov Qo'shish
        </AppButton>
      </div>
    </div>

    <!-- Top Stat Cards Grid -->
    <AppointmentStatsCards :appointments="appointments" />

    <!-- Appointments Timeline Grid -->
    <AppointmentTimelineGrid
      :loading="loading"
      :appointments="appointments"
      @update-status="updateAppointmentStatus"
    />

    <!-- Create Appointment Modal -->
    <AppointmentFormModal
      :is-open="isBookingModalOpen"
      :form="form"
      :customers="customers"
      :services="services"
      :employees="employees"
      :submitting="submitting"
      @close="isBookingModalOpen = false"
      @save="saveAppointment"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../services/api';
import { Plus } from 'lucide-vue-next';
import AppButton from '../../components/AppButton.vue';
import { useDataStore } from '../../stores/data.store';
import { useToast } from '../../composables/useToast';

import AppointmentStatsCards from './components/AppointmentStatsCards.vue';
import AppointmentTimelineGrid from './components/AppointmentTimelineGrid.vue';
import AppointmentFormModal from './components/AppointmentFormModal.vue';

const toast = useToast();
const dataStore = useDataStore();

const loading = ref(false);
const submitting = ref(false);
const appointments = computed(() => dataStore.appointments);
const customers = ref<any[]>([]);
const services = ref<any[]>([]);
const employees = ref<any[]>([]);

const isBookingModalOpen = ref(false);

const form = ref({
  customerId: '',
  serviceId: '',
  employeeId: '',
  scheduledAt: '',
  notes: '',
});

const loadAppointments = async (force = false) => {
  if (dataStore.appointments.length === 0) {
    loading.value = true;
  }
  try {
    const [appRes, custRes, servRes, empRes] = await Promise.all([
      dataStore.fetchAppointments(force),
      api.get('/customers').catch(() => ({ data: [] })),
      api.get('/appointments/services').catch(() => ({ data: [] })),
      api.get('/employees').catch(() => ({ data: [] })),
    ]);
    customers.value = custRes.data || [];
    services.value = servRes.data || [];
    employees.value = empRes.data || [];
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  form.value = {
    customerId: customers.value[0]?.id || '',
    serviceId: services.value[0]?.id || '',
    employeeId: employees.value[0]?.id || '',
    scheduledAt: now.toISOString().slice(0, 16),
    notes: '',
  };
  isBookingModalOpen.value = true;
};

const saveAppointment = async () => {
  if (!form.value.customerId) {
    toast.warning('Mijozni tanlang', 'Bandlov');
    return;
  }
  if (!form.value.serviceId) {
    toast.warning('Xizmat turini tanlang', 'Bandlov');
    return;
  }
  if (!form.value.scheduledAt) {
    toast.warning('Sana va vaqtni tanlang', 'Bandlov');
    return;
  }

  submitting.value = true;
  try {
    const payload = {
      customerId: form.value.customerId,
      serviceId: form.value.serviceId,
      employeeId: form.value.employeeId || undefined,
      scheduledAt: new Date(form.value.scheduledAt).toISOString(),
      notes: form.value.notes || undefined,
    };
    const { data: created } = await api.post('/appointments', payload);
    // Optimistic: prepend to list immediately
    if (created) {
      dataStore.appointments.unshift(created);
    }
    toast.success('Yangi bandlov muvaffaqiyatli saqlandi!', 'Bandlov');
    isBookingModalOpen.value = false;
    dataStore.invalidate('appointments');
    dataStore.invalidate('dashboard');
    loadAppointments(true); // background refresh
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Bandlovni saqlashda xatolik yuz berdi', 'Xatolik');
  } finally {
    submitting.value = false;
  }
};

const updateAppointmentStatus = async (id: string, status: string) => {
  try {
    await api.put(`/appointments/${id}/status`, { status });
    // Optimistic: update status in store immediately
    const app = dataStore.appointments.find((a: any) => a.id === id);
    if (app) app.status = status;
    toast.success(`Bandlov holati o'zgartirildi!`, 'Bandlov');
    dataStore.invalidate('appointments');
    dataStore.invalidate('dashboard');
    loadAppointments(true); // background refresh
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Holatni yangilashda xatolik', 'Xatolik');
  }
};

onMounted(() => {
  loadAppointments();
});
</script>
