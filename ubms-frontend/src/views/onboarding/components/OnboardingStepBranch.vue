<template>
  <div class="space-y-5 animate-in fade-in duration-200">
    <div>
      <h2 class="text-xl font-bold text-slate-900 dark:text-white">Birinchi filial ma'lumotlari</h2>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Savdo nuqtangiz yoki asosiy ofisingiz</p>
    </div>

    <div>
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Filial Nomi</label>
      <input
        :value="form.branchName"
        @input="$emit('update:form', { ...form, branchName: ($event.target as HTMLInputElement).value })"
        type="text"
        required
        placeholder="Bosh filial"
        class="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
      />
    </div>

    <div>
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Manzil (Ixtiyoriy)</label>
      <input
        :value="form.branchAddress"
        @input="$emit('update:form', { ...form, branchAddress: ($event.target as HTMLInputElement).value })"
        type="text"
        placeholder="Toshkent sh., Chilonzor tumani..."
        class="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
      />
    </div>

    <div>
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Telefon</label>
      <PhoneInput
        :model-value="form.branchPhone"
        @update:model-value="$emit('update:form', { ...form, branchPhone: $event })"
        placeholder=" 90 123 45 67"
      />
    </div>

    <div class="flex space-x-3 mt-4">
      <button
        type="button"
        @click="$emit('back')"
        class="w-1/3 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm transition btn-interactive flex items-center justify-center gap-1.5"
      >
        <ArrowLeft class="w-4 h-4" />
        <span>Orqaga</span>
      </button>
      <button
        type="button"
        @click="$emit('next')"
        :disabled="!form.branchName"
        class="w-2/3 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition btn-interactive flex items-center justify-center gap-1.5 disabled:opacity-50"
      >
        <span>Tasdiqlash</span>
        <ArrowRight class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, ArrowRight } from 'lucide-vue-next';
import PhoneInput from '@/components/PhoneInput.vue';

defineProps<{
  form: {
    name: string;
    businessType: string;
    branchName: string;
    branchAddress: string;
    branchPhone: string;
  };
}>();

defineEmits<{
  (e: 'update:form', val: any): void;
  (e: 'back'): void;
  (e: 'next'): void;
}>();
</script>
