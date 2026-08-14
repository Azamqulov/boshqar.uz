<template>
  <div class="glass-card rounded-2xl p-5 flex flex-col justify-between space-y-4">
    <div>
      <!-- Header with List / Chart Switch Toggle -->
      <div class="flex items-center justify-between mb-3 border-b border-slate-200 dark:border-slate-800 pb-2.5">
        <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Flame class="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>Eng Ko'p Sotilganlar</span>
        </h3>

        <div class="flex items-center gap-2">
          <!-- Switch Toggle (Ro'yxat / Doiraviy Diagramma) -->
          <div class="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <button
              @click="viewMode = 'list'"
              class="px-2 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1"
              :class="[
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              ]"
              title="Ro'yxat ko'rinishi"
            >
              <List class="w-3 h-3" />
            </button>
            <button
              @click="viewMode = 'chart'"
              class="px-2 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1"
              :class="[
                viewMode === 'chart'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              ]"
              title="Doiraviy diagramma ko'rinishi"
            >
              <PieChart class="w-3 h-3" />
            </button>
          </div>

          <span class="text-[10px] text-slate-400 hidden sm:inline">30 kunlik</span>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="topBestsellers.length === 0" class="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
        Hozircha sotuvlar mavjud emas
      </div>

      <!-- Mode 1: List View (Standart Ro'yxat) -->
      <div v-else-if="viewMode === 'list'" class="space-y-2.5">
        <div
          v-for="(item, idx) in topBestsellers"
          :key="item.id"
          class="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs transition-all hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
        >
          <div class="flex items-center gap-2.5 truncate">
            <span
              class="w-5 h-5 rounded-lg flex items-center justify-center font-black text-[10px]"
              :class="[
                idx === 0
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : idx === 1
                  ? 'bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                  : idx === 2
                  ? 'bg-amber-700 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              ]"
            >
              {{ idx + 1 }}
            </span>
            <div class="truncate">
              <h5 class="font-bold text-slate-900 dark:text-white truncate">{{ item.name }}</h5>
              <span class="text-[10px] text-slate-400">{{ formatCurrency(item.salePrice) }}</span>
            </div>
          </div>

          <div class="text-right flex-shrink-0 pl-2">
            <span class="font-black text-emerald-600 dark:text-emerald-400 block">{{ item.soldCount30d || 0 }} ta</span>
            <span class="text-[9px] text-slate-400">{{ formatCurrency(item.salesTotal30d || 0) }}</span>
          </div>
        </div>
      </div>

      <!-- Mode 2: Circular (Donut) Chart View (Doiraviy Taqsimot) -->
      <div v-else class="space-y-3 py-1">
        <!-- SVG Donut Circle -->
        <div class="flex items-center justify-center relative">
          <div class="relative w-32 h-32">
            <svg viewBox="0 0 100 100" class="w-full h-full transform -rotate-90">
              <!-- Background Circle -->
              <circle
                cx="50"
                cy="50"
                r="38"
                pathLength="100"
                fill="transparent"
                stroke="currentColor"
                stroke-width="16"
                class="text-slate-100 dark:text-slate-800"
              />
              <!-- Slices -->
              <circle
                v-for="(seg, sIdx) in calculatedChartSegments"
                :key="sIdx"
                cx="50"
                cy="50"
                r="38"
                pathLength="100"
                fill="transparent"
                :stroke="seg.color"
                stroke-width="16"
                :stroke-dasharray="`${seg.rawPercent} ${100 - seg.rawPercent}`"
                :stroke-dashoffset="`-${seg.offset}`"
                class="transition-all duration-300 ease-out hover:opacity-85 cursor-pointer"
                @mouseenter="hoveredIndex = sIdx"
                @mouseleave="hoveredIndex = null"
              />
            </svg>

            <!-- Center Info -->
            <div class="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-1">
              <span class="text-[9px] text-slate-400 font-bold uppercase tracking-tighter truncate max-w-[80px]">
                {{ hoveredItem ? hoveredItem.name : 'Jami' }}
              </span>
              <span class="text-xs font-black text-slate-900 dark:text-white leading-none mt-0.5">
                {{ hoveredItem ? `${hoveredItem.count} ta` : `${totalSoldQuantity} ta` }}
              </span>
              <span
                class="text-[9px] font-extrabold mt-0.5 px-1.5 py-0.2 rounded-full"
                :style="{ color: hoveredItem ? hoveredItem.color : '#F59E0B' }"
              >
                {{ hoveredItem ? `${hoveredItem.percentage}%` : 'Sotilgan' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Compact Legend List -->
        <div class="space-y-1.5 max-h-36 overflow-y-auto pr-1">
          <div
            v-for="(seg, sIdx) in calculatedChartSegments"
            :key="sIdx"
            @mouseenter="hoveredIndex = sIdx"
            @mouseleave="hoveredIndex = null"
            class="flex items-center justify-between p-1.5 rounded-lg border text-[11px] transition cursor-pointer"
            :class="[
              hoveredIndex === sIdx
                ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 shadow-sm'
                : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/80 hover:bg-slate-100/50'
            ]"
          >
            <div class="flex items-center gap-2 truncate">
              <span
                class="w-2.5 h-2.5 rounded-full flex-shrink-0"
                :style="{ backgroundColor: seg.color }"
              ></span>
              <span class="font-bold text-slate-800 dark:text-slate-200 truncate">{{ seg.name }}</span>
            </div>

            <div class="flex items-center gap-2 flex-shrink-0 pl-2">
              <span class="text-slate-500 dark:text-slate-400 font-semibold">{{ seg.count }} ta</span>
              <span
                class="font-black text-[10px] w-8 text-right"
                :style="{ color: seg.color }"
              >
                {{ seg.percentage }}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Action -->
    <div class="pt-2 border-t border-slate-200 dark:border-slate-800">
      <router-link
        to="/products"
        class="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition flex items-center justify-center space-x-1.5"
      >
        <span>Barcha Mahsulotlarni Ko'rish →</span>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Flame, List, PieChart } from 'lucide-vue-next';
import { useFormat } from '../../../composables/useFormat';

const props = defineProps<{
  topBestsellers: any[];
}>();

const { formatCurrency } = useFormat();

const viewMode = ref<'list' | 'chart'>('list');
const hoveredIndex = ref<number | null>(null);

const colors = ['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4'];

const totalSoldQuantity = computed(() => {
  return props.topBestsellers.reduce((sum, item) => sum + (Number(item.soldCount30d) || 0), 0);
});

const calculatedChartSegments = computed(() => {
  const total = totalSoldQuantity.value;
  if (total === 0) return [];

  let accumulatedPercent = 0;

  return props.topBestsellers.map((item, index) => {
    const count = Number(item.soldCount30d) || 0;
    const rawPercent = (count / total) * 100;
    const percentage = Math.round(rawPercent);
    const color = colors[index % colors.length];
    const offset = accumulatedPercent;

    accumulatedPercent += rawPercent;

    return {
      id: item.id,
      name: item.name,
      count,
      percentage,
      rawPercent,
      color,
      offset,
    };
  });
});

const hoveredItem = computed(() => {
  if (hoveredIndex.value === null || !calculatedChartSegments.value[hoveredIndex.value]) {
    return null;
  }
  return calculatedChartSegments.value[hoveredIndex.value];
});
</script>
