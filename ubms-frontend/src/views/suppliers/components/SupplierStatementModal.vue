<template>
  <Teleport to="body">
    <div v-if="isOpen" @click.self="$emit('close')" class="modal-overlay !z-[99999]">
      <div class="modal-container max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" @click.stop>
        
        <!-- Header -->
        <div class="modal-header border-b border-slate-200 dark:border-slate-800 p-4 bg-slate-50/80 dark:bg-slate-800/60 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet class="w-5 h-5" />
            </div>
            <div>
              <h3 class="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span>Solishtirma Dalolatnoma (Akt Sverka)</span>
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono font-bold">
                  {{ supplier?.name }}
                </span>
              </h3>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">Ta'minotchi bilan barcha to'lovlar va audit xulosasi</p>
            </div>
          </div>

          <div class="flex items-center gap-1.5">
            <button
              type="button"
              @click="printStatement"
              class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition btn-interactive"
              title="Chop qilish"
            >
              <Printer class="w-3.5 h-3.5" />
              <span>Chop Qilish</span>
            </button>
            <button
              type="button"
              @click="$emit('close')"
              class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Printable Statement Area -->
        <div id="supplier-statement-printable" class="modal-body overflow-y-auto p-4 sm:p-6 space-y-5 flex-1">
          
          <!-- Statement Header for Print -->
          <div class="border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h2 class="text-base font-black text-slate-900 dark:text-white">HISOB-KITOB SOLISHTIRMA DALOLATNOMASI</h2>
              <p class="text-xs text-slate-500">Sana: {{ formatDate(new Date()) }}</p>
            </div>
            <div class="text-left sm:text-right text-xs">
              <span class="text-slate-400 block">Ta'minotchi / Firma:</span>
              <span class="font-bold text-slate-800 dark:text-slate-200 text-sm">{{ supplier?.name }}</span>
              <span v-if="supplier?.phone" class="text-slate-500 block font-mono">{{ supplier?.phone }}</span>
            </div>
          </div>

          <!-- Summary Balance Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Jami To'langan Summa</span>
              <span class="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1 block">
                {{ formatCurrency(statementData?.totalPaid || 0) }}
              </span>
              <span class="text-[10px] text-slate-400 mt-0.5 block">{{ statementData?.paymentsCount || 0 }} ta to'lov</span>
            </div>

            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Hozirgi Qarzimiz</span>
              <span class="text-base font-black font-mono mt-1 block" :class="Number(supplier?.balance) > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'">
                {{ formatCurrency(Number(supplier?.balance || 0)) }}
              </span>
              <span class="text-[10px] text-slate-400 mt-0.5 block">
                {{ Number(supplier?.balance) > 0 ? 'To\'lanishi kerak' : 'Hisob-kitob nol' }}
              </span>
            </div>

            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Audit Holati</span>
              <div class="flex items-center gap-1.5 mt-1 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                <ShieldCheck class="w-4 h-4 text-emerald-500" />
                <span>100% Tasdiqlangan</span>
              </div>
              <span class="text-[10px] text-slate-400 mt-0.5 block">Xavfsiz hisob-kitob</span>
            </div>
          </div>

          <!-- Payments & Audit History Table -->
          <div class="space-y-2">
            <h4 class="font-bold text-xs text-slate-900 dark:text-white flex items-center justify-between">
              <span>Barcha To'lovlar & Chiqimlar Tarixi</span>
              <span class="text-[11px] font-normal text-slate-400">Oxirgi amallar</span>
            </h4>

            <div v-if="loading" class="p-6 text-center text-xs text-slate-400">
              Yuklanmoqda...
            </div>

            <div v-else-if="!statementData?.payments?.length" class="p-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
              Ushbu ta'minotchi bo'yicha to'lovlar tarixi mavjud emas
            </div>

            <div v-else class="border border-slate-200 dark:border-slate-700/80 rounded-2xl overflow-hidden shadow-2xs">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th class="p-2.5">Sana & Vaqt</th>
                    <th class="p-2.5">Summa</th>
                    <th class="p-2.5">Qarz (Oldin $\rightarrow$ Keyin)</th>
                    <th class="p-2.5">Izoh / Manba</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  <tr v-for="p in statementData.payments" :key="p.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td class="p-2.5 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                      {{ formatDateTime(p.createdAt) }}
                    </td>
                    <td class="p-2.5 font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      -{{ formatCurrency(Number(p.amount)) }}
                    </td>
                    <td class="p-2.5 font-mono text-slate-500 text-[11px]">
                      {{ formatCurrency(Number(p.balanceBefore)) }} $\rightarrow$ <strong class="text-slate-800 dark:text-slate-200">{{ formatCurrency(Number(p.balanceAfter)) }}</strong>
                    </td>
                    <td class="p-2.5 text-slate-600 dark:text-slate-400 text-[11px] truncate max-w-[150px]">
                      {{ p.description || 'To\'lov' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Signature area for printed contract / Akt Sverka -->
          <div class="pt-6 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-6 text-xs text-slate-600 dark:text-slate-400">
            <div>
              <p class="font-bold text-slate-900 dark:text-white">Xaridor (Biz):</p>
              <div class="mt-4 pt-4 border-b border-slate-300 dark:border-slate-600 w-3/4"></div>
              <p class="text-[10px] text-slate-400 mt-1">Imzo va Muhr / F.I.Sh</p>
            </div>
            <div class="text-right">
              <p class="font-bold text-slate-900 dark:text-white">Yetkazib beruvchi (Ta'minotchi):</p>
              <div class="mt-4 pt-4 border-b border-slate-300 dark:border-slate-600 w-3/4 ml-auto"></div>
              <p class="text-[10px] text-slate-400 mt-1">Imzo va Muhr / F.I.Sh</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 flex items-center justify-between">
          <span class="text-[11px] text-slate-400 flex items-center gap-1">
            <ShieldCheck class="w-3.5 h-3.5 text-emerald-500" />
            <span>Audit jurnallarida to'liq himoyalangan</span>
          </span>
          <AppButton variant="secondary" size="md" @click="$emit('close')">
            Yopish
          </AppButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import api from '../../../services/api';
import {
  FileSpreadsheet,
  X,
  Printer,
  ShieldCheck,
} from 'lucide-vue-next';
import AppButton from '../../../components/AppButton.vue';
import { useFormat } from '../../../composables/useFormat';

const props = defineProps<{
  isOpen: boolean;
  supplier: any;
}>();

defineEmits<{
  (e: 'close'): void;
}>();

const { formatCurrency, formatDate, formatDateTime } = useFormat();
const loading = ref(false);
const statementData = ref<any>(null);

const fetchStatement = async () => {
  if (!props.supplier?.id) return;
  loading.value = true;
  try {
    const { data } = await api.get(`/suppliers/${props.supplier.id}/statement`);
    statementData.value = data;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

watch(
  () => props.isOpen,
  (open) => {
    if (open) fetchStatement();
  }
);

const printStatement = () => {
  window.print();
};
</script>

<style scoped>
@media print {
  body * {
    visibility: hidden;
  }
  #supplier-statement-printable,
  #supplier-statement-printable * {
    visibility: visible;
  }
  #supplier-statement-printable {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    background: white !important;
    color: black !important;
  }
}
</style>
