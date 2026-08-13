<template>
  <div class="space-y-4 h-[calc(100vh-5.5rem)] flex flex-col overflow-hidden">
    <!-- Top Header with live sound & timer indicator -->
    <div class="flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="p-2.5 rounded-xl bg-orange-500/10 text-orange-500 dark:text-orange-400 border border-orange-500/20">
          <ChefHat class="w-6 h-6" />
        </div>
        <div>
          <h1 class="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Oshpaz Ekrani (Kitchen Display System — KDS)
            <span class="text-[10px] uppercase px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30 font-bold animate-pulse">
              Live Monitor
            </span>
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400">Yangi tushgan taomlarni qabul qiling, pishiring va tayyorligini bildiring</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="loadKDS"
          :disabled="loading"
          class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition border border-slate-200 dark:border-slate-700"
        >
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
          <span>Yangilash</span>
        </button>
      </div>
    </div>

    <!-- 3 High-contrast Columns: Yangi, Pishmoqda, Tayyor -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 overflow-hidden">
      <!-- 1. Yangi buyurtmalar (New - Yellow) -->
      <div class="glass-card rounded-2xl p-4 flex flex-col space-y-3 border-amber-500/30 overflow-hidden">
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 class="font-black text-sm text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-amber-500 animate-ping"></span>
            <span>1. Yangi Tushgan ({{ newOrders.length }})</span>
          </h3>
        </div>

        <div class="space-y-3 flex-1 overflow-y-auto pr-1">
          <div v-if="newOrders.length === 0" class="h-full flex items-center justify-center text-slate-400 dark:text-slate-600 text-xs">
            Yangi taomlar yo'q
          </div>
          <div
            v-for="kOrder in newOrders"
            :key="kOrder.id"
            class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-amber-500/40 space-y-3 shadow-sm"
          >
            <div class="flex justify-between items-start">
              <div>
                <span class="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {{ kOrder.orderItem?.order?.table?.name || 'Kassa Buyurtmasi' }}
                </span>
                <h4 class="text-base font-black text-slate-900 dark:text-white mt-1.5">{{ kOrder.orderItem?.product?.name }}</h4>
                <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Ofitsiant: {{ kOrder.orderItem?.order?.waiter?.fullName || 'Bosh ofitsiant' }}</p>
              </div>
              <span class="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">x{{ kOrder.orderItem?.quantity }}</span>
            </div>

            <div class="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800/80 pt-2">
              <span class="flex items-center gap-1 font-mono">
                <Clock class="w-3.5 h-3.5 text-slate-400" />
                {{ formatTimeAgo(kOrder.createdAt) }}
              </span>
            </div>

            <button
              @click="changeStatus(kOrder.id, 'cooking')"
              class="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 btn-interactive"
            >
              <Flame class="w-4 h-4" />
              <span>Pishirishni Boshlash</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 2. Pishmoqda (Cooking - Blue) -->
      <div class="glass-card rounded-2xl p-4 flex flex-col space-y-3 border-blue-500/30 overflow-hidden">
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 class="font-black text-sm text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></span>
            <span>2. Pishirilmoqda ({{ cookingOrders.length }})</span>
          </h3>
        </div>

        <div class="space-y-3 flex-1 overflow-y-auto pr-1">
          <div v-if="cookingOrders.length === 0" class="h-full flex items-center justify-center text-slate-400 dark:text-slate-600 text-xs">
            Hozircha pishirilayotgan taom yo'q
          </div>
          <div
            v-for="kOrder in cookingOrders"
            :key="kOrder.id"
            class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-blue-500/40 space-y-3 shadow-sm"
          >
            <div class="flex justify-between items-start">
              <div>
                <span class="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  {{ kOrder.orderItem?.order?.table?.name || 'Kassa Buyurtmasi' }}
                </span>
                <h4 class="text-base font-black text-slate-900 dark:text-white mt-1.5">{{ kOrder.orderItem?.product?.name }}</h4>
                <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Ofitsiant: {{ kOrder.orderItem?.order?.waiter?.fullName || 'Bosh ofitsiant' }}</p>
              </div>
              <span class="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">x{{ kOrder.orderItem?.quantity }}</span>
            </div>

            <div class="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800/80 pt-2">
              <span class="flex items-center gap-1 font-mono text-blue-600 dark:text-blue-400">
                <Flame class="w-3.5 h-3.5" />
                Pishirilmoqda...
              </span>
            </div>

            <button
              @click="changeStatus(kOrder.id, 'ready')"
              class="w-full py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-black text-xs transition shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 btn-interactive"
            >
              <CheckCircle class="w-4 h-4" />
              <span>Taom Tayyor Bo'ldi! ✓</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 3. Tayyor (Ready - Green) -->
      <div class="glass-card rounded-2xl p-4 flex flex-col space-y-3 border-emerald-500/30 overflow-hidden">
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 class="font-black text-sm text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span>3. Tayyor / Ofitsiantga ({{ readyOrders.length }})</span>
          </h3>
        </div>

        <div class="space-y-3 flex-1 overflow-y-auto pr-1">
          <div v-if="readyOrders.length === 0" class="h-full flex items-center justify-center text-slate-400 dark:text-slate-600 text-xs">
            Tayyor taomlar yo'q
          </div>
          <div
            v-for="kOrder in readyOrders"
            :key="kOrder.id"
            class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-emerald-500/40 space-y-3 shadow-sm"
          >
            <div class="flex justify-between items-start">
              <div>
                <span class="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {{ kOrder.orderItem?.order?.table?.name || 'Kassa Buyurtmasi' }}
                </span>
                <h4 class="text-base font-black text-slate-900 dark:text-white mt-1.5">{{ kOrder.orderItem?.product?.name }}</h4>
                <p class="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-bold">Ofitsiant olib ketishi kutilmoqda</p>
              </div>
              <span class="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">x{{ kOrder.orderItem?.quantity }}</span>
            </div>

            <button
              @click="changeStatus(kOrder.id, 'served')"
              class="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 btn-interactive"
            >
              <span>Zalga Yetkazildi 🍽️</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import api from '../../services/api';
import { ChefHat, RefreshCw, Flame, CheckCircle, Clock } from 'lucide-vue-next';

const loading = ref(false);
const kitchenOrders = ref<any[]>([]);
let pollTimer: any = null;

const newOrders = computed(() => kitchenOrders.value.filter((k) => k.status === 'new'));
const cookingOrders = computed(() => kitchenOrders.value.filter((k) => k.status === 'cooking'));
const readyOrders = computed(() => kitchenOrders.value.filter((k) => k.status === 'ready'));

const loadKDS = async () => {
  loading.value = true;
  try {
    const { data } = await api.get('/restaurant/kds');
    kitchenOrders.value = data || [];
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const changeStatus = async (id: string, status: string) => {
  try {
    await api.patch(`/restaurant/kds/${id}/status`, { status });
    await loadKDS();
  } catch (err) {
    alert('Holatni o\'zgartirishda xatolik');
  }
};

const formatTimeAgo = (dateStr: string) => {
  if (!dateStr) return '';
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 1) return 'Hozirgina';
  return `${mins} daqiqa oldin`;
};

onMounted(() => {
  loadKDS();
  // Auto-refresh every 6 seconds for kitchen tablets
  pollTimer = setInterval(() => {
    loadKDS();
  }, 6000);
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
});
</script>
