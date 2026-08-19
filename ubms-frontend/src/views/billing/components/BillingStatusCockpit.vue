<template>
  <div
    v-if="subscription"
    :class="[
      'rounded-3xl p-6 sm:p-7 border shadow-xs relative overflow-hidden transition-all duration-300',
      subscription.isExpired
        ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
        : subscription.isTrial
          ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40'
          : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800'
    ]"
  >
    <div class="flex flex-col lg:flex-row lg:items-start justify-between gap-6 relative z-10">
      <!-- Left: Plan Header & Info Chips -->
      <div class="space-y-3.5 max-w-2xl">
        <div class="space-y-1">
          <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            <Sparkles class="w-3.5 h-3.5 text-emerald-500" />
            <span>Joriy Biznes Obunasi</span>
          </div>
          
          <div class="flex flex-wrap items-center gap-3">
            <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {{ subscription.planName || business?.plan?.name || 'Free' }}
              <span class="text-slate-400 dark:text-slate-500 font-normal text-base sm:text-lg">
                — {{ (subscription.planName || business?.plan?.name) === 'Business' ? 'Katta Korxonalar va VIP Reja' : (subscription.planName || business?.plan?.name) === 'Pro' ? 'Kichik va O\'rta Biznes Rejasi' : 'Standart Boshlang\'ich Reja' }}
              </span>
            </h2>
          </div>
        </div>

        <!-- Quick Metrics & Status Pills -->
        <div class="flex flex-wrap items-center gap-2 pt-0.5">
          <!-- Active Status Pill -->
          <div
            v-if="subscription.isExpired"
            class="px-3 py-1 rounded-xl text-xs font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-500/30 flex items-center gap-1.5"
          >
            <span class="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>Muddati Tugagan</span>
          </div>
          <div
            v-else-if="subscription.isTrial"
            class="px-3 py-1 rounded-xl text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1.5"
          >
            <span class="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            <span>14 Kunlik Sinov (Trial)</span>
          </div>
          <div
            v-else
            class="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5"
          >
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Faol Obuna</span>
          </div>

          <!-- Price Pill -->
          <div class="px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
            <CreditCard class="w-3.5 h-3.5 text-slate-400" />
            <span>{{ Number(currentActivePlan?.priceMonthly || 0) === 0 ? '0 UZS (Bepul)' : `${formatMoney(currentActivePlan?.priceMonthly)} / oy` }}</span>
          </div>

          <!-- Renewal Date / Time Left Pill -->
          <div class="px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
            <Clock class="w-3.5 h-3.5 text-slate-400" />
            <span v-if="(subscription.planName || business?.plan?.name) === 'Free'">Muddatsiz cheklovsiz</span>
            <span v-else-if="subscription.isExpired">Muddati o'tgan</span>
            <span v-else>{{ subscription.daysLeft }} kun qoldi ({{ formatDate(subscription.currentPeriodEnd) }} gacha)</span>
          </div>
        </div>

        <!-- Description Text with Icon -->
        <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed flex items-start gap-2.5">
          <Info class="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <div v-if="subscription.isTrial">
            Sizda 14 kunlik bepul sinov muddati faol. Sinov muddati tugashiga <strong>{{ subscription.daysLeft }} kun</strong> qoldi. Tizim to'xtovsiz ishlashi uchun muddat tugamasdan to'lov qiling.
          </div>
          <div v-else-if="subscription.isExpired" class="text-rose-600 dark:text-rose-400 font-bold">
            Obunangiz muddati tugagan. Tizimdan cheklovlarsiz foydalanish uchun quyidagi karta orqali to'lov qiling va obunangizni uzaytiring.
          </div>
          <div v-else-if="(subscription.planName || business?.plan?.name) === 'Free'">
            Siz hozirda standart bepul rejadansiz. Cheklovlarsiz filiallar ochish, ko'proq xodimlar qo'shish va Telegram-bot hisobotlarini yoqish uchun <strong>Pro</strong> yoki <strong>Business</strong> tarifiga yuksaltiring.
          </div>
          <div v-else>
            Obunangiz faol holatda. Barcha tarif imkoniyatlaridan to'liq foydalanmoqdasiz. Navbatdagi yangilanish sanasi: <strong>{{ formatDate(subscription.currentPeriodEnd) }}</strong>.
          </div>
        </div>
      </div>

      <!-- Right: Action CTA Button -->
      <div class="shrink-0 flex items-center gap-3 self-start lg:self-center">
        <button
          v-if="(subscription.planName || business?.plan?.name) === 'Free'"
          type="button"
          @click="$emit('open-payment', payablePlans[0])"
          class="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/25 transition flex items-center justify-center gap-2"
        >
          <ArrowUpRight class="w-4 h-4 stroke-[2.5]" />
          <span>Tarifni Yuksaltirish (Upgrade)</span>
        </button>
        <button
          v-else
          type="button"
          @click="$emit('open-payment', currentActivePlan)"
          class="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/25 transition flex items-center justify-center gap-2"
        >
          <CreditCard class="w-4 h-4" />
          <span>Obunani Uzaytirish / To'lov</span>
        </button>
      </div>
    </div>

    <!-- Real-time Active Services & Limits Dashboard -->
    <div class="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80">
      <h4 class="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
        <Layers class="w-3.5 h-3.5" />
        <span>Sizning Tarifingizda Mavjud Xizmatlar va Resurslar</span>
      </h4>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <!-- 1. Branches Usage -->
        <div class="p-3.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 dark:border-emerald-500/40 ring-1 ring-emerald-500/20 space-y-1.5 transition">
          <div class="flex items-center justify-between text-xs">
            <span class="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
              <div class="p-1 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <Building2 class="w-3.5 h-3.5" />
              </div>
              <span>Filiallar</span>
            </span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white shadow-2xs">
              {{ usage.branches || 1 }} / {{ currentActivePlan?.maxBranches === null ? 'Cheksiz' : `${currentActivePlan?.maxBranches || 1} ta` }}
            </span>
          </div>
          <p class="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 font-medium">
            {{ currentActivePlan?.maxBranches === null ? 'Cheklovsiz filial ochish mumkin' : 'Mavjud ruxsat etilgan limit' }}
          </p>
        </div>

        <!-- 2. Users Usage -->
        <div class="p-3.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 dark:border-emerald-500/40 ring-1 ring-emerald-500/20 space-y-1.5 transition">
          <div class="flex items-center justify-between text-xs">
            <span class="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
              <div class="p-1 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <Users class="w-3.5 h-3.5" />
              </div>
              <span>Xodimlar</span>
            </span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white shadow-2xs">
              {{ usage.users || 1 }} / {{ currentActivePlan?.maxUsers === null ? 'Cheksiz' : `${currentActivePlan?.maxUsers || 2} ta` }}
            </span>
          </div>
          <p class="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 font-medium">
            {{ currentActivePlan?.maxUsers === null ? 'Cheklovsiz foydalanuvchilar' : 'Mavjud kassir va menejerlar' }}
          </p>
        </div>

        <!-- 3. POS Kassa -->
        <div class="p-3.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 dark:border-emerald-500/40 ring-1 ring-emerald-500/20 space-y-1.5 transition">
          <div class="flex items-center justify-between text-xs">
            <span class="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
              <div class="p-1 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <ShoppingCart class="w-3.5 h-3.5" />
              </div>
              <span>POS Kassa & Chek</span>
            </span>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white shadow-2xs">
              Faol
            </span>
          </div>
          <p class="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 font-medium">Kassa va printer ulash</p>
        </div>

        <!-- 4. Warehouse & Products -->
        <div class="p-3.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 dark:border-emerald-500/40 ring-1 ring-emerald-500/20 space-y-1.5 transition">
          <div class="flex items-center justify-between text-xs">
            <span class="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
              <div class="p-1 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <FolderTree class="w-3.5 h-3.5" />
              </div>
              <span>Ombor & Qoldiq</span>
            </span>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white shadow-2xs">
              Faol
            </span>
          </div>
          <p class="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 font-medium">Inventarizatsiya va kirim</p>
        </div>

        <!-- 5. Finance & Analytics -->
        <div class="p-3.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 dark:border-emerald-500/40 ring-1 ring-emerald-500/20 space-y-1.5 transition">
          <div class="flex items-center justify-between text-xs">
            <span class="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
              <div class="p-1 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <PieChart class="w-3.5 h-3.5" />
              </div>
              <span>Moliya & Hisobot</span>
            </span>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white shadow-2xs">
              Faol
            </span>
          </div>
          <p class="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 font-medium">Tushum va xarajat tahlili</p>
        </div>

        <!-- 6. Telegram Bot Notifications -->
        <div
          :class="[
            'p-3.5 rounded-2xl space-y-1.5 transition border',
            currentActivePlan?.name !== 'Free'
              ? 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/30 dark:border-emerald-500/40 ring-1 ring-emerald-500/20'
              : 'bg-slate-100/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 opacity-60'
          ]"
        >
          <div class="flex items-center justify-between text-xs">
            <span class="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
              <div
                :class="[
                  'p-1 rounded-lg',
                  currentActivePlan?.name !== 'Free'
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                ]"
              >
                <Send class="w-3.5 h-3.5" />
              </div>
              <span>Telegram Bot</span>
            </span>
            <span
              v-if="currentActivePlan?.name !== 'Free'"
              class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white shadow-2xs"
            >
              Faol
            </span>
            <span
              v-else
              class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
            >
              Pro tarifida
            </span>
          </div>
          <p
            :class="[
              'text-[11px] font-medium',
              currentActivePlan?.name !== 'Free'
                ? 'text-emerald-800/80 dark:text-emerald-300/80'
                : 'text-slate-400 dark:text-slate-500'
            ]"
          >
            Kunlik avto hisobotlar
          </p>
        </div>

        <!-- 7. 24/7 VIP Manager Support -->
        <div
          :class="[
            'p-3.5 rounded-2xl space-y-1.5 transition border',
            currentActivePlan?.name === 'Business'
              ? 'bg-purple-500/10 dark:bg-purple-950/40 border-purple-500/30 dark:border-purple-500/40 ring-1 ring-purple-500/20'
              : 'bg-slate-100/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 opacity-60'
          ]"
        >
          <div class="flex items-center justify-between text-xs">
            <span class="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
              <div
                :class="[
                  'p-1 rounded-lg',
                  currentActivePlan?.name === 'Business'
                    ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                ]"
              >
                <ShieldCheck class="w-3.5 h-3.5" />
              </div>
              <span>Shaxsiy Menejer</span>
            </span>
            <span
              v-if="currentActivePlan?.name === 'Business'"
              class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-600 text-white shadow-2xs"
            >
              Faol (VIP)
            </span>
            <span
              v-else
              class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
            >
              Business tarifida
            </span>
          </div>
          <p
            :class="[
              'text-[11px] font-medium',
              currentActivePlan?.name === 'Business'
                ? 'text-purple-800/80 dark:text-purple-300/80'
                : 'text-slate-400 dark:text-slate-500'
            ]"
          >
            Doimiy aloqa va yordam
          </p>
        </div>

        <!-- 8. Cloud Backup & SSL Security -->
        <div class="p-3.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 dark:border-emerald-500/40 ring-1 ring-emerald-500/20 space-y-1.5 transition">
          <div class="flex items-center justify-between text-xs">
            <span class="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
              <div class="p-1 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <Lock class="w-3.5 h-3.5" />
              </div>
              <span>Bulutli Nusxalash</span>
            </span>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white shadow-2xs">
              Faol
            </span>
          </div>
          <p class="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 font-medium">Kunlik avtomatik backup</p>
        </div>
      </div>
    </div>

    <!-- Pending Request Alert Banner -->
    <div
      v-if="pendingRequest"
      class="mt-4 pt-4 border-t border-amber-200 dark:border-amber-900/40 flex items-center gap-2.5 text-xs font-bold text-amber-800 dark:text-amber-300"
    >
      <Clock class="w-4 h-4 shrink-0 animate-spin text-amber-600 dark:text-amber-400" />
      <span>Siz yuborgan to'lov so'rovi ({{ formatMoney(pendingRequest.amount) }}) administrator tomonidan ko'rib chiqilmoqda. Tez orada tasdiqlanadi.</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Sparkles,
  CreditCard,
  Clock,
  Info,
  ArrowUpRight,
  Layers,
  Building2,
  Users,
  ShoppingCart,
  FolderTree,
  PieChart,
  Send,
  ShieldCheck,
  Lock,
} from 'lucide-vue-next';

defineProps<{
  subscription: any;
  business: any;
  currentActivePlan: any;
  usage: any;
  payablePlans: any[];
  pendingRequest: any;
  formatMoney: (val: any) => string;
  formatDate: (val: any) => string;
}>();

defineEmits<{
  (e: 'open-payment', plan: any): void;
}>();
</script>
