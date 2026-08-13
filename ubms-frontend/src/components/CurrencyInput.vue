<template>
  <div class="relative flex items-center">
    <input
      ref="inputRef"
      type="text"
      inputmode="numeric"
      :value="displayValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      @input="handleInput"
      @blur="handleBlur"
      @focus="handleFocus"
      :class="[
        'w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition',
        suffix ? 'pr-12' : '',
        inputClass,
      ]"
    />
    <span
      v-if="suffix"
      class="absolute right-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500 pointer-events-none select-none"
    >
      {{ suffix }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue?: number | string | null;
    placeholder?: string;
    suffix?: string;
    disabled?: boolean;
    required?: boolean;
    inputClass?: string;
  }>(),
  {
    modelValue: 0,
    placeholder: '0',
    suffix: "so'm",
    disabled: false,
    required: false,
    inputClass: '',
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', val: number): void;
  (e: 'blur'): void;
  (e: 'focus'): void;
}>();

const inputRef = ref<HTMLInputElement | null>(null);

// Format number with spaces every 3 digits: e.g. 5000000 -> "5 000 000"
function formatSpaced(val: number | string | null | undefined): string {
  if (val === null || val === undefined || val === '') return '';
  const num = typeof val === 'number' ? val : Number(String(val).replace(/\D/g, ''));
  if (isNaN(num)) return '';
  if (num === 0) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

const displayValue = computed(() => {
  return formatSpaced(props.modelValue);
});

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const raw = target.value;

  // Extract only digits
  const digitsOnly = raw.replace(/\D/g, '');
  const numericValue = digitsOnly ? parseInt(digitsOnly, 10) : 0;

  // Update input text with formatted spacing immediately
  const formatted = formatSpaced(numericValue);
  target.value = formatted;

  emit('update:modelValue', numericValue);
};

const handleBlur = () => {
  emit('blur');
};

const handleFocus = (event: FocusEvent) => {
  const target = event.target as HTMLInputElement;
  target.select();
  emit('focus');
};
</script>
