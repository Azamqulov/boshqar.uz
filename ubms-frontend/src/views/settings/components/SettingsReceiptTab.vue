<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-5xl">
    <!-- Left 7 cols: Controls -->
    <div class="lg:col-span-7 space-y-5">
      <!-- Master Toggle Card (Enable/Disable Receipt Printing) -->
      <div
        class="glass-card rounded-2xl p-5 border transition-all duration-200"
        :class="receiptSettings.enableReceiptPrinting !== false
          ? 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/30'
          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <div
                class="w-8 h-8 rounded-xl flex items-center justify-center"
                :class="receiptSettings.enableReceiptPrinting !== false
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400'"
              >
                <Printer class="w-4 h-4" />
              </div>
              <h3 class="text-sm font-black text-slate-900 dark:text-white">
                Chek Chiqarish Tizimi
              </h3>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 pt-1">
              Chek apparati (termal printer) mavjud bo'lmagan do'konlar uchun bu sozlamani o'chirib qo'yishingiz mumkin.
            </p>
          </div>

          <!-- Switch Toggle -->
          <label class="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
            <input
              type="checkbox"
              v-model="receiptSettings.enableReceiptPrinting"
              class="sr-only peer"
            />
            <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        <div
          class="mt-3.5 p-3 rounded-xl text-xs flex items-center gap-2.5 transition"
          :class="receiptSettings.enableReceiptPrinting !== false
            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
            : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'"
        >
          <CheckCircle2 v-if="receiptSettings.enableReceiptPrinting !== false" class="w-4 h-4 text-emerald-500 shrink-0" />
          <AlertCircle v-else class="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            {{ receiptSettings.enableReceiptPrinting !== false
              ? "Chek chiqarish faol. Savdodan so'ng xarid cheki shakllanadi."
              : "Chek chiqarish o'chirilgan. Kassa to'lov qabul qilingach darhol keyingi xaridorga o'tadi." }}
          </span>
        </div>
      </div>

      <!-- If Receipt Printing is Enabled: Show detailed options -->
      <div v-if="receiptSettings.enableReceiptPrinting !== false" class="space-y-5">
        <!-- Paper Size Cards -->
        <div class="glass-card rounded-2xl p-5 space-y-3">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt class="w-4 h-4 text-emerald-500" />
            <span>Chek Formati / Qog'oz O'lchami</span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Kassangizdagi termal printer lenta kengligini tanlang
          </p>

          <div class="grid grid-cols-3 gap-3 pt-1">
            <!-- 58mm -->
            <button
              type="button"
              @click="receiptSettings.paperSize = '58mm'"
              class="p-3.5 rounded-xl border text-left transition relative"
              :class="[
                receiptSettings.paperSize === '58mm'
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:border-slate-300'
              ]"
            >
              <div class="text-sm font-black font-mono">58 mm</div>
              <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Ixcham kassa lentasi</div>
            </button>

            <!-- 80mm -->
            <button
              type="button"
              @click="receiptSettings.paperSize = '80mm'"
              class="p-3.5 rounded-xl border text-left transition relative"
              :class="[
                receiptSettings.paperSize === '80mm'
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:border-slate-300'
              ]"
            >
              <div class="text-sm font-black font-mono">80 mm</div>
              <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Standart keng termal chek</div>
            </button>

            <!-- A4 -->
            <button
              type="button"
              @click="receiptSettings.paperSize = 'A4'"
              class="p-3.5 rounded-xl border text-left transition relative"
              :class="[
                receiptSettings.paperSize === 'A4'
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:border-slate-300'
              ]"
            >
              <div class="text-sm font-black font-mono">A4 Varaq</div>
              <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Hisob-faktura / varaq</div>
            </button>
          </div>
        </div>

        <!-- Custom Header & Footer Texts -->
        <div class="glass-card rounded-2xl p-5 space-y-4 text-xs">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white">Chek Matnlari va Rekvizitlari</h3>

          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Chek Boshidagi Sarlavha (Do'kon / Muassasa nomi)</label>
            <input
              v-model="receiptSettings.headerTitle"
              :placeholder="businessName || 'Boshqar.uz Do\'koni'"
              class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Manzil va Telefon raqami</label>
            <input
              v-model="receiptSettings.headerSubtitle"
              placeholder="Masalan: Toshkent sh., Chilonzor tumani. Tel: +998 90 123 45 67"
              class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Chek Tagidagi Minnatdorchilik Matni</label>
            <textarea
              v-model="receiptSettings.footerText"
              rows="2"
              placeholder="Masalan: Xaridingiz uchun rahmat! Qaytarish 24 soat ichida chek bilan."
              class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            ></textarea>
          </div>
        </div>

        <!-- Toggles -->
        <div class="glass-card rounded-2xl p-5 space-y-3 text-xs">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white">Chekdagi Qo'shimcha Bloklar</h3>

          <div class="space-y-2.5">
            <label class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
              <span class="font-medium text-slate-700 dark:text-slate-300">Chekda shtrix-kod ko'rsatish</span>
              <input type="checkbox" v-model="receiptSettings.showBarcode" class="rounded text-emerald-500 focus:ring-emerald-500" />
            </label>

            <label class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
              <span class="font-medium text-slate-700 dark:text-slate-300">Kassir / Mas'ul xodim ismini ko'rsatish</span>
              <input type="checkbox" v-model="receiptSettings.showCashier" class="rounded text-emerald-500 focus:ring-emerald-500" />
            </label>

            <label class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
              <span class="font-medium text-slate-700 dark:text-slate-300">Mijoz ma'lumotlarini (agar kiritilgan bo'lsa) ko'rsatish</span>
              <input type="checkbox" v-model="receiptSettings.showCustomer" class="rounded text-emerald-500 focus:ring-emerald-500" />
            </label>

            <label class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
              <div>
                <span class="font-medium text-slate-700 dark:text-slate-300 block">Avtomatik chop etish (Auto-Print)</span>
                <span class="text-[11px] text-slate-400">To'lov tasdiqlangach to'g'ridan-to'g'ri printerni ishga tushiradi</span>
              </div>
              <input type="checkbox" v-model="receiptSettings.autoPrint" class="rounded text-emerald-500 focus:ring-emerald-500" />
            </label>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-3 pt-2">
        <button
          type="button"
          @click="$emit('save')"
          class="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition btn-interactive flex items-center justify-center gap-2"
        >
          <Save class="w-4 h-4" />
          <span>Sozlamalarni Saqlash</span>
        </button>

        <button
          v-if="receiptSettings.enableReceiptPrinting !== false"
          type="button"
          @click="$emit('testPrint')"
          class="py-3 px-5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition flex items-center gap-2 btn-interactive"
        >
          <Printer class="w-4 h-4" />
          <span>Sinov Cheki (Test Print)</span>
        </button>
      </div>
    </div>

    <!-- Right 5 cols: Live Mock Receipt Preview -->
    <div class="lg:col-span-5">
      <div class="glass-card rounded-2xl p-5 sticky top-20 space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Jonli Chek Ko'rinishi</span>
          <span
            v-if="receiptSettings.enableReceiptPrinting !== false"
            class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold"
          >
            {{ receiptSettings.paperSize || '58mm' }}
          </span>
          <span
            v-else
            class="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500 font-bold"
          >
            O'chirilgan
          </span>
        </div>

        <!-- If Disabled: Informative placeholder -->
        <div
          v-if="receiptSettings.enableReceiptPrinting === false"
          class="p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3 bg-slate-50/50 dark:bg-slate-900/50"
        >
          <div class="w-12 h-12 rounded-2xl bg-slate-200/60 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Printer class="w-6 h-6 opacity-40" />
          </div>
          <h4 class="text-sm font-bold text-slate-700 dark:text-slate-300">Chek chiqarish o'chirilgan</h4>
          <p class="text-xs text-slate-400 max-w-xs mx-auto">
            Kassada savdo tugallanganda chek oynasi ochilmaydi. Agar chek printeringiz bo'lmasa, bu savdo tezligini oshiradi.
          </p>
        </div>

        <!-- Realistic Thermal Receipt Paper Preview -->
        <div
          v-else
          class="bg-white text-slate-900 font-mono text-[11px] p-4 rounded-xl shadow-lg border border-slate-200 mx-auto transition-all duration-300 overflow-hidden"
          :style="{ maxWidth: receiptSettings.paperSize === '58mm' ? '220px' : receiptSettings.paperSize === 'A4' ? '100%' : '280px' }"
        >
          <div class="text-center space-y-1">
            <div class="font-black text-sm uppercase leading-tight">{{ receiptSettings.headerTitle || businessName || 'Boshqar.uz Do\'koni' }}</div>
            <div v-if="receiptSettings.headerSubtitle" class="text-[10px] text-slate-500">{{ receiptSettings.headerSubtitle }}</div>
            <div class="border-b border-dashed border-slate-400 my-2"></div>
            <div class="text-[10px] text-left space-y-0.5">
              <div>CHEK №: <strong>#0042</strong></div>
              <div>SANA: 14-avgust, 2026 13:30</div>
              <div v-if="receiptSettings.showCashier">KASSIR: Bekzod (Sotuvchi)</div>
              <div v-if="receiptSettings.showCustomer">MIJOZ: Alisherjon H.</div>
            </div>
            <div class="border-b border-dashed border-slate-400 my-2"></div>
          </div>

          <!-- Items -->
          <div class="space-y-1.5 py-1">
            <div class="flex justify-between">
              <span>Coca-Cola 1.5L x2</span>
              <span class="font-bold">28 000</span>
            </div>
            <div class="flex justify-between">
              <span>Nestle Sut 1L x1</span>
              <span class="font-bold">14 000</span>
            </div>
          </div>

          <div class="border-t border-dashed border-slate-400 my-2 pt-1.5 space-y-1 text-[10px]">
            <div class="flex justify-between">
              <span>Oraliq summa:</span>
              <span>42 000 so'm</span>
            </div>
            <div class="flex justify-between text-xs font-black text-slate-900 border-t border-slate-900 pt-1">
              <span>JAMI TO'LOV:</span>
              <span>42 000 SO'M</span>
            </div>
            <div class="flex justify-between pt-1">
              <span>To'lov (Naqd pul):</span>
              <span>42 000 so'm</span>
            </div>
          </div>

          <!-- Footer -->
          <div class="text-center pt-2 space-y-1 border-t border-dashed border-slate-400 mt-2">
            <div v-if="receiptSettings.showBarcode" class="text-[10px] tracking-widest font-bold py-1">
              * #0042 *
            </div>
            <div class="text-[10px] text-slate-600 font-semibold">{{ receiptSettings.footerText || 'Xaridingiz uchun rahmat!' }}</div>
            <div class="text-[8px] text-slate-400">boshqar.uz — Universal Tizim</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Printer, Receipt, Save, CheckCircle2, AlertCircle } from 'lucide-vue-next';

defineProps<{
  receiptSettings: {
    enableReceiptPrinting?: boolean;
    paperSize: string;
    headerTitle: string;
    headerSubtitle: string;
    footerText: string;
    showBarcode: boolean;
    showCashier: boolean;
    showCustomer: boolean;
    autoPrint: boolean;
  };
  businessName?: string;
}>();

defineEmits<{
  (e: 'save'): void;
  (e: 'testPrint'): void;
}>();
</script>

