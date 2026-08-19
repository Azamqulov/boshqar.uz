<template>
  <div class="w-full">
    <!-- 1. Mobile Cards View (< md) -->
    <div class="block md:hidden space-y-3">
      <div v-if="inventory.length === 0" class="glass-card rounded-2xl p-8 text-center text-slate-400 dark:text-slate-500">
        <AlertCircle class="w-8 h-8 mx-auto mb-2 opacity-30" />
        <span>Ombor ma'lumotlari topilmadi</span>
      </div>

      <div
        v-for="inv in inventory"
        :key="inv.id"
        class="glass-card rounded-2xl p-4 space-y-3 border border-slate-200/80 dark:border-slate-800/80 shadow-xs"
      >
        <!-- Top: Product name & Status badge -->
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <h4 class="font-bold text-sm text-slate-900 dark:text-white truncate">
              {{ inv.productName || inv.product?.name }}
            </h4>
            <span v-if="inv.sku || inv.product?.sku" class="text-xs text-slate-400 dark:text-slate-500 font-mono block mt-0.5">
              #{{ inv.sku || inv.product?.sku }}
            </span>
          </div>

          <!-- Status badge -->
          <span
            class="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-lg text-[10px] shrink-0"
            :class="[
              Number(inv.quantity) <= 0
                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                : inv.isLowStock || (Number(inv.quantity) <= (inv.product?.minStock || 5))
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
            ]"
          >
            <AlertCircle v-if="Number(inv.quantity) <= 0" class="w-3 h-3 shrink-0" />
            <AlertTriangle v-else-if="inv.isLowStock || (Number(inv.quantity) <= (inv.product?.minStock || 5))" class="w-3 h-3 shrink-0" />
            <CheckCircle2 v-else class="w-3 h-3 shrink-0" />
            <span>{{ Number(inv.quantity) <= 0 ? 'Tugagan' : inv.isLowStock || (Number(inv.quantity) <= (inv.product?.minStock || 5)) ? 'Kam Qoldi' : 'Yetarli' }}</span>
          </span>
        </div>

        <!-- Middle: Stock & Value Grid -->
        <div class="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <span class="text-[10px] text-slate-400 dark:text-slate-500 block">Joriy qoldiq</span>
            <span
              class="font-black font-mono text-sm"
              :class="Number(inv.quantity) <= 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'"
            >
              {{ formatStock(inv.quantity, inv.unit || inv.product?.unit?.shortName || 'dona') }}
            </span>
          </div>
          <div class="text-right">
            <span class="text-[10px] text-slate-400 dark:text-slate-500 block">Jami qiymati</span>
            <span class="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-xs">
              {{ formatCurrency((inv.quantity || 0) * Number(inv.purchasePrice || inv.product?.purchasePrice || 0)) }}
            </span>
          </div>
        </div>

        <!-- Actions -->
        <div v-if="canEdit || canDelete" class="flex items-center gap-2 pt-1">
          <button
            v-if="canEdit"
            type="button"
            @click="$emit('edit', inv)"
            class="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5 btn-interactive"
          >
            <Edit2 class="w-3.5 h-3.5 text-blue-500" />
            <span>Tahrirlash</span>
          </button>
          <button
            v-if="canDelete"
            type="button"
            @click="$emit('delete', inv)"
            class="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold transition flex items-center justify-center gap-1.5 btn-interactive"
            title="O'chirish"
          >
            <Trash2 class="w-3.5 h-3.5" />
            <span>O'chirish</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 2. Desktop Table View (>= md) -->
    <div class="hidden md:block glass-card rounded-2xl overflow-hidden shadow-sm">
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
