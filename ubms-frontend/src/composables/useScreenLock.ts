import { ref, computed, watch } from 'vue';
import { usePosSettings } from './usePosSettings';

const isLocked = ref<boolean>(localStorage.getItem('ubms_is_screen_locked') === 'true');

let autoLockTimer: any = null;
let lastActivityTime = Date.now();
let debounceSaveTimer: any = null;

export function useScreenLock() {
  const { posSettings, saveSettings } = usePosSettings();

  const pinCode = computed({
    get: () => posSettings.value.screenLockPin || localStorage.getItem('ubms_screen_lock_pin') || '1234',
    set: (val: string) => {
      const clean = val.trim();
      posSettings.value.screenLockPin = clean;
      localStorage.setItem('ubms_screen_lock_pin', clean);
      scheduleSaveSettings();
    },
  });

  const autoLockMinutes = computed({
    get: () => posSettings.value.autoLockMinutes ?? Number(localStorage.getItem('ubms_auto_lock_minutes')) ?? 0,
    set: (val: number) => {
      posSettings.value.autoLockMinutes = val;
      localStorage.setItem('ubms_auto_lock_minutes', String(val));
      resetActivityTimer();
      scheduleSaveSettings();
    },
  });

  const employeePins = computed(() => {
    return posSettings.value.employeePins || {};
  });

  const scheduleSaveSettings = () => {
    if (debounceSaveTimer) clearTimeout(debounceSaveTimer);
    debounceSaveTimer = setTimeout(() => {
      saveSettings().catch((e) => console.error('Failed to sync screen lock PIN settings to DB:', e));
    }, 300);
  };

  const lockScreen = () => {
    isLocked.value = true;
    localStorage.setItem('ubms_is_screen_locked', 'true');
  };

  const unlockScreen = (inputPinOrPassword: string, userPhone?: string): boolean => {
    const cleanInput = inputPinOrPassword.trim();
    const storedPin = (posSettings.value.screenLockPin || localStorage.getItem('ubms_screen_lock_pin') || '1234').trim();

    // 1. Check Owner/Primary Account PIN or account phone fallback
    if (cleanInput === storedPin || (userPhone && cleanInput === userPhone.trim())) {
      isLocked.value = false;
      localStorage.removeItem('ubms_is_screen_locked');
      resetActivityTimer();
      return true;
    }

    // 2. Check Individual Employee PINs
    const pinsMap = posSettings.value.employeePins || {};
    const pins = Object.values(pinsMap);
    if (pins.includes(cleanInput)) {
      isLocked.value = false;
      localStorage.removeItem('ubms_is_screen_locked');
      resetActivityTimer();
      return true;
    }

    return false;
  };

  const setPinCode = (newPin: string) => {
    const clean = newPin.trim();
    posSettings.value.screenLockPin = clean;
    localStorage.setItem('ubms_screen_lock_pin', clean);
    scheduleSaveSettings();
  };

  const setEmployeePin = (employeeIdOrPhone: string, newPin: string) => {
    const cleanPin = newPin.trim();
    const current = { ...(posSettings.value.employeePins || {}) };
    if (cleanPin) {
      current[employeeIdOrPhone] = cleanPin;
    } else {
      delete current[employeeIdOrPhone];
    }
    posSettings.value.employeePins = current;
    scheduleSaveSettings();
  };

  const getEmployeePin = (employeeIdOrPhone: string): string => {
    const current = posSettings.value.employeePins || {};
    return current[employeeIdOrPhone] || '';
  };

  const setAutoLockMinutes = (minutes: number) => {
    posSettings.value.autoLockMinutes = minutes;
    localStorage.setItem('ubms_auto_lock_minutes', String(minutes));
    resetActivityTimer();
    scheduleSaveSettings();
  };

  const resetActivityTimer = () => {
    lastActivityTime = Date.now();
    if (autoLockTimer) {
      clearInterval(autoLockTimer);
      autoLockTimer = null;
    }

    const mins = posSettings.value.autoLockMinutes ?? Number(localStorage.getItem('ubms_auto_lock_minutes')) ?? 0;
    if (mins > 0) {
      autoLockTimer = setInterval(() => {
        if (!isLocked.value && (posSettings.value.autoLockMinutes || 0) > 0) {
          const idleTimeMs = Date.now() - lastActivityTime;
          if (idleTimeMs >= (posSettings.value.autoLockMinutes || 0) * 60 * 1000) {
            lockScreen();
          }
        }
      }, 10000); // Check every 10 sec
    }
  };

  const handleGlobalKeyDown = (e: KeyboardEvent) => {
    // Ctrl + L or Cmd + L shortcut to lock screen
    if ((e.ctrlKey || e.metaKey) && (e.key === 'l' || e.key === 'L')) {
      e.preventDefault();
      lockScreen();
    }
  };

  const handleUserActivity = () => {
    lastActivityTime = Date.now();
  };

  const initLockListeners = () => {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleGlobalKeyDown);
      window.addEventListener('mousemove', handleUserActivity);
      window.addEventListener('click', handleUserActivity);
      resetActivityTimer();
    }
  };

  const destroyLockListeners = () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      if (autoLockTimer) clearInterval(autoLockTimer);
    }
  };

  return {
    isLocked,
    pinCode,
    autoLockMinutes,
    employeePins,
    lockScreen,
    unlockScreen,
    setPinCode,
    setEmployeePin,
    getEmployeePin,
    setAutoLockMinutes,
    initLockListeners,
    destroyLockListeners,
  };
}
