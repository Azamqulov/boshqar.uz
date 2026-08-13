<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Ta'minotchilar va Xaridorlar Bazasi</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Mahsulot yetkazib beruvchilar, firmalar va hisob-kitoblar balansi</p>
      </div>

      <div class="flex items-center gap-2">
        <AppButton
          variant="primary"
          size="md"
          :icon="Plus"
          @click="openCreateModal"
        >
          Yangi Ta'minotchi Qo'shish
        </AppButton>
      </div>
    </div>

    <!-- Quick Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <AppStatCard
        title="Jami Ta'minotchilar"
        :value="`${suppliers.length} ta`"
        subtitle="Firmalar va yetkazib beruvchilar"
        :icon="Truck"
        variant="blue"
      />

      <AppStatCard
        title="Bizning Qarzimiz (Ta'minotga)"
        :value="formatCurrency(totalSupplierDebt)"
        subtitle="Ta'minotchilardan qarzlar"
        :icon="TrendingDown"
        variant="rose"
      />

      <AppStatCard
        title="Qarzdor Ta'minotchilar"
        :value="`${debtorSuppliersCount} ta`"
        subtitle="Haqdor yetkazib beruvchilar"
        :icon="AlertCircle"
        variant="amber"
      />

      <AppStatCard
        title="Hisob-kitobi Yo'qotilgan"
        :value="`${settledSuppliersCount} ta`"
        subtitle="Balansi yopilgan firmalar"
        :icon="CheckCircle2"
        variant="emerald"
      />
    </div>

    <!-- Filters & Search Bar -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <!-- Search Input -->
      <div class="w-full sm:w-80">
        <AppInput
          v-model="searchQuery"
          placeholder="Ta'minotchi nomi, firma yoki tel..."
          :icon="Search"
        />
      </div>

      <div class="flex items-center gap-2">
        <!-- Filter Tabs -->
        <div class="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
          <button
            type="button"
            @click="activeFilter = 'all'"
            class="px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap btn-interactive"
            :class="activeFilter === 'all' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
          >
            Barchasi ({{ suppliers.length }})
          </button>
          <button
            type="button"
            @click="activeFilter = 'debtors'"
            class="px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 btn-interactive"
            :class="activeFilter === 'debtors' ? 'bg-rose-500 text-white shadow-sm' : 'text-rose-600 dark:text-rose-400 hover:bg-rose-500/10'"
          >
            <AlertCircle class="w-3.5 h-3.5" />
            <span>Qarzdorlar ({{ debtorSuppliersCount }})</span>
          </button>
          <button
            type="button"
            @click="activeFilter = 'clear'"
            class="px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap btn-interactive"
            :class="activeFilter === 'clear' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
          >
            Qarzsiz (Nol)
          </button>
        </div>

        <!-- View Mode Toggle -->
        <AppViewToggle v-model="viewMode" />
      </div>
    </div>

    <!-- Table Skeleton -->
    <SkeletonLoader v-if="loading" variant="table" :rows="6" />

    <!-- 1. Table View -->
    <div v-else-if="viewMode === 'table'" class="glass-card rounded-2xl overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-semibold">
            <tr>
              <th class="py-3.5 px-4">Ta'minotchi / Firma</th>
              <th class="py-3.5 px-4">Telefon</th>
              <th class="py-3.5 px-4">Manzil</th>
              <th class="py-3.5 px-4">Bizning Balans / Qarzimiz</th>
              <th class="py-3.5 px-4">Izoh</th>
              <th class="py-3.5 px-4 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
            <tr v-if="filteredSuppliers.length === 0">
              <td colspan="6" class="py-12 text-center text-slate-400 dark:text-slate-500">
                <Truck class="w-8 h-8 mx-auto mb-2 opacity-30" />
                <span>Ta'minotchilar topilmadi</span>
              </td>
            </tr>
            <tr
              v-for="s in filteredSuppliers"
              :key="s.id"
              class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition group"
            >
              <!-- Name & Company -->
              <td class="py-3.5 px-4">
                <div class="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 class="w-4 h-4 text-blue-500 shrink-0" />
                  <span>{{ s.name }}</span>
                </div>
                <div v-if="s.companyName" class="text-[11px] text-slate-500 dark:text-slate-400 font-medium pl-6">
                  {{ s.companyName }}
                </div>
              </td>

              <!-- Phone -->
              <td class="py-3.5 px-4 font-mono font-medium">
                <div v-if="s.phone" class="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <Phone class="w-3.5 h-3.5 text-slate-400" />
                  <span>{{ s.phone }}</span>
                </div>
                <span v-else class="text-slate-400 dark:text-slate-600">—</span>
              </td>

              <!-- Address -->
              <td class="py-3.5 px-4">
                <div v-if="s.address" class="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <MapPin class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span class="truncate max-w-[180px]">{{ s.address }}</span>
                </div>
                <span v-else class="text-slate-400 dark:text-slate-600">—</span>
              </td>

              <!-- Balance / Debt -->
              <td class="py-3.5 px-4 font-mono">
                <div
                  class="font-black inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs"
                  :class="[
                    Number(s.balance) > 0
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      : Number(s.balance) < 0
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  ]"
                >
                  <AlertCircle v-if="Number(s.balance) > 0" class="w-3.5 h-3.5" />
                  <span>{{ formatCurrency(Math.abs(Number(s.balance))) }}</span>
                  <span v-if="Number(s.balance) > 0" class="text-[10px] uppercase font-bold ml-1">(Qarzimiz)</span>
                  <span v-else-if="Number(s.balance) < 0" class="text-[10px] uppercase font-bold ml-1">(Haqdoriz)</span>
                  <span v-else class="text-[10px] uppercase font-bold ml-1">(Nol)</span>
                </div>
              </td>

              <!-- Notes -->
              <td class="py-3.5 px-4 max-w-[200px]">
                <p v-if="s.notes" class="truncate text-slate-500 dark:text-slate-400 text-xs" :title="s.notes">
                  {{ s.notes }}
                </p>
                <span v-else class="text-slate-400 dark:text-slate-600">—</span>
              </td>

              <!-- Actions -->
              <td class="py-3.5 px-4 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <!-- Pay Debt button -->
                  <button
                    v-if="Number(s.balance) > 0"
                    type="button"
                    @click="openPayModal(s)"
                    class="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition flex items-center gap-1 btn-interactive"
                    title="Ta'minotchiga to'lov qilish"
                  >
                    <CreditCard class="w-3.5 h-3.5" />
                    <span>To'lov Berish</span>
                  </button>

                  <!-- Payment History button -->
                  <button
                    type="button"
                    @click="openHistoryModal(s)"
                    class="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
                    title="To'lov tarixi"
                  >
                    <History class="w-4 h-4" />
                  </button>

                  <!-- Edit button -->
                  <button
                    type="button"
                    @click="openEditModal(s)"
                    class="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Tahrirlash"
                  >
                    <Edit class="w-4 h-4" />
                  </button>

                  <!-- Delete button -->
                  <button
                    type="button"
                    @click="confirmDeleteSupplier(s)"
                    class="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    title="O'chirish"
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

    <!-- 2. Grid/Cards View -->
    <div v-else-if="viewMode === 'grid'">
      <div v-if="filteredSuppliers.length === 0" class="glass-card rounded-2xl p-12 text-center text-slate-400 dark:text-slate-500">
        <Truck class="w-10 h-10 mx-auto mb-2 opacity-30" />
        <span>Ta'minotchilar topilmadi</span>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div
          v-for="s in filteredSuppliers"
          :key="s.id"
          class="glass-card rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90"
        >
          <div>
            <div class="flex items-start justify-between gap-2 mb-3">
              <div class="flex items-center gap-2.5">
                <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 font-black text-sm flex items-center justify-center shrink-0">
                  <Building2 class="w-5 h-5" />
                </div>
                <div>
                  <h4 class="font-black text-sm text-slate-900 dark:text-white line-clamp-1">
                    {{ s.name }}
                  </h4>
                  <p v-if="s.companyName" class="text-[11px] text-slate-500 line-clamp-1">
                    {{ s.companyName }}
                  </p>
                </div>
              </div>
            </div>

            <div class="space-y-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs">
              <div v-if="s.phone" class="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <Phone class="w-3.5 h-3.5 text-slate-400" />
                <span class="font-mono">{{ s.phone }}</span>
              </div>
              <div v-if="s.address" class="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <MapPin class="w-3.5 h-3.5 text-slate-400" />
                <span class="truncate">{{ s.address }}</span>
              </div>
              <div class="flex justify-between items-center pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                <span class="text-slate-400">Bizning Qarz:</span>
                <span class="font-black font-mono" :class="Number(s.balance) > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'">
                  {{ formatCurrency(Number(s.balance || 0)) }}
                </span>
              </div>
            </div>
          </div>

          <div class="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            <div class="flex items-center gap-1.5">
              <button
                v-if="Number(s.balance) > 0"
                type="button"
                @click="openPayModal(s)"
                class="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition flex items-center gap-1 btn-interactive"
              >
                <CreditCard class="w-3.5 h-3.5" />
                <span>To'lov Berish</span>
              </button>
              <span v-else class="text-[11px] text-slate-400 italic">Qarzsiz</span>
            </div>

            <div class="flex items-center gap-1">
              <button
                @click="openHistoryModal(s)"
                class="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
                title="To'lov tarixi"
              >
                <History class="w-3.5 h-3.5" />
              </button>
              <button
                @click="openEditModal(s)"
                class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
                title="Tahrirlash"
              >
                <Edit class="w-4 h-4" />
              </button>
              <button
                @click="confirmDeleteSupplier(s)"
                class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                title="O'chirish"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal 1: Create / Edit Supplier -->
    <Teleport to="body">
      <div v-if="isCreateModalOpen" @click.self="isCreateModalOpen = false" class="modal-overlay">
        <div class="modal-container max-w-md" @click.stop>
          <div class="modal-header">
            <div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white">
                {{ editingSupplier ? "Ta'minotchi Ma'lumotlarini Tahrirlash" : "Yangi Ta'minotchi Qo'shish" }}
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">Yetkazib beruvchi firmasi va kontakt ma'lumotlari</p>
            </div>
            <button @click="isCreateModalOpen = false" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition">
              <X class="w-5 h-5" />
            </button>
          </div>

          <form @submit.prevent="saveSupplier" class="modal-body space-y-4">
            <div>
              <label class="block font-bold text-xs text-slate-700 dark:text-slate-300 mb-1">Mas'ul Shaxs Nomi (F.I.SH) *</label>
              <AppInput v-model="formData.name" placeholder="Masalan: Alisher Navoiy" required />
            </div>

            <div>
              <label class="block font-bold text-xs text-slate-700 dark:text-slate-300 mb-1">Kompaniya / Firma Nomi</label>
              <AppInput v-model="formData.companyName" placeholder="Masalan: OOO Food Logistics" />
            </div>

            <div>
              <label class="block font-bold text-xs text-slate-700 dark:text-slate-300 mb-1">Telefon Raqami (+998)</label>
              <PhoneInput v-model="formData.phone" placeholder="90 123 45 67" />
            </div>

            <div>
              <label class="block font-bold text-xs text-slate-700 dark:text-slate-300 mb-1">Manzil</label>
              <AppInput v-model="formData.address" placeholder="Toshkent shahri, Sergeli t-n" />
            </div>

            <div v-if="!editingSupplier">
              <label class="block font-bold text-xs text-slate-700 dark:text-slate-300 mb-1">Dastlabki Qarz / Balans (so'm)</label>
              <CurrencyInput
                v-model="formData.balance"
                placeholder="0"
                suffix="so'm"
                inputClass="font-bold text-rose-600 dark:text-rose-400"
              />
              <span class="text-[11px] text-slate-400 mt-1 block">Musbat summa — bizning ta'minotchiga qarzimizni bildiradi</span>
            </div>

            <div>
              <label class="block font-bold text-xs text-slate-700 dark:text-slate-300 mb-1">Izoh / Qo'shimcha qaydlar</label>
              <textarea
                v-model="formData.notes"
                rows="3"
                placeholder="Yetkazib berish shartlari, grafik..."
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
              ></textarea>
            </div>

            <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <AppButton variant="ghost" size="md" @click="isCreateModalOpen = false" type="button">
                Bekor qilish
              </AppButton>
              <AppButton variant="primary" size="md" :loading="submitting" type="submit">
                {{ editingSupplier ? "Saqlash" : "Qo'shish" }}
              </AppButton>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal 2: Pay Supplier -->
    <Teleport to="body">
      <div v-if="isPayModalOpen" @click.self="isPayModalOpen = false" class="modal-overlay">
        <div class="modal-container max-w-md" @click.stop>
          <div class="modal-header">
            <div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard class="w-4 h-4 text-emerald-500" />
                <span>Ta'minotchiga To'lov Berish</span>
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">Bizning ta'minotchi oldidagi qarzimizni yopish</p>
            </div>
            <button @click="isPayModalOpen = false" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition">
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="modal-body space-y-4">
            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <div>
                <span class="text-xs text-slate-500 dark:text-slate-400 block">Ta'minotchi:</span>
                <span class="font-bold text-sm text-slate-900 dark:text-white">{{ activeSupplier?.name }}</span>
                <span v-if="activeSupplier?.companyName" class="text-xs text-slate-500 block">({{ activeSupplier?.companyName }})</span>
              </div>
              <div class="text-right">
                <span class="text-xs text-slate-500 dark:text-slate-400 block">Mavjud Qarzimiz:</span>
                <span class="font-black text-sm text-rose-600 dark:text-rose-400 font-mono">
                  {{ formatCurrency(Number(activeSupplier?.balance || 0)) }}
                </span>
              </div>
            </div>

            <div>
              <label class="block font-bold text-xs text-slate-700 dark:text-slate-300 mb-1.5">To'lanayotgan Summa *</label>
              <CurrencyInput
                v-model="payAmount"
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
                  @click="payAmount = Number(activeSupplier?.balance || 0)"
                  class="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20 transition"
                >
                  To'liq qarz ({{ formatCurrency(Number(activeSupplier?.balance || 0)) }})
                </button>
                <button
                  v-if="Number(activeSupplier?.balance) > 100000"
                  type="button"
                  @click="payAmount = 100000"
                  class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
                >
                  100 000 so'm
                </button>
                <button
                  v-if="Number(activeSupplier?.balance) > 500000"
                  type="button"
                  @click="payAmount = 500000"
                  class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
                >
                  500 000 so'm
                </button>
                <button
                  v-if="Number(activeSupplier?.balance) > 1000000"
                  type="button"
                  @click="payAmount = 1000000"
                  class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
                >
                  1 000 000 so'm
                </button>
              </div>
            </div>

            <!-- Remaining debt preview -->
            <div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex justify-between items-center text-xs">
              <span class="text-emerald-700 dark:text-emerald-300 font-medium">To'lovdan keyin qoladigan qarzimiz:</span>
              <span class="font-black font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                {{ formatCurrency(Math.max(0, Number(activeSupplier?.balance || 0) - Number(payAmount || 0))) }}
              </span>
            </div>

            <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <AppButton variant="ghost" size="md" @click="isPayModalOpen = false">
                Bekor qilish
              </AppButton>
              <AppButton
                variant="primary"
                size="md"
                :loading="submitting"
                :disabled="!payAmount || payAmount <= 0"
                @click="submitPay"
              >
                To'lovni Bajarish
              </AppButton>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal 3: Payment History -->
    <Teleport to="body">
      <div v-if="isHistoryModalOpen" @click.self="isHistoryModalOpen = false" class="modal-overlay">
        <div class="modal-container max-w-lg" @click.stop>
          <div class="modal-header">
            <div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <History class="w-4 h-4 text-blue-500" />
                <span>To'lov Tarixi</span>
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">{{ historySupplier?.name }} — barcha to'lovlar ro'yxati</p>
            </div>
            <button @click="isHistoryModalOpen = false" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"><X class="w-5 h-5" /></button>
          </div>

          <div class="modal-body">
            <!-- Summary Card -->
            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <div>
                <span class="text-xs text-slate-500 dark:text-slate-400 block">Ta'minotchi:</span>
                <span class="font-bold text-sm text-slate-900 dark:text-white">{{ historySupplier?.name }}</span>
                <span v-if="historySupplier?.companyName" class="text-xs text-slate-500 block">({{ historySupplier?.companyName }})</span>
              </div>
              <div class="text-right">
                <span class="text-xs text-slate-500 dark:text-slate-400 block">Joriy Qarzimiz:</span>
                <span class="font-black text-sm font-mono" :class="Number(historySupplier?.balance) > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'">
                  {{ formatCurrency(Number(historySupplier?.balance || 0)) }}
                </span>
              </div>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-2 gap-3">
              <div class="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
                <span class="text-xs text-blue-600 dark:text-blue-400 block mb-0.5">Jami to'lovlar soni</span>
                <span class="font-black text-lg text-blue-700 dark:text-blue-300">{{ paymentHistory.length }} ta</span>
              </div>
              <div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <span class="text-xs text-emerald-600 dark:text-emerald-400 block mb-0.5">Jami to'langan</span>
                <span class="font-black text-lg text-emerald-700 dark:text-emerald-300 font-mono">{{ formatCurrency(totalPaid) }}</span>
              </div>
            </div>

            <!-- Loading -->
            <div v-if="historyLoading" class="py-8 text-center space-y-2">
              <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center mx-auto shadow-sm">
                <RefreshCw class="w-5 h-5 animate-spin stroke-[2.2]" />
              </div>
              <span class="text-xs text-slate-500 font-medium block">To'lovlar yuklanmoqda...</span>
            </div>

            <!-- Empty State -->
            <div v-else-if="paymentHistory.length === 0" class="py-8 text-center">
              <CreditCard class="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p class="text-xs text-slate-400 dark:text-slate-500">Hali to'lovlar amalga oshirilmagan</p>
            </div>

            <!-- Payment History Timeline -->
            <div v-else class="space-y-2 max-h-72 overflow-y-auto pr-1">
              <div
                v-for="(p, idx) in paymentHistory"
                :key="p.id"
                class="flex gap-3 p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-blue-500/40 transition group text-xs"
              >
                <!-- Index -->
                <div class="w-7 h-7 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-black flex items-center justify-center shrink-0 text-[10px]">
                  {{ paymentHistory.length - idx }}
                </div>

                <!-- Details -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-2 mb-1">
                    <span class="font-black text-emerald-600 dark:text-emerald-400 font-mono">{{ formatCurrency(Number(p.amount)) }}</span>
                    <span class="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">{{ formatDate(p.createdAt) }}</span>
                  </div>
                  <div class="flex items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400">
                    <span>Oldin: <b class="font-mono text-rose-500">{{ formatCurrency(Number(p.balanceBefore)) }}</b></span>
                    <span>→</span>
                    <span>Keyin: <b class="font-mono" :class="Number(p.balanceAfter) > 0 ? 'text-rose-500' : 'text-emerald-500'">{{ formatCurrency(Number(p.balanceAfter)) }}</b></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Confirm Delete Dialog -->
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
import { ref, computed, onMounted } from 'vue';
import {
  Truck,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Search,
  Plus,
  Edit,
  CreditCard,
  Building2,
  Phone,
  MapPin,
  X,
  History,
  Trash2,
  RefreshCw,
} from 'lucide-vue-next';
import AppButton from '../../components/AppButton.vue';
import AppInput from '../../components/AppInput.vue';
import SkeletonLoader from '../../components/SkeletonLoader.vue';
import AppStatCard from '../../components/AppStatCard.vue';
import AppViewToggle from '../../components/AppViewToggle.vue';
import AppConfirmDialog from '../../components/AppConfirmDialog.vue';
import PhoneInput from '../../components/PhoneInput.vue';
import CurrencyInput from '../../components/CurrencyInput.vue';
import { useDataStore } from '../../stores/data.store';
import { useToast } from '../../composables/useToast';
import api, { getErrorMessage } from '../../services/api';

const toast = useToast();
const dataStore = useDataStore();

const viewMode = ref<'table' | 'grid'>('table');
const loading = ref(false);
const submitting = ref(false);
const searchQuery = ref('');
const activeFilter = ref<'all' | 'debtors' | 'clear'>('all');

const isCreateModalOpen = ref(false);
const isPayModalOpen = ref(false);
const isHistoryModalOpen = ref(false);

const editingSupplier = ref<any>(null);
const activeSupplier = ref<any>(null);
const historySupplier = ref<any>(null);
const payAmount = ref<number | null>(null);
const paymentHistory = ref<any[]>([]);
const historyLoading = ref(false);

const formData = ref({
  name: '',
  companyName: '',
  phone: '',
  address: '',
  balance: 0,
  notes: '',
});

const suppliers = computed(() => dataStore.suppliers || []);

const totalSupplierDebt = computed(() => {
  return suppliers.value.reduce((acc, s) => acc + Math.max(0, Number(s.balance || 0)), 0);
});

const debtorSuppliersCount = computed(() => {
  return suppliers.value.filter((s) => Number(s.balance || 0) > 0).length;
});

const settledSuppliersCount = computed(() => {
  return suppliers.value.filter((s) => Number(s.balance || 0) <= 0).length;
});

const filteredSuppliers = computed(() => {
  let list = [...suppliers.value];

  if (activeFilter.value === 'debtors') {
    list = list.filter((s) => Number(s.balance || 0) > 0);
  } else if (activeFilter.value === 'clear') {
    list = list.filter((s) => Number(s.balance || 0) <= 0);
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.companyName?.toLowerCase().includes(q) ||
        s.phone?.includes(q)
    );
  }

  return list;
});

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('uz-UZ').format(Math.round(val)) + " so'm";
};

const fetchSuppliers = async (force = false) => {
  if (suppliers.value.length === 0) {
    loading.value = true;
  }
  try {
    await dataStore.fetchSuppliers(force);
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  editingSupplier.value = null;
  formData.value = {
    name: '',
    companyName: '',
    phone: '',
    address: '',
    balance: 0,
    notes: '',
  };
  isCreateModalOpen.value = true;
};

const openEditModal = (s: any) => {
  editingSupplier.value = s;
  formData.value = {
    name: s.name || '',
    companyName: s.companyName || '',
    phone: s.phone || '',
    address: s.address || '',
    balance: Number(s.balance || 0),
    notes: s.notes || '',
  };
  isCreateModalOpen.value = true;
};

const saveSupplier = async () => {
  if (!formData.value.name.trim()) {
    toast.warning('Mas\'ul shaxs nomini kiriting', 'Ta\'minotchi');
    return;
  }
  submitting.value = true;
  try {
    if (editingSupplier.value) {
      await api.put(`/suppliers/${editingSupplier.value.id}`, {
        name: formData.value.name,
        companyName: formData.value.companyName,
        phone: formData.value.phone,
        address: formData.value.address,
        notes: formData.value.notes,
      });
      toast.success('Ta\'minotchi ma\'lumotlari yangilandi!', 'Ta\'minotchi');
    } else {
      await api.post('/suppliers', formData.value);
      toast.success('Yangi ta\'minotchi saqlandi!', 'Ta\'minotchi');
    }
    isCreateModalOpen.value = false;
    await dataStore.fetchSuppliers(true);
  } catch (err: any) {
    toast.error(getErrorMessage(err, 'Ta\'minotchini saqlashda xatolik yuz berdi'), 'Xatolik');
  } finally {
    submitting.value = false;
  }
};

const openPayModal = (s: any) => {
  activeSupplier.value = s;
  payAmount.value = Number(s.balance || 0);
  isPayModalOpen.value = true;
};

const totalPaid = computed(() => {
  return paymentHistory.value.reduce((acc: number, p: any) => acc + Number(p.amount || 0), 0);
});

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('uz-UZ', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};

const openHistoryModal = async (s: any) => {
  historySupplier.value = s;
  paymentHistory.value = [];
  isHistoryModalOpen.value = true;
  historyLoading.value = true;
  try {
    const res = await api.get(`/suppliers/${s.id}/payments`);
    paymentHistory.value = res.data;
  } catch (err: any) {
    toast.error(getErrorMessage(err, 'To\'lov tarixini yuklashda xatolik'), 'Xatolik');
  } finally {
    historyLoading.value = false;
  }
};

const submitPay = async () => {
  if (!activeSupplier.value || !payAmount.value || payAmount.value <= 0) return;
  submitting.value = true;
  try {
    await api.post(`/suppliers/${activeSupplier.value.id}/pay`, {
      amount: payAmount.value,
    });
    toast.success('To\'lov bajarildi!', 'To\'lov');
    isPayModalOpen.value = false;
    await dataStore.fetchSuppliers(true);
  } catch (err: any) {
    toast.error(getErrorMessage(err, 'To\'lovni amalga oshirishda xatolik'), 'Xatolik');
  } finally {
    submitting.value = false;
  }
};

const confirmModal = ref({
  open: false,
  title: '',
  message: '',
  onConfirm: () => {},
});

const confirmDeleteSupplier = (s: any) => {
  confirmModal.value = {
    open: true,
    title: `"${s.name}" ni o'chirishni tasdiqlang`,
    message: `Bu ta'minotchi va unga tegishli barcha to'lov tarixi o'chiriladi. Bu amalni qaytarib bo'lmaydi.`,
    onConfirm: () => deleteSupplier(s.id),
  };
};

const deleteSupplier = async (id: string) => {
  confirmModal.value.open = false;
  try {
    await api.delete(`/suppliers/${id}`);
    toast.success('Ta\'minotchi muvaffaqiyatli o\'chirildi!', 'O\'chirish');
    await dataStore.fetchSuppliers(true);
  } catch (err: any) {
    toast.error(getErrorMessage(err, 'Ta\'minotchini o\'chirishda xatolik'), 'Xatolik');
  }
};

onMounted(() => {
  fetchSuppliers();
});
</script>
