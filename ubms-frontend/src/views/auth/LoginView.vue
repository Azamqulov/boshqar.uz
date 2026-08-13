<template>
  <div>
    <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-1.5">Tizimga kirish</h3>
    <p class="text-xs text-slate-500 dark:text-slate-400 mb-6">Telefon raqamingiz va parolingizni kiriting</p>

    <div v-if="errorMessage" class="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs">
      {{ errorMessage }}
    </div>

    <form @submit.prevent="handleLogin" class="space-y-4">
      <div>
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Telefon raqam</label>
        <PhoneInput v-model="phone" required placeholder="+998 90 123 45 67" />
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Parol</label>
        <PasswordInput v-model="password" required placeholder="Parolni kiriting" />
      </div>

      <button
        type="submit"
        :disabled="isLoading"
        class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition disabled:opacity-50 flex items-center justify-center space-x-2 btn-interactive"
      >
        <span v-if="!isLoading">Kirish</span>
        <span v-else>Kirilmoqda...</span>
      </button>
    </form>

    <div class="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
      Akkauntingiz yo'qmi?
      <router-link to="/auth/register" class="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold ml-1">Ro'yxatdan o'tish</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth.store';
import { formatUzbekPhone, cleanUzbekPhone } from '../../composables/usePhoneMask';
import PhoneInput from '../../components/PhoneInput.vue';
import PasswordInput from '../../components/PasswordInput.vue';

const router = useRouter();
const authStore = useAuthStore();

const phone = ref('');
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

const handleLogin = async () => {
  errorMessage.value = '';
  const clean = cleanUzbekPhone(phone.value);

  isLoading.value = true;
  try {
    const data = await authStore.login({ login: clean, password: password.value });
    if (!data.activeBusiness) {
      router.push('/onboarding');
    } else {
      const role = (data.activeBusiness?.role || '').toLowerCase();
      const isWorker = !data.user?.isSuperAdmin && role !== 'owner' && role !== 'admin';
      if (isWorker) {
        router.push('/pos');
      } else {
        router.push('/dashboard');
      }
    }
  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || err.message || 'Kirishda xatolik yuz berdi';
  } finally {
    isLoading.value = false;
  }
};
</script>
