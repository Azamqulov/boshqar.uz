<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <div class="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
            <ShieldCheck class="w-6 h-6" />
          </div>
          <div>
            <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              SuperAdmin Nazorat Markazi
              <span class="text-xs uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 font-mono font-bold">
                Platform Gov
              </span>
            </h1>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Barcha bizneslar, firma egalari (owners), foydalanuvchilar va umumiy monitoring</p>
          </div>
        </div>
      </div>

      <button
        @click="loadAllData"
        :disabled="loading"
        class="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition border border-slate-200 dark:border-slate-700 btn-interactive"
      >
        <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
        <span>Yangilash</span>
      </button>
    </div>

    <!-- Global Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- 1. Total Businesses -->
      <div class="glass-card rounded-2xl p-5 relative overflow-hidden group">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Jami Bizneslar</span>
          <div class="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Building2 class="w-5 h-5" />
          </div>
        </div>
        <p class="text-2xl font-black text-slate-900 dark:text-white mt-3 font-mono">{{ stats.totalBusinesses || 0 }} <span class="text-xs font-sans text-slate-400 font-normal">ta tenant</span></p>
        <p class="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
          <Activity class="w-3.5 h-3.5" /> Faol va sinov rejimida
        </p>
      </div>

      <!-- 2. Total Users -->
      <div class="glass-card rounded-2xl p-5 relative overflow-hidden group">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Jami Foydalanuvchilar</span>
          <div class="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Users class="w-5 h-5" />
          </div>
        </div>
        <p class="text-2xl font-black text-slate-900 dark:text-white mt-3 font-mono">{{ stats.totalUsers || 0 }} <span class="text-xs font-sans text-slate-400 font-normal">nafar</span></p>
        <p class="text-[11px] text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1 font-medium">
          <UserCheck class="w-3.5 h-3.5" /> Barcha filiallar kesimida
        </p>
      </div>

      <!-- 3. Total GMV -->
      <div class="glass-card rounded-2xl p-5 relative overflow-hidden group">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Umumiy Savdo (GMV)</span>
          <div class="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <DollarSign class="w-5 h-5" />
          </div>
        </div>
        <p class="text-2xl font-black text-slate-900 dark:text-white mt-3 font-mono">{{ formatCurrency(stats.totalGMV || 0) }}</p>
        <p class="text-[11px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1 font-medium">
          <TrendingUp class="w-3.5 h-3.5" /> Platforma umumiy aylanmasi
        </p>
      </div>

      <!-- 4. Total Orders & Products -->
      <div class="glass-card rounded-2xl p-5 relative overflow-hidden group">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Jami Buyurtmalar</span>
          <div class="p-2.5 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
            <ShoppingBag class="w-5 h-5" />
          </div>
        </div>
        <p class="text-2xl font-black text-slate-900 dark:text-white mt-3 font-mono">{{ stats.totalOrders || 0 }} <span class="text-xs font-sans text-slate-400 font-normal">ta chek</span></p>
        <p class="text-[11px] text-teal-600 dark:text-teal-400 mt-1 flex items-center gap-1 font-medium">
          <Package class="w-3.5 h-3.5" /> {{ stats.totalProducts || 0 }} ta tovar katalogda
        </p>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs overflow-x-auto">
      <button
        @click="activeTab = 'owners'"
        class="px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 whitespace-nowrap btn-interactive"
        :class="activeTab === 'owners' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'"
      >
        <Crown class="w-4 h-4" />
        <span>Firma Egalari (Owners)</span>
      </button>

      <button
        @click="activeTab = 'businesses'"
        class="px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 whitespace-nowrap btn-interactive"
        :class="activeTab === 'businesses' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'"
      >
        <Building2 class="w-4 h-4" />
        <span>Barcha Bizneslar ({{ businesses.length }})</span>
      </button>

      <button
        @click="activeTab = 'users'"
        class="px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 whitespace-nowrap btn-interactive"
        :class="activeTab === 'users' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'"
      >
        <Users class="w-4 h-4" />
        <span>Foydalanuvchilar ({{ users.length }})</span>
      </button>

      <button
        @click="activeTab = 'plans'"
        class="px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 whitespace-nowrap btn-interactive"
        :class="activeTab === 'plans' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'"
      >
        <CreditCard class="w-4 h-4" />
        <span>Tarif Rejalari (SaaS)</span>
      </button>

      <button
        @click="activeTab = 'audit'"
        class="px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 whitespace-nowrap btn-interactive"
        :class="activeTab === 'audit' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'"
      >
        <ShieldCheck class="w-4 h-4" />
        <span>Global Audit Tarixi</span>
      </button>
    </div>

    <!-- TAB 1: OWNERS MONITORING (PHASE 1) -->
    <div v-if="activeTab === 'owners'" class="space-y-4">
      <!-- Search & Filters -->
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex-1">
          <AppInput
            v-model="ownerSearch"
            placeholder="Owner ismi, telefon yoki biznes nomi bo'yicha qidiruv..."
            :icon="Search"
            @input="loadOwners"
          />
        </div>

        <div class="w-full sm:w-48">
          <AppSelect
            v-model="ownerPlanFilter"
            @change="loadOwners"
            :options="[
              { value: '', label: 'Barcha tariflar' },
              { value: 'Free', label: 'Free (Bepul)' },
              { value: 'Pro', label: 'Pro' },
              { value: 'Business', label: 'Business' }
            ]"
          />
        </div>

        <div class="w-full sm:w-48">
          <AppSelect
            v-model="ownerStatusFilter"
            @change="loadOwners"
            :options="[
              { value: '', label: 'Barcha statuslar' },
              { value: 'active', label: 'Faol' },
              { value: 'blocked', label: 'Bloklangan' }
            ]"
          />
        </div>
      </div>

      <!-- Owners Table -->
      <div class="glass-card rounded-2xl overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase font-semibold">
              <tr>
                <th class="py-3 px-4">Firma Egasi (Owner)</th>
                <th class="py-3 px-4">Biznes Nomi</th>
                <th class="py-3 px-4">Sohasi</th>
                <th class="py-3 px-4">Tarif Rejasi</th>
                <th class="py-3 px-4">Jami Savdo (GMV)</th>
                <th class="py-3 px-4">Holati</th>
                <th class="py-3 px-4 text-right">Monitoring</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
              <tr v-if="owners.length === 0">
                <td colspan="7" class="py-8 text-center text-slate-400 dark:text-slate-500">Firma egalari topilmadi</td>
              </tr>
              <tr v-for="o in owners" :key="o.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                <td class="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-xs">
                    {{ o.fullName.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <span class="block">{{ o.fullName }}</span>
                    <span class="text-[10px] text-slate-400 font-mono">{{ o.phone }}</span>
                  </div>
                </td>
                <td class="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                  {{ o.business?.name || '-' }}
                </td>
                <td class="py-3.5 px-4">
                  <span class="px-2 py-0.5 rounded uppercase text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {{ o.business?.businessType || '-' }}
                  </span>
                </td>
                <td class="py-3.5 px-4">
                  <span class="px-2 py-0.5 rounded font-bold text-[10px]" :class="getPlanBadgeClass(o.business?.plan || 'Free')">
                    {{ o.business?.plan || 'Free' }}
                  </span>
                </td>
                <td class="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {{ formatCurrency(o.business?.lifetimeGMV || 0) }}
                </td>
                <td class="py-3.5 px-4">
                  <span
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    :class="o.status === 'active' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'"
                  >
                    {{ o.status === 'active' ? 'Faol' : 'Bloklangan' }}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-right space-x-1.5">
                  <button
                    @click="openOwnerDetailModal(o.id)"
                    class="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-bold text-xs transition btn-interactive inline-flex items-center gap-1"
                  >
                    <Eye class="w-3.5 h-3.5" />
                    <span>Statistika</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 2: BUSINESSES -->
    <div v-if="activeTab === 'businesses'" class="space-y-4">
      <!-- Search & Filters -->
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex-1">
          <AppInput
            v-model="businessSearch"
            placeholder="Biznes nomi, egasi yoki telefon raqami bo'yicha qidiruv..."
            :icon="Search"
          />
        </div>
        <div class="w-full sm:w-56">
          <AppSelect
            v-model="businessStatusFilter"
            :options="[
              { value: '', label: 'Barcha statuslar' },
              { value: 'active', label: 'Faol' },
              { value: 'suspended', label: 'To\'xtatilgan' },
              { value: 'cancelled', label: 'Bekor qilingan' }
            ]"
          />
        </div>
      </div>

      <!-- Businesses Table -->
      <div class="glass-card rounded-2xl overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase font-semibold">
              <tr>
                <th class="py-3 px-4">Biznes Nomi</th>
                <th class="py-3 px-4">Faoliyat Turi</th>
                <th class="py-3 px-4">Egasi (Aloqa)</th>
                <th class="py-3 px-4 text-center">Filial / Tovar / Chek</th>
                <th class="py-3 px-4">Tarif</th>
                <th class="py-3 px-4">Holati</th>
                <th class="py-3 px-4 text-right">Boshqaruv</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
              <tr v-if="filteredBusinesses.length === 0">
                <td colspan="7" class="py-8 text-center text-slate-400 dark:text-slate-500">Hech qanday biznes topilmadi</td>
              </tr>
              <tr v-for="b in filteredBusinesses" :key="b.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                <td class="py-3 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <div class="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400">
                    {{ b.name.charAt(0) }}
                  </div>
                  <div>
                    <span>{{ b.name }}</span>
                    <p class="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{{ formatDate(b.createdAt) }}</p>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <span class="px-2 py-0.5 rounded uppercase text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {{ b.businessType }}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <p class="font-medium text-slate-900 dark:text-slate-200">{{ b.owner?.fullName }}</p>
                  <p class="text-slate-500 dark:text-slate-400 font-mono text-[11px]">{{ b.owner?.phone }}</p>
                </td>
                <td class="py-3 px-4 text-center font-mono">
                  <span class="text-emerald-600 dark:text-emerald-400 font-bold">{{ b.branchesCount }}</span> filial ·
                  <span class="text-blue-600 dark:text-blue-400 font-bold">{{ b.productsCount }}</span> tovar ·
                  <span class="text-teal-600 dark:text-teal-400 font-bold">{{ b.ordersCount }}</span> chek
                </td>
                <td class="py-3 px-4">
                  <span class="px-2 py-0.5 rounded font-bold text-[10px]" :class="getPlanBadgeClass(b.plan)">
                    {{ b.plan }}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <span
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    :class="b.status === 'active' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'"
                  >
                    {{ b.status }}
                  </span>
                </td>
                <td class="py-3 px-4 text-right space-x-1">
                  <button
                    @click="openPlanModal(b)"
                    class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                    title="Tarifni o'zgartirish"
                  >
                    <Zap class="w-3.5 h-3.5 text-amber-500" />
                  </button>
                  <button
                    @click="toggleBusinessStatus(b)"
                    class="p-1.5 rounded-lg transition"
                    :class="b.status === 'active' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'"
                    :title="b.status === 'active' ? 'Bloklash' : 'Faollashtirish'"
                  >
                    <Ban v-if="b.status === 'active'" class="w-3.5 h-3.5" />
                    <CheckCircle v-else class="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 3: USERS -->
    <div v-if="activeTab === 'users'" class="space-y-4">
      <div class="max-w-md">
        <AppInput
          v-model="userSearch"
          placeholder="Ism, telefon yoki email bo'yicha qidiruv..."
          :icon="Search"
        />
      </div>

      <div class="glass-card rounded-2xl overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase font-semibold">
              <tr>
                <th class="py-3 px-4">Foydalanuvchi</th>
                <th class="py-3 px-4">Telefon</th>
                <th class="py-3 px-4">Biriktirilgan Bizneslar</th>
                <th class="py-3 px-4">Rol / Huquq</th>
                <th class="py-3 px-4">Holat</th>
                <th class="py-3 px-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
              <tr v-if="filteredUsers.length === 0">
                <td colspan="6" class="py-8 text-center text-slate-400 dark:text-slate-500">Foydalanuvchilar topilmadi</td>
              </tr>
              <tr v-for="u in filteredUsers" :key="u.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                <td class="py-3 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <div class="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                    {{ u.fullName.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <span>{{ u.fullName }}</span>
                    <p class="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{{ formatDate(u.createdAt) }}</p>
                  </div>
                </td>
                <td class="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono">{{ u.phone }}</td>
                <td class="py-3 px-4">
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="(biz, idx) in u.businesses"
                      :key="idx"
                      class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold border border-slate-200 dark:border-slate-700"
                    >
                      {{ biz.businessName }} ({{ biz.roleName }})
                    </span>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <span
                    class="px-2 py-0.5 rounded text-[10px] font-bold"
                    :class="u.isSuperAdmin ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'"
                  >
                    {{ u.isSuperAdmin ? 'SuperAdmin' : 'User' }}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <span
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    :class="u.status === 'active' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'"
                  >
                    {{ u.status }}
                  </span>
                </td>
                <td class="py-3 px-4 text-right space-x-1">
                  <button
                    @click="toggleSuperAdminPrivilege(u)"
                    class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-emerald-600 dark:text-emerald-400 transition"
                    :title="u.isSuperAdmin ? 'SuperAdmin huquqini olish' : 'SuperAdmin qilish'"
                  >
                    <ShieldCheck class="w-3.5 h-3.5" />
                  </button>
                  <button
                    @click="toggleUserStatus(u)"
                    class="p-1.5 rounded-lg transition"
                    :class="u.status === 'active' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'"
                    :title="u.status === 'active' ? 'Bloklash' : 'Faollashtirish'"
                  >
                    <Ban v-if="u.status === 'active'" class="w-3.5 h-3.5" />
                    <CheckCircle v-else class="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 4: PLANS -->
    <div v-if="activeTab === 'plans'" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        v-for="plan in plans"
        :key="plan.id"
        class="glass-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between border shadow-sm"
        :class="plan.name === 'Pro' ? 'border-emerald-500/50 shadow-emerald-500/10 ring-2 ring-emerald-500/20' : 'border-slate-200 dark:border-slate-800'"
      >
        <div>
          <div class="flex items-center justify-between mb-4">
            <span class="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider" :class="getPlanBadgeClass(plan.name)">
              {{ plan.name }}
            </span>
            <span class="text-xl font-black text-slate-900 dark:text-white font-mono">
              {{ Number(plan.priceMonthly) === 0 ? 'Bepul' : formatCurrency(plan.priceMonthly) }}
            </span>
          </div>

          <h3 class="text-base font-bold text-slate-900 dark:text-white mb-2">{{ plan.name }} Tarif Rejasi</h3>
          <ul class="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <li class="flex items-center gap-2">
              <CheckCircle class="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Maksimal filiallar: <strong>{{ plan.maxBranches || 'Cheksiz' }}</strong></span>
            </li>
            <li class="flex items-center gap-2">
              <CheckCircle class="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Maksimal xodimlar: <strong>{{ plan.maxUsers || 'Cheksiz' }}</strong></span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- TAB 5: AUDIT LOGS -->
    <div v-if="activeTab === 'audit'" class="glass-card rounded-2xl overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs font-mono">
          <thead class="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase font-sans font-semibold">
            <tr>
              <th class="py-3 px-4">Vaqt</th>
              <th class="py-3 px-4">Foydalanuvchi</th>
              <th class="py-3 px-4">Amal</th>
              <th class="py-3 px-4">Bo'lim</th>
              <th class="py-3 px-4">IP Manzil</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
            <tr v-if="auditLogs.length === 0">
              <td colspan="5" class="py-8 text-center text-slate-400 dark:text-slate-500 font-sans">Audit jurnallari mavjud emas</td>
            </tr>
            <tr v-for="log in auditLogs" :key="log.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
              <td class="py-3 px-4 text-slate-500 dark:text-slate-400">{{ formatDate(log.createdAt) }}</td>
              <td class="py-3 px-4 font-sans font-bold text-slate-900 dark:text-white">{{ log.user?.fullName }} ({{ log.user?.phone }})</td>
              <td class="py-3 px-4 uppercase text-emerald-600 dark:text-emerald-400 font-bold">{{ log.action }}</td>
              <td class="py-3 px-4 text-slate-700 dark:text-slate-300 font-sans">{{ log.entity }}</td>
              <td class="py-3 px-4 text-slate-400 dark:text-slate-500">{{ log.ipAddress || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- OWNER DETAIL & MONITORING MODAL (PHASE 1) -->
    <div v-if="showOwnerModal && ownerDetail" @click.self="showOwnerModal = false" class="modal-overlay">
      <div class="modal-container max-w-2xl" @click.stop>
        <div class="modal-header">
          <div class="flex items-center gap-2.5">
            <div class="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Crown class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white">{{ ownerDetail.owner?.fullName }}</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 font-mono">{{ ownerDetail.owner?.phone }} · {{ ownerDetail.business?.name }}</p>
            </div>
          </div>
          <button @click="showOwnerModal = false" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"><X class="w-5 h-5" /></button>
        </div>

        <div class="modal-body">
          <!-- 4 Stats Cards for Owner -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Jami Savdo (GMV)</span>
              <p class="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">{{ formatCurrency(ownerDetail.stats?.lifetimeGMV || 0) }}</p>
              <span class="text-[10px] text-slate-400">{{ ownerDetail.stats?.lifetimeOrdersCount || 0 }} ta chek</span>
            </div>

            <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span class="text-[10px] uppercase font-bold text-slate-400 block">30 Kunlik Savdo</span>
              <p class="text-base font-black text-blue-600 dark:text-blue-400 font-mono mt-1">{{ formatCurrency(ownerDetail.stats?.last30dGMV || 0) }}</p>
              <span class="text-[10px] text-slate-400">{{ ownerDetail.stats?.last30dOrdersCount || 0 }} ta chek</span>
            </div>

            <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Tovarlar Soni</span>
              <p class="text-base font-black text-teal-600 dark:text-teal-400 font-mono mt-1">{{ ownerDetail.business?.productsCount || 0 }} ta</p>
              <span class="text-[10px] text-slate-400">Katalogda</span>
            </div>

            <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Xodimlar Soni</span>
              <p class="text-base font-black text-amber-600 dark:text-amber-400 font-mono mt-1">{{ ownerDetail.business?.employeesCount || 0 }} nafar</p>
              <span class="text-[10px] text-slate-400">Jamoada</span>
            </div>
          </div>

          <!-- 14 Days Sales Dynamics Bar Chart -->
          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-bold text-slate-900 dark:text-white">Oxirgi 14 Kunlik Savdo Grafigi</h4>
              <span class="text-[10px] text-slate-400 font-mono">Dinamika</span>
            </div>

            <div class="h-36 flex items-end justify-between gap-1 pt-4 px-1">
              <div
                v-for="(item, idx) in ownerDetail.chartData"
                :key="idx"
                class="flex-1 flex flex-col items-center group relative h-full justify-end"
              >
                <div class="absolute -top-8 hidden group-hover:flex flex-col items-center bg-slate-900 text-white text-[10px] p-1 rounded shadow-lg z-20 whitespace-nowrap">
                  <span>{{ item.date }}</span>
                  <span class="font-bold text-emerald-400">{{ formatCurrency(item.sales) }}</span>
                </div>
                <div
                  class="w-full max-w-[20px] bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t transition-all group-hover:opacity-80"
                  :style="{ height: `${Math.max(8, (item.sales / (maxOwnerChartValue || 1)) * 100)}%` }"
                ></div>
                <span class="text-[8px] text-slate-400 mt-1 rotate-45 truncate">{{ item.date.slice(5) }}</span>
              </div>
            </div>
          </div>

          <!-- Action Controls: Status & Plan -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
            <!-- Change Plan -->
            <div class="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <label class="font-bold text-slate-900 dark:text-white block">Tarif Rejasini O'zgartirish:</label>
              <div class="flex items-center gap-2">
                <AppSelect
                  v-model="ownerDetail.business.planId"
                  :options="plans.map(p => ({ value: p.id, label: `${p.name} (${Number(p.priceMonthly) === 0 ? 'Bepul' : formatCurrency(p.priceMonthly) + '/oy'})` }))"
                  custom-class="flex-1"
                />
                <button
                  @click="saveOwnerPlan(ownerDetail.owner.id, ownerDetail.business.planId)"
                  class="px-3 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/25 transition btn-interactive"
                >
                  Saqlash
                </button>
              </div>
            </div>

            <!-- Toggle Status -->
            <div class="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-2">
              <div>
                <label class="font-bold text-slate-900 dark:text-white block">Akkaunt va Biznes Holati:</label>
                <span class="text-[11px] text-slate-500 dark:text-slate-400">
                  Hozirgi holat: <strong :class="ownerDetail.owner?.status === 'active' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'">{{ ownerDetail.owner?.status === 'active' ? 'Faol' : 'Bloklangan' }}</strong>
                </span>
              </div>
              <button
                @click="toggleOwnerStatusAction(ownerDetail.owner.id, ownerDetail.owner.status)"
                class="w-full py-2 rounded-xl font-bold text-xs transition btn-interactive flex items-center justify-center gap-1.5"
                :class="ownerDetail.owner?.status === 'active' ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20' : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20'"
              >
                <Ban v-if="ownerDetail.owner?.status === 'active'" class="w-4 h-4" />
                <CheckCircle v-else class="w-4 h-4" />
                <span>{{ ownerDetail.owner?.status === 'active' ? 'Akkauntni Bloklash' : 'Akkauntni Faollashtirish' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Change Plan for Business -->
    <div v-if="showPlanModal" @click.self="showPlanModal = false" class="modal-overlay">
      <div class="modal-container max-w-md" @click.stop>
        <div class="modal-header">
          <h3 class="text-base font-bold text-slate-900 dark:text-white">Tarif Rejasini O'zgartirish</h3>
          <button @click="showPlanModal = false" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"><X class="w-5 h-5" /></button>
        </div>

        <div class="modal-body">
          <p class="text-xs text-slate-600 dark:text-slate-300">
            <strong>{{ selectedBusiness?.name }}</strong> biznesi uchun yangi tarif rejasini tanlang:
          </p>

          <div class="space-y-2">
            <label
              v-for="p in plans"
              :key="p.id"
              class="flex items-center justify-between p-3 rounded-xl border transition cursor-pointer"
              :class="selectedPlanId === p.id ? 'border-emerald-500 bg-emerald-500/10 text-slate-900 dark:text-white' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'"
            >
              <div class="flex items-center gap-3">
                <input type="radio" :value="p.id" v-model="selectedPlanId" class="text-emerald-600 focus:ring-emerald-500" />
                <div>
                  <span class="font-bold text-sm block">{{ p.name }}</span>
                  <span class="text-[11px] text-slate-400">{{ Number(p.priceMonthly) === 0 ? 'Bepul' : formatCurrency(p.priceMonthly) + ' / oy' }}</span>
                </div>
              </div>
            </label>
          </div>
        </div>

        <div class="modal-footer">
          <button
            @click="showPlanModal = false"
            class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Bekor qilish
          </button>
          <button
            @click="saveBusinessPlan"
            class="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 transition btn-interactive"
          >
            Saqlash
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../services/api';
import { useFormat } from '../../composables/useFormat';
import { useToast } from '../../composables/useToast';
import AppSelect from '../../components/AppSelect.vue';
import AppInput from '../../components/AppInput.vue';
import {
  ShieldCheck,
  Building2,
  Users,
  DollarSign,
  ShoppingBag,
  Package,
  Activity,
  UserCheck,
  TrendingUp,
  CreditCard,
  Search,
  Zap,
  Ban,
  CheckCircle,
  RefreshCw,
  Crown,
  Eye,
  X,
} from 'lucide-vue-next';

const toast = useToast();
const { formatCurrency, formatDate } = useFormat();

const activeTab = ref('owners');
const loading = ref(false);

const stats = ref<any>({});
const owners = ref<any[]>([]);
const businesses = ref<any[]>([]);
const users = ref<any[]>([]);
const plans = ref<any[]>([]);
const auditLogs = ref<any[]>([]);

const ownerSearch = ref('');
const ownerPlanFilter = ref('');
const ownerStatusFilter = ref('');

const businessSearch = ref('');
const businessStatusFilter = ref('');
const userSearch = ref('');

const showPlanModal = ref(false);
const selectedBusiness = ref<any>(null);
const selectedPlanId = ref('');

// Owner Detail & Stats Modal
const showOwnerModal = ref(false);
const ownerDetail = ref<any | null>(null);

const maxOwnerChartValue = computed(() => {
  if (!ownerDetail.value?.chartData || ownerDetail.value.chartData.length === 0) return 1;
  const max = Math.max(...ownerDetail.value.chartData.map((c: any) => c.sales));
  return max === 0 ? 100000 : max;
});

const loadAllData = async () => {
  loading.value = true;
  try {
    const [statsRes, ownersRes, bizRes, usersRes, plansRes, auditRes] = await Promise.all([
      api.get('/superadmin/stats'),
      api.get('/superadmin/owners'),
      api.get('/superadmin/businesses'),
      api.get('/superadmin/users'),
      api.get('/superadmin/plans'),
      api.get('/superadmin/audit-logs'),
    ]);
    stats.value = statsRes.data || {};
    owners.value = ownersRes.data?.items || [];
    businesses.value = bizRes.data || [];
    users.value = usersRes.data || [];
    plans.value = plansRes.data || [];
    auditLogs.value = auditRes.data || [];
  } catch (err) {
    console.error('Failed to load superadmin data', err);
  } finally {
    loading.value = false;
  }
};

const loadOwners = async () => {
  try {
    const params = new URLSearchParams();
    if (ownerSearch.value) params.append('search', ownerSearch.value);
    if (ownerPlanFilter.value) params.append('plan', ownerPlanFilter.value);
    if (ownerStatusFilter.value) params.append('status', ownerStatusFilter.value);

    const { data } = await api.get(`/superadmin/owners?${params.toString()}`);
    owners.value = data?.items || [];
  } catch (err) {
    console.error(err);
  }
};

const openOwnerDetailModal = async (ownerId: string) => {
  try {
    const { data } = await api.get(`/superadmin/owners/${ownerId}/stats`);
    ownerDetail.value = data;
    showOwnerModal.value = true;
  } catch (err) {
    toast.error('Firma egasi statistikasini yuklashda xatolik', 'Xatolik');
  }
};

const toggleOwnerStatusAction = async (ownerId: string, currentStatus: string) => {
  const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
  try {
    await api.patch(`/superadmin/owners/${ownerId}/status`, { status: newStatus });
    toast.success(`Firma egasi muvaffaqiyatli ${newStatus === 'active' ? 'faollashtirildi' : 'bloklandi'}!`, 'Owner Status');
    if (ownerDetail.value) {
      ownerDetail.value.owner.status = newStatus;
    }
    loadOwners();
    loadAllData();
  } catch (err) {
    toast.error('Statusni o\'zgartirishda xatolik', 'Xatolik');
  }
};

const saveOwnerPlan = async (ownerId: string, planId: string) => {
  try {
    await api.patch(`/superadmin/owners/${ownerId}/plan`, { planId });
    toast.success('Tarif rejasi muvaffaqiyatli yangilandi!', 'Tarif');
    loadOwners();
    loadAllData();
  } catch (err) {
    toast.error('Tarifni yangilashda xatolik', 'Xatolik');
  }
};

const filteredBusinesses = computed(() => {
  return businesses.value.filter((b) => {
    const matchesSearch =
      !businessSearch.value ||
      b.name.toLowerCase().includes(businessSearch.value.toLowerCase()) ||
      b.owner?.fullName?.toLowerCase().includes(businessSearch.value.toLowerCase()) ||
      b.owner?.phone?.includes(businessSearch.value);

    const matchesStatus =
      !businessStatusFilter.value || b.status === businessStatusFilter.value;

    return matchesSearch && matchesStatus;
  });
});

const filteredUsers = computed(() => {
  return users.value.filter((u) => {
    return (
      !userSearch.value ||
      u.fullName.toLowerCase().includes(userSearch.value.toLowerCase()) ||
      u.phone?.includes(userSearch.value) ||
      u.email?.toLowerCase().includes(userSearch.value.toLowerCase())
    );
  });
});

const getPlanBadgeClass = (planName: string) => {
  if (planName === 'Business') return 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30';
  if (planName === 'Pro') return 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30';
  return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
};

const toggleBusinessStatus = async (b: any) => {
  const newStatus = b.status === 'active' ? 'suspended' : 'active';
  try {
    await api.patch(`/superadmin/businesses/${b.id}/status`, { status: newStatus });
    b.status = newStatus;
  } catch (err) {
    toast.error('Biznes statusini o\'zgartirishda xatolik', 'Xatolik');
  }
};

const toggleUserStatus = async (u: any) => {
  const newStatus = u.status === 'active' ? 'blocked' : 'active';
  try {
    await api.patch(`/superadmin/users/${u.id}/status`, { status: newStatus });
    u.status = newStatus;
  } catch (err) {
    toast.error('Foydalanuvchi statusini o\'zgartirishda xatolik', 'Xatolik');
  }
};

const toggleSuperAdminPrivilege = async (u: any) => {
  try {
    const { data } = await api.patch(`/superadmin/users/${u.id}/toggle-superadmin`);
    u.isSuperAdmin = data.isSuperAdmin;
    toast.success('SuperAdmin huquqi o\'zgartirildi', 'Huquq');
  } catch (err) {
    toast.error('SuperAdmin huquqini o\'zgartirishda xatolik', 'Xatolik');
  }
};

const openPlanModal = (b: any) => {
  selectedBusiness.value = b;
  selectedPlanId.value = b.planId || plans.value[0]?.id;
  showPlanModal.value = true;
};

const saveBusinessPlan = async () => {
  if (!selectedBusiness.value || !selectedPlanId.value) return;
  try {
    await api.patch(`/superadmin/businesses/${selectedBusiness.value.id}/plan`, {
      planId: selectedPlanId.value,
    });
    showPlanModal.value = false;
    toast.success('Biznes tarifi muvaffaqiyatli saqlandi', 'Tarif');
    loadAllData();
  } catch (err) {
    toast.error('Tarifni saqlashda xatolik', 'Xatolik');
  }
};

onMounted(() => {
  loadAllData();
});
</script>
