<template>
  <Teleport to="body">
    <div v-if="isOpen" @click.self="$emit('close')" class="modal-overlay">
      <div class="modal-container max-w-2xl" @click.stop>
        <div class="modal-header">
          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <History class="w-4 h-4 text-emerald-500" />
              <span>Mijoz Tarixi: {{ activeCustomer?.fullName }}</span>
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Xaridlar va Nasiya daftari yozuvlari</p>
          </div>
          <button @click="$emit('close')" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"><X class="w-5 h-5" /></button>
        </div>

        <div class="modal-body space-y-4">
          <!-- Summary card -->
          <div class="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs">
            <div>
              <span class="text-slate-400 block">Joriy Qarz:</span>
              <span class="font-black text-rose-600 dark:text-rose-400 font-mono text-sm">
                {{ formatCurrency(activeCustomer?.debt || 0) }}
              </span>
            </div>
            <div>
              <span class="text-slate-400 block">Jami Xarid:</span>
              <span class="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                {{ formatCurrency(activeCustomer?.totalSpent || 0) }}
              </span>
            </div>
            <div>
              <span class="text-slate-400 block">Xaridlar Soni:</span>
              <span class="font-bold text-slate-900 dark:text-white font-mono text-sm">
                {{ activeCustomer?.totalPurchases || 0 }} ta
              </span>
            </div>
          </div>

          <!-- Telegram Debt Reminder Button if has debt -->
          <div v-if="(activeCustomer?.debt || 0) > 0" class="flex items-center justify-between p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
            <div class="text-xs text-blue-800 dark:text-blue-200">
              <span class="font-bold block">Nasiya eslatmasi</span>
              <span class="text-[11px] text-blue-600 dark:text-blue-400">Telegram orqali to'lov tafsilotlarini yuboring</span>
            </div>
            <button
              type="button"
              class="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm active:scale-95"
              @click="sendTelegramReminder"
            >
              <Send class="w-3.5 h-3.5" />
              Telegramga Yuborish
            </button>
          </div>

          <!-- Notes / Debt Journal Log -->
          <div v-if="activeCustomer?.notes" class="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1.5">
            <span class="font-bold text-amber-700 dark:text-amber-400 block uppercase text-[10px] tracking-wider">
              Nasiya Daftari / Izohlar Tarixi:
            </span>
            <pre class="font-mono text-[11px] text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{{ activeCustomer.notes }}</pre>
          </div>

          <!-- Orders History -->
          <div class="space-y-2">
            <div v-if="loading" class="py-6 text-center space-y-2">
              <div class="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-sm">
                <RefreshCw class="w-4 h-4 animate-spin stroke-[2.2]" />
              </div>
              <span class="text-xs text-slate-500 font-medium block">Xaridlar yuklanmoqda...</span>
            </div>
            <div v-else-if="orders.length === 0" class="py-6 text-center text-xs text-slate-400">
              Ushbu mijoz bo'yicha xaridlar topilmadi
            </div>
            <div v-else class="space-y-2 max-h-60 overflow-y-auto pr-1 text-xs font-mono">
              <div
                v-for="ord in orders"
                :key="ord.id"
                class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
              >
                <div>
                  <div class="font-bold text-slate-900 dark:text-white font-sans flex items-center gap-2">
                    <span>Chek {{ ord.orderNumber }}</span>
                    <span class="text-[10px] text-slate-400">{{ formatDate(ord.createdAt) }}</span>
                  </div>
                  <div class="text-[11px] text-slate-500 mt-0.5">
                    {{ ord.items?.map((i: any) => `${i.product?.name || i.service?.name} (${i.quantity}x)`).join(', ') }}
                  </div>
                </div>
                <div class="text-right">
                  <div class="font-black text-slate-900 dark:text-white font-mono">
                    {{ formatCurrency(ord.total) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <AppButton variant="secondary" size="md" @click="$emit('close')">
            Yopish
          </AppButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { History, X, RefreshCw, Send } from 'lucide-vue-next';
import AppButton from '../../../components/AppButton.vue';
import { useFormat } from '../../../composables/useFormat';

const props = defineProps<{
  isOpen: boolean;
  activeCustomer: any;
  orders: any[];
  loading: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
}>();

const { formatCurrency, formatDate } = useFormat();

const sendTelegramReminder = () => {
  if (!props.activeCustomer) return;
  const phone = props.activeCustomer.phone ? props.activeCustomer.phone.replace(/\D/g, '') : '';
  const text = encodeURIComponent(
    `Hurmatli ${props.activeCustomer.fullName || props.activeCustomer.name}! Boshqar.uz do'konimizdan joriy nasiya qoldig'ingiz: ${formatCurrency(props.activeCustomer.debt || 0)} tashkil etadi. Iltimos, hisob-kitobni amalga oshirishni unutmang!`
  );

  if (phone) {
    window.open(`https://t.me/+${phone}?text=${text}`, '_blank');
  } else {
    window.open(`https://t.me/share/url?url=${encodeURIComponent('https://boshqar.uz')}&text=${text}`, '_blank');
  }
};
</script>
