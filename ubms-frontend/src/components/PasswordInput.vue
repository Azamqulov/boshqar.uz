<template>
  <div class="relative w-full">
    <input
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      :type="showPassword ? 'text' : 'password'"
      :placeholder="placeholder || 'Parolni kiriting'"
      :required="required"
      :disabled="disabled"
      class="w-full pl-4 pr-11 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition disabled:opacity-50"
      :class="customClass"
    />
    <button
      type="button"
      @click="showPassword = !showPassword"
      class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition p-1 rounded focus:outline-none"
      :title="showPassword ? 'Parolni yashirish' : 'Parolni ko\'rish'"
      tabindex="-1"
    >
      <EyeOff v-if="showPassword" class="w-4 h-4" />
      <Eye v-else class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Eye, EyeOff } from 'lucide-vue-next';

defineProps<{
  modelValue: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  customClass?: string;
}>();

defineEmits<{
  (e: 'update:modelValue', val: string): void;
}>();

const showPassword = ref(false);
</script>
