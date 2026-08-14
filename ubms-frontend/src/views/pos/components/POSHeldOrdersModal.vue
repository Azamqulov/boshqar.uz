<template>
  <Teleport to="body">
    <div v-if="isOpen" @click.self="$emit('close')" class="modal-overlay">
      <div class="modal-container max-w-md" @click.stop>
        <div class="modal-header">
          <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <History class="w-4 h-4 text-amber-500" />
            <span>Kutishdagi Buyurtmalar ({{ heldOrders.length }})</span>
          </h3>
          <button @click="$emit('close')" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="modal-body p-4 space-y-3">
          <div v-if="heldOrders.length === 0" class="py-8 text-center text-slate-400 text-xs">
            Hozircha kutish rejimida buyurtma yo'q
          </div>
          <div v-else class="space-y-2 max-h-80 overflow-y-auto pr-1">
            <div
              v-for="(order, idx) in heldOrders"
              :key="order.id || idx"
              class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
            >
              <div>
                <span class="font-bold text-slate-900 dark:text-white block">
                  Buyurtma #{{ idx + 1 }} {{ order.tableNumber ? `(${order.tableNumber})` : '' }}
                </span>
                <span class="text-[11px] text-slate-500 dark:text-slate-400">
                  {{ order.items?.length || 0 }} ta tovar — {{ formatCurrency(order.grandTotal || 0) }}
                </span>
              </div>
              <div class="flex items-center gap-1.5">
                <button
                  type="button"
                  @click="$emit('recall', order)"
                  class="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs"
                >
                  Qaytarish
                </button>
                <button
                  type="button"
                  @click="$emit('delete', idx)"
                  class="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { History, X, Trash2 } from 'lucide-vue-next';
import { useFormat } from '../../../composables/useFormat';

defineProps<{
  isOpen: boolean;
  heldOrders: any[];
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'recall', order: any): void;
  (e: 'delete', idx: number): void;
}>();

const { formatCurrency } = useFormat();
</script>
