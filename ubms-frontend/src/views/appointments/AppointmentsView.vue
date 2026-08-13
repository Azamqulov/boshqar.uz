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
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <AppStatCard
        title="Jami Bandlovlar"
        :value="`${appointments.length} ta`"
        subtitle="Jami yozilgan bandlovlar"
        :icon="Calendar"
        variant="blue"
      />

      <AppStatCard
        title="Kutilayotganlar"
        :value="`${appointments.filter((a: any) => a.status === 'pending' || a.status === 'confirmed').length} ta`"
        subtitle="Kelishi kutilayotganlar"
        :icon="Clock"
        variant="amber"
      />

      <AppStatCard
        title="Bajarilganlar"
        :value="`${appointments.filter((a: any) => a.status === 'completed').length} ta`"
        subtitle="Muvaffaqiyatli yakunlangan"
        :icon="CheckCircle2"
        variant="emerald"
      />

      <AppStatCard
        title="Bekor Qilinganlar"
        :value="`${appointments.filter((a: any) => a.status === 'cancelled').length} ta`"
        subtitle="Bekor qilingan yozuvlar"
        :icon="XCircle"
        variant="rose"
      />
    </div>

    <!-- Appointments Timeline List with Skeleton Loader -->
    <SkeletonLoader v-if="loading" variant="grid" :count="6" />

    <div v-else class="glass-card rounded-2xl p-5 space-y-4">
      <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <h3 class="font-bold text-sm text-slate-900 dark:text-white">Barcha Bandlovlar Ro'yxati</h3>
        <span class="text-xs text-slate-500 dark:text-slate-400 font-mono">{{ appointments.length }} ta yozuv</span>
      </div>

      <div v-if="appointments.length === 0" class="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
        Hozircha bandlovlar mavjud emas. Yangi bandlov qo'shish tugmasini bosing.
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
        <div
          v-for="app in appointments"
          :key="app.id"
          class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md transition"
        >
          <div>
            <div class="flex justify-between items-start">
              <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1">
                <Clock class="w-3.5 h-3.5" />
                <span>{{ formatDate(app.scheduledAt) }}</span>
              </span>
              <span
                class="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full"
                :class="[
                  app.status === 'completed' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' :
                  app.status === 'confirmed' ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30' :
                  app.status === 'cancelled' ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30' :
                  'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                ]"
              >
                {{ app.status }}
              </span>
            </div>
            <h4 class="text-sm font-bold text-slate-900 dark:text-white mt-2">{{ app.customer?.fullName || app.customerName || 'Mijoz' }}</h4>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ app.service?.name }} ({{ app.service?.durationMinutes || 30 }} daq)</p>
          </div>

          <div class="pt-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span class="text-xs font-black text-slate-900 dark:text-white font-mono">{{ formatCurrency(app.service?.price || 0) }}</span>
            <span class="text-[11px] text-slate-500 dark:text-slate-400">Usta: <strong class="text-slate-700 dark:text-slate-300">{{ app.employee?.fullName || 'Belgilanmagan' }}</strong></span>
          </div>

          <!-- Quick status update buttons -->
          <div v-if="app.status !== 'completed' && app.status !== 'cancelled'" class="flex items-center gap-1.5 pt-1">
            <AppButton
              variant="success"
              size="sm"
              :icon="Check"
              class="flex-1"
              @click="updateAppointmentStatus(app.id, 'completed')"
            >
              Bajarildi
            </AppButton>
            <AppButton
              variant="danger"
              size="sm"
              @click="updateAppointmentStatus(app.id, 'cancelled')"
            >
              Bekor qilish
            </AppButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Appointment Modal -->
    <div v-if="isBookingModalOpen" @click.self="isBookingModalOpen = false" class="modal-overlay">
      <div class="modal-container max-w-md" @click.stop>
        <div class="modal-header">
          <h3 class="text-base font-bold text-slate-900 dark:text-white">Yangi Bandlov Qo'shish</h3>
          <button @click="isBookingModalOpen = false" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"><X class="w-5 h-5" /></button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="saveAppointment" class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Mijoz *</label>
              <AppSelect
                v-model="form.customerId"
                :options="customers.map(c => ({ value: c.id, label: `${c.fullName} (${c.phone || 'Tel yoq'})` }))"
                :searchable="true"
                placeholder="Mijozni tanlang..."
              />
            </div>

            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Xizmat Turi *</label>
              <AppSelect
                v-model="form.serviceId"
                :options="services.map(s => ({ value: s.id, label: `${s.name} - ${formatCurrency(s.price)}` }))"
                :searchable="true"
                placeholder="Xizmatni tanlang..."
              />
            </div>

            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Usta / Mutaxassis</label>
              <AppSelect
                v-model="form.employeeId"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../services/api';
import { useFormat } from '../../composables/useFormat';
import { Plus, Clock, Check, X, Calendar, CheckCircle2, XCircle } from 'lucide-vue-next';
import AppButton from '../../components/AppButton.vue';
import SkeletonLoader from '../../components/SkeletonLoader.vue';
import AppSelect from '../../components/AppSelect.vue';
import AppStatCard from '../../components/AppStatCard.vue';
import { useDataStore } from '../../stores/data.store';
import { useToast } from '../../composables/useToast';

const toast = useToast();
const dataStore = useDataStore();
const { formatCurrency, formatDate } = useFormat();

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
