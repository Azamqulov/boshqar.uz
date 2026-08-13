<template>
  <div class="space-y-6 pb-12">
    <!-- Top Header & Actions -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <span>Moliya va Savdo Hisoboti</span>
          <span class="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
            Real-vaqt
          </span>
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Tushumlar, sotilgan tovarlar, tannarx (COGS), xarajatlar va sof foyda hisoboti
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <!-- Date Period Selector -->
        <div class="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
          <button
            v-for="p in periods"
            :key="p.id"
            @click="selectPeriod(p.id)"
            class="px-2.5 py-1.5 rounded-lg transition"
            :class="[
              activePeriod === p.id
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            ]"
          >
            {{ p.label }}
          </button>
        </div>

        <button
          @click="loadFinance(true)"
          :disabled="loading"
          class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
          title="Yangilash"
        >
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
      <!-- Jami Tushum -->
      <div class="glass-card rounded-2xl p-5 border-l-4 border-l-emerald-500 relative overflow-hidden">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Jami Tushum (Revenue)</span>
          <div class="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <DollarSign class="w-4 h-4" />
          </div>
        </div>
        <h3 class="text-2xl font-black text-slate-900 dark:text-white mt-2 font-mono">
          {{ formatCurrency(summary.totalRevenue) }}
        </h3>
        <div class="flex items-center gap-2 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
          <span class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 font-mono">
            {{ summary.salesCount || 0 }} ta chek
          </span>
          <span>savdo amalga oshirilgan</span>
        </div>
      </div>

      <!-- COGS / Tannarx -->
      <div class="glass-card rounded-2xl p-5 border-l-4 border-l-amber-500 relative overflow-hidden">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sotilgan Mahsulot Tannarxi</span>
          <div class="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Boxes class="w-4 h-4" />
          </div>
        </div>
        <h3 class="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2 font-mono">
          {{ formatCurrency(summary.cogs) }}
        </h3>
        <div class="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
          <span>Jami sotilgan tovarlar tannarxi</span>
        </div>
      </div>

      <!-- Operatsion Xarajatlar -->
      <div class="glass-card rounded-2xl p-5 border-l-4 border-l-rose-500 relative overflow-hidden">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Operatsion Xarajatlar</span>
          <div class="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <TrendingDown class="w-4 h-4" />
          </div>
        </div>
        <h3 class="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2 font-mono">
          {{ formatCurrency(summary.totalExpenses) }}
        </h3>
        <div class="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
          <span>Ijara, maosh, kommunal va boshqa</span>
        </div>
      </div>

      <!-- Sof Foyda -->
      <div class="glass-card rounded-2xl p-5 border-l-4 border-l-teal-500 relative overflow-hidden">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sof Foyda (Net Profit)</span>
          <div class="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <TrendingUp class="w-4 h-4" />
          </div>
        </div>
        <h3 class="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2 font-mono">
          {{ formatCurrency(summary.netProfit) }}
        </h3>
        <div class="flex items-center gap-2 mt-2 text-[11px]">
          <span class="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold font-mono">
            {{ summary.profitMargin || 0 }}% marja
          </span>
          <span class="text-slate-500 dark:text-slate-400">sof rentabellik</span>
        </div>
      </div>
    </div>

    <!-- 2. Secondary Mini KPI Bar (Payment Methods Breakdown) -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
          <Banknote class="w-5 h-5" />
        </div>
        <div class="min-w-0">
          <span class="text-[10px] font-bold text-slate-400 uppercase">Naqd Pulda</span>
          <p class="text-sm font-black text-slate-800 dark:text-slate-100 font-mono truncate">
            {{ formatCurrency(summary.paymentBreakdown?.cash || 0) }}
          </p>
        </div>
      </div>

      <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
          <CreditCard class="w-5 h-5" />
        </div>
        <div class="min-w-0">
          <span class="text-[10px] font-bold text-slate-400 uppercase">Plastik Karta</span>
          <p class="text-sm font-black text-slate-800 dark:text-slate-100 font-mono truncate">
            {{ formatCurrency(summary.paymentBreakdown?.card || 0) }}
          </p>
        </div>
      </div>

      <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
          <Smartphone class="w-5 h-5" />
        </div>
        <div class="min-w-0">
          <span class="text-[10px] font-bold text-slate-400 uppercase">Click / Payme</span>
          <p class="text-sm font-black text-slate-800 dark:text-slate-100 font-mono truncate">
            {{ formatCurrency(summary.paymentBreakdown?.other || 0) }}
          </p>
        </div>
      </div>

      <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
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

    <!-- 3. Navigation Tabs -->
    <div class="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap"
        :class="[
          activeTab === tab.id
            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
        ]"
      >
        <component :is="tab.icon" class="w-4 h-4" />
        <span>{{ tab.label }}</span>
        <span
          v-if="tab.badge !== undefined"
          class="px-1.5 py-0.2 rounded-full text-[10px] font-mono"
          :class="[
            activeTab === tab.id
              ? 'bg-white/20 text-white'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
          ]"
        >
          {{ tab.badge }}
        </span>
      </button>
    </div>

    <!-- 4. Tab 1: Sotilgan Mahsulotlar (Sold Products Breakdown) -->
    <div v-if="activeTab === 'products'" class="space-y-4">
      <div class="glass-card rounded-2xl overflow-hidden">
        <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <PackageCheck class="w-4 h-4 text-emerald-500" />
              <span>Sotilgan Mahsulotlar va Xizmatlar</span>
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Har bir mahsulot bo'yicha sotuv hajmi, tushum, tannarx va sof foyda</p>
          </div>

          <div class="relative w-full sm:w-64">
            <Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              v-model="productSearch"
              placeholder="Mahsulot nomi yoki kodi..."
              class="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100/80 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-semibold">
              <tr>
                <th class="py-3 px-4">#</th>
                <th class="py-3 px-4">Mahsulot Nomi</th>
                <th class="py-3 px-4 text-center">Sotilgan Miqdor</th>
                <th class="py-3 px-4 text-right">Jami Tushum</th>
                <th class="py-3 px-4 text-right">Jami Tannarx (COGS)</th>
                <th class="py-3 px-4 text-right">Sof Foyda</th>
                <th class="py-3 px-4 text-right">Marja (%)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
              <tr v-if="filteredSoldProducts.length === 0">
                <td colspan="7" class="py-12 text-center text-slate-400 dark:text-slate-500">
                  <ShoppingCart class="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <span>Sotilgan mahsulotlar mavjud emas</span>
                </td>
              </tr>
              <tr
                v-for="(prod, idx) in filteredSoldProducts"
                :key="prod.id"
                class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
              >
                <td class="py-3.5 px-4 font-mono text-slate-400">{{ idx + 1 }}</td>
                <td class="py-3.5 px-4">
                  <div class="font-bold text-slate-900 dark:text-white">{{ prod.name }}</div>
                  <div v-if="prod.barcode || prod.sku" class="text-[10px] text-slate-400 font-mono">
                    {{ prod.barcode || prod.sku }}
                  </div>
                </td>
                <td class="py-3.5 px-4 text-center">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono">
                    {{ prod.quantitySold }} dona
                  </span>
                </td>
                <td class="py-3.5 px-4 text-right font-black text-slate-900 dark:text-white font-mono">
                  {{ formatCurrency(prod.revenue) }}
                </td>
                <td class="py-3.5 px-4 text-right font-medium text-amber-600 dark:text-amber-400 font-mono">
                  {{ formatCurrency(prod.cogs) }}
                </td>
                <td class="py-3.5 px-4 text-right font-black font-mono" :class="prod.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'">
                  {{ formatCurrency(prod.profit) }}
                </td>
                <td class="py-3.5 px-4 text-right font-bold font-mono">
                  <span
                    class="px-2 py-0.5 rounded text-[11px]"
                    :class="[
                      prod.revenue > 0 && ((prod.profit / prod.revenue) * 100) >= 20
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    ]"
                  >
                    {{ prod.revenue > 0 ? Math.round((prod.profit / prod.revenue) * 100) : 0 }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 5. Tab 2: Savdo & Cheklar Jurnali (Sales Orders Journal) -->
    <div v-else-if="activeTab === 'orders'" class="space-y-4">
      <div class="glass-card rounded-2xl overflow-hidden">
        <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Receipt class="w-4 h-4 text-blue-500" />
              <span>Savdolar va Cheklar Jurnali</span>
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Kassadan chiqarilgan barcha cheklar va sotuv tafsilotlari</p>
          </div>

          <div class="relative w-full sm:w-64">
            <Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              v-model="orderSearch"
              placeholder="Chek #, kassir yoki mijoz..."
              class="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100/80 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-semibold">
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
            <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
              <tr v-if="filteredOrders.length === 0">
                <td colspan="7" class="py-12 text-center text-slate-400 dark:text-slate-500">
                  <Receipt class="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <span>Cheklar mavjud emas</span>
                </td>
              </tr>
              <tr
                v-for="order in filteredOrders"
                :key="order.id"
                class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
              >
                <td class="py-3.5 px-4 font-black font-mono text-emerald-600 dark:text-emerald-400">
                  {{ order.orderNumber }}
                </td>
                <td class="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono">
                  {{ formatDate(order.completedAt || order.createdAt) }}
                </td>
                <td class="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                  {{ order.cashier?.fullName || 'Kassir' }}
                </td>
                <td class="py-3.5 px-4 max-w-xs">
                  <div class="truncate text-slate-600 dark:text-slate-300">
                    <span v-for="(item, i) in order.items" :key="item.id">
                      {{ item.quantity }}x {{ item.product?.name || item.service?.name }}<span v-if="i < order.items.length - 1">, </span>
                    </span>
                  </div>
                </td>
                <td class="py-3.5 px-4">
                  <span
                    v-for="pay in order.payments"
                    :key="pay.id"
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold mr-1"
                    :class="[
                      pay.paymentMethod?.type === 'cash'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : pay.paymentMethod?.type === 'card'
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                    ]"
                  >
                    {{ pay.paymentMethod?.name || 'To\'lov' }}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-right font-black text-slate-900 dark:text-white font-mono">
                  {{ formatCurrency(order.total) }}
                </td>
                <td class="py-3.5 px-4 text-center">
                  <button
                    @click="viewReceipt(order)"
                    class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition flex items-center gap-1 mx-auto"
                  >
                    <Eye class="w-3.5 h-3.5" />
                    <span>Ko'rish</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 6. Tab 3: Xarajatlar Jurnali (Expenses Journal) -->
    <div v-else-if="activeTab === 'expenses'" class="space-y-4">
      <div class="glass-card rounded-2xl overflow-hidden">
        <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingDown class="w-4 h-4 text-rose-500" />
              <span>Xarajatlar Jurnali</span>
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Biznes bo'yicha kiritilgan barcha operatsion xarajatlar</p>
          </div>

          <div class="flex items-center gap-2">
            <!-- Category Filter using AppSelect -->
            <div class="w-48">
              <AppSelect
                v-model="expenseCategoryFilter"
                :options="[
                  { value: '', label: 'Barcha kategoriyalar' },
                  { value: 'salary', label: 'Xodimlar maoshi' },
                  { value: 'rent', label: 'Ijara to\'lovi' },
                  { value: 'utilities', label: 'Kommunal to\'lovlar' },
                  { value: 'advertising', label: 'Reklama va marketing' },
                  { value: 'transport', label: 'Transport / Yetkazib berish' },
                  { value: 'other', label: 'Boshqa xarajatlar' }
                ]"
              />
            </div>

            <AppButton variant="danger" size="sm" :icon="Plus" @click="isExpenseModalOpen = true">
              Qo'shish
            </AppButton>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-semibold">
              <tr>
                <th class="py-3 px-4">Sana</th>
                <th class="py-3 px-4">Kategoriya</th>
                <th class="py-3 px-4">Tavsif / Izoh</th>
                <th class="py-3 px-4 text-right">Summa</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
              <tr v-if="filteredExpenses.length === 0">
                <td colspan="4" class="py-12 text-center text-slate-400 dark:text-slate-500">
                  <TrendingDown class="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <span>Xarajatlar mavjud emas</span>
                </td>
              </tr>
              <tr
                v-for="exp in filteredExpenses"
                :key="exp.id"
                class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
              >
                <td class="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono">{{ formatDate(exp.recordedAt) }}</td>
                <td class="py-3.5 px-4 font-bold uppercase text-rose-600 dark:text-rose-400">
                  <span class="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/10 border border-rose-500/20">
                    {{ getCategoryLabel(exp.category) }}
                  </span>
                </td>
                <td class="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">{{ exp.description || '-' }}</td>
                <td class="py-3.5 px-4 text-right font-black text-rose-600 dark:text-rose-400 font-mono">
                  -{{ formatCurrency(exp.amount) }}
                </td>
              </tr>
            </tbody>
          </table>
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
                {{ formatCurrency(summary.paymentBreakdown?.cash || 0) }} ({{ calculateShare(summary.paymentBreakdown?.cash, summary.totalRevenue) }}%)
              </span>
            </div>
            <div class="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                class="h-full bg-emerald-500 rounded-full transition-all duration-500"
                :style="{ width: `${calculateShare(summary.paymentBreakdown?.cash, summary.totalRevenue)}%` }"
              ></div>
            </div>
          </div>

          <!-- Card -->
          <div>
            <div class="flex justify-between font-bold mb-1">
              <span class="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                <CreditCard class="w-3.5 h-3.5" /> Plastik karta
              </span>
              <span class="font-mono text-slate-900 dark:text-white">
                {{ formatCurrency(summary.paymentBreakdown?.card || 0) }} ({{ calculateShare(summary.paymentBreakdown?.card, summary.totalRevenue) }}%)
              </span>
            </div>
            <div class="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                class="h-full bg-blue-500 rounded-full transition-all duration-500"
                :style="{ width: `${calculateShare(summary.paymentBreakdown?.card, summary.totalRevenue)}%` }"
              ></div>
            </div>
          </div>

          <!-- Other / Click -->
          <div>
            <div class="flex justify-between font-bold mb-1">
              <span class="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                <Smartphone class="w-3.5 h-3.5" /> Click / Payme
              </span>
              <span class="font-mono text-slate-900 dark:text-white">
                {{ formatCurrency(summary.paymentBreakdown?.other || 0) }} ({{ calculateShare(summary.paymentBreakdown?.other, summary.totalRevenue) }}%)
              </span>
            </div>
            <div class="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                class="h-full bg-purple-500 rounded-full transition-all duration-500"
                :style="{ width: `${calculateShare(summary.paymentBreakdown?.other, summary.totalRevenue)}%` }"
              ></div>
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

        <div v-if="Object.keys(summary.expenseBreakdown || {}).length === 0" class="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
          Xarajat toifalari mavjud emas
        </div>

        <div v-else class="space-y-3.5 text-xs">
          <div
            v-for="(amt, cat) in summary.expenseBreakdown"
            :key="cat"
          >
            <div class="flex justify-between font-bold mb-1">
              <span class="text-slate-700 dark:text-slate-300">{{ getCategoryLabel(String(cat)) }}</span>
              <span class="font-mono text-rose-600 dark:text-rose-400">
                {{ formatCurrency(Number(amt)) }} ({{ calculateShare(Number(amt), summary.totalExpenses) }}%)
              </span>
            </div>
            <div class="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                class="h-full bg-rose-500 rounded-full transition-all duration-500"
                :style="{ width: `${calculateShare(Number(amt), summary.totalExpenses)}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Receipt Details Modal (Using unified ReceiptModal component) -->
    <ReceiptModal
      v-if="selectedOrderForReceipt"
      :order="selectedOrderForReceipt"
      @close="selectedOrderForReceipt = null"
    />

    <!-- Expense Creation Modal -->
    <div v-if="isExpenseModalOpen" @click.self="isExpenseModalOpen = false" class="modal-overlay">
      <div class="modal-container max-w-md" @click.stop>
        <div class="modal-header">
          <h3 class="text-base font-bold text-slate-900 dark:text-white">Yangi Xarajat Kiritish</h3>
          <button @click="isExpenseModalOpen = false" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"><X class="w-5 h-5" /></button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="createExpense" class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Xarajat Kategoriyasi</label>
              <AppSelect
                v-model="expenseForm.category"
                :options="[
                  { value: 'salary', label: 'Xodimlar maoshi' },
                  { value: 'rent', label: 'Ijara to\'lovi' },
                  { value: 'utilities', label: 'Kommunal to\'lovlar' },
                  { value: 'advertising', label: 'Reklama va marketing' },
                  { value: 'transport', label: 'Transport / Yetkazib berish' },
                  { value: 'other', label: 'Boshqa xarajatlar' }
                ]"
              />
            </div>

            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Summa *</label>
              <CurrencyInput
                v-model="expenseForm.amount"
                placeholder="0"
                suffix="so'm"
                :required="true"
                inputClass="font-bold text-rose-600 dark:text-rose-400"
              />
            </div>

            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Izoh / Tafsilot</label>
              <textarea v-model="expenseForm.description" rows="2" placeholder="Xarajat haqida izoh..." class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"></textarea>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
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
  ShoppingCart
} from 'lucide-vue-next';
import AppButton from '../../components/AppButton.vue';
import SkeletonLoader from '../../components/SkeletonLoader.vue';
import AppSelect from '../../components/AppSelect.vue';
import CurrencyInput from '../../components/CurrencyInput.vue';
import ReceiptModal from '../../components/ReceiptModal.vue';
import { useDataStore } from '../../stores/data.store';
import { useToast } from '../../composables/useToast';

const toast = useToast();
const dataStore = useDataStore();
const { formatCurrency, formatDate } = useFormat();

const loading = ref(false);
const submitting = ref(false);

const activeTab = ref<'products' | 'orders' | 'expenses' | 'breakdown'>('products');
const activePeriod = ref<'all' | 'today' | '7days' | 'month'>('all');
const productSearch = ref('');
const orderSearch = ref('');
const expenseCategoryFilter = ref('');

const selectedOrderForReceipt = ref<any | null>(null);
const isExpenseModalOpen = ref(false);

const periods = [
  { id: 'all', label: 'Barchasi' },
  { id: 'today', label: 'Bugun' },
  { id: '7days', label: '7 kun' },
  { id: 'month', label: 'Shu oy' },
];

const defaultSummary = {
  totalRevenue: 0,
  totalExpenses: 0,
  cogs: 0,
  netProfit: 0,
  profitMargin: 0,
  salesCount: 0,
  averageTicket: 0,
  expenseBreakdown: {},
  paymentBreakdown: { cash: 0, card: 0, other: 0 },
  soldProducts: [],
  recentOrders: [],
};

const summary = computed(() => dataStore.financeSummary || defaultSummary);
const expenses = computed(() => dataStore.financeExpenses || []);

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
    id: 'breakdown' as const,
    label: 'Tahlil & Taqsimot',
    icon: PieChart,
  },
]);

const filteredSoldProducts = computed(() => {
  const list = summary.value.soldProducts || [];
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
  const list = summary.value.recentOrders || [];
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

onMounted(() => {
  loadFinance(true);
});
</script>
