<template>
  <div class="space-y-5 animate-in fade-in duration-200">
    <div>
      <h2 class="text-xl font-bold text-slate-900 dark:text-white">Biznesingiz haqida ma'lumot</h2>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">boshqar.uz profilingizni sozlang</p>
    </div>

    <div>
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Biznes Nomi</label>
      <input
        :value="form.name"
        @input="$emit('update:form', { ...form, name: ($event.target as HTMLInputElement).value })"
        type="text"
        required
        placeholder="Masalan: Asia Med Dorixona yoki Safia Bakery"
        class="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
      />
    </div>

    <div>
      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Biznes Turi</label>
      <div class="grid grid-cols-2 gap-3">
        <div
          v-for="bt in businessTypes"
          :key="bt.type"
          @click="$emit('update:form', { ...form, businessType: bt.type })"
          class="p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between group"
          :class="[
            form.businessType === bt.type
              ? 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500 text-emerald-900 dark:text-white shadow-sm'
              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200'
          ]"
        >
          <div class="flex items-center space-x-2.5">
            <div
              class="p-2 rounded-lg transition"
              :class="form.businessType === bt.type ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-400'"
            >
              <component :is="bt.icon" class="w-4 h-4" />
            </div>
            <span class="font-bold text-sm text-slate-900 dark:text-white">{{ bt.label }}</span>
          </div>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-1">{{ bt.desc }}</p>
        </div>
      </div>
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
        :disabled="!form.name || !form.businessType"
        class="w-2/3 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition disabled:opacity-50 btn-interactive flex items-center justify-center gap-1.5"
      >
        <span>Keyingisi (Filial sozlash)</span>
        <ArrowRight class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, ArrowRight } from 'lucide-vue-next';

defineProps<{
  form: {
    name: string;
    businessType: string;
    branchName: string;
    branchAddress: string;
    branchPhone: string;
  };
  businessTypes: Array<{
    type: string;
    label: string;
    desc: string;
    icon: any;
  }>;
}>();

defineEmits<{
  (e: 'update:form', val: any): void;
  (e: 'back'): void;
  (e: 'next'): void;
}>();
</script>
