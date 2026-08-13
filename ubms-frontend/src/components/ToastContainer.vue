<template>
  <div class="fixed top-4 right-4 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none">
    <transition-group name="toast">
      <div
        v-for="t in toasts"
        :key="t.id"
        class="pointer-events-auto p-4 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-start space-x-3 transition-all"
        :class="[
          t.type === 'success'
            ? 'bg-white/95 text-emerald-900 border-emerald-500/40 shadow-emerald-500/10 dark:bg-slate-900/95 dark:border-emerald-500/40 dark:text-emerald-300 dark:shadow-emerald-950/40'
            : t.type === 'error'
            ? 'bg-white/95 text-rose-900 border-rose-500/40 shadow-rose-500/10 dark:bg-slate-900/95 dark:border-rose-500/40 dark:text-rose-300 dark:shadow-rose-950/40'
            : t.type === 'warning'
            ? 'bg-white/95 text-amber-900 border-amber-500/40 shadow-amber-500/10 dark:bg-slate-900/95 dark:border-amber-500/40 dark:text-amber-300 dark:shadow-amber-950/40'
            : 'bg-white/95 text-blue-900 border-blue-500/40 shadow-blue-500/10 dark:bg-slate-900/95 dark:border-blue-500/40 dark:text-blue-300 dark:shadow-blue-950/40'
        ]"
      >
        <!-- Icon -->
        <div class="flex-shrink-0 mt-0.5">
          <CheckCircle2 v-if="t.type === 'success'" class="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
          <AlertCircle v-else-if="t.type === 'error'" class="w-5 h-5 text-rose-500 dark:text-rose-400" />
          <AlertTriangle v-else-if="t.type === 'warning'" class="w-5 h-5 text-amber-500 dark:text-amber-400" />
          <Info v-else class="w-5 h-5 text-blue-500 dark:text-blue-400" />
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <h4 v-if="t.title" class="font-bold text-xs text-slate-900 dark:text-white">{{ t.title }}</h4>
          <p class="text-xs text-slate-700 dark:text-slate-200 mt-0.5 leading-relaxed">{{ t.message }}</p>
        </div>

        <!-- Close Button -->
        <button
          @click="remove(t.id)"
          class="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '../composables/useToast';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-vue-next';

const { toasts, remove } = useToast();
</script>
