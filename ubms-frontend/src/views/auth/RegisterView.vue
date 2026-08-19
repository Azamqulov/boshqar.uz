<template>
  <div>
    <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-1.5">Yangi hisob yaratish</h3>
    <p class="text-xs text-slate-500 dark:text-slate-400 mb-6">boshqar.uz bilan biznesingizni tezkor boshqaring</p>

    <!-- Error Alert -->
    <div v-if="errorMessage" class="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs">
      {{ errorMessage }}
    </div>

    <form @submit.prevent="handleRegister" class="space-y-4">
      <!-- 1. Ism va Familiya -->
      <div>
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
          Ism va Familiya
        </label>
        <input
          v-model="fullName"
          type="text"
          required
          placeholder="Ismingiz va familiyangiz"
          class="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
        />
      </div>

      <!-- 2. Telefon Raqam (+998 90 123 45 67) -->
      <div>
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
          Telefon raqam
        </label>
        <PhoneInput v-model="phone" required placeholder=" 90 123 45 67" />
      </div>

      <!-- 3. Parol with Show/Hide Toggle -->
      <div>
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
          Parol
        </label>
        <PasswordInput v-model="password" required placeholder="Kamida 4 yoki 6 ta belgi" />
      </div>

      <button
        type="submit"
        :disabled="isLoading"
        class="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition disabled:opacity-50 flex items-center justify-center btn-interactive cursor-pointer"
      >
        <span v-if="!isLoading">Ro'yxatdan o'tish</span>
        <span v-else>Hisob yaratilmoqda...</span>
      </button>
    </form>

    <div class="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
      Akkauntingiz bormi?
      <router-link to="/auth/login" class="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold ml-1">Kirish</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth.store';
import { useToast } from '../../composables/useToast';
import { cleanUzbekPhone } from '../../composables/usePhoneMask';
import { getErrorMessage } from '../../services/api';
import PhoneInput from '../../components/PhoneInput.vue';
import PasswordInput from '../../components/PasswordInput.vue';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const fullName = ref('');
const phone = ref('+998 ');
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

const handleRegister = async () => {
  errorMessage.value = '';

  if (!fullName.value.trim()) {
    const msg = 'Iltimos, ism va familiyangizni kiriting';
    errorMessage.value = msg;
    toast.warning(msg, 'Ism Familiya');
    return;
  }

  const clean = cleanUzbekPhone(phone.value);
  if (clean.length < 13) {
    const msg = 'Iltimos, telefon raqamni to\'liq 9 ta raqamda kiriting (+998 90 123 45 67)';
    errorMessage.value = msg;
    toast.warning(msg, 'Telefon raqam');
    return;
  }

  if (!password.value || password.value.length < 4) {
    const msg = 'Parol kamida 4 ta belgidan iborat bo\'lishi shart';
    errorMessage.value = msg;
    toast.warning(msg, 'Parol');
    return;
  }

  isLoading.value = true;
  try {
    await authStore.register({
      fullName: fullName.value.trim(),
      phone: clean,
      password: password.value,
    });
    toast.success('Hisobingiz muvaffaqiyatli yaratildi!', 'Xush kelibsiz');
    router.push('/onboarding');
  } catch (err: any) {
    const msg = getErrorMessage(err, 'Ro\'yxatdan o\'tishda xatolik yuz berdi');
    errorMessage.value = msg;
    toast.error(msg, 'Xatolik');
  } finally {
    isLoading.value = false;
  }
};
</script>
