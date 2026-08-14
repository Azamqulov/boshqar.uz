<template>
  <div class="glass-card rounded-2xl overflow-hidden shadow-sm">
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead class="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-semibold">
          <tr>
            <th class="py-3.5 px-4">Mijoz (F.I.SH)</th>
            <th class="py-3.5 px-4">Telefon</th>
            <th class="py-3.5 px-4">Xaridlar Soni</th>
            <th class="py-3.5 px-4">Jami Xarid Summasi</th>
            <th class="py-3.5 px-4">Nasiya / Qarz</th>
            <th class="py-3.5 px-4 text-right">Amallar & Qarz Boshqaruvi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
          <tr v-if="customers.length === 0">
            <td colspan="6" class="py-12 text-center text-slate-400 dark:text-slate-500">
              <Users class="w-8 h-8 mx-auto mb-2 opacity-30" />
              <span>Mijozlar topilmadi</span>
            </td>
          </tr>
          <tr
            v-for="c in customers"
            :key="c.id"
            class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition group"
          >
            <!-- Name & Notes -->
            <td class="py-3.5 px-4">
              <div class="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>{{ c.fullName }}</span>
                <span
                  v-if="c.notes"
                  :title="c.notes"
                  class="p-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-help"
                >
                  📝
                </span>
              </div>
              <div v-if="c.notes" class="text-[10px] text-slate-400 line-clamp-1 max-w-xs mt-0.5">
                {{ c.notes.split('\n')[0] }}
              </div>
            </td>

            <!-- Phone -->
            <td class="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono">
              {{ c.phone ? formatUzbekPhone(c.phone) : '-' }}
            </td>

            <!-- Purchases Count -->
            <td class="py-3.5 px-4 font-mono font-medium">
              {{ c.totalPurchases || 0 }} ta
            </td>

            <!-- Total Spent -->
            <td class="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {{ formatCurrency(c.totalSpent || 0) }}
            </td>

            <!-- Debt -->
            <td class="py-3.5 px-4 font-mono">
              <span
                class="font-black px-2.5 py-1 rounded-lg text-xs inline-block"
                :class="Number(c.debt) > 0 ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'"
              >
                {{ formatCurrency(c.debt || 0) }}
              </span>
            </td>

            <!-- Actions -->
            <td class="py-3.5 px-4 text-right">
              <div class="flex items-center justify-end gap-1.5">
                <!-- 1. Add Debt (+ Qarz kiritish) -->
                <button
                  type="button"
                  @click="$emit('openAddDebt', c)"
                  title="Qarz / Nasiya kiritish"
                  class="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs transition border border-rose-500/20 flex items-center gap-1 btn-interactive"
                >
                  <Plus class="w-3.5 h-3.5" />
                  <span>Qarz kiritish</span>
                </button>

                <!-- 2. Pay Debt (Qarzni yopish - agar qarzi bo'lsa) -->
                <button
                  v-if="Number(c.debt) > 0"
                  type="button"
                  @click="$emit('openPayDebt', c)"
                  title="Qarz to'lovini qabul qilish"
                  class="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-bold text-xs transition border border-emerald-500/30 flex items-center gap-1 btn-interactive"
                >
                  <CreditCard class="w-3.5 h-3.5" />
                  <span>To'lov olish</span>
                </button>

                <!-- 3. History (Tarix / Nasiya daftari) -->
                <button
                  type="button"
                  @click="$emit('openHistory', c)"
                  title="Mijoz xarid va qarz tarixi"
                  class="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <History class="w-4 h-4" />
                </button>

                <!-- 4. Edit (Tahrirlash) -->
                <button
                  v-if="canEdit('customers')"
                  type="button"
                  @click="$emit('openEdit', c)"
                  title="Mijozni tahrirlash"
                  class="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <Edit2 class="w-4 h-4" />
                </button>

                <!-- 5. Delete (O'chirish) -->
                <button
                  v-if="canDelete('customers')"
                  type="button"
                  @click="$emit('delete', c)"
                  title="Mijozni o'chirish"
                  class="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                >
                  <Trash2 class="w-4 h-4" />
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
import { Users, Plus, CreditCard, History, Edit2, Trash2 } from 'lucide-vue-next';
import { useFormat } from '../../../composables/useFormat';
import { formatUzbekPhone } from '../../../composables/usePhoneMask';
import { usePermissions } from '../../../composables/usePermissions';

defineProps<{
  customers: any[];
}>();

defineEmits<{
  (e: 'openAddDebt', c: any): void;
  (e: 'openPayDebt', c: any): void;
  (e: 'openHistory', c: any): void;
  (e: 'openEdit', c: any): void;
  (e: 'delete', c: any): void;
}>();

const { formatCurrency } = useFormat();
const { canCreate, canEdit, canDelete } = usePermissions();
</script>
