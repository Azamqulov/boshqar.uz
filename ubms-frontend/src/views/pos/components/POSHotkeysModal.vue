<script setup lang="ts">
import { X, Keyboard, Check, Sparkles } from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
}>();

const hotkeysList = [
  { key: 'F2', label: 'Qidiruv / Skaner', desc: 'Fokusni tovar qidiruv yoki shtrix-kod maydoniga qo\'yish' },
  { key: 'F4', label: 'Chegirma Berish', desc: 'Buyurtmaga foiz (%) yoki summali chegirma oynasini ochish' },
  { key: 'F8', label: 'Kutishga Qo\'yish', desc: 'Joriy savatni vaqtincha kutish rejimiga saqlash' },
  { key: 'F9', label: 'Kutishdagilar', desc: 'Kutishdagi savatlar ro\'yxatini ochish va qayta yuklash' },
  { key: 'F10', label: 'To\'lovga O\'tish', desc: 'To\'lov va chek chiqarish oynasini ochish' },
  { key: 'F7', label: 'Savatni Tozalash', desc: 'Savatdagi barcha tovarlarni o\'chirish' },
  { key: '1, 2, 3, 4', label: 'To\'lov Usuli', desc: 'To\'lov oynasida: 1-Naqd, 2-Karta, 3-Click/Payme, 4-Nasiya' },
  { key: 'Enter', label: 'To\'lovni Yakunlash', desc: 'To\'lov oynasida buyurtmani tasdiqlash va chek chiqarish' },
  { key: 'Escape', label: 'Oynani Yopish', desc: 'Har qanday ochiq modal oynani yopish' },
];
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay !z-[99999]" @click.self="$emit('close')">
      <div class="modal-container max-w-md bg-white dark:bg-slate-900 shadow-2xl rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150" @click.stop>
        <!-- Modal Header -->
        <div class="modal-header">
          <div class="flex items-center gap-2">
            <div class="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Keyboard class="w-4 h-4" />
            </div>
            <div>
              <h3 class="font-black text-sm text-slate-900 dark:text-white">Kassa Tezkor Tugmalari (Hotkeys)</h3>
              <p class="text-[11px] text-slate-400">Sichqonchasiz tezkor ishlash uchun klaviatura tugmalari</p>
            </div>
          </div>
          <button
            type="button"
            @click="$emit('close')"
            class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body space-y-2 max-h-[70vh] overflow-y-auto">
          <div
            v-for="hk in hotkeysList"
            :key="hk.key"
            class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3 text-xs"
          >
            <div class="flex-1 min-w-0">
              <span class="font-bold text-slate-900 dark:text-white block">{{ hk.label }}</span>
              <span class="text-[11px] text-slate-500 dark:text-slate-400 block truncate">{{ hk.desc }}</span>
            </div>
            <kbd class="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-mono font-black text-xs border border-slate-300 dark:border-slate-700 shadow-xs shrink-0">
              {{ hk.key }}
            </kbd>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer flex items-center justify-between">
          <span class="text-[11px] text-slate-400">Sozlamalar -> Ko'rinish bo'limidan o'chirish mumkin</span>
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition shadow-sm"
          >
            Tushundim
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
