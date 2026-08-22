<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
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
            @click="$emit('close')"
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
            @click="$emit('update:paymentStep', 1)"
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
            @click="paymentForm.planId ? $emit('update:paymentStep', 2) : null"
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
            @click="paymentForm.planId && paymentForm.senderName ? $emit('update:paymentStep', 3) : null"
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

        <form @submit.prevent="$emit('submit-receipt')" class="space-y-3.5">
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
                <span v-if="selectedDiscountPercent > 0" class="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                  <Sparkles class="w-3 h-3 text-emerald-500" />
                  <span>{{ selectedDiscountPercent }}% chegirma qo'llandi!</span>
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
                @click="$emit('close')"
                class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                @click="$emit('next-step')"
                class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-500/25 flex items-center gap-2 transition"
              >
                <span>Keyingisi: Karta Rekviziti</span>
                <ArrowRight class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- ==================== STEP 2: KARTA REKVIZITI VA TO'LOVCHI ==================== -->
          <div v-else-if="paymentStep === 2" class="space-y-3 animate-in fade-in duration-200">
            <!-- Bank Card Container -->
            <div class="relative group">
              <div class="absolute -inset-1 bg-gradient-to-r from-emerald-500/40 via-emerald-400/30 to-emerald-600/40 rounded-3xl blur-lg opacity-75 group-hover:opacity-100 transition duration-500 animate-pulse"></div>

              <div
                v-if="requisites && requisites.isEnabled"
                class="relative rounded-2xl p-4 sm:p-5 text-white shadow-2xl border border-white/30 overflow-hidden select-none space-y-3 bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900"
              >
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
                </div>

                <div class="relative z-10 flex items-center justify-between pt-1">
                  <span class="text-[9px] text-emerald-100 font-bold uppercase tracking-widest font-mono">
                    KARTA RAQAMI:
                  </span>
                  <button
                    type="button"
                    @click="$emit('copy-text', requisites.cardNumber, 'Karta raqami')"
                    class="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 active:scale-95 text-white text-xs font-bold transition-all duration-150 flex items-center gap-1.5 border border-white/30 backdrop-blur-md shadow-sm"
                  >
                    <Copy class="w-3.5 h-3.5 text-white" />
                    <span>Nusxalash</span>
                  </button>
                </div>

                <div class="relative z-10 py-0.5">
                  <p class="font-mono text-lg sm:text-2xl font-black tracking-[0.16em] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] select-all">
                    {{ requisites.cardNumber }}
                  </p>
                </div>

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

            <!-- Transfer Amount Highlight Banner -->
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
                  @click="$emit('copy-text', selectedTotalAmount.toString(), 'To\'lov summasi')"
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
                @click="$emit('prev-step')"
                class="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition"
              >
                <ArrowLeft class="w-3.5 h-3.5" />
                <span>Ortga</span>
              </button>
              <button
                type="button"
                @click="$emit('next-step')"
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
                  @click="$emit('trigger-file-input')"
                  class="px-2 py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition"
                >
                  Almashtirish
                </button>
                <button
                  type="button"
                  @click="$emit('remove-file')"
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
              @click="$emit('trigger-file-input')"
              @dragover.prevent
              @drop.prevent="$emit('on-file-drop', $event)"
              :class="[
                'border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-1 group border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-slate-800/60'
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
                @click="$emit('prev-step')"
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
  </Teleport>
</template>

<script setup lang="ts">
import {
  CreditCard,
  X,
  Check,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Copy,
  User,
  FileText,
  Trash2,
  UploadCloud,
} from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
  paymentStep: number;
  paymentForm: any;
  payablePlans: any[];
  currentActivePlanId: string;
  currentActivePlan: any;
  requisites: any;
  selectedPlan: any;
  selectedDiscountPercent: number;
  selectedDiscountSavings: number;
  selectedOriginalTotal: number;
  selectedTotalAmount: number;
  submittingReceipt: boolean;
  isImageFile: boolean;
  receiptFileName: string;
  receiptFileSize: string;
  formatMoney: (val: any) => string;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'update:paymentStep', step: number): void;
  (e: 'copy-text', text: string, label: string): void;
  (e: 'trigger-file-input'): void;
  (e: 'remove-file'): void;
  (e: 'on-file-drop', ev: DragEvent): void;
  (e: 'submit-receipt'): void;
  (e: 'next-step'): void;
  (e: 'prev-step'): void;
}>();
</script>
