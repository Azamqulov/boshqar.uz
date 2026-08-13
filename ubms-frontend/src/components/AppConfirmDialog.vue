<script setup lang="ts">
import AppButton from './AppButton.vue';
import { AlertTriangle, HelpCircle, X } from 'lucide-vue-next';

interface Props {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'default';
  loading?: boolean;
}

withDefaults(defineProps<Props>(), {
  title: 'Tasdiqlash',
  confirmText: 'Ha, tasdiqlayman',
  cancelText: 'Bekor qilish',
  variant: 'default',
  loading: false,
});

defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm transition-opacity"
      @click.self="$emit('cancel')"
    >
      <div
        class="glass-card rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 space-y-4 animate-in fade-in zoom-in-95 duration-150"
      >
        <div class="flex items-start gap-3.5">
          <div
            class="p-2.5 rounded-xl flex-shrink-0"
            :class="variant === 'danger' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'"
          >
            <AlertTriangle v-if="variant === 'danger'" class="w-5 h-5" />
            <HelpCircle v-else class="w-5 h-5" />
          </div>

          <div class="flex-1">
            <h3 class="font-bold text-sm text-slate-900 dark:text-white">{{ title }}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{{ message }}</p>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <AppButton
            variant="ghost"
            size="sm"
            :disabled="loading"
            @click="$emit('cancel')"
          >
            {{ cancelText }}
          </AppButton>

          <AppButton
            :variant="variant === 'danger' ? 'danger' : 'primary'"
            size="sm"
            :loading="loading"
            @click="$emit('confirm')"
          >
            {{ confirmText }}
          </AppButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>
