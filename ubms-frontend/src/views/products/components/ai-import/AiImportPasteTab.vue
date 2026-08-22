<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <span class="text-xs text-slate-500 dark:text-slate-400">
        Excel, Telegram yoki qog'oz fakturadan nusxalangan qatorlarni joylang:
      </span>
      <button
        type="button"
        @click="$emit('paste-sample')"
        class="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
      >
        <span>Namunani ko'rish</span>
      </button>
    </div>

    <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-3 focus-within:border-emerald-500/80 focus-within:ring-2 focus-within:ring-emerald-500/15 transition-all">
      <textarea
        v-model="pasteText"
        rows="4"
        placeholder="Coca-Cola 1.5L - 11000/14000 - 60 dona&#10;Pepsi 0.5L - 6000/8000 - 48 dona&#10;Snickers Super - 9500/12000 - 48 dona"
        class="w-full bg-transparent text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 outline-none resize-none"
      ></textarea>

      <div class="flex items-center justify-end pt-2 border-t border-slate-200/60 dark:border-slate-700/60 mt-1">
        <AppButton
          variant="primary"
          size="sm"
          :icon="FileText"
          :loading="parsing"
          :disabled="!pasteText.trim() || parsing"
          @click="$emit('parse')"
        >
          Jadvalga Joylash
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { FileText } from 'lucide-vue-next';
import AppButton from '@/components/AppButton.vue';

const props = defineProps<{
  modelValue: string;
  parsing: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void;
  (e: 'parse'): void;
  (e: 'paste-sample'): void;
}>();

const pasteText = computed({
  get: () => props.modelValue,
  set: (val: string) => emit('update:modelValue', val),
});
</script>
