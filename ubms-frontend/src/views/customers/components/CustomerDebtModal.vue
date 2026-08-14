<template>
  <div>
    <!-- 1. Add Debt Modal (+ Qarz Kiritish) -->
    <Teleport to="body">
      <div v-if="isAddDebtOpen" @click.self="$emit('closeAddDebt')" class="modal-overlay">
        <div class="modal-container max-w-md" @click.stop>
          <div class="modal-header border-b border-rose-500/20">
            <div class="flex items-center gap-2">
              <div class="p-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                <TrendingDown class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-base font-bold text-slate-900 dark:text-white">Qarz / Nasiya Kiritish</h3>
                <p class="text-[11px] text-slate-500 dark:text-slate-400">Mijoz hisobiga yangi qarz yozish</p>
              </div>
            </div>
            <button @click="$emit('closeAddDebt')" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"><X class="w-5 h-5" /></button>
          </div>

          <div class="modal-body space-y-4">
            <!-- Customer info card -->
            <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span class="text-xs text-slate-500 dark:text-slate-400 block">Mijoz:</span>
                <span class="font-bold text-sm text-slate-900 dark:text-white">{{ activeCustomer?.fullName }}</span>
              </div>
              <div class="text-right">
                <span class="text-xs text-slate-500 dark:text-slate-400 block">Joriy qarz:</span>
                <span class="font-black text-sm text-rose-600 dark:text-rose-400 font-mono">{{ formatCurrency(activeCustomer?.debt || 0) }}</span>
              </div>
            </div>

            <!-- Debt Amount Input -->
            <div>
              <label class="block font-bold text-xs text-slate-700 dark:text-slate-300 mb-1.5">Qo'shilayotgan Qarz Summasi *</label>
              <CurrencyInput
                :model-value="debtAddAmount"
                @update:model-value="$emit('update:debtAddAmount', $event)"
                placeholder="0"
                suffix="so'm"
                inputClass="font-bold text-rose-600 dark:text-rose-400 text-base"
              />
            </div>

            <!-- Quick Fill Buttons -->
            <div class="space-y-1.5">
              <span class="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Tezkor summalar:</span>
              <div class="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  @click="$emit('update:debtAddAmount', (debtAddAmount || 0) + 20000)"
                  class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
                >
                  +20 000 so'm
                </button>
                <button
                  type="button"
                  @click="$emit('update:debtAddAmount', (debtAddAmount || 0) + 50000)"
                  class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
                >
                  +50 000 so'm
                </button>
                <button
                  type="button"
                  @click="$emit('update:debtAddAmount', (debtAddAmount || 0) + 100000)"
                  class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
                >
                  +100 000 so'm
                </button>
                <button
                  type="button"
                  @click="$emit('update:debtAddAmount', (debtAddAmount || 0) + 500000)"
                  class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
                >
                  +500 000 so'm
                </button>
              </div>
            </div>

            <!-- Reason / Notes -->
            <div>
              <label class="block font-bold text-xs text-slate-700 dark:text-slate-300 mb-1.5">Qarz Berish Sababi / Nasiya Tovarlar Izohi</label>
              <input
                :model-value="debtAddNotes"
                @input="$emit('update:debtAddNotes', ($event.target as HTMLInputElement).value)"
                placeholder="Masalan: Oziq-ovqat tovarlari, 2 ta yog', un..."
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            <!-- Resulting total preview -->
            <div class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex justify-between items-center text-xs">
              <span class="text-rose-700 dark:text-rose-300 font-medium">Yangi umumiy qarz bo'ladi:</span>
              <span class="font-black font-mono text-rose-600 dark:text-rose-400 text-sm">
                {{ formatCurrency(Number(activeCustomer?.debt || 0) + Number(debtAddAmount || 0)) }}
              </span>
            </div>

            <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <AppButton
                variant="ghost"
                size="md"
                @click="$emit('closeAddDebt')"
              >
                Bekor qilish
              </AppButton>
              <AppButton
                variant="danger"
                size="md"
                :loading="submitting"
                :disabled="!debtAddAmount || debtAddAmount <= 0"
                @click="$emit('submitAddDebt')"
              >
                Qarzni Kiritish
              </AppButton>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 2. Pay Debt Modal (Qarz To'lovini Qabul Qilish) -->
    <Teleport to="body">
      <div v-if="isPayDebtOpen" @click.self="$emit('closePayDebt')" class="modal-overlay">
        <div class="modal-container max-w-md" @click.stop>
          <div class="modal-header border-b border-emerald-500/20">
            <div class="flex items-center gap-2">
              <div class="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20">
                <CreditCard class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-base font-bold text-slate-900 dark:text-white">Qarz To'lovini Qabul Qilish</h3>
                <p class="text-[11px] text-slate-500 dark:text-slate-400">Nasiya daftari bo'yicha to'lov kiritish</p>
              </div>
            </div>
            <button @click="$emit('closePayDebt')" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"><X class="w-5 h-5" /></button>
          </div>

          <div class="modal-body space-y-4">
            <!-- Customer info card -->
            <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span class="text-xs text-slate-500 dark:text-slate-400 block">Mijoz:</span>
                <span class="font-bold text-sm text-slate-900 dark:text-white">{{ activeCustomer?.fullName }}</span>
              </div>
              <div class="text-right">
                <span class="text-xs text-slate-500 dark:text-slate-400 block">Mavjud qarz:</span>
                <span class="font-black text-sm text-rose-600 dark:text-rose-400 font-mono">{{ formatCurrency(activeCustomer?.debt || 0) }}</span>
              </div>
            </div>

            <!-- Payment Amount with CurrencyInput -->
            <div>
              <label class="block font-bold text-xs text-slate-700 dark:text-slate-300 mb-1.5">To'lanayotgan Summa *</label>
              <CurrencyInput
                :model-value="debtPayAmount"
                @update:model-value="$emit('update:debtPayAmount', $event)"
                placeholder="0"
                suffix="so'm"
                inputClass="font-bold text-emerald-600 dark:text-emerald-400 text-base"
              />
            </div>

            <!-- Quick Fill Buttons -->
            <div class="space-y-1.5">
              <span class="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Tezkor to'lov variantlari:</span>
              <div class="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  @click="$emit('update:debtPayAmount', Number(activeCustomer?.debt || 0))"
                  class="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20 transition"
                >
                  To'liq qarz ({{ formatCurrency(activeCustomer?.debt || 0) }})
                </button>
                <button
                  v-if="Number(activeCustomer?.debt) > 50000"
                  type="button"
                  @click="$emit('update:debtPayAmount', 50000)"
                  class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
                >
                  50 000 so'm
                </button>
                <button
                  v-if="Number(activeCustomer?.debt) > 100000"
                  type="button"
                  @click="$emit('update:debtPayAmount', 100000)"
                  class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
                >
                  100 000 so'm
                </button>
              </div>
            </div>

            <!-- Notes -->
            <div>
              <label class="block font-bold text-xs text-slate-700 dark:text-slate-300 mb-1.5">Izoh / To'lov tafsiloti</label>
              <input
                :model-value="debtPayNotes"
                @input="$emit('update:debtPayNotes', ($event.target as HTMLInputElement).value)"
                placeholder="Masalan: Naqd pulda berdi yoki Karta orqali o'tkazdi"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <!-- Remaining debt preview -->
            <div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex justify-between items-center text-xs">
              <span class="text-emerald-700 dark:text-emerald-300 font-medium">To'lovdan keyin qoladigan qarz:</span>
              <span class="font-black font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                {{ formatCurrency(Math.max(0, Number(activeCustomer?.debt || 0) - Number(debtPayAmount || 0))) }}
              </span>
            </div>

            <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <AppButton
                variant="ghost"
                size="md"
                @click="$emit('closePayDebt')"
              >
                Bekor qilish
              </AppButton>
              <AppButton
                variant="primary"
                size="md"
                :loading="submitting"
                :disabled="!debtPayAmount || debtPayAmount <= 0"
                @click="$emit('submitPayDebt')"
              >
                To'lovni Qabul Qilish
              </AppButton>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { TrendingDown, CreditCard, X } from 'lucide-vue-next';
import AppButton from '../../../components/AppButton.vue';
import CurrencyInput from '../../../components/CurrencyInput.vue';
import { useFormat } from '../../../composables/useFormat';

defineProps<{
  isAddDebtOpen: boolean;
  isPayDebtOpen: boolean;
  activeCustomer: any;
  debtAddAmount: number;
  debtAddNotes: string;
  debtPayAmount: number;
  debtPayNotes: string;
  submitting: boolean;
}>();

defineEmits<{
  (e: 'closeAddDebt'): void;
  (e: 'closePayDebt'): void;
  (e: 'update:debtAddAmount', val: number): void;
  (e: 'update:debtAddNotes', val: string): void;
  (e: 'update:debtPayAmount', val: number): void;
  (e: 'update:debtPayNotes', val: string): void;
  (e: 'submitAddDebt'): void;
  (e: 'submitPayDebt'): void;
}>();

const { formatCurrency } = useFormat();
</script>
