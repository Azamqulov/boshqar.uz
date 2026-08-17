<template>
  <div class="space-y-4">
    <div class="glass-card rounded-2xl overflow-hidden p-4 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <History class="w-4 h-4 text-emerald-500" />
            <span>Kassa Smenalari va Z-Hisobotlar Tarixi</span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Har bir smena bo'yicha naqd savdo, kassa xatlovi, kamomad va ortiqcha mablag'lar jurnali
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="$emit('refresh')"
            class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition"
          >
            <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
            <span>Yangilash</span>
          </button>
        </div>
      </div>

      <SkeletonLoader v-if="loading" variant="table" :rows="5" />

      <div v-else-if="shifts.length === 0" class="p-12 text-center text-slate-400 text-xs">
        <History class="w-10 h-10 mx-auto mb-2 opacity-30" />
        <span>Hozircha smenalar ochilmagan</span>
      </div>

      <!-- 8.1 TABLE VIEW -->
      <div v-else-if="viewMode === 'table'" class="overflow-x-auto scrollbar-none">
        <table class="w-full text-left text-xs table-auto">
          <thead class="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[10px] font-bold">
            <tr>
              <th class="py-2.5 px-3">Smena</th>
              <th class="py-2.5 px-3">Kassir</th>
              <th class="py-2.5 px-3">Ochilgan / Yopilgan</th>
              <th class="py-2.5 px-3">Boshlang'ich</th>
              <th class="py-2.5 px-3">Naqd Savdo</th>
              <th class="py-2.5 px-3">Sanalgan</th>
              <th class="py-2.5 px-3">Tafovut</th>
              <th class="py-2.5 px-2 text-center">Holati</th>
              <th class="py-2.5 px-3 text-right">Z-Report</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200/80 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200 text-xs">
            <tr v-for="shift in pagination.paginatedItems.value" :key="shift.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
              <td class="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                #{{ shift.shiftNumber || (shift.id?.startsWith('shift-') ? shift.id.substring(6, 12) : shift.id?.substring(0, 6)) }}
              </td>
              <td class="py-2.5 px-3 font-semibold whitespace-nowrap">
                {{ shift.user?.fullName || shift.user?.name || cashierDefaultName }}
              </td>
              <td class="py-2.5 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                <div>{{ formatDateTime(shift.openedAt) }}</div>
                <div v-if="shift.closedAt" class="text-slate-400">➔ {{ formatDateTime(shift.closedAt) }}</div>
              </td>
              <td class="py-2.5 px-3 font-mono whitespace-nowrap">
                {{ formatCurrency(shift.startingCash) }}
              </td>
              <td class="py-2.5 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                +{{ formatCurrency(shift.cashSales) }}
              </td>
              <td class="py-2.5 px-3 font-mono whitespace-nowrap">
                {{ shift.actualCash !== null ? formatCurrency(shift.actualCash) : 'Kutilmoqda...' }}
              </td>
              <td class="py-2.5 px-3 font-mono font-bold whitespace-nowrap">
                <span
                  v-if="shift.difference !== null"
                  class="px-2 py-0.5 rounded-md text-[11px]"
                  :class="Number(shift.difference) === 0 ? 'bg-emerald-500/10 text-emerald-600' : (Number(shift.difference) < 0 ? 'bg-rose-500/10 text-rose-600' : 'bg-blue-500/10 text-blue-600')"
                >
                  {{ Number(shift.difference) >= 0 ? '+' : '' }}{{ formatCurrency(shift.difference) }}
                </span>
                <span v-else class="text-slate-400">-</span>
              </td>
              <td class="py-2.5 px-2 text-center whitespace-nowrap">
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase"
                  :class="shift.status === 'open' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'"
                >
                  {{ shift.status === 'open' ? '🟢 Ochiq' : '🔒 Yopilgan' }}
                </span>
              </td>
              <td class="py-2.5 px-3 text-right whitespace-nowrap">
                <div class="flex items-center justify-end gap-1">
                  <button
                    @click="$emit('viewReport', shift)"
                    class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/40 text-slate-600 hover:text-emerald-600 dark:text-slate-300 transition inline-flex items-center gap-1 text-xs font-bold"
                    title="Z-Hisobotni ko'rish"
                  >
                    <Receipt class="w-3.5 h-3.5" />
                    <span>Hisobot</span>
                  </button>
                  <button
                    @click="$emit('deleteShift', shift)"
                    class="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    title="Smenani o'chirish"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 8.2 CARD / GRID VIEW -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="shift in pagination.paginatedItems.value"
          :key="shift.id"
          class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 hover:border-emerald-500/50 transition"
        >
          <div class="flex items-center justify-between">
            <span class="font-bold font-mono text-slate-900 dark:text-white text-sm">
              #{{ shift.shiftNumber || (shift.id?.startsWith('shift-') ? shift.id.substring(6, 12) : shift.id?.substring(0, 6)) }}
            </span>
            <span
              class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border"
              :class="shift.status === 'open' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'"
            >
              {{ shift.status === 'open' ? 'Ochiq' : 'Yopilgan' }}
            </span>
          </div>

          <div class="text-xs space-y-1">
            <div class="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span>Kassir:</span>
              <span class="font-bold text-slate-800 dark:text-slate-200">{{ shift.user?.fullName || shift.user?.name || cashierDefaultName }}</span>
            </div>
            <div class="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span>Ochilgan:</span>
              <span class="font-mono">{{ formatDateTime(shift.openedAt) }}</span>
            </div>
            <div v-if="shift.closedAt" class="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span>Yopilgan:</span>
              <span class="font-mono">{{ formatDateTime(shift.closedAt) }}</span>
            </div>
          </div>

          <div class="pt-2 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
            <div class="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span class="text-[10px] text-slate-400 block">Naqd Savdo</span>
              <span class="font-bold font-mono text-emerald-600 dark:text-emerald-400">+{{ formatCurrency(shift.cashSales) }}</span>
            </div>
            <div class="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span class="text-[10px] text-slate-400 block">Kassa Farqi</span>
              <span
                class="font-bold font-mono"
                :class="Number(shift.difference) < 0 ? 'text-rose-600' : 'text-emerald-600'"
              >
                {{ shift.difference !== null ? ((Number(shift.difference) >= 0 ? '+' : '') + formatCurrency(shift.difference)) : '-' }}
              </span>
            </div>
          </div>

          <div class="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              @click="$emit('deleteShift', shift)"
              class="px-2.5 py-1 rounded-lg text-rose-500 hover:bg-rose-500/10 text-xs font-bold transition flex items-center gap-1"
            >
              <Trash2 class="w-3.5 h-3.5" />
              <span>O'chirish</span>
            </button>
            <button
              @click="$emit('viewReport', shift)"
              class="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 transition btn-interactive"
            >
              <Receipt class="w-3.5 h-3.5" />
              <span>Z-Hisobot</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <AppPagination
        v-if="!loading"
        v-model:current-page="pagination.currentPage.value"
        v-model:page-size="pagination.pageSize.value"
        :total-items="shifts.length"
        item-name="smena"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { History, RefreshCw, Receipt, Trash2 } from 'lucide-vue-next';
import SkeletonLoader from '../../../components/SkeletonLoader.vue';
import AppPagination from '../../../components/AppPagination.vue';
import { useFormat } from '../../../composables/useFormat';
import { usePagination } from '../../../composables/usePagination';

const props = defineProps<{
  shifts: any[];
  loading: boolean;
  viewMode: 'table' | 'grid';
  cashierDefaultName?: string;
}>();

defineEmits<{
  (e: 'refresh'): void;
  (e: 'viewReport', shift: any): void;
  (e: 'deleteShift', shift: any): void;
}>();

const { formatCurrency, formatDateTime } = useFormat();

const pagination = usePagination(() => props.shifts);
</script>
