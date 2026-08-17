<template>
  <div class="space-y-4">
    <div class="glass-card rounded-2xl overflow-hidden p-4 space-y-4">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <PackageCheck class="w-4 h-4 text-emerald-500" />
            <span>Sotilgan Mahsulotlar va Xizmatlar</span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">Har bir mahsulot bo'yicha sotuv hajmi, tushum, tannarx va sof foyda</p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <!-- Profit Filter Pills -->
          <div class="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
            <button
              type="button"
              @click="productProfitFilter = 'all'"
              class="px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap"
              :class="productProfitFilter === 'all' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
            >
              Barchasi
            </button>
            <button
              type="button"
              @click="productProfitFilter = 'profitable'"
              class="px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap"
              :class="productProfitFilter === 'profitable' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
            >
              Foydali
            </button>
            <button
              type="button"
              @click="productProfitFilter = 'loss'"
              class="px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap"
              :class="productProfitFilter === 'loss' ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
            >
              Zararli
            </button>
          </div>

          <!-- Search input -->
          <div class="relative w-full sm:w-56">
            <Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" v-model="productSearch" placeholder="Qidiruv (nomi, SKU)..."
              class="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100/80 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500" />
          </div>
        </div>
      </div>

      <!-- 1.1 TABLE VIEW -->
      <div v-if="viewMode === 'table'" class="overflow-x-auto scrollbar-none">
        <table class="w-full text-left text-xs table-auto">
          <thead class="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[10px] font-bold">
            <tr>
              <th class="py-2.5 px-3">#</th>
              <th class="py-2.5 px-3">Mahsulot / Xizmat Nomi</th>
              <th class="py-2.5 px-3 text-center">Sotilgan Soni</th>
              <th class="py-2.5 px-4 text-right">Jami Tushum</th>
              <th class="py-2.5 px-4 text-right">Tannarx (COGS)</th>
              <th class="py-2.5 px-4 text-right">Sof Foyda</th>
              <th class="py-2.5 px-4 text-right">Rentabellik</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200/80 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200 text-xs">
            <tr v-if="filteredSoldProducts.length === 0">
              <td colspan="7" class="py-12 text-center text-slate-400 dark:text-slate-500">
                <PackageCheck class="w-8 h-8 mx-auto mb-2 opacity-40" />
                <span>Hech qanday mahsulot topilmadi</span>
              </td>
            </tr>
            <tr v-for="(prod, idx) in pagination.paginatedItems.value" :key="prod.id || idx"
              class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
              <td class="py-3 px-3 font-mono text-slate-400 whitespace-nowrap">{{ pagination.startIndex.value + idx }}</td>
              <td class="py-3 px-3 whitespace-nowrap">
                <div class="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{{ prod.name }}</div>
                <div v-if="prod.barcode || prod.sku" class="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">
                  {{ prod.barcode || prod.sku }}
                </div>
              </td>
              <td class="py-3 px-3 text-center whitespace-nowrap">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono whitespace-nowrap">
                  {{ prod.quantitySold }} dona
                </span>
              </td>
              <td class="py-3 px-4 text-right font-black text-slate-900 dark:text-white font-mono whitespace-nowrap">
                {{ formatCurrency(prod.revenue) }}
              </td>
              <td class="py-3 px-4 text-right font-medium text-amber-600 dark:text-amber-400 font-mono whitespace-nowrap">
                {{ formatCurrency(prod.cogs) }}
              </td>
              <td class="py-3 px-4 text-right font-black font-mono whitespace-nowrap"
                :class="prod.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'">
                {{ formatCurrency(prod.profit) }}
              </td>
              <td class="py-3 px-4 text-right font-bold font-mono whitespace-nowrap">
                <span class="px-2 py-0.5 rounded text-[11px] whitespace-nowrap" :class="[
                  prod.revenue > 0 && ((prod.profit / prod.revenue) * 100) >= 20
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                ]">
                  {{ prod.revenue > 0 ? Math.round((prod.profit / prod.revenue) * 100) : 0 }}%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 1.2 CARD / GRID VIEW -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="prod in pagination.paginatedItems.value"
          :key="prod.id || prod.name"
          class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 hover:border-emerald-500/50 transition"
        >
          <div>
            <span class="font-bold text-slate-900 dark:text-white text-sm block truncate">
              {{ prod.name }}
            </span>
            <span v-if="prod.sku || prod.barcode" class="text-[10px] text-slate-400 font-mono">
              {{ prod.sku || prod.barcode }}
            </span>
          </div>

          <div class="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span class="text-[10px] text-slate-400 block">Sotilgan</span>
              <span class="font-bold font-mono text-slate-800 dark:text-slate-200">{{ prod.quantitySold }} dona</span>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 block">Tushum</span>
              <span class="font-bold font-mono text-slate-800 dark:text-slate-200">{{ formatCurrency(prod.revenue) }}</span>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 block">Tannarx</span>
              <span class="font-bold font-mono text-amber-600 dark:text-amber-400">{{ formatCurrency(prod.cogs) }}</span>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 block">Sof Foyda</span>
              <span class="font-bold font-mono" :class="prod.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'">
                {{ formatCurrency(prod.profit) }}
              </span>
            </div>
          </div>

          <div class="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span class="text-[10px] text-slate-400 font-semibold">Rentabellik darajasi</span>
            <span class="px-2 py-0.5 rounded text-[11px] font-bold font-mono" :class="[
              prod.revenue > 0 && ((prod.profit / prod.revenue) * 100) >= 20
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            ]">
              Marja: {{ prod.revenue > 0 ? Math.round((prod.profit / prod.revenue) * 100) : 0 }}%
            </span>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <AppPagination
        v-model:current-page="pagination.currentPage.value"
        v-model:page-size="pagination.pageSize.value"
        :total-items="filteredSoldProducts.length"
        item-name="mahsulot"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { PackageCheck, Search } from 'lucide-vue-next';
import AppPagination from '../../../components/AppPagination.vue';
import { useFormat } from '../../../composables/useFormat';
import { usePagination } from '../../../composables/usePagination';

const props = defineProps<{
  soldProducts: any[];
  viewMode: 'table' | 'grid';
}>();

const { formatCurrency } = useFormat();

const productSearch = ref('');
const productProfitFilter = ref<'all' | 'profitable' | 'loss'>('all');

const filteredSoldProducts = computed(() => {
  let list = props.soldProducts || [];

  if (productProfitFilter.value === 'profitable') {
    list = list.filter((p: any) => p.profit > 0);
  } else if (productProfitFilter.value === 'loss') {
    list = list.filter((p: any) => p.profit <= 0);
  }

  if (!productSearch.value) return list;
  const q = productSearch.value.toLowerCase().trim();
  return list.filter(
    (p: any) =>
      p.name?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q) ||
      p.barcode?.includes(q),
  );
});

const pagination = usePagination(filteredSoldProducts);

watch([productSearch, productProfitFilter], () => {
  pagination.resetPage();
});
</script>
