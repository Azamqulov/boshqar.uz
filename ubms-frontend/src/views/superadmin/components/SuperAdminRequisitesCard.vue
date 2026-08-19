<template>
  <div class="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-5">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
      <div>
        <h2 class="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
          <CreditCard class="w-5 h-5 text-emerald-500" />
          <span>To'lov Qabul Qilish Karta Rekvizitlari</span>
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Mijozlar obuna to'lovini amalga oshirishi uchun ko'rsatiladigan rasmiy karta va aloqa ma'lumotlari
        </p>
      </div>

      <button
        type="button"
        @click="$emit('save')"
        :disabled="savingRequisites"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition shadow-sm shadow-emerald-500/20 disabled:opacity-50"
      >
        <Save class="w-4 h-4" />
        <span>{{ savingRequisites ? 'Saqlanmoqda...' : 'Rekvizitlarni Saqlash' }}</span>
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <!-- Karta Raqami -->
      <div class="space-y-1.5">
        <label class="text-xs font-bold text-slate-700 dark:text-slate-300">
          Bank Karta Raqami (Uzcard / Humo) <span class="text-rose-500">*</span>
        </label>
        <input
          v-model="requisitesForm.cardNumber"
          type="text"
          placeholder="8600 0000 0000 0000"
          class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
        />
      </div>

      <!-- Karta Egasi -->
      <div class="space-y-1.5">
        <label class="text-xs font-bold text-slate-700 dark:text-slate-300">
          Karta Egasi Ism-Familiyasi <span class="text-rose-500">*</span>
        </label>
        <input
          v-model="requisitesForm.cardHolder"
          type="text"
          placeholder="AZAMQULOV ALISHER"
          class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
        />
      </div>

      <!-- Bank Nomi -->
      <div class="space-y-1.5">
        <label class="text-xs font-bold text-slate-700 dark:text-slate-300">
          Bank Nomi
        </label>
        <input
          v-model="requisitesForm.bankName"
          type="text"
          placeholder="Kapitalbank / TBC Bank"
          class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
        />
      </div>

      <!-- Telefon Raqami -->
      <div class="space-y-1.5">
        <label class="text-xs font-bold text-slate-700 dark:text-slate-300">
          Bog'lanish Uchun Telefon
        </label>
        <input
          v-model="requisitesForm.phone"
          type="text"
          placeholder="+998 90 123 45 67"
          class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
        />
      </div>

      <!-- Telegram Aloqa -->
      <div class="space-y-1.5">
        <label class="text-xs font-bold text-slate-700 dark:text-slate-300">
          Telegram Bot / Admin Username
        </label>
        <input
          v-model="requisitesForm.telegramContact"
          type="text"
          placeholder="@Boshqar_uzbot"
          class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
        />
      </div>

      <!-- Status Toggle -->
      <div class="space-y-1.5">
        <label class="text-xs font-bold text-slate-700 dark:text-slate-300">
          To'lovlarni Qabul Qilish Holati
        </label>
        <div class="pt-1.5 flex items-center gap-3">
          <button
            type="button"
            @click="requisitesForm.isEnabled = !requisitesForm.isEnabled"
            :class="[
              'px-3.5 py-1.5 rounded-full text-xs font-bold border transition flex items-center gap-1.5',
              requisitesForm.isEnabled
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-300 dark:border-rose-800'
            ]"
          >
            <CheckCircle2 v-if="requisitesForm.isEnabled" class="w-3.5 h-3.5" />
            <XCircle v-else class="w-3.5 h-3.5" />
            <span>{{ requisitesForm.isEnabled ? 'To\'lovlar Faol (Yoqilgan)' : 'Vaqtincha To\'xtatilgan' }}</span>
          </button>
        </div>
      </div>

      <!-- To'lov Yo'riqnomasi -->
      <div class="md:col-span-2 lg:col-span-3 space-y-1.5">
        <label class="text-xs font-bold text-slate-700 dark:text-slate-300">
          Mijozlarga Ko'rsatiladigan Ko'rsatma / Izoh
        </label>
        <textarea
          v-model="requisitesForm.instructions"
          rows="2"
          placeholder="To'lovni amalga oshirgach, chek ma'lumotlarini kiritib yuboring..."
          class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs leading-relaxed focus:ring-2 focus:ring-emerald-500 outline-none"
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  CreditCard,
  Save,
  CheckCircle2,
  XCircle,
} from 'lucide-vue-next';

defineProps<{
  requisitesForm: {
    cardNumber: string;
    cardHolder: string;
    bankName: string;
    phone: string;
    telegramContact: string;
    isEnabled: boolean;
    instructions: string;
  };
  savingRequisites: boolean;
}>();

defineEmits<{
  (e: 'save'): void;
}>();
</script>
