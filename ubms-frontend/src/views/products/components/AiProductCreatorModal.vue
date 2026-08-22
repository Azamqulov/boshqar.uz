<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-3 bg-slate-900/70 backdrop-blur-sm"
    >
      <div
        class="
          w-full sm:max-w-6xl
          h-full sm:h-[92vh]
          flex flex-col
          bg-white dark:bg-slate-900
          sm:rounded-3xl
          shadow-2xl border-0 sm:border border-slate-200 dark:border-slate-800
          overflow-hidden
          text-slate-900 dark:text-white
        "
      >
        <!-- HEADER -->
        <div class="shrink-0 flex items-center justify-between gap-3 px-5 py-3 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 shrink-0">
              <Boxes class="w-5 h-5 text-white" />
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="font-black text-base text-slate-900 dark:text-white tracking-tight leading-none">
                  AI Aqlli Mahsulotlar Kiritish
                </h3>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                  AI 2.0
                </span>
              </div>
              <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                AI bilan suhbatlashing — mahsulotlar avtomatik jadvalga joylashadi
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <button
              type="button"
              @click="addEmptyRow"
              class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition shadow-lg shadow-emerald-500/20"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>+ Yangi mahsulot</span>
            </button>
            <button
              type="button"
              @click="closeModal"
              class="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- BODY: Chat (left) + Table (right) -->
        <div class="flex-1 overflow-hidden flex">

          <!-- LEFT: CHAT PANEL -->
          <div class="w-full lg:w-[360px] shrink-0 flex flex-col border-r border-slate-200/80 dark:border-slate-800 overflow-hidden">
            <AiImportPromptHero
              v-model="promptText"
              :is-listening="isListening"
              :parsing="parsing"
              :messages="chatMessages"
              @send="parsePrompt"
              @toggle-voice="toggleVoiceRecognition"
              @chip-select="applyQuickPrompt"
            />
          </div>

          <!-- RIGHT: PRODUCTS PANEL -->
          <div class="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-900">

            <!-- Toolbar -->
            <div class="shrink-0 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/15">
                  <Package class="w-3.5 h-3.5" />
                </div>
                <span class="font-black text-sm text-slate-900 dark:text-white">Mahsulotlar ro'yxati</span>
                <span class="px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                  {{ filteredParsedItems.length }} ta
                </span>
              </div>
              <div class="flex items-center gap-2">
                <div class="relative">
                  <Search class="w-3 h-3 text-slate-400 absolute left-2.5 top-2" />
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Qidirish..."
                    class="w-36 sm:w-44 pl-7 pr-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-emerald-500 transition"
                  />
                </div>
                <AppViewToggle v-model="viewMode" class="inline-flex shrink-0" />
              </div>
            </div>

            <!-- Scrollable Content -->
            <div class="flex-1 overflow-y-auto">
              <div
                v-if="parsedItems.length === 0"
                class="h-full flex flex-col items-center justify-center gap-3 px-6 py-10 text-center"
              >
                <div class="relative">
                  <div class="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/40">
                    <Package class="w-8 h-8 text-emerald-400 dark:text-emerald-500" />
                  </div>
                  <div class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Sparkles class="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
                <div>
                  <h4 class="font-bold text-sm text-slate-800 dark:text-slate-200">Hozircha mahsulotlar yo'q</h4>
                  <p class="text-xs text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">
                    Chap tomondagi chat orqali AI bilan gaplashing.
                  </p>
                </div>
              </div>

              <AiImportGridView
                v-else-if="viewMode === 'grid'"
                :items="paginatedItems"
                :category-options="categorySelectOptions"
                :unit-options="UNIT_OPTIONS"
                :get-item-index="getItemIndex"
                :calculate-margin="calculateMargin"
                :format-price="formatPrice"
                :handle-price-input="handlePriceInput"
                @remove-item="removeRow"
                @add-empty="addEmptyRow"
              />

              <AiImportTableView
                v-else
                :items="paginatedItems"
                :category-options="categorySelectOptions"
                :unit-options="UNIT_OPTIONS"
                :get-item-index="getItemIndex"
                :calculate-margin="calculateMargin"
                :format-price="formatPrice"
                :handle-price-input="handlePriceInput"
                @remove-item="removeRow"
              />
            </div>

            <!-- Bottom bar -->
            <div class="shrink-0 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div v-if="filteredParsedItems.length > 0" class="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <AppPagination
                  :current-page="currentPage"
                  :page-size="pageSize"
                  :total-items="filteredParsedItems.length"
                  item-name="mahsulot"
                  @update:current-page="currentPage = $event"
                  @update:page-size="pageSize = $event"
                />
              </div>
              <div class="px-4 py-2.5 flex items-center justify-between gap-3">
                <div class="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                  <span class="flex items-center gap-1">
                    <Package class="w-3 h-3 text-emerald-500" />
                    <strong class="text-slate-900 dark:text-white">{{ parsedItems.length }}</strong> ta mahsulot
                  </span>
                  <span v-if="averageMargin > 0" class="flex items-center gap-1">
                    <TrendingUp class="w-3 h-3 text-amber-500" />
                    <strong class="text-emerald-600 dark:text-emerald-400">{{ averageMargin }}%</strong> marja
                  </span>
                </div>
                <button
                  type="button"
                  @click="saveAllProducts"
                  :disabled="saving || parsedItems.length === 0"
                  class="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black shadow-lg shadow-emerald-500/20 transition btn-interactive"
                >
                  <Loader2 v-if="saving" class="w-3.5 h-3.5 animate-spin" />
                  <Check v-else class="w-3.5 h-3.5" />
                  <span>{{ saving ? 'Saqlanmoqda...' : 'Barchasini Saqlash' }}</span>
                  <span v-if="parsedItems.length > 0" class="px-1.5 py-0.5 rounded-md bg-white/20 text-[10px] font-black">
                    {{ parsedItems.length }}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile Save -->
        <div class="lg:hidden shrink-0 p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <button
            type="button"
            @click="saveAllProducts"
            :disabled="saving || parsedItems.length === 0"
            class="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-black shadow-lg shadow-emerald-500/25 transition"
          >
            <Check class="w-4 h-4" />
            <span>{{ saving ? 'Saqlanmoqda...' : `Barchasini Saqlash (${parsedItems.length} ta)` }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import {
  Boxes, Plus, X, Sparkles, Search, Package,
  TrendingUp, Check, Loader2,
} from 'lucide-vue-next';
import { useAiProductParser, UNIT_OPTIONS } from './ai-import/useAiProductParser';
import AiImportPromptHero from './ai-import/AiImportPromptHero.vue';
import AiImportTableView from './ai-import/AiImportTableView.vue';
import AiImportGridView from './ai-import/AiImportGridView.vue';
import AppViewToggle from '@/components/AppViewToggle.vue';
import AppPagination from '@/components/AppPagination.vue';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'products-imported'): void;
}>();

const closeModal = () => emit('close');

const handleSaveSuccess = () => {
  emit('products-imported');
  emit('close');
};

const {
  promptText, parsing, saving, isListening, chatMessages, parsedItems,
  viewMode, searchQuery, selectedCategoryFilter, currentPage, pageSize,
  categorySelectOptions, filteredParsedItems, paginatedItems,
  totalQuantity, averageMargin,
  calculateMargin, formatPrice, handlePriceInput, getItemIndex,
  removeRow, addEmptyRow, applyQuickPrompt,
  toggleVoiceRecognition, parsePrompt, saveAllProducts,
} = useAiProductParser(handleSaveSuccess);
</script>
