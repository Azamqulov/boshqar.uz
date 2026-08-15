<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      @click.self="$emit('close')"
      class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div class="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-left animate-in zoom-in-95 duration-200">
        <div class="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Play class="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 class="font-extrabold text-base text-slate-900 dark:text-white">Jonli Demo Hisob Ochish</h3>
              <p class="text-xs text-slate-500">15 ta mahsulot bilan to'liq dastur tayyor bo'ladi</p>
            </div>
          </div>
          <button
            type="button"
            @click="$emit('close')"
            class="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
          <!-- Company / Store Name -->
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Kompaniya / Do'koningiz Nomi *
            </label>
            <input
              v-model="form.companyName"
              required
              placeholder="Masalan: Baraka Supermarket, Oqtepa Fast Food, Shifo Apteka..."
              class="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          <!-- Phone Number -->
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Telefon Raqamingiz *
            </label>
            <PhoneInput
              v-model="form.phone"
              required
              placeholder="90 123 45 67"
            />
          </div>

          <!-- Business Type / Sector Selector -->
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Biznes Yo'nalishingizni Tanlang *
            </label>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                v-for="cat in sectorOptions"
                :key="cat.id"
                @click="form.businessType = cat.id"
                :class="[
                  'p-3 rounded-2xl border text-left transition flex flex-col justify-between gap-1.5 cursor-pointer relative group',
                  form.businessType === cat.id
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                ]"
              >
                <div class="flex items-center gap-2">
                  <div
                    class="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                    :class="form.businessType === cat.id ? 'bg-emerald-500 text-white' : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'"
                  >
                    <component :is="cat.icon" class="w-3.5 h-3.5" />
                  </div>
                  <span class="text-xs font-bold truncate leading-tight">{{ cat.label }}</span>
                </div>
                <p class="text-[10px] opacity-70 line-clamp-1 font-normal">{{ cat.desc }}</p>
              </button>
            </div>
          </div>

          <!-- Submit Demo Launcher Button -->
          <div class="pt-3">
            <button
              type="submit"
              :disabled="loading"
              class="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles v-if="!loading" class="w-4 h-4" />
              <span v-if="loading">Demo Tayyorlanmoqda...</span>
              <span v-else>Demoni Boshlash (15 ta mahsulot bilan)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Play, X, Sparkles } from 'lucide-vue-next';
import PhoneInput from '../../../components/PhoneInput.vue';

const props = defineProps<{
  isOpen: boolean;
  loading: boolean;
  sectorOptions: Array<{ id: string; label: string; desc: string; icon: any }>;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', form: { companyName: string; phone: string; businessType: string }): void;
}>();

const form = ref({
  companyName: '',
  phone: '',
  businessType: props.sectorOptions[0]?.id || 'shop',
});

const handleSubmit = () => {
  emit('submit', { ...form.value });
};
</script>
