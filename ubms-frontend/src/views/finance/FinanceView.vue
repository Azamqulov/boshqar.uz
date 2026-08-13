<template>
  <div class="space-y-6 pb-12">
    <!-- Top Header & Actions -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <span>Moliya va Savdo Hisoboti</span>
          <span
            class="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
            Real-vaqt
          </span>
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Tushumlar, sotilgan tovarlar, tannarx (COGS), xarajatlar va sof foyda hisoboti
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <!-- Date Period Selector -->
        <div
          class="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
          <button v-for="p in periods" :key="p.id" @click="selectPeriod(p.id)"
            class="px-2.5 py-1.5 rounded-lg transition" :class="[
              activePeriod === p.id
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            ]">
            {{ p.label }}
          </button>
        </div>

        <button @click="loadFinance(true)" :disabled="loading"
          class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
          title="Yangilash">
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
        </button>

        <AppButton variant="danger" size="md" :icon="Plus" @click="isExpenseModalOpen = true">
          Xarajat Kiritish
        </AppButton>
      </div>
    </div>

    <!-- 1. Primary KPI Metric Cards -->
    <SkeletonLoader v-if="loading && !summary" variant="kpi" />

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <AppStatCard
        title="Jami Tushum (Revenue)"
        :value="formatCurrency(summary.totalRevenue)"
        :subtitle="`${summary.salesCount || 0} ta chek savdo`"
        :icon="DollarSign"
        variant="emerald"
      />

      <AppStatCard
        title="Sotilgan Mahsulot Tannarxi"
        :value="formatCurrency(summary.cogs)"
        subtitle="Jami sotilgan tovarlar tannarxi (COGS)"
        :icon="Boxes"
        variant="amber"
      />

      <AppStatCard
        title="Operatsion Xarajatlar"
        :value="formatCurrency(summary.totalExpenses)"
        subtitle="Ijara, maosh, kommunal va boshqalar"
        :icon="TrendingDown"
        variant="rose"
      />

      <AppStatCard
        title="Sof Foyda (Net Profit)"
        :value="formatCurrency(summary.netProfit)"
        :subtitle="`Marja: ${summary.profitMargin || 0}%`"
        :icon="TrendingUp"
        variant="blue"
      />
    </div>

    <!-- 2. Secondary Mini KPI Bar (Payment Methods Breakdown) -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div
        class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <div
          class="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
          <Banknote class="w-5 h-5" />
        </div>
        <div class="min-w-0">
          <span class="text-[10px] font-bold text-slate-400 uppercase">Naqd Pulda</span>
          <p class="text-sm font-black text-slate-800 dark:text-slate-100 font-mono truncate">
            {{ formatCurrency(summary.paymentBreakdown?.cash || 0) }}
          </p>
        </div>
      </div>

      <div
        class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <div
          class="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
          <CreditCard class="w-5 h-5" />
        </div>
        <div class="min-w-0">
          <span class="text-[10px] font-bold text-slate-400 uppercase">Plastik Karta</span>
          <p class="text-sm font-black text-slate-800 dark:text-slate-100 font-mono truncate">
            {{ formatCurrency(summary.paymentBreakdown?.card || 0) }}
          </p>
        </div>
      </div>

      <div
        class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <div
          class="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
          <Smartphone class="w-5 h-5" />
        </div>
        <div class="min-w-0">
          <span class="text-[10px] font-bold text-slate-400 uppercase">Click / Payme</span>
          <p class="text-sm font-black text-slate-800 dark:text-slate-100 font-mono truncate">
            {{ formatCurrency(summary.paymentBreakdown?.other || 0) }}
          </p>
        </div>
      </div>

      <div
        class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <div
          class="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
          <Receipt class="w-5 h-5" />
        </div>
        <div class="min-w-0">
          <span class="text-[10px] font-bold text-slate-400 uppercase">O'rtacha Chek</span>
          <p class="text-sm font-black text-slate-800 dark:text-slate-100 font-mono truncate">
            {{ formatCurrency(summary.averageTicket || 0) }}
          </p>
        </div>
      </div>
    </div>

    <!-- 3. Navigation Tabs & Global Controls -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
      <div class="flex items-center space-x-2 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
        <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
          class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap" :class="[
            activeTab === tab.id
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          ]">
          <component :is="tab.icon" class="w-4 h-4" />
          <span>{{ tab.label }}</span>
          <span v-if="tab.badge !== undefined" class="px-1.5 py-0.2 rounded-full text-[10px] font-mono" :class="[
            activeTab === tab.id
              ? 'bg-white/20 text-white'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
          ]">
            {{ tab.badge }}
          </span>
        </button>
      </div>

      <!-- View Mode Switcher (Jadval / Kartalar) -->
      <AppViewToggle v-if="activeTab !== 'breakdown'" v-model="viewMode" />
    </div>

    <!-- 4. Tab 1: Sotilgan Mahsulotlar (Sold Products Breakdown) -->
    <div v-if="activeTab === 'products'" class="space-y-4">
      <div class="glass-card rounded-2xl overflow-hidden p-4 space-y-4">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <PackageCheck class="w-4 h-4 text-emerald-500" />
              <span>Sotilgan Mahsulotlar va Xizmatlar</span>
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Har bir mahsulot bo'yicha sotuv hajmi, tushum, tannarx va sof foyda</p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <!-- Profit Filter Pills -->
            <div class="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
              <button
                type="button"
                @click="productProfitFilter = 'all'"
                class="px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap"
                :class="productProfitFilter === 'all' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
              >
                Barchasi
              </button>
              <button
                type="button"
                @click="productProfitFilter = 'profitable'"
                class="px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap"
                :class="productProfitFilter === 'profitable' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
              >
                Foydali
              </button>
              <button
                type="button"
                @click="productProfitFilter = 'loss'"
                class="px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap"
                :class="productProfitFilter === 'loss' ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
              >
                Zararli
              </button>
            </div>

            <!-- Search input -->
            <div class="relative w-full sm:w-56">
              <Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" v-model="productSearch" placeholder="Mahsulot nomi..."
                class="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100/80 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500" />
            </div>
          </div>
        </div>

        <!-- 1.1 TABLE VIEW -->
        <div v-if="viewMode === 'table'" class="overflow-hidden w-full">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-semibold whitespace-nowrap">
              <tr>
                <th class="py-3 px-3">#</th>
                <th class="py-3 px-3">Mahsulot Nomi</th>
                <th class="py-3 px-3 text-center">Sotilgan Miqdor</th>
                <th class="py-3 px-3 text-right">Jami Tushum</th>
                <th class="py-3 px-3 text-right">Jami Tannarx (COGS)</th>
                <th class="py-3 px-3 text-right">Sof Foyda</th>
                <th class="py-3 px-3 text-right">Marja (%)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200 text-xs">
              <tr v-if="filteredSoldProducts.length === 0">
                <td colspan="7" class="py-12 text-center text-slate-400 dark:text-slate-500">
                  <ShoppingCart class="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <span>Sotilgan mahsulotlar topilmadi</span>
                </td>
              </tr>
              <tr v-for="(prod, idx) in filteredSoldProducts" :key="prod.id"
                class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                <td class="py-3 px-3 font-mono text-slate-400 whitespace-nowrap">{{ idx + 1 }}</td>
                <td class="py-3 px-3 whitespace-nowrap">
                  <div class="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{{ prod.name }}</div>
                  <div v-if="prod.barcode || prod.sku" class="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">
                    {{ prod.barcode || prod.sku }}
                  </div>
                </td>
                <td class="py-3 px-3 text-center whitespace-nowrap">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono whitespace-nowrap">
                    {{ prod.quantitySold }} dona
                  </span>
                </td>
                <td class="py-3 px-4 text-right font-black text-slate-900 dark:text-white font-mono whitespace-nowrap">
                  {{ formatCurrency(prod.revenue) }}
                </td>
                <td class="py-3 px-4 text-right font-medium text-amber-600 dark:text-amber-400 font-mono whitespace-nowrap">
                  {{ formatCurrency(prod.cogs) }}
                </td>
                <td class="py-3 px-4 text-right font-black font-mono whitespace-nowrap"
                  :class="prod.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'">
                  {{ formatCurrency(prod.profit) }}
                </td>
                <td class="py-3 px-4 text-right font-bold font-mono whitespace-nowrap">
                  <span class="px-2 py-0.5 rounded text-[11px] whitespace-nowrap" :class="[
                    prod.revenue > 0 && ((prod.profit / prod.revenue) * 100) >= 20
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  ]">
                    {{ prod.revenue > 0 ? Math.round((prod.profit / prod.revenue) * 100) : 0 }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 1.2 CARD / GRID VIEW -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="prod in filteredSoldProducts"
            :key="prod.id"
            class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 hover:border-emerald-500/50 transition"
          >
            <div class="flex items-start justify-between gap-2">
              <div>
                <span class="font-bold text-sm text-slate-900 dark:text-white block">{{ prod.name }}</span>
                <span v-if="prod.barcode || prod.sku" class="text-[10px] text-slate-400 font-mono block">
                  {{ prod.barcode || prod.sku }}
                </span>
              </div>
              <span
                class="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0"
              >
                {{ prod.quantitySold }} dona
              </span>
            </div>

            <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <span class="text-slate-400 text-[10px] block">Jami Tushum</span>
                <span class="font-bold font-mono text-slate-900 dark:text-white">{{ formatCurrency(prod.revenue) }}</span>
              </div>
              <div>
                <span class="text-slate-400 text-[10px] block">Tannarx (COGS)</span>
                <span class="font-semibold font-mono text-amber-600 dark:text-amber-400">{{ formatCurrency(prod.cogs) }}</span>
              </div>
            </div>

            <div class="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <span class="text-slate-400 text-[10px] block">Sof Foyda</span>
                <span class="font-black font-mono" :class="prod.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'">
                  {{ formatCurrency(prod.profit) }}
                </span>
              </div>
              <span class="px-2 py-0.5 rounded text-[11px] font-bold font-mono" :class="[
                prod.revenue > 0 && ((prod.profit / prod.revenue) * 100) >= 20
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              ]">
                Marja: {{ prod.revenue > 0 ? Math.round((prod.profit / prod.revenue) * 100) : 0 }}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 5. Tab 2: Savdo & Cheklar Jurnali (Sales Orders Journal) -->
    <div v-else-if="activeTab === 'orders'" class="space-y-4">
      <div class="glass-card rounded-2xl overflow-hidden p-4 space-y-4">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Receipt class="w-4 h-4 text-blue-500" />
              <span>Savdolar va Cheklar Jurnali</span>
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Kassadan chiqarilgan barcha cheklar va sotuv tafsilotlari</p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <!-- Payment Filter Pills -->
            <div class="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
              <button
                type="button"
                @click="orderPaymentFilter = 'all'"
                class="px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap"
                :class="orderPaymentFilter === 'all' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
              >
                Barchasi
              </button>
              <button
                type="button"
                @click="orderPaymentFilter = 'cash'"
                class="px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap"
                :class="orderPaymentFilter === 'cash' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
              >
                Naqd
              </button>
              <button
                type="button"
                @click="orderPaymentFilter = 'card'"
                class="px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap"
                :class="orderPaymentFilter === 'card' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
              >
                Plastik
              </button>
            </div>

            <!-- Search input -->
            <div class="relative w-full sm:w-56">
              <Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" v-model="orderSearch" placeholder="Chek #, kassir yoki mijoz..."
                class="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100/80 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500" />
            </div>
          </div>
        </div>

        <!-- 2.1 TABLE VIEW -->
        <div v-if="viewMode === 'table'" class="overflow-hidden w-full">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-semibold whitespace-nowrap">
              <tr>
                <th class="py-3 px-4">Chek #</th>
                <th class="py-3 px-4">Sana va Vaqt</th>
                <th class="py-3 px-4">Kassir / Mas'ul</th>
                <th class="py-3 px-4">Mahsulotlar</th>
                <th class="py-3 px-4">To'lov Turi</th>
                <th class="py-3 px-4 text-right">Summa</th>
                <th class="py-3 px-4 text-center">Harakat</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200 text-xs">
              <tr v-if="filteredOrders.length === 0">
                <td colspan="7" class="py-12 text-center text-slate-400 dark:text-slate-500">
                  <Receipt class="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <span>Cheklar mavjud emas</span>
                </td>
              </tr>
              <tr v-for="order in filteredOrders" :key="order.id"
                class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                <td class="py-3.5 px-4 font-black font-mono text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                  {{ order.orderNumber }}
                </td>
                <td class="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono whitespace-nowrap">
                  {{ formatDate(order.completedAt || order.createdAt) }}
                </td>
                <td class="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                  {{ order.cashier?.fullName || 'Kassir' }}
                </td>
                <td class="py-3.5 px-4 max-w-xs whitespace-nowrap">
                  <div class="truncate text-slate-600 dark:text-slate-300 max-w-[200px]">
                    <span v-for="(item, i) in order.items" :key="item.id">
                      {{ item.quantity }}x {{ item.product?.name || item.service?.name }}<span
                        v-if="i < order.items.length - 1">, </span>
                    </span>
                  </div>
                </td>
                <td class="py-3.5 px-4 whitespace-nowrap">
                  <span v-for="pay in order.payments" :key="pay.id"
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold mr-1 whitespace-nowrap" :class="[
                      pay.paymentMethod?.type === 'cash'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : pay.paymentMethod?.type === 'card'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                    ]">
                    {{ pay.paymentMethod?.name || 'To\'lov' }}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-right font-black text-slate-900 dark:text-white font-mono whitespace-nowrap">
                  {{ formatCurrency(order.total) }}
                </td>
                <td class="py-3.5 px-4 text-center whitespace-nowrap">
                  <div class="flex items-center justify-center gap-1.5">
                    <button @click="viewReceipt(order)"
                      class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition flex items-center gap-1">
                      <Eye class="w-3.5 h-3.5" />
                      <span>Ko'rish</span>
                    </button>
                    <button @click="promptCancelOrder(order)"
                      class="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      title="Chekni bekor qilish / o'chirish">
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 2.2 CARD / GRID VIEW -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="order in filteredOrders"
            :key="order.id"
            class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 hover:border-blue-500/50 transition"
          >
            <div class="flex items-center justify-between">
              <span class="font-black font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                {{ order.orderNumber }}
              </span>
              <span class="text-[10px] text-slate-400 font-mono">
                {{ formatDate(order.completedAt || order.createdAt) }}
              </span>
            </div>

            <div class="text-xs space-y-1">
              <span class="text-[10px] text-slate-400 block font-semibold">Kassir: {{ order.cashier?.fullName || 'Kassir' }}</span>
              <div class="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] truncate text-slate-700 dark:text-slate-300">
                <span v-for="(item, i) in order.items" :key="item.id">
                  {{ item.quantity }}x {{ item.product?.name || item.service?.name }}<span v-if="i < order.items.length - 1">, </span>
                </span>
              </div>
            </div>

            <div class="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
              <div class="flex items-center gap-1">
                <span v-for="pay in order.payments" :key="pay.id"
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold" :class="[
                    pay.paymentMethod?.type === 'cash'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : pay.paymentMethod?.type === 'card'
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                  ]">
                  {{ pay.paymentMethod?.name || 'To\'lov' }}
                </span>
              </div>

              <div class="text-right">
                <span class="font-black text-slate-900 dark:text-white font-mono text-sm block">
                  {{ formatCurrency(order.total) }}
                </span>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button @click="viewReceipt(order)"
                class="flex-1 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center justify-center gap-1.5">
                <Eye class="w-3.5 h-3.5" />
                <span>Chekni Ko'rish</span>
              </button>
              <button @click="promptCancelOrder(order)"
                class="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition"
                title="Chekni bekor qilish">
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 6. Tab 3: Xarajatlar Jurnali (Expenses Journal) -->
    <div v-else-if="activeTab === 'expenses'" class="space-y-4">
      <div class="glass-card rounded-2xl overflow-hidden p-4 space-y-4">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingDown class="w-4 h-4 text-rose-500" />
              <span>Xarajatlar Jurnali</span>
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Biznes bo'yicha kiritilgan barcha operatsion xarajatlar</p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <!-- Category Filter -->
            <div class="w-44">
              <AppSelect v-model="expenseCategoryFilter" :options="[
                { value: '', label: 'Barcha kategoriyalar' },
                { value: 'salary', label: 'Xodimlar maoshi' },
                { value: 'rent', label: 'Ijara to\'lovi' },
                { value: 'utilities', label: 'Kommunal to\'lovlar' },
                { value: 'advertising', label: 'Reklama va marketing' },
                { value: 'transport', label: 'Transport / Yetkazib berish' },
                { value: 'other', label: 'Boshqa xarajatlar' }
              ]" />
            </div>

            <AppButton variant="danger" size="sm" :icon="Plus" @click="isExpenseModalOpen = true">
              Qo'shish
            </AppButton>
          </div>
        </div>

        <!-- 3.1 TABLE VIEW -->
        <div v-if="viewMode === 'table'" class="overflow-hidden w-full">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-semibold whitespace-nowrap">
              <tr>
                <th class="py-3 px-4">Sana</th>
                <th class="py-3 px-4">Kategoriya</th>
                <th class="py-3 px-4">Tavsif / Izoh</th>
                <th class="py-3 px-4 text-right">Summa</th>
                <th class="py-3 px-4 text-center">Harakat</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200 text-xs">
              <tr v-if="filteredExpenses.length === 0">
                <td colspan="5" class="py-12 text-center text-slate-400 dark:text-slate-500">
                  <TrendingDown class="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <span>Xarajatlar mavjud emas</span>
                </td>
              </tr>
              <tr v-for="exp in filteredExpenses" :key="exp.id"
                class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                <td class="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono whitespace-nowrap">{{ formatDate(exp.recordedAt) }}</td>
                <td class="py-3.5 px-4 font-bold uppercase text-rose-600 dark:text-rose-400 whitespace-nowrap">
                  <span class="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/10 border border-rose-500/20 whitespace-nowrap">
                    {{ getCategoryLabel(exp.category) }}
                  </span>
                </td>
                <td class="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap max-w-xs truncate">{{ exp.description || '-' }}</td>
                <td class="py-3.5 px-4 text-right font-black text-rose-600 dark:text-rose-400 font-mono whitespace-nowrap">
                  -{{ formatCurrency(exp.amount) }}
                </td>
                <td class="py-3.5 px-4 text-center whitespace-nowrap">
                  <button
                    @click="promptDeleteExpense(exp)"
                    class="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    title="Xarajatni o'chirish"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 3.2 CARD / GRID VIEW -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="exp in filteredExpenses"
            :key="exp.id"
            class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 hover:border-rose-500/50 transition"
          >
            <div class="flex items-center justify-between">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                {{ getCategoryLabel(exp.category) }}
              </span>
              <span class="text-[10px] text-slate-400 font-mono">
                {{ formatDate(exp.recordedAt) }}
              </span>
            </div>

            <p class="text-xs text-slate-700 dark:text-slate-300 font-medium line-clamp-2">
              {{ exp.description || 'Izoh ko\'rsatilmadi' }}
            </p>

            <div class="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                @click="promptDeleteExpense(exp)"
                class="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold transition flex items-center gap-1"
              >
                <Trash2 class="w-3.5 h-3.5" />
                <span>O'chirish</span>
              </button>
              <span class="font-black text-rose-600 dark:text-rose-400 font-mono text-base">
                -{{ formatCurrency(exp.amount) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 7. Tab 4: Moliyaviy Taqsimot & Tahlil (Analytics & Breakdown) -->
    <div v-else-if="activeTab === 'breakdown'" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- To'lov turlari bo'yicha tushum -->
      <div class="glass-card rounded-2xl p-5">
        <h3 class="font-bold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <CreditCard class="w-4 h-4 text-emerald-500" />
          <span>To'lov Usullari Taqsimoti</span>
        </h3>

        <div class="space-y-4 text-xs">
          <!-- Cash -->
          <div>
            <div class="flex justify-between font-bold mb-1">
              <span class="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <Banknote class="w-3.5 h-3.5" /> Naqd pul
              </span>
              <span class="font-mono text-slate-900 dark:text-white">
                {{ formatCurrency(summary.paymentBreakdown?.cash || 0) }} ({{
                  calculateShare(summary.paymentBreakdown?.cash, summary.totalRevenue) }}%)
              </span>
            </div>
            <div class="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div class="h-full bg-emerald-500 rounded-full transition-all duration-500"
                :style="{ width: `${calculateShare(summary.paymentBreakdown?.cash, summary.totalRevenue)}%` }"></div>
            </div>
          </div>

          <!-- Card -->
          <div>
            <div class="flex justify-between font-bold mb-1">
              <span class="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                <CreditCard class="w-3.5 h-3.5" /> Plastik karta
              </span>
              <span class="font-mono text-slate-900 dark:text-white">
                {{ formatCurrency(summary.paymentBreakdown?.card || 0) }} ({{
                  calculateShare(summary.paymentBreakdown?.card, summary.totalRevenue) }}%)
              </span>
            </div>
            <div class="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div class="h-full bg-blue-500 rounded-full transition-all duration-500"
                :style="{ width: `${calculateShare(summary.paymentBreakdown?.card, summary.totalRevenue)}%` }"></div>
            </div>
          </div>

          <!-- Other / Click -->
          <div>
            <div class="flex justify-between font-bold mb-1">
              <span class="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                <Smartphone class="w-3.5 h-3.5" /> Click / Payme
              </span>
              <span class="font-mono text-slate-900 dark:text-white">
                {{ formatCurrency(summary.paymentBreakdown?.other || 0) }} ({{
                  calculateShare(summary.paymentBreakdown?.other, summary.totalRevenue) }}%)
              </span>
            </div>
            <div class="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div class="h-full bg-purple-500 rounded-full transition-all duration-500"
                :style="{ width: `${calculateShare(summary.paymentBreakdown?.other, summary.totalRevenue)}%` }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Xarajatlar toifalari bo'yicha taqsimot -->
      <div class="glass-card rounded-2xl p-5">
        <h3 class="font-bold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingDown class="w-4 h-4 text-rose-500" />
          <span>Xarajatlar Toifalari Taqsimoti</span>
        </h3>

        <div v-if="Object.keys(summary.expenseBreakdown || {}).length === 0"
          class="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
          Xarajat toifalari mavjud emas
        </div>

        <div v-else class="space-y-3.5 text-xs">
          <div v-for="(amt, cat) in summary.expenseBreakdown" :key="cat">
            <div class="flex justify-between font-bold mb-1">
              <span class="text-slate-700 dark:text-slate-300">{{ getCategoryLabel(String(cat)) }}</span>
              <span class="font-mono text-rose-600 dark:text-rose-400">
                {{ formatCurrency(Number(amt)) }} ({{ calculateShare(Number(amt), summary.totalExpenses) }}%)
              </span>
            </div>
            <div class="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div class="h-full bg-rose-500 rounded-full transition-all duration-500"
                :style="{ width: `${calculateShare(Number(amt), summary.totalExpenses)}%` }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 8. Tab 5: Smenalar Jurnali & Z-Hisobotlar (Shifts & Reconciliation Log) -->
    <div v-else-if="activeTab === 'shifts'" class="space-y-4">
      <div class="glass-card rounded-2xl overflow-hidden p-4 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <History class="w-4 h-4 text-emerald-500" />
              <span>Kassa Smenalari va Z-Hisobotlar Tarixi</span>
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Har bir smena bo'yicha naqd savdo, kassa xatlovi, kamomad va ortiqcha mablag'lar jurnali
            </p>
          </div>

          <div class="flex items-center gap-2">
            <button
              @click="loadShifts"
              class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': loadingShifts }" />
              <span>Yangilash</span>
            </button>
          </div>
        </div>

        <SkeletonLoader v-if="loadingShifts" variant="table" :rows="5" />

        <div v-else-if="shiftsList.length === 0" class="p-12 text-center text-slate-400 text-xs">
          <History class="w-10 h-10 mx-auto mb-2 opacity-30" />
          <span>Hozircha smenalar ochilmagan</span>
        </div>

        <!-- 8.1 TABLE VIEW -->
        <div v-else-if="viewMode === 'table'" class="overflow-x-auto scrollbar-none">
          <table class="w-full text-left text-xs table-auto">
            <thead class="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th class="py-2.5 px-3">Smena</th>
                <th class="py-2.5 px-3">Kassir</th>
                <th class="py-2.5 px-3">Ochilgan / Yopilgan</th>
                <th class="py-2.5 px-3">Boshlang'ich</th>
                <th class="py-2.5 px-3">Naqd Savdo</th>
                <th class="py-2.5 px-3">Sanalgan</th>
                <th class="py-2.5 px-3">Tafovut</th>
                <th class="py-2.5 px-2 text-center">Holati</th>
                <th class="py-2.5 px-3 text-right">Z-Report</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200/80 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200 text-xs">
              <tr v-for="shift in shiftsList" :key="shift.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                <td class="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                  #{{ shift.shiftNumber || (shift.id?.startsWith('shift-') ? shift.id.substring(6, 12) : shift.id?.substring(0, 6)) }}
                </td>
                <td class="py-2.5 px-3 font-semibold whitespace-nowrap">
                  {{ shift.user?.fullName || shift.user?.name || authStore.user?.fullName || 'Kassir' }}
                </td>
                <td class="py-2.5 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                  <div>{{ formatDateTime(shift.openedAt) }}</div>
                  <div v-if="shift.closedAt" class="text-slate-400">➔ {{ formatDateTime(shift.closedAt) }}</div>
                </td>
                <td class="py-2.5 px-3 font-mono whitespace-nowrap">
                  {{ formatCurrency(shift.startingCash) }}
                </td>
                <td class="py-2.5 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                  +{{ formatCurrency(shift.cashSales) }}
                </td>
                <td class="py-2.5 px-3 font-mono whitespace-nowrap">
                  {{ shift.actualCash !== null ? formatCurrency(shift.actualCash) : 'Kutilmoqda...' }}
                </td>
                <td class="py-2.5 px-3 font-mono font-bold whitespace-nowrap">
                  <span
                    v-if="shift.difference !== null"
                    class="px-2 py-0.5 rounded-md text-[11px]"
                    :class="Number(shift.difference) === 0 ? 'bg-emerald-500/10 text-emerald-600' : (Number(shift.difference) < 0 ? 'bg-rose-500/10 text-rose-600' : 'bg-blue-500/10 text-blue-600')"
                  >
                    {{ Number(shift.difference) >= 0 ? '+' : '' }}{{ formatCurrency(shift.difference) }}
                  </span>
                  <span v-else class="text-slate-400">-</span>
                </td>
                <td class="py-2.5 px-2 text-center whitespace-nowrap">
                  <span
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase"
                    :class="shift.status === 'open' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'"
                  >
                    {{ shift.status === 'open' ? '🟢 Ochiq' : '🔒 Yopilgan' }}
                  </span>
                </td>
                <td class="py-2.5 px-3 text-right whitespace-nowrap">
                  <div class="flex items-center justify-end gap-1">
                    <button
                      @click="viewShiftReport(shift)"
                      class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/40 text-slate-600 hover:text-emerald-600 dark:text-slate-300 transition inline-flex items-center gap-1 text-xs font-bold"
                      title="Z-Hisobotni ko'rish"
                    >
                      <Receipt class="w-3.5 h-3.5" />
                      <span>Hisobot</span>
                    </button>
                    <button
                      @click="promptDeleteShift(shift)"
                      class="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      title="Smena yozuvini o'chirish"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 8.2 CARDS VIEW -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="shift in shiftsList"
            :key="shift.id"
            class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 hover:border-emerald-500/40 transition flex flex-col justify-between"
          >
            <div>
              <div class="flex items-center justify-between">
                <span class="font-bold text-xs text-slate-900 dark:text-white font-mono">
                  #{{ shift.id.substring(0, 8) }}
                </span>
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase"
                  :class="shift.status === 'open' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 border-slate-200 dark:border-slate-700'"
                >
                  {{ shift.status === 'open' ? '🟢 Ochiq' : '🔒 Yopilgan' }}
                </span>
              </div>
              <p class="text-xs text-slate-600 dark:text-slate-300 font-semibold mt-1">
                Kassir: {{ shift.user?.fullName || shift.user?.name || authStore.user?.fullName || 'Kassir' }}
              </p>
              <p class="text-[10px] text-slate-400 font-mono mt-0.5">
                {{ formatDateTime(shift.openedAt) }}
              </p>
            </div>

            <div class="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5 text-xs">
              <div class="flex justify-between">
                <span class="text-slate-400">Naqd savdo:</span>
                <span class="font-bold text-emerald-600 dark:text-emerald-400 font-mono">+{{ formatCurrency(shift.cashSales) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Kutilgan naqd:</span>
                <span class="font-bold font-mono">{{ formatCurrency(shift.expectedCash) }}</span>
              </div>
              <div class="flex justify-between border-t border-slate-100 dark:border-slate-700/60 pt-1">
                <span class="text-slate-400">Tafovut:</span>
                <span
                  class="font-bold font-mono"
                  :class="Number(shift.difference) < 0 ? 'text-rose-600' : 'text-emerald-600'"
                >
                  {{ shift.difference !== null ? ((Number(shift.difference) >= 0 ? '+' : '') + formatCurrency(shift.difference)) : '-' }}
                </span>
              </div>
            </div>

            <div class="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                @click="promptDeleteShift(shift)"
                class="px-2.5 py-1 rounded-lg text-rose-500 hover:bg-rose-500/10 text-xs font-bold transition flex items-center gap-1"
              >
                <Trash2 class="w-3.5 h-3.5" />
                <span>O'chirish</span>
              </button>
              <button
                @click="viewShiftReport(shift)"
                class="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 transition btn-interactive"
              >
                <Receipt class="w-3.5 h-3.5" />
                <span>Z-Hisobot</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Receipt Details Modal (Using unified ReceiptModal component) -->
    <ReceiptModal v-if="selectedOrderForReceipt" :order="selectedOrderForReceipt"
      @close="selectedOrderForReceipt = null" />

    <!-- Shift Z-Report Modal -->
    <ShiftModal
      :is-open="isShiftReportModalOpen"
      mode="report"
      :shift-data="selectedShiftForReport"
      @close="isShiftReportModalOpen = false"
    />

    <!-- Confirm Dialog for Delete Actions -->
    <AppConfirmDialog
      :open="confirmState.open"
      :title="confirmState.title"
      :message="confirmState.message"
      :variant="confirmState.variant"
      :loading="confirmState.loading"
      confirmText="Ha, o'chirish"
      cancelText="Bekor qilish"
      @confirm="executeConfirmAction"
      @cancel="confirmState.open = false"
    />

    <!-- Expense Creation Modal -->
    <Teleport to="body">
      <div v-if="isExpenseModalOpen" @click.self="isExpenseModalOpen = false" class="modal-overlay">
        <div class="modal-container max-w-md" @click.stop>
          <div class="modal-header">
            <h3 class="text-base font-bold text-slate-900 dark:text-white">Yangi Xarajat Kiritish</h3>
            <button @click="isExpenseModalOpen = false"
              class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition">
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="modal-body">
            <form @submit.prevent="createExpense" class="space-y-3 text-xs">
              <div>
                <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Xarajat Kategoriyasi</label>
                <AppSelect v-model="expenseForm.category" :options="[
                  { value: 'salary', label: 'Xodimlar maoshi' },
                  { value: 'rent', label: 'Ijara to\'lovi' },
                  { value: 'utilities', label: 'Kommunal to\'lovlar' },
                  { value: 'advertising', label: 'Reklama va marketing' },
                  { value: 'transport', label: 'Transport / Yetkazib berish' },
                  { value: 'other', label: 'Boshqa xarajatlar' }
                ]" />
              </div>

              <div>
                <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Summa *</label>
                <CurrencyInput v-model="expenseForm.amount" placeholder="0" suffix="so'm" :required="true"
                  inputClass="font-bold text-rose-600 dark:text-rose-400" />
              </div>

              <div>
                <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Izoh / Tafsilot</label>
                <textarea v-model="expenseForm.description" rows="2" placeholder="Xarajat haqida izoh..."
                  class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"></textarea>
              </div>

              <div class="mt-4">
                <AppButton type="submit" variant="danger" size="lg" class="w-full" :loading="submitting">
                  {{ submitting ? 'Saqlanmoqda...' : 'Xarajatni Saqlash' }}
                </AppButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import api, { getErrorMessage } from '../../services/api';
import { useFormat } from '../../composables/useFormat';
import {
  DollarSign,
  Boxes,
  TrendingDown,
  TrendingUp,
  PackageCheck,
  Receipt,
  CreditCard,
  Banknote,
  Smartphone,
  PieChart,
  Plus,
  RefreshCw,
  Search,
  Eye,
  Printer,
  X,
  ShoppingCart,
  History,
  Sun,
  Moon,
  Trash2,
} from 'lucide-vue-next';
import AppButton from '../../components/AppButton.vue';
import SkeletonLoader from '../../components/SkeletonLoader.vue';
import AppStatCard from '../../components/AppStatCard.vue';
import AppSelect from '../../components/AppSelect.vue';
import AppConfirmDialog from '../../components/AppConfirmDialog.vue';
import CurrencyInput from '../../components/CurrencyInput.vue';
import ReceiptModal from '../../components/ReceiptModal.vue';
import ShiftModal from '../../components/ShiftModal.vue';
import AppViewToggle from '../../components/AppViewToggle.vue';
import { useDataStore } from '../../stores/data.store';
import { useShiftStore } from '../../stores/shift.store';
import { useAuthStore } from '../../stores/auth.store';
import { useToast } from '../../composables/useToast';

const toast = useToast();
const dataStore = useDataStore();
const shiftStore = useShiftStore();
const authStore = useAuthStore();
const { formatCurrency, formatDate, formatDateTime } = useFormat();

const loading = ref(false);
const submitting = ref(false);
const viewMode = ref<'table' | 'grid'>('table');

const periods = [
  { id: 'all', label: 'Barchasi' },
  { id: 'today', label: 'Bugun' },
  { id: '7days', label: '7 kun' },
  { id: 'month', label: 'Bu oy' },
];

const summary = computed(() => dataStore.financeSummary || {
  totalRevenue: 0,
  cogs: 0,
  grossProfit: 0,
  totalExpenses: 0,
  netProfit: 0,
  salesCount: 0,
  soldProducts: [],
  recentOrders: [],
});

const expenses = computed(() => dataStore.financeExpenses || []);

const activeTab = ref<'products' | 'orders' | 'expenses' | 'breakdown' | 'shifts'>('products');
const activePeriod = ref<'all' | 'today' | '7days' | 'month'>('all');
const productSearch = ref('');
const orderSearch = ref('');
const expenseCategoryFilter = ref('');
const productProfitFilter = ref<'all' | 'profitable' | 'loss'>('all');
const orderPaymentFilter = ref<'all' | 'cash' | 'card' | 'other'>('all');

const selectedOrderForReceipt = ref<any | null>(null);
const isExpenseModalOpen = ref(false);

const shiftsList = computed(() => shiftStore.shiftsHistory);
const loadingShifts = ref(false);
const isShiftReportModalOpen = ref(false);
const selectedShiftForReport = ref<any | null>(null);

const viewShiftReport = (shift: any) => {
  selectedShiftForReport.value = shift;
  isShiftReportModalOpen.value = true;
};

const loadShifts = async () => {
  loadingShifts.value = true;
  try {
    await shiftStore.fetchShifts();
  } catch (err) {
    console.error('Failed to load shifts:', err);
  } finally {
    loadingShifts.value = false;
  }
};

const tabs = computed(() => [
  {
    id: 'products' as const,
    label: 'Sotilgan Mahsulotlar',
    icon: PackageCheck,
    badge: summary.value.soldProducts?.length || 0,
  },
  {
    id: 'orders' as const,
    label: 'Savdo & Cheklar',
    icon: Receipt,
    badge: summary.value.salesCount || 0,
  },
  {
    id: 'expenses' as const,
    label: 'Xarajatlar Jurnali',
    icon: TrendingDown,
    badge: expenses.value?.length || 0,
  },
  {
    id: 'shifts' as const,
    label: 'Smenalar Jurnali (Z-Reports)',
    icon: History,
    badge: shiftsList.value?.length || 0,
  },
  {
    id: 'breakdown' as const,
    label: 'Tahlil & Taqsimot',
    icon: PieChart,
  },
]);

const filteredSoldProducts = computed(() => {
  let list = summary.value.soldProducts || [];

  // Profit filter
  if (productProfitFilter.value === 'profitable') {
    list = list.filter((p: any) => p.profit > 0);
  } else if (productProfitFilter.value === 'loss') {
    list = list.filter((p: any) => p.profit <= 0);
  }

  // Text search
  if (!productSearch.value) return list;
  const q = productSearch.value.toLowerCase().trim();
  return list.filter(
    (p: any) =>
      p.name?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q) ||
      p.barcode?.includes(q),
  );
});

const filteredOrders = computed(() => {
  let list = summary.value.recentOrders || [];

  // Payment filter
  if (orderPaymentFilter.value !== 'all') {
    list = list.filter((o: any) => {
      const payments = o.payments || [];
      return payments.some((p: any) => {
        const t = (p.paymentMethod?.type || '').toLowerCase();
        if (orderPaymentFilter.value === 'cash') return t === 'cash';
        if (orderPaymentFilter.value === 'card') return t === 'card';
        if (orderPaymentFilter.value === 'other') return t !== 'cash' && t !== 'card';
        return true;
      });
    });
  }

  // Text search
  if (!orderSearch.value) return list;
  const q = orderSearch.value.toLowerCase().trim();
  return list.filter(
    (o: any) =>
      o.orderNumber?.toLowerCase().includes(q) ||
      o.cashier?.fullName?.toLowerCase().includes(q) ||
      o.customer?.fullName?.toLowerCase().includes(q),
  );
});

const filteredExpenses = computed(() => {
  let list = expenses.value || [];
  if (expenseCategoryFilter.value) {
    list = list.filter((e: any) => e.category === expenseCategoryFilter.value);
  }
  return list;
});

const expenseForm = ref({
  category: 'rent',
  amount: 0,
  description: '',
});

const getCategoryLabel = (category: string) => {
  const map: Record<string, string> = {
    salary: 'Xodimlar maoshi',
    rent: 'Ijara to\'lovi',
    utilities: 'Kommunal to\'lovlar',
    advertising: 'Reklama & Marketing',
    transport: 'Transport / Yetkazib berish',
    other: 'Boshqa xarajatlar',
  };
  return map[category] || category;
};

const calculateShare = (part: number | undefined, total: number | undefined) => {
  if (!part || !total || total <= 0) return 0;
  return Math.min(100, Math.round((part / total) * 100));
};

const selectPeriod = async (periodId: any) => {
  activePeriod.value = periodId;
  let dateFrom: string | undefined;
  let dateTo: string | undefined;

  const now = new Date();
  if (periodId === 'today') {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    dateFrom = today.toISOString();
  } else if (periodId === '7days') {
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    dateFrom = sevenDaysAgo.toISOString();
  } else if (periodId === 'month') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    dateFrom = startOfMonth.toISOString();
  }

  loading.value = true;
  try {
    const params = new URLSearchParams();
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);

    const [sumRes, expRes] = await Promise.all([
      api.get(`/finance/summary?${params.toString()}`),
      api.get('/finance/expenses'),
    ]);

    dataStore.financeSummary = sumRes.data;
    dataStore.financeExpenses = expRes.data || [];
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const loadFinance = async (force = false) => {
  if (!dataStore.financeSummary || force) {
    loading.value = true;
  }
  try {
    await dataStore.fetchFinance(force);
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const viewReceipt = (order: any) => {
  selectedOrderForReceipt.value = order;
};

const printReceipt = () => {
  window.print();
};

const createExpense = async () => {
  if (!expenseForm.value.amount || Number(expenseForm.value.amount) <= 0) {
    toast.warning('Xarajat summasini to\'g\'ri kiriting', 'Moliya');
    return;
  }

  submitting.value = true;
  try {
    const { data: created } = await api.post('/finance/expenses', {
      ...expenseForm.value,
      amount: Number(expenseForm.value.amount),
    });
    if (created && dataStore.financeExpenses) {
      dataStore.financeExpenses.unshift(created);
    }
    toast.success('Yangi xarajat muvaffaqiyatli saqlandi!', 'Moliya');
    isExpenseModalOpen.value = false;
    expenseForm.value = { category: 'rent', amount: 0, description: '' };
    dataStore.invalidate('finance');
    dataStore.invalidate('dashboard');
    loadFinance(true);
  } catch (err: any) {
    toast.error(getErrorMessage(err, 'Xarajatni saqlashda xatolik yuz berdi'), 'Xatolik');
  } finally {
    submitting.value = false;
  }
};

const confirmState = ref<{
  open: boolean;
  title: string;
  message: string;
  variant: 'danger' | 'default';
  loading: boolean;
  action: () => Promise<void>;
}>({
  open: false,
  title: '',
  message: '',
  variant: 'danger',
  loading: false,
  action: async () => {},
});

const executeConfirmAction = async () => {
  confirmState.value.loading = true;
  try {
    await confirmState.value.action();
    confirmState.value.open = false;
  } catch (err: any) {
    toast.error(getErrorMessage(err, 'Amalni bajarishda xatolik yuz berdi'), 'Xatolik');
  } finally {
    confirmState.value.loading = false;
  }
};

// 1. Delete Expense
const promptDeleteExpense = (exp: any) => {
  confirmState.value = {
    open: true,
    title: 'Xarajatni o\'chirish',
    message: `${formatCurrency(exp.amount)} miqdoridagi "${getCategoryLabel(exp.category)}" xarajatini o'chirishni tasdiqlaysizmi?`,
    variant: 'danger',
    loading: false,
    action: async () => {
      await api.delete(`/finance/expenses/${exp.id}`);
      if (dataStore.financeExpenses) {
        dataStore.financeExpenses = dataStore.financeExpenses.filter((e: any) => e.id !== exp.id);
      }
      toast.success('Xarajat muvaffaqiyatli o\'chirildi', 'Moliya');
      dataStore.invalidate('finance');
      dataStore.invalidate('dashboard');
      loadFinance(true);
    },
  };
};

// 2. Cancel Order
const promptCancelOrder = (order: any) => {
  confirmState.value = {
    open: true,
    title: 'Chek / Savdoni bekor qilish',
    message: `#${order.orderNumber} raqamli (${formatCurrency(order.total)}) chekni bekor qilishni tasdiqlaysizmi?`,
    variant: 'danger',
    loading: false,
    action: async () => {
      try {
        await api.post(`/orders/${order.id}/cancel`);
      } catch (err: any) {
        if (err.response?.status === 404) {
          await api.delete(`/orders/${order.id}`);
        } else {
          throw err;
        }
      }
      toast.success(`Chek #${order.orderNumber} bekor qilindi`, 'Savdo & Cheklar');
      dataStore.invalidate('finance');
      dataStore.invalidate('orders');
      dataStore.invalidate('dashboard');
      loadFinance(true);
    },
  };
};

// 3. Delete Shift
const promptDeleteShift = (shift: any) => {
  const shiftLabel = shift.shiftNumber ? `#${shift.shiftNumber}` : `#${shift.id?.substring(0, 8)}`;
  confirmState.value = {
    open: true,
    title: 'Smena yozuvini o\'chirish',
    message: `${shiftLabel} raqamli smena yozuvini tarixdan o'chirishni tasdiqlaysizmi?`,
    variant: 'danger',
    loading: false,
    action: async () => {
      shiftStore.shiftsHistory = shiftStore.shiftsHistory.filter((s: any) => s.id !== shift.id);
      localStorage.setItem('ubms_shifts_history', JSON.stringify(shiftStore.shiftsHistory));
      try {
        await api.delete(`/shifts/${shift.id}`);
      } catch {
        // Local removed
      }
      toast.success(`Smena ${shiftLabel} tarixdan o'chirildi`, 'Smenalar Jurnali');
    },
  };
};

watch(activeTab, (tab) => {
  if (tab === 'shifts') {
    loadShifts();
  }
});

onMounted(() => {
  loadFinance(true);
  loadShifts();
});
</script>
