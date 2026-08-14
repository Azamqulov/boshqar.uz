<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <AppStatCard
      title="Jami Ta'minotchilar"
      :value="`${suppliersCount} ta`"
      subtitle="Firmalar va yetkazib beruvchilar"
      :icon="Truck"
      variant="blue"
    />

    <AppStatCard
      title="Bizning Qarzimiz (Ta'minotga)"
      :value="formatCurrency(totalSupplierDebt)"
      subtitle="Ta'minotchilardan qarzlar"
      :icon="TrendingDown"
      variant="rose"
    />

    <AppStatCard
      title="Qarzdor Ta'minotchilar"
      :value="`${debtorSuppliersCount} ta`"
      subtitle="Haqdor yetkazib beruvchilar"
      :icon="AlertCircle"
      variant="amber"
    />

    <AppStatCard
      title="Hisob-kitobi Yo'qotilgan"
      :value="`${settledSuppliersCount} ta`"
      subtitle="Balansi yopilgan firmalar"
      :icon="CheckCircle2"
      variant="emerald"
    />
  </div>
</template>

<script setup lang="ts">
import { Truck, TrendingDown, AlertCircle, CheckCircle2 } from 'lucide-vue-next';
import AppStatCard from '../../../components/AppStatCard.vue';
import { useFormat } from '../../../composables/useFormat';

defineProps<{
  suppliersCount: number;
  totalSupplierDebt: number;
  debtorSuppliersCount: number;
  settledSuppliersCount: number;
}>();

const { formatCurrency } = useFormat();
</script>
