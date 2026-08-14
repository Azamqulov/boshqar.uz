<template>
  <div>
    <div v-if="suppliers.length === 0" class="glass-card rounded-2xl p-12 text-center text-slate-400 dark:text-slate-500">
      <Truck class="w-10 h-10 mx-auto mb-2 opacity-30" />
      <span>Ta'minotchilar topilmadi</span>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div
        v-for="s in suppliers"
        :key="s.id"
        class="glass-card rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90"
      >
        <div>
          <div class="flex items-start justify-between gap-2 mb-3">
            <div class="flex items-center gap-2.5">
              <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 font-black text-sm flex items-center justify-center shrink-0">
                <Building2 class="w-5 h-5" />
              </div>
              <div>
                <h4 class="font-black text-sm text-slate-900 dark:text-white line-clamp-1">
                  {{ s.name }}
                </h4>
                <p v-if="s.companyName" class="text-[11px] text-slate-500 line-clamp-1">
                  {{ s.companyName }}
                </p>
              </div>
            </div>
          </div>

          <div class="space-y-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs">
            <div v-if="s.phone" class="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <Phone class="w-3.5 h-3.5 text-slate-400" />
              <span class="font-mono">{{ s.phone }}</span>
            </div>
            <div v-if="s.address" class="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <MapPin class="w-3.5 h-3.5 text-slate-400" />
              <span class="truncate">{{ s.address }}</span>
            </div>
            <div class="flex justify-between items-center pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
              <span class="text-slate-400">Bizning Qarz:</span>
              <span class="font-black font-mono" :class="Number(s.balance) > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'">
                {{ formatCurrency(Number(s.balance || 0)) }}
              </span>
            </div>
          </div>
        </div>

        <div class="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <div class="flex items-center gap-1.5">
            <button
              v-if="Number(s.balance) > 0"
              type="button"
              @click="$emit('openPay', s)"
              class="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition flex items-center gap-1 btn-interactive"
            >
              <CreditCard class="w-3.5 h-3.5" />
              <span>To'lov Berish</span>
            </button>
            <span v-else class="text-[11px] text-slate-400 italic">Qarzsiz</span>
          </div>

          <div class="flex items-center gap-1">
            <button
              @click="$emit('openStatement', s)"
              class="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
              title="Solishtirma Dalolatnoma (Akt Sverka)"
            >
              <FileSpreadsheet class="w-3.5 h-3.5" />
            </button>
            <button
              @click="$emit('openHistory', s)"
              class="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
              title="To'lov tarixi"
            >
              <History class="w-3.5 h-3.5" />
            </button>
            <button
              v-if="canEdit('suppliers')"
              @click="$emit('openEdit', s)"
              class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
              title="Tahrirlash"
            >
              <Edit class="w-4 h-4" />
            </button>
            <button
              v-if="canDelete('suppliers')"
              @click="$emit('delete', s)"
              class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
              title="O'chirish"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Truck, Building2, Phone, MapPin, CreditCard, History, Edit, Trash2, FileSpreadsheet } from 'lucide-vue-next';
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
