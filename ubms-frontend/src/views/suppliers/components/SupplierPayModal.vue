<template>
  <Teleport to="body">
    <div v-if="isOpen" @click.self="$emit('close')" class="modal-overlay">
      <div class="modal-container max-w-md" @click.stop>
        <div class="modal-header">
          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard class="w-4 h-4 text-emerald-500" />
              <span>Ta'minotchiga To'lov Berish</span>
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Bizning ta'minotchi oldidagi qarzimizni yopish</p>
          </div>
          <button @click="$emit('close')" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="modal-body space-y-4">
          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <div>
              <span class="text-xs text-slate-500 dark:text-slate-400 block">Ta'minotchi:</span>
              <span class="font-bold text-sm text-slate-900 dark:text-white">{{ activeSupplier?.name }}</span>
              <span v-if="activeSupplier?.companyName" class="text-xs text-slate-500 block">({{ activeSupplier?.companyName }})</span>
            </div>
            <div class="text-right">
              <span class="text-xs text-slate-500 dark:text-slate-400 block">Mavjud Qarzimiz:</span>
              <span class="font-black text-sm text-rose-600 dark:text-rose-400 font-mono">
                {{ formatCurrency(Number(activeSupplier?.balance || 0)) }}
              </span>
            </div>
          </div>

          <div>
            <label class="block font-bold text-xs text-slate-700 dark:text-slate-300 mb-1.5">To'lanayotgan Summa *</label>
            <CurrencyInput
              :model-value="payAmount"
              @update:model-value="$emit('update:payAmount', $event)"
              placeholder="0"
              suffix="so'm"
              inputClass="font-bold text-emerald-600 dark:text-emerald-400 text-base"
            />
          </div>

          <!-- Payment Source Selector -->
          <div class="space-y-1.5">
            <label class="block font-bold text-xs text-slate-700 dark:text-slate-300">To'lov Manbasi (Chiqim turi) *</label>
            <div class="grid grid-cols-3 gap-2">
              <button
                type="button"
                @click="$emit('update:paymentSource', 'cash')"
                class="p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer"
                :class="paymentSource === 'cash' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'"
              >
                <div class="flex items-center gap-1">
                  <Banknote class="w-3.5 h-3.5 text-emerald-500" />
                  <span>Naqd pul</span>
                </div>
                <span class="text-[10px] text-slate-400 font-normal">Kassadan</span>
              </button>
              <button
                type="button"
                @click="$emit('update:paymentSource', 'card')"
                class="p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer"
                :class="paymentSource === 'card' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'"
              >
                <div class="flex items-center gap-1">
                  <CreditCard class="w-3.5 h-3.5 text-blue-500" />
                  <span>Karta</span>
                </div>
                <span class="text-[10px] text-slate-400 font-normal">Korp. karta</span>
              </button>
              <button
                type="button"
                @click="$emit('update:paymentSource', 'bank')"
                class="p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer"
                :class="paymentSource === 'bank' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'"
              >
                <div class="flex items-center gap-1">
                  <Building2 class="w-3.5 h-3.5 text-amber-500" />
                  <span>Bank Hisobi</span>
                </div>
                <span class="text-[10px] text-slate-400 font-normal">Perechislenie</span>
              </button>
            </div>
          </div>

          <!-- Notes / Description -->
          <div>
            <label class="block font-bold text-xs text-slate-700 dark:text-slate-300 mb-1.5">Izoh / Chek raqami (Ixtiyoriy)</label>
            <input
              :value="paymentDescription"
              @input="$emit('update:paymentDescription', ($event.target as HTMLInputElement).value)"
              type="text"
              placeholder="Masalan: 12-avgust kungi mol uchun to'lov..."
              class="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <!-- Quick Fill Buttons -->
          <div class="space-y-1.5">
            <span class="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Tezkor to'lov variantlari:</span>
            <div class="flex flex-wrap gap-1.5">
              <button
                type="button"
                @click="$emit('update:payAmount', Number(activeSupplier?.balance || 0))"
                class="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20 transition"
              >
                To'liq qarz ({{ formatCurrency(Number(activeSupplier?.balance || 0)) }})
              </button>
              <button
                v-if="Number(activeSupplier?.balance) > 100000"
                type="button"
                @click="$emit('update:payAmount', 100000)"
                class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
              >
                100 000 so'm
              </button>
              <button
                v-if="Number(activeSupplier?.balance) > 500000"
                type="button"
                @click="$emit('update:payAmount', 500000)"
                class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
              >
                500 000 so'm
              </button>
              <button
                v-if="Number(activeSupplier?.balance) > 1000000"
                type="button"
                @click="$emit('update:payAmount', 1000000)"
                class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
              >
                1 000 000 so'm
              </button>
            </div>
          </div>

          <!-- Remaining debt preview -->
          <div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex justify-between items-center text-xs">
            <span class="text-emerald-700 dark:text-emerald-300 font-medium">To'lovdan keyin qoladigan qarzimiz:</span>
            <span class="font-black font-mono text-emerald-600 dark:text-emerald-400 text-sm">
              {{ formatCurrency(Math.max(0, Number(activeSupplier?.balance || 0) - Number(payAmount || 0))) }}
            </span>
          </div>

          <!-- Anti-Fraud Audit Notice -->
          <div class="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-[11px] text-slate-500 flex items-center gap-2">
            <ShieldCheck class="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Chiqim amali avtomatik ravishda xavfsizlik audit jurnalida qayd etiladi.</span>
          </div>

          <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <AppButton variant="ghost" size="md" @click="$emit('close')">
              Bekor qilish
            </AppButton>
            <AppButton
              variant="primary"
              size="md"
              :loading="submitting"
              :disabled="!payAmount || payAmount <= 0"
              @click="$emit('submit')"
            >
              To'lovni Tasdiqlash
            </AppButton>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { CreditCard, X, ShieldCheck, Banknote, Building2 } from 'lucide-vue-next';
import AppButton from '../../../components/AppButton.vue';
import CurrencyInput from '../../../components/CurrencyInput.vue';
import { useFormat } from '../../../composables/useFormat';

withDefaults(
  defineProps<{
    isOpen: boolean;
    activeSupplier: any;
    payAmount: number;
    submitting: boolean;
    paymentSource?: string;
    paymentDescription?: string;
  }>(),
  {
    paymentSource: 'cash',
    paymentDescription: '',
  }
);

defineEmits<{
  (e: 'close'): void;
  (e: 'update:payAmount', val: number): void;
  (e: 'update:paymentSource', val: string): void;
  (e: 'update:paymentDescription', val: string): void;
  (e: 'submit'): void;
}>();

const { formatCurrency } = useFormat();
</script>
