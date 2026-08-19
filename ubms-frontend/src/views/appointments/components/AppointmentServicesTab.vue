<template>
  <div class="space-y-4">
    <div v-if="services.length === 0" class="glass-card rounded-2xl p-12 text-center text-slate-400 dark:text-slate-500">
      <Scissors class="w-12 h-12 mx-auto mb-3 opacity-30" />
      <h3 class="text-sm font-bold text-slate-700 dark:text-slate-300">Xizmatlar Mavjud Emas</h3>
      <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
        Hozircha hech qanday xizmat turi qo'shilmagan. Yuqoridagi "Yangi Xizmat" tugmasi orqali xizmat qo'shing.
      </p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="service in services"
        :key="service.id"
        class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/40 transition group relative overflow-hidden"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Scissors class="w-5 h-5" />
          </div>
          <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono flex items-center gap-1">
            <Clock class="w-3 h-3 text-slate-400" />
            <span>{{ service.durationMinutes || 30 }} daqiqa</span>
          </span>
        </div>

        <div class="mt-3.5">
          <h3 class="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-500 transition">
            {{ service.name }}
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {{ service.description || 'Sartaroshlik va go\'zallik xizmati' }}
          </p>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-400">Xizmat narxi:</span>
          <span class="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {{ formatCurrency(service.price) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Scissors, Clock } from 'lucide-vue-next';
import { useFormat } from '../../../composables/useFormat';

defineProps<{
  services: any[];
}>();

const { formatCurrency } = useFormat();
</script>
