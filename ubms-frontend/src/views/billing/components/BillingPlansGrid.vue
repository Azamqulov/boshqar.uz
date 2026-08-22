<template>
  <div class="space-y-6">
    <div class="text-center max-w-xl mx-auto space-y-1.5">
      <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
        Siz Uchun Qulay Tarif Rejalari
      </h2>
      <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
        Biznesingiz hajmiga qarab eng mos rejani tanlang va cheklovlarsiz rivojlaning
      </p>
    </div>

    <!-- SuperAdmin Indicator & Management Notice -->
    <div
      v-if="isSuperAdmin"
      class="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
    >
      <div class="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold">
        <ShieldCheck class="w-4 h-4 text-amber-500 shrink-0" />
        <span>SuperAdmin Rejimi: Siz platformadagi barcha tarif narxlari va limitlarini to'g'ridan-to'g'ri shu yerdan tahrirlashingiz mumkin.</span>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        v-for="plan in plans"
        :key="plan.id"
        :class="[
          'rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 relative',
          plan.id === currentActivePlanId
            ? 'border-2 border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-md ring-1 ring-emerald-500/20'
            : 'border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md'
        ]"
      >
        <div class="space-y-5">
          <div class="flex items-start justify-between gap-2">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-lg font-black text-slate-900 dark:text-white">{{ plan.name }}</h3>
                <!-- Clean Single Status Badge -->
                <span
                  v-if="plan.id === currentActivePlanId"
                  class="text-[10px] px-2.5 py-0.5 rounded-full font-black bg-emerald-600 text-white shadow-2xs uppercase tracking-wider"
                >
                  Faol Reja
                </span>
                <span
                  v-else-if="Number(plan.priceMonthly) > Number(currentActivePlan?.priceMonthly || 0)"
                  class="text-[10px] px-2 py-0.5 rounded-full font-bold bg-teal-100 dark:bg-teal-900/70 text-teal-700 dark:text-teal-300 uppercase tracking-wider"
                >
                  Upgrade
                </span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {{ plan.name === 'Free' ? 'Boshlang\'ich va sinov uchun' : plan.name === 'Pro' ? 'Kichik va o\'rta bizneslar uchun' : 'Katta do\'konlar va tarmoqlar uchun' }}
              </p>
            </div>

            <!-- SuperAdmin Edit Button -->
            <button
              v-if="isSuperAdmin"
              type="button"
              @click="$emit('open-edit-plan', plan)"
              class="px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[11px] font-bold transition flex items-center gap-1 shrink-0"
              title="SuperAdmin: Ushbu tarif narxi va limitlarini tahrirlash"
            >
              <Edit2 class="w-3 h-3" />
              <span>Tahrirlash</span>
            </button>
          </div>

          <div class="py-3 border-y border-slate-100 dark:border-slate-800">
            <span class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {{ Number(plan.priceMonthly) === 0 ? 'Bepul' : formatMoney(plan.priceMonthly) }}
            </span>
            <span v-if="Number(plan.priceMonthly) > 0" class="text-xs text-slate-400 font-medium"> / oy</span>
          </div>

          <!-- Features list -->
          <ul class="space-y-3 text-xs text-slate-600 dark:text-slate-300">
            <li class="flex items-center gap-2.5">
              <Check class="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.5]" />
              <span>Filiallar: <strong>{{ plan.maxBranches === null ? 'Cheksiz' : `${plan.maxBranches} ta` }}</strong></span>
            </li>
            <li class="flex items-center gap-2.5">
              <Check class="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.5]" />
              <span>Xodimlar / Kassirlar: <strong>{{ plan.maxUsers === null ? 'Cheksiz' : `${plan.maxUsers} ta` }}</strong></span>
            </li>
            <li class="flex items-center gap-2.5">
              <Check class="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.5]" />
              <span>Kassa (POS) va chek chiqarish</span>
            </li>
            <li class="flex items-center gap-2.5">
              <Check class="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.5]" />
              <span>Ombor va qoldiq nazorati</span>
            </li>
            <li class="flex items-center gap-2.5">
              <Check class="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.5]" />
              <span>Moliya & Kunlik hisobotlar</span>
            </li>
            <li v-if="plan.name !== 'Free'" class="flex items-center gap-2.5">
              <Check class="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.5]" />
              <span>Telegram Bot bildirishnomalari</span>
            </li>
            <li v-if="plan.name === 'Business'" class="flex items-center gap-2.5">
              <Check class="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.5]" />
              <span>VIP 24/7 Shaxsiy menejer qo'llab-quvvatlashi</span>
            </li>
          </ul>
        </div>

        <!-- Bottom Button depending on Active / Upgrade / Current state -->
        <div class="pt-6">
          <!-- Case 1: This is the user's current active plan -->
          <template v-if="plan.id === currentActivePlanId">
            <button
              v-if="Number(plan.priceMonthly) > 0"
              type="button"
              @click="$emit('open-payment', plan)"
              class="w-full py-3 rounded-2xl font-bold text-xs transition active:scale-95 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/25"
            >
              <Sparkles class="w-4 h-4" />
              <span>Muddatni Uzaytirish</span>
            </button>
            <div
              v-else
              class="text-center py-2.5 px-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-500/20 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-1.5"
            >
              <Check class="w-3.5 h-3.5" />
              <span>Boshlang'ich bepul rejadasiz</span>
            </div>
          </template>

          <!-- Case 2: This is a higher tier plan (UPGRADE) -->
          <template v-else-if="Number(plan.priceMonthly) > Number(currentActivePlan?.priceMonthly || 0)">
            <button
              type="button"
              @click="$emit('open-payment', plan)"
              class="w-full py-3 rounded-2xl font-bold text-xs transition active:scale-95 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-md shadow-emerald-500/25 group"
            >
              <ArrowUpRight class="w-4 h-4 stroke-[2.5] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
              <span>{{ plan.name }} Tarifiga Yuksaltirish</span>
            </button>
          </template>

          <!-- Case 3: Other plans -->
          <template v-else>
            <button
              v-if="Number(plan.priceMonthly) > 0"
              type="button"
              @click="$emit('open-payment', plan)"
              class="w-full py-3 rounded-2xl font-bold text-xs transition active:scale-95 flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <CreditCard class="w-4 h-4" />
              <span>{{ plan.name }} Tarifiga O'tish</span>
            </button>
            <div v-else class="text-center py-2.5 text-xs text-slate-400 font-bold">
              Standart boshlang'ich reja
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ShieldCheck,
  Edit2,
  Check,
  Sparkles,
  ArrowUpRight,
  CreditCard,
} from 'lucide-vue-next';

defineProps<{
  plans: any[];
  currentActivePlanId: string;
  currentActivePlan: any;
  isSuperAdmin: boolean;
  formatMoney: (val: any) => string;
}>();

defineEmits<{
  (e: 'open-payment', plan: any): void;
  (e: 'open-edit-plan', plan: any): void;
}>();
</script>
