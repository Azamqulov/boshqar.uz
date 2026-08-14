<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-3.5">
    <AppStatCard
      title="Bugungi Savdo"
      :value="formatCurrency(summary.todaySales)"
      subtitle="Yopilgan cheklar"
      :icon="DollarSign"
      variant="emerald"
      to="/finance"
    />

    <AppStatCard
      title="Bugungi Xarajat"
      :value="formatCurrency(summary.todayExpenses)"
      subtitle="Operatsion xarajatlar"
      :icon="TrendingDown"
      variant="rose"
      to="/finance"
    />

    <AppStatCard
      title="Sof Foyda"
      :value="formatCurrency(summary.todayProfit)"
      subtitle="Savdo − COGS − Xarajat"
      :icon="TrendingUp"
      variant="blue"
      to="/finance"
    />

    <AppStatCard
      title="Buyurtmalar"
      :value="`${summary.todayOrdersCount} ta`"
      subtitle="Bugungi kassa tranzaksiyalari"
      :icon="ShoppingBag"
      variant="purple"
      to="/pos"
    />

    <AppStatCard
      title="Ombor Qiymati"
      :value="formatCurrency(summary.totalInventoryValue)"
      subtitle="Tannarx bo'yicha qoldiq"
      :icon="Boxes"
      variant="amber"
      to="/inventory"
    />

    <AppStatCard
      title="Mijoz Qarzdorligi"
      :value="formatCurrency(summary.totalCustomerDebt)"
      subtitle="Nasiya daftari"
      :icon="Users"
      variant="indigo"
      to="/customers"
    />
  </div>
</template>

<script setup lang="ts">
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  ShoppingBag,
  Boxes,
  Users,
} from 'lucide-vue-next';
import AppStatCard from '../../../components/AppStatCard.vue';
import { useFormat } from '../../../composables/useFormat';

defineProps<{
  summary: any;
}>();

const { formatCurrency } = useFormat();
</script>
