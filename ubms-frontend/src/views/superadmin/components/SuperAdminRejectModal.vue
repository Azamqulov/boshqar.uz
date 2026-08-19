<template>
  <Teleport to="body">
    <div
      v-if="request"
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        class="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl space-y-4"
        @click.stop
      >
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 class="text-sm sm:text-base font-black text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <XCircle class="w-4 h-4" />
            <span>So'rovni Rad Etish</span>
          </h3>
          <button
            type="button"
            @click="$emit('close')"
            class="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <form @submit.prevent="$emit('confirm')" class="space-y-3.5">
          <p class="text-xs text-slate-600 dark:text-slate-300">
            «<strong>{{ request.business?.name }}</strong>» biznesi yuborgan to'lov so'rovini rad etish sababini kiriting:
          </p>

          <div class="space-y-1">
            <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              Rad etish sababi *
            </label>
            <textarea
              v-model="rejectForm.reason"
              rows="3"
              required
              placeholder="Masalan: Chek summasi to'g'ri kelmadi yoki to'lov tasdiqlanmadi..."
              class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-rose-500 font-medium"
            ></textarea>
          </div>

          <div class="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-rose-500/25 disabled:opacity-50 flex items-center gap-1.5 transition"
            >
              <X class="w-4 h-4" />
              <span>{{ loading ? 'Rad etilmoqda...' : 'Rad etish' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import {
  XCircle,
  X,
} from 'lucide-vue-next';

defineProps<{
  request: any;
  rejectForm: {
    reason: string;
  };
  loading: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'confirm'): void;
}>();
</script>
