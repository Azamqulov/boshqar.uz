<template>
  <div class="space-y-4">
    <!-- Search & Filters -->
    <div class="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
      <div class="flex flex-col sm:flex-row gap-3 flex-1">
        <div class="flex-1">
          <AppInput
            :model-value="search"
            @update:model-value="$emit('update:search', $event)"
            placeholder="Biznes nomi, egasi yoki telefon raqami bo'yicha qidiruv..."
            :icon="Search"
          />
        </div>
        <div class="w-full sm:w-56">
          <AppSelect
            :model-value="statusFilter"
            @update:model-value="$emit('update:statusFilter', $event)"
            :options="[
              { value: '', label: 'Barcha statuslar' },
              { value: 'active', label: 'Faol' },
              { value: 'suspended', label: 'To\'xtatilgan' },
              { value: 'cancelled', label: 'Bekor qilingan' }
            ]"
          />
        </div>
      </div>

      <AppViewToggle :model-value="viewMode" @update:model-value="$emit('update:viewMode', $event)" />
    </div>

    <!-- Businesses Table View -->
    <div v-if="viewMode === 'table'" class="glass-card rounded-2xl overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase font-semibold">
            <tr>
              <th class="py-3 px-4">Biznes Nomi</th>
              <th class="py-3 px-4">Faoliyat Turi</th>
              <th class="py-3 px-4">Egasi (Aloqa)</th>
              <th class="py-3 px-4 text-center">Filial / Tovar / Chek</th>
              <th class="py-3 px-4">Tarif</th>
              <th class="py-3 px-4">Holati</th>
              <th class="py-3 px-4 text-right">Boshqaruv</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
            <tr v-if="filteredBusinesses.length === 0">
              <td colspan="7" class="py-8 text-center text-slate-400 dark:text-slate-500">Hech qanday biznes topilmadi</td>
            </tr>
            <tr v-for="b in pagination.paginatedItems.value" :key="b.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
              <td class="py-3 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400">
                  {{ b.name.charAt(0) }}
                </div>
                <div>
                  <span>{{ b.name }}</span>
                  <p class="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{{ formatDate(b.createdAt) }}</p>
                </div>
              </td>
              <td class="py-3 px-4">
                <span class="px-2 py-0.5 rounded uppercase text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {{ b.businessType }}
                </span>
              </td>
              <td class="py-3 px-4">
                <p class="font-medium text-slate-900 dark:text-slate-200">{{ b.owner?.fullName }}</p>
                <p class="text-slate-500 dark:text-slate-400 font-mono text-[11px]">{{ b.owner?.phone }}</p>
              </td>
              <td class="py-3 px-4 text-center font-mono">
                <span class="text-emerald-600 dark:text-emerald-400 font-bold">{{ b.branchesCount }}</span> filial ·
                <span class="text-blue-600 dark:text-blue-400 font-bold">{{ b.productsCount }}</span> tovar ·
                <span class="text-teal-600 dark:text-teal-400 font-bold">{{ b.ordersCount }}</span> chek
              </td>
              <td class="py-3.5 px-4">
                <div class="space-y-1">
                  <span class="px-2 py-0.5 rounded font-bold text-[10px] inline-block" :class="getPlanBadgeClass(b.plan)">
                    {{ b.plan }}
                  </span>
                  <div v-if="b.plan !== 'Free' && b.subscription" class="text-[10px] font-mono">
                    <span v-if="b.subscription.isExpired || b.subscription.daysLeft === 0" class="text-rose-500 font-black flex items-center gap-1">
                      <AlertTriangle class="w-3 h-3" />
                      <span>Muddati tugagan</span>
                    </span>
                    <span v-else-if="b.subscription.daysLeft !== null" class="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Clock class="w-3 h-3 text-slate-400" />
                      <span>{{ b.subscription.daysLeft }} kun qoldi</span>
                    </span>
                  </div>
                  <span v-else-if="b.plan === 'Free'" class="text-[10px] text-slate-400 block font-mono">Cheksiz (Start)</span>
                </div>
              </td>
              <td class="py-3.5 px-4">
                <span
                  class="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                  :class="b.status === 'active' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'"
                >
                  {{ b.status === 'active' ? 'Faol' : 'To\'xtatilgan' }}
                </span>
              </td>
              <td class="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                <button
                  @click="$emit('openPlanModal', b)"
                  class="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-xs transition inline-flex items-center gap-1 btn-interactive"
                  title="Tarif va muddatni sozlash"
                >
                  <Zap class="w-3.5 h-3.5" />
                  <span>Tarif & Muddat</span>
                </button>
                <button
                  @click="$emit('toggleStatus', b)"
                  class="p-1.5 rounded-xl transition inline-flex items-center"
                  :class="b.status === 'active' ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400' : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'"
                  :title="b.status === 'active' ? 'To\'xtatish' : 'Faollashtirish'"
                >
                  <Ban v-if="b.status === 'active'" class="w-3.5 h-3.5" />
                  <CheckCircle v-else class="w-3.5 h-3.5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Businesses Grid / Card View -->
    <div v-else-if="viewMode === 'grid'">
      <div v-if="filteredBusinesses.length === 0" class="glass-card rounded-2xl p-12 text-center text-slate-400 dark:text-slate-500">
        <Building2 class="w-10 h-10 mx-auto mb-2 opacity-30 text-emerald-500" />
        <span>Hech qanday biznes topilmadi</span>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div
          v-for="b in pagination.paginatedItems.value"
          :key="b.id"
          class="glass-card rounded-2xl p-5 flex flex-col justify-between hover:shadow-lg transition-all duration-300 border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 group"
        >
          <div class="space-y-3.5">
            <!-- Header with avatar & name -->
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-black text-sm shadow-sm group-hover:scale-105 transition-transform">
                  {{ b.name.charAt(0) }}
                </div>
                <div>
                  <h3 class="font-bold text-slate-900 dark:text-white text-sm leading-tight">{{ b.name }}</h3>
                  <p class="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                    <Calendar class="w-3 h-3 text-slate-400" />
                    <span>{{ formatDate(b.createdAt) }}</span>
                  </p>
                </div>
              </div>

              <span
                class="px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0"
                :class="b.status === 'active' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25' : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25'"
              >
                {{ b.status === 'active' ? 'Faol' : 'Blok' }}
              </span>
            </div>

            <!-- Stats & Owner details -->
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800/60 space-y-2">
              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-500 dark:text-slate-400 font-medium">Egasi:</span>
                <span class="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[130px]">{{ b.owner?.fullName }}</span>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-500 dark:text-slate-400 font-medium">Sohasi:</span>
                <span class="px-2 py-0.5 rounded uppercase text-[10px] font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {{ b.businessType }}
                </span>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-500 dark:text-slate-400 font-medium">Tarif rejasi:</span>
                <span class="px-2 py-0.5 rounded font-bold text-[10px]" :class="getPlanBadgeClass(b.plan)">
                  {{ b.plan }}
                </span>
              </div>
            </div>

            <!-- Quick Counter pill -->
            <div class="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 text-center font-mono text-xs">
              <div>
                <span class="text-[10px] text-slate-400 block">Filial</span>
                <span class="font-bold text-emerald-600 dark:text-emerald-400">{{ b.branchesCount }}</span>
              </div>
              <div class="border-x border-slate-200 dark:border-slate-700">
                <span class="text-[10px] text-slate-400 block">Tovar</span>
                <span class="font-bold text-blue-600 dark:text-blue-400">{{ b.productsCount }}</span>
              </div>
              <div>
                <span class="text-[10px] text-slate-400 block">Chek</span>
                <span class="font-bold text-teal-600 dark:text-teal-400">{{ b.ordersCount }}</span>
              </div>
            </div>
          </div>

          <!-- Card Actions -->
          <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
            <button
              @click="$emit('openPlanModal', b)"
              class="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition flex items-center justify-center gap-1.5 btn-interactive"
            >
              <Zap class="w-3.5 h-3.5 text-amber-500" />
              <span>Tarif</span>
            </button>
            <button
              @click="$emit('toggleStatus', b)"
              class="py-2 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 btn-interactive"
              :class="b.status === 'active' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'"
            >
              <Ban v-if="b.status === 'active'" class="w-3.5 h-3.5" />
              <CheckCircle v-else class="w-3.5 h-3.5" />
              <span>{{ b.status === 'active' ? 'Bloklash' : 'Faollashtirish' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <AppPagination
      v-model:current-page="pagination.currentPage.value"
      v-model:page-size="pagination.pageSize.value"
      :total-items="filteredBusinesses.length"
      item-name="biznes"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { Search, Building2, Calendar, Crown, Zap, Ban, CheckCircle, AlertTriangle, Clock } from 'lucide-vue-next';
import AppInput from '../../../components/AppInput.vue';
import AppSelect from '../../../components/AppSelect.vue';
import AppViewToggle from '../../../components/AppViewToggle.vue';
import AppPagination from '../../../components/AppPagination.vue';
import { useFormat } from '../../../composables/useFormat';
import { usePagination } from '../../../composables/usePagination';

const props = defineProps<{
  businesses: any[];
  search: string;
  statusFilter: string;
  viewMode: 'table' | 'grid';
}>();

defineEmits<{
  (e: 'update:search', val: string): void;
  (e: 'update:statusFilter', val: string): void;
  (e: 'update:viewMode', val: 'table' | 'grid'): void;
  (e: 'openPlanModal', business: any): void;
  (e: 'toggleStatus', business: any): void;
}>();

const { formatDate } = useFormat();

const filteredBusinesses = computed(() => {
  return props.businesses.filter((b: any) => {
    const matchesSearch =
      !props.search ||
      b.name.toLowerCase().includes(props.search.toLowerCase()) ||
      b.owner?.fullName?.toLowerCase().includes(props.search.toLowerCase()) ||
      b.owner?.phone?.includes(props.search);
    const matchesStatus = !props.statusFilter || b.status === props.statusFilter;
    return matchesSearch && matchesStatus;
  });
});

const pagination = usePagination(filteredBusinesses);

watch(() => [props.search, props.statusFilter], () => {
  pagination.resetPage();
});

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
