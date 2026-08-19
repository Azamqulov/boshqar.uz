<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-container max-w-sm" @click.stop>
        <div class="modal-header">
          <h3 class="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt class="w-5 h-5 text-amber-500" />
            <span>Pre-Chek (Oraliq Hisob)</span>
          </h3>
          <button
            type="button"
            @click="$emit('close')"
            class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-3 font-mono">
          <div class="text-center pb-2 border-b border-dashed border-slate-300 dark:border-slate-700">
            <h4 class="font-black text-sm">{{ selectedTable?.name }}</h4>
            <p class="text-[10px] text-slate-500">Pre-Hisob v-1.0</p>
          </div>

          <div class="space-y-1.5">
            <div v-for="item in preBillData?.items" :key="item.id" class="flex justify-between">
              <span>{{ item.name }} x{{ item.quantity }}</span>
              <span>{{ formatCurrency(item.total) }}</span>
            </div>
          </div>

          <div class="pt-2 border-t border-dashed border-slate-300 dark:border-slate-700 space-y-1">
            <div class="flex justify-between text-slate-500">
              <span>Oraliq summa:</span>
              <span>{{ formatCurrency(preBillData?.subtotal) }}</span>
            </div>
            <div class="flex justify-between text-amber-600 dark:text-amber-400">
              <span>Xizmat haqi ({{ preBillData?.serviceChargePercent }}%):</span>
              <span>+{{ formatCurrency(preBillData?.serviceFee) }}</span>
            </div>
            <div class="flex justify-between text-base font-black text-emerald-600 dark:text-emerald-400 border-t border-slate-200 dark:border-slate-800 pt-1.5">
              <span>JAMI TO'LOV:</span>
              <span>{{ formatCurrency(preBillData?.grandTotal) }}</span>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-3 font-sans">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
            >
              Yopish
            </button>
            <button
              type="button"
              @click="$emit('print')"
              class="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold flex items-center gap-1.5 btn-interactive"
            >
              <Printer class="w-4 h-4" />
              <span>Chop Etish</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import {
  Receipt,
  X,
  Printer,
} from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
  selectedTable: any;
  preBillData: any;
  formatCurrency: (val: any) => string;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'print'): void;
}>();
</script>
