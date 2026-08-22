<template>
  <!-- 1. Custom Searchable / Popover Select Mode -->
  <div
    v-if="searchable"
    ref="containerRef"
    class="relative w-full min-w-0 inline-block select-none"
  >
    <!-- Trigger Button -->
    <button
      type="button"
      @click="toggleDropdown"
      :disabled="disabled"
      class="w-full min-w-0 max-w-full flex items-center justify-between transition-all duration-150 text-left disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none border"
      :class="[
        sizeClasses.trigger,
        isOpen
          ? 'border-emerald-500 bg-white dark:bg-slate-800 shadow-xs ring-2 ring-emerald-500/15'
          : 'border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-50 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700/80 dark:text-slate-100',
        customClass
      ]"
    >
      <div class="flex items-center gap-1.5 truncate flex-1 min-w-0 pr-1">
        <slot name="selected" :option="selectedOption">
          <!-- Color dot if present -->
          <span
            v-if="selectedOption?.color"
            class="w-2 h-2 rounded-full shrink-0"
            :style="{ backgroundColor: selectedOption.color }"
          ></span>

          <!-- Icon if present -->
          <component
            v-if="selectedOption?.icon"
            :is="selectedOption.icon"
            class="w-3.5 h-3.5 text-emerald-500 shrink-0"
          />

          <!-- Label / Placeholder -->
          <span
            class="truncate flex-1 min-w-0"
            :class="!selectedOption ? 'text-slate-400 dark:text-slate-500 font-normal' : 'text-slate-900 dark:text-white font-semibold'"
          >
            {{ selectedOption ? selectedOption.label : (placeholder || 'Tanlang...') }}
          </span>

          <!-- Badge if present -->
          <span
            v-if="selectedOption?.badge"
            class="ml-auto text-[9px] px-1.5 py-0.5 rounded font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0 whitespace-nowrap"
          >
            {{ selectedOption.badge }}
          </span>
        </slot>
      </div>

      <ChevronDown
        class="text-slate-400 transition-transform duration-200 shrink-0 ml-1"
        :class="[
          size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4',
          { 'rotate-180 text-emerald-500': isOpen }
        ]"
      />
    </button>

    <!-- Teleported Floating Dropdown Menu (Never gets clipped by table overflow!) -->
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
          ref="dropdownMenuRef"
          class="fixed z-[999999] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1.5 text-xs shadow-xl max-h-60 flex flex-col"
          :style="dropdownStyle"
        >
          <!-- Search Input -->
          <div class="p-1 border-b border-slate-100 dark:border-slate-800 mb-1">
            <div class="relative">
              <Search class="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
              <input
                ref="searchInputRef"
                v-model="searchTerm"
                type="text"
                placeholder="Qidiruv..."
                class="w-full pl-8 pr-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 border border-slate-200 dark:border-slate-700"
                @keydown.esc="isOpen = false"
              />
            </div>
          </div>

          <!-- Options List -->
          <div class="overflow-y-auto flex-1 space-y-0.5 pr-0.5">
            <!-- Empty State -->
            <div
              v-if="filteredGroupedOptions.length === 0"
              class="py-3 px-2 text-center text-slate-400 dark:text-slate-500 text-[11px]"
            >
              Natija topilmadi
            </div>

            <!-- Grouped / Flat Options -->
            <template v-for="group in filteredGroupedOptions" :key="group.name">
              <!-- Group Header -->
              <div
                v-if="group.name"
                class="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500"
              >
                {{ group.name }}
              </div>

              <!-- Group Items -->
              <button
                v-for="opt in group.items"
                :key="opt.value"
                type="button"
                :disabled="opt.disabled"
                @click="selectOption(opt)"
                class="w-full flex items-center justify-between text-left transition-colors disabled:opacity-40 disabled:cursor-not-allowed group/opt"
                :class="[
                  sizeClasses.item,
                  modelValue === opt.value
                    ? 'bg-emerald-500 text-white font-bold shadow-xs shadow-emerald-500/20'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 font-medium'
                ]"
              >
                <div class="flex items-center gap-1.5 truncate flex-1">
                  <!-- Color dot -->
                  <span
                    v-if="opt.color"
                    class="w-2 h-2 rounded-full shrink-0"
                    :style="{ backgroundColor: opt.color }"
                  ></span>

                  <!-- Icon -->
                  <component
                    v-if="opt.icon"
                    :is="opt.icon"
                    class="w-3.5 h-3.5 shrink-0"
                    :class="modelValue === opt.value ? 'text-white' : 'text-emerald-500'"
                  />

                  <span class="truncate">{{ opt.label }}</span>
                </div>

                <!-- Badge / Checkmark -->
                <div class="flex items-center gap-1 shrink-0 ml-1.5">
                  <span
                    v-if="opt.badge"
                    class="text-[9px] px-1.5 py-0.2 rounded font-bold"
                    :class="modelValue === opt.value ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'"
                  >
                    {{ opt.badge }}
                  </span>

                  <Check
                    v-if="modelValue === opt.value"
                    class="w-3.5 h-3.5 text-white"
                  />
                </div>
              </button>
            </template>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>

  <!-- 2. Non-searchable Mode -->
  <div
    v-else
    ref="containerRef2"
    class="relative w-full inline-block select-none"
  >
    <!-- Trigger Button -->
    <button
      type="button"
      @click="toggleDropdown2"
      :disabled="disabled"
      class="w-full flex items-center justify-between transition-all duration-150 text-left disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none border"
      :class="[
        sizeClasses.trigger,
        isOpen2
          ? 'border-emerald-500 bg-white dark:bg-slate-800 shadow-xs ring-2 ring-emerald-500/15'
          : 'border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-50 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700/80 dark:text-slate-100',
        customClass
      ]"
    >
      <div class="flex items-center gap-1.5 truncate flex-1 pr-1">
        <slot name="selected" :option="selectedOption">
          <span
            v-if="selectedOption?.color"
            class="w-2 h-2 rounded-full shrink-0"
            :style="{ backgroundColor: selectedOption.color }"
          ></span>
          <component
            v-if="selectedOption?.icon"
            :is="selectedOption.icon"
            class="w-3.5 h-3.5 text-emerald-500 shrink-0"
          />
          <span
            class="truncate"
            :class="!selectedOption ? 'text-slate-400 dark:text-slate-500 font-normal' : 'text-slate-900 dark:text-white font-semibold'"
          >
            {{ selectedOption ? selectedOption.label : (placeholder || 'Tanlang...') }}
          </span>
          <span
            v-if="selectedOption?.badge"
            class="ml-auto text-[9px] px-1.5 py-0.5 rounded font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
          >
            {{ selectedOption.badge }}
          </span>
        </slot>
      </div>
      <ChevronDown
        class="text-slate-400 transition-transform duration-200 shrink-0 ml-1"
        :class="[
          size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4',
          { 'rotate-180 text-emerald-500': isOpen2 }
        ]"
      />
    </button>

    <!-- Teleported Non-searchable Dropdown -->
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
          v-if="isOpen2"
          ref="dropdownMenuRef2"
          class="fixed z-[999999] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1 text-xs shadow-xl max-h-60 overflow-y-auto"
          :style="dropdownStyle2"
        >
          <button
            v-for="opt in options"
            :key="opt.value"
            type="button"
            :disabled="opt.disabled"
            @click="selectOption2(opt)"
            class="w-full flex items-center justify-between text-left transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            :class="[
              sizeClasses.item,
              modelValue === opt.value
                ? 'bg-emerald-500 text-white font-bold shadow-xs shadow-emerald-500/20'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 font-medium'
            ]"
          >
            <div class="flex items-center gap-1.5 truncate flex-1">
              <span
                v-if="opt.color"
                class="w-2 h-2 rounded-full shrink-0"
                :style="{ backgroundColor: opt.color }"
              ></span>
              <component
                v-if="opt.icon"
                :is="opt.icon"
                class="w-3.5 h-3.5 shrink-0"
                :class="modelValue === opt.value ? 'text-white' : 'text-emerald-500'"
              />
              <span class="truncate">{{ opt.label }}</span>
            </div>
            <Check v-if="modelValue === opt.value" class="w-3.5 h-3.5 text-white shrink-0 ml-1" />
          </button>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue';
import { ChevronDown, Search, Check } from 'lucide-vue-next';

export interface SelectOption {
  value: any;
  label: string;
  disabled?: boolean;
  group?: string;
  icon?: any;
  badge?: string;
  color?: string;
}

const props = withDefaults(
  defineProps<{
    modelValue?: any;
    options?: SelectOption[];
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    searchable?: boolean;
    size?: 'sm' | 'md' | 'lg';
    customClass?: string;
  }>(),
  {
    options: () => [],
    searchable: false,
    size: 'md',
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', val: any): void;
  (e: 'change', val: any): void;
}>();

const sizeClasses = computed(() => {
  if (props.size === 'sm') {
    return {
      trigger: 'h-[34px] px-2.5 rounded-lg text-xs font-medium',
      item: 'px-2.5 py-1.5 rounded-lg text-xs',
    };
  }
  if (props.size === 'lg') {
    return {
      trigger: 'h-[48px] px-4 rounded-xl text-sm font-medium',
      item: 'px-3 py-2 rounded-lg text-sm',
    };
  }
  return {
    trigger: 'h-[42px] px-3.5 rounded-xl text-xs font-medium',
    item: 'px-2.5 py-1.5 rounded-lg text-xs',
  };
});

// === SEARCHABLE mode state ===
const isOpen = ref(false);
const isDropUp = ref(false);
const searchTerm = ref('');
const containerRef = ref<HTMLElement | null>(null);
const searchInputRef = ref<HTMLInputElement | null>(null);
const dropdownMenuRef = ref<HTMLElement | null>(null);

const triggerRect = ref<{ top: number; left: number; width: number; height: number }>({
  top: 0,
  left: 0,
  width: 140,
  height: 32,
});

// === NON-SEARCHABLE mode state ===
const isOpen2 = ref(false);
const isDropUp2 = ref(false);
const containerRef2 = ref<HTMLElement | null>(null);
const dropdownMenuRef2 = ref<HTMLElement | null>(null);

const triggerRect2 = ref<{ top: number; left: number; width: number; height: number }>({
  top: 0,
  left: 0,
  width: 120,
  height: 32,
});

const calculatePosition = (container: HTMLElement | null, isSecond = false) => {
  if (!container) return;
  const rect = container.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;
  const dropUp = spaceBelow < 220 && spaceAbove > spaceBelow;

  if (isSecond) {
    isDropUp2.value = dropUp;
    triggerRect2.value = {
      top: rect.top,
      left: rect.left,
      width: Math.max(rect.width, 130),
      height: rect.height,
    };
  } else {
    isDropUp.value = dropUp;
    triggerRect.value = {
      top: rect.top,
      left: rect.left,
      width: Math.max(rect.width, 160),
      height: rect.height,
    };
  }
};

const dropdownStyle = computed(() => {
  if (isDropUp.value) {
    return {
      bottom: `${window.innerHeight - triggerRect.value.top + 4}px`,
      left: `${triggerRect.value.left}px`,
      width: `${triggerRect.value.width}px`,
    };
  }
  return {
    top: `${triggerRect.value.top + triggerRect.value.height + 4}px`,
    left: `${triggerRect.value.left}px`,
    width: `${triggerRect.value.width}px`,
  };
});

const dropdownStyle2 = computed(() => {
  if (isDropUp2.value) {
    return {
      bottom: `${window.innerHeight - triggerRect2.value.top + 4}px`,
      left: `${triggerRect2.value.left}px`,
      width: `${triggerRect2.value.width}px`,
    };
  }
  return {
    top: `${triggerRect2.value.top + triggerRect2.value.height + 4}px`,
    left: `${triggerRect2.value.left}px`,
    width: `${triggerRect2.value.width}px`,
  };
});

const selectedOption = computed(() => {
  return props.options.find((opt) => opt.value === props.modelValue);
});

const filteredGroupedOptions = computed(() => {
  const q = searchTerm.value.toLowerCase().trim();
  const filtered = props.options.filter((opt) => {
    if (!q) return true;
    return opt.label.toLowerCase().includes(q) || (opt.group && opt.group.toLowerCase().includes(q));
  });

  const groupsMap = new Map<string, SelectOption[]>();
  for (const item of filtered) {
    const gName = item.group || '';
    if (!groupsMap.has(gName)) {
      groupsMap.set(gName, []);
    }
    groupsMap.get(gName)!.push(item);
  }

  return Array.from(groupsMap.entries()).map(([name, items]) => ({
    name,
    items,
  }));
});

// Searchable toggle
const toggleDropdown = () => {
  if (props.disabled) return;
  calculatePosition(containerRef.value, false);
  isOpen.value = !isOpen.value;
  if (isOpen2.value) isOpen2.value = false;
  if (isOpen.value) {
    searchTerm.value = '';
    nextTick(() => {
      calculatePosition(containerRef.value, false);
      searchInputRef.value?.focus();
    });
  }
};

const selectOption = (opt: SelectOption) => {
  if (opt.disabled) return;
  emit('update:modelValue', opt.value);
  emit('change', opt.value);
  isOpen.value = false;
};

// Non-searchable toggle
const toggleDropdown2 = () => {
  if (props.disabled) return;
  calculatePosition(containerRef2.value, true);
  isOpen2.value = !isOpen2.value;
  if (isOpen.value) isOpen.value = false;
  if (isOpen2.value) {
    nextTick(() => {
      calculatePosition(containerRef2.value, true);
    });
  }
};

const selectOption2 = (opt: SelectOption) => {
  if (opt.disabled) return;
  emit('update:modelValue', opt.value);
  emit('change', opt.value);
  isOpen2.value = false;
};

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as Node;
  if (
    (containerRef.value && containerRef.value.contains(target)) ||
    (containerRef2.value && containerRef2.value.contains(target)) ||
    (dropdownMenuRef.value && dropdownMenuRef.value.contains(target)) ||
    (dropdownMenuRef2.value && dropdownMenuRef2.value.contains(target))
  ) {
    return;
  }
  isOpen.value = false;
  isOpen2.value = false;
};

const handleWindowScroll = () => {
  if (isOpen.value && containerRef.value) {
    calculatePosition(containerRef.value, false);
  }
  if (isOpen2.value && containerRef2.value) {
    calculatePosition(containerRef2.value, true);
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('scroll', handleWindowScroll, true);
  window.addEventListener('resize', handleWindowScroll);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('scroll', handleWindowScroll, true);
  window.removeEventListener('resize', handleWindowScroll);
});
</script>
