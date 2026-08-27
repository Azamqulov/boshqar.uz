<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    <div
      v-for="cat in categories"
      :key="cat.id"
      class="glass-card rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition group border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90"
    >
      <div>
        <!-- Header Bar with Color Pill & Icon -->
        <div class="flex items-start justify-between gap-2 mb-3">
          <div class="flex items-center gap-2.5">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-slate-200/80 dark:border-slate-700"
              :style="{ backgroundColor: (cat.color || '#10b981') + '20', color: cat.color || '#10b981' }"
            >
              <CategoryIcon :icon="cat.icon" iconClass="w-5 h-5" />
            </div>
            <div>
              <h4 class="font-black text-sm text-slate-900 dark:text-white line-clamp-1">
                {{ cat.name }}
              </h4>
              <span class="text-[11px] text-slate-400 block font-mono">
                {{ getProductCount(cat.id) }} ta mahsulot
              </span>
            </div>
          </div>

          <!-- Color dot -->
          <span
            class="w-3 h-3 rounded-full shrink-0 shadow-sm mt-1"
            :style="{ backgroundColor: cat.color || '#10b981' }"
            :title="cat.color || '#10b981'"
          ></span>
        </div>

        <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs flex justify-between items-center">
          <span class="text-slate-400">Holat:</span>
          <span
            class="font-bold text-[11px]"
            :class="getProductCount(cat.id) > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'"
          >
            {{ getProductCount(cat.id) > 0 ? 'Faol' : 'Bo\'sh' }}
          </span>
        </div>
      </div>

      <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span class="text-[10px] text-slate-400 font-mono font-bold">{{ cat.color || '#10b981' }}</span>

        <div class="flex items-center gap-1">
          <button
            v-if="canEdit('products')"
            @click="$emit('edit', cat)"
            class="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Tahrirlash"
          >
            <Edit2 class="w-4 h-4" />
          </button>
          <button
            v-if="canDelete('products')"
            @click="$emit('delete', cat)"
            class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
            title="O'chirish"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Edit2, Trash2 } from 'lucide-vue-next';
import CategoryIcon from '../../../components/CategoryIcon.vue';
import { usePermissions } from '../../../composables/usePermissions';

const { canEdit, canDelete } = usePermissions();

defineProps<{
  categories: any[];
  getProductCount: (id: string) => number;
}>();

defineEmits<{
  (e: 'edit', cat: any): void;
  (e: 'delete', cat: any): void;
}>();
</script>
