<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      @click.self="$emit('close')"
      class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div
        class="w-full max-w-[500px] bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-left animate-in zoom-in-95 duration-200"
      >
        <!-- Header Banner with Gradient (Compact & Gorgeous) -->
        <div class="relative p-5 sm:p-6 bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white overflow-hidden">
          <!-- Background Decorative Glows -->
          <div class="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none"></div>

          <!-- Close button -->
          <button
            type="button"
            @click="$emit('close')"
            class="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>

          <!-- Crown Badge -->
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider mb-2 border border-amber-400/30">
            <Crown class="w-3 h-3" />
            <span>{{ featureTitle || 'PRO Eksklyuziv Imkoniyat' }}</span>
          </div>

          <h2 class="text-lg sm:text-xl font-black text-white leading-tight">
            {{ title || "Raqobatchilaringizda Yo'q Imkoniyatlar!" }}
          </h2>
          <p class="mt-1 text-xs text-emerald-100/90 font-medium">
            {{ subtitle || "Biznesingizni to'liq avtomatlashtiring va xatolarni nolga tushiring." }}
          </p>
        </div>

        <!-- 4 Key Killer Features Grid (No Scroll, 100% Fits Perfectly) -->
        <div class="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div
            v-for="(item, idx) in benefits"
            :key="idx"
            class="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 flex items-start gap-2.5"
          >
            <div class="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
              <component :is="item.icon" class="w-3.5 h-3.5" />
            </div>
            <div class="space-y-0.5 min-w-0">
              <h4 class="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                {{ item.title }}
              </h4>
              <p class="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                {{ item.desc }}
              </p>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="p-5 sm:p-6 pt-0 bg-white dark:bg-slate-900 space-y-2.5">
          <button
            type="button"
            @click="handleStartTrial"
            class="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles class="w-4 h-4" />
            <span>14 Kun Bepul Sinashni Boshlash (Haqiqiy Hisob)</span>
            <ArrowRight class="w-4 h-4" />
          </button>

          <div class="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1 pt-1 border-t border-slate-100 dark:border-slate-800/80">
            <span class="flex items-center gap-1">
              <CheckCircle2 class="w-3.5 h-3.5 text-emerald-500" />
              Karta talab qilinmaydi
            </span>
            <span class="flex items-center gap-1">
              <CheckCircle2 class="w-3.5 h-3.5 text-emerald-500" />
              14 kun bepul sinov
            </span>
            <button
              type="button"
              @click="goToBilling"
              class="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
            >
              Tariflar
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import {
  X,
  Crown,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Bot,
  BrainCircuit,
  Building2,
  FileSpreadsheet,
} from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
  title?: string;
  subtitle?: string;
  featureTitle?: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const router = useRouter();

const benefits = [
  {
    icon: Bot,
    title: "Telegram AI Bot",
    desc: "Mijozlarga avto-chek, qarz eslatmalari va kunlik maxfiy hisobot.",
  },
  {
    icon: BrainCircuit,
    title: "AI Savdo Bashorati",
    desc: "Qaysi tovar qachon tugashini va kamomad xavfini aniqlaydi.",
  },
  {
    icon: Building2,
    title: "Ko'p Filial & Cheksiz",
    desc: "Cheksiz tovarlar, omborlararo transfer va umumiy tarmoq.",
  },
  {
    icon: FileSpreadsheet,
    title: "1C & Excel Sinxron",
    desc: "Minglab tovarlarni 1 tugma bilan yuklash va eksport qilish.",
  },
];

const handleStartTrial = () => {
  emit('close');
  router.push('/auth/register');
};

const goToBilling = () => {
  emit('close');
  router.push('/billing');
};
</script>
