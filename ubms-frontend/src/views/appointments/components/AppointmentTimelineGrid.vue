<template>
  <SkeletonLoader v-if="loading" variant="grid" :count="6" />

  <div v-else class="glass-card rounded-2xl p-5 space-y-4">
    <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
      <h3 class="font-bold text-sm text-slate-900 dark:text-white">Barcha Bandlovlar Ro'yxati</h3>
      <span class="text-xs text-slate-500 dark:text-slate-400 font-mono">{{ appointments.length }} ta yozuv</span>
    </div>

    <div v-if="appointments.length === 0" class="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
      Hozircha bandlovlar mavjud emas. Yangi bandlov qo'shish tugmasini bosing.
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
      <div
        v-for="app in appointments"
        :key="app.id"
        class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md transition"
      >
        <div>
          <div class="flex justify-between items-start">
            <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1">
              <Clock class="w-3.5 h-3.5" />
              <span>{{ formatDate(app.scheduledAt) }}</span>
            </span>
            <span
              class="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full"
              :class="[
                app.status === 'completed' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' :
                app.status === 'confirmed' ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30' :
                app.status === 'cancelled' ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30' :
                'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
              ]"
            >
              {{ app.status }}
            </span>
          </div>
          <h4 class="text-sm font-bold text-slate-900 dark:text-white mt-2">{{ app.customer?.fullName || app.customerName || 'Mijoz' }}</h4>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ app.service?.name }} ({{ app.service?.durationMinutes || 30 }} daq)</p>
        </div>

        <div class="pt-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span class="text-xs font-black text-slate-900 dark:text-white font-mono">{{ formatCurrency(app.service?.price || 0) }}</span>
          <span class="text-[11px] text-slate-500 dark:text-slate-400">Usta: <strong class="text-slate-700 dark:text-slate-300">{{ app.employee?.fullName || 'Belgilanmagan' }}</strong></span>
        </div>

        <!-- Quick status update buttons -->
        <div v-if="app.status !== 'completed' && app.status !== 'cancelled'" class="flex items-center gap-1.5 pt-1">
          <AppButton
            variant="success"
            size="sm"
            class="flex-1"
            :icon="Check"
            @click="$emit('updateStatus', app.id, 'completed')"
          >
            Yakunlandi
          </AppButton>
          <AppButton
            v-if="app.status === 'pending'"
            variant="secondary"
            size="sm"
            class="flex-1"
            @click="$emit('updateStatus', app.id, 'confirmed')"
          >
            Tasdiqlash
          </AppButton>
          <AppButton
            variant="danger"
            size="sm"
            :icon="X"
            @click="$emit('updateStatus', app.id, 'cancelled')"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Clock, Check, X } from 'lucide-vue-next';
import SkeletonLoader from '../../../components/SkeletonLoader.vue';
import AppButton from '../../../components/AppButton.vue';
import { useFormat } from '../../../composables/useFormat';

defineProps<{
  loading: boolean;
  appointments: any[];
}>();

defineEmits<{
  (e: 'updateStatus', id: string, status: string): void;
}>();

const { formatCurrency, formatDate } = useFormat();
</script>
