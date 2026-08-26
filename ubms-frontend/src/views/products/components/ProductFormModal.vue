<template>
  <Teleport to="body">
    <div v-if="isOpen" @click.self="$emit('close')" class="modal-overlay">
      <div class="modal-container max-w-lg" @click.stop>
        <!-- Modal Header -->
        <div class="modal-header pb-3 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Package v-if="form.productType === 'goods'" class="w-5 h-5" />
              <UtensilsCrossed v-else-if="form.productType === 'dish'" class="w-5 h-5" />
              <Wrench v-else class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                {{ editingId ? 'Mahsulotni Tahrirlash' : 'Yangi Mahsulot Qo\'shish' }}
              </h3>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">
                Qadam {{ currentStep }} / 3: {{ stepTitle }}
              </p>
            </div>
          </div>
          <button @click="$emit('close')" class="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Stepper Tab Navigation -->
        <div class="p-3 pb-0">
          <div class="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
            <button
              type="button"
              @click="currentStep = 1"
              class="py-1.5 px-2 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1.5"
              :class="currentStep === 1 ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'"
            >
              <span class="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black" :class="currentStep === 1 ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700'">1</span>
              <span>Asosiy</span>
            </button>

            <button
              type="button"
              @click="validateStep1() && (currentStep = 2)"
              class="py-1.5 px-2 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1.5"
              :class="currentStep === 2 ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'"
            >
              <span class="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black" :class="currentStep === 2 ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700'">2</span>
              <span>Narx & Qoldiq</span>
            </button>

            <button
              type="button"
              @click="validateStep1() && validateStep2() && (currentStep = 3)"
              class="py-1.5 px-2 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1.5"
              :class="currentStep === 3 ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'"
            >
              <span class="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black" :class="currentStep === 3 ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700'">3</span>
              <span>Rasm & Tasdiq</span>
            </button>
          </div>
        </div>

        <!-- Modal Body with Smooth Animated Steps -->
        <div class="modal-body p-4 sm:p-5 max-h-[75vh] overflow-y-auto overflow-x-hidden">
          <form @submit.prevent="handleFinalSubmit" class="space-y-4 text-xs">
            
            <Transition name="step-slide" mode="out-in">
              <!-- ================= STEP 1: ASOSIY MA'LUMOTLAR ================= -->
              <div v-if="currentStep === 1" key="step-1" class="space-y-3.5">
                <!-- Mahsulot Turi -->
                <div>
                  <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 text-[11px]">Mahsulot Turi</label>
                  <div class="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      @click="form.productType = 'goods'"
                      class="py-2.5 px-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 btn-interactive"
                      :class="form.productType === 'goods' ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'"
                    >
                      <Package class="w-4 h-4" />
                      <span>Tovar</span>
                    </button>
                    <button
                      type="button"
                      @click="form.productType = 'dish'"
                      class="py-2.5 px-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 btn-interactive"
                      :class="form.productType === 'dish' ? 'bg-amber-500 text-white border-amber-500 shadow-sm' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'"
                    >
                      <UtensilsCrossed class="w-4 h-4" />
                      <span>Taom</span>
                    </button>
                    <button
                      type="button"
                      @click="form.productType = 'service'"
                      class="py-2.5 px-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 btn-interactive"
                      :class="form.productType === 'service' ? 'bg-sky-500 text-white border-sky-500 shadow-sm' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'"
                    >
                      <Wrench class="w-4 h-4" />
                      <span>Xizmat</span>
                    </button>
                  </div>
                </div>

                <!-- Mahsulot Nomi -->
                <div>
                  <AppInput
                    v-model="form.name"
                    label="Mahsulot Nomi *"
                    placeholder="Masalan: Banan Ekvador, Coca-Cola 1.5L, Go'sht"
                    :required="true"
                  />
                </div>

                <!-- O'lchov Birligi & Kategoriya -->
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <div class="flex items-center justify-between mb-1">
                      <label class="font-bold text-slate-700 dark:text-slate-300 text-[11px]">O'lchov Birligi *</label>
                      <span class="text-[10px] font-black px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 uppercase">{{ selectedUnitShortName }}</span>
                    </div>
                    <AppSelect
                      v-model="form.unitId"
                      :options="unitSelectOptions"
                      placeholder="Birlikni tanlang..."
                    />
                  </div>

                  <div>
                    <div class="flex items-center justify-between mb-1">
                      <label class="font-bold text-slate-700 dark:text-slate-300 text-[11px]">Kategoriya</label>
                      <router-link to="/categories" class="text-[10px] font-bold text-emerald-600 hover:underline">+ Yangi</router-link>
                    </div>
                    <AppSelect
                      v-model="form.categoryId"
                      :options="categoryOptions"
                      :searchable="true"
                      placeholder="Kategoriya..."
                    />
                  </div>
                </div>

                <!-- Ombor Qoldig'i Kuzatuvi (trackInventory) -->
                <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-1.5">
                  <div class="flex items-center justify-between">
                    <label class="font-bold text-slate-700 dark:text-slate-300 text-[11px] flex items-center gap-1.5">
                      <Boxes class="w-3.5 h-3.5 text-emerald-500" />
                      <span>Ombor Qoldig'i Kuzatuvi</span>
                    </label>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-md" :class="effectiveTrackInventory ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'">
                      {{ effectiveTrackInventory ? 'Qoldiq hisoblanadi' : 'Buyurtma asosida' }}
                    </span>
                  </div>
                  <div class="grid grid-cols-3 gap-1.5 pt-1">
                    <button
                      type="button"
                      @click="form.trackInventory = null"
                      class="py-1.5 px-2 rounded-xl border text-[10px] font-bold transition flex items-center justify-center gap-1 text-center btn-interactive"
                      :class="form.trackInventory === null || form.trackInventory === undefined ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'"
                    >
                      <span>Avtomatik</span>
                    </button>
                    <button
                      type="button"
                      @click="form.trackInventory = true"
                      class="py-1.5 px-2 rounded-xl border text-[10px] font-bold transition flex items-center justify-center gap-1 text-center btn-interactive"
                      :class="form.trackInventory === true ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'"
                    >
                      <span>Ha (Ombor)</span>
                    </button>
                    <button
                      type="button"
                      @click="form.trackInventory = false"
                      class="py-1.5 px-2 rounded-xl border text-[10px] font-bold transition flex items-center justify-center gap-1 text-center btn-interactive"
                      :class="form.trackInventory === false ? 'bg-amber-500 text-white border-amber-500 shadow-xs' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'"
                    >
                      <span>Yo'q (Taom)</span>
                    </button>
                  </div>
                  <p class="text-[10px] text-slate-400 dark:text-slate-500 pt-0.5">
                    <span v-if="effectiveTrackInventory">Tovar uchun sotilganda ombor qoldig'i kamaytirib boriladi.</span>
                    <span v-else class="text-amber-600 dark:text-amber-400 font-medium">Buyurtma asosida tayyorlanadi — qoldiq cheksiz deb hisoblanadi.</span>
                  </p>
                </div>

                <!-- Shtrix-kod -->
                <div>
                  <AppInput
                    v-model="form.barcode"
                    label="Shtrix-kod / Barcode (Ixtiyoriy)"
                    placeholder="EAN-13 yoki skaner orqali"
                  />
                </div>
              </div>

              <!-- ================= STEP 2: NARXLAR VA OMBOR ================= -->
              <div v-else-if="currentStep === 2" key="step-2" class="space-y-4">
                <!-- Narxlar -->
                <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
                  <span class="text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <CircleDollarSign class="w-4 h-4 text-emerald-500" />
                    <span>Moliya va Narxlar (1 {{ selectedUnitShortName }} uchun)</span>
                  </span>

                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                        Tannarx (Xarid narxi)
                      </label>
                      <CurrencyInput
                        v-model="form.purchasePrice"
                        placeholder="0"
                        :suffix="currencyStore.getSymbol()"
                      />
                      <!-- Live CBU conversion for purchasePrice -->
                      <p v-if="Number(form.purchasePrice) > 0" class="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                        <Coins class="w-3 h-3 text-emerald-500 shrink-0" />
                        <span v-if="currencyStore.activeCurrency === 'UZS'">≈ ${{ (Number(form.purchasePrice) / currencyStore.usdRate).toFixed(2) }} | ≈ {{ (Number(form.purchasePrice) / currencyStore.rubRate).toFixed(1) }} ₽</span>
                        <span v-else-if="currencyStore.activeCurrency === 'USD'">≈ {{ Math.round(Number(form.purchasePrice) * currencyStore.usdRate).toLocaleString('uz-UZ') }} so'm</span>
                        <span v-else-if="currencyStore.activeCurrency === 'RUB'">≈ {{ Math.round(Number(form.purchasePrice) * currencyStore.rubRate).toLocaleString('uz-UZ') }} so'm</span>
                        <span v-else-if="currencyStore.activeCurrency === 'EUR'">≈ {{ Math.round(Number(form.purchasePrice) * currencyStore.eurRate).toLocaleString('uz-UZ') }} so'm</span>
                      </p>
                    </div>

                    <div>
                      <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                        Sotuv Narxi *
                      </label>
                      <CurrencyInput
                        v-model="form.salePrice"
                        placeholder="0"
                        :suffix="currencyStore.getSymbol()"
                        :required="true"
                        inputClass="font-bold text-emerald-600 dark:text-emerald-400"
                      />
                      <!-- Live CBU conversion for salePrice -->
                      <p v-if="Number(form.salePrice) > 0" class="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                        <Coins class="w-3 h-3 text-emerald-500 shrink-0" />
                        <span v-if="currencyStore.activeCurrency === 'UZS'">≈ ${{ (Number(form.salePrice) / currencyStore.usdRate).toFixed(2) }} | ≈ {{ (Number(form.salePrice) / currencyStore.rubRate).toFixed(1) }} ₽</span>
                        <span v-else-if="currencyStore.activeCurrency === 'USD'">≈ {{ Math.round(Number(form.salePrice) * currencyStore.usdRate).toLocaleString('uz-UZ') }} so'm | ≈ {{ (Number(form.salePrice) * (currencyStore.usdRate / currencyStore.rubRate)).toFixed(1) }} ₽</span>
                        <span v-else-if="currencyStore.activeCurrency === 'RUB'">≈ {{ Math.round(Number(form.salePrice) * currencyStore.rubRate).toLocaleString('uz-UZ') }} so'm | ≈ ${{ (Number(form.salePrice) * (currencyStore.rubRate / currencyStore.usdRate)).toFixed(2) }}</span>
                        <span v-else-if="currencyStore.activeCurrency === 'EUR'">≈ {{ Math.round(Number(form.salePrice) * currencyStore.eurRate).toLocaleString('uz-UZ') }} so'm | ≈ ${{ (Number(form.salePrice) * (currencyStore.eurRate / currencyStore.usdRate)).toFixed(2) }}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Ombor Qoldiqlari (faqat qoldiq hisoblanadigan mahsulotlar uchun) -->
                <div v-if="effectiveTrackInventory" class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
                  <span class="text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Boxes class="w-4 h-4 text-emerald-500" />
                    <span>Ombor Qoldiqlari</span>
                  </span>

                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                        {{ editingId ? 'Joriy Qoldiq' : 'Boshlang\'ich Qoldiq' }}
                      </label>
                      <div class="relative">
                        <input
                          v-model.number="form.initialStock"
                          type="number"
                          :step="isDecimalUnit ? '0.001' : '1'"
                          :min="'0'"
                          placeholder="0"
                          class="w-full pl-3 pr-14 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 font-bold shadow-inner"
                        />
                        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400 dark:text-slate-500 font-black uppercase text-[10px] tracking-wider">
                          {{ selectedUnitShortName }}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                        Minimal Chegara (Ogohlantirish)
                      </label>
                      <div class="relative">
                        <input
                          v-model.number="form.minStock"
                          type="number"
                          :step="isDecimalUnit ? '0.001' : '1'"
                          :min="'0'"
                          placeholder="5"
                          class="w-full pl-3 pr-14 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 font-bold shadow-inner"
                        />
                        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400 dark:text-slate-500 font-black uppercase text-[10px] tracking-wider">
                          {{ selectedUnitShortName }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-if="isDecimalUnit" class="text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 font-medium">
                    <Scale class="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>O'lchov birligi kasrli bo'lgani uchun qoldiqni 3 xonali aniqlikda (masalan: 1.250 {{ selectedUnitShortName }}) kiritish mumkin.</span>
                  </div>
                </div>

                <div v-else class="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2.5 font-medium">
                  <UtensilsCrossed class="w-5 h-5 text-amber-500 shrink-0" />
                  <div>
                    <span class="font-bold block">Buyurtma asosida tayyorlanadi</span>
                    <span class="text-[11px] text-amber-700/80 dark:text-amber-400/80">Ushbu mahsulot uchun ombor qoldig'i hisoblanmaydi (qoldiq cheksiz). POS kassada sotilganda xatolik bermaydi.</span>
                  </div>
                </div>
              </div>

              <!-- ================= STEP 3: RASM VA TASDIQ ================= -->
              <div v-else key="step-3" class="space-y-4">
                <!-- Rasm Yuklash (Zamonaviy Dropzone) -->
                <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
                  <div class="flex items-center justify-between flex-wrap gap-2">
                    <span class="text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon class="w-3.5 h-3.5 text-emerald-500" />
                      <span>Mahsulot Rasmi (Ixtiyoriy)</span>
                    </span>
                    <div class="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-700/70 p-0.5 rounded-lg text-[10px] font-bold">
                      <button
                        type="button"
                        @click="imageInputMode = 'upload'"
                        class="px-2 py-0.5 rounded-md transition flex items-center gap-1"
                        :class="imageInputMode === 'upload' ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-slate-500 hover:text-slate-800'"
                      >
                        <UploadCloud class="w-3 h-3" />
                        <span>Fayl</span>
                      </button>
                      <button
                        type="button"
                        @click="imageInputMode = 'url'"
                        class="px-2 py-0.5 rounded-md transition flex items-center gap-1"
                        :class="imageInputMode === 'url' ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-slate-500 hover:text-slate-800'"
                      >
                        <LinkIcon class="w-3 h-3" />
                        <span>Havola</span>
                      </button>
                      <button
                        type="button"
                        @click="switchToGalleryMode"
                        class="px-2 py-0.5 rounded-md transition flex items-center gap-1"
                        :class="imageInputMode === 'gallery' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'"
                      >
                        <Sparkles class="w-3 h-3" />
                        <span>Namunalar galereyasi</span>
                      </button>
                    </div>
                  </div>

                  <!-- Dropzone / Upload Box -->
                  <div v-if="imageInputMode === 'upload'">
                    <div
                      v-if="!form.imageUrl"
                      @click="triggerFileInput"
                      class="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer bg-white/50 dark:bg-slate-900/50 hover:bg-emerald-50/20 transition group"
                    >
                      <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition">
                        <UploadCloud class="w-5 h-5" />
                      </div>
                      <div class="text-center">
                        <span class="font-bold text-xs text-slate-800 dark:text-slate-200 block">Kompyuterdan rasm yuklash</span>
                        <span class="text-[10px] text-slate-400">PNG, JPG, WebP (bosing yoki faylni bu yerga tashlang)</span>
                      </div>
                    </div>

                    <!-- Uploaded Image Preview with change & delete actions -->
                    <div v-else class="flex items-center gap-3 p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                      <img :src="form.imageUrl" class="w-14 h-14 rounded-lg object-cover shrink-0 border border-slate-200 dark:border-slate-800" />
                      <div class="flex-1 min-w-0">
                        <span class="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 class="w-3.5 h-3.5" />
                          <span>Rasm yuklangan</span>
                        </span>
                        <span class="text-[10px] text-slate-400 block truncate">Mahsulot kartasida ko'rsatiladi</span>
                      </div>
                      <div class="flex items-center gap-1.5">
                        <button
                          type="button"
                          @click="triggerFileInput"
                          class="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition flex items-center gap-1"
                        >
                          <UploadCloud class="w-3 h-3" />
                          <span>Almashtirish</span>
                        </button>
                        <button
                          type="button"
                          @click="removeImage"
                          class="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 transition"
                          title="O'chirish"
                        >
                          <Trash2 class="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- URL Mode -->
                  <div v-else-if="imageInputMode === 'url'" class="space-y-2">
                    <div class="flex items-center gap-1.5">
                      <input
                        v-model="form.imageUrl"
                        placeholder="https://... rasm havolasi"
                        class="flex-1 px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                      />
                      <button
                        v-if="form.imageUrl"
                        type="button"
                        @click="removeImage"
                        class="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      >
                        <X class="w-4 h-4" />
                      </button>
                    </div>
                    <div class="flex flex-wrap gap-1 items-center pt-0.5">
                      <span class="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                        <Sparkles class="w-3 h-3 text-amber-500" />
                        <span>Shablonlar:</span>
                      </span>
                      <button
                        type="button"
                        v-for="preset in fastImagePresets.slice(0, 5)"
                        :key="preset.name"
                        @click="form.imageUrl = preset.url"
                        class="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 hover:border-emerald-500 border border-slate-200 dark:border-slate-700 transition"
                      >
                        {{ preset.name }}
                      </button>
                    </div>
                  </div>

                  <!-- Gallery / Google Image Mode -->
                  <div v-else-if="imageInputMode === 'gallery'" class="space-y-3">
                    <div class="flex items-center gap-1.5">
                      <div class="relative flex-1">
                        <input
                          v-model="gallerySearchQuery"
                          @keyup.enter="fetchSampleImages(gallerySearchQuery)"
                          placeholder="Mahsulot nomi bo'yicha Google'dan qidirish (masalan: Cola, Snickers, Lavash)..."
                          class="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500"
                        />
                        <Search class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      </div>
                      <button
                        type="button"
                        @click="fetchSampleImages(gallerySearchQuery)"
                        class="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition flex items-center gap-1 shrink-0"
                      >
                        <Sparkles v-if="!isSearchingImages" class="w-3.5 h-3.5" />
                        <span v-else class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Izlash</span>
                      </button>
                    </div>



                    <!-- Image Gallery Grid -->
                    <div v-if="isSearchingImages" class="py-6 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                      <div class="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Google va AI bazasidan HD rasmlar qidirilmoqda...</span>
                    </div>

                    <div v-else-if="sampleImages.length > 0" class="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 custom-scrollbar">
                      <div
                        v-for="img in sampleImages"
                        :key="img.id"
                        @click="selectSampleImage(img.url)"
                        class="group relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all aspect-square bg-slate-100 dark:bg-slate-900"
                        :class="form.imageUrl === img.url ? 'border-emerald-500 ring-2 ring-emerald-500/30 shadow-md scale-95' : 'border-slate-200 dark:border-slate-700/80 hover:border-emerald-400 hover:scale-102'"
                      >
                        <img :src="img.url" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span class="text-[9px] font-black text-white px-1.5 py-0.5 rounded bg-emerald-500">Tanlash</span>
                        </div>
                        <div v-if="form.imageUrl === img.url" class="absolute top-1 right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                          <CheckCircle2 class="w-3.5 h-3.5" />
                        </div>
                        <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                          <p class="text-[9px] font-bold text-white truncate text-center">{{ img.title }}</p>
                        </div>
                      </div>
                    </div>

                    <div v-else class="py-4 text-center text-slate-400 text-xs">
                      Ushbu so'rov bo'yicha rasmlar topilmadi. Boshqa mahsulot nomini kiritib ko'ring.
                    </div>
                  </div>

                  <input
                    ref="fileInputRef"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleImageFileUpload"
                  />
                </div>

                <!-- Jonli Xulosa Kartasi (Live Card Preview) -->
                <div class="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                  <span class="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">Mahsulot Xulosasi</span>
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-lg overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                      <img v-if="form.imageUrl" :src="form.imageUrl" class="w-full h-full object-cover" />
                      <div v-else class="text-slate-400">
                        <Package v-if="form.productType === 'goods'" class="w-5 h-5 text-emerald-500" />
                        <UtensilsCrossed v-else-if="form.productType === 'dish'" class="w-5 h-5 text-amber-500" />
                        <Wrench v-else class="w-5 h-5 text-sky-500" />
                      </div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <h4 class="font-black text-slate-900 dark:text-white text-xs truncate">{{ form.name || "Nomsiz mahsulot" }}</h4>
                      <div class="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <span class="font-bold text-emerald-600 dark:text-emerald-400">{{ currencyStore.format(form.salePrice) }}</span>
                        <span>/</span>
                        <span class="uppercase font-bold">{{ selectedUnitShortName }}</span>
                        <span v-if="form.productType === 'goods'">• Qoldiq: {{ form.initialStock || 0 }} {{ selectedUnitShortName }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Transition>

            <!-- Modal Pastki Navigatsiya Tugmalari -->
            <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                v-if="currentStep > 1"
                type="button"
                @click="currentStep--"
                class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition flex items-center gap-1.5 btn-interactive"
              >
                <ArrowLeft class="w-3.5 h-3.5" />
                <span>Orqaga</span>
              </button>
              <button
                v-else
                type="button"
                @click="$emit('close')"
                class="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition"
              >
                Bekor qilish
              </button>

              <div class="flex items-center gap-2">
                <button
                  v-if="currentStep < 3"
                  type="button"
                  @click="goToNextStep"
                  class="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5 btn-interactive"
                >
                  <span>Keyingisi</span>
                  <ArrowRight class="w-3.5 h-3.5" />
                </button>
                <AppButton
                  v-else
                  type="submit"
                  variant="primary"
                  size="md"
                  :loading="loading"
                  class="px-6"
                >
                  {{ editingId ? 'O\'zgarishlarni Saqlash' : 'Mahsulotni Saqlash' }}
                </AppButton>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import api from '@/services/api';
import { ref, computed, watch } from 'vue';
import {
  X,
  Package,
  UtensilsCrossed,
  Wrench,
  CircleDollarSign,
  Boxes,
  Scale,
  Image as ImageIcon,
  UploadCloud,
  Link as LinkIcon,
  Sparkles,
  Search,
  CheckCircle2,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Coins,
} from 'lucide-vue-next';
import AppButton from '../../../components/AppButton.vue';
import AppInput from '../../../components/AppInput.vue';
import AppSelect from '../../../components/AppSelect.vue';
import CurrencyInput from '../../../components/CurrencyInput.vue';
import { useToast } from '../../../composables/useToast';
import { useCurrencyStore } from '../../../stores/currency.store';

const currencyStore = useCurrencyStore();

const props = defineProps<{
  isOpen: boolean;
  editingId: string | null;
  form: any;
  categoryOptions: any[];
  unitOptions?: any[];
  fastImagePresets: Array<{ name: string; url: string }>;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save'): void;
}>();

const toast = useToast();
const currentStep = ref(1);

watch(() => props.isOpen, (open) => {
  if (open) {
    currentStep.value = 1;
    gallerySearchQuery.value = props.form.name || '';
  }
});

watch(() => props.form.name, (newName) => {
  if (newName) {
    gallerySearchQuery.value = newName;
  }
}, { immediate: true });

const selectedCategory = computed(() => {
  return props.categoryOptions?.find((c: any) => c.value === props.form.categoryId || c.id === props.form.categoryId);
});

const effectiveTrackInventory = computed(() => {
  if (props.form.trackInventory !== null && props.form.trackInventory !== undefined) {
    return Boolean(props.form.trackInventory);
  }
  if (selectedCategory.value && (selectedCategory.value as any).defaultTrackInventory !== undefined && (selectedCategory.value as any).defaultTrackInventory !== null) {
    return Boolean((selectedCategory.value as any).defaultTrackInventory);
  }
  if (props.form.productType === 'dish' || props.form.productType === 'service') {
    return false;
  }
  return true;
});

let searchDebounceTimer: any = null;
watch([() => props.form.name, () => props.form.categoryId], ([name]) => {
  if (props.isOpen && name && name.trim().length >= 2) {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      const catName = selectedCategory.value?.label || selectedCategory.value?.name || '';
      fetchSampleImages(`${name} ${catName}`.trim());
    }, 600);
  }
});

const stepTitle = computed(() => {
  if (currentStep.value === 1) return "Asosiy parametrlar va o'lchov birligi";
  if (currentStep.value === 2) return "Moliya, narxlar va qoldiqlar";
  return "Rasm va yakuniy tasdiq";
});

const quickUnits = [
  { id: '00000000-0000-0000-0000-000000000020', name: 'Dona', shortName: 'dona', allowDecimal: false },
  { id: '00000000-0000-0000-0000-000000000021', name: 'Kilogramm', shortName: 'kg', allowDecimal: true },
  { id: '00000000-0000-0000-0000-000000000025', name: 'Gramm', shortName: 'g', allowDecimal: true },
  { id: '00000000-0000-0000-0000-000000000022', name: 'Litr', shortName: 'l', allowDecimal: true },
  { id: '00000000-0000-0000-0000-000000000026', name: 'Millilitr', shortName: 'ml', allowDecimal: true },
  { id: '00000000-0000-0000-0000-000000000023', name: 'Metr', shortName: 'm', allowDecimal: true },
  { id: '00000000-0000-0000-0000-000000000024', name: 'Porsiya', shortName: 'por', allowDecimal: false },
  { id: '00000000-0000-0000-0000-000000000027', name: 'Quti', shortName: 'quti', allowDecimal: false },
];

const unitSelectOptions = computed(() => {
  if (props.unitOptions && props.unitOptions.length > 0) {
    return props.unitOptions.map((u: any) => ({
      value: u.id,
      label: `${u.name} (${u.shortName || u.name})`,
    }));
  }
  return quickUnits.map((u) => ({
    value: u.id,
    label: `${u.name} (${u.shortName})`,
  }));
});

const selectedUnit = computed(() => {
  const currentId = props.form.unitId;
  const allUnits = props.unitOptions && props.unitOptions.length > 0 ? props.unitOptions : quickUnits;
  return allUnits.find((u: any) => u.id === currentId || u.shortName === currentId) || quickUnits[0];
});

const selectedUnitShortName = computed(() => {
  return selectedUnit.value?.shortName || 'dona';
});

const isDecimalUnit = computed(() => {
  return selectedUnit.value?.allowDecimal === true || 
    ['kg', 'g', 'l', 'ml', 'm'].includes(selectedUnitShortName.value.toLowerCase());
});

const validateStep1 = () => {
  if (!props.form.name || !props.form.name.trim()) {
    toast.warning("Iltimos, mahsulot nomini kiriting!", "1-Qadam");
    return false;
  }
  return true;
};

const validateStep2 = () => {
  if (props.form.salePrice === undefined || props.form.salePrice === null || Number(props.form.salePrice) < 0) {
    toast.warning("Iltimos, sotuv narxini to'g'ri kiriting!", "2-Qadam");
    return false;
  }
  return true;
};

const goToNextStep = () => {
  if (currentStep.value === 1) {
    if (validateStep1()) {
      currentStep.value = 2;
    }
  } else if (currentStep.value === 2) {
    if (validateStep2()) {
      currentStep.value = 3;
      if (!gallerySearchQuery.value && props.form.name) {
        gallerySearchQuery.value = props.form.name;
        fetchSampleImages();
      } else if (sampleImages.value.length === 0) {
        fetchSampleImages();
      }
    }
  }
};

const handleFinalSubmit = () => {
  if (!validateStep1()) {
    currentStep.value = 1;
    return;
  }
  if (!validateStep2()) {
    currentStep.value = 2;
    return;
  }
  emit('save');
};

const imageInputMode = ref<'upload' | 'url' | 'gallery'>('gallery');
const fileInputRef = ref<HTMLInputElement | null>(null);

const gallerySearchQuery = ref('');
const isSearchingImages = ref(false);
const sampleImages = ref<Array<{ id: string; title: string; category: string; url: string }>>([]);

const fetchSampleImages = async (queryStr?: string) => {
  const query = queryStr !== undefined ? queryStr : (gallerySearchQuery.value || props.form.name || '');
  gallerySearchQuery.value = query;
  isSearchingImages.value = true;

  const getClientFallbackImages = (qStr: string) => {
    const q = qStr.toLowerCase();
    if (q.includes('burg') || q.includes('gamburg') || q.includes('cheeseburg') || q.includes('fast')) {
      return [
        { id: 'fb-b-1', title: 'Klassik Gamburger', category: 'Fast-Food', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80' },
        { id: 'fb-b-2', title: 'Chizburger (Cheese Burger)', category: 'Fast-Food', url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80' },
        { id: 'fb-b-3', title: 'Double Burger & Kartoshka Fri', category: 'Fast-Food', url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80' },
        { id: 'fb-b-4', title: 'Grill Burger Maxsus Sousda', category: 'Fast-Food', url: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=600&auto=format&fit=crop&q=80' },
      ];
    }
    if (q.includes('lavash') || q.includes('doner') || q.includes('shavarma') || q.includes('wrap')) {
      return [
        { id: 'fb-l-1', title: 'Go\'shtli Katta Lavash', category: 'Fast-Food', url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80' },
        { id: 'fb-l-2', title: 'Tovuqli Pishloqli Lavash', category: 'Fast-Food', url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop&q=80' },
      ];
    }
    if (q.includes('colgate') || q.includes('tish') || q.includes('pasta') || q.includes('oral') || q.includes('sensodyne') || q.includes('chotka') || q.includes('dent')) {
      return [
        { id: 'fb-t-1', title: 'Colgate Triple Action Tish Pastasi', category: 'Shaxsiy Parvarish', url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&auto=format&fit=crop&q=80' },
        { id: 'fb-t-2', title: 'Oral-B / Colgate Tish Cho\'tkasi', category: 'Shaxsiy Parvarish', url: 'https://images.unsplash.com/photo-1559591937-e1032b4f57c5?w=600&auto=format&fit=crop&q=80' },
        { id: 'fb-t-3', title: 'Sensodyne Tish Pastasi', category: 'Shaxsiy Parvarish', url: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600&auto=format&fit=crop&q=80' },
      ];
    }
    if (q.includes('ariel') || q.includes('kukun') || q.includes('poroshok') || q.includes('persil') || q.includes('tide') || q.includes('kir') || q.includes('kimyo') || q.includes('xojalik')) {
      return [
        { id: 'fb-k-1', title: 'Kir Yuvish Kukuni (Ariel Avtomat 3kg)', category: 'Maishiy Kimyo', url: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&auto=format&fit=crop&q=80' },
        { id: 'fb-k-2', title: 'Persil Kir Yuvish Geli', category: 'Maishiy Kimyo', url: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=600&auto=format&fit=crop&q=80' },
        { id: 'fb-k-3', title: 'Idish Yuvish Vositalari', category: 'Maishiy Kimyo', url: 'https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?w=600&auto=format&fit=crop&q=80' },
      ];
    }
    if (q.includes('shashlik') || q.includes('kabob') || q.includes('gosht')) {
      return [
        { id: 'fb-s-1', title: 'Qiyma Shashlik / Kabob', category: 'Taomlar', url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80' },
        { id: 'fb-s-2', title: 'Tovuq Shashlik', category: 'Taomlar', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80' },
      ];
    }
    if (q.includes('cola') || q.includes('kola') || q.includes('ichimlik') || q.includes('pepsi') || q.includes('fanta')) {
      return [
        { id: 'fb-c-1', title: 'Coca-Cola 1.5L Plastik', category: 'Ichimliklar', url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80' },
        { id: 'fb-c-2', title: 'Coca-Cola Classic Banka', category: 'Ichimliklar', url: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600&auto=format&fit=crop&q=80' },
      ];
    }
    return [
      { id: 'fb-g-1', title: `${qStr || 'Mahsulot'} (Namunaviy rasm 1)`, category: 'Tovar', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80' },
      { id: 'fb-g-2', title: `${qStr || 'Mahsulot'} (Namunaviy rasm 2)`, category: 'Tovar', url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80' },
    ];
  };

  try {
    const { data } = await api.get('/products/search-images', { params: { query } });
    if (data && data.images && data.images.length > 0) {
      sampleImages.value = data.images;
    } else {
      sampleImages.value = getClientFallbackImages(query);
    }
  } catch (err) {
    console.warn('Sample image search error, applying fallback:', err);
    sampleImages.value = getClientFallbackImages(query);
  } finally {
    isSearchingImages.value = false;
  }
};

const switchToGalleryMode = () => {
  imageInputMode.value = 'gallery';
  if (!gallerySearchQuery.value) {
    gallerySearchQuery.value = props.form.name || '';
  }
  fetchSampleImages();
};

const selectSampleImage = (url: string) => {
  props.form.imageUrl = url;
  toast.success("Namunaviy rasm tanlandi!", "Rasm biriktirildi");
};

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const handleImageFileUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    props.form.imageUrl = event.target?.result as string;
    toast.success("Fayl muvaffaqiyatli yuklandi!");
  };
  reader.readAsDataURL(file);
};

const removeImage = () => {
  props.form.imageUrl = null;
};
</script>

<style scoped>
.step-slide-enter-active,
.step-slide-leave-active {
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}

.step-slide-enter-from {
  opacity: 0;
  transform: translateX(16px);
}

.step-slide-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}
</style>
