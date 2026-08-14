import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export type ViewMode = 'table' | 'grid';

/**
 * Persists table / grid view mode across page refreshes (F5)
 * using URL query param (?view=...) and localStorage fallback.
 */
export function usePersistentViewMode(
  storageKey: string,
  defaultMode: ViewMode = 'table'
) {
  const route = useRoute();
  const router = useRouter();

  const getInitialViewMode = (): ViewMode => {
    // 1. URL Query parameter (?view=table | ?view=grid)
    const urlView = route.query.view as string;
    if (urlView === 'table' || urlView === 'grid') {
      return urlView;
    }

    // 2. LocalStorage fallback
    try {
      const stored = localStorage.getItem(`ubms_view_${storageKey}`);
      if (stored === 'table' || stored === 'grid') {
        return stored;
      }
    } catch (e) {}

    return defaultMode;
  };

  const viewMode = ref<ViewMode>(getInitialViewMode());

  watch(
    () => viewMode.value,
    (newMode) => {
      try {
        localStorage.setItem(`ubms_view_${storageKey}`, newMode);
      } catch (e) {}

      if (route.query.view !== newMode) {
        router.replace({
          query: {
            ...route.query,
            view: newMode,
          },
        }).catch(() => {});
      }
    }
  );

  // Sync if browser back/forward buttons are used
  watch(
    () => route.query.view,
    (urlView) => {
      if ((urlView === 'table' || urlView === 'grid') && urlView !== viewMode.value) {
        viewMode.value = urlView;
      }
    }
  );

  return viewMode;
}
