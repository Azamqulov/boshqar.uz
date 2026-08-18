<template>
  <section id="calculator" class="py-24 relative overflow-hidden bg-slate-100/70 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800/80">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Heading -->
      <div data-aos="fade-up" class="text-center max-w-3xl mx-auto space-y-4 mb-16">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
          <Calculator class="w-3.5 h-3.5" />
          <span>Interaktiv Tejamkorlik Kalkulyatori</span>
        </div>
        <h2 class="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Boshqar.uz Sizga Qancha <br class="hidden sm:inline" />
          <span class="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-500 bg-clip-text text-transparent">
            Vaqt va Pul Tejashini Hisoblang!
          </span>
        </h2>
        <p class="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
          Eski daftarcha yoki tartibsiz hisob-kitob tufayli yo'qotiladigan mablag'lar va xatoliklarni tizimlashtiring.
        </p>
      </div>

      <!-- Calculator Grid: Controls on Left, Dynamic Result Card on Right -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <!-- Controls Column -->
        <div data-aos="fade-right" class="lg:col-span-7 bg-white dark:bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-8 flex flex-col justify-between">
          <!-- 1. Biznes turi tanlash -->
          <div class="space-y-3">
            <label class="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              1. Biznes Faoliyati Turi
            </label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                v-for="type in businessTypes"
                :key="type.id"
                type="button"
                @click="selectedType = type.id"
                class="p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5"
                :class="selectedType === type.id
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80'"
              >
                <component :is="type.icon" class="w-5 h-5" />
                <span class="text-xs">{{ type.label }}</span>
              </button>
            </div>
          </div>

          <!-- 2. Oylik Savdo Aylanmasi Slayderi -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <label class="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                2. Oylik Savdo Aylanmasi
              </label>
              <span class="text-base sm:text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                {{ formatMoney(monthlyTurnover) }} so'm
              </span>
            </div>
            <input
              type="range"
              v-model.number="monthlyTurnover"
              min="10000000"
              max="500000000"
              step="5000000"
              class="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div class="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>10 mln so'm</span>
              <span>250 mln so'm</span>
              <span>500+ mln so'm</span>
            </div>
          </div>

          <!-- 3. Kunlik Cheklar / Xaridorlar Soni -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <label class="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                3. Kunlik Xaridorlar / Cheklar
              </label>
              <span class="text-base sm:text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                {{ dailyOrders }} ta chek / kun
              </span>
            </div>
            <input
              type="range"
              v-model.number="dailyOrders"
              min="10"
              max="600"
              step="10"
              class="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div class="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>10 ta</span>
              <span>300 ta</span>
              <span>600+ ta</span>
            </div>
          </div>

          <!-- 4. Xodimlar va Kassirlar Soni -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <label class="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                4. Xodimlar va Kassirlar Soni
              </label>
              <span class="text-base sm:text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                {{ staffCount }} nafar xodim
              </span>
            </div>
            <input
              type="range"
              v-model.number="staffCount"
              min="1"
              max="20"
              step="1"
              class="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div class="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>1 nafar</span>
              <span>10 nafar</span>
              <span>20+ nafar</span>
            </div>
          </div>
        </div>

        <!-- Result Highlights Column -->
        <div data-aos="fade-left" data-aos-delay="150" class="lg:col-span-5 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 rounded-3xl p-6 sm:p-8 text-white flex flex-col justify-between shadow-xl relative overflow-hidden">
          <!-- Ambient decor -->
          <div class="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

          <div class="space-y-6">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-bold">
              <TrendingUp class="w-3.5 h-3.5" />
              <span>Sizning Kutilayotgan Foydangiz</span>
            </div>

            <!-- Big Annual Saving Number -->
            <div class="space-y-1">
              <div class="text-xs font-medium text-emerald-100 uppercase tracking-wider">
                Yillik Sof Tejamkorlik:
              </div>
              <div class="text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight text-white">
                {{ formatMoney(annualSavings) }}
              </div>
              <div class="text-xs text-emerald-200 font-bold">
                so'm / yiliga (oyiga ~{{ formatMoney(monthlySavings) }} so'm)
              </div>
            </div>

            <!-- Breakdown Matrix Cards -->
            <div class="space-y-3 pt-4 border-t border-white/20">
              <div class="p-3 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-between text-xs">
                <div class="flex items-center gap-2">
                  <Clock class="w-4 h-4 text-emerald-200 shrink-0" />
                  <span>Tejaladigan ish vaqti:</span>
                </div>
                <span class="font-black font-mono text-sm">{{ savedHoursPerMonth }} soat / oyiga</span>
              </div>

              <div class="p-3 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-between text-xs">
                <div class="flex items-center gap-2">
                  <ShieldCheck class="w-4 h-4 text-emerald-200 shrink-0" />
                  <span>Nasiya & xatolardan saqlash:</span>
                </div>
                <span class="font-black font-mono text-sm">~{{ formatMoney(preventedLosses) }} so'm</span>
              </div>

              <div class="p-3 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-between text-xs">
                <div class="flex items-center gap-2">
                  <Zap class="w-4 h-4 text-emerald-200 shrink-0" />
                  <span>Kassa navbat tezligi:</span>
                </div>
                <span class="font-black font-mono text-sm">+3.5 barobar tez</span>
              </div>
            </div>
          </div>

          <!-- Bottom CTA -->
          <div class="pt-6 space-y-3">
            <button
              type="button"
              @click="$emit('openDemo')"
              class="w-full py-3.5 px-6 rounded-2xl bg-white text-emerald-800 hover:bg-emerald-50 active:scale-98 font-black text-xs sm:text-sm shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Ushbu Natijani O'z Biznesingizda Ko'ring</span>
              <ArrowRight class="w-4 h-4" />
            </button>
            <p class="text-[11px] text-emerald-200 text-center">
              14 kunlik bepul sinov • Kredit karta talab qilinmaydi
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  Calculator,
  ShoppingBag,
  UtensilsCrossed,
  Pill,
  Wrench,
  TrendingUp,
  Clock,
  ShieldCheck,
  Zap,
  ArrowRight,
} from 'lucide-vue-next';

defineEmits<{
  (e: 'openDemo'): void;
}>();

const selectedType = ref<string>('shop');
const monthlyTurnover = ref<number>(45000000);
const dailyOrders = ref<number>(80);
const staffCount = ref<number>(2);

const businessTypes = [
  { id: 'shop', label: "Do'kon", icon: ShoppingBag },
  { id: 'restaurant', label: "Restoran", icon: UtensilsCrossed },
  { id: 'pharmacy', label: "Dorixona", icon: Pill },
  { id: 'service', label: "Xizmat", icon: Wrench },
];

const formatMoney = (val: number) => {
  return new Intl.NumberFormat('uz-UZ').format(Math.round(val)).replace(/,/g, ' ');
};

// Calculation logic based on real Uzbekistan retail business metrics
const savedHoursPerMonth = computed(() => {
  // Manual ledger calculation takes ~2 hours/day per 50 orders + staff reconciliation
  const baseHours = Math.round((dailyOrders.value / 40) * 20 + staffCount.value * 5);
  return Math.min(Math.max(baseHours, 15), 90);
});

const preventedLosses = computed(() => {
  // Average unrecorded debts, cashier discrepancies & stock shrinkage in manual stores is ~2.5% to 4%
  const rate = selectedType.value === 'restaurant' ? 0.035 : selectedType.value === 'pharmacy' ? 0.025 : 0.03;
  return monthlyTurnover.value * rate;
});

const monthlySavings = computed(() => {
  // Prevented losses + hourly value of saved owner time (~25,000 UZS/hour)
  const timeValue = savedHoursPerMonth.value * 25000;
  return preventedLosses.value + timeValue;
});

const annualSavings = computed(() => {
  return monthlySavings.value * 12;
});
</script>
