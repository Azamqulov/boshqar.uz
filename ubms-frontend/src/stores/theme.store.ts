import { defineStore } from 'pinia';
import { ref } from 'vue';

export type ThemeMode = 'light' | 'dark' | 'system';

export const useThemeStore = defineStore('theme', () => {
  const savedTheme = (localStorage.getItem('ubms_theme') as ThemeMode) || 'light';
  const theme = ref<ThemeMode>(savedTheme);
  const isDark = ref<boolean>(savedTheme === 'dark');

  const applyTheme = (mode: ThemeMode) => {
    theme.value = mode;
    localStorage.setItem('ubms_theme', mode);

    let effectiveDark = false;
    if (mode === 'system') {
      effectiveDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      effectiveDark = mode === 'dark';
    }

    isDark.value = effectiveDark;

    if (effectiveDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  };

  const toggleTheme = () => {
    const nextMode: ThemeMode = isDark.value ? 'light' : 'dark';
    applyTheme(nextMode);
  };

  const initTheme = () => {
    applyTheme(theme.value);

    // Listen for system theme changes if set to system
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (theme.value === 'system') {
        applyTheme('system');
      }
    });
  };

  return {
    theme,
    isDark,
    applyTheme,
    toggleTheme,
    initTheme,
  };
});
