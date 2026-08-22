<template>
  <div
    :class="[
      isFloating
        ? 'fixed bottom-20 md:bottom-5 right-3 sm:right-5 z-40 flex flex-col items-end'
        : 'w-full flex flex-col lg:grid lg:grid-cols-12 gap-5 items-start'
    ]"
  >
    <!-- Floating Trigger Button (when closed in floating mode) -->
    <button
      v-if="isFloating && !isOpen"
      @click="openAssistant"
      class="group relative flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-5 py-3 sm:py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white rounded-full shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 focus:outline-hidden ring-4 ring-emerald-500/20"
      title="Boshqar AI Yordamchi"
    >
      <div class="relative flex items-center justify-center">
        <Sparkles class="w-4 h-4 sm:w-5 sm:h-5 animate-pulse text-amber-300" />
        <span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full animate-ping" />
      </div>
      <span class="font-bold text-xs sm:text-sm tracking-wide">Boshqar AI</span>
      <span class="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-bold bg-white/20 rounded-full text-emerald-50">v2.0</span>
    </button>

    <!-- LEFT COLUMN: Chat Interface Window -->
    <div
      v-if="!isFloating || isOpen"
      :class="[
        isFloating
          ? isExpanded
            ? 'fixed inset-2 sm:inset-10 z-50 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200'
            : 'w-[calc(100vw-1.5rem)] sm:w-[440px] h-[540px] max-h-[calc(100dvh-6rem)] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200'
          : 'lg:col-span-8 w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col overflow-hidden h-[720px] max-h-[82vh]'
      ]"
    >
      <!-- Chat Header -->
      <div class="px-5 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0 select-none">
        <div class="flex items-center gap-3.5 min-w-0">
          <div class="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs shrink-0">
            <Bot class="w-6 h-6" />
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <h3 class="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white leading-tight">Boshqar AI</h3>
              <span class="px-2 py-0.5 text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50 rounded-full">v2.0</span>
            </div>
            <p class="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">Tizim bo‘yicha virtual yordamchingiz</p>
          </div>
        </div>

        <div class="flex items-center gap-1.5">
          <!-- Voice Toggle -->
          <button
            @click="toggleSound"
            :class="[
              'p-2.5 rounded-xl transition-all',
              isSpeechEnabled
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            ]"
            :title="isSpeechEnabled ? 'Ovozli javob yoqilgan' : 'Ovozli javobni yoqish'"
          >
            <Volume2 v-if="isSpeechEnabled" class="w-4 h-4" />
            <VolumeX v-else class="w-4 h-4" />
          </button>

          <!-- Restart / Clear Chat -->
          <button
            @click="clearChat"
            class="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Suhbatni tozalash"
          >
            <RotateCcw class="w-4 h-4" />
          </button>

          <!-- Expand / Minimize Window (Floating mode only) -->
          <button
            v-if="isFloating"
            @click="isExpanded = !isExpanded"
            class="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition hidden sm:inline-flex"
            :title="isExpanded ? 'Kichraytirish' : 'Kattalashtirish'"
          >
            <Minimize2 v-if="isExpanded" class="w-4 h-4" />
            <Maximize2 v-else class="w-4 h-4" />
          </button>

          <!-- Close button (Floating mode only) -->
          <button
            v-if="isFloating"
            @click="closeAssistant"
            class="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Yopish"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Quick Questions Bar with Next/Prev Arrow Controls -->
      <div class="px-5 py-3 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
        <div class="flex items-center justify-between mb-2 text-xs font-bold text-slate-500 dark:text-slate-400">
          <span>Tezkor savollar:</span>
          <div class="flex items-center gap-1">
            <button
              type="button"
              @click="scrollPills('left')"
              class="w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:border-emerald-500 transition shadow-2xs"
              title="Oldingilar"
            >
              <ChevronLeft class="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              @click="scrollPills('right')"
              class="w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:border-emerald-500 transition shadow-2xs"
              title="Keyingilar"
            >
              <ChevronRight class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div
          ref="pillsContainer"
          class="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth"
        >
          <button
            v-for="(prompt, idx) in defaultPills"
            :key="idx"
            @click="sendPrompt(prompt.text)"
            class="shrink-0 px-3.5 py-1.5 text-xs font-medium rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-all shadow-2xs flex items-center gap-1.5 whitespace-nowrap active:scale-95"
          >
            <component :is="prompt.icon" class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{{ prompt.text }}</span>
          </button>
        </div>
      </div>

      <!-- Messages Area -->
      <div
        ref="messagesContainer"
        class="flex-1 p-5 overflow-y-auto space-y-5 bg-white dark:bg-slate-900 custom-chat-scrollbar"
      >
        <!-- Message Bubbles -->
        <div
          v-for="msg in messages"
          :key="msg.id"
          :class="[
            'flex gap-3.5 max-w-[95%] sm:max-w-[90%]',
            msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
          ]"
        >
          <!-- Avatar -->
          <div
            :class="[
              'w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold shadow-2xs mt-1',
              msg.sender === 'user'
                ? 'bg-slate-700 text-white'
                : msg.id === 'welcome'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200/60 dark:border-emerald-800/60'
                  : 'bg-emerald-600 text-white'
            ]"
          >
            <User v-if="msg.sender === 'user'" class="w-4 h-4" />
            <Bot v-else-if="msg.id === 'welcome'" class="w-4 h-4" />
            <Sparkles v-else class="w-4 h-4 text-emerald-200" />
          </div>

          <!-- Bubble Container -->
          <div class="space-y-1.5 max-w-full">
            <!-- User Message Bubble -->
            <div
              v-if="msg.sender === 'user'"
              class="rounded-2xl rounded-tr-xs px-4 py-2.5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 text-slate-900 dark:text-white text-xs sm:text-sm font-medium shadow-2xs flex items-center gap-2"
            >
              <span>{{ msg.text }}</span>
              <span class="text-[10px] text-slate-400 shrink-0 ml-1">{{ formatTime(msg.timestamp) }}</span>
              <Check class="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            </div>

            <!-- Bot Message Bubble (Matches User's Exact Mockup) -->
            <div
              v-else
              class="rounded-3xl rounded-tl-xs p-5 bg-white dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 text-xs sm:text-sm shadow-xs space-y-3.5"
            >
              <!-- Message Text / Formatted Step List -->
              <div v-if="parseStructuredSteps(msg.text)" class="space-y-3.5">
                <p class="font-bold text-slate-900 dark:text-white">
                  {{ parseStructuredSteps(msg.text)!.intro }}
                </p>

                <!-- Steps List -->
                <div class="space-y-2.5">
                  <div
                    v-for="(step, stIdx) in parseStructuredSteps(msg.text)!.steps"
                    :key="stIdx"
                    class="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60"
                  >
                    <span class="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      {{ stIdx + 1 }}
                    </span>
                    <div class="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100 dark:border-emerald-900/50">
                      <component :is="getStepIcon(stIdx)" class="w-4 h-4" />
                    </div>
                    <div class="min-w-0">
                      <h5 class="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">{{ step.title }}</h5>
                      <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{{ step.description }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- General Fallback / Markdown Text -->
              <div v-else class="whitespace-pre-wrap select-text leading-relaxed space-y-1.5" v-html="formatMessage(msg.text)" />

              <!-- Direct Action Link Button -->
              <div v-if="msg.actionRoute" class="pt-1">
                <router-link
                  :to="msg.actionRoute"
                  @click="onActionClick"
                  class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm shadow-emerald-500/20 active:scale-95"
                >
                  <span>{{ msg.actionText || "Bo‘limga o‘tish" }}</span>
                  <ArrowRight class="w-4 h-4" />
                </router-link>
              </div>

              <!-- Message Footer: Time + Copy + Like/Dislike -->
              <div class="pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-slate-400 text-xs select-none">
                <span class="text-[11px]">{{ formatTime(msg.timestamp) }}</span>

                <div class="flex items-center gap-1.5">
                  <button
                    @click="copyToClipboard(msg.text, msg.id)"
                    class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition"
                    title="Nusxa olish"
                  >
                    <Check v-if="copiedMsgId === msg.id" class="w-3.5 h-3.5 text-emerald-600" />
                    <Copy v-else class="w-3.5 h-3.5" />
                  </button>

                  <button
                    @click="rateMessage(msg.id, 'up')"
                    :class="[
                      'p-1.5 rounded-lg transition',
                      ratedMessages[msg.id] === 'up'
                        ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200'
                    ]"
                    title="Foydali"
                  >
                    <ThumbsUp class="w-3.5 h-3.5" />
                  </button>

                  <button
                    @click="rateMessage(msg.id, 'down')"
                    :class="[
                      'p-1.5 rounded-lg transition',
                      ratedMessages[msg.id] === 'down'
                        ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/60'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200'
                    ]"
                    title="Yordam bermadi"
                  >
                    <ThumbsDown class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Typing Indicator -->
        <div v-if="isTyping" class="flex gap-3 mr-auto max-w-[85%]">
          <div class="w-8 h-8 rounded-full shrink-0 flex items-center justify-center bg-emerald-600 text-white shadow-xs">
            <Sparkles class="w-4 h-4 text-emerald-200" />
          </div>
          <div class="bg-white dark:bg-slate-800 rounded-3xl rounded-tl-xs px-4 py-3 border border-slate-200 dark:border-slate-700/80 shadow-xs flex items-center gap-2">
            <span class="text-xs text-slate-400 font-medium">Boshqar AI javob yozmoqda...</span>
            <div class="flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style="animation-delay: 0ms" />
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style="animation-delay: 150ms" />
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style="animation-delay: 300ms" />
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Bottom Input Bar (Matches User's Exact Mockup) -->
      <div class="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0 space-y-2">
        <form @submit.prevent="handleSubmit" class="relative flex items-center">
          <button
            type="button"
            class="absolute left-3.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition rounded-lg"
            title="Fayl yoki rasm ilova qilish"
          >
            <Paperclip class="w-4 h-4" />
          </button>

          <input
            v-model="inputQuery"
            type="text"
            placeholder="Savolingizni yozing... (masalan: Chek qanday uriladi, qarzni qanday yopaman...)"
            class="w-full pl-11 pr-14 py-3.5 text-xs sm:text-sm rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition shadow-2xs"
          />

          <button
            type="submit"
            :disabled="!inputQuery.trim() || isTyping"
            class="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold transition flex items-center justify-center shadow-md shadow-emerald-600/20 active:scale-95"
          >
            <Send class="w-4 h-4" />
          </button>
        </form>

        <p class="text-[11px] text-center text-slate-400 dark:text-slate-500">
          Boshqar AI xatolarga yo‘l qo‘yishi mumkin. Muhim ma’lumotlarni tekshirib ko‘ring.
        </p>
      </div>
    </div>

    <!-- RIGHT COLUMN: Sidebar (Matches Chat height exactly) -->
    <div v-if="!isFloating" class="lg:col-span-4 w-full h-[720px] max-h-[82vh] flex flex-col justify-between gap-4">

      <!-- Card 1: Ko'p so'raladigan mavzular (Flexible scrollable area) -->
      <div class="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs space-y-3.5 flex-1 flex flex-col overflow-hidden">
        <h4 class="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white shrink-0">
          Ko‘p so‘raladigan mavzular
        </h4>

        <div class="space-y-2 overflow-y-auto no-scrollbar flex-1 pb-1">
          <div
            v-for="item in sidebarTopics"
            :key="item.id"
            @click="sendPrompt(item.prompt)"
            class="p-2.5 sm:p-2.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/70 shadow-xs hover:shadow-md hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer group"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div :class="['w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition', item.iconBg]">
                <component :is="item.icon" :class="['w-4.5 h-4.5', item.iconColor]" />
              </div>
              <div class="min-w-0">
                <h5 class="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition truncate">
                  {{ item.title }}
                </h5>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{{ item.desc }}</p>
              </div>
            </div>

            <ChevronRight class="w-4 h-4 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition shrink-0" />
          </div>
        </div>
      </div>

      <!-- Card 2: AI javoblari sizga foydalimi? -->
      <div class="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs space-y-3 shrink-0">
        <div>
          <h5 class="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
            AI javoblari sizga foydalimi?
          </h5>
          <p class="text-xs text-slate-400 mt-0.5">Fikringiz biz uchun muhim!</p>
        </div>

        <div class="flex items-center gap-2.5">
          <!-- Foydali Button (Expands smoothly to full width when clicked) -->
          <button
            type="button"
            @click="generalFeedback = 'up'"
            :class="[
              'py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 border shadow-2xs',
              generalFeedback === 'up'
                ? 'w-full bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/25'
                : generalFeedback === 'down'
                  ? 'hidden'
                  : 'flex-1 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200/70 dark:border-emerald-900/50 hover:bg-emerald-600 hover:text-white hover:border-emerald-600'
            ]"
          >
            <ThumbsUp class="w-4 h-4" />
            <span>Foydali</span>
          </button>

          <!-- Yordam bermadi Button (Smoothly disappears when Foydali is clicked) -->
          <button
            v-if="generalFeedback !== 'up'"
            type="button"
            @click="generalFeedback = 'down'"
            :class="[
              'py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-95 border',
              generalFeedback === 'down'
                ? 'w-full bg-slate-800 text-white border-slate-800'
                : 'flex-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            ]"
          >
            <ThumbsDown class="w-3.5 h-3.5" />
            <span>Yordam bermadi</span>
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue';
import {
  Sparkles,
  Bot,
  User,
  Send,
  RotateCcw,
  X,
  ArrowRight,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Paperclip,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  ShoppingCart,
  Package,
  Store,
  Users,
  DollarSign,
  Settings,
  PlusCircle,
  Receipt,
  SendHorizontal,
  LayoutGrid,
  FileText,
  CheckCircle2,
} from 'lucide-vue-next';
import api from '../services/api';
import { AI_KNOWLEDGE_BASE, GUIDE_MODULES } from '../views/guide/guideData';

const props = withDefaults(
  defineProps<{
    isFloating?: boolean;
  }>(),
  {
    isFloating: false,
  }
);

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  actionRoute?: string;
  actionText?: string;
  timestamp: Date;
}

const isOpen = ref(false);
const isExpanded = ref(false);
const isSpeechEnabled = ref(false);
const copiedMsgId = ref<string | null>(null);
const ratedMessages = ref<Record<string, 'up' | 'down'>>({});
const generalFeedback = ref<'up' | 'down' | null>(null);
const inputQuery = ref('');
const isTyping = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);
const pillsContainer = ref<HTMLElement | null>(null);

const scrollPills = (direction: 'left' | 'right') => {
  if (pillsContainer.value) {
    const scrollAmount = direction === 'left' ? -220 : 220;
    pillsContainer.value.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }
};

const defaultPills = [
  { text: "Bugun qancha savdo bo'ldi?", icon: DollarSign },
  { text: "Yangi tovar qanday qo'shiladi?", icon: PlusCircle },
  { text: "Kassada chek qanday chiqariladi?", icon: Receipt },
  { text: "Telegram botni qanday ulayman?", icon: SendHorizontal },
  { text: "Barchasini ko'rish", icon: LayoutGrid },
];

const sidebarTopics = [
  {
    id: 'pos',
    title: 'Kassa (POS)',
    desc: 'Savdo qilish, chek chiqarish, to‘lov turlari',
    icon: ShoppingCart,
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/50',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    prompt: 'Kassa va savdo qilish bo‘yicha qo‘llanma ber',
  },
  {
    id: 'products',
    title: 'Mahsulotlar',
    desc: 'Yangi mahsulot qo‘shish, tahrirlash',
    icon: Package,
    iconBg: 'bg-blue-50 dark:bg-blue-950/50',
    iconColor: 'text-blue-600 dark:text-blue-400',
    prompt: 'Yangi tovar qanday qo‘shiladi?',
  },
  {
    id: 'inventory',
    title: 'Ombor',
    desc: 'Qabul qilish, qoldiqni ko‘rish, harakatlar',
    icon: Store,
    iconBg: 'bg-amber-50 dark:bg-amber-950/50',
    iconColor: 'text-amber-600 dark:text-amber-400',
    prompt: 'Ombor qoldig‘i va kirim qilish qanday ishlaydi?',
  },
  {
    id: 'customers',
    title: 'Mijozlar (CRM)',
    desc: 'Mijozlarni boshqarish, qarzlar, tarix',
    icon: Users,
    iconBg: 'bg-purple-50 dark:bg-purple-950/50',
    iconColor: 'text-purple-600 dark:text-purple-400',
    prompt: 'Mijoz qarzini qanday yozaman?',
  },
  {
    id: 'finance',
    title: 'Moliya & Hisobot',
    desc: 'Kirim-chiqimlar, foyda, xarajatlar',
    icon: DollarSign,
    iconBg: 'bg-amber-50 dark:bg-amber-950/50',
    iconColor: 'text-amber-600 dark:text-amber-500',
    prompt: 'Kunlik sof foyda qayerda ko‘rinadi?',
  },
  {
    id: 'settings',
    title: 'Sozlamalar',
    desc: 'Tizim sozlamalari, foydalanuvchilar',
    icon: Settings,
    iconBg: 'bg-slate-100 dark:bg-slate-800',
    iconColor: 'text-slate-600 dark:text-slate-400',
    prompt: 'Yangi sotuvchi yoki kassirni qanday qo‘shaman?',
  },
];

const keyboardShortcuts = [
  { key: 'Ctrl + N', action: 'Yangi yozuv' },
  { key: 'Ctrl + F', action: 'Qidirish' },
  { key: 'F1', action: 'Yordam markazi' },
  { key: 'Esc', action: 'Amalni bekor qilish' },
];

const defaultWelcomeMessage: ChatMessage = {
  id: 'welcome',
  sender: 'bot',
  text: `Assalomu alaykum! Men **Boshqar AI** aqlli yordamchingiz.\n\nBoshqar.uz tizimidan foydalanishda (Kassa, Ombor, Moliya, Nasiya, Restoran, Xizmatlar yoki Sozlamalar) qanday savolingiz bo‘lsa, menga bemalol yozing!`,
  timestamp: new Date(),
};

const messages = ref<ChatMessage[]>([defaultWelcomeMessage]);

const formatTime = (date: Date) => {
  const d = new Date(date);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
};

const getStepIcon = (idx: number) => {
  const icons = [Package, PlusCircle, FileText, CheckCircle2];
  return icons[idx % icons.length];
};

const stripRawEmojis = (str: string) => {
  if (!str) return '';
  return str
    .replace(/[0-9]️⃣/g, '')
    .replace(/[\u{1F300}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{2300}-\u{23FF}\u{2B50}\u{200D}\u{FE0F}]/gu, '')
    .trim();
};

const parseStructuredSteps = (text: string) => {
  const cleanText = stripRawEmojis(text);
  const lines = cleanText.split('\n').filter((l) => l.trim().length > 0);
  const stepLines = lines.filter((l) => /^\d+\.|\(step\)/i.test(l.trim()));

  if (stepLines.length >= 2) {
    const intro = lines[0] || 'Quyidagi amallarni bajaring:';
    const steps = stepLines.map((line) => {
      const clean = line.replace(/^\d+\.\s*/, '').trim();
      const parts = clean.split(/[-:—]/);
      if (parts.length >= 2) {
        return {
          title: parts[0].replace(/\*\*/g, '').trim(),
          description: parts.slice(1).join(':').replace(/\*\*/g, '').trim(),
        };
      }
      return {
        title: clean.replace(/\*\*/g, '').trim(),
        description: '',
      };
    });
    return { intro: intro.replace(/\*\*/g, '').replace(/[:*]+$/, ''), steps };
  }
  return null;
};

const openAssistant = () => {
  isOpen.value = true;
  scrollToBottom();
};

const closeAssistant = () => {
  isOpen.value = false;
  isExpanded.value = false;
};

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTo({
      top: messagesContainer.value.scrollHeight,
      behavior: 'smooth',
    });
  }
};

const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const formatMessage = (text: string) => {
  if (!text) return '';
  const clean = stripRawEmojis(text);
  const safeText = escapeHtml(clean);
  let formatted = safeText
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-emerald-600 dark:text-emerald-400">$1</strong>')
    .replace(/•\s*(.*?)(?=\n|$)/g, '<div class="flex items-start gap-2 my-1"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></span><span>$1</span></div>');
  return formatted;
};

const copyToClipboard = async (text: string, msgId: string) => {
  try {
    const cleanText = text.replace(/\*\*/g, '');
    await navigator.clipboard.writeText(cleanText);
    copiedMsgId.value = msgId;
    setTimeout(() => {
      if (copiedMsgId.value === msgId) copiedMsgId.value = null;
    }, 2000);
  } catch (e) {}
};

const rateMessage = (msgId: string, rating: 'up' | 'down') => {
  ratedMessages.value[msgId] = rating;
};

const toggleSound = () => {
  isSpeechEnabled.value = !isSpeechEnabled.value;
  if (!isSpeechEnabled.value && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

const speakText = (text: string) => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const cleanText = text.replace(/\*\*/g, '').replace(/[#•\-]/g, '');
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'uz-UZ';
  utterance.rate = 1.0;
  window.speechSynthesis.speak(utterance);
};

import { findBestAnswer } from './ai/useAiFallback';

const sendPrompt = (promptText: string) => {
  inputQuery.value = promptText;
  handleSubmit();
};

const handleSubmit = async () => {
  const q = inputQuery.value.trim();
  if (!q) return;

  // Add user message
  messages.value.push({
    id: String(Date.now()),
    sender: 'user',
    text: q,
    timestamp: new Date(),
  });
  inputQuery.value = '';
  scrollToBottom();

  isTyping.value = true;

  try {
    const chatHistory = messages.value.slice(-6).map((m) => ({ sender: m.sender, text: m.text }));
    const token = localStorage.getItem('ubms_access_token');
    const endpoint = token ? '/ai/query' : '/ai/public-query';
    const { data } = await api.post(endpoint, { query: q, chatHistory });

    if (data?.answer) {
      messages.value.push({
        id: String(Date.now() + 1),
        sender: 'bot',
        text: data.answer,
        actionRoute: data.actionRoute,
        actionText: data.actionText,
        timestamp: new Date(),
      });
    } else {
      const response = findBestAnswer(q);
      messages.value.push({
        id: String(Date.now() + 1),
        sender: 'bot',
        text: response.text,
        actionRoute: response.actionRoute,
        actionText: response.actionText,
        timestamp: new Date(),
      });
    }
  } catch (e) {
    const response = findBestAnswer(q);
    messages.value.push({
      id: String(Date.now() + 1),
      sender: 'bot',
      text: response.text,
      actionRoute: response.actionRoute,
      actionText: response.actionText,
      timestamp: new Date(),
    });
  } finally {
    isTyping.value = false;
    scrollToBottom();
    const lastMsg = messages.value[messages.value.length - 1];
    if (isSpeechEnabled.value && lastMsg?.text) {
      speakText(lastMsg.text);
    }
  }
};

const clearChat = () => {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  messages.value = [defaultWelcomeMessage];
};

const onActionClick = () => {
  if (props.isFloating) {
    isOpen.value = false;
    isExpanded.value = false;
  }
};

onMounted(async () => {
  scrollToBottom();
});
</script>

<style scoped>
.custom-chat-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-chat-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-chat-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.25);
  border-radius: 9999px;
}
.custom-chat-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 116, 139, 0.45);
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
