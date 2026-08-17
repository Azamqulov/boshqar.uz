<template>
  <div
    v-if="totalItems > 0"
    class="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm text-xs select-none transition-all duration-200"
    :class="{ 'mt-4': !inline }"
  >
    <!-- Left Section: Custom Page Size Selector & Showing Counter -->
    <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 sm:gap-3 text-slate-600 dark:text-slate-300 w-full sm:w-auto">
      <!-- Custom Items per page dropdown -->
      <div v-if="showPageSize" ref="dropdownRef" class="relative inline-flex items-center gap-1.5">
        <span class="text-slate-400 dark:text-slate-500 font-medium">Ko'rsatish:</span>
        
        <!-- Custom Dropdown Trigger -->
        <button
          type="button"
          @click="toggleDropdown"
          class="flex items-center gap-1.5 pl-3 pr-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all duration-150 focus:outline-none btn-interactive"
          :class="
            isDropdownOpen
              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
              : 'border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-white text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700/80 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 shadow-2xs'
          "
          title="Sahifadagi qatorlar sonini tanlash"
        >
          <span class="font-mono">{{ pageSize }} ta</span>
          <ChevronDown
            class="w-3.5 h-3.5 text-slate-400 dark:text-slate-400 transition-transform duration-200"
            :class="{ 'rotate-180 text-emerald-500': isDropdownOpen }"
          />
        </button>

        <!-- Custom Dropdown Popover (Opens upwards since pagination is at page bottom) -->
        <transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="transform scale-95 opacity-0 translate-y-1"
          enter-to-class="transform scale-100 opacity-100 translate-y-0"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="transform scale-100 opacity-100 translate-y-0"
          leave-to-class="transform scale-95 opacity-0 translate-y-1"
        >
          <div
            v-if="isDropdownOpen"
            class="absolute bottom-full left-0 mb-1.5 z-50 min-w-[110px] p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/90 shadow-xl shadow-slate-900/10 dark:shadow-black/40 backdrop-blur-lg origin-bottom-left flex flex-col gap-0.5"
            @click.stop
          >
            <div class="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 mb-0.5">
              Qatorlar soni
            </div>

            <button
              v-for="opt in sizeOptions"
              :key="opt"
              type="button"
              @click="selectPageSize(opt)"
              class="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all text-left group"
              :class="
                pageSize === opt
                  ? 'bg-emerald-500 text-white shadow-xs shadow-emerald-500/30'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400'
              "
            >
              <span class="font-mono">{{ opt }} ta</span>
              <Check
                v-if="pageSize === opt"
                class="w-3.5 h-3.5 text-white stroke-[2.5]"
              />
            </button>
          </div>
        </transition>
      </div>

      <!-- Range and Total Text -->
      <div v-if="showTotal" class="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
        <span class="hidden md:inline">Jami:</span>
        <span class="font-bold text-slate-800 dark:text-slate-200 font-mono">{{ totalItems }}</span>
        <span>{{ itemName }}dan</span>
        <span class="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{{ startItem }}–{{ endItem }}</span>
        <span>ko'rsatilmoqda</span>
      </div>
    </div>

    <!-- Right Section: Navigation Controls -->
    <div v-if="totalPages > 1" class="flex items-center justify-center gap-1 w-full sm:w-auto overflow-x-auto py-0.5">
      <!-- First Page Button -->
      <button
        type="button"
        @click="goToPage(1)"
        :disabled="currentPage === 1"
        title="Birinchi sahifa"
        class="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition shrink-0"
      >
        <ChevronsLeft class="w-3.5 h-3.5" />
      </button>

      <!-- Previous Page Button -->
      <button
        type="button"
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage === 1"
        title="Oldingi sahifa"
        class="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition shrink-0"
      >
        <ChevronLeft class="w-3.5 h-3.5" />
        <span class="hidden xs:inline text-[11px]">Oldingi</span>
      </button>

      <!-- Page Numbers Buttons -->
      <div class="flex items-center gap-1 mx-0.5">
        <template v-for="(item, idx) in visiblePages" :key="idx">
          <!-- Ellipsis -->
          <span
            v-if="item === '...'"
            class="px-1 text-slate-400 dark:text-slate-600 font-bold select-none text-[11px]"
          >
            •••
          </span>

          <!-- Number Button -->
          <button
            v-else
            type="button"
            @click="goToPage(Number(item))"
            class="min-w-[28px] h-7 px-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center justify-center"
            :class="
              currentPage === item
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 scale-105'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700'
            "
          >
            {{ item }}
          </button>
        </template>
      </div>

      <!-- Next Page Button -->
      <button
        type="button"
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        title="Keyingi sahifa"
        class="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition shrink-0"
      >
        <span class="hidden xs:inline text-[11px]">Keyingi</span>
        <ChevronRight class="w-3.5 h-3.5" />
      </button>

      <!-- Last Page Button -->
      <button
        type="button"
        @click="goToPage(totalPages)"
        :disabled="currentPage === totalPages"
        title="Oxirgi sahifa"
        class="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition shrink-0"
      >
        <ChevronsRight class="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  Check,
} from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    currentPage: number;
    pageSize: number;
    totalItems: number;
    pageSizeOptions?: number[];
    showPageSize?: boolean;
    showTotal?: boolean;
    itemName?: string;
    inline?: boolean;
  }>(),
  {
    pageSizeOptions: () => [10, 20, 30, 50, 100],
    showPageSize: true,
    showTotal: true,
    itemName: 'ta',
    inline: false,
  }
);

const emit = defineEmits<{
  (e: 'update:currentPage', page: number): void;
  (e: 'update:pageSize', size: number): void;
  (e: 'change', payload: { page: number; pageSize: number }): void;
}>();

const dropdownRef = ref<HTMLElement | null>(null);
const isDropdownOpen = ref(false);

const sizeOptions = computed(() => props.pageSizeOptions || [10, 20, 30, 50, 100]);

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const closeDropdown = () => {
  isDropdownOpen.value = false;
};

const selectPageSize = (opt: number) => {
  onPageSizeChange(opt);
  closeDropdown();
};

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown();
  }
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isDropdownOpen.value) {
    closeDropdown();
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleKeyDown);
});

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(props.totalItems / props.pageSize));
});

const startItem = computed(() => {
  if (props.totalItems === 0) return 0;
  return (props.currentPage - 1) * props.pageSize + 1;
});

const endItem = computed(() => {
  if (props.totalItems === 0) return 0;
  return Math.min(props.currentPage * props.pageSize, props.totalItems);
});

// Dynamic visible page numbers with smart ellipsis
const visiblePages = computed<(number | string)[]>(() => {
  const total = totalPages.value;
  const current = props.currentPage;

  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | string)[] = [];

  if (current <= 3) {
    pages.push(1, 2, 3, 4, '...', total);
  } else if (current >= total - 2) {
    pages.push(1, '...', total - 3, total - 2, total - 1, total);
  } else {
    pages.push(1, '...', current - 1, current, current + 1, '...', total);
  }

  return pages;
});

const goToPage = (page: number) => {
  const target = Math.max(1, Math.min(page, totalPages.value));
  if (target !== props.currentPage) {
    emit('update:currentPage', target);
    emit('change', { page: target, pageSize: props.pageSize });
  }
};

const onPageSizeChange = (val: string | number) => {
  const newSize = Number(val);
  if (newSize && newSize !== props.pageSize) {
    emit('update:pageSize', newSize);
    emit('update:currentPage', 1);
    emit('change', { page: 1, pageSize: newSize });
  }
};
</script>
