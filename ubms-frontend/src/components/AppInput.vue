<script setup lang="ts">
interface Props {
  modelValue: string | number;
  label?: string;
  placeholder?: string;
  type?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: any;
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  disabled: false,
});

defineEmits<{
  (e: 'update:modelValue', value: any): void;
}>();
</script>

<template>
  <div class="flex flex-col gap-1.5 w-full">
    <label v-if="label" class="block text-xs font-bold text-slate-700 dark:text-slate-300">
      {{ label }} <span v-if="required" class="text-rose-500">*</span>
    </label>

    <div class="relative flex items-center">
      <div v-if="icon" class="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center">
        <component :is="icon" class="w-4 h-4" />
      </div>

      <input
        :value="modelValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        class="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white placeholder-slate-400 text-xs px-3.5 py-2.5 outline-none transition duration-200 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        :class="[
          icon ? 'pl-9' : '',
          error
            ? 'border-rose-400 dark:border-rose-600 focus:border-rose-500'
            : 'border-slate-300 dark:border-slate-700 focus:border-emerald-500',
        ]"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
    </div>

    <span v-if="error" class="text-[11px] text-rose-500 font-medium">{{ error }}</span>
    <span v-else-if="hint" class="text-[11px] text-slate-400 dark:text-slate-500">{{ hint }}</span>
  </div>
</template>
