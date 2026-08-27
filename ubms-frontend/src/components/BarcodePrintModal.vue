<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Printer, X, Tag, Check, Copy, Sliders, Layers } from 'lucide-vue-next';

export interface ProductLabelItem {
  id: string;
  name: string;
  price?: number;
  salePrice?: number | string;
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

const labelSize = ref<'40x25' | '58x40'>('40x25');
const showStoreName = ref(true);
const showBarcode = ref(true);
const showSku = ref(true);
const defaultCopies = ref(1);

const labelList = ref<Array<{
  id: string;
  name: string;
  price: number;
  barcode: string;
  sku: string;
  printCopies: number;
}>>([]);

// Sync from props with accurate salePrice fallback
const syncProducts = () => {
  labelList.value = (props.products || []).map((p: any) => {
    const rawPrice = p.salePrice !== undefined && p.salePrice !== null ? p.salePrice : p.price;
    const cleanPrice = Number(rawPrice) || 0;
    return {
      id: String(p.id || Math.random()),
      name: String(p.name || 'Nomsiz Mahsulot'),
      price: cleanPrice,
      sku: String(p.sku || ''),
      barcode: String(p.barcode || generateFallbackBarcode(String(p.id || ''), p.sku)),
      printCopies: Number(p.copies) || defaultCopies.value || 1,
    };
  });
};

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      syncProducts();
    }
  },
  { immediate: true }
);

watch(
  () => props.products,
  () => {
    if (props.isOpen) {
      syncProducts();
    }
  },
  { deep: true }
);

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

// Generate deterministic crisp barcode stripes
const getBarcodePattern = (code: string) => {
  const bars: { width: number; isBlack: boolean }[] = [];
  const clean = code.replace(/\D/g, '') || '200123456789';
  
  // Start guard
  bars.push({ width: 1, isBlack: true });
  bars.push({ width: 1, isBlack: false });
  bars.push({ width: 1, isBlack: true });

  for (let i = 0; i < clean.length; i++) {
    const digit = parseInt(clean[i], 10) || 0;
    const w1 = (digit % 3) + 1;
    const w2 = ((digit + 1) % 2) + 1;
    const w3 = ((digit + 2) % 3) + 1;
    
    bars.push({ width: w1, isBlack: true });
    bars.push({ width: 1, isBlack: false });
    bars.push({ width: w2, isBlack: true });
    bars.push({ width: 1, isBlack: false });
    bars.push({ width: w3, isBlack: true });
    bars.push({ width: 1, isBlack: false });
  }

  // End guard
  bars.push({ width: 1, isBlack: true });
  bars.push({ width: 1, isBlack: false });
  bars.push({ width: 1, isBlack: true });

  return bars;
};

const handlePrint = () => {
  window.print();
};
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:p-0 print:bg-white print:static print:inset-auto"
      @click.self="emit('close')"
    >
      <div
        class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden print:border-none print:shadow-none print:max-w-none print:max-h-none print:w-auto print:rounded-none print:bg-white"
      >
        <!-- Modal Header (Hidden on print) -->
        <div
          class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 print:hidden"
        >
          <div class="flex items-center gap-3">
            <div class="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-500/20 shadow-xs">
              <Tag class="w-6 h-6" />
            </div>
            <div>
              <h2 class="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                Narx Yorlig'i (Cennik / Barkod) Studiyasi
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Termo Printer
                </span>
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                40×25mm va 58×40mm formatdagi termo printerlar uchun to'g'ridan-to'g'ri cennik chop etish
              </p>
            </div>
          </div>
          <button
            class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            @click="emit('close')"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Body Content -->
        <div class="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6 print:block print:p-0 print:overflow-visible">
          <!-- Left: Controls & Settings (Hidden on print) -->
          <div class="space-y-5 print:hidden">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Yorliq O'lchami (Format)
              </label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  :class="[
                    'px-3 py-2.5 text-xs font-bold rounded-2xl border text-center transition cursor-pointer',
                    labelSize === '40x25'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  ]"
                  @click="labelSize = '40x25'"
                >
                  40 × 25 mm <br><span class="text-[10px] font-medium opacity-80">(Kichik / Standart)</span>
                </button>
                <button
                  type="button"
                  :class="[
                    'px-3 py-2.5 text-xs font-bold rounded-2xl border text-center transition cursor-pointer',
                    labelSize === '58x40'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  ]"
                  @click="labelSize = '58x40'"
                >
                  58 × 40 mm <br><span class="text-[10px] font-medium opacity-80">(Katta / Supermarket)</span>
                </button>
              </div>
            </div>

            <!-- Toggles -->
            <div class="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <label class="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                <span>Do'kon nomi ko'rinsin</span>
                <input
                  v-model="showStoreName"
                  type="checkbox"
                  class="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                />
              </label>
              <label class="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                <span>Shtrix-kod chiziqlari (Barcode)</span>
                <input
                  v-model="showBarcode"
                  type="checkbox"
                  class="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                />
              </label>
              <label class="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                <span>Artikul / SKU kodi</span>
                <input
                  v-model="showSku"
                  type="checkbox"
                  class="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                />
              </label>
            </div>

            <!-- Summary Stats -->
            <div class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/70 dark:border-slate-700 text-xs space-y-2">
              <div class="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Tanlangan tovarlar:</span>
                <span class="font-bold text-slate-900 dark:text-white">{{ labelList.length }} ta</span>
              </div>
              <div class="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Jami chop etiladigan:</span>
                <span class="font-extrabold text-emerald-600 dark:text-emerald-400">{{ totalLabels }} dona yorliq</span>
              </div>
            </div>
          </div>

          <!-- Right: Live Preview Container -->
          <div class="md:col-span-2 bg-slate-100/80 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-y-auto max-h-[550px] print:bg-white print:p-0 print:border-none print:max-h-none print:overflow-visible">
            <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 print:hidden flex items-center justify-between">
              <span>Jonli Ko'rinish (Preview)</span>
              <span>Termo qog'oz tartibi</span>
            </div>

            <div class="flex flex-wrap gap-3 items-start justify-start print:block print:p-0 print:m-0">
              <template v-for="item in labelList" :key="item.id">
                <template v-for="copy in Number(item.printCopies) || 1" :key="copy">
                  <!-- 40x25 mm Label Item -->
                  <div
                    v-if="labelSize === '40x25'"
                    class="label-sticker label-40x25 bg-white text-black border border-slate-300 shadow-xs flex flex-col justify-between select-none overflow-hidden print:border-none print:shadow-none print:m-0"
                  >
                    <!-- Header -->
                    <div v-if="showStoreName" class="label-store-name truncate text-center font-bold uppercase tracking-tight opacity-90 border-b border-black">
                      {{ storeName || 'BOSHQAR.UZ' }}
                    </div>

                    <!-- Product Title -->
                    <div class="label-title font-bold text-center leading-tight line-clamp-2 my-auto px-0.5">
                      {{ item.name }}
                    </div>

                    <!-- Footer: SKU, Price & Barcode -->
                    <div class="label-footer mt-auto pt-0.5 border-t border-black">
                      <div class="flex items-center justify-between font-black text-black">
                        <div v-if="showSku && item.sku" class="label-sku font-mono truncate">
                          {{ item.sku }}
                        </div>
                        <div class="label-price ml-auto font-black text-black leading-none whitespace-nowrap">
                          {{ formatCurrency(item.price) }}
                        </div>
                      </div>

                      <!-- Clean Crisp Barcode Bars -->
                      <div v-if="showBarcode" class="label-barcode-box flex flex-col items-center justify-center mt-0.5">
                        <div class="flex items-end justify-center h-[12px] w-full overflow-hidden">
                          <template v-for="(bar, bIdx) in getBarcodePattern(item.barcode)" :key="bIdx">
                            <span
                              :style="{
                                width: `${bar.width}px`,
                                height: '100%',
                                backgroundColor: bar.isBlack ? '#000' : 'transparent',
                                display: 'inline-block'
                              }"
                            ></span>
                          </template>
                        </div>
                        <div class="label-barcode-digits font-mono tracking-widest leading-none mt-0.5">
                          {{ item.barcode }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 58x40 mm Label Item -->
                  <div
                    v-else
                    class="label-sticker label-58x40 bg-white text-black border border-slate-300 shadow-xs flex flex-col justify-between select-none overflow-hidden print:border-none print:shadow-none print:m-0"
                  >
                    <!-- Header -->
                    <div v-if="showStoreName" class="label-store-name-lg truncate text-center font-extrabold uppercase tracking-wide opacity-90 border-b-2 border-black pb-0.5">
                      {{ storeName || 'BOSHQAR.UZ SAVDO TIZIMI' }}
                    </div>

                    <!-- Product Title -->
                    <div class="label-title-lg font-black text-center leading-snug line-clamp-2 my-auto px-1">
                      {{ item.name }}
                    </div>

                    <!-- Footer: SKU, Price & Barcode -->
                    <div class="label-footer-lg mt-auto pt-1 border-t-2 border-black">
                      <div class="flex items-baseline justify-between font-black text-black">
                        <div v-if="showSku && item.sku" class="label-sku-lg font-mono text-slate-800">
                          SKU: {{ item.sku }}
                        </div>
                        <div class="label-price-lg ml-auto font-black text-black leading-none whitespace-nowrap">
                          {{ formatCurrency(item.price) }}
                        </div>
                      </div>

                      <!-- Clean Crisp Barcode Bars -->
                      <div v-if="showBarcode" class="label-barcode-box-lg flex flex-col items-center justify-center mt-1">
                        <div class="flex items-end justify-center h-[18px] w-full overflow-hidden">
                          <template v-for="(bar, bIdx) in getBarcodePattern(item.barcode)" :key="bIdx">
                            <span
                              :style="{
                                width: `${bar.width * 1.3}px`,
                                height: '100%',
                                backgroundColor: bar.isBlack ? '#000' : 'transparent',
                                display: 'inline-block'
                              }"
                            ></span>
                          </template>
                        </div>
                        <div class="label-barcode-digits-lg font-mono tracking-widest leading-none mt-0.5">
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
            class="px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl transition cursor-pointer"
            @click="emit('close')"
          >
            Bekor qilish
          </button>
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-2xl shadow-lg shadow-emerald-600/25 transition active:scale-95 cursor-pointer"
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
/* Screen Preview Sizing */
.label-40x25 {
  width: 160px;
  height: 105px;
  padding: 4px 6px;
  border-radius: 6px;
}
.label-40x25 .label-store-name {
  font-size: 8px;
  line-height: 10px;
  padding-bottom: 2px;
}
.label-40x25 .label-title {
  font-size: 9.5px;
}
.label-40x25 .label-sku {
  font-size: 7px;
}
.label-40x25 .label-price {
  font-size: 13px;
  letter-spacing: -0.5px;
}
.label-40x25 .label-barcode-digits {
  font-size: 7.5px;
}

.label-58x40 {
  width: 235px;
  height: 162px;
  padding: 8px 10px;
  border-radius: 8px;
}
.label-58x40 .label-store-name-lg {
  font-size: 10px;
}
.label-58x40 .label-title-lg {
  font-size: 13px;
}
.label-58x40 .label-sku-lg {
  font-size: 9px;
}
.label-58x40 .label-price-lg {
  font-size: 18px;
  letter-spacing: -0.5px;
}
.label-58x40 .label-barcode-digits-lg {
  font-size: 9px;
}

/* Precise Direct Thermal Printing Rules */
@media print {
  @page {
    margin: 0mm !important;
    size: auto;
  }

  body {
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .label-sticker {
    box-sizing: border-box !important;
    page-break-after: always !important;
    break-after: page !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    margin: 0 auto !important;
    border: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
  }

  .label-40x25 {
    width: 40mm !important;
    height: 25mm !important;
    max-width: 40mm !important;
    max-height: 25mm !important;
    padding: 1.5mm 2mm !important;
  }

  .label-58x40 {
    width: 58mm !important;
    height: 40mm !important;
    max-width: 58mm !important;
    max-height: 40mm !important;
    padding: 2.5mm 3mm !important;
  }
}
</style>
