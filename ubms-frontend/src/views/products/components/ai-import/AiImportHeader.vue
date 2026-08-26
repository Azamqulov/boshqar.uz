<template>
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 mb-2 font-medium">
        <router-link to="/dashboard" class="flex items-center gap-1.5 hover:text-emerald-600 transition">
          <Home class="w-3.5 h-3.5" />
          <span>Bosh sahifa</span>
        </router-link>
        <span>/</span>
        <span class="text-slate-700 dark:text-slate-300 font-semibold">Mahsulotlar kiritish</span>
      </nav>

      <!-- Main Title with Box Icon -->
      <div class="flex items-center gap-3.5">
        <div class="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center shrink-0 shadow-xs text-emerald-600 dark:text-emerald-400">
          <Package class="w-6 h-6" />
        </div>
        <div>
          <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">AI Mahsulot Kiritish</h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">AI yordamida mahsulotlarni tez va oson tarzda katalogingizga qo'shing</p>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-wrap items-center gap-2">
      <router-link
        to="/products"
        class="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 transition btn-interactive"
      >
        <Package class="w-4 h-4 text-emerald-500" />
        <span>Barcha Mahsulotlar</span>
      </router-link>

      <button
        type="button"
        @click="$emit('open-excel')"
        class="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 transition btn-interactive cursor-pointer"
      >
        <FileSpreadsheet class="w-4 h-4 text-emerald-500" />
        <span>Excel / 1C Import</span>
      </button>

      <button
        type="button"
        @click="$emit('open-excel')"
        class="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition btn-interactive cursor-pointer"
        title="Qog'oz faktura rasmidan 1 sekundda 100 ta mahsulotni avto-kirim qilish"
      >
        <Camera class="w-4 h-4" />
        <span>Faktura OCR Skanner</span>
      </button>


      <router-link
        to="/categories"
        class="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 transition btn-interactive"
      >
        <FolderTree class="w-4 h-4 text-emerald-500" />
        <span>Kategoriyalar ({{ categoriesCount }})</span>
      </router-link>

      <button
        type="button"
        @click="$emit('open-create')"
        class="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition btn-interactive"
      >
        <Plus class="w-4 h-4" />
        <span>Yangi Mahsulot Qo'shish</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Home, Package, FileSpreadsheet, FolderTree, Plus, Camera } from 'lucide-vue-next';


defineProps<{
  categoriesCount: number;
}>();

defineEmits<{
  (e: 'open-excel'): void;
  (e: 'open-create'): void;
}>();
</script>
