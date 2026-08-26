<template>
  <div class="space-y-4">
    <!-- Header with Action -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>Xodimlar Ro'yxati</span>
          <span v-if="!loading" class="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            {{ filteredEmployees.length }} ta
          </span>
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400">Har bir xodim faqat o'ziga ruxsat berilgan bo'limlar bilan ishlay oladi</p>
      </div>

      <button
        @click="$emit('openAddModal')"
        class="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition btn-interactive"
      >
        <UserPlus class="w-4 h-4" />
        <span>Yangi Xodim Qo'shish</span>
      </button>
    </div>

    <!-- Search & Filter Controls -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <div class="flex flex-1 flex-wrap sm:flex-nowrap items-center gap-2.5">
        <!-- Search Input -->
        <div class="relative flex-1 min-w-[200px] max-w-md">
          <AppInput
            v-model="searchQuery"
            placeholder="Ism, telefon yoki lavozim bo'yicha qidiruv..."
            :icon="Search"
            :clearable="true"
          />
        </div>

        <!-- Status Filter Select -->
        <div class="w-40">
          <AppSelect
            v-model="statusFilter"
            :options="statusOptions"
          />
        </div>

        <!-- Position Filter Select -->
        <div class="w-48" v-if="positionOptions.length > 1">
          <AppSelect
            v-model="positionFilter"
            :options="positionOptions"
          />
        </div>

        <!-- Clear Filters Button -->
        <button
          v-if="searchQuery || statusFilter || positionFilter"
          type="button"
          @click="resetFilters"
          class="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs font-semibold flex items-center gap-1 shrink-0"
          title="Filtrlarni tozalash"
        >
          <X class="w-4 h-4" />
          <span class="hidden md:inline">Tozalash</span>
        </button>
      </div>

      <!-- View Mode Switcher -->
      <AppViewToggle v-model="viewMode" />
    </div>

    <SkeletonLoader v-if="loading" variant="table" :rows="4" />

    <template v-else>
      <!-- Table View -->
      <div v-if="viewMode === 'table'" class="glass-card rounded-2xl overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase font-semibold">
              <tr>
                <th class="py-3 px-4">Xodim</th>
                <th class="py-3 px-4">Telefon</th>
                <th class="py-3 px-4">Lavozim</th>
                <th class="py-3 px-4">Lock PIN</th>
                <th class="py-3 px-4">Ruxsat Berilgan Bo'limlar</th>
                <th class="py-3 px-4">Holat</th>
                <th class="py-3 px-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
              <tr v-if="!loading && filteredEmployees.length === 0">
                <td colspan="7" class="py-6 px-4">
                  <AppEmptyState
                    variant="employees"
                    title="Xodimlar topilmadi"
                    description="Xodimlar ro'yxatiga yangi xodim qo'shing yoki qidiruv filtrlarini tozalang"
                    button-text="Yangi Xodim Qo'shish"
                    @action="$emit('openAddModal')"
                  />
                </td>
              </tr>
              <tr v-for="emp in pagination.paginatedItems.value" :key="emp.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                <td class="py-3 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <div class="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400 text-xs shrink-0">
                    {{ emp.fullName.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <span>{{ emp.fullName }}</span>
                    <span v-if="emp.isOwner" class="ml-1.5 text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold uppercase">Egasi</span>
                  </div>
                </td>
                <td class="py-3 px-4 font-mono text-slate-500 dark:text-slate-400">{{ emp.phone }}</td>
                <td class="py-3 px-4">
                  <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {{ emp.position || 'Xodim' }}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <div class="flex items-center space-x-1">
                    <input
                      type="text"
                      maxlength="6"
                      inputmode="numeric"
                      :value="getEmployeePin(emp.id || emp.phone)"
                      @input="setEmployeePin(emp.id || emp.phone, ($event.target as HTMLInputElement).value)"
                      placeholder="----"
                      class="w-16 px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-center font-bold text-xs text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </td>

                <td class="py-3 px-4">
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="mod in (emp.allowedModules || ['pos', 'products'])"
                      :key="mod"
                      class="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold"
                    >
                      {{ getModuleLabel(mod) }}
                    </span>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <span
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    :class="emp.status === 'active' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'"
                  >
                    {{ emp.status === 'active' ? 'Faol' : 'Nofaol' }}
                  </span>
                </td>
                <td class="py-3 px-4 text-right space-x-1">
                  <button
                    v-if="!emp.isOwner"
                    @click="$emit('edit', emp)"
                    class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
                    title="Tahrirlash"
                  >
                    <Edit2 class="w-3.5 h-3.5" />
                  </button>
                  <button
                    v-if="!emp.isOwner"
                    @click="$emit('delete', emp)"
                    class="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition"
                    title="O'chirish"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Grid / Cards View -->
      <div v-else>
        <AppEmptyState
          v-if="!loading && filteredEmployees.length === 0"
          variant="employees"
          title="Xodimlar topilmadi"
          description="Xodimlar ro'yxatiga yangi xodim qo'shing yoki qidiruv filtrlarini tozalang"
          button-text="Yangi Xodim Qo'shish"
          @action="$emit('openAddModal')"
        />

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="emp in pagination.paginatedItems.value"
            :key="emp.id"
            class="glass-card rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:shadow-md transition"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-black text-emerald-600 dark:text-emerald-400 text-sm shrink-0">
                  {{ emp.fullName.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <h4 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{{ emp.fullName }}</span>
                    <span v-if="emp.isOwner" class="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold uppercase">Egasi</span>
                  </h4>
                  <p class="text-xs text-slate-500 dark:text-slate-400 font-mono">{{ emp.phone }}</p>
                </div>
              </div>

              <span
                class="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0"
                :class="emp.status === 'active' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'"
              >
                {{ emp.status === 'active' ? 'Faol' : 'Nofaol' }}
              </span>
            </div>

            <div>
              <div class="text-[11px] text-slate-400 mb-1 font-semibold">Lavozim & Ruxsatlar:</div>
              <div class="flex flex-wrap gap-1">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {{ emp.position || 'Xodim' }}
                </span>
                <span
                  v-for="mod in (emp.allowedModules || ['pos', 'products'])"
                  :key="mod"
                  class="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold"
                >
                  {{ getModuleLabel(mod) }}
                </span>
              </div>
            </div>

            <div class="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-1.5">
              <button
                v-if="!emp.isOwner"
                @click="$emit('edit', emp)"
                class="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 transition"
              >
                <Edit2 class="w-3.5 h-3.5" />
                <span>Tahrirlash</span>
              </button>
              <button
                v-if="!emp.isOwner"
                @click="$emit('delete', emp)"
                class="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs transition"
                title="O'chirish"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Unified Clean Pagination Bar -->
      <AppPagination
        v-if="!loading && filteredEmployees.length > 0"
        v-model:current-page="pagination.currentPage.value"
        v-model:page-size="pagination.pageSize.value"
        :total-items="filteredEmployees.length"
        item-name="xodim"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  UserPlus,
  Edit2,
  Trash2,
  Search,
  X,
  Users,
  CheckCircle2,
  XCircle,
  Filter,
  Briefcase,
} from 'lucide-vue-next';
import SkeletonLoader from '../../../components/SkeletonLoader.vue';
import AppEmptyState from '../../../components/AppEmptyState.vue';
import AppPagination from '../../../components/AppPagination.vue';
import AppInput from '../../../components/AppInput.vue';
import AppSelect from '../../../components/AppSelect.vue';
import AppViewToggle from '../../../components/AppViewToggle.vue';
import { usePagination } from '../../../composables/usePagination';
import { usePersistentViewMode } from '../../../composables/usePersistentViewMode';
import { useScreenLock } from '../../../composables/useScreenLock';

const { getEmployeePin, setEmployeePin } = useScreenLock();


const props = defineProps<{
  employees: any[];
  loading: boolean;
  getModuleLabel: (id: string) => string;
}>();

defineEmits<{
  (e: 'openAddModal'): void;
  (e: 'edit', emp: any): void;
  (e: 'delete', emp: any): void;
}>();

const searchQuery = ref('');
const statusFilter = ref('');
const positionFilter = ref('');
const viewMode = usePersistentViewMode('settings_employees', 'table');

const statusOptions = [
  { value: '', label: 'Barcha holatlar', icon: Filter },
  { value: 'active', label: 'Faol', icon: CheckCircle2, color: '#10b981' },
  { value: 'inactive', label: 'Nofaol', icon: XCircle, color: '#ef4444' },
];

// Distinct positions extracted from employee list
const positionOptions = computed(() => {
  const positions = new Set<string>();
  (props.employees || []).forEach((e) => {
    if (e.position && e.position.trim()) {
      positions.add(e.position.trim());
    }
  });
  return [
    { value: '', label: 'Barcha lavozimlar', icon: Briefcase },
    ...Array.from(positions).map((p) => ({ value: p, label: p, icon: Users })),
  ];
});

const filteredEmployees = computed(() => {
  let list = props.employees || [];

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(
      (e) =>
        e.fullName?.toLowerCase().includes(q) ||
        e.phone?.toLowerCase().includes(q) ||
        e.position?.toLowerCase().includes(q)
    );
  }

  if (statusFilter.value) {
    list = list.filter((e) => e.status === statusFilter.value);
  }

  if (positionFilter.value) {
    list = list.filter((e) => e.position === positionFilter.value);
  }

  return list;
});

const resetFilters = () => {
  searchQuery.value = '';
  statusFilter.value = '';
  positionFilter.value = '';
};

const pagination = usePagination(() => filteredEmployees.value);
</script>
