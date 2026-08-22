<template>
  <div class="space-y-3.5">
    <!-- 1. AI MASLAHAT CARD (Aynan Foydalanuvchi Ko'rsatgan Original Minimalist Format) -->
    <div class="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs bg-white dark:bg-slate-900 space-y-2.5">
      <div class="flex items-center gap-2.5">
        <div class="w-7 h-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
          <Lightbulb class="w-4 h-4" />
        </div>
        <h3 class="text-xs font-bold text-slate-900 dark:text-white">AI Maslahat</h3>
      </div>

      <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
        Mahsulot nomlarini kiritganda blocklar (blok, por) va dona miqdorini aniq yozing. AI sotish va tan narxlarni hisoblab beradi.
      </p>
    </div>

    <!-- 2. TEZKOR AMALLAR CARD -->
    <div class="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs bg-white dark:bg-slate-900 space-y-3">
      <div class="flex items-center gap-2">
        <div class="w-6.5 h-6.5 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
          <Zap class="w-3.5 h-3.5" />
        </div>
        <h3 class="text-xs font-bold text-slate-900 dark:text-white">Tezkor amallar</h3>
      </div>

      <div class="space-y-2 pt-0.5">
        <button
          type="button"
          @click="$emit('open-excel')"
          class="w-full py-2.5 px-3 rounded-xl bg-emerald-50/80 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-center gap-2 transition shadow-2xs btn-interactive"
        >
          <FileSpreadsheet class="w-3.5 h-3.5 text-emerald-600" />
          <span>Excel'dan import</span>
        </button>

        <button
          type="button"
          @click="$emit('download-report')"
          class="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 transition shadow-2xs btn-interactive"
        >
          <Download class="w-3.5 h-3.5 text-slate-500" />
          <span>Hisobot yuklash</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Lightbulb, Zap, FileSpreadsheet, Download } from 'lucide-vue-next';

defineEmits<{
  (e: 'open-excel'): void;
  (e: 'download-report'): void;
}>();
</script>
