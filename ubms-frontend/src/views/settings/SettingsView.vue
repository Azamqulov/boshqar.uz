<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Tizim Sozlamalari</h1>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Shaxsiy profil, biznes parametrlari, interfeys mavzusi, xodimlar va ruxsatlar boshqaruvi</p>
    </div>

    <!-- Tabs -->
    <div class="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs overflow-x-auto">
      <button
        @click="activeTab = 'my-profile'"
        class="flex items-center space-x-2 px-4 py-2 rounded-xl font-bold transition whitespace-nowrap btn-interactive"
        :class="activeTab === 'my-profile' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
      >
        <UserCircle class="w-4 h-4" />
        <span>Mening Profilim</span>
      </button>

      <button
        @click="activeTab = 'profile'"
        class="flex items-center space-x-2 px-4 py-2 rounded-xl font-bold transition whitespace-nowrap btn-interactive"
        :class="activeTab === 'profile' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
      >
        <Building2 class="w-4 h-4" />
        <span>Biznes Profili</span>
      </button>

      <button
        @click="activeTab = 'appearance'"
        class="flex items-center space-x-2 px-4 py-2 rounded-xl font-bold transition whitespace-nowrap btn-interactive"
        :class="activeTab === 'appearance' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
      >
        <Palette class="w-4 h-4" />
        <span>Ko'rinish & Mavzu</span>
      </button>

      <button
        @click="activeTab = 'employees'"
        class="flex items-center space-x-2 px-4 py-2 rounded-xl font-bold transition whitespace-nowrap btn-interactive"
        :class="activeTab === 'employees' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
      >
        <Users class="w-4 h-4" />
        <span>Xodimlar va Ruxsatlar</span>
      </button>

      <button
        @click="activeTab = 'receipt'"
        class="flex items-center space-x-2 px-4 py-2 rounded-xl font-bold transition whitespace-nowrap btn-interactive"
        :class="activeTab === 'receipt' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
      >
        <Printer class="w-4 h-4" />
        <span>Chek & Printer</span>
      </button>

      <button
        @click="activeTab = 'audit'"
        class="flex items-center space-x-2 px-4 py-2 rounded-xl font-bold transition whitespace-nowrap btn-interactive"
        :class="activeTab === 'audit' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
      >
        <ScrollText class="w-4 h-4" />
        <span>Audit Jurnallari</span>
      </button>

      <button
        @click="activeTab = 'danger'"
        class="flex items-center space-x-2 px-4 py-2 rounded-xl font-bold transition whitespace-nowrap btn-interactive"
        :class="activeTab === 'danger' ? 'bg-rose-500 text-white shadow-sm' : 'text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300'"
      >
        <Trash2 class="w-4 h-4" />
        <span>O'chirish</span>
      </button>
    </div>

    <!-- Tab 0: Mening Profilim (Phase 6) -->
    <div v-if="activeTab === 'my-profile'" class="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
      <!-- 1. Personal Details Form -->
      <div class="glass-card rounded-2xl p-6 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCircle class="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            <span>Shaxsiy Ma'lumotlar</span>
          </h3>
          <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold uppercase">
            {{ authStore.user?.isSuperAdmin ? 'SuperAdmin' : 'Owner' }}
          </span>
        </div>

        <form @submit.prevent="handleUpdateProfile" class="space-y-3.5 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">To'liq Ism Familiya *</label>
            <input
              v-model="profileForm.fullName"
              required
              class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Telefon Raqami *</label>
            <PhoneInput v-model="profileForm.phone" required placeholder="90 123 45 67" />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Elektron Pochta (Email)</label>
            <input
              type="email"
              v-model="profileForm.email"
              placeholder="example@mail.com"
              class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <button
            type="submit"
            :disabled="savingProfile"
            class="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition btn-interactive flex items-center justify-center gap-1.5"
          >
            <Save class="w-4 h-4" />
            <span>{{ savingProfile ? 'Saqlanmoqda...' : 'Profilni Saqlash' }}</span>
          </button>
        </form>
      </div>

      <!-- 2. Change Password Form -->
      <div class="glass-card rounded-2xl p-6 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Key class="w-5 h-5 text-purple-500 dark:text-purple-400" />
            <span>Parolni O'zgartirish</span>
          </h3>
        </div>

        <form @submit.prevent="handleChangePassword" class="space-y-3.5 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Amaldagi Parol *</label>
            <input
              type="password"
              v-model="passwordForm.currentPassword"
              required
              placeholder="Amaldagi parolni kiriting"
              class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Yangi Parol *</label>
            <input
              type="password"
              v-model="passwordForm.newPassword"
              required
              placeholder="Kamida 6 ta belgi"
              class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Yangi Parol Tasdiqi *</label>
            <input
              type="password"
              v-model="passwordForm.confirmPassword"
              required
              placeholder="Yangi parolni qayta kiriting"
              class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <button
            type="submit"
            :disabled="changingPassword"
            class="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition btn-interactive flex items-center justify-center gap-1.5"
          >
            <ShieldCheck class="w-4 h-4" />
            <span>{{ changingPassword ? 'Tekshirilmoqda...' : 'Yangi Parolni Saqlash' }}</span>
          </button>
        </form>
      </div>
    </div>

    <!-- Tab 1: Business Profile -->
    <div v-if="activeTab === 'profile'" class="glass-card rounded-2xl p-6 max-w-xl space-y-4">
      <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <Building2 class="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
        <span>Biznes Ma'lumotlari</span>
      </h3>
      <div class="space-y-3 text-xs">
        <div>
          <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Biznes Nomi</label>
          <input :value="authStore.activeBusiness?.name" disabled class="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-400 font-medium" />
        </div>
        <div>
          <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Biznes Turi</label>
          <input :value="authStore.activeBusiness?.businessType" disabled class="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-400 uppercase font-bold" />
        </div>
        <div>
          <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Valyuta</label>
          <input :value="authStore.activeBusiness?.currency || 'UZS'" disabled class="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-400" />
        </div>
        <div>
          <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Foydalanuvchi Roli</label>
          <input :value="authStore.activeBusiness?.role || 'Owner'" disabled class="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold" />
        </div>
      </div>
    </div>

    <!-- Tab: Appearance & Theme -->
    <div v-if="activeTab === 'appearance'" class="glass-card rounded-2xl p-6 max-w-xl space-y-5">
      <div>
        <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Palette class="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
          <span>Interfeys Mavzusi (Theme Mode)</span>
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">O'zingizga qulay rejimni tanlang: Yorug' (Light) yoki Tungi (Dark)</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <!-- Light Theme Option -->
        <button
          type="button"
          @click="themeStore.applyTheme('light')"
          class="p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 transition-all btn-interactive"
          :class="[
            themeStore.theme === 'light'
              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500/30 font-bold'
              : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          ]"
        >
          <div class="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Sun class="w-5 h-5" />
          </div>
          <span class="text-xs">Yorug' (Light)</span>
        </button>

        <!-- Dark Theme Option -->
        <button
          type="button"
          @click="themeStore.applyTheme('dark')"
          class="p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 transition-all btn-interactive"
          :class="[
            themeStore.theme === 'dark'
              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500/30 font-bold'
              : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          ]"
        >
          <div class="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Moon class="w-5 h-5" />
          </div>
          <span class="text-xs">Tungi (Dark)</span>
        </button>

        <!-- System Sync Option -->
        <button
          type="button"
          @click="themeStore.applyTheme('system')"
          class="p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 transition-all btn-interactive"
          :class="[
            themeStore.theme === 'system'
              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500/30 font-bold'
              : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          ]"
        >
          <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center">
            <Monitor class="w-5 h-5" />
          </div>
          <span class="text-xs">Tizim (Avto)</span>
        </button>
      </div>
    </div>

    <!-- Tab 2: Employees and Permissions -->
    <div v-if="activeTab === 'employees'" class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-base font-bold text-slate-900 dark:text-white">Xodimlar Ro'yxati</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">Har bir xodim faqat o'ziga ruxsat berilgan bo'limlar bilan ishlay oladi</p>
        </div>

        <button
          @click="openAddEmployeeModal"
          class="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition btn-interactive"
        >
          <UserPlus class="w-4 h-4" />
          <span>Yangi Xodim Qo'shish</span>
        </button>
      </div>

      <SkeletonLoader v-if="loadingEmployees" variant="table" :rows="4" />

      <div v-else class="glass-card rounded-2xl overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase font-semibold">
              <tr>
                <th class="py-3 px-4">Xodim</th>
                <th class="py-3 px-4">Telefon</th>
                <th class="py-3 px-4">Lavozim</th>
                <th class="py-3 px-4">Ruxsat Berilgan Bo'limlar</th>
                <th class="py-3 px-4">Holat</th>
                <th class="py-3 px-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
              <tr v-if="employees.length === 0">
                <td colspan="6" class="py-8 text-center text-slate-400 dark:text-slate-500">Xodimlar mavjud emas</td>
              </tr>
              <tr v-for="emp in employees" :key="emp.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                <td class="py-3 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <div class="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                    {{ emp.fullName.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <span>{{ emp.fullName }}</span>
                    <span v-if="emp.isOwner" class="ml-1.5 text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold uppercase">Egasi</span>
                  </div>
                </td>
                <td class="py-3 px-4 font-mono text-slate-500 dark:text-slate-400">{{ emp.phone }}</td>
                <td class="py-3 px-4">
                  <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {{ emp.position || 'Xodim' }}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="mod in (emp.allowedModules || ['pos', 'products'])"
                      :key="mod"
                      class="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold"
                    >
                      {{ getModuleLabel(mod) }}
                    </span>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <span
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    :class="emp.status === 'active' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'"
                  >
                    {{ emp.status === 'active' ? 'Faol' : 'Nofaol' }}
                  </span>
                </td>
                <td class="py-3 px-4 text-right space-x-1">
                  <button
                    v-if="!emp.isOwner"
                    @click="editEmployee(emp)"
                    class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
                    title="Tahrirlash"
                  >
                    <Edit2 class="w-3.5 h-3.5" />
                  </button>
                  <button
                    v-if="!emp.isOwner"
                    @click="deleteEmployee(emp)"
                    class="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition"
                    title="O'chirish"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Tab 3: Audit Logs -->
    <div v-if="activeTab === 'audit'" class="glass-card rounded-2xl overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase font-semibold">
            <tr>
              <th class="py-3 px-4">Vaqt</th>
              <th class="py-3 px-4">Xodim</th>
              <th class="py-3 px-4">Harakat (Action)</th>
              <th class="py-3 px-4">Bo'lim</th>
              <th class="py-3 px-4">IP Manzil</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200 font-mono">
            <tr v-if="auditLogs.length === 0">
              <td colspan="5" class="py-8 text-center text-slate-400 dark:text-slate-500 font-sans">Audit yozuvlari mavjud emas</td>
            </tr>
            <tr v-for="log in auditLogs" :key="log.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
              <td class="py-3 px-4 text-slate-500 dark:text-slate-400 font-sans">{{ formatDate(log.createdAt) }}</td>
              <td class="py-3 px-4 font-sans font-bold text-slate-900 dark:text-white">{{ log.user?.fullName }}</td>
              <td class="py-3 px-4 uppercase text-emerald-600 dark:text-emerald-400 font-bold">{{ log.action }}</td>
              <td class="py-3 px-4 text-slate-700 dark:text-slate-300">{{ log.entity }}</td>
              <td class="py-3 px-4 text-slate-400 dark:text-slate-500">{{ log.ipAddress || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tab: Chek va Printer Sozlamalari -->
    <div v-if="activeTab === 'receipt'" class="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-5xl">
      <!-- Left 7 cols: Controls -->
      <div class="lg:col-span-7 space-y-5">
        <!-- Paper Size Cards -->
        <div class="glass-card rounded-2xl p-5 space-y-3">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Printer class="w-4 h-4 text-emerald-500" />
            <span>Chek Formati / O'lchami</span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Kassangizdagi termal printer yoki standart printer qog'oz o'lchamini tanlang
          </p>

          <div class="grid grid-cols-3 gap-3 pt-1">
            <!-- 58mm -->
            <button
              type="button"
              @click="receiptSettings.paperSize = '58mm'"
              class="p-3.5 rounded-xl border text-left transition relative"
              :class="[
                receiptSettings.paperSize === '58mm'
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:border-slate-300'
              ]"
            >
              <div class="text-sm font-black font-mono">58 mm</div>
              <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Kichik kassa lentalari</div>
            </button>

            <!-- 80mm -->
            <button
              type="button"
              @click="receiptSettings.paperSize = '80mm'"
              class="p-3.5 rounded-xl border text-left transition relative"
              :class="[
                receiptSettings.paperSize === '80mm'
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:border-slate-300'
              ]"
            >
              <div class="text-sm font-black font-mono">80 mm</div>
              <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Standart termal chek</div>
            </button>

            <!-- A4 -->
            <button
              type="button"
              @click="receiptSettings.paperSize = 'A4'"
              class="p-3.5 rounded-xl border text-left transition relative"
              :class="[
                receiptSettings.paperSize === 'A4'
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:border-slate-300'
              ]"
            >
              <div class="text-sm font-black font-mono">A4 Varaq</div>
              <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Hisob-faktura / varaq</div>
            </button>
          </div>
        </div>

        <!-- Custom Header & Footer Texts -->
        <div class="glass-card rounded-2xl p-5 space-y-4 text-xs">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white">Chek Matnlari va Rekvizitlari</h3>

          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Chek Boshidagi Sarlavha (Do'kon nomi)</label>
            <input
              v-model="receiptSettings.headerTitle"
              :placeholder="authStore.activeBusiness?.name || 'Do\'kon nomi'"
              class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Chek Ostidagi Izoh / Kontaktlar</label>
            <input
              v-model="receiptSettings.headerSubtitle"
              placeholder="Masalan: Toshkent sh., Chilonzor tumani. Tel: +998 90 123 45 67"
              class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Chek Tagidagi Minnatdorchilik Matni</label>
            <textarea
              v-model="receiptSettings.footerText"
              rows="2"
              placeholder="Masalan: Xaridingiz uchun rahmat! Qaytarish 24 soat ichida chek bilan."
              class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            ></textarea>
          </div>
        </div>

        <!-- Toggles -->
        <div class="glass-card rounded-2xl p-5 space-y-3 text-xs">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white">Chekdagi Qo'shimcha Bloklar</h3>

          <div class="space-y-2.5">
            <label class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
              <span class="font-medium text-slate-700 dark:text-slate-300">Chekda shtrix-kod ko'rsatish</span>
              <input type="checkbox" v-model="receiptSettings.showBarcode" class="rounded text-emerald-500 focus:ring-emerald-500" />
            </label>

            <label class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
              <span class="font-medium text-slate-700 dark:text-slate-300">Kassir / Mas'ul xodim ismini ko'rsatish</span>
              <input type="checkbox" v-model="receiptSettings.showCashier" class="rounded text-emerald-500 focus:ring-emerald-500" />
            </label>

            <label class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
              <span class="font-medium text-slate-700 dark:text-slate-300">Mijoz ma'lumotlarini (agar kiritilgan bo'lsa) ko'rsatish</span>
              <input type="checkbox" v-model="receiptSettings.showCustomer" class="rounded text-emerald-500 focus:ring-emerald-500" />
            </label>

            <label class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
              <span class="font-medium text-slate-700 dark:text-slate-300">Kassada to'lov qilingandan so'ng chekni darhol avtomatik chop etish</span>
              <input type="checkbox" v-model="receiptSettings.autoPrint" class="rounded text-emerald-500 focus:ring-emerald-500" />
            </label>
          </div>
        </div>

        <!-- Buttons -->
        <div class="flex items-center gap-3">
          <button
            type="button"
            @click="saveReceiptSettings"
            class="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition btn-interactive flex items-center justify-center gap-2"
          >
            <Save class="w-4 h-4" />
            <span>Sozlamalarni Saqlash</span>
          </button>

          <button
            type="button"
            @click="triggerTestPrint"
            class="py-3 px-5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition flex items-center gap-2 btn-interactive"
          >
            <Printer class="w-4 h-4" />
            <span>Test Chek Chop Etish</span>
          </button>
        </div>
      </div>

      <!-- Right 5 cols: Live Mock Receipt Preview -->
      <div class="lg:col-span-5">
        <div class="glass-card rounded-2xl p-5 sticky top-20 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500 uppercase">Jonli Chek Ko'rinishi</span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
              {{ receiptSettings.paperSize }}
            </span>
          </div>

          <!-- Realistic Receipt Paper Preview -->
          <div
            class="bg-white text-slate-900 font-mono text-[11px] p-4 rounded-xl shadow-md border border-slate-200 mx-auto transition-all duration-300 overflow-hidden"
            :style="{ maxWidth: receiptSettings.paperSize === '58mm' ? '220px' : receiptSettings.paperSize === 'A4' ? '100%' : '280px' }"
          >
            <div class="text-center space-y-1">
              <div class="font-black text-sm uppercase">{{ receiptSettings.headerTitle || authStore.activeBusiness?.name || 'Do\'kon Nomi' }}</div>
              <div v-if="receiptSettings.headerSubtitle" class="text-[10px] text-slate-500">{{ receiptSettings.headerSubtitle }}</div>
              <div class="border-b border-dashed border-slate-400 my-2"></div>
              <div class="text-[10px] text-left space-y-0.5">
                <div>CHEK №: <strong>#0042</strong></div>
                <div>SANA: 13-avgust, 2026 16:15</div>
                <div v-if="receiptSettings.showCashier">KASSIR: BOT (Sotuvchi)</div>
                <div v-if="receiptSettings.showCustomer">MIJOZ: Alisherjon H.</div>
              </div>
              <div class="border-b border-dashed border-slate-400 my-2"></div>
            </div>

            <!-- Items -->
            <div class="space-y-1.5 py-1">
              <div class="flex justify-between">
                <span>Coca-Cola 1.5L x2</span>
                <span class="font-bold">28 000</span>
              </div>
              <div class="flex justify-between">
                <span>Nestle Sut 1L x1</span>
                <span class="font-bold">14 000</span>
              </div>
            </div>

            <div class="border-t border-dashed border-slate-400 my-2 pt-1.5 space-y-1 text-[10px]">
              <div class="flex justify-between">
                <span>Oraliq summa:</span>
                <span>42 000 so'm</span>
              </div>
              <div class="flex justify-between text-xs font-black text-slate-900 border-t border-slate-900 pt-1">
                <span>JAMI TO'LOV:</span>
                <span>42 000 SO'M</span>
              </div>
              <div class="flex justify-between pt-1">
                <span>To'lov (Naqd pul):</span>
                <span>42 000 so'm</span>
              </div>
            </div>

            <!-- Footer -->
            <div class="text-center pt-2 space-y-1 border-t border-dashed border-slate-400 mt-2">
              <div v-if="receiptSettings.showBarcode" class="text-[10px] tracking-widest font-bold py-1">
                * #0042 *
              </div>
              <div class="text-[10px] text-slate-600 font-semibold">{{ receiptSettings.footerText || 'Xaridingiz uchun rahmat!' }}</div>
              <div class="text-[8px] text-slate-400">boshqar.uz — Universal Tizim</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Hidden Receipt Modal for Test Print -->
    <ReceiptModal
      v-if="testOrderForReceipt"
      :order="testOrderForReceipt"
      @close="testOrderForReceipt = null"
    />

    <!-- Tab 4: Danger Zone -->
    <div v-if="activeTab === 'danger'" class="space-y-4 max-w-xl">
      <div class="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-3">
        <h4 class="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
          <AlertTriangle class="w-4 h-4" />
          <span>Xavfli Hudud</span>
        </h4>
        <p class="text-xs text-slate-600 dark:text-slate-300">
          Ushbu amallar qaytarib bo'lmas hisoblanadi. Ma'lumotlarni o'chirishdan oldin ehtiyot bo'ling.
        </p>

        <div class="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            @click="openDeleteBusinessModal"
            class="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-600/25 transition btn-interactive"
          >
            Joriy Biznesni O'chirish
          </button>
          <button
            @click="openDeleteAccountModal"
            class="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-rose-600 dark:text-rose-400 font-bold text-xs transition border border-rose-500/30 btn-interactive"
          >
            Foydalanuvchi Hisobini Butunlay O'chirish
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Employee Modal -->
    <div v-if="showEmployeeModal" @click.self="showEmployeeModal = false" class="modal-overlay">
      <div class="modal-container max-w-md" @click.stop>
        <div class="modal-header">
          <h3 class="text-base font-bold text-slate-900 dark:text-white">{{ editingEmpId ? 'Xodimni Tahrirlash' : 'Yangi Xodim Qo\'shish' }}</h3>
          <button @click="showEmployeeModal = false" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"><X class="w-5 h-5" /></button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="saveEmployee" class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">To'liq Ism Familiya *</label>
              <input
                v-model="empForm.fullName"
                required
                placeholder="Masalan: Sardor Rustamov"
                class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Telefon Raqami (Login) *</label>
              <PhoneInput v-model="empForm.phone" required placeholder="90 123 45 67" />
            </div>

            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {{ editingEmpId ? 'Yangi Parol (ixtiyoriy)' : 'Vaqtinchalik Parol *' }}
              </label>
              <input
                type="password"
                v-model="empForm.password"
                :required="!editingEmpId"
                :placeholder="editingEmpId ? 'O\'zgarishsiz qoldirish uchun bo\'sh qoldiring' : 'Kamida 4 yoki 6 ta belgi'"
                class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Lavozimi</label>
              <input
                v-model="empForm.position"
                placeholder="Masalan: Sotuvchi, Kassir, Omborchi"
                class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <!-- Allowed Modules Checkboxes -->
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Ruxsat Berilgan Bo'limlar:</label>
              <div class="grid grid-cols-2 gap-2">
                <label
                  v-for="mod in availableModules"
                  :key="mod.id"
                  class="flex items-center space-x-2 p-2 rounded-xl border transition cursor-pointer"
                  :class="empForm.allowedModules.includes(mod.id) ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-bold' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'"
                >
                  <input
                    type="checkbox"
                    :value="mod.id"
                    v-model="empForm.allowedModules"
                    class="rounded text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>{{ mod.label }}</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              :disabled="savingEmp"
              class="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition mt-3 btn-interactive"
            >
              {{ savingEmp ? (editingEmpId ? 'Saqlanmoqda...' : 'Qo\'shilmoqda...') : (editingEmpId ? 'O\'zgarishlarni Saqlash' : 'Xodimni Saqlash') }}
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- Confirm Modal -->
    <div v-if="showConfirmModal" @click.self="showConfirmModal = false" class="modal-overlay">
      <div class="modal-container max-w-sm" @click.stop>
        <div class="modal-header border-rose-500/20">
          <h3 class="text-base font-bold text-rose-600 dark:text-rose-400">Tasdiqlash kerak</h3>
          <button @click="showConfirmModal = false" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"><X class="w-5 h-5" /></button>
        </div>

        <div class="modal-body">
          <p class="text-xs text-slate-600 dark:text-slate-300">
            O'chirishni tasdiqlash uchun quyidagi maydonga <strong class="text-slate-900 dark:text-white font-mono">OCHIRISH</strong> so'zini yozing:
          </p>

          <input
            v-model="confirmInput"
            placeholder="OCHIRISH"
            class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-center font-bold tracking-widest uppercase focus:outline-none focus:border-rose-500"
          />
        </div>

        <div class="modal-footer">
          <button
            @click="showConfirmModal = false"
            class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Bekor qilish
          </button>
          <button
            @click="executeDeletion"
            :disabled="confirmInput !== 'OCHIRISH' || deleting"
            class="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-lg shadow-rose-600/30 btn-interactive"
          >
            {{ deleting ? 'O\'chirilmoqda...' : 'O\'chirish' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Confirm Dialog -->
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
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth.store';
import { useThemeStore } from '../../stores/theme.store';
import { useToast } from '../../composables/useToast';
import { useFormat } from '../../composables/useFormat';
import api from '../../services/api';
import { cleanUzbekPhone } from '../../utils/phone';
import PhoneInput from '../../components/PhoneInput.vue';
import AppConfirmDialog from '../../components/AppConfirmDialog.vue';
import {
  Building2,
  Users,
  ScrollText,
  Trash2,
  Edit2,
  AlertTriangle,
  UserPlus,
  X,
  Palette,
  Sun,
  Moon,
  Monitor,
  Package,
  Boxes,
  Truck,
  UtensilsCrossed,
  Flame,
  Calendar,
  DollarSign,
  LayoutDashboard,
  UserCircle,
  Key,
  Save,
  ShieldCheck,
  Printer,
} from 'lucide-vue-next';

import SkeletonLoader from '../../components/SkeletonLoader.vue';
import ReceiptModal from '../../components/ReceiptModal.vue';

const router = useRouter();
const authStore = useAuthStore();
const themeStore = useThemeStore();
const toast = useToast();
const { formatDate } = useFormat();

const activeTab = ref('my-profile');
const loading = ref(false);
const loadingEmployees = ref(false);
const savingEmp = ref(false);
const deleting = ref(false);

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

// Phase 6: User profile & password states
const savingProfile = ref(false);
const changingPassword = ref(false);

const profileForm = ref({
  fullName: authStore.user?.fullName || '',
  phone: authStore.user?.phone || '',
  email: authStore.user?.email || '',
});

watch(
  () => authStore.user,
  (u) => {
    if (u) {
      profileForm.value = {
        fullName: u.fullName || '',
        phone: u.phone || '',
        email: u.email || '',
      };
    }
  },
  { immediate: true, deep: true },
);

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const handleUpdateProfile = async () => {
  savingProfile.value = true;
  try {
    const cleanPhone = cleanUzbekPhone(profileForm.value.phone);
    await authStore.updateProfile({
      fullName: profileForm.value.fullName,
      phone: cleanPhone,
      email: profileForm.value.email,
    });
    toast.success('Shaxsiy ma\'lumotlaringiz muvaffaqiyatli yangilandi!', 'Profil');
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Profilni yangilashda xatolik', 'Xatolik');
  } finally {
    savingProfile.value = false;
  }
};

const handleChangePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    toast.warning('Yangi parol va tasdiqlovchi parol bir-biriga mos kelmadi!', 'Parol');
    return;
  }
  if (passwordForm.value.newPassword.length < 4) {
    toast.warning('Yangi parol kamida 4 ta belgidan iborat bo\'lishi kerak', 'Parol');
    return;
  }

  changingPassword.value = true;
  try {
    await authStore.changePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword,
    });
    toast.success('Parolingiz muvaffaqiyatli o\'zgartirildi!', 'Xavfsizlik');
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Parolni o\'zgartirishda xatolik', 'Xatolik');
  } finally {
    changingPassword.value = false;
  }
};

const employees = ref<any[]>([]);
const auditLogs = ref<any[]>([]);

const showEmployeeModal = ref(false);
const showConfirmModal = ref(false);
const confirmType = ref<'business' | 'account'>('business');
const confirmInput = ref('');

const empForm = ref({
  fullName: '',
  phone: '+998 ',
  password: '',
  position: 'Sotuvchi',
  allowedModules: ['pos', 'products'],
});

const availableModules = [
  { id: 'pos', label: 'Kassa (POS)', icon: Package },
  { id: 'products', label: 'Mahsulotlar', icon: Package },
  { id: 'inventory', label: 'Ombor & Kirim', icon: Boxes },
  { id: 'customers', label: 'Mijozlar (CRM)', icon: Users },
  { id: 'suppliers', label: 'Ta\'minotchilar', icon: Truck },
  { id: 'tables', label: 'Stollar & Ofitsiant', icon: UtensilsCrossed },
  { id: 'kds', label: 'Oshxona (KDS)', icon: Flame },
  { id: 'appointments', label: 'Bandlovlar', icon: Calendar },
  { id: 'finance', label: 'Moliya & Xarajatlar', icon: DollarSign },
  { id: 'dashboard', label: 'Boshqaruv Paneli', icon: LayoutDashboard },
];

const getModuleLabel = (modId: string) => {
  const m = availableModules.find((item) => item.id === modId);
  return m ? m.label : modId;
};

const loadEmployees = async () => {
  loadingEmployees.value = true;
  try {
    const { data } = await api.get('/employees');
    employees.value = data || [];
  } catch (err) {
    console.error(err);
  } finally {
    loadingEmployees.value = false;
  }
};

const editingEmpId = ref<string | null>(null);

const openAddEmployeeModal = () => {
  editingEmpId.value = null;
  empForm.value = {
    fullName: '',
    phone: '+998 ',
    password: '',
    position: 'Sotuvchi',
    allowedModules: ['pos', 'products'],
  };
  showEmployeeModal.value = true;
};

const editEmployee = (emp: any) => {
  editingEmpId.value = emp.id;
  empForm.value = {
    fullName: emp.fullName,
    phone: emp.phone,
    password: '',
    position: emp.position || 'Sotuvchi',
    allowedModules: emp.allowedModules && emp.allowedModules.length > 0 ? [...emp.allowedModules] : ['pos', 'products'],
  };
  showEmployeeModal.value = true;
};

const saveEmployee = async () => {
  if (!empForm.value.fullName.trim()) {
    toast.warning('Xodimning ism va familiyasini kiriting', 'Ism');
    return;
  }

  if (empForm.value.allowedModules.length === 0) {
    toast.warning('Kamida bitta bo\'limni tanlashingiz kerak', 'Ruxsat');
    return;
  }

  const clean = cleanUzbekPhone(empForm.value.phone);
  if (clean.length < 13) {
    toast.warning('Telefon raqamni to\'liq 9 ta raqamda kiriting (+998 90 123 45 67)', 'Telefon');
    return;
  }

  if (!editingEmpId.value && (!empForm.value.password || empForm.value.password.length < 4)) {
    toast.warning('Yangi xodim uchun kamida 4 yoki 6 xonali parol kiriting', 'Parol');
    return;
  }

  savingEmp.value = true;
  try {
    const payload: any = {
      fullName: empForm.value.fullName.trim(),
      phone: clean,
      position: empForm.value.position,
      allowedModules: empForm.value.allowedModules,
    };
    if (empForm.value.password && empForm.value.password.trim()) {
      payload.password = empForm.value.password.trim();
    }

    if (editingEmpId.value) {
      await api.put(`/employees/${editingEmpId.value}`, payload);
      toast.success(`"${empForm.value.fullName}" ma'lumotlari muvaffaqiyatli yangilandi!`, 'Xodim');
    } else {
      await api.post('/employees', payload);
      toast.success(`"${empForm.value.fullName}" muvaffaqiyatli xodim sifatida qo'shildi!`, 'Xodim');
    }
    showEmployeeModal.value = false;
    await loadEmployees();
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Xodimni saqlashda xatolik yuz berdi', 'Xatolik');
  } finally {
    savingEmp.value = false;
  }
};

const deleteEmployee = (emp: any) => {
  confirmModal.value = {
    open: true,
    title: "Xodimni o'chirish",
    message: `Haqiqatan ham "${emp.fullName}" xodimini o'chirmoqchimisiz?`,
    onConfirm: async () => {
      try {
        await api.delete(`/employees/${emp.id}`);
        toast.success('Xodim muvaffaqiyatli o\'chirildi', 'O\'chirildi');
        await loadEmployees();
      } catch (err: any) {
        toast.error(err.response?.data?.message || err.message || 'Xodimni o\'chirishda xatolik yuz berdi', 'Xatolik');
      } finally {
        confirmModal.value.open = false;
      }
    },
  };
};

const loadAudit = async () => {
  loading.value = true;
  try {
    const { data } = await api.get('/audit-logs');
    auditLogs.value = data || [];
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const openDeleteBusinessModal = () => {
  confirmType.value = 'business';
  confirmInput.value = '';
  showConfirmModal.value = true;
};

const openDeleteAccountModal = () => {
  confirmType.value = 'account';
  confirmInput.value = '';
  showConfirmModal.value = true;
};

const executeDeletion = async () => {
  if (confirmInput.value !== 'OCHIRISH') return;

  deleting.value = true;
  try {
    if (confirmType.value === 'business') {
      const bizId = authStore.activeBusiness?.id;
      if (!bizId) throw new Error('Biznes topilmadi');
      await api.delete(`/businesses/${bizId}`);
      toast.success('Biznes va barcha ma\'lumotlar muvaffaqiyatli o\'chirildi', 'O\'chirildi');
      showConfirmModal.value = false;
      
      // Refresh user auth state
      authStore.logout();
      window.location.href = '/auth/login';
    } else {
      await api.delete('/businesses/account/me');
      toast.success('Hisobingiz muvaffaqiyatli o\'chirildi', 'O\'chirildi');
      showConfirmModal.value = false;
      authStore.logout();
      window.location.href = '/auth/register';
    }
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'O\'chirishda xatolik yuz berdi', 'Xatolik');
  } finally {
    deleting.value = false;
  }
};

// Receipt & Printer Settings State
const testOrderForReceipt = ref<any | null>(null);

const receiptSettings = ref({
  paperSize: '80mm',
  headerTitle: '',
  headerSubtitle: '',
  footerText: 'Xaridingiz uchun rahmat! Qaytarish 24 soat ichida chek bilan.',
  showBarcode: true,
  showQrCode: true,
  showCashier: true,
  showCustomer: true,
  autoPrint: false,
});

const loadReceiptSettings = () => {
  try {
    const raw = localStorage.getItem('ubms_receipt_settings');
    if (raw) {
      receiptSettings.value = { ...receiptSettings.value, ...JSON.parse(raw) };
    }
  } catch (e) {}
};

const saveReceiptSettings = () => {
  localStorage.setItem('ubms_receipt_settings', JSON.stringify(receiptSettings.value));
  toast.success('Chek va printer sozlamalari muvaffaqiyatli saqlandi!', 'Chek Sozlamalari');
};

const triggerTestPrint = () => {
  testOrderForReceipt.value = {
    orderNumber: '#0042',
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    subtotal: 42000,
    discountAmount: 0,
    total: 42000,
    cashier: { fullName: authStore.user?.fullName || 'BOT (Kassir)' },
    customer: { fullName: 'Alisherjon Habibullayev', phone: '+998 90 123 45 67' },
    items: [
      { id: '1', product: { name: 'Coca-Cola 1.5L' }, quantity: 2, unitPrice: 14000, total: 28000 },
      { id: '2', product: { name: 'Nestle Sut 1L' }, quantity: 1, unitPrice: 14000, total: 14000 },
    ],
    payments: [
      { id: 'p1', paymentMethod: { name: 'Naqd pul', type: 'cash' }, amount: 42000 },
    ],
  };
  setTimeout(() => {
    window.print();
  }, 150);
};

watch(
  () => authStore.activeBusiness?.id,
  (newId) => {
    if (newId) {
      loadEmployees();
      loadAudit();
    }
  },
);

onMounted(async () => {
  loadReceiptSettings();
  await authStore.fetchBusinesses();
  await authStore.fetchProfile();
  loadEmployees();
  loadAudit();
});
</script>
