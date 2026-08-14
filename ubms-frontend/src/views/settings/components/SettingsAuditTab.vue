<template>
  <div class="glass-card rounded-2xl overflow-hidden shadow-sm">
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead class="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase font-semibold">
          <tr>
            <th class="py-3 px-4">Vaqt</th>
            <th class="py-3 px-4">Xodim</th>
            <th class="py-3 px-4">Harakat (Action)</th>
            <th class="py-3 px-4">Bo'lim</th>
            <th class="py-3 px-4">IP Manzil</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200 font-mono">
          <tr v-if="auditLogs.length === 0">
            <td colspan="5" class="py-8 text-center text-slate-400 dark:text-slate-500 font-sans">Audit yozuvlari mavjud emas</td>
          </tr>
          <tr v-for="log in auditLogs" :key="log.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
            <td class="py-3 px-4 text-slate-500 dark:text-slate-400 font-sans">{{ formatDate(log.createdAt) }}</td>
            <td class="py-3 px-4 font-sans font-bold text-slate-900 dark:text-white">{{ log.user?.fullName }}</td>
            <td class="py-3 px-4 uppercase text-emerald-600 dark:text-emerald-400 font-bold">{{ log.action }}</td>
            <td class="py-3 px-4 text-slate-700 dark:text-slate-300">{{ log.entity }}</td>
            <td class="py-3 px-4 text-slate-400 dark:text-slate-500">{{ log.ipAddress || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFormat } from '../../../composables/useFormat';

defineProps<{
  auditLogs: any[];
}>();

const { formatDate } = useFormat();
</script>
