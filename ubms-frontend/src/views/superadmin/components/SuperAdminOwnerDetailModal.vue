<template>
  <div v-if="isOpen && ownerDetail" @click.self="$emit('close')" class="modal-overlay">
    <div class="modal-container max-w-2xl" @click.stop>
      <div class="modal-header">
        <div class="flex items-center gap-2.5">
          <div class="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Crown class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white">{{ ownerDetail.owner?.fullName }}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 font-mono">{{ ownerDetail.owner?.phone }} · {{ ownerDetail.business?.name }}</p>
          </div>
        </div>
        <button @click="$emit('close')" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"><X class="w-5 h-5" /></button>
      </div>

      <div class="modal-body">
        <!-- 4 Stats Cards for Owner -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <span class="text-[10px] uppercase font-bold text-slate-400 block">Jami Savdo (GMV)</span>
            <p class="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">{{ formatCurrency(ownerDetail.stats?.lifetimeGMV || 0) }}</p>
            <span class="text-[10px] text-slate-400">{{ ownerDetail.stats?.lifetimeOrdersCount || 0 }} ta chek</span>
          </div>

          <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <span class="text-[10px] uppercase font-bold text-slate-400 block">30 Kunlik Savdo</span>
            <p class="text-base font-black text-blue-600 dark:text-blue-400 font-mono mt-1">{{ formatCurrency(ownerDetail.stats?.last30dGMV || 0) }}</p>
            <span class="text-[10px] text-slate-400">{{ ownerDetail.stats?.last30dOrdersCount || 0 }} ta chek</span>
          </div>

          <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <span class="text-[10px] uppercase font-bold text-slate-400 block">Tovarlar Soni</span>
            <p class="text-base font-black text-teal-600 dark:text-teal-400 font-mono mt-1">{{ ownerDetail.business?.productsCount || 0 }} ta</p>
            <span class="text-[10px] text-slate-400">Katalogda</span>
          </div>

          <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <span class="text-[10px] uppercase font-bold text-slate-400 block">Xodimlar Soni</span>
            <p class="text-base font-black text-amber-600 dark:text-amber-400 font-mono mt-1">{{ ownerDetail.business?.employeesCount || 0 }} nafar</p>
            <span class="text-[10px] text-slate-400">Jamoada</span>
          </div>
        </div>

        <!-- 14 Days Sales Dynamics Bar Chart -->
        <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold text-slate-900 dark:text-white">Oxirgi 14 Kunlik Savdo Grafigi</h4>
            <span class="text-[10px] text-slate-400 font-mono">Dinamika</span>
          </div>

          <div class="h-36 flex items-end justify-between gap-1 pt-4 px-1">
            <div
              v-for="(item, idx) in ownerDetail.chartData"
              :key="idx"
              class="flex-1 flex flex-col items-center group relative h-full justify-end"
            >
              <div class="absolute -top-8 hidden group-hover:flex flex-col items-center bg-slate-900 text-white text-[10px] p-1 rounded shadow-lg z-20 whitespace-nowrap">
                <span>{{ item.date }}</span>
                <span class="font-bold text-emerald-400">{{ formatCurrency(item.sales) }}</span>
              </div>
              <div
                class="w-full max-w-[20px] bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t transition-all group-hover:opacity-80"
                :style="{ height: `${Math.max(8, (item.sales / (maxChartValue || 1)) * 100)}%` }"
              ></div>
              <span class="text-[8px] text-slate-400 mt-1 rotate-45 truncate">{{ item.date.slice(5) }}</span>
            </div>
          </div>
        </div>

        <!-- Action Controls: Status & Plan -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
          <!-- Change Plan -->
          <div class="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
            <label class="font-bold text-slate-900 dark:text-white block">Tarif Rejasini O'zgartirish:</label>
            <div class="flex items-center gap-2">
              <AppSelect
                v-model="ownerDetail.business.planId"
                :options="plans.map(p => ({ value: p.id, label: `${p.name} (${Number(p.priceMonthly) === 0 ? 'Bepul' : formatCurrency(p.priceMonthly) + '/oy'})` }))"
                custom-class="flex-1"
              />
              <button
                @click="$emit('savePlan', ownerDetail.owner.id, ownerDetail.business.planId, selectedDurationDays)"
                class="px-3 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/25 transition btn-interactive"
              >
                Saqlash
              </button>
            </div>

            <!-- Duration Pills -->
            <div class="space-y-1 pt-1 border-t border-slate-200 dark:border-slate-700/60">
              <span class="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block">Muddat:</span>
              <div class="flex flex-wrap gap-1">
                <button
                  type="button"
                  v-for="d in [15, 30, 90, 180, 365]"
                  :key="d"
                  @click="selectedDurationDays = d"
                  class="px-2 py-0.5 rounded-lg text-[10px] font-bold transition border"
                  :class="selectedDurationDays === d ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'"
                >
                  {{ d === 15 ? '15 kun' : d === 30 ? '1 oy' : d === 90 ? '3 oy' : d === 180 ? '6 oy' : '1 yil' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Toggle Status -->
          <div class="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-2">
            <div>
              <label class="font-bold text-slate-900 dark:text-white block">Akkaunt va Biznes Holati:</label>
              <span class="text-[11px] text-slate-500 dark:text-slate-400">
                Hozirgi holat: <strong :class="ownerDetail.owner?.status === 'active' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'">{{ ownerDetail.owner?.status === 'active' ? 'Faol' : 'Bloklangan' }}</strong>
              </span>
            </div>
            <button
              @click="$emit('toggleStatus', ownerDetail.owner.id, ownerDetail.owner.status)"
              class="w-full py-2 rounded-xl font-bold text-xs transition btn-interactive flex items-center justify-center gap-1.5"
              :class="ownerDetail.owner?.status === 'active' ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20' : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20'"
            >
              <Ban v-if="ownerDetail.owner?.status === 'active'" class="w-4 h-4" />
              <CheckCircle v-else class="w-4 h-4" />
              <span>{{ ownerDetail.owner?.status === 'active' ? 'Akkauntni Bloklash' : 'Akkauntni Faollashtirish' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Crown, X, Ban, CheckCircle } from 'lucide-vue-next';
import AppSelect from '../../../components/AppSelect.vue';
import { useFormat } from '../../../composables/useFormat';

const props = defineProps<{
  isOpen: boolean;
  ownerDetail: any;
  plans: any[];
}>();

const selectedDurationDays = ref(30);

defineEmits<{
  (e: 'close'): void;
  (e: 'savePlan', ownerId: string, planId: string, durationDays?: number): void;
  (e: 'toggleStatus', ownerId: string, currentStatus: string): void;
}>();

const { formatCurrency } = useFormat();

const maxChartValue = computed(() => {
  if (!props.ownerDetail?.chartData || props.ownerDetail.chartData.length === 0) return 1;
  return Math.max(...props.ownerDetail.chartData.map((d: any) => d.sales), 1);
});
</script>
