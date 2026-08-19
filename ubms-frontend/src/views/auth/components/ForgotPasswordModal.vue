<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[999999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      @click.self="close"
    >
      <div
        class="relative max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200"
        @click.stop
      >
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 shadow-inner">
              <KeyRound class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-base font-black text-slate-900 dark:text-white">Parolni Tiklash</h3>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">Telegram bot orqali tezkor tiklash</p>
            </div>
          </div>
          <button
            type="button"
            @click="close"
            class="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Step Indicator -->
        <div class="flex items-center justify-between gap-2 px-1">
          <div
            v-for="s in 3"
            :key="s"
            class="flex-1 h-1.5 rounded-full transition-all duration-300"
            :class="step >= s ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'"
          ></div>
        </div>

        <!-- STEP 1: Phone Input -->
        <div v-if="step === 1" class="space-y-4">
          <div class="text-left space-y-1">
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Telefon raqamingiz
            </label>
            <PhoneInput v-model="phone" placeholder=" 90 123 45 67" required />
            <p class="text-[11px] text-slate-500 dark:text-slate-400">
              Ushbu raqamga Telegram botimiz (@Boshqar_uzbot) orqali 6 xonali tasdiqlash kodi yuboriladi.
            </p>
          </div>

          <button
            type="button"
            @click="handleSendOtp"
            :disabled="loading"
            class="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send class="w-4 h-4" />
            <span>{{ loading ? "Kod yuborilmoqda..." : "Telegram orqali kod olish" }}</span>
          </button>
        </div>

        <!-- STEP 2: OTP Verification -->
        <div v-else-if="step === 2" class="space-y-4 text-center">
          <div class="space-y-1">
            <h4 class="text-sm font-black text-slate-900 dark:text-white">Tasdiqlash kodini kiriting</h4>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              <span class="font-bold text-emerald-600 dark:text-emerald-400">{{ phone }}</span> raqamiga Telegram bot orqali kod yuborildi.
            </p>
          </div>

          <!-- 6-digit OTP input -->
          <div>
            <input
              v-model="otp"
              type="text"
              maxlength="6"
              placeholder="123456"
              autofocus
              class="w-full text-center tracking-[0.4em] font-mono text-2xl font-black py-3 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <!-- Direct 1-Click Bot Open & Start Button -->
          <a
            :href="`https://t.me/Boshqar_uzbot?start=forgot_${cleanUzbekPhone(phone).replace(/\\D/g, '')}`"
            target="_blank"
            rel="noopener noreferrer"
            class="w-full py-2.5 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 transition"
          >
            <Send class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Botda Start bosish va kod olish</span>
          </a>

          <div class="flex items-center justify-between text-xs pt-1">
            <span class="text-slate-400">Kod kelmadimi?</span>
            <button
              type="button"
              @click="handleSendOtp"
              :disabled="loading || countdown > 0"
              class="font-bold text-emerald-600 dark:text-emerald-400 hover:underline disabled:opacity-50 cursor-pointer"
            >
              {{ countdown > 0 ? `Qayta yuborish (${countdown}s)` : "Qayta yuborish" }}
            </button>
          </div>

          <button
            type="button"
            @click="handleVerifyOtp"
            :disabled="loading || otp.length < 6"
            class="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 class="w-4 h-4" />
            <span>{{ loading ? "Tekshirilmoqda..." : "Kodni tasdiqlash" }}</span>
          </button>
        </div>

        <!-- STEP 3: New Password Setup -->
        <div v-else-if="step === 3" class="space-y-4">
          <div class="space-y-1 text-left">
            <h4 class="text-sm font-black text-slate-900 dark:text-white">Yangi parol o'rnating</h4>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Kamida 4 yoki 6 ta belgidan iborat yangi parol kiriting.
            </p>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Yangi parol
              </label>
              <PasswordInput v-model="newPassword" placeholder="Yangi parolni kiriting" required />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Parolni takrorlang
              </label>
              <PasswordInput v-model="confirmPassword" placeholder="Parolni qayta kiriting" required />
            </div>
          </div>

          <button
            type="button"
            @click="handleResetPassword"
            :disabled="loading"
            class="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Save class="w-4 h-4" />
            <span>{{ loading ? "Saqlanmoqda..." : "Yangi parolni saqlash" }}</span>
          </button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import {
  KeyRound,
  X,
  Send,
  CheckCircle2,
  Save,
} from 'lucide-vue-next';
import PhoneInput from '../../../components/PhoneInput.vue';
import PasswordInput from '../../../components/PasswordInput.vue';
import api, { getErrorMessage } from '../../../services/api';
import { useToast } from '../../../composables/useToast';
import { cleanUzbekPhone } from '../../../composables/usePhoneMask';

const props = defineProps<{
  isOpen: boolean;
  initialPhone?: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'success', phone: string): void;
}>();

const toast = useToast();

const step = ref(1);
const phone = ref('+998 ');
const otp = ref('');
const resetToken = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const countdown = ref(0);
let timer: any = null;

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      step.value = 1;
      otp.value = '';
      resetToken.value = '';
      newPassword.value = '';
      confirmPassword.value = '';
      if (props.initialPhone) {
        phone.value = props.initialPhone;
      }
    }
  }
);

const startCountdown = () => {
  countdown.value = 60;
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--;
    } else {
      clearInterval(timer);
    }
  }, 1000);
};

const devCode = ref('');

const handleSendOtp = async () => {
  const clean = cleanUzbekPhone(phone.value);
  if (clean.length < 13) {
    toast.warning('Iltimos, telefon raqamingizni to\'liq kiriting (+998 90 123 45 67)');
    return;
  }

  loading.value = true;
  try {
    const { data } = await api.post('/auth/forgot-password', { login: clean });
    if (data.devOtp) {
      devCode.value = data.devOtp;
      toast.info(`Test kodi: ${data.devOtp}`, 'Dev Rejim');
    }
    toast.success(
      data.message || 'Tasdiqlash kodi Telegram botga yuborildi',
      'Telegram Kod'
    );
    step.value = 2;
    startCountdown();
  } catch (err: any) {
    const msg = getErrorMessage(err, 'Kod yuborishda xatolik yuz berdi');
    toast.error(msg);
  } finally {
    loading.value = false;
  }
};

const handleVerifyOtp = async () => {
  if (otp.value.trim().length < 6) {
    toast.warning('Iltimos, 6 xonali tasdiqlash kodini to\'liq kiriting');
    return;
  }

  const clean = cleanUzbekPhone(phone.value);
  loading.value = true;
  try {
    const { data } = await api.post('/auth/verify-reset-otp', {
      login: clean,
      otp: otp.value.trim(),
    });
    resetToken.value = data.resetToken;
    toast.success('Kod tasdiqlandi! Yangi parolingizni kiriting', 'Muvaffaqiyatli');
    step.value = 3;
  } catch (err: any) {
    const msg = getErrorMessage(err, 'Tasdiqlash kodi noto\'g\'ri');
    toast.error(msg);
  } finally {
    loading.value = false;
  }
};

const handleResetPassword = async () => {
  if (!newPassword.value || newPassword.value.length < 4) {
    toast.warning('Yangi parol kamida 4 ta belgidan iborat bo\'lishi kerak');
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    toast.warning('Parollar bir-biriga mos kelmadi');
    return;
  }

  loading.value = true;
  try {
    await api.post('/auth/reset-password', {
      resetToken: resetToken.value,
      newPassword: newPassword.value,
    });
    toast.success('Parolingiz muvaffaqiyatli yangilandi! Endi tizimga kirishingiz mumkin.', 'Parol Tiklandi');
    emit('success', phone.value);
    close();
  } catch (err: any) {
    const msg = getErrorMessage(err, 'Parolni yangilashda xatolik');
    toast.error(msg);
  } finally {
    loading.value = false;
  }
};

const close = () => {
  if (timer) clearInterval(timer);
  emit('close');
};
</script>
