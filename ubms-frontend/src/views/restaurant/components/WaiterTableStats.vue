<template>
  <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 shrink-0">
    <AppStatCard
      title="Jami Stollar"
      :value="`${tablesCount} ta`"
      subtitle="Restorandagi barcha stollar"
      :icon="UtensilsCrossed"
      variant="blue"
    />

    <AppStatCard
      title="Bo'sh Stollar"
      :value="`${freeTablesCount} ta`"
      subtitle="Yangi mijozlar uchun tayyor"
      :icon="CheckCircle2"
      variant="emerald"
    />

    <AppStatCard
      title="Band Stollar"
      :value="`${occupiedTablesCount} ta`"
      subtitle="Mijozlar o'tirgan / buyurtma bor"
      :icon="Users"
      variant="rose"
    />

    <AppStatCard
      title="Jami Sig'im"
      :value="`${totalCapacity} o'rin`"
      subtitle="Zalning umumiy o'tirish joyi"
      :icon="Building"
      variant="purple"
    />
  </div>
</template>

<script setup lang="ts">
import { UtensilsCrossed, CheckCircle2, Users, Building } from 'lucide-vue-next';
import AppStatCard from '../../../components/AppStatCard.vue';

defineProps<{
  tablesCount: number;
  freeTablesCount: number;
  occupiedTablesCount: number;
  totalCapacity: number;
}>();
</script>
