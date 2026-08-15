<template>
  <section id="faq" class="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    <div data-aos="fade-up" class="text-center space-y-3 mb-12">
      <h2 class="text-3xl font-black text-slate-900 dark:text-white">Ko'p Beriladigan Savollar</h2>
      <p class="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">Barcha savollarga aniq va ochiq javoblar</p>
    </div>

    <div class="space-y-4">
      <div
        v-for="(item, idx) in faqList"
        :key="idx"
        data-aos="fade-up"
        :data-aos-delay="idx * 80"
        class="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-2 cursor-pointer select-none shadow-xs hover:border-emerald-500/40 hover:shadow-md transition-all duration-200"
        @click="toggleFaq(idx)"
      >
        <div class="flex items-center justify-between font-bold text-sm sm:text-base text-slate-900 dark:text-white">
          <span>{{ item.q }}</span>
          <ChevronDown class="w-5 h-5 text-emerald-500 transition-transform duration-200" :class="{ 'rotate-180': openFaqIdx === idx }" />
        </div>
        <p v-show="openFaqIdx === idx" class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed pt-2 border-t border-slate-200 dark:border-slate-800/60">
          {{ item.a }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import AOS from 'aos';
import { ChevronDown } from 'lucide-vue-next';

const openFaqIdx = ref<number | null>(0);

const toggleFaq = async (idx: number) => {
  openFaqIdx.value = openFaqIdx.value === idx ? null : idx;
  await nextTick();
  AOS.refresh();
};

const faqList = [
  {
    q: "Dasturni o'rnatish uchun alohida kompyuter yoki usta kerakmi?",
    a: "Yo'q, hech qanday usta yoki maxsus server shart emas. Boshqar.uz to'liq bulutda ishlaydi — telefon, noutbuk yoki planshetingiz brauzerida saytga kirib ishlashni boshlaysiz.",
  },
  {
    q: "Internet o'chib qolsa nima bo'ladi?",
    a: "Tizim ma'lumotlari xavfsiz bulutda saqlanadi. Hatto oddiy telefon interneti (3G/4G) orqali ham juda kam trafik sarflagan holda tezkor ishlayveradi.",
  },
  {
    q: "Qarzdorlar (Nasiya daftari) qanday yuritiladi?",
    a: "Har bir xaridorga alohida hisob ochiladi. Kassa orqali qarzga sotilgan tovarlar avtomatik mijoz balansiga yoziladi va qarzi to'langanda bitta bosishda yechiladi.",
  },
  {
    q: "14 kunlik bepul sinov davridan keyin ma'lumotlarim o'chib ketadimi?",
    a: "Yo'q, kiritgan tovarlaringiz, narxlar va savdo tarixingiz to'liq saqlanib qoladi. Sinov davri tugagach o'zingizga qulay tarifni tanlab davom ettirishingiz mumkin.",
  },
];
</script>
