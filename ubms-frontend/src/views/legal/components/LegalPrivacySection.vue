<template>
  <section class="space-y-6 animate-in fade-in duration-200">
    <div class="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
      <div class="p-3 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
        <FileText class="w-6 h-6" />
      </div>
      <div>
        <h2 class="text-xl font-bold text-slate-900 dark:text-white">Maxfiylik Siyosati (Privacy Policy)</h2>
        <p class="text-xs text-slate-500">Shaxsiy va tijoriy ma'lumotlarning sir saqlanishi kafolati</p>
      </div>
    </div>

    <div class="space-y-4 text-xs sm:text-sm">
      <div>
        <h3 class="font-bold text-slate-900 dark:text-white mb-1.5">1. Yig'iladigan Ma'lumotlar</h3>
        <p class="text-slate-600 dark:text-slate-400">
          Tizimdan ro'yxatdan o'tishda foydalanuvchi quyidagi ma'lumotlarni taqdim etadi: Ism-sharif, telefon raqami, korxona nomi, faoliyat turi va filiallar soni.
        </p>
      </div>

      <div>
        <h3 class="font-bold text-slate-900 dark:text-white mb-1.5">2. Ma'lumotlardan Foydalanish Maqsadlari</h3>
        <ul class="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
          <li>Sizga POS, ombor, moliya va Telegram bot xizmatlarini uzluksiz taqdim etish;</li>
          <li>Tizimga xavfsiz kirish (SMS kod va parollar orqali) va akkauntni himoyalash;</li>
          <li>Texnik yordam ko'rsatish va yangilanishlar haqida xabardor qilish.</li>
        </ul>
      </div>

      <div>
        <h3 class="font-bold text-slate-900 dark:text-white mb-1.5">3. Ma'lumotlarning Uchinchi Shaxslarga Berilmasligi</h3>
        <p class="text-slate-600 dark:text-slate-400">
          Boshqar.uz sizning biznes ma'lumotlaringiz (tovarlar ro'yxati, mijozlar bazasi, savdo tushumlari va daromadlar)ni hech qanday holatda uchinchi shaxslarga, reklama kompaniyalariga yoki raqobatchilarga sotmaydi va oshkor qilmaydi.
        </p>
      </div>

      <div>
        <h3 class="font-bold text-slate-900 dark:text-white mb-1.5">4. Ma'lumotlarni O'chirish Huquqi</h3>
        <p class="text-slate-600 dark:text-slate-400">
          Foydalanuvchi istalgan vaqtda o'z akkauntini va unga tegishli barcha ma'lumotlarni tizimdan butunlay o'chirib yuborish huquqiga ega.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { FileText } from 'lucide-vue-next';
</script>
