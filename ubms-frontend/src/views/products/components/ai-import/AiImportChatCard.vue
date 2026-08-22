<template>
  <div class="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm bg-white dark:bg-slate-900 flex flex-col justify-between h-full min-h-[440px] space-y-4">
    <!-- Chat Header -->
    <div class="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <Sparkles class="w-4 h-4" />
        </div>
        <div>
          <h3 class="text-sm font-bold text-slate-900 dark:text-white">AI bilan chat</h3>
          <p class="text-[11px] text-slate-400">Mahsulotlarni tavsiflang, AI siz uchun kartalar va jadval yaratadi</p>
        </div>
      </div>

      <button
        type="button"
        @click="$emit('reset-all')"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition"
      >
        <Trash2 class="w-3.5 h-3.5" />
        <span>Tozalash</span>
      </button>
    </div>

    <!-- Chat History -->
    <div class="flex-1 min-h-[250px] max-h-[500px] overflow-y-auto space-y-4 pr-1.5 py-1">
      <div v-for="msg in chatMessages" :key="msg.id" class="space-y-3 animate-in fade-in duration-200">
        <!-- USER MESSAGE -->
        <div v-if="msg.role === 'user'" class="flex justify-end">
          <div class="max-w-[85%] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-slate-800 dark:text-slate-100 rounded-2xl px-4 py-2.5 text-xs shadow-2xs space-y-1">
            <div class="flex items-center justify-between gap-4">
              <span class="font-medium text-xs">{{ msg.text }}</span>
              <div class="flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
                <span>{{ formatTime(msg.timestamp) }}</span>
                <CheckCheck class="w-3.5 h-3.5 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        <!-- AI MESSAGE & PREVIEW CARDS -->
        <div v-else class="space-y-3">
          <div class="flex items-start gap-2.5">
            <div class="w-7 h-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              <Sparkles class="w-3.5 h-3.5" />
            </div>
            <div class="flex-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 rounded-2xl px-4 py-2.5 text-xs text-slate-700 dark:text-slate-200 flex items-center justify-between gap-3 shadow-2xs">
              <span class="leading-relaxed">{{ msg.text }}</span>
              <span class="text-[10px] text-slate-400 shrink-0 self-end">{{ formatTime(msg.timestamp) }}</span>
            </div>
          </div>

          <!-- Product Cards Grid if products returned -->
          <div v-if="msg.products && msg.products.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-9">
            <div
              v-for="card in msg.products"
              :key="card._id"
              class="glass-card rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:border-emerald-500/50 transition flex items-center gap-3"
            >
              <div class="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                <img v-if="card.imageUrl" :src="card.imageUrl" :alt="card.name" class="w-full h-full object-cover" />
                <Package v-else class="w-5 h-5 text-slate-400" />
              </div>

              <div class="flex-1 min-w-0">
                <h4 class="font-bold text-xs text-slate-900 dark:text-white truncate">{{ card.name }}</h4>
                <div class="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                  <span>Turi: <strong class="text-slate-700 dark:text-slate-300">{{ card.categoryName || 'Boshqa' }}</strong></span>
                  <span>Qadoq: <strong class="text-slate-700 dark:text-slate-300">{{ card.packaging || 'Dona' }}</strong></span>
                </div>
                <div class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                  Miqdor: {{ card.initialStock || 1 }} ta
                </div>
              </div>

              <div class="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5">
                <button
                  type="button"
                  @click="$emit('decrement-qty', card)"
                  class="w-5 h-5 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  <Minus class="w-3 h-3" />
                </button>
                <span class="font-bold text-xs min-w-4 text-center font-mono">{{ card.initialStock || 1 }}</span>
                <button
                  type="button"
                  @click="$emit('increment-qty', card)"
                  class="w-5 h-5 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  <Plus class="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading indicator -->
      <div v-if="parsing" class="flex items-center gap-2.5 pl-2 py-2 text-xs text-emerald-600 dark:text-emerald-400 animate-pulse">
        <Loader2 class="w-4 h-4 animate-spin" />
        <span>AI mahsulotlarni tahlil qilmoqda va jadvalga joylamoqda...</span>
      </div>
    </div>

    <!-- Input Bar -->
    <div class="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 shrink-0">
      <div class="flex flex-wrap items-center gap-1.5">
        <span class="text-[10px] text-slate-400 font-medium">Namunalar:</span>
        <button
          v-for="chip in quickChips"
          :key="chip"
          type="button"
          @click="promptText = chip"
          class="px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/40 text-slate-600 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-300 border border-slate-200/80 dark:border-slate-700 transition"
        >
          {{ chip }}
        </button>
      </div>

      <div class="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 shadow-inner focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/10 transition">
        <button
          type="button"
          @click="$emit('open-excel')"
          class="p-1 rounded-xl text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition"
          title="Excel / 1C Fayl biriktirish"
        >
          <Paperclip class="w-4 h-4" />
        </button>

        <input
          v-model="promptText"
          type="text"
          placeholder="Mahsulotni tavsiflang... (masalan: 2 blok Kola 1.5L, 3 blok Pepsi 1L, har blokda 6 ta)"
          class="flex-1 bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none font-medium"
          @keyup.enter="handleSend"
        />

        <button
          type="button"
          @click="handleSend"
          :disabled="!promptText.trim() || parsing"
          class="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white flex items-center justify-center transition shrink-0 shadow-xs"
        >
          <Send class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Sparkles, Trash2, CheckCheck, Package, Minus, Plus, Loader2, Paperclip, Send } from 'lucide-vue-next';
import type { TableProductItem } from './types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  productCount?: number;
  products?: TableProductItem[];
  timestamp: any;
}

const props = defineProps<{
  chatMessages: ChatMessage[];
  parsing: boolean;
  quickChips: string[];
}>();

const emit = defineEmits<{
  (e: 'reset-all'): void;
  (e: 'open-excel'): void;
  (e: 'increment-qty', item: TableProductItem): void;
  (e: 'decrement-qty', item: TableProductItem): void;
  (e: 'send-prompt', prompt: string): void;
}>();

const promptText = ref('');

const handleSend = () => {
  if (!promptText.value.trim() || props.parsing) return;
  emit('send-prompt', promptText.value);
  promptText.value = '';
};

const formatTime = (d: any) => {
  if (!d) return '15:30';
  try {
    const date = typeof d === 'string' || typeof d === 'number' ? new Date(d) : d;
    if (!date || typeof date.getTime !== 'function' || isNaN(date.getTime())) return '15:30';
    return date.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '15:30';
  }
};
</script>
