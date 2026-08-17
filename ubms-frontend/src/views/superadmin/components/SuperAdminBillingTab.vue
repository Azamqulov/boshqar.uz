<template>
  <div class="space-y-6">
    <!-- Section 1: SuperAdmin Payment Requisites Configuration -->
    <div class="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 class="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard class="w-5 h-5 text-emerald-500" />
            <span>To'lov Qabul Qilish Karta Rekvizitlari</span>
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Mijozlar obuna to'lovini amalga oshirishi uchun ko'rsatiladigan rasmiy karta va aloqa ma'lumotlari
          </p>
        </div>

        <button
          type="button"
          @click="saveRequisites"
          :disabled="savingRequisites"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition shadow-sm shadow-emerald-500/20 disabled:opacity-50"
        >
          <Save class="w-4 h-4" />
          <span>{{ savingRequisites ? 'Saqlanmoqda...' : 'Rekvizitlarni Saqlash' }}</span>
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Karta Raqami -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-700 dark:text-slate-300">
            Bank Karta Raqami (Uzcard / Humo) <span class="text-rose-500">*</span>
          </label>
          <input
            v-model="requisitesForm.cardNumber"
            type="text"
            placeholder="8600 0000 0000 0000"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <!-- Karta Egasi -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-700 dark:text-slate-300">
            Karta Egasi Ism-Familiyasi <span class="text-rose-500">*</span>
          </label>
          <input
            v-model="requisitesForm.cardHolder"
            type="text"
            placeholder="AZAMQULOV ALISHER"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <!-- Bank Nomi -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-700 dark:text-slate-300">
            Bank Nomi
          </label>
          <input
            v-model="requisitesForm.bankName"
            type="text"
            placeholder="Kapitalbank / TBC Bank"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <!-- Telefon Raqami -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-700 dark:text-slate-300">
            Bog'lanish Uchun Telefon
          </label>
          <input
            v-model="requisitesForm.phone"
            type="text"
            placeholder="+998 90 123 45 67"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <!-- Telegram Aloqa -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-700 dark:text-slate-300">
            Telegram Bot / Admin Username
          </label>
          <input
            v-model="requisitesForm.telegramContact"
            type="text"
            placeholder="@Boshqar_uzbot"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <!-- Status Toggle -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-700 dark:text-slate-300">
            To'lovlarni Qabul Qilish Holati
          </label>
          <div class="pt-1.5 flex items-center gap-3">
            <button
              type="button"
              @click="requisitesForm.isEnabled = !requisitesForm.isEnabled"
              :class="[
                'px-3.5 py-1.5 rounded-full text-xs font-bold border transition flex items-center gap-1.5',
                requisitesForm.isEnabled
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-300 dark:border-rose-800'
              ]"
            >
              <CheckCircle2 v-if="requisitesForm.isEnabled" class="w-3.5 h-3.5" />
              <XCircle v-else class="w-3.5 h-3.5" />
              <span>{{ requisitesForm.isEnabled ? 'To\'lovlar Faol (Yoqilgan)' : 'Vaqtincha To\'xtatilgan' }}</span>
            </button>
          </div>
        </div>

        <!-- To'lov Yo'riqnomasi -->
        <div class="md:col-span-2 lg:col-span-3 space-y-1.5">
          <label class="text-xs font-bold text-slate-700 dark:text-slate-300">
            Mijozlarga Ko'rsatiladigan Ko'rsatma / Izoh
          </label>
          <textarea
            v-model="requisitesForm.instructions"
            rows="2"
            placeholder="To'lovni amalga oshirgach, chek ma'lumotlarini kiritib yuboring..."
            class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs leading-relaxed focus:ring-2 focus:ring-emerald-500 outline-none"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Section 2: Billing Requests Queue -->
    <div class="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 class="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt class="w-5 h-5 text-emerald-500" />
            <span>Mijozlar To'lov So'rovlari ({{ filteredRequests.length }})</span>
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Kartadan to'lov qilib chek yuborgan mijozlar so'rovlari, qidiruv, filtrlash va obunani boshqarish
          </p>
        </div>

        <!-- Refresh Button -->
        <button
          type="button"
          @click="loadRequests"
          :disabled="loadingRequests"
          class="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
        >
          <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': loadingRequests }" />
          <span>Yangilash</span>
        </button>
      </div>

      <!-- Controls: Search & Filters Bar -->
      <div class="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <!-- 1. Search input -->
        <div class="relative flex-1">
          <Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Biznes nomi, egasi, telefon yoki to'lovchi bo'yicha qidiruv..."
            class="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500 transition font-medium"
          />
          <button
            v-if="searchQuery"
            type="button"
            @click="searchQuery = ''"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- 2. Plan Filter Dropdown with AppSelect -->
        <div class="w-full lg:w-56 shrink-0">
          <AppSelect
            v-model="filterPlan"
            :options="planFilterOptions"
            placeholder="Barcha Tariflar"
          />
        </div>
      </div>

      <!-- Status Tabs -->
      <div class="flex flex-wrap items-center gap-2 pt-0.5">
        <button
          v-for="st in [
            { id: 'all', label: 'Barchasi', count: requests.length },
            { id: 'pending', label: 'Kutilayotgan', count: countPending },
            { id: 'approved', label: 'Tasdiqlangan', count: countApproved },
            { id: 'rejected', label: 'Rad etilgan', count: countRejected }
          ]"
          :key="st.id"
          type="button"
          @click="filterStatus = st.id"
          :class="[
            'px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2',
            filterStatus === st.id
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          ]"
        >
          <span>{{ st.label }}</span>
          <span
            :class="[
              'px-2 py-0.5 rounded-full text-[11px] font-black',
              filterStatus === st.id
                ? 'bg-white/20 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            ]"
          >
            {{ st.count }}
          </span>
        </button>
      </div>

      <!-- Requests List / Table Loading Skeleton -->
      <div v-if="loadingRequests">
        <SkeletonLoader variant="table" text="To'lov so'rovlari yuklanmoqda..." />
      </div>

      <div v-else-if="filteredRequests.length === 0" class="py-12 text-center text-xs text-slate-400 space-y-2">
        <CheckCircle2 class="w-8 h-8 text-emerald-500 mx-auto opacity-70" />
        <p class="font-bold text-slate-600 dark:text-slate-300">To'lov so'rovlari topilmadi</p>
        <p v-if="searchQuery || filterStatus !== 'all' || filterPlan !== 'all'">
          Qidiruv yoki filtr mezonlarini o'zgartirib ko'ring.
        </p>
        <p v-else>Yangi to'lov so'rovlari kelganda shu yerda ko'rinadi.</p>
      </div>

      <div v-else class="space-y-3">
        <div class="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th class="py-3 px-4 w-[26%]">Biznes & Egasi</th>
                <th class="py-3 px-4 w-[14%]">Tarif & Muddat</th>
                <th class="py-3 px-4 w-[14%]">Summa</th>
                <th class="py-3 px-4 w-[18%]">To'lovchi & Chek</th>
                <th class="py-3 px-4 w-[12%]">Vaqti</th>
                <th class="py-3 px-4 w-[10%] text-center">Holat</th>
                <th class="py-3 px-4 text-right w-[6%]">Amallar</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr
                v-for="req in paginatedRequests"
                :key="req.id"
                class="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition group"
              >
                <!-- Biznes & Egasi -->
                <td class="py-3.5 px-4">
                  <p class="font-bold text-slate-900 dark:text-white leading-snug">{{ req.business?.name || 'Noma\'lum' }}</p>
                  <p class="text-[11px] text-slate-400 mt-0.5">{{ req.business?.owner?.fullName }} ({{ req.business?.owner?.phone }})</p>
                </td>

                <!-- Tarif & Muddat -->
                <td class="py-3.5 px-4">
                  <div class="inline-flex items-center gap-1.5">
                    <span
                      :class="[
                        'px-2.5 py-0.5 rounded-full text-xs font-black border',
                        req.plan?.name === 'Business'
                          ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-500/30'
                          : req.plan?.name === 'Pro'
                            ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      ]"
                    >
                      {{ req.plan?.name || 'Free' }}
                    </span>
                  </div>
                  <p class="text-[11px] text-slate-400 mt-0.5 font-medium">{{ req.durationMonths || 1 }} oyga</p>
                </td>

                <!-- Summa -->
                <td class="py-3.5 px-4">
                  <p class="font-bold text-slate-900 dark:text-white text-xs whitespace-nowrap">{{ formatMoney(req.amount) }}</p>
                </td>

                <!-- To'lovchi & Chek -->
                <td class="py-3.5 px-4">
                  <p class="font-bold text-slate-800 dark:text-slate-200">{{ req.senderName || req.senderCard || 'Karta o\'tkazma' }}</p>
                  <div v-if="req.receiptUrl" class="mt-1">
                    <button
                      type="button"
                      @click="openReceiptPreview(req)"
                      class="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-bold inline-flex items-center gap-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition shadow-2xs"
                    >
                      <Eye class="w-3.5 h-3.5" />
                      <span>Chekni ko'rish</span>
                    </button>
                  </div>
                  <p v-if="req.notes" class="text-[11px] text-slate-400 italic truncate max-w-[160px] mt-0.5" :title="req.notes">
                    "{{ req.notes }}"
                  </p>
                </td>

                <!-- Vaqt -->
                <td class="py-3.5 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                  {{ formatDateTime(req.createdAt) }}
                </td>

                <!-- Status -->
                <td class="py-3.5 px-4 text-center">
                  <span
                    :class="[
                      'px-2.5 py-1 rounded-full text-[11px] font-bold border inline-block whitespace-nowrap',
                      req.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : req.status === 'rejected'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800 animate-pulse'
                    ]"
                  >
                    {{ req.status === 'approved' ? 'Tasdiqlangan' : req.status === 'rejected' ? 'Rad etilgan' : 'Kutilmoqda' }}
                  </span>
                </td>

                <!-- Actions -->
                <td class="py-3.5 px-4 text-right whitespace-nowrap">
                  <div class="inline-flex items-center gap-1.5">
                    <!-- Approve Button (for pending) -->
                    <button
                      v-if="req.status === 'pending'"
                      type="button"
                      @click="openApproveModal(req)"
                      :disabled="actionLoadingId === req.id"
                      class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs transition shadow-xs disabled:opacity-50 inline-flex items-center gap-1"
                      title="To'lovni tasdiqlash va obunani faollashtirish"
                    >
                      <Check class="w-3.5 h-3.5" />
                      <span>Tasdiqlash</span>
                    </button>

                    <!-- Reject Button (for pending) -->
                    <button
                      v-if="req.status === 'pending'"
                      type="button"
                      @click="openRejectModal(req)"
                      :disabled="actionLoadingId === req.id"
                      class="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 font-bold text-xs transition border border-rose-200 dark:border-rose-800 disabled:opacity-50"
                      title="Rad etish"
                    >
                      <X class="w-3.5 h-3.5" />
                    </button>

                    <!-- Edit / Change Plan Button -->
                    <button
                      type="button"
                      @click="openEditRequestModal(req)"
                      class="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-amber-600 dark:text-amber-400 transition"
                      title="Tarif yoki muddatni tahrirlash"
                    >
                      <Edit2 class="w-3.5 h-3.5" />
                    </button>

                    <!-- Delete Request Button -->
                    <button
                      type="button"
                      @click="deleteRequest(req)"
                      :disabled="actionLoadingId === req.id"
                      class="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-950 text-slate-400 hover:text-rose-600 transition"
                      title="So'rovni o'chirish"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Component -->
        <AppPagination
          v-model:current-page="pagination.currentPage.value"
          v-model:page-size="pagination.pageSize.value"
          :total-items="filteredRequests.length"
          :inline="true"
          item-name="to'lov so'rovi"
        />
      </div>
    </div>

    <!-- MODAL 1: Receipt Preview Modal -->
    <div
      v-if="selectedReceiptReq"
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        class="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 class="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Eye class="w-4 h-4 text-emerald-500" />
            <span>To'lov Cheki: {{ selectedReceiptReq.business?.name }}</span>
          </h3>
          <button
            type="button"
            @click="selectedReceiptReq = null"
            class="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Details Box -->
        <div class="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs">
          <div>
            <span class="text-slate-400 block text-[10px] uppercase font-bold">Summa:</span>
            <span class="font-black text-emerald-600 dark:text-emerald-400 font-mono text-sm">{{ formatMoney(selectedReceiptReq.amount) }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[10px] uppercase font-bold">To'lovchi:</span>
            <span class="font-bold text-slate-900 dark:text-white">{{ selectedReceiptReq.senderName || selectedReceiptReq.senderCard }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[10px] uppercase font-bold">Tarif & Muddat:</span>
            <span class="font-bold text-slate-900 dark:text-white">{{ selectedReceiptReq.plan?.name }} ({{ selectedReceiptReq.durationMonths }} oy)</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[10px] uppercase font-bold">Vaqti:</span>
            <span class="font-mono text-slate-600 dark:text-slate-300">{{ formatDateTime(selectedReceiptReq.createdAt) }}</span>
          </div>
        </div>

        <!-- Image Container -->
        <div class="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 flex items-center justify-center min-h-[250px] p-2">
          <img
            :src="selectedReceiptReq.receiptUrl"
            alt="To'lov cheki"
            class="max-h-[500px] w-auto object-contain rounded-xl shadow-lg"
          />
        </div>

        <div class="flex items-center justify-between pt-1">
          <a
            :href="selectedReceiptReq.receiptUrl"
            download="chek.jpg"
            target="_blank"
            class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition inline-flex items-center gap-1.5"
          >
            <ExternalLink class="w-3.5 h-3.5" />
            <span>To'liq ochish</span>
          </a>
          <button
            type="button"
            @click="selectedReceiptReq = null"
            class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL 2: Approve Request Modal with Custom Duration -->
    <div
      v-if="approvingReq"
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        class="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl space-y-4"
        @click.stop
      >
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 class="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 class="w-4 h-4 text-emerald-500" />
            <span>To'lovni Tasdiqlash</span>
          </h3>
          <button
            type="button"
            @click="approvingReq = null"
            class="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <form @submit.prevent="confirmApproveRequest" class="space-y-3.5">
          <div class="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-1 text-xs">
            <p class="font-black text-slate-900 dark:text-white">{{ approvingReq.business?.name }}</p>
            <p class="text-slate-500 dark:text-slate-400">Egasi: {{ approvingReq.business?.owner?.fullName }} ({{ approvingReq.business?.owner?.phone }})</p>
            <p class="text-emerald-700 dark:text-emerald-400 font-bold">Tanlangan: {{ approvingReq.plan?.name }} • {{ formatMoney(approvingReq.amount) }}</p>
          </div>

          <!-- Expiration Date / Duration Selection -->
          <div class="space-y-2">
            <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span class="flex items-center gap-1.5">
                <Calendar class="w-3.5 h-3.5 text-emerald-500" />
                <span>Qaysi Sanagacha Huquq Berish (Amal Qilish Sanasi) *</span>
              </span>
              <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                {{ approveForm.durationDays }} kun
              </span>
            </label>
            <AppDatePicker
              v-model="approveForm.expiresAt"
              @change="onApproveDateChange"
              placeholder="Amal qilish sanasini tanlang"
            />

            <!-- Quick Duration Buttons -->
            <div class="flex flex-wrap gap-1.5 pt-1">
              <button
                type="button"
                @click="onApproveDaysChange(30)"
                class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 transition"
              >
                1 oy (30 kun)
              </button>
              <button
                type="button"
                @click="onApproveDaysChange(90)"
                class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 transition"
              >
                3 oy
              </button>
              <button
                type="button"
                @click="onApproveDaysChange(180)"
                class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 transition"
              >
                6 oy
              </button>
              <button
                type="button"
                @click="onApproveDaysChange(365)"
                class="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 transition"
              >
                1 yil (365 kun)
              </button>
              <button
                type="button"
                @click="onApproveDaysChange(3650)"
                class="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 text-[11px] font-bold text-purple-700 dark:text-purple-300 border border-purple-500/20 transition"
              >
                10 yil (Cheksiz)
              </button>
            </div>
          </div>

          <div class="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              @click="approvingReq = null"
              class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              :disabled="actionLoadingId === approvingReq.id"
              class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-500/25 disabled:opacity-50 flex items-center gap-1.5 transition"
            >
              <Check class="w-4 h-4 stroke-[3]" />
              <span>{{ actionLoadingId === approvingReq.id ? 'Faollashtirilmoqda...' : 'Tasdiqlash & Faollashtirish' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL 3: Reject Modal with Reason -->
    <div
      v-if="rejectingReq"
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        class="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl space-y-4"
        @click.stop
      >
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 class="text-sm sm:text-base font-black text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <XCircle class="w-4 h-4" />
            <span>So'rovni Rad Etish</span>
          </h3>
          <button
            type="button"
            @click="rejectingReq = null"
            class="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <form @submit.prevent="confirmRejectRequest" class="space-y-3.5">
          <p class="text-xs text-slate-600 dark:text-slate-300">
            «<strong>{{ rejectingReq.business?.name }}</strong>» biznesi yuborgan to'lov so'rovini rad etish sababini kiriting:
          </p>

          <div class="space-y-1">
            <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              Rad etish sababi *
            </label>
            <textarea
              v-model="rejectForm.reason"
              rows="3"
              required
              placeholder="Masalan: Chek summasi to'g'ri kelmadi yoki to'lov tasdiqlanmadi..."
              class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-rose-500 font-medium"
            ></textarea>
          </div>

          <div class="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              @click="rejectingReq = null"
              class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              :disabled="actionLoadingId === rejectingReq.id"
              class="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-rose-500/25 disabled:opacity-50 flex items-center gap-1.5 transition"
            >
              <X class="w-4 h-4" />
              <span>{{ actionLoadingId === rejectingReq.id ? 'Rad etilmoqda...' : 'Rad etish' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL 4: Edit Request / Change Business Plan Modal -->
    <div
      v-if="editingReq"
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        class="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl space-y-4"
        @click.stop
      >
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 class="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Edit2 class="w-4 h-4 text-amber-500" />
            <span>Tarif va So'rovni Tahrirlash</span>
          </h3>
          <button
            type="button"
            @click="editingReq = null"
            class="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <form @submit.prevent="saveRequestChanges" class="space-y-3.5">
          <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
            <p class="font-bold text-slate-900 dark:text-white">{{ editingReq.business?.name }}</p>
            <p class="text-[11px] text-slate-400 mt-0.5">Egasi: {{ editingReq.business?.owner?.fullName }}</p>
          </div>

          <!-- Select Plan with AppSelect -->
          <div class="space-y-1">
            <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              Belgilangan Tarif Rejasi *
            </label>
            <AppSelect
              v-model="editReqForm.planId"
              :options="planSelectOptions"
              placeholder="Tarifni tanlang"
            />
          </div>

          <!-- Expiration Date / Grant Access Until (Qaysi sanagacha huquq berish) -->
          <div class="space-y-2">
            <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span class="flex items-center gap-1.5">
                <Calendar class="w-3.5 h-3.5 text-emerald-500" />
                <span>Amal Qilish Muddati (Qaysi sanagacha huquq berish) *</span>
              </span>
              <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold" v-if="editDaysLeft">
                {{ editDaysLeft > 0 ? `${editDaysLeft} kun qoladi` : "Muddati o'tgan" }}
              </span>
            </label>
            <AppDatePicker
              v-model="editReqForm.expiresAt"
              placeholder="Amal qilish sanasini tanlang"
            />

            <!-- Quick preset pills for easy setting (+1 oy, +3 oy, +6 oy, +1 yil, 10 yil/cheksiz) -->
            <div class="flex flex-wrap gap-1.5 pt-1">
              <button
                type="button"
                @click="setEditExpiryDays(30)"
                class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 transition"
              >
                +1 oy (30 kun)
              </button>
              <button
                type="button"
                @click="setEditExpiryDays(90)"
                class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 transition"
              >
                +3 oy
              </button>
              <button
                type="button"
                @click="setEditExpiryDays(180)"
                class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 transition"
              >
                +6 oy
              </button>
              <button
                type="button"
                @click="setEditExpiryDays(365)"
                class="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 transition"
              >
                +1 yil (365 kun)
              </button>
              <button
                type="button"
                @click="setEditExpiryDays(3650)"
                class="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 text-[11px] font-bold text-purple-700 dark:text-purple-300 border border-purple-500/20 transition"
              >
                10 yil (Cheksiz)
              </button>
            </div>
          </div>

          <!-- Price Amount using CurrencyInput -->
          <div class="space-y-1">
            <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              To'langan Summa (so'mda) *
            </label>
            <CurrencyInput
              v-model="editReqForm.amount"
              placeholder="0"
              suffix="so'm"
              input-class="!font-black !text-emerald-600 dark:!text-emerald-400 !text-xs !bg-slate-50/50 dark:!bg-slate-800"
            />
          </div>

          <!-- Optional Notes -->
          <div class="space-y-1">
            <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              SuperAdmin Izohi
            </label>
            <input
              v-model="editReqForm.notes"
              type="text"
              placeholder="Masalan: Maxsus chegirma bilan tasdiqlandi"
              class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div class="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              @click="editingReq = null"
              class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              :disabled="savingReq"
              class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-500/25 disabled:opacity-50 flex items-center gap-1.5 transition"
            >
              <Save class="w-4 h-4" />
              <span>{{ savingReq ? 'Saqlanmoqda...' : 'Saqlash' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  CreditCard,
  Receipt,
  Save,
  CheckCircle2,
  Check,
  X,
  Search,
  Eye,
  Edit2,
  Trash2,
  Calendar,
} from 'lucide-vue-next';
import api from '@/services/api';
import { useToast } from '@/composables/useToast';
import { usePagination } from '@/composables/usePagination';
import AppPagination from '@/components/AppPagination.vue';
import AppSelect from '@/components/AppSelect.vue';
import SkeletonLoader from '@/components/SkeletonLoader.vue';
import CurrencyInput from '@/components/CurrencyInput.vue';
import AppDatePicker from '@/components/AppDatePicker.vue';

const toast = useToast();

const requisitesForm = ref({
  cardNumber: '8600 0000 0000 0000',
  cardHolder: 'BOSHQAR UZ ADMIN',
  bankName: 'Kapitalbank / TBC Bank',
  phone: '+998 90 000 00 00',
  telegramContact: '@Boshqar_uzbot',
  instructions: '',
  isEnabled: true,
});

const savingRequisites = ref(false);
const requests = ref<any[]>([]);
const plansList = ref<any[]>([]);
const loadingRequests = ref(false);

// Filters & Search
const searchQuery = ref('');
const filterStatus = ref('all');
const filterPlan = ref('all');
const actionLoadingId = ref<string | null>(null);

// Modal states
const selectedReceiptReq = ref<any>(null);
const approvingReq = ref<any>(null);
const approveForm = ref({
  durationDays: 30,
  expiresAt: '',
});
const rejectingReq = ref<any>(null);
const rejectForm = ref({ reason: 'To\'lov cheki tasdiqlanmadi' });
const editingReq = ref<any>(null);
const savingReq = ref(false);
const editReqForm = ref({
  planId: '',
  durationMonths: 1,
  amount: 0,
  notes: '',
  expiresAt: '',
});

// Select Options Computeds
const planFilterOptions = computed(() => [
  { value: 'all', label: 'Barcha Tariflar' },
  ...plansList.value.map((pl) => ({
    value: pl.name,
    label: `${pl.name} tarifi`,
  })),
]);

const planSelectOptions = computed(() =>
  plansList.value.map((pl) => ({
    value: pl.id,
    label: `${pl.name} (${formatMoney(pl.priceMonthly)} / oy)`,
  }))
);

// Quick Counts
const countPending = computed(() => requests.value.filter((r) => r.status === 'pending').length);
const countApproved = computed(() => requests.value.filter((r) => r.status === 'approved').length);
const countRejected = computed(() => requests.value.filter((r) => r.status === 'rejected').length);

// Filtered Requests Computed
const filteredRequests = computed(() => {
  return requests.value.filter((req) => {
    // 1. Status filter
    if (filterStatus.value !== 'all' && req.status !== filterStatus.value) {
      return false;
    }

    // 2. Plan filter
    if (filterPlan.value !== 'all' && req.plan?.name !== filterPlan.value) {
      return false;
    }

    // 3. Search query
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim();
      const bName = (req.business?.name || '').toLowerCase();
      const oName = (req.business?.owner?.fullName || '').toLowerCase();
      const oPhone = (req.business?.owner?.phone || '').toLowerCase();
      const sName = (req.senderName || '').toLowerCase();
      const sCard = (req.senderCard || '').toLowerCase();
      const notes = (req.notes || '').toLowerCase();

      return (
        bName.includes(q) ||
        oName.includes(q) ||
        oPhone.includes(q) ||
        sName.includes(q) ||
        sCard.includes(q) ||
        notes.includes(q)
      );
    }

    return true;
  });
});

// Pagination for Filtered Requests
const pagination = usePagination(filteredRequests, {
  initialPageSize: 10,
  pageSizeOptions: [10, 20, 50],
  storageKey: 'superadmin_billing_requests_page_size',
});

const paginatedRequests = pagination.paginatedItems;

const loadRequisites = async () => {
  try {
    const { data } = await api.get('/billing/requisites');
    if (data) {
      requisitesForm.value = {
        cardNumber: data.cardNumber || '',
        cardHolder: data.cardHolder || '',
        bankName: data.bankName || '',
        phone: data.phone || '',
        telegramContact: data.telegramContact || '',
        instructions: data.instructions || '',
        isEnabled: data.isEnabled !== false,
      };
    }
  } catch (err) {
    console.error('Requisites error:', err);
  }
};

const loadPlans = async () => {
  try {
    const { data } = await api.get('/superadmin/plans');
    plansList.value = Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Plans error:', err);
  }
};

const saveRequisites = async () => {
  savingRequisites.value = true;
  try {
    const { data } = await api.patch('/billing/requisites', requisitesForm.value);
    requisitesForm.value = { ...requisitesForm.value, ...data };
    toast.success('To\'lov rekvizitlari muvaffaqiyatli saqlandi!');
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Xatolik yuz berdi');
  } finally {
    savingRequisites.value = false;
  }
};

const loadRequests = async () => {
  loadingRequests.value = true;
  try {
    const { data } = await api.get('/billing/admin/requests');
    requests.value = Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Requests error:', err);
  } finally {
    loadingRequests.value = false;
  }
};

// Modal Openers
const openReceiptPreview = (req: any) => {
  selectedReceiptReq.value = req;
};

const onApproveDaysChange = (days: number) => {
  approveForm.value.durationDays = days;
  const d = new Date();
  d.setDate(d.getDate() + days);
  approveForm.value.expiresAt = d.toISOString().split('T')[0];
};

const onApproveDateChange = () => {
  if (!approveForm.value.expiresAt) return;
  const target = new Date(approveForm.value.expiresAt).getTime();
  const now = new Date().getTime();
  const diff = Math.max(1, Math.ceil((target - now) / 86400000));
  approveForm.value.durationDays = diff;
};

const openApproveModal = (req: any) => {
  approvingReq.value = req;
  const days = (req.durationMonths || 1) * 30;
  onApproveDaysChange(days);
};

const confirmApproveRequest = async () => {
  if (!approvingReq.value) return;
  const req = approvingReq.value;
  actionLoadingId.value = req.id;
  try {
    await api.patch(`/billing/admin/requests/${req.id}/approve`, {
      durationDays: approveForm.value.durationDays,
      expiresAt: approveForm.value.expiresAt,
    });
    toast.success(`Muvaffaqiyatli tasdiqlandi! "${req.business?.name}" uchun ${approveForm.value.expiresAt} gacha (${approveForm.value.durationDays} kun) obuna faollashtirildi.`);
    approvingReq.value = null;
    await loadRequests();
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Xatolik yuz berdi');
  } finally {
    actionLoadingId.value = null;
  }
};

const openRejectModal = (req: any) => {
  rejectingReq.value = req;
  rejectForm.value.reason = 'To\'lov cheki tasdiqlanmadi';
};

const confirmRejectRequest = async () => {
  if (!rejectingReq.value) return;
  const req = rejectingReq.value;
  actionLoadingId.value = req.id;
  try {
    await api.patch(`/billing/admin/requests/${req.id}/reject`, {
      reason: rejectForm.value.reason,
    });
    toast.info('To\'lov so\'rovi rad etildi.');
    rejectingReq.value = null;
    await loadRequests();
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Xatolik yuz berdi');
  } finally {
    actionLoadingId.value = null;
  }
};

const setEditExpiryDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  editReqForm.value.expiresAt = d.toISOString().split('T')[0];
  editReqForm.value.durationMonths = Math.max(1, Math.round(days / 30));
};

const editDaysLeft = computed(() => {
  if (!editReqForm.value.expiresAt) return 0;
  const target = new Date(editReqForm.value.expiresAt).getTime();
  const now = new Date().getTime();
  return Math.max(0, Math.ceil((target - now) / 86400000));
});

const openEditRequestModal = (req: any) => {
  editingReq.value = req;
  const days = (req.durationMonths || 1) * 30;
  const d = new Date();
  d.setDate(d.getDate() + days);
  editReqForm.value = {
    planId: req.planId,
    durationMonths: req.durationMonths || 1,
    amount: Number(req.amount || 0),
    notes: req.notes || '',
    expiresAt: d.toISOString().split('T')[0],
  };
};

const saveRequestChanges = async () => {
  if (!editingReq.value) return;
  savingReq.value = true;
  try {
    await api.patch(`/billing/admin/requests/${editingReq.value.id}`, editReqForm.value);
    toast.success('So\'rov va obuna amal qilish muddati muvaffaqiyatli saqlandi!');
    editingReq.value = null;
    await loadRequests();
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Xatolik yuz berdi');
  } finally {
    savingReq.value = false;
  }
};

const deleteRequest = async (req: any) => {
  if (!confirm(`"${req.business?.name}" to'lov so'rovini o'chirishni tasdiqlaysizmi?`)) return;

  actionLoadingId.value = req.id;
  try {
    await api.delete(`/billing/admin/requests/${req.id}`);
    toast.success('To\'lov so\'rovi o\'chirildi!');
    await loadRequests();
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Xatolik yuz berdi');
  } finally {
    actionLoadingId.value = null;
  }
};

const formatMoney = (amount: any) => {
  const num = Math.round(Number(amount || 0));
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + " so'm";
};

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '--:--';
  const d = new Date(dateStr);
  return `${d.toLocaleDateString('uz-UZ')} ${d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}`;
};

onMounted(() => {
  loadRequisites();
  loadPlans();
  loadRequests();
});
</script>
