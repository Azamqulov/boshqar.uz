<template>
  <div class="space-y-5">
    <!-- Header with Action Buttons -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Mahsulotlar va Taomnoma</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Barcha tovarlar, tayyorlanadigan taomlar, kategoriyalar va qoldiqlar boshqaruvi</p>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="openCategoryModal"
          class="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 transition btn-interactive"
        >
          <FolderTree class="w-4 h-4 text-emerald-500" />
          <span>Kategoriyalar ({{ categories.length }})</span>
        </button>

        <button
          @click="openCreateModal"
          class="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition btn-interactive"
        >
          <Plus class="w-4 h-4" />
          <span>Yangi Mahsulot Qo'shish</span>
        </button>
      </div>
    </div>

    <!-- Search and Category Filter -->
    <div class="flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Mahsulot nomi, SKU yoki shtrix-kod bo'yicha qidiruv..."
          class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
        />
      </div>
      <div class="w-full sm:w-64">
        <AppSelect
          v-model="selectedCategoryId"
          :options="categoryFilterOptions"
          :searchable="true"
          placeholder="Barcha Kategoriyalar"
        />
      </div>
    </div>

    <!-- Products Table -->
    <SkeletonLoader v-if="loading" variant="table" :rows="8" />

    <div v-else class="glass-card rounded-2xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-semibold">
            <tr>
              <th class="py-3 px-4">Rasm & Nomi</th>
              <th class="py-3 px-4">Turi</th>
              <th class="py-3 px-4">SKU / Shtrix-kod</th>
              <th class="py-3 px-4">Kategoriya</th>
              <th class="py-3 px-4">Tannarx</th>
              <th class="py-3 px-4">Sotuv Narxi</th>
              <th class="py-3 px-4">Qoldiq</th>
              <th class="py-3 px-4 text-center">Sotuvda (Status)</th>
              <th class="py-3 px-4 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
            <tr v-if="filteredProducts.length === 0">
              <td colspan="9" class="py-8 text-center text-slate-400 dark:text-slate-500">Mahsulotlar topilmadi</td>
            </tr>
            <tr v-for="prod in filteredProducts" :key="prod.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
              <td class="py-3 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  <img
                    v-if="prod.imageUrl"
                    :src="prod.imageUrl"
                    :alt="prod.name"
                    class="w-full h-full object-cover"
                    @error="prod.imageUrl = null"
                  />
                  <Package v-else class="w-5 h-5 text-slate-400 dark:text-slate-500" />
                </div>
                <div>
                  <span class="block text-slate-900 dark:text-slate-100 font-semibold">{{ prod.name }}</span>
                  <span v-if="prod.description" class="text-[10px] text-slate-500 dark:text-slate-400 font-normal line-clamp-1">{{ prod.description }}</span>
                </div>
              </td>
              <td class="py-3 px-4">
                <span
                  v-if="prod.brand === 'dish' || prod.unit?.shortName === 'por'"
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-semibold"
                >
                  <span>🍕 Taom / Oshxona</span>
                </span>
                <span
                  v-else-if="prod.brand === 'service'"
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[11px] font-semibold"
                >
                  <span>🛠 Xizmat</span>
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold"
                >
                  <span>📦 Tovar</span>
                </span>
              </td>
              <td class="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono">
                {{ prod.sku }}
                <span v-if="prod.barcode" class="block text-[10px] text-slate-400 dark:text-slate-500">{{ prod.barcode }}</span>
              </td>
              <td class="py-3 px-4 text-slate-700 dark:text-slate-300">
                <span
                  v-if="prod.category"
                  class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium"
                  :style="{ backgroundColor: (prod.category.color || '#10b981') + '15', color: prod.category.color || '#10b981' }"
                >
                  <span class="text-xs" v-if="prod.category.icon">{{ prod.category.icon }}</span>
                  <span v-else class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: prod.category.color || '#10b981' }"></span>
                  <span>{{ prod.category.name }}</span>
                </span>
                <span v-else class="text-slate-400">-</span>
              </td>
              <td class="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono">{{ formatCurrency(prod.purchasePrice) }}</td>
              <td class="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400 font-mono">{{ formatCurrency(prod.salePrice) }}</td>
              <td class="py-3 px-4 font-mono">
                <span
                  v-if="prod.brand === 'dish' || prod.brand === 'service' || prod.unit?.shortName === 'por'"
                  class="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                >
                  Cheklanmagan
                </span>
                <span
                  v-else
                  class="font-bold px-2 py-0.5 rounded text-[11px]"
                  :class="prod.stockQty <= 0 ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30' : prod.stockQty <= prod.minStock ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'"
                >
                  {{ prod.stockQty <= 0 ? 'Tugagan (0)' : `${prod.stockQty} ${prod.unit?.shortName || 'dona'}` }}
                </span>
              </td>
              <!-- Status / Stop-list Switch Button -->
              <td class="py-3 px-4 text-center">
                <button
                  type="button"
                  @click="toggleAvailability(prod)"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition cursor-pointer"
                  :class="prod.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/20'"
                  :title="prod.status === 'active' ? 'Sotuvda bor (Stop-listga olish uchun bosing)' : 'Stop-listda (Sotuvga chiqarish uchun bosing)'"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="prod.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'"></span>
                  <span>{{ prod.status === 'active' ? 'Mavjud' : 'Stop-list' }}</span>
                </button>
              </td>
              <td class="py-3 px-4 text-right space-x-1">
                <button
                  @click="editProduct(prod)"
                  class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
                  title="Tahrirlash"
                >
                  <Edit2 class="w-3.5 h-3.5" />
                </button>
                <button
                  @click="deleteProduct(prod.id)"
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

    <!-- Product Create/Edit Modal -->
    <div v-if="isModalOpen" @click.self="isModalOpen = false" class="modal-overlay">
      <div class="modal-container max-w-lg" @click.stop>
        <div class="modal-header">
          <h3 class="text-base font-bold text-slate-900 dark:text-white">{{ editingId ? 'Mahsulotni Tahrirlash' : 'Yangi Mahsulot / Taom' }}</h3>
          <button @click="isModalOpen = false" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"><X class="w-5 h-5" /></button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="saveProduct" class="space-y-3.5 text-xs">
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

            <!-- Image URL & Fast Presets -->
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Rasm (URL)</label>
              <div class="flex items-center gap-3">
                <div class="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img v-if="form.imageUrl" :src="form.imageUrl" class="w-full h-full object-cover" />
                  <ImageIcon v-else class="w-6 h-6 text-slate-400 dark:text-slate-500" />
                </div>
                <div class="flex-1 space-y-1.5">
                  <input
                    v-model="form.imageUrl"
                    placeholder="https://... rasm havolasini kiriting"
                    class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <!-- Fast Photo Presets -->
                  <div class="flex items-center gap-1.5 overflow-x-auto text-[10px] text-slate-500 dark:text-slate-400">
                    <span>Tayyor:</span>
                    <button
                      type="button"
                      v-for="preset in photoPresets"
                      :key="preset.name"
                      @click="form.imageUrl = preset.url"
                      class="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
                    >
                      {{ preset.name }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nomi *</label>
              <input v-model="form.name" required placeholder="Masalan: Pitsa Pepperoni, Coca-Cola 0.5L" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
            </div>

            <!-- Category & Barcode -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="font-semibold text-slate-700 dark:text-slate-300">Kategoriya</label>
                  <button type="button" @click="openCategoryModal" class="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-0.5">
                    <Plus class="w-3 h-3" />
                    <span>Yangi</span>
                  </button>
                </div>
                <AppSelect
                  v-model="form.categoryId"
                  :options="categoryFormOptions"
                  :searchable="true"
                  placeholder="Kategoriyani tanlang..."
                />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Shtrix-kod</label>
                <input v-model="form.barcode" placeholder="EAN-13 / Barcode" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
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

            <!-- Stock Controls (Only for 'goods') -->
            <div v-if="form.productType === 'goods'" class="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <div>
                <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Min. Qoldiq ogohlantirish</label>
                <input type="number" v-model.number="form.minStock" class="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500" />
              </div>
              <div v-if="!editingId">
                <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Boshlang'ich qoldiq</label>
                <input type="number" v-model.number="form.initialStock" class="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500" />
              </div>
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

            <button type="submit" class="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition mt-4 btn-interactive">
              Saqlash
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- Category Management Modal (Redesigned) -->
    <div v-if="isCategoryModalOpen" @click.self="isCategoryModalOpen = false" class="modal-overlay">
      <div class="modal-container max-w-xl" @click.stop>
        <div class="modal-header">
          <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderTree class="w-5 h-5 text-emerald-500" />
            <span>Kategoriyalar Boshqaruvi</span>
          </h3>
          <button @click="isCategoryModalOpen = false" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"><X class="w-5 h-5" /></button>
        </div>

        <div class="modal-body space-y-4">
          <!-- 1-Click Fast Category Presets -->
          <div>
            <span class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
              Tezkor Kategoriya Qo'shish (1-bosishda):
            </span>
            <div class="flex flex-wrap gap-1.5">
              <button
                type="button"
                v-for="preset in fastCategoryPresets"
                :key="preset.name"
                @click="applyPreset(preset)"
                class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-800 dark:text-slate-200 text-xs font-semibold transition"
              >
                <span>{{ preset.icon }}</span>
                <span>{{ preset.name }}</span>
              </button>
            </div>
          </div>

          <!-- Add/Edit Category Form -->
          <form @submit.prevent="saveCategory" class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: catForm.color }"></span>
                <span>{{ editingCatId ? 'Kategoriyani Tahrirlash' : 'Yangi Kategoriya Qo\'shish' }}</span>
              </span>
              <button v-if="editingCatId" type="button" @click="resetCategoryForm" class="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-semibold">Bekor qilish</button>
            </div>

            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategoriya Nomi *</label>
              <input
                v-model="catForm.name"
                required
                placeholder="Masalan: Pitsa & Fast Food, Issiq taomlar, Ichimliklar"
                class="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <!-- Emoji and Color Chips -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- Emoji Selector -->
              <div>
                <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Ikonka (Emoji)</label>
                <div class="flex items-center gap-2">
                  <input
                    v-model="catForm.icon"
                    placeholder="🍕"
                    class="w-12 text-center text-lg px-2 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                  <div class="flex flex-wrap gap-1 flex-1">
                    <button
                      type="button"
                      v-for="emoji in quickEmojis"
                      :key="emoji"
                      @click="catForm.icon = emoji"
                      class="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-sm transition"
                    >
                      {{ emoji }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Color Palette -->
              <div>
                <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Rang</label>
                <div class="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    v-for="color in quickColors"
                    :key="color"
                    @click="catForm.color = color"
                    class="w-6 h-6 rounded-full border-2 transition transform hover:scale-110"
                    :class="catForm.color === color ? 'border-slate-900 dark:border-white ring-2 ring-emerald-500/30' : 'border-transparent'"
                    :style="{ backgroundColor: color }"
                  ></button>
                  <input
                    type="color"
                    v-model="catForm.color"
                    class="w-6 h-6 rounded-full cursor-pointer border border-slate-300 dark:border-slate-700 p-0 bg-transparent"
                    title="Boshqa rang"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              :disabled="savingCategory"
              class="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition btn-interactive"
            >
              {{ savingCategory ? 'Saqlanmoqda...' : (editingCatId ? 'Kategoriyani Yangilash' : 'Kategoriyani Saqlash') }}
            </button>
          </form>

          <!-- Existing Categories List -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Mavjud Kategoriyalar ({{ categories.length }} ta)
              </span>
              <input
                v-if="categories.length > 4"
                v-model="categorySearch"
                type="text"
                placeholder="Kategoriyalardan qidirish..."
                class="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div v-if="filteredModalCategories.length === 0" class="p-6 text-center rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 text-xs">
              Kategoriyalar mavjud emas. Yuqoridagi tezkor presetlardan tanlang yoki yangi kategoriya qo'shing.
            </div>

            <div v-else class="max-h-60 overflow-y-auto space-y-1.5 pr-1">
              <div
                v-for="cat in filteredModalCategories"
                :key="cat.id"
                class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs hover:border-slate-300 dark:hover:border-slate-700 transition"
              >
                <div class="flex items-center gap-2.5">
                  <span class="w-3 h-3 rounded-full flex-shrink-0" :style="{ backgroundColor: cat.color || '#10b981' }"></span>
                  <span class="text-base" v-if="cat.icon">{{ cat.icon }}</span>
                  <span class="font-bold text-slate-900 dark:text-white">{{ cat.name }}</span>
                  <span class="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                    {{ cat.productsCount || 0 }} ta tovar
                  </span>
                </div>

                <div class="flex items-center gap-1">
                  <button
                    @click="editCategory(cat)"
                    class="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-500/10 transition"
                    title="Tahrirlash"
                  >
                    <Edit2 class="w-3.5 h-3.5" />
                  </button>
                  <button
                    @click="deleteCategory(cat)"
                    class="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-500/10 transition"
                    title="O'chirish"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api, { getErrorMessage } from '../../services/api';
import { useFormat } from '../../composables/useFormat';
import { Plus, Edit2, Trash2, X, Search, Package, Image as ImageIcon, FolderTree } from 'lucide-vue-next';

import SkeletonLoader from '../../components/SkeletonLoader.vue';
import AppSelect, { SelectOption } from '../../components/AppSelect.vue';
import CurrencyInput from '../../components/CurrencyInput.vue';
import { useToast } from '../../composables/useToast';
import { useDataStore } from '../../stores/data.store';

const toast = useToast();
const dataStore = useDataStore();
const { formatCurrency } = useFormat();

const loading = ref(false);
const products = computed(() => dataStore.products);
const categories = computed(() => dataStore.categories);

const isModalOpen = ref(false);
const isCategoryModalOpen = ref(false);
const editingId = ref<string | null>(null);
const editingCatId = ref<string | null>(null);
const savingCategory = ref(false);

const searchQuery = ref('');
const selectedCategoryId = ref('');
const categorySearch = ref('');

const quickEmojis = ['🍕', '🍔', '🍲', '🥗', '🥤', '☕', '🍰', '🍞', '🥩', '🧴', '👕', '📦'];
const quickColors = ['#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444', '#64748b'];

const fastCategoryPresets = [
  { name: 'Pitsa & Fast Food', icon: '🍕', color: '#f59e0b' },
  { name: 'Milliy Taomlar', icon: '🍲', color: '#10b981' },
  { name: 'Salatlar & Gazaklar', icon: '🥗', color: '#14b8a6' },
  { name: 'Ichimliklar & Choy', icon: '🥤', color: '#06b6d4' },
  { name: 'Desertlar & Shirinliklar', icon: '🍰', color: '#ec4899' },
  { name: 'Non Mahsulotlari', icon: '🍞', color: '#d97706' },
  { name: 'Go\'sht & Yarim tayyor', icon: '🥩', color: '#ef4444' },
  { name: 'Maishiy & Tozalash', icon: '🧴', color: '#6366f1' },
  { name: 'Umumiy Tovarlar', icon: '📦', color: '#8b5cf6' },
];

const photoPresets = [
  { name: 'Osh', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200' },
  { name: 'Pitsa', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200' },
  { name: 'Shashlik', url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200' },
  { name: 'Somsa', url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200' },
  { name: 'Cola', url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=200' },
  { name: 'Choy/Qahva', url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=200' },
  { name: 'Non', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200' },
];

const form = ref({
  name: '',
  sku: '',
  barcode: '',
  categoryId: '',
  imageUrl: '',
  productType: 'goods' as 'goods' | 'dish' | 'service',
  purchasePrice: 0,
  salePrice: 0,
  minStock: 5,
  initialStock: 10,
});

const catForm = ref({
  name: '',
  color: '#10b981',
  icon: '📦',
});

const categoryFilterOptions = computed<SelectOption[]>(() => {
  const opts: SelectOption[] = [{ value: '', label: 'Barcha Kategoriyalar' }];
  categories.value.forEach((cat) => {
    opts.push({
      value: cat.id,
      label: `${cat.icon ? cat.icon + ' ' : ''}${cat.name}`,
      color: cat.color || '#10b981',
      badge: cat.productsCount !== undefined ? `${cat.productsCount} ta` : undefined,
    });
  });
  return opts;
});

const categoryFormOptions = computed<SelectOption[]>(() => {
  return categories.value.map((cat) => ({
    value: cat.id,
    label: `${cat.icon ? cat.icon + ' ' : ''}${cat.name}`,
    color: cat.color || '#10b981',
  }));
});

const filteredModalCategories = computed(() => {
  if (!categorySearch.value) return categories.value;
  return categories.value.filter((c) =>
    c.name.toLowerCase().includes(categorySearch.value.toLowerCase()),
  );
});

const loadProducts = async (force = false) => {
  if (dataStore.products.length === 0) {
    loading.value = true;
  }
  try {
    await Promise.all([
      dataStore.fetchProducts(force),
      dataStore.fetchCategories(force),
    ]);
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const loadCategories = async (force = true) => {
  try {
    await dataStore.fetchCategories(force);
  } catch (err) {
    console.error(err);
  }
};

const filteredProducts = computed(() => {
  return products.value.filter((p) => {
    const matchesSearch =
      !searchQuery.value ||
      p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.barcode?.includes(searchQuery.value);

    const matchesCategory =
      !selectedCategoryId.value || p.categoryId === selectedCategoryId.value;

    return matchesSearch && matchesCategory;
  });
});

const openCreateModal = () => {
  editingId.value = null;
  form.value = {
    name: '',
    sku: '',
    barcode: '',
    categoryId: categories.value[0]?.id || '',
    imageUrl: '',
    productType: 'goods',
    purchasePrice: 0,
    salePrice: 0,
    minStock: 5,
    initialStock: 10,
  };
  isModalOpen.value = true;
};

const editProduct = (prod: any) => {
  editingId.value = prod.id;
  const isDish = prod.brand === 'dish' || prod.unit?.shortName === 'por';
  const isService = prod.brand === 'service';
  
  form.value = {
    name: prod.name,
    sku: prod.sku,
    barcode: prod.barcode || '',
    categoryId: prod.categoryId || '',
    imageUrl: prod.imageUrl || '',
    productType: isDish ? 'dish' : isService ? 'service' : 'goods',
    purchasePrice: Number(prod.purchasePrice) || 0,
    salePrice: Number(prod.salePrice) || 0,
    minStock: Number(prod.minStock) || 0,
    initialStock: 0,
  };
  isModalOpen.value = true;
};

const saveProduct = async () => {
  if (!form.value.name.trim()) {
    toast.warning('Mahsulot nomini kiriting', 'Mahsulot');
    return;
  }
  if (!form.value.salePrice || Number(form.value.salePrice) <= 0) {
    toast.warning('Sotuv narxini to\'g\'ri kiriting', 'Mahsulot');
    return;
  }

  try {
    const payload = {
      name: form.value.name.trim(),
      sku: form.value.sku || undefined,
      barcode: form.value.barcode || undefined,
      categoryId: form.value.categoryId || undefined,
      imageUrl: form.value.imageUrl || undefined,
      brand: form.value.productType,
      productType: form.value.productType,
      purchasePrice: Number(form.value.purchasePrice) || 0,
      salePrice: Number(form.value.salePrice) || 0,
      minStockLevel: form.value.productType === 'goods' ? Number(form.value.minStock) || 0 : 0,
      initialStock: form.value.productType === 'goods' ? Number(form.value.initialStock) || 0 : 0,
    };

    if (editingId.value) {
      await api.put(`/products/${editingId.value}`, payload);
      toast.success(`"${form.value.name}" muvaffaqiyatli yangilandi`, 'Mahsulot');
    } else {
      await api.post('/products', payload);
      toast.success(`"${form.value.name}" muvaffaqiyatli qo'shildi`, 'Mahsulot');
    }
    isModalOpen.value = false;
    await loadProducts(true);
  } catch (err: any) {
    toast.error(getErrorMessage(err, 'Mahsulotni saqlashda xatolik yuz berdi'), 'Xatolik');
  }
};

const deleteProduct = async (id: string) => {
  if (confirm("Mahsulotni o'chirishni tasdiqlaysizmi?")) {
    try {
      await api.delete(`/products/${id}`);
      toast.success("Mahsulot o'chirildi", 'Mahsulot');
      await loadProducts(true);
    } catch (err: any) {
      toast.error(getErrorMessage(err, "O'chirishda xatolik yuz berdi"), 'Xatolik');
    }
  }
};

const toggleAvailability = async (prod: any) => {
  try {
    const nextStatus = prod.status === 'active' ? 'inactive' : 'active';
    await api.patch(`/products/${prod.id}/toggle-availability`, { status: nextStatus });
    prod.status = nextStatus;
    toast.success(
      `"${prod.name}" ${nextStatus === 'active' ? 'sotuvga chiqarildi (Mavjud)' : 'stop-listga olindi (Tugagan)'}!`,
      'Status'
    );
    dataStore.invalidate('products');
  } catch (err: any) {
    toast.error(getErrorMessage(err, 'Statusni o\'zgartirishda xatolik'), 'Xatolik');
  }
};

// Category Management Functions
const openCategoryModal = () => {
  resetCategoryForm();
  isCategoryModalOpen.value = true;
};

const resetCategoryForm = () => {
  editingCatId.value = null;
  catForm.value = {
    name: '',
    color: '#10b981',
    icon: '📦',
  };
};

const applyPreset = async (preset: { name: string; icon: string; color: string }) => {
  catForm.value = {
    name: preset.name,
    icon: preset.icon,
    color: preset.color,
  };
  await saveCategory();
};

const editCategory = (cat: any) => {
  editingCatId.value = cat.id;
  catForm.value = {
    name: cat.name,
    color: cat.color || '#10b981',
    icon: cat.icon || '📦',
  };
};

const saveCategory = async () => {
  if (!catForm.value.name.trim()) {
    toast.warning('Kategoriya nomini kiriting', 'Kategoriya');
    return;
  }

  savingCategory.value = true;
  try {
    const payload = {
      name: catForm.value.name.trim(),
      color: catForm.value.color || '#10b981',
      icon: catForm.value.icon || '📦',
    };

    let savedId: string | null = null;
    if (editingCatId.value) {
      const { data } = await api.patch(`/categories/${editingCatId.value}`, payload);
      savedId = data?.id || editingCatId.value;
      toast.success(`"${payload.name}" kategoriyasi muvaffaqiyatli yangilandi!`, 'Kategoriya');
    } else {
      const { data } = await api.post('/categories', payload);
      savedId = data?.id;
      toast.success(`"${payload.name}" kategoriyasi muvaffaqiyatli yaratildi!`, 'Kategoriya');
    }
    
    resetCategoryForm();
    await loadCategories(true);
    await loadProducts(true);

    // If product modal is open, auto select this category
    if (isModalOpen.value && savedId) {
      form.value.categoryId = savedId;
    }
  } catch (err: any) {
    toast.error(getErrorMessage(err, 'Kategoriyani saqlashda xatolik'), 'Xatolik');
  } finally {
    savingCategory.value = false;
  }
};

const deleteCategory = async (cat: any) => {
  if (confirm(`"${cat.name}" kategoriyasini o'chirishni tasdiqlaysizmi? (Unga tegishli tovarlar saqlanadi)`)) {
    try {
      await api.delete(`/categories/${cat.id}`);
      toast.success(`"${cat.name}" kategoriyasi o'chirildi`, 'Kategoriya');
      await loadCategories(true);
      await loadProducts(true);
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Kategoriyani o\'chirishda xatolik'), 'Xatolik');
    }
  }
};

onMounted(() => {
  loadProducts();
  loadCategories();
});
</script>
