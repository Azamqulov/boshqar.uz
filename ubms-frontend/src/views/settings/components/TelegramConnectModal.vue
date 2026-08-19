<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div class="w-full max-w-md glass-card rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5 shadow-2xl">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 class="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Bot class="w-4 h-4 text-emerald-500" />
            <span>Telegram Botni Ulash</span>
          </h3>
          <button
            type="button"
            @click="$emit('close')"
            class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
          >
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
                :value="manualQuery"
                @input="$emit('update:manualQuery', ($event.target as HTMLInputElement).value)"
                placeholder="77 040 46 24 yoki Chat ID"
                class="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                @keyup.enter="$emit('link-by-query')"
              />
              <button
                type="button"
                @click="$emit('link-by-query')"
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
            @click="$emit('check-status')"
            class="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center justify-center gap-2"
          >
            <RefreshCw class="w-3.5 h-3.5 text-emerald-500" />
            <span>Uladim, tekshirish</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import {
  Bot,
  X,
  Send,
  ExternalLink,
  RefreshCw,
} from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
  connectLink: string;
  manualQuery: string;
  linkingByQuery: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'update:manualQuery', val: string): void;
  (e: 'link-by-query'): void;
  (e: 'check-status'): void;
}>();
</script>
