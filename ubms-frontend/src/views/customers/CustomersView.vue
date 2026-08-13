<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Mijozlar Bazasi (CRM)</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Mijozlar tarixi, xaridlar statistikasi va Nasiya / Qarz daftari</p>
      </div>

      <div class="flex items-center gap-2">
        <AppButton
          variant="primary"
          size="md"
          :icon="Plus"
          @click="openCreateModal"
        >
          Yangi Mijoz Qo'shish
        </AppButton>
      </div>
    </div>

    <!-- Quick Stats Cards (Debt & Customers Overview) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Total Customers -->
      <div class="glass-card rounded-2xl p-4 flex items-center justify-between">
        <div>
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Jami Mijozlar</span>
          <div class="text-xl font-black text-slate-900 dark:text-white font-mono mt-1">
            {{ customers.length }} ta
          </div>
        </div>
        <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
          <Users class="w-5 h-5" />
        </div>
      </div>

      <!-- Total Outstanding Debt -->
      <div class="glass-card rounded-2xl p-4 flex items-center justify-between border-rose-500/20 bg-rose-500/[0.02]">
        <div>
          <span class="text-xs font-semibold text-rose-600 dark:text-rose-400">Jami Nasiya / Qarzlar</span>
          <div class="text-xl font-black text-rose-600 dark:text-rose-400 font-mono mt-1">
            {{ formatCurrency(totalDebtAmount) }}
          </div>
        </div>
        <div class="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
          <TrendingDown class="w-5 h-5" />
        </div>
      </div>

      <!-- Debtors Count -->
      <div class="glass-card rounded-2xl p-4 flex items-center justify-between">
        <div>
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Qarzdor Mijozlar</span>
          <div class="text-xl font-black text-slate-900 dark:text-white font-mono mt-1">
            {{ debtorCustomersCount }} ta
          </div>
        </div>
        <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
          <AlertCircle class="w-5 h-5" />
        </div>
      </div>

      <!-- Total Sales to CRM Customers -->
      <div class="glass-card rounded-2xl p-4 flex items-center justify-between">
        <div>
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Jami Savdo Summasi</span>
          <div class="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
            {{ formatCurrency(totalCustomersSpent) }}
          </div>
        </div>
        <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
          <DollarSign class="w-5 h-5" />
        </div>
      </div>
    </div>

    <!-- Filters & Search Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <!-- Search Input -->
      <div class="w-full sm:w-80">
        <AppInput
          v-model="searchQuery"
          placeholder="Mijoz ismi yoki telefon raqami..."
          :icon="Search"
        />
      </div>

      <!-- Filter Tabs -->
      <div class="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
        <button
          type="button"
          @click="activeFilter = 'all'"
          class="px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap btn-interactive"
          :class="activeFilter === 'all' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
        >
          Barchasi ({{ customers.length }})
        </button>
        <button
          type="button"
          @click="activeFilter = 'debtors'"
          class="px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 btn-interactive"
          :class="activeFilter === 'debtors' ? 'bg-rose-500 text-white shadow-sm' : 'text-rose-600 dark:text-rose-400 hover:bg-rose-500/10'"
        >
          <AlertCircle class="w-3.5 h-3.5" />
          <span>Qarzdorlar ({{ debtorCustomersCount }})</span>
        </button>
        <button
          type="button"
          @click="activeFilter = 'clear'"
          class="px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap btn-interactive"
          :class="activeFilter === 'clear' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
        >
          Qarzsiz
        </button>
      </div>
    </div>

    <!-- Customer Table Skeleton -->
    <SkeletonLoader v-if="loading" variant="table" :rows="6" />

    <!-- Customer Table -->
    <div v-else class="glass-card rounded-2xl overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-semibold">
            <tr>
              <th class="py-3.5 px-4">Mijoz (F.I.SH)</th>
              <th class="py-3.5 px-4">Telefon</th>
              <th class="py-3.5 px-4">Xaridlar Soni</th>
              <th class="py-3.5 px-4">Jami Xarid Summasi</th>
              <th class="py-3.5 px-4">Nasiya / Qarz</th>
              <th class="py-3.5 px-4 text-right">Amallar & Qarz Boshqaruvi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
            <tr v-if="filteredCustomers.length === 0">
              <td colspan="6" class="py-12 text-center text-slate-400 dark:text-slate-500">
                <Users class="w-8 h-8 mx-auto mb-2 opacity-30" />
                <span>Mijozlar topilmadi</span>
              </td>
            </tr>
            <tr
              v-for="c in filteredCustomers"
              :key="c.id"
              class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition group"
            >
              <!-- Name & Notes -->
              <td class="py-3.5 px-4">
                <div class="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{{ c.fullName }}</span>
                  <span
                    v-if="c.notes"
                    :title="c.notes"
                    class="p-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-help"
                  >
                    📝
                  </span>
                </div>
                <div v-if="c.notes" class="text-[10px] text-slate-400 line-clamp-1 max-w-xs mt-0.5">
                  {{ c.notes.split('\n')[0] }}
                </div>
              </td>

              <!-- Phone -->
              <td class="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono">
                {{ c.phone ? formatUzbekPhone(c.phone) : '-' }}
              </td>

              <!-- Purchases Count -->
              <td class="py-3.5 px-4 font-mono font-medium">
                {{ c.totalPurchases || 0 }} ta
              </td>

              <!-- Total Spent -->
              <td class="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {{ formatCurrency(c.totalSpent || 0) }}
              </td>

              <!-- Debt -->
              <td class="py-3.5 px-4 font-mono">
                <span
                  class="font-black px-2.5 py-1 rounded-lg text-xs inline-block"
                  :class="Number(c.debt) > 0 ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'"
                >
                  {{ formatCurrency(c.debt || 0) }}
                </span>
              </td>

              <!-- Actions -->
              <td class="py-3.5 px-4 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <!-- 1. Add Debt (+ Qarz kiritish) -->
                  <button
                    type="button"
                    @click="openAddDebtModal(c)"
                    title="Qarz / Nasiya kiritish"
                    class="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs transition border border-rose-500/20 flex items-center gap-1 btn-interactive"
                  >
                    <Plus class="w-3.5 h-3.5" />
                    <span>Qarz kiritish</span>
                  </button>

                  <!-- 2. Pay Debt (Qarzni yopish - agar qarzi bo'lsa) -->
                  <button
                    v-if="Number(c.debt) > 0"
                    type="button"
                    @click="openPayDebtModal(c)"
                    title="Qarz to'lovini qabul qilish"
                    class="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-bold text-xs transition border border-emerald-500/30 flex items-center gap-1 btn-interactive"
                  >
                    <CreditCard class="w-3.5 h-3.5" />
                    <span>To'lov olish</span>
                  </button>

                  <!-- 3. History (Tarix / Nasiya daftari) -->
                  <button
                    type="button"
                    @click="openHistoryModal(c)"
                    title="Mijoz xarid va qarz tarixi"
                    class="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <History class="w-4 h-4" />
                  </button>

                  <!-- 4. Edit (Tahrirlash) -->
                  <button
                    type="button"
                    @click="openEditModal(c)"
                    title="Mijozni tahrirlash"
                    class="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <Edit2 class="w-4 h-4" />
                  </button>

                  <!-- 5. Delete (O'chirish) -->
                  <button
                    type="button"
                    @click="confirmDeleteCustomer(c)"
                    title="Mijozni o'chirish"
                    class="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 transition"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 1. Create / Edit Customer Modal -->
    <div v-if="isCustomerModalOpen" @click.self="isCustomerModalOpen = false" class="modal-overlay">
      <div class="modal-container max-w-md" @click.stop>
        <div class="modal-header">
          <h3 class="text-base font-bold text-slate-900 dark:text-white">
            {{ editingCustomerId ? 'Mijoz Ma\'lumotlarini Tahrirlash' : 'Yangi Mijoz Qo\'shish' }}
          </h3>
          <button @click="isCustomerModalOpen = false" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"><X class="w-5 h-5" /></button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="saveCustomer" class="space-y-3.5 text-xs">
            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Mijoz Ism Familiyasi *</label>
              <input
                v-model="customerForm.fullName"
                required
                placeholder="Masalan: Jamshid Aliyev"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Telefon Raqami</label>
              <PhoneInput v-model="customerForm.phone" placeholder="90 123 45 67" />
            </div>

            <div v-if="!editingCustomerId">
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Boshlang'ich Qarz Summasi (agar mavjud bo'lsa)</label>
              <CurrencyInput
                v-model="customerForm.debt"
                placeholder="0"
                suffix="so'm"
                inputClass="font-bold text-rose-600 dark:text-rose-400"
              />
            </div>

            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Izoh / Eslatma</label>
              <textarea
                v-model="customerForm.notes"
                rows="2"
                placeholder="Mijoz haqida qo'shimcha ma'lumot (manzil, do'kon, qo'shimcha kontakt)..."
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              ></textarea>
            </div>

            <div class="pt-2">
              <AppButton
                type="submit"
                variant="primary"
                size="md"
                class="w-full"
                :loading="submitting"
              >
                {{ submitting ? 'Saqlanmoqda...' : (editingCustomerId ? 'O\'zgarishlarni Saqlash' : 'Mijozni Saqlash') }}
              </AppButton>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 2. Add Debt Modal (+ Qarz Kiritish) -->
    <div v-if="isAddDebtModalOpen" @click.self="isAddDebtModalOpen = false" class="modal-overlay">
      <div class="modal-container max-w-md" @click.stop>
        <div class="modal-header border-b border-rose-500/20">
          <div class="flex items-center gap-2">
            <div class="p-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <TrendingDown class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white">Qarz / Nasiya Kiritish</h3>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">Mijoz hisobiga yangi qarz yozish</p>
            </div>
          </div>
          <button @click="isAddDebtModalOpen = false" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"><X class="w-5 h-5" /></button>
        </div>

        <div class="modal-body space-y-4">
          <!-- Customer info card -->
          <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span class="text-xs text-slate-500 dark:text-slate-400 block">Mijoz:</span>
              <span class="font-bold text-sm text-slate-900 dark:text-white">{{ activeCustomer?.fullName }}</span>
            </div>
            <div class="text-right">
              <span class="text-xs text-slate-500 dark:text-slate-400 block">Joriy qarz:</span>
              <span class="font-black text-sm text-rose-600 dark:text-rose-400 font-mono">{{ formatCurrency(activeCustomer?.debt || 0) }}</span>
            </div>
          </div>

          <!-- Debt Amount Input -->
          <div>
            <label class="block font-bold text-xs text-slate-700 dark:text-slate-300 mb-1.5">Qo'shilayotgan Qarz Summasi *</label>
            <CurrencyInput
              v-model="debtAddAmount"
              placeholder="0"
              suffix="so'm"
              inputClass="font-bold text-rose-600 dark:text-rose-400 text-base"
            />
          </div>

          <!-- Quick Fill Buttons -->
          <div class="space-y-1.5">
            <span class="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Tezkor summalar:</span>
            <div class="flex flex-wrap gap-1.5">
              <button
                type="button"
                @click="debtAddAmount = (debtAddAmount || 0) + 20000"
                class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
              >
                +20 000 so'm
              </button>
              <button
                type="button"
                @click="debtAddAmount = (debtAddAmount || 0) + 50000"
                class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
              >
                +50 000 so'm
              </button>
              <button
                type="button"
                @click="debtAddAmount = (debtAddAmount || 0) + 100000"
                class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
              >
                +100 000 so'm
              </button>
              <button
                type="button"
                @click="debtAddAmount = (debtAddAmount || 0) + 500000"
                class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
              >
                +500 000 so'm
              </button>
            </div>
          </div>

          <!-- Reason / Notes -->
          <div>
            <label class="block font-bold text-xs text-slate-700 dark:text-slate-300 mb-1.5">Qarz Berish Sababi / Nasiya Tovarlar Izohi</label>
            <input
              v-model="debtAddNotes"
              placeholder="Masalan: Oziq-ovqat tovarlari, 2 ta yog', un..."
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-rose-500"
            />
          </div>

          <!-- Resulting total preview -->
          <div class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex justify-between items-center text-xs">
            <span class="text-rose-700 dark:text-rose-300 font-medium">Yangi umumiy qarz bo'ladi:</span>
            <span class="font-black font-mono text-rose-600 dark:text-rose-400 text-sm">
              {{ formatCurrency(Number(activeCustomer?.debt || 0) + Number(debtAddAmount || 0)) }}
            </span>
          </div>

          <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <AppButton
              variant="ghost"
              size="md"
              @click="isAddDebtModalOpen = false"
            >
              Bekor qilish
            </AppButton>
            <AppButton
              variant="danger"
              size="md"
              :loading="submitting"
              :disabled="!debtAddAmount || debtAddAmount <= 0"
              @click="submitAddDebt"
            >
              Qarzni Kiritish
            </AppButton>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. Pay Debt Modal (Qarz To'lovini Qabul Qilish) -->
    <div v-if="isPayDebtModalOpen" @click.self="isPayDebtModalOpen = false" class="modal-overlay">
      <div class="modal-container max-w-md" @click.stop>
        <div class="modal-header border-b border-emerald-500/20">
          <div class="flex items-center gap-2">
            <div class="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20">
              <CreditCard class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white">Qarz To'lovini Qabul Qilish</h3>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">Nasiya daftari bo'yicha to'lov kiritish</p>
            </div>
          </div>
          <button @click="isPayDebtModalOpen = false" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"><X class="w-5 h-5" /></button>
        </div>

        <div class="modal-body space-y-4">
          <!-- Customer info card -->
          <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span class="text-xs text-slate-500 dark:text-slate-400 block">Mijoz:</span>
              <span class="font-bold text-sm text-slate-900 dark:text-white">{{ activeCustomer?.fullName }}</span>
            </div>
            <div class="text-right">
              <span class="text-xs text-slate-500 dark:text-slate-400 block">Mavjud qarz:</span>
              <span class="font-black text-sm text-rose-600 dark:text-rose-400 font-mono">{{ formatCurrency(activeCustomer?.debt || 0) }}</span>
            </div>
          </div>

          <!-- Payment Amount with CurrencyInput -->
          <div>
            <label class="block font-bold text-xs text-slate-700 dark:text-slate-300 mb-1.5">To'lanayotgan Summa *</label>
            <CurrencyInput
              v-model="debtPayAmount"
              placeholder="0"
              suffix="so'm"
              inputClass="font-bold text-emerald-600 dark:text-emerald-400 text-base"
            />
          </div>

          <!-- Quick Fill Buttons -->
          <div class="space-y-1.5">
            <span class="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Tezkor to'lov variantlari:</span>
            <div class="flex flex-wrap gap-1.5">
              <button
                type="button"
                @click="debtPayAmount = Number(activeCustomer?.debt || 0)"
                class="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20 transition"
              >
                To'liq qarz ({{ formatCurrency(activeCustomer?.debt || 0) }})
              </button>
              <button
                v-if="Number(activeCustomer?.debt) > 50000"
                type="button"
                @click="debtPayAmount = 50000"
                class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
              >
                50 000 so'm
              </button>
              <button
                v-if="Number(activeCustomer?.debt) > 100000"
                type="button"
                @click="debtPayAmount = 100000"
                class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
              >
                100 000 so'm
              </button>
            </div>
          </div>

          <!-- Notes -->
          <div>
            <label class="block font-bold text-xs text-slate-700 dark:text-slate-300 mb-1.5">Izoh / To'lov tafsiloti</label>
            <input
              v-model="debtPayNotes"
              placeholder="Masalan: Naqd pulda berdi yoki Karta orqali o'tkazdi"
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <!-- Remaining debt preview -->
          <div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex justify-between items-center text-xs">
            <span class="text-emerald-700 dark:text-emerald-300 font-medium">To'lovdan keyin qoladigan qarz:</span>
            <span class="font-black font-mono text-emerald-600 dark:text-emerald-400 text-sm">
              {{ formatCurrency(Math.max(0, Number(activeCustomer?.debt || 0) - Number(debtPayAmount || 0))) }}
            </span>
          </div>

          <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <AppButton
              variant="ghost"
              size="md"
              @click="isPayDebtModalOpen = false"
            >
              Bekor qilish
            </AppButton>
            <AppButton
              variant="primary"
              size="md"
              :loading="submitting"
              :disabled="!debtPayAmount || debtPayAmount <= 0"
              @click="submitPayDebt"
            >
              To'lovni Qabul Qilish
            </AppButton>
          </div>
        </div>
      </div>
    </div>

    <!-- 4. Customer History & Debt Journal Modal -->
    <div v-if="isHistoryModalOpen" @click.self="isHistoryModalOpen = false" class="modal-overlay">
      <div class="modal-container max-w-2xl" @click.stop>
        <div class="modal-header">
          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <History class="w-4 h-4 text-emerald-500" />
              <span>Mijoz Tarixi: {{ activeCustomer?.fullName }}</span>
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Xaridlar va Nasiya daftari yozuvlari</p>
          </div>
          <button @click="isHistoryModalOpen = false" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"><X class="w-5 h-5" /></button>
        </div>

        <div class="modal-body space-y-4">
          <!-- Summary card -->
          <div class="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs">
            <div>
              <span class="text-slate-400 block">Joriy Qarz:</span>
              <span class="font-black text-rose-600 dark:text-rose-400 font-mono text-sm">
                {{ formatCurrency(activeCustomer?.debt || 0) }}
              </span>
            </div>
            <div>
              <span class="text-slate-400 block">Jami Xarid:</span>
              <span class="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                {{ formatCurrency(activeCustomer?.totalSpent || 0) }}
              </span>
            </div>
            <div>
              <span class="text-slate-400 block">Xaridlar Soni:</span>
              <span class="font-bold text-slate-900 dark:text-white font-mono text-sm">
                {{ activeCustomer?.totalPurchases || 0 }} ta
              </span>
            </div>
          </div>

          <!-- Notes / Debt Journal Log -->
          <div v-if="activeCustomer?.notes" class="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1.5">
            <span class="font-bold text-amber-700 dark:text-amber-400 block uppercase text-[10px] tracking-wider">
              Nasiya Daftari / Izohlar Tarixi:
            </span>
            <pre class="font-mono text-[11px] text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{{ activeCustomer.notes }}</pre>
          </div>

          <!-- Orders History -->
          <div class="space-y-2">
            <h4 class="font-bold text-xs text-slate-700 dark:text-slate-300">Oxirgi Xarid Cheklari:</h4>
            <div v-if="customerOrdersLoading" class="py-4 text-center text-xs text-slate-400">
              Yuklanmoqda...
            </div>
            <div v-else-if="customerOrders.length === 0" class="py-6 text-center text-xs text-slate-400">
              Ushbu mijoz bo'yicha xaridlar topilmadi
            </div>
            <div v-else class="space-y-2 max-h-60 overflow-y-auto pr-1 text-xs font-mono">
              <div
                v-for="ord in customerOrders"
                :key="ord.id"
                class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
              >
                <div>
                  <div class="font-bold text-slate-900 dark:text-white font-sans flex items-center gap-2">
                    <span>Chek {{ ord.orderNumber }}</span>
                    <span class="text-[10px] text-slate-400">{{ formatDate(ord.createdAt) }}</span>
                  </div>
                  <div class="text-[11px] text-slate-500 mt-0.5">
                    {{ ord.items?.map((i: any) => `${i.product?.name || i.service?.name} (${i.quantity}x)`).join(', ') }}
                  </div>
                </div>
                <div class="text-right">
                  <div class="font-black text-slate-900 dark:text-white font-mono">
                    {{ formatCurrency(ord.total) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <AppButton variant="secondary" size="md" @click="isHistoryModalOpen = false">
            Yopish
          </AppButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../services/api';
import { useFormat } from '../../composables/useFormat';
import {
  Plus,
  X,
  Search,
  CreditCard,
  TrendingDown,
  Users,
  AlertCircle,
  DollarSign,
  Edit2,
  Trash2,
  History,
} from 'lucide-vue-next';
import SkeletonLoader from '../../components/SkeletonLoader.vue';
import AppButton from '../../components/AppButton.vue';
import AppInput from '../../components/AppInput.vue';
import CurrencyInput from '../../components/CurrencyInput.vue';
import { useDataStore } from '../../stores/data.store';
import { useToast } from '../../composables/useToast';
import { cleanUzbekPhone, formatUzbekPhone } from '../../composables/usePhoneMask';
import PhoneInput from '../../components/PhoneInput.vue';

const toast = useToast();
const dataStore = useDataStore();
const { formatCurrency, formatDate } = useFormat();

const loading = ref(false);
const submitting = ref(false);
const searchQuery = ref('');
const activeFilter = ref<'all' | 'debtors' | 'clear'>('all');
const customers = computed(() => dataStore.customers || []);

// Customer Form (Create/Edit)
const isCustomerModalOpen = ref(false);
const editingCustomerId = ref<string | null>(null);
const customerForm = ref({
  fullName: '',
  phone: '+998 ',
  notes: '',
  debt: 0,
});

// Add Debt State
const isAddDebtModalOpen = ref(false);
const debtAddAmount = ref<number>(0);
const debtAddNotes = ref('');

// Pay Debt State
const isPayDebtModalOpen = ref(false);
const debtPayAmount = ref<number>(0);
const debtPayNotes = ref('');

// History Modal State
const isHistoryModalOpen = ref(false);
const activeCustomer = ref<any | null>(null);
const customerOrders = ref<any[]>([]);
const customerOrdersLoading = ref(false);

// KPI Computations
const totalDebtAmount = computed(() => {
  return customers.value.reduce((sum, c) => sum + Number(c.debt || 0), 0);
});

const debtorCustomersCount = computed(() => {
  return customers.value.filter((c) => Number(c.debt || 0) > 0).length;
});

const totalCustomersSpent = computed(() => {
  return customers.value.reduce((sum, c) => sum + Number(c.totalSpent || 0), 0);
});

// Filtered List
const filteredCustomers = computed(() => {
  let list = customers.value;

  if (activeFilter.value === 'debtors') {
    list = list.filter((c) => Number(c.debt || 0) > 0);
  } else if (activeFilter.value === 'clear') {
    list = list.filter((c) => Number(c.debt || 0) <= 0);
  }

  if (!searchQuery.value.trim()) return list;
  const q = searchQuery.value.toLowerCase().trim();
  return list.filter((c) => {
    return c.fullName.toLowerCase().includes(q) || (c.phone && c.phone.includes(q));
  });
});

const loadCustomers = async (force = false) => {
  if (dataStore.customers.length === 0) {
    loading.value = true;
  }
  try {
    await dataStore.fetchCustomers(force);
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// 1. Create / Edit handlers
const openCreateModal = () => {
  editingCustomerId.value = null;
  customerForm.value = {
    fullName: '',
    phone: '+998 ',
    notes: '',
    debt: 0,
  };
  isCustomerModalOpen.value = true;
};

const openEditModal = (c: any) => {
  editingCustomerId.value = c.id;
  customerForm.value = {
    fullName: c.fullName,
    phone: c.phone || '+998 ',
    notes: c.notes || '',
    debt: Number(c.debt) || 0,
  };
  isCustomerModalOpen.value = true;
};

const saveCustomer = async () => {
  if (!customerForm.value.fullName.trim()) {
    toast.warning('Mijoz ismini kiriting', 'Mijoz');
    return;
  }
  submitting.value = true;
  try {
    const cleanPhone = customerForm.value.phone ? cleanUzbekPhone(customerForm.value.phone) : undefined;
    if (editingCustomerId.value) {
      await api.put(`/customers/${editingCustomerId.value}`, {
        fullName: customerForm.value.fullName.trim(),
        phone: cleanPhone,
        notes: customerForm.value.notes,
      });
      toast.success('Mijoz ma\'lumotlari yangilandi!', 'CRM');
    } else {
      await api.post('/customers', {
        fullName: customerForm.value.fullName.trim(),
        phone: cleanPhone,
        notes: customerForm.value.notes,
        debt: Number(customerForm.value.debt) || 0,
      });
      toast.success(`"${customerForm.value.fullName}" mijozlar bazasiga qo'shildi!`, 'CRM');
    }
    isCustomerModalOpen.value = false;
    dataStore.invalidate('customers');
    loadCustomers(true);
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Mijozni saqlashda xatolik yuz berdi', 'Xatolik');
  } finally {
    submitting.value = false;
  }
};

// 2. Add Debt handlers
const openAddDebtModal = (c: any) => {
  activeCustomer.value = c;
  debtAddAmount.value = 0;
  debtAddNotes.value = '';
  isAddDebtModalOpen.value = true;
};

const submitAddDebt = async () => {
  if (!activeCustomer.value) return;
  if (!debtAddAmount.value || debtAddAmount.value <= 0) {
    toast.warning('Qarz summasini to\'g\'ri kiriting', 'Nasiya / Qarz');
    return;
  }

  submitting.value = true;
  try {
    await api.post(`/customers/${activeCustomer.value.id}/add-debt`, {
      amount: Number(debtAddAmount.value),
      notes: debtAddNotes.value || undefined,
    });
    toast.success(
      `"${activeCustomer.value.fullName}" hisobiga ${formatCurrency(debtAddAmount.value)} qarz kiritildi!`,
      'Nasiya Daftari'
    );
    isAddDebtModalOpen.value = false;
    dataStore.invalidate('customers');
    loadCustomers(true);
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Qarz kiritishda xatolik yuz berdi', 'Xatolik');
  } finally {
    submitting.value = false;
  }
};

// 3. Pay Debt handlers
const openPayDebtModal = (c: any) => {
  activeCustomer.value = c;
  debtPayAmount.value = Number(c.debt) || 0;
  debtPayNotes.value = '';
  isPayDebtModalOpen.value = true;
};

const submitPayDebt = async () => {
  if (!activeCustomer.value) return;
  if (!debtPayAmount.value || debtPayAmount.value <= 0) {
    toast.warning('To\'lov summasini to\'g\'ri kiriting', 'Qarz To\'lovi');
    return;
  }

  submitting.value = true;
  try {
    await api.post(`/customers/${activeCustomer.value.id}/pay-debt`, {
      amount: Number(debtPayAmount.value),
      notes: debtPayNotes.value || undefined,
    });
    toast.success(
      `"${activeCustomer.value.fullName}" uchun ${formatCurrency(debtPayAmount.value)} qarz to'lovi qabul qilindi!`,
      'Qarz Daftari'
    );
    isPayDebtModalOpen.value = false;
    dataStore.invalidate('customers');
    dataStore.invalidate('finance');
    dataStore.invalidate('dashboard');
    loadCustomers(true);
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Qarz to\'lovini kiritishda xatolik yuz berdi', 'Xatolik');
  } finally {
    submitting.value = false;
  }
};

// 4. History modal handler
const openHistoryModal = async (c: any) => {
  activeCustomer.value = c;
  isHistoryModalOpen.value = true;
  customerOrdersLoading.value = true;
  try {
    const { data } = await api.get(`/customers/${c.id}`);
    customerOrders.value = data.orders || [];
    if (data.notes) {
      activeCustomer.value.notes = data.notes;
    }
  } catch (err) {
    console.error(err);
  } finally {
    customerOrdersLoading.value = false;
  }
};

// 5. Delete Customer
const confirmDeleteCustomer = async (c: any) => {
  if (!confirm(`"${c.fullName}" mijozini o'chirishni tasdiqlaysizmi?`)) return;
  try {
    await api.delete(`/customers/${c.id}`);
    toast.success('Mijoz muvaffaqiyatli o\'chirildi', 'CRM');
    dataStore.invalidate('customers');
    loadCustomers(true);
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Mijozni o\'chirishda xatolik yuz berdi', 'Xatolik');
  }
};

onMounted(() => {
  loadCustomers();
});
</script>
