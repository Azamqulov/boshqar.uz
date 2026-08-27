<script setup lang="ts">
import { ref } from 'vue';
import { CreditCard, Send, X, PlusCircle, CheckCircle2, History, ArrowDownRight, ArrowUpRight, Phone, MessageSquare } from 'lucide-vue-next';
import api from '../../../services/api';
import { useToast } from '../../../composables/useToast';

const toast = useToast();

interface CustomerDebtItem {
  id: string;
  name: string;
  phone?: string;
  debt: number;
  maxDebtLimit?: number;
  notes?: string;
}

const props = defineProps<{
  isOpen: boolean;
  customer: CustomerDebtItem | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'updated'): void;
}>();

const activeTab = ref<'history' | 'add' | 'pay'>('history');
const amountInput = ref<number | ''>('');
const notesInput = ref('');
const isSubmitting = ref(false);
const reminderSent = ref(false);
const reminderError = ref<string | null>(null);

const formatCurrency = (val: number) => {
  return Number(val || 0).toLocaleString('uz-UZ') + " so'm";
};

const handleAddDebt = async () => {
  if (!props.customer?.id || !amountInput.value || Number(amountInput.value) <= 0) return;
  isSubmitting.value = true;
  try {
    await api.post(`/customers/${props.customer.id}/add-debt`, {
      amount: Number(amountInput.value),
      notes: notesInput.value || "Qo'shimcha nasiya",
    });
    amountInput.value = '';
    notesInput.value = '';
    toast.success('Qarz muvaffaqiyatli kiritildi', 'Nasiya');
    emit('updated');
    activeTab.value = 'history';
  } catch (err: any) {
    toast.error(err?.response?.data?.message || 'Qarz kiritishda xatolik yuz berdi', 'Nasiya');
  } finally {
    isSubmitting.value = false;
  }
};

const handlePayDebt = async () => {
  if (!props.customer?.id || !amountInput.value || Number(amountInput.value) <= 0) return;
  isSubmitting.value = true;
  try {
    await api.post(`/customers/${props.customer.id}/pay-debt`, {
      amount: Number(amountInput.value),
      notes: notesInput.value || "Nasiya to'lovi qabul qilindi",
    });
    amountInput.value = '';
    notesInput.value = '';
    toast.success("Nasiya to'lovi muvaffaqiyatli qabul qilindi", 'To\'lov');
    emit('updated');
    activeTab.value = 'history';
  } catch (err: any) {
    toast.error(err?.response?.data?.message || "To'lovni saqlashda xatolik yuz berdi", 'To\'lov');
  } finally {
    isSubmitting.value = false;
  }
};

const sendTelegramReminder = () => {
  if (!props.customer) return;
  reminderSent.value = false;
  reminderError.value = null;

  const phone = props.customer.phone ? props.customer.phone.replace(/\D/g, '') : '';
  const text = encodeURIComponent(
    `Hurmatli ${props.customer.name}! Boshqar.uz do'konimizdan nasiya qoldig'ingiz: ${formatCurrency(props.customer.debt)} tashkil etadi. Iltimos, o'z vaqtida to'lov qilishni unutmang!`
  );

  // If phone exists, open Telegram URL or SMS
  if (phone) {
    window.open(`https://t.me/+${phone}?text=${text}`, '_blank');
    reminderSent.value = true;
  } else {
    window.open(`https://t.me/share/url?url=${encodeURIComponent('https://boshqar.uz')}&text=${text}`, '_blank');
    reminderSent.value = true;
  }
};
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen && customer"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="emit('close')"
    >
      <div
        class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="p-2.5 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl">
              <CreditCard class="w-6 h-6" />
            </div>
            <div>
              <h2 class="text-lg font-bold text-slate-900 dark:text-white">
                {{ customer.name }} — Nasiya Daftari
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Phone v-if="customer.phone" class="w-3 h-3" />
                {{ customer.phone || 'Telefon kiritilmagan' }}
              </p>
            </div>
          </div>
          <button
            class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            @click="emit('close')"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Debt Overview Banner -->
        <div class="px-6 py-4 bg-rose-50/50 dark:bg-rose-950/20 border-b border-rose-100 dark:border-rose-900/30 flex items-center justify-between">
          <div>
            <div class="text-xs text-rose-600 dark:text-rose-400 font-semibold uppercase tracking-wider">
              Joriy Nasiya Qoldig'i
            </div>
            <div class="text-2xl font-black text-rose-700 dark:text-rose-300">
              {{ formatCurrency(customer.debt) }}
            </div>
          </div>
          <button
            type="button"
            class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition active:scale-95"
            @click="sendTelegramReminder"
          >
            <Send class="w-3.5 h-3.5" />
            Telegram Eslatma Yuborish
          </button>
        </div>

        <div v-if="reminderSent" class="px-6 py-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 class="w-4 h-4 text-emerald-500" />
          Telegram eslatma oynasi ochildi!
        </div>

        <!-- Tabs Navigation -->
        <div class="px-6 pt-4 flex gap-2 border-b border-slate-100 dark:border-slate-800">
          <button
            type="button"
            :class="[
              'px-4 py-2 text-xs font-bold border-b-2 transition -mb-[1px]',
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            ]"
            @click="activeTab = 'history'"
          >
            Nasiya & To'lov Tarixi
          </button>
          <button
            type="button"
            :class="[
              'px-4 py-2 text-xs font-bold border-b-2 transition -mb-[1px]',
              activeTab === 'pay'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            ]"
            @click="activeTab = 'pay'"
          >
            + To'lov Qabul Qilish (So'ndirish)
          </button>
          <button
            type="button"
            :class="[
              'px-4 py-2 text-xs font-bold border-b-2 transition -mb-[1px]',
              activeTab === 'add'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            ]"
            @click="activeTab = 'add'"
          >
            + Qarz Qo'shish
          </button>
        </div>

        <!-- Tab Contents -->
        <div class="flex-1 overflow-y-auto p-6 space-y-4">
          <!-- History Tab -->
          <div v-if="activeTab === 'history'" class="space-y-3">
            <div class="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-2">
              <div class="flex items-center justify-between font-semibold">
                <span class="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                  <ArrowUpRight class="w-4 h-4" /> Nasiya xaridi (Kassa orqali)
                </span>
                <span class="font-bold text-rose-600">+ {{ formatCurrency(customer.debt) }}</span>
              </div>
              <p class="text-[11px] text-slate-400">
                Ushbu mijoz bo'yicha jami ochiq qarz qoldig'i hisobga olingan.
              </p>
            </div>
          </div>

          <!-- Pay Tab -->
          <div v-else-if="activeTab === 'pay'" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                To'lov Summasi (UZS)
              </label>
              <input
                v-model.number="amountInput"
                type="number"
                placeholder="Masalan: 50000"
                class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Izoh (Ixtiyoriy)
              </label>
              <input
                v-model="notesInput"
                type="text"
                placeholder="Kassaga naqd to'landi"
                class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
              />
            </div>
            <button
              type="button"
              :disabled="isSubmitting || !amountInput"
              class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition disabled:opacity-50"
              @click="handlePayDebt"
            >
              {{ isSubmitting ? "Saqlanmoqda..." : "To'lovni Saqlash va Qarzni Kamaytirish" }}
            </button>
          </div>

          <!-- Add Debt Tab -->
          <div v-else-if="activeTab === 'add'" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Qo'shiladigan Qarz Summasi (UZS)
              </label>
              <input
                v-model.number="amountInput"
                type="number"
                placeholder="Masalan: 25000"
                class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Izoh / Sabab
              </label>
              <input
                v-model="notesInput"
                type="text"
                placeholder="Qo'shimcha tovar oldi"
                class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
              />
            </div>
            <button
              type="button"
              :disabled="isSubmitting || !amountInput"
              class="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-500/25 transition disabled:opacity-50"
              @click="handleAddDebt"
            >
              {{ isSubmitting ? "Saqlanmoqda..." : "Qarzni Kiritish" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
