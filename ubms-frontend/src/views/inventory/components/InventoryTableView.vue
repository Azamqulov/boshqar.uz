<template>
  <div class="glass-card rounded-2xl overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead class="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-semibold">
          <tr>
            <th class="py-3 px-4">Mahsulot</th>
            <th class="py-3 px-4">SKU</th>
            <th class="py-3 px-4">Tannarx</th>
            <th class="py-3 px-4">Joriy Qoldiq</th>
            <th class="py-3 px-4">Holat</th>
            <th class="py-3 px-4">Jami Qiymat</th>
            <th class="py-3 px-4 text-right">Amallar</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
          <tr v-if="inventory.length === 0">
            <td colspan="7" class="py-8 text-center text-slate-400 dark:text-slate-500">Ombor ma'lumotlari topilmadi</td>
          </tr>
          <tr v-for="inv in inventory" :key="inv.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
            <td class="py-3 px-4 font-bold text-slate-900 dark:text-white">{{ inv.productName || inv.product?.name }}</td>
            <td class="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono">{{ inv.sku || inv.product?.sku }}</td>
            <td class="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono">{{ formatCurrency(inv.purchasePrice || inv.product?.purchasePrice) }}</td>
            <td
              class="py-3 px-4 font-bold font-mono"
              :class="Number(inv.quantity) <= 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'"
            >
              {{ formatStock(inv.quantity, inv.unit || inv.product?.unit?.shortName || 'dona') }}
            </td>
            <td class="py-3 px-4">
              <span
                class="inline-flex items-center gap-1.5 font-bold px-2.5 py-1 rounded-lg text-[11px]"
                :class="[
                  Number(inv.quantity) <= 0
                    ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                    : inv.isLowStock || (Number(inv.quantity) <= (inv.product?.minStock || 5))
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                ]"
              >
                <AlertCircle v-if="Number(inv.quantity) <= 0" class="w-3.5 h-3.5 shrink-0" />
                <AlertTriangle v-else-if="inv.isLowStock || (Number(inv.quantity) <= (inv.product?.minStock || 5))" class="w-3.5 h-3.5 shrink-0" />
                <CheckCircle2 v-else class="w-3.5 h-3.5 shrink-0" />
                <span>{{ Number(inv.quantity) <= 0 ? 'Tugagan' : inv.isLowStock || (Number(inv.quantity) <= (inv.product?.minStock || 5)) ? 'Kam Qoldi' : 'Yetarli' }}</span>
              </span>
            </td>
            <td
              class="py-3 px-4 font-bold font-mono"
              :class="Number(inv.quantity) <= 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'"
            >
              {{ formatCurrency((inv.quantity || 0) * Number(inv.purchasePrice || inv.product?.purchasePrice || 0)) }}
            </td>
            <td class="py-3 px-4 text-right">
              <div class="flex items-center justify-end gap-1.5">
                <button
                  v-if="canEdit"
                  type="button"
                  @click="$emit('edit', inv)"
                  class="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Tahrirlash"
                >
                  <Edit2 class="w-4 h-4 text-blue-500" />
                </button>
                <button
                  v-if="canDelete"
                  type="button"
                  @click="$emit('delete', inv)"
                  class="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                  title="O'chirish"
                >
                  <Trash2 class="w-4 h-4 text-rose-500" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Edit2, Trash2, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-vue-next';
import { useFormat } from '../../../composables/useFormat';

defineProps<{
  inventory: any[];
  canEdit: boolean;
  canDelete: boolean;
}>();

defineEmits<{
  (e: 'edit', inv: any): void;
  (e: 'delete', inv: any): void;
}>();

const { formatCurrency } = useFormat();

const formatStock = (qty: number | string, unitName = 'dona') => {
  if (qty === undefined || qty === null) return `0 ${unitName}`;
  const num = Number(qty);
  const formatted = num % 1 === 0 ? num.toString() : num.toFixed(3).replace(/\.?0+$/, '');
  return `${formatted} ${unitName}`;
};
</script>
