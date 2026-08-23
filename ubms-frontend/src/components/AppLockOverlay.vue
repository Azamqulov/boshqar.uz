<template>
  <div
    v-if="isCurrentRouteLocked"
    class="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 rounded-2xl animate-fade-in"
  >
    <div class="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-200">
      <div class="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto shadow-inner">
        <Lock class="w-8 h-8 text-amber-500" />
      </div>

      <div>
        <h3 class="text-xl font-black text-slate-900 dark:text-white tracking-tight">
          {{ currentDisabledFeature ? `«${currentDisabledFeature.label}» xizmati o'chirilgan` : "Obunangiz muddati tugagan" }}
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
          {{ currentDisabledFeature ? "Ushbu xizmat sizning joriy tarifingizda faollashtirilmagan. Foydalanish uchun tarif parametrlarini yoqing yoki tarifni yangilang." : "Dasturdan to'liq foydalanishni davom ettirish uchun obunani yangilang. Faqat Obuna, Qo'llanma va Sozlamalar bo'limlari ochiq." }}
        </p>
      </div>

      <div class="pt-2">
        <router-link
          to="/billing"
          class="w-full py-3.5 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition transform active:scale-98 btn-interactive"
        >
          <CreditCard class="w-5 h-5" />
          <span>{{ currentDisabledFeature ? "Tariflarni Ko'rish" : "Obunani Yangilash" }}</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Lock, CreditCard } from 'lucide-vue-next';

defineProps<{
  isCurrentRouteLocked: boolean;
  currentDisabledFeature?: { key?: string; id?: string; label: string } | null;
}>();
</script>
