<template>
  <!-- 1-RASMDAGI AYNAN BERINGAN IDEAL MINIMALIST FULL-WIDTH BANNER (100% Sig'adi, Kesilmaydi) -->
  <div class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4 transition duration-200">
    <div class="flex items-center gap-3.5">
      <!-- Mitti 3D Kitobcha Icon (Oq ramkasiz, toza 3D rendering) -->
      <div class="w-10 h-10 sm:w-11 sm:h-11 shrink-0 flex items-center justify-center">
        <img
          src="@/assets/images/ai-mini-book.jpg"
          alt="Boshqar AI Icon"
          class="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
        />
      </div>

      <div>
        <h3 class="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
          Topa olmadingizmi?
        </h3>
        <p class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
          Boshqar AI sizga yordam beradi.
        </p>
      </div>
    </div>

    <button
      type="button"
      @click="$emit('focus-chat')"
      class="w-full sm:w-auto px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 shrink-0 btn-interactive"
    >
      <Sparkles class="w-3.5 h-3.5" />
      <span>AI bilan so'rashni boshlash</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next';

defineEmits<{
  (e: 'focus-chat'): void;
}>();
</script>
