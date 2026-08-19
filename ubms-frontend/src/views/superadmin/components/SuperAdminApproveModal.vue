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
          <h3 class="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 class="w-4 h-4 text-emerald-500" />
            <span>To'lovni Tasdiqlash</span>
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
          <div class="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-1 text-xs">
            <p class="font-black text-slate-900 dark:text-white">{{ request.business?.name }}</p>
            <p class="text-slate-500 dark:text-slate-400">Egasi: {{ request.business?.owner?.fullName }} ({{ request.business?.owner?.phone }})</p>
            <p class="text-emerald-700 dark:text-emerald-400 font-bold">Tanlangan: {{ request.plan?.name }} • {{ formatMoney(request.amount) }}</p>
          </div>

          <!-- Expiration Date / Duration Selection -->
          <div class="space-y-2">
            <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span class="flex items-center gap-1.5">
                <Calendar class="w-3.5 h-3.5 text-emerald-500" />
                <span>Qaysi Sanagacha Huquq Berish (Amal Qilish Sanasi) *</span>
              </span>
              <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                {{ approveForm.durationDays }} kun
              </span>
            </label>
            <AppDatePicker
              v-model="approveForm.expiresAt"
              @change="$emit('date-change')"
              placeholder="Amal qilish sanasini tanlang"
            />

            <!-- Quick Duration Buttons -->
            <div class="flex flex-wrap gap-1.5 pt-1">
              <button
                type="button"
                @click="$emit('days-change', 30)"
                class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 transition"
              >
                1 oy (30 kun)
              </button>
              <button
                type="button"
                @click="$emit('days-change', 90)"
                class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 transition"
              >
                3 oy
              </button>
              <button
                type="button"
                @click="$emit('days-change', 180)"
                class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 transition"
              >
                6 oy
              </button>
              <button
                type="button"
                @click="$emit('days-change', 365)"
                class="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 transition"
              >
                1 yil (365 kun)
              </button>
              <button
                type="button"
                @click="$emit('days-change', 3650)"
                class="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 text-[11px] font-bold text-purple-700 dark:text-purple-300 border border-purple-500/20 transition"
              >
                10 yil (Cheksiz)
              </button>
            </div>
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
              class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-500/25 disabled:opacity-50 flex items-center gap-1.5 transition"
            >
              <Check class="w-4 h-4 stroke-[3]" />
              <span>{{ loading ? 'Faollashtirilmoqda...' : 'Tasdiqlash & Faollashtirish' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import {
  CheckCircle2,
  X,
  Calendar,
  Check,
} from 'lucide-vue-next';
import AppDatePicker from '@/components/AppDatePicker.vue';

defineProps<{
  request: any;
  approveForm: {
    expiresAt: string;
    durationDays: number;
  };
  loading: boolean;
  formatMoney: (val: any) => string;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'confirm'): void;
  (e: 'date-change'): void;
  (e: 'days-change', days: number): void;
}>();
</script>
