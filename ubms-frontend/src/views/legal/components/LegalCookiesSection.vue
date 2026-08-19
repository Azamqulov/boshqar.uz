<template>
  <section class="space-y-6 animate-in fade-in duration-200">
    <div class="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
      <div class="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
        <Cookie class="w-6 h-6" />
      </div>
      <div>
        <h2 class="text-xl font-bold text-slate-900 dark:text-white">Cookie Fayllar Siyosati</h2>
        <p class="text-xs text-slate-500">Cookie-fayllar nima va ular sizga qanday qulaylik yaratadi?</p>
      </div>
    </div>

    <div class="space-y-4 text-xs sm:text-sm">
      <div>
        <h3 class="font-bold text-slate-900 dark:text-white mb-1.5">1. Cookie Fayllar Nima?</h3>
        <p class="text-slate-600 dark:text-slate-400">
          Cookie — bu siz Boshqar.uz veb-saytiga tashrif buyurganingizda brauzeringizda saqlanadigan kichik hajmdagi matnli fayllardir. Ular saytdan foydalanishni qulay, tezkor va xavfsiz qilishga yordam beradi.
        </p>
      </div>

      <div>
        <h3 class="font-bold text-slate-900 dark:text-white mb-2">2. Biz Qanday Cookie-Fayllardan Foydalanamiz?</h3>
        <div class="space-y-2.5">
          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <div class="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-xs mb-1">
              <LockKeyhole class="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Majburiy (Texnik) Cookie'lar:</span>
            </div>
            <p class="text-xs text-slate-600 dark:text-slate-400">
              Tizimga kirish sessiyangizni eslab qolish, sahifani yangilaganda (F5) avtorizatsiyadan chiqib ketmaslik va xavfsizlikni ta'minlash uchun zarur.
            </p>
          </div>

          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <div class="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-xs mb-1">
              <Palette class="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Funksional (Shaxsiy Sozlamalar) Cookie'lar:</span>
            </div>
            <p class="text-xs text-slate-600 dark:text-slate-400">
              Siz tanlagan dizayn mavzusi (Tungi / Kunduzgi rejim), kassa printeri o'lchami va valyuta sozlamalarini saqlab turadi.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 class="font-bold text-slate-900 dark:text-white mb-1.5">3. Cookie-fayllarni Boshqarish</h3>
        <p class="text-slate-600 dark:text-slate-400">
          Siz o'z brauzeringiz sozlamalari orqali cookie-fayllarni istalgan vaqtda o'chirib tashlashingiz yoki ulardan foydalanishni cheklashingiz mumkin. Biroq, majburiy cookie'larni o'chirish tizimga kirishda cheklovlar keltirib chiqarishi mumkin.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  Cookie,
  LockKeyhole,
  Palette,
} from 'lucide-vue-next';
</script>
