<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <AppStatCard
      title="Jami Mahsulotlar"
      :value="`${productsCount} ta`"
      subtitle="Katalogdagi mahsulotlar"
      :icon="Package"
      variant="blue"
    />

    <AppStatCard
      title="Faol Sotuvda"
      :value="`${activeProductsCount} ta`"
      subtitle="Mavjud va sotilayotgan"
      :icon="CheckCircle2"
      variant="emerald"
    />

    <AppStatCard
      title="Kam Qolgan Pozitsiyalar"
      :value="`${lowStockCount} ta`"
      subtitle="Minimal chegara pastida"
      :icon="AlertTriangle"
      variant="amber"
    />

    <AppStatCard
      title="Kategoriyalar Soni"
      :value="`${categoriesCount} ta`"
      subtitle="Mahsulot toifalari"
      :icon="FolderTree"
      variant="purple"
    />
  </div>
</template>

<script setup lang="ts">
import { Package, CheckCircle2, AlertTriangle, FolderTree } from 'lucide-vue-next';
import AppStatCard from '../../../components/AppStatCard.vue';

defineProps<{
  productsCount: number;
  activeProductsCount: number;
  lowStockCount: number;
  categoriesCount: number;
}>();
</script>
