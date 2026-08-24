<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue: string | number;
  label?: string;
  placeholder?: string;
  type?: string;
  step?: string | number;
  min?: string | number;
  max?: string | number;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: any;
  autoCapitalize?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  step: 'any',
  required: false,
  disabled: false,
  autoCapitalize: undefined,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void;
}>();

const shouldCapitalize = computed(() => {
  if (props.autoCapitalize !== undefined) {
    return props.autoCapitalize;
  }
  const labelMatch = props.label && /ism|familiya|fullname|name|f\.?i\.?o/i.test(props.label);
  const placeholderMatch = props.placeholder && /ism|familiya|fullname|name|f\.?i\.?o/i.test(props.placeholder);
  return !!(labelMatch || placeholderMatch);
});

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  let val = target.value;

  if (shouldCapitalize.value && typeof val === 'string' && val.length > 0) {
    val = val.replace(/(?:^|\s|-)\S/g, (char) => char.toUpperCase());
    target.value = val;
  }

  emit('update:modelValue', val);
};
</script>

<template>
  <div class="flex flex-col gap-1.5 w-full">
    <label v-if="label" class="block text-xs font-bold text-slate-700 dark:text-slate-300">
      {{ label.replace(/\s*\*+$/, '') }} <span v-if="required || label.includes('*')" class="text-rose-500">*</span>
    </label>

    <div class="relative flex items-center">
      <div v-if="icon" class="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center">
        <component :is="icon" class="w-4 h-4" />
      </div>

      <input
        :value="modelValue"
        :type="type"
        :step="step"
        :min="min"
        :max="max"
        :placeholder="placeholder"
        :disabled="disabled"
        class="w-full h-[42px] rounded-xl bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white placeholder-slate-400 text-xs px-3.5 outline-none transition duration-200 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        :class="[
          icon ? 'pl-9' : '',
          error
            ? 'border-rose-400 dark:border-rose-600 focus:border-rose-500'
            : 'border-slate-300 dark:border-slate-700 focus:border-emerald-500',
        ]"
        @input="handleInput"
      />
    </div>

    <span v-if="error" class="text-[11px] text-rose-500 font-medium">{{ error }}</span>
    <span v-else-if="hint" class="text-[11px] text-slate-400 dark:text-slate-500">{{ hint }}</span>
  </div>
</template>
