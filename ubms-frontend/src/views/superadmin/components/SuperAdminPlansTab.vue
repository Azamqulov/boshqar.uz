<template>
  <div>
    <!-- Plans Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        v-for="plan in plans"
        :key="plan.id"
        class="glass-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between border shadow-sm transition hover:shadow-md"
        :class="plan.name === 'Pro' ? 'border-emerald-500/50 shadow-emerald-500/10 ring-2 ring-emerald-500/20' : 'border-slate-200 dark:border-slate-800'"
      >
        <div>
          <div class="flex items-center justify-between mb-4">
            <span class="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider" :class="getPlanBadgeClass(plan.name)">
              {{ plan.name }}
            </span>
            <span class="text-xl font-black text-slate-900 dark:text-white font-mono">
              {{ Number(plan.priceMonthly) === 0 ? 'Bepul' : formatCurrency(plan.priceMonthly) }}
            </span>
          </div>

          <h3 class="text-base font-bold text-slate-900 dark:text-white mb-2">{{ plan.name }} Tarif Rejasi</h3>
          
          <ul class="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
            <li class="flex items-center gap-2">
              <CheckCircle class="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Maksimal filiallar: <strong>{{ plan.maxBranches ? `${plan.maxBranches} ta` : 'Cheksiz' }}</strong></span>
            </li>
            <li class="flex items-center gap-2">
              <CheckCircle class="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Maksimal xodimlar: <strong>{{ plan.maxUsers ? `${plan.maxUsers} ta` : 'Cheksiz' }}</strong></span>
            </li>
          </ul>
        </div>

        <div class="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span class="text-[11px] text-slate-400">Landing sahifada aks etadi</span>
          <button
            type="button"
            @click="openEditModal(plan)"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20 hover:text-emerald-600 dark:hover:text-emerald-400 text-slate-700 dark:text-slate-200 text-xs font-bold transition btn-interactive"
          >
            <Edit2 class="w-3.5 h-3.5" />
            <span>Tahrirlash</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Plan Modal -->
    <Teleport to="body">
      <div v-if="editingPlan" @click.self="editingPlan = null" class="modal-overlay">
        <div class="modal-container max-w-md" @click.stop>
          <div class="modal-header pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <CreditCard class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                  «{{ editingPlan.name }}» Tarifini Tahrirlash
                </h3>
                <p class="text-[11px] text-slate-500 dark:text-slate-400">Narx va limitlar to'g'ridan-to'g'ri Landing pageda yangilanadi</p>
              </div>
            </div>
            <button @click="editingPlan = null" class="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition">
              <X class="w-5 h-5" />
            </button>
          </div>

          <form @submit.prevent="savePlanChanges" class="modal-body p-4 space-y-3.5 text-xs">
            <!-- Plan Name -->
            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                Tarif Nomi *
              </label>
              <input
                v-model="editForm.name"
                required
                class="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 font-bold shadow-inner"
              />
            </div>

            <!-- Price Monthly -->
            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                Oylik Narxi (so'mda) *
              </label>
              <CurrencyInput
                v-model="editForm.priceMonthly"
                placeholder="0"
                suffix="so'm / oy"
                inputClass="font-bold text-emerald-600 dark:text-emerald-400 text-sm"
              />
              <span class="text-[10px] text-slate-400 mt-0.5 block">0 kiritilsa — Bepul (Free) deb ko'rsatiladi</span>
            </div>

            <!-- Limits: Branches & Users -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                  Maks. Filiallar
                </label>
                <input
                  type="number"
                  min="0"
                  v-model.number="editForm.maxBranches"
                  placeholder="0 (Cheksiz)"
                  class="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 font-bold shadow-inner"
                />
                <span class="text-[10px] text-slate-400 mt-0.5 block">0 = Cheksiz</span>
              </div>

              <div>
                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                  Maks. Xodimlar
                </label>
                <input
                  type="number"
                  min="0"
                  v-model.number="editForm.maxUsers"
                  placeholder="0 (Cheksiz)"
                  class="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 font-bold shadow-inner"
                />
                <span class="text-[10px] text-slate-400 mt-0.5 block">0 = Cheksiz</span>
              </div>
            </div>

            <!-- Buttons -->
            <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                @click="editingPlan = null"
                class="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition"
              >
                Bekor qilish
              </button>
              <AppButton
                type="submit"
                variant="primary"
                size="md"
                class="px-6"
                :loading="saving"
              >
                Tarifni Saqlash
              </AppButton>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { CheckCircle, Edit2, X, CreditCard } from 'lucide-vue-next';
import { useFormat } from '../../../composables/useFormat';
import { useToast } from '../../../composables/useToast';
import api, { getErrorMessage } from '../../../services/api';
import AppButton from '../../../components/AppButton.vue';
import CurrencyInput from '../../../components/CurrencyInput.vue';

const props = defineProps<{
  plans: any[];
}>();

const emit = defineEmits<{
  (e: 'planUpdated'): void;
}>();

const toast = useToast();
const { formatCurrency } = useFormat();

const editingPlan = ref<any | null>(null);
const saving = ref(false);

const editForm = ref({
  name: '',
  priceMonthly: 0,
  maxBranches: 1,
  maxUsers: 1,
});

const openEditModal = (plan: any) => {
  editingPlan.value = plan;
  editForm.value = {
    name: plan.name || '',
    priceMonthly: Number(plan.priceMonthly) || 0,
    maxBranches: plan.maxBranches ?? 0,
    maxUsers: plan.maxUsers ?? 0,
  };
};

const savePlanChanges = async () => {
  if (!editingPlan.value) return;
  saving.value = true;
  try {
    await api.patch(`/superadmin/plans/${editingPlan.value.id}`, {
      name: editForm.value.name,
      priceMonthly: Number(editForm.value.priceMonthly) || 0,
      maxBranches: Number(editForm.value.maxBranches) || 0,
      maxUsers: Number(editForm.value.maxUsers) || 0,
    });

    toast.success(`«${editForm.value.name}» tarifi muvaffaqiyatli yangilandi! Landing sahifada ham darhol aks etadi.`, 'Tarif Saqlandi');
    editingPlan.value = null;
    emit('planUpdated');
  } catch (err) {
    toast.error(getErrorMessage(err, 'Tarifni saqlashda xatolik yuz berdi'), 'Xatolik');
  } finally {
    saving.value = false;
  }
};

const getPlanBadgeClass = (plan: string) => {
  switch (plan?.toLowerCase()) {
    case 'business':
      return 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30';
    case 'pro':
      return 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30';
    default:
      return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
  }
};
</script>
