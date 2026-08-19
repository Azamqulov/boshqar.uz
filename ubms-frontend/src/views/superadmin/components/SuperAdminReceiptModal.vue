<template>
  <Teleport to="body">
    <div
      v-if="request"
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        class="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 class="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Eye class="w-4 h-4 text-emerald-500" />
            <span>To'lov Cheki: {{ request.business?.name }}</span>
          </h3>
          <button
            type="button"
            @click="$emit('close')"
            class="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Details Box -->
        <div class="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs">
          <div>
            <span class="text-slate-400 block text-[10px] uppercase font-bold">Summa:</span>
            <span class="font-black text-emerald-600 dark:text-emerald-400 font-mono text-sm">{{ formatMoney(request.amount) }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[10px] uppercase font-bold">To'lovchi:</span>
            <span class="font-bold text-slate-900 dark:text-white">{{ request.senderName || request.senderCard }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[10px] uppercase font-bold">Tarif & Muddat:</span>
            <span class="font-bold text-slate-900 dark:text-white">{{ request.plan?.name }} ({{ request.durationMonths }} oy)</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[10px] uppercase font-bold">Vaqti:</span>
            <span class="font-mono text-slate-600 dark:text-slate-300">{{ formatDateTime(request.createdAt) }}</span>
          </div>
        </div>

        <!-- Image Container -->
        <div class="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 flex items-center justify-center min-h-[250px] p-2">
          <img
            :src="request.receiptUrl"
            alt="To'lov cheki"
            class="max-h-[500px] w-auto object-contain rounded-xl shadow-lg"
          />
        </div>

        <div class="flex items-center justify-between pt-1">
          <a
            :href="request.receiptUrl"
            download="chek.jpg"
            target="_blank"
            class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition inline-flex items-center gap-1.5"
          >
            <ExternalLink class="w-3.5 h-3.5" />
            <span>To'liq ochish</span>
          </a>
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import {
  Eye,
  X,
  ExternalLink,
} from 'lucide-vue-next';

defineProps<{
  request: any;
  formatMoney: (val: any) => string;
  formatDateTime: (val: any) => string;
}>();

defineEmits<{
  (e: 'close'): void;
}>();
</script>
