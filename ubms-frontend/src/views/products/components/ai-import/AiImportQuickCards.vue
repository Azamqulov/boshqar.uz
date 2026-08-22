<template>
  <div class="space-y-2.5">
    <div class="flex items-center gap-1.5 text-xs font-black text-slate-800 dark:text-slate-200">
      <Zap class="w-4 h-4 text-emerald-500 fill-emerald-500" />
      <span>Tezkor namunalar</span>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
      <button
        v-for="item in QUICK_SAMPLES"
        :key="item.id"
        type="button"
        @click="$emit('select', item.prompt)"
        class="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 hover:shadow-md hover:shadow-emerald-500/5 transition-all group text-left cursor-pointer"
      >
        <div class="flex items-center gap-3 min-w-0 flex-1">
          <div class="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/15 group-hover:scale-105 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-2xs">
            <component :is="item.icon" class="w-4 h-4" />
          </div>
          <div class="min-w-0 flex-1">
            <h4 class="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {{ item.title }}
            </h4>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {{ item.subtitle }}
            </p>
          </div>
        </div>

        <ChevronRight class="w-4 h-4 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Zap, ChevronRight, CupSoda, UtensilsCrossed, Sparkles } from 'lucide-vue-next';

const QUICK_SAMPLES = [
  {
    id: 'drinks',
    icon: CupSoda,
    title: 'Ichimliklar',
    subtitle: 'Kola, Pepsi, Fanta va boshqalar',
    prompt: "Menda 5 blok 1.5L Kola, 3 blok Pepsi 1L, 10 blok Fanta bor. Har blokda 6 tadan. Tan narxi 11 000, sotish 14 000 so'm. Ichimliklar",
  },
  {
    id: 'food',
    icon: UtensilsCrossed,
    title: 'Oziq-ovqat',
    subtitle: 'Shirinliklar, nonushta, yeguliklar',
    prompt: "Snickers Super 24 dona (9500/12000), Twix Xtra 24 dona (9500/12000), Bounty Trio 20 dona (9500/12000), KitKat 24 dona (7500/10000). Oziq-ovqat",
  },
  {
    id: 'cleaning',
    icon: Sparkles,
    title: 'Maishiy kimyo',
    subtitle: 'Tozalash vositalari, gigiyena',
    prompt: "Fairy Limon 450ml 20 dona (16000/21000), Ariel Avtomat 3kg 12 dona (65000/82000), Domestos 1L 15 dona (19000/25000). Maishiy kimyo",
  },
];

defineEmits<{
  (e: 'select', prompt: string): void;
}>();
</script>
