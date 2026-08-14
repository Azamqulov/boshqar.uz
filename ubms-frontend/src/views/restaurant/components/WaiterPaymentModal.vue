<template>
  <Teleport to="body">
    <div v-if="isOpen" @click.self="$emit('close')" class="modal-overlay">
      <div class="modal-container max-w-md" @click.stop>
        <div class="modal-header">
          <h3 class="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt class="w-5 h-5 text-emerald-500" />
            <span>Stol Hisobini Yopish: {{ selectedTable?.name }}</span>
          </h3>
          <button @click="$emit('close')" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="modal-body space-y-4">
          <!-- Total display -->
          <div class="text-center py-4 bg-slate-100/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span class="text-xs text-slate-500 dark:text-slate-400">To'lanishi kerak bo'lgan jami summa:</span>
            <h2 class="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
              {{ formatCurrency(orderTotalSum) }}
            </h2>
          </div>

          <!-- Payment Method Selection -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">To'lov Turi:</label>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="pm in [
                  { id: '1', name: 'Naqd pul', icon: Banknote },
                  { id: '2', name: 'Plastik karta', icon: CreditCard },
                  { id: '3', name: 'Click / Payme', icon: Smartphone }
                ]"
                :key="pm.id"
                type="button"
                @click="$emit('update:tablePaymentMethod', pm.id)"
                class="p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1.5"
                :class="[
                  tablePaymentMethod === pm.id
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                ]"
              >
                <component :is="pm.icon" class="w-4 h-4" />
                <span>{{ pm.name }}</span>
              </button>
            </div>
          </div>

          <!-- Customer Selection (For Nasiya / Debt tracking) -->
          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div class="flex items-center justify-between">
              <label class="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Users class="w-4 h-4 text-amber-500" />
                <span>Mijoz (Nasiya / Qarzga yozish uchun):</span>
              </label>
              <button
                v-if="selectedCustomerId"
                type="button"
                @click="$emit('update:selectedCustomerId', '')"
                class="text-[11px] text-rose-500 hover:underline font-bold"
              >
                Tozalash
              </button>
            </div>

            <div class="flex items-center gap-2">
              <div class="flex-1">
                <AppSelect
                  :model-value="selectedCustomerId"
                  @update:model-value="$emit('update:selectedCustomerId', $event)"
                  :options="customerSelectOptions"
                  :searchable="true"
                  placeholder="Mijozni qidiring yoki tanlang..."
                />
              </div>

              <button
                type="button"
                @click="$emit('openNewCustomer')"
                class="px-3 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-xs shrink-0 transition"
                title="Yangi mijoz qo'shish"
              >
                + Yangi
              </button>
            </div>

            <div v-if="selectedCustomerId" class="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 font-semibold space-y-1">
              <p>👤 Tanlangan: <b>{{ selectedCustomerObj?.fullName }}</b> ({{ selectedCustomerObj?.phone || 'Tel yo\'q' }})</p>
              <p v-if="nasiyaCalcAmount > 0" class="text-rose-600 dark:text-rose-400 font-bold">
                ⚠️ Qolgan {{ formatCurrency(nasiyaCalcAmount) }} summa ushbu mijozning Nasiya hisobiga yoziladi.
              </p>
              <p v-else class="text-emerald-600 dark:text-emerald-400 font-bold">
                ✅ To'lov to'liq amalga oshiriladi.
              </p>
            </div>
          </div>

          <!-- Cash change / Nasiya calculation if cash selected -->
          <div v-if="tablePaymentMethod === '1'" class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div>
              <label class="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {{ selectedCustomerId ? 'Mijoz to\'lagan naqd pul (0 bo\'lsa 100% Nasiya):' : 'Mijoz bergan summa:' }}
              </label>
              <CurrencyInput
                :model-value="tableCashReceived"
                @update:model-value="$emit('update:tableCashReceived', $event)"
                placeholder="0"
                suffix="so'm"
                inputClass="font-bold text-slate-900 dark:text-white"
              />
            </div>

            <!-- Quick Cash Buttons -->
            <div class="flex flex-wrap gap-1.5">
              <button
                type="button"
                @click="$emit('update:tableCashReceived', orderTotalSum)"
                class="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition"
              >
                Aniq summa ({{ formatCurrency(orderTotalSum) }})
              </button>
              <button
                v-if="selectedCustomerId"
                type="button"
                @click="$emit('update:tableCashReceived', 0)"
                class="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-700 text-xs font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition"
              >
                0 so'm (100% Nasiya)
              </button>
              <button
                type="button"
                v-for="amt in quickCashPresets"
                :key="amt"
                @click="$emit('update:tableCashReceived', amt)"
                class="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 hover:border-emerald-500 transition"
              >
                {{ formatCurrency(amt) }}
              </button>
            </div>

            <!-- Qaytim -->
            <div v-if="tableCashReceived > orderTotalSum" class="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800 text-xs">
              <span class="text-slate-500 dark:text-slate-400 font-semibold">Qaytim (Mijozga qaytariladi):</span>
              <span class="font-bold font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                {{ formatCurrency(tableCashReceived - orderTotalSum) }}
              </span>
            </div>

            <!-- Warning if not full and no customer selected -->
            <div v-else-if="!selectedCustomerId && tableCashReceived < orderTotalSum" class="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
              <span>⚠️ Nasiyaga yozish uchun yuqoridan Mijozni tanlang, aks holda to'liq summani kiriting</span>
            </div>
          </div>

          <button
            @click="$emit('payAndClose')"
            :disabled="payingTable || (!selectedCustomerId && tablePaymentMethod === '1' && tableCashReceived < orderTotalSum)"
            class="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-black text-sm shadow-lg shadow-emerald-500/25 transition flex items-center justify-center space-x-2 btn-interactive"
          >
            <CheckCircle2 class="w-5 h-5" />
            <span>{{ payingTable ? 'Hisob yopilmoqda...' : (selectedCustomerId && nasiyaCalcAmount > 0 ? `Nasiya (${formatCurrency(nasiyaCalcAmount)}) bilan Yopish` : 'To\'lovni Yakunlash & Stolni Bo\'shatish') }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import {
  Receipt,
  X,
  Banknote,
  CreditCard,
  Smartphone,
  Users,
  CheckCircle2,
} from 'lucide-vue-next';
import CurrencyInput from '../../../components/CurrencyInput.vue';
import AppSelect from '../../../components/AppSelect.vue';
import { useFormat } from '../../../composables/useFormat';

defineProps<{
  isOpen: boolean;
  selectedTable: any;
  orderTotalSum: number;
  tablePaymentMethod: string;
  selectedCustomerId: string;
  selectedCustomerObj: any;
  customerSelectOptions: any[];
  nasiyaCalcAmount: number;
  tableCashReceived: number;
  quickCashPresets: number[];
  payingTable: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'update:tablePaymentMethod', val: string): void;
  (e: 'update:selectedCustomerId', val: string): void;
  (e: 'update:tableCashReceived', val: number): void;
  (e: 'openNewCustomer'): void;
  (e: 'payAndClose'): void;
}>();

const { formatCurrency } = useFormat();
</script>
