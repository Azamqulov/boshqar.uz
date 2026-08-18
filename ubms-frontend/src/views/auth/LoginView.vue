<template>
  <div>
    <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-1.5">Tizimga kirish</h3>
    <p class="text-xs text-slate-500 dark:text-slate-400 mb-5">Telefon raqamingiz va parolingizni kiriting</p>

    <!-- Security Lockout Countdown Card -->
    <div
      v-if="lockoutSecondsRemaining > 0"
      class="mb-5 p-4 rounded-2xl bg-rose-500/10 border-2 border-rose-500/40 text-rose-700 dark:text-rose-300 space-y-2 animate-pulse"
    >
      <div class="flex items-center gap-2">
        <ShieldAlert class="w-5 h-5 text-rose-500 shrink-0" />
        <span class="font-bold text-xs">Xavfsizlik blokirovkasi faol!</span>
      </div>
      <p class="text-[11px] leading-relaxed text-rose-600 dark:text-rose-400">
        3 marta xato parol kiritilgani sababli kirish vaqtincha to'xtatildi. Qayta urinish uchun kuting:
      </p>
      <div class="flex items-center justify-between pt-1">
        <span class="text-xs font-semibold text-slate-600 dark:text-slate-400">Qolgan vaqt:</span>
        <span class="font-mono font-black text-base px-3 py-1 rounded-xl bg-rose-600 text-white shadow-sm tracking-wider">
          {{ formattedCountdown }}
        </span>
      </div>
    </div>

    <!-- Error / Warning Message -->
    <div
      v-else-if="errorMessage"
      class="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2"
    >
      <AlertTriangle class="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
      <div class="flex-1">
        <p>{{ errorMessage }}</p>
        <span v-if="attemptsLeft !== null && attemptsLeft > 0" class="inline-block mt-1 font-bold text-[11px] px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-700 dark:text-rose-300">
          Qolgan urinishlar: {{ attemptsLeft }} ta
        </span>
      </div>
    </div>

    <form @submit.prevent="handleLogin" class="space-y-4">
      <div>
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Telefon raqam</label>
        <PhoneInput
          v-model="phone"
          :disabled="lockoutSecondsRemaining > 0"
          required
          placeholder=" 90 123 45 67"
        />
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Parol</label>
        <PasswordInput
          v-model="password"
          :disabled="lockoutSecondsRemaining > 0"
          required
          placeholder="Parolni kiriting"
        />
      </div>

      <button
        type="submit"
        :disabled="isLoading || lockoutSecondsRemaining > 0"
        class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 btn-interactive"
      >
        <span v-if="lockoutSecondsRemaining > 0" class="flex items-center gap-1.5">
          <Clock class="w-4 h-4 animate-spin" />
          <span>Kuting ({{ formattedCountdown }})</span>
        </span>
        <span v-else-if="!isLoading">Kirish</span>
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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth.store';
import { useToast } from '../../composables/useToast';
import { cleanUzbekPhone } from '../../composables/usePhoneMask';
import { getErrorMessage } from '../../services/api';
import PhoneInput from '../../components/PhoneInput.vue';
import PasswordInput from '../../components/PasswordInput.vue';
import { ShieldAlert, AlertTriangle, Clock } from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const phone = ref('');
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);
const attemptsLeft = ref<number | null>(null);

// Lockout countdown state
const lockoutSecondsRemaining = ref(0);
let timerInterval: any = null;

const formattedCountdown = computed(() => {
  const mins = Math.floor(lockoutSecondsRemaining.value / 60);
  const secs = lockoutSecondsRemaining.value % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
});

const startCountdown = (seconds: number) => {
  lockoutSecondsRemaining.value = seconds;
  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    if (lockoutSecondsRemaining.value > 0) {
      lockoutSecondsRemaining.value--;
      saveLockoutState();
    } else {
      clearInterval(timerInterval);
      timerInterval = null;
      errorMessage.value = '';
      attemptsLeft.value = null;
      localStorage.removeItem('ubms_login_lockout');
      toast.info('Blokirovka muddati tugadi. Endi qayta kirishingiz mumkin.', 'Xavfsizlik');
    }
  }, 1000);
};

const saveLockoutState = () => {
  if (lockoutSecondsRemaining.value > 0) {
    const expireAt = Date.now() + lockoutSecondsRemaining.value * 1000;
    localStorage.setItem('ubms_login_lockout', String(expireAt));
  }
};

const checkExistingLockout = () => {
  const savedExpireAt = localStorage.getItem('ubms_login_lockout');
  if (savedExpireAt) {
    const remaining = Math.ceil((Number(savedExpireAt) - Date.now()) / 1000);
    if (remaining > 0) {
      startCountdown(remaining);
    } else {
      localStorage.removeItem('ubms_login_lockout');
    }
  }
};

const handleLogin = async () => {
  if (lockoutSecondsRemaining.value > 0) {
    toast.warning(`Iltimos, blokirovka muddati tugashini kuting (${formattedCountdown.value})`, 'Bloklangan');
    return;
  }

  errorMessage.value = '';
  attemptsLeft.value = null;

  const clean = cleanUzbekPhone(phone.value);
  if (clean.length < 13) {
    const msg = 'Iltimos, telefon raqamingizni to\'liq kiriting (+998 90 123 45 67)';
    errorMessage.value = msg;
    toast.warning(msg, 'Telefon raqam');
    return;
  }

  if (!password.value) {
    const msg = 'Iltimos, parolingizni kiriting';
    errorMessage.value = msg;
    toast.warning(msg, 'Parol');
    return;
  }

  isLoading.value = true;
  try {
    const data = await authStore.login({ login: clean, password: password.value });
    toast.success(`Xush kelibsiz, ${data.user?.fullName || 'Foydalanuvchi'}!`, 'Muvaffaqiyatli');
    localStorage.removeItem('ubms_login_lockout');

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
    const responseData = err.response?.data;

    // Check if backend returned lockout
    if (responseData?.code === 'ACCOUNT_LOCKED' || responseData?.remainingSeconds) {
      const seconds = Number(responseData.remainingSeconds) || 180;
      startCountdown(seconds);
      const msg = responseData.message || `Xavfsizlik yuzasidan tizim bloklandi. Iltimos, kuting.`;
      errorMessage.value = msg;
      toast.error(msg, 'Xavfsizlik blokirovkasi');
      return;
    }

    if (responseData?.attemptsLeft !== undefined) {
      attemptsLeft.value = responseData.attemptsLeft;
    }

    const msg = getErrorMessage(err, 'Telefon raqam yoki parol noto\'g\'ri kiritildi');
    errorMessage.value = msg;
    toast.error(msg, 'Kirishda xatolik');
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  checkExistingLockout();
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});
</script>
