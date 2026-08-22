<template>
  <div class="glass-card rounded-2xl overflow-hidden shadow-sm w-full">
    <div class="w-full overflow-x-auto">
      <table class="w-full text-left text-xs border-collapse min-w-[750px]">
        <thead class="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-semibold">
          <tr>
            <th class="py-3 px-3 sm:px-4">Rasm & Nomi</th>
            <th class="py-3 px-2.5">Turi</th>
            <th class="py-3 px-2.5">SKU / Shtrix-kod</th>
            <th class="py-3 px-2.5">Kategoriya</th>
            <th class="py-3 px-2.5">Tannarx</th>
            <th class="py-3 px-2.5">Sotuv Narxi</th>
            <th class="py-3 px-2.5">Qoldiq</th>
            <th class="py-3 px-2.5 text-center">Status</th>
            <th class="py-3 px-3 sm:px-4 text-right">Amallar</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200 text-xs">
          <tr v-if="!products || products.length === 0">
            <td colspan="9" class="py-12 text-center text-slate-400 dark:text-slate-500">
              <Package class="w-8 h-8 mx-auto mb-2 opacity-30" />
              <span>Mahsulotlar topilmadi</span>
            </td>
          </tr>
          <tr
            v-for="prod in products"
            :key="prod.id || prod._id || prod.sku || prod.name"
            class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition group"
          >
            <!-- Rasm & Nomi -->
            <td class="py-3 px-3 sm:px-4 font-bold text-slate-900 dark:text-white">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                  <img
                    v-if="prod.imageUrl"
                    :src="prod.imageUrl"
                    :alt="prod.name"
                    class="w-full h-full object-cover"
                    @error="prod.imageUrl = null"
                  />
                  <Package v-else class="w-4 h-4 text-slate-400 dark:text-slate-500" />
                </div>
                <div class="min-w-0">
                  <span class="block text-slate-900 dark:text-slate-100 font-bold truncate max-w-[150px] sm:max-w-[220px]">{{ prod.name || 'Nomsiz tovar' }}</span>
                  <span v-if="prod.description" class="text-[10px] text-slate-400 font-normal truncate max-w-[150px] sm:max-w-[220px] block mt-0.5">{{ prod.description }}</span>
                </div>
              </div>
            </td>

            <!-- Turi -->
            <td class="py-3 px-2.5">
              <span
                v-if="prod.brand === 'dish' || prod.unit?.shortName === 'por'"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold whitespace-nowrap"
              >
                <span>Taom</span>
              </span>
              <span
                v-else-if="prod.brand === 'service'"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[10px] font-bold whitespace-nowrap"
              >
                <span>Xizmat</span>
              </span>
              <span
                v-else
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold whitespace-nowrap"
              >
                <span>Tovar</span>
              </span>
            </td>

            <!-- SKU / Barcode -->
            <td class="py-3 px-2.5 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
              <span class="block font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[100px]">{{ prod.sku || '-' }}</span>
              <span v-if="prod.barcode" class="block text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[100px]">{{ prod.barcode }}</span>
            </td>

            <!-- Kategoriya -->
            <td class="py-3 px-2.5 text-slate-700 dark:text-slate-300">
              <span
                v-if="getCategoryName(prod)"
                class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-medium max-w-[130px] truncate"
                :style="{ backgroundColor: getCategoryColor(prod) + '15', color: getCategoryColor(prod) }"
              >
                <span class="text-[10px] shrink-0" v-if="prod.category?.icon">{{ prod.category.icon }}</span>
                <span v-else class="w-1.5 h-1.5 rounded-full shrink-0" :style="{ backgroundColor: getCategoryColor(prod) }"></span>
                <span class="truncate">{{ getCategoryName(prod) }}</span>
              </span>
              <span v-else class="text-slate-400 text-xs">-</span>
            </td>

            <!-- Tannarx -->
            <td class="py-3 px-2.5 text-slate-600 dark:text-slate-400 font-mono font-medium text-xs whitespace-nowrap">
              {{ formatCurrency(getPurchasePrice(prod)) }}
            </td>

            <!-- Sotuv Narxi -->
            <td class="py-3 px-2.5 font-bold text-emerald-600 dark:text-emerald-400 font-mono text-xs whitespace-nowrap">
              {{ formatCurrency(getSalePrice(prod)) }}
            </td>

            <!-- Qoldiq -->
            <td class="py-3 px-2.5 font-mono">
              <span
                v-if="prod.brand === 'dish' || prod.brand === 'service' || prod.unit?.shortName === 'por'"
                class="inline-block px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 whitespace-nowrap"
              >
                ∞
              </span>
              <span
                v-else
                class="inline-block font-bold px-2 py-0.5 rounded-md text-[11px] whitespace-nowrap"
                :class="getStockQty(prod) <= 0 ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30' : getStockQty(prod) <= (prod.minStock || 5) ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'"
              >
                {{ getStockQty(prod) <= 0 ? 'Tugagan (0)' : formatStock(getStockQty(prod), getUnitName(prod)) }}
              </span>
            </td>

            <!-- Status / Stop-list Switch Button -->
            <td class="py-3 px-2.5 text-center">
              <button
                type="button"
                @click="$emit('toggleAvailability', prod)"
                class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition cursor-pointer whitespace-nowrap"
                :class="isProductActive(prod) ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/20'"
                :title="isProductActive(prod) ? 'Sotuvda bor (Stop-listga olish uchun bosing)' : 'Stop-listda (Sotuvga chiqarish uchun bosing)'"
              >
                <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="isProductActive(prod) ? 'bg-emerald-500' : 'bg-rose-500'"></span>
                <span>{{ isProductActive(prod) ? 'Mavjud' : 'Stop' }}</span>
              </button>
            </td>

            <!-- Amallar -->
            <td class="py-3 px-3 sm:px-4 text-right space-x-1.5 whitespace-nowrap">
              <button
                v-if="canEdit('products')"
                @click="$emit('edit', prod)"
                class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
                title="Tahrirlash"
              >
                <Edit2 class="w-3.5 h-3.5" />
              </button>
              <button
                v-if="canDelete('products')"
                type="button"
                @click.stop="$emit('delete', prod.id)"
                class="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition"
                title="O'chirish"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Package, Edit2, Trash2 } from 'lucide-vue-next';
import { useFormat } from '../../../composables/useFormat';
import { usePermissions } from '../../../composables/usePermissions';

defineProps<{
  products: any[];
}>();

defineEmits<{
  (e: 'toggleAvailability', prod: any): void;
  (e: 'edit', prod: any): void;
  (e: 'delete', id: string): void;
}>();

const { formatCurrency } = useFormat();
const { canEdit, canDelete } = usePermissions();

const isProductActive = (prod: any) => {
  if (prod.status) return prod.status === 'active';
  if (prod.isActive !== undefined) return prod.isActive !== false;
  return true;
};

const getSalePrice = (prod: any) => {
  return Number(prod.salePrice ?? prod.price ?? 0);
};

const getPurchasePrice = (prod: any) => {
  return Number(prod.purchasePrice ?? prod.buyPrice ?? prod.costPrice ?? 0);
};

const getStockQty = (prod: any) => {
  if (prod.stockQty !== undefined && prod.stockQty !== null) return Number(prod.stockQty);
  if (prod.stock !== undefined && prod.stock !== null) return Number(prod.stock);
  if (prod.quantity !== undefined && prod.quantity !== null) return Number(prod.quantity);
  if (prod.availableQty !== undefined && prod.availableQty !== null) return Number(prod.availableQty);
  return 0;
};

const getCategoryName = (prod: any) => {
  if (!prod.category) return '';
  if (typeof prod.category === 'object') return prod.category.name || '';
  if (typeof prod.category === 'string') return prod.category;
  return '';
};

const getCategoryColor = (prod: any) => {
  if (prod.category && typeof prod.category === 'object') {
    return prod.category.color || '#10b981';
  }
  return '#10b981';
};

const getUnitName = (prod: any) => {
  if (prod.unit && typeof prod.unit === 'object') {
    return prod.unit.shortName || prod.unit.name || 'dona';
  }
  return prod.unitName || 'dona';
};

const formatStock = (qty: number, unitName = 'dona') => {
  if (qty === undefined || qty === null || isNaN(qty)) return `0 ${unitName}`;
  const num = Number(qty);
  const formatted = num % 1 === 0 ? num.toString() : num.toFixed(3).replace(/\.?0+$/, '');
  return `${formatted} ${unitName}`;
};
</script>

