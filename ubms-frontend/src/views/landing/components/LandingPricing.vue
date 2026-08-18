<template>
  <section id="pricing" class="py-24 bg-slate-100/70 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800/80 relative overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div data-aos="fade-up" class="text-center max-w-3xl mx-auto space-y-4 mb-16">
        <span class="text-emerald-600 dark:text-emerald-400 text-xs font-extrabold uppercase tracking-widest">Ochiq va Halol Narxlar</span>
        <h2 class="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Har Qanday Byudjet Uchun Mos Tariflar
        </h2>
        <p class="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
          Hech qanday yashirin to'lovlarsiz. 14 kun bepul sinab ko'ring va biznesingiz uchun mos tarifni tanlang.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        <!-- Dynamic Plans from Backend / SuperAdmin -->
        <div
          v-for="(plan, index) in displayPlans"
          :key="plan.name"
          data-aos="fade-up"
          :data-aos-delay="(index + 1) * 100"
          class="p-8 rounded-3xl flex flex-col justify-between space-y-6 transition-all duration-300 relative"
          :class="plan.isPopular 
            ? 'bg-gradient-to-b from-emerald-50 via-white to-white dark:from-emerald-950/40 dark:via-slate-950 dark:to-slate-950 border-2 border-emerald-500 shadow-2xl shadow-emerald-500/20 hover:-translate-y-2.5 hover:shadow-emerald-500/30'
            : 'bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xs hover:-translate-y-2 hover:shadow-xl'"
        >
          <!-- Popular Badge for Pro -->
          <div
            v-if="plan.isPopular"
            class="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5"
          >
            <Star class="w-3.5 h-3.5 fill-current" />
            <span>Eng Ommabop</span>
          </div>

          <div class="space-y-4">
            <div
              class="inline-block px-3 py-1 rounded-full text-xs font-bold"
              :class="plan.isPopular ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'"
            >
              {{ plan.tagline }}
            </div>
            
            <h3 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {{ plan.name }}
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{{ plan.description }}</p>
            
            <!-- Price Display -->
            <div class="pt-4 border-t border-slate-200 dark:border-slate-800">
              <div v-if="plan.priceNumeric === 0">
                <span class="text-4xl font-black text-slate-900 dark:text-white font-mono">Bepul</span>
                <span class="text-xs text-slate-500 font-bold"> / doimiy</span>
                <p class="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">Sinov va boshlang'ich start uchun</p>
              </div>
              <div v-else>
                <span
                  class="text-4xl font-black font-mono"
                  :class="plan.isPopular ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'"
                >
                  {{ plan.priceFormatted }}
                </span>
                <span class="text-xs text-slate-500 font-bold"> so'm / oyiga</span>
                <p class="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                  {{ plan.dailyNote }}
                </p>
              </div>
            </div>

            <!-- Features list -->
            <ul class="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 font-medium">
              <li class="flex items-center gap-2">
                <Check class="w-4 h-4 text-emerald-500 shrink-0 font-bold" />
                <span>Maksimal filiallar: <strong>{{ plan.branchesLabel }}</strong></span>
              </li>
              <li class="flex items-center gap-2">
                <Check class="w-4 h-4 text-emerald-500 shrink-0 font-bold" />
                <span>Maksimal xodimlar: <strong>{{ plan.usersLabel }}</strong></span>
              </li>
              <li v-for="(feat, fIdx) in plan.features" :key="fIdx" class="flex items-center gap-2">
                <Check class="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{{ feat }}</span>
              </li>
            </ul>
          </div>

          <router-link
            to="/auth/register"
            class="w-full py-3.5 rounded-2xl font-bold text-center text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
            :class="plan.isPopular
              ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-lg shadow-emerald-600/25 hover:scale-[1.02]'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 hover:scale-102'"
          >
            <span>{{ plan.buttonText }}</span>
          </router-link>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Check, Star } from 'lucide-vue-next';
import api from '../../../services/api';

defineEmits<{
  (e: 'openDemo'): void;
}>();

const backendPlans = ref<any[]>([]);

const defaultPlans = [
  {
    name: 'Free',
    priceMonthly: 0,
    maxBranches: 1,
    maxUsers: 2,
    tagline: 'Kichik Savdo Nuqtasi',
    description: 'Qishloq do\'koni, yakka tartibdagi tadbirkor va startaplar uchun.',
    features: ['Tovarlar katalogi va shtrix-kod', 'Chek chiqarish (58mm / 80mm)', 'Boshqar AI qo\'llanmasi'],
    buttonText: 'Bepul Boshlash',
    isPopular: false,
    dailyNote: 'Boshlash uchun mutlaqo bepul',
  },
  {
    name: 'Pro',
    priceMonthly: 199000,
    maxBranches: 3,
    maxUsers: 10,
    tagline: 'Supermarket & Do\'konlar',
    description: "O'rtacha magazinlar, aptekalar, kiyim va qurilish mollari savdosi.",
    features: ['Cheksiz tovarlar va cheklar', 'Nasiya Daftari (CRM)', 'Telegram Bot bildirishnomalari', 'Moliya va Sof Foyda hisoboti'],
    buttonText: '14 Kun Bepul Sinash',
    isPopular: true,
    dailyNote: 'Kuniga atigi ~6 500 so\'m',
  },
  {
    name: 'Business',
    priceMonthly: 499000,
    maxBranches: null,
    maxUsers: null,
    tagline: 'Restoran & Katta Tarmoq',
    description: 'Restoran, kafe, salon va bir nechta filialli yirik savdo tarmoqlari.',
    features: ['Stollar xaritasi & Ofitsiant ekrani', 'Oshxona (KDS) ekrani', 'Ustalar bandlik jadvali', 'To\'liq Audit va Xavfsizlik jurnali'],
    buttonText: 'Business Bilan Sinash',
    isPopular: false,
    dailyNote: 'Cheksiz filial va xodimlar bilan',
  },
];

onMounted(async () => {
  try {
    const { data } = await api.get('/businesses/plans');
    if (Array.isArray(data) && data.length > 0) {
      backendPlans.value = data;
    }
  } catch (err) {
    // Fallback to static presets if offline
  }
});

const formatPrice = (val: number | string) => {
  const num = Number(val) || 0;
  return new Intl.NumberFormat('uz-UZ').format(num).replace(/,/g, ' ');
};

const displayPlans = computed(() => {
  if (backendPlans.value.length > 0) {
    return backendPlans.value.map((bp) => {
      const pName = bp.name || '';
      const priceNum = Number(bp.priceMonthly) || 0;
      const isPro = pName.toLowerCase() === 'pro';
      const isBusiness = pName.toLowerCase() === 'business';
      const isFree = priceNum === 0 || pName.toLowerCase() === 'free';

      let tagline = "Kichik Savdo Nuqtasi";
      let desc = "Boshlang'ich kassa va tovarlar hisobi uchun.";
      let features = ['Tovarlar katalogi va shtrix-kod', 'Chek chiqarish (58mm / 80mm)', 'Boshqar AI qo\'llanmasi'];
      let btnText = "Bepul Boshlash";
      let daily = "Boshlash uchun mutlaqo bepul";

      if (isPro) {
        tagline = "Supermarket & Do'konlar";
        desc = "O'rtacha magazinlar, aptekalar, kiyim va servis do'konlari uchun.";
        features = ['Cheksiz tovarlar va cheklar', 'Nasiya Daftari (CRM)', 'Telegram Bot bildirishnomalari', 'Moliya va Sof Foyda hisoboti'];
        btnText = "14 Kun Bepul Sinash";
        daily = `Kuniga atigi ~${Math.round(priceNum / 30).toLocaleString()} so'm`;
      } else if (isBusiness) {
        tagline = "Restoran & Katta Tarmoq";
        desc = "Restoran, kafe, salon va bir nechta filialli yirik savdo tarmoqlari.";
        features = ['Stollar xaritasi & Ofitsiant ekrani', 'Oshxona (KDS) ekrani', 'Ustalar bandlik jadvali', 'To\'liq Audit va Xavfsizlik jurnali'];
        btnText = "Business Bilan Sinash";
        daily = "Cheksiz filial va barcha modullar bilan";
      }

      return {
        id: bp.id,
        name: pName,
        priceNumeric: priceNum,
        priceFormatted: formatPrice(priceNum),
        branchesLabel: bp.maxBranches ? `${bp.maxBranches} ta` : 'Cheksiz',
        usersLabel: bp.maxUsers ? `${bp.maxUsers} ta` : 'Cheksiz',
        tagline,
        description: desc,
        features,
        buttonText: btnText,
        isPopular: isPro,
        dailyNote: daily,
      };
    });
  }

  return defaultPlans.map((dp) => ({
    name: dp.name,
    priceNumeric: dp.priceMonthly,
    priceFormatted: formatPrice(dp.priceMonthly),
    branchesLabel: dp.maxBranches ? `${dp.maxBranches} ta` : 'Cheksiz',
    usersLabel: dp.maxUsers ? `${dp.maxUsers} ta` : 'Cheksiz',
    tagline: dp.tagline,
    description: dp.description,
    features: dp.features,
    buttonText: dp.buttonText,
    isPopular: dp.isPopular,
    dailyNote: dp.dailyNote,
  }));
});
</script>
