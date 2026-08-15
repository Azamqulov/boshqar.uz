<template>
  <section id="demo" class="py-12 pb-24 relative">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div data-aos="fade-up" class="text-center max-w-3xl mx-auto space-y-3 mb-8">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/25">
          <Zap class="w-3.5 h-3.5" />
          <span>Haqiqiy Tizim Interfeysi</span>
        </div>
        <h2 class="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Ro'yxatdan O'tmasdan Oldin O'zingiz Boshqarib Ko'ring!
        </h2>
        <p class="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
          Quyidagi bo'limlarni tanlang, tovarlarni savatga soling yoki o'z nomingiz bilan to'liq demo hisob oching:
        </p>
      </div>

      <!-- Demo Mode Switcher Tabs (Unified Segmented Control Pill) -->
      <div class="flex justify-center pb-6 px-2">
        <div class="inline-flex p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm max-w-full overflow-x-auto gap-1">
          <button
            type="button"
            @click="activeDemoTab = 'pos'"
            :class="[
              'h-10 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer',
              activeDemoTab === 'pos'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
            ]"
          >
            <ShoppingCart class="w-4 h-4 shrink-0" />
            <span>1. Kassa & Savdo (POS)</span>
          </button>

          <button
            type="button"
            @click="activeDemoTab = 'dashboard'"
            :class="[
              'h-10 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer',
              activeDemoTab === 'dashboard'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
            ]"
          >
            <LayoutDashboard class="w-4 h-4 shrink-0" />
            <span>2. Boshqaruv & Statistika</span>
          </button>

          <button
            type="button"
            @click="activeDemoTab = 'crm'"
            :class="[
              'h-10 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer',
              activeDemoTab === 'crm'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
            ]"
          >
            <Users class="w-4 h-4 shrink-0" />
            <span>3. Nasiya Daftari (CRM)</span>
          </button>

          <button
            type="button"
            @click="activeDemoTab = 'restaurant'"
            :class="[
              'h-10 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer',
              activeDemoTab === 'restaurant'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
            ]"
          >
            <UtensilsCrossed class="w-4 h-4 shrink-0" />
            <span>4. Restoran Stollar & KDS</span>
          </button>
        </div>
      </div>

      <!-- Realistic App Window Container (Dual Theme) with AOS animation -->
      <div
        data-aos="zoom-in-up"
        data-aos-delay="150"
        class="relative rounded-3xl p-2 sm:p-3 bg-white dark:bg-gradient-to-b dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-700/80 shadow-2xl shadow-emerald-500/10 max-w-6xl mx-auto transition-all duration-300 hover:shadow-emerald-500/20"
      >
        <!-- Window Header Bar -->
        <div class="h-11 bg-slate-100 dark:bg-slate-950 px-4 rounded-t-2xl flex items-center justify-between border-b border-slate-200 dark:border-slate-800 text-xs">
          <div class="flex items-center gap-2">
            <div class="flex gap-1.5">
              <span class="w-3 h-3 rounded-full bg-rose-500/80"></span>
              <span class="w-3 h-3 rounded-full bg-amber-500/80"></span>
              <span class="w-3 h-3 rounded-full bg-emerald-500/80"></span>
            </div>
            <span class="ml-2 font-bold text-slate-700 dark:text-slate-400 hidden sm:inline">Boshqar.uz — Jonli Interfeys</span>
          </div>

          <!-- Launch Full Demo Workspace Button -->
          <button
            type="button"
            @click="$emit('openDemo')"
            class="px-3 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500 text-emerald-700 dark:text-emerald-300 hover:text-white text-[11px] font-bold border border-emerald-500/30 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles class="w-3.5 h-3.5" />
            <span>To'liq Demo Hisob Ochish (15 tovar bilan)</span>
          </button>
        </div>

        <!-- DEMO TAB 1: REAL POS INTERFACE (100% Matches Image 1 Exactly) -->
        <div v-if="activeDemoTab === 'pos'" class="p-3 sm:p-4 bg-slate-50 dark:bg-slate-900/90 rounded-b-2xl grid grid-cols-1 lg:grid-cols-12 gap-3 text-left">
          <!-- Left: Catalog & Filter Chips (8 cols) -->
          <div class="lg:col-span-8 space-y-3">
            <!-- Search Bar (POS Top Input) -->
            <div class="relative">
              <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                v-model="demoSearch"
                placeholder="Mahsulot nomi yoki Shtrix-kodni skanerlang (Enter)..."
                class="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-medium shadow-xs"
              />
            </div>

            <!-- Category Chips Bar (POS Filters) -->
            <div class="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
              <button
                type="button"
                @click="activeDemoCategory = 'all'"
                :class="[
                  'px-3.5 py-1.5 rounded-xl font-medium whitespace-nowrap transition cursor-pointer',
                  activeDemoCategory === 'all'
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                ]"
              >
                Barchasi
              </button>
              <button
                type="button"
                @click="activeDemoCategory = 'top'"
                :class="[
                  'px-3.5 py-1.5 rounded-xl font-medium whitespace-nowrap transition cursor-pointer',
                  activeDemoCategory === 'top'
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                ]"
              >
                Top Tovar
              </button>
              <button
                type="button"
                @click="activeDemoCategory = 'drinks'"
                :class="[
                  'px-3.5 py-1.5 rounded-xl font-medium whitespace-nowrap transition cursor-pointer',
                  activeDemoCategory === 'drinks'
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                ]"
              >
                Ichimliklar va Sharbatlar
              </button>
              <button
                type="button"
                @click="activeDemoCategory = 'dairy'"
                :class="[
                  'px-3.5 py-1.5 rounded-xl font-medium whitespace-nowrap transition cursor-pointer',
                  activeDemoCategory === 'dairy'
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                ]"
              >
                Sut va Qatiq Mahsulotlari
              </button>
              <button
                type="button"
                @click="activeDemoCategory = 'bakery'"
                :class="[
                  'px-3.5 py-1.5 rounded-xl font-medium whitespace-nowrap transition cursor-pointer',
                  activeDemoCategory === 'bakery'
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                ]"
              >
                Non va Shirinliklar
              </button>
            </div>

            <!-- Product Cards Grid (4 columns) -->
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              <div
                v-for="prod in filteredDemoProducts"
                :key="prod.id"
                @click="addDemoToCart(prod)"
                class="p-2.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 transition-all cursor-pointer group flex flex-col justify-between shadow-xs"
              >
                <!-- Product Image / Box with Stock badge -->
                <div class="w-full h-24 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center relative mb-2 group-hover:scale-[1.02] transition-transform overflow-hidden">
                  <img
                    v-if="prod.image"
                    :src="prod.image"
                    :alt="prod.name"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <Package v-else class="w-9 h-9 text-slate-400 dark:text-slate-600" />
                  <span class="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-lg bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-mono font-bold shadow-xs">
                    {{ prod.stock }}
                  </span>
                </div>

                <div>
                  <h4 class="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {{ prod.name }}
                  </h4>
                  <p class="text-[10px] text-slate-400 font-mono mt-0.5">{{ prod.code || 'PRD-' + prod.id }}</p>
                </div>

                <div class="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 dark:border-slate-900">
                  <span class="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {{ formatSum(prod.price) }} so'm
                  </span>
                  <button type="button" class="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs group-hover:bg-emerald-600 group-hover:text-white transition">
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Interactive Shopping Cart (4 cols) -->
          <div class="lg:col-span-4 p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3 shadow-xs">
            <div>
              <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2.5">
                <div class="flex items-center gap-2">
                  <ShoppingCart class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span class="font-bold text-xs text-slate-900 dark:text-white">Savat</span>
                  <span class="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                    {{ demoCart.length }}
                  </span>
                </div>
                <button type="button" v-if="demoCart.length > 0" @click="demoCart = []" class="text-[11px] text-rose-500 hover:underline cursor-pointer">
                  Tozalash
                </button>
              </div>

              <!-- Top POS Holding Action Buttons (Matches Image 1) -->
              <div class="grid grid-cols-2 gap-2 my-2.5">
                <button
                  type="button"
                  class="py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px] border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  <Tag class="w-3 h-3 text-amber-500" />
                  <span>Kutishga Qo'yish</span>
                </button>
                <button
                  type="button"
                  class="py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px] border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  <span>Kutishdagilar (0)</span>
                </button>
              </div>

              <!-- Cart Item List -->
              <div class="space-y-1.5 max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-900 pr-1">
                <div v-if="demoCart.length === 0" class="py-8 text-center text-slate-400 text-xs">
                  Savat bo'sh. Chapdagi tovarlarni tanlang!
                </div>
                <div v-for="item in demoCart" :key="item.id" class="py-2 flex items-center justify-between gap-2 text-xs">
                  <div class="min-w-0 flex-1">
                    <p class="font-bold text-slate-900 dark:text-white truncate">{{ item.name }}</p>
                    <p class="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{{ formatSum(item.price) }} so'm</p>
                  </div>

                  <!-- Quantity controls -->
                  <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    <button type="button" @click="changeDemoQty(item, -1)" class="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold px-1 cursor-pointer">-</button>
                    <span class="font-mono font-bold text-slate-900 dark:text-white text-xs px-1">{{ item.qty }}</span>
                    <button type="button" @click="changeDemoQty(item, 1)" class="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold px-1 cursor-pointer">+</button>
                  </div>

                  <span class="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs shrink-0 w-16 text-right">
                    {{ formatSum(item.price * item.qty) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Cart Footer & Checkout -->
            <div class="space-y-2 pt-2.5 border-t border-slate-200 dark:border-slate-800 text-xs">
              <div class="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span>Oraliq summa:</span>
                <span class="font-mono">{{ formatSum(demoCartTotal) }} so'm</span>
              </div>
              <div class="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                <span>Jami to'lov:</span>
                <span class="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">{{ formatSum(demoCartTotal) }} so'm</span>
              </div>

              <button
                type="button"
                :disabled="demoCart.length === 0"
                @click="$emit('openReceipt', { cart: demoCart, total: demoCartTotal })"
                class="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Receipt class="w-4 h-4" />
                <span>To'lovga O'tish</span>
              </button>
            </div>
          </div>
        </div>

        <!-- DEMO TAB 2: REAL DASHBOARD KPI & CHARTS (Matches Image 2 Exactly) -->
        <div v-else-if="activeDemoTab === 'dashboard'" class="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/90 rounded-b-2xl space-y-4 text-left">
          <!-- 6 KPI Stat Cards Row (Pure Lucide Icons, Zero Emojis) -->
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div class="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1 shadow-xs">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Bugungi Savdo</span>
                <div class="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <DollarSign class="w-3.5 h-3.5" />
                </div>
              </div>
              <p class="text-base font-black text-slate-900 dark:text-white font-mono">72 500 so'm</p>
              <p class="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Yopilgan cheklar</p>
            </div>

            <div class="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1 shadow-xs">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Bugungi Xarajat</span>
                <div class="w-6 h-6 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <TrendingDown class="w-3.5 h-3.5" />
                </div>
              </div>
              <p class="text-base font-black text-slate-900 dark:text-white font-mono">0 so'm</p>
              <p class="text-[10px] text-slate-500">Operatsion xarajatlar</p>
            </div>

            <div class="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1 shadow-xs">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Sof Foyda</span>
                <div class="w-6 h-6 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <TrendingUp class="w-3.5 h-3.5" />
                </div>
              </div>
              <p class="text-base font-black text-blue-600 dark:text-blue-400 font-mono">20 000 so'm</p>
              <p class="text-[10px] text-slate-500">Savdo – COGS – Xarajat</p>
            </div>

            <div class="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1 shadow-xs">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Buyurtmalar</span>
                <div class="w-6 h-6 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <ShoppingBag class="w-3.5 h-3.5" />
                </div>
              </div>
              <p class="text-base font-black text-slate-900 dark:text-white font-mono">1 ta</p>
              <p class="text-[10px] text-slate-500">Bugungi kassa tranzaksiya</p>
            </div>

            <div class="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1 shadow-xs">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Ombor Qiymati</span>
                <div class="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Package class="w-3.5 h-3.5" />
                </div>
              </div>
              <p class="text-base font-black text-slate-900 dark:text-white font-mono truncate">44 738 500..</p>
              <p class="text-[10px] text-slate-500">Tannarx bo'yicha qoldiq</p>
            </div>

            <div class="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1 shadow-xs">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Mijozlar Nasiyasi</span>
                <div class="w-6 h-6 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Users class="w-3.5 h-3.5" />
                </div>
              </div>
              <p class="text-base font-black text-slate-900 dark:text-white font-mono">675 000 so'm</p>
              <p class="text-[10px] text-slate-500">Nasiya daftari</p>
            </div>
          </div>

          <!-- Charts & Ranking Section -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <!-- Left Chart Box (8 cols) -->
            <div class="lg:col-span-8 p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-900 pb-3">
                <div>
                  <h4 class="font-bold text-xs text-slate-900 dark:text-white">Savdo va Foyda Dinamikasi</h4>
                  <p class="text-[10px] text-slate-500">Oxirgi 7 kun — ustun ustiga bosib <span class="text-emerald-600 dark:text-emerald-400 font-bold">kunlik taqsimotni</span> ko'ring</p>
                </div>
                <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl text-[10px] font-bold">
                  <button type="button" class="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 text-emerald-600 shadow-xs">7 kun</button>
                  <button type="button" class="px-2 py-0.5 rounded-lg text-slate-500">14 kun</button>
                  <button type="button" class="px-2 py-0.5 rounded-lg text-slate-500">30 kun</button>
                  <button type="button" class="px-2 py-0.5 rounded-lg text-slate-500">3 oy</button>
                </div>
              </div>

              <!-- Mini summary boxes -->
              <div class="grid grid-cols-3 gap-2">
                <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                  <span class="text-[10px] text-slate-400 font-medium">Jami Savdo</span>
                  <p class="text-xs font-bold text-slate-900 dark:text-white font-mono mt-0.5">85 000 so'm</p>
                </div>
                <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                  <span class="text-[10px] text-slate-400 font-medium">Jami Xarajat</span>
                  <p class="text-xs font-bold text-rose-500 font-mono mt-0.5">0 so'm</p>
                </div>
                <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                  <span class="text-[10px] text-slate-400 font-medium">Sof Foyda</span>
                  <p class="text-xs font-bold text-blue-500 font-mono mt-0.5">20 000 so'm</p>
                </div>
              </div>

              <!-- Interactive Chart Mock (Bar graph) -->
              <div class="h-36 pt-4 flex items-end justify-between gap-2 px-2">
                <div
                  v-for="(day, idx) in [
                    { name: '08/02', sales: 40, profit: 25 },
                    { name: '09/02', sales: 65, profit: 38 },
                    { name: '10/02', sales: 30, profit: 18 },
                    { name: '11/02', sales: 90, profit: 55 },
                    { name: '12/02', sales: 50, profit: 30 },
                    { name: '13/02', sales: 110, profit: 70 },
                    { name: 'Bugun', sales: 85, profit: 45 },
                  ]"
                  :key="idx"
                  class="flex-1 flex flex-col items-center gap-1 group/bar cursor-pointer"
                >
                  <div class="w-full max-w-[28px] h-28 bg-slate-100 dark:bg-slate-900 rounded-lg flex items-end justify-center p-0.5 relative">
                    <!-- Tooltip -->
                    <div class="absolute -top-7 px-1.5 py-0.5 rounded bg-slate-900 text-white text-[9px] font-mono opacity-0 group-hover/bar:opacity-100 transition whitespace-nowrap z-20 pointer-events-none">
                      {{ day.sales * 1000 }} so'm
                    </div>
                    <!-- Dual Bars (Sales + Profit) -->
                    <div class="w-full flex items-end gap-0.5 h-full">
                      <div class="w-1/2 bg-emerald-500 rounded-t-sm transition-all duration-500 group-hover/bar:brightness-110" :style="{ height: `${day.sales}%` }"></div>
                      <div class="w-1/2 bg-blue-500 rounded-t-sm transition-all duration-500 group-hover/bar:brightness-110" :style="{ height: `${day.profit}%` }"></div>
                    </div>
                  </div>
                  <span class="text-[9px] font-medium text-slate-400 group-hover/bar:text-emerald-500 transition-colors">{{ day.name }}</span>
                </div>
              </div>
            </div>

            <!-- Right Ranking Box (4 cols) -->
            <div class="lg:col-span-4 p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
              <div class="border-b border-slate-100 dark:border-slate-900 pb-2 flex items-center justify-between">
                <h4 class="font-bold text-xs text-slate-900 dark:text-white">Eng Ko'p Sotilganlar</h4>
                <span class="text-[10px] text-slate-400">Top tovarlar</span>
              </div>

              <div class="space-y-2">
                <div
                  v-for="(item, idx) in [
                    { name: 'Coca-Cola Classic 1.5L', count: '5 ta', sum: '70 000 so\'m' },
                    { name: 'Ariel Avtomat Kir Kukuni', count: '3 ta', sum: '267 000 so\'m' },
                    { name: 'Banan Ekvador (Shirin)', count: '2 kg', sum: '50 000 so\'m' },
                    { name: 'Bio Smetana 20% 400g', count: '2 ta', sum: '32 000 so\'m' },
                  ]"
                  :key="idx"
                  class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div class="flex items-center gap-2 min-w-0">
                    <span class="w-5 h-5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {{ idx + 1 }}
                    </span>
                    <span class="font-bold text-slate-900 dark:text-white truncate text-[11px]">{{ item.name }}</span>
                  </div>
                  <div class="text-right shrink-0">
                    <span class="font-bold text-slate-900 dark:text-white font-mono text-[11px]">{{ item.count }}</span>
                    <p class="text-[9px] text-slate-400 font-mono">{{ item.sum }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- DEMO TAB 3: REAL NASIYA (CRM) -->
        <div v-else-if="activeDemoTab === 'crm'" class="p-6 bg-slate-50 dark:bg-slate-900/90 rounded-b-2xl space-y-4 text-left">
          <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 class="font-bold text-sm text-slate-900 dark:text-white">Nasiya Daftari (Mijozlar Balansi)</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">Har bir mijoz bo'yicha qarz va to'lovlar real vaqtda</p>
            </div>
            <span class="px-3 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold font-mono">
              Jami Nasiya: {{ formatSum(totalDebt) }} so'm
            </span>
          </div>

          <!-- Customers List -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div v-for="cust in demoCustomers" :key="cust.id" class="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
              <div class="flex items-center justify-between">
                <div class="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                  {{ cust.name.charAt(0) }}
                </div>
                <span class="text-[10px] font-mono text-slate-500 dark:text-slate-400">{{ cust.phone }}</span>
              </div>
              <div>
                <h4 class="font-bold text-xs text-slate-900 dark:text-white">{{ cust.name }}</h4>
                <p class="text-sm font-black text-amber-600 dark:text-amber-400 font-mono mt-1">Qarz: {{ formatSum(cust.debt) }} so'm</p>
              </div>
              <button
                type="button"
                @click="payDemoDebt(cust)"
                class="w-full py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 hover:text-white text-emerald-600 dark:text-emerald-400 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Banknote class="w-3.5 h-3.5" />
                <span>Qarz To'lash (50 000 so'm)</span>
              </button>
            </div>
          </div>
        </div>

        <!-- DEMO TAB 4: REAL RESTORAN KDS & STOLLAR (100% Matches WaiterView Real Design) -->
        <div v-else-if="activeDemoTab === 'restaurant'" class="p-4 sm:p-6 bg-slate-50 dark:bg-slate-900/90 rounded-b-2xl space-y-4 text-left">
          <!-- Filter Bar & Status Badges -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div class="flex items-center space-x-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold overflow-x-auto">
              <button
                type="button"
                @click="tableStatusFilter = 'all'"
                class="px-3 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer"
                :class="tableStatusFilter === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
              >
                Barchasi ({{ demoTables.length }})
              </button>
              <button
                type="button"
                @click="tableStatusFilter = 'available'"
                class="px-3 py-1.5 rounded-lg transition flex items-center gap-1 whitespace-nowrap cursor-pointer"
                :class="tableStatusFilter === 'available' ? 'bg-emerald-500 text-white shadow-xs font-bold' : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'"
              >
                <span>Bo'sh ({{ demoTables.filter(t => !t.occupied).length }})</span>
              </button>
              <button
                type="button"
                @click="tableStatusFilter = 'occupied'"
                class="px-3 py-1.5 rounded-lg transition flex items-center gap-1 whitespace-nowrap cursor-pointer"
                :class="tableStatusFilter === 'occupied' ? 'bg-rose-500 text-white shadow-xs font-bold' : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'"
              >
                <span>Band ({{ demoTables.filter(t => t.occupied).length }})</span>
              </button>
            </div>

            <div class="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Stol ustiga bosib holatini <span class="text-emerald-600 dark:text-emerald-400 font-bold">o'zgartirib ko'ring</span>
            </div>
          </div>

          <!-- Table Cards Grid (Exact WaiterView Table Cards) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              v-for="table in filteredDemoTables"
              :key="table.id"
              @click="toggleDemoTable(table)"
              class="p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden min-h-[160px] shadow-xs"
              :class="[
                table.occupied
                  ? 'bg-rose-500/5 dark:bg-rose-950/20 border-rose-500/40 hover:border-rose-500 shadow-sm'
                  : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 shadow-sm'
              ]"
            >
              <!-- Top table header -->
              <div class="flex items-start justify-between gap-1">
                <div>
                  <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Sig'im: {{ table.capacity }} kishi</span>
                  <h3 class="text-base font-black text-slate-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition mt-0.5">
                    {{ table.name }}
                  </h3>
                </div>

                <!-- Status Badge -->
                <span
                  class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                  :class="[
                    table.occupied
                      ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  ]"
                >
                  {{ table.occupied ? 'Band' : 'Bo\'sh' }}
                </span>
              </div>

              <!-- Active Order Info -->
              <div v-if="table.occupied" class="my-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-1">
                <div class="flex items-center justify-between text-[11px]">
                  <span class="text-slate-500 dark:text-slate-400 font-mono font-bold">{{ table.orderNumber }}</span>
                  <span class="font-bold text-amber-600 dark:text-amber-400 font-mono">{{ formatSum(table.orderTotal) }} so'm</span>
                </div>
                <p class="text-[10px] text-slate-500 dark:text-slate-400 truncate">Ofitsiant: {{ table.waiter }}</p>
              </div>

              <div v-else class="text-center py-3 text-slate-400 dark:text-slate-600 text-xs font-medium">
                Buyurtma yo'q
              </div>

              <!-- Bottom Action prompt -->
              <div class="pt-2 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition">
                <span>{{ table.occupied ? 'Buyurtmani ko\'rish' : 'Buyurtma olish' }}</span>
                <ArrowRight class="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import AOS from 'aos';
import {
  Zap,
  ShoppingCart,
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  Sparkles,
  Search,
  Package,
  Receipt,
  Tag,
  DollarSign,
  TrendingDown,
  TrendingUp,
  ShoppingBag,
  Banknote,
  ArrowRight,
} from 'lucide-vue-next';

defineEmits<{
  (e: 'openDemo'): void;
  (e: 'openReceipt', payload: { cart: any[]; total: number }): void;
}>();

const activeDemoTab = ref<'pos' | 'dashboard' | 'crm' | 'restaurant'>('pos');

watch(activeDemoTab, async () => {
  await nextTick();
  AOS.refresh();
});
const activeDemoCategory = ref<'all' | 'top' | 'drinks' | 'dairy' | 'bakery'>('all');
const demoSearch = ref('');

const demoProducts = ref([
  {
    id: '1',
    name: 'Ariel Avtomat Kir Kukuni',
    code: 'PRD-000017',
    price: 89000,
    icon: Package,
    stock: '18 dona',
    category: 'top',
    image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: '2',
    name: 'Ariel Avtomat Kir Yuvish',
    code: 'PRD-ARI-22',
    price: 112000,
    icon: Package,
    stock: '25 dona',
    category: 'top',
    image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: '3',
    name: 'Banan Ekvador (Shirin)',
    code: 'PRD-000014',
    price: 25000,
    icon: Package,
    stock: '75 kg',
    category: 'top',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: '4',
    name: 'Banan Ekvador Premium',
    code: 'PRD-BAN-01',
    price: 24000,
    icon: Package,
    stock: '80 kg',
    category: 'top',
    image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: '5',
    name: 'Bio Smetana 20% 400g',
    code: 'PRD-SMT-02',
    price: 16000,
    icon: Package,
    stock: '25 dona',
    category: 'dairy',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: '6',
    name: 'Coca-Cola 1.5L',
    code: 'PRD-CC-15',
    price: 14000,
    icon: Package,
    stock: '150 dona',
    category: 'drinks',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: '7',
    name: 'Coca-Cola Classic 1.5L',
    code: 'PRD-CCC-15',
    price: 14000,
    icon: Package,
    stock: '115 dona',
    category: 'drinks',
    image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: '8',
    name: 'Colgate Triple Action',
    code: 'PRD-COL-01',
    price: 18000,
    icon: Package,
    stock: '30 dona',
    category: 'top',
    image: 'https://images.unsplash.com/photo-1559591937-e1032a138bcf?w=400&auto=format&fit=crop&q=80',
  },
]);

const filteredDemoProducts = computed(() => {
  let list = demoProducts.value;
  if (activeDemoCategory.value !== 'all') {
    list = list.filter((p) => p.category === activeDemoCategory.value);
  }
  if (!demoSearch.value.trim()) return list;
  const q = demoSearch.value.toLowerCase().trim();
  return list.filter((p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q));
});

const demoCart = ref<any[]>([
  { id: '6', name: 'Coca-Cola 1.5L', price: 14000, qty: 2 },
  { id: '3', name: 'Banan Ekvador (Shirin)', price: 25000, qty: 1 },
]);

const demoCartTotal = computed(() => {
  return demoCart.value.reduce((sum, item) => sum + item.price * item.qty, 0);
});

const addDemoToCart = (prod: any) => {
  const existing = demoCart.value.find((i) => i.id === prod.id);
  if (existing) {
    existing.qty += 1;
  } else {
    demoCart.value.push({ ...prod, qty: 1 });
  }
};

const changeDemoQty = (item: any, delta: number) => {
  item.qty += delta;
  if (item.qty <= 0) {
    demoCart.value = demoCart.value.filter((i) => i.id !== item.id);
  }
};

// CRM Demo
const demoCustomers = ref([
  { id: '1', name: 'Olim aka (Doimiy xaridor)', phone: '+998 90 123-45-67', debt: 340000 },
  { id: '2', name: 'Jamshid (Qo\'shni mahalla)', phone: '+998 93 987-65-43', debt: 150000 },
  { id: '3', name: 'Sarvar Qurilish Mollari', phone: '+998 97 555-44-33', debt: 1190000 },
]);

const totalDebt = computed(() => {
  return demoCustomers.value.reduce((sum, c) => sum + c.debt, 0);
});

const payDemoDebt = (cust: any) => {
  cust.debt = Math.max(0, cust.debt - 50000);
};

// Restaurant Demo (Matches Real WaiterView Data)
const tableStatusFilter = ref<'all' | 'available' | 'occupied'>('all');

const demoTables = ref([
  {
    id: '1',
    name: '1-Stol (Zal)',
    capacity: 4,
    occupied: true,
    orderNumber: '#ORD-104',
    orderTotal: 140000,
    waiter: 'Davronbek (Ofitsiant)',
  },
  {
    id: '2',
    name: '2-Stol (Zal)',
    capacity: 4,
    occupied: false,
    orderNumber: '',
    orderTotal: 0,
    waiter: '',
  },
  {
    id: '3',
    name: '3-Stol (Terassa)',
    capacity: 6,
    occupied: true,
    orderNumber: '#ORD-108',
    orderTotal: 265000,
    waiter: 'Sardor (Ofitsiant)',
  },
  {
    id: '4',
    name: 'VIP Xona',
    capacity: 10,
    occupied: false,
    orderNumber: '',
    orderTotal: 0,
    waiter: '',
  },
]);

const toggleDemoTable = (table: any) => {
  table.occupied = !table.occupied;
  if (table.occupied) {
    table.orderNumber = '#ORD-' + Math.floor(100 + Math.random() * 900);
    table.orderTotal = 145000;
    table.waiter = 'Ofitsiant';
  } else {
    table.orderNumber = '';
    table.orderTotal = 0;
    table.waiter = '';
  }
};

const filteredDemoTables = computed(() => {
  if (tableStatusFilter.value === 'available') return demoTables.value.filter((t) => !t.occupied);
  if (tableStatusFilter.value === 'occupied') return demoTables.value.filter((t) => t.occupied);
  return demoTables.value;
});

const formatSum = (val: number) => {
  return new Intl.NumberFormat('uz-UZ').format(val || 0);
};
</script>
