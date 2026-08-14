<template>
  <div class="space-y-4">
    <!-- Search & Filters -->
    <div class="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
      <div class="flex flex-col sm:flex-row gap-3 flex-1">
        <div class="flex-1">
          <AppInput
            :model-value="search"
            @update:model-value="$emit('update:search', $event)"
            placeholder="Owner ismi, telefon yoki biznes nomi bo'yicha qidiruv..."
            :icon="Search"
            @input="$emit('filterChanged')"
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
    <div v-if="viewMode === 'table'" class="glass-card rounded-2xl overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase font-semibold">
            <tr>
              <th class="py-3 px-4">Firma Egasi (Owner)</th>
              <th class="py-3 px-4">Biznes Nomi</th>
              <th class="py-3 px-4">Sohasi</th>
              <th class="py-3 px-4">Tarif Rejasi</th>
              <th class="py-3 px-4">Jami Savdo (GMV)</th>
              <th class="py-3 px-4">Holati</th>
              <th class="py-3 px-4 text-right">Monitoring</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
            <tr v-if="owners.length === 0">
              <td colspan="7" class="py-8 text-center text-slate-400 dark:text-slate-500">Firma egalari topilmadi</td>
            </tr>
            <tr v-for="o in owners" :key="o.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
              <td class="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-xs">
                  {{ o.fullName.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <span class="block">{{ o.fullName }}</span>
                  <span class="text-[10px] text-slate-400 font-mono">{{ o.phone }}</span>
                </div>
              </td>
              <td class="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                {{ o.business?.name || '-' }}
              </td>
              <td class="py-3.5 px-4">
                <span class="px-2 py-0.5 rounded uppercase text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {{ o.business?.businessType || '-' }}
                </span>
              </td>
              <td class="py-3.5 px-4">
                <span class="px-2 py-0.5 rounded font-bold text-[10px]" :class="getPlanBadgeClass(o.business?.plan || 'Free')">
                  {{ o.business?.plan || 'Free' }}
                </span>
              </td>
              <td class="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {{ formatCurrency(o.business?.lifetimeGMV || 0) }}
              </td>
              <td class="py-3.5 px-4">
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  :class="o.status === 'active' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'"
                >
                  {{ o.status === 'active' ? 'Faol' : 'Bloklangan' }}
                </span>
              </td>
              <td class="py-3.5 px-4 text-right space-x-1.5">
                <button
                  @click="$emit('openDetailModal', o.id)"
                  class="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-bold text-xs transition btn-interactive inline-flex items-center gap-1"
                >
                  <Eye class="w-3.5 h-3.5" />
                  <span>Statistika</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Owners Grid / Card View -->
    <div v-else-if="viewMode === 'grid'">
      <div v-if="owners.length === 0" class="glass-card rounded-2xl p-12 text-center text-slate-400 dark:text-slate-500">
        <Crown class="w-10 h-10 mx-auto mb-2 opacity-30 text-emerald-500" />
        <span>Firma egalari topilmadi</span>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div
          v-for="o in owners"
          :key="o.id"
          class="glass-card rounded-2xl p-5 flex flex-col justify-between hover:shadow-lg transition-all duration-300 border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 group"
        >
          <div class="space-y-3.5">
            <!-- Top header: Avatar, Name, Phone & Status -->
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-3">
                <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-sm shadow-sm group-hover:scale-105 transition-transform">
                  {{ o.fullName.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <h3 class="font-bold text-slate-900 dark:text-white text-sm leading-tight">{{ o.fullName }}</h3>
                  <p class="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                    <Phone class="w-3 h-3 text-slate-400" />
                    <span>{{ o.phone }}</span>
                  </p>
                </div>
              </div>

              <span
                class="px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0"
                :class="o.status === 'active' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25' : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25'"
              >
                {{ o.status === 'active' ? 'Faol' : 'Bloklangan' }}
              </span>
            </div>

            <!-- Business & Plan Details -->
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800/60 space-y-2">
              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                  <Building2 class="w-3.5 h-3.5 text-slate-400" />
                  Biznes:
                </span>
                <span class="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">{{ o.business?.name || '-' }}</span>
              </div>

              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-500 dark:text-slate-400 font-medium">Sohasi:</span>
                <span class="px-2 py-0.5 rounded uppercase text-[10px] font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {{ o.business?.businessType || '-' }}
                </span>
              </div>

              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-500 dark:text-slate-400 font-medium">Tarif rejasi:</span>
                <span class="px-2 py-0.5 rounded font-bold text-[10px]" :class="getPlanBadgeClass(o.business?.plan || 'Free')">
                  {{ o.business?.plan || 'Free' }}
                </span>
              </div>
            </div>

            <!-- GMV box -->
            <div class="p-3 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20">
              <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">Jami Savdo (GMV)</span>
              <p class="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                {{ formatCurrency(o.business?.lifetimeGMV || 0) }}
              </p>
            </div>
          </div>

          <!-- Card Action Footer -->
          <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
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
</template>

<script setup lang="ts">
import { Search, Eye, Crown, Phone, Building2 } from 'lucide-vue-next';
import AppInput from '../../../components/AppInput.vue';
import AppSelect from '../../../components/AppSelect.vue';
import AppViewToggle from '../../../components/AppViewToggle.vue';
import { useFormat } from '../../../composables/useFormat';

defineProps<{
  owners: any[];
  search: string;
  planFilter: string;
  statusFilter: string;
  viewMode: 'table' | 'grid';
}>();

defineEmits<{
  (e: 'update:search', val: string): void;
  (e: 'update:planFilter', val: string): void;
  (e: 'update:statusFilter', val: string): void;
  (e: 'update:viewMode', val: 'table' | 'grid'): void;
  (e: 'filterChanged'): void;
  (e: 'openDetailModal', ownerId: string): void;
}>();

const { formatCurrency } = useFormat();

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
