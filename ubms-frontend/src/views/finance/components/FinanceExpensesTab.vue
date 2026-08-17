<template>
  <div class="space-y-4">
    <div class="glass-card rounded-2xl overflow-hidden p-4 space-y-4">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingDown class="w-4 h-4 text-rose-500" />
            <span>Xarajatlar Jurnali</span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">Biznes bo'yicha kiritilgan barcha operatsion xarajatlar</p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <!-- Category Filter -->
          <div class="w-44">
            <AppSelect v-model="expenseCategoryFilter" :options="[
              { value: '', label: 'Barcha kategoriyalar' },
              { value: 'salary', label: 'Xodimlar maoshi' },
              { value: 'rent', label: 'Ijara to\'lovi' },
              { value: 'utilities', label: 'Kommunal to\'lovlar' },
              { value: 'advertising', label: 'Reklama va marketing' },
              { value: 'transport', label: 'Transport / Yetkazib berish' },
              { value: 'other', label: 'Boshqa xarajatlar' }
            ]" />
          </div>

          <AppButton variant="danger" size="sm" :icon="Plus" @click="$emit('openExpenseModal')">
            Qo'shish
          </AppButton>
        </div>
      </div>

      <!-- 3.1 TABLE VIEW -->
      <div v-if="viewMode === 'table'" class="overflow-x-auto max-w-full w-full">
        <table class="w-full text-left text-xs border-collapse min-w-[550px]">
          <thead class="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-semibold whitespace-nowrap">
            <tr>
              <th class="py-3 px-4">Sana</th>
              <th class="py-3 px-4">Kategoriya</th>
              <th class="py-3 px-4">Tavsif / Izoh</th>
              <th class="py-3 px-4 text-right">Summa</th>
              <th class="py-3 px-4 text-center">Harakat</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200 text-xs">
            <tr v-if="filteredExpenses.length === 0">
              <td colspan="5" class="py-12 text-center text-slate-400 dark:text-slate-500">
                <TrendingDown class="w-8 h-8 mx-auto mb-2 opacity-30" />
                <span>Xarajatlar mavjud emas</span>
              </td>
            </tr>
            <tr v-for="exp in pagination.paginatedItems.value" :key="exp.id"
              class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
              <td class="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono whitespace-nowrap">{{ formatDate(exp.recordedAt) }}</td>
              <td class="py-3.5 px-4 font-bold uppercase text-rose-600 dark:text-rose-400 whitespace-nowrap">
                <span class="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/10 border border-rose-500/20 whitespace-nowrap">
                  {{ getCategoryLabel(exp.category) }}
                </span>
              </td>
              <td class="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap max-w-xs truncate">{{ exp.description || '-' }}</td>
              <td class="py-3.5 px-4 text-right font-black text-rose-600 dark:text-rose-400 font-mono whitespace-nowrap">
                -{{ formatCurrency(exp.amount) }}
              </td>
              <td class="py-3.5 px-4 text-center whitespace-nowrap">
                <button
                  @click="$emit('deleteExpense', exp)"
                  class="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                  title="Xarajatni o'chirish"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 3.2 CARD / GRID VIEW -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="exp in pagination.paginatedItems.value"
          :key="exp.id"
          class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 hover:border-rose-500/50 transition"
        >
          <div class="flex items-center justify-between">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              {{ getCategoryLabel(exp.category) }}
            </span>
            <span class="text-[10px] text-slate-400 font-mono">
              {{ formatDate(exp.recordedAt) }}
            </span>
          </div>

          <p class="text-xs text-slate-700 dark:text-slate-300 font-medium line-clamp-2">
            {{ exp.description || 'Izoh ko\'rsatilmadi' }}
          </p>

          <div class="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              @click="$emit('deleteExpense', exp)"
              class="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold transition flex items-center gap-1"
            >
              <Trash2 class="w-3.5 h-3.5" />
              <span>O'chirish</span>
            </button>
            <span class="font-black text-rose-600 dark:text-rose-400 font-mono text-base">
              -{{ formatCurrency(exp.amount) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <AppPagination
        v-model:current-page="pagination.currentPage.value"
        v-model:page-size="pagination.pageSize.value"
        :total-items="filteredExpenses.length"
        item-name="xarajat"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { TrendingDown, Plus, Trash2 } from 'lucide-vue-next';
import AppButton from '../../../components/AppButton.vue';
import AppSelect from '../../../components/AppSelect.vue';
import AppPagination from '../../../components/AppPagination.vue';
import { useFormat } from '../../../composables/useFormat';
import { usePagination } from '../../../composables/usePagination';

const props = defineProps<{
  expenses: any[];
  viewMode: 'table' | 'grid';
}>();

defineEmits<{
  (e: 'openExpenseModal'): void;
  (e: 'deleteExpense', expense: any): void;
}>();

const { formatCurrency, formatDate } = useFormat();

const expenseCategoryFilter = ref('');

const getCategoryLabel = (category: string) => {
  const map: Record<string, string> = {
    purchase: 'Mahsulot xaridi / Kirim',
    salary: 'Xodimlar maoshi',
    rent: 'Ijara to\'lovi',
    utilities: 'Kommunal to\'lovlar',
    advertising: 'Reklama & Marketing',
    transport: 'Transport / Yetkazib berish',
    repairs: 'Ta\'mirlash va uskunalar',
    tax: 'Soliqlar va to\'lovlar',
    other: 'Boshqa xarajatlar',
  };
  return map[category] || category;
};

const filteredExpenses = computed(() => {
  let list = props.expenses || [];
  if (expenseCategoryFilter.value) {
    list = list.filter((e: any) => e.category === expenseCategoryFilter.value);
  }
  return list;
});

const pagination = usePagination(filteredExpenses);

watch(expenseCategoryFilter, () => {
  pagination.resetPage();
});
</script>
