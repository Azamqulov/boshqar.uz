<template>
  <div
    v-if="shouldBlockUser"
    class="fixed inset-0 z-[9999999] bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 min-h-screen w-screen flex flex-col justify-between p-6 sm:p-10 select-none overflow-y-auto"
  >
    <!-- Background Ambient Glow Orbs -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
      <div class="absolute -top-40 -left-40 w-[500px] h-[500px] bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-amber-500/10 dark:bg-amber-500/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 1.5s;"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl"></div>
    </div>

    <!-- Top Navigation Header -->
    <header class="relative z-10 w-full max-w-6xl mx-auto flex items-center justify-between">
      <AppLogo />
      <div class="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-black tracking-wider uppercase border border-emerald-500/30 shadow-xs backdrop-blur-md">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 -ml-5"></span>
        <span>Rejalashtirilgan Profilaktika</span>
      </div>
    </header>

    <!-- Main Full-Screen Hero Content -->
    <main class="relative z-10 w-full max-w-4xl mx-auto my-auto py-8 text-center space-y-8 animate-in fade-in zoom-in-95 duration-300">
      
      <!-- 3D ISOMETRIC MOTION GRAPHICS STAGE -->
      <div class="relative w-full max-w-lg h-60 sm:h-72 mx-auto flex items-center justify-center overflow-hidden rounded-3xl bg-slate-100/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl backdrop-blur-md perspective-stage">
        
        <!-- Isometric Floating 3D Board -->
        <div class="iso-board relative w-72 h-44 sm:w-88 sm:h-52 transition-transform duration-700">
          
          <!-- Base Grid Platform -->
          <div class="absolute inset-0 rounded-3xl bg-white/90 dark:bg-slate-800/90 border-2 border-emerald-500/30 dark:border-emerald-500/40 shadow-2xl backdrop-blur-md overflow-hidden grid-bg">
            <!-- Glowing Laser Scan Line -->
            <div class="laser-scanner absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_#10b981]"></div>
          </div>

          <!-- Layer 1: Database Synchronization -->
          <div class="iso-element-1 absolute -top-4 -left-3 p-3 rounded-2xl bg-slate-900/95 dark:bg-slate-950/95 border border-emerald-500/40 shadow-2xl text-left text-[10px] space-y-1.5 w-36 sm:w-40">
            <div class="flex items-center justify-between text-emerald-400 font-black">
              <div class="flex items-center gap-1.5">
                <Database class="w-3.5 h-3.5 text-emerald-400" />
                <span>Baza Sinxron...</span>
              </div>
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </div>
            <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full animate-progress-bar"></div>
            </div>
          </div>

          <!-- Layer 2: Center 3D Code Repair Card -->
          <div class="iso-element-2 absolute top-6 left-16 sm:left-24 p-3.5 rounded-2xl bg-white/95 dark:bg-slate-800/95 border border-emerald-500/40 shadow-2xl text-left w-48 sm:w-56 space-y-2">
            <div class="flex items-center justify-between">
              <div class="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Wrench class="w-4 h-4 animate-wrench-wiggle" />
              </div>
              <span class="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono text-[9px] font-black uppercase">
                TUZATILMOQDA
              </span>
            </div>

            <div class="space-y-1.5">
              <div class="flex items-center justify-between text-[10px] font-bold text-slate-700 dark:text-slate-300">
                <span>Tizim yangilanishi</span>
                <span class="text-emerald-500 font-mono">v2.4.0</span>
              </div>
              <div class="space-y-1">
                <div class="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full w-4/5 animate-pulse"></div>
                <div class="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full w-full"></div>
                <div class="h-1.5 bg-emerald-500/40 rounded-full w-3/5"></div>
              </div>
            </div>
          </div>

          <!-- Layer 3: API & Cache Acceleration -->
          <div class="iso-element-3 absolute -bottom-3 right-0 p-3 rounded-2xl bg-slate-900/95 dark:bg-slate-950/95 border border-emerald-500/40 shadow-2xl text-left text-[10px] space-y-1.5 w-36 sm:w-40">
            <div class="flex items-center justify-between text-emerald-400 font-black">
              <div class="flex items-center gap-1.5">
                <Cpu class="w-3.5 h-3.5 text-emerald-400" />
                <span>API & Kesh</span>
              </div>
              <span class="text-[9px] text-emerald-300 font-mono">3x Tez</span>
            </div>
            <div class="flex items-center gap-1 text-[9px] text-slate-400 font-mono">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Optimallashtirish</span>
            </div>
          </div>

          <!-- Hovering Animated Scanner Lupa -->
          <div class="iso-scanner absolute top-2 right-12 w-14 h-14 rounded-full border-2 border-cyan-400/80 bg-cyan-500/10 shadow-[0_0_20px_#22d3ee] flex items-center justify-center pointer-events-none">
            <Search class="w-6 h-6 text-cyan-400 animate-spin-slow" />
            <div class="absolute inset-0 rounded-full border border-cyan-300 animate-ping opacity-40"></div>
          </div>

        </div>
      </div>

      <!-- Typography -->
      <div class="space-y-3 max-w-2xl mx-auto">
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          {{ maintenanceData.title || "Texnik profilaktika ishlari olib borilmoqda" }}
        </h1>
        <p class="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl mx-auto">
          {{ maintenanceData.message || "Tizimni yangilash va optimallashtirish ishlari ketmoqda. Tez orada barcha xizmatlar to'liq quvvatda ishga tushadi." }}
        </p>
      </div>

      <!-- Information & Countdown Pill -->
      <div v-if="maintenanceData.estimatedEndTime" class="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-md text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
        <div class="flex items-center gap-2">
          <Clock class="w-4 h-4 text-emerald-500" />
          <span>Taxminiy yakunlash:</span>
        </div>
        <span class="px-3 py-1 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-black font-mono text-xs">
          {{ maintenanceData.estimatedEndTime }}
        </span>
      </div>

      <!-- Action Button -->
      <div class="pt-2 max-w-xs mx-auto">
        <button
          type="button"
          @click="checkMaintenance(false)"
          :disabled="isChecking"
          class="w-full py-4 px-8 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white font-black text-sm shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2.5 transition disabled:opacity-50 btn-interactive cursor-pointer"
        >
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isChecking }" />
          <span>{{ isChecking ? "Tekshirilmoqda..." : "Holatni Qayta Tekshirish" }}</span>
        </button>
      </div>

      <!-- Support Links -->
      <div class="flex items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400 pt-2 font-semibold">
        <a
          href="https://t.me/boshqar_support"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-1.5 hover:text-emerald-500 transition"
        >
          <Send class="w-4 h-4 text-sky-500" />
          <span>Telegram Yordam</span>
        </a>
        <span>•</span>
        <a
          href="tel:+998901234567"
          class="flex items-center gap-1.5 hover:text-emerald-500 transition"
        >
          <Phone class="w-4 h-4 text-emerald-500" />
          <span>Aloqa markazi</span>
        </a>
      </div>

    </main>

    <!-- Bottom Footer -->
    <footer class="relative z-10 w-full max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 py-2 text-xs text-slate-400 dark:text-slate-600 border-t border-slate-200/60 dark:border-slate-800/60">
      <div>© {{ new Date().getFullYear() }} Boshqar.uz — Barcha huquqlar himoyalangan.</div>
      <div class="flex items-center gap-2 font-mono text-[11px]">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>Serverlar statusi: Yangilanmoqda</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';
import {
  Wrench,
  Clock,
  RefreshCw,
  Send,
  Phone,
  Database,
  Cpu,
  Search,
} from 'lucide-vue-next';
import AppLogo from './AppLogo.vue';
import { useMaintenanceMode } from '../composables/useMaintenanceMode';

const {
  maintenanceData,
  isChecking,
  shouldBlockUser,
  checkMaintenance,
  startPolling,
  stopPolling,
} = useMaintenanceMode();

watch(
  shouldBlockUser,
  (val) => {
    if (typeof document !== 'undefined') {
      if (val) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  },
  { immediate: true }
);

onMounted(() => {
  startPolling();
});

onUnmounted(() => {
  stopPolling();
  if (typeof document !== 'undefined') {
    document.body.style.overflow = '';
  }
});
</script>

<style scoped>
.perspective-stage {
  perspective: 1000px;
}

.iso-board {
  transform: rotateX(24deg) rotateY(-12deg) rotateZ(3deg);
  transform-style: preserve-3d;
  animation: floatBoard 4s ease-in-out infinite alternate;
}

.grid-bg {
  background-size: 16px 16px;
  background-image: 
    linear-gradient(to right, rgba(16, 185, 129, 0.08) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(16, 185, 129, 0.08) 1px, transparent 1px);
}

.laser-scanner {
  animation: scanLaser 3s ease-in-out infinite;
}

.iso-element-1 {
  transform: translateZ(25px);
  animation: floatLayer1 3s ease-in-out infinite alternate;
}

.iso-element-2 {
  transform: translateZ(40px);
  animation: floatLayer2 3.5s ease-in-out infinite alternate;
}

.iso-element-3 {
  transform: translateZ(30px);
  animation: floatLayer3 3.2s ease-in-out infinite alternate;
}

.iso-scanner {
  transform: translateZ(60px);
  animation: scanMove 4s ease-in-out infinite alternate;
}

@keyframes floatBoard {
  0% {
    transform: rotateX(24deg) rotateY(-12deg) rotateZ(3deg) translateY(0px);
  }
  100% {
    transform: rotateX(21deg) rotateY(-8deg) rotateZ(2deg) translateY(-8px);
  }
}

@keyframes floatLayer1 {
  0% {
    transform: translateZ(20px) translateY(0);
  }
  100% {
    transform: translateZ(30px) translateY(-5px);
  }
}

@keyframes floatLayer2 {
  0% {
    transform: translateZ(35px) translateY(0);
  }
  100% {
    transform: translateZ(50px) translateY(-7px);
  }
}

@keyframes floatLayer3 {
  0% {
    transform: translateZ(25px) translateY(0);
  }
  100% {
    transform: translateZ(38px) translateY(-4px);
  }
}

@keyframes scanLaser {
  0% {
    top: 0%;
    opacity: 0.2;
  }
  50% {
    opacity: 1;
  }
  100% {
    top: 100%;
    opacity: 0.2;
  }
}

@keyframes scanMove {
  0% {
    transform: translateZ(55px) translate(0, 0);
  }
  50% {
    transform: translateZ(65px) translate(-30px, 20px);
  }
  100% {
    transform: translateZ(60px) translate(-10px, 40px);
  }
}

@keyframes wrenchWiggle {
  0%, 100% {
    transform: rotate(-15deg);
  }
  50% {
    transform: rotate(20deg);
  }
}

.animate-wrench-wiggle {
  animation: wrenchWiggle 1.8s ease-in-out infinite;
  transform-origin: center;
}

.animate-spin-slow {
  animation: spin 10s linear infinite;
}

@keyframes progressBar {
  0% {
    width: 20%;
  }
  50% {
    width: 85%;
  }
  100% {
    width: 20%;
  }
}

.animate-progress-bar {
  animation: progressBar 3s ease-in-out infinite;
}
</style>
