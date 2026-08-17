<template>
  <div ref="containerRef" class="relative inline-block text-left select-none">
    <!-- Trigger Button -->
    <button
      ref="triggerRef"
      type="button"
      @click="toggleDropdown"
      class="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all duration-150 focus:outline-none cursor-pointer shadow-2xs"
      :class="[
        isOpen
          ? 'border-emerald-500 bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20 shadow-sm'
          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:border-slate-400 dark:hover:border-slate-600'
      ]"
    >
      <Clock class="w-3.5 h-3.5 text-emerald-500" />
      <span class="tracking-wider">{{ modelValue || '21:00' }}</span>
      <ChevronDown
        class="w-3.5 h-3.5 text-slate-400 transition-transform duration-200"
        :class="{ 'rotate-180 text-emerald-500': isOpen }"
      />
    </button>

    <!-- Dropdown Popover Teleported to Body to completely avoid card clipping -->
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
          class="w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 shadow-2xl space-y-3 text-xs"
          :class="isDropUp ? 'origin-bottom-right' : 'origin-top-right'"
        >
          <!-- Header -->
          <div class="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div class="flex items-center gap-1.5 text-slate-900 dark:text-white font-black text-xs">
              <Clock class="w-4 h-4 text-emerald-500" />
              <span>Vaqtni tanlang</span>
            </div>
            <div class="px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono font-black text-xs">
              {{ currentHour }}:{{ currentMinute }}
            </div>
          </div>

          <!-- Presets -->
          <div class="space-y-1.5">
            <span class="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Tezkor tanlov</span>
            <div class="grid grid-cols-4 gap-1">
              <button
                v-for="preset in presets"
                :key="preset"
                type="button"
                @click="selectTime(preset)"
                class="px-1.5 py-1 rounded-lg text-[11px] font-mono font-bold transition text-center cursor-pointer"
                :class="modelValue === preset
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'"
              >
                {{ preset }}
              </button>
            </div>
          </div>

          <!-- Custom Roller / Two Columns (Soat & Daqiqa) -->
          <div class="pt-1.5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
            <!-- Hours -->
            <div class="space-y-1">
              <span class="text-[10px] uppercase font-bold tracking-wider text-slate-400 text-center block">Soat</span>
              <div
                ref="hoursContainerRef"
                class="h-28 overflow-y-auto pr-1 space-y-1 rounded-xl bg-slate-50 dark:bg-slate-800/80 p-1 custom-scrollbar border border-slate-100 dark:border-slate-800"
              >
                <button
                  v-for="h in hours"
                  :key="h"
                  type="button"
                  @click="setHour(h)"
                  class="w-full py-1 rounded-lg text-xs font-mono font-bold transition text-center cursor-pointer"
                  :class="currentHour === h
                    ? 'bg-emerald-500 text-white shadow-xs active-time-item'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700'"
                >
                  {{ h }}
                </button>
              </div>
            </div>

            <!-- Minutes -->
            <div class="space-y-1">
              <span class="text-[10px] uppercase font-bold tracking-wider text-slate-400 text-center block">Daqiqa</span>
              <div
                ref="minutesContainerRef"
                class="h-28 overflow-y-auto pr-1 space-y-1 rounded-xl bg-slate-50 dark:bg-slate-800/80 p-1 custom-scrollbar border border-slate-100 dark:border-slate-800"
              >
                <button
                  v-for="m in minutes"
                  :key="m"
                  type="button"
                  @click="setMinute(m)"
                  class="w-full py-1 rounded-lg text-xs font-mono font-bold transition text-center cursor-pointer"
                  :class="currentMinute === m
                    ? 'bg-emerald-500 text-white shadow-xs active-time-item'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700'"
                >
                  {{ m }}
                </button>
              </div>
            </div>
          </div>

          <!-- Footer / Done Button -->
          <div class="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span class="text-[10px] text-slate-500 dark:text-slate-400">Tanlandi: <b class="text-slate-900 dark:text-white font-mono">{{ currentHour }}:{{ currentMinute }}</b></span>
            <button
              type="button"
              @click="closeDropdown"
              class="px-3.5 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold shadow-xs transition cursor-pointer"
            >
              Tayyor
            </button>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { Clock, ChevronDown } from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    modelValue?: string;
  }>(),
  {
    modelValue: '21:00',
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void;
}>();

const isOpen = ref(false);
const isDropUp = ref(false);
const containerRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLElement | null>(null);
const dropdownRef = ref<HTMLElement | null>(null);
const hoursContainerRef = ref<HTMLElement | null>(null);
const minutesContainerRef = ref<HTMLElement | null>(null);
const dropdownStyle = ref<Record<string, string>>({});

const presets = ['18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '00:00', '01:00'];

const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const minutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

const currentHour = computed(() => {
  const parts = (props.modelValue || '21:00').split(':');
  return parts[0] || '21';
});

const currentMinute = computed(() => {
  const parts = (props.modelValue || '21:00').split(':');
  return parts[1] || '00';
});

function updatePosition() {
  if (!triggerRef.value) return;
  const rect = triggerRef.value.getBoundingClientRect();
  const dropdownHeight = dropdownRef.value?.offsetHeight || 310;
  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;

  // Auto-flip: If not enough room below and more room above, drop upwards!
  isDropUp.value = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

  let top: number;
  if (isDropUp.value) {
    top = Math.max(8, rect.top - dropdownHeight - 6);
  } else {
    top = Math.min(window.innerHeight - dropdownHeight - 8, rect.bottom + 6);
  }

  const left = Math.max(12, Math.min(window.innerWidth - 270, rect.right - 256));

  dropdownStyle.value = {
    position: 'fixed',
    top: `${top}px`,
    left: `${left}px`,
    zIndex: '99999',
    maxHeight: 'calc(100vh - 16px)',
  };
}

function scrollToSelected() {
  nextTick(() => {
    if (hoursContainerRef.value) {
      const activeBtn = hoursContainerRef.value.querySelector('.active-time-item') as HTMLElement;
      if (activeBtn) {
        hoursContainerRef.value.scrollTop = activeBtn.offsetTop - hoursContainerRef.value.offsetTop - 24;
      }
    }
    if (minutesContainerRef.value) {
      const activeBtn = minutesContainerRef.value.querySelector('.active-time-item') as HTMLElement;
      if (activeBtn) {
        minutesContainerRef.value.scrollTop = activeBtn.offsetTop - minutesContainerRef.value.offsetTop - 24;
      }
    }
  });
}

async function toggleDropdown() {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    await nextTick();
    updatePosition();
    scrollToSelected();
  }
}

function closeDropdown() {
  isOpen.value = false;
}

function selectTime(val: string) {
  emit('update:modelValue', val);
  isOpen.value = false;
}

function setHour(h: string) {
  emit('update:modelValue', `${h}:${currentMinute.value}`);
}

function setMinute(m: string) {
  emit('update:modelValue', `${currentHour.value}:${m}`);
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as Node;
  if (
    containerRef.value &&
    !containerRef.value.contains(target) &&
    dropdownRef.value &&
    !dropdownRef.value.contains(target)
  ) {
    isOpen.value = false;
  }
}

function handleScrollOrResize() {
  if (isOpen.value) {
    updatePosition();
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('scroll', handleScrollOrResize, true);
  window.addEventListener('resize', handleScrollOrResize);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('scroll', handleScrollOrResize, true);
  window.removeEventListener('resize', handleScrollOrResize);
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.4);
  border-radius: 4px;
}
</style>
