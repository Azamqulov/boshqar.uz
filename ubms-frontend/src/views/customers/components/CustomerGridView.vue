<template>
  <div>
    <div v-if="customers.length === 0" class="glass-card rounded-2xl p-12 text-center text-slate-400 dark:text-slate-500">
      <Users class="w-10 h-10 mx-auto mb-2 opacity-30" />
      <span>Mijozlar topilmadi</span>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div
        v-for="c in customers"
        :key="c.id"
        class="glass-card rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90"
      >
        <div>
          <div class="flex items-center justify-between gap-2 mb-3">
            <div class="flex items-center gap-2.5">
              <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-black text-sm flex items-center justify-center shadow-sm">
                {{ c.fullName.charAt(0).toUpperCase() }}
              </div>
              <div>
                <h4 class="font-black text-sm text-slate-900 dark:text-white line-clamp-1">
                  {{ c.fullName }}
                </h4>
                <p class="text-[11px] font-mono text-slate-500">
                  {{ c.phone || "Telefon kiritilmagan" }}
                </p>
              </div>
            </div>
          </div>

          <div class="space-y-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs">
            <div class="flex justify-between items-center">
              <span class="text-slate-400">Jami Xarid:</span>
              <span class="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {{ formatCurrency(c.totalSpent || 0) }}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-slate-400">Nasiya / Qarz:</span>
              <span
                class="font-black font-mono"
                :class="Number(c.debt) > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'"
              >
                {{ formatCurrency(c.debt || 0) }}
              </span>
            </div>
          </div>
        </div>

        <div class="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <button
            v-if="Number(c.debt) > 0"
            type="button"
            @click="$emit('openPayDebt', c)"
            class="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition flex items-center gap-1 btn-interactive"
          >
            <CreditCard class="w-3.5 h-3.5" />
            <span>Qarz Yopish</span>
          </button>
          <span v-else class="text-[11px] text-slate-400 italic">Qarzi yo'q</span>

          <div class="flex items-center gap-1">
            <button
              @click="$emit('openHistory', c)"
              class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
              title="Tarix"
            >
              <History class="w-4 h-4" />
            </button>
            <button
              @click="$emit('openEdit', c)"
              class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
              title="Tahrirlash"
            >
              <Edit2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Users, CreditCard, History, Edit2 } from 'lucide-vue-next';
import { useFormat } from '../../../composables/useFormat';

defineProps<{
  customers: any[];
}>();

defineEmits<{
  (e: 'openPayDebt', c: any): void;
  (e: 'openHistory', c: any): void;
  (e: 'openEdit', c: any): void;
}>();

const { formatCurrency } = useFormat();
</script>
