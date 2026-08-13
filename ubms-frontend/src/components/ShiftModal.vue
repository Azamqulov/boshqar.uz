<template>
  <Teleport to="body">
    <!-- 1. OPEN SHIFT MODAL -->
    <div v-if="isOpen && mode === 'open'" @click.self="$emit('close')" class="modal-overlay">
      <div class="modal-container max-w-md bg-white dark:bg-slate-900 shadow-2xl rounded-3xl overflow-hidden" @click.stop>
        <div class="modal-header border-b border-emerald-500/20 px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shadow-inner">
              <Sun class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-base font-extrabold text-slate-900 dark:text-white">Yangi Smena Ochish</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">Kunlik kassa savdosini boshlash</p>
            </div>
          </div>
          <button @click="$emit('close')" class="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="handleOpenShift" class="p-6 space-y-4 text-xs">
          <!-- Starting Cash Input -->
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Boshlang'ich Kassa Qoldig'i (Mayda pullar) *
            </label>
            <CurrencyInput
              v-model="startingCash"
              placeholder="0"
              suffix="so'm"
              inputClass="font-bold text-emerald-600 dark:text-emerald-400 text-lg"
            />
            <p class="text-[11px] text-slate-400 mt-1">Smena boshida kassadagi mavjud naqd pul summasi</p>
          </div>

          <!-- Quick Fill Buttons -->
          <div class="space-y-1.5">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tezkor summalar:</span>
            <div class="flex flex-wrap gap-1.5">
              <button
                type="button"
                @click="startingCash = 0"
                class="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 transition"
              >
                0 so'm (Bo'sh kassa)
              </button>
              <button
                type="button"
                @click="startingCash = 100000"
                class="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 transition"
              >
                100 000 so'm
              </button>
              <button
                type="button"
                @click="startingCash = 200000"
                class="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 transition"
              >
                200 000 so'm
              </button>
              <button
                type="button"
                @click="startingCash = 500000"
                class="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 transition"
              >
                500 000 so'm
              </button>
            </div>
          </div>

          <!-- Notes -->
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Izoh (ixtiyoriy)</label>
            <input
              v-model="openNotes"
              placeholder="Masalan: Ertalabki smena, 1-kassa..."
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <!-- Submit -->
          <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <AppButton variant="ghost" size="md" @click="$emit('close')">
              Bekor qilish
            </AppButton>
            <AppButton variant="primary" size="md" type="submit" :loading="submitting">
              Smenani Boshlash
            </AppButton>
          </div>
        </form>
      </div>
    </div>

    <!-- 2. CLOSE SHIFT MODAL -->
    <div v-else-if="isOpen && mode === 'close'" @click.self="$emit('close')" class="modal-overlay">
      <!-- 2.A: BLOCKED STATE MODAL (When there are occupied tables or pending kitchen orders) -->
      <div v-if="hasUnfinishedTasks" class="modal-container max-w-md bg-white dark:bg-slate-900 shadow-2xl rounded-3xl overflow-hidden animate-scale-up" @click.stop>
        <div class="modal-header border-b border-rose-500/20 px-6 py-4 flex items-center justify-between bg-rose-50/50 dark:bg-rose-950/20">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center justify-center shadow-inner">
              <AlertTriangle class="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h3 class="text-base font-black text-rose-600 dark:text-rose-400">Smenani Yopib Bo'lmaydi!</h3>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">Tugallanmagan jarayonlar mavjud</p>
            </div>
          </div>
          <button @click="$emit('close')" class="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="p-6 space-y-4 text-xs">
          <p class="text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
            Kassa smenasini yopishdan oldin quyidagi band stollarning hisobini yopishingiz va oshxonadagi taomlarni yakunlashingiz shart:
          </p>

          <!-- List of Occupied Tables -->
          <div v-if="shiftSummary.occupiedTables && shiftSummary.occupiedTables.length > 0" class="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                <span>🍽️</span>
                <span>Band Stollar (Hisobi yopilmagan):</span>
              </span>
              <span class="px-2 py-0.5 rounded-full bg-rose-200 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 text-[11px] font-black">
                {{ shiftSummary.occupiedTables.length }} ta stol
              </span>
            </div>
            <div class="flex flex-wrap gap-1.5 pt-1">
              <span
                v-for="t in shiftSummary.occupiedTables"
                :key="t.id"
                class="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300 font-bold text-xs shadow-xs"
              >
                {{ t.name }}
              </span>
            </div>
          </div>

          <!-- List of Pending Kitchen Items -->
          <div v-if="shiftSummary.pendingKitchenItems && shiftSummary.pendingKitchenItems.length > 0" class="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                <span>🔥</span>
                <span>Oshxonada tayyorlanayotgan taomlar:</span>
              </span>
              <span class="px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 text-[11px] font-black">
                {{ shiftSummary.pendingKitchenItems.length }} ta
              </span>
            </div>
            <div class="max-h-32 overflow-y-auto space-y-1 pr-1">
              <div
                v-for="(item, idx) in shiftSummary.pendingKitchenItems"
                :key="idx"
                class="p-2 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700/60 flex justify-between items-center text-[11px]"
              >
                <span class="font-bold text-slate-800 dark:text-slate-200">{{ item.product?.name || 'Taom' }} (x{{ item.quantity || 1 }})</span>
                <span class="font-bold px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[10px]">
                  {{ item.order?.tableNumber ? `Stol: ${item.order.tableNumber}` : 'Oshxonada' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <AppButton variant="secondary" size="md" @click="$emit('close')">
              Tushundim
            </AppButton>
            <button
              type="button"
              @click="goToTables"
              class="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition active:scale-95 btn-interactive"
            >
              <UtensilsCrossed class="w-4 h-4" />
              <span>Stollar Xaritasiga O'tish</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 2.B: NORMAL CLOSE MODAL (When all tables are free and orders completed) -->
      <div v-else class="modal-container max-w-lg bg-white dark:bg-slate-900 shadow-2xl rounded-3xl overflow-hidden" @click.stop>
        <div class="modal-header border-b border-rose-500/20 px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center shadow-inner">
              <Moon class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-base font-extrabold text-slate-900 dark:text-white">Smenani Yopish & Kassa Xatlovi</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">Kunlik yakuniy hisob-kitob va tafovut</p>
            </div>
          </div>
          <button @click="$emit('close')" class="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="p-6 space-y-4 overflow-y-auto max-h-[75vh] text-xs">
          <!-- Real-Time Metrics Card -->
          <div class="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 p-4 space-y-2.5">
            <div class="flex justify-between items-center text-slate-600 dark:text-slate-300">
              <span class="text-slate-400 font-medium">Boshlang'ich kassa:</span>
              <span class="font-bold font-mono">{{ formatCurrency(shiftSummary?.startingCash || 0) }}</span>
            </div>
            <div class="flex justify-between items-center text-emerald-600 dark:text-emerald-400 border-t border-slate-200/60 dark:border-slate-700/40 pt-2">
              <span class="font-medium">+ Naqd savdo tushumi:</span>
              <span class="font-bold font-mono">+{{ formatCurrency(shiftSummary?.cashSales || 0) }}</span>
            </div>
            <div class="flex justify-between items-center text-blue-600 dark:text-blue-400">
              <span class="font-medium">Plastik karta savdosi:</span>
              <span class="font-bold font-mono">{{ formatCurrency(shiftSummary?.cardSales || 0) }}</span>
            </div>
            <div class="flex justify-between items-center text-purple-600 dark:text-purple-400">
              <span class="font-medium">Click / Payme / Boshqa:</span>
              <span class="font-bold font-mono">{{ formatCurrency(shiftSummary?.otherSales || 0) }}</span>
            </div>
            <div v-if="shiftSummary?.cashExpenses > 0" class="flex justify-between items-center text-rose-500 border-t border-slate-200/60 dark:border-slate-700/40 pt-2">
              <span class="font-medium">- Kassadan xarajatlar:</span>
              <span class="font-bold font-mono">-{{ formatCurrency(shiftSummary?.cashExpenses || 0) }}</span>
            </div>

            <!-- Expected Cash Highlight -->
            <div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex justify-between items-center text-xs mt-2">
              <div>
                <span class="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                  Kassada Kutilayotgan Naqd Pul:
                </span>
                <span class="text-[10px] text-slate-400">Boshlang'ich + Naqd savdo - Xarajat</span>
              </div>
              <span class="font-black font-mono text-emerald-600 dark:text-emerald-400 text-base">
                {{ formatCurrency(shiftSummary?.expectedCash || 0) }}
              </span>
            </div>
          </div>

          <!-- Actual Cash Counted Input -->
          <form @submit.prevent="handleCloseShift" class="space-y-4">
            <div>
              <label class="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                Kassada Haqiqatda Sanalgan Naqd Pul *
              </label>
              <CurrencyInput
                v-model="actualCash"
                placeholder="0"
                suffix="so'm"
                inputClass="font-black text-lg"
                :inputClass="difference === 0 ? 'text-emerald-600 dark:text-emerald-400' : (difference < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-blue-600 dark:text-blue-400')"
              />
            </div>

            <!-- Difference / Kamomad or Surplus Banner -->
            <div
              class="p-3.5 rounded-xl border flex items-center justify-between text-xs transition"
              :class="[
                difference === 0
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                  : difference < 0
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-700 dark:text-rose-300 animate-pulse'
                  : 'bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300'
              ]"
            >
              <div class="flex items-center gap-2">
                <CheckCircle2 v-if="difference === 0" class="w-5 h-5 text-emerald-500 shrink-0" />
                <AlertTriangle v-else-if="difference < 0" class="w-5 h-5 text-rose-500 shrink-0" />
                <TrendingUp v-else class="w-5 h-5 text-blue-500 shrink-0" />
                <div>
                  <span class="font-bold block">
                    {{ difference === 0 ? 'Kassa to\'liq to\'g\'ri (Ideal)' : (difference < 0 ? 'Kamomad aniqlandi!' : 'Ortiqcha pul aniqlandi') }}
                  </span>
                  <span class="text-[10px] opacity-80">
                    {{ difference === 0 ? 'Kutilayotgan summa sanalgan pul bilan 100% mos' : (difference < 0 ? 'Kassada yetishmayotgan summa' : 'Kassada belgilangandan ko\'p pul mavjud') }}
                  </span>
                </div>
              </div>

              <span class="font-black font-mono text-sm tracking-tight">
                {{ difference >= 0 ? '+' : '' }}{{ formatCurrency(difference) }}
              </span>
            </div>

            <!-- Closing Notes -->
            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Smena Yopish Izohi</label>
              <input
                v-model="closeNotes"
                placeholder="Masalan: Inkassatsiya qilindi, kamomad yo'q..."
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <AppButton variant="ghost" size="md" @click="$emit('close')">
                Bekor qilish
              </AppButton>
              <AppButton
                variant="danger"
                size="md"
                type="submit"
                :loading="submitting"
              >
                Smenani Yakunlash & Yopish
              </AppButton>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 3. Z-REPORT PRINT MODAL -->
    <div v-else-if="isOpen && mode === 'report'" @click.self="$emit('close')" class="modal-overlay">
      <div class="modal-container max-w-md bg-white dark:bg-slate-900 shadow-2xl rounded-3xl overflow-hidden" @click.stop>
        <div class="modal-header border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Receipt class="w-5 h-5 text-emerald-500" />
            <h3 class="text-base font-extrabold text-slate-900 dark:text-white">Smena Z-Hisoboti</h3>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="handlePrintReport"
              class="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition btn-interactive"
            >
              <Printer class="w-4 h-4" />
              <span>Chop etish</span>
            </button>
            <button @click="$emit('close')" class="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition">
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>

        <div class="p-6 overflow-y-auto max-h-[75vh] space-y-4 text-xs font-mono">
          <!-- Printable Receipt Preview -->
          <div id="shift-z-report-area" class="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div class="text-center space-y-1">
              <h2 class="font-black text-sm uppercase tracking-wider">{{ reportData?.shift?.business?.name || 'SAVDO TIZIMI' }}</h2>
              <p class="text-[10px] text-slate-400">{{ reportData?.shift?.branch?.name || 'Asosiy filial' }}</p>
              <div class="border-t border-dashed border-slate-300 dark:border-slate-600 my-2"></div>
              <h3 class="font-black text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                *** Z-HISOBOT (SMENA YAKUNI) ***
              </h3>
            </div>

            <!-- Meta details -->
            <div class="space-y-1 text-[11px] border-b border-dashed border-slate-300 dark:border-slate-600 pb-2">
              <div class="flex justify-between">
                <span class="text-slate-500">Smena ID:</span>
                <span class="font-bold">{{ reportData?.shift?.id?.substring(0, 8) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Kassir / Mas'ul:</span>
                <span class="font-bold">{{ reportData?.shift?.user?.fullName || authStore.user?.fullName || 'Kassir' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Ochilgan vaqti:</span>
                <span>{{ formatDateTime(reportData?.shift?.openedAt) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Chop etilgan vaqt:</span>
                <span>{{ formatDateTime(new Date()) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Cheklar soni:</span>
                <span class="font-bold font-mono">{{ reportData?.summary?.ordersCount || 0 }} ta</span>
              </div>
            </div>

            <!-- Financials -->
            <div class="space-y-1.5 text-[11px]">
              <div class="flex justify-between">
                <span>Boshlang'ich kassa:</span>
                <span class="font-bold">{{ formatCurrency(reportData?.summary?.startingCash || 0) }}</span>
              </div>
              <div class="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                <span>Naqd savdo:</span>
                <span>+{{ formatCurrency(reportData?.summary?.cashSales || 0) }}</span>
              </div>
              <div class="flex justify-between text-blue-600 dark:text-blue-400">
                <span>Plastik karta:</span>
                <span>{{ formatCurrency(reportData?.summary?.cardSales || 0) }}</span>
              </div>
              <div class="flex justify-between text-purple-600 dark:text-purple-400">
                <span>Click / Payme:</span>
                <span>{{ formatCurrency(reportData?.summary?.otherSales || 0) }}</span>
              </div>
              <div v-if="reportData?.summary?.cashExpenses > 0" class="flex justify-between text-rose-500">
                <span>Xarajatlar:</span>
                <span>-{{ formatCurrency(reportData?.summary?.cashExpenses || 0) }}</span>
              </div>
              <div class="flex justify-between font-black text-slate-900 dark:text-white pt-1.5 border-t border-slate-300 dark:border-slate-600">
                <span class="uppercase">Jami Savdo:</span>
                <span>{{ formatCurrency(reportData?.summary?.totalSales || 0) }}</span>
              </div>
            </div>

            <!-- Reconciliation Summary -->
            <div class="border-t border-dashed border-slate-300 dark:border-slate-600 pt-2 space-y-1 text-[11px]">
              <div class="flex justify-between font-bold">
                <span>Kutilgan naqd:</span>
                <span>{{ formatCurrency(reportData?.summary?.expectedCash || 0) }}</span>
              </div>
              <div class="flex justify-between font-bold">
                <span>Sanalgan naqd:</span>
                <span>{{ formatCurrency(reportData?.summary?.actualCash || 0) }}</span>
              </div>
              <div
                class="flex justify-between font-black text-xs pt-1 border-t border-slate-300 dark:border-slate-600"
                :class="Number(reportData?.summary?.difference) < 0 ? 'text-rose-600' : 'text-emerald-600'"
              >
                <span>Tafovut (Kamomad/Ortiqcha):</span>
                <span>{{ (reportData?.summary?.difference || 0) >= 0 ? '+' : '' }}{{ formatCurrency(reportData?.summary?.difference || 0) }}</span>
              </div>
            </div>

            <div class="text-center pt-2 text-[10px] text-slate-400 border-t border-dashed border-slate-300 dark:border-slate-600">
              boshqar.uz — Kassa tizimi
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
  Sun,
  Moon,
  Receipt,
  Printer,
  X,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  UtensilsCrossed,
} from 'lucide-vue-next';
import AppButton from './AppButton.vue';
import CurrencyInput from './CurrencyInput.vue';
import { useFormat } from '../composables/useFormat';
import { useToast } from '../composables/useToast';
import { useShiftStore } from '../stores/shift.store';
import { useAuthStore } from '../stores/auth.store';
import api from '../services/api';

const router = useRouter();

const goToTables = () => {
  emit('close');
  router.push('/restaurant/tables');
};

const props = defineProps<{
  isOpen: boolean;
  mode: 'open' | 'close' | 'report';
  shiftData?: any;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'shiftOpened', shift: any): void;
  (e: 'shiftClosed', shift: any): void;
}>();

const { formatCurrency, formatDateTime } = useFormat();
const toast = useToast();
const shiftStore = useShiftStore();
const authStore = useAuthStore();

const startingCash = ref<number>(0);
const openNotes = ref('');
const actualCash = ref<number>(0);
const closeNotes = ref('');
const submitting = ref(false);
const shiftSummary = ref<any>(null);
const reportData = ref<any>(null);

const hasUnfinishedTasks = computed(() => {
  if (!shiftSummary.value) return false;
  const tablesCount = shiftSummary.value.occupiedTables?.length || 0;
  const kitchenCount = shiftSummary.value.pendingKitchenItems?.length || 0;
  return tablesCount > 0 || kitchenCount > 0;
});

const difference = computed(() => {
  const expected = Number(shiftSummary.value?.expectedCash ?? props.shiftData?.expectedCash ?? 0);
  const actual = Number(actualCash.value || 0);
  return actual - expected;
});

// Load summary when closing or reporting
const loadShiftSummary = async (shift: any) => {
  if (shift) {
    shiftSummary.value = {
      startingCash: Number(shift.startingCash || 0),
      cashSales: Number(shift.cashSales || 0),
      cardSales: Number(shift.cardSales || 0),
      otherSales: Number(shift.otherSales || 0),
      totalSales: Number(shift.totalSales || 0),
      cashExpenses: Number(shift.cashExpenses || 0),
      expectedCash: Number(shift.expectedCash || shift.startingCash || 0),
      occupiedTables: [],
      pendingKitchenItems: [],
      canClose: true,
    };
    actualCash.value = Number(shift.expectedCash || shift.startingCash || 0);
  }

  try {
    let data;
    try {
      const res = await api.get(`/shifts/${shift.id}/summary`);
      data = res.data;
    } catch {
      const res = await api.get(`/orders/shifts/${shift.id}/summary`);
      data = res.data;
    }
    if (data) {
      shiftSummary.value = data;
      actualCash.value = Number(data.expectedCash || 0);
    }
  } catch {
    // Keep local shiftSummary
  }
};

const loadReportData = async (shift: any) => {
  reportData.value = {
    shift: shift || shiftStore.currentShift,
    summary: shift || shiftSummary.value || shiftStore.currentShift,
  };

  try {
    let data;
    try {
      const res = await api.get(`/shifts/${shift.id}/report`);
      data = res.data;
    } catch {
      const res = await api.get(`/orders/shifts/${shift.id}/report`);
      data = res.data;
    }
    if (data) {
      reportData.value = data;
    }
  } catch {
    // Keep local reportData
  }
};

watch(
  () => [props.isOpen, props.mode, props.shiftData],
  ([open, mode, shift]) => {
    if (open) {
      const target = shift || shiftStore.currentShift;
      if (target) {
        if (mode === 'close') {
          loadShiftSummary(target);
        } else if (mode === 'report') {
          loadReportData(target);
        }
      }
    }
  },
  { immediate: true }
);

const handleOpenShift = async () => {
  submitting.value = true;
  try {
    const data = await shiftStore.openShift(
      Number(startingCash.value) || 0,
      openNotes.value || undefined,
    );
    toast.success('Yangi kassa smenasi muvaffaqiyatli ochildi!', 'Smena Rejimi');
    emit('shiftOpened', data);
    emit('close');
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Smenani ochishda xatolik', 'Xatolik');
  } finally {
    submitting.value = false;
  }
};

const handleCloseShift = async () => {
  submitting.value = true;
  try {
    const closed = await shiftStore.closeShift(
      Number(actualCash.value) || 0,
      closeNotes.value || undefined,
    );
    toast.success('Smena muvaffaqiyatli yopildi!', 'Smena Rejimi');
    emit('shiftClosed', closed);
    emit('close');
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Smenani yopishda xatolik', 'Xatolik');
  } finally {
    submitting.value = false;
  }
};

const handlePrintReport = () => {
  window.print();
};
</script>
