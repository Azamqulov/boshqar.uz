<template>
  <div class="space-y-8 max-w-6xl mx-auto pb-20">
    <!-- Clean Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
      <div>
        <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <span>Obuna va Tariflar</span>
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Biznesingiz obuna muddati, tarif rejalarini boshqarish va to'lovlar tizimi
        </p>
      </div>

      <button
        type="button"
        @click="loadBillingStatus(false)"
        :disabled="loading || isRefreshing"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition border border-slate-200 dark:border-slate-700 shadow-2xs self-start sm:self-auto"
      >
        <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isRefreshing || loading }" />
        <span>Yangilash</span>
      </button>
    </div>

    <!-- Skeleton loader when no cached data is available yet -->
    <SkeletonLoader
      v-if="loading && !subscription"
      variant="cards"
      text="Obuna va tarif ma'lumotlari yuklanmoqda..."
    />

    <template v-else>
      <!-- SECTION 1: Senior SaaS Subscription Status & Active Services Cockpit -->
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
            @click="openPaymentModal(payablePlans[0])"
            class="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/25 transition flex items-center justify-center gap-2"
          >
            <ArrowUpRight class="w-4 h-4 stroke-[2.5]" />
            <span>Tarifni Yuksaltirish (Upgrade)</span>
          </button>
          <button
            v-else
            type="button"
            @click="openPaymentModal(currentActivePlan)"
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
          <!-- 1. Branches Usage (Faol) -->
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

          <!-- 2. Users Usage (Faol) -->
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

          <!-- 3. POS Kassa (Faol) -->
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

          <!-- 4. Warehouse & Products (Faol) -->
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

          <!-- 5. Finance & Analytics (Faol) -->
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

          <!-- 8. Cloud Backup & SSL Security (Faol) -->
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

    <!-- Section: Plans Pricing Table -->
    <div class="space-y-6">
      <div class="text-center max-w-xl mx-auto space-y-1.5">
        <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Siz Uchun Qulay Tarif Rejalari
        </h2>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Biznesingiz hajmiga qarab eng mos rejani tanlang va cheklovlarsiz rivojlaning
        </p>
      </div>

      <!-- SuperAdmin Indicator & Management Notice -->
      <div
        v-if="isSuperAdmin"
        class="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
      >
        <div class="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold">
          <ShieldCheck class="w-4 h-4 text-amber-500 shrink-0" />
          <span>SuperAdmin Rejimi: Siz platformadagi barcha tarif narxlari va limitlarini to'g'ridan-to'g'ri shu yerdan tahrirlashingiz mumkin.</span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          v-for="plan in plans"
          :key="plan.id"
          :class="[
            'rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 relative',
            plan.id === currentActivePlanId
              ? 'border-2 border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-md ring-1 ring-emerald-500/20'
              : 'border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md'
          ]"
        >
          <div class="space-y-5">
            <div class="flex items-start justify-between gap-2">
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-lg font-black text-slate-900 dark:text-white">{{ plan.name }}</h3>
                  <!-- Clean Single Status Badge -->
                  <span
                    v-if="plan.id === currentActivePlanId"
                    class="text-[10px] px-2.5 py-0.5 rounded-full font-black bg-emerald-600 text-white shadow-2xs uppercase tracking-wider"
                  >
                    Faol Reja
                  </span>
                  <span
                    v-else-if="Number(plan.priceMonthly) > Number(currentActivePlan?.priceMonthly || 0)"
                    class="text-[10px] px-2 py-0.5 rounded-full font-bold bg-teal-100 dark:bg-teal-900/70 text-teal-700 dark:text-teal-300 uppercase tracking-wider"
                  >
                    Upgrade
                  </span>
                </div>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {{ plan.name === 'Free' ? 'Boshlang\'ich va sinov uchun' : plan.name === 'Pro' ? 'Kichik va o\'rta bizneslar uchun' : 'Katta do\'konlar va tarmoqlar uchun' }}
                </p>
              </div>

              <!-- SuperAdmin Edit Button -->
              <button
                v-if="isSuperAdmin"
                type="button"
                @click="openEditPlanModal(plan)"
                class="px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[11px] font-bold transition flex items-center gap-1 shrink-0"
                title="SuperAdmin: Ushbu tarif narxi va limitlarini tahrirlash"
              >
                <Edit2 class="w-3 h-3" />
                <span>Tahrirlash</span>
              </button>
            </div>

            <div class="py-3 border-y border-slate-100 dark:border-slate-800">
              <span class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {{ Number(plan.priceMonthly) === 0 ? 'Bepul' : formatMoney(plan.priceMonthly) }}
              </span>
              <span v-if="Number(plan.priceMonthly) > 0" class="text-xs text-slate-400 font-medium"> / oy</span>
            </div>

            <!-- Features list -->
            <ul class="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <li class="flex items-center gap-2.5">
                <Check class="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.5]" />
                <span>Filiallar: <strong>{{ plan.maxBranches === null ? 'Cheksiz' : `${plan.maxBranches} ta` }}</strong></span>
              </li>
              <li class="flex items-center gap-2.5">
                <Check class="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.5]" />
                <span>Xodimlar / Kassirlar: <strong>{{ plan.maxUsers === null ? 'Cheksiz' : `${plan.maxUsers} ta` }}</strong></span>
              </li>
              <li class="flex items-center gap-2.5">
                <Check class="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.5]" />
                <span>Kassa (POS) va chek chiqarish</span>
              </li>
              <li class="flex items-center gap-2.5">
                <Check class="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.5]" />
                <span>Ombor va qoldiq nazorati</span>
              </li>
              <li class="flex items-center gap-2.5">
                <Check class="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.5]" />
                <span>Moliya & Kunlik hisobotlar</span>
              </li>
              <li v-if="plan.name !== 'Free'" class="flex items-center gap-2.5">
                <Check class="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.5]" />
                <span>Telegram Bot bildirishnomalari</span>
              </li>
              <li v-if="plan.name === 'Business'" class="flex items-center gap-2.5">
                <Check class="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.5]" />
                <span>VIP 24/7 Shaxsiy menejer qo'llab-quvvatlashi</span>
              </li>
            </ul>
          </div>

          <!-- Bottom Button depending on Active / Upgrade / Current state -->
          <div class="pt-6">
            <!-- Case 1: This is the user's current active plan -->
            <template v-if="plan.id === currentActivePlanId">
              <button
                v-if="Number(plan.priceMonthly) > 0"
                type="button"
                @click="openPaymentModal(plan)"
                class="w-full py-3 rounded-2xl font-bold text-xs transition active:scale-95 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/25"
              >
                <Sparkles class="w-4 h-4" />
                <span>Muddatni Uzaytirish</span>
              </button>
              <div
                v-else
                class="text-center py-2.5 px-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-500/20 text-xs font-bold text-emerald-700 dark:text-emerald-300"
              >
                ✓ Boshlang'ich bepul rejadasiz
              </div>
            </template>

            <!-- Case 2: This is a higher tier plan (UPGRADE) -->
            <template v-else-if="Number(plan.priceMonthly) > Number(currentActivePlan?.priceMonthly || 0)">
              <button
                type="button"
                @click="openPaymentModal(plan)"
                class="w-full py-3 rounded-2xl font-bold text-xs transition active:scale-95 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-md shadow-emerald-500/25 group"
              >
                <ArrowUpRight class="w-4 h-4 stroke-[2.5] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                <span>{{ plan.name }} Tarifiga Yuksaltirish</span>
              </button>
            </template>

            <!-- Case 3: Other plans -->
            <template v-else>
              <button
                v-if="Number(plan.priceMonthly) > 0"
                type="button"
                @click="openPaymentModal(plan)"
                class="w-full py-3 rounded-2xl font-bold text-xs transition active:scale-95 flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <CreditCard class="w-4 h-4" />
                <span>{{ plan.name }} Tarifiga O'tish</span>
              </button>
              <div v-else class="text-center py-2.5 text-xs text-slate-400 font-bold">
                Standart boshlang'ich reja
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL: Premium Step-by-Step Payment Wizard -->
    <div
      v-if="showPaymentModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        class="w-full max-w-lg max-h-[95vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl space-y-3.5"
        @click.stop
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shadow-xs">
              <CreditCard class="w-4 h-4" />
            </div>
            <div>
              <h3 class="text-sm sm:text-base font-black text-slate-900 dark:text-white">To'lov va Obuna</h3>
              <p class="text-[11px] text-slate-400">Bosqich {{ paymentStep }} / 3 — {{ paymentStep === 1 ? 'Tarif va muddat tanlash' : paymentStep === 2 ? 'Karta rekviziti va to\'lov' : 'To\'lov chekini yuklash' }}</p>
            </div>
          </div>
          <button
            type="button"
            @click="showPaymentModal = false"
            class="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Modern Segmented 3-Step Wizard Bar -->
        <div class="grid grid-cols-3 gap-1.5 sm:gap-2 p-1.5 rounded-2xl bg-slate-100/90 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80">
          <!-- Step 1 -->
          <button
            type="button"
            @click="paymentStep = 1"
            :class="[
              'py-2 px-2 sm:px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 text-center',
              paymentStep === 1
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-emerald-500/30'
                : paymentStep > 1
                  ? 'bg-white/60 dark:bg-slate-800/80 text-emerald-700 dark:text-emerald-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            ]"
          >
            <div
              :class="[
                'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 transition',
                paymentStep > 1
                  ? 'bg-emerald-600 text-white'
                  : paymentStep === 1
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
              ]"
            >
              <Check v-if="paymentStep > 1" class="w-3 h-3 stroke-[3]" />
              <span v-else>1</span>
            </div>
            <span class="truncate text-[11px] sm:text-xs">Tarif & Muddat</span>
          </button>

          <!-- Step 2 -->
          <button
            type="button"
            @click="paymentForm.planId ? paymentStep = 2 : null"
            :disabled="!paymentForm.planId"
            :class="[
              'py-2 px-2 sm:px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 text-center disabled:opacity-40 disabled:cursor-not-allowed',
              paymentStep === 2
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-emerald-500/30'
                : paymentStep > 2
                  ? 'bg-white/60 dark:bg-slate-800/80 text-emerald-700 dark:text-emerald-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            ]"
          >
            <div
              :class="[
                'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 transition',
                paymentStep > 2
                  ? 'bg-emerald-600 text-white'
                  : paymentStep === 2
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
              ]"
            >
              <Check v-if="paymentStep > 2" class="w-3 h-3 stroke-[3]" />
              <span v-else>2</span>
            </div>
            <span class="truncate text-[11px] sm:text-xs">Karta & To'lov</span>
          </button>

          <!-- Step 3 -->
          <button
            type="button"
            @click="paymentForm.planId && paymentForm.senderName ? paymentStep = 3 : null"
            :disabled="!paymentForm.planId || !paymentForm.senderName"
            :class="[
              'py-2 px-2 sm:px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 text-center disabled:opacity-40 disabled:cursor-not-allowed',
              paymentStep === 3
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-emerald-500/30'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            ]"
          >
            <div
              :class="[
                'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 transition',
                paymentStep === 3
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
              ]"
            >
              <span>3</span>
            </div>
            <span class="truncate text-[11px] sm:text-xs">Chek Yuklash</span>
          </button>
        </div>

        <form @submit.prevent="submitReceipt" class="space-y-3.5">
          <!-- ==================== STEP 1: TARIF VA MUDDAT ==================== -->
          <div v-if="paymentStep === 1" class="space-y-4 animate-in fade-in duration-200">
            <!-- 1.1 Plan Cards Selection -->
            <div class="space-y-2">
              <label class="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>1. Kerakli Tarif Rejasini Tanlang:</span>
                <span class="text-[11px] font-normal text-slate-400">Kerakli tarifni tanlang</span>
              </label>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  v-for="p in payablePlans"
                  :key="p.id"
                  @click="paymentForm.planId = p.id"
                  :class="[
                    'p-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-200 relative overflow-hidden flex flex-col justify-between',
                    paymentForm.planId === p.id
                      ? 'border-emerald-500 bg-emerald-500/10 dark:bg-emerald-950/50 shadow-md ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/50'
                  ]"
                >
                  <!-- Card Header -->
                  <div class="flex items-start justify-between gap-2">
                    <div class="space-y-0.5">
                      <div class="flex items-center gap-2">
                        <h4 class="font-black text-sm text-slate-900 dark:text-white">{{ p.name }}</h4>
                        <span
                          v-if="p.id === currentActivePlanId"
                          class="text-[9px] px-2 py-0.5 rounded-full font-black bg-emerald-100 dark:bg-emerald-900/70 text-emerald-700 dark:text-emerald-300 uppercase tracking-wide"
                        >
                          Joriy Reja
                        </span>
                        <span
                          v-else-if="Number(p.priceMonthly) > Number(currentActivePlan?.priceMonthly || 0)"
                          class="text-[9px] px-2 py-0.5 rounded-full font-black bg-teal-100 dark:bg-teal-900/70 text-teal-700 dark:text-teal-300 uppercase tracking-wide"
                        >
                          Upgrade
                        </span>
                        <span
                          v-else-if="p.name === 'Pro'"
                          class="text-[9px] px-2 py-0.5 rounded-full font-black bg-emerald-100 dark:bg-emerald-900/70 text-emerald-700 dark:text-emerald-300 uppercase tracking-wide"
                        >
                          Tavsiya
                        </span>
                      </div>
                      <p class="text-[11px] text-slate-500 dark:text-slate-400">
                        {{ p.name === 'Pro' ? "Kichik va o'rta bizneslar uchun" : "Katta tarmoq va yirik korxonalar" }}
                      </p>
                    </div>

                    <!-- Selected Radio Icon -->
                    <div
                      :class="[
                        'w-5 h-5 rounded-full flex items-center justify-center border-2 shrink-0 transition-all',
                        paymentForm.planId === p.id
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                      ]"
                    >
                      <Check v-if="paymentForm.planId === p.id" class="w-3 h-3 stroke-[3]" />
                    </div>
                  </div>

                  <!-- Price Row -->
                  <div class="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-baseline justify-between">
                    <span class="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      {{ formatMoney(p.priceMonthly) }}
                    </span>
                    <span class="text-[11px] text-slate-400 font-medium">/ oyiga</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 1.2 Duration Selection -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  2. Obuna Muddati:
                </label>
                <span v-if="selectedDiscountPercent > 0" class="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  🎉 {{ selectedDiscountPercent }}% chegirma qo'llandi!
                </span>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  v-for="opt in [
                    { months: 1, label: '1 oy', tag: '' },
                    { months: 3, label: '3 oy', tag: '' },
                    { months: 6, label: '6 oy', tag: '5% chegirma' },
                    { months: 12, label: '1 yil (12 oy)', tag: '15% chegirma' }
                  ]"
                  :key="opt.months"
                  type="button"
                  @click="paymentForm.durationMonths = opt.months"
                  :class="[
                    'py-2 px-2.5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-0.5 text-center',
                    paymentForm.durationMonths === opt.months
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/25'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  ]"
                >
                  <span class="text-xs font-black">{{ opt.label }}</span>
                  <span
                    v-if="opt.tag"
                    :class="[
                      'text-[9px] font-bold px-1.5 py-0.2 rounded-full',
                      paymentForm.durationMonths === opt.months
                        ? 'bg-white/20 text-white'
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    ]"
                  >
                    {{ opt.tag }}
                  </span>
                </button>
              </div>
            </div>

            <!-- 1.3 Total Calculation Summary Box -->
            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-500 dark:text-slate-400">Tanlangan tarif va muddat:</span>
                <span class="font-bold text-slate-900 dark:text-white font-mono">
                  {{ selectedPlan?.name || 'Reja' }} • {{ paymentForm.durationMonths === 12 ? '1 yil (12 oy)' : `${paymentForm.durationMonths} oy` }}
                </span>
              </div>

              <!-- Discount row if applicable -->
              <div v-if="selectedDiscountSavings > 0" class="flex items-center justify-between text-xs pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                <span class="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <Sparkles class="w-3.5 h-3.5" />
                  <span>Tejov ({{ selectedDiscountPercent }}% chegirma):</span>
                </span>
                <span class="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  - {{ formatMoney(selectedDiscountSavings) }}
                </span>
              </div>

              <!-- Final Total Highlight -->
              <div class="pt-2 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                <div>
                  <p class="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    To'lanadigan Jami Summa:
                  </p>
                  <p v-if="selectedDiscountSavings > 0" class="text-[10px] text-slate-400 line-through font-mono">
                    {{ formatMoney(selectedOriginalTotal) }}
                  </p>
                </div>
                <span class="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
                  {{ formatMoney(selectedTotalAmount) }}
                </span>
              </div>
            </div>

            <!-- Step 1 Footer Buttons -->
            <div class="pt-2 flex items-center justify-between gap-2.5 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                @click="showPaymentModal = false"
                class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                @click="nextStep"
                class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-500/25 flex items-center gap-2 transition"
              >
                <span>Keyingisi: Karta Rekviziti</span>
                <ArrowRight class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- ==================== STEP 2: KARTA REKVIZITI VA TO'LOVCHI ==================== -->
          <div v-else-if="paymentStep === 2" class="space-y-3 animate-in fade-in duration-200">
            <!-- Vibrant Animated Realistic Bank Card Container in Brand Emerald Green -->
            <div class="relative group">
              <!-- Dynamic animated ambient glow -->
              <div class="absolute -inset-1 bg-gradient-to-r from-emerald-500/40 via-emerald-400/30 to-emerald-600/40 rounded-3xl blur-lg opacity-75 group-hover:opacity-100 transition duration-500 animate-pulse"></div>

              <!-- The Physical Card with Brand Green Animated Mesh Gradient -->
              <div
                v-if="requisites && requisites.isEnabled"
                class="relative rounded-2xl p-4 sm:p-5 text-white shadow-2xl border border-white/30 overflow-hidden select-none space-y-3 card-animated-gradient"
                style="box-shadow: 0 15px 35px -10px rgba(5, 150, 105, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.4);"
              >
                <!-- Animated Light Ray Shimmer -->
                <div class="card-light-shine pointer-events-none"></div>

                <!-- Floating Iridescent Ambient Blobs -->
                <div class="absolute -top-12 -right-12 w-44 h-44 bg-emerald-400/25 rounded-full blur-2xl pointer-events-none"></div>
                <div class="absolute -bottom-12 -left-12 w-44 h-44 bg-emerald-300/25 rounded-full blur-2xl pointer-events-none"></div>

                <!-- Abstract Guilloche Wave Line Watermark in Background -->
                <svg class="absolute right-0 bottom-0 w-64 h-64 opacity-10 pointer-events-none -mr-8 -mb-8" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="100" cy="100" r="80" stroke="white" stroke-width="1.5" stroke-dasharray="4 4" />
                  <circle cx="100" cy="100" r="60" stroke="white" stroke-width="1" />
                  <circle cx="100" cy="100" r="40" stroke="white" stroke-width="1.5" stroke-dasharray="2 2" />
                  <path d="M20 100 C 50 20, 150 180, 180 100" stroke="white" stroke-width="1.5" />
                  <path d="M20 120 C 60 40, 140 160, 180 120" stroke="white" stroke-width="1.5" />
                </svg>

                <!-- Card Top Row: Bank Name, Business Badge & Contactless -->
                <div class="relative z-10 flex items-center justify-between">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="text-sm sm:text-base font-black tracking-wider text-white uppercase font-sans drop-shadow-md">
                        {{ requisites.bankName || 'Kapitalbank ATB' }}
                      </span>
                      <span class="text-[8px] font-black px-1.5 py-0.2 rounded-md bg-white/20 text-white border border-white/30 uppercase tracking-widest backdrop-blur-xs shadow-2xs">
                        BUSINESS
                      </span>
                    </div>
                    <p class="text-[9px] text-emerald-100 font-bold tracking-widest uppercase font-mono mt-0.5">
                      boshqar.uz official
                    </p>
                  </div>

                  <!-- Contactless / NFC Radio Wave Symbol -->
                  <div class="flex items-center gap-1 opacity-90 drop-shadow-xs" title="Contactless Payment">
                    <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                      <path d="M8.5 16.5a5 5 0 0 1 0-9" />
                      <path d="M12 19a8.5 8.5 0 0 0 0-14" />
                      <path d="M15.5 21.5a12 12 0 0 0 0-19" />
                    </svg>
                  </div>
                </div>

                <!-- Quick Copy Action and Number Row -->
                <div class="relative z-10 flex items-center justify-between pt-1">
                  <span class="text-[9px] text-emerald-100 font-bold uppercase tracking-widest font-mono">
                    KARTA RAQAMI:
                  </span>
                  <!-- Glassmorphic Copy Card Number Pill Button -->
                  <button
                    type="button"
                    @click="copyText(requisites.cardNumber, 'Karta raqami')"
                    class="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 active:scale-95 text-white text-xs font-bold transition-all duration-150 flex items-center gap-1.5 border border-white/30 backdrop-blur-md shadow-sm"
                  >
                    <Copy class="w-3.5 h-3.5 text-white" />
                    <span>Nusxalash</span>
                  </button>
                </div>

                <!-- Embossed Card Number -->
                <div class="relative z-10 py-0.5">
                  <p
                    class="font-mono text-lg sm:text-2xl font-black tracking-[0.16em] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] select-all"
                  >
                    {{ requisites.cardNumber }}
                  </p>
                </div>

                <!-- Card Bottom Row: Holder -->
                <div class="relative z-10 flex items-end justify-between pt-1 border-t border-white/20">
                  <div>
                    <span class="text-[8px] text-emerald-100 uppercase tracking-widest font-mono block">
                      CARDHOLDER / KARTA EGASI
                    </span>
                    <p class="font-mono text-xs sm:text-sm font-bold text-white uppercase tracking-wider mt-0.5 drop-shadow-xs">
                      {{ requisites.cardHolder }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Transfer Amount Highlight Banner with 1-Click Copy -->
            <div class="py-2.5 px-3.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-between text-xs">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span class="font-bold text-emerald-900 dark:text-emerald-300">O'tkaziladigan summa:</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="font-black text-emerald-700 dark:text-emerald-400 font-mono text-sm sm:text-base select-all">
                  {{ formatMoney(selectedTotalAmount) }}
                </span>
                <button
                  type="button"
                  @click="copyText(selectedTotalAmount.toString(), 'To\'lov summasi')"
                  class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-[11px] font-bold transition flex items-center gap-1 shadow-2xs"
                  title="Summani nusxalash"
                >
                  <Copy class="w-3 h-3" />
                  <span>Nusxalash</span>
                </button>
              </div>
            </div>

            <!-- Payer Input Fields -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div class="space-y-0.5">
                <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  To'lovchi Ismi / Familiyasi *
                </label>
                <div class="relative">
                  <input
                    v-model="paymentForm.senderName"
                    type="text"
                    placeholder="Masalan: Ali Valiyev"
                    class="w-full pl-8 pr-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                  <User class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                </div>
              </div>

              <div class="space-y-0.5">
                <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Karta oxirgi 4 raqami
                </label>
                <div class="relative">
                  <input
                    v-model="paymentForm.senderCard"
                    type="text"
                    maxlength="4"
                    placeholder="4455"
                    class="w-full pl-8 pr-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                  />
                  <CreditCard class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                </div>
              </div>
            </div>

            <!-- Step 2 Footer Buttons -->
            <div class="pt-1 flex items-center justify-between gap-2.5 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                @click="prevStep"
                class="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition"
              >
                <ArrowLeft class="w-3.5 h-3.5" />
                <span>Ortga</span>
              </button>
              <button
                type="button"
                @click="nextStep"
                class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-sm shadow-emerald-500/20 flex items-center gap-1.5 transition"
              >
                <span>Keyingisi: Chek Yuklash</span>
                <ArrowRight class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- ==================== STEP 3: CHEK YUKLASH VA TASDIQLASH ==================== -->
          <div v-else-if="paymentStep === 3" class="space-y-3 animate-in fade-in duration-200">
            <!-- Selected Plan Summary Badge -->
            <div class="py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <CheckCircle2 class="w-3.5 h-3.5" />
                </div>
                <div>
                  <p class="font-bold text-slate-900 dark:text-white">
                    {{ payablePlans.find(p => p.id === paymentForm.planId)?.name }} ({{ paymentForm.durationMonths }} oy)
                  </p>
                  <p class="text-[10px] text-slate-400">To'lovchi: {{ paymentForm.senderName || 'Ko\'rsatilmadi' }}</p>
                </div>
              </div>
              <span class="font-black text-emerald-600 dark:text-emerald-400 font-mono text-sm">{{ formatMoney(selectedTotalAmount) }}</span>
            </div>

            <!-- Hidden File Input -->
            <input
              ref="fileInputRef"
              type="file"
              accept="image/png, image/jpeg, image/webp, image/heic, application/pdf"
              class="hidden"
              @change="onFileSelected"
            />

            <!-- Preview Card if File is Uploaded -->
            <div
              v-if="paymentForm.receiptUrl"
              class="p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/30 flex items-center justify-between gap-2.5"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <div class="w-10 h-10 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0 border border-slate-300 dark:border-slate-700 flex items-center justify-center shadow-xs">
                  <img
                    v-if="isImageFile"
                    :src="paymentForm.receiptUrl"
                    alt="Chek rasmi"
                    class="w-full h-full object-cover"
                  />
                  <FileText v-else class="w-5 h-5 text-emerald-600" />
                </div>
                <div class="min-w-0">
                  <p class="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {{ receiptFileName || "To'lov cheki yuklandi" }}
                  </p>
                  <p class="text-[10px] text-slate-500 dark:text-slate-400">
                    {{ isImageFile ? 'Rasm fayli' : 'Hujjat' }} • {{ receiptFileSize }}
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  @click="triggerFileInput"
                  class="px-2 py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition"
                >
                  Almashtirish
                </button>
                <button
                  type="button"
                  @click="removeFile"
                  class="p-1 rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition"
                  title="O'chirish"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <!-- Drag & Drop Upload Zone if No File -->
            <div
              v-else
              @click="triggerFileInput"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="onFileDrop"
              :class="[
                'border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-1 group',
                isDragging
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 ring-2 ring-emerald-500/20'
                  : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-slate-800/60'
              ]"
            >
              <div class="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition shadow-2xs">
                <UploadCloud class="w-5 h-5" />
              </div>
              <p class="text-xs font-bold text-slate-900 dark:text-white">
                To'lov cheki rasmini yuklang
              </p>
              <p class="text-[10px] text-slate-400">
                PNG, JPG, WEBP yoki PDF (maksimal 15 MB)
              </p>
            </div>

            <!-- Optional Notes -->
            <div class="space-y-0.5">
              <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Qo'shimcha Izoh (ixtiyoriy)
              </label>
              <input
                v-model="paymentForm.notes"
                type="text"
                placeholder="Masalan: Kapitalbank orqali to'landi..."
                class="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <!-- Step 3 Footer Action Buttons -->
            <div class="pt-1 flex items-center justify-between gap-2.5 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                @click="prevStep"
                class="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition"
              >
                <ArrowLeft class="w-3.5 h-3.5" />
                <span>Ortga</span>
              </button>
              <button
                type="submit"
                :disabled="submittingReceipt || !paymentForm.receiptUrl"
                class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-2 transition"
              >
                <Check class="w-4 h-4 stroke-[3]" />
                <span>{{ submittingReceipt ? 'Yuborilmoqda...' : 'Tasdiqlashga Yuborish' }}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL: SuperAdmin Edit Plan Details & Feature Toggles (2-Step Flow) -->
    <div
      v-if="editingPlan"
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        class="w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        @click.stop
      >
        <!-- Modal Header -->
        <div class="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Edit2 class="w-4 h-4" />
            </div>
            <div>
              <h3 class="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                «{{ editingPlan.name }}» Tarifini Tahrirlash
              </h3>
              <p class="text-[11px] text-slate-400">SuperAdmin boshqaruv paneli</p>
            </div>
          </div>
          <button
            type="button"
            @click="editingPlan = null"
            class="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- 2-Step Tab Bar -->
        <div class="px-4 sm:px-5 pt-3 pb-1 shrink-0 grid grid-cols-2 gap-2 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
          <button
            type="button"
            @click="editPlanStep = 1"
            :class="[
              'py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2',
              editPlanStep === 1
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs ring-1 ring-emerald-500/30'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
            ]"
          >
            <span class="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[10px] font-black flex items-center justify-center text-emerald-700 dark:text-emerald-300">1</span>
            <span>Xizmatlar (ON/OFF)</span>
          </button>

          <button
            type="button"
            @click="editPlanStep = 2"
            :class="[
              'py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2',
              editPlanStep === 2
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs ring-1 ring-emerald-500/30'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
            ]"
          >
            <span class="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] font-black flex items-center justify-center text-slate-700 dark:text-slate-300">2</span>
            <span>Narx va Limitlar</span>
          </button>
        </div>

        <!-- Modal Body (Scrollable) -->
        <form @submit.prevent="savePlanChanges" class="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          <!-- BOSQICH 1: Xizmatlar va Funksiyalar (ON / OFF Toggles) -->
          <div v-if="editPlanStep === 1" class="space-y-3">
            <div class="flex items-center justify-between pb-1">
              <div>
                <h4 class="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Layers class="w-3.5 h-3.5 text-emerald-500" />
                  <span>Tarif Funksiyalari</span>
                </h4>
                <p class="text-[11px] text-slate-400">Ushbu tarifda ishlaydigan xizmatlarni yoqing yoki o'chiring</p>
              </div>
              <span class="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                {{ Object.values(editPlanForm.features).filter(Boolean).length }} ta faol
              </span>
            </div>

            <div class="space-y-2">
              <div
                v-for="feat in ALL_AVAILABLE_FEATURES"
                :key="feat.key"
                :class="[
                  'p-3 rounded-2xl border transition-all flex items-center justify-between gap-3',
                  editPlanForm.features[feat.key]
                    ? 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/30 dark:border-emerald-500/40 ring-1 ring-emerald-500/20'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800 opacity-60'
                ]"
              >
                <!-- Feature Info -->
                <div class="flex items-center gap-2.5 min-w-0">
                  <div
                    :class="[
                      'p-2 rounded-xl shrink-0 transition',
                      editPlanForm.features[feat.key]
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    ]"
                  >
                    <component :is="feat.icon" class="w-4 h-4" />
                  </div>
                  <div class="min-w-0">
                    <div class="flex items-center gap-2">
                      <p class="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {{ feat.label }}
                      </p>
                      <span
                        v-if="editPlanForm.features[feat.key]"
                        class="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-600 text-white"
                      >
                        ON
                      </span>
                      <span
                        v-else
                        class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                      >
                        OFF
                      </span>
                    </div>
                    <p class="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {{ feat.description }}
                    </p>
                  </div>
                </div>

                <!-- 100% Reliable Toggle Switch -->
                <button
                  type="button"
                  @click="editPlanForm.features[feat.key] = !editPlanForm.features[feat.key]"
                  class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                  :class="editPlanForm.features[feat.key] ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'"
                >
                  <span
                    aria-hidden="true"
                    class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
                    :class="editPlanForm.features[feat.key] ? 'translate-x-5' : 'translate-x-0'"
                  />
                </button>
              </div>
            </div>
          </div>

          <!-- BOSQICH 2: Narx va Limitlar Parametrlari -->
          <div v-else-if="editPlanStep === 2" class="space-y-3.5">
            <div class="pb-1">
              <h4 class="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <CreditCard class="w-3.5 h-3.5 text-emerald-500" />
                <span>Asosiy Narx va Cheklovlar</span>
              </h4>
              <p class="text-[11px] text-slate-400">Tarif nomi, oylik to'lov summasi va ruxsat etilgan limitlar</p>
            </div>

            <!-- Plan Name -->
            <div class="space-y-1">
              <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Tarif Nomi *
              </label>
              <input
                v-model="editPlanForm.name"
                type="text"
                required
                class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
              />
            </div>

            <!-- Price Monthly -->
            <div class="space-y-1">
              <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Oylik Narxi (so'mda) *
              </label>
              <CurrencyInput
                v-model="editPlanForm.priceMonthly"
                placeholder="0"
                suffix="so'm / oy"
                input-class="!font-black !text-emerald-600 dark:!text-emerald-400 !text-xs !bg-slate-50/50 dark:!bg-slate-800"
              />
              <span class="text-[10px] text-slate-400">0 kiritilsa — Bepul (Free) deb ko'rsatiladi</span>
            </div>

            <!-- Limits: Branches & Users -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Maks. Filiallar soni
                </label>
                <input
                  v-model.number="editPlanForm.maxBranches"
                  type="number"
                  min="0"
                  placeholder="0 (Cheksiz)"
                  class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                />
                <span class="text-[10px] text-slate-400">0 yoki bo'sh = Cheksiz</span>
              </div>

              <div class="space-y-1">
                <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Maks. Xodimlar soni
                </label>
                <input
                  v-model.number="editPlanForm.maxUsers"
                  type="number"
                  min="0"
                  placeholder="0 (Cheksiz)"
                  class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                />
                <span class="text-[10px] text-slate-400">0 yoki bo'sh = Cheksiz</span>
              </div>
            </div>
          </div>

          <!-- Modal Footer Actions -->
          <div class="pt-3 flex items-center justify-between gap-2.5 border-t border-slate-100 dark:border-slate-800">
            <!-- Left Action -->
            <button
              v-if="editPlanStep === 1"
              type="button"
              @click="editingPlan = null"
              class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Bekor qilish
            </button>
            <button
              v-else
              type="button"
              @click="editPlanStep = 1"
              class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition"
            >
              <ArrowLeft class="w-3.5 h-3.5" />
              <span>Ortga (Xizmatlar)</span>
            </button>

            <!-- Right Action -->
            <button
              v-if="editPlanStep === 1"
              type="button"
              @click="editPlanStep = 2"
              class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-500/25 flex items-center gap-2 transition"
            >
              <span>Keyingisi: Narx & Limitlar</span>
              <ArrowRight class="w-4 h-4" />
            </button>
            <button
              v-else
              type="submit"
              :disabled="savingPlan"
              class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-500/25 disabled:opacity-50 flex items-center gap-2 transition"
            >
              <Check class="w-4 h-4 stroke-[3]" />
              <span>{{ savingPlan ? 'Saqlanmoqda...' : 'Tarifni Saqlash' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  CreditCard,
  Sparkles,
  Copy,
  Upload,
  FileText,
  Send,
  Check,
  CheckCircle2,
  X,
  Edit2,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Building2,
  Users,
  ShoppingCart,
  FolderTree,
  PieChart,
  Lock,
  RefreshCw,
  ArrowUpRight,
  Clock,
  Info,
  Layers,
} from 'lucide-vue-next';
import api from '@/services/api';
import { useToast } from '@/composables/useToast';
import { useAuthStore } from '@/stores/auth.store';
import CurrencyInput from '@/components/CurrencyInput.vue';
import SkeletonLoader from '@/components/SkeletonLoader.vue';

const toast = useToast();
const authStore = useAuthStore();
const isSuperAdmin = computed(() => !!authStore.user?.isSuperAdmin);

// All toggleable system features
const ALL_AVAILABLE_FEATURES = [
  { key: 'pos', label: 'POS Kassa & Chek chiqarish', description: 'Kassa savdolari, chek printer, to\'lov turlari', icon: ShoppingCart },
  { key: 'inventory', label: 'Ombor & Mahsulotlar nazorati', description: 'Inventarizatsiya, qoldiqlar, barkod skaner', icon: FolderTree },
  { key: 'finance', label: 'Moliya & Kunlik hisobotlar', description: 'Tushumlar, xarajatlar, kassa balansi tahlili', icon: PieChart },
  { key: 'telegram_bot', label: 'Telegram Bot bildirishnomalari', description: 'Kunlik avto-hisobotlar va savdo xabarlari', icon: Send },
  { key: 'customer_loyalty', label: 'Mijozlar bazasi va Cashback', description: 'Sodiqlik tizimi va mijozlar qarz daftari', icon: Users },
  { key: 'suppliers', label: 'Ta\'minotchilar & Xaridlar', description: 'Ta\'minotchi hisob-kitoblari va partiyalar', icon: Building2 },
  { key: 'ai_assistant', label: 'Boshqar AI Aqlli Yordamchisi', description: 'AI savdo bashorati va biznes maslahatchisi', icon: Sparkles },
  { key: 'export_reports', label: 'Excel / PDF Hisobotlar', description: 'Barcha hisobotlarni eksport qilish va chop etish', icon: FileText },
  { key: 'vip_support', label: '24/7 Shaxsiy VIP Menejer', description: 'Doimiy shaxsiy aloqa va texnik ko\'mak', icon: ShieldCheck },
  { key: 'cloud_backup', label: 'Avtomatik Bulutli Zaxira', description: 'Kunlik xavfsiz cloud backup nusxalari', icon: Lock },
];

const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(`ubms_cache_${key}`);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(`ubms_cache_${key}`, JSON.stringify(data));
  } catch (e) {}
};

const cachedBilling = loadFromStorage<any>('billing_status', null);

const loading = ref(!cachedBilling?.subscription);
const isRefreshing = ref(false);
const business = ref<any>(cachedBilling?.business || null);
const subscription = ref<any>(cachedBilling?.subscription || null);
const usage = ref<any>(cachedBilling?.usage || { branches: 1, users: 1 });
const plans = ref<any[]>(cachedBilling?.plans || []);
const requisites = ref<any>(cachedBilling?.requisites || null);
const pendingRequest = ref<any>(cachedBilling?.pendingRequest || null);

// Payment Wizard Step (1: Plan, 2: Requisites, 3: Receipt)
const paymentStep = ref(1);

// SuperAdmin Plan Edit state
const editingPlan = ref<any>(null);
const editPlanStep = ref(1);
const savingPlan = ref(false);
const editPlanForm = ref({
  name: '',
  priceMonthly: 0,
  maxBranches: 0,
  maxUsers: 0,
  features: {} as Record<string, boolean>,
});

const showPaymentModal = ref(false);
const submittingReceipt = ref(false);
const paymentForm = ref({
  planId: '',
  durationMonths: 1,
  senderName: '',
  senderCard: '',
  receiptUrl: '',
  notes: '',
});

// File upload states
const fileInputRef = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);
const receiptFileName = ref('');
const receiptFileSize = ref('');
const isImageFile = ref(true);

const currentActivePlanId = computed(() => {
  if (subscription.value?.planId) return subscription.value.planId;
  if (subscription.value?.planName) {
    const matched = plans.value.find(
      (p) => p.name.toLowerCase() === subscription.value.planName.toLowerCase()
    );
    if (matched) return matched.id;
  }
  if (business.value?.plan?.id) return business.value.plan.id;
  if (business.value?.planId) return business.value.planId;
  return null;
});

const currentActivePlan = computed(() => {
  return plans.value.find((p) => p.id === currentActivePlanId.value) || null;
});

const payablePlans = computed(() => {
  return plans.value.filter((p) => Number(p.priceMonthly) > 0);
});

const selectedPlan = computed(() => {
  return plans.value.find((item) => item.id === paymentForm.value.planId) || null;
});

const selectedDiscountPercent = computed(() => {
  if (paymentForm.value.durationMonths === 12) return 15;
  if (paymentForm.value.durationMonths === 6) return 5;
  return 0;
});

const selectedOriginalTotal = computed(() => {
  if (!selectedPlan.value) return 0;
  return Number(selectedPlan.value.priceMonthly || 0) * (paymentForm.value.durationMonths || 1);
});

const selectedDiscountSavings = computed(() => {
  if (!selectedDiscountPercent.value) return 0;
  return Math.round(selectedOriginalTotal.value * (selectedDiscountPercent.value / 100));
});

const selectedTotalAmount = computed(() => {
  return selectedOriginalTotal.value - selectedDiscountSavings.value;
});

const openEditPlanModal = (plan: any) => {
  editingPlan.value = plan;
  editPlanStep.value = 1;

  // Defaults per plan
  const defaultFeatures: Record<string, boolean> = {
    pos: true,
    inventory: true,
    finance: true,
    customer_loyalty: true,
    suppliers: true,
    export_reports: true,
    cloud_backup: true,
    telegram_bot: plan.name !== 'Free',
    ai_assistant: plan.name !== 'Free',
    vip_support: plan.name === 'Business',
  };

  if (plan.features && typeof plan.features === 'object') {
    Object.assign(defaultFeatures, plan.features);
  }

  editPlanForm.value = {
    name: plan.name,
    priceMonthly: Number(plan.priceMonthly || 0),
    maxBranches: plan.maxBranches || 0,
    maxUsers: plan.maxUsers || 0,
    features: defaultFeatures,
  };
};

const savePlanChanges = async () => {
  if (!editingPlan.value) return;
  savingPlan.value = true;
  try {
    const payload = {
      name: editPlanForm.value.name,
      priceMonthly: editPlanForm.value.priceMonthly,
      maxBranches: editPlanForm.value.maxBranches ? Number(editPlanForm.value.maxBranches) : null,
      maxUsers: editPlanForm.value.maxUsers ? Number(editPlanForm.value.maxUsers) : null,
      features: editPlanForm.value.features,
    };
    await api.patch(`/superadmin/plans/${editingPlan.value.id}`, payload);
    toast.success(`«${editPlanForm.value.name}» tarifi muvaffaqiyatli saqlandi!`);
    editingPlan.value = null;
    await loadBillingStatus();
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Xatolik yuz berdi');
  } finally {
    savingPlan.value = false;
  }
};

const loadBillingStatus = async (silent = false) => {
  if (!silent && !subscription.value) {
    loading.value = true;
  } else {
    isRefreshing.value = true;
  }
  try {
    const { data } = await api.get('/billing/status');
    if (data) {
      business.value = data.business;
      subscription.value = data.subscription;
      usage.value = data.usage || { branches: 1, users: 1 };
      plans.value = Array.isArray(data.plans) ? data.plans : [];
      requisites.value = data.requisites;
      pendingRequest.value = data.pendingRequest;
      saveToStorage('billing_status', data);
    }
  } catch (err: any) {
    console.error('Billing status error:', err);
  } finally {
    loading.value = false;
    isRefreshing.value = false;
  }
};

const openPaymentModal = (targetPlan?: any) => {
  const chosen =
    targetPlan ||
    (currentActivePlan.value && Number(currentActivePlan.value.priceMonthly) > 0
      ? currentActivePlan.value
      : payablePlans.value[0]);
  if (chosen) {
    paymentForm.value.planId = chosen.id;
  }
  paymentForm.value.durationMonths = 1;
  paymentStep.value = 1;
  removeFile();
  showPaymentModal.value = true;
};

const nextStep = () => {
  if (paymentStep.value === 1) {
    if (!paymentForm.value.planId) {
      toast.warning('Iltimos, tarifni tanlang');
      return;
    }
    paymentStep.value = 2;
  } else if (paymentStep.value === 2) {
    if (!paymentForm.value.senderName.trim()) {
      toast.warning('Iltimos, to\'lovchi ismingizni kiriting');
      return;
    }
    paymentStep.value = 3;
  }
};

const prevStep = () => {
  if (paymentStep.value > 1) {
    paymentStep.value--;
  }
};

// File Upload Handlers
const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    img.onload = () => {
      const maxWidth = 1400;
      const maxHeight = 1400;
      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(img.src);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const handleFileProcess = async (file: File) => {
  if (!file) return;

  if (file.size > 15 * 1024 * 1024) {
    toast.error('Fayl hajmi 15 MB dan oshmasligi kerak');
    return;
  }

  receiptFileName.value = file.name;
  receiptFileSize.value = formatBytes(file.size);

  if (file.type.startsWith('image/')) {
    isImageFile.value = true;
    try {
      const compressed = await compressImage(file);
      paymentForm.value.receiptUrl = compressed;
      toast.info('Chek rasmi muvaffaqiyatli yuklandi');
    } catch {
      const reader = new FileReader();
      reader.onload = (e) => {
        paymentForm.value.receiptUrl = (e.target?.result as string) || '';
      };
      reader.readAsDataURL(file);
    }
  } else {
    isImageFile.value = false;
    const reader = new FileReader();
    reader.onload = (e) => {
      paymentForm.value.receiptUrl = (e.target?.result as string) || '';
    };
    reader.readAsDataURL(file);
    toast.info('Hujjat fayli yuklandi');
  }
};

const onFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    handleFileProcess(target.files[0]);
  }
};

const onFileDrop = (event: DragEvent) => {
  isDragging.value = false;
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    handleFileProcess(event.dataTransfer.files[0]);
  }
};

const removeFile = () => {
  paymentForm.value.receiptUrl = '';
  receiptFileName.value = '';
  receiptFileSize.value = '';
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};

const submitReceipt = async () => {
  if (!paymentForm.value.receiptUrl) {
    toast.warning('Iltimos, to\'lov cheki rasmi yoki faylini yuklang.');
    return;
  }

  submittingReceipt.value = true;
  try {
    await api.post('/billing/request', {
      ...paymentForm.value,
      amount: selectedTotalAmount.value,
    });
    showPaymentModal.value = false;
    toast.success('To\'lov so\'rovingiz va chekingiz qabul qilindi! Administrator tasdiqlashi bilan obunangiz faollashadi.');
    await loadBillingStatus();
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Xatolik yuz berdi');
  } finally {
    submittingReceipt.value = false;
  }
};

const copyText = (txt: string, label: string) => {
  if (!txt) return;
  navigator.clipboard.writeText(txt);
  toast.success(`${label} buferga nusxalandi!`);
};

const formatMoney = (amount: any) => {
  const num = Math.round(Number(amount || 0));
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + " so'm";
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '--.--.----';
  const d = new Date(dateStr);
  return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

onMounted(() => {
  loadBillingStatus(true);
});
</script>

<style scoped>
.card-animated-gradient {
  background: linear-gradient(135deg, #047857 0%, #059669 35%, #10b981 70%, #065f46 100%);
  background-size: 200% 200%;
  animation: cardGradientMove 7s ease-in-out infinite alternate;
}

@keyframes cardGradientMove {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.card-light-shine {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    60deg,
    rgba(255, 255, 255, 0) 30%,
    rgba(255, 255, 255, 0.22) 50%,
    rgba(255, 255, 255, 0) 70%
  );
  transform: rotate(25deg);
  animation: cardShineSweep 5s ease-in-out infinite;
}

@keyframes cardShineSweep {
  0% {
    transform: translateX(-100%) rotate(25deg);
  }
  35%, 100% {
    transform: translateX(100%) rotate(25deg);
  }
}
</style>
