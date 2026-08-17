<template>
  <div class="space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h3 class="text-sm font-bold text-slate-900 dark:text-white">Global Tizim Audit Jurnali</h3>
        <p class="text-[11px] text-slate-500 dark:text-slate-400">Platformadagi barcha foydalanuvchilar va tizim harakatlari jurnali</p>
      </div>

      <div class="flex items-center gap-2">
        <!-- Cleanup Button -->
        <button
          type="button"
          @click="showCleanupModal = true"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold transition btn-interactive shadow-xs"
          title="Keraksiz eski audit yozuvlarini tozalash"
        >
          <Trash2 class="w-3.5 h-3.5" />
          <span>Jurnalni Tozalash</span>
        </button>

        <AppViewToggle :model-value="viewMode" @update:model-value="$emit('update:viewMode', $event)" />
      </div>
    </div>

    <!-- Audit Logs Table View -->
    <div v-if="viewMode === 'table'" class="glass-card rounded-2xl overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs font-mono">
          <thead class="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase font-sans font-semibold">
            <tr>
              <th class="py-3 px-4">Vaqt</th>
              <th class="py-3 px-4">Foydalanuvchi</th>
              <th class="py-3 px-4">Amal</th>
              <th class="py-3 px-4">Bo'lim</th>
              <th class="py-3 px-4">IP Manzil</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
            <tr v-if="auditLogs.length === 0">
              <td colspan="5" class="py-8 text-center text-slate-400 dark:text-slate-500 font-sans">Audit jurnallari mavjud emas</td>
            </tr>
            <tr v-for="log in pagination.paginatedItems.value" :key="log.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
              <td class="py-3 px-4 text-slate-500 dark:text-slate-400">{{ formatDate(log.createdAt) }}</td>
              <td class="py-3 px-4 font-sans font-bold text-slate-900 dark:text-white">{{ log.user?.fullName }} ({{ log.user?.phone }})</td>
              <td class="py-3 px-4 uppercase text-emerald-600 dark:text-emerald-400 font-bold">{{ log.action }}</td>
              <td class="py-3 px-4 text-slate-700 dark:text-slate-300 font-sans">{{ log.entity }}</td>
              <td class="py-3 px-4 text-slate-400 dark:text-slate-500">{{ log.ipAddress || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Audit Logs Grid / Card View -->
    <div v-else-if="viewMode === 'grid'">
      <div v-if="auditLogs.length === 0" class="glass-card rounded-2xl p-12 text-center text-slate-400 dark:text-slate-500">
        <ShieldCheck class="w-10 h-10 mx-auto mb-2 opacity-30 text-emerald-500" />
        <span>Audit jurnallari mavjud emas</span>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="log in pagination.paginatedItems.value"
          :key="log.id"
          class="glass-card rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90"
        >
          <div class="space-y-2.5">
            <div class="flex items-center justify-between gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                {{ log.action }}
              </span>
              <span class="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                <Calendar class="w-3 h-3 text-slate-400" />
                {{ formatDate(log.createdAt) }}
              </span>
            </div>

            <div class="space-y-0.5">
              <p class="font-bold text-xs text-slate-900 dark:text-white">{{ log.user?.fullName || 'Tizim' }}</p>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{{ log.user?.phone || '-' }}</p>
            </div>

            <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs">
              <span class="text-slate-500 dark:text-slate-400 font-medium">Bo'lim:</span>
              <span class="font-semibold text-slate-700 dark:text-slate-300 font-mono">{{ log.entity }}</span>
            </div>
          </div>

          <div class="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>IP manzil:</span>
            <span class="font-bold text-slate-600 dark:text-slate-300">{{ log.ipAddress || '-' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <AppPagination
      v-model:current-page="pagination.currentPage.value"
      v-model:page-size="pagination.pageSize.value"
      :total-items="auditLogs.length"
      item-name="audit yozuvi"
    />

    <!-- Cleanup Modal -->
    <Teleport to="body">
      <div v-if="showCleanupModal" @click.self="showCleanupModal = false" class="modal-overlay">
        <div class="modal-container max-w-md" @click.stop>
          <div class="modal-header border-b border-slate-100 dark:border-slate-800">
            <div class="flex items-center gap-2.5">
              <div class="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                <Trash2 class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-sm font-bold text-slate-900 dark:text-white">Audit Jurnallarini Tozalash</h3>
                <p class="text-[11px] text-slate-500 dark:text-slate-400">Keraksiz va eski audit ma'lumotlarini o'chirish</p>
              </div>
            </div>
            <button @click="showCleanupModal = false" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition">
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="modal-body p-4 space-y-3.5 text-xs">
            <p class="text-slate-600 dark:text-slate-300 leading-relaxed">
              Ma'lumotlar bazasida ortiqcha joy egallamasligi uchun qaysi davrdagi yozuvlarni tozalashni tanlang:
            </p>

            <!-- Options Radio Group -->
            <div class="space-y-2">
              <label
                v-for="opt in cleanupOptions"
                :key="opt.value"
                class="flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer"
                :class="
                  selectedPeriod === opt.value
                    ? 'border-rose-500/80 bg-rose-500/10 text-slate-900 dark:text-white ring-1 ring-rose-500/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50'
                "
              >
                <input
                  type="radio"
                  name="cleanupPeriod"
                  :value="opt.value"
                  v-model="selectedPeriod"
                  class="mt-0.5 text-rose-600 focus:ring-rose-500"
                />
                <div class="min-w-0">
                  <span class="font-bold block text-slate-900 dark:text-white text-xs">{{ opt.label }}</span>
                  <span class="text-[11px] text-slate-400 block mt-0.5">{{ opt.desc }}</span>
                </div>
              </label>
            </div>

            <!-- Warning notice -->
            <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] flex items-start gap-2">
              <AlertTriangle class="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
              <span>Diqqat: O'chirilgan audit ma'lumotlarini qayta tiklab bo'lmaydi.</span>
            </div>
          </div>

          <div class="modal-footer border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 p-3">
            <button
              type="button"
              @click="showCleanupModal = false"
              :disabled="cleaningUp"
              class="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Bekor qilish
            </button>
            <button
              type="button"
              @click="promptConfirmCleanup"
              :disabled="cleaningUp"
              class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/25 transition btn-interactive disabled:opacity-50"
            >
              <Trash2 class="w-3.5 h-3.5" />
              <span>Tozalash</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Double Confirmation Dialog -->
    <AppConfirmDialog
      :open="showConfirmDialog"
      title="Audit Jurnallarini O'chirishni Tasdiqlang"
      :message="confirmMessage"
      variant="danger"
      confirm-text="Ha, o'chirilsin"
      cancel-text="Bekor qilish"
      :loading="cleaningUp"
      @confirm="executeCleanup"
      @cancel="showConfirmDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ShieldCheck, Calendar, Trash2, X, AlertTriangle, RefreshCw } from 'lucide-vue-next';
import AppViewToggle from '../../../components/AppViewToggle.vue';
import AppPagination from '../../../components/AppPagination.vue';
import AppConfirmDialog from '../../../components/AppConfirmDialog.vue';
import { useFormat } from '../../../composables/useFormat';
import { usePagination } from '../../../composables/usePagination';
import { useToast } from '../../../composables/useToast';
import api from '../../../services/api';

const props = defineProps<{
  auditLogs: any[];
  viewMode: 'table' | 'grid';
}>();

const emit = defineEmits<{
  (e: 'update:viewMode', val: 'table' | 'grid'): void;
  (e: 'refresh'): void;
}>();

const toast = useToast();
const { formatDate } = useFormat();

const pagination = usePagination(() => props.auditLogs);

const showCleanupModal = ref(false);
const showConfirmDialog = ref(false);
const selectedPeriod = ref<'1d' | '7d' | '30d' | 'all'>('7d');
const cleaningUp = ref(false);

const cleanupOptions = [
  {
    value: '1d',
    label: '1 kundan eski yozuvlar',
    desc: 'Oxirgi 24 soatdan avvalgi barcha loglarni tozalash',
  },
  {
    value: '7d',
    label: '1 haftadan eski yozuvlar (Tavsiya etiladi)',
    desc: 'Oxirgi 7 kundan avvalgi eski yozuvlarni tozalash',
  },
  {
    value: '30d',
    label: '1 oydan (30 kundan) eski yozuvlar',
    desc: 'Oxirgi 30 kundan oldingi arxiv yozuvlarini tozalash',
  },
  {
    value: 'all',
    label: 'Barcha audit yozuvlarini butunlay o\'chirish',
    desc: 'Jurnaldagi barcha yozuvlarni to\'liq o\'chirib bo\'shatish',
  },
];

const selectedOption = computed(() => {
  return cleanupOptions.find((o) => o.value === selectedPeriod.value) || cleanupOptions[1];
});

const confirmMessage = computed(() => {
  if (selectedPeriod.value === 'all') {
    return 'Haqiqatan ham BARCHA global audit yozuvlarini butunlay o\'chirib tashlamoqchimisiz? Ushbu amalni ortga qaytarib bo\'lmaydi!';
  }
  return `Haqiqatan ham «${selectedOption.value.label}» bo'yicha audit jurnallarini o'chirmoqchimisiz? Ushbu amalni ortga qaytarib bo'lmaydi!`;
});

const promptConfirmCleanup = () => {
  showConfirmDialog.value = true;
};

const executeCleanup = async () => {
  cleaningUp.value = true;
  try {
    const { data } = await api.delete(`/superadmin/audit-logs/cleanup?period=${selectedPeriod.value}`);
    toast.success(
      data?.message || 'Audit jurnallari muvaffaqiyatli tozalandi',
      'Audit Tozalash'
    );
    showConfirmDialog.value = false;
    showCleanupModal.value = false;
    emit('refresh');
  } catch (err: any) {
    toast.error(err?.response?.data?.message || 'Audit jurnallarini tozalashda xatolik yuz berdi', 'Xatolik');
  } finally {
    cleaningUp.value = false;
  }
};
</script>
