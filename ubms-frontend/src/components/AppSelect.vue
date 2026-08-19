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
      class="w-full min-w-0 max-w-full flex items-center justify-between pl-3.5 pr-2.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 text-left disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none border"
      :class="[
        isOpen
          ? 'border-emerald-500 bg-slate-50 dark:bg-slate-800 shadow-sm ring-2 ring-emerald-500/15'
          : 'border-slate-300 dark:border-slate-700 bg-slate-50 hover:bg-white text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-800 dark:text-slate-100',
        customClass
      ]"
    >
      <div class="flex items-center gap-2 truncate flex-1 min-w-0 pr-1.5">
        <slot name="selected" :option="selectedOption">
          <!-- Color dot if present -->
          <span
            v-if="selectedOption?.color"
            class="w-2.5 h-2.5 rounded-full shrink-0"
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
            :class="!selectedOption ? 'text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white font-medium'"
          >
            {{ selectedOption ? selectedOption.label : (placeholder || 'Tanlang...') }}
          </span>

          <!-- Badge if present -->
          <span
            v-if="selectedOption?.badge"
            class="ml-auto text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0 whitespace-nowrap"
          >
            {{ selectedOption.badge }}
          </span>
        </slot>
      </div>

      <ChevronDown
        class="w-4 h-4 text-slate-400 dark:text-slate-400 transition-transform duration-200 shrink-0 ml-1"
        :class="{ 'rotate-180 text-emerald-500': isOpen }"
      />
    </button>

    <!-- Dropdown Menu with Scale + Fade Transition -->
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
        class="absolute z-50 w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 p-1.5 text-xs shadow-2xl overflow-hidden max-h-56 flex flex-col"
        :class="isDropUp ? 'bottom-full mb-1.5 origin-bottom' : 'top-full mt-1.5 origin-top'"
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
              class="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 border border-slate-200 dark:border-slate-700"
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
              class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500"
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
              class="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors text-xs disabled:opacity-40 disabled:cursor-not-allowed group/opt"
              :class="[
                modelValue === opt.value
                  ? 'bg-emerald-500 text-white font-bold'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80'
              ]"
            >
              <div class="flex items-center gap-2 truncate flex-1">
                <!-- Color dot -->
                <span
                  v-if="opt.color"
                  class="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  :style="{ backgroundColor: opt.color }"
                ></span>

                <!-- Icon -->
                <component
                  v-if="opt.icon"
                  :is="opt.icon"
                  class="w-3.5 h-3.5 flex-shrink-0"
                  :class="modelValue === opt.value ? 'text-white' : 'text-emerald-500'"
                />

                <span class="truncate">{{ opt.label }}</span>
              </div>

              <!-- Badge / Checkmark -->
              <div class="flex items-center gap-1.5 flex-shrink-0 ml-2">
                <span
                  v-if="opt.badge"
                  class="text-[10px] px-1.5 py-0.5 rounded font-bold"
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
  </div>

  <!-- 2. Non-searchable: Same Custom Styling (no native select!) -->
  <div
    v-else
    ref="containerRef2"
    class="relative w-full inline-block select-none"
  >
    <!-- Trigger Button (same style as searchable) -->
    <button
      type="button"
      @click="toggleDropdown2"
      :disabled="disabled"
      class="w-full flex items-center justify-between pl-3.5 pr-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 text-left disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none border"
      :class="[
        isOpen2
          ? 'border-emerald-500 bg-slate-50 dark:bg-slate-800 shadow-sm ring-2 ring-emerald-500/15'
          : 'border-slate-300 dark:border-slate-700 bg-slate-50 hover:bg-white text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-800 dark:text-slate-100',
        customClass
      ]"
    >
      <div class="flex items-center gap-2 truncate flex-1 pr-2">
        <slot name="selected" :option="selectedOption">
          <span
            v-if="selectedOption?.color"
            class="w-2.5 h-2.5 rounded-full flex-shrink-0"
            :style="{ backgroundColor: selectedOption.color }"
          ></span>
          <component
            v-if="selectedOption?.icon"
            :is="selectedOption.icon"
            class="w-3.5 h-3.5 text-emerald-500 flex-shrink-0"
          />
          <span
            class="truncate"
            :class="!selectedOption ? 'text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white font-medium'"
          >
            {{ selectedOption ? selectedOption.label : (placeholder || 'Tanlang...') }}
          </span>
          <span
            v-if="selectedOption?.badge"
            class="ml-auto text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
          >
            {{ selectedOption.badge }}
          </span>
        </slot>
      </div>
      <ChevronDown
        class="w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0"
        :class="{ 'rotate-180 text-emerald-500': isOpen2 }"
      />
    </button>

    <!-- Dropdown -->
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
        class="absolute z-50 w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 p-1.5 text-xs shadow-2xl overflow-hidden max-h-56 overflow-y-auto"
        :class="isDropUp ? 'bottom-full mb-1.5 origin-bottom' : 'top-full mt-1.5 origin-top'"
      >
        <button
          v-for="opt in options"
          :key="opt.value"
          type="button"
          :disabled="opt.disabled"
          @click="selectOption2(opt)"
          class="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors text-xs disabled:opacity-40 disabled:cursor-not-allowed"
          :class="[
            modelValue === opt.value
              ? 'bg-emerald-500 text-white font-bold'
              : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80'
          ]"
        >
          <div class="flex items-center gap-2 truncate flex-1">
            <span
              v-if="opt.color"
              class="w-2.5 h-2.5 rounded-full flex-shrink-0"
              :style="{ backgroundColor: opt.color }"
            ></span>
            <component
              v-if="opt.icon"
              :is="opt.icon"
              class="w-3.5 h-3.5 flex-shrink-0"
              :class="modelValue === opt.value ? 'text-white' : 'text-emerald-500'"
            />
            <span class="truncate">{{ opt.label }}</span>
          </div>
          <Check v-if="modelValue === opt.value" class="w-3.5 h-3.5 text-white flex-shrink-0" />
        </button>
      </div>
    </transition>
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
    customClass?: string;
  }>(),
  {
    options: () => [],
    searchable: false,
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', val: any): void;
  (e: 'change', val: any): void;
}>();

// === SEARCHABLE mode state ===
const isOpen = ref(false);
const isDropUp = ref(false);
const searchTerm = ref('');
const containerRef = ref<HTMLElement | null>(null);
const searchInputRef = ref<HTMLInputElement | null>(null);

// === NON-SEARCHABLE mode state ===
const isOpen2 = ref(false);
const containerRef2 = ref<HTMLElement | null>(null);

const calculatePosition = (container: HTMLElement | null) => {
  if (!container) return;
  const rect = container.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;
  isDropUp.value = spaceBelow < 220 && spaceAbove > spaceBelow;
};

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
  calculatePosition(containerRef.value);
  isOpen.value = !isOpen.value;
  if (isOpen2.value) isOpen2.value = false;
  if (isOpen.value) {
    searchTerm.value = '';
    nextTick(() => {
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
  calculatePosition(containerRef2.value);
  isOpen2.value = !isOpen2.value;
  if (isOpen.value) isOpen.value = false;
};

const selectOption2 = (opt: SelectOption) => {
  if (opt.disabled) return;
  emit('update:modelValue', opt.value);
  emit('change', opt.value);
  isOpen2.value = false;
};

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as Node;
  if (containerRef.value && !containerRef.value.contains(target)) {
    isOpen.value = false;
  }
  if (containerRef2.value && !containerRef2.value.contains(target)) {
    isOpen2.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
