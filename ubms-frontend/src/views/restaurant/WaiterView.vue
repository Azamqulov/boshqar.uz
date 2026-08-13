<template>
  <div class="h-[calc(100vh-5.5rem)] flex flex-col space-y-4 overflow-hidden">
    <!-- Top Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 py-1">
      <div class="flex items-center gap-3">
        <div class="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20">
          <UtensilsCrossed class="w-6 h-6" />
        </div>
        <div>
          <h1 class="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Ofitsiant & Stollar Boshqaruvi
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400">Stolni tanlang, taomlarni qo'shing va bir tugma bilan oshxonaga yuboring</p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <!-- Shift Controls in WaiterView (Only when shift is open) -->
        <div v-if="currentShift" class="flex items-center gap-1.5">
          <button
            type="button"
            @click="openShiftModal('report')"
            class="px-2.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition btn-interactive border border-slate-200 dark:border-slate-700"
          >
            <Receipt class="w-3.5 h-3.5" />
            <span>Z-Hisobot</span>
          </button>
          <button
            type="button"
            @click="openShiftModal('close')"
            class="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center gap-1.5 transition btn-interactive border border-rose-500/20"
          >
            <Moon class="w-3.5 h-3.5" />
            <span>Yopish</span>
          </button>
        </div>

        <button
          v-if="selectedTable"
          @click="selectedTable = null"
          class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition border border-slate-200 dark:border-slate-700"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>Stollar Xaritasiga Qaytish</span>
        </button>

        <button
          v-else
          @click="openCreateTableModal"
          class="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-xs font-bold transition shadow-lg shadow-emerald-500/25 btn-interactive"
        >
          <Plus class="w-4 h-4" />
          <span>+ Yangi Stol Qo'shish</span>
        </button>

        <button
          @click="loadTables(true)"
          :disabled="loading"
          class="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition border border-slate-200 dark:border-slate-700"
          title="Yangilash"
        >
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
        </button>
      </div>
    </div>

    <!-- Closed Shift Warning Banner in WaiterView -->
    <div
      v-if="!currentShift"
      class="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0"
    >
      <div class="flex items-center gap-2.5">
        <div class="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
          <Lock class="w-5 h-5" />
        </div>
        <div>
          <h4 class="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
            <span>🔒 Kassa Smenasi Ochilmagan</span>
            <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300">Stollar bloklangan</span>
          </h4>
          <p class="text-slate-500 dark:text-slate-400 mt-0.5">
            Stollarni band qilish, buyurtma qabul qilish va to'lov olish uchun avval kassa smenasini oching.
          </p>
        </div>
      </div>
      <button
        type="button"
        @click="openShiftModal('open')"
        class="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black text-xs shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-1.5 btn-interactive"
      >
        <Sun class="w-4 h-4" />
        <span>Smenani Ochish</span>
      </button>
    </div>

    <!-- MAIN VIEW 1: STOLLAR XARITASI (TABLES MAP) -->
    <div v-if="!selectedTable" class="flex-1 flex flex-col space-y-4 overflow-hidden">
      <!-- 1. KPI Status Cards (Matching Picture 2 Structure) -->
      <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 shrink-0">
        <AppStatCard
          title="Jami Stollar"
          :value="`${tables.length} ta`"
          subtitle="Restorandagi barcha stollar"
          :icon="UtensilsCrossed"
          variant="blue"
        />

        <AppStatCard
          title="Bo'sh Stollar"
          :value="`${freeTablesCount} ta`"
          subtitle="Yangi mijozlar uchun tayyor"
          :icon="CheckCircle2"
          variant="emerald"
        />

        <AppStatCard
          title="Band Stollar"
          :value="`${occupiedTablesCount} ta`"
          subtitle="Mijozlar o'tirgan / buyurtma bor"
          :icon="Users"
          variant="rose"
        />

        <AppStatCard
          title="Jami Sig'im"
          :value="`${totalCapacity} o'rin`"
          subtitle="Zalning umumiy o'tirish joyi"
          :icon="Building"
          variant="purple"
        />
      </div>

      <!-- 2. Filter Tabs & Search Bar -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
        <div class="flex items-center space-x-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold overflow-x-auto scrollbar-none">
          <button
            @click="statusFilter = 'all'"
            class="px-3 py-1.5 rounded-lg transition whitespace-nowrap"
            :class="statusFilter === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
          >
            Barchasi ({{ tables.length }})
          </button>
          <button
            @click="statusFilter = 'available'"
            class="px-3 py-1.5 rounded-lg transition flex items-center gap-1 whitespace-nowrap"
            :class="statusFilter === 'available' ? 'bg-emerald-500 text-white shadow-xs font-bold' : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'"
          >
            <span>🟢 Bo'sh ({{ freeTablesCount }})</span>
          </button>
          <button
            @click="statusFilter = 'occupied'"
            class="px-3 py-1.5 rounded-lg transition flex items-center gap-1 whitespace-nowrap"
            :class="statusFilter === 'occupied' ? 'bg-rose-500 text-white shadow-xs font-bold' : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'"
          >
            <span>🔴 Band ({{ occupiedTablesCount }})</span>
          </button>
        </div>

        <div class="w-full sm:w-72">
          <AppInput
            v-model="tableSearch"
            placeholder="Stol nomi bo'yicha qidirish..."
            :icon="Search"
          />
        </div>
      </div>

      <!-- 3. Tables Grid -->
      <div class="flex-1 overflow-y-auto pr-1">
        <SkeletonLoader v-if="loading" variant="grid" :count="10" />

        <div v-else-if="filteredTables.length === 0" class="h-full min-h-[200px] flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-xs text-center space-y-3">
          <UtensilsCrossed class="w-12 h-12 stroke-1 text-slate-300 dark:text-slate-600" />
          <p class="font-bold text-sm text-slate-600 dark:text-slate-400">Hech qanday stol topilmadi</p>
          <p class="text-xs text-slate-400 max-w-sm">Yangi stol qo'shish uchun "+ Yangi Stol Qo'shish" tugmasini bosing</p>
          <button
            @click="openCreateTableModal"
            class="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition"
          >
            + Yangi Stol Qo'shish
          </button>
        </div>

        <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div
            v-for="table in filteredTables"
            :key="table.id"
            @click="selectTable(table)"
            class="p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden min-h-[170px] btn-interactive"
            :class="[
              table.status === 'occupied'
                ? 'bg-rose-500/5 dark:bg-rose-950/20 border-rose-500/40 hover:border-rose-500 shadow-sm'
                : table.status === 'cleaning'
                ? 'bg-blue-500/5 dark:bg-blue-950/20 border-blue-500/40 hover:border-blue-500'
                : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 shadow-sm'
            ]"
          >
            <!-- Top table header -->
            <div class="flex items-start justify-between gap-1">
              <div>
                <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Sig'im: {{ table.capacity }} kishi</span>
                <h3 class="text-base font-black text-slate-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition mt-0.5">{{ table.name }}</h3>
              </div>

              <!-- Status Badge & Action Menu -->
              <div class="flex items-center gap-1">
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                  :class="[
                    table.status === 'occupied'
                      ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30'
                      : table.status === 'cleaning'
                      ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30'
                      : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  ]"
                >
                  {{ table.status === 'occupied' ? 'Band' : table.status === 'cleaning' ? 'Tozalanmoqda' : 'Bo\'sh' }}
                </span>

                <!-- Fast Actions (Edit / Delete) -->
                <button
                  type="button"
                  @click.stop="openEditTableModal(table)"
                  class="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Tahrirlash"
                >
                  <Edit2 class="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  @click.stop="confirmDeleteTable(table)"
                  class="p-1 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                  title="O'chirish"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <!-- Active Order Info -->
            <div v-if="table.orders?.[0]" class="my-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-1">
              <div class="flex items-center justify-between text-[11px]">
                <span class="text-slate-500 dark:text-slate-400 font-mono">{{ table.orders[0].orderNumber }}</span>
                <span class="font-bold text-amber-600 dark:text-amber-400 font-mono">{{ formatCurrency(table.orders[0].total) }}</span>
              </div>
              <p class="text-[10px] text-slate-500 dark:text-slate-400 truncate">Ofitsiant: {{ table.orders[0].waiter?.fullName || 'Ofitsiant' }}</p>
            </div>

            <div v-else class="text-center py-2 text-slate-400 dark:text-slate-600 text-xs">
              Buyurtma yo'q
            </div>

            <!-- Bottom Action prompt -->
            <div class="pt-2 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition">
              <span>{{ table.status === 'occupied' ? 'Buyurtmani ko\'rish' : 'Buyurtma olish' }}</span>
              <ArrowRight class="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MAIN VIEW 2: STOL BUYURTMA OLISH OYNASI (WAITER POS) -->
    <div v-else class="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
      <!-- Left Menu & Dishes (60%) -->
      <div class="flex-1 flex flex-col glass-card rounded-2xl p-4 overflow-hidden">
        <!-- Category Selector & Search -->
        <div class="flex flex-col sm:flex-row gap-3 mb-4 shrink-0">
          <div class="flex-1">
            <AppInput
              v-model="menuSearch"
              placeholder="Taom yoki ichimlik qidirish..."
              :icon="Search"
            />
          </div>

          <div class="flex items-center space-x-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
            <button
              @click="selectedCategory = ''"
              class="px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition"
              :class="selectedCategory === '' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
            >
              Barchasi
            </button>
            <button
              v-for="cat in categories"
              :key="cat.id"
              @click="selectedCategory = cat.id"
              class="px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition"
              :class="selectedCategory === cat.id ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
            >
              {{ cat.name }}
            </button>
          </div>
        </div>

        <!-- Dishes Grid -->
        <div class="flex-1 overflow-y-auto pr-1">
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <div
              v-for="prod in filteredMenu"
              :key="prod.id"
              @click="addDishToTable(prod)"
              class="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 transition cursor-pointer flex flex-col justify-between group shadow-sm btn-interactive"
            >
              <div class="w-full h-20 rounded-xl bg-slate-200 dark:bg-slate-900 overflow-hidden mb-2 relative">
                <img v-if="prod.imageUrl" :src="prod.imageUrl" class="w-full h-full object-cover group-hover:scale-105 transition" />
                <div v-else class="w-full h-full flex items-center justify-center text-xl">🍕</div>
              </div>

              <div>
                <h4 class="font-bold text-xs text-slate-900 dark:text-white line-clamp-1 group-hover:text-amber-500 transition">{{ prod.name }}</h4>
                <p class="text-[11px] font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">{{ formatCurrency(prod.salePrice) }}</p>
              </div>

              <div class="mt-2 flex justify-end">
                <span class="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 font-bold flex items-center justify-center text-xs transition">
                  +
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Table Order Cart & Controls (40%) -->
      <div class="w-full lg:w-96 flex flex-col glass-card rounded-2xl p-4 overflow-hidden shrink-0">
        <!-- Table Cart Header -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span class="text-xs font-bold text-amber-500 uppercase tracking-wider">Tanlangan Stol:</span>
            <h2 class="text-lg font-black text-slate-900 dark:text-white">{{ selectedTable.name }}</h2>
          </div>
          <span
            class="px-2.5 py-1 rounded-full text-xs font-bold"
            :class="selectedTable.status === 'occupied' ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400' : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'"
          >
            {{ selectedTable.status === 'occupied' ? '🔴 Band' : '🟢 Bo\'sh' }}
          </span>
        </div>

        <!-- Ordered Items list -->
        <div class="flex-1 overflow-y-auto py-3 space-y-3">
          <!-- Existing Order on Table -->
          <div v-if="existingItems.length > 0" class="space-y-1.5">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avval kiritilgan buyurtmalar:</span>
            <div
              v-for="item in existingItems"
              :key="item.id"
              class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
            >
              <div>
                <p class="font-bold text-slate-900 dark:text-white">{{ item.product?.name || item.name }}</p>
                <span class="text-[11px] text-slate-500 font-mono">{{ item.quantity }} x {{ formatCurrency(item.unitPrice || item.price) }}</span>
              </div>
              <div class="text-right">
                <span class="font-bold text-slate-900 dark:text-white font-mono">{{ formatCurrency(item.total || (item.quantity * item.unitPrice)) }}</span>
                <span class="block text-[9px] font-bold text-emerald-500">Oshxonada</span>
              </div>
            </div>
          </div>

          <!-- New Selected Dishes -->
          <div v-if="newItems.length > 0" class="space-y-1.5">
            <span class="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">Yangi qo'shilganlar:</span>
            <div
              v-for="item in newItems"
              :key="item.product.id"
              class="p-2.5 rounded-xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/30 flex items-center justify-between text-xs"
            >
              <div class="flex-1 min-w-0 pr-2">
                <p class="font-bold text-slate-900 dark:text-white truncate">{{ item.product.name }}</p>
                <span class="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">{{ formatCurrency(item.product.salePrice) }}</span>
              </div>

              <!-- Quantity Controls -->
              <div class="flex items-center space-x-2">
                <div class="flex items-center space-x-1">
                  <button
                    @click="item.quantity > 1 ? item.quantity-- : newItems = newItems.filter(i => i.product.id !== item.product.id)"
                    class="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold"
                  >-</button>
                  <span class="w-6 text-center font-bold font-mono">{{ item.quantity }}</span>
                  <button
                    @click="item.quantity++"
                    class="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold"
                  >+</button>
                </div>
                <span class="font-black text-slate-900 dark:text-white font-mono min-w-[60px] text-right">
                  {{ formatCurrency(item.product.salePrice * item.quantity) }}
                </span>
              </div>
            </div>
          </div>

          <div v-if="existingItems.length === 0 && newItems.length === 0" class="text-center py-12 text-slate-400 text-xs">
            Stolga qo'shish uchun chap tomondan taomlarni tanlang
          </div>
        </div>

        <!-- Total Sum & Action Buttons -->
        <div class="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3 shrink-0">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-500">Jami Stol Summasi:</span>
            <span class="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">{{ formatCurrency(orderTotalSum) }}</span>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <!-- Send to Kitchen (KDS) -->
            <button
              @click="sendToKitchen"
              :disabled="newItems.length === 0 || sending"
              class="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black text-xs shadow-md flex items-center justify-center gap-1.5 transition btn-interactive"
            >
              <Flame class="w-4 h-4 fill-slate-950" />
              <span>{{ sending ? 'Yuborilmoqda...' : 'Oshxonaga Yuborish' }}</span>
            </button>

            <!-- Pre-Bill / Print Check -->
            <button
              @click="openPreBillModal"
              :disabled="existingItems.length === 0 && newItems.length === 0"
              class="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition btn-interactive"
            >
              <Receipt class="w-4 h-4" />
              <span>Pre-Chek (Hisob)</span>
            </button>
          </div>

          <!-- Direct Table Payment & Close Bill Button -->
          <button
            @click="openTablePayModal"
            :disabled="orderTotalSum <= 0 || payingTable"
            class="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-98 disabled:opacity-50 text-white font-black text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition btn-interactive"
          >
            <CheckCircle2 class="w-5 h-5" />
            <span>{{ payingTable ? 'Hisob yopilmoqda...' : 'To\'lovni Qabul Qilish (Hisobni Yopish)' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- PRE-BILL MODAL -->
    <div v-if="showPreBillModal" class="modal-overlay" @click.self="showPreBillModal = false">
      <div class="modal-container max-w-sm" @click.stop>
        <div class="modal-header">
          <h3 class="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt class="w-5 h-5 text-amber-500" />
            <span>Pre-Chek (Oraliq Hisob)</span>
          </h3>
          <button @click="showPreBillModal = false" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"><X class="w-5 h-5" /></button>
        </div>

        <div class="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-3 font-mono">
          <div class="text-center pb-2 border-b border-dashed border-slate-300 dark:border-slate-700">
            <h4 class="font-black text-sm">{{ selectedTable?.name }}</h4>
            <p class="text-[10px] text-slate-500">Pre-Hisob v-1.0</p>
          </div>

          <div class="space-y-1.5">
            <div v-for="item in preBillData?.items" :key="item.id" class="flex justify-between">
              <span>{{ item.name }} x{{ item.quantity }}</span>
              <span>{{ formatCurrency(item.total) }}</span>
            </div>
          </div>

          <div class="pt-2 border-t border-dashed border-slate-300 dark:border-slate-700 space-y-1">
            <div class="flex justify-between text-slate-500">
              <span>Oraliq summa:</span>
              <span>{{ formatCurrency(preBillData?.subtotal) }}</span>
            </div>
            <div class="flex justify-between text-amber-600 dark:text-amber-400">
              <span>Xizmat haqi ({{ preBillData?.serviceChargePercent }}%):</span>
              <span>+{{ formatCurrency(preBillData?.serviceFee) }}</span>
            </div>
            <div class="flex justify-between text-base font-black text-emerald-600 dark:text-emerald-400 border-t border-slate-200 dark:border-slate-800 pt-1.5">
              <span>JAMI TO'LOV:</span>
              <span>{{ formatCurrency(preBillData?.grandTotal) }}</span>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-3 font-sans">
            <button @click="showPreBillModal = false" class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
              Yopish
            </button>
            <button @click="printReceipt" class="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold flex items-center gap-1.5 btn-interactive">
              <Printer class="w-4 h-4" />
              <span>Chop Etish</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- TABLE CREATE / EDIT MODAL -->
    <Teleport to="body">
      <div v-if="isTableModalOpen" @click.self="isTableModalOpen = false" class="modal-overlay">
        <div class="modal-container max-w-md" @click.stop>
          <div class="modal-header">
            <h3 class="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <UtensilsCrossed class="w-5 h-5 text-amber-500" />
              <span>{{ editingTableId ? 'Stol Ma\'lumotlarini Tahrirlash' : 'Yangi Stol Qo\'shish' }}</span>
            </h3>
            <button @click="isTableModalOpen = false" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white">
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="modal-body space-y-4">
            <form @submit.prevent="saveTable" class="space-y-4 text-xs">
              <!-- Fast Name Presets -->
              <div>
                <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tezkor Nomi Shablonlari:</label>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    v-for="preset in ['Stol', 'VIP Zal', 'Terassa', 'Xontaxta', 'Kabina']"
                    :key="preset"
                    @click="applyTablePreset(preset)"
                    class="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:text-amber-600 border border-slate-200 dark:border-slate-700 transition"
                  >
                    + {{ preset }}
                  </button>
                </div>
              </div>

              <!-- Table Name -->
              <div>
                <AppInput
                  v-model="tableForm.name"
                  label="Stol Nomi / Raqami *"
                  placeholder="Masalan: Stol #5, VIP Zal 1, Terassa 2"
                  :required="true"
                />
              </div>

              <!-- Capacity (Number of Seats) -->
              <div>
                <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Sig'im (O'rindiqlar soni) *</label>
                <div class="flex items-center gap-2 mb-2">
                  <input
                    v-model.number="tableForm.capacity"
                    type="number"
                    min="1"
                    max="100"
                    required
                    class="w-24 px-3 py-2 rounded-xl text-center font-bold text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                  <span class="text-xs text-slate-500 dark:text-slate-400">kishilik stol</span>
                </div>

                <!-- Fast Capacity Presets -->
                <div class="flex gap-1.5">
                  <button
                    type="button"
                    v-for="cap in [2, 4, 6, 8, 12]"
                    :key="cap"
                    @click="tableForm.capacity = cap"
                    class="px-3 py-1 rounded-lg text-xs font-bold transition"
                    :class="tableForm.capacity === cap ? 'bg-amber-500 text-slate-950 shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200'"
                  >
                    {{ cap }} kishi
                  </button>
                </div>
              </div>

              <div class="pt-2">
                <AppButton type="submit" variant="primary" size="lg" class="w-full" :loading="savingTable">
                  {{ savingTable ? 'Saqlanmoqda...' : (editingTableId ? 'Stolni Yangilash' : 'Stolni Saqlash') }}
                </AppButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- TABLE PAY / CLOSE BILL MODAL -->
    <Teleport to="body">
      <div v-if="showTablePayModal" @click.self="showTablePayModal = false" class="modal-overlay">
        <div class="modal-container max-w-md" @click.stop>
          <div class="modal-header">
            <h3 class="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Receipt class="w-5 h-5 text-emerald-500" />
              <span>Stol Hisobini Yopish: {{ selectedTable?.name }}</span>
            </h3>
            <button @click="showTablePayModal = false" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white">
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="modal-body space-y-4">
            <!-- Total display -->
            <div class="text-center py-4 bg-slate-100/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span class="text-xs text-slate-500 dark:text-slate-400">To'lanishi kerak bo'lgan jami summa:</span>
              <h2 class="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                {{ formatCurrency(orderTotalSum) }}
              </h2>
            </div>

            <!-- Payment Method Selection -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">To'lov Turi:</label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="pm in [
                    { id: '1', name: 'Naqd pul', icon: Banknote },
                    { id: '2', name: 'Plastik karta', icon: CreditCard },
                    { id: '3', name: 'Click / Payme', icon: Smartphone }
                  ]"
                  :key="pm.id"
                  type="button"
                  @click="tablePaymentMethod = pm.id"
                  class="p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1.5"
                  :class="[
                    tablePaymentMethod === pm.id
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  ]"
                >
                  <component :is="pm.icon" class="w-4 h-4" />
                  <span>{{ pm.name }}</span>
                </button>
              </div>
            </div>

            <!-- Customer Selection (For Nasiya / Debt tracking) -->
            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
              <div class="flex items-center justify-between">
                <label class="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Users class="w-4 h-4 text-amber-500" />
                  <span>Mijoz (Nasiya / Qarzga yozish uchun):</span>
                </label>
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

              <div v-if="selectedCustomerId" class="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 font-semibold space-y-1">
                <p>👤 Tanlangan: <b>{{ selectedCustomerObj?.fullName }}</b> ({{ selectedCustomerObj?.phone || 'Tel yo\'q' }})</p>
                <p v-if="nasiyaCalcAmount > 0" class="text-rose-600 dark:text-rose-400 font-bold">
                  ⚠️ Qolgan {{ formatCurrency(nasiyaCalcAmount) }} summa ushbu mijozning Nasiya hisobiga yoziladi.
                </p>
                <p v-else class="text-emerald-600 dark:text-emerald-400 font-bold">
                  ✅ To'lov to'liq amalga oshiriladi.
                </p>
              </div>
            </div>

            <!-- Cash change / Nasiya calculation if cash selected -->
            <div v-if="tablePaymentMethod === '1'" class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
              <div>
                <label class="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {{ selectedCustomerId ? 'Mijoz to\'lagan naqd pul (0 bo\'lsa 100% Nasiya):' : 'Mijoz bergan summa:' }}
                </label>
                <CurrencyInput
                  v-model="tableCashReceived"
                  placeholder="0"
                  suffix="so'm"
                  inputClass="font-bold text-slate-900 dark:text-white"
                />
              </div>

              <!-- Quick Cash Buttons -->
              <div class="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  @click="tableCashReceived = orderTotalSum"
                  class="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition"
                >
                  Aniq summa ({{ formatCurrency(orderTotalSum) }})
                </button>
                <button
                  v-if="selectedCustomerId"
                  type="button"
                  @click="tableCashReceived = 0"
                  class="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-700 text-xs font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition"
                >
                  0 so'm (100% Nasiya)
                </button>
                <button
                  type="button"
                  v-for="amt in quickCashPresets"
                  :key="amt"
                  @click="tableCashReceived = amt"
                  class="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 hover:border-emerald-500 transition"
                >
                  {{ formatCurrency(amt) }}
                </button>
              </div>

              <!-- Qaytim -->
              <div v-if="tableCashReceived > orderTotalSum" class="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800 text-xs">
                <span class="text-slate-500 dark:text-slate-400 font-semibold">Qaytim (Mijozga qaytariladi):</span>
                <span class="font-bold font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                  {{ formatCurrency(tableCashReceived - orderTotalSum) }}
                </span>
              </div>

              <!-- Warning if not full and no customer selected -->
              <div v-else-if="!selectedCustomerId && tableCashReceived < orderTotalSum" class="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                <span>⚠️ Nasiyaga yozish uchun yuqoridan Mijozni tanlang, aks holda to'liq summani kiriting</span>
              </div>
            </div>

            <button
              @click="handlePayAndCloseTable"
              :disabled="payingTable || (!selectedCustomerId && tablePaymentMethod === '1' && tableCashReceived < orderTotalSum)"
              class="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-black text-sm shadow-lg shadow-emerald-500/25 transition flex items-center justify-center space-x-2 btn-interactive"
            >
              <CheckCircle2 class="w-5 h-5" />
              <span>{{ payingTable ? 'Hisob yopilmoqda...' : (selectedCustomerId && nasiyaCalcAmount > 0 ? `Nasiya (${formatCurrency(nasiyaCalcAmount)}) bilan Yopish` : 'To\'lovni Yakunlash & Stolni Bo\'shatish') }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- QUICK NEW CUSTOMER MODAL -->
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
              <AppButton type="submit" variant="primary" class="w-full" :loading="savingCustomer">
                {{ savingCustomer ? 'Saqlanmoqda...' : 'Mijozni Saqlash & Tanlash' }}
              </AppButton>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Final Receipt Modal (Official check) -->
    <ReceiptModal
      v-if="completedTableOrder"
      :order="completedTableOrder"
      @close="completedTableOrder = null"
    />

    <!-- Shift Modal -->
    <ShiftModal
      :is-open="shiftModal.open"
      :mode="shiftModal.mode"
      @close="shiftModal.open = false"
      @opened="onShiftOpened"
      @closed="onShiftClosed"
    />

    <!-- Delete Confirmation Modal -->
    <AppConfirmDialog
      :open="confirmModal.open"
      :title="confirmModal.title"
      :message="confirmModal.message"
      variant="danger"
      confirm-text="Ha, o'chirish"
      @confirm="confirmModal.onConfirm"
      @cancel="confirmModal.open = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../services/api';
import { useFormat } from '../../composables/useFormat';
import {
  UtensilsCrossed,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Search,
  Flame,
  Receipt,
  CreditCard,
  Printer,
  Plus,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  Users,
  Building,
  Banknote,
  Smartphone,
  Sun,
  Moon,
  Lock,
} from 'lucide-vue-next';

import SkeletonLoader from '../../components/SkeletonLoader.vue';
import AppInput from '../../components/AppInput.vue';
import AppButton from '../../components/AppButton.vue';
import AppStatCard from '../../components/AppStatCard.vue';
import AppConfirmDialog from '../../components/AppConfirmDialog.vue';
import CurrencyInput from '../../components/CurrencyInput.vue';
import ReceiptModal from '../../components/ReceiptModal.vue';
import AppSelect from '../../components/AppSelect.vue';
import PhoneInput from '../../components/PhoneInput.vue';
import ShiftModal from '../../components/ShiftModal.vue';
import { useToast } from '../../composables/useToast';
import { useDataStore } from '../../stores/data.store';
import { useShiftStore } from '../../stores/shift.store';

const router = useRouter();
const toast = useToast();
const dataStore = useDataStore();
const shiftStore = useShiftStore();
const { formatCurrency, formatDateTime } = useFormat();

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
  toast.success('Kassa smenasi muvaffaqiyatli ochildi! Endi stollarni band qilishingiz mumkin.', 'Smena Ochildi');
};

const onShiftClosed = () => {
  shiftStore.currentShift = null;
  shiftModal.value.open = false;
  selectedTable.value = null;
  toast.info('Kassa smenasi yopildi.', 'Smena Yopildi');
};

const loading = ref(false);
const sending = ref(false);
const savingTable = ref(false);
const tables = computed(() => dataStore.tables);
const categories = computed(() => dataStore.categories);
const products = computed(() => dataStore.products);
const customers = computed(() => dataStore.customers || []);

const selectedTable = ref<any>(null);
const selectedCategory = ref('');
const menuSearch = ref('');
const tableSearch = ref('');
const statusFilter = ref<'all' | 'available' | 'occupied'>('all');

const newItems = ref<any[]>([]);
const existingItems = ref<any[]>([]);

const showPreBillModal = ref(false);
const preBillData = ref<any>(null);

// Table Pay state & Customer / Nasiya
const showTablePayModal = ref(false);
const tablePaymentMethod = ref('1');
const tableCashReceived = ref<number>(0);
const payingTable = ref(false);
const completedTableOrder = ref<any | null>(null);

const selectedCustomerId = ref('');
const selectedCustomerObj = computed(() => customers.value.find(c => c.id === selectedCustomerId.value));
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

const nasiyaCalcAmount = computed(() => {
  if (!selectedCustomerId.value) return 0;
  const cash = tableCashReceived.value || 0;
  return Math.max(0, orderTotalSum.value - cash);
});

// Table Modal & Form state
const isTableModalOpen = ref(false);
const editingTableId = ref<string | null>(null);
const tableForm = ref({
  name: '',
  capacity: 4,
});

const confirmModal = ref<{
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => Promise<void> | void;
}>({
  open: false,
  title: 'Tasdiqlash',
  message: '',
  onConfirm: () => {},
});

// KPI Computeds
const freeTablesCount = computed(() => {
  return tables.value.filter((t) => t.status !== 'occupied').length;
});

const occupiedTablesCount = computed(() => {
  return tables.value.filter((t) => t.status === 'occupied').length;
});

const totalCapacity = computed(() => {
  return tables.value.reduce((sum, t) => sum + (Number(t.capacity) || 4), 0);
});

// Filtered Tables
const filteredTables = computed(() => {
  return tables.value.filter((t) => {
    // Status filter
    if (statusFilter.value === 'available' && t.status === 'occupied') return false;
    if (statusFilter.value === 'occupied' && t.status !== 'occupied') return false;

    // Search filter
    if (tableSearch.value) {
      return t.name.toLowerCase().includes(tableSearch.value.toLowerCase());
    }
    return true;
  });
});

const loadTables = async (force = false) => {
  if (dataStore.tables.length === 0) {
    loading.value = true;
  }
  try {
    await dataStore.fetchTables(force);
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const loadMenu = async () => {
  try {
    await Promise.all([
      dataStore.fetchCategories(),
      dataStore.fetchProducts(),
    ]);
  } catch (err) {
    console.error(err);
  }
};

const filteredMenu = computed(() => {
  return products.value.filter((p) => {
    if (p.status === 'inactive') return false;
    const matchSearch = !menuSearch.value || p.name.toLowerCase().includes(menuSearch.value.toLowerCase());
    const matchCat = !selectedCategory.value || p.categoryId === selectedCategory.value;
    return matchSearch && matchCat;
  });
});

// Table CRUD Handlers
const openCreateTableModal = () => {
  editingTableId.value = null;
  tableForm.value = {
    name: `Stol #${tables.value.length + 1}`,
    capacity: 4,
  };
  isTableModalOpen.value = true;
};

const openEditTableModal = (table: any) => {
  editingTableId.value = table.id;
  tableForm.value = {
    name: table.name,
    capacity: table.capacity || 4,
  };
  isTableModalOpen.value = true;
};

const applyTablePreset = (prefix: string) => {
  const count = tables.value.filter((t) => t.name.startsWith(prefix)).length + 1;
  tableForm.value.name = `${prefix} #${count}`;
};

const saveTable = async () => {
  if (!tableForm.value.name) {
    toast.warning('Stol nomini kiriting!', 'Ogohlantirish');
    return;
  }

  savingTable.value = true;
  try {
    if (editingTableId.value) {
      await api.patch(`/restaurant/tables/${editingTableId.value}`, {
        name: tableForm.value.name,
        capacity: Number(tableForm.value.capacity) || 4,
      });
      toast.success(`"${tableForm.value.name}" muvaffaqiyatli yangilandi!`, 'Stollar');
    } else {
      await api.post('/restaurant/tables', {
        name: tableForm.value.name,
        capacity: Number(tableForm.value.capacity) || 4,
      });
      toast.success(`Yangi "${tableForm.value.name}" muvaffaqiyatli qo'shildi!`, 'Stollar');
    }

    isTableModalOpen.value = false;
    dataStore.invalidate('tables');
    await loadTables(true);
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Stolni saqlashda xatolik', 'Xatolik');
  } finally {
    savingTable.value = false;
  }
};

const confirmDeleteTable = (table: any) => {
  confirmModal.value = {
    open: true,
    title: 'Stolni o\'chirish',
    message: `Haqiqatan ham "${table.name}" stolini tizimdan o'chirmoqchimisiz?`,
    onConfirm: async () => {
      try {
        await api.delete(`/restaurant/tables/${table.id}`);
        toast.success(`"${table.name}" o'chirildi!`, 'O\'chirildi');
        confirmModal.value.open = false;
        dataStore.invalidate('tables');
        await loadTables(true);
      } catch (err: any) {
        toast.error(err.response?.data?.message || err.message || 'Stolni o\'chirishda xatolik', 'Xatolik');
      }
    },
  };
};

const selectTable = (table: any) => {
  if (!shiftStore.currentShift) {
    toast.warning('Stolni band qilish yoki buyurtma kiritish uchun avval Kassa Smenasini oching!', 'Smena Yopiq');
    openShiftModal('open');
    return;
  }
  selectedTable.value = table;
  newItems.value = [];
  existingItems.value = table.orders?.[0]?.items || [];
};

const addDishToTable = (prod: any) => {
  if (!shiftStore.currentShift) {
    toast.warning('Taom qo\'shish uchun avval Kassa Smenasini oching!', 'Smena Yopiq');
    openShiftModal('open');
    return;
  }
  const existing = newItems.value.find((i) => i.product.id === prod.id);
  if (existing) {
    existing.quantity++;
  } else {
    newItems.value.push({
      product: prod,
      quantity: 1,
    });
  }
  toast.info(`"${prod.name}" stol buyurtmasiga qo'shildi`, selectedTable.value.name);
};

const orderTotalSum = computed(() => {
  const newSum = newItems.value.reduce((sum, i) => sum + i.product.salePrice * i.quantity, 0);
  const existingSum = existingItems.value.reduce((sum, i) => sum + Number(i.total), 0);
  return newSum + existingSum;
});

const sendToKitchen = async () => {
  if (!shiftStore.currentShift) {
    toast.warning('Buyurtmani oshxonaga yuborish uchun avval smenani oching!', 'Smena Yopiq');
    openShiftModal('open');
    return;
  }
  if (!selectedTable.value || newItems.value.length === 0) return;

  sending.value = true;
  try {
    const payload = {
      items: newItems.value.map((i) => ({
        productId: i.product.id,
        quantity: i.quantity,
      })),
    };

    const { data } = await api.post(`/restaurant/tables/${selectedTable.value.id}/order`, payload);
    newItems.value = [];
    existingItems.value = data.items || [];
    selectedTable.value.status = 'occupied';
    dataStore.invalidate('tables');
    await loadTables(true);
    toast.success('🔥 Buyurtma oshxonaga (KDS) muvaffaqiyatli yuborildi!', selectedTable.value.name);
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Buyurtmani oshxonaga yuborishda xatolik yuz berdi', 'Xatolik');
  } finally {
    sending.value = false;
  }
};

const openPreBillModal = async () => {
  if (!selectedTable.value) return;
  try {
    const { data } = await api.get(`/restaurant/tables/${selectedTable.value.id}/pre-bill`);
    preBillData.value = data;
    showPreBillModal.value = true;
    toast.info('Pre-chek hisobi shakllantirildi', 'Oraliq hisob');
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Pre-chek ma\'lumotlarini yuklashda xatolik', 'Xatolik');
  }
};

const quickCashPresets = computed(() => {
  const total = orderTotalSum.value;
  if (total <= 0) return [50000, 100000, 200000];
  const presets: number[] = [];
  const candidateBills = [50000, 100000, 200000, 500000];
  for (const b of candidateBills) {
    if (b > total && presets.length < 3) {
      presets.push(b);
    }
  }
  if (presets.length === 0) {
    const nextRound = Math.ceil(total / 50000) * 50000;
    presets.push(nextRound, nextRound + 50000);
  }
  return presets;
});

const openTablePayModal = () => {
  if (!shiftStore.currentShift) {
    toast.warning('Hisobni yopish uchun avval kassa smenasini oching!', 'Smena Yopiq');
    openShiftModal('open');
    return;
  }
  tableCashReceived.value = orderTotalSum.value;
  showTablePayModal.value = true;
};

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

const handlePayAndCloseTable = async () => {
  if (!selectedTable.value || orderTotalSum.value <= 0) return;

  payingTable.value = true;
  try {
    // If customer selected, allow partial paid / nasiya. Otherwise full paid.
    const actualPaid = tablePaymentMethod.value === '1'
      ? (selectedCustomerId.value ? Math.min(tableCashReceived.value || 0, orderTotalSum.value) : orderTotalSum.value)
      : orderTotalSum.value;

    let completedOrderData: any = null;
    const existingOrderId = selectedTable.value.orders?.[0]?.id;

    if (existingOrderId) {
      // 1. If there are new items, send them first
      if (newItems.value.length > 0) {
        await api.post(`/restaurant/tables/${selectedTable.value.id}/order`, {
          items: newItems.value.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity,
          })),
        }).catch(() => {});
        newItems.value = [];
      }

      // Attach customer if selected
      if (selectedCustomerId.value) {
        await api.patch(`/orders/${existingOrderId}`, { customerId: selectedCustomerId.value }).catch(() => {});
      }

      // 2. Complete active order via /orders/:id/complete
      const { data } = await api.post(`/orders/${existingOrderId}/complete`, {
        payments: [
          {
            paymentMethodId: tablePaymentMethod.value,
            amount: actualPaid,
          },
        ],
      });
      completedOrderData = data;
    } else {
      // Direct create & complete via /orders
      const orderItems = [
        ...existingItems.value.map((i: any) => ({
          productId: i.productId || i.product?.id,
          quantity: i.quantity,
          unitPrice: Number(i.unitPrice || i.price),
        })),
        ...newItems.value.map((i: any) => ({
          productId: i.product?.id,
          quantity: i.quantity,
          unitPrice: Number(i.product?.salePrice),
        })),
      ];

      const { data } = await api.post('/orders', {
        orderType: 'restaurant',
        customerId: selectedCustomerId.value || undefined,
        tableId: selectedTable.value.id,
        tableName: selectedTable.value.name,
        tableNumber: selectedTable.value.name,
        items: orderItems,
        payments: [
          {
            paymentMethodId: tablePaymentMethod.value,
            amount: actualPaid,
          },
        ],
      });
      completedOrderData = data;
    }

    // Free table status
    await api.patch(`/restaurant/tables/${selectedTable.value.id}/status`, { status: 'available' }).catch(() => {});

    completedOrderData.orderType = 'restaurant';
    completedOrderData.tableNumber = selectedTable.value.name;
    if (selectedCustomerObj.value) {
      completedOrderData.customer = selectedCustomerObj.value;
    }

    completedTableOrder.value = completedOrderData;
    showTablePayModal.value = false;
    showPreBillModal.value = false;

    // 3. Record in active shift
    if (actualPaid > 0) {
      shiftStore.recordSale(
        actualPaid,
        tablePaymentMethod.value === '1' ? 'cash' : (tablePaymentMethod.value === '2' ? 'card' : 'other')
      );
    }

    if (selectedCustomerId.value && nasiyaCalcAmount.value > 0) {
      toast.info(
        `"${selectedTable.value.name}" hisobi yopildi. Qolgan ${formatCurrency(nasiyaCalcAmount.value)} "${selectedCustomerObj.value?.fullName}" nomiga nasiya qilib yozildi!`,
        'Nasiyaga Yopildi'
      );
      dataStore.invalidate('customers');
    } else {
      toast.success(`"${selectedTable.value.name}" hisobi muvaffaqiyatli yopildi!`, 'Hisob Yopildi');
    }

    // 4. Refresh table list and clear selection
    dataStore.invalidate('tables');
    await loadTables(true);
    selectedTable.value = null;
    newItems.value = [];
    existingItems.value = [];
    selectedCustomerId.value = '';
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Hisobni yopishda xatolik', 'Xatolik');
  } finally {
    payingTable.value = false;
  }
};

const redirectToCheckout = () => {
  router.push('/pos');
};

onMounted(() => {
  loadTables();
  loadMenu();
  dataStore.fetchCustomers();
  shiftStore.fetchCurrentShift();
});
</script>
