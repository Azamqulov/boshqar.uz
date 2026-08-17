<template>
  <div ref="containerRef" class="relative select-none w-full">
    <!-- Trigger Display Input/Button -->
    <button
      ref="triggerRef"
      type="button"
      :disabled="disabled"
      @click="toggleDropdown"
      class="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all duration-150 focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      :class="[
        isOpen
          ? 'border-emerald-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white ring-2 ring-emerald-500/20 shadow-xs'
          : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white hover:border-slate-300 dark:hover:border-slate-600',
        inputClass,
      ]"
    >
      <div class="flex items-center gap-2 truncate">
        <Calendar class="w-4 h-4 text-emerald-500 shrink-0" />
        <span class="truncate font-semibold tracking-wide">
          {{ formattedDisplayDate || placeholder || "Sanani tanlang" }}
        </span>
      </div>
      <ChevronDown
        class="w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200"
        :class="{ 'rotate-180 text-emerald-500': isOpen }"
      />
    </button>

    <!-- Teleported Uzbek Custom Calendar Popover -->
    <Teleport to="body">
      <transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <div
          v-if="isOpen"
          ref="dropdownRef"
          :style="dropdownStyle"
          class="w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 shadow-2xl space-y-2.5 text-xs select-none z-[99999]"
        >
          <!-- Calendar Header: Month & Year Navigator -->
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <button
              type="button"
              @click.stop="prevMonth"
              class="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
              title="Oldingi oy"
            >
              <ChevronLeft class="w-4 h-4" />
            </button>

            <div class="flex items-center gap-1 font-black text-slate-900 dark:text-white text-xs">
              <span>{{ UZ_MONTHS[viewMonth] }}</span>
              <span>{{ viewYear }}</span>
            </div>

            <button
              type="button"
              @click.stop="nextMonth"
              class="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
              title="Keyingi oy"
            >
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>

          <!-- Weekday Column Headers (Uzbek) -->
          <div class="grid grid-cols-7 gap-0.5 text-center font-bold text-[10px] text-slate-400 uppercase tracking-wider">
            <span v-for="wd in UZ_WEEKDAYS" :key="wd">{{ wd }}</span>
          </div>

          <!-- Calendar Days Grid (Compact) -->
          <div class="grid grid-cols-7 gap-0.5 text-center">
            <button
              v-for="cell in calendarCells"
              :key="cell.dateString"
              type="button"
              @click.stop="selectDate(cell.dateString)"
              :disabled="isCellDisabled(cell)"
              :class="[
                'w-7 h-7 mx-auto rounded-lg flex items-center justify-center text-[11px] font-bold transition-all duration-150 cursor-pointer',
                cell.isSelected
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/30 font-black'
                  : cell.isCurrentMonth
                    ? cell.isToday
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-black ring-1 ring-emerald-500/40'
                      : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    : 'text-slate-300 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/40',
                isCellDisabled(cell) ? 'opacity-30 cursor-not-allowed' : '',
              ]"
            >
              {{ cell.dayNumber }}
            </button>
          </div>

          <!-- Bottom Footer -->
          <div class="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
            <button
              type="button"
              @click.stop="selectToday"
              class="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              Bugun
            </button>
            <button
              type="button"
              @click.stop="isOpen = false"
              class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition cursor-pointer"
            >
              Yopish
            </button>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-vue-next';

interface Props {
  modelValue?: string; // Format: 'YYYY-MM-DD'
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  disabled?: boolean;
  inputClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Sanani tanlang',
  disabled: false,
  inputClass: '',
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'change', value: string): void;
}>();

const UZ_MONTHS = [
  'Yanvar',
  'Fevral',
  'Mart',
  'Aprel',
  'May',
  'Iyun',
  'Iyul',
  'Avgust',
  'Sentyabr',
  'Oktyabr',
  'Noyabr',
  'Dekabr',
];

const UZ_WEEKDAYS = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sha', 'Ya'];

const containerRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLButtonElement | null>(null);
const dropdownRef = ref<HTMLElement | null>(null);

const isOpen = ref(false);
const dropdownStyle = ref<Record<string, string>>({});

// Calendar Navigation State
const viewYear = ref(new Date().getFullYear());
const viewMonth = ref(new Date().getMonth()); // 0-11

const initViewFromModel = () => {
  if (props.modelValue && /^\d{4}-\d{2}-\d{2}$/.test(props.modelValue)) {
    const [y, m] = props.modelValue.split('-').map(Number);
    viewYear.value = y;
    viewMonth.value = m - 1;
  } else {
    const today = new Date();
    viewYear.value = today.getFullYear();
    viewMonth.value = today.getMonth();
  }
};

watch(() => props.modelValue, () => {
  initViewFromModel();
}, { immediate: true });

// Formatted Display String
const formattedDisplayDate = computed(() => {
  if (!props.modelValue || !/^\d{4}-\d{2}-\d{2}$/.test(props.modelValue)) {
    return '';
  }
  const [y, m, d] = props.modelValue.split('-').map(Number);
  const monthName = UZ_MONTHS[m - 1] || '';
  return `${d} ${monthName}, ${y}`;
});

// Calendar grid cells generation
interface CalendarCell {
  dayNumber: number;
  dateString: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

const calendarCells = computed<CalendarCell[]>(() => {
  const cells: CalendarCell[] = [];
  const y = viewYear.value;
  const m = viewMonth.value;

  const todayStr = new Date().toISOString().split('T')[0];
  const selectedStr = props.modelValue || '';

  // 1st day of month (0 = Sun, 1 = Mon, ..., 6 = Sat)
  const firstDay = new Date(y, m, 1).getDay();
  // Adjust so Monday is 0 and Sunday is 6
  const startDay = firstDay === 0 ? 6 : firstDay - 1;

  // Days in current month
  const daysInCurrentMonth = new Date(y, m + 1, 0).getDate();
  // Days in previous month
  const daysInPrevMonth = new Date(y, m, 0).getDate();

  // Previous month trailing days
  for (let i = startDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const prevM = m === 0 ? 11 : m - 1;
    const prevY = m === 0 ? y - 1 : y;
    const dateStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cells.push({
      dayNumber: day,
      dateString: dateStr,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isSelected: dateStr === selectedStr,
    });
  }

  // Current month days
  for (let day = 1; day <= daysInCurrentMonth; day++) {
    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cells.push({
      dayNumber: day,
      dateString: dateStr,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      isSelected: dateStr === selectedStr,
    });
  }

  // Next month leading days (fill up to 35 or 42 cells)
  const remaining = (7 - (cells.length % 7)) % 7;
  for (let day = 1; day <= remaining; day++) {
    const nextM = m === 11 ? 0 : m + 1;
    const nextY = m === 11 ? y + 1 : y;
    const dateStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cells.push({
      dayNumber: day,
      dateString: dateStr,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isSelected: dateStr === selectedStr,
    });
  }

  return cells;
});

const isCellDisabled = (cell: CalendarCell) => {
  if (props.minDate && cell.dateString < props.minDate) return true;
  if (props.maxDate && cell.dateString > props.maxDate) return true;
  return false;
};

// Navigation
const prevMonth = () => {
  if (viewMonth.value === 0) {
    viewMonth.value = 11;
    viewYear.value -= 1;
  } else {
    viewMonth.value -= 1;
  }
};

const nextMonth = () => {
  if (viewMonth.value === 11) {
    viewMonth.value = 0;
    viewYear.value += 1;
  } else {
    viewMonth.value += 1;
  }
};

// Selection
const selectDate = (dateStr: string) => {
  emit('update:modelValue', dateStr);
  emit('change', dateStr);
  isOpen.value = false;
};

const selectToday = () => {
  const todayStr = new Date().toISOString().split('T')[0];
  selectDate(todayStr);
};

// Precise Viewport-Aware Positioning with Auto-Clamp
const updatePosition = () => {
  if (!triggerRef.value) return;
  const rect = triggerRef.value.getBoundingClientRect();
  const popoverHeight = 235;
  const popoverWidth = 256; // 16rem = 256px

  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;
  const shouldDropUp = spaceBelow < popoverHeight && spaceAbove > spaceBelow;

  let top = shouldDropUp ? rect.top - popoverHeight - 6 : rect.bottom + 6;

  // Clamping to screen boundaries
  if (top + popoverHeight > window.innerHeight - 12) {
    top = window.innerHeight - popoverHeight - 12;
  }
  if (top < 12) top = 12;

  let left = rect.left;
  if (left + popoverWidth > window.innerWidth - 16) {
    left = window.innerWidth - popoverWidth - 16;
  }
  if (left < 16) left = 16;

  dropdownStyle.value = {
    position: 'fixed',
    top: `${top}px`,
    left: `${left}px`,
  };
};

const toggleDropdown = () => {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    initViewFromModel();
    nextTick(() => {
      updatePosition();
    });
  }
};

// Click outside and scroll listener
const handleClickOutside = (e: MouseEvent) => {
  if (!isOpen.value) return;
  const target = e.target as Node;
  if (
    containerRef.value?.contains(target) ||
    dropdownRef.value?.contains(target)
  ) {
    return;
  }
  isOpen.value = false;
};

const handleScrollOrResize = () => {
  if (isOpen.value) {
    updatePosition();
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('resize', handleScrollOrResize);
  window.addEventListener('scroll', handleScrollOrResize, true);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('resize', handleScrollOrResize);
  window.removeEventListener('scroll', handleScrollOrResize, true);
});
</script>
