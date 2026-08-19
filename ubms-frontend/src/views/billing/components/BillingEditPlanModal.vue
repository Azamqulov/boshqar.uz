<template>
  <Teleport to="body">
    <div
      v-if="editingPlan"
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        class="w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        @click.stop
      >
        <!-- Modal Header -->
        <div class="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Edit2 class="w-4 h-4" />
            </div>
            <div>
              <h3 class="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                «{{ editingPlan.name }}» Tarifini Tahrirlash
              </h3>
              <p class="text-[11px] text-slate-400">SuperAdmin boshqaruv paneli</p>
            </div>
          </div>
          <button
            type="button"
            @click="$emit('close')"
            class="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- 2-Step Tab Bar -->
        <div class="px-4 sm:px-5 pt-3 pb-1 shrink-0 grid grid-cols-2 gap-2 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
          <button
            type="button"
            @click="$emit('update:editPlanStep', 1)"
            :class="[
              'py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2',
              editPlanStep === 1
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs ring-1 ring-emerald-500/30'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
            ]"
          >
            <span class="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[10px] font-black flex items-center justify-center text-emerald-700 dark:text-emerald-300">1</span>
            <span>Xizmatlar (ON/OFF)</span>
          </button>

          <button
            type="button"
            @click="$emit('update:editPlanStep', 2)"
            :class="[
              'py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2',
              editPlanStep === 2
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs ring-1 ring-emerald-500/30'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
            ]"
          >
            <span class="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] font-black flex items-center justify-center text-slate-700 dark:text-slate-300">2</span>
            <span>Narx va Limitlar</span>
          </button>
        </div>

        <!-- Modal Body (Scrollable) -->
        <form @submit.prevent="$emit('save')" class="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          <!-- BOSQICH 1: Xizmatlar va Funksiyalar (ON / OFF Toggles) -->
          <div v-if="editPlanStep === 1" class="space-y-3">
            <div class="flex items-center justify-between pb-1">
              <div>
                <h4 class="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Layers class="w-3.5 h-3.5 text-emerald-500" />
                  <span>Tarif Funksiyalari</span>
                </h4>
                <p class="text-[11px] text-slate-400">Ushbu tarifda ishlaydigan xizmatlarni yoqing yoki o'chiring</p>
              </div>
              <span class="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                {{ Object.values(editPlanForm.features).filter(Boolean).length }} ta faol
              </span>
            </div>

            <div class="space-y-2">
              <div
                v-for="feat in allAvailableFeatures"
                :key="feat.key"
                :class="[
                  'p-3 rounded-2xl border transition-all flex items-center justify-between gap-3',
                  editPlanForm.features[feat.key]
                    ? 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/30 dark:border-emerald-500/40 ring-1 ring-emerald-500/20'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800 opacity-60'
                ]"
              >
                <!-- Feature Info -->
                <div class="flex items-center gap-2.5 min-w-0">
                  <div
                    :class="[
                      'p-2 rounded-xl shrink-0 transition',
                      editPlanForm.features[feat.key]
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    ]"
                  >
                    <component :is="feat.icon" class="w-4 h-4" />
                  </div>
                  <div class="min-w-0">
                    <div class="flex items-center gap-2">
                      <p class="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {{ feat.label }}
                      </p>
                      <span
                        v-if="editPlanForm.features[feat.key]"
                        class="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-600 text-white"
                      >
                        ON
                      </span>
                      <span
                        v-else
                        class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                      >
                        OFF
                      </span>
                    </div>
                    <p class="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {{ feat.description }}
                    </p>
                  </div>
                </div>

                <!-- Toggle Switch -->
                <button
                  type="button"
                  @click="editPlanForm.features[feat.key] = !editPlanForm.features[feat.key]"
                  class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                  :class="editPlanForm.features[feat.key] ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'"
                >
                  <span
                    aria-hidden="true"
                    class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
                    :class="editPlanForm.features[feat.key] ? 'translate-x-5' : 'translate-x-0'"
                  />
                </button>
              </div>
            </div>
          </div>

          <!-- BOSQICH 2: Narx va Limitlar Parametrlari -->
          <div v-else-if="editPlanStep === 2" class="space-y-3.5">
            <div class="pb-1">
              <h4 class="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <CreditCard class="w-3.5 h-3.5 text-emerald-500" />
                <span>Asosiy Narx va Cheklovlar</span>
              </h4>
              <p class="text-[11px] text-slate-400">Tarif nomi, oylik to'lov summasi va ruxsat etilgan limitlar</p>
            </div>

            <!-- Plan Name -->
            <div class="space-y-1">
              <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Tarif Nomi *
              </label>
              <input
                v-model="editPlanForm.name"
                type="text"
                required
                class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
              />
            </div>

            <!-- Price Monthly -->
            <div class="space-y-1">
              <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Oylik Narxi (so'mda) *
              </label>
              <CurrencyInput
                v-model="editPlanForm.priceMonthly"
                placeholder="0"
                suffix="so'm / oy"
                input-class="!font-black !text-emerald-600 dark:!text-emerald-400 !text-xs !bg-slate-50/50 dark:!bg-slate-800"
              />
              <span class="text-[10px] text-slate-400">0 kiritilsa — Bepul (Free) deb ko'rsatiladi</span>
            </div>

            <!-- Limits: Branches & Users -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Maks. Filiallar soni
                </label>
                <input
                  v-model.number="editPlanForm.maxBranches"
                  type="number"
                  min="0"
                  placeholder="0 (Cheksiz)"
                  class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                />
                <span class="text-[10px] text-slate-400">0 yoki bo'sh = Cheksiz</span>
              </div>

              <div class="space-y-1">
                <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Maks. Xodimlar soni
                </label>
                <input
                  v-model.number="editPlanForm.maxUsers"
                  type="number"
                  min="0"
                  placeholder="0 (Cheksiz)"
                  class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                />
                <span class="text-[10px] text-slate-400">0 yoki bo'sh = Cheksiz</span>
              </div>
            </div>
          </div>

          <!-- Modal Footer Actions -->
          <div class="pt-3 flex items-center justify-between gap-2.5 border-t border-slate-100 dark:border-slate-800">
            <button
              v-if="editPlanStep === 1"
              type="button"
              @click="$emit('close')"
              class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Bekor qilish
            </button>
            <button
              v-else
              type="button"
              @click="$emit('update:editPlanStep', 1)"
              class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition"
            >
              <ArrowLeft class="w-3.5 h-3.5" />
              <span>Ortga (Xizmatlar)</span>
            </button>

            <button
              v-if="editPlanStep === 1"
              type="button"
              @click="$emit('update:editPlanStep', 2)"
              class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-500/25 flex items-center gap-2 transition"
            >
              <span>Keyingisi: Narx & Limitlar</span>
              <ArrowRight class="w-4 h-4" />
            </button>
            <button
              v-else
              type="submit"
              :disabled="savingPlan"
              class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-500/25 disabled:opacity-50 flex items-center gap-2 transition"
            >
              <Check class="w-4 h-4 stroke-[3]" />
              <span>{{ savingPlan ? 'Saqlanmoqda...' : 'Tarifni Saqlash' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import {
  Edit2,
  X,
  Layers,
  CreditCard,
  ArrowLeft,
  ArrowRight,
  Check,
} from 'lucide-vue-next';
import CurrencyInput from '../../../components/CurrencyInput.vue';

defineProps<{
  editingPlan: any;
  editPlanStep: number;
  editPlanForm: any;
  savingPlan: boolean;
  allAvailableFeatures: any[];
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'update:editPlanStep', step: number): void;
  (e: 'save'): void;
}>();
</script>
