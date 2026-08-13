<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Moliya va Xarajatlar</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Tushumlar, tannarx (COGS) va sof foyda hisoboti</p>
      </div>

      <button
        @click="isExpenseModalOpen = true"
        class="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-500/20 transition btn-interactive"
      >
        <Plus class="w-4 h-4" />
        <span>Xarajat Kiritish</span>
      </button>
    </div>

    <!-- Financial Cards Skeleton -->
    <SkeletonLoader v-if="loading" variant="kpi" />

    <!-- Financial Cards -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="glass-card rounded-2xl p-5">
        <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Jami Tushum (Revenue)</span>
        <h3 class="text-xl font-black text-slate-900 dark:text-white mt-2 font-mono">{{ formatCurrency(summary.totalRevenue) }}</h3>
      </div>

      <div class="glass-card rounded-2xl p-5">
        <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Sotilgan Mahsulot Tannarxi (COGS)</span>
        <h3 class="text-xl font-black text-amber-600 dark:text-amber-400 mt-2 font-mono">{{ formatCurrency(summary.cogs) }}</h3>
      </div>

      <div class="glass-card rounded-2xl p-5">
        <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Operatsion Xarajatlar</span>
        <h3 class="text-xl font-black text-rose-600 dark:text-rose-400 mt-2 font-mono">{{ formatCurrency(summary.totalExpenses) }}</h3>
      </div>

      <div class="glass-card rounded-2xl p-5">
        <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Sof Foyda (Net Profit)</span>
        <h3 class="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-2 font-mono">{{ formatCurrency(summary.netProfit) }}</h3>
      </div>
    </div>

    <!-- Expenses Table -->
    <SkeletonLoader v-if="loading" variant="table" :rows="6" />

    <div v-else class="glass-card rounded-2xl overflow-hidden">
      <div class="p-4 border-b border-slate-200 dark:border-slate-800">
        <h3 class="font-bold text-sm text-slate-900 dark:text-white">Xarajatlar Jurnali</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-semibold">
            <tr>
              <th class="py-3 px-4">Sana</th>
              <th class="py-3 px-4">Kategoriya</th>
              <th class="py-3 px-4">Tavsif / Izoh</th>
              <th class="py-3 px-4 text-right">Summa</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
            <tr v-if="expenses.length === 0">
              <td colspan="4" class="py-8 text-center text-slate-400 dark:text-slate-500">Xarajatlar mavjud emas</td>
            </tr>
            <tr v-for="exp in expenses" :key="exp.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
              <td class="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono">{{ formatDate(exp.recordedAt) }}</td>
              <td class="py-3 px-4 font-bold uppercase text-rose-600 dark:text-rose-400">{{ exp.category }}</td>
              <td class="py-3 px-4">{{ exp.description || '-' }}</td>
              <td class="py-3 px-4 text-right font-black text-slate-900 dark:text-white font-mono">{{ formatCurrency(exp.amount) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Expense Modal -->
    <div v-if="isExpenseModalOpen" @click.self="isExpenseModalOpen = false" class="modal-overlay">
      <div class="modal-container max-w-md" @click.stop>
        <div class="modal-header">
          <h3 class="text-base font-bold text-slate-900 dark:text-white">Yangi Xarajat Kiritish</h3>
          <button @click="isExpenseModalOpen = false" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"><X class="w-5 h-5" /></button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="createExpense" class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Xarajat Kategoriyasi</label>
              <AppSelect
                v-model="expenseForm.category"
                :options="[
                  { value: 'salary', label: 'Xodimlar maoshi' },
                  { value: 'rent', label: 'Ijara to\'lovi' },
                  { value: 'utilities', label: 'Kommunal to\'lovlar' },
                  { value: 'advertising', label: 'Reklama va marketing' },
                  { value: 'transport', label: 'Transport / Yetkazib berish' },
                  { value: 'other', label: 'Boshqa xarajatlar' }
                ]"
              />
            </div>

            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Summa (so'm) *</label>
              <input type="number" required v-model.number="expenseForm.amount" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20" />
            </div>

            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Izoh / Tafsilot</label>
              <textarea v-model="expenseForm.description" rows="2" placeholder="Xarajat haqida izoh..." class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"></textarea>
            </div>

            <button
              type="submit"
              :disabled="submitting"
              class="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-lg shadow-rose-500/25 transition mt-4 btn-interactive"
            >
              {{ submitting ? 'Saqlanmoqda...' : 'Xarajatni Saqlash' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../services/api';
import { useFormat } from '../../composables/useFormat';
import { Plus, X } from 'lucide-vue-next';
import SkeletonLoader from '../../components/SkeletonLoader.vue';
import AppSelect from '../../components/AppSelect.vue';
import { useToast } from '../../composables/useToast';

const toast = useToast();
const { formatCurrency, formatDate } = useFormat();

const loading = ref(false);
const submitting = ref(false);

const summary = ref({
  totalRevenue: 0,
  totalExpenses: 0,
  cogs: 0,
  netProfit: 0,
});
const expenses = ref<any[]>([]);
const isExpenseModalOpen = ref(false);

const expenseForm = ref({
  category: 'rent',
  amount: 0,
  description: '',
});

const loadFinance = async () => {
  loading.value = true;
  try {
    const [sumRes, expRes] = await Promise.all([
      api.get('/finance/summary'),
      api.get('/finance/expenses'),
    ]);
    summary.value = sumRes.data;
    expenses.value = expRes.data || [];
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const createExpense = async () => {
  if (!expenseForm.value.amount || Number(expenseForm.value.amount) <= 0) {
    toast.warning('Xarajat summasini to\'g\'ri kiriting', 'Moliya');
    return;
  }

  submitting.value = true;
  try {
    await api.post('/finance/expenses', {
      ...expenseForm.value,
      amount: Number(expenseForm.value.amount),
    });
    toast.success('Yangi xarajat muvaffaqiyatli saqlandi!', 'Moliya');
    isExpenseModalOpen.value = false;
    expenseForm.value = { category: 'rent', amount: 0, description: '' };
    await loadFinance();
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Xarajatni saqlashda xatolik yuz berdi', 'Xatolik');
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  loadFinance();
});
</script>
