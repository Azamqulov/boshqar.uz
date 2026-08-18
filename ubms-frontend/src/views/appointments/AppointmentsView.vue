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
    <div v-else class="space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="service in services"
          :key="service.id"
          class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/40 transition group relative overflow-hidden"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Scissors class="w-5 h-5" />
            </div>
            <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono flex items-center gap-1">
              <Clock class="w-3 h-3 text-slate-400" />
              <span>{{ service.durationMinutes || 30 }} daqiqa</span>
            </span>
          </div>

          <div class="mt-3.5">
            <h3 class="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-500 transition">
              {{ service.name }}
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {{ service.description || 'Sartaroshlik va go\'zallik xizmati' }}
            </p>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-400">Xizmat narxi:</span>
            <span class="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {{ formatCurrency(service.price) }}
            </span>
          </div>
        </div>
      </div>
    </div>

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
    <div v-if="isServiceModalOpen" class="modal-overlay" @click.self="isServiceModalOpen = false">
      <div class="modal-container max-w-md" @click.stop>
        <div class="modal-header">
          <h3 class="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Scissors class="w-5 h-5 text-emerald-500" />
            <span>Yangi Xizmat Qo'shish</span>
          </h3>
          <button @click="isServiceModalOpen = false" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="saveService" class="modal-body space-y-3.5 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Xizmat nomi *</label>
            <input
              type="text"
              v-model="serviceForm.name"
              required
              placeholder="Masalan: Soch turmaklash (Fade)"
              class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Narxi (UZS) *</label>
              <input
                type="number"
                v-model.number="serviceForm.price"
                required
                min="0"
                step="1000"
                placeholder="50000"
                class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Davomiyligi (daqiqa) *</label>
              <input
                type="number"
                v-model.number="serviceForm.durationMinutes"
                required
                min="5"
                step="5"
                placeholder="30"
                class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div class="pt-2">
            <AppButton type="submit" variant="primary" size="lg" class="w-full" :loading="submitting">
              {{ submitting ? 'Saqlanmoqda...' : 'Xizmatni Saqlash' }}
            </AppButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../../services/api';
import { Plus, Calendar, Scissors, X, Clock } from 'lucide-vue-next';
import AppButton from '../../components/AppButton.vue';
import { useDataStore } from '../../stores/data.store';
import { useToast } from '../../composables/useToast';
import { useFormat } from '../../composables/useFormat';

import AppointmentStatsCards from './components/AppointmentStatsCards.vue';
import AppointmentTimelineGrid from './components/AppointmentTimelineGrid.vue';
import AppointmentFormModal from './components/AppointmentFormModal.vue';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const dataStore = useDataStore();
const { formatCurrency } = useFormat();

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

const loading = ref(false);
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
