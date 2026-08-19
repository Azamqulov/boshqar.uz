<template>
  <Teleport to="body">
    <div v-if="selectedLog" @click.self="$emit('close')" class="modal-overlay">
      <div class="modal-container max-w-lg" @click.stop>
        <div class="modal-header border-b border-slate-200 dark:border-slate-800">
          <div class="flex items-center gap-2.5">
            <div
              class="p-2 rounded-xl"
              :class="getActionBadgeClass(selectedLog.action)"
            >
              <component :is="getActionIcon(selectedLog.action)" class="w-4 h-4" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white">Audit Yozuvi Tafsiloti</h3>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{{ selectedLog.id }}</p>
            </div>
          </div>
          <button
            type="button"
            @click="$emit('close')"
            class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="modal-body p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <!-- User & Action Meta Card -->
          <div class="p-3.5 rounded-2xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2.5 text-xs">
            <div class="flex items-center justify-between">
              <span class="text-slate-500 dark:text-slate-400 font-medium">Bajaruvchi Xodim:</span>
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black text-[10px] flex items-center justify-center">
                  {{ (selectedLog.user?.fullName || selectedLog.user?.phone || 'A')[0].toUpperCase() }}
                </span>
                <span class="font-bold text-slate-900 dark:text-white">
                  {{ selectedLog.user?.fullName || selectedLog.user?.phone || 'Tizim / Anonim' }}
                </span>
              </div>
            </div>

            <div class="flex items-center justify-between border-t border-slate-200/60 dark:border-slate-700/60 pt-2">
              <span class="text-slate-500 dark:text-slate-400 font-medium">Amal Turi:</span>
              <span
                class="px-2.5 py-0.5 rounded-lg text-[11px] font-black uppercase tracking-wider"
                :class="getActionBadgeClass(selectedLog.action)"
              >
                {{ formatActionName(selectedLog.action) }}
              </span>
            </div>

            <div class="flex items-center justify-between border-t border-slate-200/60 dark:border-slate-700/60 pt-2">
              <span class="text-slate-500 dark:text-slate-400 font-medium">Bo'lim / Entity:</span>
              <span class="font-mono font-bold text-slate-900 dark:text-white">{{ selectedLog.entity }}</span>
            </div>

            <div class="flex items-center justify-between border-t border-slate-200/60 dark:border-slate-700/60 pt-2">
              <span class="text-slate-500 dark:text-slate-400 font-medium">Sana & Vaqt:</span>
              <span class="font-mono font-bold text-slate-900 dark:text-white">{{ formatDate(selectedLog.createdAt) }}</span>
            </div>

            <div v-if="selectedLog.ipAddress" class="flex items-center justify-between border-t border-slate-200/60 dark:border-slate-700/60 pt-2">
              <span class="text-slate-500 dark:text-slate-400 font-medium">IP Manzil:</span>
              <span class="font-mono text-slate-700 dark:text-slate-300">{{ selectedLog.ipAddress }}</span>
            </div>
          </div>

          <!-- Human explanation -->
          <div class="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
            <span class="font-bold uppercase text-[10px] tracking-wider text-emerald-700 dark:text-emerald-400 block">Amalning Qisqacha Mazmuni:</span>
            <p class="leading-relaxed">
              {{ getAuditDescription(selectedLog) }}
            </p>
          </div>

          <!-- Changed Fields Grid -->
          <div v-if="selectedLog.oldValue && selectedLog.newValue" class="space-y-2">
            <span class="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block tracking-wider">
              O'zgargan Qiymatlar Solishtiruvi:
            </span>

            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 space-y-1">
                <span class="text-[10px] font-bold uppercase text-rose-700 dark:text-rose-400 block">Oldingi Holat:</span>
                <span class="font-mono text-rose-800 dark:text-rose-200 text-[11px] block break-all whitespace-pre-wrap">
                  {{ typeof selectedLog.oldValue === 'object' ? JSON.stringify(selectedLog.oldValue, null, 2) : selectedLog.oldValue }}
                </span>
              </div>

              <div class="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 space-y-1">
                <span class="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400 block">Yangi Holat:</span>
                <span class="font-mono text-emerald-800 dark:text-emerald-200 text-[11px] block break-all whitespace-pre-wrap">
                  {{ typeof selectedLog.newValue === 'object' ? JSON.stringify(selectedLog.newValue, null, 2) : selectedLog.newValue }}
                </span>
              </div>
            </div>
          </div>

          <!-- Payload / Changes -->
          <div v-if="selectedLog.newValue" class="space-y-2">
            <span class="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block tracking-wider">
              Kiritilgan / O'zgartirilgan Ma'lumotlar:
            </span>

            <div class="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/50 overflow-hidden divide-y divide-slate-200/80 dark:divide-slate-700/60 text-xs">
              <div
                v-for="(val, key) in flattenPayload(selectedLog.newValue)"
                :key="key"
                class="px-3.5 py-2.5 flex items-center justify-between gap-3 hover:bg-white/60 dark:hover:bg-slate-800/80 transition"
              >
                <span class="font-bold text-slate-600 dark:text-slate-400 capitalize">{{ formatFieldLabel(String(key)) }}:</span>
                <span class="font-mono font-bold text-slate-900 dark:text-white text-right break-all">
                  {{ formatFieldValue(val, String(key)) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <AppButton variant="secondary" size="md" @click="$emit('close')">Yopish</AppButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next';
import AppButton from '@/components/AppButton.vue';

defineProps<{
  selectedLog: any;
  getActionBadgeClass: (action: string) => string;
  getActionIcon: (action: string) => any;
  formatActionName: (action: string) => string;
  formatDate: (val: any) => string;
  getAuditDescription: (log: any) => string;
  flattenPayload: (payload: any) => Record<string, any>;
  formatFieldLabel: (key: string) => string;
  formatFieldValue: (val: any, key: string) => string;
}>();

defineEmits<{
  (e: 'close'): void;
}>();
</script>
