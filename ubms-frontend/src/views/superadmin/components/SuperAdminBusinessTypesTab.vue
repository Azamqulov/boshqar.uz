<template>
  <div class="space-y-6">
    <!-- Section Header -->
    <div class="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-r from-emerald-500/5 via-transparent to-teal-500/5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="p-3 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
            <Sliders class="w-6 h-6" />
          </div>
          <div>
            <h2 class="text-lg font-black text-slate-900 dark:text-white">Ro'yxatdan O'tish uchun Biznes Turlari Boshqaruvi</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Yangi mijozlar (tenantlar) ro'yxatdan o'tish va onboarding jarayonida qaysi biznes turlarini tanlay olishini yoqish yoki taqiqlash
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Faol: {{ businessTypesList.filter((b: any) => b.isEnabled).length }} / {{ businessTypesList.length }}
          </span>
        </div>
      </div>
    </div>

    <!-- Business Types Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="bt in businessTypesList"
        :key="bt.type"
        class="glass-card rounded-2xl p-5 flex flex-col justify-between border transition-all duration-300 relative overflow-hidden group"
        :class="[
          bt.isEnabled
            ? 'border-emerald-500/30 bg-white/90 dark:bg-slate-900/90 shadow-sm hover:shadow-md'
            : 'border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/40 opacity-75 hover:opacity-100'
        ]"
      >
        <div class="space-y-4">
          <!-- Card Header: Icon, Title, Key, Status Badge -->
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <div
                class="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg border transition-transform group-hover:scale-105"
                :class="[
                  bt.isEnabled
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shadow-sm'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700'
                ]"
              >
                <component :is="getBusinessTypeIcon(bt.type)" class="w-6 h-6" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="font-bold text-slate-900 dark:text-white text-base">{{ bt.label }}</h3>
                  <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 uppercase font-semibold">
                    {{ bt.type }}
                  </span>
                </div>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">{{ bt.desc }}</p>
              </div>
            </div>
          </div>

          <!-- Stats & Status Details -->
          <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800/60 space-y-2 text-xs">
            <div class="flex items-center justify-between">
              <span class="text-slate-500 dark:text-slate-400 font-medium">Holati:</span>
              <span
                class="px-2.5 py-0.5 rounded-full font-bold text-[10px]"
                :class="[
                  bt.isEnabled
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                ]"
              >
                {{ bt.isEnabled ? 'Ruxsat berilgan (Faol)' : 'O\'chirilgan (Taqiqlangan)' }}
              </span>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-slate-500 dark:text-slate-400 font-medium">Mavjud bizneslar:</span>
              <span class="font-mono font-bold text-slate-900 dark:text-white">{{ bt.count || 0 }} ta tenant</span>
            </div>
          </div>
        </div>

        <!-- Card Action Button -->
        <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            @click="$emit('toggle', bt)"
            :disabled="loadingTypeToggle === bt.type"
            class="w-full py-2.5 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 btn-interactive"
            :class="[
              bt.isEnabled
                ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/25'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/25'
            ]"
          >
            <Ban v-if="bt.isEnabled" class="w-4 h-4" />
            <CheckCircle v-else class="w-4 h-4" />
            <span>{{ bt.isEnabled ? 'Ro\'yxatdan o\'tishni to\'xtatish' : 'Ruxsat berish (Faollashtirish)' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Sliders,
  ShoppingBag,
  UtensilsCrossed,
  Coffee,
  Scissors,
  Pill,
  Wrench,
  Ban,
  CheckCircle,
} from 'lucide-vue-next';

defineProps<{
  businessTypesList: any[];
  loadingTypeToggle: string | null;
}>();

defineEmits<{
  (e: 'toggle', bt: any): void;
}>();

const getBusinessTypeIcon = (type: string) => {
  switch (type) {
    case 'retail':
      return ShoppingBag;
    case 'restaurant':
      return UtensilsCrossed;
    case 'cafe':
      return Coffee;
    case 'barbershop':
    case 'beauty_salon':
      return Scissors;
    case 'pharmacy':
      return Pill;
    case 'car_service':
    case 'custom_services':
    default:
      return Wrench;
  }
};
</script>
