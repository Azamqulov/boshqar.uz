<template>
  <Teleport to="body">
    <transition name="lock-fade">
      <div
        v-if="isLocked"
        class="fixed inset-0 z-[99999] select-none overflow-hidden font-sans flex flex-col items-center justify-between transition-all duration-300"
        :class="[
          isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-900',
          !showUnlockCard ? 'cursor-pointer active:scale-[0.998]' : ''
        ]"
        @touchstart.passive="handleTouchStart"
        @touchend="handleTouchEnd"
        @mousedown="handleMouseDown"
        @mouseup="handleMouseUp"
        @wheel.passive="handleWheel"
      >
        <!-- 1. DYNAMIC LIGHT vs DARK CINEMATIC WALLPAPER WITH GLASS OVERLAY -->
        <div class="absolute inset-0 z-0 overflow-hidden" @click="handleBackgroundClick">
          <img
            :src="currentWallpaperUrl"
            alt="Lock Background"
            class="w-full h-full object-cover scale-100 transition-all duration-700"
            :class="isDarkMode ? 'filter brightness-[0.55]' : 'filter brightness-[0.95] contrast-[1.02]'"
          />
          <div
            class="absolute inset-0 transition-colors"
            :class="isDarkMode
              ? 'bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent'
              : 'bg-gradient-to-t from-slate-900/40 via-slate-900/10 to-transparent'"
          ></div>
          <div
            class="absolute inset-0 transition-all duration-300 pointer-events-none"
            :class="isDarkMode ? 'bg-slate-950/10 backdrop-blur-[2px]' : 'bg-white/10 backdrop-blur-[2px]'"
          ></div>

          <!-- Ambient Mesh Glowing Lights -->
          <div
            class="absolute top-1/4 left-1/4 w-96 h-96 rounded-full filter blur-[120px] pointer-events-none transition-colors"
            :class="isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-400/20'"
          ></div>
          <div
            class="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full filter blur-[140px] pointer-events-none transition-colors"
            :class="isDarkMode ? 'bg-teal-500/10' : 'bg-teal-400/20'"
          ></div>
        </div>

        <!-- 2. TOP STATUS BAR & BUSINESS IDENTITY -->
        <div class="relative z-10 w-full px-5 py-3.5 flex items-center justify-between text-xs font-medium" @click.stop>
          <div
            class="flex items-center space-x-2.5 px-3.5 py-1.5 rounded-xl border backdrop-blur-md shadow-xl transition-colors"
            :class="isDarkMode
              ? 'bg-slate-950/70 border-slate-700/60 text-slate-200'
              : 'bg-white/80 border-slate-200/90 text-slate-800 shadow-slate-300/40'"
          >
            <component :is="businessIcon" class="w-4 h-4 text-emerald-500 shrink-0" />
            <span class="font-bold truncate max-w-[180px] sm:max-w-[280px] text-xs">{{ activeBusinessName }}</span>
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-wider bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              {{ activeBusinessType }} • FAOL
            </span>
          </div>

          <div class="flex items-center space-x-2">
            <div
              class="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border backdrop-blur-md transition-colors"
              :class="isDarkMode ? 'bg-slate-950/70 border-slate-700/60 text-slate-200' : 'bg-white/80 border-slate-200/90 text-slate-800'"
            >
              <ShieldCheck class="w-3.5 h-3.5 text-emerald-500" />
              <span class="font-mono text-[10px] font-bold">XAVFSIZLIK HIMOYA</span>
            </div>

            <!-- Manual Wallpaper Selector Button -->
            <button
              type="button"
              @click.stop="nextWallpaper"
              class="p-1.5 rounded-xl border backdrop-blur-md transition btn-interactive cursor-pointer"
              :class="isDarkMode
                ? 'bg-slate-950/70 hover:bg-slate-800 border-slate-700/60 text-slate-300 hover:text-white'
                : 'bg-white/80 hover:bg-slate-100 border-slate-200/90 text-slate-700 hover:text-slate-900'"
              title="Orqa fon rasmini o'zgartirish"
            >
              <Image class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- 3. CENTER AREA: CLOCK OR COMPACT DUAL-THEME PIN CARD -->
        <div class="relative z-10 flex-1 w-full flex flex-col items-center justify-center px-4" @click="handleBackgroundClick">
          <!-- A) Real-time Clock View (Slides Up on Enter, Click, Swipe, Drag) -->
          <div
            v-if="!showUnlockCard"
            @click="openUnlockPanel"
            class="flex flex-col items-center justify-center cursor-pointer group space-y-3 transition-all duration-300 transform hover:scale-105"
            title="Ekranni ochish uchun bosing yoki suring"
          >
            <div
              class="font-mono font-black text-7xl sm:text-9xl tracking-tighter text-transparent bg-clip-text drop-shadow-2xl"
              :class="isDarkMode
                ? 'bg-gradient-to-b from-white via-slate-100 to-slate-400 drop-shadow-[0_15px_35px_rgba(0,0,0,0.9)]'
                : 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-600 drop-shadow-[0_15px_35px_rgba(255,255,255,0.8)]'"
            >
              {{ currentTimeStr }}
            </div>

            <div
              class="text-lg sm:text-2xl font-bold tracking-wide drop-shadow-md"
              :class="isDarkMode ? 'text-slate-200' : 'text-slate-800'"
            >
              {{ currentDateStr }}
            </div>

            <div class="pt-6 flex flex-col items-center space-y-2 opacity-90 group-hover:opacity-100 transition-opacity">
              <div
                class="w-9 h-9 rounded-full border flex items-center justify-center animate-bounce shadow-xl backdrop-blur-md"
                :class="isDarkMode ? 'bg-emerald-500/20 border-emerald-400/40 text-white' : 'bg-emerald-500/20 border-emerald-600/40 text-emerald-800'"
              >
                <ChevronUp class="w-5 h-5 text-emerald-500" />
              </div>
              <span
                class="text-[11px] font-black tracking-widest uppercase px-3.5 py-1 rounded-full border backdrop-blur-md shadow-sm"
                :class="isDarkMode ? 'bg-slate-950/70 border-slate-700/60 text-slate-200' : 'bg-white/85 border-slate-200/90 text-slate-800'"
              >
                {{ t('lock_hint', "Ochish uchun bosing, tepaga suring yoki istalgan tugmani bosing") }}
              </span>
            </div>
          </div>

          <!-- B) COMPACT DUAL-THEME PIN KEYPAD CARD -->
          <div
            v-else
            @click.stop
            class="w-full max-w-[340px] rounded-3xl p-4 sm:p-5 backdrop-blur-2xl shadow-2xl flex flex-col items-center space-y-3 transition-all duration-300 animate-slide-up border"
            :class="[
              isDarkMode
                ? 'bg-slate-950/90 border-slate-800/90 text-white'
                : 'bg-white/95 border-slate-200/90 text-slate-900 shadow-slate-400/30',
              isShake ? 'animate-shake border-rose-500/80 shadow-rose-500/30' : '',
              isSuccess ? 'border-emerald-500 shadow-emerald-500/30' : ''
            ]"
          >
            <!-- User Avatar & Identity (Compact) -->
            <div class="flex flex-col items-center space-y-1.5">
              <div class="relative">
                <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 p-0.5 shadow-lg">
                  <div
                    class="w-full h-full rounded-[14px] flex items-center justify-center text-lg font-black"
                    :class="isDarkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'"
                  >
                    {{ userInitials }}
                  </div>
                </div>
                <div class="absolute -bottom-1 -right-1 p-1 rounded-lg bg-emerald-500 text-slate-950 shadow-md">
                  <Lock class="w-3 h-3" />
                </div>
              </div>

              <div class="text-center">
                <h3 class="text-base font-black tracking-tight truncate max-w-[220px]" :class="isDarkMode ? 'text-white' : 'text-slate-900'">
                  {{ userName }}
                </h3>
                <p class="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-wider">
                  {{ userRole }}
                </p>
              </div>
            </div>

            <!-- PIN Code Indicators (Compact Dots) -->
            <div class="w-full space-y-2">
              <div class="flex items-center justify-center space-x-2.5 py-0.5">
                <div
                  v-for="i in expectedPinLength"
                  :key="i"
                  class="w-3.5 h-3.5 rounded-full border transition-all duration-200"
                  :class="[
                    inputPin.length >= i
                      ? 'bg-emerald-500 border-emerald-400 scale-110 shadow-md shadow-emerald-500/50'
                      : isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-300'
                  ]"
                ></div>
              </div>

              <!-- Input Box (Readonly to prevent double input event with window keydown) -->
              <div class="relative flex items-center justify-center">
                <input
                  ref="pinInputRef"
                  :value="maskedPinDisplay"
                  readonly
                  type="text"
                  :placeholder="lockoutSeconds > 0 ? `Vaqtinchalik qulf (${lockoutSeconds}s)` : t('enter_pin', 'PIN Kodni kiriting')"
                  class="w-full text-center tracking-[0.3em] text-lg font-mono font-bold py-2 px-3 rounded-2xl border transition shadow-inner placeholder:tracking-normal placeholder:text-slate-400 placeholder:text-xs select-none cursor-default"
                  :class="[
                    lockoutSeconds > 0
                      ? 'bg-rose-500/10 border-rose-500/40 text-rose-500'
                      : isDarkMode
                        ? 'bg-slate-900/90 border-slate-700/80 text-emerald-400'
                        : 'bg-slate-50 border-slate-300 text-emerald-600'
                  ]"
                />
              </div>

              <!-- Status Notification & Lockout Countdown -->
              <div
                v-if="lockoutSeconds > 0"
                class="text-center text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/15 py-1.5 px-3 rounded-xl border border-rose-500/30 flex items-center justify-center gap-1.5 animate-pulse"
              >
                <Clock class="w-3.5 h-3.5 shrink-0" />
                <span>5 marta xato kiritildi! {{ lockoutSeconds }} soniya kuting...</span>
              </div>
              <div
                v-else-if="errorMessage"
                class="text-center text-[11px] font-bold text-rose-500 bg-rose-500/10 py-1.5 px-3 rounded-xl border border-rose-500/20 flex items-center justify-center gap-1"
              >
                <AlertTriangle class="w-3.5 h-3.5 shrink-0" />
                <span>{{ errorMessage }}</span>
              </div>
              <div
                v-else-if="isSuccess"
                class="text-center text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 py-1.5 px-3 rounded-xl border border-emerald-500/20 flex items-center justify-center space-x-1"
              >
                <CheckCircle2 class="w-3.5 h-3.5 animate-spin text-emerald-500" />
                <span>{{ t('unlocking', 'Ochilmoqda...') }}</span>
              </div>
            </div>

            <!-- Numpad Keypad (Compact Dual-Theme) -->
            <div class="grid grid-cols-3 gap-1.5 w-full">
              <button
                v-for="num in [1,2,3,4,5,6,7,8,9]"
                :key="num"
                type="button"
                :disabled="lockoutSeconds > 0"
                @click="appendDigit(String(num))"
                class="py-2.5 rounded-xl font-mono font-bold text-lg border transition cursor-pointer shadow-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                :class="isDarkMode
                  ? 'bg-slate-900/80 hover:bg-slate-800 text-white border-slate-800'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-200'"
              >
                {{ num }}
              </button>
              <button
                type="button"
                :disabled="lockoutSeconds > 0"
                @click="clearDigit"
                class="py-2.5 rounded-xl font-bold text-xs border transition cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                :class="isDarkMode
                  ? 'bg-slate-900/40 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 border-slate-800'
                  : 'bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 border-slate-200'"
              >
                {{ t('clear', "O'chirish") }}
              </button>
              <button
                type="button"
                :disabled="lockoutSeconds > 0"
                @click="appendDigit('0')"
                class="py-2.5 rounded-xl font-mono font-bold text-lg border transition cursor-pointer shadow-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                :class="isDarkMode
                  ? 'bg-slate-900/80 hover:bg-slate-800 text-white border-slate-800'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-200'"
              >
                0
              </button>
              <button
                type="button"
                :disabled="lockoutSeconds > 0"
                @click="tryUnlock"
                class="py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black text-xs border border-emerald-400/40 transition shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center justify-center space-x-1 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <KeyRound class="w-3.5 h-3.5" />
                <span>{{ t('unlock', 'Ochish') }}</span>
              </button>
            </div>

            <!-- Logout / Switch Account Button -->
            <div class="w-full pt-1">
              <button
                type="button"
                @click="handleLogout"
                class="w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <LogOut class="w-3.5 h-3.5" />
                <span>Tizimdan Chiqish (Log out)</span>
              </button>
            </div>

            <!-- Footer Hint & Back Button -->
            <div class="w-full flex items-center justify-between pt-0.5 text-[10px] font-medium" :class="isDarkMode ? 'text-slate-400' : 'text-slate-500'">
              <button
                type="button"
                @click="showUnlockCard = false"
                class="hover:opacity-80 transition flex items-center space-x-1 cursor-pointer"
              >
                <ChevronLeft class="w-3 h-3" />
                <span>{{ t('back', 'Orqaga') }}</span>
              </button>

              <span class="text-[10px] font-mono opacity-80">
                {{ t('auto_unlock_hint', 'PIN kiritilgach avtomatik ochiladi') }}
              </span>
            </div>
          </div>
        </div>

        <!-- 4. BOTTOM FOOTER -->
        <div class="relative z-10 w-full px-5 py-3 flex items-center justify-between text-[10px] font-medium opacity-80">
          <div class="flex items-center space-x-1.5">
            <Lock class="w-3.5 h-3.5 text-emerald-500" />
            <span>Boshqar.uz POS Lock System</span>
          </div>

          <div class="hidden sm:flex items-center space-x-1">
            <span>Hotkey:</span>
            <kbd class="px-2 py-0.5 rounded border text-[10px] font-mono font-bold text-emerald-500" :class="isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'">Ctrl + L</kbd>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useScreenLock } from '../composables/useScreenLock';
import { useAuthStore } from '../stores/auth.store';
import { useLanguage } from '../composables/useLanguage';
import {
  Store,
  ShieldCheck,
  ChevronUp,
  ChevronLeft,
  Lock,
  KeyRound,
  Image,
  UtensilsCrossed,
  ShoppingBag,
  Pill,
  Scissors,
  Wrench,
  CheckCircle2,
  LogOut,
  Clock,
  AlertTriangle,
} from 'lucide-vue-next';

const router = useRouter();
const { isLocked, pinCode, unlockScreen, initLockListeners, destroyLockListeners } = useScreenLock();
const authStore = useAuthStore();
const { t } = useLanguage();

const isDarkMode = ref(false);

const checkDarkMode = () => {
  if (typeof document !== 'undefined') {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  }
};

const showUnlockCard = ref(false);
const inputPin = ref('');
const errorMessage = ref('');
const isShake = ref(false);
const isSuccess = ref(false);
const pinInputRef = ref<HTMLInputElement | null>(null);

// 5 failed attempts lockout state
const failedAttempts = ref(0);
const lockoutSeconds = ref(0);
let lockoutTimer: any = null;

const maskedPinDisplay = computed(() => {
  if (!inputPin.value) return '';
  return '• '.repeat(inputPin.value.length).trim();
});

// Wallpapers mapped to 6 Uzbek business domains
const wallpaperPresets: Record<string, string[]> = {
  restaurant: [
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1920&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1920&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=1920&auto=format&fit=crop',
  ],
  cafe: [
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1920&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=1920&auto=format&fit=crop',
  ],
  shop: [
    'https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=1920&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1920&auto=format&fit=crop',
  ],
  pharmacy: [
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=1920&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?q=80&w=1920&auto=format&fit=crop',
  ],
  barbershop: [
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1920&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=1920&auto=format&fit=crop',
  ],
  service: [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1920&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=1920&auto=format&fit=crop',
  ],
};

const currentWallpaperIdx = ref(0);

const currentWallpaperUrl = computed(() => {
  const bType = (authStore.activeBusiness?.businessType || 'shop').toLowerCase();
  const list = wallpaperPresets[bType] || wallpaperPresets['shop'];
  return list[currentWallpaperIdx.value % list.length];
});

const nextWallpaper = () => {
  currentWallpaperIdx.value++;
};

const businessIcon = computed(() => {
  const bType = (authStore.activeBusiness?.businessType || '').toLowerCase();
  if (bType === 'restaurant' || bType === 'cafe') return UtensilsCrossed;
  if (bType === 'pharmacy') return Pill;
  if (bType === 'barbershop') return Scissors;
  if (bType === 'service') return Wrench;
  if (bType === 'shop') return ShoppingBag;
  return Store;
});

// Clock state
const currentTimeStr = ref('');
const currentDateStr = ref('');
let clockTimer: any = null;

const activeBusinessName = computed(() => authStore.activeBusiness?.name || 'Boshqar.uz Korxona');
const activeBusinessType = computed(() => (authStore.activeBusiness?.businessType || 'SHOP').toUpperCase());
const userName = computed(() => authStore.user?.fullName || 'Foydalanuvchi');
const userRole = computed(() => authStore.activeBusiness?.role || 'Xodim');
const userInitials = computed(() => {
  const name = userName.value.trim();
  if (!name) return 'B';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
});

const expectedPinLength = computed(() => 4);

const updateClock = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  currentTimeStr.value = `${hours}:${minutes}`;

  // Date format in Uzbek
  const days = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
  const months = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
  
  const dayName = days[now.getDay()];
  const dayNum = now.getDate();
  const monthName = months[now.getMonth()];

  currentDateStr.value = `${dayName}, ${dayNum}-${monthName}`;
};

const openUnlockPanel = () => {
  if (showUnlockCard.value) return;
  showUnlockCard.value = true;
  errorMessage.value = '';
  inputPin.value = '';
};

// Full-screen gesture & click handlers
const touchStartY = ref(0);
const mouseStartY = ref(0);
const isMouseDown = ref(false);

const handleTouchStart = (e: TouchEvent) => {
  if (showUnlockCard.value) return;
  touchStartY.value = e.touches[0].clientY;
};

const handleTouchEnd = (e: TouchEvent) => {
  if (showUnlockCard.value) return;
  const touchEndY = e.changedTouches[0].clientY;
  const deltaY = touchStartY.value - touchEndY;
  if (deltaY > 15 || Math.abs(deltaY) < 10) {
    openUnlockPanel();
  }
};

const handleMouseDown = (e: MouseEvent) => {
  if (showUnlockCard.value) return;
  if ((e.target as HTMLElement)?.closest('button')) return;
  isMouseDown.value = true;
  mouseStartY.value = e.clientY;
};

const handleMouseUp = (e: MouseEvent) => {
  if (!isMouseDown.value || showUnlockCard.value) return;
  isMouseDown.value = false;
  const deltaY = mouseStartY.value - e.clientY;
  if (deltaY > 15 || Math.abs(deltaY) < 15) {
    openUnlockPanel();
  }
};

const handleWheel = (e: WheelEvent) => {
  if (!isLocked.value || showUnlockCard.value) return;
  if (e.deltaY < -5 || e.deltaY > 5) {
    openUnlockPanel();
  }
};

const handleBackgroundClick = (e: MouseEvent) => {
  if (showUnlockCard.value) return;
  if ((e.target as HTMLElement)?.closest('button')) return;
  openUnlockPanel();
};

const appendDigit = (digit: string) => {
  if (lockoutSeconds.value > 0) return;
  if (inputPin.value.length < 4) {
    inputPin.value += digit;
    errorMessage.value = '';
  }
};

const clearDigit = () => {
  if (lockoutSeconds.value > 0) return;
  if (inputPin.value.length > 0) {
    inputPin.value = inputPin.value.slice(0, -1);
    errorMessage.value = '';
  }
};

const tryUnlock = () => {
  if (lockoutSeconds.value > 0) return;

  if (!inputPin.value.trim()) {
    errorMessage.value = t('enter_pin', 'Iltimos, PIN kodni kiriting');
    return;
  }

  const success = unlockScreen(inputPin.value, authStore.user?.phone);
  if (success) {
    failedAttempts.value = 0;
    lockoutSeconds.value = 0;
    isSuccess.value = true;
    setTimeout(() => {
      inputPin.value = '';
      errorMessage.value = '';
      isSuccess.value = false;
      showUnlockCard.value = false;
    }, 150);
  } else {
    failedAttempts.value++;
    isShake.value = true;
    setTimeout(() => {
      isShake.value = false;
    }, 500);

    if (failedAttempts.value >= 5) {
      lockoutSeconds.value = 30;
      errorMessage.value = `5 marta xato kiritildi! ${lockoutSeconds.value} soniya kuting...`;
      inputPin.value = '';
      if (lockoutTimer) clearInterval(lockoutTimer);
      lockoutTimer = setInterval(() => {
        lockoutSeconds.value--;
        if (lockoutSeconds.value <= 0) {
          clearInterval(lockoutTimer);
          lockoutTimer = null;
          failedAttempts.value = 0;
          errorMessage.value = '';
        } else {
          errorMessage.value = `5 marta xato kiritildi! ${lockoutSeconds.value} soniya kuting...`;
        }
      }, 1000);
    } else {
      const remaining = 5 - failedAttempts.value;
      errorMessage.value = `PIN-kod noto'g'ri! (${remaining} ta urinish qoldi)`;
      inputPin.value = '';
    }
  }
};

const handleLogout = async () => {
  isLocked.value = false;
  localStorage.removeItem('ubms_is_screen_locked');
  if (lockoutTimer) clearInterval(lockoutTimer);
  lockoutSeconds.value = 0;
  failedAttempts.value = 0;
  await authStore.logout();
  router.push('/login');
};

// Auto-unlock watcher: When typed length matches 4 digits, check immediately
watch(inputPin, (val) => {
  if (!val) return;
  if (val.length >= expectedPinLength.value) {
    tryUnlock();
  }
});

const handleWindowKeyDown = (e: KeyboardEvent) => {
  if (!isLocked.value) return;

  if (e.key === 'Escape') {
    if (showUnlockCard.value && lockoutSeconds.value === 0) {
      showUnlockCard.value = false;
    }
    return;
  }

  if (!showUnlockCard.value) {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown' || (e.key >= '0' && e.key <= '9')) {
      e.preventDefault();
      openUnlockPanel();
      if (e.key >= '0' && e.key <= '9') {
        appendDigit(e.key);
      }
    }
  } else {
    // Prevent default browser double handling
    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault();
      appendDigit(e.key);
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      clearDigit();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      tryUnlock();
    }
  }
};

watch(isLocked, (locked) => {
  if (locked) {
    checkDarkMode();
    showUnlockCard.value = false;
    inputPin.value = '';
    errorMessage.value = '';
    isSuccess.value = false;
  }
});

onMounted(() => {
  checkDarkMode();
  updateClock();
  clockTimer = setInterval(updateClock, 1000);
  initLockListeners();
  window.addEventListener('keydown', handleWindowKeyDown);
});

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer);
  if (lockoutTimer) clearInterval(lockoutTimer);
  destroyLockListeners();
  window.removeEventListener('keydown', handleWindowKeyDown);
});
</script>

<style scoped>
.lock-fade-enter-active,
.lock-fade-leave-active {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.lock-fade-enter-from,
.lock-fade-leave-to {
  opacity: 0;
  transform: scale(1.02);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-slide-up {
  animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-8px); }
  40%, 80% { transform: translateX(8px); }
}

.animate-shake {
  animation: shake 0.35s ease-in-out;
}
</style>
