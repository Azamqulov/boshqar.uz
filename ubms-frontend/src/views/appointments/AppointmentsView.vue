<template>
  <div class="space-y-6">
    <!-- Header with Tabs -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {{ activeTab === 'calendar' ? 'Bandlovlar (Appointments)' : 'Xizmatlar Narxnomasi' }}
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {{ activeTab === 'calendar' ? 'Ustalarning ish taqvimi, soatlar va mijozlar yozuvi' : 'Salon xizmatlari ro\'yxati, narxlari va davomiylik vaqti' }}
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2">
        <div class="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
          <button
            @click="switchTab('calendar')"
            class="px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
            :class="activeTab === 'calendar' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
          >
            <Calendar class="w-4 h-4" />
            <span>Bandlovlar</span>
          </button>
          <button
            @click="switchTab('services')"
            class="px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
            :class="activeTab === 'services' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
          >
            <Scissors class="w-4 h-4" />
            <span>Xizmatlar ({{ services.length }})</span>
          </button>
        </div>

        <AppButton
          v-if="activeTab === 'calendar'"
          variant="primary"
          size="md"
          :icon="Plus"
          @click="openCreateModal"
        >
          Yangi Bandlov
        </AppButton>
        <AppButton
          v-else
          variant="primary"
          size="md"
          :icon="Plus"
          @click="openServiceModal"
        >
          Yangi Xizmat
        </AppButton>
      </div>
    </div>

    <!-- TAB 1: BANDLOVLAR TAQVIMI -->
    <div v-if="activeTab === 'calendar'" class="space-y-6">
      <!-- Top Stat Cards Grid -->
      <AppointmentStatsCards :appointments="appointments" />

      <!-- Appointments Timeline Grid -->
      <AppointmentTimelineGrid
        :loading="loading"
        :appointments="appointments"
        @update-status="updateAppointmentStatus"
      />
    </div>

    <!-- TAB 2: XIZMATLAR NARXNOMASI & RO'YXATI -->
    <AppointmentServicesTab
      v-else
      :services="services"
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

    <!-- Create Service Modal -->
    <AppointmentServiceModal
      :is-open="isServiceModalOpen"
      :service-form="serviceForm"
      :submitting="submitting"
      @close="isServiceModalOpen = false"
      @save="saveService"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../../services/api';
import { Plus, Calendar, Scissors } from 'lucide-vue-next';
import AppButton from '../../components/AppButton.vue';
import { useDataStore } from '../../stores/data.store';
import { useToast } from '../../composables/useToast';

import AppointmentStatsCards from './components/AppointmentStatsCards.vue';
import AppointmentTimelineGrid from './components/AppointmentTimelineGrid.vue';
import AppointmentServicesTab from './components/AppointmentServicesTab.vue';
import AppointmentFormModal from './components/AppointmentFormModal.vue';
import AppointmentServiceModal from './components/AppointmentServiceModal.vue';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const dataStore = useDataStore();

const activeTab = ref<'calendar' | 'services'>('calendar');

const checkRouteTab = () => {
  if (route.path.includes('/services') || route.query.tab === 'services') {
    activeTab.value = 'services';
  } else {
    activeTab.value = 'calendar';
  }
};

const switchTab = (tab: 'calendar' | 'services') => {
  activeTab.value = tab;
  router.push(tab === 'services' ? '/appointments/services' : '/appointments');
};

watch(() => route.path, () => {
  checkRouteTab();
});

const loading = ref(dataStore.appointments.length === 0);
const submitting = ref(false);
const appointments = computed(() => dataStore.appointments);
const customers = ref<any[]>([]);
const services = ref<any[]>([]);
const employees = ref<any[]>([]);

const isBookingModalOpen = ref(false);
const isServiceModalOpen = ref(false);

const form = ref({
  customerId: '',
  serviceId: '',
  employeeId: '',
  scheduledAt: '',
  notes: '',
});

const serviceForm = ref({
  name: '',
  price: 50000,
  durationMinutes: 30,
});

const loadAppointments = async (force = false) => {
  if (dataStore.appointments.length === 0) {
    loading.value = true;
  }
  try {
    const [appRes, custRes, servRes, empRes] = await Promise.all([
      dataStore.fetchAppointments(force),
      dataStore.fetchCustomers(force).catch(() => []),
      api.get('/appointments/services').catch(() => ({ data: [] })),
      api.get('/employees').catch(() => ({ data: [] })),
    ]);
    customers.value = Array.isArray(custRes) ? custRes : (dataStore.customers || []);
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

const openServiceModal = () => {
  serviceForm.value = {
    name: '',
    price: 50000,
    durationMinutes: 30,
  };
  isServiceModalOpen.value = true;
};

const saveService = async () => {
  if (!serviceForm.value.name.trim()) {
    toast.warning('Xizmat nomini kiriting', 'Xizmatlar');
    return;
  }
  submitting.value = true;
  try {
    const { data: created } = await api.post('/appointments/services', serviceForm.value);
    if (created) {
      services.value.unshift(created);
    }
    toast.success('Yangi xizmat muvaffaqiyatli qo\'shildi!', 'Xizmatlar');
    isServiceModalOpen.value = false;
    loadAppointments(true);
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Xizmatni saqlashda xatolik', 'Xatolik');
  } finally {
    submitting.value = false;
  }
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
    if (created) {
      dataStore.appointments.unshift(created);
    }
    toast.success('Yangi bandlov muvaffaqiyatli saqlandi!', 'Bandlov');
    isBookingModalOpen.value = false;
    dataStore.invalidate('appointments');
    dataStore.invalidate('dashboard');
    loadAppointments(true);
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Bandlovni saqlashda xatolik', 'Xatolik');
  } finally {
    submitting.value = false;
  }
};

const updateAppointmentStatus = async (id: string, status: string) => {
  try {
    await api.put(`/appointments/${id}/status`, { status });
    const app = dataStore.appointments.find((a: any) => a.id === id);
    if (app) app.status = status;
    toast.success(`Bandlov holati o'zgartirildi!`, 'Bandlov');
    dataStore.invalidate('appointments');
    dataStore.invalidate('dashboard');
    loadAppointments(true);
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Holatni yangilashda xatolik', 'Xatolik');
  }
};

onMounted(() => {
  checkRouteTab();
  loadAppointments();
});
</script>
