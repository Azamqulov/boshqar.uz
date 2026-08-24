<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { CreditCard, Plus, CheckCircle2, ShieldCheck, Cpu, RefreshCw } from 'lucide-vue-next';

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
    <!-- Header Card -->
    <div class="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-sm">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
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
            <select v-model="newTerminal.provider" class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent">
              <option value="uzcard">Uzcard</option>
              <option value="humo">Humo</option>
              <option value="multipay">Multipay (Uzcard+Humo)</option>
            </select>
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
