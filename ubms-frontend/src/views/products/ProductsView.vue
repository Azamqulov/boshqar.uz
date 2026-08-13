<template>
  <div class="space-y-5">
    <!-- Header with Action Buttons -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Mahsulotlar va Taomnoma</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Barcha tovarlar, tayyorlanadigan taomlar, kategoriyalar va qoldiqlar boshqaruvi</p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <router-link
          to="/categories"
          class="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 transition btn-interactive"
        >
          <FolderTree class="w-4 h-4 text-emerald-500" />
          <span>Kategoriyalar ({{ categories.length }})</span>
        </router-link>

        <button
          @click="openCreateModal"
          class="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition btn-interactive"
        >
          <Plus class="w-4 h-4" />
          <span>Yangi Mahsulot Qo'shish</span>
        </button>
      </div>
    </div>

    <!-- Top Stat Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <AppStatCard
        title="Jami Mahsulotlar"
        :value="`${products.length} ta`"
        subtitle="Katalogdagi mahsulotlar"
        :icon="Package"
        variant="blue"
      />

      <AppStatCard
        title="Faol Sotuvda"
        :value="`${products.filter((p: any) => p.isActive !== false).length} ta`"
        subtitle="Mavjud va sotilayotgan"
        :icon="CheckCircle2"
        variant="emerald"
      />

      <AppStatCard
        title="Kam Qolgan Pozitsiyalar"
        :value="`${products.filter((p: any) => p.minStock && p.stock <= p.minStock).length} ta`"
        subtitle="Minimal chegara pastida"
        :icon="AlertTriangle"
        variant="amber"
      />

      <AppStatCard
        title="Kategoriyalar Soni"
        :value="`${categories.length} ta`"
        subtitle="Mahsulot toifalari"
        :icon="FolderTree"
        variant="purple"
      />
    </div>

    <!-- Search, Category Filter and View Toggle -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      <div class="flex-1">
        <AppInput
          v-model="searchQuery"
          placeholder="Mahsulot nomi, SKU yoki shtrix-kod bo'yicha qidiruv..."
          :icon="Search"
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
      <AppViewToggle v-model="viewMode" />
    </div>

    <!-- Products Container -->
    <SkeletonLoader v-if="loading" variant="table" :rows="8" />

    <!-- 1. Table View -->
    <div v-else-if="viewMode === 'table'" class="glass-card rounded-2xl overflow-hidden shadow-sm w-full">
      <div class="w-full">
        <table class="w-full text-left text-xs border-collapse">
          <thead class="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-semibold">
            <tr>
              <th class="py-3 px-2.5 sm:px-3">Rasm & Nomi</th>
              <th class="py-3 px-2">Turi</th>
              <th class="py-3 px-2">SKU / Shtrix-kod</th>
              <th class="py-3 px-2">Kategoriya</th>
              <th class="py-3 px-2">Tannarx</th>
              <th class="py-3 px-2">Sotuv Narxi</th>
              <th class="py-3 px-2">Qoldiq</th>
              <th class="py-3 px-2 text-center">Status</th>
              <th class="py-3 px-2.5 sm:px-3 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200 text-[11px] sm:text-xs">
            <tr v-if="filteredProducts.length === 0">
              <td colspan="9" class="py-8 text-center text-slate-400 dark:text-slate-500">Mahsulotlar topilmadi</td>
            </tr>
            <tr v-for="prod in filteredProducts" :key="prod.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
              <!-- Rasm & Nomi -->
              <td class="py-2.5 px-2.5 sm:px-3 font-bold text-slate-900 dark:text-white">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                    <img
                      v-if="prod.imageUrl"
                      :src="prod.imageUrl"
                      :alt="prod.name"
                      class="w-full h-full object-cover"
                      @error="prod.imageUrl = null"
                    />
                    <Package v-else class="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  </div>
                  <div class="min-w-0">
                    <span class="block text-slate-900 dark:text-slate-100 font-semibold truncate max-w-[110px] sm:max-w-[150px] lg:max-w-[200px]">{{ prod.name }}</span>
                    <span v-if="prod.description" class="text-[10px] text-slate-500 dark:text-slate-400 font-normal truncate max-w-[110px] sm:max-w-[150px] lg:max-w-[200px] block">{{ prod.description }}</span>
                  </div>
                </div>
              </td>
              <!-- Turi -->
              <td class="py-2.5 px-2">
                <span
                  v-if="prod.brand === 'dish' || prod.unit?.shortName === 'por'"
                  class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-semibold whitespace-nowrap"
                >
                  <span>Taom</span>
                </span>
                <span
                  v-else-if="prod.brand === 'service'"
                  class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[10px] font-semibold whitespace-nowrap"
                >
                  <span>Xizmat</span>
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold whitespace-nowrap"
                >
                  <span>Tovar</span>
                </span>
              </td>
              <!-- SKU / Barcode -->
              <td class="py-2.5 px-2 text-slate-500 dark:text-slate-400 font-mono text-[10px]">
                <span class="block font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[90px]">{{ prod.sku || '-' }}</span>
                <span v-if="prod.barcode" class="block text-[9px] text-slate-400 dark:text-slate-500 truncate max-w-[90px]">{{ prod.barcode }}</span>
              </td>
              <!-- Kategoriya -->
              <td class="py-2.5 px-2 text-slate-700 dark:text-slate-300">
                <span
                  v-if="prod.category"
                  class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium max-w-[90px] sm:max-w-[120px] truncate"
                  :style="{ backgroundColor: (prod.category.color || '#10b981') + '15', color: prod.category.color || '#10b981' }"
                >
                  <span class="text-[10px] shrink-0" v-if="prod.category.icon">{{ prod.category.icon }}</span>
                  <span v-else class="w-1.5 h-1.5 rounded-full shrink-0" :style="{ backgroundColor: prod.category.color || '#10b981' }"></span>
                  <span class="truncate">{{ prod.category.name }}</span>
                </span>
                <span v-else class="text-slate-400 text-[10px]">-</span>
              </td>
              <!-- Tannarx -->
              <td class="py-2.5 px-2 text-slate-600 dark:text-slate-400 font-mono font-medium text-[11px] whitespace-nowrap">
                {{ formatCurrency(prod.purchasePrice) }}
              </td>
              <!-- Sotuv Narxi -->
              <td class="py-2.5 px-2 font-bold text-emerald-600 dark:text-emerald-400 font-mono text-[11px] sm:text-xs whitespace-nowrap">
                {{ formatCurrency(prod.salePrice) }}
              </td>
              <!-- Qoldiq -->
              <td class="py-2.5 px-2 font-mono">
                <span
                  v-if="prod.brand === 'dish' || prod.brand === 'service' || prod.unit?.shortName === 'por'"
                  class="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 whitespace-nowrap"
                >
                  ∞
                </span>
                <span
                  v-else
                  class="inline-block font-bold px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap"
                  :class="prod.stockQty <= 0 ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30' : prod.stockQty <= prod.minStock ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'"
                >
                  {{ prod.stockQty <= 0 ? 'Tugagan (0)' : `${prod.stockQty} ${prod.unit?.shortName || 'dona'}` }}
                </span>
              </td>
              <!-- Status / Stop-list Switch Button -->
              <td class="py-2.5 px-2 text-center">
                <button
                  type="button"
                  @click="toggleAvailability(prod)"
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition cursor-pointer whitespace-nowrap"
                  :class="prod.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/20'"
                  :title="prod.status === 'active' ? 'Sotuvda bor (Stop-listga olish uchun bosing)' : 'Stop-listda (Sotuvga chiqarish uchun bosing)'"
                >
                  <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="prod.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'"></span>
                  <span>{{ prod.status === 'active' ? 'Mavjud' : 'Stop' }}</span>
                </button>
              </td>
              <!-- Amallar -->
              <td class="py-2.5 px-2.5 sm:px-3 text-right space-x-1 whitespace-nowrap">
                <button
                  @click="editProduct(prod)"
                  class="p-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
                  title="Tahrirlash"
                >
                  <Edit2 class="w-3.5 h-3.5" />
                </button>
                <button
                  @click="deleteProduct(prod.id)"
                  class="p-1 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition"
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

    <!-- 2. Grid/Cards View -->
    <div v-else-if="viewMode === 'grid'">
      <div v-if="filteredProducts.length === 0" class="glass-card rounded-2xl p-12 text-center text-slate-400 dark:text-slate-500">
        <Package class="w-10 h-10 mx-auto mb-2 opacity-30" />
        <span>Mahsulotlar topilmadi</span>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div
          v-for="prod in filteredProducts"
          :key="prod.id"
          class="glass-card rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition group border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90"
        >
          <div>
            <div class="relative w-full h-36 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden mb-3 flex items-center justify-center">
              <img
                v-if="prod.imageUrl"
                :src="prod.imageUrl"
                :alt="prod.name"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                @error="prod.imageUrl = null"
              />
              <Package v-else class="w-10 h-10 text-slate-400 dark:text-slate-600 opacity-40" />

              <span
                class="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase backdrop-blur-md shadow-sm"
                :class="prod.status === 'active' ? 'bg-emerald-500/90 text-white' : 'bg-rose-500/90 text-white'"
              >
                {{ prod.status === 'active' ? 'Mavjud' : 'Stop-list' }}
              </span>
            </div>

            <div class="space-y-1">
              <span v-if="prod.category" class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {{ prod.category?.name }}
              </span>
              <h4 class="font-black text-sm text-slate-900 dark:text-white line-clamp-1">
                {{ prod.name }}
              </h4>
              <p v-if="prod.sku" class="text-[11px] font-mono text-slate-500">
                SKU: {{ prod.sku }}
              </p>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span class="text-[10px] text-slate-400 block font-semibold">Sotuv Narxi</span>
              <span class="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
                {{ formatCurrency(prod.salePrice) }}
              </span>
            </div>

            <div class="flex items-center gap-1">
              <button
                @click="editProduct(prod)"
                class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
                title="Tahrirlash"
              >
                <Edit2 class="w-3.5 h-3.5" />
              </button>
              <button
                @click="deleteProduct(prod.id)"
                class="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition"
                title="O'chirish"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Product Create/Edit Modal -->
    <Teleport to="body">
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
    <!-- Category Management Modal (Redesigned) -->
    <Teleport to="body">
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
                  class="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-600 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1 transition btn-interactive"
                >
                  <span>{{ preset.icon }}</span>
                  <span>{{ preset.name }}</span>
                </button>
              </div>
            </div>

            <!-- Category Form -->
            <form @submit.prevent="saveCategory" class="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <div class="flex items-center justify-between">
                <span class="font-bold text-xs text-slate-800 dark:text-slate-200">
                  {{ editingCatId ? 'Kategoriyani Tahrirlash' : 'Yangi Kategoriya Yaratish' }}
                </span>
                <button
                  v-if="editingCatId"
                  type="button"
                  @click="resetCategoryForm"
                  class="text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline"
                >
                  Bekor qilish
                </button>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <AppInput
                  v-model="catForm.name"
                  label="Kategoriya Nomi *"
                  placeholder="Masalan: Ichimliklar, Shirinliklar..."
                  :required="true"
                />

                <!-- Icon Selector -->
                <div>
                  <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Ikonka (Emoji)</label>
                  <div class="flex items-center gap-2">
                    <input
                      v-model="catForm.icon"
                      class="w-12 h-9 text-center text-lg bg-white dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-emerald-500"
                    />
                    <div class="flex items-center gap-1 overflow-x-auto py-1">
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

              <div class="mt-2">
                <AppButton type="submit" variant="primary" size="md" class="w-full" :loading="savingCategory">
                  {{ savingCategory ? 'Saqlanmoqda...' : (editingCatId ? 'Kategoriyani Yangilash' : 'Kategoriyani Saqlash') }}
                </AppButton>
              </div>
            </form>

            <!-- Existing Categories List -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Mavjud Kategoriyalar ({{ categories.length }} ta)
                </span>
                <div v-if="categories.length > 4" class="w-52">
                  <AppInput
                    v-model="categorySearch"
                    placeholder="Kategoriyalardan qidirish..."
                    :icon="Search"
                  />
                </div>
              </div>

              <div v-if="filteredModalCategories.length === 0" class="p-6 text-center rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 text-xs">
                Kategoriyalar topilmadi
              </div>

              <div v-else class="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                <div
                  v-for="cat in filteredModalCategories"
                  :key="cat.id"
                  class="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500/50 transition group text-xs"
                >
                  <div class="flex items-center gap-2.5 min-w-0">
                    <span
                      class="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 shadow-sm"
                      :style="{ backgroundColor: cat.color ? cat.color + '20' : '#10b98120', color: cat.color || '#10b981' }"
                    >
                      {{ getCategoryIcon(cat.icon) }}
                    </span>
                    <div class="min-w-0">
                      <span class="font-bold text-slate-900 dark:text-white block truncate">{{ cat.name }}</span>
                      <span class="text-[10px] text-slate-400 font-mono">{{ cat.productsCount || 0 }} ta mahsulot</span>
                    </div>
                  </div>

                  <div class="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                    <button
                      type="button"
                      @click="editCategory(cat)"
                      class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                      title="Tahrirlash"
                    >
                      <Edit2 class="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      @click="deleteCategory(cat)"
                      class="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
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
    </Teleport>

    <!-- Confirm Dialog Component -->
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
import api, { getErrorMessage } from '../../services/api';
import { useFormat } from '../../composables/useFormat';
import { Plus, Edit2, Trash2, X, Search, Package, Image as ImageIcon, FolderTree, CheckCircle2, AlertTriangle, Upload } from 'lucide-vue-next';

import SkeletonLoader from '../../components/SkeletonLoader.vue';
import AppSelect, { SelectOption } from '../../components/AppSelect.vue';
import AppInput from '../../components/AppInput.vue';
import AppButton from '../../components/AppButton.vue';
import AppStatCard from '../../components/AppStatCard.vue';
import AppViewToggle from '../../components/AppViewToggle.vue';
import CurrencyInput from '../../components/CurrencyInput.vue';
import AppConfirmDialog from '../../components/AppConfirmDialog.vue';
import { useToast } from '../../composables/useToast';
import { useDataStore } from '../../stores/data.store';
import { getCategoryIcon } from '../../composables/useCategoryIcon';

const toast = useToast();
const dataStore = useDataStore();
const { formatCurrency } = useFormat();

const viewMode = ref<'table' | 'grid'>('table');
const loading = ref(false);
const products = computed(() => dataStore.products);
const categories = computed(() => dataStore.categories);

const isModalOpen = ref(false);
const isCategoryModalOpen = ref(false);
const editingId = ref<string | null>(null);
const editingCatId = ref<string | null>(null);
const savingCategory = ref(false);

const imageInputMode = ref<'upload' | 'url'>('upload');
const fileInputRef = ref<HTMLInputElement | null>(null);

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const removeImage = () => {
  form.value.imageUrl = '';
  if (fileInputRef.value) fileInputRef.value.value = '';
};

const handleImageFileUpload = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    toast.warning("Iltimos, rasm faylini tanlang (JPG, PNG, WebP)!", "Fayl formati");
    return;
  }

  // Optimize and compress image using HTML5 Canvas
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxDim = 600;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        }
      } else {
        if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        form.value.imageUrl = compressedDataUrl;
        toast.success("Rasm muvaffaqiyatli yuklandi!", "Rasm");
      }
    };
    img.src = event.target?.result as string;
  };
  reader.readAsDataURL(file);
};

const fastImagePresets = [
  { name: 'Pitsa 🍕', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300' },
  { name: 'Burger 🍔', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300' },
  { name: 'Lavash 🌯', url: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=300' },
  { name: 'Shashlik 🍢', url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300' },
  { name: 'Somsa 🥟', url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300' },
  { name: 'Ichimlik 🥤', url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300' },
  { name: 'Qahva ☕', url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=300' },
  { name: 'Non 🍞', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300' },
];

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
      label: `${getCategoryIcon(cat.icon)} ${cat.name}`,
      color: cat.color || '#10b981',
      badge: cat.productsCount !== undefined ? `${cat.productsCount} ta` : undefined,
    });
  });
  return opts;
});

const categoryOptions = computed<SelectOption[]>(() => {
  return categories.value.map((cat) => ({
    value: cat.id,
    label: `${getCategoryIcon(cat.icon)} ${cat.name}`,
    color: cat.color || '#10b981',
  }));
});

const categoryFormOptions = categoryOptions;

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

const loadCategories = async (force = false) => {
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
  imageInputMode.value = 'upload';
  if (fileInputRef.value) fileInputRef.value.value = '';
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
  imageInputMode.value = prod.imageUrl?.startsWith('http') ? 'url' : 'upload';
  if (fileInputRef.value) fileInputRef.value.value = '';
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
    initialStock: prod.stockQty !== undefined ? Number(prod.stockQty) : 0,
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
      const { data: updated } = await api.put(`/products/${editingId.value}`, payload);
      // Optimistic: update store immediately so table refreshes right away
      const idx = dataStore.products.findIndex((p: any) => p.id === editingId.value);
      if (idx !== -1 && updated) {
        dataStore.products[idx] = { ...dataStore.products[idx], ...updated };
      }
      toast.success(`"${form.value.name}" muvaffaqiyatli yangilandi`, 'Mahsulot');
    } else {
      const { data: created } = await api.post('/products', payload);
      // Optimistic: push new product to top of list immediately
      if (created) {
        dataStore.products.unshift(created);
      }
      toast.success(`"${form.value.name}" muvaffaqiyatli qo'shildi`, 'Mahsulot');
    }

    isModalOpen.value = false;
    // Invalidate then background-refresh for server-side accuracy
    dataStore.invalidate('products');
    dataStore.invalidate('dashboard');
    dataStore.invalidate('inventory');
    await dataStore.fetchProducts(true);
  } catch (err: any) {
    toast.error(getErrorMessage(err, 'Mahsulotni saqlashda xatolik yuz berdi'), 'Xatolik');
  }
};

const deleteProduct = (prodIdOrProd: any) => {
  const id = typeof prodIdOrProd === 'string' ? prodIdOrProd : prodIdOrProd.id;
  const prod = products.value.find((p: any) => p.id === id);
  const name = prod ? prod.name : 'Mahsulot';

  confirmModal.value = {
    open: true,
    title: "Mahsulotni o'chirish",
    message: `"${name}" mahsulotini o'chirishni tasdiqlaysizmi?`,
    onConfirm: async () => {
      try {
        await api.delete(`/products/${id}`);
        // Optimistic: remove from store immediately
        const idx = dataStore.products.findIndex((p: any) => p.id === id);
        if (idx !== -1) dataStore.products.splice(idx, 1);
        toast.success("Mahsulot o'chirildi", 'Mahsulot');
        dataStore.invalidate('products');
        dataStore.invalidate('dashboard');
        dataStore.invalidate('inventory');
        loadProducts(true); // background refresh
      } catch (err: any) {
        toast.error(getErrorMessage(err, "O'chirishda xatolik yuz berdi"), 'Xatolik');
      } finally {
        confirmModal.value.open = false;
      }
    },
  };
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

const deleteCategory = (cat: any) => {
  confirmModal.value = {
    open: true,
    title: "Kategoriyani o'chirish",
    message: `"${cat.name}" kategoriyasini o'chirishni tasdiqlaysizmi? (Unga tegishli tovarlar saqlanadi)`,
    onConfirm: async () => {
      try {
        await api.delete(`/categories/${cat.id}`);
        toast.success(`"${cat.name}" kategoriyasi o'chirildi`, 'Kategoriya');
        dataStore.invalidate('categories');
        await loadCategories(true);
        await loadProducts(true);
      } catch (err: any) {
        toast.error(getErrorMessage(err, 'Kategoriyani o\'chirishda xatolik'), 'Xatolik');
      } finally {
        confirmModal.value.open = false;
      }
    },
  };
};

onMounted(() => {
  loadProducts();
  loadCategories();
});
</script>
