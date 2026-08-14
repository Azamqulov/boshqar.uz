<template>
  <div class="space-y-4">
    <div class="flex justify-end">
      <AppViewToggle :model-value="viewMode" @update:model-value="$emit('update:viewMode', $event)" />
    </div>

    <!-- Audit Logs Table View -->
    <div v-if="viewMode === 'table'" class="glass-card rounded-2xl overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs font-mono">
          <thead class="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase font-sans font-semibold">
            <tr>
              <th class="py-3 px-4">Vaqt</th>
              <th class="py-3 px-4">Foydalanuvchi</th>
              <th class="py-3 px-4">Amal</th>
              <th class="py-3 px-4">Bo'lim</th>
              <th class="py-3 px-4">IP Manzil</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
            <tr v-if="auditLogs.length === 0">
              <td colspan="5" class="py-8 text-center text-slate-400 dark:text-slate-500 font-sans">Audit jurnallari mavjud emas</td>
            </tr>
            <tr v-for="log in auditLogs" :key="log.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
              <td class="py-3 px-4 text-slate-500 dark:text-slate-400">{{ formatDate(log.createdAt) }}</td>
              <td class="py-3 px-4 font-sans font-bold text-slate-900 dark:text-white">{{ log.user?.fullName }} ({{ log.user?.phone }})</td>
              <td class="py-3 px-4 uppercase text-emerald-600 dark:text-emerald-400 font-bold">{{ log.action }}</td>
              <td class="py-3 px-4 text-slate-700 dark:text-slate-300 font-sans">{{ log.entity }}</td>
              <td class="py-3 px-4 text-slate-400 dark:text-slate-500">{{ log.ipAddress || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Audit Logs Grid / Card View -->
    <div v-else-if="viewMode === 'grid'">
      <div v-if="auditLogs.length === 0" class="glass-card rounded-2xl p-12 text-center text-slate-400 dark:text-slate-500">
        <ShieldCheck class="w-10 h-10 mx-auto mb-2 opacity-30 text-emerald-500" />
        <span>Audit jurnallari mavjud emas</span>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="log in auditLogs"
          :key="log.id"
          class="glass-card rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90"
        >
          <div class="space-y-2.5">
            <div class="flex items-center justify-between gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                {{ log.action }}
              </span>
              <span class="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                <Calendar class="w-3 h-3 text-slate-400" />
                {{ formatDate(log.createdAt) }}
              </span>
            </div>

            <div class="space-y-0.5">
              <p class="font-bold text-xs text-slate-900 dark:text-white">{{ log.user?.fullName || 'Tizim' }}</p>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{{ log.user?.phone || '-' }}</p>
            </div>

            <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs">
              <span class="text-slate-500 dark:text-slate-400 font-medium">Bo'lim:</span>
              <span class="font-semibold text-slate-700 dark:text-slate-300 font-mono">{{ log.entity }}</span>
            </div>
          </div>

          <div class="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>IP manzil:</span>
            <span class="font-bold text-slate-600 dark:text-slate-300">{{ log.ipAddress || '-' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ShieldCheck, Calendar } from 'lucide-vue-next';
import AppViewToggle from '../../../components/AppViewToggle.vue';
import { useFormat } from '../../../composables/useFormat';

defineProps<{
  auditLogs: any[];
  viewMode: 'table' | 'grid';
}>();

defineEmits<{
  (e: 'update:viewMode', val: 'table' | 'grid'): void;
}>();

const { formatDate } = useFormat();
</script>
