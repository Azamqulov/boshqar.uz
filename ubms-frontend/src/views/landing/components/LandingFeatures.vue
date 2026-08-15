<template>
  <section id="features" class="py-24 relative overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div data-aos="fade-up" class="text-center max-w-3xl mx-auto space-y-4 mb-16">
        <span class="text-emerald-600 dark:text-emerald-400 text-xs font-extrabold uppercase tracking-widest">Barcha Modullar</span>
        <h2 class="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Biznesingiz Uchun Barcha Kerakli Vositalar
        </h2>
        <p class="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
          Boshqar.uz tizimi barcha sohalarni (Do'kon, Restoran, Sartaroshxona, Ombor) to'liq qamrab oladi.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Modul 1: Kassa POS -->
        <div
          data-aos="fade-up"
          data-aos-delay="100"
          class="p-8 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 hover:-translate-y-2 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 group space-y-4 shadow-xs"
        >
          <div class="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
            <ShoppingCart class="w-6 h-6" />
          </div>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Kassa va Tezkor Savdo (POS)</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Shtrix-kod skanerlash, savat yig'ish, foizli chegirmalar, naqd/karta to'lovlari va termoprinterda chek chiqarish.
          </p>
        </div>

        <!-- Modul 2: Nasiya CRM -->
        <div
          data-aos="fade-up"
          data-aos-delay="200"
          class="p-8 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-amber-500/60 hover:-translate-y-2 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 group space-y-4 shadow-xs"
        >
          <div class="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
            <Users class="w-6 h-6" />
          </div>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Nasiya Daftari (CRM)</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Qarzga tovar sotish, mijozlar balansi, qarz to'lovlarini qabul qilish va qarzdorlik limitlarini o'rnatish.
          </p>
        </div>

        <!-- Modul 3: Omborxona -->
        <div
          data-aos="fade-up"
          data-aos-delay="300"
          class="p-8 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-teal-500/60 hover:-translate-y-2 hover:shadow-xl hover:shadow-teal-500/10 transition-all duration-300 group space-y-4 shadow-xs"
        >
          <div class="w-12 h-12 rounded-2xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300">
            <Package class="w-6 h-6" />
          </div>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">Ombor va Qoldiqlar Nazorati</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Kirim-chiqim, tovar qoldig'i, tannarx va sotish narxi, kam qolgan tovarlar bo'yicha avtomatik ogohlantirishlar.
          </p>
        </div>

        <!-- Modul 4: Restoran & Kafe -->
        <div
          data-aos="fade-up"
          data-aos-delay="100"
          class="p-8 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-rose-500/60 hover:-translate-y-2 hover:shadow-xl hover:shadow-rose-500/10 transition-all duration-300 group space-y-4 shadow-xs"
        >
          <div class="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white transition-all duration-300">
            <UtensilsCrossed class="w-6 h-6" />
          </div>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">Restoran, Kafe & Fast-food</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Interaktiv stollar xaritasi, ofitsiant ekrani, taomlarni oshxonaga (KDS) yuborish va pre-chek chiqarish.
          </p>
        </div>

        <!-- Modul 5: Moliya & Foyda -->
        <div
          data-aos="fade-up"
          data-aos-delay="200"
          class="p-8 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-blue-500/60 hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 group space-y-4 shadow-xs"
        >
          <div class="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
            <DollarSign class="w-6 h-6" />
          </div>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Moliya va Sof Foyda Hisobi</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Jami savdo tushumi, tovar tannarxi, ijara va maosh xarajatlari hamda aniq sof foyda (marja) hisoboti.
          </p>
        </div>

        <!-- Modul 6: Boshqar AI Yordamchisi -->
        <div
          data-aos="fade-up"
          data-aos-delay="300"
          class="p-8 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/60 hover:-translate-y-2 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 group space-y-4 shadow-xs"
        >
          <div class="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
            <Sparkles class="w-6 h-6" />
          </div>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Boshqar AI Aqlli Maslahatchi</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Dastur bo'yicha har qanday savolga o'zbek tilida darhol bosqichma-bosqich javob va ovozli o'qish imkoniyati.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ShoppingCart, Users, Package, UtensilsCrossed, DollarSign, Sparkles } from 'lucide-vue-next';
</script>
