<template>
  <div class="relative space-y-6">
    <!-- DEMO BLUR OVERLAY -->
    <div
      v-if="authStore.isDemo"
      @click="showProModal = true"
      class="absolute inset-0 z-30 bg-slate-950/45 backdrop-blur-[5px] rounded-3xl flex flex-col items-center justify-center p-6 text-center cursor-pointer group transition-all"
    >
      <div class="w-14 h-14 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-xl shadow-emerald-500/25 mb-3.5 group-hover:scale-110 transition-transform">
        <Lock class="w-7 h-7" />
      </div>
      <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black uppercase tracking-wider mb-2 border border-amber-400/30">
        <Crown class="w-3.5 h-3.5" />
        <span>Raqobatchilarda Yo'q Eksklyuziv Funksiya</span>
      </div>
      <h3 class="text-xl sm:text-2xl font-black text-white leading-tight">
        Telegram AI Bot & Avto-chek Xizmati Faqat PRO Tarifda Ochiq!
      </h3>
      <p class="text-xs sm:text-sm text-slate-200 max-w-lg mt-2 mb-4">
        Har bir savdo chekini mijozlarga avtomatik yuborish, qarzdorlik eslatmalari va xo'jayinga kunlik maxfiy hisobotlarni Telegramda olish uchun 14 kunlik bepul sinovni boshlang.
      </p>
      <button
        type="button"
        class="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-emerald-600/30 flex items-center gap-2 transition cursor-pointer"
      >
        <Sparkles class="w-4 h-4" />
        <span>14 Kun Bepul Sinashni Boshlash (Haqiqiy Hisob)</span>
      </button>
    </div>

    <!-- Header Banner: Pure Emerald Brand Theme, No Emojis, 100% Lucide Icons -->
    <div
      class="p-4 sm:p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      :class="{ 'filter blur-[4px] pointer-events-none select-none': authStore.isDemo }"
    >
      <div class="flex items-start gap-3.5">
        <div class="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/25">
          <Bot class="w-6 h-6" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white">Boshqar.uz Telegram Bot</h3>
            <span
              class="px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5"
              :class="status.isConnected ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="status.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'"></span>
              <span>{{ status.isConnected ? 'Faol (Ulangan)' : 'Ulanmagan' }}</span>
            </span>
          </div>
          <p class="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
            Real vaqtda har bir savdo cheki, kunlik {{ settingsForm.dailySummaryTime || '21:00' }} yakuniy hisoboti va omborda tovar tugash arafasidagi ogohlantirishlarni to'g'ridan-to'g'ri Telegramingizda qabul qiling.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2 w-full md:w-auto shrink-0">
        <button
          v-if="status.isConnected"
          type="button"
          @click="sendTestMessage"
          :disabled="testingMessage"
          class="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition shadow-xs flex items-center gap-1.5 btn-interactive"
        >
          <Send class="w-3.5 h-3.5 text-emerald-500" />
          <span>{{ testingMessage ? 'Yuborilmoqda...' : 'Sinov Xabari' }}</span>
        </button>

        <button
          v-if="status.isConnected"
          type="button"
          @click="disconnectBot"
          :disabled="disconnecting"
          class="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 transition shadow-xs flex items-center gap-1.5 btn-interactive"
        >
          <Unlink class="w-3.5 h-3.5" />
          <span>{{ disconnecting ? 'Uzilmoqda...' : 'Botni Uzish' }}</span>
        </button>

        <button
          v-else
          type="button"
          @click="openConnectFlow"
          :disabled="generatingLink"
          class="w-full md:w-auto px-4 py-2.5 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2 btn-interactive"
        >
          <Bot class="w-4 h-4" />
          <span>{{ generatingLink ? 'Havola olinmoqda...' : 'Telegram Botni Ulash' }}</span>
        </button>
      </div>
    </div>

    <!-- Connected Status Details Card (Multi-Account Support) -->
    <TelegramAccountList
      v-if="status.isConnected"
      :accounts="status.accounts?.length ? status.accounts : [{ chatId: status.chatId, username: status.username, connectedAt: status.connectedAt }]"
      :generating-link="generatingLink"
      @connect-more="openConnectFlow"
      @remove-account="disconnectAccount"
    />

    <!-- 1. Automatic Push Notifications Section -->
    <div class="glass-card rounded-2xl p-5 sm:p-6 space-y-4 border border-slate-200/80 dark:border-slate-800 shadow-sm">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h4 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Avtomatik Bildirishnomalar (Push Alerts)</span>
          </h4>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Kassada yoki omborda harakat sodir bo'lganda darhol Telegramga xabar yuborish</p>
        </div>
        <button
          type="button"
          @click="saveSettings"
          :disabled="savingSettings"
          class="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition shadow-sm btn-interactive shrink-0 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Check class="w-3.5 h-3.5" />
          <span>{{ savingSettings ? 'Saqlanmoqda...' : 'Sozlamalarni Saqlash' }}</span>
        </button>
      </div>

      <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden">
        <!-- 1. Orders -->
        <div
          @click="settingsForm.notifyOnOrder = !settingsForm.notifyOnOrder"
          class="p-3.5 sm:p-4 flex items-center justify-between gap-4 transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer select-none"
        >
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <Receipt class="w-5 h-5" />
            </div>
            <div class="space-y-0.5 min-w-0">
              <div class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Yangi Savdolar & Cheklar</div>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Kassada har bir chek urilganda xaridor, tovarlar ro'yxati, to'lov turi va summa haqida darhol xabar keladi.
              </p>
            </div>
          </div>

          <button
            type="button"
            @click.stop="settingsForm.notifyOnOrder = !settingsForm.notifyOnOrder"
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none"
            :class="settingsForm.notifyOnOrder ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'"
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
              :class="settingsForm.notifyOnOrder ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>

        <!-- 2. Low Stock -->
        <div
          @click="settingsForm.notifyOnLowStock = !settingsForm.notifyOnLowStock"
          class="p-3.5 sm:p-4 flex items-center justify-between gap-4 transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer select-none"
        >
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
              <AlertTriangle class="w-5 h-5" />
            </div>
            <div class="space-y-0.5 min-w-0">
              <div class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Kam Qolgan Tovar Signallari</div>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Mahsulot qoldig'i belgilangan minimal chegaradan kamayganda ta'minotchiga o'z vaqtida buyurtma berish uchun eslatma.
              </p>
            </div>
          </div>

          <button
            type="button"
            @click.stop="settingsForm.notifyOnLowStock = !settingsForm.notifyOnLowStock"
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none"
            :class="settingsForm.notifyOnLowStock ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'"
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
              :class="settingsForm.notifyOnLowStock ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>

        <!-- 3. Shift Close -->
        <div
          @click="settingsForm.notifyOnShiftClose = !settingsForm.notifyOnShiftClose"
          class="p-3.5 sm:p-4 flex items-center justify-between gap-4 transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer select-none"
        >
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/20">
              <TrendingUp class="w-5 h-5" />
            </div>
            <div class="space-y-0.5 min-w-0">
              <div class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Kassa Smenasi Yopilganda (X-Z Hisoboti)</div>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Kassir smenani yopganda kassa qoldig'i, naqd va karta tushumlari bo'yicha yakuniy hisobot keladi.
              </p>
            </div>
          </div>

          <button
            type="button"
            @click.stop="settingsForm.notifyOnShiftClose = !settingsForm.notifyOnShiftClose"
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none"
            :class="settingsForm.notifyOnShiftClose ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'"
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
              :class="settingsForm.notifyOnShiftClose ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>

        <!-- 4. Daily Summary -->
        <div>
          <div
            @click="settingsForm.notifyDailySummary = !settingsForm.notifyDailySummary"
            class="p-3.5 sm:p-4 flex items-center justify-between gap-4 transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer select-none"
          >
            <div class="flex items-center gap-3.5 min-w-0">
              <div class="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
                <Calendar class="w-5 h-5" />
              </div>
              <div class="space-y-0.5 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Kunlik Yakuniy Hisobot</span>
                  <span v-if="settingsForm.notifyDailySummary" class="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30">
                    {{ settingsForm.dailySummaryTime || '21:00' }}
                  </span>
                </div>
                <p class="text-xs text-slate-500 dark:text-slate-400">
                  Har kuni belgilangan vaqtda kunlik jami tushum, xarajatlar va sof foyda hisoboti avtomatik yuboriladi.
                </p>
              </div>
            </div>

            <button
              type="button"
              @click.stop="settingsForm.notifyDailySummary = !settingsForm.notifyDailySummary"
              class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none"
              :class="settingsForm.notifyDailySummary ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'"
            >
              <span
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
                :class="settingsForm.notifyDailySummary ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
          </div>

          <!-- Time Picker sub-panel when Daily Summary is ON -->
          <div v-if="settingsForm.notifyDailySummary" class="bg-slate-50/90 dark:bg-slate-800/60 p-3.5 sm:px-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Clock class="w-3.5 h-3.5 text-emerald-500" />
                <span>Hisobot vaqti:</span>
              </span>
              <div class="flex flex-wrap gap-1">
                <button
                  v-for="t in ['18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '00:00']"
                  :key="t"
                  type="button"
                  @click.stop="settingsForm.dailySummaryTime = t"
                  class="px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer"
                  :class="settingsForm.dailySummaryTime === t
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-emerald-500/50'"
                >
                  {{ t }}
                </button>
              </div>
            </div>

            <div class="flex items-center gap-2" @click.stop>
              <span class="text-xs text-slate-400 font-medium">Boshqa soat:</span>
              <TimePickerSelect v-model="settingsForm.dailySummaryTime" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. Interactive Bot Modules Section -->
    <div class="glass-card rounded-2xl p-5 sm:p-6 space-y-4 border border-slate-200/80 dark:border-slate-800 shadow-sm">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h4 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Botdagi Interaktiv Boshqaruv & Modullar</span>
          </h4>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Telegram bot menyusida va buyruqlarida qaysi funksiyalar faol bo'lishini boshqaring</p>
        </div>
      </div>

      <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden">
        <!-- 5. Nasiya & Debts -->
        <div
          @click="settingsForm.allowDebtsInBot = !settingsForm.allowDebtsInBot"
          class="p-3.5 sm:p-4 flex items-center justify-between gap-4 transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer select-none"
        >
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <CreditCard class="w-5 h-5" />
            </div>
            <div class="space-y-0.5 min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Nasiya & Qarzdorlar Moduli</span>
                <code class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold">/nasiya</code>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Botda qarzdor mijozlar ro'yxati, umumiy nasiya balansi va mijozlarga yuborish uchun tayyor eslatma xabarlarini olish.
              </p>
            </div>
          </div>

          <button
            type="button"
            @click.stop="settingsForm.allowDebtsInBot = !settingsForm.allowDebtsInBot"
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none"
            :class="settingsForm.allowDebtsInBot ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'"
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
              :class="settingsForm.allowDebtsInBot ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>

        <!-- 6. Quick Expense -->
        <div
          @click="settingsForm.allowExpenseInBot = !settingsForm.allowExpenseInBot"
          class="p-3.5 sm:p-4 flex items-center justify-between gap-4 transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer select-none"
        >
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <DollarSign class="w-5 h-5" />
            </div>
            <div class="space-y-0.5 min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Telegram orqali Xarajat Kiritish</span>
                <code class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold">/xarajat</code>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Yo'lda yurganingizda botga <code>/xarajat 50000 Tushlik</code> deb yozishingiz bilan xarajat to'g'ridan-to'g'ri moliya hisobotiga kiritiladi.
              </p>
            </div>
          </div>

          <button
            type="button"
            @click.stop="settingsForm.allowExpenseInBot = !settingsForm.allowExpenseInBot"
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none"
            :class="settingsForm.allowExpenseInBot ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'"
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
              :class="settingsForm.allowExpenseInBot ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>

        <!-- 7. Product Search -->
        <div
          @click="settingsForm.allowProductSearch = !settingsForm.allowProductSearch"
          class="p-3.5 sm:p-4 flex items-center justify-between gap-4 transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer select-none"
        >
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <Search class="w-5 h-5" />
            </div>
            <div class="space-y-0.5 min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Tezkor Tovar & Narx Qidiruvi</span>
                <code class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold">/narx</code>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Botda <code>/narx Coca Cola</code> yoki istalgan chatda <code>@boshqaruz_bot</code> orqali tovar qoldig'i, tannarxi va sotuv narxini bilish.
              </p>
            </div>
          </div>

          <button
            type="button"
            @click.stop="settingsForm.allowProductSearch = !settingsForm.allowProductSearch"
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none"
            :class="settingsForm.allowProductSearch ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'"
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
              :class="settingsForm.allowProductSearch ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>

        <!-- 8. Cashier Control -->
        <div
          @click="settingsForm.allowCashierControl = !settingsForm.allowCashierControl"
          class="p-3.5 sm:p-4 flex items-center justify-between gap-4 transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer select-none"
        >
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <Users class="w-5 h-5" />
            </div>
            <div class="space-y-0.5 min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Kassirlar & Smena Nazorati</span>
                <code class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold">/kassirlar</code>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                <code>/kassirlar</code> orqali ochiq smenada ishlayotgan xodimlar, ularning bugungi chek soni va jami savdo hajmini ko'rish.
              </p>
            </div>
          </div>

          <button
            type="button"
            @click.stop="settingsForm.allowCashierControl = !settingsForm.allowCashierControl"
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none"
            :class="settingsForm.allowCashierControl ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'"
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
              :class="settingsForm.allowCashierControl ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- Telegram Commands Cheatsheet (Using Pure Lucide Icons) -->
    <div class="glass-card rounded-2xl p-5 sm:p-6 space-y-4 border border-slate-200/80 dark:border-slate-800 shadow-sm">
      <div class="flex items-center gap-2">
        <Sparkles class="w-4 h-4 text-emerald-500" />
        <h4 class="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Telegram Bot Buyruqlari & Tezkor Qo'llanma
        </h4>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div class="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/40 transition">
          <div class="flex items-center justify-between mb-1">
            <code class="font-black text-emerald-600 dark:text-emerald-400 text-xs">/savdo</code>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">Kassa</span>
          </div>
          <span class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed block">Bugungi sotuvlar summasi va cheklar soni</span>
        </div>

        <div class="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/40 transition">
          <div class="flex items-center justify-between mb-1">
            <code class="font-black text-emerald-600 dark:text-emerald-400 text-xs">/hisobot</code>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">Audit</span>
          </div>
          <span class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed block">Kunlik tushum, xarajat va sof foyda</span>
        </div>

        <div class="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/40 transition">
          <div class="flex items-center justify-between mb-1">
            <code class="font-black text-emerald-600 dark:text-emerald-400 text-xs">/nasiya</code>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">Qarz</span>
          </div>
          <span class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed block">Qarzdor mijozlar va eslatma matnlari</span>
        </div>

        <div class="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/40 transition">
          <div class="flex items-center justify-between mb-1">
            <code class="font-black text-emerald-600 dark:text-emerald-400 text-xs">/xarajat</code>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">Moliya</span>
          </div>
          <span class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed block">Telegram orqali tezkor chiqim yozish</span>
        </div>

        <div class="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/40 transition">
          <div class="flex items-center justify-between mb-1">
            <code class="font-black text-emerald-600 dark:text-emerald-400 text-xs">/narx</code>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">Katalog</span>
          </div>
          <span class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed block">Tovar qoldig'i, tannarxi va sotuv narxi</span>
        </div>

        <div class="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/40 transition">
          <div class="flex items-center justify-between mb-1">
            <code class="font-black text-emerald-600 dark:text-emerald-400 text-xs">/ombor</code>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">Zaxira</span>
          </div>
          <span class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed block">Zaxirasi kam qolgan tovarlar ro'yxati</span>
        </div>

        <div class="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/40 transition">
          <div class="flex items-center justify-between mb-1">
            <code class="font-black text-emerald-600 dark:text-emerald-400 text-xs">/kassirlar</code>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">Smena</span>
          </div>
          <span class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed block">Ochiq smenalar va kassirlar faoliyati</span>
        </div>

        <div class="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/40 transition">
          <div class="flex items-center justify-between mb-1">
            <code class="font-black text-emerald-600 dark:text-emerald-400 text-xs">/sozlamalar</code>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">Tizim</span>
          </div>
          <span class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed block">Profil va bildirishnoma parametrlari</span>
        </div>
      </div>
    </div>

    <!-- Connect Modal / Popup: Pure Emerald Design, Lucide Icons -->
    <TelegramConnectModal
      :is-open="isConnectModalOpen"
      :connect-link="connectLink"
      v-model:manual-query="manualQuery"
      :linking-by-query="linkingByQuery"
      @close="closeModal"
      @link-by-query="linkByQuery"
      @check-status="checkStatusAfterConnect"
    />

    <!-- PRO UPGRADE MODAL -->
    <ProUpgradeModal
      :is-open="showProModal"
      title="Telegram AI Bot & Avtomatlashtirish Faqat PRO Tarifda!"
      subtitle="Har bir xarid chekini mijozlarga avto-yuborish, qarzdorlik eslatmalari va xo'jayinga kunlik yashirin hisobotlar faqat PRO tarifda ishlaydi."
      feature-title="Telegram Bot & AI Avtomatizatsiya"
      @close="showProModal = false"
    />

    <!-- DISCONNECT CONFIRM DIALOG -->
    <AppConfirmDialog
      :open="isDisconnectConfirmOpen"
      title="Telegram Botni uzish"
      message="Haqiqatan ham Telegram botni tizimdan uzmoqchimisiz? Barcha avtomatik chek va hisobot xabarlari to'xtatiladi."
      confirm-text="Ha, uzish"
      cancel-text="Bekor qilish"
      variant="danger"
      :loading="disconnecting"
      @confirm="confirmDisconnectBot"
      @cancel="isDisconnectConfirmOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import TelegramConnectModal from './TelegramConnectModal.vue';
import AppConfirmDialog from '../../../components/AppConfirmDialog.vue';
import {
  Bot,
  Send,
  Unlink,
  X,
  Receipt,
  Calendar,
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
  ExternalLink,
  RefreshCw,
  Clock,
  CreditCard,
  DollarSign,
  Search,
  Users,
  Zap,
  Check,
  Sparkles,
  Plus,
  Trash2,
  Lock,
  Crown,
} from 'lucide-vue-next';
import api from '../../../services/api';
import { useToast } from '../../../composables/useToast';
import { useAuthStore } from '../../../stores/auth.store';
import TimePickerSelect from '../../../components/TimePickerSelect.vue';
import ProUpgradeModal from '../../../components/ProUpgradeModal.vue';
import TelegramAccountList from './telegram/TelegramAccountList.vue';

const toast = useToast();
const authStore = useAuthStore();
const showProModal = ref(false);

const timeOptions = [
  { value: '18:00', label: '18:00 (Kechki boshlanish)' },
  { value: '18:30', label: '18:30' },
  { value: '19:00', label: '19:00' },
  { value: '19:30', label: '19:30' },
  { value: '20:00', label: '20:00' },
  { value: '20:30', label: '20:30' },
  { value: '21:00', label: '21:00 (Standart tavsiya)' },
  { value: '21:30', label: '21:30' },
  { value: '22:00', label: '22:00 (Kechki savdo)' },
  { value: '22:30', label: '22:30' },
  { value: '23:00', label: '23:00' },
  { value: '23:30', label: '23:30' },
  { value: '00:00', label: '00:00 (Yarim tun)' },
  { value: '01:00', label: '01:00 (Tungi smena)' },
  { value: '02:00', label: '02:00' },
  { value: '06:00', label: '06:00 (Ertalabki hisobot)' },
  { value: '08:00', label: '08:00 (Ertalabki)' },
  { value: '10:00', label: '10:00' },
  { value: '12:00', label: '12:00 (Tushlik hisoboti)' },
  { value: '15:00', label: '15:00' },
  { value: '16:00', label: '16:00' },
  { value: '17:00', label: '17:00' },
];

const status = ref<{
  isConnected: boolean;
  chatId: string;
  username: string;
  connectedAt: string;
  accounts?: Array<{ chatId: string; username?: string; firstName?: string; connectedAt: string }>;
  accountsCount?: number;
  notifyOnOrder: boolean;
  notifyOnLowStock: boolean;
  notifyDailySummary: boolean;
  dailySummaryTime: string;
  notifyOnShiftClose: boolean;
  allowDebtsInBot: boolean;
  allowExpenseInBot: boolean;
  allowProductSearch: boolean;
  allowCashierControl: boolean;
  botUsername: string;
}>({
  isConnected: false,
  chatId: '',
  username: '',
  connectedAt: '',
  accounts: [],
  accountsCount: 0,
  notifyOnOrder: true,
  notifyOnLowStock: true,
  notifyDailySummary: true,
  dailySummaryTime: '21:00',
  notifyOnShiftClose: true,
  allowDebtsInBot: true,
  allowExpenseInBot: true,
  allowProductSearch: true,
  allowCashierControl: true,
  botUsername: 'Boshqar_uzbot',
});

const settingsForm = ref({
  notifyOnOrder: true,
  notifyOnLowStock: true,
  notifyDailySummary: true,
  dailySummaryTime: '21:00',
  notifyOnShiftClose: true,
  allowDebtsInBot: true,
  allowExpenseInBot: true,
  allowProductSearch: true,
  allowCashierControl: true,
});

const isConnectModalOpen = ref(false);
const connectLink = ref('');
const manualQuery = ref('');
const linkingByQuery = ref(false);
const generatingLink = ref(false);
const savingSettings = ref(false);
const testingMessage = ref(false);
const disconnecting = ref(false);
const disconnectingChatId = ref('');
let pollInterval: any = null;

const disconnectAccount = async (chatId: string) => {
  disconnectingChatId.value = chatId;
  try {
    const { data } = await api.post('/telegram/disconnect-account', { chatId });
    if (data) {
      status.value = data;
      await loadStatus();
      toast.success('Telegram hisobi muvaffaqiyatli uzildi', 'Telegram Bot');
    }
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Hisobni uzishda xatolik', 'Telegram');
  } finally {
    disconnectingChatId.value = '';
  }
};

const linkByQuery = async () => {
  if (!manualQuery.value.trim()) return;
  linkingByQuery.value = true;
  try {
    const { data } = await api.post('/telegram/link-by-query', { query: manualQuery.value.trim() });
    if (data?.success) {
      await loadStatus();
      closeModal();
      toast.success(data.message || 'Telegram muvaffaqiyatli ulandi!', 'Telegram Bot');
    } else {
      toast.warning(data?.message || 'Ulashda xatolik', 'Telegram Bot');
    }
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Ulashda xatolik yuz berdi', 'Telegram');
  } finally {
    linkingByQuery.value = false;
  }
};

const loadStatus = async () => {
  try {
    const { data } = await api.get('/telegram/status');
    if (data) {
      status.value = data;
      settingsForm.value = {
        notifyOnOrder: data.notifyOnOrder !== false,
        notifyOnLowStock: data.notifyOnLowStock !== false,
        notifyDailySummary: data.notifyDailySummary !== false,
        dailySummaryTime: data.dailySummaryTime || '21:00',
        notifyOnShiftClose: data.notifyOnShiftClose !== false,
        allowDebtsInBot: data.allowDebtsInBot !== false,
        allowExpenseInBot: data.allowExpenseInBot !== false,
        allowProductSearch: data.allowProductSearch !== false,
        allowCashierControl: data.allowCashierControl !== false,
      };
    }
  } catch (e) {
    console.warn('Failed to load Telegram status:', e);
  }
};

const openConnectFlow = async () => {
  generatingLink.value = true;
  try {
    const { data } = await api.post('/telegram/generate-link');
    if (data?.link) {
      connectLink.value = data.link;
      isConnectModalOpen.value = true;

      // Start auto-checking status every 2 seconds while modal is open
      if (pollInterval) clearInterval(pollInterval);
      pollInterval = setInterval(async () => {
        if (!isConnectModalOpen.value) {
          clearInterval(pollInterval);
          return;
        }
        await loadStatus();
        if (status.value.isConnected) {
          clearInterval(pollInterval);
          isConnectModalOpen.value = false;
          toast.success('Telegram bot muvaffaqiyatli ulandi!', 'Telegram Bot');
        }
      }, 2000);
    }
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Havola yaratishda xatolik', 'Telegram');
  } finally {
    generatingLink.value = false;
  }
};

const closeModal = () => {
  isConnectModalOpen.value = false;
  if (pollInterval) clearInterval(pollInterval);
};

const checkStatusAfterConnect = async () => {
  await loadStatus();
  if (status.value.isConnected) {
    closeModal();
    toast.success('Telegram bot muvaffaqiyatli ulandi!', 'Telegram Bot');
  } else {
    toast.info("Hali ulanmadi. Telegramda botga kirib START tugmasini bosing.", "Kutilmoqda");
  }
};

const saveSettings = async () => {
  savingSettings.value = true;
  try {
    const { data } = await api.post('/telegram/settings', settingsForm.value);
    if (data) {
      status.value = { ...status.value, ...data };
      settingsForm.value = {
        notifyOnOrder: data.notifyOnOrder !== false,
        notifyOnLowStock: data.notifyOnLowStock !== false,
        notifyDailySummary: data.notifyDailySummary !== false,
        dailySummaryTime: data.dailySummaryTime || '21:00',
        notifyOnShiftClose: data.notifyOnShiftClose !== false,
        allowDebtsInBot: data.allowDebtsInBot !== false,
        allowExpenseInBot: data.allowExpenseInBot !== false,
        allowProductSearch: data.allowProductSearch !== false,
        allowCashierControl: data.allowCashierControl !== false,
      };
      toast.success('Telegram bot sozlamalari saqlandi!', 'Sozlamalar');
    }
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Saqlashda xatolik', 'Xatolik');
  } finally {
    savingSettings.value = false;
  }
};

const sendTestMessage = async () => {
  testingMessage.value = true;
  try {
    const { data } = await api.post('/telegram/test-message');
    if (data?.success) {
      toast.success(data.message || 'Sinov xabari yuborildi!', 'Telegram Bot');
    } else {
      toast.warning(data?.message || 'Xabar yuborilmadi', 'Telegram Bot');
    }
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Sinov xabari yuborishda xatolik', 'Telegram');
  } finally {
    testingMessage.value = false;
  }
};

const isDisconnectConfirmOpen = ref(false);

const disconnectBot = () => {
  isDisconnectConfirmOpen.value = true;
};

const confirmDisconnectBot = async () => {
  disconnecting.value = true;
  try {
    await api.post('/telegram/disconnect');
    await loadStatus();
    toast.info('Telegram bot tizimdan uzildi', 'Telegram Bot');
    isDisconnectConfirmOpen.value = false;
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Uzishda xatolik', 'Telegram');
  } finally {
    disconnecting.value = false;
  }
};

const formatDate = (isoStr?: string) => {
  if (!isoStr) return '-';
  return new Date(isoStr).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', year: 'numeric' });
};

onMounted(() => {
  loadStatus();
});

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval);
});
</script>
