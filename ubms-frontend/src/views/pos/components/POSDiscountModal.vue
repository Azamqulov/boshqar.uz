<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { X, Percent, DollarSign, Check, Tag, Trash2, ArrowRight } from 'lucide-vue-next';
import { useFormat } from '../../../composables/useFormat';
import CurrencyInput from '../../../components/CurrencyInput.vue';
import type { DiscountType } from '../../../stores/cart.store';

const props = defineProps<{
  isOpen: boolean;
  subtotal: number;
  currentType: DiscountType;
  currentValue: number;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'apply', payload: { type: DiscountType; value: number }): void;
  (e: 'clear'): void;
}>();

const { formatCurrency } = useFormat();

const activeType = ref<DiscountType>('percent');
const percentValue = ref<number>(0);
const fixedValue = ref<number>(0);

const percentPresets = [3, 5, 10, 15, 20, 25, 30, 50, 100];
const fixedPresets = [5000, 10000, 15000, 20000, 30000, 50000, 100000];

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      activeType.value = props.currentType || 'percent';
      if (props.currentType === 'fixed') {
        fixedValue.value = props.currentValue || 0;
        percentValue.value = 0;
      } else {
        percentValue.value = props.currentValue || 0;
        fixedValue.value = 0;
      }
    }
  },
  { immediate: true }
);

// Calculated Discount Amount
const calculatedDiscountAmount = computed(() => {
  const sub = props.subtotal || 0;
  if (sub <= 0) return 0;
  if (activeType.value === 'percent') {
    const pct = Math.min(100, Math.max(0, percentValue.value || 0));
    return Math.round((sub * pct) / 100);
  }
  return Math.min(sub, Math.max(0, fixedValue.value || 0));
});

// Calculated New Total
const calculatedNewTotal = computed(() => {
  return Math.max(0, (props.subtotal || 0) - calculatedDiscountAmount.value);
});

const applyPreset = (val: number) => {
  if (activeType.value === 'percent') {
    percentValue.value = val;
  } else {
    fixedValue.value = val;
  }
};

const handleApply = () => {
  const val = activeType.value === 'percent' ? percentValue.value : fixedValue.value;
  emit('apply', {
    type: activeType.value,
    value: Math.max(0, val || 0),
  });
  emit('close');
};

const handleClear = () => {
  percentValue.value = 0;
  fixedValue.value = 0;
  emit('clear');
  emit('close');
};
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay !z-[99999]" @click.self="$emit('close')">
      <div class="modal-container max-w-md bg-white dark:bg-slate-900 shadow-2xl rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150" @click.stop>
        <!-- Modal Header -->
        <div class="modal-header">
          <div class="flex items-center gap-2">
            <div class="p-2 rounded-xl bg-rose-500/10 text-rose-500">
              <Tag class="w-4 h-4" />
            </div>
            <div>
              <h3 class="font-black text-sm text-slate-900 dark:text-white">Buyurtmaga Chegirma Qo'llash</h3>
              <p class="text-[11px] text-slate-400">Foiz (%) yoki aniq summa (so'm) orqali chegirma bering</p>
            </div>
          </div>
          <button
            type="button"
            @click="$emit('close')"
            class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body space-y-4">
          <!-- Discount Type Selector (Toggle) -->
          <div class="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
            <button
              type="button"
              @click="activeType = 'percent'"
              class="py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-2"
              :class="activeType === 'percent' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
            >
              <Percent class="w-3.5 h-3.5 text-emerald-500" />
              <span>Foizli Chegirma (%)</span>
            </button>
            <button
              type="button"
              @click="activeType = 'fixed'"
              class="py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-2"
              :class="activeType === 'fixed' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
            >
              <DollarSign class="w-3.5 h-3.5 text-blue-500" />
              <span>Summali Chegirma (so'm)</span>
            </button>
          </div>

          <!-- Section 1: Percent Input & Presets -->
          <div v-if="activeType === 'percent'" class="space-y-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Chegirma Foizi (%):
              </label>
              <div class="relative">
                <input
                  v-model.number="percentValue"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  placeholder="0"
                  class="w-full pl-4 pr-10 py-3 text-lg font-black font-mono rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
                <span class="absolute right-4 top-1/2 -translate-y-1/2 font-black text-slate-400">%</span>
              </div>
            </div>

            <!-- Percent Quick Presets -->
            <div>
              <label class="block text-[11px] font-medium text-slate-400 mb-1.5">Tezkor foizlar:</label>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="p in percentPresets"
                  :key="p"
                  type="button"
                  @click="applyPreset(p)"
                  class="px-2.5 py-1.5 rounded-xl text-xs font-bold font-mono transition"
                  :class="percentValue === p ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700/60'"
                >
                  {{ p }}%
                </button>
              </div>
            </div>
          </div>

          <!-- Section 2: Fixed Sum Input & Presets -->
          <div v-else class="space-y-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Chegirma Summasi (so'm):
              </label>
              <CurrencyInput
                v-model="fixedValue"
                placeholder="0"
                suffix="so'm"
                inputClass="py-3 text-lg font-black font-mono"
              />
            </div>

            <!-- Fixed Sum Quick Presets -->
            <div>
              <label class="block text-[11px] font-medium text-slate-400 mb-1.5">Tezkor summalar:</label>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="amt in fixedPresets"
                  :key="amt"
                  type="button"
                  @click="applyPreset(amt)"
                  class="px-2.5 py-1.5 rounded-xl text-xs font-bold font-mono transition"
                  :class="fixedValue === amt ? 'bg-blue-500 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700/60'"
                >
                  {{ formatCurrency(amt) }}
                </button>
              </div>
            </div>
          </div>

          <!-- Real-time Live Preview Card -->
          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <div class="flex justify-between text-slate-500 dark:text-slate-400 font-medium">
              <span>Asl oraliq summa:</span>
              <span class="font-mono text-slate-800 dark:text-slate-200">{{ formatCurrency(subtotal) }}</span>
            </div>

            <div class="flex justify-between items-center text-rose-500 font-bold border-t border-slate-200/60 dark:border-slate-700/60 pt-2">
              <span class="flex items-center gap-1">
                <span>Chegirma:</span>
                <span v-if="activeType === 'percent' && percentValue > 0" class="text-[10px] px-1.5 py-0.5 rounded-md bg-rose-500/10 font-mono">
                  ({{ percentValue }}%)
                </span>
              </span>
              <span class="font-mono text-sm">-{{ formatCurrency(calculatedDiscountAmount) }}</span>
            </div>

            <div class="flex justify-between items-center text-slate-900 dark:text-white font-black border-t border-slate-200/80 dark:border-slate-700/80 pt-2 text-sm">
              <span>Yangi to'lov summasi:</span>
              <span class="font-mono text-emerald-600 dark:text-emerald-400 text-base">
                {{ formatCurrency(calculatedNewTotal) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Modal Footer Actions -->
        <div class="modal-footer flex items-center justify-between">
          <button
            type="button"
            @click="handleClear"
            class="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition flex items-center gap-1.5"
          >
            <Trash2 class="w-3.5 h-3.5" />
            <span>Bekor qilish</span>
          </button>

          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Yopish
            </button>
            <button
              type="button"
              @click="handleApply"
              class="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5 btn-interactive"
            >
              <Check class="w-4 h-4" />
              <span>Chegirmani Qo'llash</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
