<template>
  <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
    <div class="flex-1">
      <AppInput
        :model-value="searchQuery"
        @update:model-value="$emit('update:searchQuery', $event)"
        placeholder="Mahsulot nomi, SKU yoki shtrix-kod bo'yicha qidiruv..."
        :icon="Search"
      />
    </div>
    <div class="w-full sm:w-64">
      <AppSelect
        :model-value="selectedCategoryId"
        @update:model-value="$emit('update:selectedCategoryId', $event)"
        :options="categoryFilterOptions"
        :searchable="true"
        placeholder="Barcha Kategoriyalar"
      />
    </div>
    <AppViewToggle
      class="inline-flex shrink-0"
      :model-value="viewMode"
      @update:model-value="$emit('update:viewMode', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { Search } from 'lucide-vue-next';
import AppInput from '../../../components/AppInput.vue';
import AppSelect, { SelectOption } from '../../../components/AppSelect.vue';
import AppViewToggle from '../../../components/AppViewToggle.vue';

defineProps<{
  searchQuery: string;
  selectedCategoryId: string;
  categoryFilterOptions: SelectOption[];
  viewMode: 'table' | 'grid';
}>();

defineEmits<{
  (e: 'update:searchQuery', val: string): void;
  (e: 'update:selectedCategoryId', val: string): void;
  (e: 'update:viewMode', val: 'table' | 'grid'): void;
}>();
</script>
