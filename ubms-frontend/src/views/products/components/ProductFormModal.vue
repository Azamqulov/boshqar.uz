<template>
  <Teleport to="body">
    <div v-if="isOpen" @click.self="$emit('close')" class="modal-overlay">
      <div class="modal-container max-w-lg" @click.stop>
        <div class="modal-header">
          <h3 class="text-base font-bold text-slate-900 dark:text-white">{{ editingId ? 'Mahsulotni Tahrirlash' : 'Yangi Mahsulot / Taom' }}</h3>
          <button @click="$emit('close')" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"><X class="w-5 h-5" /></button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="$emit('save')" class="space-y-3.5 text-xs">
            <!-- Product Type Toggle -->
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Mahsulot Turi</label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  @click="form.productType = 'goods'"
                  class="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-semibold transition"
                  :class="form.productType === 'goods' ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'"
                >
                  <span>📦</span>
                  <span>Tovar</span>
                </button>
                <button
                  type="button"
                  @click="form.productType = 'dish'"
                  class="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-semibold transition"
                  :class="form.productType === 'dish' ? 'bg-amber-500 text-white border-amber-500 shadow-sm' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'"
                >
                  <span>🍕</span>
                  <span>Taom / Oshxona</span>
                </button>
                <button
                  type="button"
                  @click="form.productType = 'service'"
                  class="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-semibold transition"
                  :class="form.productType === 'service' ? 'bg-sky-500 text-white border-sky-500 shadow-sm' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'"
                >
                  <span>🛠</span>
                  <span>Xizmat</span>
                </button>
              </div>
            </div>

            <!-- Image Upload & Preset Selector -->
            <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2.5">
              <div class="flex items-center justify-between">
                <label class="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                  <ImageIcon class="w-4 h-4 text-emerald-500" />
                  <span>Mahsulot Rasmi</span>
                </label>
                <div class="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-700/80 p-0.5 rounded-lg text-[10px] font-bold">
                  <button
                    type="button"
                    @click="imageInputMode = 'upload'"
                    class="px-2 py-0.5 rounded-md transition"
                    :class="imageInputMode === 'upload' ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'"
                  >
                    📁 Fayl yuklash
                  </button>
                  <button
                    type="button"
                    @click="imageInputMode = 'url'"
                    class="px-2 py-0.5 rounded-md transition"
                    :class="imageInputMode === 'url' ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'"
                  >
                    🔗 Havola / Shablon
                  </button>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <!-- Image Preview Box / Clickable Upload Trigger -->
                <div
                  @click="triggerFileInput"
                  class="relative group w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition shrink-0 shadow-inner"
                  :title="form.imageUrl ? 'Rasmni almashtirish' : 'Rasm yuklash uchun bosing'"
                >
                  <img v-if="form.imageUrl" :src="form.imageUrl" class="w-full h-full object-cover" />
                  <div v-else class="flex flex-col items-center justify-center text-slate-400 group-hover:text-emerald-500">
                    <Upload class="w-5 h-5 mb-0.5" />
                    <span class="text-[9px] font-bold">Tanlash</span>
                  </div>

                  <!-- Hover Overlay when image exists -->
                  <div v-if="form.imageUrl" class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                    <Edit2 class="w-4 h-4" />
                  </div>
                </div>

                <!-- Upload Mode Controls -->
                <div v-if="imageInputMode === 'upload'" class="flex-1 space-y-1.5">
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      @click="triggerFileInput"
                      class="px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold transition flex items-center gap-1.5 btn-interactive"
                    >
                      <Upload class="w-3.5 h-3.5" />
                      <span>{{ form.imageUrl ? "Rasmni almashtirish" : "Kompyuterdan tanlash" }}</span>
                    </button>

                    <button
                      v-if="form.imageUrl"
                      type="button"
                      @click="removeImage"
                      class="px-2.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-bold transition flex items-center gap-1"
                      title="Rasmni o'chirish"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                      <span>O'chirish</span>
                    </button>
                  </div>
                  <p class="text-[10px] text-slate-400">JPG, PNG, WebP yoki GIF (avtomatik moslanadi)</p>
                </div>

                <!-- URL Mode Controls -->
                <div v-else class="flex-1 space-y-1.5">
                  <div class="flex items-center gap-2">
                    <div class="flex-1">
                      <AppInput
                        v-model="form.imageUrl"
                        placeholder="https://... rasm havolasi"
                      />
                    </div>
                    <button
                      v-if="form.imageUrl"
                      type="button"
                      @click="removeImage"
                      class="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Tozalash"
                    >
                      <X class="w-4 h-4" />
                    </button>
                  </div>

                  <!-- Presets -->
                  <div class="flex flex-wrap gap-1 items-center">
                    <span class="text-[10px] text-slate-400 font-semibold mr-0.5">Tayyor:</span>
                    <button
                      type="button"
                      v-for="preset in fastImagePresets"
                      :key="preset.name"
                      @click="form.imageUrl = preset.url"
                      class="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-[10px] text-slate-600 dark:text-slate-300 hover:text-emerald-600 border border-slate-200 dark:border-slate-700 transition font-medium"
                    >
                      {{ preset.name }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Hidden file input -->
              <input
                ref="fileInputRef"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleImageFileUpload"
              />
            </div>

            <div>
              <AppInput
                v-model="form.name"
                label="Mahsulot Nomi *"
                placeholder="Masalan: Pitsa Pepperoni, Coca-Cola 0.5L"
                :required="true"
              />
            </div>

            <!-- Category & Barcode -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="font-semibold text-slate-700 dark:text-slate-300">Kategoriya</label>
                  <router-link to="/categories" class="text-[11px] font-bold text-emerald-600 hover:underline">+ Yangi</router-link>
                </div>
                <AppSelect
                  v-model="form.categoryId"
                  :options="categoryOptions"
                  :searchable="true"
                  placeholder="Kategoriyani tanlang"
                />
              </div>
              <div>
                <AppInput
                  v-model="form.barcode"
                  label="Shtrix-kod"
                  placeholder="EAN-13 / Barcode"
                />
              </div>
            </div>

            <!-- Prices with 3-digit formatted CurrencyInput -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tannarx (Kirim)</label>
                <CurrencyInput
                  v-model="form.purchasePrice"
                  placeholder="0"
                  suffix="so'm"
                />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Sotuv Narxi *</label>
                <CurrencyInput
                  v-model="form.salePrice"
                  placeholder="0"
                  suffix="so'm"
                  :required="true"
                  inputClass="font-bold text-emerald-600 dark:text-emerald-400"
                />
              </div>
            </div>

            <div v-if="form.productType === 'goods'" class="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <AppInput
                v-model="form.minStock"
                label="Min. Qoldiq ogohlantirish"
                type="number"
                placeholder="5"
              />
              <AppInput
                v-model="form.initialStock"
                :label="editingId ? 'Do\'kondagi qoldiq (soni)' : 'Boshlang\'ich qoldiq (soni)'"
                type="number"
                placeholder="10"
              />
            </div>

            <!-- Notice for Dish / Kitchen / Service -->
            <div v-else class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] flex items-center gap-2">
              <span class="text-base" v-if="form.productType === 'dish'">🍕</span>
              <span class="text-base" v-else>🛠</span>
              <div>
                <span class="font-bold block" v-if="form.productType === 'dish'">Tayyorlanadigan taom:</span>
                <span class="font-bold block" v-else>Xizmat turi:</span>
                <span>Qoldiq hisobi yuritilmaydi. Buyurtma tushganda oshxona (KDS) yoki xizmatga darhol yo'naltiriladi.</span>
              </div>
            </div>

            <div class="mt-4">
              <AppButton type="submit" variant="primary" size="lg" class="w-full">
                Saqlash
              </AppButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { X, Image as ImageIcon, Upload, Edit2, Trash2 } from 'lucide-vue-next';
import AppButton from '../../../components/AppButton.vue';
import AppInput from '../../../components/AppInput.vue';
import AppSelect from '../../../components/AppSelect.vue';
import CurrencyInput from '../../../components/CurrencyInput.vue';

const props = defineProps<{
  isOpen: boolean;
  editingId: string | null;
  form: any;
  categoryOptions: any[];
  fastImagePresets: Array<{ name: string; url: string }>;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'save'): void;
}>();

const imageInputMode = ref<'upload' | 'url'>('upload');
const fileInputRef = ref<HTMLInputElement | null>(null);

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const handleImageFileUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    props.form.imageUrl = event.target?.result as string;
  };
  reader.readAsDataURL(file);
};

const removeImage = () => {
  props.form.imageUrl = null;
};
</script>
