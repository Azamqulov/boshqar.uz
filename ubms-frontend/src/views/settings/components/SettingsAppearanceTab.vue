<template>
  <div class="space-y-6 w-full max-w-full overflow-x-hidden animate-in fade-in duration-200 text-slate-800 dark:text-slate-100">
    <!-- SECTION 1: INTERFEYS MAVZUSI (THEME MODE - SOFT EMERALD BLUR CONTAINER CARDS) -->
    <div class="glass-card rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800/80 shadow-xs bg-white dark:bg-slate-900 space-y-5 w-full overflow-hidden">
      <div class="flex items-center gap-3.5 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <!-- Squircle Soft Emerald Blur Icon Container (Aynan 2-screenshotdagidek) -->
        <div class="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/25 shadow-xs">
          <Palette class="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div class="min-w-0">
          <h3 class="text-base font-black text-slate-900 dark:text-white tracking-tight truncate">Interfeys Mavzusi (Theme Mode)</h3>
          <p class="text-xs text-slate-400 mt-0.5 truncate">O'zingizga qulay rejimni tanlang: Yorug' (Light) yoki Tungi (Dark)</p>
        </div>
      </div>

      <!-- Theme Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
        <!-- 1. LIGHT THEME -->
        <button
          type="button"
          @click="themeStore.applyTheme('light')"
          class="p-5 sm:p-6 rounded-2xl border flex items-center justify-between gap-3.5 transition-all btn-interactive w-full min-w-0"
          :class="[
            themeStore.theme === 'light'
              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-900 dark:text-emerald-300 ring-2 ring-emerald-500/30 font-bold shadow-sm'
              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          ]"
        >
          <div class="flex items-center gap-3.5 min-w-0">
            <!-- Yashil Squircle Soft Container -->
            <div class="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-xs">
              <Sun class="w-5.5 h-5.5" />
            </div>
            <div class="text-left min-w-0">
              <h4 class="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">Yorug' (Light)</h4>
              <p class="text-xs text-slate-400 mt-0.5 truncate">Kunduzgi rejim</p>
            </div>
          </div>

          <div
            v-if="themeStore.theme === 'light'"
            class="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs"
          >
            <Check class="w-3.5 h-3.5 stroke-[3]" />
          </div>
        </button>

        <!-- 2. DARK THEME -->
        <button
          type="button"
          @click="themeStore.applyTheme('dark')"
          class="p-5 sm:p-6 rounded-2xl border flex items-center justify-between gap-3.5 transition-all btn-interactive w-full min-w-0"
          :class="[
            themeStore.theme === 'dark'
              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-900 dark:text-emerald-300 ring-2 ring-emerald-500/30 font-bold shadow-sm'
              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          ]"
        >
          <div class="flex items-center gap-3.5 min-w-0">
            <!-- Yashil Squircle Soft Container -->
            <div class="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-xs">
              <Moon class="w-5.5 h-5.5" />
            </div>
            <div class="text-left min-w-0">
              <h4 class="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">Tungi (Dark)</h4>
              <p class="text-xs text-slate-400 mt-0.5 truncate">Tungi va qorong'u</p>
            </div>
          </div>

          <div
            v-if="themeStore.theme === 'dark'"
            class="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs"
          >
            <Check class="w-3.5 h-3.5 stroke-[3]" />
          </div>
        </button>

        <!-- 3. SYSTEM AUTO THEME -->
        <button
          type="button"
          @click="themeStore.applyTheme('system')"
          class="p-5 sm:p-6 rounded-2xl border flex items-center justify-between gap-3.5 transition-all btn-interactive w-full min-w-0"
          :class="[
            themeStore.theme === 'system'
              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-900 dark:text-emerald-300 ring-2 ring-emerald-500/30 font-bold shadow-sm'
              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          ]"
        >
          <div class="flex items-center gap-3.5 min-w-0">
            <!-- Yashil Squircle Soft Container -->
            <div class="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-xs">
              <Monitor class="w-5.5 h-5.5" />
            </div>
            <div class="text-left min-w-0">
              <h4 class="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">Tizim (Avto)</h4>
              <p class="text-xs text-slate-400 mt-0.5 truncate">Qurilmaga moslashuv</p>
            </div>
          </div>

          <div
            v-if="themeStore.theme === 'system'"
            class="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs"
          >
            <Check class="w-3.5 h-3.5 stroke-[3]" />
          </div>
        </button>
      </div>
    </div>

    <!-- SECTION 2: BUYURTMA VA XIZMAT TURLARI -->
    <div class="glass-card rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800/80 shadow-xs bg-white dark:bg-slate-900 space-y-4 w-full overflow-hidden">
      <div class="flex items-center gap-3.5 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div class="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/25 shadow-xs">
          <UtensilsCrossed class="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div class="min-w-0">
          <h3 class="text-base font-black text-slate-900 dark:text-white tracking-tight truncate">Buyurtma va Xizmat Turlari</h3>
          <p class="text-xs text-slate-400 mt-0.5 truncate">Kassada qaysi xizmat rejimlarini faollashtirishni belgilang</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
        <!-- 1. Zalda -->
        <div
          class="p-5 sm:p-6 rounded-2xl border transition-all flex flex-col justify-between space-y-3.5 min-w-0"
          :class="posSettings.allowDineIn ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-950 dark:text-emerald-300 shadow-xs' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3.5 min-w-0">
              <div class="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-xs">
                <UtensilsCrossed class="w-5.5 h-5.5" />
              </div>
              <div class="min-w-0">
                <h4 class="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">Zalda Xizmat</h4>
                <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-block mt-1" :class="posSettings.allowDineIn ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'">
                  {{ posSettings.allowDineIn ? 'Kassada faol' : "O'chirilgan" }}
                </span>
              </div>
            </div>

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
          <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-2.5 border-t border-slate-100 dark:border-slate-800">
            Stollar va zal ichida xizmat ko'rsatish funksiyasini kassada faollashtiradi.
          </p>
        </div>

        <!-- 2. Saboy -->
        <div
          class="p-5 sm:p-6 rounded-2xl border transition-all flex flex-col justify-between space-y-3.5 min-w-0"
          :class="posSettings.allowTakeaway ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-950 dark:text-emerald-300 shadow-xs' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3.5 min-w-0">
              <div class="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-xs">
                <ShoppingBag class="w-5.5 h-5.5" />
              </div>
              <div class="min-w-0">
                <h4 class="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">Saboy (Olib ketish)</h4>
                <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-block mt-1" :class="posSettings.allowTakeaway ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'">
                  {{ posSettings.allowTakeaway ? 'Kassada faol' : "O'chirilgan" }}
                </span>
              </div>
            </div>

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
          <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-2.5 border-t border-slate-100 dark:border-slate-800">
            Mijozlar buyurtmani o'zi bilan olib ketishi uchun mo'ljallangan tezkor rejim.
          </p>
        </div>

        <!-- 3. Dostavka -->
        <div
          class="p-5 sm:p-6 rounded-2xl border transition-all flex flex-col justify-between space-y-3.5 min-w-0"
          :class="posSettings.allowDelivery ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-950 dark:text-emerald-300 shadow-xs' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3.5 min-w-0">
              <div class="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-xs">
                <Truck class="w-5.5 h-5.5" />
              </div>
              <div class="min-w-0">
                <h4 class="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">Dostavka</h4>
                <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-block mt-1" :class="posSettings.allowDelivery ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'">
                  {{ posSettings.allowDelivery ? 'Kassada faol' : "O'chirilgan" }}
                </span>
              </div>
            </div>

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
          <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-2.5 border-t border-slate-100 dark:border-slate-800">
            Kuryer orqali manzillarga yetkazib berish xizmatlarini boshqarish rejimi.
          </p>
        </div>

        <!-- 4. Restoran & Kafe Xizmat Haqi (%) Card -->
        <div class="p-5 sm:p-5.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3 min-w-0 col-span-full">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3.5 min-w-0">
              <div class="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-xs">
                <UtensilsCrossed class="w-5.5 h-5.5" />
              </div>
              <div class="min-w-0">
                <h4 class="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">Restoran & Kafe Xizmat Haqi (%)</h4>
                <span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full inline-block mt-1">
                  Faqat Stolda (Dine-in) xizmat uchun avto-hisoblash
                </span>
              </div>
            </div>

            <button
              type="button"
              @click="$emit('togglePosSetting', 'enableServiceFee')"
              class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
              :class="posSettings.enableServiceFee !== false ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'"
            >
              <span
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out"
                :class="posSettings.enableServiceFee !== false ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
          </div>

          <div v-if="posSettings.enableServiceFee !== false" class="pt-3 border-t border-slate-200/60 dark:border-slate-800 flex flex-wrap items-center gap-4">
            <label class="text-xs font-bold text-slate-700 dark:text-slate-300">Xizmat Haqi Foizi (%):</label>
            <div class="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="30"
                :value="posSettings.serviceFeePercent || 10"
                @input="updateServiceFeePercent(Number(($event.target as HTMLInputElement).value))"
                class="w-20 h-9 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-extrabold text-xs text-center focus:outline-none focus:border-emerald-500"
              />
              <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400">%</span>
            </div>
            <span class="text-[11px] text-slate-400 italic">(Masalan: 10% yoki 7% Stolda tanovul uchun. Olib ketish 'С собой' buyurtmada 0% qo'shiladi)</span>
          </div>
        </div>

        <!-- 5. Restoran Stollar Zonalari & Ofitsiant Biriktirish Card -->
        <div class="p-5 sm:p-5.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-4 min-w-0 col-span-full">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3.5 min-w-0">
              <div class="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-xs">
                <Store class="w-5.5 h-5.5" />
              </div>
              <div class="min-w-0">
                <h4 class="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">Restoran Stollar Zonalari & Ofitsiant Biriktirish</h4>
                <span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full inline-block mt-1">
                  Zonalar (Zal, 2-qavat, VIP) hamda Ofitsiantlarga individual biriktirish
                </span>
              </div>
            </div>

            <button
              type="button"
              @click="$emit('togglePosSetting', 'enableTableZones')"
              class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
              :class="posSettings.enableTableZones !== false ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'"
            >
              <span
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out"
                :class="posSettings.enableTableZones !== false ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
          </div>

          <!-- Zones Management List & Adder -->
          <div v-if="posSettings.enableTableZones !== false" class="pt-3 border-t border-slate-200/60 dark:border-slate-800 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-700 dark:text-slate-300">Mavjud Zallar va Zonalar:</span>
              <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md">
                4 ta Zona Faol
              </span>
            </div>

            <!-- Zones Pills -->
            <div class="flex flex-wrap gap-2">
              <div class="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-extrabold flex items-center gap-1.5 shadow-xs">
                <Layers class="w-3.5 h-3.5 text-emerald-500" />
                <span>Asosiy Zal</span>
                <span class="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-600 font-mono">4 stol</span>
              </div>
              <div class="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-extrabold flex items-center gap-1.5 shadow-xs">
                <Building2 class="w-3.5 h-3.5 text-sky-500" />
                <span>2-Qavat</span>
                <span class="text-[9px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-600 font-mono">3 stol</span>
              </div>
              <div class="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-extrabold flex items-center gap-1.5 shadow-xs">
                <Crown class="w-3.5 h-3.5 text-amber-500" />
                <span>VIP Zonalar</span>
                <span class="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 font-mono">VIP-1, VIP-2</span>
              </div>
              <div class="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-extrabold flex items-center gap-1.5 shadow-xs">
                <Sun class="w-3.5 h-3.5 text-teal-500" />
                <span>Yozgi Terrasa</span>
                <span class="text-[9px] px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-600 font-mono">T-1, T-2</span>
              </div>
            </div>


            <!-- New Zone Add Field -->
            <div class="flex items-center gap-2 pt-1">
              <input
                type="text"
                v-model="newZoneName"
                placeholder="Yangi zona nomi (masalan: Bilyard Zali)..."
                class="flex-1 h-9 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-medium focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                @click="addCustomZone"
                class="px-3.5 h-9 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-1"
              >
                <span>+ Qo'shish</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>



    <!-- SECTION 3: UMUMIY KASSA VA TIZIM FUNKSIYALARI (SOFT SQUIRCLE EMERALD ICONS) -->
    <div class="glass-card rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800/80 shadow-xs bg-white dark:bg-slate-900 space-y-5 w-full overflow-hidden">
      <div class="flex items-center gap-3.5 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div class="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/25 shadow-xs">
          <SlidersHorizontal class="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div class="min-w-0">
          <h3 class="text-base font-black text-slate-900 dark:text-white tracking-tight truncate">Umumiy Kassa va Tizim Funksiyalari</h3>
          <p class="text-xs text-slate-400 mt-0.5 truncate">Kassadagi to'lov, vidjetlar, xavfsizlik va qo'shimcha imkoniyatlarni boshqaring</p>
        </div>
      </div>

      <!-- 2 Columns Grid with Squircle Soft Emerald Blur Icons -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-4 w-full">
        <!-- 1. Header Valyuta Ticker Vidjeti -->
        <div class="p-5 sm:p-5.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3 min-w-0">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3.5 min-w-0">
              <!-- Aynan 2-screenshotdagidek Squircle Soft Container -->
              <div class="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-xs">
                <TrendingUp class="w-5.5 h-5.5" />
              </div>
              <div class="min-w-0">
                <h4 class="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">Header Valyuta Ticker Vidjeti</h4>
                <span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full inline-block mt-1">
                  CBU Real-Vaqt Vidjeti
                </span>
              </div>
            </div>

            <button
              type="button"
              @click="$emit('togglePosSetting', 'showCurrencyTicker')"
              class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
              :class="posSettings.showCurrencyTicker !== false ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'"
            >
              <span
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out"
                :class="posSettings.showCurrencyTicker !== false ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-2.5 border-t border-slate-200/60 dark:border-slate-800">
            Tizimning eng yuqori sarlavha qismida Markaziy Bank (CBU) va maxsus valyuta kurslarini real-vaqt rejimida ko'rsatib boruvchi ticker vidjetini yoqadi.
          </p>
        </div>

        <!-- 2. Qulflangan Xizmatlarni Yashirish -->
        <div class="p-5 sm:p-5.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3 min-w-0">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3.5 min-w-0">
              <!-- Aynan 2-screenshotdagidek Squircle Soft Container -->
              <div class="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-xs">
                <Lock class="w-5.5 h-5.5" />
              </div>
              <div class="min-w-0">
                <h4 class="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">Qulflangan Xizmatlarni Yashirish</h4>
                <span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full inline-block mt-1">
                  Interfeys Xavfsizligi
                </span>
              </div>
            </div>

            <button
              type="button"
              @click="setHideLockedFeatures(!hideLockedFeatures)"
              class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
              :class="hideLockedFeatures ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'"
            >
              <span
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out"
                :class="hideLockedFeatures ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-2.5 border-t border-slate-200/60 dark:border-slate-800">
            Obuna tarifingizga kirmagan (qulf bo'lib turgan) tugma va modullarni interfeys hamda yon menyudan butunlay yashirib, minimalist UI hosil qiladi.
          </p>
        </div>

        <!-- 3. Nasiya (Qarzga sotish) & Limits Block (Span 2) -->
        <div class="xl:col-span-2 p-5 sm:p-5.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3.5 min-w-0">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-3.5 min-w-0">
              <!-- Aynan 2-screenshotdagidek Squircle Soft Container -->
              <div class="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-xs">
                <Users class="w-5.5 h-5.5" />
              </div>
              <div class="min-w-0">
                <h4 class="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">Nasiya (Qarzga sotish imkoniyati)</h4>
                <p class="text-xs text-slate-400 truncate">To'lov usullarida Nasiya tugmasi va mijozlar qarz daftari</p>
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

          <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-2.5 border-t border-slate-200/60 dark:border-slate-800">
            Kassada to'lov jarayonida Nasiya tugmasini ko'rsatadi hamda mijozga bir vaqtning o'zida yozilishi mumkin bo'lgan maksimal qarz miqdorini nazorat qiladi.
          </p>

          <!-- Inline Qarz Limiti Input Widget -->
          <div v-if="posSettings.allowDebt" class="pt-3 border-t border-slate-200/60 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-xs font-bold shrink-0">
              <ShieldAlert class="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
              <span>Mijoz Maksimal Qarz Limiti:</span>
            </div>

            <div class="flex items-center gap-2.5 shrink-0 max-w-full">
              <div class="w-40 sm:w-48">
                <CurrencyInput
                  :model-value="debtLimitInput"
                  :disabled="!posSettings.allowDebt"
                  @update:model-value="debtLimitInput = $event"
                  placeholder="0 = cheksiz"
                  input-class="text-xs font-bold font-mono py-1.5 px-3 h-9 text-right bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>
              <button
                type="button"
                :disabled="!posSettings.allowDebt"
                @click="$emit('setDebtLimit', debtLimitInput)"
                class="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white transition shadow-xs"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>

        <!-- 4. Chegirmalar berish -->
        <div class="p-5 sm:p-5.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3 min-w-0">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3.5 min-w-0">
              <!-- Aynan 2-screenshotdagidek Squircle Soft Container -->
              <div class="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-xs">
                <Percent class="w-5.5 h-5.5" />
              </div>
              <div class="min-w-0">
                <h4 class="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">Chegirmalar berish</h4>
                <span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full inline-block mt-1">
                  Foiz / Summa Chegirma
                </span>
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
          <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-2.5 border-t border-slate-200/60 dark:border-slate-800">
            Kassirga buyurtma summasiga foiz yoki aniq summa ko'rinishida chegirmalar va aksiyalarni qo'llash ruxsatini beradi.
          </p>
        </div>

        <!-- 5. Tezkor shtrixkod skaneri -->
        <div class="p-5 sm:p-5.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3 min-w-0">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3.5 min-w-0">
              <!-- Aynan 2-screenshotdagidek Squircle Soft Container -->
              <div class="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-xs">
                <Barcode class="w-5.5 h-5.5" />
              </div>
              <div class="min-w-0">
                <h4 class="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">Shtrix-kod skaneri</h4>
                <span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full inline-block mt-1">
                  Avto Savatga Qo'shish
                </span>
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
          <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-2.5 border-t border-slate-200/60 dark:border-slate-800">
            Barkod skaner orqali tovar shtrix-kodini o'qib, ularni avtomatik tarzda kassa savatiga zumda qo'shish rejimini faollashtiradi.
          </p>
        </div>

        <!-- 6. Qoldiqni eslatish -->
        <div class="p-5 sm:p-5.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3 min-w-0">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3.5 min-w-0">
              <!-- Aynan 2-screenshotdagidek Squircle Soft Container -->
              <div class="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-xs">
                <Package class="w-5.5 h-5.5" />
              </div>
              <div class="min-w-0">
                <h4 class="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">Ombor Qoldig'ini Eslatish</h4>
                <span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full inline-block mt-1">
                  Zaxira Ogohlantirishi
                </span>
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
          <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-2.5 border-t border-slate-200/60 dark:border-slate-800">
            Omborda tugab borayotgan yoki zaxirasi kam qolgan tovarlar haqida kassada va tahliliy panellarda jonli ogohlantirish beradi.
          </p>
        </div>

        <!-- 7. Kassa tezkor tugmalari (Hotkeys) -->
        <div class="p-5 sm:p-5.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3 min-w-0">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3.5 min-w-0">
              <!-- Aynan 2-screenshotdagidek Squircle Soft Container -->
              <div class="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-xs">
                <Keyboard class="w-5.5 h-5.5" />
              </div>
              <div class="min-w-0">
                <h4 class="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                  <span>Hotkeys</span>
                  <span class="px-2 py-0.2 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-black">F1-F10</span>
                </h4>
                <span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full inline-block mt-1">
                  Klaviatura Boshqaruvi
                </span>
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
          <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-2.5 border-t border-slate-200/60 dark:border-slate-800">
            Sichqonchasiz (klaviatura orqali) kassa boshqarish, to'lovni yakunlash va chek chiqarish uchun F1, F2, F4, F8, F10 tugmalarini faollashtiradi.
          </p>
        </div>

        <!-- 8. Narx Yorlig'i (Cennik / Barkod) Studiyasi -->
        <div class="p-5 sm:p-5.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3 min-w-0">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3.5 min-w-0">
              <div class="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-xs">
                <Tag class="w-5.5 h-5.5" />
              </div>
              <div class="min-w-0">
                <h4 class="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">Narx Yorlig'i & Barkod Chop Etish</h4>
                <span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full inline-block mt-1">
                  Termo Printer / Cennik
                </span>
              </div>
            </div>

            <button
              type="button"
              @click="$emit('togglePosSetting', 'allowBarcodeStudio')"
              class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
              :class="posSettings.allowBarcodeStudio !== false ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'"
            >
              <span
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out"
                :class="posSettings.allowBarcodeStudio !== false ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-2.5 border-t border-slate-200/60 dark:border-slate-800">
            Mahsulotlar bo'limida termo printerlar (40x25mm, 58x40mm) uchun narx yorliqlari va shtrix-kod stikerlarini chop etish studiyasini yoqish/o'chirish.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
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
  ShieldAlert,
  TrendingUp,
  ShoppingBag,
  Truck,
  Lock,
  Check,
  Store,
  Layers,
  Building2,
  Crown,
  Tag,
} from 'lucide-vue-next';

import { useThemeStore } from '../../../stores/theme.store';
import { useFormat } from '../../../composables/useFormat';
import { usePlanFeatures } from '../../../composables/usePlanFeatures';
import { usePosSettings } from '../../../composables/usePosSettings';
import { useToast } from '../../../composables/useToast';
import CurrencyInput from '../../../components/CurrencyInput.vue';

const { formatCurrency } = useFormat();
const { isFeatureDisabled, hideLockedFeatures, setHideLockedFeatures } = usePlanFeatures();
const { updatePosSettings } = usePosSettings();
const toast = useToast();

const newZoneName = ref('');

const addCustomZone = () => {
  if (!newZoneName.value.trim()) {
    toast.warning('Iltimos zona nomini kiriting!', 'Zona Nomi Bo\'sh');
    return;
  }
  toast.success(`Yangi zona "${newZoneName.value}" muvaffaqiyatli saqlandi!`, 'Restoran Zonasi');
  newZoneName.value = '';
};


const props = defineProps<{
  posSettings: {
    allowDineIn: boolean;
    allowTakeaway: boolean;
    allowDelivery: boolean;
    allowDebt: boolean;
    allowDiscounts: boolean;
    quickBarcode: boolean;
    allowZeroStockSale: boolean;
    enableHotkeys?: boolean;
    maxDebtLimit: number;
    showCurrencyTicker?: boolean;
    enableServiceFee?: boolean;
    serviceFeePercent?: number;
    enableTableZones?: boolean;
    allowBarcodeStudio?: boolean;
  };
}>();


const updateServiceFeePercent = (val: number) => {
  const safeVal = Math.min(30, Math.max(0, val || 0));
  updatePosSettings({ serviceFeePercent: safeVal });
};

defineEmits<{
  (e: 'togglePosSetting', key: string): void;
  (e: 'setDebtLimit', val: number): void;
}>();

const themeStore = useThemeStore();

const debtLimitInput = ref(props.posSettings.maxDebtLimit ?? 0);
watch(
  () => props.posSettings.maxDebtLimit,
  (val) => {
    debtLimitInput.value = val ?? 0;
  },
  { immediate: true }
);
</script>

