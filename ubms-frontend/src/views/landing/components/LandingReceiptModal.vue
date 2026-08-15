<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      @click.self="$emit('close')"
      class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div class="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-left animate-in zoom-in-95 duration-200">
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase">
            <Receipt class="w-4 h-4" />
            <span>Kassa Cheki (58mm)</span>
          </div>
          <button
            type="button"
            @click="$emit('close')"
            class="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Receipt Paper Simulated Box -->
        <div class="bg-slate-100 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 font-mono text-[11px] space-y-2 text-slate-700 dark:text-slate-300">
          <div class="text-center pb-2 border-b border-dashed border-slate-300 dark:border-slate-800">
            <h4 class="font-bold text-sm text-slate-900 dark:text-white">"Boshqar.uz" Savdo Markazi</h4>
            <p class="text-[10px] text-slate-500">Tel: +998 (90) 123-45-67</p>
            <p class="text-[9px] text-slate-400">{{ currentTime }}</p>
          </div>

          <div class="space-y-1 py-1">
            <div v-for="item in cart" :key="item.id" class="flex justify-between">
              <span>{{ item.name }} x{{ item.qty }}</span>
              <span class="font-bold text-slate-900 dark:text-white">{{ formatSum(item.price * item.qty) }}</span>
            </div>
          </div>

          <div class="pt-2 border-t border-dashed border-slate-300 dark:border-slate-800 space-y-1">
            <div class="flex justify-between font-bold text-slate-900 dark:text-white text-xs">
              <span>JAMI TO'LOV:</span>
              <span class="text-emerald-600 dark:text-emerald-400">{{ formatSum(total) }} so'm</span>
            </div>
            <div class="flex justify-between text-[10px] text-slate-500">
              <span>To'lov turi:</span>
              <span>Naqd pul / Karta</span>
            </div>
          </div>

          <div class="text-center pt-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-sans font-bold">
            Xaridingiz uchun rahmat!
          </div>
        </div>

        <div class="pt-2">
          <button
            type="button"
            @click="$emit('finishSale')"
            class="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer class="w-4 h-4" />
            <span>Chekni Chop Etish & Yangi Savdo</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Receipt, X, Printer } from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
  cart: any[];
  total: number;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'finishSale'): void;
}>();

const currentTime = computed(() => new Date().toLocaleString());

const formatSum = (val: number) => {
  return new Intl.NumberFormat('uz-UZ').format(val || 0);
};
</script>
