<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <AppStatCard
      title="Jami Mijozlar"
      :value="`${customersCount} ta`"
      subtitle="CRM mijozlar ro'yxati"
      :icon="Users"
      variant="blue"
    />

    <AppStatCard
      title="Jami Nasiya / Qarzlar"
      :value="formatCurrency(totalDebtAmount)"
      subtitle="Mijozlar qarzdorligi"
      :icon="TrendingDown"
      variant="rose"
    />

    <AppStatCard
      title="Qarzdor Mijozlar"
      :value="`${debtorCustomersCount} ta`"
      subtitle="Faol nasiyadorlar"
      :icon="AlertCircle"
      variant="amber"
    />

    <AppStatCard
      title="Jami Savdo Summasi"
      :value="formatCurrency(totalCustomersSpent)"
      subtitle="Mijozlar xaridlari"
      :icon="DollarSign"
      variant="emerald"
    />
  </div>
</template>

<script setup lang="ts">
import { Users, TrendingDown, AlertCircle, DollarSign } from 'lucide-vue-next';
import AppStatCard from '../../../components/AppStatCard.vue';
import { useFormat } from '../../../composables/useFormat';

defineProps<{
  customersCount: number;
  totalDebtAmount: number;
  debtorCustomersCount: number;
  totalCustomersSpent: number;
}>();

const { formatCurrency } = useFormat();
</script>
