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
              <p class="flex items-center gap-1.5"><User class="w-3.5 h-3.5" /> <span>Tanlangan: <b>{{ selectedCustomerObj?.fullName }}</b> ({{ selectedCustomerObj?.phone || 'Tel yo\'q' }})</span></p>
              <p v-if="nasiyaCalcAmount > 0" class="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1.5">
                <AlertTriangle class="w-3.5 h-3.5 shrink-0" />
                <span>Qolgan {{ formatCurrency(nasiyaCalcAmount) }} summa ushbu mijozning Nasiya hisobiga yoziladi.</span>
              </p>
              <p v-else class="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 class="w-3.5 h-3.5 shrink-0" />
                <span>To'lov to'liq amalga oshiriladi.</span>
              </p>
            </div>
          </div>

          <!-- CARD / CLICK PAYMENT: OWNER CARD DETAILS & RECEIPT UPLOAD -->
          <div v-if="tablePaymentMethod === '2' || tablePaymentMethod === '3'" class="space-y-3">
            <!-- Owner Card Box -->
            <div
              v-if="posSettings.ownerCardNumber"
              class="rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-slate-50 dark:from-slate-900 dark:via-emerald-950 dark:to-slate-900 p-4 text-slate-900 dark:text-white shadow-xs border border-emerald-500/30 relative overflow-hidden"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-[11px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-mono">
                  {{ posSettings.ownerCardBank || 'KAPITALBANK' }}
                </span>
                <span class="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/15 dark:bg-white/10 text-emerald-800 dark:text-white border border-emerald-500/20 dark:border-white/20">
                  {{ posSettings.ownerCardNumber.startsWith('9860') ? 'HUMO' : posSettings.ownerCardNumber.startsWith('8600') ? 'UZCARD' : 'KARTA' }}
                </span>
              </div>

              <!-- Card Number + Copy -->
              <div class="flex items-center justify-between my-2 bg-white dark:bg-black/30 p-2.5 rounded-xl border border-emerald-500/20 dark:border-white/10 shadow-xs">
                <span class="font-mono text-sm sm:text-base font-black tracking-widest text-slate-900 dark:text-emerald-100">
                  {{ posSettings.ownerCardNumber }}
                </span>
                <button
                  type="button"
                  @click="copyCardNumber(posSettings.ownerCardNumber)"
                  class="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs shadow-emerald-500/20"
                >
                  <component :is="isCopied ? Check : Copy" class="w-3.5 h-3.5" />
                  <span>{{ isCopied ? 'Nusxalandi' : 'Nusxa olish' }}</span>
                </button>
              </div>

              <!-- Cardholder -->
              <div class="flex items-center justify-between text-[11px] pt-1.5 border-t border-emerald-500/15 dark:border-white/10">
                <div>
                  <span class="text-[9px] text-slate-500 dark:text-emerald-400/80 block uppercase font-bold">Karta Egasi:</span>
                  <span class="font-bold tracking-wider uppercase text-slate-900 dark:text-white font-mono text-xs">
                    {{ posSettings.ownerCardHolder || 'BIZNES EGASI' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Hint if no card is set -->
            <div
              v-else
              class="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between"
            >
              <div class="flex items-center gap-2">
                <CreditCard class="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Karta rekvizitlarini <b>Sozlamalar ➔ Terminallar</b> bo'limida kiritishingiz mumkin.</span>
              </div>
            </div>

            <!-- Receipt Upload Section (Click / Payme Cheki) -->
            <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <div class="flex items-center justify-between">
                <label class="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Upload class="w-3.5 h-3.5 text-emerald-600" />
                  <span>To'lov / Click chekini biriktirish (Ixtiyoriy):</span>
                </label>
                <span v-if="receiptPreview" class="text-[10px] text-emerald-600 font-bold">
                  ✓ Chek yuklandi
                </span>
              </div>

              <!-- Upload input & Preview -->
              <div v-if="!receiptPreview">
                <label class="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-xl cursor-pointer bg-white dark:bg-slate-800/60 transition group">
                  <div class="flex items-center gap-2 text-slate-500 group-hover:text-emerald-600">
                    <Camera class="w-4 h-4" />
                    <span class="text-xs font-semibold">Chek skrinshotini tanlang yoki rasmga oling</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleReceiptFileChange"
                  />
                </label>
              </div>

              <div v-else class="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div class="flex items-center gap-2.5 overflow-hidden">
                  <img :src="receiptPreview" class="w-10 h-10 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shrink-0" />
                  <div class="text-xs truncate">
                    <span class="font-bold text-slate-900 dark:text-white block truncate">{{ receiptFileName || 'To\'lov cheki' }}</span>
                    <span class="text-[10px] text-slate-400">Skrinshot biriktirildi</span>
                  </div>
                </div>

                <button
                  type="button"
                  @click="removeReceipt"
                  class="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                  title="Chekni o'chirish"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
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

            <div v-else-if="!selectedCustomerId && tableCashReceived < orderTotalSum" class="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1.5">
              <AlertTriangle class="w-3.5 h-3.5 shrink-0" />
              <span>Nasiyaga yozish uchun yuqoridan Mijozni tanlang, aks holda to'liq summani kiriting</span>
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
import { ref } from 'vue';
import {
  Receipt,
  X,
  Banknote,
  CreditCard,
  Smartphone,
  Users,
  CheckCircle2,
  User,
  AlertTriangle,
  Upload,
  Camera,
  Trash2,
  Copy,
  Check,
} from 'lucide-vue-next';
import CurrencyInput from '../../../components/CurrencyInput.vue';
import AppSelect from '../../../components/AppSelect.vue';
import { useFormat } from '../../../composables/useFormat';
import { usePosSettings } from '../../../composables/usePosSettings';
import { useToast } from '../../../composables/useToast';

const toast = useToast();
const { posSettings } = usePosSettings();

const isCopied = ref(false);
const receiptPreview = ref<string | null>(null);
const receiptFileName = ref<string>('');

const copyCardNumber = async (num: string) => {
  if (!num) return;
  try {
    await navigator.clipboard.writeText(num.replace(/\s+/g, ''));
    isCopied.value = true;
    toast.success('Karta raqami nusxalandi!', 'Nusxa olindi');
    setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  } catch (e) {}
};

const handleReceiptFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    toast.warning('Rasm hajmi 5MB dan oshmasligi kerak', 'Fayl hajmi');
    return;
  }

  receiptFileName.value = file.name;
  const reader = new FileReader();
  reader.onload = (event) => {
    receiptPreview.value = event.target?.result as string;
    toast.success('To\'lov cheki muvaffaqiyatli biriktirildi!', 'Chek yuklandi');
  };
  reader.readAsDataURL(file);
};

const removeReceipt = () => {
  receiptPreview.value = null;
  receiptFileName.value = '';
};

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
