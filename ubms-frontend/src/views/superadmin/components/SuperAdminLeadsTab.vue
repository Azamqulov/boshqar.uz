<template>
  <div class="space-y-6">
    <!-- Top Statistics Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
        <div class="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span class="text-xs font-semibold">Jami Leadlar</span>
          <Target class="w-4 h-4 text-indigo-500" />
        </div>
        <div class="text-2xl font-black text-slate-900 dark:text-white">
          {{ stats.total || 0 }}
        </div>
        <div class="text-[11px] text-slate-400">Demo ochganlar</div>
      </div>

      <div class="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 shadow-xs space-y-1">
        <div class="flex items-center justify-between text-amber-600 dark:text-amber-400">
          <span class="text-xs font-semibold">Yangi (Kutilmoqda)</span>
          <Clock class="w-4 h-4" />
        </div>
        <div class="text-2xl font-black text-amber-600 dark:text-amber-400">
          {{ stats.new || 0 }}
        </div>
        <div class="text-[11px] text-amber-600/70 dark:text-amber-400/70">Qo'ng'iroq kutilmoqda</div>
      </div>

      <div class="p-4 rounded-2xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 shadow-xs space-y-1">
        <div class="flex items-center justify-between text-blue-600 dark:text-blue-400">
          <span class="text-xs font-semibold">Bog'lanildi</span>
          <PhoneCall class="w-4 h-4" />
        </div>
        <div class="text-2xl font-black text-blue-600 dark:text-blue-400">
          {{ stats.contacted || 0 }}
        </div>
        <div class="text-[11px] text-blue-600/70 dark:text-blue-400/70">Muzokara ketmoqda</div>
      </div>

      <div class="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 shadow-xs space-y-1">
        <div class="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
          <span class="text-xs font-semibold">Mijozga Aylandi</span>
          <CheckCircle2 class="w-4 h-4" />
        </div>
        <div class="text-2xl font-black text-emerald-600 dark:text-emerald-400">
          {{ stats.converted || 0 }}
        </div>
        <div class="text-[11px] text-emerald-600/70 dark:text-emerald-400/70">Sotuv amalga oshdi</div>
      </div>

      <div class="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/20 shadow-xs space-y-1">
        <div class="flex items-center justify-between text-purple-600 dark:text-purple-400">
          <span class="text-xs font-semibold">Konversiya (CR)</span>
          <TrendingUp class="w-4 h-4" />
        </div>
        <div class="text-2xl font-black text-purple-600 dark:text-purple-400">
          {{ conversionRate }}%
        </div>
        <div class="text-[11px] text-purple-600/70 dark:text-purple-400/70">Muvaffaqiyat ko'rsatkichi</div>
      </div>
    </div>

    <!-- Filter & Action Bar -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
      <div class="flex flex-wrap items-center gap-3 w-full sm:w-auto">
        <div class="relative flex-1 sm:w-64">
          <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            v-model="searchQuery"
            @input="debouncedFetch"
            type="text"
            placeholder="Korxona, telefon yoki soha..."
            class="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500"
          />
        </div>

        <div class="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            v-for="s in statusTabs"
            :key="s.id"
            @click="selectedStatus = s.id; fetchLeads()"
            type="button"
            class="px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap"
            :class="selectedStatus === s.id ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
          >
            {{ s.label }}
          </button>
        </div>
      </div>

      <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
        <button
          @click="fetchLeads"
          :disabled="loading"
          class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
        >
          <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
          <span>Yangilash</span>
        </button>
      </div>
    </div>

    <!-- Leads Table / List -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
      <div v-if="loading && leads.length === 0" class="p-12 text-center text-slate-400 space-y-3">
        <RefreshCw class="w-8 h-8 animate-spin mx-auto text-emerald-500" />
        <p class="text-xs">Demo leadlar yuklanmoqda...</p>
      </div>

      <div v-else-if="leads.length === 0" class="p-12 text-center text-slate-400 space-y-3">
        <Users class="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
        <p class="text-sm font-semibold text-slate-600 dark:text-slate-300">Hech qanday demo lead topilmadi</p>
        <p class="text-xs text-slate-400">Saytdan kimdir demo hisob ochganda bu yerda avtomatik paydo bo'ladi.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200/80 dark:border-slate-800">
            <tr>
              <th class="py-3.5 px-4">Sana & Vaqt</th>
              <th class="py-3.5 px-4">Korxona Nomi</th>
              <th class="py-3.5 px-4">Soha Turi</th>
              <th class="py-3.5 px-4">Telefon Raqami</th>
              <th class="py-3.5 px-4">Holat (Status)</th>
              <th class="py-3.5 px-4">Izoh (Notes)</th>
              <th class="py-3.5 px-4 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-300">
            <tr v-for="lead in leads" :key="lead.id" class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
              <!-- Created At -->
              <td class="py-3.5 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                {{ formatDateTime(lead.createdAt) }}
              </td>

              <!-- Company Name -->
              <td class="py-3.5 px-4">
                <div class="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Building2 class="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{{ lead.companyName }}</span>
                </div>
              </td>

              <!-- Business Type Badge -->
              <td class="py-3.5 px-4 whitespace-nowrap">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {{ formatBusinessType(lead.businessType) }}
                </span>
              </td>

              <!-- Phone & Actions -->
              <td class="py-3.5 px-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <a
                    :href="'tel:' + lead.phone.replace(/[^0-9+]/g, '')"
                    class="font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Phone class="w-3 h-3" />
                    <span>{{ lead.phone }}</span>
                  </a>
                  <a
                    :href="'https://t.me/' + lead.phone.replace(/[^0-9]/g, '')"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Telegramda yozish"
                    class="p-1 rounded-lg bg-sky-500/10 text-sky-500 hover:bg-sky-500/20 transition"
                  >
                    <Send class="w-3 h-3" />
                  </a>
                </div>
              </td>

              <!-- Status Dropdown / Badge -->
              <td class="py-2 px-3 whitespace-nowrap w-44">
                <AppSelect
                  :model-value="lead.status"
                  @update:model-value="onStatusChange(lead, $event)"
                  :options="leadStatusOptions"
                  customClass="!py-1 !px-2.5 !rounded-lg text-xs"
                />
              </td>

              <!-- Notes -->
              <td class="py-3.5 px-4 max-w-xs">
                <div v-if="editingNoteId === lead.id" class="flex items-center gap-1">
                  <input
                    v-model="tempNote"
                    @keyup.enter="saveNote(lead)"
                    type="text"
                    placeholder="Izoh yozing..."
                    class="w-full px-2 py-1 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                  <button @click="saveNote(lead)" class="p-1 text-emerald-500 hover:text-emerald-600">
                    <Check class="w-3.5 h-3.5" />
                  </button>
                  <button @click="editingNoteId = null" class="p-1 text-slate-400 hover:text-slate-600">
                    <X class="w-3.5 h-3.5" />
                  </button>
                </div>
                <div
                  v-else
                  @click="startEditNote(lead)"
                  class="cursor-pointer group flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <span class="truncate">{{ lead.notes || '+ Izoh qo\'shish...' }}</span>
                  <Edit3 class="w-3 h-3 opacity-0 group-hover:opacity-100 transition shrink-0" />
                </div>
              </td>

              <!-- Actions -->
              <td class="py-3.5 px-4 text-right whitespace-nowrap">
                <button
                  @click="promptDeleteLead(lead.id)"
                  title="O'chirish"
                  class="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Confirmation Dialog -->
    <AppConfirmDialog
      :open="isDeleteConfirmOpen"
      title="Leadni o'chirish"
      message="Ushbu demo leadni ro'yxatdan o'chirishni tasdiqlaysizmi?"
      confirm-text="Ha, o'chirish"
      cancel-text="Bekor qilish"
      variant="danger"
      :loading="isDeleting"
      @confirm="confirmDeleteLead"
      @cancel="isDeleteConfirmOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../../services/api';
import { useToast } from '../../../composables/useToast';
import AppConfirmDialog from '../../../components/AppConfirmDialog.vue';
import {
  Target,
  Clock,
  PhoneCall,
  CheckCircle2,
  TrendingUp,
  Search,
  RefreshCw,
  Users,
  Building2,
  Phone,
  Send,
  Trash2,
  Edit3,
  Check,
  X,
} from 'lucide-vue-next';

import AppSelect from '@/components/AppSelect.vue';

const leadStatusOptions = [
  { value: 'new', label: 'Yangi', color: '#f59e0b' },
  { value: 'contacted', label: "Bog'lanildi", color: '#3b82f6' },
  { value: 'converted', label: 'Mijozga aylandi', color: '#10b981' },
  { value: 'rejected', label: 'Rad etildi', color: '#ef4444' },
];

const toast = useToast();

interface DemoLeadItem {
  id: string;
  companyName: string;
  phone: string;
  businessType: string;
  status: string;
  notes: string | null;
  createdAt: string;
}

const leads = ref<DemoLeadItem[]>([]);
const loading = ref(false);
const searchQuery = ref('');
const selectedStatus = ref('all');

const stats = ref({
  total: 0,
  new: 0,
  contacted: 0,
  converted: 0,
  rejected: 0,
});

const statusTabs = [
  { id: 'all', label: 'Barchasi' },
  { id: 'new', label: 'Yangi' },
  { id: 'contacted', label: 'Bog\'lanildi' },
  { id: 'converted', label: 'Mijozga aylandi' },
  { id: 'rejected', label: 'Rad etildi' },
];

const conversionRate = computed(() => {
  if (!stats.value.total) return 0;
  return Math.round((stats.value.converted / stats.value.total) * 100);
});

let debounceTimer: any = null;
const debouncedFetch = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    fetchLeads();
  }, 300);
};

const fetchLeads = async () => {
  loading.value = true;
  try {
    const { data } = await api.get('/superadmin/demo-leads', {
      params: {
        search: searchQuery.value || undefined,
        status: selectedStatus.value !== 'all' ? selectedStatus.value : undefined,
        limit: 100,
      },
    });

    leads.value = data.leads || [];
    if (data.stats) {
      stats.value = data.stats;
    }
  } catch (err: any) {
    toast.error('Leadlarni yuklashda xatolik yuz berdi');
  } finally {
    loading.value = false;
  }
};

const onStatusChange = async (lead: DemoLeadItem, newStatus: string) => {
  const oldStatus = lead.status;
  lead.status = newStatus;
  try {
    await api.patch(`/superadmin/demo-leads/${lead.id}`, {
      status: newStatus,
    });
    toast.success('Lead holati yangilandi');
    fetchLeads();
  } catch (err) {
    lead.status = oldStatus;
    toast.error('Holatni o\'zgartirishda xatolik');
  }
};

const editingNoteId = ref<string | null>(null);
const tempNote = ref('');

const startEditNote = (lead: DemoLeadItem) => {
  editingNoteId.value = lead.id;
  tempNote.value = lead.notes || '';
};

const saveNote = async (lead: DemoLeadItem) => {
  try {
    await api.patch(`/superadmin/demo-leads/${lead.id}`, {
      notes: tempNote.value,
    });
    lead.notes = tempNote.value;
    editingNoteId.value = null;
    toast.success('Izoh saqlandi');
  } catch (err) {
    toast.error('Izohni saqlashda xatolik');
  }
};

const isDeleteConfirmOpen = ref(false);
const leadToDeleteId = ref<string | null>(null);
const isDeleting = ref(false);

const promptDeleteLead = (id: string) => {
  leadToDeleteId.value = id;
  isDeleteConfirmOpen.value = true;
};

const confirmDeleteLead = async () => {
  if (!leadToDeleteId.value) return;
  isDeleting.value = true;
  try {
    const id = leadToDeleteId.value;
    await api.delete(`/superadmin/demo-leads/${id}`);
    leads.value = leads.value.filter((l) => l.id !== id);
    toast.success('Lead o\'chirildi');
    isDeleteConfirmOpen.value = false;
    leadToDeleteId.value = null;
    fetchLeads();
  } catch (err) {
    toast.error('O\'chirishda xatolik');
  } finally {
    isDeleting.value = false;
  }
};

const getStatusClasses = (status: string) => {
  switch (status) {
    case 'new':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    case 'contacted':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    case 'converted':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    case 'rejected':
      return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
    default:
      return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700';
  }
};

const formatBusinessType = (type: string) => {
  const map: Record<string, string> = {
    shop: 'Do\'kon / Savdo',
    restaurant: 'Restoran / Kafe',
    cafe: 'Qahvaxona',
    barbershop: 'Saloni / Go\'zallik',
    pharmacy: 'Dorixona (Apteka)',
    confectionery: 'Qandolatxona',
    service: 'Xizmat ko\'rsatish',
    other: 'Boshqa',
  };
  return map[type] || type;
};

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

onMounted(() => {
  fetchLeads();
});
</script>
