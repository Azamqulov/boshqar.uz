<template>
  <div v-if="isOpen" @click.self="$emit('close')" class="modal-overlay">
    <div class="modal-container max-w-md" @click.stop>
      <div class="modal-header">
        <h3 class="text-base font-bold text-slate-900 dark:text-white">{{ editingEmpId ? 'Xodimni Tahrirlash' : 'Yangi Xodim Qo\'shish' }}</h3>
        <button @click="$emit('close')" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"><X class="w-5 h-5" /></button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="$emit('save')" class="space-y-3 text-xs">
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

          <!-- Granular Action Permissions (Create, Edit, Delete) for Selected Modules -->
          <div v-if="empForm.allowedModules.length > 0" class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <span class="block font-bold text-slate-800 dark:text-slate-200 text-xs">
              Operatsion Huquqlar (Qo'shish, Tahrirlash, O'chirish):
            </span>

            <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
              <div
                v-for="modId in empForm.allowedModules"
                :key="modId"
                class="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-[11px]"
              >
                <div class="font-bold text-slate-900 dark:text-white mb-1">
                  {{ getModuleLabel(modId) }}
                </div>
                <div class="grid grid-cols-3 gap-1 text-[10px]">
                  <label class="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      v-model="getActionPerm(modId).create"
                      class="rounded text-emerald-500 focus:ring-emerald-500"
                    />
                    <Plus class="w-3 h-3 text-emerald-500" />
                    <span>Qo'shish</span>
                  </label>
                  <label class="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      v-model="getActionPerm(modId).edit"
                      class="rounded text-emerald-500 focus:ring-emerald-500"
                    />
                    <Edit2 class="w-3 h-3 text-amber-500" />
                    <span>Tahrirlash</span>
                  </label>
                  <label class="flex items-center gap-1 cursor-pointer text-rose-600 dark:text-rose-400 font-bold">
                    <input
                      type="checkbox"
                      v-model="getActionPerm(modId).delete"
                      class="rounded text-rose-500 focus:ring-rose-500"
                    />
                    <Trash2 class="w-3 h-3 text-rose-500" />
                    <span>O'chirish</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            :disabled="saving"
            class="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition mt-3 btn-interactive disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none select-none flex items-center justify-center gap-2"
          >
            <span v-if="saving" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>{{ saving ? (editingEmpId ? 'Saqlanmoqda...' : 'Qo\'shilmoqda...') : (editingEmpId ? 'O\'zgarishlarni Saqlash' : 'Xodimni Saqlash') }}</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { X, Plus, Edit2, Trash2 } from 'lucide-vue-next';
import PhoneInput from '../../../components/PhoneInput.vue';

defineProps<{
  isOpen: boolean;
  editingEmpId: string | null;
  empForm: any;
  availableModules: { id: string; label: string }[];
  saving: boolean;
  getModuleLabel: (id: string) => string;
  getActionPerm: (modId: string) => any;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'save'): void;
}>();
</script>
