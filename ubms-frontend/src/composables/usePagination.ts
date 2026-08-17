import { ref, computed, watch, Ref } from 'vue';

export interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  pageSizeOptions?: number[];
  storageKey?: string;
}

const GLOBAL_STORAGE_KEY = 'boshqar_page_size';
export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100];

function getStoredPageSize(key: string, defaultSize: number, allowedOptions: number[]): number {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed > 0) {
        if (allowedOptions.includes(parsed)) {
          return parsed;
        }
        return parsed;
      }
    }
  } catch {
    // localStorage not accessible
  }
  return defaultSize;
}

function savePageSize(key: string, size: number): void {
  try {
    localStorage.setItem(key, String(size));
  } catch {
    // localStorage not accessible
  }
}

export function usePagination<T>(
  items: Ref<T[]> | (() => T[]),
  options: UsePaginationOptions = {}
) {
  const storageKey = options.storageKey || GLOBAL_STORAGE_KEY;
  const pageSizeOptions = options.pageSizeOptions || DEFAULT_PAGE_SIZE_OPTIONS;
  const defaultPageSize = options.initialPageSize || 20;

  const initialSize = getStoredPageSize(storageKey, defaultPageSize, pageSizeOptions);

  const currentPage = ref(options.initialPage || 1);
  const pageSize = ref(initialSize);

  // Watch and persist pageSize to localStorage
  watch(pageSize, (newSize) => {
    if (newSize > 0) {
      savePageSize(storageKey, newSize);
    }
  });

  const rawItems = computed<T[]>(() => {
    if (typeof items === 'function') {
      return items() || [];
    }
    return items.value || [];
  });

  const totalItems = computed(() => rawItems.value.length);

  const totalPages = computed(() => {
    return Math.max(1, Math.ceil(totalItems.value / (pageSize.value || 20)));
  });

  // Automatically ensure currentPage stays within valid bounds
  watch(
    [totalItems, pageSize],
    () => {
      if (currentPage.value > totalPages.value) {
        currentPage.value = totalPages.value;
      }
      if (currentPage.value < 1) {
        currentPage.value = 1;
      }
    },
    { immediate: true }
  );

  const paginatedItems = computed(() => {
    if (totalItems.value === 0) return [];
    const size = pageSize.value || 20;
    const start = (currentPage.value - 1) * size;
    return rawItems.value.slice(start, start + size);
  });

  const startIndex = computed(() => {
    if (totalItems.value === 0) return 0;
    const size = pageSize.value || 20;
    return (currentPage.value - 1) * size + 1;
  });

  const endIndex = computed(() => {
    if (totalItems.value === 0) return 0;
    const size = pageSize.value || 20;
    return Math.min(currentPage.value * size, totalItems.value);
  });

  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++;
    }
  };

  const prevPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--;
    }
  };

  const setPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
    }
  };

  const setPageSize = (size: number) => {
    pageSize.value = size;
    savePageSize(storageKey, size);
    currentPage.value = 1;
  };

  const resetPage = () => {
    currentPage.value = 1;
  };

  return {
    currentPage,
    pageSize,
    pageSizeOptions,
    totalItems,
    totalPages,
    paginatedItems,
    startIndex,
    endIndex,
    nextPage,
    prevPage,
    setPage,
    setPageSize,
    resetPage,
  };
}
