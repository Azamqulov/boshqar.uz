<template>
  <div
    :class="[
      isFloating
        ? 'fixed bottom-5 right-5 z-40 flex flex-col items-end'
        : 'w-full h-full flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden'
    ]"
  >
    <!-- Floating Trigger Button (when closed) -->
    <button
      v-if="isFloating && !isOpen"
      @click="openAssistant"
      class="group relative flex items-center gap-3 px-4 sm:px-5 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white rounded-full shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 focus:outline-hidden ring-4 ring-emerald-500/20"
      title="Boshqar AI Yordamchi"
    >
      <div class="relative flex items-center justify-center">
        <Sparkles class="w-5 h-5 animate-pulse text-amber-300" />
        <span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full animate-ping" />
      </div>
      <span class="font-bold text-xs sm:text-sm tracking-wide">Boshqar AI</span>
      <span class="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-bold bg-white/20 rounded-full text-emerald-50">Online</span>
    </button>

    <!-- Chat Modal / Window -->
    <div
      v-if="!isFloating || isOpen"
      :class="[
        isFloating
          ? isExpanded
            ? 'fixed inset-4 sm:inset-10 z-50 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200'
            : 'w-[92vw] sm:w-[440px] h-[600px] max-h-[82vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200'
          : 'flex-1 flex flex-col h-full overflow-hidden'
      ]"
    >
      <!-- Chat Header -->
      <div class="px-4 sm:px-5 py-3.5 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white flex items-center justify-between shadow-xs shrink-0 select-none">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner shrink-0">
            <Bot class="w-5 h-5 text-emerald-200" />
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <h3 class="font-extrabold text-sm sm:text-base leading-tight truncate">Boshqar AI</h3>
              <span class="px-2 py-0.5 text-[10px] font-bold bg-emerald-400/25 text-emerald-100 border border-emerald-300/30 rounded-full">Assistant v2.0</span>
            </div>
            <p class="text-[11px] text-emerald-100/80 truncate">Tizim bo'yicha yo'riqnoma va maslahatchi</p>
          </div>
        </div>

        <div class="flex items-center gap-1">
          <!-- Voice Output Toggle -->
          <button
            @click="toggleSound"
            :class="[
              'p-2 rounded-xl transition-colors',
              isSpeechEnabled ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-emerald-200'
            ]"
            :title="isSpeechEnabled ? 'Ovozli javob yoqilgan' : 'Ovozli javobni yoqish'"
          >
            <Volume2 v-if="isSpeechEnabled" class="w-4 h-4" />
            <VolumeX v-else class="w-4 h-4" />
          </button>

          <!-- Expand / Minimize Window (Floating mode only) -->
          <button
            v-if="isFloating"
            @click="isExpanded = !isExpanded"
            class="p-2 hover:bg-white/10 rounded-xl text-emerald-100 transition-colors hidden sm:inline-flex"
            :title="isExpanded ? 'Kichraytirish' : 'Kattalashtirish'"
          >
            <Minimize2 v-if="isExpanded" class="w-4 h-4" />
            <Maximize2 v-else class="w-4 h-4" />
          </button>

          <!-- Reset / Clear Chat -->
          <button
            @click="clearChat"
            class="p-2 hover:bg-white/10 rounded-xl text-emerald-100 transition-colors"
            title="Suhbatni tozalash"
          >
            <RotateCcw class="w-4 h-4" />
          </button>

          <!-- Close button -->
          <button
            v-if="isFloating"
            @click="closeAssistant"
            class="p-2 hover:bg-white/10 rounded-xl text-emerald-100 transition-colors"
            title="Yopish"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Quick Prompt Suggestions Bar with Smooth Scroll -->
      <div class="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
            <HelpCircle class="w-3.5 h-3.5 text-emerald-500" />
            Tezkor savollar:
          </span>
          <span class="text-[10px] text-slate-400">Tanlang:</span>
        </div>

        <div class="flex items-center gap-2 overflow-x-auto pb-1 custom-chat-scrollbar">
          <button
            v-for="(prompt, idx) in quickPrompts"
            :key="idx"
            @click="sendPrompt(prompt.text)"
            class="shrink-0 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all duration-150 shadow-2xs whitespace-nowrap active:scale-95"
          >
            {{ prompt.text }}
          </button>
        </div>
      </div>

      <!-- Messages Area -->
      <div
        ref="messagesContainer"
        class="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-50/60 dark:bg-slate-950/50 custom-chat-scrollbar"
      >
        <!-- Message Bubbles -->
        <div
          v-for="msg in messages"
          :key="msg.id"
          :class="[
            'flex gap-3 max-w-[94%] sm:max-w-[85%]',
            msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
          ]"
        >
          <!-- Avatar -->
          <div
            :class="[
              'w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold shadow-xs',
              msg.sender === 'user'
                ? 'bg-slate-800 text-white'
                : 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white'
            ]"
          >
            <User v-if="msg.sender === 'user'" class="w-4 h-4" />
            <Sparkles v-else class="w-4 h-4 text-amber-300" />
          </div>

          <!-- Bubble Content -->
          <div
            :class="[
              'rounded-3xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-sm space-y-2.5',
              msg.sender === 'user'
                ? 'bg-emerald-600 text-white rounded-tr-xs'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/90 dark:border-slate-700/80 rounded-tl-xs'
            ]"
          >
            <!-- Render markdown text -->
            <div class="whitespace-pre-wrap select-text space-y-1.5" v-html="formatMessage(msg.text)" />

            <!-- Utility footer for bot messages (Copy, Voice, Action button) -->
            <div
              v-if="msg.sender === 'bot'"
              class="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2 flex-wrap"
            >
              <!-- Copy & Audio Buttons -->
              <div class="flex items-center gap-1">
                <button
                  @click="copyToClipboard(msg.text, msg.id)"
                  class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/60 transition"
                  title="Nusxa olish"
                >
                  <Check v-if="copiedMsgId === msg.id" class="w-3.5 h-3.5 text-emerald-500" />
                  <Copy v-else class="w-3.5 h-3.5" />
                  <span>{{ copiedMsgId === msg.id ? 'Nusxalandi' : 'Nusxa' }}</span>
                </button>

                <button
                  @click="speakText(msg.text)"
                  class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/60 transition"
                  title="Ovoz chiqarib o'qish"
                >
                  <Volume2 class="w-3.5 h-3.5" />
                  <span>O'qish</span>
                </button>
              </div>

              <!-- Direct Action Link Button -->
              <router-link
                v-if="msg.actionRoute"
                :to="msg.actionRoute"
                @click="onActionClick"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-xs"
              >
                <span>{{ msg.actionText || "Sahifaga o'tish" }}</span>
                <ArrowRight class="w-3.5 h-3.5" />
              </router-link>
            </div>
          </div>
        </div>

        <!-- Typing Indicator -->
        <div v-if="isTyping" class="flex gap-3 mr-auto max-w-[85%]">
          <div class="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-xs">
            <Sparkles class="w-4 h-4 text-amber-300" />
          </div>
          <div class="bg-white dark:bg-slate-800 rounded-3xl rounded-tl-xs px-4 py-3 border border-slate-200 dark:border-slate-700/80 shadow-xs flex items-center gap-2">
            <span class="text-xs text-slate-400 font-medium">Boshqar AI javob tayyorlamoqda...</span>
            <div class="flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style="animation-delay: 0ms" />
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style="animation-delay: 150ms" />
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style="animation-delay: 300ms" />
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Input Form -->
      <form @submit.prevent="handleSubmit" class="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0">
        <div class="relative flex-1">
          <input
            v-model="inputQuery"
            type="text"
            placeholder="Istalgan savolni yozing (masalan: Chek qanday uriladi, qarzni qanday yopaman...)"
            class="w-full pl-4 pr-10 py-3 text-xs sm:text-sm rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition shadow-inner"
          />
          <button
            v-if="inputQuery"
            type="button"
            @click="inputQuery = ''"
            class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          type="submit"
          :disabled="!inputQuery.trim() || isTyping"
          class="px-4 sm:px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 shrink-0"
        >
          <span class="hidden sm:inline text-xs font-bold">Yuborish</span>
          <Send class="w-4 h-4" />
        </button>
      </form>
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
  HelpCircle,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Copy,
  Check,
} from 'lucide-vue-next';
import { AI_QUICK_PROMPTS, AI_KNOWLEDGE_BASE, GUIDE_MODULES } from '../views/guide/guideData';

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
const inputQuery = ref('');
const isTyping = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);
const quickPrompts = ref(AI_QUICK_PROMPTS);

const defaultWelcomeMessage: ChatMessage = {
  id: 'welcome',
  sender: 'bot',
  text: `Assalomu alaykum! Men **Boshqar AI** aqlli yordamchisiman. 🤖✨

Boshqar.uz tizimidan foydalanishda (Kassa, Ombor, Moliya, Nasiya, Restoran, Xizmatlar yoki Sozlamalar) qanday savolingiz bo‘lsa, menga bemalol yozing!`,
  timestamp: new Date(),
};

const messages = ref<ChatMessage[]>([defaultWelcomeMessage]);

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

const formatMessage = (text: string) => {
  // Convert markdown bold **text** to <strong>
  let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-emerald-600 dark:text-emerald-400">$1</strong>');
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
  } catch (e) {
    // ignore
  }
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

const findBestAnswer = (query: string) => {
  const normalized = query.toLowerCase().trim();
  const queryTokens = normalized.split(/\s+/).filter((w) => w.length > 1);

  // 1. Check for Greetings & Conversational queries
  const greetingKeywords = ['salom', 'assalom', 'assalomu', 'privet', 'hello', 'hey', 'qalesiz', 'qalaysiz', 'qalesan', 'kimsan', 'yordamchi', 'qandaysiz', 'yaxshimisiz'];
  if (greetingKeywords.some((g) => normalized.includes(g))) {
    return {
      text: `**Assalomu alaykum!** Men **Boshqar AI** aqlli yordamchisiman. 🤖✨\n\nBoshqar.uz tizimidan foydalanish bo‘yicha (Kassa, Omborxona, Moliya, Nasiya/Mijozlar, Restoran, Xizmatlar yoki Sozlamalar) qanday savolingiz bo‘lsa, bemalol yozing! Har bir amalni aniq va bosqichma-bosqich ko‘rsatib beraman.`,
      actionRoute: '/pos',
      actionText: 'Kassa (POS) ga o‘tish',
    };
  }

  const thanksKeywords = ['rahmat', 'katta rahmat', 'tushunarli', 'spasibo', 'tashakkur', 'raxmat', 'zo\'r', 'zo‘r', 'yaxshi'];
  if (thanksKeywords.some((t) => normalized.includes(t))) {
    return {
      text: `**Arzimaydi!** Sizga yordam berganimdan bag‘oyat xursandman. 😊✨\n\nAgar yana biror narsaga tushunmasangiz yoki savol tug‘ilsa, bemalol yozing. Ishlaringizga omad va baraka tilayman! 🚀`,
      actionRoute: '/guide',
      actionText: 'To‘liq Qo‘llanma',
    };
  }

  // 2. Check Module FAQs directly
  for (const mod of GUIDE_MODULES) {
    for (const faq of mod.faq) {
      const qNorm = faq.q.toLowerCase();
      const matchCount = queryTokens.filter((t) => qNorm.includes(t)).length;
      if (matchCount >= 2 || normalized.includes(qNorm) || qNorm.includes(normalized)) {
        return {
          text: `**${faq.q}**\n\n${faq.a}\n\n• *Bo‘lim: ${mod.title}*`,
          actionRoute: mod.route,
          actionText: `${mod.title} sahifasiga o‘tish`,
        };
      }
    }
  }

  // 3. Ranked scoring in AI_KNOWLEDGE_BASE
  let bestKnowledgeItem: any = null;
  let highestKnowledgeScore = 0;

  for (const item of AI_KNOWLEDGE_BASE) {
    let score = 0;
    for (const kw of item.keywords) {
      const kwLower = kw.toLowerCase();
      if (normalized.includes(kwLower)) {
        score += kwLower.split(/\s+/).length * 4; // exact phrase match gets high score
      } else {
        const tokenHits = queryTokens.filter((t) => kwLower.includes(t) || t.includes(kwLower)).length;
        score += tokenHits * 2;
      }
    }

    if (score > highestKnowledgeScore) {
      highestKnowledgeScore = score;
      bestKnowledgeItem = item;
    }
  }

  if (bestKnowledgeItem && highestKnowledgeScore >= 3) {
    return {
      text: bestKnowledgeItem.answer,
      actionRoute: bestKnowledgeItem.actionRoute,
      actionText: bestKnowledgeItem.actionText,
    };
  }

  // 4. Ranked scoring in GUIDE_MODULES (Steps & Titles)
  let bestMod: any = null;
  let highestModScore = 0;

  for (const mod of GUIDE_MODULES) {
    let score = 0;
    if (normalized.includes(mod.id)) score += 5;
    if (normalized.includes(mod.title.toLowerCase())) score += 6;
    if (normalized.includes(mod.badge.toLowerCase())) score += 4;

    for (const step of mod.steps) {
      const stepText = (step.title + ' ' + step.description).toLowerCase();
      const hits = queryTokens.filter((t) => stepText.includes(t)).length;
      score += hits * 1.5;
    }

    if (score > highestModScore) {
      highestModScore = score;
      bestMod = mod;
    }
  }

  if (bestMod && highestModScore >= 4) {
    const stepSummary = bestMod.steps.map((s: any) => `• **${s.title}**: ${s.description}`).join('\n\n');
    return {
      text: `**${bestMod.title} bo‘yicha qo‘llanma:**\n\n${stepSummary}`,
      actionRoute: bestMod.route,
      actionText: `${bestMod.title} sahifasiga o‘tish`,
    };
  }

  // 5. Fallback smart generic guide with clear navigation
  return {
    text: `Ushbu savol bo‘yicha to‘liqroq ma’lumot olish uchun **Qo‘llanma** bo‘limidagi modullarni ko‘rib chiqishingiz yoki quyidagi asosiy bo‘limlardan biriga o‘tishingiz mumkin:\n\n• **Kassa (POS)** — Tezkor sotuv va cheklar\n• **Mahsulotlar** — Yangi tovar va kategoriyalar\n• **Moliya** — Kunlik hisobot va xarajatlar\n• **Mijozlar** — Nasiya va qarz daftari\n• **Sozlamalar** — Xodimlar va ruxsatlar`,
    actionRoute: '/guide',
    actionText: 'To‘liq Qo‘llanmani ochish',
  };
};

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

  // Simulate AI typing delay
  isTyping.value = true;
  await new Promise((resolve) => setTimeout(resolve, 400));

  const response = findBestAnswer(q);
  isTyping.value = false;

  messages.value.push({
    id: String(Date.now() + 1),
    sender: 'bot',
    text: response.text,
    actionRoute: response.actionRoute,
    actionText: response.actionText,
    timestamp: new Date(),
  });

  scrollToBottom();

  if (isSpeechEnabled.value) {
    speakText(response.text);
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

onMounted(() => {
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
</style>
