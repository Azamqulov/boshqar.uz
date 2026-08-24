<script setup lang="ts">
import { ref } from 'vue';
import { Printer, CheckCircle2, Save, FileText } from 'lucide-vue-next';
import { useToast } from '../../../composables/useToast';
import { ThermalPrintService } from '../../../services/thermal-print.service';

const toast = useToast();

const printerConfig = ref({
  paperWidth: '80mm' as '58mm' | '80mm',
  printMode: 'direct_raw' as 'direct_raw' | 'browser_dialog',
  autoPrintOnCheckout: true,
  copiesCount: 1,
});

function savePrinterSettings() {
  localStorage.setItem('boshqar_pos_printer_config', JSON.stringify(printerConfig.value));
  toast.success("Printer sozlamalari saqlandi", "Printer Sozlamalari");
}

function testPrintReceipt() {
  ThermalPrintService.printDirect({
    orderNumber: '#TEST-001',
    businessName: 'Boshqar.uz Demo Do\'kon',
    cashierName: 'Kassir (Test)',
    createdAt: new Date().toLocaleString(),
    items: [
      { name: 'Kofe Americano', qty: 2, price: 18000, total: 36000 },
      { name: 'Shokoladli Kruassan', qty: 1, price: 22000, total: 22000 },
    ],
    subtotal: 58000,
    discount: 3000,
    total: 55000,
    paymentMethod: 'Karta (Uzcard)',
    fiscalSign: 'OFD-TEST-9988776655',
  }, printerConfig.value.paperWidth);
}
</script>

<template>
  <div class="space-y-6">
    <div class="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
          <Printer class="w-6 h-6" />
        </div>
        <div>
          <h3 class="text-base font-bold text-slate-900 dark:text-white">Chek Printerni Sozlash (ESC/POS Thermal Print)</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">Termal printerning qog'oz kengligi (58mm/80mm) va to'g'ridan-to'g'ri chop etish sozlamalari</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Paper Width -->
      <div class="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 space-y-4">
        <h4 class="font-bold text-slate-900 dark:text-white text-sm">Qog'oz Kengligi</h4>
        <div class="grid grid-cols-2 gap-3">
          <button
            type="button"
            @click="printerConfig.paperWidth = '58mm'"
            class="p-4 rounded-xl border text-center transition flex flex-col items-center gap-2"
            :class="printerConfig.paperWidth === '58mm' ? 'border-teal-500 bg-teal-500/5 text-teal-700 dark:text-teal-300 font-bold' : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'"
          >
            <FileText class="w-5 h-5" />
            <span class="text-xs">58 mm (Kichik printer)</span>
          </button>

          <button
            type="button"
            @click="printerConfig.paperWidth = '80mm'"
            class="p-4 rounded-xl border text-center transition flex flex-col items-center gap-2"
            :class="printerConfig.paperWidth === '80mm' ? 'border-teal-500 bg-teal-500/5 text-teal-700 dark:text-teal-300 font-bold' : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'"
          >
            <FileText class="w-6 h-6" />
            <span class="text-xs">80 mm (Standart printer)</span>
          </button>
        </div>
      </div>

      <!-- Mode & Options -->
      <div class="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 space-y-4">
        <h4 class="font-bold text-slate-900 dark:text-white text-sm">Chop Etish Parametrlari</h4>
        <div class="space-y-3 text-xs">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" v-model="printerConfig.autoPrintOnCheckout" class="rounded text-teal-600 focus:ring-teal-500" />
            <span class="font-semibold text-slate-700 dark:text-slate-300">Savdo yakunlangach avtomatik chek chiqarish</span>
          </label>
        </div>

        <div class="pt-4 flex items-center gap-3">
          <button
            type="button"
            @click="savePrinterSettings"
            class="flex-1 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <Save class="w-4 h-4" />
            <span>Sozlamalarni Saqlash</span>
          </button>

          <button
            type="button"
            @click="testPrintReceipt"
            class="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition"
          >
            <Printer class="w-4 h-4" />
            <span>Test Chek</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
