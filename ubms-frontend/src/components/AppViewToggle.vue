<template>
  <div class="relative flex items-center h-[42px] p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs shrink-0">
    <!-- Animated Sliding Background Pill -->
    <div
      v-if="pillStyle"
      class="absolute rounded-lg bg-white dark:bg-slate-900 shadow-sm transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none"
      :style="pillStyle"
    ></div>

    <button
      ref="tableBtnRef"
      type="button"
      @click="$emit('update:modelValue', 'table')"
      class="relative z-10 h-full px-3 rounded-lg font-bold transition-colors duration-300 flex items-center justify-center gap-1.5 btn-interactive"
      :class="[
        modelValue === 'table'
          ? 'text-slate-900 dark:text-white font-extrabold'
          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
      ]"
      title="Jadval / Ro'yxat ko'rinishi"
    >
      <List class="w-4 h-4" />
      <span>Jadval</span>
    </button>

    <button
      ref="gridBtnRef"
      type="button"
      @click="$emit('update:modelValue', 'grid')"
      class="relative z-10 h-full px-3 rounded-lg font-bold transition-colors duration-300 flex items-center justify-center gap-1.5 btn-interactive"
      :class="[
        modelValue === 'grid'
          ? 'text-slate-900 dark:text-white font-extrabold'
          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
      ]"
      title="Kartalar ko'rinishi"
    >
      <LayoutGrid class="w-4 h-4" />
      <span>Kartalar</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { List, LayoutGrid } from 'lucide-vue-next';

const props = defineProps<{
  modelValue: 'table' | 'grid';
}>();

defineEmits<{
  (e: 'update:modelValue', val: 'table' | 'grid'): void;
}>();

const tableBtnRef = ref<HTMLElement | null>(null);
const gridBtnRef = ref<HTMLElement | null>(null);
const isMounted = ref(false);

onMounted(() => {
  isMounted.value = true;
});

const pillStyle = computed(() => {
  const target = props.modelValue === 'table' ? tableBtnRef.value : gridBtnRef.value;
  if (!target || !isMounted.value) return null;
  return {
    left: `${target.offsetLeft}px`,
    width: `${target.offsetWidth}px`,
    top: `${target.offsetTop}px`,
    height: `${target.offsetHeight}px`,
  };
});
</script>
