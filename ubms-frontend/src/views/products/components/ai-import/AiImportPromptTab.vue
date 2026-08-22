<template>
  <div class="space-y-4">
    <!-- Prompt Input Box with Emerald Glow -->
    <div class="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xs p-3.5 sm:p-4 focus-within:border-emerald-500/80 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:shadow-[0_4px_24px_rgba(16,185,129,0.12)] transition-all shadow-xs">
      <div class="flex items-start gap-2.5 mb-2">
        <div class="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles class="w-4 h-4" />
        </div>
        <textarea
          v-model="promptText"
          rows="3"
          placeholder="Masalan: Menda 10 blok 1.5L Kola, 5 blok Pepsi bor. Har blokda 6 tadan. Tan narxi 11 000, sotish 14 000 so'm. Ichimliklar..."
          class="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none resize-none leading-relaxed"
          @keydown.enter.ctrl="onParse"
        ></textarea>
      </div>

      <!-- Bottom action triggers inside textarea -->
      <div class="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800/80 mt-1">
        <div class="flex items-center gap-2">
          <!-- Voice Recognition Button -->
          <button
            type="button"
            @click="$emit('toggle-voice')"
            class="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all btn-interactive"
            :class="
              isListening
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 animate-pulse'
                : 'bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20'
            "
            title="Ovoz orqali tovarlarni kiritish"
          >
            <MicOff v-if="isListening" class="w-3.5 h-3.5" />
            <Mic v-else class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-bounce" />
            <span>{{ isListening ? "Eshitilmoqda... (To'xtatish)" : 'Ovozli Kiritish' }}</span>
          </button>
          <span class="hidden sm:inline text-[11px] text-slate-400 dark:text-slate-500">
            (Ctrl + Enter bilan tahlil)
          </span>
        </div>

        <AppButton
          variant="primary"
          size="sm"
          :icon="Sparkles"
          :loading="parsing"
          :disabled="!promptText.trim() || parsing"
          class="!bg-emerald-600 hover:!bg-emerald-500 !shadow-md !shadow-emerald-500/25"
          @click="onParse"
        >
          AI orqali Tahlil Qilish
        </AppButton>
      </div>
    </div>

    <!-- Quick Prompt Chips -->
    <div class="space-y-2">
      <div class="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
        <Zap class="w-3.5 h-3.5 text-amber-500" />
        <span>Yoki tayyor namunalardan birini tanlang:</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <button
          v-for="(chip, idx) in chips"
          :key="idx"
          type="button"
          @click="$emit('select-chip', chip.text)"
          class="flex items-start gap-3 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10 text-left transition-all group shadow-2xs"
        >
          <div class="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all">
            <component :is="chip.iconComponent" class="w-4 h-4" />
          </div>
          <div class="min-w-0 flex-1">
            <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {{ chip.title }}
            </h4>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {{ chip.text }}
            </p>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Sparkles, Mic, MicOff, Zap } from 'lucide-vue-next';
import AppButton from '@/components/AppButton.vue';
import type { QuickPromptChip } from './types';

const props = defineProps<{
  modelValue: string;
  isListening: boolean;
  parsing: boolean;
  chips: QuickPromptChip[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void;
  (e: 'parse'): void;
  (e: 'toggle-voice'): void;
  (e: 'select-chip', text: string): void;
}>();

const promptText = computed({
  get: () => props.modelValue,
  set: (val: string) => emit('update:modelValue', val),
});

const onParse = () => {
  emit('parse');
};
</script>
