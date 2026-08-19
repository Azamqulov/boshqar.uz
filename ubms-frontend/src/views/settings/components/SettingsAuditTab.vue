<template>
  <div class="space-y-6 animate-fade-in">
    <!-- 1. Audit Haqida Tushuntirish & Xavfsizlik Paneli -->
    <div class="glass-card rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
      <div class="absolute -right-6 -bottom-6 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
        <div class="space-y-2 max-w-3xl">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
            <ShieldCheck class="w-4 h-4" />
            <span>Tizim Xavfsizligi & O'zgarishlar Nazorati</span>
          </div>

          <h3 class="text-lg font-black text-slate-900 dark:text-white tracking-tight">
            Audit Jurnallari nima va qanday ishlaydi?
          </h3>

          <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Audit jurnali — bu biznesingizdagi barcha xodimlar harakatlarini daqiqasigacha qayd etib boruvchi qat'iy xavfsizlik daftari. Tizimda <strong>mahsulot qo'shish</strong>, <strong>narxni o'zgartirish</strong>, <strong>mijozga qarz yozish</strong>, <strong>kassada to'lov bekor qilish</strong> yoki <strong>ma'lumotlarni o'chirish</strong> kabi har qanday amal bajarilganda, kim tomonidan, qachon va qaysi IP manzildan qilingani avtomatik yozib boriladi.
          </p>
        </div>

        <!-- Mini Stats Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2.5 shrink-0">
          <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-center">
            <span class="text-[10px] uppercase font-bold text-slate-400 block">Jami Yozuvlar</span>
            <span class="text-base font-black text-slate-900 dark:text-white font-mono">{{ auditLogs.length }} ta</span>
          </div>
          <div class="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <span class="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">Yaratishlar</span>
            <span class="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">{{ countByAction('post') }} ta</span>
          </div>
          <div class="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
            <span class="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block">O'zgarishlar</span>
            <span class="text-base font-black text-amber-600 dark:text-amber-400 font-mono">{{ countByAction('put') + countByAction('patch') }} ta</span>
          </div>
          <div class="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
            <span class="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 block">O'chirishlar</span>
            <span class="text-base font-black text-rose-600 dark:text-rose-400 font-mono">{{ countByAction('delete') }} ta</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. Qidiruv va Filterlar Boshqaruvi -->
    <div class="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
      <!-- Search Input -->
      <div class="w-full lg:w-80">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Xodim, bo'lim yoki IP bo'yicha qidiruv..."
            class="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 transition"
          />
        </div>
      </div>

      <!-- Action Type Filter Buttons, View Toggle & Cleanup -->
      <div class="flex items-center justify-between lg:justify-end gap-2.5 flex-wrap sm:flex-nowrap">
        <!-- Filter Tabs -->
        <div class="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
          <button
            type="button"
            @click="activeActionFilter = 'all'"
            class="px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap btn-interactive"
            :class="activeActionFilter === 'all' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
          >
            Barchasi ({{ auditLogs.length }})
          </button>
          <button
            type="button"
            @click="activeActionFilter = 'create'"
            class="px-2.5 py-1.5 rounded-lg font-bold transition whitespace-nowrap btn-interactive"
            :class="activeActionFilter === 'create' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-500 hover:text-emerald-600'"
          >
            Yaratish (+{{ countByAction('post') }})
          </button>
          <button
            type="button"
            @click="activeActionFilter = 'update'"
            class="px-2.5 py-1.5 rounded-lg font-bold transition whitespace-nowrap btn-interactive"
            :class="activeActionFilter === 'update' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-500 hover:text-amber-600'"
          >
            Tahrir
          </button>
          <button
            type="button"
            @click="activeActionFilter = 'delete'"
            class="px-2.5 py-1.5 rounded-lg font-bold transition whitespace-nowrap btn-interactive"
            :class="activeActionFilter === 'delete' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-500 hover:text-rose-600'"
          >
            O'chirish
          </button>
        </div>

        <div class="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

        <!-- View Switcher & Action Button -->
        <div class="flex items-center gap-2 shrink-0">
          <AppViewToggle v-model="viewMode" />

          <button
            type="button"
            @click="showCleanupModal = true"
            class="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold transition btn-interactive shadow-xs shrink-0"
            title="Keraksiz eski audit yozuvlarini tozalash"
          >
            <Trash2 class="w-3.5 h-3.5" />
            <span>Tozalash</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Skeleton Loading State -->
    <SkeletonLoader v-if="loading" variant="table" :rows="6" />

    <!-- 3. Table View -->
    <div v-else-if="viewMode === 'table'" class="glass-card rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase font-semibold tracking-wider">
            <tr>
              <th class="py-3.5 px-4">Sana & Vaqt</th>
              <th class="py-3.5 px-4">Xodim (F.I.SH)</th>
              <th class="py-3.5 px-4">Bajarilgan Amal</th>
              <th class="py-3.5 px-4">Tizim Bo'limi</th>
              <th class="py-3.5 px-4">IP Manzil / Qurilma</th>
              <th class="py-3.5 px-4 text-right">Tafsilot</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
            <!-- Empty State -->
            <tr v-if="filteredAuditLogs.length === 0">
              <td colspan="6" class="py-12 px-4 text-center">
                <div class="flex flex-col items-center justify-center max-w-md mx-auto text-center space-y-2">
                  <div class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-slate-400 flex items-center justify-center shadow-inner">
                    <FileClock class="w-6 h-6 opacity-60 text-emerald-500" />
                  </div>
                  <h4 class="font-bold text-slate-800 dark:text-slate-200 text-sm">Hozircha audit yozuvlari mavjud emas</h4>
                  <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed text-center">
                    Xodimlar tovar qo'shganda, narxlarni o'zgartirganda, to'lov yoki o'chirish amallarini bajarganda barcha harakatlar avtomatik tarzda shu yerga yoziladi.
                  </p>
                </div>
              </td>
            </tr>

            <!-- Log Rows -->
            <tr
              v-for="log in pagination.paginatedItems.value"
              :key="log.id"
              class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition group cursor-pointer"
              @click="openDetails(log)"
            >
              <!-- Date & Time -->
              <td class="py-3.5 px-4 font-mono whitespace-nowrap text-slate-500 dark:text-slate-400">
                <div class="flex items-center gap-1.5">
                  <Calendar class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{{ formatDate(log.createdAt) }}</span>
                </div>
              </td>

              <!-- User -->
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs shrink-0">
                    {{ (log.user?.fullName || 'U').charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <span class="font-bold text-slate-900 dark:text-white block">{{ log.user?.fullName || 'Tizim' }}</span>
                    <span class="text-[10px] text-slate-400 font-mono">{{ log.user?.phone || '-' }}</span>
                  </div>
                </div>
              </td>

              <!-- Action Badge -->
              <td class="py-3.5 px-4">
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border"
                  :class="getActionBadgeClass(log.action)"
                >
                  <component :is="getActionIcon(log.action)" class="w-3.5 h-3.5 shrink-0" />
                  <span>{{ getActionLabel(log.action) }}</span>
                </span>
              </td>

              <!-- Entity (Section) Badge -->
              <td class="py-3.5 px-4 font-semibold">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 text-xs border border-slate-200/60 dark:border-slate-700/60">
                  <component :is="getEntityIcon(log.entity)" class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{{ getEntityLabel(log.entity) }}</span>
                </span>
              </td>

              <!-- IP Address & User Agent -->
              <td class="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                <span class="block text-slate-700 dark:text-slate-300 font-semibold">{{ formatIpAddress(log.ipAddress) }}</span>
                <span v-if="log.userAgent" class="text-[10px] text-slate-400 truncate max-w-[140px] block" :title="log.userAgent">
                  {{ log.userAgent.split(' ')[0] }}
                </span>
              </td>

              <!-- Action: View details -->
              <td class="py-3.5 px-4 text-right">
                <button
                  type="button"
                  @click.stop="openDetails(log)"
                  class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
                  title="Batafsil ko'rish"
                >
                  <Eye class="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 4. Grid / Card View -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-if="filteredAuditLogs.length === 0" class="col-span-full glass-card rounded-2xl p-10 text-center flex flex-col items-center justify-center space-y-2">
        <div class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-slate-400 flex items-center justify-center shadow-inner">
          <FileClock class="w-6 h-6 opacity-60 text-emerald-500" />
        </div>
        <h4 class="font-bold text-slate-800 dark:text-slate-200 text-sm">Hozircha audit yozuvlari mavjud emas</h4>
        <p class="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed text-center">
          Xodimlar tovar qo'shganda, narxlarni o'zgartirganda, to'lov yoki o'chirish amallarini bajarganda barcha harakatlar avtomatik tarzda shu yerga yoziladi.
        </p>
      </div>

      <div
        v-for="log in pagination.paginatedItems.value"
        :key="log.id"
        class="glass-card rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 group cursor-pointer"
        @click="openDetails(log)"
      >
        <div class="space-y-3">
          <!-- Card Header -->
          <div class="flex items-center justify-between gap-2">
            <span
              class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold border"
              :class="getActionBadgeClass(log.action)"
            >
              <component :is="getActionIcon(log.action)" class="w-3 h-3 shrink-0" />
              <span>{{ getActionLabel(log.action) }}</span>
            </span>

            <span class="text-[10px] text-slate-400 font-mono flex items-center gap-1">
              <Calendar class="w-3 h-3 shrink-0" />
              {{ formatDate(log.createdAt) }}
            </span>
          </div>

          <!-- User Info -->
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs shrink-0">
              {{ (log.user?.fullName || 'U').charAt(0).toUpperCase() }}
            </div>
            <div class="min-w-0">
              <p class="font-bold text-xs text-slate-900 dark:text-white truncate">{{ log.user?.fullName || 'Tizim' }}</p>
              <p class="text-[10px] text-slate-400 font-mono">{{ log.user?.phone || '-' }}</p>
            </div>
          </div>

          <!-- Entity / Section with Lucide Icon -->
          <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs">
            <span class="text-slate-500 dark:text-slate-400 font-medium">Bo'lim:</span>
            <span class="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <component :is="getEntityIcon(log.entity)" class="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
              <span>{{ getEntityLabel(log.entity) }}</span>
            </span>
          </div>
        </div>

        <!-- Footer -->
        <div class="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>IP: {{ formatIpAddress(log.ipAddress) }}</span>
          <span class="text-emerald-600 dark:text-emerald-400 font-bold group-hover:underline flex items-center gap-0.5">
            Batafsil <ChevronRight class="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <AppPagination
      v-if="!loading"
      v-model:current-page="pagination.currentPage.value"
      v-model:page-size="pagination.pageSize.value"
      :total-items="filteredAuditLogs.length"
      item-name="audit yozuvi"
    />

    <!-- 5. Detail Modal Component -->
    <AuditDetailModal
      :selected-log="selectedLog"
      :get-action-badge-class="getActionBadgeClass"
      :get-action-icon="getActionIcon"
      :format-action-name="getActionLabel"
      :format-date="formatDate"
      :get-audit-description="getAuditDescription"
      :flatten-payload="flattenPayload"
      :format-field-label="formatFieldLabel"
      :format-field-value="formatFieldValue"
      @close="selectedLog = null"
    />

    <!-- 6. Cleanup Audit Modal Component -->
    <AuditCleanupModal
      :is-open="showCleanupModal"
      v-model:selected-period="selectedPeriod"
      :cleanup-options="cleanupOptions"
      :cleaning-up="cleaningUp"
      @close="showCleanupModal = false"
      @prompt-confirm="promptConfirmCleanup"
    />

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
import { ref, computed, watch } from 'vue';
import {
  ShieldCheck,
  Search,
  Calendar,
  Eye,
  PlusCircle,
  Edit,
  Trash2,
  Activity,
  FileClock,
  X,
  ChevronRight,
  Package,
  FolderTree,
  Users,
  Truck,
  ShoppingCart,
  DollarSign,
  Settings,
  UtensilsCrossed,
  Clock,
  Building2,
  FileText,
  CreditCard,
  Lock,
  AlertTriangle,
  RefreshCw,
} from 'lucide-vue-next';
import AppViewToggle from '../../../components/AppViewToggle.vue';
import AppButton from '../../../components/AppButton.vue';
import AppPagination from '../../../components/AppPagination.vue';
import AppConfirmDialog from '../../../components/AppConfirmDialog.vue';
import SkeletonLoader from '../../../components/SkeletonLoader.vue';
import { useFormat } from '../../../composables/useFormat';
import { usePagination } from '../../../composables/usePagination';
import { useToast } from '../../../composables/useToast';
import api from '../../../services/api';
import AuditDetailModal from './AuditDetailModal.vue';
import AuditCleanupModal from './AuditCleanupModal.vue';

const props = defineProps<{
  auditLogs: any[];
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'refresh'): void;
}>();

const toast = useToast();
const { formatDate } = useFormat();

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
    return 'Haqiqatan ham BARCHA audit yozuvlarini butunlay o\'chirib tashlamoqchimisiz? Ushbu amalni ortga qaytarib bo\'lmaydi!';
  }
  return `Haqiqatan ham «${selectedOption.value.label}» bo'yicha audit jurnallarini o'chirmoqchimisiz? Ushbu amalni ortga qaytarib bo'lmaydi!`;
});

const promptConfirmCleanup = () => {
  showConfirmDialog.value = true;
};

const executeCleanup = async () => {
  cleaningUp.value = true;
  try {
    const { data } = await api.delete(`/audit-logs/cleanup?period=${selectedPeriod.value}`);
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

const viewMode = ref<'table' | 'grid'>('table');
const searchQuery = ref('');
const activeActionFilter = ref<'all' | 'create' | 'update' | 'delete'>('all');
const selectedLog = ref<any | null>(null);

const countByAction = (actionStr: string) => {
  return props.auditLogs.filter((l) => (l.action || '').toLowerCase().includes(actionStr)).length;
};

// Filtered logs
const filteredAuditLogs = computed(() => {
  let list = props.auditLogs || [];

  // Filter by action type
  if (activeActionFilter.value === 'create') {
    list = list.filter((l) => (l.action || '').toLowerCase().includes('post') || (l.action || '').toLowerCase().includes('create'));
  } else if (activeActionFilter.value === 'update') {
    list = list.filter((l) => (l.action || '').toLowerCase().includes('put') || (l.action || '').toLowerCase().includes('patch') || (l.action || '').toLowerCase().includes('update'));
  } else if (activeActionFilter.value === 'delete') {
    list = list.filter((l) => (l.action || '').toLowerCase().includes('delete'));
  }

  // Filter by search query
  if (!searchQuery.value.trim()) return list;
  const q = searchQuery.value.toLowerCase().trim();
  return list.filter((l) => {
    return (
      (l.user?.fullName && l.user.fullName.toLowerCase().includes(q)) ||
      (l.entity && l.entity.toLowerCase().includes(q)) ||
      (l.action && l.action.toLowerCase().includes(q)) ||
      (l.ipAddress && l.ipAddress.includes(q))
    );
  });
});

const pagination = usePagination(filteredAuditLogs);

watch([searchQuery, activeActionFilter], () => {
  pagination.resetPage();
});

const getActionLabel = (action: string) => {
  const a = (action || '').toLowerCase();
  if (a.includes('post') || a.includes('create')) return "Yangi Yaratildi";
  if (a.includes('put') || a.includes('patch') || a.includes('update')) return "Tahrirlandi";
  if (a.includes('delete') || a.includes('remove')) return "O'chirildi";
  if (a.includes('pay')) return "To'lov Kiritildi";
  if (a.includes('login')) return "Tizimga Kirish";
  return action.toUpperCase();
};

const getActionBadgeClass = (action: string) => {
  const a = (action || '').toLowerCase();
  if (a.includes('post') || a.includes('create')) {
    return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25';
  }
  if (a.includes('put') || a.includes('patch') || a.includes('update')) {
    return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25';
  }
  if (a.includes('delete') || a.includes('remove')) {
    return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25';
  }
  return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25';
};

const getActionIcon = (action: string) => {
  const a = (action || '').toLowerCase();
  if (a.includes('post') || a.includes('create')) return PlusCircle;
  if (a.includes('put') || a.includes('patch') || a.includes('update')) return Edit;
  if (a.includes('delete') || a.includes('remove')) return Trash2;
  if (a.includes('pay')) return CreditCard;
  if (a.includes('login')) return Lock;
  return Activity;
};

const getEntityLabel = (entity: string) => {
  const e = (entity || '').toLowerCase();
  const map: Record<string, string> = {
    products: 'Mahsulotlar',
    categories: 'Kategoriyalar',
    customers: 'Mijozlar (CRM)',
    suppliers: 'Ta\'minotchilar',
    orders: 'Buyurtmalar & Kassa',
    employees: 'Xodimlar & Ruxsatlar',
    finance: 'Moliya & Xarajatlar',
    settings: 'Tizim Sozlamalari',
    tables: 'Stollar Xaritasi',
    appointments: 'Bandlovlar',
    auth: 'Autentifikatsiya',
    businesses: 'Biznes Parametrlari',
    shifts: 'Kassa Smenalari',
    users: 'Foydalanuvchilar',
    plans: 'Tarif Rejalari',
    receipt: 'Chek & Printer',
    discounts: 'Chegirmalar',
  };
  return map[e] || entity || 'Umumiy';
};

const getAuditDescription = (log: any) => {
  const user = log.user?.fullName || log.user?.phone || 'Xodim';
  const entity = getEntityLabel(log.entity);
  const action = getActionLabel(log.action);
  return `${user} tomonidan «${entity}» bo'limida «${action}» amali bajarildi.`;
};

const getEntityIcon = (entity: string) => {
  const e = (entity || '').toLowerCase();
  if (e.includes('product')) return Package;
  if (e.includes('category')) return FolderTree;
  if (e.includes('customer')) return Users;
  if (e.includes('supplier')) return Truck;
  if (e.includes('order')) return ShoppingCart;
  if (e.includes('employee') || e.includes('user')) return Users;
  if (e.includes('finance')) return DollarSign;
  if (e.includes('setting')) return Settings;
  if (e.includes('table')) return UtensilsCrossed;
  if (e.includes('appointment')) return Calendar;
  if (e.includes('business')) return Building2;
  if (e.includes('shift')) return Clock;
  if (e.includes('auth')) return ShieldCheck;
  return FileText;
};

const formatFieldLabel = (key: string) => {
  const map: Record<string, string> = {
    amount: 'Summa',
    fullName: 'F.I.SH (Ism)',
    name: 'Nomi',
    phone: 'Telefon raqam',
    notes: 'Izoh / Sabab',
    debt: 'Qarz summasi',
    price: 'Sotuv narxi',
    costPrice: 'Tannarx',
    stock: 'Qoldiq miqdori',
    barcode: 'Shtrix-kod',
    role: 'Lavozim',
    categoryId: 'Kategoriya',
    businessId: 'Biznes ID',
    status: 'Holat',
    email: 'Email',
    paymentMethod: "To'lov turi",
    discount: 'Chegirma',
    totalPrice: 'Jami summa',
  };
  return map[key] || key;
};

const formatFieldValue = (val: any, key?: string) => {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'boolean') return val ? 'Ha (Yoqilgan)' : "Yo'q (O'chirilgan)";
  if (typeof val === 'number') {
    if (key && (key.toLowerCase().includes('amount') || key.toLowerCase().includes('price') || key.toLowerCase().includes('debt') || key.toLowerCase().includes('cost'))) {
      return `${val.toLocaleString('uz-UZ')} so'm`;
    }
    return val.toLocaleString('uz-UZ');
  }
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
};

const flattenPayload = (obj: any): Record<string, any> => {
  if (!obj || typeof obj !== 'object') return {};
  const res: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    // skip internal redundant fields
    if (['password', 'hash', 'token'].includes(k)) continue;
    res[k] = v;
  }
  return res;
};

const formatIpAddress = (ip?: string) => {
  if (!ip) return '127.0.0.1 (Mahalliy)';
  const cleaned = String(ip).trim();
  if (cleaned === '::1' || cleaned === '::ffff:127.0.0.1' || cleaned === '127.0.0.1') {
    return '127.0.0.1 (Mahalliy)';
  }
  if (cleaned.startsWith('::ffff:')) {
    return cleaned.replace('::ffff:', '');
  }
  return cleaned;
};

const openDetails = (log: any) => {
  selectedLog.value = log;
};
</script>
