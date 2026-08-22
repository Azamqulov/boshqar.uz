<template>
  <Teleport to="body">
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[9999] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        @click.self="close"
      >
        <div
          class="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col my-auto animate-in zoom-in-95 duration-200 max-h-[90vh]"
        >
          <!-- Modal Header -->
          <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Sparkles class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-sm font-bold text-slate-900 dark:text-white">Mahsulot rasmini tanlash & qidirish</h3>
                <p class="text-[11px] text-slate-400 truncate max-w-[320px]">
                  «{{ product?.name || 'Yangi mahsulot' }}» uchun mos rasmni tanlang
                </p>
              </div>
            </div>

            <button
              type="button"
              @click="close"
              class="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Modal Body (Scrollable) -->
          <div class="p-6 space-y-4 overflow-y-auto flex-1">
            <!-- 1. Current Preview Banner -->
            <div class="flex items-center gap-4 p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl">
              <div class="w-16 h-16 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                <img
                  v-if="previewUrl"
                  :src="previewUrl"
                  :alt="product?.name"
                  class="w-full h-full object-contain p-1"
                />
                <ImageIcon v-else class="w-7 h-7 text-slate-300 dark:text-slate-600" />
              </div>

              <div class="flex-1 min-w-0 space-y-1">
                <div class="flex items-center justify-between">
                  <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {{ product?.name || 'Mahsulot' }}
                  </h4>
                  <span
                    v-if="previewUrl"
                    class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
                  >
                    Tanlangan
                  </span>
                </div>
                <p class="text-[11px] text-slate-400">
                  {{ previewUrl ? "Rasm mahsulotga biriktirilgan" : "Hozircha rasm belgilanmagan" }}
                </p>
                <button
                  v-if="previewUrl"
                  type="button"
                  @click="removeImage"
                  class="text-[10px] font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 transition"
                >
                  <Trash2 class="w-3 h-3" />
                  <span>Rasmni o'chirish</span>
                </button>
              </div>
            </div>

            <!-- 2. Tabs: Online Smart Search / Upload File / Enter URL -->
            <div class="space-y-3">
              <div class="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-2 text-xs font-semibold">
                <button
                  type="button"
                  @click="activeTab = 'search'"
                  class="pb-1 px-1 border-b-2 transition flex items-center gap-1.5"
                  :class="activeTab === 'search' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'"
                >
                  <Search class="w-3.5 h-3.5" />
                  <span>Internetdan qidirish</span>
                </button>
                <button
                  type="button"
                  @click="activeTab = 'upload'"
                  class="pb-1 px-1 border-b-2 transition flex items-center gap-1.5"
                  :class="activeTab === 'upload' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'"
                >
                  <UploadCloud class="w-3.5 h-3.5" />
                  <span>Fayl yuklash</span>
                </button>
                <button
                  type="button"
                  @click="activeTab = 'url'"
                  class="pb-1 px-1 border-b-2 transition flex items-center gap-1.5"
                  :class="activeTab === 'url' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'"
                >
                  <Link class="w-3.5 h-3.5" />
                  <span>Havola (URL)</span>
                </button>
              </div>

              <!-- TAB 1: SMART ONLINE SEARCH (Auto based on title) -->
              <div v-if="activeTab === 'search'" class="space-y-3">
                <!-- Search Input Bar -->
                <div class="flex items-center gap-2">
                  <div class="flex-1 flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/20">
                    <Search class="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      v-model="searchQuery"
                      type="text"
                      placeholder="Tovar nomini kiriting (masalan: Coca-Cola, Lavash, Snickers)..."
                      class="w-full bg-transparent text-xs outline-none text-slate-900 dark:text-white placeholder-slate-400"
                      @keydown.enter.prevent="handleSearch"
                    />
                  </div>
                  <button
                    type="button"
                    @click="handleSearch"
                    class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                  >
                    Qidirish
                  </button>
                </div>



                <!-- Image Search Results Grid -->
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      «{{ searchQuery || 'Natijalar' }}» bo'yicha topilgan rasmlar ({{ searchedImages.length }} ta):
                    </span>
                    <span class="text-[10px] text-slate-400">Keraklisini bosing</span>
                  </div>

                  <div class="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto pr-1">
                    <button
                      v-for="(img, idx) in searchedImages"
                      :key="idx"
                      type="button"
                      @click="selectImage(img.url)"
                      class="group relative border rounded-2xl p-2 flex flex-col items-center gap-1.5 transition text-center hover:border-emerald-500 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 overflow-hidden"
                      :class="previewUrl === img.url ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/50 ring-2 ring-emerald-500/30' : 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/50'"
                    >
                      <div class="w-full h-16 rounded-xl overflow-hidden flex items-center justify-center bg-slate-50 dark:bg-slate-800/80 p-1">
                        <img
                          :src="img.url"
                          :alt="img.name"
                          class="w-full h-full object-contain group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                      </div>
                      <span class="text-[10px] font-semibold text-slate-700 dark:text-slate-300 truncate w-full">
                        {{ img.name }}
                      </span>

                      <!-- Check badge when selected -->
                      <div
                        v-if="previewUrl === img.url"
                        class="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs"
                      >
                        <Check class="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <!-- TAB 2: Drag & Drop File Upload -->
              <div v-else-if="activeTab === 'upload'" class="space-y-2">
                <label
                  class="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10 transition group"
                >
                  <div class="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                    <UploadCloud class="w-9 h-9 mb-2 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition" />
                    <p class="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Rasmni bu yerga tashlang yoki <span class="text-emerald-600 dark:text-emerald-400 underline font-bold">kompyuterdan tanlang</span>
                    </p>
                    <p class="text-[10px] text-slate-400 mt-1">PNG, JPG, WebP, GIF (Maks. 5MB)</p>
                  </div>
                  <input
                    type="file"
                    class="hidden"
                    accept="image/*"
                    @change="handleFileUpload"
                  />
                </label>
              </div>

              <!-- TAB 3: Direct URL Input -->
              <div v-else-if="activeTab === 'url'" class="space-y-2">
                <div class="space-y-1">
                  <label class="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Rasm URL manzili</label>
                  <div class="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/20">
                    <Link class="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      v-model="customUrl"
                      type="url"
                      placeholder="https://example.com/rasm.png"
                      class="flex-1 bg-transparent text-xs outline-none text-slate-900 dark:text-white placeholder-slate-400"
                      @input="previewUrl = customUrl"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="px-6 py-4 bg-slate-50/80 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              @click="close"
              class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition"
            >
              Bekor qilish
            </button>

            <button
              type="button"
              @click="applyImage"
              class="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition"
            >
              <Check class="w-4 h-4" />
              <span>Saqlash</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import {
  Image as ImageIcon,
  X,
  UploadCloud,
  Link,
  Check,
  Trash2,
  Search,
  Sparkles,
} from 'lucide-vue-next';
import type { TableProductItem } from './ai-import/types';

const props = defineProps<{
  isOpen: boolean;
  product: TableProductItem | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'update:image', url: string): void;
}>();

const activeTab = ref<'search' | 'upload' | 'url'>('search');
const searchQuery = ref('');
const previewUrl = ref('');
const customUrl = ref('');

const quickCategories = [
  'Kola / Gazli',
  'Pepsi',
  'Sharbat / Suv',
  'Burger / Lavash',
  'Shirinlik / Shokolad',
  'Non / Somsa',
  'Sut / Qatiq',
  'Maishiy kimyo',
];

// Curated Comprehensive Product Image Database for High-Precision Matching
const masterProductDatabase = [
  // 0. Gigiyena & Tish Pastalari (Colgate, Sensodyne, Blend-a-med)
  { name: 'Colgate Triple Action Tish Pastasi', category: 'Kimyo', keywords: ['colgate', 'tish', 'pastasi', 'tish pastasi', 'toothpaste'], url: 'https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=400' },
  { name: 'Sensodyne Tish Pastasi', category: 'Kimyo', keywords: ['sensodyne', 'tish', 'pastasi', 'tish pastasi', 'toothpaste'], url: 'https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=400' },
  { name: 'Blend-a-med 3D White Tish Pastasi', category: 'Kimyo', keywords: ['blend-a-med', 'tish', 'pastasi', 'tish pastasi'], url: 'https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=400' },

  // 1. Maishiy Kimyo & Kir Yuvish Kukunlari (Ariel, Persil, Tide, Pomo)
  { name: 'Ariel Avtomat Kir Kukuni 3kg', category: 'Kimyo', keywords: ['ariel', 'kir', 'kukun', 'kukuni', 'poroshok', 'detergent', 'washing powder'], url: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400' },
  { name: 'Persil Avtomat Kir Kukuni', category: 'Kimyo', keywords: ['persil', 'kir', 'kukun', 'kukuni', 'poroshok'], url: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400' },
  { name: 'Tide Kir Poroshogi', category: 'Kimyo', keywords: ['tide', 'kir', 'kukun', 'poroshok'], url: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400' },
  { name: 'Pomo Kir Kukuni', category: 'Kimyo', keywords: ['pomo', 'kir', 'kukun', 'poroshok'], url: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400' },
  { name: 'Fairy Idish Yuvish Geli 1L', category: 'Kimyo', keywords: ['fairy', 'idish', 'gel', 'suyuqlik'], url: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400' },
  { name: 'Head & Shoulders Shampun', category: 'Kimyo', keywords: ['shampun', 'shampoo', 'head', 'shoulders'], url: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400' },
  { name: 'Duru Xushbo\'y Sovun', category: 'Kimyo', keywords: ['sovun', 'soap', 'duru', 'fax'], url: 'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=400' },
  { name: 'Coca-Cola Classic Banka', category: 'Kola', keywords: ['kola', 'coca', 'cola'], url: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400' },
  { name: 'Coca-Cola Zero', category: 'Kola', keywords: ['kola', 'zero', 'coca'], url: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400' },
  { name: 'Pepsi 1.5L', category: 'Pepsi', keywords: ['pepsi', 'pepsi-cola'], url: 'https://images.unsplash.com/photo-1553456558-aff63285bdd1?w=400' },
  { name: 'Pepsi Banka', category: 'Pepsi', keywords: ['pepsi'], url: 'https://images.unsplash.com/photo-1629203851288-7ece79ff10d6?w=400' },
  { name: 'Fanta Apelsin', category: 'Fanta', keywords: ['fanta', 'apelsin', 'orange'], url: 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=400' },
  { name: 'Sprite Limon', category: 'Sprite', keywords: ['sprite', 'limon'], url: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400' },
  { name: 'Red Bull Energetik', category: 'Energetik', keywords: ['redbull', 'red bull', 'energetik', 'energy'], url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400' },
  { name: 'Monster Energy', category: 'Energetik', keywords: ['monster', 'energy'], url: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=400' },
  { name: 'Nestle Toza Suv', category: 'Suv', keywords: ['suv', 'water', 'nestle', 'chortoq', 'aqua'], url: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=400' },
  { name: 'Chortoq Mineral Suv', category: 'Suv', keywords: ['suv', 'mineral', 'chortoq'], url: 'https://images.unsplash.com/photo-1560684352-8497838a2229?w=400' },
  { name: 'Dinay Apelsin Sharbati', category: 'Sharbat', keywords: ['sharbat', 'juice', 'dinay', 'sok', 'apelsin'], url: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400' },
  { name: 'Olma Sharbati', category: 'Sharbat', keywords: ['sharbat', 'olma', 'sok'], url: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400' },
  { name: 'Moxito Ichimligi', category: 'Sharbat', keywords: ['moxito', 'mojito'], url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400' },
  { name: 'Qahva / Kofe Latte', category: 'Kofe', keywords: ['kofe', 'coffee', 'qahva', 'cappuccino'], url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400' },
  { name: 'Issiq Qora Choy', category: 'Choy', keywords: ['choy', 'tea', 'green tea'], url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400' },

  // 2. Fast-Food & Ovqatlar
  { name: 'Lavash Go\'shtli', category: 'Fast-food', keywords: ['lavash', 'doner', 'shaurma', 'wrap'], url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400' },
  { name: 'Gamburger Cheese', category: 'Fast-food', keywords: ['burger', 'gamburger', 'cheeseburger', 'hamburger'], url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' },
  { name: 'Double Burger', category: 'Fast-food', keywords: ['burger', 'gamburger'], url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400' },
  { name: 'Hot-Dog', category: 'Fast-food', keywords: ['hotdog', 'hot-dog', 'sosiska'], url: 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?w=400' },
  { name: 'Pitsa Pepperoni', category: 'Fast-food', keywords: ['pizza', 'pitsa', 'pepperoni'], url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400' },
  { name: 'Kartoshka Fri', category: 'Fast-food', keywords: ['fri', 'fries', 'kartoshka'], url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400' },
  { name: 'Tovuq Nuggets', category: 'Fast-food', keywords: ['nuggets', 'tovuq', 'kfc'], url: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400' },
  { name: 'Somsa Go\'shtli', category: 'Non', keywords: ['somsa', 'tandir', 'samsa'], url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400' },
  { name: 'O\'zbek Nonvoy Noni', category: 'Non', keywords: ['non', 'patir', 'bread', 'lepyoshka'], url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400' },

  // 3. Shirinliklar & Snacklar
  { name: 'Snickers Super Shokolad', category: 'Shirinlik', keywords: ['snickers', 'shokolad', 'chocolate'], url: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?w=400' },
  { name: 'Twix Shokolad', category: 'Shirinlik', keywords: ['twix', 'shokolad'], url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400' },
  { name: 'KitKat Vafli', category: 'Shirinlik', keywords: ['kitkat', 'kit-kat', 'vafli'], url: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400' },
  { name: 'Lays Chips', category: 'Snack', keywords: ['lays', 'chips', 'kartoshka', 'chipsi'], url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400' },
  { name: 'Oreo Pechenye', category: 'Shirinlik', keywords: ['oreo', 'pechenye', 'cookies'], url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400' },
  { name: 'Nutella Shokoladli Pasta', category: 'Shirinlik', keywords: ['nutella', 'shokolad-pasta', 'shokolad'], url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400' },
  { name: 'Muzqaymoq Plombir', category: 'Shirinlik', keywords: ['muzqaymoq', 'ice cream', 'plombir'], url: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400' },

  // 4. Oziq-ovqat, Sut & Go'sht
  { name: 'Sut 3.2%', category: 'Sut', keywords: ['sut', 'milk', 'qatiq', 'kefir'], url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400' },
  { name: 'Sariyo\'g\' / Pishloq', category: 'Sut', keywords: ['pishloq', 'cheese', 'sir', 'yog', 'sariyog'], url: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400' },
  { name: 'Pista & Yong\'oq', category: 'Snack', keywords: ['pista', 'yongoq', 'bodom', 'funduk', 'nuts'], url: 'https://images.unsplash.com/photo-1508736793122-f516e3ba5569?w=400' },
  { name: 'O\'simlik Yog\'i 1L', category: 'Oziq-ovqat', keywords: ['yog', 'oil', 'kungaboqar', 'paxta'], url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400' },
  { name: 'Tuxum 10 talik', category: 'Oziq-ovqat', keywords: ['tuxum', 'egg', 'eggs'], url: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=400' },

  // 5. Maishiy Kimyo
  { name: 'Fairy Idish Yuvish', category: 'Kimyo', keywords: ['fairy', 'idish', 'gel'], url: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400' },
  { name: 'Kir Yuvish Poroshogi', category: 'Kimyo', keywords: ['poroshok', 'ariel', 'persil', 'tide', 'kir'], url: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400' },
  { name: 'Shampun / Dush Geli', category: 'Kimyo', keywords: ['shampun', 'shampoo', 'sovun', 'dush'], url: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400' },
];

import api from '@/services/api';

const apiImages = ref<any[]>([]);
const isSearchingApi = ref(false);

const searchedImages = computed(() => {
  if (apiImages.value.length > 0) {
    return apiImages.value;
  }

  const query = (searchQuery.value || '').toLowerCase().trim();
  if (!query) {
    return masterProductDatabase.slice(0, 16);
  }

  const terms = query.split(/\s+/).filter(Boolean);

  const matched = masterProductDatabase.filter((item) => {
    const itemText = (item.name + ' ' + item.category + ' ' + item.keywords.join(' ')).toLowerCase();
    return terms.some((t) => itemText.includes(t));
  });

  if (matched.length > 0) {
    return matched;
  }

  return masterProductDatabase.slice(0, 12);
});

const handleSearch = async () => {
  if (!searchQuery.value?.trim()) return;
  isSearchingApi.value = true;
  try {
    const { data } = await api.get('/products/search-images', { params: { query: searchQuery.value } });
    if (data && data.images && data.images.length > 0) {
      apiImages.value = data.images;
    }
  } catch (err) {
    console.warn('API image search error:', err);
  } finally {
    isSearchingApi.value = false;
  }
};

watch(
  () => [props.isOpen, props.product],
  ([open, prod]) => {
    if (open && prod) {
      previewUrl.value = (prod as any).imageUrl || '';
      searchQuery.value = (prod as any).name || '';
      handleSearch();
    }
  },
  { immediate: true }
);

const setCategorySearch = (cat: string) => {
  searchQuery.value = cat;
  handleSearch();
};

const selectImage = (url: string) => {
  previewUrl.value = url;
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    if (e.target?.result) {
      previewUrl.value = e.target.result as string;
    }
  };
  reader.readAsDataURL(file);
};

const removeImage = () => {
  previewUrl.value = '';
  customUrl.value = '';
};

const applyImage = () => {
  emit('update:image', previewUrl.value);
  close();
};

const close = () => {
  emit('close');
};
</script>
