/**
 * Mahsulot uchun ombor qoldig'i hisoblanishi kerakmi yo'qmi — shu yerda
 * markazlashgan holda aniqlanadi. Avval bu logika har xil joyda
 * (`product.brand === 'dish'`) qayta-qayta yozilgan edi — endi bitta joydan
 * boshqariladi.
 *
 * Ustuvorlik tartibi:
 *   1. Product.trackInventory — aniq belgilangan bo'lsa (true/false), shu ishlatiladi.
 *   2. Category.defaultTrackInventory — mahsulot override qilmagan bo'lsa,
 *      kategoriyaning standart qiymati ishlatiladi.
 *   3. Legacy fallback — eski `brand`/`unit` orqali "taom" deb belgilangan
 *      mahsulotlar (yangi maydon to'ldirilmagan bo'lsa) — orqaga moslik uchun.
 *   4. Standart — true (qoldiq hisoblanadi), chunki ko'pchilik mahsulot
 *      (tovar) uchun bu to'g'ri xatti-harakat.
 */

export interface TrackInventoryInput {
  trackInventory?: boolean | null;
  brand?: string | null;
  unitId?: string | null;
  unit?: { shortName?: string | null } | null;
  category?: { defaultTrackInventory?: boolean | null } | null;
}

// Eski (hozir asta-sekin bekor qilinayotgan) "buyurtma asosida tayyorlanadi"
// belgilari — faqat trackInventory va category default ikkalasi ham
// aniqlanmagan eski yozuvlar uchun ishlatiladi.
const LEGACY_MADE_TO_ORDER_BRANDS = new Set(['dish', 'kitchen', 'service']);
const LEGACY_PORTION_UNIT_ID = '00000000-0000-0000-0000-000000000024';

export function resolveTrackInventory(product: TrackInventoryInput): boolean {
  if (product.trackInventory !== null && product.trackInventory !== undefined) {
    return product.trackInventory;
  }

  if (
    product.category &&
    product.category.defaultTrackInventory !== null &&
    product.category.defaultTrackInventory !== undefined
  ) {
    return product.category.defaultTrackInventory;
  }

  const legacyMadeToOrder =
    (product.brand && LEGACY_MADE_TO_ORDER_BRANDS.has(product.brand)) ||
    product.unit?.shortName === 'por' ||
    product.unitId === LEGACY_PORTION_UNIT_ID;

  if (legacyMadeToOrder) {
    return false;
  }

  return true;
}

// Qulaylik uchun teskarisi — "buyurtma tushgandagina tayyorlanadi, qoldiq
// hisoblanmaydi" ma'nosida ishlatiladigan joylarda o'qilishi osonroq bo'lsin.
export function isMadeToOrderProduct(product: TrackInventoryInput): boolean {
  return !resolveTrackInventory(product);
}
