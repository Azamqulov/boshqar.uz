<template>
  <div class="glass-card rounded-2xl p-4 sm:p-5 space-y-4">
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Ulangan Telegram Akkauntlar</h4>
        <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          {{ accounts.length || 1 }} ta hisob
        </span>
      </div>
      <button
        type="button"
        @click="$emit('connectMore')"
        :disabled="generatingLink"
        class="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition flex items-center gap-1.5 cursor-pointer"
      >
        <Plus class="w-3.5 h-3.5" />
        <span>Yana hisob ulash</span>
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <div
        v-for="acc in accounts"
        :key="acc.chatId"
        class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-3 group hover:border-emerald-500/40 transition shadow-xs"
      >
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-500/20">
            {{ (acc.username || 'U')[0].toUpperCase() }}
          </div>
          <div class="min-w-0">
            <div class="text-xs font-bold text-slate-900 dark:text-white truncate">
              {{ acc.username ? '@' + acc.username : 'Foydalanuvchi' }}
            </div>
            <div class="text-[10px] text-slate-400 font-mono">
              ID: {{ acc.chatId }}
            </div>
          </div>
        </div>

        <button
          v-if="accounts.length > 1"
          type="button"
          @click="$emit('removeAccount', acc.chatId)"
          class="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
          title="Ushbu akkauntni uzish"
        >
          <Trash2 class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, Trash2 } from 'lucide-vue-next';

defineProps<{
  accounts: Array<{
    chatId: string;
    username?: string;
    connectedAt?: string;
  }>;
  generatingLink?: boolean;
}>();

defineEmits<{
  (e: 'connectMore'): void;
  (e: 'removeAccount', chatId: string): void;
}>();
</script>
