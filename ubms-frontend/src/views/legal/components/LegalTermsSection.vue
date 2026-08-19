<template>
  <section class="space-y-6 animate-in fade-in duration-200">
    <div class="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
      <div class="p-3 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
        <ScrollText class="w-6 h-6" />
      </div>
      <div>
        <h2 class="text-xl font-bold text-slate-900 dark:text-white">Foydalanish Shartlari (Ommaviy Oferta)</h2>
        <p class="text-xs text-slate-500">Platformadan foydalanish bo'yicha rasmiy shartlar va qoidalar</p>
      </div>
    </div>

    <div class="space-y-4 text-xs sm:text-sm">
      <div>
        <h3 class="font-bold text-slate-900 dark:text-white mb-1.5">1. 14 Kunlik Bepul Sinov Davri</h3>
        <p class="text-slate-600 dark:text-slate-400">
          Har bir yangi ro'yxatdan o'tgan korxonaga barcha PRO imkoniyatlarni o'z ichiga olgan 14 kunlik to'liq bepul sinov muddati taqdim etiladi. Sinov davrida bank kartasini ulash talab qilinmaydi.
        </p>
      </div>

      <div>
        <h3 class="font-bold text-slate-900 dark:text-white mb-1.5">2. To'lov va Obuna</h3>
        <p class="text-slate-600 dark:text-slate-400">
          14 kunlik sinov muddati tugagandan so'ng, foydalanuvchi o'ziga mos tarif (Start, Savdo PRO, Restoran & Kafe, Enterprise) ni tanlab, Payme, Click yoki Uzum orqali oylik/yillik to'lovni amalga oshiradi.
        </p>
      </div>

      <div>
        <h3 class="font-bold text-slate-900 dark:text-white mb-1.5">3. Texnik Qo'llab-Quvvatlash</h3>
        <p class="text-slate-600 dark:text-slate-400">
          Foydalanuvchilarga doimiy bepul texnik yordam, Telegram qo'llab-quvvatlash guruhi va video darsliklar taqdim etiladi.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ScrollText } from 'lucide-vue-next';
</script>
