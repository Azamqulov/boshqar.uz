<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Mijozlar Bazasi (CRM)</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Mijozlar tarixi, xaridlar statistikasi va qarz daftari</p>
      </div>

      <AppButton
        variant="primary"
        size="md"
        :icon="Plus"
        @click="isCreateModalOpen = true"
      >
        Yangi Mijoz Qo'shish
      </AppButton>
    </div>

    <!-- Search Input -->
    <div class="max-w-md">
      <AppInput
        v-model="searchQuery"
        placeholder="Mijoz ismi yoki telefon raqami bo'yicha qidiruv..."
        :icon="Search"
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
              <td class="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono">{{ c.phone ? formatUzbekPhone(c.phone) : '-' }}</td>
              <td class="py-3 px-4 font-mono">{{ c.totalPurchases || 0 }} ta</td>
              <td class="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400 font-mono">{{ formatCurrency(c.totalSpent || 0) }}</td>
              <td class="py-3 px-4 font-mono">
                <span
                  class="font-black px-2 py-0.5 rounded text-[11px]"
                  :class="Number(c.debt) > 0 ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'"
                >
                  {{ formatCurrency(c.debt || 0) }}
                </span>
              </td>
              <td class="py-3 px-4 text-right space-x-2">
                <button
                  v-if="Number(c.debt) > 0"
                  @click="openPayDebtModal(c)"
                  class="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-bold text-xs transition btn-interactive border border-emerald-500/30"
                >
                  Qarzni Yopish
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create Customer Modal -->
    <div v-if="isCreateModalOpen" @click.self="isCreateModalOpen = false" class="modal-overlay">
      <div class="modal-container max-w-md" @click.stop>
        <div class="modal-header">
          <h3 class="text-base font-bold text-slate-900 dark:text-white">Yangi Mijoz Qo'shish</h3>
          <button @click="isCreateModalOpen = false" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"><X class="w-5 h-5" /></button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="createCustomer" class="space-y-3.5 text-xs">
            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Mijoz Ism Familiyasi *</label>
              <input v-model="form.fullName" required placeholder="Masalan: Jamshid Aliyev" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
            </div>
            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Telefon Raqami</label>
              <PhoneInput v-model="form.phone" placeholder="90 123 45 67" />
            </div>
            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Izoh / Eslatma</label>
              <textarea v-model="form.notes" rows="2" placeholder="Mijoz haqida qo'shimcha ma'lumot..." class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"></textarea>
            </div>
            <div class="pt-2">
              <AppButton
                type="submit"
                variant="primary"
                size="md"
                class="w-full"
                :loading="submitting"
              >
                {{ submitting ? 'Saqlanmoqda...' : 'Saqlash' }}
              </AppButton>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Pay Debt Modal (Clean Glassmorphism Modal with CurrencyInput) -->
    <div v-if="isPayDebtModalOpen" @click.self="isPayDebtModalOpen = false" class="modal-overlay">
      <div class="modal-container max-w-md" @click.stop>
        <div class="modal-header">
          <div class="flex items-center gap-2">
            <div class="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20">
              <CreditCard class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white">Qarz To'lovini Qabul Qilish</h3>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">Nasiya daftari bo'yicha to'lov kiritish</p>
            </div>
          </div>
          <button @click="isPayDebtModalOpen = false" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"><X class="w-5 h-5" /></button>
        </div>

        <div class="modal-body space-y-4">
          <!-- Customer info card -->
          <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span class="text-xs text-slate-500 dark:text-slate-400 block">Mijoz:</span>
              <span class="font-bold text-sm text-slate-900 dark:text-white">{{ activeCustomer?.fullName }}</span>
            </div>
            <div class="text-right">
              <span class="text-xs text-slate-500 dark:text-slate-400 block">Mavjud qarz:</span>
              <span class="font-black text-sm text-rose-600 dark:text-rose-400 font-mono">{{ formatCurrency(activeCustomer?.debt || 0) }}</span>
            </div>
          </div>

          <!-- Payment Amount with CurrencyInput -->
          <div>
            <label class="block font-bold text-xs text-slate-700 dark:text-slate-300 mb-1.5">To'lanayotgan Summa *</label>
            <CurrencyInput
              v-model="debtPayAmount"
              placeholder="0"
              suffix="so'm"
            />
          </div>

          <!-- Quick Fill Buttons -->
          <div class="space-y-1.5">
            <span class="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Tezkor to'lov variantlari:</span>
            <div class="flex flex-wrap gap-1.5">
              <button
                type="button"
                @click="debtPayAmount = Number(activeCustomer?.debt || 0)"
                class="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20 transition"
              >
                To'liq qarz ({{ formatCurrency(activeCustomer?.debt || 0) }})
              </button>
              <button
                v-if="Number(activeCustomer?.debt) > 50000"
                type="button"
                @click="debtPayAmount = 50000"
                class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
              >
                50 000 so'm
              </button>
              <button
                v-if="Number(activeCustomer?.debt) > 100000"
                type="button"
                @click="debtPayAmount = 100000"
                class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
              >
                100 000 so'm
              </button>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <AppButton
              variant="ghost"
              size="md"
              @click="isPayDebtModalOpen = false"
            >
              Bekor qilish
            </AppButton>
            <AppButton
              variant="primary"
              size="md"
              :loading="submitting"
              :disabled="debtPayAmount <= 0"
              @click="submitPayDebt"
            >
              To'lovni Qabul Qilish
            </AppButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../services/api';
import { useFormat } from '../../composables/useFormat';
import { Plus, X, Search, CreditCard } from 'lucide-vue-next';
import SkeletonLoader from '../../components/SkeletonLoader.vue';
import AppButton from '../../components/AppButton.vue';
import AppInput from '../../components/AppInput.vue';
import CurrencyInput from '../../components/CurrencyInput.vue';
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
const isPayDebtModalOpen = ref(false);
const activeCustomer = ref<any | null>(null);
const debtPayAmount = ref<number>(0);

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
    const { data: created } = await api.post('/customers', {
      ...form.value,
      fullName: form.value.fullName.trim(),
      phone: cleanPhone,
    });
    // Optimistic: add to top of list immediately
    if (created) {
      dataStore.customers.unshift({ ...created, totalPurchases: 0, totalSpent: 0, debt: 0 });
    }
    toast.success(`"${form.value.fullName}" mijozlar bazasiga qo'shildi!`, 'CRM');
    isCreateModalOpen.value = false;
    form.value = { fullName: '', phone: '+998 ', notes: '' };
    dataStore.invalidate('customers');
    dataStore.invalidate('dashboard');
    loadCustomers(true); // background refresh
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Mijozni saqlashda xatolik yuz berdi', 'Xatolik');
  } finally {
    submitting.value = false;
  }
};

const openPayDebtModal = (customer: any) => {
  activeCustomer.value = customer;
  debtPayAmount.value = Number(customer.debt) || 0;
  isPayDebtModalOpen.value = true;
};

const submitPayDebt = async () => {
  if (!activeCustomer.value) return;
  if (!debtPayAmount.value || debtPayAmount.value <= 0) {
    toast.warning('To\'lov summasini to\'g\'ri kiriting', 'Qarz To\'lovi');
    return;
  }

  submitting.value = true;
  try {
    await api.post(`/customers/${activeCustomer.value.id}/pay-debt`, {
      amount: Number(debtPayAmount.value),
    });
    // Optimistic: reduce debt immediately in the list
    const idx = dataStore.customers.findIndex((c: any) => c.id === activeCustomer.value?.id);
    if (idx !== -1) {
      const newDebt = Math.max(0, Number(dataStore.customers[idx].debt) - debtPayAmount.value);
      dataStore.customers[idx] = { ...dataStore.customers[idx], debt: newDebt };
    }
    toast.success(
      `"${activeCustomer.value.fullName}" uchun ${formatCurrency(debtPayAmount.value)} qarz to'lovi qabul qilindi!`,
      'Qarz Daftari'
    );
    isPayDebtModalOpen.value = false;
    dataStore.invalidate('customers');
    dataStore.invalidate('dashboard');
    loadCustomers(true); // background refresh
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Qarz to\'lovini kiritishda xatolik yuz berdi', 'Xatolik');
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  loadCustomers();
});
</script>
