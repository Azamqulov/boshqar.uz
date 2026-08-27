<script setup lang="ts">
import { computed, ref } from 'vue';
import { Eye, EyeOff } from 'lucide-vue-next';

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
  id?: string;
  ariaLabel?: string;
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

const showPassword = ref(false);
const computedType = computed(() => {
  if (props.type === 'password') {
    return showPassword.value ? 'text' : 'password';
  }
  return props.type;
});

const inputId = computed(() => props.id || (props.label ? `input-${props.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : undefined));
const errorId = computed(() => inputId.value ? `${inputId.value}-error` : undefined);
const hintId = computed(() => inputId.value ? `${inputId.value}-hint` : undefined);

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
    <label
      v-if="label"
      :for="inputId"
      class="block text-xs font-bold text-slate-700 dark:text-slate-300"
    >
      {{ label.replace(/\s*\*+$/, '') }} <span v-if="required || label.includes('*')" class="text-rose-500">*</span>
    </label>

    <div class="relative flex items-center">
      <div v-if="icon" class="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center" aria-hidden="true">
        <component :is="icon" class="w-4 h-4" />
      </div>

      <input
        :id="inputId"
        :value="modelValue"
        :type="computedType"
        :step="step"
        :min="min"
        :max="max"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :aria-invalid="!!error"
        :aria-errormessage="error ? errorId : undefined"
        :aria-describedby="error ? errorId : (hint ? hintId : undefined)"
        :aria-label="ariaLabel || (!label ? placeholder : undefined)"
        class="w-full h-[42px] rounded-xl bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white placeholder-slate-400 text-xs px-3.5 outline-none transition duration-200 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-emerald-500"
        :class="[
          icon ? 'pl-9' : '',
          type === 'password' ? 'pr-10' : '',
          error
            ? 'border-rose-400 dark:border-rose-600 focus:border-rose-500'
            : 'border-slate-300 dark:border-slate-700 focus:border-emerald-500',
        ]"
        @input="handleInput"
      />

      <button
        v-if="type === 'password'"
        type="button"
        @click="showPassword = !showPassword"
        class="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition p-1 rounded focus:outline-none cursor-pointer"
        :title="showPassword ? 'Parolni yashirish' : 'Parolni ko\'rish'"
        tabindex="-1"
      >
        <EyeOff v-if="showPassword" class="w-4 h-4" />
        <Eye v-else class="w-4 h-4" />
      </button>
    </div>

    <span v-if="error" :id="errorId" class="text-[11px] text-rose-500 font-medium" role="alert">{{ error }}</span>
    <span v-else-if="hint" :id="hintId" class="text-[11px] text-slate-400 dark:text-slate-500">{{ hint }}</span>
  </div>
</template>
