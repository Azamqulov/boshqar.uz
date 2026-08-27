<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      @click.self="handleClose"
      class="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div
        class="w-full max-w-[500px] bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden text-left animate-in zoom-in-95 duration-200"
      >
        <!-- Modal Header with Step Dots -->
        <div class="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
              <Sparkles class="w-5 h-5" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-extrabold text-base text-slate-900 dark:text-white">
                  {{ currentStep === 1 ? 'Jonli Demoni Sinash' : 'Biznes Turini Tanlang' }}
                </h3>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                {{ currentStep === 1 ? '15 ta tovar bilan bepul demo yaratish' : 'Tizim aynan shu sohaga moslashadi' }}
              </p>
            </div>
          </div>

          <!-- Step Indicators & Close Button -->
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-1.5">
              <span
                class="w-2.5 h-2.5 rounded-full transition-all duration-300"
                :class="currentStep === 1 ? 'bg-emerald-500 w-5' : 'bg-emerald-500'"
              ></span>
              <span
                class="w-2.5 h-2.5 rounded-full transition-all duration-300"
                :class="currentStep === 2 ? 'bg-emerald-500 w-5' : 'bg-slate-200 dark:bg-slate-700'"
              ></span>
            </div>
            <button
              type="button"
              @click="handleClose"
              class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition cursor-pointer"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- STEP 1: Company Name & Phone -->
        <div v-if="currentStep === 1" class="p-6 space-y-4 animate-in fade-in duration-150">
          <!-- Company Name -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Kompaniya yoki Do'koningiz Nomi <span class="text-rose-500">*</span>
            </label>
            <div class="relative">
              <Building2 class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                v-model="form.companyName"
                ref="companyInput"
                placeholder="Masalan: Baraka Market"
                class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-medium transition"
                @keydown.enter.prevent="goToStep2"
              />
            </div>
          </div>

          <!-- Phone Number -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Telefon Raqamingiz <span class="text-rose-500">*</span>
            </label>
            <PhoneInput
              v-model="form.phone"
              placeholder="90 123 45 67"
            />
          </div>

          <!-- Trust Badges Row -->
          <div class="pt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <div class="flex items-center gap-1.5">
              <CheckCircle2 class="w-3.5 h-3.5 text-emerald-500" />
              <span>Karta talab etilmaydi</span>
            </div>
            <div class="flex items-center gap-1.5">
              <CheckCircle2 class="w-3.5 h-3.5 text-emerald-500" />
              <span>1 daqiqada tayyor</span>
            </div>
          </div>

          <!-- Next Button -->
          <div class="pt-2">
            <button
              type="button"
              @click="goToStep2"
              class="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Keyingisi: Sohani Tanlash</span>
              <ArrowRight class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- STEP 2: Sector Selection & Launch -->
        <div v-else class="p-6 space-y-4 animate-in fade-in duration-150">
          <div class="space-y-2">
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Biznes Yo'nalishingizni Tanlang <span class="text-rose-500">*</span>
            </label>

            <!-- 6 Sectors Grid (3x2) -->
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                v-for="cat in allSectors"
                :key="cat.id"
                @click="form.businessType = cat.id"
                :class="[
                  'p-3 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between min-h-[82px] cursor-pointer relative group',
                  form.businessType === cat.id
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-950 dark:text-white ring-2 ring-emerald-500/30'
                    : 'bg-slate-50/80 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                ]"
              >
                <!-- Card Top: Icon & Checkmark -->
                <div class="flex items-center justify-between w-full">
                  <div
                    class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    :class="form.businessType === cat.id 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'"
                  >
                    <component :is="cat.icon" class="w-3.5 h-3.5" />
                  </div>

                  <div
                    v-if="form.businessType === cat.id"
                    class="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center"
                  >
                    <Check class="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                </div>

                <!-- Card Bottom: Label & Subtext -->
                <div class="mt-1.5 space-y-0.5">
                  <div class="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {{ cat.label }}
                  </div>
                  <div class="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                    {{ cat.desc }}
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- Bottom Actions -->
          <div class="pt-2 flex items-center gap-2.5">
            <button
              type="button"
              @click="currentStep = 1"
              class="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft class="w-4 h-4" />
              <span>Orqaga</span>
            </button>

            <button
              type="button"
              @click="handleSubmit"
              :disabled="loading"
              class="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles v-if="!loading" class="w-4 h-4" />
              <span v-if="loading">Tayyorlanmoqda...</span>
              <span v-else>Demoni Boshlash</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import {
  Sparkles,
  X,
  Building2,
  Check,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  UtensilsCrossed,
  Coffee,
  Pill,
  Scissors,
  Wrench,
} from 'lucide-vue-next';
import PhoneInput from '../../../components/PhoneInput.vue';

const props = defineProps<{
  isOpen: boolean;
  loading: boolean;
  sectorOptions?: any[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', form: { companyName: string; phone: string; businessType: string }): void;
}>();

const currentStep = ref<number>(1);
const companyInput = ref<HTMLInputElement | null>(null);

const allSectors = [
  { id: 'shop', label: "Do'kon & Savdo", icon: ShoppingBag, desc: "Chakana & ulgurji" },
  { id: 'restaurant', label: "Restoran", icon: UtensilsCrossed, desc: "Stollar & ofitsiant" },
  { id: 'cafe', label: "Kafe & Fastfood", icon: Coffee, desc: "Tezkor kassa" },
  { id: 'pharmacy', label: "Dorixona", icon: Pill, desc: "Partiya & muddat" },
  { id: 'barbershop', label: "Salon & Sartarosh", icon: Scissors, desc: "Usta & xizmatlar" },
  { id: 'service', label: "Servis & Ustaxona", icon: Wrench, desc: "Buyurtma & xizmat" },
];

const form = ref({
  companyName: '',
  phone: '',
  businessType: 'shop',
});

const goToStep2 = () => {
  if (!form.value.companyName.trim()) {
    form.value.companyName = 'Baraka Market';
  }
  currentStep.value = 2;
};

const handleClose = () => {
  currentStep.value = 1;
  emit('close');
};

const handleSubmit = () => {
  if (!form.value.companyName.trim()) {
    form.value.companyName = 'Demo Korxona';
  }
  emit('submit', { ...form.value });
};

watch(() => props.isOpen, async (open) => {
  if (open) {
    currentStep.value = 1;
    await nextTick();
    companyInput.value?.focus();
  }
});
</script>
