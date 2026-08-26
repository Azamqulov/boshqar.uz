import { ref } from 'vue';

const isLocked = ref<boolean>(localStorage.getItem('ubms_is_screen_locked') === 'true');
const pinCode = ref<string>(localStorage.getItem('ubms_screen_lock_pin') || '1234');
const autoLockMinutes = ref<number>(Number(localStorage.getItem('ubms_auto_lock_minutes')) || 0);

// Storage for employee individual PIN codes: { [employeeIdOrPhone]: pin }
const getEmployeePinsMap = (): Record<string, string> => {
  try {
    const saved = localStorage.getItem('ubms_employee_pins');
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    return {};
  }
};

const employeePins = ref<Record<string, string>>(getEmployeePinsMap());

let autoLockTimer: any = null;
let lastActivityTime = Date.now();

export function useScreenLock() {
  const lockScreen = () => {
    isLocked.value = true;
    localStorage.setItem('ubms_is_screen_locked', 'true');
  };

  const unlockScreen = (inputPinOrPassword: string, userPhone?: string): boolean => {
    const cleanInput = inputPinOrPassword.trim();
    const storedPin = pinCode.value.trim();

    // 1. Check Owner/Primary Account PIN or account phone fallback
    if (cleanInput === storedPin || (userPhone && cleanInput === userPhone.trim())) {
      isLocked.value = false;
      localStorage.removeItem('ubms_is_screen_locked');
      resetActivityTimer();
      return true;
    }

    // 2. Check Individual Employee PINs
    const pins = Object.values(employeePins.value);
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
    pinCode.value = clean;
    localStorage.setItem('ubms_screen_lock_pin', clean);
  };

  const setEmployeePin = (employeeIdOrPhone: string, newPin: string) => {
    const cleanPin = newPin.trim();
    employeePins.value[employeeIdOrPhone] = cleanPin;
    localStorage.setItem('ubms_employee_pins', JSON.stringify(employeePins.value));
  };

  const getEmployeePin = (employeeIdOrPhone: string): string => {
    return employeePins.value[employeeIdOrPhone] || '';
  };

  const setAutoLockMinutes = (minutes: number) => {
    autoLockMinutes.value = minutes;
    localStorage.setItem('ubms_auto_lock_minutes', String(minutes));
    resetActivityTimer();
  };

  const resetActivityTimer = () => {
    lastActivityTime = Date.now();
    if (autoLockTimer) {
      clearInterval(autoLockTimer);
      autoLockTimer = null;
    }

    if (autoLockMinutes.value > 0) {
      autoLockTimer = setInterval(() => {
        if (!isLocked.value && autoLockMinutes.value > 0) {
          const idleTimeMs = Date.now() - lastActivityTime;
          if (idleTimeMs >= autoLockMinutes.value * 60 * 1000) {
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
