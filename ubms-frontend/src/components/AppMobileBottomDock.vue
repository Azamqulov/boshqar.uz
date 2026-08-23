<template>
  <div>
    <!-- Bottom Content Masking Gradient (Prevents text/cards from bleeding behind bottom dock) -->
    <div class="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-100/95 via-slate-100/70 to-transparent dark:from-slate-950/95 dark:via-slate-950/70 pointer-events-none z-30"></div>

    <!-- Floating Curved Mobile Bottom Dock Navigation Bar (Fresh Light Emerald Theme + Liquid Morph) -->
    <div class="md:hidden fixed bottom-2 left-2 right-2 z-40 pointer-events-auto flex items-center justify-center">
      <div class="relative w-full max-w-md h-[46px] flex items-center justify-between px-1">
        
        <!-- SVG Curved Background Dock with Solid Light/Dark Mode Fill & U-notch cutout in middle -->
        <svg class="absolute inset-0 w-full h-full drop-shadow-xl" viewBox="0 0 360 46" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M 18 0 H 144 C 156 0, 158 22, 180 22 C 202 22, 204 0, 216 0 H 342 A 18 18 0 0 1 360 18 V 28 A 18 18 0 0 1 342 46 H 18 A 18 18 0 0 1 0 28 V 18 A 18 18 0 0 1 18 0 Z"
            class="fill-white dark:fill-slate-900 stroke-emerald-500/40 dark:stroke-emerald-500/50"
            stroke-width="1.2"
          />
        </svg>

        <!-- Navigation Slots Overlay -->
        <div class="relative z-10 w-full h-full flex items-center justify-between px-1">
          <template v-for="(item, idx) in orderedMobileNavItems" :key="item.id">
            <!-- Center Elevated Dynamic FAB Slot with U-dip Cutout (Index 2) -->
            <router-link
              v-if="idx === 2"
              :to="item.to"
              class="flex flex-col items-center justify-end h-full pb-1 relative flex-1 group"
            >
              <!-- Floating FAB Circle Container (Positioned High Above Notch) -->
              <div class="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none">
                <!-- Liquid Water Ripple Ring -->
                <span v-if="isWaterDropAnimating" class="absolute inset-0 w-11 h-11 rounded-full bg-emerald-400/40 animate-water-ripple"></span>

                <!-- Liquid Water Drop FAB Circle -->
                <div
                  class="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-500 via-emerald-400 to-teal-400 text-white flex items-center justify-center shadow-xl shadow-emerald-500/45 border-[3.5px] border-white dark:border-slate-900 transform group-active:scale-90 transition-all duration-200 pointer-events-auto"
                  :class="{ 'animate-liquid-morph': isWaterDropAnimating }"
                >
                  <component :is="item.icon" class="w-5 h-5 text-white stroke-[2.5]" />
                </div>
              </div>

              <!-- Active Label Inside the U-dip (Aligned on Same Baseline) -->
              <span class="text-[9.5px] font-black text-emerald-600 dark:text-emerald-400 tracking-tight leading-none">
                {{ item.label }}
              </span>
            </router-link>

            <!-- Regular Navigation Slots (Index 0, 1, 3) -->
            <router-link
              v-else
              :to="item.to"
              class="flex flex-col items-center justify-end h-full pb-1 px-1 rounded-xl text-[9.5px] font-semibold transition-all relative flex-1 group text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              <component :is="item.icon" class="w-3.5 h-3.5 mb-1 transition-transform group-active:scale-90" />
              <span class="leading-none">{{ item.label }}</span>
            </router-link>
          </template>

          <!-- Slot 5: Menyu (Mobile Sidebar Trigger) -->
          <button
            type="button"
            @click="$emit('openMobileSidebar')"
            class="flex flex-col items-center justify-end h-full pb-1 px-1 rounded-xl text-[9.5px] font-semibold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all relative flex-1 group cursor-pointer"
          >
            <Menu class="w-3.5 h-3.5 mb-1 transition-transform group-active:scale-90" />
            <span class="leading-none">Menyu</span>
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  ShoppingCart,
  LayoutDashboard,
  Package,
  Wallet,
  Menu,
} from 'lucide-vue-next';

defineEmits<{
  (e: 'openMobileSidebar'): void;
}>();

const route = useRoute();
const router = useRouter();

const isWaterDropAnimating = ref(false);

watch(
  () => route.path,
  () => {
    isWaterDropAnimating.value = true;
    setTimeout(() => {
      isWaterDropAnimating.value = false;
    }, 450);
  }
);

const mobileNavRoutes = [
  { id: 'pos', to: '/pos', label: 'Kassa', icon: ShoppingCart },
  { id: 'dashboard', to: '/dashboard', label: 'Asosiy', icon: LayoutDashboard },
  { id: 'products', to: '/products', label: 'Tovarlar', icon: Package },
  { id: 'finance', to: '/finance', label: 'Moliya', icon: Wallet },
];

const orderedMobileNavItems = computed(() => {
  const currentPath = route.path;
  const items = [...mobileNavRoutes];

  const activeIdx = items.findIndex((item) =>
    item.to === '/products' ? currentPath.startsWith('/products') : currentPath === item.to
  );

  if (activeIdx !== -1) {
    const activeItem = items.splice(activeIdx, 1)[0];
    items.splice(2, 0, activeItem);
  }

  return items;
});

// Touch Swipe Page Navigation logic
let touchStartX = 0;
let touchStartY = 0;

const handleTouchStart = (e: TouchEvent) => {
  if (e.touches.length === 1) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }
};

const handleTouchEnd = (e: TouchEvent) => {
  if (e.changedTouches.length === 1) {
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const deltaY = e.changedTouches[0].clientY - touchStartY;

    if (Math.abs(deltaX) > 55 && Math.abs(deltaY) < 60) {
      const currentPath = route.path;
      const currentIndex = mobileNavRoutes.findIndex((item) =>
        item.to === '/products' ? currentPath.startsWith('/products') : currentPath === item.to
      );

      if (currentIndex !== -1) {
        if (deltaX < 0 && currentIndex < mobileNavRoutes.length - 1) {
          router.push(mobileNavRoutes[currentIndex + 1].to);
        } else if (deltaX > 0 && currentIndex > 0) {
          router.push(mobileNavRoutes[currentIndex - 1].to);
        }
      }
    }
  }
};

onMounted(() => {
  window.addEventListener('touchstart', handleTouchStart, { passive: true });
  window.addEventListener('touchend', handleTouchEnd, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('touchstart', handleTouchStart);
  window.removeEventListener('touchend', handleTouchEnd);
});
</script>

<style scoped>
/* Water Drop Liquid Animation when switching tabs */
@keyframes liquidDrop {
  0% {
    transform: scale(0.4) translateY(-10px);
    border-radius: 40% 40% 55% 55% / 60% 60% 40% 40%;
  }
  45% {
    transform: scale(1.18) translateY(2px);
    border-radius: 35% 35% 65% 65% / 45% 45% 55% 55%;
  }
  75% {
    transform: scale(0.92) translateY(-1px);
    border-radius: 55% 55% 45% 45% / 55% 55% 45% 45%;
  }
  100% {
    transform: scale(1) translateY(0);
    border-radius: 9999px;
  }
}

@keyframes waterRipple {
  0% {
    transform: scale(0.6);
    opacity: 0.9;
  }
  100% {
    transform: scale(1.8);
    opacity: 0;
  }
}

.animate-liquid-morph {
  animation: liquidDrop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.animate-water-ripple {
  animation: waterRipple 0.45s ease-out forwards;
}
</style>
