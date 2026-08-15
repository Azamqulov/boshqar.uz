<template>
  <div class="min-h-screen pt-20 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white font-sans antialiased overflow-x-hidden transition-colors duration-300">
    <!-- Ambient Aurora Glows (Adaptive) -->
    <div class="fixed top-0 left-1/4 w-[650px] h-[650px] bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse [animation-duration:8s]"></div>
    <div class="fixed bottom-0 right-1/4 w-[550px] h-[550px] bg-teal-500/10 dark:bg-teal-500/15 rounded-full blur-[130px] pointer-events-none -z-10 animate-pulse [animation-duration:10s]"></div>

    <!-- 1. FIXED GLASSMORPHIC NAVBAR -->
    <LandingHeader
      :is-authenticated="isAuthenticated"
      @open-demo="openDemoModal"
    />

    <!-- 2. HERO SECTION -->
    <LandingHero
      @open-demo="openDemoModal"
    />

    <!-- 3. REAL INTERACTIVE 4-IN-1 DEMO WINDOW -->
    <LandingInteractiveDemo
      @open-demo="openDemoModal"
      @open-receipt="handleOpenReceipt"
    />

    <!-- 4. ABOUT US SECTION -->
    <LandingAbout />

    <!-- 5. FEATURES / MODULES SECTION -->
    <LandingFeatures />

    <!-- 6. PRICING SECTION -->
    <LandingPricing
      @open-demo="openDemoModal"
    />

    <!-- 7. FAQ SECTION -->
    <LandingFAQ />

    <!-- 8. FOOTER -->
    <LandingFooter />

    <!-- MODAL: ON-DEMAND CUSTOM DEMO ACCOUNT GENERATOR -->
    <LandingDemoModal
      :is-open="isDemoModalOpen"
      :loading="loadingDemo"
      :sector-options="sectorOptions"
      @close="isDemoModalOpen = false"
      @submit="launchCustomDemo"
    />

    <!-- MODAL: 58MM POS RECEIPT TEST PRINT -->
    <LandingReceiptModal
      :is-open="showReceiptModal"
      :cart="receiptCart"
      :total="receiptTotal"
      @close="showReceiptModal = false"
      @finish-sale="finishDemoSale"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import AOS from 'aos';
import { useAuthStore } from '../../stores/auth.store';
import { useDataStore } from '../../stores/data.store';
import api from '../../services/api';
import { ShoppingBag, UtensilsCrossed, Coffee, Pill, Scissors, Wrench } from 'lucide-vue-next';

// Modular Components
import LandingHeader from './components/LandingHeader.vue';
import LandingHero from './components/LandingHero.vue';
import LandingInteractiveDemo from './components/LandingInteractiveDemo.vue';
import LandingAbout from './components/LandingAbout.vue';
import LandingFeatures from './components/LandingFeatures.vue';
import LandingPricing from './components/LandingPricing.vue';
import LandingFAQ from './components/LandingFAQ.vue';
import LandingFooter from './components/LandingFooter.vue';
import LandingDemoModal from './components/LandingDemoModal.vue';
import LandingReceiptModal from './components/LandingReceiptModal.vue';

const router = useRouter();
const authStore = useAuthStore();
const dataStore = useDataStore();

const isAuthenticated = computed(() => {
  return !!authStore.token && !!authStore.user;
});

// Valid anchor hashes on landing page
const validLandingHashes = ['', '#about', '#features', '#pricing', '#faq', '#demo'];

const checkHashValidity = () => {
  const hash = window.location.hash;
  if (hash && !validLandingHashes.includes(hash)) {
    router.replace('/404');
  }
};

const isDemoModalOpen = ref(false);
const loadingDemo = ref(false);
const showReceiptModal = ref(false);
const receiptCart = ref<any[]>([]);
const receiptTotal = ref(0);

const defaultSectorOptions = [
  { id: 'shop', label: "Do'kon & Savdo", icon: ShoppingBag, desc: "Chakana savdo, ombor va kassa" },
  { id: 'restaurant', label: "Restoran", icon: UtensilsCrossed, desc: "Stollar, ofitsiant va oshxona" },
  { id: 'cafe', label: "Kafe & Fast-food", icon: Coffee, desc: "Tezkor taom va qahva" },
  { id: 'pharmacy', label: "Dorixona", icon: Pill, desc: "Dori va muddat nazorati" },
  { id: 'barbershop', label: "Sartaroshxona", icon: Scissors, desc: "Ustalarning bandlik jadvali" },
  { id: 'service', label: "Xizmat ko'rsatish", icon: Wrench, desc: "Universal buyurtma va servis" },
];

const sectorOptions = ref(defaultSectorOptions);

const handleResize = () => {
  AOS.refresh();
};

onMounted(async () => {
  // Check if initial hash is invalid (e.g. #faqasdsadfgsdfg) -> redirect to 404
  checkHashValidity();
  window.addEventListener('hashchange', checkHashValidity);
  window.addEventListener('resize', handleResize);

  await nextTick();

  // Initialize AOS (Animate on Scroll) with reliable SPA configuration
  AOS.init({
    duration: 700,
    once: true,
    offset: 40,
    easing: 'ease-out-cubic',
    disableMutationObserver: false,
    mirror: false,
  });

  // Dual refresh to ensure accurate offsets after fonts & images load
  setTimeout(() => {
    AOS.refresh();
  }, 100);

  setTimeout(() => {
    AOS.refresh();
  }, 400);

  try {
    const { data } = await api.get('/businesses/types');
    if (Array.isArray(data) && data.length > 0) {
      const activeTypes = data.filter((d: any) => d.isEnabled !== false);
      if (activeTypes.length > 0) {
        sectorOptions.value = activeTypes.map((d: any) => {
          const found = defaultSectorOptions.find((def) => def.id === d.type);
          return {
            id: d.type,
            label: d.label || found?.label || d.type,
            desc: d.desc || found?.desc || '',
            icon: found?.icon || ShoppingBag,
          };
        });
      }
    }
  } catch (err) {
    // If backend endpoint is not yet loaded or offline, defaults remain active
  }
});

onUnmounted(() => {
  window.removeEventListener('hashchange', checkHashValidity);
  window.removeEventListener('resize', handleResize);
});

const openDemoModal = () => {
  isDemoModalOpen.value = true;
};

const handleOpenReceipt = (payload: { cart: any[]; total: number }) => {
  receiptCart.value = payload.cart;
  receiptTotal.value = payload.total;
  showReceiptModal.value = true;
};

const finishDemoSale = () => {
  showReceiptModal.value = false;
  receiptCart.value = [];
  receiptTotal.value = 0;
};

const launchCustomDemo = async (form: { companyName: string; phone: string; businessType: string }) => {
  loadingDemo.value = true;
  try {
    const compName = form.companyName.trim() || 'Demo Korxona';
    const compPhone = form.phone.trim() || '+998 90 123-45-67';
    const compType = form.businessType || 'shop';

    // 1. Generate local demo workspace
    authStore.startDemoWorkspace(compName, compPhone, compType);

    // 2. Preload 15 sector products and customer data into dataStore
    dataStore.loadDemoData(compType);

    isDemoModalOpen.value = false;

    // 3. Route directly into POS or Dashboard
    if (compType === 'restaurant' || compType === 'cafe') {
      router.push('/pos');
    } else {
      router.push('/dashboard');
    }
  } finally {
    loadingDemo.value = false;
  }
};
</script>
