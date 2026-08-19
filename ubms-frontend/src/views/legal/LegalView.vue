<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white notranslate" translate="no">
    <!-- Top Header Component -->
    <LegalHeader />

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
        <LegalSecuritySection v-if="activeTab === 'security'" />

        <!-- 2. MAXFIYLIK SIYOSATI (PRIVACY POLICY) -->
        <LegalPrivacySection v-if="activeTab === 'privacy'" />

        <!-- 3. COOKIE SIYOSATI (COOKIE POLICY) -->
        <LegalCookiesSection v-if="activeTab === 'cookies'" />

        <!-- 4. FOYDALANISH SHARTLARI (TERMS OF SERVICE) -->
        <LegalTermsSection v-if="activeTab === 'terms'" />
      </div>

      <!-- Quick Contact Box Component -->
      <LegalContactBox />
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
} from 'lucide-vue-next';

import LegalHeader from './components/LegalHeader.vue';
import LegalSecuritySection from './components/LegalSecuritySection.vue';
import LegalPrivacySection from './components/LegalPrivacySection.vue';
import LegalCookiesSection from './components/LegalCookiesSection.vue';
import LegalTermsSection from './components/LegalTermsSection.vue';
import LegalContactBox from './components/LegalContactBox.vue';

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
