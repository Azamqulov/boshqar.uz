<template>
  <div class="space-y-6">
    <!-- Header Banner: Pure Emerald Brand Theme, No Emojis, 100% Lucide Icons -->
    <div class="p-4 sm:p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div class="flex items-start gap-3.5">
        <div class="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/25">
          <Bot class="w-6 h-6" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white">boshqar.uz Telegram Bot</h3>
            <span
              class="px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5"
              :class="status.isConnected ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="status.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'"></span>
              <span>{{ status.isConnected ? 'Faol (Ulangan)' : 'Ulanmagan' }}</span>
            </span>
          </div>
          <p class="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
            Real vaqtda har bir savdo cheki, kunlik 21:00 yakuniy hisoboti va omborda tovar tugash arafasidagi ogohlantirishlarni to'g'ridan-to'g'ri Telegramingizda qabul qiling.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2 w-full md:w-auto shrink-0">
        <button
          v-if="status.isConnected"
          type="button"
          @click="sendTestMessage"
          :disabled="testingMessage"
          class="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition shadow-xs flex items-center gap-1.5 btn-interactive"
        >
          <Send class="w-3.5 h-3.5 text-emerald-500" />
          <span>{{ testingMessage ? 'Yuborilmoqda...' : 'Sinov Xabari' }}</span>
        </button>

        <button
          v-if="status.isConnected"
          type="button"
          @click="disconnectBot"
          :disabled="disconnecting"
          class="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 transition shadow-xs flex items-center gap-1.5 btn-interactive"
        >
          <Unlink class="w-3.5 h-3.5" />
          <span>{{ disconnecting ? 'Uzilmoqda...' : 'Botni Uzish' }}</span>
        </button>

        <button
          v-else
          type="button"
          @click="openConnectFlow"
          :disabled="generatingLink"
          class="w-full md:w-auto px-4 py-2.5 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2 btn-interactive"
        >
          <Bot class="w-4 h-4" />
          <span>{{ generatingLink ? 'Havola olinmoqda...' : 'Telegram Botni Ulash' }}</span>
        </button>
      </div>
    </div>

    <!-- Connected Status Details Card -->
    <div v-if="status.isConnected" class="glass-card rounded-2xl p-4 sm:p-5 space-y-4">
      <div class="flex items-center justify-between">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Ulangan Telegram Akkaunt</h4>
        <span class="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
          <ShieldCheck class="w-4 h-4" />
          <span>Xavfsiz ulangan</span>
        </span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
          <span class="text-[10px] text-slate-400 font-semibold block">Telegram Chat ID</span>
          <span class="text-sm font-mono font-bold text-slate-900 dark:text-white">{{ status.chatId }}</span>
        </div>
        <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
          <span class="text-[10px] text-slate-400 font-semibold block">Foydalanuvchi</span>
          <span class="text-sm font-bold text-emerald-600 dark:text-emerald-400">{{ status.username ? '@' + status.username : 'Biriktirilgan' }}</span>
        </div>
        <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
          <span class="text-[10px] text-slate-400 font-semibold block">Ulangan sana</span>
          <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">{{ formatDate(status.connectedAt) }}</span>
        </div>
      </div>
    </div>

    <!-- Notification Preferences Form -->
    <div class="glass-card rounded-2xl p-4 sm:p-6 space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h4 class="text-sm font-black text-slate-900 dark:text-white">Qaysi xabarlar yuborilsin?</h4>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Kerakli bildirishnoma turlarini yoqing yoki o'chiring</p>
        </div>
        <button
          type="button"
          @click="saveSettings"
          :disabled="savingSettings"
          class="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition shadow-sm btn-interactive"
        >
          {{ savingSettings ? 'Saqlanmoqda...' : 'Sozlamalarni Saqlash' }}
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
        <!-- 1. Orders -->
        <div
          @click="settingsForm.notifyOnOrder = !settingsForm.notifyOnOrder"
          class="p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3.5 select-none"
          :class="settingsForm.notifyOnOrder ? 'bg-emerald-500/5 border-emerald-500/40 dark:bg-emerald-950/20' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 opacity-80'"
        >
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <Receipt class="w-4 h-4" />
            </div>
            <div class="space-y-0.5">
              <span class="text-xs font-bold text-slate-900 dark:text-white block">Yangi Savdolar & Cheklar</span>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Kassada har bir chek urilganda xaridor, tovarlar ro'yxati va summa haqida darhol xabar keladi.
              </p>
            </div>
          </div>

          <!-- Toggle Switch -->
          <button
            type="button"
            @click.stop="settingsForm.notifyOnOrder = !settingsForm.notifyOnOrder"
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
            :class="settingsForm.notifyOnOrder ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'"
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out"
              :class="settingsForm.notifyOnOrder ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>

        <!-- 2. Daily Summary -->
        <div
          @click="settingsForm.notifyDailySummary = !settingsForm.notifyDailySummary"
          class="p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3.5 select-none"
          :class="settingsForm.notifyDailySummary ? 'bg-emerald-500/5 border-emerald-500/40 dark:bg-emerald-950/20' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 opacity-80'"
        >
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <Calendar class="w-4 h-4" />
            </div>
            <div class="space-y-0.5">
              <span class="text-xs font-bold text-slate-900 dark:text-white block">Kunlik 21:00 Yakuniy Hisobot</span>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Har kuni kechki soat 21:00 da kunlik jami tushum, xarajatlar va sof foyda hisoboti avtomatik yuboriladi.
              </p>
            </div>
          </div>

          <!-- Toggle Switch -->
          <button
            type="button"
            @click.stop="settingsForm.notifyDailySummary = !settingsForm.notifyDailySummary"
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
            :class="settingsForm.notifyDailySummary ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'"
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out"
              :class="settingsForm.notifyDailySummary ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>

        <!-- 3. Low Stock -->
        <div
          @click="settingsForm.notifyOnLowStock = !settingsForm.notifyOnLowStock"
          class="p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3.5 select-none"
          :class="settingsForm.notifyOnLowStock ? 'bg-emerald-500/5 border-emerald-500/40 dark:bg-emerald-950/20' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 opacity-80'"
        >
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle class="w-4 h-4" />
            </div>
            <div class="space-y-0.5">
              <span class="text-xs font-bold text-slate-900 dark:text-white block">Kam Qolgan Tovar Ogohlantirishi</span>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Mahsulot qoldig'i belgilangan minimal chegaradan kamayganda ta'minotchiga buyurtma berish uchun eslatma.
              </p>
            </div>
          </div>

          <!-- Toggle Switch -->
          <button
            type="button"
            @click.stop="settingsForm.notifyOnLowStock = !settingsForm.notifyOnLowStock"
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
            :class="settingsForm.notifyOnLowStock ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'"
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out"
              :class="settingsForm.notifyOnLowStock ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>

        <!-- 4. Shift Close -->
        <div
          @click="settingsForm.notifyOnShiftClose = !settingsForm.notifyOnShiftClose"
          class="p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3.5 select-none"
          :class="settingsForm.notifyOnShiftClose ? 'bg-emerald-500/5 border-emerald-500/40 dark:bg-emerald-950/20' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 opacity-80'"
        >
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <TrendingUp class="w-4 h-4" />
            </div>
            <div class="space-y-0.5">
              <span class="text-xs font-bold text-slate-900 dark:text-white block">Kassa Smenasi Yopilganda</span>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Kassir smenani yopganda kassa qoldig'i, naqd va karta tushumlari bo'yicha X-Z hisoboti keladi.
              </p>
            </div>
          </div>

          <!-- Toggle Switch -->
          <button
            type="button"
            @click.stop="settingsForm.notifyOnShiftClose = !settingsForm.notifyOnShiftClose"
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
            :class="settingsForm.notifyOnShiftClose ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'"
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out"
              :class="settingsForm.notifyOnShiftClose ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- Telegram Commands Cheatsheet (Using Pure Lucide Icons) -->
    <div class="glass-card rounded-2xl p-4 sm:p-6 space-y-3">
      <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Telegram Bot Buyruqlari</h4>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
          <code class="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">/savdo</code>
          <span class="text-[11px] text-slate-500">Bugungi sotuvlar summasi va cheklar soni</span>
        </div>
        <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
          <code class="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">/hisobot</code>
          <span class="text-[11px] text-slate-500">Kunlik umumiy tushum, xarajat va sof foyda</span>
        </div>
        <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
          <code class="font-bold text-amber-600 dark:text-amber-400 block mb-1">/ombor</code>
          <span class="text-[11px] text-slate-500">Zaxirasi kam qolgan tovarlar ro'yxati</span>
        </div>
        <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
          <code class="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">/kassa</code>
          <span class="text-[11px] text-slate-500">Ochiq smenalar va kassirlar faoliyati</span>
        </div>
      </div>
    </div>

    <!-- Connect Modal / Popup: Pure Emerald Design, Lucide Icons -->
    <Teleport to="body">
      <div v-if="isConnectModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
        <div class="w-full max-w-md glass-card rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5 shadow-2xl">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 class="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Bot class="w-4 h-4 text-emerald-500" />
              <span>Telegram Botni Ulash</span>
            </h3>
            <button @click="closeModal" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition">
              <X class="w-4 h-4" />
            </button>
          </div>

          <div class="text-center space-y-3 py-1">
            <div class="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <Bot class="w-7 h-7" />
            </div>
            <div>
              <h4 class="font-bold text-sm text-slate-900 dark:text-white">1 ta bosish bilan ulang</h4>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Quyidagi tugmani bosing va ochilgan <b>@Boshqar_uzbot</b> da <b>START</b> tugmasini bosing:
              </p>
            </div>

            <div class="pt-2">
              <a
                :href="connectLink"
                target="_blank"
                rel="noopener noreferrer"
                class="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2 btn-interactive"
              >
                <Send class="w-4 h-4" />
                <span>Telegramda Oching va Ulash</span>
                <ExternalLink class="w-3.5 h-3.5 opacity-70" />
              </a>
            </div>

            <!-- Direct Phone / Account Linking Option -->
            <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-left space-y-2">
              <span class="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                Yoki telefon raqam / Chat ID orqali bog'lang:
              </span>
              <div class="flex items-center gap-2">
                <input
                  v-model="manualQuery"
                  placeholder="77 040 46 24 yoki Chat ID"
                  class="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  @keyup.enter="linkByQuery"
                />
                <button
                  type="button"
                  @click="linkByQuery"
                  :disabled="linkingByQuery || !manualQuery.trim()"
                  class="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 transition shrink-0 disabled:opacity-50"
                >
                  {{ linkingByQuery ? '...' : "Bog'lash" }}
                </button>
              </div>
              <p class="text-[10px] text-slate-400">
                Telegramda <b>@Boshqar_uzbot</b> ga kirib raqamingizni yuborgan bo'lsangiz, raqamingizni yozib "Bog'lash"ni bosing.
              </p>
            </div>
          </div>

          <div class="pt-1">
            <button
              type="button"
              @click="checkStatusAfterConnect"
              class="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center justify-center gap-2"
            >
              <RefreshCw class="w-3.5 h-3.5 text-emerald-500" />
              <span>Uladim, tekshirish</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import {
  Bot,
  Send,
  Unlink,
  X,
  Receipt,
  Calendar,
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
  ExternalLink,
  RefreshCw,
} from 'lucide-vue-next';
import api from '../../../services/api';
import { useToast } from '../../../composables/useToast';

const toast = useToast();

const status = ref({
  isConnected: false,
  chatId: '',
  username: '',
  connectedAt: '',
  notifyOnOrder: true,
  notifyOnLowStock: true,
  notifyDailySummary: true,
  notifyOnShiftClose: true,
  botUsername: 'Boshqar_uzbot',
});

const settingsForm = ref({
  notifyOnOrder: true,
  notifyOnLowStock: true,
  notifyDailySummary: true,
  notifyOnShiftClose: true,
});

const isConnectModalOpen = ref(false);
const connectLink = ref('');
const manualQuery = ref('');
const linkingByQuery = ref(false);
const generatingLink = ref(false);
const savingSettings = ref(false);
const testingMessage = ref(false);
const disconnecting = ref(false);
let pollInterval: any = null;

const linkByQuery = async () => {
  if (!manualQuery.value.trim()) return;
  linkingByQuery.value = true;
  try {
    const { data } = await api.post('/telegram/link-by-query', { query: manualQuery.value.trim() });
    if (data?.success) {
      await loadStatus();
      closeModal();
      toast.success(data.message || 'Telegram muvaffaqiyatli ulandi!', 'Telegram Bot');
    } else {
      toast.warning(data?.message || 'Ulashda xatolik', 'Telegram Bot');
    }
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Ulashda xatolik yuz berdi', 'Telegram');
  } finally {
    linkingByQuery.value = false;
  }
};

const loadStatus = async () => {
  try {
    const { data } = await api.get('/telegram/status');
    if (data) {
      status.value = data;
      settingsForm.value = {
        notifyOnOrder: data.notifyOnOrder === true,
        notifyOnLowStock: data.notifyOnLowStock === true,
        notifyDailySummary: data.notifyDailySummary === true,
        notifyOnShiftClose: data.notifyOnShiftClose === true,
      };
    }
  } catch (e) {
    console.warn('Failed to load Telegram status:', e);
  }
};

const openConnectFlow = async () => {
  generatingLink.value = true;
  try {
    const { data } = await api.post('/telegram/generate-link');
    if (data?.link) {
      connectLink.value = data.link;
      isConnectModalOpen.value = true;

      // Start auto-checking status every 2 seconds while modal is open
      if (pollInterval) clearInterval(pollInterval);
      pollInterval = setInterval(async () => {
        if (!isConnectModalOpen.value) {
          clearInterval(pollInterval);
          return;
        }
        await loadStatus();
        if (status.value.isConnected) {
          clearInterval(pollInterval);
          isConnectModalOpen.value = false;
          toast.success('Telegram bot muvaffaqiyatli ulandi!', 'Telegram Bot');
        }
      }, 2000);
    }
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Havola yaratishda xatolik', 'Telegram');
  } finally {
    generatingLink.value = false;
  }
};

const closeModal = () => {
  if (pollInterval) clearInterval(pollInterval);
  isConnectModalOpen.value = false;
};

const checkStatusAfterConnect = async () => {
  await loadStatus();
  if (status.value.isConnected) {
    closeModal();
    toast.success('Telegram bot muvaffaqiyatli ulandi!', 'Telegram Bot');
  } else {
    toast.info('Bot hali ulanmagan. Iltimos Telegramda ochib START tugmasini bosing yoki botda telefon raqamingiz bilan kiring.', 'Telegram Bot');
  }
};

const saveSettings = async () => {
  savingSettings.value = true;
  try {
    const payload = {
      notifyOnOrder: Boolean(settingsForm.value.notifyOnOrder),
      notifyOnLowStock: Boolean(settingsForm.value.notifyOnLowStock),
      notifyDailySummary: Boolean(settingsForm.value.notifyDailySummary),
      notifyOnShiftClose: Boolean(settingsForm.value.notifyOnShiftClose),
    };
    const { data } = await api.patch('/telegram/settings', payload);
    if (data) {
      status.value = { ...status.value, ...data };
      settingsForm.value = {
        notifyOnOrder: data.notifyOnOrder === true,
        notifyOnLowStock: data.notifyOnLowStock === true,
        notifyDailySummary: data.notifyDailySummary === true,
        notifyOnShiftClose: data.notifyOnShiftClose === true,
      };
      toast.success('Telegram bildirishnoma sozlamalari saqlandi!', 'Sozlamalar');
    }
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Saqlashda xatolik', 'Xatolik');
  } finally {
    savingSettings.value = false;
  }
};

const sendTestMessage = async () => {
  testingMessage.value = true;
  try {
    const { data } = await api.post('/telegram/test-message');
    if (data?.success) {
      toast.success(data.message || 'Sinov xabari yuborildi!', 'Telegram Bot');
    } else {
      toast.warning(data?.message || 'Xabar yuborilmadi', 'Telegram Bot');
    }
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Sinov xabari yuborishda xatolik', 'Telegram');
  } finally {
    testingMessage.value = false;
  }
};

const disconnectBot = async () => {
  if (!confirm('Haqiqatan ham Telegram botni uzmoqchimisiz?')) return;
  disconnecting.value = true;
  try {
    await api.post('/telegram/disconnect');
    await loadStatus();
    toast.info('Telegram bot tizimdan uzildi', 'Telegram Bot');
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Uzishda xatolik', 'Telegram');
  } finally {
    disconnecting.value = false;
  }
};

const formatDate = (isoStr?: string) => {
  if (!isoStr) return '-';
  return new Date(isoStr).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', year: 'numeric' });
};

onMounted(() => {
  loadStatus();
});

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval);
});
</script>
