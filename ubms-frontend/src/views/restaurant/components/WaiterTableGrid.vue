<template>
  <div class="flex-1 flex flex-col space-y-4 overflow-hidden">
    <!-- Filter Tabs & Search Bar -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
      <div class="flex items-center space-x-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold overflow-x-auto scrollbar-none">
        <button
          @click="$emit('update:statusFilter', 'all')"
          class="px-3 py-1.5 rounded-lg transition whitespace-nowrap"
          :class="statusFilter === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
        >
          Barchasi ({{ tables.length }})
        </button>
        <button
          @click="$emit('update:statusFilter', 'available')"
          class="px-3 py-1.5 rounded-lg transition flex items-center gap-1 whitespace-nowrap"
          :class="statusFilter === 'available' ? 'bg-emerald-500 text-white shadow-xs font-bold' : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'"
        >
          <span>🟢 Bo'sh ({{ freeTablesCount }})</span>
        </button>
        <button
          @click="$emit('update:statusFilter', 'occupied')"
          class="px-3 py-1.5 rounded-lg transition flex items-center gap-1 whitespace-nowrap"
          :class="statusFilter === 'occupied' ? 'bg-rose-500 text-white shadow-xs font-bold' : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'"
        >
          <span>🔴 Band ({{ occupiedTablesCount }})</span>
        </button>
      </div>

      <div class="w-full sm:w-72">
        <AppInput
          :model-value="tableSearch"
          @update:model-value="$emit('update:tableSearch', $event)"
          placeholder="Stol nomi bo'yicha qidirish..."
          :icon="Search"
        />
      </div>
    </div>

    <!-- Tables Grid -->
    <div class="flex-1 overflow-y-auto pr-1">
      <SkeletonLoader v-if="loading" variant="grid" :count="10" />

      <div v-else-if="filteredTables.length === 0" class="h-full min-h-[200px] flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-xs text-center space-y-3">
        <UtensilsCrossed class="w-12 h-12 stroke-1 text-slate-300 dark:text-slate-600" />
        <p class="font-bold text-sm text-slate-600 dark:text-slate-400">Hech qanday stol topilmadi</p>
        <p class="text-xs text-slate-400 max-w-sm">Yangi stol qo'shish uchun "Yangi Stol Qo'shish" tugmasini bosing</p>
        <button
          @click="$emit('openCreateTable')"
          class="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>Yangi Stol Qo'shish</span>
        </button>
      </div>

      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div
          v-for="table in filteredTables"
          :key="table.id"
          @click="$emit('selectTable', table)"
          class="p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden min-h-[170px] btn-interactive"
          :class="[
            table.status === 'occupied'
              ? 'bg-rose-500/5 dark:bg-rose-950/20 border-rose-500/40 hover:border-rose-500 shadow-sm'
              : table.status === 'cleaning'
              ? 'bg-blue-500/5 dark:bg-blue-950/20 border-blue-500/40 hover:border-blue-500'
              : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 shadow-sm'
          ]"
        >
          <!-- Top table header -->
          <div class="flex items-start justify-between gap-1">
            <div>
              <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Sig'im: {{ table.capacity }} kishi</span>
              <h3 class="text-base font-black text-slate-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition mt-0.5">{{ table.name }}</h3>
            </div>

            <!-- Status Badge & Action Menu -->
            <div class="flex items-center gap-1">
              <span
                class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                :class="[
                  table.status === 'occupied'
                    ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30'
                    : table.status === 'cleaning'
                    ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30'
                    : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                ]"
              >
                {{ table.status === 'occupied' ? 'Band' : table.status === 'cleaning' ? 'Tozalanmoqda' : 'Bo\'sh' }}
              </span>

              <!-- Fast Actions (Edit / Delete) -->
              <button
                type="button"
                @click.stop="$emit('editTable', table)"
                class="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Tahrirlash"
              >
                <Edit2 class="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                @click.stop="$emit('deleteTable', table)"
                class="p-1 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                title="O'chirish"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Active Order Info -->
          <div v-if="table.orders?.[0]" class="my-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-1">
            <div class="flex items-center justify-between text-[11px]">
              <span class="text-slate-500 dark:text-slate-400 font-mono">{{ table.orders[0].orderNumber }}</span>
              <span class="font-bold text-amber-600 dark:text-amber-400 font-mono">{{ formatCurrency(table.orders[0].total) }}</span>
            </div>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 truncate">Ofitsiant: {{ table.orders[0].waiter?.fullName || 'Ofitsiant' }}</p>
          </div>

          <div v-else class="text-center py-2 text-slate-400 dark:text-slate-600 text-xs">
            Buyurtma yo'q
          </div>

          <!-- Bottom Action prompt -->
          <div class="pt-2 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition">
            <span>{{ table.status === 'occupied' ? 'Buyurtmani ko\'rish' : 'Buyurtma olish' }}</span>
            <ArrowRight class="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search, Plus, UtensilsCrossed, Edit2, Trash2, ArrowRight } from 'lucide-vue-next';
import SkeletonLoader from '../../../components/SkeletonLoader.vue';
import AppInput from '../../../components/AppInput.vue';
import { useFormat } from '../../../composables/useFormat';

defineProps<{
  statusFilter: string;
  tableSearch: string;
  tables: any[];
  freeTablesCount: number;
  occupiedTablesCount: number;
  filteredTables: any[];
  loading: boolean;
}>();

defineEmits<{
  (e: 'update:statusFilter', val: string): void;
  (e: 'update:tableSearch', val: string): void;
  (e: 'selectTable', table: any): void;
  (e: 'openCreateTable'): void;
  (e: 'editTable', table: any): void;
  (e: 'deleteTable', table: any): void;
}>();

const { formatCurrency } = useFormat();
</script>
