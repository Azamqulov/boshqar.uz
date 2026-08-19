<template>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <AppStatCard
      title="Jami Kategoriyalar"
      :value="`${totalCount} ta`"
      subtitle="Mavjud toifalar soni"
      :icon="FolderTree"
      variant="blue"
    />

    <AppStatCard
      title="Mahsulotli Kategoriyalar"
      :value="`${activeCount} ta`"
      subtitle="Faol tovarlar biriktirilgan"
      :icon="CheckCircle2"
      variant="emerald"
    />

    <AppStatCard
      title="Biriktirilgan Mahsulotlar"
      :value="`${associatedProductsCount} ta`"
      subtitle="Kategoriyalardagi tovarlar"
      :icon="Package"
      variant="amber"
    />
  </div>
</template>

<script setup lang="ts">
import { FolderTree, CheckCircle2, Package } from 'lucide-vue-next';
import AppStatCard from '../../../components/AppStatCard.vue';

defineProps<{
  totalCount: number;
  activeCount: number;
  associatedProductsCount: number;
}>();
</script>
