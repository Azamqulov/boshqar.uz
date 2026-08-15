<template>
  <div>
    <div v-if="inventory.length === 0" class="glass-card rounded-2xl p-12 text-center text-slate-400 dark:text-slate-500">
      <Boxes class="w-10 h-10 mx-auto mb-2 opacity-30" />
      <span>Ombor ma'lumotlari topilmadi</span>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div
        v-for="inv in inventory"
        :key="inv.id"
        class="glass-card rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90"
      >
        <div>
          <div class="flex items-center justify-between gap-2 mb-2">
            <h4 class="font-black text-sm text-slate-900 dark:text-white line-clamp-1">
              {{ inv.productName || inv.product?.name }}
            </h4>
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

          <p class="text-[11px] font-mono text-slate-500 mb-3">
            SKU: {{ inv.sku || inv.product?.sku || '-' }}
          </p>

          <div class="space-y-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs">
            <div class="flex justify-between items-center">
              <span class="text-slate-400">Tannarx:</span>
              <span class="font-bold text-slate-700 dark:text-slate-300 font-mono">
                {{ formatCurrency(inv.purchasePrice || inv.product?.purchasePrice) }}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-slate-400">Qoldiq:</span>
              <span
                class="font-black font-mono"
                :class="Number(inv.quantity) <= 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'"
              >
                {{ inv.quantity }} {{ inv.unit || inv.product?.unit?.shortName }}
              </span>
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span class="text-[10px] text-slate-400 block font-semibold">Jami Qiymat</span>
            <span
              class="text-sm font-black font-mono"
              :class="Number(inv.quantity) <= 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'"
            >
              {{ formatCurrency((inv.quantity || 0) * Number(inv.purchasePrice || inv.product?.purchasePrice || 0)) }}
            </span>
          </div>

          <div class="flex items-center gap-1">
            <button
              v-if="canEdit"
              type="button"
              @click="$emit('edit', inv)"
              class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
              title="Tahrirlash"
            >
              <Edit2 class="w-3.5 h-3.5 text-blue-500" />
            </button>
            <button
              v-if="canDelete"
              type="button"
              @click="$emit('delete', inv)"
              class="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition"
              title="O'chirish"
            >
              <Trash2 class="w-3.5 h-3.5 text-rose-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Boxes, Edit2, Trash2, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-vue-next';
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
</script>
