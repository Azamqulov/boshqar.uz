<template>
  <section id="telegram" class="py-20 relative overflow-hidden bg-slate-100/70 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800/80">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <!-- Section Heading -->
      <div data-aos="fade-up" class="text-center max-w-3xl mx-auto space-y-4 mb-14">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
          <Send class="w-3.5 h-3.5" />
          <span>Telegram Bot Integratsiyasi</span>
        </div>
        <h2 class="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Biznesingiz Cho'ntagingizda: <br class="hidden sm:inline" />
          <span class="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-400 bg-clip-text text-transparent">
            Har Bir Chek va Kunlik Hisobot Telegramda
          </span>
        </h2>
        <p class="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
          Do'konda bo'lmasangiz ham kassadagi har bir savdo, kassa yopilishi va kam qolgan tovarlar haqida Telegram orqali real vaqtda xabardor bo'ling.
        </p>
      </div>

      <!-- Simulator Layout: Left Controls, Right Authentic iPhone Device -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <!-- Left Side: Feature Badges & Interactive Buttons -->
        <div data-aos="fade-right" class="lg:col-span-7 space-y-6">
          <div class="space-y-3">
            <h3 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              O'zingiz Sinab Ko'ring
            </h3>
            <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Quyidagi tugmalarni bosib, do'konda savdo bo'lganda yoki botga buyruq berganda qanday xabarlar kelishini jonli simulyatsiyada ko'ring:
            </p>
          </div>

          <!-- Interactive Action Buttons -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              @click="userTriggerSimulate('sale')"
              class="p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center gap-3.5"
              :class="activeAction === 'sale' 
                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-950 dark:text-white shadow-md shadow-emerald-500/10 scale-[1.02]' 
                : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200'"
            >
              <div class="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Receipt class="w-5 h-5" />
              </div>
              <div>
                <div class="text-sm font-bold text-slate-900 dark:text-white">Yangi Savdo Cheki</div>
                <div class="text-xs text-slate-500 dark:text-slate-400">Har bir xaridda bildirishnoma</div>
              </div>
            </button>

            <button
              type="button"
              @click="userTriggerSimulate('daily')"
              class="p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center gap-3.5"
              :class="activeAction === 'daily' 
                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-950 dark:text-white shadow-md shadow-emerald-500/10 scale-[1.02]' 
                : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200'"
            >
              <div class="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <BarChart3 class="w-5 h-5" />
              </div>
              <div>
                <div class="text-sm font-bold text-slate-900 dark:text-white">Kunlik 21:00 Hisobot</div>
                <div class="text-xs text-slate-500 dark:text-slate-400">Kunlik jami tushum va foyda</div>
              </div>
            </button>

            <button
              type="button"
              @click="userTriggerSimulate('low_stock')"
              class="p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center gap-3.5"
              :class="activeAction === 'low_stock' 
                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-950 dark:text-white shadow-md shadow-emerald-500/10 scale-[1.02]' 
                : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200'"
            >
              <div class="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <AlertTriangle class="w-5 h-5" />
              </div>
              <div>
                <div class="text-sm font-bold text-slate-900 dark:text-white">Kam Qolgan Tovar</div>
                <div class="text-xs text-slate-500 dark:text-slate-400">Tugayotgan tovarlar signali</div>
              </div>
            </button>

            <button
              type="button"
              @click="userTriggerSimulate('shift')"
              class="p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center gap-3.5"
              :class="activeAction === 'shift' 
                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-950 dark:text-white shadow-md shadow-emerald-500/10 scale-[1.02]' 
                : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200'"
            >
              <div class="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <ShieldCheck class="w-5 h-5" />
              </div>
              <div>
                <div class="text-sm font-bold text-slate-900 dark:text-white">Smena Yopilishi</div>
                <div class="text-xs text-slate-500 dark:text-slate-400">Kassir hisoboti va farq</div>
              </div>
            </button>
          </div>

          <!-- Features List -->
          <div class="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-300">
            <div class="flex items-center gap-2">
              <CheckCircle2 class="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Bir nechta xodimga ulanadi</span>
            </div>
            <div class="flex items-center gap-2">
              <CheckCircle2 class="w-4 h-4 text-emerald-500 shrink-0" />
              <span>1 daqiqada oson ulanish</span>
            </div>
            <div class="flex items-center gap-2">
              <CheckCircle2 class="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Internet past bo'lsa ham ishlaydi</span>
            </div>
            <div class="flex items-center gap-2">
              <CheckCircle2 class="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Bot orqali tovar qidirish</span>
            </div>
          </div>

          <!-- Green Telegram Connect CTA Buttons -->
          <div class="pt-2 flex flex-wrap items-center gap-3">
            <a
              href="https://t.me/Boshqar_uzbot"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Send class="w-4 h-4" />
              <span>Telegramdan Boshlash</span>
            </a>
            <router-link
              to="/telegram-bot"
              class="inline-flex items-center gap-1.5 px-6 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-500 font-bold text-xs sm:text-sm transition"
            >
              <span>Telegram Bot Imkoniyatlari</span>
              <ArrowRight class="w-3.5 h-3.5" />
            </router-link>
          </div>
        </div>

        <!-- Right Side: Exact Authentic iPhone Device Frame -->
        <div data-aos="fade-left" data-aos-delay="150" class="lg:col-span-5 flex justify-center py-4">
          <!-- iPhone Outer Body with Hardware Buttons -->
          <div class="relative max-w-[310px] w-full select-none">
            <!-- Hardware Buttons on Left Side (Action, Vol+, Vol-) -->
            <div class="absolute -left-[5px] top-[95px] w-[5px] h-[22px] bg-slate-800 dark:bg-slate-700 rounded-l-sm"></div>
            <div class="absolute -left-[5px] top-[135px] w-[5px] h-[40px] bg-slate-800 dark:bg-slate-700 rounded-l-sm"></div>
            <div class="absolute -left-[5px] top-[185px] w-[5px] h-[40px] bg-slate-800 dark:bg-slate-700 rounded-l-sm"></div>

            <!-- Hardware Power Button on Right Side -->
            <div class="absolute -right-[5px] top-[140px] w-[5px] h-[55px] bg-slate-800 dark:bg-slate-700 rounded-r-sm"></div>

            <!-- iPhone Main Outer Frame -->
            <div class="bg-black rounded-[50px] p-[10px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35),0_0_0_1px_rgba(0,0,0,0.8)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.1)] transition-all">
              
              <!-- iPhone Glass Screen Bezels -->
              <div class="bg-[#f2f4f7] dark:bg-[#0f1822] rounded-[42px] overflow-hidden flex flex-col h-[520px] font-sans text-xs relative transition-colors duration-300">
                
                <!-- iOS Top Status Bar with Dynamic Island -->
                <div class="bg-white/95 dark:bg-[#17212b]/95 backdrop-blur-md px-6 pt-3 pb-2 border-b border-slate-200/80 dark:border-slate-800/80 shrink-0 z-30 transition-colors duration-300">
                  <div class="flex items-center justify-between">
                    <!-- Left: Time (9:41) -->
                    <span class="text-[12px] font-bold font-mono tracking-tight text-slate-900 dark:text-white">9:41</span>

                    <!-- Center: Authentic Dynamic Island -->
                    <div class="w-[92px] h-[22px] bg-black rounded-full flex items-center justify-end px-2.5 shadow-sm">
                      <div class="w-2.5 h-2.5 rounded-full bg-[#111] border border-[#222] flex items-center justify-center">
                        <div class="w-1 h-1 rounded-full bg-[#1a233a]"></div>
                      </div>
                    </div>

                    <!-- Right: iOS Icons -->
                    <div class="flex items-center gap-1.5 text-slate-900 dark:text-white">
                      <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <rect x="2" y="16" width="3" height="6" rx="1" />
                        <rect x="7" y="12" width="3" height="10" rx="1" />
                        <rect x="12" y="8" width="3" height="14" rx="1" />
                        <rect x="17" y="4" width="3" height="18" rx="1" />
                      </svg>
                      <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 18c-.8 0-1.5.7-1.5 1.5S11.2 21 12 21s1.5-.7 1.5-1.5S12.8 18 12 18zm-4.9-3.2c2.7-2.4 7.1-2.4 9.8 0l1.4-1.4c-3.5-3.1-9.1-3.1-12.6 0l1.4 1.4zm-2.8-2.8c4.3-3.8 11.1-3.8 15.4 0l1.4-1.4c-5.1-4.5-13.1-4.5-18.2 0l1.4 1.4z" />
                      </svg>
                      <div class="w-5 h-2.5 rounded-[4px] border border-current p-[1px] flex items-center relative">
                        <div class="h-full w-[80%] bg-emerald-500 rounded-[2px]"></div>
                        <div class="w-0.5 h-1.5 bg-current rounded-r-[1px] absolute -right-[2.5px] top-0.5"></div>
                      </div>
                    </div>
                  </div>

                  <!-- Telegram Bot Profile Bar -->
                  <div class="flex items-center justify-between pt-2">
                    <div class="flex items-center gap-2">
                      <div class="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-xs text-white shadow-xs">
                        B
                      </div>
                      <div>
                        <div class="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1">
                          <span>Boshqar.uz Bot</span>
                          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        </div>
                        <div class="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">bot • hisobotchi</div>
                      </div>
                    </div>
                    <span class="text-[10px] font-mono text-slate-500 dark:text-slate-400">{{ currentTime }}</span>
                  </div>
                </div>

                <!-- Telegram Messages Stream (Clean Professional Layout) -->
                <div ref="chatContainer" class="flex-1 p-3 space-y-2.5 overflow-y-auto bg-[#eef1f5] dark:bg-gradient-to-b dark:from-[#0e1621] dark:to-[#17212b] transition-colors duration-300">
                  <!-- Welcome Bot Message -->
                  <div class="flex flex-col items-start max-w-[92%]">
                    <div class="bg-white dark:bg-[#2b5278] text-slate-800 dark:text-white p-2.5 rounded-2xl rounded-tl-xs shadow-xs border border-slate-200/80 dark:border-transparent space-y-1 text-[11px] leading-relaxed">
                      <p class="font-bold text-emerald-600 dark:text-sky-200">boshqar.uz botiga xush kelibsiz!</p>
                      <p class="text-[10px] text-slate-600 dark:text-slate-200">
                        "Baraka Market" tizimga ulandi. Savdo va hisobotlar shu yerga keladi.
                      </p>
                      <div class="text-[9px] text-slate-400 dark:text-sky-300/80 flex items-center justify-end gap-1">
                        <span>09:00</span>
                        <CheckCheck class="w-3 h-3 text-sky-400 inline" />
                      </div>
                    </div>
                  </div>

                  <!-- Dynamic Messages List -->
                  <div
                    v-for="(msg, idx) in messages"
                    :key="idx"
                    class="flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300"
                    :class="msg.isUser ? 'items-end' : 'items-start max-w-[95%]'"
                  >
                    <!-- User Message Bubble -->
                    <div
                      v-if="msg.isUser"
                      class="bg-emerald-600 dark:bg-[#2b5278] text-white px-3 py-1 rounded-2xl rounded-tr-xs shadow-xs text-[11px]"
                    >
                      <span>{{ msg.text }}</span>
                      <div class="text-[8px] text-emerald-200 dark:text-sky-200/80 flex items-center justify-end gap-0.5 mt-0.5">
                        <span>{{ msg.time }}</span>
                        <CheckCheck class="w-2.5 h-2.5 text-emerald-200 dark:text-sky-200/80 inline" />
                      </div>
                    </div>

                    <!-- Bot Response Card Bubble -->
                    <div
                      v-else
                      class="bg-white dark:bg-[#182533] border border-slate-200/90 dark:border-slate-700/60 text-slate-900 dark:text-white p-2.5 rounded-2xl rounded-tl-xs shadow-xs space-y-1 text-[10.5px] leading-relaxed"
                    >
                      <div v-html="msg.html"></div>
                      <div class="text-[8.5px] text-slate-400 dark:text-slate-400 flex items-center justify-end gap-0.5 pt-0.5">
                        <span>{{ msg.time }}</span>
                        <CheckCheck class="w-2.5 h-2.5 text-slate-400 inline" />
                      </div>
                    </div>
                  </div>

                  <!-- Typing indicator -->
                  <div v-if="isTyping" class="flex items-center gap-1.5 bg-white dark:bg-[#182533] border border-slate-200 dark:border-slate-700/60 px-2.5 py-1.5 rounded-xl text-slate-500 dark:text-slate-400 w-fit text-[10px] shadow-xs">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce"></span>
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]"></span>
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]"></span>
                    <span class="ml-1">yozmoqda...</span>
                  </div>
                </div>

                <!-- Telegram Bottom Command Keyboard Bar -->
                <div class="bg-white dark:bg-[#17212b] p-1.5 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-1 shrink-0 z-20 transition-colors duration-300">
                  <button
                    type="button"
                    @click="triggerCommand('/savdo')"
                    class="py-1.5 px-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/15 dark:hover:bg-emerald-600/30 text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400 transition cursor-pointer text-center"
                  >
                    /savdo
                  </button>
                  <button
                    type="button"
                    @click="triggerCommand('/hisobot')"
                    class="py-1.5 px-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/15 dark:hover:bg-emerald-600/30 text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400 transition cursor-pointer text-center"
                  >
                    /hisobot
                  </button>
                  <button
                    type="button"
                    @click="triggerCommand('/ombor')"
                    class="py-1.5 px-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/15 dark:hover:bg-emerald-600/30 text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400 transition cursor-pointer text-center"
                  >
                    /ombor
                  </button>
                </div>

                <!-- Authentic iPhone Bottom Home Bar Indicator -->
                <div class="bg-white dark:bg-[#17212b] pb-2 pt-1 flex justify-center shrink-0">
                  <div class="w-32 h-1 bg-slate-900 dark:bg-slate-300 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Teaser See More Button -->
      <LandingSeeMoreButton
        v-if="variant === 'teaser'"
        to="/telegram-bot"
        label="Telegram Bot imkoniyatlarini to'liq ko'rish"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import LandingSeeMoreButton from './LandingSeeMoreButton.vue';
import {
  Send,
  Receipt,
  BarChart3,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  CheckCheck,
} from 'lucide-vue-next';

withDefaults(defineProps<{
  variant?: 'teaser' | 'full';
}>(), {
  variant: 'full',
});

interface BotMessage {
  isUser: boolean;
  text?: string;
  html?: string;
  time: string;
}

const activeAction = ref<string>('sale');
const isTyping = ref<boolean>(false);
const chatContainer = ref<HTMLElement | null>(null);
const currentTime = ref<string>('09:48');

const actionsList = ['sale', 'daily', 'low_stock', 'shift'];
let autoSimTimer: any = null;
const isUserInteracting = ref(false);

const messages = ref<BotMessage[]>([
  {
    isUser: false,
    html: `<b>Yangi Savdo Cheki #4821</b><br/><br/>
<b>Summa:</b> <b class="text-emerald-600 dark:text-emerald-400">145 000 so'm</b><br/>
<b>To'lov:</b> Naqd pul<br/>
<b>Mijoz:</b> Alisher Qodirov<br/><br/>
<b>Tarkibi:</b><br/>
  • Coca-Cola 1.5L × 2 = 28 000 so'm<br/>
  • Kungaboqar yog'i 1L × 1 = 18 000 so'm<br/>
  • Go'sht (Mol lahm) 1kg = 99 000 so'm<br/><br/>
<i>09:38</i>`,
    time: '09:38',
  },
]);

const scrollToBottom = async () => {
  await nextTick();
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
};

const getNowTime = () => {
  return new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
};

const simulateMessage = (type: string) => {
  activeAction.value = type;
  isTyping.value = true;
  scrollToBottom();

  setTimeout(() => {
    isTyping.value = false;
    const t = getNowTime();

    if (type === 'sale') {
      const orderNum = Math.floor(1000 + Math.random() * 9000);
      messages.value.push({
        isUser: false,
        html: `<b>Yangi Savdo Cheki #${orderNum}</b><br/><br/>
<b>Summa:</b> <b class="text-emerald-600 dark:text-emerald-400">280 000 so'm</b><br/>
<b>To'lov:</b> Karta / Uzum<br/>
<b>Mijoz:</b> Jamshid Shokirov<br/><br/>
<b>Tarkibi:</b><br/>
  • Shakar 5kg × 1 = 65 000 so'm<br/>
  • Guruch (Lazer) 3kg = 75 000 so'm<br/>
  • Choy (Akbar) 200g × 2 = 40 000 so'm<br/>
  • Pishloq (Golland) 0.5kg = 100 000 so'm<br/><br/>
<i>${t}</i>`,
        time: t,
      });
    } else if (type === 'daily') {
      messages.value.push({
        isUser: false,
        html: `<b>Kunlik 21:00 Hisobot — "Baraka Market"</b><br/><br/>
<b>Jami Savdo:</b> <b class="text-emerald-600 dark:text-emerald-400">8 450 000 so'm</b><br/>
<b>Cheklar:</b> 142 ta (Naqd: 5.2M, Karta: 2.75M, Nasiya: 500k)<br/>
<b>Chiqimlar:</b> 400 000 so'm<br/>
<b>Sof Foyda:</b> <b class="text-emerald-600 dark:text-emerald-400">1 860 000 so'm (22%)</b><br/><br/>
<b>Top tovar:</b> Non (110 dona), Coca-Cola (45 dona)`,
        time: t,
      });
    } else if (type === 'low_stock') {
      messages.value.push({
        isUser: false,
        html: `<b>DIQQAT: Mahsulot kam qoldi</b><br/><br/>
<b>Nomi:</b> Kungaboqar yog'i (Zolotaya Semechka 1L)<br/>
<b>Joriy qoldiq:</b> <b class="text-rose-600 dark:text-rose-400">3 dona</b><br/>
<b>Minimal chegara:</b> 10 dona<br/><br/>
<i>Ta'minotchiga yangi partiya buyurtma bering</i>`,
        time: t,
      });
    } else if (type === 'shift') {
      messages.value.push({
        isUser: false,
        html: `<b>Kassa Smenasi Yopildi (X-Z Hisoboti)</b><br/><br/>
<b>Filial:</b> Asosiy do'kon (Kassir: Rustam)<br/>
<b>Smena:</b> 08:30 — ${t}<br/>
<b>Jami tushum:</b> 6 200 000 so'm (98 ta chek)<br/>
<b>Naqd qoldiq:</b> 4 100 000 so'm<br/>
<b>Kassa farqi:</b> <b class="text-emerald-600 dark:text-emerald-400">To'liq mos (0 so'm)</b>`,
        time: t,
      });
    }

    // Keep chat message history clean (max 4 messages)
    if (messages.value.length > 4) {
      messages.value.shift();
    }

    scrollToBottom();
  }, 600);
};

const userTriggerSimulate = (type: string) => {
  isUserInteracting.value = true;
  simulateMessage(type);
  setTimeout(() => {
    isUserInteracting.value = false;
  }, 8000);
};

const triggerCommand = (cmd: string) => {
  isUserInteracting.value = true;
  const t = getNowTime();
  messages.value.push({
    isUser: true,
    text: cmd,
    time: t,
  });

  if (cmd === '/savdo') {
    simulateMessage('sale');
  } else if (cmd === '/hisobot') {
    simulateMessage('daily');
  } else if (cmd === '/ombor') {
    simulateMessage('low_stock');
  }

  setTimeout(() => {
    isUserInteracting.value = false;
  }, 8000);
};

function startAutoSimulation() {
  stopAutoSimulation();
  autoSimTimer = setInterval(() => {
    if (!isUserInteracting.value) {
      const idx = actionsList.indexOf(activeAction.value);
      const nextIdx = (idx + 1) % actionsList.length;
      simulateMessage(actionsList[nextIdx]);
    }
  }, 4000);
}

function stopAutoSimulation() {
  if (autoSimTimer) {
    clearInterval(autoSimTimer);
    autoSimTimer = null;
  }
}

onMounted(() => {
  currentTime.value = getNowTime();
  startAutoSimulation();
});

onUnmounted(() => {
  stopAutoSimulation();
});
</script>
