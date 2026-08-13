<template>
  <div>
    <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-1.5">Yangi hisob yaratish</h3>
    <p class="text-xs text-slate-500 dark:text-slate-400 mb-6">boshqar.uz bilan biznesingizni tezkor boshqaring</p>

    <div v-if="errorMessage" class="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs">
      {{ errorMessage }}
    </div>

    <form @submit.prevent="handleRegister" class="space-y-4">
      <!-- 1. Ism va Familiya -->
      <div>
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Ism va Familiya</label>
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
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Telefon raqam</label>
        <PhoneInput v-model="phone" required placeholder="+998 90 123 45 67" />
      </div>

      <!-- 3. Parol with Show/Hide Toggle -->
      <div>
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Parol</label>
        <PasswordInput v-model="password" required placeholder="Kamida 8 ta belgi" />
      </div>

      <button
        type="submit"
        :disabled="isLoading"
        class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition disabled:opacity-50 flex items-center justify-center btn-interactive"
      >
        <span v-if="!isLoading">Ro'yxatdan o'tish</span>
        <span v-else>Yuklanmoqda...</span>
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
import { cleanUzbekPhone } from '../../composables/usePhoneMask';
import { getErrorMessage } from '../../services/api';
import PhoneInput from '../../components/PhoneInput.vue';
import PasswordInput from '../../components/PasswordInput.vue';

const router = useRouter();
const authStore = useAuthStore();

const fullName = ref('');
const phone = ref('+998 ');
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

const handleRegister = async () => {
  errorMessage.value = '';

  if (!fullName.value.trim()) {
    errorMessage.value = 'Iltimos, ism va familiyangizni kiriting';
    return;
  }

  const clean = cleanUzbekPhone(phone.value);
  if (clean.length < 13) {
    errorMessage.value = 'Iltimos, telefon raqamni to\'liq 9 ta raqamda kiriting (+998 90 123 45 67)';
    return;
  }

  if (!password.value || password.value.length < 8) {
    errorMessage.value = 'Parol kamida 8 ta belgidan iborat bo\'lishi shart (kamida 8 ta belgi kiriting)';
    return;
  }

  isLoading.value = true;
  try {
    await authStore.register({
      fullName: fullName.value.trim(),
      phone: clean,
      password: password.value,
    });
    router.push('/onboarding');
  } catch (err: any) {
    errorMessage.value = getErrorMessage(err, 'Ro\'yxatdan o\'tishda xatolik yuz berdi');
  } finally {
    isLoading.value = false;
  }
};
</script>
