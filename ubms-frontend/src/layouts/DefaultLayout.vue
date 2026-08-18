<template>
  <!-- 1. WORKER FULL-SCREEN NAVBAR LAYOUT (Kassir, Sotuvchi, Ofitsiant, Oshpaz, Omborchi va h.k.) -->
  <div v-if="isWorker"
    class="flex flex-col h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-200">
    <!-- Top Full-Width Navbar -->
    <header
      class="h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 flex items-center justify-between z-30 flex-shrink-0 shadow-sm dark:shadow-lg">
      <!-- Left: Logo -->
      <AppLogo size="md" />

      <!-- Center: Allowed Module Tabs (Horizontal Navigation) -->
      <nav class="hidden md:flex items-center space-x-1.5 overflow-x-auto px-2">
        <router-link v-for="item in visibleNavItems" :key="item.name" :to="item.to"
          class="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap btn-interactive"
          :class="[
            $route.path === item.to || $route.path.startsWith(item.to + '/')
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 ring-2 ring-emerald-500/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80'
          ]">
          <component :is="item.icon" class="w-4 h-4" />
          <span>{{ item.label }}</span>
        </router-link>
      </nav>

      <!-- Right: Quick POS shortcut, Theme Toggle, User Badge & Logout -->
      <div class="flex items-center space-x-2.5 sm:space-x-3">
        <!-- Quick Kassa button if not already active -->
        <router-link to="/pos"
          class="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold transition btn-interactive"
          :class="{ 'ring-2 ring-emerald-500': $route.path === '/pos' }">
          <ShoppingCart class="w-3.5 h-3.5" />
          <span class="hidden sm:inline">Kassa (POS)</span>
        </router-link>

        <!-- Theme Toggle -->
        <ThemeToggle />

        <!-- Quick Guide button for workers -->
        <router-link to="/guide"
          class="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
          title="Qo'llanma & AI">
          <BookOpen class="w-4 h-4" />
        </router-link>

        <div class="hidden sm:block text-right text-xs">
          <p class="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">{{ authStore.user?.fullName }}
          </p>
          <p class="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase">{{
            authStore.activeBusiness?.role || 'Xodim / Sotuvchi' }}</p>
        </div>

        <button @click="handleLogout" title="Tizimdan chiqish"
          class="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-500/15 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-500/20 dark:hover:text-rose-400 text-slate-600 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 transition btn-interactive">
          <LogOut class="w-4 h-4" />
          <span class="hidden sm:inline">Chiqish</span>
        </button>
      </div>
    </header>

    <!-- Mobile Sub-Navbar for Worker -->
    <div
      class="md:hidden flex items-center space-x-1 px-3 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
      <router-link v-for="item in visibleNavItems" :key="item.name" :to="item.to"
        class="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition"
        :class="[
          $route.path === item.to || $route.path.startsWith(item.to + '/')
            ? 'bg-emerald-500 text-white'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
        ]">
        <component :is="item.icon" class="w-3.5 h-3.5" />
        <span>{{ item.label }}</span>
      </router-link>
    </div>

    <!-- Main Full-Width Content Area -->
    <main class="flex-1 overflow-y-auto p-3 sm:p-5 bg-slate-100/70 dark:bg-slate-950 relative z-50">
      <!-- Full Screen Subscription Expired Blocking Guard Overlay for Workers -->
      <div
        v-if="isSubscriptionExpired && !authStore.user?.isSuperAdmin"
        class="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
      >
        <div class="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-rose-500/30 shadow-2xl text-center space-y-5">
          <div class="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mx-auto">
            <AlertTriangle class="w-8 h-8 animate-bounce" />
          </div>

          <div class="space-y-2">
            <h3 class="text-xl font-black text-slate-900 dark:text-white">
              Korxona Obunasi Yakunlandi
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Hurmatli xodim, siz ishlayotgan <strong class="text-slate-800 dark:text-slate-200">{{ authStore.activeBusiness?.name }}</strong> korxonasining dastur obuna muddati tugagan. Iltimos, do'kon rahbari bilan bog'laning.
            </p>
          </div>

          <div class="pt-2">
            <button
              @click="handleLogout"
              class="w-full py-3 px-4 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition"
            >
              Hisobdan Chiqish
            </button>
          </div>
        </div>
      </div>

      <router-view />
    </main>
  </div>

  <!-- 2. OWNER / ADMIN / SUPERADMIN SIDEBAR LAYOUT -->
  <div v-else
    class="flex flex-col h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-200">
    <div class="flex-1 flex overflow-hidden relative">
      <!-- Mobile Backdrop for Sidebar -->
      <div
        v-if="isMobileSidebarOpen"
        class="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
        @click="isMobileSidebarOpen = false"
      />

      <!-- Sidebar (Collapsible on desktop, fixed drawer on mobile) -->
      <aside
        class="bg-white/95 dark:bg-slate-900/95 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 z-50 md:z-20 shrink-0 fixed md:relative inset-y-0 left-0"
        :class="[
          isSidebarCollapsed ? 'md:w-20' : 'md:w-64',
          isMobileSidebarOpen ? 'w-72 translate-x-0 shadow-2xl' : 'w-72 -translate-x-full md:translate-x-0 md:w-auto'
        ]">
        <!-- Logo Header (Start-aligned wide logo with sidebar toggle button) -->
        <div
          class="h-16 flex items-center border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 overflow-hidden"
          :class="isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-3.5'">
          <!-- Expanded view: Logo aligned to start -->
          <div v-if="!isSidebarCollapsed || isMobileSidebarOpen" class="flex items-center gap-2 overflow-hidden min-w-0">
            <AppLogo size="lg" />
          </div>

          <!-- Mobile Close Button -->
          <button
            @click="isMobileSidebarOpen = false"
            class="md:hidden p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
          >
            <X class="w-5 h-5" />
          </button>

          <!-- Sidebar Collapse / Expand Toggle Button -->
          <button
            @click="isSidebarCollapsed = !isSidebarCollapsed"
            class="hidden md:flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
            :class="isSidebarCollapsed ? 'w-10 h-10' : 'ml-1'"
            :title="isSidebarCollapsed ? 'Sidebarni kengaytirish' : 'Sidebarni yopish'">
            <PanelLeftClose v-if="!isSidebarCollapsed" class="w-5 h-5" />
            <PanelLeftOpen v-else class="w-5 h-5 text-emerald-500" />
          </button>
        </div>

        <!-- Navigation Links (Grouped Sections) -->
        <nav class="flex-1 px-3 py-3 space-y-3 overflow-y-auto">
          <div v-for="(group, gIdx) in visibleNavGroups" :key="gIdx" class="space-y-0.5">
            <!-- Section Header -->
            <div
              v-if="group.title && (!isSidebarCollapsed || isMobileSidebarOpen)"
              class="px-3.5 pt-2.5 pb-1 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider select-none"
            >
              {{ group.title }}
            </div>
            <div
              v-else-if="group.title && isSidebarCollapsed && !isMobileSidebarOpen"
              class="my-1.5 border-t border-slate-200 dark:border-slate-800 mx-2"
            ></div>

            <!-- Group Items -->
            <div v-for="item in group.items" :key="item.name" class="space-y-1">
              <router-link
                :to="item.to"
                @click="isMobileSidebarOpen = false"
                class="flex items-center rounded-xl text-sm font-medium transition-all group btn-interactive"
                :class="[
                  isSidebarCollapsed && !isMobileSidebarOpen ? 'justify-center px-0 py-2.5' : 'px-3.5 py-2',
                  isItemActive(item)
                    ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-500/30 shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                ]"
                :title="isSidebarCollapsed && !isMobileSidebarOpen ? item.label : ''"
              >
                <div class="relative shrink-0 flex items-center">
                  <component
                    :is="item.icon"
                    class="w-5 h-5 transition-colors shrink-0"
                    :class="[
                      isSidebarCollapsed && !isMobileSidebarOpen ? 'mr-0' : 'mr-3',
                      isItemActive(item)
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                    ]"
                  />
                  <!-- Collapsed mode dot indicator: Red if out of stock, Amber if low stock -->
                  <span
                    v-if="item.name === 'inventory' && (outOfStockCount > 0 || lowStockCount > 0) && isSidebarCollapsed && !isMobileSidebarOpen"
                    class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 animate-ping"
                    :class="outOfStockCount > 0 ? 'bg-rose-500' : 'bg-amber-500'"
                  />
                  <span
                    v-if="item.name === 'inventory' && (outOfStockCount > 0 || lowStockCount > 0) && isSidebarCollapsed && !isMobileSidebarOpen"
                    class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-900"
                    :class="outOfStockCount > 0 ? 'bg-rose-500' : 'bg-amber-500'"
                  />

                  <!-- Collapsed mode dot indicator for billing (red if expired, amber if 1-3 days left) -->
                  <span
                    v-if="item.name === 'billing' && (isSubscriptionExpired || isSubscriptionExpiringSoon) && isSidebarCollapsed && !isMobileSidebarOpen"
                    class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 animate-ping"
                    :class="isSubscriptionExpired ? 'bg-rose-500' : 'bg-amber-500'"
                  />
                  <span
                    v-if="item.name === 'billing' && (isSubscriptionExpired || isSubscriptionExpiringSoon) && isSidebarCollapsed && !isMobileSidebarOpen"
                    class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-900"
                    :class="isSubscriptionExpired ? 'bg-rose-500' : 'bg-amber-500'"
                  />
                </div>

                <span v-if="!isSidebarCollapsed || isMobileSidebarOpen" class="truncate text-xs font-semibold">{{ item.label }}</span>

                <!-- 1. Out of stock (Tugagan) -> RED exact circle badge -->
                <span
                  v-if="(!isSidebarCollapsed || isMobileSidebarOpen) && item.name === 'inventory' && outOfStockCount > 0"
                  class="ml-auto w-6 h-6 rounded-full shrink-0 inline-flex items-center justify-center text-[10px] font-black bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse shadow-2xs"
                  :title="`Omborda ${outOfStockCount} ta mahsulot butunlay tugagan!`"
                >
                  {{ outOfStockCount }}
                </span>

                <!-- 2. Low stock (Kam qolgan) -> AMBER exact circle badge -->
                <span
                  v-else-if="(!isSidebarCollapsed || isMobileSidebarOpen) && item.name === 'inventory' && lowStockCount > 0"
                  class="ml-auto w-6 h-6 rounded-full shrink-0 inline-flex items-center justify-center text-[10px] font-black bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse shadow-2xs"
                  :title="`Omborda ${lowStockCount} ta mahsulot kam qolgan!`"
                >
                  {{ lowStockCount }}
                </span>

                <!-- 3. Billing Expiry Exclamation Badge (!) -> EXACT MATCHING CIRCLE -->
                <span
                  v-else-if="(!isSidebarCollapsed || isMobileSidebarOpen) && item.name === 'billing' && (isSubscriptionExpiringSoon || isSubscriptionExpired)"
                  class="ml-auto w-6 h-6 rounded-full shrink-0 inline-flex items-center justify-center text-xs font-black shadow-2xs animate-pulse"
                  :class="isSubscriptionExpired
                    ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'"
                  :title="isSubscriptionExpired ? 'Obunangiz muddati tugagan!' : 'Obunangiz tugashiga 1 kun qoldi!'"
                >
                  !
                </span>

                <!-- 4. Standard badge (AI on Qo'llanma) -> GREEN exact circle badge -->
                <span
                  v-else-if="(!isSidebarCollapsed || isMobileSidebarOpen) && item.badge"
                  class="ml-auto w-6 h-6 rounded-full shrink-0 inline-flex items-center justify-center text-[10px] font-black bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-2xs"
                >
                  {{ item.badge }}
                </span>
              </router-link>
            </div>
          </div>
        </nav>

        <!-- Bottom User Profile & Logout -->
        <div class="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/60">
          <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400"
            :class="isSidebarCollapsed && !isMobileSidebarOpen ? 'justify-center px-0' : 'px-1.5'">
            <div v-if="!isSidebarCollapsed || isMobileSidebarOpen" class="truncate flex-1 min-w-0 mr-2">
              <p class="font-bold text-slate-800 dark:text-slate-200 truncate">{{ authStore.user?.fullName }}</p>
              <p class="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider">{{
                authStore.activeBusiness?.role ||
                'Owner' }}</p>
            </div>
            <button @click="handleLogout" title="Tizimdan chiqish"
              class="transition flex items-center justify-center btn-interactive"
              :class="[
                isSidebarCollapsed && !isMobileSidebarOpen
                  ? 'w-10 h-10 mx-auto rounded-xl bg-slate-100 hover:bg-rose-500/15 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 shadow-sm'
                  : 'p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 dark:hover:bg-rose-500/20'
              ]">
              <LogOut class="w-4 h-4 shrink-0" />
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- DEMO WORKSPACE WATERMARK BANNER (CLICKABLE DIRECTLY TO REGISTER) -->
        <div
          v-if="authStore.isDemo"
          @click="goToRegister"
          class="bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-900 text-white px-4 py-2 text-xs font-bold flex items-center justify-between gap-3 shadow-md shrink-0 z-20 hover:brightness-105 transition group cursor-pointer"
        >
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shrink-0">Demo Rejim</span>
            <span class="truncate">
              Tizimni haqiqiy biznesingizda ishlatish, Telegram AI Bot va barcha PRO imkoniyatlarni ochish uchun ro'yxatdan o'ting.
            </span>
          </div>
          <div class="shrink-0 flex items-center gap-1.5 px-3.5 py-1 rounded-xl bg-white text-emerald-800 group-hover:bg-emerald-50 text-[11px] font-black shadow-sm transition">
            <Sparkles class="w-3.5 h-3.5 text-amber-500" />
            <span>14 Kun Bepul Boshlash →</span>
          </div>
        </div>

        <!-- Top Header -->
        <header
          class="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-3.5 sm:px-6 z-10 shrink-0">
          <div class="flex items-center space-x-2.5 sm:space-x-3">
            <button @click="isMobileSidebarOpen = !isMobileSidebarOpen"
              class="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Menyuni ochish">
              <Menu class="w-5 h-5" />
            </button>

            <!-- Quick Toggle button in topbar if collapsed -->
            <button v-if="isSidebarCollapsed" @click="isSidebarCollapsed = false"
              class="hidden md:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              title="Sidebarni ochish">
              <PanelLeftOpen class="w-4 h-4 text-emerald-500" />
              <span>Kengaytirish</span>
            </button>

            <!-- Branch badge -->
            <div
              class="flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs truncate">
              <Store class="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
              <span class="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[120px] sm:max-w-[200px]">{{ authStore.activeBusiness?.name }}</span>
              <span class="hidden sm:inline text-slate-400 dark:text-slate-500">•</span>
              <span class="hidden sm:inline text-emerald-600 dark:text-emerald-400 font-semibold uppercase">{{
                authStore.activeBusiness?.businessType }}</span>
            </div>

            <!-- Currency Rate Ticker Badge (Auto CBU vs Custom Manual) -->
            <router-link
              v-if="posSettings.showCurrencyTicker !== false"
              to="/settings?tab=profile"
              class="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition shadow-2xs group cursor-pointer"
              :class="currencyStore.rateMode === 'custom'
                ? 'bg-gradient-to-r from-amber-500/15 via-orange-500/5 to-transparent border-amber-500/30 text-amber-900 dark:text-amber-200 hover:border-amber-500/60'
                : 'bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-500/20 text-slate-700 dark:text-slate-300 hover:border-emerald-500/40'"
              :title="currencyStore.rateMode === 'custom'
                ? 'Maxsus (qo\'lda kiritilgan) kurs faol. O\'zgartirish uchun bosing.'
                : `Markaziy Bank (CBU) kursi faol. Sana: ${currencyStore.rates.USD?.date || 'Bugun'}`"
            >
              <span class="flex h-2 w-2 relative">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" :class="currencyStore.rateMode === 'custom' ? 'bg-amber-400' : 'bg-emerald-400'"></span>
                <span class="relative inline-flex rounded-full h-2 w-2" :class="currencyStore.rateMode === 'custom' ? 'bg-amber-500' : 'bg-emerald-500'"></span>
              </span>
              <span class="text-[11px] font-black" :class="currencyStore.rateMode === 'custom' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'">
                {{ currencyStore.rateMode === 'custom' ? 'Maxsus:' : 'CBU:' }}
              </span>
              <span class="text-[11px] text-slate-800 dark:text-slate-200">$1={{ currencyStore.usdRate.toLocaleString('uz-UZ') }}</span>
              <span class="text-slate-400">|</span>
              <span class="text-[11px] text-slate-800 dark:text-slate-200">₽1={{ currencyStore.rubRate.toLocaleString('uz-UZ') }}</span>
            </router-link>
          </div>

          <!-- Right Header Actions: POS, Theme Toggle, Settings -->
          <div class="flex items-center space-x-2 sm:space-x-3">
            <router-link to="/pos"
              class="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition btn-interactive">
              <Zap class="w-3.5 h-3.5" />
              <span>Tezkor Sotuv</span>
            </router-link>

            <!-- Theme Toggle Switcher -->
            <ThemeToggle />

            <!-- Guide & AI Center shortcut -->
            <router-link to="/guide"
              class="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
              :class="{ 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40': $route.path === '/guide' }"
              title="Qo'llanma & Boshqar AI">
              <BookOpen class="w-5 h-5" />
            </router-link>

            <router-link to="/settings"
              class="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Sozlamalar">
              <Settings class="w-5 h-5" />
            </router-link>
          </div>
        </header>

        <!-- Main Router View -->
        <main class="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 bg-slate-100/70 dark:bg-slate-950 pb-20 md:pb-6 relative">
          <!-- Full Screen Subscription Expired Blocking Guard Overlay -->
          <div
            v-if="isSubscriptionExpired && !authStore.user?.isSuperAdmin && $route.path !== '/billing' && $route.path !== '/guide'"
            class="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div class="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-rose-500/30 shadow-2xl text-center space-y-5 animate-in zoom-in-95 duration-200">
              <div class="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mx-auto shadow-inner">
                <AlertTriangle class="w-8 h-8 animate-bounce" />
              </div>

              <div class="space-y-2">
                <h3 class="text-xl font-black text-slate-900 dark:text-white">
                  Obuna Muddati Yakunlandi
                </h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Hurmatli tadbirkor, sizning <strong class="text-slate-800 dark:text-slate-200">{{ authStore.activeBusiness?.name }}</strong> korxonangiz uchun <strong class="text-emerald-500">Boshqar.uz</strong> obuna muddati tugadi. Ma'lumotlaringiz xavfsiz saqlanmoqda. Tizimdan to'liq foydalanishni davom ettirish uchun tarifni faollashtiring.
                </p>
              </div>

              <div class="space-y-2.5 pt-2">
                <router-link
                  to="/billing"
                  class="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2"
                >
                  <CreditCard class="w-4 h-4" />
                  <span>Obunani Faollashtirish (Tariflar)</span>
                  <ArrowRight class="w-4 h-4" />
                </router-link>

                <a
                  href="https://t.me/Boshqar_uzbot"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700"
                >
                  <span>Menejer bilan bog'lanish (Telegram)</span>
                </a>
              </div>
            </div>
          </div>

          <router-view />
        </main>
      </div>
    </div>

    <!-- Mobile Bottom Navigation Bar -->
    <nav class="md:hidden flex items-center justify-around bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 z-30 shrink-0">
      <router-link to="/pos" class="flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-bold transition" :class="$route.path === '/pos' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' : 'text-slate-500 dark:text-slate-400'">
        <ShoppingCart class="w-4 h-4 mb-0.5" />
        <span>Kassa</span>
      </router-link>
      <router-link to="/dashboard" class="flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-bold transition" :class="$route.path === '/dashboard' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' : 'text-slate-500 dark:text-slate-400'">
        <LayoutDashboard class="w-4 h-4 mb-0.5" />
        <span>Asosiy</span>
      </router-link>
      <router-link to="/products" class="flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-bold transition" :class="$route.path.startsWith('/products') ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' : 'text-slate-500 dark:text-slate-400'">
        <Package class="w-4 h-4 mb-0.5" />
        <span>Tovarlar</span>
      </router-link>
      <router-link to="/finance" class="flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-bold transition" :class="$route.path === '/finance' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' : 'text-slate-500 dark:text-slate-400'">
        <DollarSign class="w-4 h-4 mb-0.5" />
        <span>Moliya</span>
      </router-link>
      <button @click="isMobileSidebarOpen = true" class="flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-bold text-slate-500 dark:text-slate-400 transition hover:text-slate-900 dark:hover:text-white">
        <Menu class="w-4 h-4 mb-0.5" />
        <span>Menyu</span>
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';
import { useDataStore } from '../stores/data.store';
import { useCurrencyStore } from '../stores/currency.store';
import ThemeToggle from '../components/ThemeToggle.vue';
import AppLogo from '../components/AppLogo.vue';
import { useLanguage } from '../composables/useLanguage';
import { usePosSettings } from '../composables/usePosSettings';
import api from '../services/api';

const langStore = useLanguage();
const currencyStore = useCurrencyStore();
const { posSettings } = usePosSettings();
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  FolderTree,
  Boxes,
  Users,
  Truck,
  DollarSign,
  UtensilsCrossed,
  Flame,
  Scissors,
  Calendar,
  Settings,
  ShieldCheck,
  LogOut,
  Menu,
  Store,
  Building2,
  Zap,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  Crown,
  CreditCard,
  Sliders,
  X,
  BookOpen,
  Sparkles,
  AlertTriangle,
  AlertCircle,
  ArrowRight,
} from 'lucide-vue-next';

const authStore = useAuthStore();
const dataStore = useDataStore();
const router = useRouter();
const route = useRoute();
const isMobileSidebarOpen = ref(false);
const isSidebarCollapsed = ref(false);

const goToRegister = () => {
  localStorage.removeItem('ubms_access_token');
  localStorage.removeItem('ubms_refresh_token');
  localStorage.removeItem('ubms_user');
  localStorage.removeItem('ubms_businesses');
  localStorage.removeItem('ubms_active_business');
  authStore.token = null;
  authStore.user = null;
  authStore.activeBusiness = null;
  router.push('/auth/register');
};

watch(() => route.path, () => {
  isMobileSidebarOpen.value = false;
});

const businessType = computed(() => authStore.businessType);

// Determine if logged-in user is a worker or owner
const isWorker = computed(() => {
  const role = (authStore.activeBusiness?.role || '').toLowerCase();
  const isSuper = authStore.user?.isSuperAdmin;
  if (isSuper) return false;
  return role !== 'owner' && role !== 'admin';
});

// Compute out of stock items count (quantity <= 0) -> RED
const outOfStockCount = computed(() => {
  const prods = dataStore.products || [];
  return prods.filter((p: any) => {
    if (p.brand === 'service' || p.brand === 'dish' || p.brand === 'kitchen' || p.isMadeToOrder) {
      return false;
    }
    const qty = Number(p.stockQty ?? 0);
    return qty <= 0;
  }).length;
});

// Compute low stock items count (0 < quantity <= minStock) -> AMBER
const lowStockCount = computed(() => {
  const prods = dataStore.products || [];
  return prods.filter((p: any) => {
    if (p.brand === 'service' || p.brand === 'dish' || p.brand === 'kitchen' || p.isMadeToOrder) {
      return false;
    }
    const qty = Number(p.stockQty ?? 0);
    const min = Number(p.minStock ?? 5);
    return qty > 0 && qty <= min;
  }).length;
});

// Subscription Expiration Tracking for Sidebar & Header Reminder
const billingSubscription = ref<any>(null);

const fetchBillingStatus = async () => {
  if (!authStore.isAuthenticated) return;
  try {
    const cached = localStorage.getItem('ubms_cache_billing_status');
    if (cached) {
      const parsed = JSON.parse(cached);
      billingSubscription.value = parsed.subscription;
    }
  } catch (e) {}

  try {
    const { data } = await api.get('/billing/status');
    if (data?.subscription) {
      billingSubscription.value = data.subscription;
      localStorage.setItem('ubms_cache_billing_status', JSON.stringify(data));
    }
  } catch (err) {
    // silently fail
  }
};

const subscriptionDaysLeft = computed(() => {
  if (!billingSubscription.value) return null;
  if (billingSubscription.value.planName === 'Free') return null;
  return typeof billingSubscription.value.daysLeft === 'number' ? billingSubscription.value.daysLeft : null;
});

const isSubscriptionExpiringSoon = computed(() => {
  if (subscriptionDaysLeft.value === null) return false;
  return subscriptionDaysLeft.value <= 1;
});

const isSubscriptionExpired = computed(() => {
  if (!billingSubscription.value) return false;
  if (billingSubscription.value.planName === 'Free') return false;
  return billingSubscription.value.isExpired || (subscriptionDaysLeft.value !== null && subscriptionDaysLeft.value <= 0);
});

watch(() => authStore.activeBusiness?.id, () => {
  fetchBillingStatus();
});

onMounted(() => {
  if (authStore.isAuthenticated) {
    dataStore.fetchProducts();
    fetchBillingStatus();
  }
});

interface NavSubItem {
  name: string;
  label: string;
  to: string;
  icon: any;
  tab?: string;
}

interface NavItem {
  name: string;
  label: string;
  to: string;
  icon: any;
  types: string[];
  badge?: string;
  children?: NavSubItem[];
}

interface NavGroup {
  id: string;
  title?: string;
  items: NavItem[];
}

const allNavGroups: NavGroup[] = [
  {
    id: 'main',
    items: [
      { name: 'dashboard', label: 'Boshqaruv Paneli', to: '/dashboard', icon: LayoutDashboard, types: ['all'] },
      { name: 'pos', label: 'Kassa (POS)', to: '/pos', icon: ShoppingCart, types: ['all'] },
    ],
  },
  {
    id: 'ombor',
    title: 'OMBOR',
    items: [
      { name: 'products', label: 'Mahsulotlar', to: '/products', icon: Package, types: ['all'] },
      { name: 'categories', label: 'Kategoriyalar', to: '/categories', icon: FolderTree, types: ['all'] },
      { name: 'inventory', label: 'Omborxona', to: '/inventory', icon: Boxes, types: ['all'] },
      { name: 'suppliers', label: 'Ta\'minotchilar', to: '/suppliers', icon: Truck, types: ['all'] },
    ],
  },
  {
    id: 'restaurant',
    title: 'RESTORAN',
    items: [
      { name: 'tables', label: 'Stollar xaritasi', to: '/restaurant/tables', icon: UtensilsCrossed, types: ['restaurant', 'cafe'] },
      { name: 'kds', label: 'Oshxona (KDS)', to: '/restaurant/kds', icon: Flame, types: ['restaurant', 'cafe'] },
    ],
  },
  {
    id: 'service',
    title: 'XIZMATLAR',
    items: [
      { name: 'appointments', label: 'Bandlovlar', to: '/appointments', icon: Calendar, types: ['barbershop', 'service'] },
      { name: 'services', label: 'Xizmatlar', to: '/appointments/services', icon: Scissors, types: ['barbershop', 'service'] },
    ],
  },
  {
    id: 'crm',
    title: 'MIJOZLAR',
    items: [
      { name: 'customers', label: 'Mijozlar (CRM)', to: '/customers', icon: Users, types: ['all'] },
    ],
  },
  {
    id: 'hisob',
    title: 'HISOB',
    items: [
      { name: 'finance', label: 'Moliya & Hisobot', to: '/finance', icon: DollarSign, types: ['all'] },
    ],
  },
  {
    id: 'sozlamalar',
    title: 'SOZLAMALAR',
    items: [
      { name: 'billing', label: 'Obuna & Tariflar', to: '/billing', icon: CreditCard, types: ['all'] },
      { name: 'guide', label: 'Qo\'llanma & AI', to: '/guide', icon: BookOpen, types: ['all'], badge: 'AI' },
      { name: 'settings', label: 'Sozlamalar', to: '/settings', icon: Settings, types: ['all'] },
      { name: 'superadmin', label: 'SuperAdmin', to: '/superadmin', icon: ShieldCheck, types: ['superadmin'] },
    ],
  },
];

const visibleNavGroups = computed(() => {
  const currentType = businessType.value;
  const isSuper = authStore.user?.isSuperAdmin;
  const userRole = (authStore.activeBusiness?.role || '').toLowerCase();
  const allowed = authStore.activeBusiness?.allowedModules || [];

  const filterItem = (item: NavItem) => {
    if (item.types.includes('superadmin')) return isSuper;
    const typeMatch = item.types.includes('all') || item.types.includes(currentType);
    if (!typeMatch) return false;

    // 1. If SuperAdmin or Owner/Admin
    if (isSuper || userRole === 'owner' || userRole === 'admin' || allowed.includes('all')) {
      return true;
    }

    // 2. Universal items accessible to ALL users (Guide & AI)
    if (item.name === 'guide' || item.to === '/guide') {
      return true;
    }

    // 3. If Worker
    if (item.name === 'pos') {
      return (
        allowed.includes('pos') ||
        allowed.includes('orders') ||
        userRole.includes('sotuvchi') ||
        userRole.includes('kassir') ||
        userRole.includes('cashier') ||
        userRole.includes('seller') ||
        userRole.includes('xodim') ||
        userRole.includes('worker') ||
        userRole.includes('waiter') ||
        userRole.includes('ofitsiant')
      );
    }
    return (
      allowed.includes(item.name) ||
      (item.name === 'products' && allowed.includes('products')) ||
      (item.name === 'categories' && (allowed.includes('products') || allowed.includes('categories'))) ||
      (item.name === 'inventory' && allowed.includes('inventory')) ||
      (item.name === 'suppliers' && allowed.includes('suppliers')) ||
      (item.name === 'customers' && allowed.includes('customers')) ||
      (item.name === 'tables' && (allowed.includes('tables') || allowed.includes('restaurant'))) ||
      (item.name === 'kds' && allowed.includes('kds')) ||
      (item.name === 'appointments' && allowed.includes('appointments')) ||
      (item.name === 'services' && (allowed.includes('services') || allowed.includes('appointments'))) ||
      (item.name === 'finance' && allowed.includes('finance')) ||
      (item.name === 'dashboard' && allowed.includes('dashboard')) ||
      (item.name === 'settings' && allowed.includes('settings'))
    );
  };

  return allNavGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(filterItem),
    }))
    .filter((group) => group.items.length > 0);
});

const visibleNavItems = computed(() => {
  const items = visibleNavGroups.value.flatMap((g) => g.items);
  if (items.length === 0) {
    const posGroup = allNavGroups.find((g) => g.items.some((i) => i.name === 'pos'));
    const posItem = posGroup?.items.find((i) => i.name === 'pos');
    return posItem ? [posItem] : [];
  }
  return items;
});

const isItemActive = (item: NavItem) => {
  if (route.path === item.to) return true;

  // Agar boshqa aniqroq nav item mavjud bo'lsa (masalan /appointments/services),
  // /appointments ochilmagan bo'lsa, /appointments ni active qilmaslik
  const allItemTos = allNavGroups.flatMap((g) => g.items.map((i) => i.to));
  const hasMoreSpecificSibling = allItemTos.some(
    (to) => to !== item.to && to.startsWith(item.to + '/') && (route.path === to || route.path.startsWith(to + '/'))
  );

  if (hasMoreSpecificSibling) {
    return false;
  }

  if (item.to !== '/' && route.path.startsWith(item.to + '/')) {
    return true;
  }

  return false;
};

const handleLogout = () => {
  dataStore.clearAll();
  authStore.logout();
  window.location.href = '/auth/login';
};

onMounted(async () => {
  if (authStore.user?.id === 'demo-user-id') {
    dataStore.loadDemoData(businessType.value || 'shop');
    return;
  }
  await authStore.fetchBusinesses();
  // Background prefetching for 0ms instant navigation
  dataStore.prefetchAll(businessType.value || 'shop');
});
</script>
