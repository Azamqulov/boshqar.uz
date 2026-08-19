<template>
  <div class="w-full">
    <!-- 1. Mobile Cards View (< md) -->
    <div class="block md:hidden space-y-3">
      <div v-if="products.length === 0" class="glass-card rounded-2xl p-8 text-center text-slate-400 dark:text-slate-500">
        <Package class="w-8 h-8 mx-auto mb-2 opacity-40" />
        <span>Mahsulotlar topilmadi</span>
      </div>

      <div
        v-for="prod in products"
        :key="prod.id"
        class="glass-card rounded-2xl p-3.5 space-y-3 border border-slate-200/80 dark:border-slate-800/80 shadow-xs"
      >
        <div class="flex items-start gap-3">
          <!-- Product Image -->
          <div class="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
            <img
              v-if="prod.imageUrl"
              :src="prod.imageUrl"
              :alt="prod.name"
              class="w-full h-full object-cover"
              @error="prod.imageUrl = null"
            />
            <Package v-else class="w-6 h-6 text-slate-400 dark:text-slate-500" />
          </div>

          <!-- Product Details -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-1.5">
              <h4 class="font-bold text-xs text-slate-900 dark:text-white truncate">
                {{ prod.name }}
              </h4>
              <!-- Status / Stop-list Badge -->
              <button
                type="button"
                @click="$emit('toggleAvailability', prod)"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 transition"
                :class="prod.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="prod.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'"></span>
                <span>{{ prod.status === 'active' ? 'Mavjud' : 'Stop' }}</span>
              </button>
            </div>

            <!-- SKU & Category badges -->
            <div class="flex flex-wrap items-center gap-1.5 mt-1 text-[10px]">
              <span v-if="prod.sku" class="font-mono text-slate-400 dark:text-slate-500">
                #{{ prod.sku }}
              </span>
              <span
                v-if="prod.category"
                class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-medium truncate max-w-[120px]"
                :style="{ backgroundColor: (prod.category.color || '#10b981') + '15', color: prod.category.color || '#10b981' }"
              >
                <span v-if="prod.category.icon">{{ prod.category.icon }}</span>
                <span class="truncate">{{ prod.category.name }}</span>
              </span>
            </div>
          </div>
        </div>

        <!-- Prices and Stock Row -->
        <div class="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <!-- Price -->
          <div>
            <span class="text-[10px] text-slate-400 dark:text-slate-500 block">Sotuv narxi</span>
            <span class="font-black text-emerald-600 dark:text-emerald-400 font-mono text-sm">
              {{ formatCurrency(prod.salePrice) }}
            </span>
          </div>

          <!-- Stock -->
          <div class="text-right">
            <span class="text-[10px] text-slate-400 dark:text-slate-500 block">Qoldiq</span>
            <span
              v-if="prod.brand === 'dish' || prod.brand === 'service' || prod.unit?.shortName === 'por'"
              class="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 font-mono"
            >
              ∞
            </span>
            <span
              v-else
              class="inline-block font-bold px-2 py-0.5 rounded text-[11px] font-mono"
              :class="prod.stockQty <= 0 ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30' : prod.stockQty <= prod.minStock ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'"
            >
              {{ prod.stockQty <= 0 ? 'Tugagan (0)' : formatStock(prod.stockQty, prod.unit?.shortName || 'dona') }}
            </span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2 pt-1">
          <button
            v-if="canEdit('products')"
            type="button"
            @click="$emit('edit', prod)"
            class="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5 btn-interactive"
          >
            <Edit2 class="w-3.5 h-3.5" />
            <span>Tahrirlash</span>
          </button>
          <button
            v-if="canDelete('products')"
            type="button"
            @click.stop="$emit('delete', prod.id)"
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
    <div class="hidden md:block glass-card rounded-2xl overflow-hidden shadow-sm w-full">
      <div class="w-full overflow-x-auto max-w-full">
        <table class="w-full text-left text-xs border-collapse min-w-[700px]">
          <thead class="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-semibold">
            <tr>
              <th class="py-3 px-2.5 sm:px-3">Rasm & Nomi</th>
              <th class="py-3 px-2">Turi</th>
              <th class="py-3 px-2">SKU / Shtrix-kod</th>
              <th class="py-3 px-2">Kategoriya</th>
              <th class="py-3 px-2">Tannarx</th>
              <th class="py-3 px-2">Sotuv Narxi</th>
              <th class="py-3 px-2">Qoldiq</th>
              <th class="py-3 px-2 text-center">Status</th>
              <th class="py-3 px-2.5 sm:px-3 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200 text-[11px] sm:text-xs">
            <tr v-if="products.length === 0">
              <td colspan="9" class="py-8 text-center text-slate-400 dark:text-slate-500">Mahsulotlar topilmadi</td>
            </tr>
            <tr v-for="prod in products" :key="prod.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
              <!-- Rasm & Nomi -->
              <td class="py-2.5 px-2.5 sm:px-3 font-bold text-slate-900 dark:text-white">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
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
                    <span class="block text-slate-900 dark:text-slate-100 font-semibold truncate max-w-[110px] sm:max-w-[150px] lg:max-w-[200px]">{{ prod.name }}</span>
                    <span v-if="prod.description" class="text-[10px] text-slate-500 dark:text-slate-400 font-normal truncate max-w-[110px] sm:max-w-[150px] lg:max-w-[200px] block">{{ prod.description }}</span>
                  </div>
                </div>
              </td>
              <!-- Turi -->
              <td class="py-2.5 px-2">
                <span
                  v-if="prod.brand === 'dish' || prod.unit?.shortName === 'por'"
                  class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-semibold whitespace-nowrap"
                >
                  <span>Taom</span>
                </span>
                <span
                  v-else-if="prod.brand === 'service'"
                  class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[10px] font-semibold whitespace-nowrap"
                >
                  <span>Xizmat</span>
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold whitespace-nowrap"
                >
                  <span>Tovar</span>
                </span>
              </td>
              <!-- SKU / Barcode -->
              <td class="py-2.5 px-2 text-slate-500 dark:text-slate-400 font-mono text-[10px]">
                <span class="block font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[90px]">{{ prod.sku || '-' }}</span>
                <span v-if="prod.barcode" class="block text-[9px] text-slate-400 dark:text-slate-500 truncate max-w-[90px]">{{ prod.barcode }}</span>
              </td>
              <!-- Kategoriya -->
              <td class="py-2.5 px-2 text-slate-700 dark:text-slate-300">
                <span
                  v-if="prod.category"
                  class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium max-w-[90px] sm:max-w-[120px] truncate"
                  :style="{ backgroundColor: (prod.category.color || '#10b981') + '15', color: prod.category.color || '#10b981' }"
                >
                  <span class="text-[10px] shrink-0" v-if="prod.category.icon">{{ prod.category.icon }}</span>
                  <span v-else class="w-1.5 h-1.5 rounded-full shrink-0" :style="{ backgroundColor: prod.category.color || '#10b981' }"></span>
                  <span class="truncate">{{ prod.category.name }}</span>
                </span>
                <span v-else class="text-slate-400 text-[10px]">-</span>
              </td>
              <!-- Tannarx -->
              <td class="py-2.5 px-2 text-slate-600 dark:text-slate-400 font-mono font-medium text-[11px] whitespace-nowrap">
                {{ formatCurrency(prod.purchasePrice) }}
              </td>
              <!-- Sotuv Narxi -->
              <td class="py-2.5 px-2 font-bold text-emerald-600 dark:text-emerald-400 font-mono text-[11px] sm:text-xs whitespace-nowrap">
                {{ formatCurrency(prod.salePrice) }}
              </td>
              <!-- Qoldiq -->
              <td class="py-2.5 px-2 font-mono">
                <span
                  v-if="prod.brand === 'dish' || prod.brand === 'service' || prod.unit?.shortName === 'por'"
                  class="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 whitespace-nowrap"
                >
                  ∞
                </span>
                <span
                  v-else
                  class="inline-block font-bold px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap"
                  :class="prod.stockQty <= 0 ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30' : prod.stockQty <= prod.minStock ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'"
                >
                  {{ prod.stockQty <= 0 ? 'Tugagan (0)' : formatStock(prod.stockQty, prod.unit?.shortName || 'dona') }}
                </span>
              </td>
              <!-- Status / Stop-list Switch Button -->
              <td class="py-2.5 px-2 text-center">
                <button
                  type="button"
                  @click="$emit('toggleAvailability', prod)"
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition cursor-pointer whitespace-nowrap"
                  :class="prod.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/20'"
                  :title="prod.status === 'active' ? 'Sotuvda bor (Stop-listga olish uchun bosing)' : 'Stop-listda (Sotuvga chiqarish uchun bosing)'"
                >
                  <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="prod.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'"></span>
                  <span>{{ prod.status === 'active' ? 'Mavjud' : 'Stop' }}</span>
                </button>
              </td>
              <!-- Amallar -->
              <td class="py-2.5 px-2.5 sm:px-3 text-right space-x-1 whitespace-nowrap">
                <button
                  v-if="canEdit('products')"
                  @click="$emit('edit', prod)"
                  class="p-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
                  title="Tahrirlash"
                >
                  <Edit2 class="w-3.5 h-3.5" />
                </button>
                <button
                  v-if="canDelete('products')"
                  type="button"
                  @click.stop="$emit('delete', prod.id)"
                  class="p-1 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition"
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

const formatStock = (qty: number, unitName = 'dona') => {
  if (qty === undefined || qty === null) return `0 ${unitName}`;
  const num = Number(qty);
  const formatted = num % 1 === 0 ? num.toString() : num.toFixed(3).replace(/\.?0+$/, '');
  return `${formatted} ${unitName}`;
};
</script>
