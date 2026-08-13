<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Tizim Sozlamalari</h1>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Shaxsiy profil, biznes parametrlari, interfeys mavzusi, xodimlar va ruxsatlar boshqaruvi</p>
    </div>

    <!-- Tabs -->
    <div class="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs overflow-x-auto">
      <button
        @click="activeTab = 'my-profile'"
        class="flex items-center space-x-2 px-4 py-2 rounded-xl font-bold transition whitespace-nowrap btn-interactive"
        :class="activeTab === 'my-profile' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
      >
        <UserCircle class="w-4 h-4" />
        <span>Mening Profilim</span>
      </button>

      <button
        @click="activeTab = 'appearance'"
        class="flex items-center space-x-2 px-4 py-2 rounded-xl font-bold transition whitespace-nowrap btn-interactive"
        :class="activeTab === 'appearance' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
      >
        <Palette class="w-4 h-4" />
        <span>Ko'rinish & Xizmatlar</span>
      </button>

      <button
        @click="activeTab = 'employees'"
        class="flex items-center space-x-2 px-4 py-2 rounded-xl font-bold transition whitespace-nowrap btn-interactive"
        :class="activeTab === 'employees' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
      >
        <Users class="w-4 h-4" />
        <span>Xodimlar va Ruxsatlar</span>
      </button>

      <button
        @click="activeTab = 'receipt'"
        class="flex items-center space-x-2 px-4 py-2 rounded-xl font-bold transition whitespace-nowrap btn-interactive"
        :class="activeTab === 'receipt' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
      >
        <Printer class="w-4 h-4" />
        <span>Chek & Printer</span>
      </button>

      <button
        @click="activeTab = 'audit'"
        class="flex items-center space-x-2 px-4 py-2 rounded-xl font-bold transition whitespace-nowrap btn-interactive"
        :class="activeTab === 'audit' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
      >
        <ScrollText class="w-4 h-4" />
        <span>Audit Jurnallari</span>
      </button>

      <button
        @click="activeTab = 'danger'"
        class="flex items-center space-x-2 px-4 py-2 rounded-xl font-bold transition whitespace-nowrap btn-interactive"
        :class="activeTab === 'danger' ? 'bg-rose-500 text-white shadow-sm' : 'text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300'"
      >
        <Trash2 class="w-4 h-4" />
        <span>O'chirish</span>
      </button>
    </div>

    <!-- Tab 0: Mening Profilim (Redesigned Full-Width & Unified) -->
    <div v-if="activeTab === 'my-profile'" class="space-y-6 w-full">
      <!-- User Profile Hero Banner -->
      <div class="glass-card rounded-3xl p-6 sm:p-8 relative overflow-visible z-20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-5 relative z-20">
          <!-- Left: Avatar & User Quick Details -->
          <div class="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div class="relative group">
              <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-emerald-500 text-white font-black text-3xl sm:text-4xl flex items-center justify-center shadow-lg shadow-emerald-500/25 ring-4 ring-white dark:ring-slate-900 shrink-0">
                {{ (authStore.user?.fullName || 'U').charAt(0).toUpperCase() }}
              </div>
              <div class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white" title="Faol profil">
                <CheckCircle2 class="w-3.5 h-3.5" />
              </div>
            </div>

            <div class="space-y-1.5">
              <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {{ authStore.user?.fullName || 'Foydalanuvchi' }}
                </h2>
                <span class="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] uppercase border border-emerald-500/30">
                  {{ authStore.user?.isSuperAdmin ? 'SuperAdmin' : (authStore.activeBusiness?.role || 'Owner') }}
                </span>
              </div>

              <p class="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center sm:justify-start gap-3">
                <span class="flex items-center gap-1 font-mono">
                  <Phone class="w-3.5 h-3.5 text-emerald-500" />
                  {{ authStore.user?.phone }}
                </span>
              </p>
            </div>
          </div>

          <!-- Right Side: Business Badge & Interactive Currency Selector -->
          <div class="flex flex-wrap items-center justify-center sm:justify-end gap-3 shrink-0">
            <span class="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-1.5 shadow-sm">
              <Building2 class="w-4 h-4 text-emerald-500" />
              <span>{{ authStore.activeBusiness?.name || 'Biznes' }}</span>
            </span>

            <div class="w-44">
              <AppSelect
                v-model="selectedCurrency"
                :options="currencyOptions"
                @change="handleCurrencyChange"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Main Profile & Business Settings Single Unified Form Container -->
      <form @submit.prevent="handleSaveUnifiedProfile" class="glass-card rounded-3xl p-6 sm:p-8 space-y-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
          <!-- 1. Shaxsiy Ma'lumotlar -->
          <div class="space-y-4 lg:pr-6">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <h3 class="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <UserCircle class="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                <span>Shaxsiy Ma'lumotlar</span>
              </h3>
            </div>

            <div class="space-y-4 text-xs">
              <div>
                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">To'liq Ism Familiya *</label>
                <input
                  v-model="profileForm.fullName"
                  required
                  placeholder="Ism Familiyangizni kiriting"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium"
                />
              </div>

              <div>
                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Telefon Raqami *</label>
                <PhoneInput v-model="profileForm.phone" required placeholder="90 123 45 67" />
              </div>
            </div>
          </div>

          <!-- 2. Xavfsizlik & Parol -->
          <div class="space-y-4 pt-6 lg:pt-0 lg:pl-8">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <h3 class="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Key class="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                <span>Xavfsizlik & Parol</span>
              </h3>
            </div>

            <div class="space-y-4 text-xs">
              <div>
                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Amaldagi Parol</label>
                <input
                  type="password"
                  v-model="passwordForm.currentPassword"
                  placeholder="Amaldagi joriy parolingizni kiriting"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium"
                />
              </div>

              <div>
                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Yangi Parol (Ixtiyoriy)</label>
                <input
                  type="password"
                  v-model="passwordForm.newPassword"
                  placeholder="O'zgartirish uchun yangi parol kiriting"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 3. Biznes Ma'lumotlari (Embedded) -->
        <div class="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <h3 class="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 class="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              <span>Biznes Ma'lumotlari</span>
            </h3>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Biznes Nomi</label>
              <input :value="authStore.activeBusiness?.name" disabled class="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold cursor-not-allowed" />
            </div>

            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Biznes Turi</label>
              <input :value="authStore.activeBusiness?.businessType" disabled class="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 uppercase font-black cursor-not-allowed" />
            </div>

            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tizim Valyutasi *</label>
              <AppSelect
                v-model="selectedCurrency"
                :options="currencyOptions"
                @change="handleCurrencyChange"
              />
            </div>

            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Foydalanuvchi Roli</label>
              <input :value="authStore.activeBusiness?.role || 'Owner'" disabled class="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-purple-600 dark:text-purple-400 font-black cursor-not-allowed" />
            </div>
          </div>
        </div>

        <!-- Single Unified Save Button -->
        <div class="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
          <button
            type="submit"
            :disabled="savingProfile || changingPassword"
            class="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-sm shadow-xl shadow-emerald-500/25 transition btn-interactive flex items-center gap-2"
          >
            <Save class="w-4 h-4" />
            <span>{{ (savingProfile || changingPassword) ? "Saqlanmoqda..." : "O'zgarishlarni Saqlash" }}</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Tab: Ko'rinish & Xizmatlar (Theme Mode + Service Modes + POS Features) -->
    <div v-if="activeTab === 'appearance'" class="space-y-6 w-full animate-fade-in">
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
                @click="togglePosSetting('allowDineIn')"
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
                @click="togglePosSetting('allowTakeaway')"
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
                @click="togglePosSetting('allowDelivery')"
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
              @click="togglePosSetting('allowDebt')"
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
              @click="togglePosSetting('allowDiscounts')"
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
              @click="togglePosSetting('quickBarcode')"
              class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
              :class="posSettings.quickBarcode ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'"
            >
              <span
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out"
                :class="posSettings.quickBarcode ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
          </div>

          <!-- 4. Nol qoldiq bilan sotish -->
          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Package class="w-5 h-5" />
              </div>
              <div>
                <h4 class="font-bold text-xs text-slate-900 dark:text-white">0 qoldiqli tovarlarni sotish</h4>
                <p class="text-[10px] text-slate-500 dark:text-slate-400">Omborda 0 qolgan tovarlarni ham sotishga ruxsat</p>
              </div>
            </div>
            <button
              type="button"
              @click="togglePosSetting('allowZeroStockSale')"
              class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
              :class="posSettings.allowZeroStockSale ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'"
            >
              <span
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out"
                :class="posSettings.allowZeroStockSale ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab 2: Employees and Permissions -->
    <div v-if="activeTab === 'employees'" class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-base font-bold text-slate-900 dark:text-white">Xodimlar Ro'yxati</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">Har bir xodim faqat o'ziga ruxsat berilgan bo'limlar bilan ishlay oladi</p>
        </div>

        <button
          @click="openAddEmployeeModal"
          class="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition btn-interactive"
        >
          <UserPlus class="w-4 h-4" />
          <span>Yangi Xodim Qo'shish</span>
        </button>
      </div>

      <SkeletonLoader v-if="loadingEmployees" variant="table" :rows="4" />

      <div v-else class="glass-card rounded-2xl overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase font-semibold">
              <tr>
                <th class="py-3 px-4">Xodim</th>
                <th class="py-3 px-4">Telefon</th>
                <th class="py-3 px-4">Lavozim</th>
                <th class="py-3 px-4">Ruxsat Berilgan Bo'limlar</th>
                <th class="py-3 px-4">Holat</th>
                <th class="py-3 px-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
              <tr v-if="employees.length === 0">
                <td colspan="6" class="py-8 text-center text-slate-400 dark:text-slate-500">Xodimlar mavjud emas</td>
              </tr>
              <tr v-for="emp in employees" :key="emp.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                <td class="py-3 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <div class="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                    {{ emp.fullName.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <span>{{ emp.fullName }}</span>
                    <span v-if="emp.isOwner" class="ml-1.5 text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold uppercase">Egasi</span>
                  </div>
                </td>
                <td class="py-3 px-4 font-mono text-slate-500 dark:text-slate-400">{{ emp.phone }}</td>
                <td class="py-3 px-4">
                  <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {{ emp.position || 'Xodim' }}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="mod in (emp.allowedModules || ['pos', 'products'])"
                      :key="mod"
                      class="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold"
                    >
                      {{ getModuleLabel(mod) }}
                    </span>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <span
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    :class="emp.status === 'active' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'"
                  >
                    {{ emp.status === 'active' ? 'Faol' : 'Nofaol' }}
                  </span>
                </td>
                <td class="py-3 px-4 text-right space-x-1">
                  <button
                    v-if="!emp.isOwner"
                    @click="editEmployee(emp)"
                    class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
                    title="Tahrirlash"
                  >
                    <Edit2 class="w-3.5 h-3.5" />
                  </button>
                  <button
                    v-if="!emp.isOwner"
                    @click="deleteEmployee(emp)"
                    class="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition"
                    title="O'chirish"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Tab 3: Audit Logs -->
    <div v-if="activeTab === 'audit'" class="glass-card rounded-2xl overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase font-semibold">
            <tr>
              <th class="py-3 px-4">Vaqt</th>
              <th class="py-3 px-4">Xodim</th>
              <th class="py-3 px-4">Harakat (Action)</th>
              <th class="py-3 px-4">Bo'lim</th>
              <th class="py-3 px-4">IP Manzil</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200 font-mono">
            <tr v-if="auditLogs.length === 0">
              <td colspan="5" class="py-8 text-center text-slate-400 dark:text-slate-500 font-sans">Audit yozuvlari mavjud emas</td>
            </tr>
            <tr v-for="log in auditLogs" :key="log.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
              <td class="py-3 px-4 text-slate-500 dark:text-slate-400 font-sans">{{ formatDate(log.createdAt) }}</td>
              <td class="py-3 px-4 font-sans font-bold text-slate-900 dark:text-white">{{ log.user?.fullName }}</td>
              <td class="py-3 px-4 uppercase text-emerald-600 dark:text-emerald-400 font-bold">{{ log.action }}</td>
              <td class="py-3 px-4 text-slate-700 dark:text-slate-300">{{ log.entity }}</td>
              <td class="py-3 px-4 text-slate-400 dark:text-slate-500">{{ log.ipAddress || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tab: Chek va Printer Sozlamalari -->
    <div v-if="activeTab === 'receipt'" class="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-5xl">
      <!-- Left 7 cols: Controls -->
      <div class="lg:col-span-7 space-y-5">
        <!-- Paper Size Cards -->
        <div class="glass-card rounded-2xl p-5 space-y-3">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Printer class="w-4 h-4 text-emerald-500" />
            <span>Chek Formati / O'lchami</span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Kassangizdagi termal printer yoki standart printer qog'oz o'lchamini tanlang
          </p>

          <div class="grid grid-cols-3 gap-3 pt-1">
            <!-- 58mm -->
            <button
              type="button"
              @click="receiptSettings.paperSize = '58mm'"
              class="p-3.5 rounded-xl border text-left transition relative"
              :class="[
                receiptSettings.paperSize === '58mm'
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:border-slate-300'
              ]"
            >
              <div class="text-sm font-black font-mono">58 mm</div>
              <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Kichik kassa lentalari</div>
            </button>

            <!-- 80mm -->
            <button
              type="button"
              @click="receiptSettings.paperSize = '80mm'"
              class="p-3.5 rounded-xl border text-left transition relative"
              :class="[
                receiptSettings.paperSize === '80mm'
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:border-slate-300'
              ]"
            >
              <div class="text-sm font-black font-mono">80 mm</div>
              <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Standart termal chek</div>
            </button>

            <!-- A4 -->
            <button
              type="button"
              @click="receiptSettings.paperSize = 'A4'"
              class="p-3.5 rounded-xl border text-left transition relative"
              :class="[
                receiptSettings.paperSize === 'A4'
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:border-slate-300'
              ]"
            >
              <div class="text-sm font-black font-mono">A4 Varaq</div>
              <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Hisob-faktura / varaq</div>
            </button>
          </div>
        </div>

        <!-- Custom Header & Footer Texts -->
        <div class="glass-card rounded-2xl p-5 space-y-4 text-xs">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white">Chek Matnlari va Rekvizitlari</h3>

          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Chek Boshidagi Sarlavha (Do'kon nomi)</label>
            <input
              v-model="receiptSettings.headerTitle"
              :placeholder="authStore.activeBusiness?.name || 'Do\'kon nomi'"
              class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Chek Ostidagi Izoh / Kontaktlar</label>
            <input
              v-model="receiptSettings.headerSubtitle"
              placeholder="Masalan: Toshkent sh., Chilonzor tumani. Tel: +998 90 123 45 67"
              class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Chek Tagidagi Minnatdorchilik Matni</label>
            <textarea
              v-model="receiptSettings.footerText"
              rows="2"
              placeholder="Masalan: Xaridingiz uchun rahmat! Qaytarish 24 soat ichida chek bilan."
              class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            ></textarea>
          </div>
        </div>

        <!-- Toggles -->
        <div class="glass-card rounded-2xl p-5 space-y-3 text-xs">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white">Chekdagi Qo'shimcha Bloklar</h3>

          <div class="space-y-2.5">
            <label class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
              <span class="font-medium text-slate-700 dark:text-slate-300">Chekda shtrix-kod ko'rsatish</span>
              <input type="checkbox" v-model="receiptSettings.showBarcode" class="rounded text-emerald-500 focus:ring-emerald-500" />
            </label>

            <label class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
              <span class="font-medium text-slate-700 dark:text-slate-300">Kassir / Mas'ul xodim ismini ko'rsatish</span>
              <input type="checkbox" v-model="receiptSettings.showCashier" class="rounded text-emerald-500 focus:ring-emerald-500" />
            </label>

            <label class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
              <span class="font-medium text-slate-700 dark:text-slate-300">Mijoz ma'lumotlarini (agar kiritilgan bo'lsa) ko'rsatish</span>
              <input type="checkbox" v-model="receiptSettings.showCustomer" class="rounded text-emerald-500 focus:ring-emerald-500" />
            </label>

            <label class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
              <span class="font-medium text-slate-700 dark:text-slate-300">Kassada to'lov qilingandan so'ng chekni darhol avtomatik chop etish</span>
              <input type="checkbox" v-model="receiptSettings.autoPrint" class="rounded text-emerald-500 focus:ring-emerald-500" />
            </label>
          </div>
        </div>

        <!-- Buttons -->
        <div class="flex items-center gap-3">
          <button
            type="button"
            @click="saveReceiptSettings"
            class="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition btn-interactive flex items-center justify-center gap-2"
          >
            <Save class="w-4 h-4" />
            <span>Sozlamalarni Saqlash</span>
          </button>

          <button
            type="button"
            @click="triggerTestPrint"
            class="py-3 px-5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition flex items-center gap-2 btn-interactive"
          >
            <Printer class="w-4 h-4" />
            <span>Test Chek Chop Etish</span>
          </button>
        </div>
      </div>

      <!-- Right 5 cols: Live Mock Receipt Preview -->
      <div class="lg:col-span-5">
        <div class="glass-card rounded-2xl p-5 sticky top-20 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500 uppercase">Jonli Chek Ko'rinishi</span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
              {{ receiptSettings.paperSize }}
            </span>
          </div>

          <!-- Realistic Receipt Paper Preview -->
          <div
            class="bg-white text-slate-900 font-mono text-[11px] p-4 rounded-xl shadow-md border border-slate-200 mx-auto transition-all duration-300 overflow-hidden"
            :style="{ maxWidth: receiptSettings.paperSize === '58mm' ? '220px' : receiptSettings.paperSize === 'A4' ? '100%' : '280px' }"
          >
            <div class="text-center space-y-1">
              <div class="font-black text-sm uppercase">{{ receiptSettings.headerTitle || authStore.activeBusiness?.name || 'Do\'kon Nomi' }}</div>
              <div v-if="receiptSettings.headerSubtitle" class="text-[10px] text-slate-500">{{ receiptSettings.headerSubtitle }}</div>
              <div class="border-b border-dashed border-slate-400 my-2"></div>
              <div class="text-[10px] text-left space-y-0.5">
                <div>CHEK №: <strong>#0042</strong></div>
                <div>SANA: 13-avgust, 2026 16:15</div>
                <div v-if="receiptSettings.showCashier">KASSIR: BOT (Sotuvchi)</div>
                <div v-if="receiptSettings.showCustomer">MIJOZ: Alisherjon H.</div>
              </div>
              <div class="border-b border-dashed border-slate-400 my-2"></div>
            </div>

            <!-- Items -->
            <div class="space-y-1.5 py-1">
              <div class="flex justify-between">
                <span>Coca-Cola 1.5L x2</span>
                <span class="font-bold">28 000</span>
              </div>
              <div class="flex justify-between">
                <span>Nestle Sut 1L x1</span>
                <span class="font-bold">14 000</span>
              </div>
            </div>

            <div class="border-t border-dashed border-slate-400 my-2 pt-1.5 space-y-1 text-[10px]">
              <div class="flex justify-between">
                <span>Oraliq summa:</span>
                <span>42 000 so'm</span>
              </div>
              <div class="flex justify-between text-xs font-black text-slate-900 border-t border-slate-900 pt-1">
                <span>JAMI TO'LOV:</span>
                <span>42 000 SO'M</span>
              </div>
              <div class="flex justify-between pt-1">
                <span>To'lov (Naqd pul):</span>
                <span>42 000 so'm</span>
              </div>
            </div>

            <!-- Footer -->
            <div class="text-center pt-2 space-y-1 border-t border-dashed border-slate-400 mt-2">
              <div v-if="receiptSettings.showBarcode" class="text-[10px] tracking-widest font-bold py-1">
                * #0042 *
              </div>
              <div class="text-[10px] text-slate-600 font-semibold">{{ receiptSettings.footerText || 'Xaridingiz uchun rahmat!' }}</div>
              <div class="text-[8px] text-slate-400">boshqar.uz — Universal Tizim</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Hidden Receipt Modal for Test Print -->
    <ReceiptModal
      v-if="testOrderForReceipt"
      :order="testOrderForReceipt"
      @close="testOrderForReceipt = null"
    />

    <!-- Tab 4: Danger Zone -->
    <div v-if="activeTab === 'danger'" class="space-y-4 max-w-xl">
      <div class="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-3">
        <h4 class="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
          <AlertTriangle class="w-4 h-4" />
          <span>Xavfli Hudud</span>
        </h4>
        <p class="text-xs text-slate-600 dark:text-slate-300">
          Ushbu amallar qaytarib bo'lmas hisoblanadi. Ma'lumotlarni o'chirishdan oldin ehtiyot bo'ling.
        </p>

        <div class="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            @click="openDeleteBusinessModal"
            class="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-600/25 transition btn-interactive"
          >
            Joriy Biznesni O'chirish
          </button>
          <button
            @click="openDeleteAccountModal"
            class="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-rose-600 dark:text-rose-400 font-bold text-xs transition border border-rose-500/30 btn-interactive"
          >
            Foydalanuvchi Hisobini Butunlay O'chirish
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Employee Modal -->
    <div v-if="showEmployeeModal" @click.self="showEmployeeModal = false" class="modal-overlay">
      <div class="modal-container max-w-md" @click.stop>
        <div class="modal-header">
          <h3 class="text-base font-bold text-slate-900 dark:text-white">{{ editingEmpId ? 'Xodimni Tahrirlash' : 'Yangi Xodim Qo\'shish' }}</h3>
          <button @click="showEmployeeModal = false" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"><X class="w-5 h-5" /></button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="saveEmployee" class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">To'liq Ism Familiya *</label>
              <input
                v-model="empForm.fullName"
                required
                placeholder="Masalan: Sardor Rustamov"
                class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Telefon Raqami (Login) *</label>
              <PhoneInput v-model="empForm.phone" required placeholder="90 123 45 67" />
            </div>

            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {{ editingEmpId ? 'Yangi Parol (ixtiyoriy)' : 'Vaqtinchalik Parol *' }}
              </label>
              <input
                type="password"
                v-model="empForm.password"
                :required="!editingEmpId"
                :placeholder="editingEmpId ? 'O\'zgarishsiz qoldirish uchun bo\'sh qoldiring' : 'Kamida 4 yoki 6 ta belgi'"
                class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Lavozimi</label>
              <input
                v-model="empForm.position"
                placeholder="Masalan: Sotuvchi, Kassir, Omborchi"
                class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <!-- Allowed Modules Checkboxes -->
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Ruxsat Berilgan Bo'limlar:</label>
              <div class="grid grid-cols-2 gap-2">
                <label
                  v-for="mod in availableModules"
                  :key="mod.id"
                  class="flex items-center space-x-2 p-2 rounded-xl border transition cursor-pointer"
                  :class="empForm.allowedModules.includes(mod.id) ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-bold' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'"
                >
                  <input
                    type="checkbox"
                    :value="mod.id"
                    v-model="empForm.allowedModules"
                    class="rounded text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>{{ mod.label }}</span>
                </label>
              </div>
            </div>

            <!-- Granular Action Permissions (Create, Edit, Delete) for Selected Modules -->
            <div v-if="empForm.allowedModules.length > 0" class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <span class="block font-bold text-slate-800 dark:text-slate-200 text-xs">
                Operatsion Huquqlar (Qo'shish, Tahrirlash, O'chirish):
              </span>

              <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
                <div
                  v-for="modId in empForm.allowedModules"
                  :key="modId"
                  class="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-[11px]"
                >
                  <div class="font-bold text-slate-900 dark:text-white mb-1">
                    {{ getModuleLabel(modId) }}
                  </div>
                  <div class="grid grid-cols-3 gap-1 text-[10px]">
                    <label class="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        v-model="getActionPerm(modId).create"
                        class="rounded text-emerald-500 focus:ring-emerald-500"
                      />
                      <Plus class="w-3 h-3 text-emerald-500" />
                      <span>Qo'shish</span>
                    </label>
                    <label class="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        v-model="getActionPerm(modId).edit"
                        class="rounded text-emerald-500 focus:ring-emerald-500"
                      />
                      <Edit2 class="w-3 h-3 text-amber-500" />
                      <span>Tahrirlash</span>
                    </label>
                    <label class="flex items-center gap-1 cursor-pointer text-rose-600 dark:text-rose-400 font-bold">
                      <input
                        type="checkbox"
                        v-model="getActionPerm(modId).delete"
                        class="rounded text-rose-500 focus:ring-rose-500"
                      />
                      <Trash2 class="w-3 h-3 text-rose-500" />
                      <span>O'chirish</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              :disabled="savingEmp"
              class="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition mt-3 btn-interactive"
            >
              {{ savingEmp ? (editingEmpId ? 'Saqlanmoqda...' : 'Qo\'shilmoqda...') : (editingEmpId ? 'O\'zgarishlarni Saqlash' : 'Xodimni Saqlash') }}
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- Confirm Modal -->
    <div v-if="showConfirmModal" @click.self="showConfirmModal = false" class="modal-overlay">
      <div class="modal-container max-w-sm" @click.stop>
        <div class="modal-header border-rose-500/20">
          <h3 class="text-base font-bold text-rose-600 dark:text-rose-400">Tasdiqlash kerak</h3>
          <button @click="showConfirmModal = false" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"><X class="w-5 h-5" /></button>
        </div>

        <div class="modal-body">
          <p class="text-xs text-slate-600 dark:text-slate-300">
            O'chirishni tasdiqlash uchun quyidagi maydonga <strong class="text-slate-900 dark:text-white font-mono">OCHIRISH</strong> so'zini yozing:
          </p>

          <input
            v-model="confirmInput"
            placeholder="OCHIRISH"
            class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-center font-bold tracking-widest uppercase focus:outline-none focus:border-rose-500"
          />
        </div>

        <div class="modal-footer">
          <button
            @click="showConfirmModal = false"
            class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Bekor qilish
          </button>
          <button
            @click="executeDeletion"
            :disabled="confirmInput !== 'OCHIRISH' || deleting"
            class="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-lg shadow-rose-600/30 btn-interactive"
          >
            {{ deleting ? 'O\'chirilmoqda...' : 'O\'chirish' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Confirm Dialog -->
    <AppConfirmDialog
      :open="confirmModal.open"
      :title="confirmModal.title"
      :message="confirmModal.message"
      variant="danger"
      confirm-text="Ha, o'chirish"
      @confirm="confirmModal.onConfirm"
      @cancel="confirmModal.open = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth.store';
import { useThemeStore } from '../../stores/theme.store';
import { useToast } from '../../composables/useToast';
import { useFormat } from '../../composables/useFormat';
import api from '../../services/api';
import { cleanUzbekPhone } from '../../utils/phone';
import PhoneInput from '../../components/PhoneInput.vue';
import AppConfirmDialog from '../../components/AppConfirmDialog.vue';
import {
  Building2,
  Users,
  ScrollText,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  UserPlus,
  X,
  Palette,
  Sun,
  Moon,
  Monitor,
  Package,
  Boxes,
  Truck,
  UtensilsCrossed,
  Flame,
  Calendar,
  DollarSign,
  LayoutDashboard,
  UserCircle,
  Key,
  Save,
  ShieldCheck,
  Printer,
  CheckCircle2,
  Phone,
  Coins,
  SlidersHorizontal,
  Percent,
  Barcode,
} from 'lucide-vue-next';

import SkeletonLoader from '../../components/SkeletonLoader.vue';
import ReceiptModal from '../../components/ReceiptModal.vue';
import AppSelect from '../../components/AppSelect.vue';
import { usePosSettings, type PosSettings } from '../../composables/usePosSettings';

const currencyOptions = [
  { value: 'UZS', label: "UZS (So'm)", icon: Coins },
  { value: 'USD', label: "USD ($ Dollar)", icon: Coins },
  { value: 'RUB', label: "RUB (Rubl)", icon: Coins },
];

const router = useRouter();
const authStore = useAuthStore();
const themeStore = useThemeStore();
const toast = useToast();
const { formatDate } = useFormat();
const { posSettings, saveSettings } = usePosSettings();

const togglePosSetting = (key: keyof PosSettings) => {
  posSettings.value[key] = !posSettings.value[key];
  saveSettings();
  toast.success("Sozlama yangilandi!", "Kassa");
};

const activeTab = ref('my-profile');
const loading = ref(false);
const loadingEmployees = ref(false);
const savingEmp = ref(false);
const deleting = ref(false);

const confirmModal = ref<{
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => Promise<void> | void;
}>({
  open: false,
  title: 'Tasdiqlash',
  message: '',
  onConfirm: () => {},
});

// Phase 6: User profile & password states
const savingProfile = ref(false);
const changingPassword = ref(false);

const profileForm = ref({
  fullName: authStore.user?.fullName || '',
  phone: authStore.user?.phone || '',
  email: authStore.user?.email || '',
});

watch(
  () => authStore.user,
  (u) => {
    if (u) {
      profileForm.value = {
        fullName: u.fullName || '',
        phone: u.phone || '',
        email: u.email || '',
      };
    }
  },
  { immediate: true, deep: true },
);

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const selectedCurrency = ref(authStore.activeBusiness?.currency || 'UZS');

watch(
  () => authStore.activeBusiness?.currency,
  (cur) => {
    if (cur) selectedCurrency.value = cur;
  },
  { immediate: true },
);

const handleCurrencyChange = async () => {
  await authStore.updateBusinessCurrency(selectedCurrency.value);
  toast.success(`Valyuta ${selectedCurrency.value} ga o'zgartirildi!`, "Valyuta");
};

const handleSaveUnifiedProfile = async () => {
  savingProfile.value = true;
  try {
    // 1. Update basic profile info
    const cleanPhone = cleanUzbekPhone(profileForm.value.phone);
    await authStore.updateProfile({
      fullName: profileForm.value.fullName,
      phone: cleanPhone,
    });

    // 2. Update currency if changed
    if (selectedCurrency.value !== authStore.activeBusiness?.currency) {
      await authStore.updateBusinessCurrency(selectedCurrency.value);
    }

    // 3. If new password is entered, update password
    if (passwordForm.value.newPassword) {
      if (passwordForm.value.newPassword.length < 4) {
        toast.warning("Yangi parol kamida 4 ta belgidan iborat bo'lishi kerak", "Parol");
        savingProfile.value = false;
        return;
      }

      changingPassword.value = true;
      try {
        await authStore.changePassword({
          currentPassword: passwordForm.value.currentPassword || 'placeholder',
          newPassword: passwordForm.value.newPassword,
        });
        passwordForm.value = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        };
      } finally {
        changingPassword.value = false;
      }
    }

    toast.success("Profil va sozlamalar muvaffaqiyatli saqlandi!", "Profil");
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || "Profilni saqlashda xatolik", "Xatolik");
  } finally {
    savingProfile.value = false;
  }
};

const handleUpdateProfile = async () => {
  savingProfile.value = true;
  try {
    const cleanPhone = cleanUzbekPhone(profileForm.value.phone);
    await authStore.updateProfile({
      fullName: profileForm.value.fullName,
      phone: cleanPhone,
    });
    toast.success('Shaxsiy ma\'lumotlaringiz muvaffaqiyatli yangilandi!', 'Profil');
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Profilni yangilashda xatolik', 'Xatolik');
  } finally {
    savingProfile.value = false;
  }
};

const handleChangePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    toast.warning('Yangi parol va tasdiqlovchi parol bir-biriga mos kelmadi!', 'Parol');
    return;
  }
  if (passwordForm.value.newPassword.length < 4) {
    toast.warning('Yangi parol kamida 4 ta belgidan iborat bo\'lishi kerak', 'Parol');
    return;
  }

  changingPassword.value = true;
  try {
    await authStore.changePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword,
    });
    toast.success('Parolingiz muvaffaqiyatli o\'zgartirildi!', 'Xavfsizlik');
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Parolni o\'zgartirishda xatolik', 'Xatolik');
  } finally {
    changingPassword.value = false;
  }
};

const employees = ref<any[]>([]);
const auditLogs = ref<any[]>([]);

const showEmployeeModal = ref(false);
const showConfirmModal = ref(false);
const confirmType = ref<'business' | 'account'>('business');
const confirmInput = ref('');

const empForm = ref({
  fullName: '',
  phone: '+998 ',
  password: '',
  position: 'Sotuvchi',
  allowedModules: ['pos', 'products'],
  actionPermissions: {} as Record<string, { create: boolean; edit: boolean; delete: boolean }>,
});

const getActionPerm = (modId: string) => {
  if (!empForm.value.actionPermissions[modId]) {
    empForm.value.actionPermissions[modId] = { create: true, edit: true, delete: false };
  }
  return empForm.value.actionPermissions[modId];
};

const availableModules = [
  { id: 'pos', label: 'Kassa (POS)', icon: Package },
  { id: 'products', label: 'Mahsulotlar', icon: Package },
  { id: 'inventory', label: 'Ombor & Kirim', icon: Boxes },
  { id: 'customers', label: 'Mijozlar (CRM)', icon: Users },
  { id: 'suppliers', label: 'Ta\'minotchilar', icon: Truck },
  { id: 'tables', label: 'Stollar & Ofitsiant', icon: UtensilsCrossed },
  { id: 'kds', label: 'Oshxona (KDS)', icon: Flame },
  { id: 'appointments', label: 'Bandlovlar', icon: Calendar },
  { id: 'finance', label: 'Moliya & Xarajatlar', icon: DollarSign },
  { id: 'dashboard', label: 'Boshqaruv Paneli', icon: LayoutDashboard },
];

const getModuleLabel = (modId: string) => {
  const m = availableModules.find((item) => item.id === modId);
  return m ? m.label : modId;
};

const loadEmployees = async () => {
  loadingEmployees.value = true;
  try {
    const { data } = await api.get('/employees');
    employees.value = data || [];
  } catch (err) {
    console.error(err);
  } finally {
    loadingEmployees.value = false;
  }
};

const editingEmpId = ref<string | null>(null);

const openAddEmployeeModal = () => {
  editingEmpId.value = null;
  empForm.value = {
    fullName: '',
    phone: '+998 ',
    password: '',
    position: 'Sotuvchi',
    allowedModules: ['pos', 'products'],
    actionPermissions: {
      pos: { create: true, edit: true, delete: false },
      products: { create: true, edit: true, delete: false },
      inventory: { create: true, edit: true, delete: false },
      customers: { create: true, edit: true, delete: false },
      suppliers: { create: true, edit: true, delete: false },
      finance: { create: true, edit: true, delete: false },
    },
  };
  showEmployeeModal.value = true;
};

const editEmployee = (emp: any) => {
  editingEmpId.value = emp.id;
  empForm.value = {
    fullName: emp.fullName,
    phone: emp.phone,
    password: '',
    position: emp.position || 'Sotuvchi',
    allowedModules: emp.allowedModules && emp.allowedModules.length > 0 ? [...emp.allowedModules] : ['pos', 'products'],
    actionPermissions: emp.actionPermissions || {
      pos: { create: true, edit: true, delete: false },
      products: { create: true, edit: true, delete: false },
      inventory: { create: true, edit: true, delete: false },
      customers: { create: true, edit: true, delete: false },
      suppliers: { create: true, edit: true, delete: false },
      finance: { create: true, edit: true, delete: false },
    },
  };
  showEmployeeModal.value = true;
};

const saveEmployee = async () => {
  if (!empForm.value.fullName.trim()) {
    toast.warning('Xodimning ism va familiyasini kiriting', 'Ism');
    return;
  }

  if (empForm.value.allowedModules.length === 0) {
    toast.warning('Kamida bitta bo\'limni tanlashingiz kerak', 'Ruxsat');
    return;
  }

  const clean = cleanUzbekPhone(empForm.value.phone);
  if (clean.length < 13) {
    toast.warning('Telefon raqamni to\'liq 9 ta raqamda kiriting (+998 90 123 45 67)', 'Telefon');
    return;
  }

  if (!editingEmpId.value && (!empForm.value.password || empForm.value.password.length < 4)) {
    toast.warning('Yangi xodim uchun kamida 4 yoki 6 xonali parol kiriting', 'Parol');
    return;
  }

  savingEmp.value = true;
  try {
    const payload: any = {
      fullName: empForm.value.fullName.trim(),
      phone: clean,
      position: empForm.value.position,
      allowedModules: empForm.value.allowedModules,
    };
    if (empForm.value.password && empForm.value.password.trim()) {
      payload.password = empForm.value.password.trim();
    }

    if (editingEmpId.value) {
      await api.put(`/employees/${editingEmpId.value}`, payload);
      toast.success(`"${empForm.value.fullName}" ma'lumotlari muvaffaqiyatli yangilandi!`, 'Xodim');
    } else {
      await api.post('/employees', payload);
      toast.success(`"${empForm.value.fullName}" muvaffaqiyatli xodim sifatida qo'shildi!`, 'Xodim');
    }
    showEmployeeModal.value = false;
    await loadEmployees();
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Xodimni saqlashda xatolik yuz berdi', 'Xatolik');
  } finally {
    savingEmp.value = false;
  }
};

const deleteEmployee = (emp: any) => {
  confirmModal.value = {
    open: true,
    title: "Xodimni o'chirish",
    message: `Haqiqatan ham "${emp.fullName}" xodimini o'chirmoqchimisiz?`,
    onConfirm: async () => {
      try {
        await api.delete(`/employees/${emp.id}`);
        toast.success('Xodim muvaffaqiyatli o\'chirildi', 'O\'chirildi');
        await loadEmployees();
      } catch (err: any) {
        toast.error(err.response?.data?.message || err.message || 'Xodimni o\'chirishda xatolik yuz berdi', 'Xatolik');
      } finally {
        confirmModal.value.open = false;
      }
    },
  };
};

const loadAudit = async () => {
  loading.value = true;
  try {
    const { data } = await api.get('/audit-logs');
    auditLogs.value = data || [];
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const openDeleteBusinessModal = () => {
  confirmType.value = 'business';
  confirmInput.value = '';
  showConfirmModal.value = true;
};

const openDeleteAccountModal = () => {
  confirmType.value = 'account';
  confirmInput.value = '';
  showConfirmModal.value = true;
};

const executeDeletion = async () => {
  if (confirmInput.value !== 'OCHIRISH') return;

  deleting.value = true;
  try {
    if (confirmType.value === 'business') {
      const bizId = authStore.activeBusiness?.id;
      if (!bizId) throw new Error('Biznes topilmadi');
      await api.delete(`/businesses/${bizId}`);
      toast.success('Biznes va barcha ma\'lumotlar muvaffaqiyatli o\'chirildi', 'O\'chirildi');
      showConfirmModal.value = false;
      
      // Refresh user auth state
      authStore.logout();
      window.location.href = '/auth/login';
    } else {
      await api.delete('/businesses/account/me');
      toast.success('Hisobingiz muvaffaqiyatli o\'chirildi', 'O\'chirildi');
      showConfirmModal.value = false;
      authStore.logout();
      window.location.href = '/auth/register';
    }
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'O\'chirishda xatolik yuz berdi', 'Xatolik');
  } finally {
    deleting.value = false;
  }
};

// Receipt & Printer Settings State
const testOrderForReceipt = ref<any | null>(null);

const receiptSettings = ref({
  paperSize: '80mm',
  headerTitle: '',
  headerSubtitle: '',
  footerText: 'Xaridingiz uchun rahmat! Qaytarish 24 soat ichida chek bilan.',
  showBarcode: true,
  showQrCode: true,
  showCashier: true,
  showCustomer: true,
  autoPrint: false,
});

const loadReceiptSettings = () => {
  try {
    const raw = localStorage.getItem('ubms_receipt_settings');
    if (raw) {
      receiptSettings.value = { ...receiptSettings.value, ...JSON.parse(raw) };
    }
  } catch (e) {}
};

const saveReceiptSettings = () => {
  localStorage.setItem('ubms_receipt_settings', JSON.stringify(receiptSettings.value));
  toast.success('Chek va printer sozlamalari muvaffaqiyatli saqlandi!', 'Chek Sozlamalari');
};

const triggerTestPrint = () => {
  testOrderForReceipt.value = {
    orderNumber: '#0042',
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    subtotal: 42000,
    discountAmount: 0,
    total: 42000,
    cashier: { fullName: authStore.user?.fullName || 'BOT (Kassir)' },
    customer: { fullName: 'Alisherjon Habibullayev', phone: '+998 90 123 45 67' },
    items: [
      { id: '1', product: { name: 'Coca-Cola 1.5L' }, quantity: 2, unitPrice: 14000, total: 28000 },
      { id: '2', product: { name: 'Nestle Sut 1L' }, quantity: 1, unitPrice: 14000, total: 14000 },
    ],
    payments: [
      { id: 'p1', paymentMethod: { name: 'Naqd pul', type: 'cash' }, amount: 42000 },
    ],
  };
  setTimeout(() => {
    window.print();
  }, 150);
};

watch(
  () => authStore.activeBusiness?.id,
  (newId) => {
    if (newId) {
      loadEmployees();
      loadAudit();
    }
  },
);

onMounted(async () => {
  loadReceiptSettings();
  await authStore.fetchBusinesses();
  await authStore.fetchProfile();
  loadEmployees();
  loadAudit();
});
</script>
