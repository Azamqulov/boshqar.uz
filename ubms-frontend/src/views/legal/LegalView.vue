<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white notranslate" translate="no">
    <!-- Top Header (Full Premium Navbar) -->
    <header class="sticky top-0 z-50 backdrop-blur-xl bg-white/95 dark:bg-slate-950/95 border-b border-slate-200/80 dark:border-slate-800/80 transition-all duration-300 shadow-xs">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        <!-- Brand Logo -->
        <div class="shrink-0">
          <router-link to="/">
            <AppLogo size="lg" />
          </router-link>
        </div>

        <!-- Desktop Navigation Links -->
        <nav class="hidden lg:flex items-center gap-4 xl:gap-6 text-xs xl:text-sm font-semibold text-slate-600 dark:text-slate-300 shrink-0">
          <router-link to="/#telegram" class="hover:text-emerald-500 dark:hover:text-emerald-400 transition-all duration-200 hover:-translate-y-0.5 relative group py-1 whitespace-nowrap">
            <span>Telegram Bot</span>
            <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 rounded-full transition-all duration-300 group-hover:w-full"></span>
          </router-link>
          <router-link to="/#sectors" class="hover:text-emerald-500 dark:hover:text-emerald-400 transition-all duration-200 hover:-translate-y-0.5 relative group py-1 whitespace-nowrap">
            <span>Sohalar</span>
            <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 rounded-full transition-all duration-300 group-hover:w-full"></span>
          </router-link>
          <router-link to="/#calculator" class="hover:text-emerald-500 dark:hover:text-emerald-400 transition-all duration-200 hover:-translate-y-0.5 relative group py-1 whitespace-nowrap">
            <span>Kalkulyator</span>
            <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 rounded-full transition-all duration-300 group-hover:w-full"></span>
          </router-link>
          <router-link to="/#pricing" class="hover:text-emerald-500 dark:hover:text-emerald-400 transition-all duration-200 hover:-translate-y-0.5 relative group py-1 whitespace-nowrap">
            <span>Tariflar</span>
            <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 rounded-full transition-all duration-300 group-hover:w-full"></span>
          </router-link>
          <router-link to="/#reviews" class="hover:text-emerald-500 dark:hover:text-emerald-400 transition-all duration-200 hover:-translate-y-0.5 relative group py-1 whitespace-nowrap">
            <span>Sharhlar</span>
            <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 rounded-full transition-all duration-300 group-hover:w-full"></span>
          </router-link>
          <router-link to="/guide" class="hover:text-emerald-500 dark:hover:text-emerald-400 transition-all duration-200 hover:-translate-y-0.5 relative group py-1 whitespace-nowrap">
            <span>Qo'llanma</span>
            <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 rounded-full transition-all duration-300 group-hover:w-full"></span>
          </router-link>
        </nav>

        <!-- Right Side: ThemeToggle & Auth Actions -->
        <div class="flex items-center gap-2 sm:gap-3 shrink-0">
          <ThemeToggle />

          <router-link
            to="/auth/login"
            class="px-2.5 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition hover:scale-105 active:scale-95"
          >
            Kirish
          </router-link>

          <router-link
            to="/auth/register"
            class="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 hover:scale-105 active:scale-95 text-white shadow-sm transition-all flex items-center gap-1.5"
          >
            <Sparkles class="w-3.5 h-3.5" />
            <span>14 Kun Bepul</span>
          </router-link>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Page Hero -->
      <div class="text-center space-y-3 mb-10">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
          <ShieldCheck class="w-4 h-4" />
          <span>Xavfsizlik, Huquqiy & Maxfiylik Standartlari</span>
        </div>
        <h1 class="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          Xavfsizlik va Huquqiy Siyosat
        </h1>
        <p class="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto">
          Boshqar.uz platformasida sizning biznesingiz va shaxsiy ma'lumotlaringiz qanday himoyalanishi, cookie-fayllar va foydalanish qoidalari bilan tanishing.
        </p>
        <div class="text-[11px] text-slate-400 font-mono pt-1">
          So'nggi yangilanish: 18-Avgust, 2026-yil
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          @click="activeTab = tab.id"
          :class="[
            'px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition whitespace-nowrap cursor-pointer shadow-2xs',
            activeTab === tab.id
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          ]"
        >
          <component :is="tab.icon" class="w-4 h-4" />
          <span>{{ tab.label }}</span>
        </button>
      </div>

      <!-- Tab Content Area -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-xs space-y-8 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        <!-- 1. XAVFSIZLIK (SECURITY) -->
        <section v-if="activeTab === 'security'" class="space-y-6">
          <div class="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div class="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Shield class="w-6 h-6" />
            </div>
            <div>
              <h2 class="text-xl font-bold text-slate-900 dark:text-white">Axborot Xavfsizligi va Serverlar Himoyasi</h2>
              <p class="text-xs text-slate-500">Biznesingiz ma'lumotlari 24/7 shifrlangan va himoyalangan</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div class="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
              <div class="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                <Lock class="w-4 h-4 text-emerald-500" />
                <span>256-Bit SSL/TLS Shifrlash</span>
              </div>
              <p class="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                Sizning brauzeringiz va serverlarimiz o'rtasidagi har qanday aloqa eng zamonaviy 256-bitli TLS shifrlash protokoli orqali amalga oshiriladi. Ma'lumotlarni yo'lda tutib olish yoki o'zgartirish mutlaqo imkonsiz.
              </p>
            </div>

            <div class="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
              <div class="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                <Database class="w-4 h-4 text-emerald-500" />
                <span>Kunlik Avtomatik Zaxira (Backup)</span>
              </div>
              <p class="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                Har kuni tungi vaqtda barcha tovarlar, savdolar va moliya ma'lumotlarining xavfsiz zaxira nusxasi olinadi. Qurilmangiz yo'qolsa yoki buzilsa ham, ma'lumotlaringiz 100% xavfsiz saqlanadi.
              </p>
            </div>

            <div class="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
              <div class="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                <KeyRound class="w-4 h-4 text-emerald-500" />
                <span>Xodimlar Huquqlari & PIN Kod Nazorati</span>
              </div>
              <p class="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                Har bir xodim (kassir, ofitsiant, oshpaz) faqat o'ziga ruxsat etilgan bo'limlarni ko'ra oladi. Kassirlar foyda, tannarx yoki boshqa maxfiy moliyaviy hisobotlarni ko'ra olmaydi.
              </p>
            </div>

            <div class="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
              <div class="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                <Server class="w-4 h-4 text-emerald-500" />
                <span>99.9% Uptime Kafolati</span>
              </div>
              <p class="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                Serverlarimiz yuqori tezlikdagi zamonaviy bulutli infratuzilmada joylashgan bo'lib, uzluksiz 24/7 ishlash darajasini ta'minlaydi.
              </p>
            </div>
          </div>

          <div class="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
            <h3 class="font-bold text-emerald-800 dark:text-emerald-400 text-sm">O'zbekiston Qonunchiligiga Muvofiqlik</h3>
            <p class="text-xs text-slate-600 dark:text-slate-400">
              Boshqar.uz tizimi O'zbekiston Respublikasining 2019-yil 2-iyuldagi "Shaxsga doir ma'lumotlar to'g'risida"gi № O'RQ-547-sonli Qonuni talablariga to'liq mos keladi. Barcha ma'lumotlar qonuniy me'yorlar asosida qayta ishlanadi.
            </p>
          </div>
        </section>

        <!-- 2. MAXFIYLIK SIYOSATI (PRIVACY POLICY) -->
        <section v-if="activeTab === 'privacy'" class="space-y-6">
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

        <!-- 3. COOKIE SIYOSATI (COOKIE POLICY) -->
        <section v-if="activeTab === 'cookies'" class="space-y-6">
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

        <!-- 4. FOYDALANISH SHARTLARI (TERMS OF SERVICE) -->
        <section v-if="activeTab === 'terms'" class="space-y-6">
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
      </div>

      <!-- Quick Contact Box -->
      <div class="mt-8 p-6 rounded-3xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <div class="font-bold text-slate-900 dark:text-white text-sm">Savollaringiz yoki takliflaringiz bormi?</div>
          <div class="text-xs text-slate-500">Bizning xavfsizlik va huquqiy xizmatimiz sizga yordam berishga tayyor.</div>
        </div>
        <div class="flex items-center gap-3">
          <a
            href="https://t.me/boshqaruz"
            target="_blank"
            rel="noopener noreferrer"
            class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
          >
            Telegramda Bog'lanish
          </a>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import {
  ShieldCheck,
  Shield,
  FileText,
  Cookie,
  ScrollText,
  Lock,
  LockKeyhole,
  Palette,
  Database,
  KeyRound,
  Server,
  ArrowLeft,
  Sparkles,
} from 'lucide-vue-next';
import AppLogo from '../../components/AppLogo.vue';
import ThemeToggle from '../../components/ThemeToggle.vue';

const route = useRoute();

type TabType = 'security' | 'privacy' | 'cookies' | 'terms';
const activeTab = ref<TabType>('security');

const tabs = [
  { id: 'security' as TabType, label: 'Xavfsizlik Siyosati', icon: Shield },
  { id: 'privacy' as TabType, label: 'Maxfiylik (Privacy)', icon: FileText },
  { id: 'cookies' as TabType, label: 'Cookie Siyosati', icon: Cookie },
  { id: 'terms' as TabType, label: 'Foydalanish Shartlari', icon: ScrollText },
];

onMounted(() => {
  if (route.query.tab && typeof route.query.tab === 'string') {
    const queryTab = route.query.tab as TabType;
    if (tabs.some(t => t.id === queryTab)) {
      activeTab.value = queryTab;
    }
  } else if (route.path.includes('privacy')) {
    activeTab.value = 'privacy';
  } else if (route.path.includes('cookies')) {
    activeTab.value = 'cookies';
  } else if (route.path.includes('terms')) {
    activeTab.value = 'terms';
  } else if (route.path.includes('security')) {
    activeTab.value = 'security';
  }
});
</script>
