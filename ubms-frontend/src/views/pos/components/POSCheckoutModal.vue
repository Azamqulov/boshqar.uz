<template>
  <Teleport to="body">
    <div v-if="isOpen" @click.self="$emit('close')" class="modal-overlay">
      <div class="modal-container max-w-md" @click.stop>
        <div class="modal-header">
          <h3 class="font-black text-base text-slate-900 dark:text-white">To'lovni Tasdiqlash</h3>
          <button @click="$emit('close')" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="modal-body space-y-4">
          <!-- Total display with dynamic discount breakdown -->
          <div class="p-4 bg-slate-100/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-1">
            <div v-if="allowDiscounts !== false && cartStore.generalDiscount > 0" class="flex items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span>Oraliq: <strong class="font-mono text-slate-700 dark:text-slate-300">{{ formatCurrency(cartStore.subtotal) }}</strong></span>
              <span>•</span>
              <span class="text-rose-500 font-bold">Chegirma: <strong class="font-mono">-{{ formatCurrency(cartStore.generalDiscount) }}</strong> ({{ cartStore.discountType === 'percent' ? cartStore.discountValue + '%' : formatCurrency(cartStore.discountValue) }})</span>
            </div>
            <span class="text-xs text-slate-500 dark:text-slate-400 block">To'lanishi kerak bo'lgan jami summa:</span>
            <h2 class="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">
              {{ formatCurrency(cartStore.grandTotal) }}
            </h2>
            <!-- Live CBU equivalent preview -->
            <p class="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center gap-1.5">
              <Coins class="w-3.5 h-3.5 text-emerald-500" />
              <span v-if="currencyStore.activeCurrency === 'UZS'">
                ≈ ${{ (cartStore.grandTotal / currencyStore.usdRate).toFixed(2) }} | ≈ {{ (cartStore.grandTotal / currencyStore.rubRate).toFixed(1) }} ₽
              </span>
              <span v-else-if="currencyStore.activeCurrency === 'USD'">
                ≈ {{ Math.round(cartStore.grandTotal * currencyStore.usdRate).toLocaleString('uz-UZ') }} so'm | ≈ {{ (cartStore.grandTotal * (currencyStore.usdRate / currencyStore.rubRate)).toFixed(1) }} ₽
              </span>
              <span v-else-if="currencyStore.activeCurrency === 'RUB'">
                ≈ {{ Math.round(cartStore.grandTotal * currencyStore.rubRate).toLocaleString('uz-UZ') }} so'm | ≈ ${{ (cartStore.grandTotal * (currencyStore.rubRate / currencyStore.usdRate)).toFixed(2) }}
              </span>
              <span v-else-if="currencyStore.activeCurrency === 'EUR'">
                ≈ {{ Math.round(cartStore.grandTotal * currencyStore.eurRate).toLocaleString('uz-UZ') }} so'm | ≈ ${{ (cartStore.grandTotal * (currencyStore.eurRate / currencyStore.usdRate)).toFixed(2) }}
              </span>
            </p>
          </div>

          <!-- Quick Discount Box inside Checkout Modal (Faqat sozlamalarda ruxsat berilgan bo'lsa chiqadi) -->
          <div v-if="allowDiscounts !== false" class="p-3 rounded-2xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <Tag class="w-3.5 h-3.5" />
                <span>Chegirma qo'llash:</span>
              </span>
              <button
                v-if="cartStore.generalDiscount > 0"
                type="button"
                @click="clearDiscount"
                class="text-[11px] font-bold text-rose-500 hover:text-rose-700 underline"
              >
                Chegirmani bekor qilish
              </button>
            </div>

            <!-- % or So'm Toggle & Presets -->
            <div class="flex items-center gap-1.5">
              <div class="inline-flex rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5 text-xs font-bold shrink-0">
                <button
                  type="button"
                  @click="setDiscountType('percent')"
                  class="px-2.5 py-1 rounded-lg transition"
                  :class="discountMode === 'percent' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'"
                >
                  %
                </button>
                <button
                  type="button"
                  @click="setDiscountType('fixed')"
                  class="px-2.5 py-1 rounded-lg transition"
                  :class="discountMode === 'fixed' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'"
                >
                  {{ currencyStore.getSymbol() }}
                </button>
              </div>

              <!-- Presets -->
              <div v-if="discountMode === 'percent'" class="flex items-center gap-1 overflow-x-auto scrollbar-none flex-1">
                <button
                  v-for="p in [5, 10, 15, 20, 50]"
                  :key="p"
                  type="button"
                  @click="applyPercentDiscount(p)"
                  class="px-2 py-1 rounded-lg text-xs font-bold font-mono transition shrink-0"
                  :class="cartStore.discountType === 'percent' && cartStore.discountValue === p ? 'bg-rose-500 text-white shadow-xs' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'"
                >
                  {{ p }}%
                </button>
              </div>

              <div v-else class="flex items-center gap-1 overflow-x-auto scrollbar-none flex-1">
                <button
                  v-for="amt in (currencyStore.activeCurrency === 'USD' ? [5, 10, 20, 50] : currencyStore.activeCurrency === 'RUB' ? [100, 500, 1000, 2000] : [5000, 10000, 20000, 50000])"
                  :key="amt"
                  type="button"
                  @click="applyFixedDiscount(amt)"
                  class="px-2 py-1 rounded-lg text-xs font-bold font-mono transition shrink-0"
                  :class="cartStore.discountType === 'fixed' && cartStore.discountValue === amt ? 'bg-rose-500 text-white shadow-xs' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'"
                >
                  {{ formatCurrency(amt) }}
                </button>
              </div>

              <!-- More / Custom discount button -->
              <button
                type="button"
                @click="$emit('openDiscountModal')"
                class="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-rose-500 shrink-0"
                title="Boshqa summa kiritish"
              >
                Kiritish...
              </button>
            </div>
          </div>

          <!-- Restaurant Service & Table Confirmation / Selection in Checkout Modal -->
          <div v-if="isRestaurant && enabledServiceTypes.length > 0" class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2.5">
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-500 dark:text-slate-400 font-semibold">Xizmat turi:</span>
              <div class="flex items-center gap-1.5">
                <span v-if="orderType === 'dine_in'" class="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <UtensilsCrossed class="w-3.5 h-3.5" />
                  <span>Zalda</span>
                </span>
                <span v-else-if="orderType === 'takeaway'" class="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <ShoppingBag class="w-3.5 h-3.5" />
                  <span>Saboy (Olib ketish)</span>
                </span>
                <span v-else-if="orderType === 'delivery'" class="font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1">
                  <Truck class="w-3.5 h-3.5" />
                  <span>Yetkazib berish (Dostavka)</span>
                </span>
              </div>
            </div>

            <!-- Table Selection in Checkout Modal if Zalda -->
            <div v-if="orderType === 'dine_in'" class="pt-2 border-t border-slate-200 dark:border-slate-700/60 space-y-2">
              <div class="flex items-center justify-between text-xs">
                <span class="font-bold flex items-center gap-1" :class="currentTableDisplayName ? 'text-slate-700 dark:text-slate-300' : 'text-rose-500 font-extrabold'">
                  <UtensilsCrossed class="w-3.5 h-3.5" />
                  <span>Qaysi stol band qilindi? *</span>
                </span>
                <span v-if="currentTableDisplayName" class="font-black text-emerald-600 dark:text-emerald-400">
                  {{ currentTableDisplayName }}
                </span>
                <span v-else class="text-[11px] text-rose-500 font-bold animate-pulse">
                  Tanlanmagan!
                </span>
              </div>

              <!-- Table Options -->
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="tbl in availableTables"
                  :key="tbl.id || tbl.name"
                  type="button"
                  @click="$emit('selectTable', tbl.name)"
                  class="px-3 py-1.5 rounded-xl text-xs font-bold transition"
                  :class="selectedTableNumber === tbl.name && !isCustomTableInput ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 border border-slate-200 dark:border-slate-600'"
                >
                  {{ tbl.name }}
                </button>
              </div>

              <!-- Custom table input toggle -->
              <div class="pt-1">
                <div v-if="isCustomTableInput" class="flex gap-1.5">
                  <input
                    :value="customTableNumber"
                    @input="$emit('update:customTableNumber', ($event.target as HTMLInputElement).value)"
                    type="text"
                    placeholder="Masalan: Stol #7, VIP 2..."
                    class="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  v-else
                  type="button"
                  @click="$emit('enableCustomTable')"
                  class="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                >
                  + Boshqa stol nomini kiritish
                </button>
              </div>
            </div>
          </div>

          <!-- Payment method buttons -->
          <div class="space-y-2">
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">To'lov usulini tanlang:</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="pm in paymentMethods"
                :key="pm.id"
                type="button"
                @click="$emit('selectPaymentMethod', pm.id)"
                class="p-3 rounded-xl border text-left font-bold text-xs transition flex items-center gap-2.5 btn-interactive"
                :class="selectedPaymentMethod === pm.id ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20' : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'"
              >
                <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" :class="selectedPaymentMethod === pm.id ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'">
                  <Banknote v-if="pm.id === '1'" class="w-4 h-4" />
                  <CreditCard v-else-if="pm.id === '2'" class="w-4 h-4" />
                  <QrCode v-else-if="pm.id === '3'" class="w-4 h-4" />
                  <FileText v-else class="w-4 h-4" />
                </div>
                <div>
                  <p class="font-black leading-tight">{{ pm.name }}</p>
                  <p class="text-[10px] opacity-75 font-normal">
                    {{ pm.id === '1' ? 'Qog\'oz pul' : pm.id === '2' ? 'Terminal' : pm.id === '3' ? 'QR to\'lov' : 'Qarzga yozish' }}
                  </p>
                </div>
              </button>
            </div>
          </div>

          <!-- Nasiya (Debt) 100% Alert Banner if Nasiya Card Selected -->
          <div v-if="selectedPaymentMethod === '4'" class="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-xs space-y-2 animate-in fade-in">
            <div class="flex items-center justify-between">
              <span class="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <FileText class="w-4 h-4 text-amber-600" />
                <span>100% Nasiya savdo (Qarzga yozish)</span>
              </span>
              <span class="font-mono font-black text-rose-600 dark:text-rose-400 text-sm">
                {{ formatCurrency(cartStore.grandTotal) }}
              </span>
            </div>
            <p class="text-[11px] text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
              Ushbu to'lov to'liq mijoz hisobiga qarz sifatida yoziladi. Iltimos, quyida mijozni tanlang.
            </p>
          </div>

          <!-- Cash change calculation if cash selected -->
          <div v-if="selectedPaymentMethod === '1'" class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <!-- Currency Input Selector for Cash -->
            <div class="flex items-center justify-between">
              <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300">Mijoz bergan summa:</label>
              <!-- Foreign Currency Switcher for Cash -->
              <div class="inline-flex rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5 text-[10px] font-mono font-bold">
                <button
                  type="button"
                  @click="activeCashInputCurrency = 'UZS'"
                  class="px-2 py-0.5 rounded transition"
                  :class="activeCashInputCurrency === 'UZS' ? 'bg-emerald-500 text-white' : 'text-slate-600 dark:text-slate-400'"
                >
                  UZS
                </button>
                <button
                  type="button"
                  @click="activeCashInputCurrency = 'USD'"
                  class="px-2 py-0.5 rounded transition"
                  :class="activeCashInputCurrency === 'USD' ? 'bg-emerald-500 text-white' : 'text-slate-600 dark:text-slate-400'"
                >
                  USD ($)
                </button>
                <button
                  type="button"
                  @click="activeCashInputCurrency = 'RUB'"
                  class="px-2 py-0.5 rounded transition"
                  :class="activeCashInputCurrency === 'RUB' ? 'bg-emerald-500 text-white' : 'text-slate-600 dark:text-slate-400'"
                >
                  RUB (₽)
                </button>
              </div>
            </div>

            <!-- Standard Cash Input in Active Currency -->
            <div v-if="activeCashInputCurrency === currencyStore.activeCurrency">
              <CurrencyInput
                :model-value="cashReceived"
                @update:model-value="$emit('update:cashReceived', $event)"
                placeholder="0"
                :suffix="currencyStore.getSymbol()"
                inputClass="font-bold text-slate-900 dark:text-white"
              />
            </div>

            <!-- Foreign Currency Cash Input (e.g. Dollar or Rubl notes received) -->
            <div v-else class="space-y-2">
              <div class="relative">
                <input
                  type="number"
                  v-model.number="foreignCashReceived"
                  @input="handleForeignCashInput"
                  placeholder="0"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold font-mono text-base focus:outline-none focus:border-emerald-500"
                />
                <span class="absolute right-3 top-2.5 text-xs font-bold text-slate-400 font-mono">
                  {{ activeCashInputCurrency === 'USD' ? '$ Dollar' : '₽ Rubl' }}
                </span>
              </div>
              <div class="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono flex items-center justify-between text-emerald-800 dark:text-emerald-300 font-bold">
                <span>CBU kursi ({{ activeCashInputCurrency === 'USD' ? '$1 = ' + currencyStore.usdRate.toLocaleString() : '₽1 = ' + currencyStore.rubRate.toLocaleString() }} so'm):</span>
                <span>= {{ formatCurrency(cashReceived) }}</span>
              </div>
            </div>

            <!-- Quick Cash Presets -->
            <div class="flex flex-wrap gap-1.5">
              <button
                type="button"
                @click="setExactCash"
                class="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:border-emerald-500 transition"
              >
                Aniq summa
              </button>
              <button
                type="button"
                v-for="amt in (currencyStore.activeCurrency === 'USD' ? [10, 20, 50, 100] : currencyStore.activeCurrency === 'RUB' ? [500, 1000, 2000, 5000] : [50000, 100000, 200000, 500000])"
                :key="amt"
                @click="setPresetCash(amt)"
                class="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-700 dark:text-slate-300 hover:border-emerald-500 transition"
              >
                {{ formatCurrency(amt) }}
              </button>
            </div>

            <!-- Full or Overpaid Cash: Show Change (Qaytim) -->
            <div v-if="cashReceived > cartStore.grandTotal" class="pt-2 border-t border-slate-200 dark:border-slate-800 text-xs space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-slate-500 dark:text-slate-400 font-semibold">Qaytim (So'mda):</span>
                <span class="font-bold font-mono text-emerald-600 dark:text-emerald-400 text-base">
                  {{ formatCurrency(cashReceived - cartStore.grandTotal) }}
                </span>
              </div>
              <p v-if="currencyStore.activeCurrency === 'UZS' && (cashReceived - cartStore.grandTotal) > 0" class="text-[10px] text-right font-mono text-slate-400">
                (≈ ${{ ((cashReceived - cartStore.grandTotal) / currencyStore.usdRate).toFixed(2) }})
              </p>
            </div>
            <!-- Underpaid Cash: Partial Payment Alert -->
            <div v-else-if="cashReceived > 0 && cashReceived < cartStore.grandTotal" class="pt-1 border-t border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-slate-500 dark:text-slate-400 font-semibold">Naqd kiritilgan:</span>
                <span class="font-bold font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                  {{ formatCurrency(cashReceived) }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-rose-600 dark:text-rose-400 font-bold">
                  {{ allowDebt ? 'Nasiyaga yoziladigan qoldiq:' : 'Yetishmayotgan summa:' }}
                </span>
                <span class="font-bold font-mono text-rose-600 dark:text-rose-400 text-sm">
                  {{ formatCurrency(cartStore.grandTotal - cashReceived) }}
                </span>
              </div>
              <div
                v-if="allowDebt"
                class="p-2 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-800 dark:text-amber-300 text-[11px] font-semibold flex items-center gap-1.5"
              >
                <span>⚠️ Mijoz to'liq summa bermadi. Qolgan summa nasiyaga yozilishi uchun pastda mijozni tanlang.</span>
              </div>
              <div
                v-else
                class="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-700 dark:text-rose-300 text-[11px] font-bold flex items-center gap-1.5"
              >
                <span>⛔ Nasiya savdosi o'chirilgan! To'lov to'liq summa bo'lishi shart.</span>
              </div>
            </div>
          </div>

          <!-- Customer / Nasiya Selector in Checkout Modal (FAKAT NASIYA BO'LGANDA VA RUXSAT BERILGANDA CHIQADI) -->
          <div
            v-if="isNasiyaNeeded && allowDebt"
            class="p-3.5 rounded-2xl transition-all duration-300 border space-y-2.5 animate-in fade-in slide-in-from-top-2"
            :class="[
              !selectedCustomerId
                ? 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/50 shadow-sm ring-2 ring-amber-500/20'
                : 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/40'
            ]"
          >
            <div class="flex items-center justify-between">
              <label class="block text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <Users class="w-4 h-4 text-amber-600" />
                <span>Nasiyaga yoziladigan mijozni tanlang: *</span>
              </label>
              <span v-if="!selectedCustomerId" class="text-[10px] text-rose-600 font-extrabold animate-pulse">
                Mijoz tanlanmagan!
              </span>
            </div>

            <div class="flex items-center gap-2">
              <div class="flex-1">
                <AppSelect
                  :model-value="selectedCustomerId"
                  @update:model-value="$emit('update:selectedCustomerId', $event)"
                  :options="customerSelectOptions"
                  :searchable="true"
                  placeholder="Mijozni qidirish yoki tanlash..."
                />
              </div>
              <button
                type="button"
                @click="$emit('openNewCustomer')"
                class="px-3 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-xs shrink-0 transition shadow-sm btn-interactive flex items-center gap-1"
                title="Yangi mijoz qo'shish"
              >
                <span>+ Yangi</span>
              </button>
            </div>

            <div v-if="selectedCustomer" class="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-1">
              <div class="flex items-center justify-between">
                <span class="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  <Users class="w-3.5 h-3.5 text-slate-400" />
                  <span>{{ selectedCustomer.fullName }}</span>
                </span>
                <span class="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{{ selectedCustomer.phone || 'Tel yo\'q' }}</span>
              </div>
              <div v-if="Number(selectedCustomer.debt || 0) > 0" class="text-[11px] text-rose-600 dark:text-rose-400 font-semibold flex items-center justify-between">
                <span>Eski qarzi:</span>
                <span class="font-mono font-bold">{{ formatCurrency(selectedCustomer.debt) }}</span>
              </div>
              <div v-if="currentNasiyaAmount > 0" class="pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-amber-700 dark:text-amber-300 flex items-center justify-between">
                <span>Nasiyaga qo'shiladigan summa:</span>
                <span class="font-mono font-black text-rose-600 dark:text-rose-400">+{{ formatCurrency(currentNasiyaAmount) }}</span>
              </div>
            </div>
          </div>

          <button
            @click="$emit('completeOrder')"
            :disabled="isSubmitDisabled"
            class="w-full py-3.5 rounded-xl font-black text-sm shadow-lg transition flex items-center justify-center space-x-2 btn-interactive"
            :class="[
              isSubmitDisabled
                ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed opacity-60 text-slate-500 shadow-none'
                : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/25 text-white cursor-pointer'
            ]"
          >
            <CheckCircle class="w-5 h-5" />
            <span>{{ isProcessing ? 'Chek chiqarilmoqda...' : 'To\'lovni Yakunlash (Chek Chiqarish)' }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  X,
  CreditCard,
  Banknote,
  Smartphone,
  FileText,
  Users,
  CheckCircle,
  Tag,
  QrCode,
  Coins,
  UtensilsCrossed,
  ShoppingBag,
  Truck,
} from 'lucide-vue-next';
import CurrencyInput from '../../../components/CurrencyInput.vue';
import AppSelect from '../../../components/AppSelect.vue';
import { useFormat } from '../../../composables/useFormat';
import { useCurrencyStore } from '../../../stores/currency.store';

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    cartStore: any;
    isRestaurant: boolean;
    enabledServiceTypes: string[];
    orderType: string;
    currentTableDisplayName: string;
    availableTables: any[];
    selectedTableNumber: string;
    isCustomTableInput: boolean;
    customTableNumber: string;
    paymentMethods: any[];
    selectedPaymentMethod: string;
    cashReceived: number;
    isNasiyaNeeded: boolean;
    selectedCustomerId: string;
    customerSelectOptions: any[];
    selectedCustomer: any;
    currentNasiyaAmount: number;
    isProcessing: boolean;
    allowDebt?: boolean;
    allowDiscounts?: boolean;
  }>(),
  {
    allowDebt: true,
    allowDiscounts: true,
  }
);

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'selectTable', name: string): void;
  (e: 'update:customTableNumber', val: string): void;
  (e: 'enableCustomTable'): void;
  (e: 'selectPaymentMethod', pmId: string): void;
  (e: 'update:cashReceived', val: number): void;
  (e: 'update:selectedCustomerId', val: string): void;
  (e: 'openNewCustomer'): void;
  (e: 'openDiscountModal'): void;
  (e: 'completeOrder'): void;
}>();

const currencyStore = useCurrencyStore();
const activeCashInputCurrency = ref<'UZS' | 'USD' | 'RUB'>('UZS');
const foreignCashReceived = ref<number | null>(null);

const { formatCurrency } = useFormat();

const discountMode = ref<'percent' | 'fixed'>('percent');

watch(() => props.isOpen, (open) => {
  if (open) {
    activeCashInputCurrency.value = (currencyStore.activeCurrency as any) || 'UZS';
    foreignCashReceived.value = null;
  }
});

const handleForeignCashInput = () => {
  const val = Number(foreignCashReceived.value) || 0;
  if (activeCashInputCurrency.value === 'USD') {
    const uzsEquivalent = Math.round(val * currencyStore.usdRate);
    emit('update:cashReceived', uzsEquivalent);
  } else if (activeCashInputCurrency.value === 'RUB') {
    const uzsEquivalent = Math.round(val * currencyStore.rubRate);
    emit('update:cashReceived', uzsEquivalent);
  }
};

const setExactCash = () => {
  activeCashInputCurrency.value = currencyStore.activeCurrency as any;
  foreignCashReceived.value = null;
  emit('update:cashReceived', props.cartStore.grandTotal);
};

const setPresetCash = (amt: number) => {
  activeCashInputCurrency.value = currencyStore.activeCurrency as any;
  foreignCashReceived.value = null;
  emit('update:cashReceived', amt);
};

const setDiscountType = (mode: 'percent' | 'fixed') => {
  discountMode.value = mode;
  props.cartStore.discountType = mode;
  if (props.selectedPaymentMethod === '1') {
    emit('update:cashReceived', props.cartStore.grandTotal);
  }
};

const applyPercentDiscount = (p: number) => {
  discountMode.value = 'percent';
  props.cartStore.setDiscountPercent(p);
  if (props.selectedPaymentMethod === '1') {
    emit('update:cashReceived', props.cartStore.grandTotal);
  }
};

const applyFixedDiscount = (amt: number) => {
  discountMode.value = 'fixed';
  props.cartStore.setDiscountFixed(amt);
  if (props.selectedPaymentMethod === '1') {
    emit('update:cashReceived', props.cartStore.grandTotal);
  }
};

const clearDiscount = () => {
  props.cartStore.clearDiscount();
  if (props.selectedPaymentMethod === '1') {
    emit('update:cashReceived', props.cartStore.grandTotal);
  }
};

const isSubmitDisabled = computed(() => {
  if (props.isProcessing) return true;
  // If cash is selected and cash is underpaid while debt is disabled -> disabled!
  if (!props.allowDebt && props.selectedPaymentMethod === '1' && props.cashReceived < props.cartStore.grandTotal) {
    return true;
  }
  // If cash entered is 0 or negative
  if (props.selectedPaymentMethod === '1' && props.cashReceived <= 0) {
    return true;
  }
  // If nasiya is needed and no customer is selected -> disabled!
  if (props.isNasiyaNeeded && props.allowDebt && !props.selectedCustomerId) {
    return true;
  }
  return false;
});
</script>
