<template>
  <div v-if="order" @click.self="$emit('close')" class="modal-overlay">
    <!-- Screen View (Matching Image 3 Modern Banking/POS Receipt UI) -->
    <div class="modal-container max-w-lg bg-white dark:bg-slate-900 shadow-2xl rounded-3xl overflow-hidden" @click.stop>
      <!-- Modal Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
        <h3 class="font-extrabold text-base text-slate-900 dark:text-white">
          Xarid Cheki Tafsilotlari
        </h3>
        <button
          @click="$emit('close')"
          class="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Modal Body -->
      <div class="p-6 overflow-y-auto max-h-[78vh] space-y-6">
        <!-- Top Green Status Badge & Large Sum (Image 3 Header) -->
        <div class="text-center space-y-2">
          <!-- Icon Bubble -->
          <div class="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto shadow-inner">
            <ArrowUpRight class="w-7 h-7 stroke-[2.5]" />
          </div>

          <!-- Large Amount (show total paid, not order total) -->
          <h2 class="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
            {{ formatCurrency(totalPaid) }}
          </h2>

          <!-- Date & Time -->
          <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {{ formatDateTime(order.completedAt || order.createdAt) }}
          </p>

          <!-- Success / Partial Badge -->
          <div v-if="nasiyaAmount <= 0" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            <CheckCircle2 class="w-3.5 h-3.5" />
            <span>Operatsiya bajarildi (To'lov qabul qilindi)</span>
          </div>
          <div v-else class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold">
            <AlertTriangle class="w-3.5 h-3.5" />
            <span>Qisman to'lov — Nasiya: {{ formatCurrency(nasiyaAmount) }}</span>
          </div>
        </div>

        <!-- Action Button (Download / Print) -->
        <div class="flex items-center justify-center gap-3">
          <button
            type="button"
            @click="handlePrint"
            class="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition btn-interactive"
          >
            <Printer class="w-4 h-4" />
            <span>Chekni chop etish (Print)</span>
          </button>
        </div>

        <!-- Details Info Card (Image 3 Row List) -->
        <div class="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 p-4 space-y-3.5 text-xs">
          <!-- Do'kon / Biznes -->
          <div class="flex justify-between items-center text-slate-600 dark:text-slate-300">
            <span class="text-slate-400 dark:text-slate-400 font-medium">Savdo nuqtasi:</span>
            <span class="font-bold text-slate-900 dark:text-white text-right">
              {{ settings.headerTitle || currentBusinessName }}
            </span>
          </div>

          <!-- Chek raqami -->
          <div class="flex justify-between items-center text-slate-600 dark:text-slate-300 border-t border-slate-200/60 dark:border-slate-700/40 pt-2.5">
            <span class="text-slate-400 dark:text-slate-400 font-medium">Chek raqami:</span>
            <span class="font-mono font-black text-emerald-600 dark:text-emerald-400">
              {{ order.orderNumber }}
            </span>
          </div>

          <!-- Kassir / Mas'ul -->
          <div v-if="order.cashier" class="flex justify-between items-center text-slate-600 dark:text-slate-300 border-t border-slate-200/60 dark:border-slate-700/40 pt-2.5">
            <span class="text-slate-400 dark:text-slate-400 font-medium">Kassir / Mas'ul:</span>
            <span class="font-bold text-slate-900 dark:text-white font-mono">
              {{ order.cashier.fullName }}
            </span>
          </div>

          <!-- Mijoz (agar mavjud bo'lsa) -->
          <div v-if="order.customer" class="flex justify-between items-center text-slate-600 dark:text-slate-300 border-t border-slate-200/60 dark:border-slate-700/40 pt-2.5">
            <span class="text-slate-400 dark:text-slate-400 font-medium">Mijoz (Qabul qiluvchi):</span>
            <span class="font-bold text-slate-900 dark:text-white">
              {{ order.customer.fullName }} {{ order.customer.phone ? `(${order.customer.phone})` : '' }}
            </span>
          </div>

          <!-- To'lov turi -->
          <div class="flex justify-between items-center text-slate-600 dark:text-slate-300 border-t border-slate-200/60 dark:border-slate-700/40 pt-2.5">
            <span class="text-slate-400 dark:text-slate-400 font-medium">To'lov usuli:</span>
            <div class="text-right">
              <span
                v-for="p in order.payments"
                :key="p.id"
                class="inline-flex items-center gap-1 font-bold text-slate-900 dark:text-white"
              >
                <Banknote v-if="p.paymentMethod?.type === 'cash'" class="w-3.5 h-3.5 text-emerald-500" />
                <CreditCard v-else-if="p.paymentMethod?.type === 'card'" class="w-3.5 h-3.5 text-blue-500" />
                <Smartphone v-else class="w-3.5 h-3.5 text-purple-500" />
                <span>{{ p.paymentMethod?.name || 'To\'lov' }} ({{ formatCurrency(p.amount) }})</span>
              </span>
            </div>
          </div>

          <!-- Mahsulotlar ro'yxati -->
          <div class="border-t border-slate-200/60 dark:border-slate-700/40 pt-2.5 space-y-2">
            <span class="text-slate-400 dark:text-slate-400 font-medium block mb-1">Xarid qilingan tovarlar:</span>
            <div
              v-for="item in order.items"
              :key="item.id"
              class="flex justify-between items-start text-[11px] bg-white dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800"
            >
              <div class="pr-2">
                <div class="font-bold text-slate-900 dark:text-white">{{ item.product?.name || item.service?.name }}</div>
                <div class="text-slate-400 font-mono text-[10px]">
                  {{ item.quantity }} dona × {{ formatCurrency(item.unitPrice) }}
                </div>
              </div>
              <div class="font-black text-slate-900 dark:text-white font-mono text-right flex-shrink-0">
                {{ formatCurrency(item.total || (item.quantity * item.unitPrice)) }}
              </div>
            </div>
          </div>

          <!-- Jami hisob-kitob -->
          <div class="border-t border-slate-200 dark:border-slate-700 pt-2.5 space-y-1.5 font-mono">
            <div class="flex justify-between text-slate-500 dark:text-slate-400 text-[11px]">
              <span>Oraliq summa:</span>
              <span>{{ formatCurrency(order.subtotal || order.total) }}</span>
            </div>
            <div v-if="order.discountAmount > 0" class="flex justify-between text-rose-500 text-[11px]">
              <span>Chegirma:</span>
              <span>-{{ formatCurrency(order.discountAmount) }}</span>
            </div>
            <div class="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-1.5 border-t border-slate-200/80 dark:border-slate-700/60">
              <span class="font-sans">Jami summa:</span>
              <span class="text-slate-900 dark:text-white">{{ formatCurrency(order.total) }}</span>
            </div>
            <div class="flex justify-between text-sm font-black pt-1">
              <span class="font-sans text-slate-600 dark:text-slate-300">To'langan:</span>
              <span class="text-emerald-600 dark:text-emerald-400">{{ formatCurrency(totalPaid) }}</span>
            </div>
            <div v-if="nasiyaAmount > 0" class="flex justify-between text-sm font-black pt-1">
              <span class="font-sans text-amber-600 dark:text-amber-400">Nasiya qoldig'i:</span>
              <span class="text-amber-600 dark:text-amber-400">{{ formatCurrency(nasiyaAmount) }}</span>
            </div>
            <div v-if="changeAmount > 0" class="flex justify-between text-sm font-bold pt-1">
              <span class="font-sans text-blue-600 dark:text-blue-400">Qaytim:</span>
              <span class="text-blue-600 dark:text-blue-400">{{ formatCurrency(changeAmount) }}</span>
            </div>
          </div>
        </div>

        <!-- Footer gratitude note -->
        <div class="text-center text-[11px] text-slate-400 dark:text-slate-500 font-medium">
          {{ settings.footerText || 'Xaridingiz uchun rahmat! Yana kutib qolamiz.' }}
        </div>
      </div>
    </div>

    <!-- Hidden Dedicated Thermal / A4 Printable Receipt Template -->
    <div id="print-receipt-area" class="print-only">
      <div
        class="receipt-container"
        :class="[
          settings.paperSize === '58mm' ? 'receipt-58mm' :
          settings.paperSize === 'A4' ? 'receipt-a4' : 'receipt-80mm'
        ]"
      >
        <!-- Header -->
        <div class="receipt-header text-center">
          <h2 class="shop-name">{{ settings.headerTitle || currentBusinessName }}</h2>
          <p v-if="settings.headerSubtitle" class="shop-sub">{{ settings.headerSubtitle }}</p>
          <div class="divider">================================</div>
          <div class="receipt-meta">
            <div>CHEK №: <strong>{{ order.orderNumber }}</strong></div>
            <div>SANA: {{ formatDateTime(order.completedAt || order.createdAt) }}</div>
            <div v-if="settings.showCashier && order.cashier">KASSIR: {{ order.cashier.fullName }}</div>
            <div v-if="settings.showCustomer && order.customer">MIJOZ: {{ order.customer.fullName }}</div>
          </div>
          <div class="divider">--------------------------------</div>
        </div>

        <!-- Items Table -->
        <div class="receipt-items">
          <table class="receipt-table">
            <thead>
              <tr>
                <th class="text-left">Nomi</th>
                <th class="text-center">Soni</th>
                <th class="text-right">Narxi</th>
                <th class="text-right">Jami</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in order.items" :key="item.id">
                <td class="item-name">{{ item.product?.name || item.service?.name }}</td>
                <td class="text-center">{{ item.quantity }}</td>
                <td class="text-right">{{ formatCurrencyNumber(item.unitPrice) }}</td>
                <td class="text-right font-bold">{{ formatCurrencyNumber(item.total || (item.quantity * item.unitPrice)) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Totals -->
        <div class="divider">--------------------------------</div>
        <div class="receipt-totals">
          <div class="row">
            <span>Oraliq summa:</span>
            <span>{{ formatCurrencyNumber(order.subtotal || order.total) }} so'm</span>
          </div>
          <div v-if="order.discountAmount > 0" class="row">
            <span>Chegirma:</span>
            <span>-{{ formatCurrencyNumber(order.discountAmount) }} so'm</span>
          </div>
          <div class="row grand-total">
            <span>JAMI SUMMA:</span>
            <span>{{ formatCurrencyNumber(order.total) }} SO'M</span>
          </div>
          <div class="divider">--------------------------------</div>
          <!-- Payments -->
          <div v-for="p in order.payments" :key="p.id" class="row">
            <span>To'lov ({{ p.paymentMethod?.name || 'To\'lov' }}):</span>
            <span>{{ formatCurrencyNumber(p.amount) }} so'm</span>
          </div>
          <div class="row grand-total" style="font-size: 13px;">
            <span>TO'LANGAN:</span>
            <span>{{ formatCurrencyNumber(totalPaid) }} SO'M</span>
          </div>
          <div v-if="nasiyaAmount > 0" class="row" style="font-weight: bold;">
            <span>NASIYA QOLDIG'I:</span>
            <span>{{ formatCurrencyNumber(nasiyaAmount) }} SO'M</span>
          </div>
          <div v-if="changeAmount > 0" class="row">
            <span>QAYTIM:</span>
            <span>{{ formatCurrencyNumber(changeAmount) }} so'm</span>
          </div>
        </div>

        <!-- Barcode / QR & Footer -->
        <div class="divider">================================</div>
        <div class="receipt-footer text-center">
          <div v-if="settings.showBarcode" class="barcode-sim">
            * {{ order.orderNumber }} *
          </div>
          <p class="footer-msg">{{ settings.footerText || 'Xaridingiz uchun rahmat!' }}</p>
          <p class="system-tag">boshqar.uz — Savdoni avtomatlashtirish</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '../stores/auth.store';
import { useFormat } from '../composables/useFormat';
import {
  X,
  Printer,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  Banknote,
  CreditCard,
  Smartphone,
} from 'lucide-vue-next';

const props = defineProps<{
  order: any;
}>();

defineEmits<{
  (e: 'close'): void;
}>();

const authStore = useAuthStore();
const { formatCurrency } = useFormat();

const currentBusinessName = computed(() => {
  return authStore.activeBusiness?.name || 'Boshqar.uz Do\'kon';
});

// Calculate actual total paid from payments array
const totalPaid = computed(() => {
  if (!props.order?.payments || props.order.payments.length === 0) return Number(props.order?.total || 0);
  return props.order.payments.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
});

// Nasiya (debt) = difference between order total and what was actually paid
const nasiyaAmount = computed(() => {
  return Math.max(0, Number(props.order?.total || 0) - totalPaid.value);
});

// Qaytim (change) = if customer paid more than total
const changeAmount = computed(() => {
  return Math.max(0, totalPaid.value - Number(props.order?.total || 0));
});

// Load receipt printer settings from localStorage
const settings = computed(() => {
  try {
    const raw = localStorage.getItem('ubms_receipt_settings');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {
    paperSize: '80mm',
    headerTitle: '',
    headerSubtitle: '',
    footerText: 'Xaridingiz uchun rahmat! Qaytarish 24 soat ichida chek bilan.',
    showBarcode: true,
    showQrCode: true,
    showCashier: true,
    showCustomer: true,
  };
});

const formatDateTime = (dateStr: string | Date | undefined) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const day = d.getDate();
  const months = [
    'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
    'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'
  ];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}-${month}, ${year} ${hours}:${minutes}`;
};

const formatCurrencyNumber = (val: number | string | undefined) => {
  const n = Number(val || 0);
  return n.toLocaleString('uz-UZ').replace(/,/g, ' ');
};

const handlePrint = () => {
  window.print();
};
</script>

<style>
/* Dedicated Print CSS for Thermal (58mm/80mm) & A4 Invoices */
@media screen {
  .print-only {
    display: none !important;
  }
}

@media print {
  /* Hide all screen interface elements */
  body * {
    visibility: hidden !important;
  }

  /* Show only the print receipt area */
  #print-receipt-area, #print-receipt-area * {
    visibility: visible !important;
  }

  #print-receipt-area {
    display: block !important;
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    background: #ffffff !important;
    color: #000000 !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  .receipt-container {
    font-family: 'Courier New', Courier, monospace;
    color: #000 !important;
    background: #fff !important;
    margin: 0 auto;
    padding: 6mm;
    box-sizing: border-box;
  }

  /* 58mm POS thermal tape */
  .receipt-58mm {
    width: 58mm !important;
    max-width: 58mm !important;
    font-size: 10px !important;
    padding: 2mm !important;
  }

  /* 80mm standard POS thermal tape */
  .receipt-80mm {
    width: 80mm !important;
    max-width: 80mm !important;
    font-size: 12px !important;
    padding: 4mm !important;
  }

  /* A4 Invoice */
  .receipt-a4 {
    width: 190mm !important;
    font-size: 14px !important;
    padding: 15mm !important;
  }

  .shop-name {
    font-size: 1.3em;
    font-weight: 900;
    margin-bottom: 2px;
    text-transform: uppercase;
  }

  .shop-sub {
    font-size: 0.85em;
    margin-bottom: 4px;
  }

  .divider {
    font-size: 0.85em;
    letter-spacing: -1px;
    margin: 4px 0;
    overflow: hidden;
    white-space: nowrap;
  }

  .receipt-meta {
    font-size: 0.9em;
    line-height: 1.4;
    text-align: left;
  }

  .receipt-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.95em;
    margin: 4px 0;
  }

  .receipt-table th {
    border-bottom: 1px dashed #000;
    padding: 3px 0;
  }

  .receipt-table td {
    padding: 3px 0;
    vertical-align: top;
  }

  .item-name {
    word-break: break-word;
    max-width: 40mm;
  }

  .receipt-totals {
    font-size: 0.95em;
    line-height: 1.5;
  }

  .receipt-totals .row {
    display: flex;
    justify-content: space-between;
  }

  .grand-total {
    font-size: 1.2em;
    font-weight: 900;
    margin-top: 4px;
    border-top: 1px solid #000;
    border-bottom: 1px solid #000;
    padding: 4px 0;
  }

  .receipt-footer {
    margin-top: 6px;
    font-size: 0.85em;
  }

  .barcode-sim {
    font-family: 'Libre Barcode 39', 'Courier New', monospace;
    font-size: 1.4em;
    letter-spacing: 3px;
    margin: 6px 0;
  }

  .footer-msg {
    font-weight: bold;
    margin-bottom: 2px;
  }

  .system-tag {
    font-size: 0.75em;
    color: #666;
  }
}
</style>
