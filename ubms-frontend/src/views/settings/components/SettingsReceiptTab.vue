<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-5xl">
    <!-- Left 7 cols: Controls -->
    <div class="lg:col-span-7 space-y-5">
      <!-- Paper Size Cards -->
      <div class="glass-card rounded-2xl p-5 space-y-3">
        <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Printer class="w-4 h-4 text-emerald-500" />
          <span>Chek Formati / O'lchami</span>
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Kassangizdagi termal printer yoki standart printer qog'oz o'lchamini tanlang
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
            <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Kichik kassa lentalari</div>
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
            <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Standart termal chek</div>
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
          <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Chek Boshidagi Sarlavha (Do'kon nomi)</label>
          <input
            v-model="receiptSettings.headerTitle"
            :placeholder="businessName || 'Do\'kon nomi'"
            class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Chek Ostidagi Izoh / Kontaktlar</label>
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
            <span class="font-medium text-slate-700 dark:text-slate-300">Kassada to'lov qilingandan so'ng chekni darhol avtomatik chop etish</span>
            <input type="checkbox" v-model="receiptSettings.autoPrint" class="rounded text-emerald-500 focus:ring-emerald-500" />
          </label>
        </div>
      </div>

      <!-- Buttons -->
      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="$emit('save')"
          class="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition btn-interactive flex items-center justify-center gap-2"
        >
          <Save class="w-4 h-4" />
          <span>Sozlamalarni Saqlash</span>
        </button>

        <button
          type="button"
          @click="$emit('testPrint')"
          class="py-3 px-5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition flex items-center gap-2 btn-interactive"
        >
          <Printer class="w-4 h-4" />
          <span>Test Chek Chop Etish</span>
        </button>
      </div>
    </div>

    <!-- Right 5 cols: Live Mock Receipt Preview -->
    <div class="lg:col-span-5">
      <div class="glass-card rounded-2xl p-5 sticky top-20 space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-500 uppercase">Jonli Chek Ko'rinishi</span>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
            {{ receiptSettings.paperSize }}
          </span>
        </div>

        <!-- Realistic Receipt Paper Preview -->
        <div
          class="bg-white text-slate-900 font-mono text-[11px] p-4 rounded-xl shadow-md border border-slate-200 mx-auto transition-all duration-300 overflow-hidden"
          :style="{ maxWidth: receiptSettings.paperSize === '58mm' ? '220px' : receiptSettings.paperSize === 'A4' ? '100%' : '280px' }"
        >
          <div class="text-center space-y-1">
            <div class="font-black text-sm uppercase">{{ receiptSettings.headerTitle || businessName || 'Do\'kon Nomi' }}</div>
            <div v-if="receiptSettings.headerSubtitle" class="text-[10px] text-slate-500">{{ receiptSettings.headerSubtitle }}</div>
            <div class="border-b border-dashed border-slate-400 my-2"></div>
            <div class="text-[10px] text-left space-y-0.5">
              <div>CHEK №: <strong>#0042</strong></div>
              <div>SANA: 13-avgust, 2026 16:15</div>
              <div v-if="receiptSettings.showCashier">KASSIR: BOT (Sotuvchi)</div>
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
import { Printer, Save } from 'lucide-vue-next';

defineProps<{
  receiptSettings: {
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
