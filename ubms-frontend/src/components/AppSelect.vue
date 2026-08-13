<template>
  <!-- 1. Custom Searchable / Popover Select Mode -->
  <div
    v-if="searchable"
    ref="containerRef"
    class="relative w-full inline-block select-none"
  >
    <!-- Trigger Button -->
    <button
      type="button"
      @click="toggleDropdown"
      :disabled="disabled"
      class="w-full flex items-center justify-between pl-3.5 pr-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 text-left disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500/20 border"
      :class="[
        isOpen
          ? 'border-emerald-500 bg-white dark:bg-slate-800 shadow-sm ring-2 ring-emerald-500/15'
          : 'border-slate-300 dark:border-slate-700 bg-slate-50 hover:bg-white text-slate-900 dark:bg-slate-800/90 dark:hover:bg-slate-800 dark:text-slate-100',
        customClass
      ]"
    >
      <div class="flex items-center gap-2 truncate flex-1 pr-2">
        <slot name="selected" :option="selectedOption">
          <!-- Color dot if present -->
          <span
            v-if="selectedOption?.color"
            class="w-2.5 h-2.5 rounded-full flex-shrink-0"
            :style="{ backgroundColor: selectedOption.color }"
          ></span>

          <!-- Icon if present -->
          <component
            v-if="selectedOption?.icon"
            :is="selectedOption.icon"
            class="w-3.5 h-3.5 text-emerald-500 flex-shrink-0"
          />

          <!-- Label / Placeholder -->
          <span
            class="truncate"
            :class="!selectedOption ? 'text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white font-medium'"
          >
            {{ selectedOption ? selectedOption.label : (placeholder || 'Tanlang...') }}
          </span>

          <!-- Badge if present -->
          <span
            v-if="selectedOption?.badge"
            class="ml-auto text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
          >
            {{ selectedOption.badge }}
          </span>
        </slot>
      </div>

      <ChevronDown
        class="w-4 h-4 text-slate-400 dark:text-slate-400 transition-transform duration-200 flex-shrink-0"
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
        class="absolute z-50 mt-1.5 w-full rounded-xl glass-dropdown p-1.5 text-xs shadow-2xl overflow-hidden max-h-64 flex flex-col"
      >
        <!-- Search Input -->
        <div class="p-1 border-b border-slate-200 dark:border-slate-800 mb-1">
          <div class="relative">
            <Search class="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
            <input
              ref="searchInputRef"
              v-model="searchTerm"
              type="text"
              placeholder="Qidiruv..."
              class="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 border border-slate-200 dark:border-slate-700"
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

  <!-- 2. Standard Native Select Mode (Fast & accessible) -->
  <div v-else class="relative w-full inline-block">
    <select
      :value="modelValue"
      @change="handleChange"
      :disabled="disabled"
      :required="required"
      class="w-full appearance-none pl-3.5 pr-10 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500/20 border"
      :class="[
        'bg-slate-50 hover:bg-white text-slate-900 border-slate-300 focus:border-emerald-500 focus:bg-white',
        'dark:bg-slate-800/90 dark:hover:bg-slate-800 dark:text-slate-100 dark:border-slate-700 dark:focus:border-emerald-500 dark:focus:bg-slate-800',
        customClass
      ]"
    >
      <slot>
        <option v-if="placeholder" value="" disabled :selected="!modelValue">
          {{ placeholder }}
        </option>
        <option
          v-for="opt in options"
          :key="opt.value"
          :value="opt.value"
          :disabled="opt.disabled"
          class="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100 py-1"
        >
          {{ opt.label }}
        </option>
      </slot>
    </select>

    <!-- Custom Chevron Icon -->
    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 dark:text-slate-400">
      <ChevronDown class="w-4 h-4 transition-transform duration-200" />
    </div>
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

const isOpen = ref(false);
const searchTerm = ref('');
const containerRef = ref<HTMLElement | null>(null);
const searchInputRef = ref<HTMLInputElement | null>(null);

const selectedOption = computed(() => {
  return props.options.find((opt) => opt.value === props.modelValue);
});

const filteredGroupedOptions = computed(() => {
  const q = searchTerm.value.toLowerCase().trim();
  const filtered = props.options.filter((opt) => {
    if (!q) return true;
    return opt.label.toLowerCase().includes(q) || (opt.group && opt.group.toLowerCase().includes(q));
  });

  // Group items by group name if any
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

const toggleDropdown = () => {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
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

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  emit('update:modelValue', target.value);
  emit('change', target.value);
};

const handleClickOutside = (e: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
