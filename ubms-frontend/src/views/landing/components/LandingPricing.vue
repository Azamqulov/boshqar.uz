<template>
  <section id="pricing" class="py-24 bg-slate-100/70 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800/80 relative overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div data-aos="fade-up" class="text-center max-w-3xl mx-auto space-y-4 mb-16">
        <span class="text-emerald-600 dark:text-emerald-400 text-xs font-extrabold uppercase tracking-widest">Ochiq va Halol Narxlar</span>
        <h2 class="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Har Qanday Byudjet Uchun Mos Tariflar
        </h2>
        <p class="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
          Hech qanday yashirin to'lovlarsiz. 14 kun bepul sinab ko'ring va o'zingizga ma'qul tarifni tanlang.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        <!-- Plan 1: Start -->
        <div
          data-aos="fade-up"
          data-aos-delay="100"
          class="p-8 rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-6 shadow-xs hover:-translate-y-2 hover:shadow-xl transition-all duration-300"
        >
          <div class="space-y-4">
            <div class="inline-block px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
              Kichik Savdo Nuqtasi
            </div>
            <h3 class="text-2xl font-black text-slate-900 dark:text-white">START</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Qishloq oziq-ovqat do'koni, kiyim do'koni va sartaroshxonalar uchun.</p>
            
            <div class="pt-4 border-t border-slate-200 dark:border-slate-800">
              <span class="text-4xl font-black text-slate-900 dark:text-white font-mono">79 000</span>
              <span class="text-xs text-slate-500 font-bold"> so'm / oyiga</span>
              <p class="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">Kuniga atigi ~2 600 so'm</p>
            </div>

            <ul class="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <li class="flex items-center gap-2"><Check class="w-4 h-4 text-emerald-500" /> 1 ta Kassa va 1 ta Xodim</li>
              <li class="flex items-center gap-2"><Check class="w-4 h-4 text-emerald-500" /> Tovarlar katalogi va shtrix-kod</li>
              <li class="flex items-center gap-2"><Check class="w-4 h-4 text-emerald-500" /> Chek chiqarish (58mm / 80mm)</li>
              <li class="flex items-center gap-2"><Check class="w-4 h-4 text-emerald-500" /> Boshqar AI qo'llanmasi</li>
            </ul>
          </div>

          <button
            type="button"
            @click="$emit('openDemo')"
            class="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-bold text-center text-xs border border-slate-300 dark:border-slate-700 transition cursor-pointer hover:scale-102 active:scale-98"
          >
            Start Bilan Sinash
          </button>
        </div>

        <!-- Plan 2: Standart (Most Popular) -->
        <div
          data-aos="fade-up"
          data-aos-delay="200"
          class="p-8 rounded-3xl bg-gradient-to-b from-emerald-50 via-white to-white dark:from-emerald-950/40 dark:via-slate-950 dark:to-slate-950 border-2 border-emerald-500 shadow-2xl shadow-emerald-500/20 flex flex-col justify-between space-y-6 relative hover:-translate-y-2.5 hover:shadow-emerald-500/30 transition-all duration-300"
        >
          <div class="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5">
            <Star class="w-3.5 h-3.5 fill-current" />
            <span>Eng Ommabop</span>
          </div>

          <div class="space-y-4">
            <div class="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              Supermarket & Do'konlar
            </div>
            <h3 class="text-2xl font-black text-slate-900 dark:text-white">STANDART</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">O'rtacha magazinlar, aptekalar, kiyim va qurilish mollari savdosi.</p>
            
            <div class="pt-4 border-t border-slate-200 dark:border-slate-800">
              <span class="text-4xl font-black text-emerald-600 dark:text-emerald-400 font-mono">149 000</span>
              <span class="text-xs text-slate-500 font-bold"> so'm / oyiga</span>
              <p class="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">Kuniga atigi ~5 000 so'm (1 yillik: 2 oy tekin)</p>
            </div>

            <ul class="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 font-medium">
              <li class="flex items-center gap-2"><Check class="w-4 h-4 text-emerald-500 font-bold" /> <strong>Cheksiz tovarlar va cheklar</strong></li>
              <li class="flex items-center gap-2"><Check class="w-4 h-4 text-emerald-500 font-bold" /> <strong>To'liq Nasiya Daftari (CRM)</strong></li>
              <li class="flex items-center gap-2"><Check class="w-4 h-4 text-emerald-500" /> 3 tagacha xodim va alohida rollar</li>
              <li class="flex items-center gap-2"><Check class="w-4 h-4 text-emerald-500" /> Telegram Bot bildirishnomalari</li>
              <li class="flex items-center gap-2"><Check class="w-4 h-4 text-emerald-500" /> Moliya va Sof Foyda hisoboti</li>
            </ul>
          </div>

          <button
            type="button"
            @click="$emit('openDemo')"
            class="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-center text-sm shadow-md hover:scale-[1.02] active:scale-98 transition cursor-pointer"
          >
            14 Kun Bepul Sinash
          </button>
        </div>

        <!-- Plan 3: Pro / Restoran -->
        <div
          data-aos="fade-up"
          data-aos-delay="300"
          class="p-8 rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-6 shadow-xs hover:-translate-y-2 hover:shadow-xl transition-all duration-300"
        >
          <div class="space-y-4">
            <div class="inline-block px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
              Restoran & Katta Tarmoq
            </div>
            <h3 class="text-2xl font-black text-slate-900 dark:text-white">PRO / BIZNES</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Restoran, choyxona, kafe, salon va bir nechta filialli savdo tarmoqlari.</p>
            
            <div class="pt-4 border-t border-slate-200 dark:border-slate-800">
              <span class="text-4xl font-black text-slate-900 dark:text-white font-mono">249 000</span>
              <span class="text-xs text-slate-500 font-bold"> so'm / oyiga</span>
              <p class="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">Kuniga ~8 000 so'm</p>
            </div>

            <ul class="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <li class="flex items-center gap-2"><Check class="w-4 h-4 text-emerald-500" /> <strong>Stollar xaritasi & Ofitsiant ekrani</strong></li>
              <li class="flex items-center gap-2"><Check class="w-4 h-4 text-emerald-500" /> <strong>Oshxona (KDS) ekrani</strong></li>
              <li class="flex items-center gap-2"><Check class="w-4 h-4 text-emerald-500" /> Ustalar bandlovi & Jadval</li>
              <li class="flex items-center gap-2"><Check class="w-4 h-4 text-emerald-500" /> Cheksiz xodimlar va filiallar</li>
              <li class="flex items-center gap-2"><Check class="w-4 h-4 text-emerald-500" /> To'liq Audit va Xavfsizlik jurnali</li>
            </ul>
          </div>

          <button
            type="button"
            @click="$emit('openDemo')"
            class="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-bold text-center text-xs border border-slate-300 dark:border-slate-700 transition cursor-pointer hover:scale-102 active:scale-98"
          >
            Pro Bilan Sinash
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Check, Star } from 'lucide-vue-next';

defineEmits<{
  (e: 'openDemo'): void;
}>();
</script>
