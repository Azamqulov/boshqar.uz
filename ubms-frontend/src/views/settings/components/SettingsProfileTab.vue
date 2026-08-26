<template>
  <div class="space-y-6 w-full">
    <!-- User Profile Hero Banner -->
    <div class="glass-card rounded-3xl p-6 sm:p-8 relative overflow-visible z-20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-5 relative z-20">
        <!-- Left: Avatar & User Quick Details -->
        <div class="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div class="relative group">
            <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-emerald-500 text-white font-black text-3xl sm:text-4xl flex items-center justify-center shadow-lg shadow-emerald-500/25 ring-4 ring-white dark:ring-slate-900 shrink-0">
              {{ (authStore.user?.fullName || 'U').charAt(0).toUpperCase() }}
            </div>
            <div class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white" title="Faol profil">
              <CheckCircle2 class="w-3.5 h-3.5" />
            </div>
          </div>

          <div class="space-y-1">
            <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {{ authStore.user?.fullName || 'Foydalanuvchi' }}
            </h2>

            <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-0.5">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] uppercase border border-emerald-500/30 shadow-2xs">
                <ShieldCheck v-if="authStore.user?.isSuperAdmin" class="w-3.5 h-3.5" />
                {{ authStore.user?.isSuperAdmin ? 'SuperAdmin' : (authStore.activeBusiness?.role || 'Owner') }}
              </span>

              <span class="flex items-center gap-1 font-mono text-xs text-slate-500 dark:text-slate-400 font-semibold">
                <Phone class="w-3.5 h-3.5 text-emerald-500" />
                {{ authStore.user?.phone }}
              </span>
            </div>
          </div>
        </div>

        <!-- Right Side: Business Badge, Language & Currency Selector -->
        <div class="flex flex-wrap items-center justify-center sm:justify-end gap-3 shrink-0">
          <span class="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-1.5 shadow-sm">
            <Building2 class="w-4 h-4 text-emerald-500" />
            <span>{{ authStore.activeBusiness?.name || 'Biznes' }}</span>
          </span>

          <!-- Til Tanlash Dropdown (4 ta Til) -->
          <div class="w-48">
            <AppSelect
              :model-value="langStore.currentLanguage"
              @update:model-value="langStore.setLanguage($event as any)"
              :options="languageOptions"
            />
          </div>


          <div class="w-44">
            <AppSelect
              :model-value="selectedCurrency"
              @update:model-value="$emit('update:selectedCurrency', $event); $emit('currencyChange')"
              :options="currencyOptions"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Main Profile & Business Settings Single Unified Form Container -->
    <form @submit.prevent="$emit('saveUnifiedProfile')" class="glass-card rounded-3xl p-6 sm:p-8 space-y-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
        <!-- 1. Shaxsiy Ma'lumotlar -->
        <div class="space-y-4 lg:pr-6">
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <h3 class="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <UserCircle class="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              <span>Shaxsiy Ma'lumotlar</span>
            </h3>
          </div>

          <div class="space-y-4 text-xs">
            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">To'liq Ism Familiya *</label>
              <input
                v-model="profileForm.fullName"
                @input="handleFullNameInput"
                required
                placeholder="Ism Familiyangizni kiriting"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium"
              />
            </div>

            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Telefon Raqami *</label>
              <PhoneInput v-model="profileForm.phone" required placeholder="90 123 45 67" />
            </div>
          </div>
        </div>

        <!-- 2. Xavfsizlik & Parol -->
        <div class="space-y-4 pt-6 lg:pt-0 lg:pl-8">
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <h3 class="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Key class="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              <span>Xavfsizlik & Parol</span>
            </h3>
          </div>

          <div class="space-y-4 text-xs">
            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Amaldagi Parol</label>
              <input
                type="password"
                v-model="passwordForm.currentPassword"
                placeholder="Amaldagi joriy parolingizni kiriting"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium"
              />
            </div>

            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Yangi Parol (Ixtiyoriy)</label>
              <input
                type="password"
                v-model="passwordForm.newPassword"
                placeholder="O'zgartirish uchun yangi parol kiriting"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium"
              />
            </div>

            <!-- Quick Screen Lock PIN & Auto-Lock Settings (Perfect Horizontal Alignment) -->
            <div class="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <div class="flex items-center justify-between">
                <label class="block font-black text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                  <Lock class="w-4 h-4 text-emerald-500" />
                  <span>Tezkor Qulflash PIN Kobi (Quick Lock)</span>
                </label>
                <span class="text-[10px] text-slate-400 font-mono">Win+L / Ctrl+L</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-end">
                <div>
                  <label class="block font-semibold text-slate-500 dark:text-slate-400 text-[11px] mb-1.5">4-Xonali Lock PIN Kod</label>
                  <div class="relative flex items-center">
                    <input
                      :type="showPin ? 'text' : 'password'"
                      maxlength="6"
                      inputmode="numeric"
                      :value="pinCode"
                      @input="handlePinChange(($event.target as HTMLInputElement).value)"
                      placeholder="1234"
                      class="w-full h-[40px] pl-3.5 pr-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 text-xs"
                    />
                    <button
                      type="button"
                      @click="showPin = !showPin"
                      class="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 transition cursor-pointer"
                      :title="showPin ? 'PIN-kodni yashirish' : 'PIN-kodni ko\'rsatish'"
                    >
                      <EyeOff v-if="showPin" class="w-4 h-4 text-emerald-500" />
                      <Eye v-else class="w-4 h-4" />
                    </button>
                  </div>
                </div>


                <div>
                  <label class="block font-semibold text-slate-500 dark:text-slate-400 text-[11px] mb-1.5">Avto-qulflash Taymeri</label>
                  <AppSelect
                    :model-value="autoLockMinutes"
                    @update:model-value="setAutoLockMinutes(Number($event))"
                    :options="autoLockOptions"
                    size="md"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>



      <!-- 3. Biznes Ma'lumotlari (Embedded) -->
      <div class="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <h3 class="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 class="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            <span>Biznes Ma'lumotlari</span>
          </h3>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Biznes Nomi</label>
            <input :value="authStore.activeBusiness?.name" disabled class="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold cursor-not-allowed" />
          </div>

          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Biznes Turi</label>
            <input :value="authStore.activeBusiness?.businessType" disabled class="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 uppercase font-black cursor-not-allowed" />
          </div>

          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tizim Valyutasi *</label>
            <AppSelect
              :model-value="selectedCurrency"
              @update:model-value="$emit('update:selectedCurrency', $event); $emit('currencyChange')"
              :options="currencyOptions"
            />
          </div>

          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Foydalanuvchi Roli</label>
            <input :value="authStore.activeBusiness?.role || 'Owner'" disabled class="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-purple-600 dark:text-purple-400 font-black cursor-not-allowed" />
          </div>
        </div>

        <!-- CBU vs Custom Exchange Rate Live Control Box -->
        <div class="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-slate-500/5 dark:from-emerald-500/10 dark:via-slate-800/60 dark:to-slate-900/60 border border-emerald-500/20 space-y-4">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
                <Coins class="w-5 h-5" />
              </div>
              <div>
                <p class="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Valyuta Kursi va Hisoblagich Tizimi</span>
                </p>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Mahsulotlar va POS kassadagi dollar/rubl narxlarini hisoblash manbasi
                </p>
              </div>
            </div>

            <!-- Mode Switch Toggle: Auto (CBU) vs Custom (Manual) -->
            <div class="inline-flex p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold shrink-0">
              <button
                type="button"
                @click="currencyStore.setRateMode('auto')"
                class="px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
                :class="currencyStore.rateMode === 'auto'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'"
              >
                <Globe class="w-3.5 h-3.5" />
                <span>Markaziy Bank (Avtomatik)</span>
              </button>
              <button
                type="button"
                @click="currencyStore.setRateMode('custom')"
                class="px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
                :class="currencyStore.rateMode === 'custom'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'"
              >
                <Sliders class="w-3.5 h-3.5" />
                <span>Maxsus (O'zim kiritgan kurs)</span>
              </button>
            </div>
          </div>

          <!-- Mode 1: Auto (Central Bank CBU) View -->
          <div v-if="currencyStore.rateMode === 'auto'" class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-emerald-500/10">
            <div class="text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <p class="font-bold flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Rasmiy Markaziy Bank (CBU.uz) kursi faol:</span>
              </p>
              <p class="text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                <span>1 USD = <b class="text-emerald-600 dark:text-emerald-400">{{ currencyStore.cbuUsdRate.toLocaleString('uz-UZ') }} so'm</b></span>
                <span class="mx-2 text-slate-300 dark:text-slate-600">|</span>
                <span>1 RUB = <b class="text-emerald-600 dark:text-emerald-400">{{ currencyStore.cbuRubRate.toLocaleString('uz-UZ') }} so'm</b></span>
                <span class="mx-2 text-slate-300 dark:text-slate-600">|</span>
                <span>1 EUR = <b class="text-emerald-600 dark:text-emerald-400">{{ currencyStore.cbuEurRate.toLocaleString('uz-UZ') }} so'm</b></span>
                <span class="text-slate-400 ml-2 font-sans">(Sana: {{ currencyStore.rates.USD?.date || 'Bugun' }})</span>
              </p>
            </div>

            <button
              type="button"
              @click="currencyStore.fetchRates(true)"
              :disabled="currencyStore.loading"
              class="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-sm"
            >
              <RefreshCw class="w-3.5 h-3.5 text-emerald-500" :class="{ 'animate-spin': currencyStore.loading }" />
              <span>{{ currencyStore.loading ? "Yangilanmoqda..." : "Kursni Yangilash" }}</span>
            </button>
          </div>

          <!-- Mode 2: Custom (Manual Override) View -->
          <div v-else class="space-y-3 pt-3 border-t border-amber-500/20">
            <p class="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <span>O'zingiz kiritgan tijorat/bozor kursi bo'yicha hisoblanadi:</span>
            </p>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <!-- Custom USD Rate -->
              <div class="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <label class="block text-[11px] font-bold text-slate-500 dark:text-slate-400">1 USD ($) kursi</label>
                <div class="flex items-center gap-2">
                  <input
                    type="number"
                    :value="currencyStore.customRates.USD"
                    @input="currencyStore.setCustomRate('USD', Number(($event.target as HTMLInputElement).value))"
                    placeholder="12900"
                    class="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-amber-500"
                  />
                  <span class="text-xs font-bold text-slate-500 shrink-0">so'm</span>
                </div>
              </div>

              <!-- Custom RUB Rate -->
              <div class="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <label class="block text-[11px] font-bold text-slate-500 dark:text-slate-400">1 RUB (₽) kursi</label>
                <div class="flex items-center gap-2">
                  <input
                    type="number"
                    :value="currencyStore.customRates.RUB"
                    @input="currencyStore.setCustomRate('RUB', Number(($event.target as HTMLInputElement).value))"
                    placeholder="145"
                    class="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-amber-500"
                  />
                  <span class="text-xs font-bold text-slate-500 shrink-0">so'm</span>
                </div>
              </div>

              <!-- Custom EUR Rate -->
              <div class="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <label class="block text-[11px] font-bold text-slate-500 dark:text-slate-400">1 EUR (€) kursi</label>
                <div class="flex items-center gap-2">
                  <input
                    type="number"
                    :value="currencyStore.customRates.EUR"
                    @input="currencyStore.setCustomRate('EUR', Number(($event.target as HTMLInputElement).value))"
                    placeholder="14000"
                    class="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-amber-500"
                  />
                  <span class="text-xs font-bold text-slate-500 shrink-0">so'm</span>
                </div>
              </div>
            </div>

            <p class="text-[11px] text-slate-500 dark:text-slate-400 italic">
              * Kiritilgan kurslar avtomatik saqlanadi va butun tizimdagi (Kassa, Mahsulotlar, Valyuta kalkulyatori) hisob-kitoblarga darhol ta'sir qiladi.
            </p>
          </div>
        </div>
      </div>

      <!-- Single Unified Save Button -->
      <div class="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
        <button
          type="submit"
          :disabled="savingProfile || changingPassword"
          class="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-sm shadow-xl shadow-emerald-500/25 transition btn-interactive flex items-center gap-2"
        >
          <Save class="w-4 h-4" />
          <span>{{ (savingProfile || changingPassword) ? "Saqlanmoqda..." : "O'zgarishlarni Saqlash" }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import {
  CheckCircle2,
  Phone,
  Building2,
  UserCircle,
  Key,
  Save,
  Languages,
  ShieldCheck,
  Coins,
  RefreshCw,
  Globe,
  Sliders,
  Lock,
  Clock,
  Eye,
  EyeOff,
} from 'lucide-vue-next';
import { useAuthStore } from '../../../stores/auth.store';
import { useCurrencyStore } from '../../../stores/currency.store';
import AppSelect from '../../../components/AppSelect.vue';
import PhoneInput from '../../../components/PhoneInput.vue';
import { useLanguage } from '../../../composables/useLanguage';
import { useScreenLock } from '../../../composables/useScreenLock';

const showPin = ref(false);


// reactive() bilan o'rashimiz kerak — aks holda langStore.scriptMode template da
// Ref object sifatida uzatiladi va AppSelect 'Tanlang...' ko'rsatadi
const langStore = reactive(useLanguage());
const currencyStore = useCurrencyStore();
const { pinCode, autoLockMinutes, setPinCode, setAutoLockMinutes } = useScreenLock();

const handlePinChange = (val: string) => {
  setPinCode(val);
};

const autoLockOptions = [
  { value: 0, label: "O'chirilgan (Faqat Ctrl+L / Tugma)", icon: Lock },
  { value: 5, label: "5 daqiqa harakatsizlikdan so'ng", icon: Clock },
  { value: 10, label: "10 daqiqa harakatsizlikdan so'ng", icon: Clock },
  { value: 15, label: "15 daqiqa harakatsizlikdan so'ng", icon: Clock },
  { value: 30, label: "30 daqiqa harakatsizlikdan so'ng", icon: Clock },
];



const languageOptions = [
  { value: 'uz_latn', label: "O'zbekcha (Lotin)", flagCode: 'uz_latn' },
  { value: 'uz_cyrl', label: "Ўзбекча (Кирилл)", flagCode: 'uz_cyrl' },
  { value: 'ru', label: "Русский", flagCode: 'ru' },
  { value: 'en', label: "English", flagCode: 'en' },
];




const props = defineProps<{
  profileForm: {
    fullName: string;
    phone: string;
  };
  passwordForm: {
    currentPassword: string;
    newPassword: string;
  };
  selectedCurrency: string;
  currencyOptions: { value: string; label: string }[];
  savingProfile: boolean;
  changingPassword: boolean;
}>();

defineEmits<{
  (e: 'update:selectedCurrency', val: string): void;
  (e: 'currencyChange'): void;
  (e: 'saveUnifiedProfile'): void;
}>();

const authStore = useAuthStore();
const handleFullNameInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.value) {
    props.profileForm.fullName = target.value.replace(/(?:^|\s|-)\S/g, (char) => char.toUpperCase());
    target.value = props.profileForm.fullName;
  }
};
</script>
