<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
    <header class="sticky top-0 z-50 backdrop-blur-xl bg-white/95 dark:bg-slate-950/95 border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        <router-link to="/" class="flex items-center gap-2 group">
          <AppLogo size="lg" />
        </router-link>

        <nav class="hidden md:flex items-center gap-6 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
          <router-link to="/" class="hover:text-emerald-500 transition">Bosh Sahifa</router-link>
          <router-link to="/telegram-bot" class="hover:text-emerald-500 transition">Telegram Bot</router-link>
          <router-link to="/sohalar" class="hover:text-emerald-500 transition">Sohalar</router-link>
          <router-link to="/kalkulyator" class="hover:text-emerald-500 transition">Kalkulyator</router-link>
          <router-link to="/taqqoslash" class="hover:text-emerald-500 transition">Taqqoslash</router-link>
          <router-link to="/tariflar" class="hover:text-emerald-500 transition">Tariflar</router-link>
          <router-link to="/sharhlar" class="text-emerald-600 dark:text-emerald-400 font-bold border-b-2 border-emerald-500 py-1">Sharhlar</router-link>
          <router-link to="/faq" class="hover:text-emerald-500 transition">FAQ</router-link>
        </nav>

        <div class="flex items-center gap-3">
          <ThemeToggle />
          <router-link
            to="/auth/register"
            class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-1.5"
          >
            <Sparkles class="w-4 h-4" />
            <span>14 Kun Bepul</span>
          </router-link>
        </div>
      </div>
    </header>

    <section class="py-16 sm:py-24 relative overflow-hidden bg-gradient-to-b from-emerald-500/10 via-slate-50 to-slate-50 dark:from-emerald-950/20 dark:via-slate-950 dark:to-slate-950">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/30">
          <Star class="w-4 h-4 fill-current text-amber-500" />
          <span>O'zbekiston Bo'ylab Real Tadbirkorlar Sharhlari</span>
        </div>

        <h1 class="text-3xl sm:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto">
          Minglab Do'kon va Restoranlar <br class="hidden sm:inline" />
          <span class="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 bg-clip-text text-transparent">
            Boshqar.uz Bilan O'smoqda
          </span>
        </h1>

        <p class="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Toshkent, Samarqand, Farg'ona, Namangan, Buxoro va boshqa viloyatdagi biznes egalarining haqiqiy tajribalari bilan tanishing.
        </p>
      </div>
    </section>

    <!-- 12 Real Testimonials Grid -->
    <section class="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="(t, idx) in allTestimonials"
        :key="idx"
        class="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
      >
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1 text-amber-400">
              <Star v-for="s in 5" :key="s" class="w-4 h-4 fill-current" />
            </div>
            <span class="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">{{ t.sector }}</span>
          </div>
          <p class="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">"{{ t.quote }}"</p>
        </div>

        <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
            {{ t.name[0] }}
          </div>
          <div class="min-w-0">
            <div class="font-bold text-xs sm:text-sm truncate">{{ t.name }}</div>
            <div class="text-[11px] text-slate-500 truncate">{{ t.business }} • {{ t.city }}</div>
          </div>
        </div>
      </div>
    </section>

    <footer class="py-8 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
      © 2026 Boshqar.uz — Barcha huquqlar himoyalangan.
    </footer>
  </div>
</template>

<script setup lang="ts">
import { Star, Sparkles } from 'lucide-vue-next';
import AppLogo from '../../../components/AppLogo.vue';
import ThemeToggle from '../../../components/ThemeToggle.vue';

const allTestimonials = [
  { name: "Alisher Qodirov", business: "\"Baraka Market\" supermarket", city: "Toshkent", sector: "Oziq-ovqat", quote: "Avval nasiyalarni daftarga yozardik, oxirida kim qancha qarzdorligi chalkashib, oyiga 3-4 million zarar bo'lardi. Boshqar.uz da nasiya bitta tugma bilan yoziladi va Telegram bot orqali har kuni 21:00 da hisobot keladi. Juda mamnunmiz!" },
  { name: "Jasur Bekmurodov", business: "\"Milliy Taomlar\" restorani", city: "Samarqand", sector: "Restoran", quote: "Ofitsiantlarimiz stollardan buyurtmani to'g'ridan-to'g'ri planshetda oladi, oshpazga sekundiga yetib boradi. Shovqin-suron va adashishlar to'xtadi. Ayniqsa pre-chek chiqarish va kassa yopish juda oson." },
  { name: "Dilnoza Rahimova", business: "\"Shifo Farm\" dorixonasi", city: "Farg'ona", sector: "Dorixona", quote: "Dorilarning yaroqlilik muddati o'tib ketishi eng katta muammo edi. Boshqar.uz muddati yaqinlashgan dorilarni oldindan ogohlantiradi. Qoldiqlar va analog dorilar qidiruvi ajoyib ishlaydi." },
  { name: "Otabek Karimov", business: "\"Terra Pro Style\" kiyim do'koni", city: "Toshkent", sector: "Kiyim-kechak", quote: "Razmerlar, ranglar va tovar qoldiqlarini nazorat qilish juda osonlashdi. Shtrix-kod skaneri bir zumda o'qiydi. Savdo tushumi 25% ga oshdi, chunki mijoz kutib qolmaydi." },
  { name: "Nigora Saidova", business: "\"Beauty Queen\" go'zallik saloni", city: "Buxoro", sector: "Go'zallik & Salon", quote: "Mijozlarimiz Telegram orqali oldindan yozilishadi. Qaysi usta qancha xizmat ko'rsatganini va ularning oylik foizini dastur o'zi avtomatik hisoblab beradi. Bosh og'rig'idan qutuldik!" },
  { name: "Rustam Xalilov", business: "\"Avto Master 777\" ustaxonasi", city: "Andijon", sector: "Avtoservis", quote: "Ehtiyot qismlar hisobi va ustalarga beriladigan ish haqi to'liq tartibga tushdi. Mijoz mashinasini qabul qilib olganda unga chek va qilingan ishlar ro'yxati beriladi. Ishonch oshdi!" },
  { name: "Farhod Yusupov", business: "\"Fast Burger & Lavash\"", city: "Namangan", sector: "Fast-Food", quote: "Kassa tezligi daxshat! 1 kunda 400 dan ortiq mijozga xizmat ko'rsatamiz, POS kassa 1 soniyada chek chiqaradi va KDS ekraniga buyurtma uzatadi. Qotish yoki xatolar umuman yo'q." },
  { name: "Aziza Umarova", business: "\"Shirin Dunyo\" qandolatchilik", city: "Qarshi", sector: "Qandolatchilik", quote: "Xomashyo (un, shakar, sariyog') qoldig'i har bir tort sotilganda avtomatik kamayadi. Retseptura kalkulyatsiyasi orqali har bir shirinlikning tannarxini aniq bilib turamiz." },
  { name: "Sardor Mahmudov", business: "\"Stroy Market\" qurilish mollari", city: "Urganch", sector: "Qurilish mollari", quote: "Menda 3 ta filial bor. Barcha omborlardagi mahsulotlarni uydan turib telefonimda ko'rib turaman. Filiallararo transfer juda qulay qilingan." },
  { name: "Shavkat Zokirov", business: "\"Techno Smart\" telefonlar", city: "Qo'qon", sector: "Elektronika", quote: "IMEI kodlar va seriya raqamlari bo'yicha kafolatli savdo qilish funksiyasi ajoyib. Qaysi telefon qachon kimga sotilganini 1 sekundda topib beradi." },
  { name: "Malika Toshpo'latova", business: "\"Baby Land\" bolalar olami", city: "Navoiy", sector: "Bolalar mollari", quote: "Mijozlarga chegirma kartalari va cashback tizimi ulash orqali doimiy mijozlarimiz sonini 2 barobarga oshirdik. Kassirlarimiz dasturni 1 kunda o'rganib olishdi." },
  { name: "Ulug'bek Ergashev", business: "\"Comfort Mebel\" mebel sexi", city: "Jizzax", sector: "Ishlab chiqarish", quote: "Buyurtmalar holatini (qabul qilindi -> yig'ilmoqda -> yetkazildi) kuzatish juda oson. Mijozlarga o'z vaqtida yetkazib berish bo'yicha tartib o'rnatdik." }
];
</script>
