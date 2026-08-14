<template>
  <div class="space-y-6 w-full animate-fade-in">
    <!-- Section 0: Appearance & Theme -->
    <div class="glass-card rounded-3xl p-6 sm:p-8 space-y-5 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div>
        <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Palette class="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
          <span>Interfeys Mavzusi (Theme Mode)</span>
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">O'zingizga qulay rejimni tanlang: Yorug' (Light) yoki Tungi (Dark)</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <!-- Light Theme Option -->
        <button
          type="button"
          @click="themeStore.applyTheme('light')"
          class="p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 transition-all btn-interactive"
          :class="[
            themeStore.theme === 'light'
              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500/30 font-bold'
              : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          ]"
        >
          <div class="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Sun class="w-5 h-5" />
          </div>
          <span class="text-xs">Yorug' (Light)</span>
        </button>

        <!-- Dark Theme Option -->
        <button
          type="button"
          @click="themeStore.applyTheme('dark')"
          class="p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 transition-all btn-interactive"
          :class="[
            themeStore.theme === 'dark'
              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500/30 font-bold'
              : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          ]"
        >
          <div class="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Moon class="w-5 h-5" />
          </div>
          <span class="text-xs">Tungi (Dark)</span>
        </button>

        <!-- System Sync Option -->
        <button
          type="button"
          @click="themeStore.applyTheme('system')"
          class="p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 transition-all btn-interactive"
          :class="[
            themeStore.theme === 'system'
              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500/30 font-bold'
              : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          ]"
        >
          <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center">
            <Monitor class="w-5 h-5" />
          </div>
          <span class="text-xs">Tizim (Avto)</span>
        </button>
      </div>
    </div>

    <!-- Section 1: Xizmat Turlari (Service Modes) -->
    <div class="glass-card rounded-3xl p-6 sm:p-8 space-y-6 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div class="flex items-center gap-3">
          <div class="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <UtensilsCrossed class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-base font-extrabold text-slate-900 dark:text-white">Buyurtma va Xizmat Turlari</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Kassada qaysi xizmat turlari ko'rinishini boshqaring (yoqish / o'chirish)</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- 1. Zalda (Dine-in) -->
        <div
          class="p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-4"
          :class="posSettings.allowDineIn ? 'bg-emerald-500/5 border-emerald-500/30 dark:bg-emerald-950/20' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 opacity-60'"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-2.5">
              <div class="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg shadow-inner">
                🍽️
              </div>
              <div>
                <h4 class="font-bold text-sm text-slate-900 dark:text-white">Zalda Xizmat</h4>
                <p class="text-[11px] text-slate-500 dark:text-slate-400">Stollar bandlovi va zaldagi buyurtmalar</p>
              </div>
            </div>
            <!-- Toggle Switch -->
            <button
              type="button"
              @click="$emit('togglePosSetting', 'allowDineIn')"
              class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
              :class="posSettings.allowDineIn ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'"
            >
              <span
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out"
                :class="posSettings.allowDineIn ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
          </div>
          <div class="text-[11px] font-semibold flex items-center gap-1.5" :class="posSettings.allowDineIn ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'">
            <span class="w-2 h-2 rounded-full" :class="posSettings.allowDineIn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'"></span>
            <span>{{ posSettings.allowDineIn ? "Kassada faol (Ko'rinadi)" : "O'chirilgan (Yashiringan)" }}</span>
          </div>
        </div>

        <!-- 2. Saboy (Takeaway) -->
        <div
          class="p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-4"
          :class="posSettings.allowTakeaway ? 'bg-amber-500/5 border-amber-500/30 dark:bg-amber-950/20' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 opacity-60'"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-2.5">
              <div class="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg shadow-inner">
                🥡
              </div>
              <div>
                <h4 class="font-bold text-sm text-slate-900 dark:text-white">Saboy (Olib ketish)</h4>
                <p class="text-[11px] text-slate-500 dark:text-slate-400">Mijoz o'zi bilan olib ketishi uchun</p>
              </div>
            </div>
            <!-- Toggle Switch -->
            <button
              type="button"
              @click="$emit('togglePosSetting', 'allowTakeaway')"
              class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
              :class="posSettings.allowTakeaway ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'"
            >
              <span
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out"
                :class="posSettings.allowTakeaway ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
          </div>
          <div class="text-[11px] font-semibold flex items-center gap-1.5" :class="posSettings.allowTakeaway ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'">
            <span class="w-2 h-2 rounded-full" :class="posSettings.allowTakeaway ? 'bg-amber-500 animate-pulse' : 'bg-slate-400'"></span>
            <span>{{ posSettings.allowTakeaway ? "Kassada faol (Ko'rinadi)" : "O'chirilgan (Yashiringan)" }}</span>
          </div>
        </div>

        <!-- 3. Dostavka (Delivery) -->
        <div
          class="p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-4"
          :class="posSettings.allowDelivery ? 'bg-sky-500/5 border-sky-500/30 dark:bg-sky-950/20' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 opacity-60'"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-2.5">
              <div class="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center text-lg shadow-inner">
                🛵
              </div>
              <div>
                <h4 class="font-bold text-sm text-slate-900 dark:text-white">Dostavka (Yetkazib berish)</h4>
                <p class="text-[11px] text-slate-500 dark:text-slate-400">Kuryer orqali yetkazib berish xizmati</p>
              </div>
            </div>
            <!-- Toggle Switch -->
            <button
              type="button"
              @click="$emit('togglePosSetting', 'allowDelivery')"
              class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
              :class="posSettings.allowDelivery ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'"
            >
              <span
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out"
                :class="posSettings.allowDelivery ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
          </div>
          <div class="text-[11px] font-semibold flex items-center gap-1.5" :class="posSettings.allowDelivery ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400'">
            <span class="w-2 h-2 rounded-full" :class="posSettings.allowDelivery ? 'bg-sky-500 animate-pulse' : 'bg-slate-400'"></span>
            <span>{{ posSettings.allowDelivery ? "Kassada faol (Ko'rinadi)" : "O'chirilgan (Yashiringan)" }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 2: Umumiy Kassa va Savdo Funksiyalari -->
    <div class="glass-card rounded-3xl p-6 sm:p-8 space-y-6 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div class="flex items-center gap-3">
          <div class="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <SlidersHorizontal class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-base font-extrabold text-slate-900 dark:text-white">Umumiy Kassa Funksiyalari</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Kassadagi to'lov va qo'shimcha imkoniyatlarni boshqaring</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- 1. Nasiya (Debt) -->
        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Users class="w-5 h-5" />
            </div>
            <div>
              <h4 class="font-bold text-xs text-slate-900 dark:text-white">Nasiya (Qarzga sotish)</h4>
              <p class="text-[10px] text-slate-500 dark:text-slate-400">To'lov usullarida Nasiya tugmasi chiqadi</p>
            </div>
          </div>
          <button
            type="button"
            @click="$emit('togglePosSetting', 'allowDebt')"
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
            :class="posSettings.allowDebt ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'"
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out"
              :class="posSettings.allowDebt ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>

        <!-- 2. Chegirma (Discounts) -->
        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Percent class="w-5 h-5" />
            </div>
            <div>
              <h4 class="font-bold text-xs text-slate-900 dark:text-white">Chegirmalar berish</h4>
              <p class="text-[10px] text-slate-500 dark:text-slate-400">Buyurtmaga foiz yoki summali chegirma qo'llash</p>
            </div>
          </div>
          <button
            type="button"
            @click="$emit('togglePosSetting', 'allowDiscounts')"
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
            :class="posSettings.allowDiscounts ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'"
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out"
              :class="posSettings.allowDiscounts ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>

        <!-- 3. Skaner / Shtrix-kod -->
        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Barcode class="w-5 h-5" />
            </div>
            <div>
              <h4 class="font-bold text-xs text-slate-900 dark:text-white">Tezkor shtrix-kod skaneri</h4>
              <p class="text-[10px] text-slate-500 dark:text-slate-400">Skaner orqali tovarlarni darhol savatga qo'shish</p>
            </div>
          </div>
          <button
            type="button"
            @click="$emit('togglePosSetting', 'quickBarcode')"
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
            :class="posSettings.quickBarcode ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'"
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out"
              :class="posSettings.quickBarcode ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>

        <!-- 4. Qoldiqni eslatish (Ombor ogohlantirishi) -->
        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Package class="w-5 h-5" />
            </div>
            <div>
              <h4 class="font-bold text-xs text-slate-900 dark:text-white">Qoldiqni eslatish</h4>
              <p class="text-[10px] text-slate-500 dark:text-slate-400">Tugagan va kam qolgan tovarlar haqida ekranda jonli ogohlantirish</p>
            </div>
          </div>
          <button
            type="button"
            @click="$emit('togglePosSetting', 'allowZeroStockSale')"
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
            :class="posSettings.allowZeroStockSale ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'"
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out"
              :class="posSettings.allowZeroStockSale ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>

        <!-- 5. Kassa Tezkor Tugmalari (Hotkeys) -->
        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between md:col-span-2">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Keyboard class="w-5 h-5" />
            </div>
            <div>
              <h4 class="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                <span>Kassa tezkor tugmalari (Hotkeys)</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold">F1 — F10</span>
              </h4>
              <p class="text-[10px] text-slate-500 dark:text-slate-400">Sichqonchasiz tezkor kassa boshqaruvi: F2 (Qidiruv), F4 (Chegirma), F8 (Kutish), F10 (To'lov), Enter (Tasdiqlash)</p>
            </div>
          </div>
          <button
            type="button"
            @click="$emit('togglePosSetting', 'enableHotkeys')"
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
            :class="posSettings.enableHotkeys !== false ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'"
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out"
              :class="posSettings.enableHotkeys !== false ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Palette,
  Sun,
  Moon,
  Monitor,
  UtensilsCrossed,
  SlidersHorizontal,
  Users,
  Percent,
  Barcode,
  Package,
  Keyboard,
} from 'lucide-vue-next';
import { useThemeStore } from '../../../stores/theme.store';

defineProps<{
  posSettings: {
    allowDineIn: boolean;
    allowTakeaway: boolean;
    allowDelivery: boolean;
    allowDebt: boolean;
    allowDiscounts: boolean;
    quickBarcode: boolean;
    allowZeroStockSale: boolean;
    enableHotkeys?: boolean;
  };
}>();

defineEmits<{
  (e: 'togglePosSetting', key: string): void;
}>();

const themeStore = useThemeStore();
</script>
