<template>
  <div class="h-[calc(100vh-5.5rem)] flex flex-col gap-2.5 overflow-hidden">
    <!-- Top Shift Status Bar -->
    <div class="glass-card rounded-2xl px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 border border-slate-200/80 dark:border-slate-800/80 shrink-0">
      <div v-if="currentShift" class="flex items-center gap-2 sm:gap-3">
        <div class="flex items-center gap-1.5 sm:gap-2">
          <span class="relative flex h-2.5 w-2.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span class="font-black text-xs text-slate-900 dark:text-white">
            Smena Faol <span class="hidden sm:inline">({{ formatDateTime(currentShift.openedAt) }})</span>
          </span>
        </div>
        <div class="hidden md:flex items-center gap-2 text-xs font-mono">
          <span class="text-slate-400">|</span>
          <span class="text-slate-500">Kassada:</span>
          <span class="font-bold text-emerald-600 dark:text-emerald-400">
            {{ formatCurrency(currentShift.liveSummary?.expectedCash ?? currentShift.startingCash) }}
          </span>
          <span class="text-slate-400">|</span>
          <span class="text-slate-500">Kassir:</span>
          <span class="font-bold text-slate-800 dark:text-slate-200">{{ currentShift.user?.fullName || currentShift.user?.name || authStore.user?.fullName || 'Kassir' }}</span>
        </div>
      </div>
      <div v-else class="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-bold">
        <AlertTriangle class="w-4 h-4" />
        <span>Smena ochilmagan!</span>
      </div>

      <div class="flex items-center gap-1.5">
        <button
          v-if="currentShift"
          type="button"
          @click="openShiftModal('report')"
          class="px-2 sm:px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1 sm:gap-1.5 transition btn-interactive"
        >
          <Receipt class="w-3.5 h-3.5" />
          <span>Z-Hisobot</span>
        </button>
        <button
          v-if="currentShift"
          type="button"
          @click="openShiftModal('close')"
          class="px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center gap-1 sm:gap-1.5 transition btn-interactive"
        >
          <Moon class="w-3.5 h-3.5" />
          <span>Yopish</span>
        </button>
        <button
          v-else
          type="button"
          @click="openShiftModal('open')"
          class="px-3 sm:px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-500/20 transition btn-interactive"
        >
          <Sun class="w-3.5 h-3.5" />
          <span>Smena Ochish</span>
        </button>
      </div>
    </div>

    <!-- Mobile Tab Toggle (< lg) -->
    <div class="flex lg:hidden items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0 gap-1">
      <button
        @click="mobileViewTab = 'catalog'"
        class="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
        :class="mobileViewTab === 'catalog' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'"
      >
        <Package class="w-3.5 h-3.5" />
        <span>Katalog ({{ filteredProducts.length }})</span>
      </button>
      <button
        @click="mobileViewTab = 'cart'"
        class="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
        :class="mobileViewTab === 'cart' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'"
      >
        <ShoppingCart class="w-3.5 h-3.5" />
        <span>Savat ({{ cartStore.itemCount }})</span>
        <span v-if="cartStore.itemCount > 0" class="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
          {{ formatCurrency(cartStore.grandTotal) }}
        </span>
      </button>
    </div>

    <!-- Main POS Workspace -->
    <div class="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden relative">
      <!-- Locked Screen Overlay when Shift is Closed -->
      <div
        v-if="!currentShift"
        class="absolute inset-0 z-20 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 rounded-2xl animate-fade-in"
      >
        <div class="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 shadow-2xl text-center space-y-4">
          <div class="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto shadow-inner">
            <Lock class="w-8 h-8" />
          </div>

          <div>
            <h3 class="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Kassa Smenasi Ochilmagan
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Mahsulotlarni tanlash va savdo qilish uchun avval kassa smenasini oching. Boshlang'ich kassa qoldig'i qayd etiladi.
            </p>
          </div>

          <div class="pt-2">
            <button
              type="button"
              @click="openShiftModal('open')"
              class="w-full py-3.5 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition transform active:scale-98 btn-interactive"
            >
              <Sun class="w-5 h-5" />
              <span>+ Yangi Smenani Ochish</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Left Catalog Area (65%) -->
      <div
        class="flex-1 flex-col glass-card rounded-2xl p-3 sm:p-4 overflow-hidden"
        :class="mobileViewTab === 'catalog' ? 'flex' : 'hidden lg:flex'"
      >
        <!-- Search & Category Filters -->
        <div class="space-y-2.5 mb-3.5 shrink-0">
          <!-- Full-Width Search Input with Barcode auto-focus and clear button -->
          <div class="relative w-full">
            <Search class="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              @keydown.enter="handleBarcodeScan"
              type="text"
              placeholder="Mahsulot nomi yoki Shtrix-kodni skanerlang (Enter)..."
              class="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-xs"
            />
            <button
              v-if="searchQuery"
              @click="searchQuery = ''"
              class="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Category Filter Tabs -->
          <div class="flex items-center space-x-2 overflow-x-auto scrollbar-none pb-0.5">
            <button
              @click="selectedCategory = ''"
              class="px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition"
              :class="selectedCategory === '' ? 'bg-emerald-500 text-white shadow-sm font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'"
            >
              Barchasi
            </button>

            <!-- Bestseller Fast Filter -->
            <button
              @click="selectedCategory = '__bestsellers__'"
              class="px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1"
              :class="selectedCategory === '__bestsellers__' ? 'bg-amber-500 text-slate-950 font-black shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300'"
            >
              <Flame class="w-3.5 h-3.5" />
              <span>Top Tovar</span>
            </button>

            <button
              v-for="cat in categories"
              :key="cat.id"
              @click="selectedCategory = cat.id"
              class="px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition"
              :class="selectedCategory === cat.id ? 'bg-emerald-500 text-white shadow-sm font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'"
            >
              {{ cat.name }}
            </button>
          </div>
        </div>

        <!-- Products Grid -->
        <div class="flex-1 overflow-y-auto pr-1">
          <SkeletonLoader v-if="loading" variant="grid" :count="10" />

          <div v-else-if="filteredProducts.length === 0" class="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-xs">
            <Package class="w-10 h-10 stroke-1 mb-2" />
            <span>Mahsulot topilmadi</span>
          </div>

          <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2.5 sm:gap-3">
          <div
            v-for="prod in filteredProducts"
            :key="prod.id"
            @click="handleProductClick(prod)"
            class="p-2.5 rounded-xl border transition-all flex flex-col justify-between group relative select-none"
            :class="[
              !isItemAvailable(prod)
                ? 'bg-slate-100/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800/80 opacity-60 cursor-not-allowed'
                : 'bg-slate-50 hover:bg-slate-100/90 dark:bg-slate-800/60 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700/60 hover:border-emerald-500/50 cursor-pointer shadow-sm hover:shadow-emerald-500/10 btn-interactive'
            ]"
          >
            <!-- Out of stock / Stop-list overlay badge -->
            <div
              v-if="!isItemAvailable(prod)"
              class="absolute inset-0 z-10 rounded-xl bg-slate-950/20 dark:bg-slate-950/40 backdrop-blur-[1px] flex items-center justify-center pointer-events-none"
            >
              <span class="px-2.5 py-1 rounded-lg bg-rose-500/90 text-white font-bold text-[10px] tracking-wider uppercase shadow-md">
                {{ prod.status === 'inactive' ? 'Stop-List' : 'Tugagan' }}
              </span>
            </div>

            <!-- Product Image -->
            <div class="w-full h-24 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden mb-2 flex items-center justify-center relative">
              <img
                v-if="prod.imageUrl"
                :src="prod.imageUrl"
                class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                @error="prod.imageUrl = null"
              />
              <Package v-else class="w-8 h-8 text-slate-400 dark:text-slate-600 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition" />
              
              <!-- Stock Indicator / Made-to-order badge -->
              <span
                class="absolute bottom-1 right-1 text-[9px] font-bold px-1.5 py-0.5 rounded backdrop-blur-md"
                :class="[
                  !isItemAvailable(prod)
                    ? 'bg-rose-500 text-white'
                    : isDishItem(prod)
                    ? 'bg-amber-500/90 text-slate-950 font-bold'
                    : prod.brand === 'service'
                    ? 'bg-sky-500/90 text-white'
                    : 'bg-slate-900/80 text-white'
                ]"
              >
                <span v-if="prod.status === 'inactive'">Stop-list</span>
                <span v-else-if="isDishItem(prod)">🍕 Taom</span>
                <span v-else-if="prod.brand === 'service'">🛠 Xizmat</span>
                <span v-else>{{ prod.stockQty <= 0 ? 'Qolmagan' : `${prod.stockQty} ${prod.unit?.shortName || 'dona'}` }}</span>
              </span>

              <!-- Bestseller Flame Badge if in top selling -->
              <span
                v-if="prod.soldCount30d && prod.soldCount30d > 0"
                class="absolute top-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950 flex items-center gap-0.5 shadow-sm"
                title="Oxirgi 30 kunda ko'p sotilgan"
              >
                <Flame class="w-2.5 h-2.5 fill-slate-950" />
                <span>{{ prod.soldCount30d }}</span>
              </span>
            </div>

            <div>
              <h4 class="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 line-clamp-1">{{ prod.name }}</h4>
              <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{{ prod.sku }}</p>
            </div>

            <div class="mt-2 flex items-center justify-between">
              <span class="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">{{ formatCurrency(prod.salePrice) }}</span>
              <span
                class="text-[10px] font-bold px-1.5 py-0.5 rounded"
                :class="!isItemAvailable(prod) ? 'bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition'"
              >+</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Cart & Payment Area (Fixed Width 320-384px) -->
    <div
      class="w-full lg:w-80 xl:w-96 flex-col glass-card rounded-2xl p-3 sm:p-4 overflow-hidden shrink-0"
      :class="mobileViewTab === 'cart' ? 'flex' : 'hidden lg:flex'"
    >
      <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div class="flex items-center space-x-2">
          <ShoppingCart class="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
          <h3 class="font-bold text-sm text-slate-900 dark:text-white">Savat</h3>
          <span class="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
            {{ cartStore.itemCount }}
          </span>
        </div>
        <button
          v-if="cartStore.items.length > 0"
          @click="cartStore.clearCart"
          class="text-xs text-rose-500 hover:text-rose-600 dark:text-rose-400 font-medium"
        >
          Tozalash
        </button>
      </div>

      <!-- Restaurant Service / Table Selector -->
      <div v-if="isRestaurant && enabledServiceTypes.length > 0" class="my-2.5 p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-2 shrink-0">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-bold text-slate-600 dark:text-slate-300">Xizmat turi:</span>
          <span v-if="orderType === 'dine_in'" class="text-[10px] font-black px-2 py-0.5 rounded-md" :class="currentTableDisplayName ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white animate-pulse'">
            🍽️ {{ currentTableDisplayName || 'Stol tanlanmagan!' }}
          </span>
          <span v-else-if="orderType === 'takeaway'" class="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-500 text-slate-950">
            🥡 Saboy (Olib ketish)
          </span>
          <span v-else-if="orderType === 'delivery'" class="text-[10px] font-black px-2 py-0.5 rounded-md bg-sky-500 text-white">
            🛵 Yetkazib berish
          </span>
        </div>

        <!-- Toggle Pills -->
        <div class="grid gap-1" :class="enabledServiceTypes.length === 1 ? 'grid-cols-1' : enabledServiceTypes.length === 2 ? 'grid-cols-2' : 'grid-cols-3'">
          <button
            v-if="posSettings.allowDineIn"
            type="button"
            @click="orderType = 'dine_in'"
            class="py-1.5 px-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1"
            :class="orderType === 'dine_in' ? 'bg-emerald-500 text-white shadow-xs' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 border border-slate-200 dark:border-slate-600'"
          >
            <span>🍽️</span>
            <span>Zalda</span>
          </button>
          <button
            v-if="posSettings.allowTakeaway"
            type="button"
            @click="orderType = 'takeaway'"
            class="py-1.5 px-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1"
            :class="orderType === 'takeaway' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 border border-slate-200 dark:border-slate-600'"
          >
            <span>🥡</span>
            <span>Saboy</span>
          </button>
          <button
            v-if="posSettings.allowDelivery"
            type="button"
            @click="orderType = 'delivery'"
            class="py-1.5 px-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1"
            :class="orderType === 'delivery' ? 'bg-sky-500 text-white shadow-xs' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 border border-slate-200 dark:border-slate-600'"
          >
            <span>🛵</span>
            <span>Dostavka</span>
          </button>
        </div>

        <!-- Table Quick Selector if Zalda -->
        <div v-if="orderType === 'dine_in'" class="pt-2 border-t border-slate-200 dark:border-slate-700/60 space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold" :class="currentTableDisplayName ? 'text-slate-600 dark:text-slate-300' : 'text-rose-500 font-extrabold'">
              {{ currentTableDisplayName ? 'Tanlangan stol:' : '⚠️ Qaysi stol band qilindi? *' }}
            </span>
            <button
              type="button"
              @click="isCustomTableInput = !isCustomTableInput"
              class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
            >
              {{ isCustomTableInput ? 'Ro\'yxat' : '+ Boshqa stol' }}
            </button>
          </div>

          <!-- Custom Table Input -->
          <div v-if="isCustomTableInput" class="flex gap-1.5">
            <input
              v-model="customTableNumber"
              type="text"
              placeholder="Masalan: Stol #7, VIP 2..."
              class="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <!-- Table Chips -->
          <div v-else class="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
            <button
              v-for="tbl in availableTables"
              :key="tbl.id || tbl.name"
              type="button"
              @click="selectedTableNumber = tbl.name"
              class="px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition"
              :class="selectedTableNumber === tbl.name ? 'bg-emerald-500 text-white shadow-xs' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 border border-slate-200 dark:border-slate-600'"
            >
              {{ tbl.name }}
            </button>
          </div>
        </div>
      </div>

      <!-- Cart Items List -->
      <div class="flex-1 overflow-y-auto py-2 space-y-2">
        <div v-if="cartStore.items.length === 0" class="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-xs">
          <span>Savat bo'sh. Mahsulotni bosing yoki skanerlang</span>
        </div>

        <div
          v-for="item in cartStore.items"
          :key="item.id"
          class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 flex flex-col space-y-2"
        >
          <div class="flex items-start justify-between gap-2">
            <div>
              <h5 class="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{{ item.name }}</h5>
              <p class="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">{{ formatCurrency(item.price) }}</p>
            </div>
            <button @click="cartStore.removeItem(item.id)" class="text-slate-400 hover:text-rose-500">
              <X class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- Quantity Stepper -->
          <div class="flex items-center justify-between pt-1">
            <div class="flex items-center space-x-1.5">
              <button
                @click="cartStore.updateQuantity(item.id, item.quantity - 1)"
                class="w-6 h-6 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 flex items-center justify-center text-xs text-slate-800 dark:text-white"
              >
                -
              </button>
              <input
                type="number"
                v-model.number="item.quantity"
                class="w-12 text-center py-0.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white font-bold"
              />
              <button
                @click="cartStore.updateQuantity(item.id, item.quantity + 1)"
                class="w-6 h-6 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 flex items-center justify-center text-xs text-slate-800 dark:text-white"
              >
                +
              </button>
            </div>
            <span class="text-xs font-black text-slate-900 dark:text-white">{{ formatCurrency(item.price * item.quantity - item.discount) }}</span>
          </div>
        </div>
      </div>

      <!-- Cart Totals & Checkout -->
      <div class="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
        <div class="space-y-1 text-xs">
          <div class="flex justify-between text-slate-500 dark:text-slate-400">
            <span>Oraliq summa:</span>
            <span class="text-slate-800 dark:text-slate-200 font-medium">{{ formatCurrency(cartStore.subtotal) }}</span>
          </div>
          <div class="flex justify-between text-slate-500 dark:text-slate-400">
            <span>Chegirma:</span>
            <span class="text-rose-500">-{{ formatCurrency(cartStore.discountTotal) }}</span>
          </div>
          <div class="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-800">
            <span>Jami to'lov:</span>
            <span class="text-emerald-600 dark:text-emerald-400 font-black">{{ formatCurrency(cartStore.grandTotal) }}</span>
          </div>
        </div>

        <button
          @click="openCheckoutModal"
          :disabled="cartStore.items.length === 0"
          class="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm shadow-lg shadow-emerald-500/25 transition flex items-center justify-center space-x-2 btn-interactive"
        >
          <CreditCard class="w-4 h-4" />
          <span>To'lovga O'tish (F10)</span>
        </button>
      </div>
    </div>
    </div>

    <!-- Checkout Modal -->
    <Teleport to="body">
      <div v-if="isCheckoutOpen" @click.self="isCheckoutOpen = false" class="modal-overlay">
        <div class="modal-container max-w-md" @click.stop>
          <div class="modal-header">
            <h3 class="font-black text-base text-slate-900 dark:text-white">To'lovni Tasdiqlash</h3>
            <button @click="isCheckoutOpen = false" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition">
              <X class="w-5 h-5" />
            </button>
          </div>

        <div class="modal-body space-y-4">
          <!-- Total display -->
          <div class="text-center py-4 bg-slate-100/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span class="text-xs text-slate-500 dark:text-slate-400">To'lanishi kerak bo'lgan summa:</span>
            <h2 class="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
              {{ formatCurrency(cartStore.grandTotal) }}
            </h2>
          </div>

          <!-- Restaurant Service & Table Confirmation / Selection in Checkout Modal -->
          <div v-if="isRestaurant && enabledServiceTypes.length > 0" class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2.5">
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-500 dark:text-slate-400 font-semibold">Xizmat turi:</span>
              <div class="flex items-center gap-1.5">
                <span v-if="orderType === 'dine_in'" class="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span>🍽️</span>
                  <span>Zalda</span>
                </span>
                <span v-else-if="orderType === 'takeaway'" class="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <span>🥡</span>
                  <span>Saboy (Olib ketish)</span>
                </span>
                <span v-else-if="orderType === 'delivery'" class="font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1">
                  <span>🛵</span>
                  <span>Yetkazib berish (Dostavka)</span>
                </span>
              </div>
            </div>

            <!-- Table Selection in Checkout Modal if Zalda -->
            <div v-if="orderType === 'dine_in'" class="pt-2 border-t border-slate-200 dark:border-slate-700/60 space-y-2">
              <div class="flex items-center justify-between text-xs">
                <span class="font-bold" :class="currentTableDisplayName ? 'text-slate-700 dark:text-slate-300' : 'text-rose-500 font-extrabold'">
                  🍽️ Qaysi stol band qilindi? *
                </span>
                <span v-if="currentTableDisplayName" class="font-black text-emerald-600 dark:text-emerald-400">
                  {{ currentTableDisplayName }}
                </span>
                <span v-else class="text-[11px] text-rose-500 font-bold animate-pulse">
                  Tanlanmagan!
                </span>
              </div>

              <!-- Table Options -->
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="tbl in availableTables"
                  :key="tbl.id || tbl.name"
                  type="button"
                  @click="selectedTableNumber = tbl.name; isCustomTableInput = false;"
                  class="px-3 py-1.5 rounded-xl text-xs font-bold transition"
                  :class="selectedTableNumber === tbl.name && !isCustomTableInput ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 border border-slate-200 dark:border-slate-600'"
                >
                  {{ tbl.name }}
                </button>
              </div>

              <!-- Custom table input toggle -->
              <div class="pt-1">
                <div v-if="isCustomTableInput" class="flex gap-1.5">
                  <input
                    v-model="customTableNumber"
                    type="text"
                    placeholder="Masalan: Stol #7, VIP 2..."
                    class="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  v-else
                  type="button"
                  @click="isCustomTableInput = true"
                  class="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                >
                  + Boshqa stol nomini kiritish
                </button>
              </div>
            </div>
          </div>

          <!-- Payment Method Selection -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">To'lov Turi:</label>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="pm in paymentMethods"
                :key="pm.id"
                type="button"
                @click="selectedPaymentMethod = pm.id"
                class="p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1.5"
                :class="[
                  selectedPaymentMethod === pm.id
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                ]"
              >
                <Banknote v-if="pm.type === 'cash'" class="w-4 h-4" />
                <CreditCard v-else-if="pm.type === 'card'" class="w-4 h-4" />
                <Smartphone v-else class="w-4 h-4" />
                <span>{{ pm.name }}</span>
              </button>
            </div>
          </div>

          <!-- Cash change calculation if cash selected -->
          <div v-if="selectedPaymentMethod === '1'" class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div>
              <label class="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Mijoz bergan summa:</label>
              <CurrencyInput
                v-model="cashReceived"
                placeholder="0"
                suffix="so'm"
                inputClass="font-bold text-slate-900 dark:text-white"
              />
            </div>

            <!-- Quick Cash Buttons -->
            <div class="flex flex-wrap gap-1.5">
              <button
                type="button"
                @click="cashReceived = cartStore.grandTotal"
                class="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-semibold text-slate-700 dark:text-slate-300 hover:border-emerald-500 transition"
              >
                Aniq summa
              </button>
              <button
                type="button"
                v-for="amt in [50000, 100000, 200000]"
                :key="amt"
                @click="cashReceived = amt"
                class="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-700 dark:text-slate-300 hover:border-emerald-500 transition"
              >
                {{ formatCurrency(amt) }}
              </button>
            </div>

            <div v-if="cashReceived > cartStore.grandTotal" class="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800 text-xs">
              <span class="text-slate-500 dark:text-slate-400 font-semibold">Qaytim:</span>
              <span class="font-bold font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                {{ formatCurrency(cashReceived - cartStore.grandTotal) }}
              </span>
            </div>

            <div v-else-if="cashReceived > 0 && cashReceived < cartStore.grandTotal" class="pt-1 border-t border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-slate-500 dark:text-slate-400 font-semibold">To'langan:</span>
                <span class="font-bold font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                  {{ formatCurrency(cashReceived) }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-amber-600 dark:text-amber-400 font-semibold">Nasiya qoldig'i:</span>
                <span class="font-bold font-mono text-amber-600 dark:text-amber-400 text-sm">
                  {{ formatCurrency(cartStore.grandTotal - cashReceived) }}
                </span>
              </div>
              <div class="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] font-medium">
                ⚠️ Mijoz to'liq summa bermayapti. Qolgan qism nasiyaga yoziladi.
              </div>
            </div>
          </div>

          <!-- Customer / Nasiya Selector in Checkout Modal (Only when allowDebt is true) -->
          <div v-if="posSettings.allowDebt" class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div class="flex items-center justify-between text-xs font-bold">
              <span class="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Users class="w-4 h-4 text-amber-500" />
                <span>Mijoz (Nasiya / Qarzga yozish uchun):</span>
              </span>
              <button
                v-if="selectedCustomerId"
                type="button"
                @click="selectedCustomerId = ''"
                class="text-[11px] text-rose-500 hover:underline font-bold"
              >
                Tozalash
              </button>
            </div>

            <div class="flex items-center gap-2">
              <div class="flex-1">
                <AppSelect
                  v-model="selectedCustomerId"
                  :options="customerSelectOptions"
                  :searchable="true"
                  placeholder="Mijozni qidiring yoki tanlang..."
                />
              </div>
              <button
                type="button"
                @click="isNewCustomerModalOpen = true"
                class="px-3 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-xs shrink-0 transition"
                title="Yangi mijoz qo'shish"
              >
                + Yangi
              </button>
            </div>

            <div v-if="selectedCustomer" class="p-2 rounded-xl bg-amber-500/10 text-xs text-amber-700 dark:text-amber-300 font-semibold space-y-1">
              <p>👤 Tanlangan: <b>{{ selectedCustomer.fullName }}</b> ({{ selectedCustomer.phone || 'Tel yo\'q' }})</p>
              <p v-if="selectedPaymentMethod === '1' && cashReceived < cartStore.grandTotal" class="text-rose-600 dark:text-rose-400 font-bold">
                ⚠️ Qolgan {{ formatCurrency(cartStore.grandTotal - (cashReceived || 0)) }} summa ushbu mijozning Nasiya hisobiga yoziladi.
              </p>
              <p v-else class="text-emerald-600 dark:text-emerald-400 font-bold">
                ✅ To'lov to'liq amalga oshiriladi.
              </p>
            </div>
          </div>

          <button
            @click="handleCompleteOrder"
            :disabled="isProcessing"
            class="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-black text-sm shadow-lg shadow-emerald-500/25 transition flex items-center justify-center space-x-2 btn-interactive"
          >
            <CheckCircle class="w-5 h-5" />
            <span>{{ isProcessing ? 'Chek chiqarilmoqda...' : 'To\'lovni Yakunlash (Chek Chiqarish)' }}</span>
          </button>
        </div>
      </div>
    </div>
    </Teleport>

    <!-- Unified Receipt Modal (Matching Image 3 with Print/Thermal support) -->
    <ReceiptModal
      v-if="completedOrder"
      :order="completedOrder"
      @close="completedOrder = null"
    />

    <!-- Shift Modal (Open / Close / Z-Report) -->
    <ShiftModal
      :is-open="shiftModal.open"
      :mode="shiftModal.mode"
      :shift-data="currentShift"
      @close="shiftModal.open = false"
      @shift-opened="onShiftOpened"
      @shift-closed="onShiftClosed"
    />

    <!-- Mobile Floating Checkout Bar (< lg) -->
    <div
      v-if="cartStore.itemCount > 0 && mobileViewTab === 'catalog'"
      class="lg:hidden fixed bottom-16 left-3 right-3 z-30 p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-2xl flex items-center justify-between animate-in slide-in-from-bottom-3 duration-200"
    >
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-black text-xs">
          {{ cartStore.itemCount }}
        </div>
        <div>
          <p class="text-xs font-bold leading-tight">{{ formatCurrency(cartStore.grandTotal) }}</p>
          <p class="text-[10px] text-emerald-100">Savatda tovarlar bor</p>
        </div>
      </div>
      <button
        @click="mobileViewTab = 'cart'"
        class="px-3.5 py-1.5 rounded-xl bg-white text-emerald-700 font-black text-xs shadow-md transition active:scale-95 flex items-center gap-1"
      >
        <span>Savatga O'tish</span>
        <ArrowRight class="w-3.5 h-3.5" />
      </button>
    </div>
    <!-- QUICK NEW CUSTOMER MODAL IN POS -->
    <Teleport to="body">
      <div v-if="isNewCustomerModalOpen" @click.self="isNewCustomerModalOpen = false" class="modal-overlay">
        <div class="modal-container max-w-sm" @click.stop>
          <div class="modal-header">
            <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Users class="w-4 h-4 text-amber-500" />
              <span>Yangi Mijoz Qo'shish</span>
            </h3>
            <button @click="isNewCustomerModalOpen = false" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white">
              <X class="w-4 h-4" />
            </button>
          </div>

          <form @submit.prevent="saveNewCustomer" class="p-4 space-y-3 text-xs">
            <AppInput
              v-model="newCustomerForm.fullName"
              label="Mijoz Ismi-Familiyasi *"
              placeholder="Masalan: Alisher Vohidov"
              :required="true"
            />
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Telefon Raqami *</label>
              <PhoneInput
                v-model="newCustomerForm.phone"
                placeholder="90 123 45 67"
                :required="true"
              />
            </div>
            <div class="pt-2">
              <AppButton
                type="submit"
                variant="primary"
                class="w-full"
                :loading="savingCustomer"
              >
                {{ savingCustomer ? 'Saqlanmoqda...' : 'Mijozni Saqlash & Tanlash' }}
              </AppButton>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import api from '../../services/api';
import { useCartStore } from '../../stores/cart.store';
import { useDataStore } from '../../stores/data.store';
import { useShiftStore } from '../../stores/shift.store';
import { useAuthStore } from '../../stores/auth.store';
import { useFormat } from '../../composables/useFormat';
import { useToast } from '../../composables/useToast';
import SkeletonLoader from '../../components/SkeletonLoader.vue';
import AppInput from '../../components/AppInput.vue';
import AppButton from '../../components/AppButton.vue';
import AppSelect from '../../components/AppSelect.vue';
import PhoneInput from '../../components/PhoneInput.vue';
import CurrencyInput from '../../components/CurrencyInput.vue';
import ReceiptModal from '../../components/ReceiptModal.vue';
import ShiftModal from '../../components/ShiftModal.vue';
import { usePosSettings } from '../../composables/usePosSettings';
import {
  Search,
  ShoppingCart,
  Package,
  X,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle,
  Printer,
  Flame,
  Sun,
  Moon,
  Receipt,
  AlertTriangle,
  Lock,
  ArrowRight,
  Users,
} from 'lucide-vue-next';

const mobileViewTab = ref<'catalog' | 'cart'>('catalog');
const cartStore = useCartStore();
const dataStore = useDataStore();
const shiftStore = useShiftStore();
const authStore = useAuthStore();
const toast = useToast();
const { formatCurrency, formatDate, formatDateTime } = useFormat();

const loading = ref(false);
const products = computed(() => dataStore.products);
const categories = computed(() => dataStore.categories);
const customers = computed(() => dataStore.customers || []);
const bestsellers = ref<any[]>([]);

// Customer Selection & Quick Add State
const selectedCustomerId = ref('');
const selectedCustomer = computed(() => customers.value.find((c) => c.id === selectedCustomerId.value) || null);
const isNewCustomerModalOpen = ref(false);
const newCustomerForm = ref({ fullName: '', phone: '' });
const savingCustomer = ref(false);

const customerSelectOptions = computed(() => {
  return [
    { value: '', label: '— Mijoz tanlanmagan (Oddiy to\'lov) —' },
    ...customers.value.map((c) => ({
      value: c.id,
      label: `${c.fullName} (${c.phone || 'Tel yo\'q'})`,
      badge: Number(c.debt || 0) > 0 ? `Qarzi: ${formatCurrency(c.debt)}` : undefined,
    })),
  ];
});

const saveNewCustomer = async () => {
  if (!newCustomerForm.value.fullName) {
    toast.warning('Mijoz ismini kiriting!', 'Ogohlantirish');
    return;
  }
  savingCustomer.value = true;
  try {
    const { data } = await api.post('/customers', {
      fullName: newCustomerForm.value.fullName,
      phone: newCustomerForm.value.phone || undefined,
    });
    toast.success(`"${data.fullName}" muvaffaqiyatli saqlandi!`, 'Yangi Mijoz');
    dataStore.invalidate('customers');
    await dataStore.fetchCustomers(true);
    selectedCustomerId.value = data.id;
    isNewCustomerModalOpen.value = false;
    newCustomerForm.value = { fullName: '', phone: '' };
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Mijozni saqlashda xatolik', 'Xatolik');
  } finally {
    savingCustomer.value = false;
  }
};

const currentShift = computed(() => shiftStore.currentShift);
const shiftModal = ref<{ open: boolean; mode: 'open' | 'close' | 'report' }>({
  open: false,
  mode: 'open',
});

const openShiftModal = (mode: 'open' | 'close' | 'report') => {
  shiftModal.value = { open: true, mode };
};

const onShiftOpened = (newShift: any) => {
  shiftStore.currentShift = newShift;
  shiftModal.value.open = false;
};

const onShiftClosed = () => {
  shiftStore.currentShift = null;
  shiftModal.value.open = false;
};

const fetchCurrentShift = async () => {
  await shiftStore.fetchCurrentShift();
};

const searchQuery = ref('');
const selectedCategory = ref('');
const searchInputRef = ref<HTMLInputElement | null>(null);

const isRestaurant = computed(() => {
  const type = (authStore.businessType || authStore.activeBusiness?.businessType || '').toLowerCase();
  return ['restaurant', 'cafe', 'fastfood', 'coffee', 'restaran'].includes(type);
});

const { posSettings } = usePosSettings();

const enabledServiceTypes = computed(() => {
  const list: { key: 'dine_in' | 'takeaway' | 'delivery'; label: string; icon: string }[] = [];
  if (posSettings.value.allowDineIn) list.push({ key: 'dine_in', label: 'Zalda', icon: '🍽️' });
  if (posSettings.value.allowTakeaway) list.push({ key: 'takeaway', label: 'Saboy', icon: '🥡' });
  if (posSettings.value.allowDelivery) list.push({ key: 'delivery', label: 'Dostavka', icon: '🛵' });
  return list;
});

const orderType = ref<'dine_in' | 'takeaway' | 'delivery'>(
  posSettings.value.allowDineIn ? 'dine_in' : posSettings.value.allowTakeaway ? 'takeaway' : 'delivery'
);

watch(
  enabledServiceTypes,
  (types) => {
    if (types.length > 0 && !types.some((t) => t.key === orderType.value)) {
      orderType.value = types[0].key;
    }
  },
  { immediate: true }
);

const selectedTableNumber = ref<string>('');
const customTableNumber = ref<string>('');
const isCustomTableInput = ref<boolean>(false);

const currentTableDisplayName = computed(() => {
  if (isCustomTableInput.value && customTableNumber.value) {
    return customTableNumber.value;
  }
  return selectedTableNumber.value || '';
});

const availableTables = computed(() => {
  if (dataStore.tables && dataStore.tables.length > 0) {
    return dataStore.tables.map((t: any) => ({
      id: t.id,
      name: t.name || `Stol #${t.number || t.id}`,
    }));
  }
  return [
    { id: '1', name: 'Stol 1' },
    { id: '2', name: 'Stol 2' },
    { id: '3', name: 'Stol 3' },
    { id: '4', name: 'Stol 4' },
    { id: '5', name: 'Stol 5' },
    { id: '6', name: 'Stol 6' },
    { id: 'vip-1', name: 'VIP 1' },
    { id: 'vip-2', name: 'VIP 2' },
    { id: 'terrace-1', name: 'Terassa 1' },
  ];
});

const isCheckoutOpen = ref(false);
const isProcessing = ref(false);
const completedOrder = ref<any | null>(null);
const cashReceived = ref<number>(0);

const openCheckoutModal = () => {
  if (cartStore.items.length === 0) return;
  if (isRestaurant.value && orderType.value === 'dine_in' && !currentTableDisplayName.value) {
    toast.warning('Iltimos, avval qaysi stol band qilinganligini belgilang!', 'Stol belgilanmagan');
    return;
  }
  cashReceived.value = cartStore.grandTotal;
  isCheckoutOpen.value = true;
};

const paymentMethods = ref([
  { id: '1', name: 'Naqd pul', type: 'cash' },
  { id: '2', name: 'Plastik karta', type: 'card' },
  { id: '3', name: 'Click / Payme', type: 'click' },
]);
const selectedPaymentMethod = ref('1');

const loadProducts = async () => {
  if (dataStore.products.length === 0) {
    loading.value = true;
  }
  try {
    const promises: Promise<any>[] = [
      dataStore.fetchProducts(),
      dataStore.fetchCategories(),
    ];
    if (isRestaurant.value) {
      promises.push(dataStore.fetchTables());
    }
    await Promise.all(promises);
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const fetchBestsellers = async () => {
  try {
    const { data } = await api.get('/products/bestsellers?limit=50&period=30d');
    bestsellers.value = data || [];
  } catch (err) {
    console.error('Failed to fetch bestsellers', err);
  }
};

const filteredProducts = computed(() => {
  let list = [...products.value];

  // Merge bestsellers sales stats into products list
  const bestsellersMap = new Map(bestsellers.value.map((b) => [b.id, b.soldCount30d || 0]));
  list = list.map((p) => ({
    ...p,
    soldCount30d: bestsellersMap.get(p.id) || 0,
  }));

  // Sort by popularity (bestsellers first) by default
  list.sort((a, b) => {
    const soldA = a.soldCount30d || 0;
    const soldB = b.soldCount30d || 0;
    if (soldA !== soldB) return soldB - soldA;
    return a.name.localeCompare(b.name);
  });

  return list.filter((p) => {
    if (selectedCategory.value === '__bestsellers__') {
      if (!p.soldCount30d || p.soldCount30d <= 0) return false;
    } else if (selectedCategory.value) {
      if (p.categoryId !== selectedCategory.value) return false;
    }

    const matchSearch =
      !searchQuery.value ||
      p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.barcode?.includes(searchQuery.value);

    return matchSearch;
  });
});

const isDishItem = (prod: any) => {
  return (
    prod.isMadeToOrder ||
    prod.brand === 'dish' ||
    prod.brand === 'kitchen' ||
    prod.unit?.shortName === 'por' ||
    prod.unitId === '00000000-0000-0000-0000-000000000024'
  );
};

const isItemAvailable = (prod: any) => {
  if (prod.status === 'inactive') return false;
  if (isDishItem(prod) || prod.brand === 'service') return true;
  return (prod.stockQty ?? 0) > 0;
};

const handleProductClick = (product: any) => {
  if (!isItemAvailable(product)) {
    if (product.status === 'inactive') {
      toast.warning(`"${product.name}" hozirda stop-listda (oshxonada tugagan)!`, 'Stop-list');
    } else {
      toast.warning(`"${product.name}" mahsulotidan omborda qoldiq qolmagan!`, 'Qoldiq tugagan');
    }
    return;
  }
  addToCart(product);
};

const addToCart = (product: any) => {
  const isDish = isDishItem(product) || product.brand === 'service';
  const existingInCart = cartStore.items.find((i) => (i.productId || i.id) === product.id);
  const currentInCartQty = existingInCart ? existingInCart.quantity : 0;

  // Only check physical stock bounds for tracked goods
  if (!isDish && currentInCartQty + 1 > product.stockQty) {
    toast.warning(
      `Omborda faqat ${product.stockQty} dona mavjud. Savatga bundan ortiq qo'shib bo'lmaydi!`,
      'Qoldiq chegarasi'
    );
    return;
  }

  cartStore.addItem(product);
  toast.success(`"${product.name}" savatga qo'shildi`, 'Savat');
};

const handleBarcodeScan = async () => {
  if (!searchQuery.value) return;
  const exact = products.value.find((p) => p.barcode === searchQuery.value || p.sku === searchQuery.value);
  if (exact) {
    if (!isItemAvailable(exact)) {
      if (exact.status === 'inactive') {
        toast.warning(`"${exact.name}" hozirda stop-listda (sotuv to'xtatilgan)!`, 'Stop-list');
      } else {
        toast.warning(`"${exact.name}" mahsulotidan omborda qoldiq qolmagan!`, 'Qoldiq tugagan');
      }
    } else {
      addToCart(exact);
    }
    searchQuery.value = '';
  } else {
    toast.warning(`Shtrix-kod (${searchQuery.value}) bo'yicha tovar topilmadi`, 'Skaner');
  }
};

const handleCompleteOrder = async () => {
  if (cartStore.items.length === 0) return;

  // Determine actual paid amount based on payment method
  const total = cartStore.grandTotal;
  let actualPaid = total;

  if (selectedPaymentMethod.value === '1') {
    // If cash received is entered
    if (cashReceived.value && cashReceived.value < total) {
      if (selectedCustomer.value) {
        actualPaid = cashReceived.value;
        const nasiyaAmount = total - actualPaid;
        toast.info(
          `Mijoz ${formatCurrency(actualPaid)} to'ladi. Qolgan ${formatCurrency(nasiyaAmount)} mijozning (${selectedCustomer.value.fullName}) nasiya hisobiga yozildi.`,
          'Qisman to\'lov / Nasiya'
        );
      } else {
        toast.warning('Nasiyaga (qisman to\'lovga) sotish uchun avval Mijozni tanlang!', 'Mijoz tanlanmagan');
        return;
      }
    } else {
      actualPaid = total;
    }
  }

  if (actualPaid <= 0) {
    toast.warning('To\'lov summasi 0 bo\'lishi mumkin emas!', 'Xatolik');
    return;
  }

  if (isRestaurant.value && orderType.value === 'dine_in' && !currentTableDisplayName.value) {
    toast.warning('Iltimos, buyurtma qaysi stol uchun ekanligini belgilang!', 'Stol belgilanmagan');
    return;
  }

  const resolvedTableNumber = (isRestaurant.value && orderType.value === 'dine_in')
    ? currentTableDisplayName.value
    : null;

  const apiOrderType = isRestaurant.value ? 'restaurant' : 'pos';

  isProcessing.value = true;
  try {
    const { data } = await api.post('/orders', {
      orderType: apiOrderType,
      customerId: selectedCustomerId.value || undefined,
      tableNumber: resolvedTableNumber,
      tableName: resolvedTableNumber,
      items: cartStore.items.map((i) => ({
        productId: i.productId || i.id,
        serviceId: i.serviceId,
        quantity: i.quantity,
        unitPrice: i.price,
      })),
      payments: [
        {
          paymentMethodId: selectedPaymentMethod.value,
          amount: actualPaid,
        },
      ],
    });

    data.orderType = orderType.value;
    data.tableNumber = resolvedTableNumber;
    if (selectedCustomer.value) {
      data.customer = selectedCustomer.value;
    }

    completedOrder.value = data;
    isCheckoutOpen.value = false;
    cartStore.clearCart();
    selectedCustomerId.value = '';
    selectedTableNumber.value = '';
    customTableNumber.value = '';

    shiftStore.recordSale(
      actualPaid,
      selectedPaymentMethod.value === '1' ? 'cash' : (selectedPaymentMethod.value === '2' ? 'card' : 'other')
    );
    toast.success(`Savdo muvaffaqiyatli yakunlandi! Chek: ${data.orderNumber || '#001'}`, 'Kassa (POS)');
    dataStore.invalidate('products');
    dataStore.invalidate('customers');
    await Promise.allSettled([loadProducts(), fetchCurrentShift(), dataStore.fetchCustomers()]);
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Savdoni yakunlashda xatolik', 'Xatolik');
  } finally {
    isProcessing.value = false;
  }
};

const printReceipt = () => {
  window.print();
};

onMounted(() => {
  loadProducts();
  fetchCurrentShift();
  dataStore.fetchCustomers();
  searchInputRef.value?.focus();
});
</script>
