<template>
  <Teleport to="body">
    <div v-if="isOpen" @click.self="$emit('close')" class="modal-overlay">
      <div class="modal-container max-w-lg" @click.stop>
        <div class="modal-header">
          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <History class="w-4 h-4 text-blue-500" />
              <span>To'lov Tarixi</span>
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">{{ historySupplier?.name }} — barcha to'lovlar ro'yxati</p>
          </div>
          <button @click="$emit('close')" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"><X class="w-5 h-5" /></button>
        </div>

        <div class="modal-body">
          <!-- Summary Card -->
          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <div>
              <span class="text-xs text-slate-500 dark:text-slate-400 block">Ta'minotchi:</span>
              <span class="font-bold text-sm text-slate-900 dark:text-white">{{ historySupplier?.name }}</span>
              <span v-if="historySupplier?.companyName" class="text-xs text-slate-500 block">({{ historySupplier?.companyName }})</span>
            </div>
            <div class="text-right">
              <span class="text-xs text-slate-500 dark:text-slate-400 block">Joriy Qarzimiz:</span>
              <span class="font-black text-sm font-mono" :class="Number(historySupplier?.balance) > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'">
                {{ formatCurrency(Number(historySupplier?.balance || 0)) }}
              </span>
            </div>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-2 gap-3 my-3">
            <div class="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
              <span class="text-xs text-blue-600 dark:text-blue-400 block mb-0.5">Jami to'lovlar soni</span>
              <span class="font-black text-lg text-blue-700 dark:text-blue-300">{{ paymentHistory.length }} ta</span>
            </div>
            <div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <span class="text-xs text-emerald-600 dark:text-emerald-400 block mb-0.5">Jami to'langan</span>
              <span class="font-black text-lg text-emerald-700 dark:text-emerald-300 font-mono">{{ formatCurrency(totalPaid) }}</span>
            </div>
          </div>

          <!-- Loading -->
          <div v-if="loading" class="py-8 text-center space-y-2">
            <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center mx-auto shadow-sm">
              <RefreshCw class="w-5 h-5 animate-spin stroke-[2.2]" />
            </div>
            <span class="text-xs text-slate-500 font-medium block">To'lovlar yuklanmoqda...</span>
          </div>

          <!-- Empty State -->
          <div v-else-if="paymentHistory.length === 0" class="py-8 text-center">
            <CreditCard class="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p class="text-xs text-slate-400 dark:text-slate-500">Hali to'lovlar amalga oshirilmagan</p>
          </div>

          <!-- Payment History Timeline -->
          <div v-else class="space-y-2 max-h-72 overflow-y-auto pr-1">
            <div
              v-for="(p, idx) in paymentHistory"
              :key="p.id"
              class="flex gap-3 p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-blue-500/40 transition group text-xs"
            >
              <!-- Index -->
              <div class="w-7 h-7 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-black flex items-center justify-center shrink-0 text-[10px]">
                {{ paymentHistory.length - idx }}
              </div>

              <!-- Details -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2 mb-1">
                  <span class="font-black text-emerald-600 dark:text-emerald-400 font-mono">{{ formatCurrency(Number(p.amount)) }}</span>
                  <span class="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">{{ formatDate(p.createdAt) }}</span>
                </div>
                <div class="flex items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400">
                  <span>Oldin: <b class="font-mono text-rose-500">{{ formatCurrency(Number(p.balanceBefore)) }}</b></span>
                  <span>→</span>
                  <span>Keyin: <b class="font-mono" :class="Number(p.balanceAfter) > 0 ? 'text-rose-500' : 'text-emerald-500'">{{ formatCurrency(Number(p.balanceAfter)) }}</b></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { History, X, RefreshCw, CreditCard } from 'lucide-vue-next';
import { useFormat } from '../../../composables/useFormat';

defineProps<{
  isOpen: boolean;
  historySupplier: any;
  paymentHistory: any[];
  totalPaid: number;
  loading: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
}>();

const { formatCurrency, formatDate } = useFormat();
</script>
