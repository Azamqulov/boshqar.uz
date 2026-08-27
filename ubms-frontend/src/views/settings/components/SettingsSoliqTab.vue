<template>
  <div class="space-y-6">
    <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div class="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
          S
        </div>
        <div>
          <h2 class="text-lg font-bold text-slate-900 dark:text-white">Soliq.uz Virtual Kassa Integratsiyasi</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">O'zbekiston Davlat Soliq Qo'mitasi fiskal kassa va QR-kodli chek urish sozlamalari</p>
        </div>
      </div>

      <form @submit.prevent="saveSettings" class="mt-6 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Virtual Kassa Terminal ID
            </label>
            <AppInput
              v-model="form.terminalId"
              placeholder="VK-UZ-889012"
              required
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Soliq API Secret Token
            </label>
            <AppInput
              v-model="form.apiToken"
              type="password"
              placeholder="••••••••••••••••••••"
              required
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Asosiy MXIK (Tasnif) Kodu
            </label>
            <AppInput
              v-model="form.defaultMxikCode"
              placeholder="04101001001000000"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              QQS (NDS) Stavkasi (%)
            </label>
            <AppSelect
              v-model="form.vatPercent"
              :options="[
                { label: '0% (QQSsiz)', value: '0' },
                { label: '12% (Standart QQS)', value: '12' }
              ]"
            />
          </div>
        </div>

        <div class="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <div>
            <span class="text-xs font-bold text-slate-900 dark:text-white">Avtomatik Fiskal Chek Chop Etish</span>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">Har bir kassa sotuvida Soliq.uz fiskal QR kodini avto-yaratish</p>
          </div>
          <input
            type="checkbox"
            v-model="form.autoFiscalize"
            class="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
          />
        </div>

        <div class="pt-4 flex justify-end">
          <AppButton type="submit" variant="primary" :loading="isSaving">
            Saqlash
          </AppButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AppInput from '@/components/AppInput.vue';
import AppSelect from '@/components/AppSelect.vue';
import AppButton from '@/components/AppButton.vue';
import { useToast } from '@/composables/useToast';

const toast = useToast();
const isSaving = ref(false);

const form = ref({
  terminalId: 'VK-UZ-889012',
  apiToken: 'soliq_sec_token_9918231',
  defaultMxikCode: '04101001001000000',
  vatPercent: '12',
  autoFiscalize: true,
});

function saveSettings() {
  isSaving.value = true;
  setTimeout(() => {
    isSaving.value = false;
    toast.success('Soliq.uz Virtual Kassa sozlamalari muvaffaqiyatli saqlandi!', 'Soliq Integratsiyasi');
  }, 600);
}
</script>
