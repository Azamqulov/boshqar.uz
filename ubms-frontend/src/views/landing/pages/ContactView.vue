<template>
  <div class="min-h-screen pt-24 sm:pt-28 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 flex flex-col justify-between">
    <div>
      <!-- Unified Top Header Navigation -->
      <LandingHeader
        :is-authenticated="isAuthenticated"
        @open-demo="openDemoModal"
      />

    <!-- Page Banner -->
    <section class="py-16 sm:py-24 relative overflow-hidden bg-gradient-to-b from-emerald-500/10 via-slate-50 to-slate-50 dark:from-emerald-950/20 dark:via-slate-950 dark:to-slate-950">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/30">
          <PhoneCall class="w-4 h-4" />
          <span>24/7 Boshqar.uz Qo'llab-quvvatlash Markazi</span>
        </div>

        <h1 class="text-3xl sm:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto">
          Biz Bilan Bog'laning va <br class="hidden sm:inline" />
          <span class="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 bg-clip-text text-transparent">
            Bepul Konsultatsiya Oling
          </span>
        </h1>

        <p class="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Mutaxassislarimiz do'koningiz, restoraningiz yoki biznesingiz uchun eng mos uskunalar va tariflarni tanlab berishadi.
        </p>
      </div>
    </section>

    <!-- Contact Info Cards & Form Section -->
    <section class="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Left Column: Contact Cards -->
      <div class="lg:col-span-5 space-y-6">
        <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div class="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Send class="w-6 h-6" />
          </div>
          <div>
            <h3 class="text-base font-bold">Telegram Bot & Support</h3>
            <p class="text-xs text-slate-500 mt-0.5">24/7 avtomatik yordamchi va operatorlar</p>
            <a
              href="https://t.me/Boshqar_uzbot"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline mt-2"
            >
              <span>@Boshqar_uzbot ga yozish</span>
              <ArrowRight class="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div class="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Phone class="w-6 h-6" />
          </div>
          <div>
            <h3 class="text-base font-bold">Call-Markaz Telefon Nomerimiz</h3>
            <p class="text-xs text-slate-500 mt-0.5">Har kuni soat 09:00 dan 20:00 gacha</p>
            <a href="tel:+998712000000" class="inline-block text-sm font-black font-mono text-slate-900 dark:text-white mt-1 hover:text-emerald-500 transition">
              +998 (71) 200-00-00
            </a>
          </div>
        </div>

        <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div class="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <MapPin class="w-6 h-6" />
          </div>
          <div>
            <h3 class="text-base font-bold">Bosh Ofis Manzili</h3>
            <p class="text-xs text-slate-500 mt-0.5">Toshkent shahri, Yunusobod tumani, Amir Temur shoh ko'chasi, 107B-uy.</p>
          </div>
        </div>
      </div>

      <!-- Right Column: Interactive Consultation Request Form -->
      <div class="lg:col-span-7 p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div class="space-y-2">
          <h2 class="text-2xl font-black">Murojaat Qoldirish</h2>
          <p class="text-xs text-slate-500">Ma'lumotlaringizni kiriting va 15 daqiqa ichida mutaxassisimiz siz bilan bog'lanadi:</p>
        </div>

        <form @submit.prevent="submitForm" class="space-y-4 text-xs">
          <div class="space-y-1">
            <label class="font-bold text-slate-700 dark:text-slate-300">Ismingiz va Familiyangiz:</label>
            <input
              v-model="form.name"
              @input="handleNameInput"
              required
              placeholder="Masalan: Alisher Qodirov"
              class="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          <div class="space-y-1">
            <label class="font-bold text-slate-700 dark:text-slate-300">Telefon Raqamingiz:</label>
            <input
              v-model="form.phone"
              @input="handlePhoneInput"
              required
              placeholder="+998 90 123-45-67"
              class="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-emerald-500 font-medium font-mono"
            />
          </div>

          <div class="space-y-1">
            <label class="font-bold text-slate-700 dark:text-slate-300">Biznesingiz Sohasi:</label>
            <select
              v-model="form.sector"
              class="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-emerald-500 font-medium cursor-pointer"
            >
              <option value="retail">Do'kon / Supermarket</option>
              <option value="restaurant">Restoran / Kafe</option>
              <option value="pharmacy">Dorixona</option>
              <option value="barbershop">Sartaroshxona / Salon</option>
              <option value="service">Avtoservis / Ustaxona</option>
              <option value="other">Boshqa soha</option>
            </select>
          </div>

          <div class="space-y-1">
            <label class="font-bold text-slate-700 dark:text-slate-300">Xabaringiz yoki Savolingiz (Ixtiyoriy):</label>
            <textarea
              v-model="form.message"
              rows="3"
              placeholder="Qanday uskunalar ulashingiz yoki qanday funksiyalar kerakligi haqida yozing..."
              class="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-emerald-500 font-medium"
            ></textarea>
          </div>

          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send v-if="!isSubmitting" class="w-4 h-4" />
            <span>{{ isSubmitting ? 'Yuborilmoqda...' : 'Murojaatni Yuborish' }}</span>
          </button>
        </form>

        <div v-if="submitted" class="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center gap-2">
          <CheckCircle2 class="w-5 h-5 text-emerald-500 shrink-0" />
          <span>Rahmat! Murojaatingiz muvaffaqiyatli qabul qilindi. Tez orada siz bilan bog'lanamiz!</span>
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
import { PhoneCall, Send, Phone, MapPin, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-vue-next';
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

const form = ref({
  name: '',
  phone: '',
  sector: 'retail',
  message: '',
});

const isSubmitting = ref(false);
const submitted = ref(false);

const handleNameInput = (e: Event) => {
  const input = e.target as HTMLInputElement;
  if (input.value) {
    form.value.name = input.value.replace(/(?:^|\s|-)\S/g, (char) => char.toUpperCase());
    input.value = form.value.name;
  }
};

const handlePhoneInput = (e: Event) => {
  const input = e.target as HTMLInputElement;
  let digits = input.value.replace(/\D/g, '');

  if (!digits.startsWith('998')) {
    digits = '998' + digits;
  }
  digits = digits.slice(0, 12);

  let formatted = '+998';
  if (digits.length > 3) formatted += ` (${digits.slice(3, 5)}`;
  if (digits.length > 5) formatted += `) ${digits.slice(5, 8)}`;
  if (digits.length > 8) formatted += `-${digits.slice(8, 10)}`;
  if (digits.length > 10) formatted += `-${digits.slice(10, 12)}`;

  form.value.phone = formatted;
};

const submitForm = () => {
  isSubmitting.value = true;
  setTimeout(() => {
    isSubmitting.value = false;
    submitted.value = true;
    form.value = { name: '', phone: '', sector: 'retail', message: '' };
    setTimeout(() => {
      submitted.value = false;
    }, 5000);
  }, 1000);
};
</script>
