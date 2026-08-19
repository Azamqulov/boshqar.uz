<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-center gap-3.5">
        <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shadow-inner shrink-0">
          <Wrench class="w-6 h-6" />
        </div>
        <div>
          <h2 class="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Texnik Ishlar & Profilaktika Rejimi (Maintenance Mode)</span>
            <span
              class="px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider"
              :class="form.isMaintenance ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 animate-pulse' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700'"
            >
              {{ form.isMaintenance ? "FAOL (YOQILGAN)" : "O'CHIRILGAN (NORMAL)" }}
            </span>
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Kod yangilash, server migratsiyasi yoki baza optimallashtirish vaqtida mijozlarga 3D motion animatsiyali chiroyli texnik ishlar xabarini ko'rsatish
          </p>
        </div>
      </div>

      <!-- Quick Toggle Button (Yashil Brend) -->
      <button
        type="button"
        @click="toggleMaintenanceQuick"
        :disabled="saving"
        class="px-6 py-3.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 shrink-0 shadow-lg active:scale-98 btn-interactive cursor-pointer"
        :class="form.isMaintenance
          ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/25'
          : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25'"
      >
        <Power class="w-4 h-4" />
        <span>{{ form.isMaintenance ? "Rejimni O'chirish (Saytni Ochish)" : "Texnik Rejimni Yoqish" }}</span>
      </button>
    </div>

    <!-- Main Grid: Settings & Live Preview -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <!-- Settings Form (7 cols) -->
      <div class="lg:col-span-7 glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <Sliders class="w-4 h-4 text-emerald-500" />
          <span>Profilaktika Parametrlari</span>
        </h3>

        <!-- 1. Switch -->
        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
          <div>
            <h4 class="font-bold text-xs text-slate-900 dark:text-white">Texnik Profilaktika Rejimi</h4>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Yoqilganda SuperAdmin dan tashqari barcha foydalanuvchilar to'xtatiladi va 3D animatsiyali oyna chiqadi
            </p>
          </div>
          <button
            type="button"
            @click="form.isMaintenance = !form.isMaintenance"
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
            :class="form.isMaintenance ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'"
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out"
              :class="form.isMaintenance ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>

        <!-- 2. Sarlavha -->
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Ekranda chiqadigan Sarlavha:
          </label>
          <input
            v-model="form.title"
            type="text"
            placeholder="Texnik profilaktika ishlari olib borilmoqda"
            class="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <!-- 3. Xabar -->
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Foydalanuvchilarga ko'rinadigan Batafsil Xabar:
          </label>
          <textarea
            v-model="form.message"
            rows="3"
            placeholder="Tizimni yangilash va optimallashtirish ishlari ketmoqda. Tez orada barcha xizmatlar to'liq quvvatda ishga tushadi."
            class="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
          ></textarea>
        </div>

        <!-- 4. Taxminiy vaqt -->
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Taxminiy yakunlash vaqti / Eslatma:
          </label>
          <input
            v-model="form.estimatedEndTime"
            type="text"
            placeholder="15 daqiqadan so'ng yoki 22:30 da"
            class="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <!-- Save Button -->
        <div class="pt-2">
          <button
            type="button"
            @click="saveMaintenanceSettings"
            :disabled="saving"
            class="w-full py-3.5 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white font-black text-xs shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50 btn-interactive cursor-pointer"
          >
            <Save class="w-4 h-4" />
            <span>{{ saving ? "Saqlanmoqda..." : "Sozlamalarni Saqlash & Qo'llash" }}</span>
          </button>
        </div>
      </div>

      <!-- Live Preview (5 cols) -->
      <div class="lg:col-span-5 space-y-4">
        <div class="glass-card rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <Eye class="w-4 h-4 text-emerald-500" />
            <span>Foydalanuvchi Ko'radigan Jonli 3D Ko'rinish (Preview)</span>
          </h3>

          <!-- Mini 3D Mockup Card -->
          <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-5 text-center space-y-3.5 shadow-xl overflow-hidden">
            <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase border border-emerald-500/30">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Rejalashtirilgan Profilaktika</span>
            </div>

            <!-- Mini 3D Isometric Board -->
            <div class="relative w-full h-44 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 perspective-stage overflow-hidden">
              <div class="iso-board relative w-60 h-32">
                <!-- Grid Platform -->
                <div class="absolute inset-0 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-emerald-500/30 shadow-lg grid-bg overflow-hidden">
                  <div class="laser-scanner absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_10px_#10b981]"></div>
                </div>

                <!-- Layer 1 -->
                <div class="iso-element-1 absolute -top-3 -left-2 p-1.5 rounded-lg bg-slate-900 border border-emerald-500/40 text-[8px] text-emerald-400 font-bold flex items-center gap-1">
                  <Database class="w-2.5 h-2.5" />
                  <span>Baza Sync</span>
                </div>

                <!-- Layer 2 Center Card -->
                <div class="iso-element-2 absolute top-4 left-12 p-2 rounded-xl bg-white dark:bg-slate-800 border border-emerald-500/40 shadow-md text-left w-32 space-y-1">
                  <div class="flex items-center gap-1.5">
                    <Wrench class="w-3.5 h-3.5 text-emerald-500 animate-wrench-wiggle" />
                    <span class="text-[9px] font-black text-emerald-600 dark:text-emerald-400">TUZATILMOQDA</span>
                  </div>
                  <div class="h-1 bg-slate-200 dark:bg-slate-700 rounded-full w-full"></div>
                  <div class="h-1 bg-emerald-500/50 rounded-full w-2/3"></div>
                </div>

                <!-- Layer 3 -->
                <div class="iso-element-3 absolute -bottom-2 right-2 p-1.5 rounded-lg bg-slate-900 border border-emerald-500/40 text-[8px] text-emerald-400 font-bold flex items-center gap-1">
                  <Cpu class="w-2.5 h-2.5" />
                  <span>3x Kesh</span>
                </div>

                <!-- Scanner Ring -->
                <div class="iso-scanner absolute top-1 right-8 w-8 h-8 rounded-full border border-emerald-400 bg-emerald-500/10 flex items-center justify-center">
                  <Search class="w-3.5 h-3.5 text-emerald-400" />
                </div>
              </div>
            </div>

            <div>
              <h4 class="text-base font-black tracking-tight text-slate-900 dark:text-white">
                {{ form.title || "Texnik profilaktika ishlari olib borilmoqda" }}
              </h4>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {{ form.message || "Tizimni yangilash va optimallashtirish ishlari ketmoqda..." }}
              </p>
            </div>

            <div v-if="form.estimatedEndTime" class="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span>Taxminiy yakunlash:</span>
              <span class="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{{ form.estimatedEndTime }}</span>
            </div>
          </div>

          <div class="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-900 dark:text-emerald-300 leading-relaxed space-y-1">
            <p class="font-bold flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
              <ShieldAlert class="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>SuperAdmin uchun eslatma:</span>
            </p>
            <p class="text-[10px]">
              Texnik rejim yoqilganda ham siz SuperAdmin sifatida tizimga to'siqsiz kira olasiz va o'zgarishlarni test qila olasiz. Oddiy mijozlar va xodimlar esa faqat ushbu 3D animatsiyali oynani ko'radi.
            </p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  Wrench,
  Power,
  Sliders,
  Save,
  Eye,
  ShieldAlert,
  Database,
  Cpu,
  Search,
} from 'lucide-vue-next';
import { useMaintenanceMode } from '../../../composables/useMaintenanceMode';
import { useToast } from '../../../composables/useToast';

const toast = useToast();
const { maintenanceData, checkMaintenance, setMaintenance } = useMaintenanceMode();

const form = ref({
  isMaintenance: false,
  title: '',
  message: '',
  estimatedEndTime: '',
});

const saving = ref(false);

const loadCurrent = async () => {
  await checkMaintenance(true);
  form.value = {
    isMaintenance: maintenanceData.value.isMaintenance,
    title: maintenanceData.value.title || 'Texnik profilaktika ishlari olib borilmoqda',
    message: maintenanceData.value.message || 'Tizimni yangilash va optimallashtirish ishlari ketmoqda. Tez orada barcha xizmatlar to\'liq quvvatda ishga tushadi.',
    estimatedEndTime: maintenanceData.value.estimatedEndTime || '20 daqiqadan so\'ng',
  };
};

const saveMaintenanceSettings = async () => {
  saving.value = true;
  try {
    await setMaintenance(form.value);
    toast.success(
      form.value.isMaintenance
        ? 'Texnik ishlar rejimi muvaffaqiyatli yoqildi!'
        : 'Texnik ishlar rejimi o\'chirildi. Sayt barcha uchun ochildi!',
      'Texnik Rejim'
    );
  } catch (err) {
    toast.error('Sozlamalarni saqlashda xatolik yuz berdi');
  } finally {
    saving.value = false;
  }
};

const toggleMaintenanceQuick = async () => {
  form.value.isMaintenance = !form.value.isMaintenance;
  await saveMaintenanceSettings();
};

onMounted(() => {
  loadCurrent();
});
</script>

<style scoped>
.perspective-stage {
  perspective: 700px;
}

.iso-board {
  transform: rotateX(24deg) rotateY(-12deg) rotateZ(3deg);
  transform-style: preserve-3d;
  animation: floatBoard 4s ease-in-out infinite alternate;
}

.grid-bg {
  background-size: 14px 14px;
  background-image: 
    linear-gradient(to right, rgba(16, 185, 129, 0.08) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(16, 185, 129, 0.08) 1px, transparent 1px);
}

.laser-scanner {
  animation: scanLaser 3s ease-in-out infinite;
}

.iso-element-1 {
  transform: translateZ(20px);
  animation: floatLayer1 3s ease-in-out infinite alternate;
}

.iso-element-2 {
  transform: translateZ(30px);
  animation: floatLayer2 3.5s ease-in-out infinite alternate;
}

.iso-element-3 {
  transform: translateZ(20px);
  animation: floatLayer3 3.2s ease-in-out infinite alternate;
}

.iso-scanner {
  transform: translateZ(45px);
  animation: scanMove 4s ease-in-out infinite alternate;
}

@keyframes floatBoard {
  0% {
    transform: rotateX(24deg) rotateY(-12deg) rotateZ(3deg) translateY(0px);
  }
  100% {
    transform: rotateX(21deg) rotateY(-8deg) rotateZ(2deg) translateY(-6px);
  }
}

@keyframes floatLayer1 {
  0% {
    transform: translateZ(15px) translateY(0);
  }
  100% {
    transform: translateZ(25px) translateY(-4px);
  }
}

@keyframes floatLayer2 {
  0% {
    transform: translateZ(30px) translateY(0);
  }
  100% {
    transform: translateZ(42px) translateY(-5px);
  }
}

@keyframes floatLayer3 {
  0% {
    transform: translateZ(20px) translateY(0);
  }
  100% {
    transform: translateZ(32px) translateY(-3px);
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
    transform: translateZ(45px) translate(0, 0);
  }
  50% {
    transform: translateZ(55px) translate(-20px, 15px);
  }
  100% {
    transform: translateZ(50px) translate(-8px, 30px);
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
</style>
