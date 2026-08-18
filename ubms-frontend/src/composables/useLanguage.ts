import { ref } from 'vue';

export type ScriptMode = 'latin' | 'cyrillic';

const STORAGE_KEY = 'ubms_script_mode';

// Default va qat'iy standart — Lotin O'zbek tili
const savedScript = 'latin';
const scriptMode = ref<ScriptMode>(savedScript);

// Safe cleanup if localStorage has old cyrillic setting
if (typeof window !== 'undefined') {
  try {
    if (localStorage.getItem(STORAGE_KEY) === 'cyrillic') {
      localStorage.setItem(STORAGE_KEY, 'latin');
    }
  } catch (e) {}
}

/**
 * Lotin → Kirill utility (only for explicit manual conversions if needed)
 */
export const latinToCyrillic = (text: string): string => {
  return text; // Keep clean latin by default
};

/**
 * Kirill → Lotin utility
 */
export const cyrillicToLatin = (text: string): string => {
  return text;
};

export const startDOMObserver = () => {
  // DOM transliterator is disabled to prevent layout breaking
};

export const stopDOMObserver = () => {
  // No-op
};

export const applyGlobalScript = (mode: ScriptMode = 'latin') => {
  scriptMode.value = 'latin';
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, 'latin');
  }
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-script', 'latin');
  }
};

export const useLanguage = () => {
  const setScript = (_mode: ScriptMode) => {
    applyGlobalScript('latin');
  };

  const toggleScript = () => {
    applyGlobalScript('latin');
  };

  return {
    scriptMode,
    setScript,
    toggleScript,
    latinToCyrillic,
    cyrillicToLatin,
  };
};
