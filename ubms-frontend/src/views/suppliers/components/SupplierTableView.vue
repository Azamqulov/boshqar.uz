<template>
  <div class="glass-card rounded-2xl overflow-hidden shadow-sm">
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead class="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-semibold">
          <tr>
            <th class="py-3.5 px-4">Ta'minotchi / Firma</th>
            <th class="py-3.5 px-4">Telefon</th>
            <th class="py-3.5 px-4">Manzil</th>
            <th class="py-3.5 px-4">Bizning Balans / Qarzimiz</th>
            <th class="py-3.5 px-4">Izoh</th>
            <th class="py-3.5 px-4 text-right">Amallar</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
          <tr v-if="suppliers.length === 0">
            <td colspan="6" class="py-12 text-center text-slate-400 dark:text-slate-500">
              <Truck class="w-8 h-8 mx-auto mb-2 opacity-30" />
              <span>Ta'minotchilar topilmadi</span>
            </td>
          </tr>
          <tr
            v-for="s in suppliers"
            :key="s.id"
            class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition group"
          >
            <!-- Name & Company -->
            <td class="py-3.5 px-4">
              <div class="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 class="w-4 h-4 text-blue-500 shrink-0" />
                <span>{{ s.name }}</span>
              </div>
              <div v-if="s.companyName" class="text-[11px] text-slate-500 dark:text-slate-400 font-medium pl-6">
                {{ s.companyName }}
              </div>
            </td>

            <!-- Phone -->
            <td class="py-3.5 px-4 font-mono font-medium">
              <div v-if="s.phone" class="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <Phone class="w-3.5 h-3.5 text-slate-400" />
                <span>{{ s.phone }}</span>
              </div>
              <span v-else class="text-slate-400 dark:text-slate-600">—</span>
            </td>

            <!-- Address -->
            <td class="py-3.5 px-4">
              <div v-if="s.address" class="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <MapPin class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span class="truncate max-w-[180px]">{{ s.address }}</span>
              </div>
              <span v-else class="text-slate-400 dark:text-slate-600">—</span>
            </td>

            <!-- Balance / Debt -->
            <td class="py-3.5 px-4 font-mono">
              <div
                class="font-black inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs"
                :class="[
                  Number(s.balance) > 0
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                    : Number(s.balance) < 0
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                ]"
              >
                <AlertCircle v-if="Number(s.balance) > 0" class="w-3.5 h-3.5" />
                <span>{{ formatCurrency(Math.abs(Number(s.balance))) }}</span>
                <span v-if="Number(s.balance) > 0" class="text-[10px] uppercase font-bold ml-1">(Qarzimiz)</span>
                <span v-else-if="Number(s.balance) < 0" class="text-[10px] uppercase font-bold ml-1">(Haqdoriz)</span>
                <span v-else class="text-[10px] uppercase font-bold ml-1">(Nol)</span>
              </div>
            </td>

            <!-- Notes -->
            <td class="py-3.5 px-4 max-w-[200px]">
              <p v-if="s.notes" class="truncate text-slate-500 dark:text-slate-400 text-xs" :title="s.notes">
                {{ s.notes }}
              </p>
              <span v-else class="text-slate-400 dark:text-slate-600">—</span>
            </td>

            <!-- Actions -->
            <td class="py-3.5 px-4 text-right">
              <div class="flex items-center justify-end gap-1.5">
                <!-- Pay Debt button -->
                <button
                  v-if="Number(s.balance) > 0"
                  type="button"
                  @click="$emit('openPay', s)"
                  class="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition flex items-center gap-1 btn-interactive"
                  title="Ta'minotchiga to'lov qilish"
                >
                  <CreditCard class="w-3.5 h-3.5" />
                  <span>To'lov Berish</span>
                </button>

                <!-- Statement / Akt Sverka button -->
                <button
                  type="button"
                  @click="$emit('openStatement', s)"
                  class="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
                  title="Solishtirma Dalolatnoma (Akt Sverka)"
                >
                  <FileSpreadsheet class="w-4 h-4 text-emerald-500" />
                </button>

                <!-- Payment History button -->
                <button
                  type="button"
                  @click="$emit('openHistory', s)"
                  class="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
                  title="To'lov tarixi"
                >
                  <History class="w-4 h-4" />
                </button>

                <!-- Edit button -->
                <button
                  v-if="canEdit('suppliers')"
                  type="button"
                  @click="$emit('openEdit', s)"
                  class="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Tahrirlash"
                >
                  <Edit class="w-4 h-4 text-blue-500" />
                </button>

                <!-- Delete button -->
                <button
                  v-if="canDelete('suppliers')"
                  type="button"
                  @click="$emit('delete', s)"
                  class="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                  title="O'chirish"
                >
                  <Trash2 class="w-4 h-4 text-rose-500" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Truck, Building2, Phone, MapPin, AlertCircle, CreditCard, History, Edit, Trash2, FileSpreadsheet } from 'lucide-vue-next';
import { useFormat } from '../../../composables/useFormat';
import { usePermissions } from '../../../composables/usePermissions';

defineProps<{
  suppliers: any[];
}>();

defineEmits<{
  (e: 'openPay', s: any): void;
  (e: 'openHistory', s: any): void;
  (e: 'openStatement', s: any): void;
  (e: 'openEdit', s: any): void;
  (e: 'delete', s: any): void;
}>();

const { formatCurrency } = useFormat();
const { canEdit, canDelete } = usePermissions();
</script>
