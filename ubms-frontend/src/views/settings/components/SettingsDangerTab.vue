<template>
  <div class="space-y-4 max-w-xl">
    <div class="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-3">
      <h4 class="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
        <AlertTriangle class="w-4 h-4" />
        <span>Xavfli Hudud</span>
      </h4>
      <p class="text-xs text-slate-600 dark:text-slate-300">
        Ushbu amallar qaytarib bo'lmas hisoblanadi. Ma'lumotlarni o'chirishdan oldin ehtiyot bo'ling.
      </p>

      <div class="pt-2 flex flex-col sm:flex-row gap-3">
        <button
          @click="$emit('openDeleteBusiness')"
          class="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-600/25 transition btn-interactive"
        >
          Joriy Biznesni O'chirish
        </button>
        <button
          @click="$emit('openDeleteAccount')"
          class="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-rose-600 dark:text-rose-400 font-bold text-xs transition border border-rose-500/30 btn-interactive"
        >
          Foydalanuvchi Hisobini Butunlay O'chirish
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next';

defineEmits<{
  (e: 'openDeleteBusiness'): void;
  (e: 'openDeleteAccount'): void;
}>();
</script>
