<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- 1. Total Businesses -->
    <div class="glass-card rounded-2xl p-5 relative overflow-hidden group">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Jami Bizneslar</span>
        <div class="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <Building2 class="w-5 h-5" />
        </div>
      </div>
      <p class="text-2xl font-black text-slate-900 dark:text-white mt-3 font-mono">
        {{ stats.totalBusinesses || 0 }} <span class="text-xs font-sans text-slate-400 font-normal">ta tenant</span>
      </p>
      <p class="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
        <Activity class="w-3.5 h-3.5" /> Faol va sinov rejimida
      </p>
    </div>

    <!-- 2. Total Users -->
    <div class="glass-card rounded-2xl p-5 relative overflow-hidden group">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Jami Foydalanuvchilar</span>
        <div class="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          <Users class="w-5 h-5" />
        </div>
      </div>
      <p class="text-2xl font-black text-slate-900 dark:text-white mt-3 font-mono">
        {{ stats.totalUsers || 0 }} <span class="text-xs font-sans text-slate-400 font-normal">nafar</span>
      </p>
      <p class="text-[11px] text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1 font-medium">
        <UserCheck class="w-3.5 h-3.5" /> Barcha filiallar kesimida
      </p>
    </div>

    <!-- 3. Total GMV -->
    <div class="glass-card rounded-2xl p-5 relative overflow-hidden group">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Umumiy Savdo (GMV)</span>
        <div class="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <DollarSign class="w-5 h-5" />
        </div>
      </div>
      <p class="text-2xl font-black text-slate-900 dark:text-white mt-3 font-mono">
        {{ formatCurrency(stats.totalGMV || 0) }}
      </p>
      <p class="text-[11px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1 font-medium">
        <TrendingUp class="w-3.5 h-3.5" /> Platforma umumiy aylanmasi
      </p>
    </div>

    <!-- 4. Total Orders & Products -->
    <div class="glass-card rounded-2xl p-5 relative overflow-hidden group">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Jami Buyurtmalar</span>
        <div class="p-2.5 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
          <ShoppingBag class="w-5 h-5" />
        </div>
      </div>
      <p class="text-2xl font-black text-slate-900 dark:text-white mt-3 font-mono">
        {{ stats.totalOrders || 0 }} <span class="text-xs font-sans text-slate-400 font-normal">ta chek</span>
      </p>
      <p class="text-[11px] text-teal-600 dark:text-teal-400 mt-1 flex items-center gap-1 font-medium">
        <Package class="w-3.5 h-3.5" /> {{ stats.totalProducts || 0 }} ta tovar katalogda
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Building2, Activity, Users, UserCheck, DollarSign, TrendingUp, ShoppingBag, Package } from 'lucide-vue-next';
import { useFormat } from '../../../composables/useFormat';

defineProps<{
  stats: any;
}>();

const { formatCurrency } = useFormat();
</script>
