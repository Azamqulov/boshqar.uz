<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-200">
    <!-- Top Right Theme Switcher -->
    <div class="absolute top-4 right-4 z-20">
      <ThemeToggle />
    </div>

    <!-- Ambient Glow Blobs -->
    <div class="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500/10 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

    <div class="max-w-xl w-full mx-auto z-10">
      <!-- Steps Indicator Component -->
      <OnboardingStepsIndicator :step="step" />

      <!-- Step Card -->
      <div class="glass-card rounded-2xl p-6 sm:p-8">
        <!-- Step 1: Business Profile -->
        <OnboardingStepProfile
          v-if="step === 1"
          v-model:form="form"
          :business-types="businessTypes"
          @back="handleBackFromStep1"
          @next="nextStep"
        />

        <!-- Step 2: Branch Setup -->
        <OnboardingStepBranch
          v-else-if="step === 2"
          v-model:form="form"
          @back="step = 1"
          @next="nextStep"
        />

        <!-- Step 3: Final Confirmation -->
        <OnboardingStepConfirm
          v-else-if="step === 3"
          :form="form"
          :selected-business-type-label="selectedBusinessTypeLabel"
          :is-loading="isLoading"
          @back="step = 2"
          @submit="handleSubmit"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  ShoppingBag,
  UtensilsCrossed,
  Coffee,
  Scissors,
  Pill,
  Wrench,
} from 'lucide-vue-next';

import api from '@/services/api';
import { useAuthStore } from '@/stores/auth.store';
import { useToast } from '@/composables/useToast';
import { cleanUzbekPhone } from '@/composables/usePhoneMask';
import ThemeToggle from '@/components/ThemeToggle.vue';

import OnboardingStepsIndicator from './components/OnboardingStepsIndicator.vue';
import OnboardingStepProfile from './components/OnboardingStepProfile.vue';
import OnboardingStepBranch from './components/OnboardingStepBranch.vue';
import OnboardingStepConfirm from './components/OnboardingStepConfirm.vue';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const step = ref(1);
const isLoading = ref(false);

const getInitialPhone = () => {
  if (authStore.user?.phone) return authStore.user.phone;
  try {
    const stored = localStorage.getItem('ubms_user');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.phone) return parsed.phone;
    }
  } catch (e) {}
  return '+998 ';
};

const form = ref({
  name: '',
  businessType: 'shop',
  branchName: 'Bosh filial',
  branchAddress: '',
  branchPhone: getInitialPhone(),
});

onMounted(async () => {
  const initial = getInitialPhone();
  if (initial && initial !== '+998 ') {
    form.value.branchPhone = initial;
  } else {
    try {
      const { data } = await api.get('/auth/profile/me');
      if (data?.phone) {
        form.value.branchPhone = data.phone;
        if (authStore.user) {
          authStore.user.phone = data.phone;
        }
      }
    } catch (e) {}
  }

  await loadAvailableTypes();
});

const defaultBusinessTypes = [
  { type: 'shop', label: "Do'kon", icon: ShoppingBag, desc: 'Chakana savdo, ombor va kassa' },
  { type: 'restaurant', label: 'Restoran', icon: UtensilsCrossed, desc: 'Stollar, ofitsiant va oshxona' },
  { type: 'cafe', label: 'Kafe / Fastfood', icon: Coffee, desc: 'Tezkor buyurtma va kassa' },
  { type: 'barbershop', label: 'Sartaroshxona', icon: Scissors, desc: 'Ustalarning bandlik jadvali' },
  { type: 'pharmacy', label: 'Dorixona', icon: Pill, desc: 'Partiya va muddat nazorati' },
  { type: 'service', label: 'Xizmat ko\'rsatish', icon: Wrench, desc: 'Universal buyurtma va xizmat' },
];

const businessTypes = ref(defaultBusinessTypes);

const loadAvailableTypes = async () => {
  try {
    const { data } = await api.get('/businesses/types');
    if (Array.isArray(data) && data.length > 0) {
      businessTypes.value = data.map((d: any) => {
        const found = defaultBusinessTypes.find((def) => def.type === d.type);
        return {
          type: d.type,
          label: d.label || found?.label || d.type,
          desc: d.desc || found?.desc || '',
          icon: found?.icon || ShoppingBag,
        };
      });

      if (!businessTypes.value.some((b) => b.type === form.value.businessType)) {
        form.value.businessType = businessTypes.value[0]?.type || 'shop';
      }
    }
  } catch (err) {
    console.error('Failed to fetch available business types', err);
  }
};

const selectedBusinessTypeLabel = computed(() => {
  return businessTypes.value.find((bt) => bt.type === form.value.businessType)?.label || form.value.businessType;
});

const nextStep = () => {
  if (step.value === 1 && form.value.name && form.value.businessType) step.value = 2;
  else if (step.value === 2) step.value = 3;
};

const handleBackFromStep1 = () => {
  if (authStore.businesses && authStore.businesses.length > 0) {
    router.push('/dashboard');
  } else {
    authStore.logout();
    router.push('/auth/login');
  }
};

const handleSubmit = async () => {
  isLoading.value = true;
  try {
    const payload = {
      ...form.value,
      branchPhone: form.value.branchPhone ? cleanUzbekPhone(form.value.branchPhone) : undefined,
    };
    const { data } = await api.post('/businesses', payload);
    authStore.setActiveBusiness({
      id: data.business.id,
      name: data.business.name,
      businessType: data.business.businessType,
      currency: data.business.currency,
      role: 'Owner',
      branchId: data.branch.id,
    });
    toast.success(`"${data.business.name}" biznesingiz muvaffaqiyatli ishga tushirildi!`, 'Xush kelibsiz!');
    router.push('/dashboard');
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Biznesni yaratishda xatolik yuz berdi', 'Xatolik');
  } finally {
    isLoading.value = false;
  }
};
</script>
