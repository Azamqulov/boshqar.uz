<template>
  <div>
    <div v-if="products.length === 0" class="glass-card rounded-2xl p-12 text-center text-slate-400 dark:text-slate-500">
      <Package class="w-10 h-10 mx-auto mb-2 opacity-30" />
      <span>Mahsulotlar topilmadi</span>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div
        v-for="prod in products"
        :key="prod.id"
        class="glass-card rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition group border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90"
      >
        <div>
          <div class="relative w-full h-36 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden mb-3 flex items-center justify-center">
            <img
              v-if="prod.imageUrl"
              :src="prod.imageUrl"
              :alt="prod.name"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              @error="prod.imageUrl = null"
            />
            <Package v-else class="w-10 h-10 text-slate-400 dark:text-slate-600 opacity-40" />

            <span
              class="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase backdrop-blur-md shadow-sm"
              :class="prod.status === 'active' ? 'bg-emerald-500/90 text-white' : 'bg-rose-500/90 text-white'"
            >
              {{ prod.status === 'active' ? 'Mavjud' : 'Stop-list' }}
            </span>
          </div>

          <div class="space-y-1">
            <span v-if="prod.category" class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {{ prod.category?.name }}
            </span>
            <h4 class="font-black text-sm text-slate-900 dark:text-white line-clamp-1">
              {{ prod.name }}
            </h4>
            <p v-if="prod.sku" class="text-[11px] font-mono text-slate-500">
              SKU: {{ prod.sku }}
            </p>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span class="text-[10px] text-slate-400 block font-semibold">Sotuv Narxi</span>
            <span class="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
              {{ formatCurrency(prod.salePrice) }}
            </span>
          </div>

          <div class="flex items-center gap-1">
            <button
              @click="$emit('edit', prod)"
              class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
              title="Tahrirlash"
            >
              <Edit2 class="w-3.5 h-3.5" />
            </button>
            <button
              @click="$emit('delete', prod.id)"
              class="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition"
              title="O'chirish"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Package, Edit2, Trash2 } from 'lucide-vue-next';
import { useFormat } from '../../../composables/useFormat';

defineProps<{
  products: any[];
}>();

defineEmits<{
  (e: 'edit', prod: any): void;
  (e: 'delete', id: string): void;
}>();

const { formatCurrency } = useFormat();
</script>
