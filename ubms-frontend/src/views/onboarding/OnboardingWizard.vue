<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-200">
    <!-- Top Right Theme Switcher -->
    <div class="absolute top-4 right-4 z-20">
      <ThemeToggle />
    </div>

    <!-- Ambient Glow Blobs -->
    <div class="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500/10 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

    <div class="max-w-xl w-full mx-auto z-10">
      <!-- Steps Indicator -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div v-for="s in 3" :key="s" class="flex items-center">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all"
              :class="[
                step === s
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 ring-4 ring-emerald-500/20'
                  : step > s
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700'
              ]"
            >
              <Check v-if="step > s" class="w-5 h-5" />
              <span v-else>{{ s }}</span>
            </div>
            <div v-if="s < 3" class="w-16 sm:w-24 h-1 mx-2 rounded-full" :class="step > s ? 'bg-emerald-500/40' : 'bg-slate-200 dark:bg-slate-800'"></div>
          </div>
        </div>
        <div class="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
          <span>1. Biznes turi</span>
          <span>2. Filial</span>
          <span>3. Boshlash</span>
        </div>
      </div>

      <!-- Step Card -->
      <div class="glass-card rounded-2xl p-6 sm:p-8">
        <!-- Step 1: Business Profile -->
        <div v-if="step === 1" class="space-y-5">
          <div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white">Biznesingiz haqida ma'lumot</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">boshqar.uz profilingizni sozlang</p>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Biznes Nomi</label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="Masalan: Asia Med Dorixona yoki Safia Bakery"
              class="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Biznes Turi</label>
            <div class="grid grid-cols-2 gap-3">
              <div
                v-for="bt in businessTypes"
                :key="bt.type"
                @click="form.businessType = bt.type"
                class="p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between group"
                :class="[
                  form.businessType === bt.type
                    ? 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500 text-emerald-900 dark:text-white shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200'
                ]"
              >
                <div class="flex items-center space-x-2.5">
                  <div
                    class="p-2 rounded-lg transition"
                    :class="form.businessType === bt.type ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-400'"
                  >
                    <component :is="bt.icon" class="w-4 h-4" />
                  </div>
                  <span class="font-bold text-sm text-slate-900 dark:text-white">{{ bt.label }}</span>
                </div>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-1">{{ bt.desc }}</p>
              </div>
            </div>
          </div>

          <div class="flex space-x-3 mt-4">
            <button
              type="button"
              @click="handleBackFromStep1"
              class="w-1/3 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm transition btn-interactive flex items-center justify-center gap-1.5"
            >
              <ArrowLeft class="w-4 h-4" />
              <span>Orqaga</span>
            </button>
            <button
              type="button"
              @click="nextStep"
              :disabled="!form.name || !form.businessType"
              class="w-2/3 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition disabled:opacity-50 btn-interactive flex items-center justify-center gap-1.5"
            >
              <span>Keyingisi (Filial sozlash)</span>
              <ArrowRight class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Step 2: Branch Setup -->
        <div v-else-if="step === 2" class="space-y-5">
          <div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white">Birinchi filial ma'lumotlari</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Savdo nuqtangiz yoki asosiy ofisingiz</p>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Filial Nomi</label>
            <input
              v-model="form.branchName"
              type="text"
              required
              placeholder="Bosh filial"
              class="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Manzil (Ixtiyoriy)</label>
            <input
              v-model="form.branchAddress"
              type="text"
              placeholder="Toshkent sh., Chilonzor tumani..."
              class="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Telefon</label>
            <PhoneInput v-model="form.branchPhone" placeholder=" 90 123 45 67" />
          </div>

          <div class="flex space-x-3 mt-4">
            <button
              type="button"
              @click="step = 1"
              class="w-1/3 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm transition btn-interactive flex items-center justify-center gap-1.5"
            >
              <ArrowLeft class="w-4 h-4" />
              <span>Orqaga</span>
            </button>
            <button
              type="button"
              @click="nextStep"
              class="w-2/3 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition btn-interactive flex items-center justify-center gap-1.5"
            >
              <span>Tasdiqlash</span>
              <ArrowRight class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Step 3: Final Confirmation -->
        <div v-else-if="step === 3" class="space-y-6 text-center">
          <div class="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto text-2xl font-bold">
            <Check class="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
          </div>

          <div>
            <h2 class="text-2xl font-extrabold text-slate-900 dark:text-white">{{ form.name }}</h2>
            <p class="text-sm text-emerald-600 dark:text-emerald-400 font-semibold mt-1 uppercase">{{ selectedBusinessTypeLabel }}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-2">Barcha boshlang'ich modullar va sozlamalar tayyorlanmoqda.</p>
          </div>

          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-left text-xs space-y-2">
            <div class="flex justify-between"><span class="text-slate-500 dark:text-slate-400">Filial:</span> <span class="font-semibold text-slate-800 dark:text-slate-200">{{ form.branchName }}</span></div>
            <div class="flex justify-between"><span class="text-slate-500 dark:text-slate-400">Valyuta:</span> <span class="font-semibold text-slate-800 dark:text-slate-200">UZS (so'm)</span></div>
            <div class="flex justify-between"><span class="text-slate-500 dark:text-slate-400">Tarif rejasi:</span> <span class="font-semibold text-emerald-600 dark:text-emerald-400">Free Sinov davri</span></div>
          </div>

          <div class="flex space-x-3 mt-4">
            <button
              type="button"
              @click="step = 2"
              :disabled="isLoading"
              class="w-1/3 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm transition btn-interactive flex items-center justify-center gap-1.5"
            >
              <ArrowLeft class="w-4 h-4" />
              <span>Orqaga</span>
            </button>
            <button
              type="button"
              @click="handleSubmit"
              :disabled="isLoading"
              class="w-2/3 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-base shadow-xl shadow-emerald-500/30 transition disabled:opacity-50 btn-interactive flex items-center justify-center space-x-2"
            >
              <span v-if="!isLoading">Tizimni Boshlash</span>
              <span v-else>Tayyorlanmoqda...</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../services/api';
import { useAuthStore } from '../../stores/auth.store';
import { useToast } from '../../composables/useToast';
import { cleanUzbekPhone } from '../../composables/usePhoneMask';
import PhoneInput from '../../components/PhoneInput.vue';
import ThemeToggle from '../../components/ThemeToggle.vue';
import {
  ShoppingBag,
  UtensilsCrossed,
  Coffee,
  Scissors,
  Pill,
  Wrench,
  Check,
  ArrowLeft,
  ArrowRight,
} from 'lucide-vue-next';


const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const step = ref(1);
const isLoading = ref(false);

const getInitialPhone = () => {
  if (authStore.user?.phone) return authStore.user.phone;
  try {
    const stored = localStorage.getItem('ubms_user');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.phone) return parsed.phone;
    }
  } catch (e) {}
  return '+998 ';
};

const form = ref({
  name: '',
  businessType: 'shop',
  branchName: 'Bosh filial',
  branchAddress: '',
  branchPhone: getInitialPhone(),
});

onMounted(async () => {
  const initial = getInitialPhone();
  if (initial && initial !== '+998 ') {
    form.value.branchPhone = initial;
  } else {
    try {
      const { data } = await api.get('/auth/profile/me');
      if (data?.phone) {
        form.value.branchPhone = data.phone;
        if (authStore.user) {
          authStore.user.phone = data.phone;
        }
      }
    } catch (e) {}
  }

  await loadAvailableTypes();
});

const defaultBusinessTypes = [
  { type: 'shop', label: "Do'kon", icon: ShoppingBag, desc: 'Chakana savdo, ombor va kassa' },
  { type: 'restaurant', label: 'Restoran', icon: UtensilsCrossed, desc: 'Stollar, ofitsiant va oshxona' },
  { type: 'cafe', label: 'Kafe / Fastfood', icon: Coffee, desc: 'Tezkor buyurtma va kassa' },
  { type: 'barbershop', label: 'Sartaroshxona', icon: Scissors, desc: 'Ustalarning bandlik jadvali' },
  { type: 'pharmacy', label: 'Dorixona', icon: Pill, desc: 'Partiya va muddat nazorati' },
  { type: 'service', label: 'Xizmat ko\'rsatish', icon: Wrench, desc: 'Universal buyurtma va xizmat' },
];

const businessTypes = ref(defaultBusinessTypes);

const loadAvailableTypes = async () => {
  try {
    const { data } = await api.get('/businesses/types');
    if (Array.isArray(data) && data.length > 0) {
      businessTypes.value = data.map((d: any) => {
        const found = defaultBusinessTypes.find((def) => def.type === d.type);
        return {
          type: d.type,
          label: d.label || found?.label || d.type,
          desc: d.desc || found?.desc || '',
          icon: found?.icon || ShoppingBag,
        };
      });

      if (!businessTypes.value.some((b) => b.type === form.value.businessType)) {
        form.value.businessType = businessTypes.value[0]?.type || 'shop';
      }
    }
  } catch (err) {
    console.error('Failed to fetch available business types', err);
  }
};

const selectedBusinessTypeLabel = computed(() => {
  return businessTypes.value.find((bt) => bt.type === form.value.businessType)?.label || form.value.businessType;
});

const nextStep = () => {
  if (step.value === 1 && form.value.name && form.value.businessType) step.value = 2;
  else if (step.value === 2) step.value = 3;
};

const handleBackFromStep1 = () => {
  if (authStore.businesses && authStore.businesses.length > 0) {
    router.push('/dashboard');
  } else {
    authStore.logout();
    router.push('/auth/login');
  }
};

const handleSubmit = async () => {
  isLoading.value = true;
  try {
    const payload = {
      ...form.value,
      branchPhone: form.value.branchPhone ? cleanUzbekPhone(form.value.branchPhone) : undefined,
    };
    const { data } = await api.post('/businesses', payload);
    authStore.setActiveBusiness({
      id: data.business.id,
      name: data.business.name,
      businessType: data.business.businessType,
      currency: data.business.currency,
      role: 'Owner',
      branchId: data.branch.id,
    });
    toast.success(`"${data.business.name}" biznesingiz muvaffaqiyatli ishga tushirildi!`, 'Xush kelibsiz!');
    router.push('/dashboard');
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Biznesni yaratishda xatolik yuz berdi', 'Xatolik');
  } finally {
    isLoading.value = false;
  }
};
</script>
