<template>
  <div class="space-y-3">
    <p class="text-xs text-slate-500 dark:text-slate-400">
      Biznesingiz turiga mos tayyor katalog to'plamini tanlang va bitta bosish bilan kiritish jadvaliga yuklang:
    </p>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      <div
        v-for="tpl in templates"
        :key="tpl.id"
        class="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 transition-all flex flex-col justify-between space-y-3 shadow-2xs group"
      >
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider">
              {{ tpl.products?.length || 0 }} ta tovar
            </span>
          </div>

          <h4 class="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {{ tpl.title }}
          </h4>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
            {{ tpl.description }}
          </p>
        </div>

        <AppButton
          variant="secondary"
          size="sm"
          :icon="Plus"
          class="w-full"
          @click="$emit('select-template', tpl)"
        >
          Yuklash
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus } from 'lucide-vue-next';
import AppButton from '@/components/AppButton.vue';
import type { CatalogTemplate } from './types';

defineProps<{
  templates: CatalogTemplate[];
}>();

defineEmits<{
  (e: 'select-template', tpl: CatalogTemplate): void;
}>();
</script>
