<template>
  <div class="glass-card rounded-2xl overflow-hidden shadow-sm">
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead class="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-semibold">
          <tr>
            <th class="py-3.5 px-4">Kategoriya Nomi</th>
            <th class="py-3.5 px-4">Rang Tusi</th>
            <th class="py-3.5 px-4">Mahsulotlar Soni</th>
            <th class="py-3.5 px-4 text-center">Holati</th>
            <th class="py-3.5 px-4 text-right">Amallar</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
          <tr
            v-for="cat in categories"
            :key="cat.id"
            class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition group"
          >
            <!-- Name & Emoji -->
            <td class="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-slate-200/80 dark:border-slate-700 overflow-hidden"
                  :style="{ backgroundColor: (cat.color || '#10b981') + '18', color: cat.color || '#10b981' }"
                >
                  <CategoryIcon :icon="cat.icon" iconClass="w-5 h-5" />
                </div>
                <div class="min-w-0">
                  <span class="block text-slate-900 dark:text-white font-bold text-sm truncate">{{ cat.name }}</span>
                  <span v-if="cat.description" class="text-[11px] text-slate-400 truncate block">{{ cat.description }}</span>
                </div>
              </div>
            </td>

            <!-- Color Badge -->
            <td class="py-3.5 px-4">
              <span
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold font-mono"
                :style="{ backgroundColor: (cat.color || '#10b981') + '15', color: cat.color || '#10b981' }"
              >
                <span class="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" :style="{ backgroundColor: cat.color || '#10b981' }"></span>
                <span>{{ cat.color || '#10b981' }}</span>
              </span>
            </td>

            <!-- Product Count -->
            <td class="py-3.5 px-4 font-mono font-bold">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs">
                <Package class="w-3.5 h-3.5 text-slate-400" />
                <span>{{ getProductCount(cat.id) }} ta tovar</span>
              </span>
            </td>

            <!-- Status -->
            <td class="py-3.5 px-4 text-center">
              <span
                class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border"
                :class="getProductCount(cat.id) > 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'"
              >
                {{ getProductCount(cat.id) > 0 ? 'Faol (Mahsulotli)' : 'Bo\'sh' }}
              </span>
            </td>

            <!-- Actions -->
            <td class="py-3.5 px-4 text-right">
              <div class="flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  @click="$emit('edit', cat)"
                  class="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Tahrirlash"
                >
                  <Edit2 class="w-4 h-4" />
                </button>
                <button
                  type="button"
                  @click="$emit('delete', cat)"
                  class="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                  title="O'chirish"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Package, Edit2, Trash2 } from 'lucide-vue-next';
import CategoryIcon from '../../../components/CategoryIcon.vue';

defineProps<{
  categories: any[];
  getProductCount: (id: string) => number;
}>();

defineEmits<{
  (e: 'edit', cat: any): void;
  (e: 'delete', cat: any): void;
}>();
</script>
