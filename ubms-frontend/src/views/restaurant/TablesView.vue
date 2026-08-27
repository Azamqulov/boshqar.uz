<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-white tracking-tight">Restoran Stollar Xaritasi</h1>
        <p class="text-xs text-slate-400 mt-0.5">Zaldagi stollar holati, buyurtmalar va bandlik</p>
      </div>

      <div v-if="canAccessKds" class="flex items-center space-x-2">
        <router-link
          to="/restaurant/kds"
          class="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-xs transition"
        >
          <Flame class="w-4 h-4" />
          <span>Oshxona (KDS) Ekraniga O'tish</span>
        </router-link>
      </div>
    </div>

    <!-- Table Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
      <div
        v-for="table in tables"
        :key="table.id"
        class="glass-card rounded-2xl p-5 border flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02]"
        :class="getTableClass(table.status)"
        @click="handleTableClick(table)"
      >
        <div class="flex items-center justify-between">
          <span class="font-extrabold text-base text-white">{{ table.name }}</span>
          <span class="text-xs px-2 py-0.5 rounded-full uppercase font-bold" :class="getStatusBadgeClass(table.status)">
            {{ getStatusLabel(table.status) }}
          </span>
        </div>

        <div class="my-4 text-center">
          <span class="text-3xl font-black text-white">{{ table.capacity }}</span>
          <p class="text-[10px] text-slate-400">kishilik stol</p>
        </div>

        <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span v-if="table.orders?.[0]" class="text-emerald-400 font-bold">
            {{ formatCurrency(table.orders[0].total) }}
          </span>
          <span v-else class="text-slate-500">Buyurtma yo'q</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../services/api';
import { useCartStore } from '../../stores/cart.store';
import { useAuthStore } from '../../stores/auth.store';
import { useFormat } from '../../composables/useFormat';
import { Flame } from 'lucide-vue-next';

const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();
const { formatCurrency } = useFormat();

const canAccessKds = computed(() => {
  const isSuper = authStore.user?.isSuperAdmin;
  const role = (authStore.activeBusiness?.role || '').toLowerCase();
  if (isSuper || role === 'owner' || role === 'admin') return true;
  const allowed = authStore.activeBusiness?.allowedModules || [];
  return allowed.includes('all') || allowed.includes('kds');
});

const tables = ref<any[]>([]);

const loadTables = async () => {
  const { data } = await api.get('/restaurant/tables');
  tables.value = data || [];
};

const getTableClass = (status: string) => {
  switch (status) {
    case 'available': return 'border-emerald-500/30 hover:border-emerald-500';
    case 'occupied': return 'border-rose-500/30 bg-rose-500/5 hover:border-rose-500';
    case 'cleaning': return 'border-amber-500/30 bg-amber-500/5 hover:border-amber-500';
    default: return 'border-slate-700';
  }
};

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'available': return 'bg-emerald-500/20 text-emerald-400';
    case 'occupied': return 'bg-rose-500/20 text-rose-400';
    case 'cleaning': return 'bg-amber-500/20 text-amber-400';
    default: return 'bg-slate-700 text-slate-300';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'available': return "Bo'sh";
    case 'occupied': return 'Band';
    case 'cleaning': return 'Tozalanmoqda';
    default: return status;
  }
};

const handleTableClick = (table: any) => {
  cartStore.setTable(table.id, table.name);
  cartStore.orderType = 'restaurant';
  router.push('/pos');
};

onMounted(() => {
  loadTables();
});
</script>
