<template>
  <div class="glass-card rounded-2xl p-4 sm:p-6 space-y-6">
    <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
      <div>
        <h4 class="text-sm font-black text-slate-900 dark:text-white">Avtomatik Telegram Xabarnomalar</h4>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Qaysi hodisalar yuz berganda Telegramga bildirishnoma yuborilishini tanlang
        </p>
      </div>
      <button
        type="button"
        @click="$emit('save')"
        :disabled="saving"
        class="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5 cursor-pointer"
      >
        <Save class="w-3.5 h-3.5" />
        <span>{{ saving ? 'Saqlanmoqda...' : 'Saqlash' }}</span>
      </button>
    </div>

    <!-- Notification Switches Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- 1. New Sale Receipt -->
      <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-start justify-between gap-3">
        <div class="flex items-start gap-3">
          <div class="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Receipt class="w-4 h-4" />
          </div>
          <div>
            <div class="text-xs font-bold text-slate-900 dark:text-white">Har bir sotuv (Kassa cheki)</div>
            <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Kassada har bir yangi chek urilganda summasi va to'lov turi bilan xabar yuborish
            </div>
          </div>
        </div>
        <label class="relative inline-flex items-center cursor-pointer shrink-0">
          <input type="checkbox" v-model="settings.notifyOnSale" class="sr-only peer" />
          <div class="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
        </label>
      </div>

      <!-- 2. Low Stock Warning -->
      <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-start justify-between gap-3">
        <div class="flex items-start gap-3">
          <div class="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle class="w-4 h-4" />
          </div>
          <div>
            <div class="text-xs font-bold text-slate-900 dark:text-white">Omborda tovar tugaganda</div>
            <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Mahsulot qoldig'i minimal miqdordan (masalan 5 donadan) kam qolganda ogohlantirish
            </div>
          </div>
        </div>
        <label class="relative inline-flex items-center cursor-pointer shrink-0">
          <input type="checkbox" v-model="settings.notifyOnLowStock" class="sr-only peer" />
          <div class="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
        </label>
      </div>

      <!-- 3. Shift Close & Daily Summary -->
      <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-start justify-between gap-3">
        <div class="flex items-start gap-3">
          <div class="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Clock class="w-4 h-4" />
          </div>
          <div>
            <div class="text-xs font-bold text-slate-900 dark:text-white">Smena yopilishi va Kunlik hisobot</div>
            <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Kassir smenani yopganda kassa hisoboti va kunlik tushum xulosasini olish
            </div>
          </div>
        </div>
        <label class="relative inline-flex items-center cursor-pointer shrink-0">
          <input type="checkbox" v-model="settings.notifyOnShiftClose" class="sr-only peer" />
          <div class="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
        </label>
      </div>

      <!-- 4. Debt & Credit Alert -->
      <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-start justify-between gap-3">
        <div class="flex items-start gap-3">
          <div class="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Users class="w-4 h-4" />
          </div>
          <div>
            <div class="text-xs font-bold text-slate-900 dark:text-white">Nasiya va qarz qaytarilishi</div>
            <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Mijozga nasiyaga tovar berilganda yoki qarz to'langanda avtomatik xabarnoma
            </div>
          </div>
        </div>
        <label class="relative inline-flex items-center cursor-pointer shrink-0">
          <input type="checkbox" v-model="settings.notifyOnDebt" class="sr-only peer" />
          <div class="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Receipt, AlertTriangle, Clock, Users, Save } from 'lucide-vue-next';

defineProps<{
  settings: {
    notifyOnSale: boolean;
    notifyOnLowStock: boolean;
    notifyOnShiftClose: boolean;
    notifyOnDebt: boolean;
    dailySummaryTime?: string;
  };
  saving?: boolean;
}>();

defineEmits<{
  (e: 'save'): void;
}>();
</script>
