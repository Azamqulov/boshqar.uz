<template>
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
        @click="$emit('refresh')"
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
          :value="searchQuery"
          @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
          type="text"
          placeholder="Biznes nomi, egasi, telefon yoki to'lovchi bo'yicha qidiruv..."
          class="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500 transition font-medium"
        />
        <button
          v-if="searchQuery"
          type="button"
          @click="$emit('update:searchQuery', '')"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- 2. Plan Filter Dropdown with AppSelect -->
      <div class="w-full lg:w-56 shrink-0">
        <AppSelect
          :model-value="filterPlan"
          @update:model-value="$emit('update:filterPlan', $event)"
          :options="planFilterOptions"
          placeholder="Barcha Tariflar"
        />
      </div>
    </div>

    <!-- Status Tabs -->
    <div class="flex flex-wrap items-center gap-2 pt-0.5">
      <button
        v-for="st in [
          { id: 'all', label: 'Barchasi', count: totalCount },
          { id: 'pending', label: 'Kutilayotgan', count: countPending },
          { id: 'approved', label: 'Tasdiqlangan', count: countApproved },
          { id: 'rejected', label: 'Rad etilgan', count: countRejected }
        ]"
        :key="st.id"
        type="button"
        @click="$emit('update:filterStatus', st.id)"
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
                    @click="$emit('open-receipt', req)"
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
                  <button
                    v-if="req.status === 'pending'"
                    type="button"
                    @click="$emit('open-approve', req)"
                    :disabled="actionLoadingId === req.id"
                    class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs transition shadow-xs disabled:opacity-50 inline-flex items-center gap-1"
                    title="To'lovni tasdiqlash va obunani faollashtirish"
                  >
                    <Check class="w-3.5 h-3.5" />
                    <span>Tasdiqlash</span>
                  </button>

                  <button
                    v-if="req.status === 'pending'"
                    type="button"
                    @click="$emit('open-reject', req)"
                    :disabled="actionLoadingId === req.id"
                    class="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 font-bold text-xs transition border border-rose-200 dark:border-rose-800 disabled:opacity-50"
                    title="Rad etish"
                  >
                    <X class="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    @click="$emit('open-edit', req)"
                    class="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-amber-600 dark:text-amber-400 transition"
                    title="Tarif yoki muddatni tahrirlash"
                  >
                    <Edit2 class="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    @click="$emit('delete', req)"
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

      <AppPagination
        :current-page="currentPage"
        @update:current-page="$emit('update:currentPage', $event)"
        :page-size="pageSize"
        @update:page-size="$emit('update:pageSize', $event)"
        :total-items="filteredRequests.length"
        :inline="true"
        item-name="to'lov so'rovi"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Receipt,
  RefreshCw,
  Search,
  X,
  CheckCircle2,
  Eye,
  Check,
  Edit2,
  Trash2,
} from 'lucide-vue-next';
import AppSelect from '@/components/AppSelect.vue';
import AppPagination from '@/components/AppPagination.vue';
import SkeletonLoader from '@/components/SkeletonLoader.vue';

defineProps<{
  filteredRequests: any[];
  paginatedRequests: any[];
  totalCount: number;
  countPending: number;
  countApproved: number;
  countRejected: number;
  loadingRequests: boolean;
  searchQuery: string;
  filterStatus: string;
  filterPlan: string;
  planFilterOptions: { value: string; label: string }[];
  actionLoadingId: string | null;
  currentPage: number;
  pageSize: number;
  formatMoney: (val: any) => string;
  formatDateTime: (val: any) => string;
}>();

defineEmits<{
  (e: 'refresh'): void;
  (e: 'update:searchQuery', val: string): void;
  (e: 'update:filterStatus', val: string): void;
  (e: 'update:filterPlan', val: string): void;
  (e: 'update:currentPage', val: number): void;
  (e: 'update:pageSize', val: number): void;
  (e: 'open-receipt', req: any): void;
  (e: 'open-approve', req: any): void;
  (e: 'open-reject', req: any): void;
  (e: 'open-edit', req: any): void;
  (e: 'delete', req: any): void;
}>();
</script>
