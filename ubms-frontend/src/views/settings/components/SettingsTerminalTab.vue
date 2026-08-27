<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { CreditCard, Plus, CheckCircle2, ShieldCheck, Smartphone, Copy, Check, Save } from 'lucide-vue-next';
import AppSelect from '../../../components/AppSelect.vue';
import { usePosSettings } from '../../../composables/usePosSettings';
import { useToast } from '../../../composables/useToast';

const toast = useToast();
const { posSettings, saveSettings } = usePosSettings();

const cardBankOptions = [
  { value: 'Kapitalbank', label: 'Kapitalbank' },
  { value: 'TBC Bank', label: 'TBC Bank' },
  { value: 'Anorbank', label: 'Anorbank' },
  { value: 'Ipak Yo\'li Banki', label: 'Ipak Yo\'li Banki' },
  { value: 'Agrobank', label: 'Agrobank' },
  { value: 'Xalq Banki', label: 'Xalq Banki' },
  { value: 'Hamkorbank', label: 'Hamkorbank' },
  { value: 'Milliy Bank (NBU)', label: 'Milliy Bank (NBU)' },
  { value: 'O\'zsanoatqurilishbank (SQB)', label: 'SQB' },
  { value: 'Boshqa bank', label: 'Boshqa bank' },
];

const savingCardSettings = ref(false);
const copiedPreview = ref(false);

const cardForm = ref({
  cardNumber: posSettings.value.ownerCardNumber || '',
  cardHolder: posSettings.value.ownerCardHolder || '',
  cardBank: posSettings.value.ownerCardBank || 'Kapitalbank',
});

// Format card number with spaces (e.g. 8600 1234 5678 9012)
const formatCardNumberInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const raw = target.value.replace(/\D/g, '').slice(0, 16);
  const parts = raw.match(/.{1,4}/g);
  const formatted = parts ? parts.join(' ') : raw;
  cardForm.value.cardNumber = formatted;
  target.value = formatted;
};

const handleSaveCardSettings = async () => {
  savingCardSettings.value = true;
  try {
    posSettings.value.ownerCardNumber = cardForm.value.cardNumber;
    posSettings.value.ownerCardHolder = cardForm.value.cardHolder.toUpperCase();
    posSettings.value.ownerCardBank = cardForm.value.cardBank;
    
    await saveSettings();
    toast.success('Plastik karta rekvizitlari saqlandi!', 'Muvaffaqiyatli');
  } catch (err: any) {
    toast.error('Karta ma\'lumotlarini saqlashda xatolik yuz berdi', 'Xatolik');
  } finally {
    savingCardSettings.value = false;
  }
};

const copyCardToClipboard = async () => {
  if (!cardForm.value.cardNumber) return;
  try {
    await navigator.clipboard.writeText(cardForm.value.cardNumber.replace(/\s+/g, ''));
    copiedPreview.value = true;
    toast.success('Karta raqami nusxalandi!', 'Nusxa olindi');
    setTimeout(() => {
      copiedPreview.value = false;
    }, 2000);
  } catch (e) {}
};

const providerOptions = [
  { value: 'uzcard', label: 'Uzcard' },
  { value: 'humo', label: 'Humo' },
  { value: 'multipay', label: 'Multipay (Uzcard + Humo)' },
];

interface Terminal {
  id: string;
  name: string;
  provider: 'uzcard' | 'humo' | 'multipay';
  terminalId: string;
  merchantId: string;
  connectionType: string;
  ipAddress: string;
  isActive: boolean;
}

const terminals = ref<Terminal[]>([]);
const isLoading = ref(false);
const showAddModal = ref(false);

const newTerminal = ref({
  name: '',
  provider: 'uzcard' as 'uzcard' | 'humo' | 'multipay',
  terminalId: '',
  merchantId: '',
  ipAddress: '192.168.1.150',
  connectionType: 'ethernet',
});

// Demo initial terminals
onMounted(() => {
  cardForm.value = {
    cardNumber: posSettings.value.ownerCardNumber || '',
    cardHolder: posSettings.value.ownerCardHolder || '',
    cardBank: posSettings.value.ownerCardBank || 'Kapitalbank',
  };

  terminals.value = [
    {
      id: 'term-001',
      name: 'Kassa Uzcard Terminal #1',
      provider: 'uzcard',
      terminalId: '86001234',
      merchantId: 'MERCH-UZCARD-01',
      connectionType: 'ethernet',
      ipAddress: '192.168.1.150',
      isActive: true,
    },
    {
      id: 'term-002',
      name: 'Kassa Humo Terminal #1',
      provider: 'humo',
      terminalId: '98605678',
      merchantId: 'MERCH-HUMO-01',
      connectionType: 'ethernet',
      ipAddress: '192.168.1.151',
      isActive: true,
    },
  ];
});

function handleAddTerminal() {
  if (!newTerminal.value.name || !newTerminal.value.terminalId) return;

  terminals.value.push({
    id: `term-${Date.now()}`,
    name: newTerminal.value.name,
    provider: newTerminal.value.provider,
    terminalId: newTerminal.value.terminalId,
    merchantId: newTerminal.value.merchantId || 'MERCH-DEMO-01',
    connectionType: newTerminal.value.connectionType,
    ipAddress: newTerminal.value.ipAddress,
    isActive: true,
  });

  showAddModal.value = false;
  newTerminal.value = {
    name: '',
    provider: 'uzcard',
    terminalId: '',
    merchantId: '',
    ipAddress: '192.168.1.150',
    connectionType: 'ethernet',
  };
}
</script>

<template>
  <div class="space-y-6">
    <!-- SECTION 1: OWNER PLASTIC CARD & CLICK / PAYME SETTINGS -->
    <div class="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-sm space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shadow-xs">
            <CreditCard class="w-6 h-6" />
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white">Plastik Karta & Click / Payme O'tkazma Sozlamalari</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Ofitsiant va Kassa oynasida mijozlar to'lov qilishi uchun biznes egasi kartasi rekvizitlari</p>
          </div>
        </div>

        <button
          type="button"
          @click="handleSaveCardSettings"
          :disabled="savingCardSettings"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs transition shadow-sm shadow-emerald-600/20 disabled:opacity-50"
        >
          <Save class="w-4 h-4" />
          <span>{{ savingCardSettings ? 'Saqlanmoqda...' : 'Karta Ma\'lumotlarini Saqlash' }}</span>
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <!-- Input Form Fields -->
        <div class="lg:col-span-7 space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Karta Raqami (16 xonali)
            </label>
            <div class="relative">
              <input
                :value="cardForm.cardNumber"
                @input="formatCardNumberInput"
                type="text"
                placeholder="8600 0000 0000 0000 yoki 9860..."
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-sm tracking-wider focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <span class="absolute right-3 top-2.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {{ cardForm.cardNumber.startsWith('9860') ? 'HUMO' : cardForm.cardNumber.startsWith('8600') ? 'UZCARD' : 'KARTA' }}
              </span>
            </div>
            <p class="text-[11px] text-slate-400 mt-1">Mijozlar to'lov qilganda ofitsiant ekranida shu karta raqami chiqadi</p>
          </div>

              <!-- Karta Egasi & Bank Nomi -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Karta Egasi (F.I.SH / Ism Familiya)
                  </label>
                  <input
                    v-model="cardForm.cardHolder"
                    type="text"
                    placeholder="ALISHER VALIYEV"
                    class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs uppercase focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Bank Nomi
                  </label>
                  <AppSelect
                    v-model="cardForm.cardBank"
                    :options="cardBankOptions"
                    placeholder="Bankni tanlang..."
                    size="md"
                  />
                </div>
              </div>
            </div>

            <!-- Live Realistic Credit Card Preview -->
            <div class="lg:col-span-5 flex flex-col items-center">
              <span class="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Jonli Karta Ko'rinishi (Ofitsiant oynasida):</span>
              
              <div class="w-full max-w-sm h-48 rounded-2xl bg-gradient-to-tr from-slate-900 via-emerald-950 to-slate-900 p-5 text-white shadow-xl shadow-emerald-950/30 border border-emerald-500/30 flex flex-col justify-between relative overflow-hidden group select-none">
                <!-- Card Background Glow & Chips -->
                <div class="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none"></div>
                
                <div class="flex items-center justify-between z-10">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-6 rounded bg-amber-400/80 border border-amber-300/60 shadow-xs flex items-center justify-center">
                      <div class="w-6 h-4 border-t border-b border-amber-600/40"></div>
                    </div>
                    <span class="text-[10px] font-black uppercase tracking-widest text-emerald-400 font-mono">{{ cardForm.cardBank || 'KAPITALBANK' }}</span>
                  </div>
                  
                  <span class="px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-xs text-[11px] font-black tracking-widest border border-white/20">
                    {{ cardForm.cardNumber.startsWith('9860') ? 'HUMO' : cardForm.cardNumber.startsWith('8600') ? 'UZCARD' : 'VISA / MC' }}
                  </span>
                </div>

                <!-- Card Number -->
                <div class="z-10 my-auto">
                  <div class="flex items-center justify-between">
                    <span class="font-mono text-base sm:text-lg font-bold tracking-widest text-emerald-100">
                      {{ cardForm.cardNumber || '8600 •••• •••• ••••' }}
                    </span>
                    <button
                      type="button"
                      @click="copyCardToClipboard"
                      class="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-90 text-emerald-300 text-xs transition flex items-center gap-1"
                      title="Nusxa olish"
                    >
                      <component :is="copiedPreview ? Check : Copy" class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <!-- Card Footer: Holder -->
                <div class="flex items-end justify-between z-10 text-[11px]">
                  <div>
                    <span class="text-[9px] text-emerald-400/80 block uppercase tracking-wider font-semibold">Karta Egasi:</span>
                    <span class="font-bold tracking-wider uppercase text-white font-mono">
                      {{ cardForm.cardHolder || 'ISMI FAMILIYASI' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>
    </div>

    <!-- SECTION 2: POS TERMINALS -->
    <div class="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-sm">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <CreditCard class="w-6 h-6" />
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white">Uzcard & Humo POS Terminallar va Soliq OFD</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Kassadagi to'lov terminallarini va Soliq Qo'mitasi fiskal cheklarini boshqarish</p>
          </div>
        </div>

        <button
          type="button"
          @click="showAddModal = true"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-sm"
        >
          <Plus class="w-4 h-4" />
          <span>Yangi Terminal Ulash</span>
        </button>
      </div>
    </div>

    <!-- Active Terminals Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="term in terminals"
        :key="term.id"
        class="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-sm space-y-4"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs uppercase"
              :class="term.provider === 'uzcard' ? 'bg-blue-500/10 text-blue-600' : 'bg-emerald-500/10 text-emerald-600'"
            >
              {{ term.provider }}
            </div>
            <div>
              <h4 class="font-bold text-slate-900 dark:text-white text-sm">{{ term.name }}</h4>
              <span class="text-[11px] text-slate-500 font-mono">IP: {{ term.ipAddress }}</span>
            </div>
          </div>

          <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
            <CheckCircle2 class="w-3.5 h-3.5" />
            <span>Faol</span>
          </span>
        </div>

        <div class="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
          <div>
            <span class="text-slate-400 block text-[10px]">Terminal ID:</span>
            <span class="font-mono font-bold text-slate-700 dark:text-slate-200">{{ term.terminalId }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[10px]">Merchant ID:</span>
            <span class="font-mono font-bold text-slate-700 dark:text-slate-200">{{ term.merchantId }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Fiscal OFD Status Card -->
    <div class="glass-card rounded-2xl p-6 border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <ShieldCheck class="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        <div>
          <h4 class="font-bold text-slate-900 dark:text-white text-sm">Soliq Qo'mitasi OFD Moduli Ulangan</h4>
          <p class="text-xs text-slate-500 dark:text-slate-400">Har bir kassa savdosida Soliq serveriga avtomatik QR-kodli fiskal chek yuboriladi</p>
        </div>
      </div>
      <span class="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm">Z-Hisobot Tayyor</span>
    </div>

    <!-- Add Terminal Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
        <h3 class="text-base font-bold text-slate-900 dark:text-white">Yangi POS Terminal Ulashtirish</h3>
        
        <div class="space-y-3 text-xs">
          <div>
            <label class="block font-semibold mb-1">Terminal Nomi</label>
            <input v-model="newTerminal.name" type="text" placeholder="Masalan: Kassa Terminal #2" class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent" />
          </div>
          <div>
            <label class="block font-semibold mb-1">Tizim (Provider)</label>
            <AppSelect
              v-model="newTerminal.provider"
              :options="providerOptions"
              placeholder="Providerni tanlang..."
              size="md"
            />
          </div>
          <div>
            <label class="block font-semibold mb-1">Terminal ID</label>
            <input v-model="newTerminal.terminalId" type="text" placeholder="8600XXXX" class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent" />
          </div>
          <div>
            <label class="block font-semibold mb-1">IP Manzil</label>
            <input v-model="newTerminal.ipAddress" type="text" placeholder="192.168.1.150" class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent" />
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2">
          <button type="button" @click="showAddModal = false" class="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-semibold text-xs">Bekor qilish</button>
          <button type="button" @click="handleAddTerminal" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs">Saqlash</button>
        </div>
      </div>
    </div>
  </div>
</template>
