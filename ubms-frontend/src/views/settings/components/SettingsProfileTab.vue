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

          <!-- Til (Yozuv) Tanlash -->
          <div class="w-44" data-no-transliterate>
            <AppSelect
              :model-value="langStore.scriptMode"
              @update:model-value="langStore.setScript($event)"
              :options="scriptOptions"
            />
          </div>

          <div class="w-44">
            <AppSelect
              :model-value="selectedCurrency"
              @update:model-value="$emit('update:selectedCurrency', $event)"
              :options="currencyOptions"
              @change="$emit('currencyChange')"
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
              @update:model-value="$emit('update:selectedCurrency', $event)"
              :options="currencyOptions"
              @change="$emit('currencyChange')"
            />
          </div>

          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Foydalanuvchi Roli</label>
            <input :value="authStore.activeBusiness?.role || 'Owner'" disabled class="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-purple-600 dark:text-purple-400 font-black cursor-not-allowed" />
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
import { reactive } from 'vue';
import {
  CheckCircle2,
  Phone,
  Building2,
  UserCircle,
  Key,
  Save,
  Languages,
  ShieldCheck,
} from 'lucide-vue-next';
import { useAuthStore } from '../../../stores/auth.store';
import AppSelect from '../../../components/AppSelect.vue';
import PhoneInput from '../../../components/PhoneInput.vue';
import { useLanguage } from '../../../composables/useLanguage';

// reactive() bilan o'rashimiz kerak — aks holda langStore.scriptMode template da
// Ref object sifatida uzatiladi va AppSelect 'Tanlang...' ko'rsatadi
const langStore = reactive(useLanguage());

const scriptOptions = [
  { value: 'latin', label: "O'zbek Lotin (Aa)", icon: Languages },
  { value: 'cyrillic', label: "O'zbek Kirill (Аа)", icon: Languages },
];

defineProps<{
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
</script>
