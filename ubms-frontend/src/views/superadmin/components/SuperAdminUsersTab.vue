<template>
  <div class="space-y-4">
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <div class="flex-1 max-w-md">
        <AppInput
          :model-value="search"
          @update:model-value="$emit('update:search', $event)"
          placeholder="Ism, telefon yoki email bo'yicha qidiruv..."
          :icon="Search"
        />
      </div>

      <AppViewToggle :model-value="viewMode" @update:model-value="$emit('update:viewMode', $event)" />
    </div>

    <!-- Users Table View -->
    <div v-if="viewMode === 'table'" class="glass-card rounded-2xl overflow-hidden shadow-sm">
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
            <tr v-for="u in pagination.paginatedItems.value" :key="u.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
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
                  @click="$emit('toggleSuperAdmin', u)"
                  class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-emerald-600 dark:text-emerald-400 transition"
                  :title="u.isSuperAdmin ? 'SuperAdmin huquqini olish' : 'SuperAdmin qilish'"
                >
                  <ShieldCheck class="w-3.5 h-3.5" />
                </button>
                <button
                  @click="$emit('toggleStatus', u)"
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

    <!-- Users Grid / Card View -->
    <div v-else-if="viewMode === 'grid'">
      <div v-if="filteredUsers.length === 0" class="glass-card rounded-2xl p-12 text-center text-slate-400 dark:text-slate-500">
        <Users class="w-10 h-10 mx-auto mb-2 opacity-30 text-emerald-500" />
        <span>Foydalanuvchilar topilmadi</span>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div
          v-for="u in pagination.paginatedItems.value"
          :key="u.id"
          class="glass-card rounded-2xl p-5 flex flex-col justify-between hover:shadow-lg transition-all duration-300 border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 group"
        >
          <div class="space-y-3.5">
            <!-- Top header: Avatar, Name, Date, Status -->
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-black text-sm shadow-sm group-hover:scale-105 transition-transform">
                  {{ u.fullName.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <h3 class="font-bold text-slate-900 dark:text-white text-sm leading-tight">{{ u.fullName }}</h3>
                  <p class="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                    <Phone class="w-3 h-3 text-slate-400" />
                    <span>{{ u.phone }}</span>
                  </p>
                </div>
              </div>

              <span
                class="px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0"
                :class="u.status === 'active' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25' : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25'"
              >
                {{ u.status === 'active' ? 'Faol' : 'Blok' }}
              </span>
            </div>

            <!-- Role Badge & Date -->
            <div class="flex items-center justify-between gap-2 text-xs">
              <span
                class="px-2 py-0.5 rounded font-bold text-[10px]"
                :class="u.isSuperAdmin ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'"
              >
                {{ u.isSuperAdmin ? '👑 SuperAdmin' : 'Oddiy User' }}
              </span>
              <span class="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                <Calendar class="w-3 h-3 text-slate-400" />
                {{ formatDate(u.createdAt) }}
              </span>
            </div>

            <!-- Linked Businesses -->
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800/60 space-y-1.5">
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Biriktirilgan Bizneslar:</span>
              <div v-if="u.businesses && u.businesses.length > 0" class="flex flex-wrap gap-1">
                <span
                  v-for="(biz, idx) in u.businesses"
                  :key="idx"
                  class="px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold border border-slate-200 dark:border-slate-700"
                >
                  {{ biz.businessName }} ({{ biz.roleName }})
                </span>
              </div>
            </div>
          </div>

          <!-- Action Footer -->
          <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <button
              @click="$emit('toggleSuperAdmin', u)"
              class="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-emerald-600 dark:text-emerald-400 font-bold text-xs transition flex items-center justify-center gap-1.5 btn-interactive"
            >
              <ShieldCheck class="w-3.5 h-3.5" />
              <span>{{ u.isSuperAdmin ? 'Adminni olish' : 'SuperAdmin' }}</span>
            </button>
            <button
              @click="$emit('toggleStatus', u)"
              class="py-2 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 btn-interactive"
              :class="u.status === 'active' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'"
            >
              <Ban v-if="u.status === 'active'" class="w-3.5 h-3.5" />
              <CheckCircle v-else class="w-3.5 h-3.5" />
              <span>{{ u.status === 'active' ? 'Bloklash' : 'Faollashtirish' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <AppPagination
      v-model:current-page="pagination.currentPage.value"
      v-model:page-size="pagination.pageSize.value"
      :total-items="filteredUsers.length"
      item-name="foydalanuvchi"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { Search, Users, ShieldCheck, Ban, CheckCircle, Calendar, Phone } from 'lucide-vue-next';
import AppInput from '../../../components/AppInput.vue';
import AppViewToggle from '../../../components/AppViewToggle.vue';
import AppPagination from '../../../components/AppPagination.vue';
import { useFormat } from '../../../composables/useFormat';
import { usePagination } from '../../../composables/usePagination';

const props = defineProps<{
  users: any[];
  search: string;
  viewMode: 'table' | 'grid';
}>();

defineEmits<{
  (e: 'update:search', val: string): void;
  (e: 'update:viewMode', val: 'table' | 'grid'): void;
  (e: 'toggleSuperAdmin', user: any): void;
  (e: 'toggleStatus', user: any): void;
}>();

const { formatDate } = useFormat();

const filteredUsers = computed(() => {
  return props.users.filter((u: any) => {
    return (
      !props.search ||
      u.fullName.toLowerCase().includes(props.search.toLowerCase()) ||
      u.phone.includes(props.search)
    );
  });
});

const pagination = usePagination(filteredUsers);

watch(() => props.search, () => {
  pagination.resetPage();
});
</script>
