<template>
  <div class="flex flex-col h-full bg-white dark:bg-slate-900">

    <!-- Messages -->
    <div ref="messagesEl" class="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">

      <!-- Empty welcome -->
      <div v-if="messages.length <= 1" class="flex flex-col items-center justify-center h-full gap-5 text-center">
        <div class="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center">
          <Sparkles class="w-7 h-7 text-white" />
        </div>
        <div>
          <p class="text-base font-bold text-slate-800 dark:text-white">Mahsulotlaringizni yozing</p>
          <p class="text-sm text-slate-400 mt-1 max-w-xs">Masalan: "5 blok Kola 11000/14000, 3 blok Pepsi 1L"</p>
        </div>

        <!-- Quick chips -->
        <div class="flex flex-wrap justify-center gap-2 max-w-lg">
          <button v-for="chip in CHIPS" :key="chip.id" @click="$emit('chip-select', chip.prompt)" type="button"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors bg-white dark:bg-slate-800">
            <component :is="chip.icon" class="w-3.5 h-3.5" />
            {{ chip.label }}
          </button>
        </div>
      </div>

      <!-- Chat messages -->
      <template v-else>
        <div v-for="msg in messages" :key="msg.id" class="flex gap-2.5"
          :class="msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'">

          <!-- Avatar -->
          <div class="w-7 h-7 rounded-xl shrink-0 flex items-center justify-center mt-0.5"
            :class="msg.role === 'ai'
              ? 'bg-emerald-500'
              : 'bg-slate-200 dark:bg-slate-700'">
            <Sparkles v-if="msg.role === 'ai'" class="w-3.5 h-3.5 text-white" />
            <User v-else class="w-3.5 h-3.5 text-slate-500 dark:text-slate-300" />
          </div>

          <!-- Bubble -->
          <div class="max-w-[75%] space-y-1">
            <div class="px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed"
              :class="msg.role === 'user'
                ? 'bg-emerald-500 text-white rounded-tr-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm'">
              {{ msg.text }}
            </div>

            <!-- Success badge -->
            <div v-if="msg.productCount && msg.productCount > 0"
              class="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 px-1">
              <CheckCircle2 class="w-3.5 h-3.5" />
              {{ msg.productCount }} ta mahsulot aniqlandi
            </div>

            <p class="text-[10px] text-slate-400 px-1" :class="msg.role === 'user' ? 'text-right' : ''">
              {{ formatTime(msg.timestamp) }}
            </p>
          </div>
        </div>
      </template>

      <!-- Typing -->
      <div v-if="parsing" class="flex gap-2.5">
        <div class="w-7 h-7 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
          <Sparkles class="w-3.5 h-3.5 text-white" />
        </div>
        <div class="px-3.5 py-3 rounded-2xl rounded-tl-sm bg-slate-100 dark:bg-slate-800">
          <div class="flex gap-1">
            <span v-for="i in 3" :key="i" class="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
              :style="`animation-delay: ${(i-1) * 150}ms`" />
          </div>
        </div>
      </div>
    </div>

    <!-- Compact chips (after first message) -->
    <div v-if="messages.length > 1" class="shrink-0 px-4 pb-1.5 flex gap-1.5 overflow-x-auto">
      <button v-for="chip in CHIPS" :key="chip.id" @click="$emit('chip-select', chip.prompt)" type="button"
        class="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 hover:border-emerald-400 hover:text-emerald-600 transition-colors bg-white dark:bg-slate-800 whitespace-nowrap">
        <component :is="chip.icon" class="w-3 h-3" />
        {{ chip.label }}
      </button>
    </div>

    <!-- Input -->
    <div class="shrink-0 px-4 pb-3 pt-1">
      <div class="flex items-end gap-2 rounded-xl border px-3 py-2 transition-colors"
        :class="focused
          ? 'border-emerald-400 ring-2 ring-emerald-400/10'
          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'">

        <button @click="$emit('toggle-voice')" type="button"
          class="shrink-0 p-1 rounded-lg transition-colors mb-0.5"
          :class="isListening
            ? 'text-white bg-red-500 animate-pulse'
            : 'text-slate-400 hover:text-emerald-500'">
          <MicOff v-if="isListening" class="w-4 h-4" />
          <Mic v-else class="w-4 h-4" />
        </button>

        <textarea
          v-model="text" ref="taRef" rows="1"
          placeholder="Mahsulotlarni yozing..."
          class="flex-1 bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none resize-none max-h-24 py-1 leading-relaxed"
          @focus="focused = true" @blur="focused = false"
          @keydown.enter.exact.prevent="send"
          @input="resize"
        />

        <button @click="send" :disabled="!text.trim() || parsing" type="button"
          class="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all mb-0.5"
          :class="text.trim() && !parsing
            ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
            : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'">
          <Loader2 v-if="parsing" class="w-4 h-4 animate-spin" />
          <Send v-else class="w-4 h-4" />
        </button>
      </div>
      <p class="text-[10px] text-slate-400 text-center mt-1">Enter — yuborish · Shift+Enter — yangi qator</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { Sparkles, Mic, MicOff, Send, Loader2, User, CheckCircle2, CupSoda, UtensilsCrossed, Zap } from 'lucide-vue-next';
import type { ChatMessage } from './useAiProductParser';

const props = defineProps<{
  modelValue: string;
  isListening: boolean;
  parsing: boolean;
  messages: ChatMessage[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void;
  (e: 'send'): void;
  (e: 'toggle-voice'): void;
  (e: 'chip-select', prompt: string): void;
}>();

const text = ref('');
const focused = ref(false);
const messagesEl = ref<HTMLElement | null>(null);
const taRef = ref<HTMLTextAreaElement | null>(null);

const CHIPS = [
  { id: 'drinks', icon: CupSoda, label: 'Ichimliklar', prompt: '5 blok 1.5L Kola, 3 blok Pepsi 1L, 10 blok Fanta. Har blokda 6 tadan. Tan narxi 11 000, sotish 14 000. Ichimliklar' },
  { id: 'food', icon: UtensilsCrossed, label: 'Shirinliklar', prompt: 'Snickers Super 24 dona (9500/12000), Twix Xtra 24 dona (9500/12000), KitKat 24 dona (7500/10000). Shirinliklar' },
  { id: 'chem', icon: Zap, label: 'Maishiy kimyo', prompt: 'Fairy Limon 450ml 20 dona (16000/21000), Ariel 3kg 12 dona (65000/82000). Maishiy kimyo' },
];

const formatTime = (d: Date) => d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });

const resize = () => {
  const el = taRef.value;
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
};

const scrollBottom = async () => {
  await nextTick();
  if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight;
};

watch(() => props.messages.length, scrollBottom, { immediate: true });
watch(() => props.parsing, scrollBottom);

const send = () => {
  if (!text.value.trim() || props.parsing) return;
  emit('update:modelValue', text.value);
  emit('send');
  text.value = '';
  nextTick(() => { if (taRef.value) taRef.value.style.height = 'auto'; });
};
</script>
