<template>
  <section id="about" class="py-20 bg-slate-100/70 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800/80 relative overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <!-- Left: Mission & Story -->
        <div data-aos="fade-right" class="lg:col-span-6 space-y-6">
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
            <Building2 class="w-4 h-4" />
            <span>Bizning Missiyamiz</span>
          </div>

          <h2 class="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            O'zbekiston Tadbirkorlarining Qadrli Vaqtini va Pulini Asraymiz
          </h2>

          <p class="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            <strong>Boshqar.uz</strong> — bu O'zbekiston bozorining haqiqiy talablariga moslab yaratilgan bulutli biznes boshqaruv platformasi. Bizning asosiy maqsadimiz qishloq va tumanlardagi kichik do'konlardan tortib, shahardagi yirik biznes egalariga qimmat va murakkab dasturlarsiz, o'zbek tilida oson va tezkor hisob-kitob imkonini berishdir.
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div class="p-4 rounded-2xl bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-300">
              <div class="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">1</div>
              <h4 class="font-bold text-slate-900 dark:text-white text-sm">Oddiy va Tushunarli</h4>
              <p class="text-xs text-slate-500 dark:text-slate-400">Hech qanday o'qish yoki murakkabliksiz 5 daqiqada o'rganish mumkin.</p>
            </div>

            <div class="p-4 rounded-2xl bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-300">
              <div class="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xs">2</div>
              <h4 class="font-bold text-slate-900 dark:text-white text-sm">Hamyonbop Narx</h4>
              <p class="text-xs text-slate-500 dark:text-slate-400">Kuniga atigi bitta non puliga to'liq nazorat va tinch uyqu.</p>
            </div>
          </div>
        </div>

        <!-- Right: Highlights Matrix with AOS Stagger -->
        <div data-aos="fade-left" data-aos-delay="200" class="lg:col-span-6 grid grid-cols-2 gap-4">
          <div class="p-6 rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs hover:-translate-y-1.5 hover:shadow-lg hover:border-emerald-500/40 transition-all duration-300 group">
            <ShieldCheck class="w-8 h-8 text-emerald-500 group-hover:scale-110 transition-transform" />
            <h4 class="text-base font-bold text-slate-900 dark:text-white">100% Xavfsizlik</h4>
            <p class="text-xs text-slate-500 dark:text-slate-400">Har bir xodim harakati Audit jurnalida saqlanadi, o'g'rilik va chalkashlikka yo'l qo'yilmaydi.</p>
          </div>

          <div class="p-6 rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs hover:-translate-y-1.5 hover:shadow-lg hover:border-amber-500/40 transition-all duration-300 group">
            <Zap class="w-8 h-8 text-amber-500 group-hover:scale-110 transition-transform" />
            <h4 class="text-base font-bold text-slate-900 dark:text-white">0ms Tezlik</h4>
            <p class="text-xs text-slate-500 dark:text-slate-400">Kassada navbat kutib qolmaydi. Chek urish va saqlash bir zumda ishlaydi.</p>
          </div>

          <div class="p-6 rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs hover:-translate-y-1.5 hover:shadow-lg hover:border-teal-500/40 transition-all duration-300 group">
            <Smartphone class="w-8 h-8 text-teal-500 group-hover:scale-110 transition-transform" />
            <h4 class="text-base font-bold text-slate-900 dark:text-white">Har Qanday Qurilma</h4>
            <p class="text-xs text-slate-500 dark:text-slate-400">Telefon, planshet, noutbuk yoki monoblokda bir vaqtning o'zida ishlaydi.</p>
          </div>

          <div class="p-6 rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs hover:-translate-y-1.5 hover:shadow-lg hover:border-indigo-500/40 transition-all duration-300 group">
            <Bot class="w-8 h-8 text-indigo-500 group-hover:scale-110 transition-transform" />
            <h4 class="text-base font-bold text-slate-900 dark:text-white">Boshqar AI</h4>
            <p class="text-xs text-slate-500 dark:text-slate-400">Sun'iy intellekt xodimlaringizga savollarga javob beradi va maslahat ko'rsatadi.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Building2, ShieldCheck, Zap, Smartphone, Bot } from 'lucide-vue-next';
</script>
