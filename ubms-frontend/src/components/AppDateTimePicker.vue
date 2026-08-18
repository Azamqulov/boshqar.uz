<template>
  <div ref="containerRef" class="relative select-none w-full">
    <!-- Trigger Button -->
    <button
      ref="triggerRef"
      type="button"
      :disabled="disabled"
      @click="toggleDropdown"
      class="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all duration-150 focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      :class="[
        isOpen
          ? 'border-emerald-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white ring-2 ring-emerald-500/20 shadow-sm'
          : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white hover:border-slate-400 dark:hover:border-slate-600',
        inputClass,
      ]"
    >
      <div class="flex items-center gap-2.5 truncate">
        <Calendar class="w-4 h-4 text-emerald-500 shrink-0" />
        <span class="truncate font-bold tracking-wide">
          {{ formattedDisplay || placeholder || "Sana va vaqtni tanlang" }}
        </span>
      </div>
      <div class="flex items-center gap-1.5 shrink-0 text-slate-400">
        <Clock class="w-3.5 h-3.5 text-emerald-500" />
        <ChevronDown
          class="w-3.5 h-3.5 transition-transform duration-200"
          :class="{ 'rotate-180 text-emerald-500': isOpen }"
        />
      </div>
    </button>

    <!-- Custom Uzbek DateTime Popover (Teleported) -->
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
          class="w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 shadow-2xl space-y-3 text-xs select-none z-[99999]"
        >
          <!-- Quick Action Buttons -->
          <div class="grid grid-cols-3 gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            <button
              type="button"
              @click="setNow"
              class="py-1 px-2 rounded-lg text-[11px] font-bold bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 hover:text-slate-950 transition flex items-center justify-center gap-1"
            >
              <Zap class="w-3 h-3" />
              <span>Hozirgi vaqt</span>
            </button>
            <button
              type="button"
              @click="setQuickDay(0)"
              class="py-1 px-2 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              Bugun
            </button>
            <button
              type="button"
              @click="setQuickDay(1)"
              class="py-1 px-2 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              Ertaga
            </button>
          </div>

          <!-- Calendar Header: Month & Year Navigator -->
          <div class="flex items-center justify-between">
            <button
              type="button"
              @click.stop="prevMonth"
              class="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition"
              title="Oldingi oy"
            >
              <ChevronLeft class="w-4 h-4" />
            </button>

            <div class="font-black text-slate-900 dark:text-white text-xs">
              {{ UZ_MONTHS[viewMonth] }} {{ viewYear }}
            </div>

            <button
              type="button"
              @click.stop="nextMonth"
              class="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition"
              title="Keyingi oy"
            >
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>

          <!-- Weekday Column Headers -->
          <div class="grid grid-cols-7 gap-0.5 text-center font-bold text-[10px] text-slate-400 uppercase tracking-wider">
            <span v-for="wd in UZ_WEEKDAYS" :key="wd">{{ wd }}</span>
          </div>

          <!-- Calendar Days Grid -->
          <div class="grid grid-cols-7 gap-0.5 text-center">
            <button
              v-for="cell in calendarCells"
              :key="cell.dateString"
              type="button"
              @click.stop="selectDate(cell.dateString)"
              :class="[
                'w-7 h-7 mx-auto rounded-lg flex items-center justify-center text-[11px] font-bold transition duration-150',
                cell.isSelected
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                  : cell.isCurrentMonth
                    ? cell.isToday
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-black ring-1 ring-emerald-500/40'
                      : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    : 'text-slate-300 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/40',
              ]"
            >
              {{ cell.dayNumber }}
            </button>
          </div>

          <!-- Time Slot Selection Grid -->
          <div class="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div class="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
              <span class="flex items-center gap-1">
                <Clock class="w-3.5 h-3.5 text-emerald-500" />
                <span>Vaqt:</span>
              </span>
              <span class="font-mono text-emerald-600 dark:text-emerald-400 font-black">{{ selectedTime }}</span>
            </div>

            <div class="grid grid-cols-4 gap-1 max-h-24 overflow-y-auto p-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
              <button
                v-for="slot in timeSlots"
                :key="slot"
                type="button"
                @click.stop="selectTime(slot)"
                class="py-1 px-1.5 rounded-lg text-[10px] font-mono font-bold transition text-center border"
                :class="selectedTime === slot
                  ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500/50'"
              >
                {{ slot }}
              </button>
            </div>
          </div>

          <!-- Confirm Button -->
          <div class="pt-1">
            <button
              type="button"
              @click="confirmSelection"
              class="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-md shadow-emerald-500/20"
            >
              Tanlashni Tasdiqlash
            </button>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { Calendar, Clock, ChevronDown, ChevronLeft, ChevronRight, Zap } from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    modelValue?: string | Date;
    placeholder?: string;
    disabled?: boolean;
    inputClass?: string;
  }>(),
  {
    modelValue: '',
    placeholder: 'Sana va vaqtni tanlang',
    disabled: false,
    inputClass: '',
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void;
}>();

const UZ_MONTHS = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
];

const UZ_WEEKDAYS = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'
];

const isOpen = ref(false);
const containerRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLElement | null>(null);
const dropdownRef = ref<HTMLElement | null>(null);

const dropdownStyle = ref<Record<string, string>>({
  position: 'fixed',
  top: '0px',
  left: '0px',
});

const today = new Date();
const viewYear = ref(today.getFullYear());
const viewMonth = ref(today.getMonth());

const selectedDateStr = ref(today.toISOString().split('T')[0]);
const selectedTime = ref('11:00');

const parseInput = (val: string | Date | undefined) => {
  if (!val) {
    const d = new Date();
    selectedDateStr.value = d.toISOString().split('T')[0];
    viewYear.value = d.getFullYear();
    viewMonth.value = d.getMonth();
    const h = String(d.getHours()).padStart(2, '0');
    const m = d.getMinutes() < 30 ? '00' : '30';
    selectedTime.value = `${h}:${m}`;
    return;
  }
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return;
    selectedDateStr.value = d.toISOString().split('T')[0];
    viewYear.value = d.getFullYear();
    viewMonth.value = d.getMonth();
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    selectedTime.value = `${h}:${m}`;
  } catch (e) {
    // fallback
  }
};

watch(() => props.modelValue, (val) => {
  if (val) parseInput(val);
}, { immediate: true });

const formattedDisplay = computed(() => {
  if (!selectedDateStr.value) return '';
  const [y, m, d] = selectedDateStr.value.split('-');
  const monthName = UZ_MONTHS[Number(m) - 1] || '';
  return `${Number(d)}-${monthName} ${y}, ${selectedTime.value}`;
});

const updateDropdownPosition = () => {
  if (!triggerRef.value) return;
  const rect = triggerRef.value.getBoundingClientRect();
  const popoverWidth = 320;
  const popoverHeight = 360;

  let left = rect.left;
  if (left + popoverWidth > window.innerWidth - 10) {
    left = window.innerWidth - popoverWidth - 10;
  }
  if (left < 10) left = 10;

  let top = rect.bottom + 6;
  if (top + popoverHeight > window.innerHeight - 10) {
    top = rect.top - popoverHeight - 6;
  }

  dropdownStyle.value = {
    position: 'fixed',
    top: `${Math.max(10, top)}px`,
    left: `${Math.max(10, left)}px`,
  };
};

const toggleDropdown = async () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    await nextTick();
    updateDropdownPosition();
  }
};

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

const selectDate = (dateStr: string) => {
  selectedDateStr.value = dateStr;
};

const selectTime = (slot: string) => {
  selectedTime.value = slot;
};

const setNow = () => {
  const now = new Date();
  selectedDateStr.value = now.toISOString().split('T')[0];
  viewYear.value = now.getFullYear();
  viewMonth.value = now.getMonth();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  selectedTime.value = `${h}:${m}`;
  confirmSelection();
};

const setQuickDay = (daysAhead: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  selectedDateStr.value = d.toISOString().split('T')[0];
  viewYear.value = d.getFullYear();
  viewMonth.value = d.getMonth();
};

const confirmSelection = () => {
  const [h, m] = selectedTime.value.split(':');
  const [yr, mo, dy] = selectedDateStr.value.split('-');
  const finalDate = new Date(Number(yr), Number(mo) - 1, Number(dy), Number(h), Number(m), 0);
  emit('update:modelValue', finalDate.toISOString());
  isOpen.value = false;
};

// Compute calendar cells
const calendarCells = computed(() => {
  const year = viewYear.value;
  const month = viewMonth.value;

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Uzbek calendar starts on Monday (0: Mon, 6: Sun)
  let firstDayIndex = firstDayOfMonth.getDay() - 1;
  if (firstDayIndex === -1) firstDayIndex = 6;

  const daysInMonth = lastDayOfMonth.getDate();

  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const todayStr = new Date().toISOString().split('T')[0];

  const cells = [];

  // Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const prevM = month === 0 ? 12 : month;
    const prevY = month === 0 ? year - 1 : year;
    const dateString = `${prevY}-${String(prevM).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cells.push({
      dateString,
      dayNumber: day,
      isCurrentMonth: false,
      isToday: dateString === todayStr,
      isSelected: dateString === selectedDateStr.value,
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cells.push({
      dateString,
      dayNumber: day,
      isCurrentMonth: true,
      isToday: dateString === todayStr,
      isSelected: dateString === selectedDateStr.value,
    });
  }

  // Next month leading days to complete 35 or 42 cells
  const remaining = 35 - cells.length > 0 ? 35 - cells.length : (42 - cells.length > 0 ? 42 - cells.length : 0);
  for (let day = 1; day <= remaining; day++) {
    const nextM = month + 2 > 12 ? 1 : month + 2;
    const nextY = month + 2 > 12 ? year + 1 : year;
    const dateString = `${nextY}-${String(nextM).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cells.push({
      dateString,
      dayNumber: day,
      isCurrentMonth: false,
      isToday: dateString === todayStr,
      isSelected: dateString === selectedDateStr.value,
    });
  }

  return cells;
});

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

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('resize', updateDropdownPosition);
  window.addEventListener('scroll', updateDropdownPosition, true);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('resize', updateDropdownPosition);
  window.removeEventListener('scroll', updateDropdownPosition, true);
});
</script>
