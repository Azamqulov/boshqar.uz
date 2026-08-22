<template>
  <div class="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
    <!-- Pagination (10, 20, 50, next/prev) -->
    <AppPagination
      v-if="totalItems > 0"
      :current-page="currentPage"
      :page-size="pageSize"
      :total-items="totalItems"
      item-name="tovar"
      @update:current-page="$emit('update:currentPage', $event)"
      @update:page-size="$emit('update:pageSize', $event)"
    />

    <!-- Action Buttons Row -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
      <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <ShieldCheck class="w-4 h-4 text-emerald-500 shrink-0" />
        <span>Barcha mahsulotlar va yangi kategoriyalar bitta bosishda omboringizga qo'shiladi.</span>
      </div>

      <div class="flex items-center gap-2.5 self-end sm:self-auto">
        <AppButton
          variant="secondary"
          size="md"
          @click="$emit('cancel')"
        >
          Bekor qilish
        </AppButton>

        <AppButton
          variant="primary"
          size="md"
          :icon="Check"
          :loading="saving"
          :disabled="saving || totalItems === 0"
          class="!bg-emerald-600 hover:!bg-emerald-500 !shadow-lg !shadow-emerald-500/25 font-bold"
          @click="$emit('save')"
        >
          {{ saving ? 'Saqlanmoqda...' : `Barchasini Saqlash (${totalItems} ta)` }}
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check, ShieldCheck } from 'lucide-vue-next';
import AppButton from '@/components/AppButton.vue';
import AppPagination from '@/components/AppPagination.vue';

defineProps<{
  totalItems: number;
  currentPage: number;
  pageSize: number;
  saving: boolean;
}>();

defineEmits<{
  (e: 'update:currentPage', page: number): void;
  (e: 'update:pageSize', size: number): void;
  (e: 'cancel'): void;
  (e: 'save'): void;
}>();
</script>
