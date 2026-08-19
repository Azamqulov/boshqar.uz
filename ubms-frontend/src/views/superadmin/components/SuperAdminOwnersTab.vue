<template>
  <div class="space-y-4">
    <!-- Search & Filters -->
    <div class="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
      <div class="flex flex-col sm:flex-row gap-3 flex-1">
        <div class="flex-1">
          <AppInput
            :model-value="search"
            @update:model-value="handleSearchInput"
            placeholder="Owner ismi, telefon yoki biznes nomi bo'yicha qidiruv..."
            :icon="Search"
          />
        </div>

        <div class="w-full sm:w-48">
          <AppSelect
            :model-value="planFilter"
            @update:model-value="$emit('update:planFilter', $event)"
            @change="$emit('filterChanged')"
            :options="[
              { value: '', label: 'Barcha tariflar' },
              { value: 'Free', label: 'Free (Bepul)' },
              { value: 'Pro', label: 'Pro' },
              { value: 'Business', label: 'Business' }
            ]"
          />
        </div>

        <div class="w-full sm:w-48">
          <AppSelect
            :model-value="statusFilter"
            @update:model-value="$emit('update:statusFilter', $event)"
            @change="$emit('filterChanged')"
            :options="[
              { value: '', label: 'Barcha statuslar' },
              { value: 'active', label: 'Faol' },
              { value: 'blocked', label: 'Bloklangan' }
            ]"
          />
        </div>
      </div>

      <AppViewToggle :model-value="viewMode" @update:model-value="$emit('update:viewMode', $event)" />
    </div>

    <!-- Owners Table View -->
    <SkeletonLoader v-if="loading" variant="table" :rows="6" />

    <div v-else-if="viewMode === 'table'" class="glass-card rounded-2xl overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase font-semibold">
            <tr>
              <th class="py-3.5 px-4">Firma Egasi (Klient)</th>
              <th class="py-3.5 px-4">Tegishli Biznes(lar)</th>
              <th class="py-3.5 px-4 text-center">Filial / Tovar / Xodim</th>
              <th class="py-3.5 px-4">Jami Savdo (GMV / LTV)</th>
              <th class="py-3.5 px-4">Akkaunt Holati</th>
              <th class="py-3.5 px-4 text-right">Mijoz Monitoringi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
            <tr v-if="owners.length === 0">
              <td colspan="6" class="py-8 text-center text-slate-400 dark:text-slate-500">Firma egalari topilmadi</td>
            </tr>
            <tr v-for="o in pagination.paginatedItems.value" :key="o.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
              <!-- Owner Info -->
              <td class="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-xs shrink-0">
                  {{ o.fullName.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <span class="block">{{ o.fullName }}</span>
                  <span class="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <Phone class="w-2.5 h-2.5" />
                    {{ o.phone }}
                  </span>
                </div>
              </td>

              <!-- Owned Businesses -->
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-1.5">
                  <Building2 class="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span class="font-bold text-slate-900 dark:text-white">{{ o.business?.name || 'Biriktirilmagan' }}</span>
                  <span v-if="o.business?.businessType" class="px-1.5 py-0.2 rounded uppercase text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {{ o.business.businessType }}
                  </span>
                </div>
              </td>

              <!-- Resources Scale -->
              <td class="py-3.5 px-4 text-center">
                <span class="font-mono text-slate-600 dark:text-slate-300 font-bold">
                  {{ o.business?.productsCount || 0 }} ta tovar · {{ o.business?.employeesCount || 0 }} xodim
                </span>
              </td>

              <!-- Total Platform Sales -->
              <td class="py-3.5 px-4 font-mono font-black text-emerald-600 dark:text-emerald-400">
                {{ formatCurrency(o.business?.lifetimeGMV || 0) }}
              </td>

              <!-- Account Status -->
              <td class="py-3.5 px-4">
                <span
                  class="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                  :class="o.status === 'active' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'"
                >
                  {{ o.status === 'active' ? 'Faol' : 'Bloklangan' }}
                </span>
              </td>

              <!-- Action: Open Detail Monitoring -->
              <td class="py-3.5 px-4 text-right">
                <button
                  @click="$emit('openDetailModal', o.id)"
                  class="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs transition inline-flex items-center gap-1.5 btn-interactive"
                  title="Firma egasi to'liq statistikasi va dinamikasi"
                >
                  <Eye class="w-3.5 h-3.5" />
                  <span>Monitoring</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Owners Grid View -->
    <div v-else-if="viewMode === 'grid'">
      <SkeletonLoader v-if="loading" variant="cards" :count="6" />
      <div v-else-if="owners.length === 0" class="glass-card rounded-2xl p-8 text-center text-slate-400">
        Firma egalari topilmadi
      </div>
      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
      <div
        v-for="o in pagination.paginatedItems.value"
        :key="o.id"
        class="glass-card rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90"
      >
        <div class="space-y-3">
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-sm">
                {{ o.fullName.charAt(0).toUpperCase() }}
              </div>
              <div>
                <h4 class="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{{ o.fullName }}</h4>
                <span class="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <Phone class="w-3 h-3" />
                  {{ o.phone }}
                </span>
              </div>
            </div>

            <span
              class="px-2 py-0.5 rounded-full text-[10px] font-bold"
              :class="o.status === 'active' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'"
            >
              {{ o.status === 'active' ? 'Faol' : 'Blok' }}
            </span>
          </div>

          <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800/60 space-y-1.5 text-xs">
            <div class="flex items-center justify-between">
              <span class="text-slate-400 flex items-center gap-1">
                <Building2 class="w-3.5 h-3.5" />
                Biznes:
              </span>
              <span class="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">{{ o.business?.name || '-' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-400 flex items-center gap-1">
                <Crown class="w-3.5 h-3.5" />
                Tarif:
              </span>
              <span class="px-1.5 py-0.2 rounded font-bold text-[10px]" :class="getPlanBadgeClass(o.business?.plan || 'Free')">
                {{ o.business?.plan || 'Free' }}
              </span>
            </div>
            <div class="flex items-center justify-between border-t border-slate-200/60 dark:border-slate-700/60 pt-1">
              <span class="text-slate-400">Jami Savdo:</span>
              <span class="font-bold font-mono text-emerald-600 dark:text-emerald-400">{{ formatCurrency(o.business?.lifetimeGMV || 0) }}</span>
            </div>
          </div>

          <div class="pt-2">
            <button
              @click="$emit('openDetailModal', o.id)"
              class="w-full py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-bold text-xs transition btn-interactive flex items-center justify-center gap-1.5"
            >
              <Eye class="w-3.5 h-3.5" />
              <span>Statistika & Monitoring</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

    <!-- Pagination -->
    <AppPagination
      v-if="!loading"
      v-model:current-page="pagination.currentPage.value"
      v-model:page-size="pagination.pageSize.value"
      :total-items="owners.length"
      item-name="firma egasi"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Search, Eye, Crown, Phone, Building2 } from 'lucide-vue-next';
import SkeletonLoader from '../../../components/SkeletonLoader.vue';
import AppInput from '../../../components/AppInput.vue';
import AppSelect from '../../../components/AppSelect.vue';
import AppViewToggle from '../../../components/AppViewToggle.vue';
import AppPagination from '../../../components/AppPagination.vue';
import { useFormat } from '../../../composables/useFormat';
import { usePagination } from '../../../composables/usePagination';

const props = defineProps<{
  owners: any[];
  search: string;
  planFilter: string;
  statusFilter: string;
  viewMode: 'table' | 'grid';
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:search', val: string): void;
  (e: 'update:planFilter', val: string): void;
  (e: 'update:statusFilter', val: string): void;
  (e: 'update:viewMode', val: 'table' | 'grid'): void;
  (e: 'filterChanged'): void;
  (e: 'openDetailModal', ownerId: string): void;
}>();

const { formatCurrency } = useFormat();
const pagination = usePagination(() => props.owners);

let debounceTimer: any = null;
const handleSearchInput = (val: string) => {
  emit('update:search', val);
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    emit('filterChanged');
  }, 250);
};

const getPlanBadgeClass = (plan: string) => {
  switch (plan?.toLowerCase()) {
    case 'business':
      return 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30';
    case 'pro':
      return 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30';
    default:
      return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
  }
};
</script>
