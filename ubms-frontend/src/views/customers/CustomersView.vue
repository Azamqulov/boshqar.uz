<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Mijozlar Bazasi (CRM)</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Mijozlar tarixi, xaridlar statistikasi va qarz daftari</p>
      </div>

      <button
        @click="isCreateModalOpen = true"
        class="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition btn-interactive"
      >
        <Plus class="w-4 h-4" />
        <span>Yangi Mijoz Qo'shish</span>
      </button>
    </div>

    <!-- Search Input -->
    <div class="relative max-w-md">
      <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Mijoz ismi yoki telefon raqami bo'yicha qidiruv..."
        class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
      />
    </div>

    <!-- Customer Table Skeleton -->
    <SkeletonLoader v-if="loading" variant="table" :rows="6" />

    <!-- Customer Table -->
    <div v-else class="glass-card rounded-2xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-semibold">
            <tr>
              <th class="py-3 px-4">F.I.SH</th>
              <th class="py-3 px-4">Telefon</th>
              <th class="py-3 px-4">Xaridlar Soni</th>
              <th class="py-3 px-4">Jami Xarid Summasi</th>
              <th class="py-3 px-4">Nasiya / Qarz</th>
              <th class="py-3 px-4 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
            <tr v-if="filteredCustomers.length === 0">
              <td colspan="6" class="py-8 text-center text-slate-400 dark:text-slate-500">Mijozlar topilmadi</td>
            </tr>
            <tr v-for="c in filteredCustomers" :key="c.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
              <td class="py-3 px-4 font-bold text-slate-900 dark:text-white">{{ c.fullName }}</td>
              <td class="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono">{{ c.phone || '-' }}</td>
              <td class="py-3 px-4 font-mono">{{ c.totalPurchases }} ta</td>
              <td class="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400 font-mono">{{ formatCurrency(c.totalSpent) }}</td>
              <td class="py-3 px-4 font-mono">
                <span
                  class="font-black px-2 py-0.5 rounded text-[11px]"
                  :class="Number(c.debt) > 0 ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'"
                >
                  {{ formatCurrency(c.debt) }}
                </span>
              </td>
              <td class="py-3 px-4 text-right space-x-2">
                <button
                  v-if="Number(c.debt) > 0"
                  @click="openPayDebtModal(c)"
                  class="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] transition btn-interactive"
                >
                  Qarzni Yopish
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create Modal -->
    <div v-if="isCreateModalOpen" @click.self="isCreateModalOpen = false" class="modal-overlay">
      <div class="modal-container max-w-md" @click.stop>
        <div class="modal-header">
          <h3 class="text-base font-bold text-slate-900 dark:text-white">Yangi Mijoz Qo'shish</h3>
          <button @click="isCreateModalOpen = false" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"><X class="w-5 h-5" /></button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="createCustomer" class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Mijoz Ism Familiyasi *</label>
              <input v-model="form.fullName" required placeholder="Masalan: Jamshid Aliyev" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Telefon Raqami</label>
              <PhoneInput v-model="form.phone" placeholder="90 123 45 67" />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Izoh / Eslatma</label>
              <textarea v-model="form.notes" rows="2" placeholder="Mijoz haqida qo'shimcha ma'lumot..." class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"></textarea>
            </div>
            <button
              type="submit"
              :disabled="submitting"
              class="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition mt-4 btn-interactive"
            >
              {{ submitting ? 'Saqlanmoqda...' : 'Saqlash' }}
            </button>
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
import { Plus, X, Search } from 'lucide-vue-next';
import SkeletonLoader from '../../components/SkeletonLoader.vue';
import { useDataStore } from '../../stores/data.store';
import { useToast } from '../../composables/useToast';
import { cleanUzbekPhone, formatUzbekPhone } from '../../composables/usePhoneMask';
import PhoneInput from '../../components/PhoneInput.vue';

const toast = useToast();
const dataStore = useDataStore();
const { formatCurrency } = useFormat();

const loading = ref(false);
const submitting = ref(false);
const searchQuery = ref('');
const customers = computed(() => dataStore.customers);
const isCreateModalOpen = ref(false);

const form = ref({
  fullName: '',
  phone: '+998 ',
  notes: '',
});

const filteredCustomers = computed(() => {
  if (!searchQuery.value) return customers.value;
  const q = searchQuery.value.toLowerCase();
  return customers.value.filter((c) => {
    return c.fullName.toLowerCase().includes(q) || (c.phone && c.phone.includes(q));
  });
});

const loadCustomers = async (force = false) => {
  if (dataStore.customers.length === 0) {
    loading.value = true;
  }
  try {
    await dataStore.fetchCustomers(force);
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const createCustomer = async () => {
  if (!form.value.fullName.trim()) {
    toast.warning('Mijoz ismini kiriting', 'Mijoz');
    return;
  }
  submitting.value = true;
  try {
    const cleanPhone = form.value.phone ? cleanUzbekPhone(form.value.phone) : undefined;
    await api.post('/customers', {
      ...form.value,
      fullName: form.value.fullName.trim(),
      phone: cleanPhone,
    });
    toast.success(`"${form.value.fullName}" mijozlar bazasiga qo'shildi!`, 'CRM');
    isCreateModalOpen.value = false;
    form.value = { fullName: '', phone: '+998 ', notes: '' };
    dataStore.invalidate('customers');
    dataStore.invalidate('dashboard');
    await loadCustomers(true);
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Mijozni saqlashda xatolik yuz berdi', 'Xatolik');
  } finally {
    submitting.value = false;
  }
};

const openPayDebtModal = async (customer: any) => {
  const amountStr = prompt(`"${customer.fullName}" mijozining qarzini yopish uchun summani kiriting (Qarz: ${customer.debt}):`);
  if (amountStr) {
    const amount = Number(amountStr);
    if (amount > 0) {
      try {
        await api.post(`/customers/${customer.id}/pay-debt`, { amount });
        toast.success(`Qarzdan ${amount} so'm muvaffaqiyatli to'landi!`, 'Qarz Daftari');
        dataStore.invalidate('customers');
        dataStore.invalidate('dashboard');
        await loadCustomers(true);
      } catch (err: any) {
        toast.error(err.response?.data?.message || err.message || 'Qarz to\'lovini kiritishda xatolik yuz berdi', 'Xatolik');
      }
    }
  }
};

onMounted(() => {
  loadCustomers();
});
</script>
