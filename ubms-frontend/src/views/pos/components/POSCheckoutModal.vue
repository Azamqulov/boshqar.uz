<template>
  <Teleport to="body">
    <div v-if="isOpen" @click.self="$emit('close')" class="modal-overlay">
      <div class="modal-container max-w-md" @click.stop>
        <div class="modal-header">
          <h3 class="font-black text-base text-slate-900 dark:text-white">To'lovni Tasdiqlash</h3>
          <button @click="$emit('close')" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="modal-body space-y-4">
          <!-- Total display with dynamic discount breakdown -->
          <div class="p-4 bg-slate-100/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-1">
            <div v-if="allowDiscounts !== false && cartStore.generalDiscount > 0" class="flex items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span>Oraliq: <strong class="font-mono text-slate-700 dark:text-slate-300">{{ formatCurrency(cartStore.subtotal) }}</strong></span>
              <span>•</span>
              <span class="text-rose-500 font-bold">Chegirma: <strong class="font-mono">-{{ formatCurrency(cartStore.generalDiscount) }}</strong> ({{ cartStore.discountType === 'percent' ? cartStore.discountValue + '%' : formatCurrency(cartStore.discountValue) }})</span>
            </div>
            <span class="text-xs text-slate-500 dark:text-slate-400 block">To'lanishi kerak bo'lgan jami summa:</span>
            <h2 class="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">
              {{ formatCurrency(cartStore.grandTotal) }}
            </h2>
          </div>

          <!-- Quick Discount Box inside Checkout Modal (Faqat sozlamalarda ruxsat berilgan bo'lsa chiqadi) -->
          <div v-if="allowDiscounts !== false" class="p-3 rounded-2xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <Tag class="w-3.5 h-3.5" />
                <span>Chegirma qo'llash:</span>
              </span>
              <button
                v-if="cartStore.generalDiscount > 0"
                type="button"
                @click="clearDiscount"
                class="text-[11px] font-bold text-rose-500 hover:text-rose-700 underline"
              >
                Chegirmani bekor qilish
              </button>
            </div>

            <!-- % or So'm Toggle & Presets -->
            <div class="flex items-center gap-1.5">
              <div class="inline-flex rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5 text-xs font-bold shrink-0">
                <button
                  type="button"
                  @click="setDiscountType('percent')"
                  class="px-2.5 py-1 rounded-lg transition"
                  :class="discountMode === 'percent' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'"
                >
                  %
                </button>
                <button
                  type="button"
                  @click="setDiscountType('fixed')"
                  class="px-2.5 py-1 rounded-lg transition"
                  :class="discountMode === 'fixed' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'"
                >
                  so'm
                </button>
              </div>

              <!-- Presets -->
              <div v-if="discountMode === 'percent'" class="flex items-center gap-1 overflow-x-auto scrollbar-none flex-1">
                <button
                  v-for="p in [5, 10, 15, 20, 50]"
                  :key="p"
                  type="button"
                  @click="applyPercentDiscount(p)"
                  class="px-2 py-1 rounded-lg text-xs font-bold font-mono transition shrink-0"
                  :class="cartStore.discountType === 'percent' && cartStore.discountValue === p ? 'bg-rose-500 text-white shadow-xs' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'"
                >
                  {{ p }}%
                </button>
              </div>

              <div v-else class="flex items-center gap-1 overflow-x-auto scrollbar-none flex-1">
                <button
                  v-for="amt in [5000, 10000, 20000, 50000]"
                  :key="amt"
                  type="button"
                  @click="applyFixedDiscount(amt)"
                  class="px-2 py-1 rounded-lg text-xs font-bold font-mono transition shrink-0"
                  :class="cartStore.discountType === 'fixed' && cartStore.discountValue === amt ? 'bg-rose-500 text-white shadow-xs' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'"
                >
                  {{ formatCurrency(amt) }}
                </button>
              </div>

              <!-- More / Custom discount button -->
              <button
                type="button"
                @click="$emit('openDiscountModal')"
                class="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-rose-500 shrink-0"
                title="Boshqa summa kiritish"
              >
                Kiritish...
              </button>
            </div>
          </div>

          <!-- Restaurant Service & Table Confirmation / Selection in Checkout Modal -->
          <div v-if="isRestaurant && enabledServiceTypes.length > 0" class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2.5">
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-500 dark:text-slate-400 font-semibold">Xizmat turi:</span>
              <div class="flex items-center gap-1.5">
                <span v-if="orderType === 'dine_in'" class="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span>🍽️</span>
                  <span>Zalda</span>
                </span>
                <span v-else-if="orderType === 'takeaway'" class="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <span>🥡</span>
                  <span>Saboy (Olib ketish)</span>
                </span>
                <span v-else-if="orderType === 'delivery'" class="font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1">
                  <span>🛵</span>
                  <span>Yetkazib berish (Dostavka)</span>
                </span>
              </div>
            </div>

            <!-- Table Selection in Checkout Modal if Zalda -->
            <div v-if="orderType === 'dine_in'" class="pt-2 border-t border-slate-200 dark:border-slate-700/60 space-y-2">
              <div class="flex items-center justify-between text-xs">
                <span class="font-bold" :class="currentTableDisplayName ? 'text-slate-700 dark:text-slate-300' : 'text-rose-500 font-extrabold'">
                  🍽️ Qaysi stol band qilindi? *
                </span>
                <span v-if="currentTableDisplayName" class="font-black text-emerald-600 dark:text-emerald-400">
                  {{ currentTableDisplayName }}
                </span>
                <span v-else class="text-[11px] text-rose-500 font-bold animate-pulse">
                  Tanlanmagan!
                </span>
              </div>

              <!-- Table Options -->
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="tbl in availableTables"
                  :key="tbl.id || tbl.name"
                  type="button"
                  @click="$emit('selectTable', tbl.name)"
                  class="px-3 py-1.5 rounded-xl text-xs font-bold transition"
                  :class="selectedTableNumber === tbl.name && !isCustomTableInput ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 border border-slate-200 dark:border-slate-600'"
                >
                  {{ tbl.name }}
                </button>
              </div>

              <!-- Custom table input toggle -->
              <div class="pt-1">
                <div v-if="isCustomTableInput" class="flex gap-1.5">
                  <input
                    :value="customTableNumber"
                    @input="$emit('update:customTableNumber', ($event.target as HTMLInputElement).value)"
                    type="text"
                    placeholder="Masalan: Stol #7, VIP 2..."
                    class="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  v-else
                  type="button"
                  @click="$emit('enableCustomTable')"
                  class="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                >
                  + Boshqa stol nomini kiritish
                </button>
              </div>
            </div>
          </div>

          <!-- Payment Method Selection (2 ustun, matnlar to'liq va chiroyli joylashadi) -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">To'lov Turi:</label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                v-for="(pm, idx) in paymentMethods"
                :key="pm.id"
                type="button"
                @click="$emit('selectPaymentMethod', pm.id)"
                class="p-3.5 rounded-2xl border text-xs font-bold transition flex items-center gap-3 relative group btn-interactive"
                :class="[
                  paymentMethods.length === 3 && idx === 2 ? 'sm:col-span-2' : '',
                  selectedPaymentMethod === pm.id
                    ? (pm.type === 'debt'
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/25 ring-2 ring-amber-500/30'
                        : 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20')
                    : (pm.type === 'debt'
                        ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100/60 dark:hover:bg-amber-900/30'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700')
                ]"
              >
                <div
                  class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition"
                  :class="[
                    selectedPaymentMethod === pm.id
                      ? (pm.type === 'debt' ? 'bg-slate-950/15 text-slate-950' : 'bg-white/20 text-white')
                      : (pm.type === 'debt' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300')
                  ]"
                >
                  <Banknote v-if="pm.type === 'cash'" class="w-5 h-5" />
                  <CreditCard v-else-if="pm.type === 'card'" class="w-5 h-5" />
                  <Smartphone v-else-if="pm.type === 'click'" class="w-5 h-5" />
                  <FileText v-else-if="pm.type === 'debt'" class="w-5 h-5" />
                </div>
                <div class="text-left flex-1 min-w-0">
                  <span class="block text-sm font-extrabold leading-tight whitespace-nowrap">{{ pm.name }}</span>
                  <span
                    class="block text-[11px] font-normal mt-0.5 whitespace-nowrap"
                    :class="selectedPaymentMethod === pm.id ? (pm.type === 'debt' ? 'text-slate-900/80' : 'text-emerald-100') : 'text-slate-400 dark:text-slate-500'"
                  >
                    {{ pm.type === 'cash' ? 'Qaytim hisoblash' : pm.type === 'debt' ? 'Qarzga yozish' : 'Karta / Ilova orqali' }}
                  </span>
                </div>
              </button>
            </div>
          </div>

          <!-- Nasiya (Debt) 100% Alert Banner if Nasiya Card Selected -->
          <div v-if="selectedPaymentMethod === '4'" class="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-xs space-y-2 animate-in fade-in">
            <div class="flex items-center justify-between">
              <span class="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <FileText class="w-4 h-4 text-amber-600" />
                <span>100% Nasiya savdo (Qarzga yozish)</span>
              </span>
              <span class="font-mono font-black text-rose-600 dark:text-rose-400 text-sm">
                {{ formatCurrency(cartStore.grandTotal) }}
              </span>
            </div>
            <p class="text-[11px] text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
              Ushbu to'lov to'liq mijoz hisobiga qarz sifatida yoziladi. Iltimos, quyida mijozni tanlang.
            </p>
          </div>

          <!-- Cash change calculation if cash selected -->
          <div v-if="selectedPaymentMethod === '1'" class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div>
              <label class="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Mijoz bergan summa:</label>
              <CurrencyInput
                :model-value="cashReceived"
                @update:model-value="$emit('update:cashReceived', $event)"
                placeholder="0"
                suffix="so'm"
                inputClass="font-bold text-slate-900 dark:text-white"
              />
            </div>

            <!-- Quick Cash Buttons -->
            <div class="flex flex-wrap gap-1.5">
              <button
                type="button"
                @click="$emit('update:cashReceived', cartStore.grandTotal)"
                class="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-semibold text-slate-700 dark:text-slate-300 hover:border-emerald-500 transition"
              >
                Aniq summa
              </button>
              <button
                type="button"
                v-for="amt in [50000, 100000, 200000]"
                :key="amt"
                @click="$emit('update:cashReceived', amt)"
                class="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-700 dark:text-slate-300 hover:border-emerald-500 transition"
              >
                {{ formatCurrency(amt) }}
              </button>
            </div>

            <!-- Full or Overpaid Cash: Show Change (Qaytim) -->
            <div v-if="cashReceived > cartStore.grandTotal" class="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800 text-xs">
              <span class="text-slate-500 dark:text-slate-400 font-semibold">Qaytim:</span>
              <span class="font-bold font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                {{ formatCurrency(cashReceived - cartStore.grandTotal) }}
              </span>
            </div>
            <!-- Underpaid Cash: Partial Payment Alert -->
            <div v-else-if="cashReceived > 0 && cashReceived < cartStore.grandTotal" class="pt-1 border-t border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-slate-500 dark:text-slate-400 font-semibold">Naqd kiritilgan:</span>
                <span class="font-bold font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                  {{ formatCurrency(cashReceived) }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-rose-600 dark:text-rose-400 font-bold">
                  {{ allowDebt ? 'Nasiyaga yoziladigan qoldiq:' : 'Yetishmayotgan summa:' }}
                </span>
                <span class="font-bold font-mono text-rose-600 dark:text-rose-400 text-sm">
                  {{ formatCurrency(cartStore.grandTotal - cashReceived) }}
                </span>
              </div>
              <div
                v-if="allowDebt"
                class="p-2 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-800 dark:text-amber-300 text-[11px] font-semibold flex items-center gap-1.5"
              >
                <span>⚠️ Mijoz to'liq summa bermadi. Qolgan summa nasiyaga yozilishi uchun pastda mijozni tanlang.</span>
              </div>
              <div
                v-else
                class="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-700 dark:text-rose-300 text-[11px] font-bold flex items-center gap-1.5"
              >
                <span>⛔ Nasiya savdosi o'chirilgan! To'lov to'liq summa bo'lishi shart.</span>
              </div>
            </div>
          </div>

          <!-- Customer / Nasiya Selector in Checkout Modal (FAKAT NASIYA BO'LGANDA VA RUXSAT BERILGANDA CHIQADI) -->
          <div
            v-if="isNasiyaNeeded && allowDebt"
            class="p-3.5 rounded-2xl transition-all duration-300 border space-y-2.5 animate-in fade-in slide-in-from-top-2"
            :class="[
              !selectedCustomerId
                ? 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/50 shadow-sm ring-2 ring-amber-500/20'
                : 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/40'
            ]"
          >
            <div class="flex items-center justify-between">
              <label class="block text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <Users class="w-4 h-4 text-amber-600" />
                <span>Nasiyaga yoziladigan mijozni tanlang: *</span>
              </label>
              <span v-if="!selectedCustomerId" class="text-[10px] text-rose-600 font-extrabold animate-pulse">
                Mijoz tanlanmagan!
              </span>
            </div>

            <div class="flex items-center gap-2">
              <div class="flex-1">
                <AppSelect
                  :model-value="selectedCustomerId"
                  @update:model-value="$emit('update:selectedCustomerId', $event)"
                  :options="customerSelectOptions"
                  :searchable="true"
                  placeholder="Mijozni qidirish yoki tanlash..."
                />
              </div>
              <button
                type="button"
                @click="$emit('openNewCustomer')"
                class="px-3 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-xs shrink-0 transition shadow-sm btn-interactive flex items-center gap-1"
                title="Yangi mijoz qo'shish"
              >
                <span>+ Yangi</span>
              </button>
            </div>

            <div v-if="selectedCustomer" class="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-1">
              <div class="flex items-center justify-between">
                <span class="font-bold text-slate-900 dark:text-white">👤 {{ selectedCustomer.fullName }}</span>
                <span class="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{{ selectedCustomer.phone || 'Tel yo\'q' }}</span>
              </div>
              <div v-if="Number(selectedCustomer.debt || 0) > 0" class="text-[11px] text-rose-600 dark:text-rose-400 font-semibold flex items-center justify-between">
                <span>Eski qarzi:</span>
                <span class="font-mono font-bold">{{ formatCurrency(selectedCustomer.debt) }}</span>
              </div>
              <div v-if="currentNasiyaAmount > 0" class="pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-amber-700 dark:text-amber-300 flex items-center justify-between">
                <span>Nasiyaga qo'shiladigan summa:</span>
                <span class="font-mono font-black text-rose-600 dark:text-rose-400">+{{ formatCurrency(currentNasiyaAmount) }}</span>
              </div>
            </div>
          </div>

          <button
            @click="$emit('completeOrder')"
            :disabled="isSubmitDisabled"
            class="w-full py-3.5 rounded-xl font-black text-sm shadow-lg transition flex items-center justify-center space-x-2 btn-interactive"
            :class="[
              isSubmitDisabled
                ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed opacity-60 text-slate-500 shadow-none'
                : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/25 text-white cursor-pointer'
            ]"
          >
            <CheckCircle class="w-5 h-5" />
            <span>{{ isProcessing ? 'Chek chiqarilmoqda...' : 'To\'lovni Yakunlash (Chek Chiqarish)' }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  X,
  CreditCard,
  Banknote,
  Smartphone,
  FileText,
  Users,
  CheckCircle,
  Tag,
} from 'lucide-vue-next';
import CurrencyInput from '../../../components/CurrencyInput.vue';
import AppSelect from '../../../components/AppSelect.vue';
import { useFormat } from '../../../composables/useFormat';

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    cartStore: any;
    isRestaurant: boolean;
    enabledServiceTypes: string[];
    orderType: string;
    currentTableDisplayName: string;
    availableTables: any[];
    selectedTableNumber: string;
    isCustomTableInput: boolean;
    customTableNumber: string;
    paymentMethods: any[];
    selectedPaymentMethod: string;
    cashReceived: number;
    isNasiyaNeeded: boolean;
    selectedCustomerId: string;
    customerSelectOptions: any[];
    selectedCustomer: any;
    currentNasiyaAmount: number;
    isProcessing: boolean;
    allowDebt?: boolean;
    allowDiscounts?: boolean;
  }>(),
  {
    allowDebt: true,
    allowDiscounts: true,
  }
);

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'selectTable', name: string): void;
  (e: 'update:customTableNumber', val: string): void;
  (e: 'enableCustomTable'): void;
  (e: 'selectPaymentMethod', pmId: string): void;
  (e: 'update:cashReceived', val: number): void;
  (e: 'update:selectedCustomerId', val: string): void;
  (e: 'openNewCustomer'): void;
  (e: 'openDiscountModal'): void;
  (e: 'completeOrder'): void;
}>();

const { formatCurrency } = useFormat();

const discountMode = ref<'percent' | 'fixed'>('percent');

const setDiscountType = (mode: 'percent' | 'fixed') => {
  discountMode.value = mode;
  props.cartStore.discountType = mode;
  if (props.selectedPaymentMethod === '1') {
    emit('update:cashReceived', props.cartStore.grandTotal);
  }
};

const applyPercentDiscount = (p: number) => {
  discountMode.value = 'percent';
  props.cartStore.setDiscountPercent(p);
  if (props.selectedPaymentMethod === '1') {
    emit('update:cashReceived', props.cartStore.grandTotal);
  }
};

const applyFixedDiscount = (amt: number) => {
  discountMode.value = 'fixed';
  props.cartStore.setDiscountFixed(amt);
  if (props.selectedPaymentMethod === '1') {
    emit('update:cashReceived', props.cartStore.grandTotal);
  }
};

const clearDiscount = () => {
  props.cartStore.clearDiscount();
  if (props.selectedPaymentMethod === '1') {
    emit('update:cashReceived', props.cartStore.grandTotal);
  }
};

const isSubmitDisabled = computed(() => {
  if (props.isProcessing) return true;
  // If cash is selected and cash is underpaid while debt is disabled -> disabled!
  if (!props.allowDebt && props.selectedPaymentMethod === '1' && props.cashReceived < props.cartStore.grandTotal) {
    return true;
  }
  // If cash entered is 0 or negative
  if (props.selectedPaymentMethod === '1' && props.cashReceived <= 0) {
    return true;
  }
  // If nasiya is needed and no customer is selected -> disabled!
  if (props.isNasiyaNeeded && props.allowDebt && !props.selectedCustomerId) {
    return true;
  }
  return false;
});
</script>
