<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <AppStatCard
      title="Ombor Qiymati (Tannarx)"
      :value="formatCurrency(totalInventoryValue)"
      subtitle="Jami ombor qoldig'i tannarxi"
      :icon="Boxes"
      variant="amber"
    />

    <AppStatCard
      title="Jami Pozitsiyalar"
      :value="`${inventoryCount} ta`"
      subtitle="Ombordagi tovar turlari"
      :icon="Package"
      variant="blue"
    />

    <AppStatCard
      title="Kam Qolgan Pozitsiyalar"
      :value="`${lowStockCount} ta`"
      subtitle="Min-chegara ostidagi tovarlar"
      :icon="AlertTriangle"
      variant="rose"
    />

    <AppStatCard
      title="Tugagan Mahsulotlar"
      :value="`${outOfStockCount} ta`"
      subtitle="Nol qoldiq pozitsiyalar"
      :icon="XCircle"
      variant="slate"
    />
  </div>
</template>

<script setup lang="ts">
import { Boxes, Package, AlertTriangle, XCircle } from 'lucide-vue-next';
import AppStatCard from '../../../components/AppStatCard.vue';
import { useFormat } from '../../../composables/useFormat';

defineProps<{
  totalInventoryValue: number;
  inventoryCount: number;
  lowStockCount: number;
  outOfStockCount: number;
}>();

const { formatCurrency } = useFormat();
</script>
