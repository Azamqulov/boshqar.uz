<template>
  <Teleport to="body">
    <div
      class="fixed top-4 right-4 z-[999999999] flex flex-col space-y-2.5 max-w-sm w-[calc(100vw-2rem)] sm:w-full pointer-events-none"
      style="z-index: 999999999;"
      aria-live="polite"
      aria-atomic="true"
    >
      <transition-group name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          role="alert"
          class="pointer-events-auto p-4 rounded-2xl border shadow-2xl flex items-start space-x-3 transition-all duration-200 transform select-none"
          :class="[
            t.type === 'success'
              ? 'bg-white dark:bg-slate-900 border-emerald-500/40 text-emerald-950 dark:text-emerald-200 shadow-emerald-500/10 ring-1 ring-emerald-500/20'
              : t.type === 'error'
              ? 'bg-white dark:bg-slate-900 border-rose-500/40 text-rose-950 dark:text-rose-200 shadow-rose-500/10 ring-1 ring-rose-500/20'
              : t.type === 'warning'
              ? 'bg-white dark:bg-slate-900 border-amber-500/40 text-amber-950 dark:text-amber-200 shadow-amber-500/10 ring-1 ring-amber-500/20'
              : 'bg-white dark:bg-slate-900 border-blue-500/40 text-blue-950 dark:text-blue-200 shadow-blue-500/10 ring-1 ring-blue-500/20'
          ]"
        >
          <!-- Type-specific Icon Chip -->
          <div
            class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            :class="[
              t.type === 'success'
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                : t.type === 'error'
                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                : t.type === 'warning'
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                : 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
            ]"
          >
            <CheckCircle2 v-if="t.type === 'success'" class="w-5 h-5" />
            <AlertCircle v-else-if="t.type === 'error'" class="w-5 h-5" />
            <AlertTriangle v-else-if="t.type === 'warning'" class="w-5 h-5" />
            <Info v-else class="w-5 h-5" />
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0 pt-0.5">
            <h4
              v-if="t.title"
              class="font-black text-xs text-slate-900 dark:text-white leading-tight mb-0.5 tracking-tight"
            >
              {{ t.title }}
            </h4>
            <p class="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed break-words">
              {{ t.message }}
            </p>
          </div>

          <!-- Close Button -->
          <button
            type="button"
            @click="remove(t.id)"
            class="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
            title="Yopish"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </transition-group>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast } from '../composables/useToast';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-vue-next';

const { toasts, remove } = useToast();
</script>
