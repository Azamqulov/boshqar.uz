<template>
  <transition
    enter-active-class="transition ease-out duration-300 transform"
    enter-from-class="translate-y-12 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition ease-in duration-200 transform"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-12 opacity-0"
  >
    <div
      v-if="isVisible"
      class="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 p-4 sm:p-5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-2xl space-y-3 notranslate"
      translate="no"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-start gap-3">
          <div class="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
            <Cookie class="w-5 h-5" />
          </div>
          <div class="space-y-1">
            <div class="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
              Cookie va Xavfsizlik Siyosati
            </div>
            <p class="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Biz platformamizda xavfsiz autentifikatsiya, qulaylik va sozlamalarni saqlash uchun cookie-fayllardan foydalanamiz.
            </p>
          </div>
        </div>

        <!-- Close Button (X) -->
        <button
          type="button"
          @click="dismissCookies"
          class="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0 cursor-pointer"
          title="Yopish"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <div class="flex items-center justify-end gap-2 pt-1">
        <router-link
          to="/legal?tab=cookies"
          @click="dismissCookies"
          class="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          Batafsil
        </router-link>
        <button
          type="button"
          @click="acceptCookies"
          class="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs hover:scale-105 active:scale-95 cursor-pointer"
        >
          Qabul Qilish
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Cookie, X } from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth.store';

const isVisible = ref(false);
const STORAGE_KEY = 'ubms_cookie_consent';
const authStore = useAuthStore();

onMounted(() => {
  try {
    const consent = localStorage.getItem(STORAGE_KEY);
    // If already accepted/dismissed or user is in dashboard, never show banner
    if (!consent && !authStore.token && !authStore.user) {
      setTimeout(() => {
        if (!localStorage.getItem(STORAGE_KEY) && !authStore.token) {
          isVisible.value = true;
        }
      }, 1500);
    }
  } catch (e) {
    // ignore
  }
});

const acceptCookies = () => {
  try {
    localStorage.setItem(STORAGE_KEY, 'accepted');
  } catch (e) {}
  isVisible.value = false;
};

const dismissCookies = () => {
  try {
    localStorage.setItem(STORAGE_KEY, 'dismissed');
  } catch (e) {}
  isVisible.value = false;
};
</script>

