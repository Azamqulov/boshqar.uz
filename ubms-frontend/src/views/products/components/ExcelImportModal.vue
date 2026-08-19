<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay !z-[99999]" @click.self="closeModal">
      <div
        class="modal-container max-w-2xl bg-white dark:bg-slate-900 shadow-2xl rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        @click.stop
      >
        <!-- Modal Header -->
        <div class="modal-header flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 shadow-xs">
              <FileSpreadsheet class="w-5 h-5" />
            </div>
            <div>
              <h3 class="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>Excel & 1C Mahsulotlar Importi</span>
                <span class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase">Faol</span>
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Minglab tovarlarni Excel (.xlsx, .csv) fayl orqali bir zumda tizimga yuklang
              </p>
            </div>
          </div>
          <button
            type="button"
            @click="closeModal"
            class="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          <!-- Step 1: Template Download Banner -->
          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="space-y-1">
              <div class="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                <Info class="w-4 h-4 text-emerald-500" />
                <span>1-Qadam: Namuna Excel shablonini oling</span>
              </div>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Faylingiz to'g'ri o'qilishi uchun namunaviy ustunlar tuzilishidan foydalaning.
              </p>
            </div>
            <button
              type="button"
              @click="downloadSampleTemplate"
              class="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-700 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-600 shadow-xs flex items-center gap-2 transition shrink-0"
            >
              <Download class="w-4 h-4 text-emerald-500" />
              <span>Shablonni Yuklab Olish</span>
            </button>
          </div>

          <!-- Step 2: Drag & Drop File Zone -->
          <div
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleFileDrop"
            class="relative p-6 sm:p-8 rounded-2xl border-2 border-dashed transition flex flex-col items-center justify-center text-center cursor-pointer group"
            :class="[
              isDragging
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                : selectedFile
                ? 'border-emerald-500/50 bg-slate-50 dark:bg-slate-800/40'
                : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500/50 bg-slate-50/50 dark:bg-slate-800/20'
            ]"
            @click="triggerFileInput"
          >
            <input
              ref="fileInputRef"
              type="file"
              accept=".csv, .xlsx, .xls, text/csv"
              class="hidden"
              @change="handleFileSelect"
            />

            <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <UploadCloud class="w-6 h-6" />
            </div>

            <div v-if="selectedFile" class="space-y-1">
              <span class="font-extrabold text-sm text-slate-900 dark:text-white block">
                {{ selectedFile.name }}
              </span>
              <span class="text-xs text-slate-500 dark:text-slate-400 block">
                {{ (selectedFile.size / 1024).toFixed(1) }} KB • Tanlangan faylni almashtirish uchun bosing
              </span>
            </div>
            <div v-else class="space-y-1">
              <span class="font-bold text-sm text-slate-900 dark:text-white block">
                Excel yoki CSV faylni bu yerga tashlang
              </span>
              <span class="text-xs text-slate-500 dark:text-slate-400 block">
                yoki kompyuterdan tanlash uchun bosing (.xlsx, .csv)
              </span>
            </div>
          </div>

          <!-- Step 3: Parsed Data Preview Table -->
          <div v-if="parsedItems.length > 0" class="space-y-3">
            <div class="flex items-center justify-between text-xs">
              <div class="font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Topilgan tovarlar:</span>
                <span class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                  {{ parsedItems.length }} ta
                </span>
              </div>
              <span class="text-[11px] text-slate-400">Birinchi 5 ta tovar namunasi:</span>
            </div>

            <div class="rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto max-h-48 scrollbar-thin">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-bold sticky top-0">
                  <tr>
                    <th class="p-2.5">#</th>
                    <th class="p-2.5">Tovar Nomi</th>
                    <th class="p-2.5">Sotuv Narxi</th>
                    <th class="p-2.5">Tannarx</th>
                    <th class="p-2.5">Qoldiq</th>
                    <th class="p-2.5">Shtrix-kod</th>
                    <th class="p-2.5">Kategoriya</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
                  <tr v-for="(item, idx) in parsedItems.slice(0, 5)" :key="idx" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td class="p-2.5 text-slate-400 font-mono">{{ idx + 1 }}</td>
                    <td class="p-2.5 font-bold text-slate-900 dark:text-white">{{ item.name }}</td>
                    <td class="p-2.5 font-mono text-emerald-600 dark:text-emerald-400 font-bold">{{ item.salePrice?.toLocaleString('uz-UZ') }} so'm</td>
                    <td class="p-2.5 font-mono text-slate-500">{{ item.purchasePrice ? item.purchasePrice.toLocaleString('uz-UZ') + " so'm" : '-' }}</td>
                    <td class="p-2.5 font-bold text-slate-700 dark:text-slate-300">{{ item.initialStock || 0 }} {{ item.unitName || 'dona' }}</td>
                    <td class="p-2.5 font-mono text-slate-400 text-[11px]">{{ item.barcode || '-' }}</td>
                    <td class="p-2.5 text-slate-500">{{ item.categoryName || 'Umumiy' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer flex items-center justify-between p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
          >
            Bekor Qilish
          </button>

          <button
            type="button"
            @click="submitImport"
            :disabled="parsedItems.length === 0 || isImporting"
            class="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-xs shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition btn-interactive cursor-pointer"
          >
            <RefreshCw v-if="isImporting" class="w-4 h-4 animate-spin" />
            <CheckCircle2 v-else class="w-4 h-4" />
            <span>{{ isImporting ? 'Yuklanmoqda...' : `${parsedItems.length} ta Tovarni Tizimga Saqlash` }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { FileSpreadsheet, Download, UploadCloud, X, Info, CheckCircle2, RefreshCw } from 'lucide-vue-next';
import api from '../../../services/api';
import { useToast } from '../../../composables/useToast';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'imported'): void;
}>();

const toast = useToast();
const fileInputRef = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const isDragging = ref(false);
const parsedItems = ref<any[]>([]);
const isImporting = ref(false);

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const closeModal = () => {
  if (isImporting.value) return;
  selectedFile.value = null;
  parsedItems.value = [];
  emit('close');
};

const downloadSampleTemplate = () => {
  const csvContent =
    'Nomi,Sotuv Narxi,Tannarxi,Qoldiq,Minimal Zaxira,Shtrixkod,SKU,Kategoriya,Birlik\n' +
    'Coca-Cola 1.5L,14000,11000,50,10,4780001234567,PRD-CC15,Ichimliklar,dona\n' +
    'Non (Buxanka),4000,3000,100,20,4780009876543,PRD-NON01,Non mahsulotlari,dona\n' +
    'Kungaboqar yogi 1L,21000,17500,30,5,4780004567890,PRD-YOG01,Oziq-ovqat,dona\n' +
    'Qand (Shakar) 1kg,13500,11500,80,15,4780005678901,PRD-SHAK01,Oziq-ovqat,kg\n';

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'boshqar_uz_namuna_tovarlar.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  toast.success('Namuna shablon yuklab olindi!', 'Excel Import');
};

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    processFile(target.files[0]);
  }
};

const handleFileDrop = (e: DragEvent) => {
  isDragging.value = false;
  if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
    processFile(e.dataTransfer.files[0]);
  }
};

const processFile = (file: File) => {
  selectedFile.value = file;
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const text = (e.target?.result as string) || '';
      parseCsvContent(text);
    } catch (err: any) {
      toast.error('Faylni o\'qishda xatolik yuz berdi: ' + err.message, 'Xatolik');
    }
  };

  reader.readAsText(file, 'UTF-8');
};

const parseCsvContent = (content: string) => {
  const lines = content
    .split(/\r\n|\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length <= 1) {
    toast.warning('Faylda ma\'lumotlar topilmadi', 'Bo\'sh fayl');
    return;
  }

  // Detect delimiter (comma or semicolon)
  const headerLine = lines[0];
  const delimiter = headerLine.includes(';') ? ';' : ',';
  const headers = headerLine.split(delimiter).map((h) => h.replace(/^["']|["']$/g, '').trim().toLowerCase());

  const nameIdx = headers.findIndex((h) => h.includes('nom') || h.includes('name') || h.includes('tovar'));
  const priceIdx = headers.findIndex((h) => h.includes('sotuv') || h.includes('narx') || h.includes('price'));
  const costIdx = headers.findIndex((h) => h.includes('tan') || h.includes('tannarx') || h.includes('cost') || h.includes('kirim'));
  const stockIdx = headers.findIndex((h) => h.includes('qoldiq') || h.includes('stock') || h.includes('soni') || h.includes('qty'));
  const minStockIdx = headers.findIndex((h) => h.includes('min') || h.includes('minimal'));
  const barcodeIdx = headers.findIndex((h) => h.includes('shtrix') || h.includes('barcode') || h.includes('kod'));
  const skuIdx = headers.findIndex((h) => h.includes('sku') || h.includes('artikul'));
  const catIdx = headers.findIndex((h) => h.includes('kategoriya') || h.includes('category') || h.includes('guruh'));
  const unitIdx = headers.findIndex((h) => h.includes('birlik') || h.includes('unit') || h.includes('o\'lchov'));

  const items: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(delimiter).map((c) => c.replace(/^["']|["']$/g, '').trim());
    if (cols.length === 0 || !cols[nameIdx !== -1 ? nameIdx : 0]) continue;

    const name = cols[nameIdx !== -1 ? nameIdx : 0];
    const salePrice = priceIdx !== -1 ? Number(cols[priceIdx].replace(/[^\d.]/g, '')) || 0 : 0;
    const purchasePrice = costIdx !== -1 ? Number(cols[costIdx].replace(/[^\d.]/g, '')) || 0 : 0;
    const initialStock = stockIdx !== -1 ? Number(cols[stockIdx].replace(/[^\d.]/g, '')) || 0 : 0;
    const minStock = minStockIdx !== -1 ? Number(cols[minStockIdx].replace(/[^\d.]/g, '')) || 0 : 5;
    const barcode = barcodeIdx !== -1 ? cols[barcodeIdx] || undefined : undefined;
    const sku = skuIdx !== -1 ? cols[skuIdx] || undefined : undefined;
    const categoryName = catIdx !== -1 ? cols[catIdx] || undefined : undefined;
    const unitName = unitIdx !== -1 ? cols[unitIdx] || undefined : undefined;

    if (name) {
      items.push({
        name,
        salePrice,
        purchasePrice,
        initialStock,
        minStock,
        barcode,
        sku,
        categoryName,
        unitName,
      });
    }
  }

  parsedItems.value = items;
  if (items.length > 0) {
    toast.success(`${items.length} ta tovar muvaffaqiyatli aniqlandi!`, 'Tayyor');
  } else {
    toast.warning('Tovarlar ro\'yxati aniqlanmadi. Iltimos shablon strukturasini tekshiring.', 'Ogohlantirish');
  }
};

const submitImport = async () => {
  if (parsedItems.value.length === 0) return;
  isImporting.value = true;

  try {
    const res = await api.post('/products/batch-import', { items: parsedItems.value });
    toast.success(`${res.data.imported || parsedItems.value.length} ta tovar muvaffaqiyatli import qilindi!`, 'Import Yakunlandi');
    emit('imported');
    closeModal();
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Import qilishda xatolik yuz berdi', 'Xatolik');
  } finally {
    isImporting.value = false;
  }
};
</script>
