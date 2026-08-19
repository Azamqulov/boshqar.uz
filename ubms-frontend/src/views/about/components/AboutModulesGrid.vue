<template>
  <div class="space-y-3">
    <h2 class="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
      <Layers class="w-4.5 h-4.5 text-emerald-500" />
      <span>Tizimning Asosiy Modullari</span>
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="mod in modulesList"
        :key="mod.title"
        class="glass-card rounded-2xl p-5 hover:shadow-md hover:border-emerald-500/40 transition flex flex-col justify-between space-y-3"
      >
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div :class="['w-10 h-10 rounded-xl flex items-center justify-center font-bold', mod.iconBg]">
              <component :is="mod.icon" :class="['w-5 h-5', mod.iconColor]" />
            </div>
            <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {{ mod.tag }}
            </span>
          </div>

          <div>
            <h3 class="font-extrabold text-sm text-slate-900 dark:text-white">{{ mod.title }}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{{ mod.desc }}</p>
          </div>
        </div>

        <router-link
          :to="mod.route"
          class="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline pt-2 border-t border-slate-100 dark:border-slate-800"
        >
          <span>Bo‘limga o‘tish</span>
          <ArrowRight class="w-3.5 h-3.5" />
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Layers,
  ArrowRight,
  ShoppingCart,
  Package,
  Store,
  Users,
  DollarSign,
  UtensilsCrossed,
} from 'lucide-vue-next';

const modulesList = [
  {
    title: 'Kassa (POS)',
    tag: 'Tezkor Sotuv',
    desc: 'Naqd, karta, o‘tkazma, nasiya to‘lovlari, chek chiqarish va smena boshqaruvi.',
    icon: ShoppingCart,
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/50',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    route: '/pos',
  },
  {
    title: 'Mahsulotlar & Narxlar',
    tag: 'Katalog',
    desc: 'Shtrix-kod, toifalar, ulgurji va chakana narxlar, qoldiqlar monitoringi.',
    icon: Package,
    iconBg: 'bg-blue-50 dark:bg-blue-950/50',
    iconColor: 'text-blue-600 dark:text-blue-400',
    route: '/products',
  },
  {
    title: 'Omborxona & Kirim',
    tag: 'Ombor',
    desc: 'Yetkazib beruvchilardan kirim qilish, qoldiqlar harakati va inventarizatsiya.',
    icon: Store,
    iconBg: 'bg-amber-50 dark:bg-amber-950/50',
    iconColor: 'text-amber-600 dark:text-amber-500',
    route: '/inventory',
  },
  {
    title: 'Restoran & Ofitsiant',
    tag: 'HORECA',
    desc: 'Stollar xaritasi, ofitsiant menyusi, oshxona (KDS) va buyurtma cheklari.',
    icon: UtensilsCrossed,
    iconBg: 'bg-orange-50 dark:bg-orange-950/50',
    iconColor: 'text-orange-600 dark:text-orange-400',
    route: '/restaurant/tables',
  },
  {
    title: 'Mijozlar & Nasiya (CRM)',
    tag: 'Mijozlar',
    desc: 'Mijozlar bazasi, qarzlar daftari, to‘lovlar tarixi va chegirmalar.',
    icon: Users,
    iconBg: 'bg-purple-50 dark:bg-purple-950/50',
    iconColor: 'text-purple-600 dark:text-purple-400',
    route: '/customers',
  },
  {
    title: 'Moliya & Xarajatlar',
    tag: 'Hisobot',
    desc: 'Sof foyda, tannarx (COGS), xarajatlar tahlili va to‘liq moliyaviy hisobotlar.',
    icon: DollarSign,
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/50',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    route: '/finance',
  },
];
</script>
