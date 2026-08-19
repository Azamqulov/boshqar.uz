<template>
  <Teleport to="body">
    <div v-if="isOpen" @click.self="$emit('close')" class="modal-overlay">
      <div class="modal-container max-w-md" @click.stop>
        <div class="modal-header border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-2.5">
            <div class="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              <Trash2 class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white">Audit Jurnallarini Tozalash</h3>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">Biznesingizdagi eski audit ma'lumotlarini o'chirish</p>
            </div>
          </div>
          <button
            type="button"
            @click="$emit('close')"
            class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="modal-body p-4 space-y-3.5 text-xs">
          <p class="text-slate-600 dark:text-slate-300 leading-relaxed">
            Baza hajmini tejash va eski harakatlarni tozalash uchun muddatni tanlang:
          </p>

          <!-- Options Radio Group -->
          <div class="space-y-2">
            <label
              v-for="opt in cleanupOptions"
              :key="opt.value"
              class="flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer"
              :class="
                selectedPeriod === opt.value
                  ? 'border-rose-500/80 bg-rose-500/10 text-slate-900 dark:text-white ring-1 ring-rose-500/30'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50'
              "
            >
              <input
                type="radio"
                name="settingsCleanupPeriod"
                :value="opt.value"
                :checked="selectedPeriod === opt.value"
                @change="$emit('update:selectedPeriod', opt.value)"
                class="mt-0.5 text-rose-600 focus:ring-rose-500"
              />
              <div class="min-w-0">
                <span class="font-bold block text-slate-900 dark:text-white text-xs">{{ opt.label }}</span>
                <span class="text-[11px] text-slate-400 block mt-0.5">{{ opt.desc }}</span>
              </div>
            </label>
          </div>

          <!-- Warning notice -->
          <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] flex items-start gap-2">
            <AlertTriangle class="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
            <span>Diqqat: O'chirilgan audit ma'lumotlarini qayta tiklab bo'lmaydi.</span>
          </div>
        </div>

        <div class="modal-footer border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 p-3">
          <button
            type="button"
            @click="$emit('close')"
            :disabled="cleaningUp"
            class="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Bekor qilish
          </button>
          <button
            type="button"
            @click="$emit('prompt-confirm')"
            :disabled="cleaningUp"
            class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/25 transition btn-interactive disabled:opacity-50"
          >
            <Trash2 class="w-3.5 h-3.5" />
            <span>Tozalash</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import {
  Trash2,
  X,
  AlertTriangle,
} from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
  selectedPeriod: string;
  cleanupOptions: { value: string; label: string; desc: string }[];
  cleaningUp: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'update:selectedPeriod', val: string): void;
  (e: 'prompt-confirm'): void;
}>();
</script>
