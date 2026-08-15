<template>
  <div
    class="relative flex items-center w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 transition focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 overflow-hidden"
    :class="[disabled ? 'opacity-60 cursor-not-allowed' : '', customClass]"
  >
    <!-- Fixed +998 Prefix Badge (Static, non-deletable) -->
    <div
      class="pl-3 pr-2.5 py-2.5 flex items-center gap-1.5 select-none pointer-events-none text-slate-600 dark:text-slate-400 font-mono font-bold text-xs sm:text-sm border-r border-slate-200 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-900/30"
    >
      <Phone class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
      <span>+998</span>
    </div>

    <!-- 9-Digit Masked Input (XX XXX XX XX) -->
    <input
      ref="inputRef"
      :value="formatted9Digits"
      @input="handleInput"
      @paste="handlePaste"
      @keydown="handleKeyDown"
      type="tel"
      inputmode="numeric"
      maxlength="12"
      :placeholder="placeholder || '90 123 45 67'"
      :required="required"
      :disabled="disabled"
      class="w-full px-3 py-2.5 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm font-mono tracking-wider focus:outline-none disabled:cursor-not-allowed"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Phone } from 'lucide-vue-next';

const props = defineProps<{
  modelValue?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  customClass?: string;
  raw9?: boolean; // if true, emits 9 digits '901234567', else standard '+998901234567'
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void;
}>();

const inputRef = ref<HTMLInputElement | null>(null);

// Extract only the 9 digits from whatever modelValue is passed (e.g. '+998 90 123 45 67', '+998901234567', or '901234567')
const extract9 = (val?: string): string => {
  if (!val) return '';
  let digits = val.replace(/\D/g, '');
  if (digits.startsWith('998')) {
    digits = digits.substring(3);
  }
  return digits.substring(0, 9);
};

// Format 9 digits with spaces: XX XXX XX XX
const formatWithSpaces = (rawDigits: string): string => {
  const d = rawDigits.substring(0, 9);
  let res = '';
  if (d.length > 0) res += d.substring(0, 2);
  if (d.length > 2) res += ' ' + d.substring(2, 5);
  if (d.length > 5) res += ' ' + d.substring(5, 7);
  if (d.length > 7) res += ' ' + d.substring(7, 9);
  return res;
};

const formatted9Digits = computed(() => {
  const digits = extract9(props.modelValue);
  return formatWithSpaces(digits);
});

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const rawInput = target.value;
  
  // Extract strictly max 9 digits
  const clean9 = extract9(rawInput);
  const formatted = formatWithSpaces(clean9);
  
  // Update the input field display
  target.value = formatted;

  // Emit normalized phone string
  if (props.raw9) {
    emit('update:modelValue', clean9);
  } else {
    emit('update:modelValue', clean9.length > 0 ? `+998${clean9}` : '');
  }
};

const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault();
  const pasteData = event.clipboardData?.getData('text') || '';
  const clean9 = extract9(pasteData);
  const formatted = formatWithSpaces(clean9);

  if (inputRef.value) {
    inputRef.value.value = formatted;
  }

  if (props.raw9) {
    emit('update:modelValue', clean9);
  } else {
    emit('update:modelValue', clean9.length > 0 ? `+998${clean9}` : '');
  }
};

const handleKeyDown = (event: KeyboardEvent) => {
  // Allow navigation, backspace, delete, tab, enter, copy/paste shortcuts
  const allowedKeys = [
    'Backspace',
    'Delete',
    'Tab',
    'Enter',
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    'Home',
    'End',
  ];

  if (allowedKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
    return;
  }

  // Block any non-digit character
  if (!/^[0-9]$/.test(event.key)) {
    event.preventDefault();
    return;
  }

  // Block if already 9 digits
  const currentDigits = extract9(inputRef.value?.value || '');
  const selectionLength = (inputRef.value?.selectionEnd || 0) - (inputRef.value?.selectionStart || 0);
  
  if (currentDigits.length >= 9 && selectionLength === 0) {
    event.preventDefault();
  }
};
</script>
