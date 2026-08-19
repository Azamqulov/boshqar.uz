<template>
  <div class="space-y-6 text-center animate-in fade-in duration-200">
    <div class="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto text-2xl font-bold">
      <Check class="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
    </div>

    <div>
      <h2 class="text-2xl font-extrabold text-slate-900 dark:text-white">{{ form.name }}</h2>
      <p class="text-sm text-emerald-600 dark:text-emerald-400 font-semibold mt-1 uppercase">{{ selectedBusinessTypeLabel }}</p>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-2">Barcha boshlang'ich modullar va sozlamalar tayyorlanmoqda.</p>
    </div>

    <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-left text-xs space-y-2">
      <div class="flex justify-between"><span class="text-slate-500 dark:text-slate-400">Filial:</span> <span class="font-semibold text-slate-800 dark:text-slate-200">{{ form.branchName }}</span></div>
      <div class="flex justify-between"><span class="text-slate-500 dark:text-slate-400">Valyuta:</span> <span class="font-semibold text-slate-800 dark:text-slate-200">UZS (so'm)</span></div>
      <div class="flex justify-between"><span class="text-slate-500 dark:text-slate-400">Tarif rejasi:</span> <span class="font-semibold text-emerald-600 dark:text-emerald-400">Free Sinov davri</span></div>
    </div>

    <div class="flex space-x-3 mt-4">
      <button
        type="button"
        @click="$emit('back')"
        :disabled="isLoading"
        class="w-1/3 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm transition btn-interactive flex items-center justify-center gap-1.5"
      >
        <ArrowLeft class="w-4 h-4" />
        <span>Orqaga</span>
      </button>
      <button
        type="button"
        @click="$emit('submit')"
        :disabled="isLoading"
        class="w-2/3 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-base shadow-xl shadow-emerald-500/30 transition disabled:opacity-50 btn-interactive flex items-center justify-center space-x-2"
      >
        <span v-if="!isLoading">Tizimni Boshlash</span>
        <span v-else>Tayyorlanmoqda...</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check, ArrowLeft } from 'lucide-vue-next';

defineProps<{
  form: {
    name: string;
    businessType: string;
    branchName: string;
    branchAddress: string;
    branchPhone: string;
  };
  selectedBusinessTypeLabel: string;
  isLoading: boolean;
}>();

defineEmits<{
  (e: 'back'): void;
  (e: 'submit'): void;
}>();
</script>
