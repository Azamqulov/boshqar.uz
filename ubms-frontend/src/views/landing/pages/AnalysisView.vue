<template>
  <div class="min-h-screen pt-24 sm:pt-28 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 flex flex-col justify-between">
    <div>
      <!-- Unified Top Header Navigation -->
      <LandingHeader
        :is-authenticated="isAuthenticated"
        @open-demo="openDemoModal"
      />

      <!-- Page Title & Segmented Tab Switcher (Modern Ultra-Sleek Control) -->
      <section class="py-12 bg-gradient-to-b from-emerald-500/10 via-slate-50 to-slate-50 dark:from-emerald-950/20 dark:via-slate-950 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h1 class="text-3xl sm:text-5xl font-black">Biznes Tahlil, Daromad va Taqqoslash</h1>
          <p class="text-slate-600 dark:text-slate-400 text-sm max-w-xl mx-auto">
            Quyidagi bo'limlardan birini tanlang: oylik foydani kalkulyatorda hisoblang yoki Boshqar.uz ni boshqa tizimlar bilan taqqoslang:
          </p>

          <!-- Modern Segmented Pill Switcher -->
          <div class="inline-flex p-1.5 rounded-2xl bg-slate-200/80 dark:bg-slate-900 border border-slate-300/80 dark:border-slate-800 shadow-inner max-w-md mx-auto">
            <button
              type="button"
              @click="activeTab = 'calculator'"
              class="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center gap-2"
              :class="activeTab === 'calculator' ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
            >
              <Calculator class="w-4 h-4" />
              <span>Kalkulyator</span>
            </button>

            <button
              type="button"
              @click="activeTab = 'compare'"
              class="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center gap-2"
              :class="activeTab === 'compare' ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
            >
              <ArrowLeftRight class="w-4 h-4" />
              <span>Taqqoslash</span>
            </button>
          </div>
        </div>
      </section>

    <!-- Tab 1: Calculator -->
    <section v-if="activeTab === 'calculator'" class="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Left Controls -->
          <div class="space-y-6">
            <div class="space-y-2">
              <label class="text-xs font-bold text-slate-700 dark:text-slate-300 flex justify-between">
                <span>Oylik Savdo Tushumi:</span>
                <span class="font-mono text-emerald-600 dark:text-emerald-400">{{ formatSum(monthlyRevenue) }} so'm</span>
              </label>
              <input
                type="range"
                min="10000000"
                max="500000000"
                step="5000000"
                v-model.number="monthlyRevenue"
                class="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div class="space-y-2">
              <label class="text-xs font-bold text-slate-700 dark:text-slate-300 flex justify-between">
                <span>Kunlik Cheklar Soni:</span>
                <span class="font-mono text-emerald-600 dark:text-emerald-400">{{ dailyReceipts }} ta</span>
              </label>
              <input
                type="range"
                min="10"
                max="1000"
                step="10"
                v-model.number="dailyReceipts"
                class="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div class="space-y-2">
              <label class="text-xs font-bold text-slate-700 dark:text-slate-300 flex justify-between">
                <span>Nasiya (Qarz) Ulushi (%):</span>
                <span class="font-mono text-amber-500">{{ debtShare }}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                v-model.number="debtShare"
                class="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          <!-- Right Calculation Results -->
          <div class="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4 flex flex-col justify-between">
            <div class="space-y-4">
              <div class="border-b border-slate-200 dark:border-slate-800 pb-3">
                <span class="text-xs font-bold text-slate-500 uppercase">Kutilayotgan Oylik Sof Tejamkorlik:</span>
                <p class="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">+{{ formatSum(calculatedSavings) }} so'm / oy</p>
              </div>

              <div class="space-y-2 text-xs">
                <div class="flex items-center justify-between">
                  <span class="text-slate-500">Nasiya yo'qotishlarini qaytarish:</span>
                  <span class="font-bold font-mono text-slate-900 dark:text-white">+{{ formatSum(debtSavings) }} so'm</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500">Kamomad va xatolarni oldini olish (2%):</span>
                  <span class="font-bold font-mono text-slate-900 dark:text-white">+{{ formatSum(errorSavings) }} so'm</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500">Kassir vaqti tejalishi:</span>
                  <span class="font-bold font-mono text-slate-900 dark:text-white">{{ savedHours }} soat / oy</span>
                </div>
              </div>
            </div>

            <router-link
              to="/auth/register"
              class="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm text-center shadow-md transition flex items-center justify-center gap-2"
            >
              <span>Ushbu Foydani 14 Kun Bepul Sinash</span>
              <ArrowRight class="w-4 h-4" />
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Tab 2: Comparison Matrix -->
    <section v-else class="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr class="bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold">
                <th class="p-4 sm:p-6">Imkoniyatlar va Mezonlar</th>
                <th class="p-4 sm:p-6 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-center">Boshqar.uz 🟢</th>
                <th class="p-4 sm:p-6 text-center text-slate-500">Qog'oz Daftar / Excel 📓</th>
                <th class="p-4 sm:p-6 text-center text-slate-500">Chet el ERP (Poster/Jowi) 🌍</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              <tr>
                <td class="p-4 sm:p-6 font-bold">Soliq OFD Fiskallashtirish (QR Chek)</td>
                <td class="p-4 text-center bg-emerald-500/5 text-emerald-600 font-bold">✅ Bepul ulanadi</td>
                <td class="p-4 text-center text-rose-500">❌ Umuman yo'q</td>
                <td class="p-4 text-center text-amber-500">⚠️ Qo'shimcha to'lov</td>
              </tr>
              <tr>
                <td class="p-4 sm:p-6 font-bold">Telegram Bot & Mini-App (TMA) POS</td>
                <td class="p-4 text-center bg-emerald-500/5 text-emerald-600 font-bold">✅ Barcha hisobotlar Telegramda</td>
                <td class="p-4 text-center text-rose-500">❌ Yo'q</td>
                <td class="p-4 text-center text-rose-500">❌ Yo'q</td>
              </tr>
              <tr>
                <td class="p-4 sm:p-6 font-bold">Termal Chek Chop Etish (ESC/POS)</td>
                <td class="p-4 text-center bg-emerald-500/5 text-emerald-600 font-bold">✅ 1-click printer print</td>
                <td class="p-4 text-center text-rose-500">❌ Qo'lda yoziladi</td>
                <td class="p-4 text-center text-emerald-600">✅ Mavjud</td>
              </tr>
              <tr>
                <td class="p-4 sm:p-6 font-bold">Oylik Obuna Narxi</td>
                <td class="p-4 text-center bg-emerald-500/5 text-emerald-600 font-bold">💰 190,000 so'mdan</td>
                <td class="p-4 text-center text-slate-500">0 so'm (lekin zarar ko'p)</td>
                <td class="p-4 text-center text-rose-500">💸 $40 - $120 / oy</td>
              </tr>
              <tr>
                <td class="p-4 sm:p-6 font-bold">Nasiya (Qarz) Daftari & Ogohlantirish</td>
                <td class="p-4 text-center bg-emerald-500/5 text-emerald-600 font-bold">✅ Avtomatik SMS & Telegram</td>
                <td class="p-4 text-center text-amber-500">⚠️ Daftarda adashish ko'p</td>
                <td class="p-4 text-center text-amber-500">⚠️ Murakkab va noqulay</td>
              </tr>
              <tr>
                <td class="p-4 sm:p-6 font-bold">24/7 O'zbek Tilida Qo'llab-quvvatlash</td>
                <td class="p-4 text-center bg-emerald-500/5 text-emerald-600 font-bold">✅ 100% O'zbek tilida</td>
                <td class="p-4 text-center text-rose-500">❌ Yo'q</td>
                <td class="p-4 text-center text-rose-500">❌ Faqat Rus/Ingliz</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
    </div>
    <LandingFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowRight, Sparkles, Calculator, ArrowLeftRight } from 'lucide-vue-next';
import LandingHeader from '../components/LandingHeader.vue';
import LandingFooter from '../components/LandingFooter.vue';
import { useAuthStore } from '../../../stores/auth.store';

const router = useRouter();
const authStore = useAuthStore();

const isAuthenticated = computed(() => {
  return !!authStore.token && !!authStore.user;
});

const openDemoModal = () => {
  router.push('/#demo');
};

const activeTab = ref<'calculator' | 'compare'>('calculator');

const monthlyRevenue = ref(50000000);
const dailyReceipts = ref(150);
const debtShare = ref(20);

const debtSavings = computed(() => Math.round(monthlyRevenue.value * (debtShare.value / 100) * 0.15));
const errorSavings = computed(() => Math.round(monthlyRevenue.value * 0.025));
const calculatedSavings = computed(() => debtSavings.value + errorSavings.value);
const savedHours = computed(() => Math.round((dailyReceipts.value * 30 * 20) / 3600));

const formatSum = (val: number) => {
  return new Intl.NumberFormat('uz-UZ').format(val || 0);
};
</script>
