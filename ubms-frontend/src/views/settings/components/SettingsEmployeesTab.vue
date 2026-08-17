<template>
  <div class="space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h3 class="text-base font-bold text-slate-900 dark:text-white">Xodimlar Ro'yxati</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400">Har bir xodim faqat o'ziga ruxsat berilgan bo'limlar bilan ishlay oladi</p>
      </div>

      <button
        @click="$emit('openAddModal')"
        class="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition btn-interactive"
      >
        <UserPlus class="w-4 h-4" />
        <span>Yangi Xodim Qo'shish</span>
      </button>
    </div>

    <SkeletonLoader v-if="loading" variant="table" :rows="4" />

    <div v-else class="glass-card rounded-2xl overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase font-semibold">
            <tr>
              <th class="py-3 px-4">Xodim</th>
              <th class="py-3 px-4">Telefon</th>
              <th class="py-3 px-4">Lavozim</th>
              <th class="py-3 px-4">Ruxsat Berilgan Bo'limlar</th>
              <th class="py-3 px-4">Holat</th>
              <th class="py-3 px-4 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
            <tr v-if="employees.length === 0">
              <td colspan="6" class="py-8 text-center text-slate-400 dark:text-slate-500">Xodimlar mavjud emas</td>
            </tr>
            <tr v-for="emp in pagination.paginatedItems.value" :key="emp.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
              <td class="py-3 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <div class="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400 text-xs">
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

      <!-- Pagination -->
      <AppPagination
        v-if="!loading"
        v-model:current-page="pagination.currentPage.value"
        v-model:page-size="pagination.pageSize.value"
        :total-items="employees.length"
        item-name="xodim"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { UserPlus, Edit2, Trash2 } from 'lucide-vue-next';
import SkeletonLoader from '../../../components/SkeletonLoader.vue';
import AppPagination from '../../../components/AppPagination.vue';
import { usePagination } from '../../../composables/usePagination';

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

const pagination = usePagination(() => props.employees);
</script>
