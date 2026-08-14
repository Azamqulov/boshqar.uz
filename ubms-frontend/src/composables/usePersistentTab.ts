import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

/**
 * Persists active tab across page refreshes (F5), browser navigation,
 * and session reloads using both URL query parameter (?tab=...) and localStorage fallback.
 */
export function usePersistentTab<T extends string>(
  storageKey: string,
  defaultTab: T,
  validTabs?: readonly T[] | T[]
) {
  const route = useRoute();
  const router = useRouter();

  const isValid = (val: any): val is T => {
    if (!val) return false;
    if (!validTabs || validTabs.length === 0) return true;
    return (validTabs as T[]).includes(val);
  };

  const getInitialTab = (): T => {
    // 1. Priority: URL query param (?tab=...)
    const urlTab = route.query.tab as string;
    if (isValid(urlTab)) {
      return urlTab as T;
    }

    // 2. Fallback: localStorage
    try {
      const stored = localStorage.getItem(`ubms_tab_${storageKey}`);
      if (isValid(stored)) {
        return stored as T;
      }
    } catch (e) {}

    return defaultTab;
  };

  const activeTab = ref<T>(getInitialTab());

  // Watch activeTab changes and sync with URL query and localStorage
  watch(
    () => activeTab.value,
    (newTab) => {
      try {
        localStorage.setItem(`ubms_tab_${storageKey}`, newTab);
      } catch (e) {}

      if (route.query.tab !== newTab) {
        router.replace({
          query: {
            ...route.query,
            tab: newTab,
          },
        });
      }
    },
    { immediate: true }
  );

  // Watch route query changes (browser Back / Forward navigation)
  watch(
    () => route.query.tab,
    (newQueryTab) => {
      if (
        isValid(newQueryTab) &&
        activeTab.value !== newQueryTab
      ) {
        activeTab.value = newQueryTab as T;
      }
    }
  );

  return activeTab;
}
