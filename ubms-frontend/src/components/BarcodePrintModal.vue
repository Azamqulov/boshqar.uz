<script setup lang="ts">
import { ref, computed } from 'vue';
import { Printer, X, Tag, Check, RefreshCw, ZoomIn } from 'lucide-vue-next';

interface ProductLabelItem {
  id: string;
  name: string;
  price: number;
  barcode?: string;
  sku?: string;
  copies?: number;
}

const props = defineProps<{
  isOpen: boolean;
  products: ProductLabelItem[];
  storeName?: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const labelSize = ref<'40x25' | '58x40' | '30x20'>('40x25');
const showStoreName = ref(true);
const showBarcode = ref(true);
const showSku = ref(true);
const showDate = ref(false);
const defaultCopies = ref(1);

const labelList = ref<Array<ProductLabelItem & { printCopies: number }>>([]);

// Sync from props
const syncProducts = () => {
  labelList.value = (props.products || []).map((p) => ({
    ...p,
    printCopies: p.copies || defaultCopies.value || 1,
    barcode: p.barcode || generateFallbackBarcode(p.id, p.sku),
  }));
};

function generateFallbackBarcode(id: string, sku?: string): string {
  if (sku && sku.length >= 6) return sku;
  const num = id.replace(/\D/g, '');
  return '200' + (num.slice(0, 9) || '123456789');
}

const totalLabels = computed(() => {
  return labelList.value.reduce((sum, item) => sum + (Number(item.printCopies) || 0), 0);
});

const formatCurrency = (val: number) => {
  return Number(val || 0).toLocaleString('uz-UZ') + " so'm";
};

const handlePrint = () => {
  window.print();
};
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:p-0 print:bg-white print:static"
      @click.self="emit('close')"
      @vue:mounted="syncProducts"
    >
      <div
        class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden print:border-none print:shadow-none print:max-w-none print:max-h-none print:w-auto"
      >
        <!-- Modal Header (Hidden on print) -->
        <div
          class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 print:hidden"
        >
          <div class="flex items-center gap-3">
            <div class="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
              <Tag class="w-6 h-6" />
            </div>
            <div>
              <h2 class="text-lg font-bold text-slate-900 dark:text-white">
                Narx Yorlig'i (Cennik / Barkod) Studiyasi
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Termo printerlar (40x25mm, 58x40mm) uchun to'g'ridan-to'g'ri chop etish
              </p>
            </div>
          </div>
          <button
            class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            @click="emit('close')"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Body Content -->
        <div class="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6 print:block print:p-0">
          <!-- Left: Controls & Settings (Hidden on print) -->
          <div class="space-y-5 print:hidden">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Yorliq O'lchami (Format)
              </label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  :class="[
                    'px-3 py-2 text-xs font-medium rounded-xl border text-center transition',
                    labelSize === '40x25'
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300 font-bold ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  ]"
                  @click="labelSize = '40x25'"
                >
                  40 x 25 mm <br><span class="text-[10px] opacity-75">(Kichik / Standart)</span>
                </button>
                <button
                  type="button"
                  :class="[
                    'px-3 py-2 text-xs font-medium rounded-xl border text-center transition',
                    labelSize === '58x40'
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300 font-bold ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  ]"
                  @click="labelSize = '58x40'"
                >
                  58 x 40 mm <br><span class="text-[10px] opacity-75">(Katta / Supermarket)</span>
                </button>
              </div>
            </div>

            <!-- Toggles -->
            <div class="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label class="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                <span>Do'kon nomi ko'rinsin</span>
                <input v-model="showStoreName" type="checkbox" class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
              </label>
              <label class="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                <span>Shtrix-kod chiziqlari</span>
                <input v-model="showBarcode" type="checkbox" class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
              </label>
              <label class="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                <span>Artikul / SKU kodi</span>
                <input v-model="showSku" type="checkbox" class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
              </label>
            </div>

            <!-- Summary Stats -->
            <div class="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 text-xs space-y-1.5">
              <div class="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Tanlangan tovarlar:</span>
                <span class="font-semibold text-slate-800 dark:text-slate-200">{{ labelList.length }} ta</span>
              </div>
              <div class="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Jami chop etiladigan:</span>
                <span class="font-bold text-blue-600 dark:text-blue-400">{{ totalLabels }} dona yorliq</span>
              </div>
            </div>
          </div>

          <!-- Right: Live Preview Container -->
          <div class="md:col-span-2 bg-slate-100 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 overflow-y-auto max-h-[550px] print:bg-white print:p-0 print:border-none print:max-h-none">
            <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3 print:hidden flex items-center justify-between">
              <span>Jonli Ko'rinish (Preview)</span>
              <span>Printerga yuborish tartibi</span>
            </div>

            <div class="flex flex-wrap gap-4 items-start justify-start print:block print:p-0">
              <template v-for="item in labelList" :key="item.id">
                <template v-for="copy in Number(item.printCopies) || 1" :key="copy">
                  <div
                    :class="[
                      'bg-white text-black border border-slate-300 shadow-sm flex flex-col justify-between p-2 select-none overflow-hidden print:border-none print:shadow-none print:break-inside-avoid print:page-break-after-always',
                      labelSize === '40x25' ? 'w-[150px] h-[95px] text-[9px]' : 'w-[220px] h-[150px] text-[11px]'
                    ]"
                  >
                    <!-- Store Header -->
                    <div v-if="showStoreName" class="text-center font-bold uppercase tracking-wider truncate border-b border-black pb-0.5 opacity-90 text-[8px]">
                      {{ storeName || 'Boshqar.uz Do\'koni' }}
                    </div>

                    <!-- Product Name -->
                    <div class="font-bold line-clamp-2 my-auto text-center leading-tight">
                      {{ item.name }}
                    </div>

                    <!-- SKU & Price Section -->
                    <div class="mt-auto">
                      <div class="flex items-end justify-between font-black text-slate-950 border-t border-black pt-1">
                        <div v-if="showSku && item.sku" class="text-[7px] font-mono text-slate-700">
                          SKU: {{ item.sku }}
                        </div>
                        <div class="text-right ml-auto font-black text-[13px] leading-none">
                          {{ formatCurrency(item.price) }}
                        </div>
                      </div>

                      <!-- Pseudo Barcode Lines -->
                      <div v-if="showBarcode" class="mt-1 flex flex-col items-center">
                        <div class="w-full h-4 bg-repeat-x flex items-end justify-center gap-[2px] overflow-hidden px-1">
                          <span class="w-[1px] h-full bg-black"></span>
                          <span class="w-[2px] h-full bg-black"></span>
                          <span class="w-[1px] h-full bg-black"></span>
                          <span class="w-[3px] h-full bg-black"></span>
                          <span class="w-[1px] h-full bg-black"></span>
                          <span class="w-[2px] h-full bg-black"></span>
                          <span class="w-[1px] h-full bg-black"></span>
                          <span class="w-[3px] h-full bg-black"></span>
                          <span class="w-[1px] h-full bg-black"></span>
                          <span class="w-[2px] h-full bg-black"></span>
                          <span class="w-[1px] h-full bg-black"></span>
                          <span class="w-[2px] h-full bg-black"></span>
                          <span class="w-[1px] h-full bg-black"></span>
                          <span class="w-[3px] h-full bg-black"></span>
                        </div>
                        <div class="font-mono text-[7px] tracking-widest leading-none mt-0.5">
                          {{ item.barcode }}
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </template>
            </div>
          </div>
        </div>

        <!-- Modal Footer (Hidden on print) -->
        <div
          class="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 print:hidden"
        >
          <button
            type="button"
            class="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
            @click="emit('close')"
          >
            Bekor qilish
          </button>
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/25 transition active:scale-95"
              @click="handlePrint"
            >
              <Printer class="w-4 h-4" />
              Printerga Chop Etish ({{ totalLabels }} dona)
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
@media print {
  @page {
    margin: 0;
    size: auto;
  }
  body {
    margin: 0;
    padding: 0;
    background: white !important;
  }
}
</style>
