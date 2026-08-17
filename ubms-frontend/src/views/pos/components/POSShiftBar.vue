<template>
  <div class="glass-card rounded-2xl px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 border border-slate-200/80 dark:border-slate-800/80 shrink-0">
    <div v-if="currentShift" class="flex items-center gap-2 sm:gap-3">
      <div class="flex items-center gap-1.5 sm:gap-2">
        <span class="relative flex h-2.5 w-2.5">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span class="font-black text-xs text-slate-900 dark:text-white">
          Smena Faol <span class="hidden sm:inline">({{ formatDateTime(currentShift.openedAt) }})</span>
        </span>
      </div>
      <div class="hidden md:flex items-center gap-2 text-xs font-mono">
        <span class="text-slate-400">|</span>
        <span class="text-slate-500">Kassada:</span>
        <span class="font-bold text-emerald-600 dark:text-emerald-400">
          {{ formatCurrency(currentShift.liveSummary?.expectedCash ?? currentShift.startingCash) }}
        </span>
        <span class="text-slate-400">|</span>
        <span class="text-slate-500">Kassir:</span>
        <span class="font-bold text-slate-800 dark:text-slate-200">
          {{ currentShift.user?.fullName || currentShift.user?.name || cashierName || 'Kassir' }}
        </span>
      </div>
    </div>
    <div v-else class="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-bold">
      <AlertTriangle class="w-4 h-4" />
      <span>Smena ochilmagan!</span>
    </div>

    <div class="flex items-center gap-1.5">
      <!-- Network / Offline Sync Status Badge -->
      <div
        class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition border"
        :class="
          isOnline
            ? (pendingCount > 0
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20')
            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 animate-pulse'
        "
        :title="isOnline ? (pendingCount > 0 ? `${pendingCount} ta savdo sinxronlashga tayyor` : 'Tarmoq faol') : 'Internet aloqasi yo\'q. Offline rejimda ishlanmoqda.'"
      >
        <Wifi v-if="isOnline" class="w-3.5 h-3.5" />
        <WifiOff v-else class="w-3.5 h-3.5" />
        <span class="hidden sm:inline">{{ isOnline ? (pendingCount > 0 ? `Sinxronlash (${pendingCount})` : 'Online') : `Offline (${pendingCount})` }}</span>
      </div>

      <!-- Sync Button if pending orders exist -->
      <button
        v-if="pendingCount > 0 && isOnline"
        type="button"
        @click="$emit('syncOffline')"
        :disabled="isSyncing"
        class="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition btn-interactive disabled:opacity-50"
        title="Offline savdolarni serverga yuborish"
      >
        <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': isSyncing }" />
        <span class="hidden md:inline">{{ isSyncing ? 'Sinxronlanmoqda...' : 'Sinxronlash' }}</span>
      </button>

      <button
        v-if="enableHotkeys !== false"
        type="button"
        @click="$emit('openHotkeys')"
        class="px-2 sm:px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1 sm:gap-1.5 transition btn-interactive"
        title="Kassa tezkor tugmalari ro'yxati (F1)"
      >
        <Keyboard class="w-3.5 h-3.5 text-emerald-500" />
        <span class="hidden sm:inline">Tugmalar</span>
        <span class="text-[10px] px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-mono">F1</span>
      </button>

      <button
        v-if="currentShift"
        type="button"
        @click="$emit('openShift', 'report')"
        class="px-2 sm:px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1 sm:gap-1.5 transition btn-interactive"
      >
        <Receipt class="w-3.5 h-3.5" />
        <span>Z-Hisobot</span>
      </button>
      <button
        v-if="currentShift"
        type="button"
        @click="$emit('openShift', 'close')"
        class="px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center gap-1 sm:gap-1.5 transition btn-interactive"
      >
        <Moon class="w-3.5 h-3.5" />
        <span>Yopish</span>
      </button>
      <button
        v-else
        type="button"
        @click="$emit('openShift', 'open')"
        class="px-3 sm:px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-500/20 transition btn-interactive"
      >
        <Sun class="w-3.5 h-3.5" />
        <span>Smena Ochish</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertTriangle, Receipt, Moon, Sun, Keyboard, Wifi, WifiOff, RefreshCw } from 'lucide-vue-next';
import { useFormat } from '../../../composables/useFormat';

withDefaults(
  defineProps<{
    currentShift: any;
    cashierName?: string;
    enableHotkeys?: boolean;
    isOnline?: boolean;
    pendingCount?: number;
    isSyncing?: boolean;
  }>(),
  {
    enableHotkeys: true,
    isOnline: true,
    pendingCount: 0,
    isSyncing: false,
  }
);

defineEmits<{
  (e: 'openShift', mode: 'open' | 'close' | 'report'): void;
  (e: 'openHotkeys'): void;
  (e: 'syncOffline'): void;
}>();

const { formatCurrency, formatDateTime } = useFormat();
</script>
