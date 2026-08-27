<template>
  <div class="space-y-4">
    <!-- Header Card: Info & Instant Backup Action -->
    <div class="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div class="space-y-1">
        <h3 class="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Database class="w-4 h-4 text-emerald-500" />
          <span>Ma'lumotlar Bazasi Zaxiralari (Automated Backups)</span>
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Avtomatik tungi zaxira har kuni soat 03:00 da olinadi va oxirgi 14 kunlik nusxalar xavfsiz saqlanadi.
        </p>
      </div>

      <button
        type="button"
        @click="createInstantBackup"
        :disabled="creatingBackup"
        class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition shadow-md shadow-emerald-500/20 disabled:opacity-50 inline-flex items-center gap-2 shrink-0 cursor-pointer"
      >
        <PlusCircle v-if="!creatingBackup" class="w-4 h-4" />
        <RefreshCw v-else class="w-4 h-4 animate-spin" />
        <span>{{ creatingBackup ? 'Zaxira olinmoqda...' : 'Hozir Zaxira Olish' }}</span>
      </button>
    </div>

    <!-- Backups List -->
    <div v-if="loading" class="py-12">
      <SkeletonLoader variant="table" text="Zaxira nusxalari yuklanmoqda..." />
    </div>

    <div v-else-if="backups.length === 0" class="py-12 text-center text-xs text-slate-400 glass-card rounded-2xl space-y-2">
      <Database class="w-8 h-8 text-slate-400 mx-auto opacity-60" />
      <p class="font-bold text-slate-700 dark:text-slate-300">Hozircha zaxira nusxalari mavjud emas</p>
      <p>Yuqoridagi "Hozir Zaxira Olish" tugmasini bosib, birinchi zaxirani yaratishingiz mumkin.</p>
    </div>

    <div v-else class="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <table class="w-full text-left text-xs">
        <thead>
          <tr class="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
            <th class="py-3 px-4 w-[40%]">Fayl Nomi</th>
            <th class="py-3 px-4 w-[18%]">Formati</th>
            <th class="py-3 px-4 w-[14%]">Hajmi</th>
            <th class="py-3 px-4 w-[18%]">Yaratilgan Sana</th>
            <th class="py-3 px-4 text-right w-[10%]">Amallar</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
          <tr
            v-for="b in backups"
            :key="b.filename"
            class="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition"
          >
            <!-- Filename -->
            <td class="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileArchive class="w-4 h-4 text-emerald-500 shrink-0" />
              <span class="truncate">{{ b.filename }}</span>
            </td>

            <!-- Format -->
            <td class="py-3.5 px-4">
              <span
                :class="[
                  'px-2 py-0.5 rounded-full text-[11px] font-black border',
                  b.type === 'pg_dump'
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                ]"
              >
                {{ b.type === 'pg_dump' ? 'PostgreSQL Dump (.sql)' : 'JSON Snapshot (.json)' }}
              </span>
            </td>

            <!-- Size -->
            <td class="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300">
              {{ b.sizeFormatted }}
            </td>

            <!-- Created At -->
            <td class="py-3.5 px-4 text-slate-500 dark:text-slate-400">
              {{ formatDate(b.createdAt) }}
            </td>

            <!-- Actions -->
            <td class="py-3.5 px-4 text-right whitespace-nowrap">
              <div class="inline-flex items-center gap-1.5">
                <!-- Download -->
                <button
                  type="button"
                  @click="downloadBackup(b.filename)"
                  :disabled="downloadingFilename === b.filename"
                  class="p-2 rounded-xl bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/60 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition disabled:opacity-50"
                  title="Faylni yuklab olish"
                >
                  <Download v-if="downloadingFilename !== b.filename" class="w-3.5 h-3.5" />
                  <RefreshCw v-else class="w-3.5 h-3.5 animate-spin text-emerald-500" />
                </button>

                <!-- Delete -->
                <button
                  type="button"
                  @click="deleteBackup(b.filename)"
                  class="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                  title="O'chirish"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Confirm Dialog -->
    <AppConfirmDialog
      :open="isDeleteConfirmOpen"
      title="Zaxira nusxasini o'chirish"
      :message="`Haqiqatdan ham &quot;${backupToDelete}&quot; zaxirasini o'chirmoqchimisiz?`"
      confirm-text="Ha, o'chirish"
      cancel-text="Bekor qilish"
      variant="danger"
      :loading="isDeletingBackup"
      @confirm="confirmDeleteBackup"
      @cancel="isDeleteConfirmOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  Database,
  PlusCircle,
  RefreshCw,
  FileArchive,
  Download,
  Trash2,
} from 'lucide-vue-next';
import api from '@/services/api';
import { useToast } from '@/composables/useToast';
import SkeletonLoader from '@/components/SkeletonLoader.vue';
import AppConfirmDialog from '@/components/AppConfirmDialog.vue';

const toast = useToast();
const backups = ref<any[]>([]);
const loading = ref(false);
const creatingBackup = ref(false);

const loadBackups = async () => {
  loading.value = true;
  try {
    const res = await api.get('/superadmin/backups');
    backups.value = res.data || [];
  } catch (err: any) {
    toast.error('Zaxiralarni yuklashda xatolik yuz berdi');
  } finally {
    loading.value = false;
  }
};

const createInstantBackup = async () => {
  creatingBackup.value = true;
  try {
    const res = await api.post('/superadmin/backups/create');
    toast.success(`Yangi zaxira yaratildi: ${res.data.filename} (${res.data.sizeFormatted})`);
    await loadBackups();
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Zaxira yaratishda xatolik yuz berdi');
  } finally {
    creatingBackup.value = false;
  }
};

const downloadingFilename = ref<string | null>(null);

const downloadBackup = async (filename: string) => {
  downloadingFilename.value = filename;
  toast.info('Zaxira fayli yuklab olinmoqda...');
  try {
    const res = await api.get(`/superadmin/backups/download/${encodeURIComponent(filename)}`, {
      responseType: 'blob',
    });

    const blob = new Blob([res.data], { type: 'application/octet-stream' });
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);

    toast.success('Zaxira fayli kompyuteringizga yuklab olindi!');
  } catch (err: any) {
    toast.error('Zaxira faylini yuklab olishda xatolik yuz berdi');
  } finally {
    downloadingFilename.value = null;
  }
};

const isDeleteConfirmOpen = ref(false);
const backupToDelete = ref<string | null>(null);
const isDeletingBackup = ref(false);

const deleteBackup = (filename: string) => {
  backupToDelete.value = filename;
  isDeleteConfirmOpen.value = true;
};

const confirmDeleteBackup = async () => {
  if (!backupToDelete.value) return;
  const filename = backupToDelete.value;
  isDeletingBackup.value = true;
  try {
    await api.delete(`/superadmin/backups/${encodeURIComponent(filename)}`);
    toast.success('Zaxira fayli o\'chirildi');
    backups.value = backups.value.filter((b) => b.filename !== filename);
    isDeleteConfirmOpen.value = false;
    backupToDelete.value = null;
  } catch (err: any) {
    toast.error('Faylni o\'chirishda xatolik yuz berdi');
  } finally {
    isDeletingBackup.value = false;
  }
};

const formatDate = (isoStr: string) => {
  if (!isoStr) return '—';
  const d = new Date(isoStr);
  return d.toLocaleString('uz-UZ', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

onMounted(() => {
  loadBackups();
});
</script>
