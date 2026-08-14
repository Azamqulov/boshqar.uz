<template>
  <div class="glass-card rounded-2xl p-5 flex flex-col justify-between space-y-4">
    <div>
      <div class="flex items-center justify-between mb-3 border-b border-slate-200 dark:border-slate-800 pb-2.5">
        <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Flame class="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>Eng Ko'p Sotilganlar (Trend)</span>
        </h3>
        <span class="text-[10px] text-slate-400">30 kunlik</span>
      </div>

      <div v-if="topBestsellers.length === 0" class="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
        Hozircha sotuvlar mavjud emas
      </div>

      <div v-else class="space-y-2.5">
        <div
          v-for="(item, idx) in topBestsellers"
          :key="item.id"
          class="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs"
        >
          <div class="flex items-center gap-2.5 truncate">
            <span
              class="w-5 h-5 rounded-lg flex items-center justify-center font-black text-[10px]"
              :class="[
                idx === 0
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : idx === 1
                  ? 'bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                  : idx === 2
                  ? 'bg-amber-700 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              ]"
            >
              {{ idx + 1 }}
            </span>
            <div class="truncate">
              <h5 class="font-bold text-slate-900 dark:text-white truncate">{{ item.name }}</h5>
              <span class="text-[10px] text-slate-400">{{ formatCurrency(item.salePrice) }}</span>
            </div>
          </div>

          <div class="text-right flex-shrink-0 pl-2">
            <span class="font-black text-emerald-600 dark:text-emerald-400 block">{{ item.soldCount30d || 0 }} ta</span>
            <span class="text-[9px] text-slate-400">{{ formatCurrency(item.salesTotal30d || 0) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="pt-2 border-t border-slate-200 dark:border-slate-800">
      <router-link
        to="/products"
        class="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition flex items-center justify-center space-x-1.5"
      >
        <span>Barcha Mahsulotlarni Ko'rish →</span>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Flame } from 'lucide-vue-next';
import { useFormat } from '../../../composables/useFormat';

defineProps<{
  topBestsellers: any[];
}>();

const { formatCurrency } = useFormat();
</script>
