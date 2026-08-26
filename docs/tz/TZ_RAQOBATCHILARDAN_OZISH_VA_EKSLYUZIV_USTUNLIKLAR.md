# 🚀 TEXNIK TOPSHIRIQ (TZ): Boshqar.uz Raqobatchilardan O'zish va Eksklyuziv Ustunliklar Tizimi

> [!IMPORTANT]
> **Hujjat Maqsadi:** Boshqar.uz platformasining Poster POS, Jowi, iiko va Bitrix24 kabi bozor raqobatchilaridan 10x ustunligini ta'minlovchi eksklyuziv funksiyalar to'plamini ishlab chiqish va joriy etish.  
> **Sana:** 25-Avgust, 2026-yil  
> **Ishlab Chiquvchi:** Antigravity AI Dev Team & Boshqar.uz Core Team  

---

## 1. 🎯 Maqsad va Qamrov (Purpose & Scope)

Boshqar.uz platformasini O'zbekiston va MDH bozorida **"Tengsiz va Eng Qulay Universal Biznes Tizimi"** ga aylantirish. Raqobatchilar (Poster POS, Jowi, iiko) taklif qila olmaydigan 4 ta asosiy eksklyuziv ustunlikni to'liq ishlab chiqish va tizimga integratsiya qilish:
1. **AI Vision Invoice OCR Scanner:** Qog'oz faktura rasmidan 1 sekundda 100 ta mahsulotni avtomatik omborga kirim qilish.
2. **Offline-First PWA Sync Engine:** Internet uzilgan taqdirda ham kassa (POS) 100% uzluksiz ishlashini va internet tiklangach avtomatik sinxronizatsiyani ta'minlash.
3. **Smart Telegram Loyalty & Automated Cashback Bot:** Har bir xarid uchun Telegram orqali avtomatik elektron chek va keshbek tizimi.
4. **Interactive Drag-and-Drop Table Layout & Reservation:** Restoran va kafe uchun stollar xaritasini visual tarzda boshqarish.

---

## 2. 👥 Foydalanuvchi Rollari (User Roles)

| Rol Nomi | Ruxsat Etilgan Amallar | Taqiqlangan Amallar |
|---|---|---|
| **SuperAdmin / Egasi** | Barcha biznes sozlamalari, AI OCR scanner, barcha kassa va hisobotlar, obuna. | Cheklov yo'q. |
| **Menejer / Admin** | Omborxona kirimi, AI Invoice scanning, Mijozlar CRM, Restoran stollar xaritasi. | Tizim billing va korxona o'chirish. |
| **Kassir / Sotuvchi** | POS Kassa, chek chiqarish, xaridor keshbeki, Quick Lock (Win+L). | Tannarx ko'rish, oylik moliya va sozlamalar. |
| **Oshpaz (KDS)** | Restoran KDS buyurtma statuslarini o'zgartirish (Tayyor/Kutilmoqda). | Kassa pullarini ko'rish. |

---

## 3. 🗄️ Ma'lumotlar Bazasi Sxemasi (DB Schema)

```sql
-- 1. AI OCR Invoices Table
CREATE TABLE "ai_invoices" (
  "id" VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  "business_id" VARCHAR(36) NOT NULL REFERENCES "businesses"("id") ON DELETE CASCADE,
  "image_url" TEXT NOT NULL,
  "status" VARCHAR(20) DEFAULT 'PENDING', -- PENDING, PROCESSED, FAILED
  "raw_json" JSONB,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_ai_invoices_business" ON "ai_invoices"("business_id");

-- 2. Customer Loyalty & Cashback Transactions Table
CREATE TABLE "loyalty_transactions" (
  "id" VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  "business_id" VARCHAR(36) NOT NULL REFERENCES "businesses"("id") ON DELETE CASCADE,
  "customer_id" VARCHAR(36) NOT NULL REFERENCES "customers"("id") ON DELETE CASCADE,
  "sale_id" VARCHAR(36) REFERENCES "sales"("id") ON DELETE SET NULL,
  "points_earned" DECIMAL(12, 2) DEFAULT 0,
  "points_spent" DECIMAL(12, 2) DEFAULT 0,
  "balance_after" DECIMAL(12, 2) NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_loyalty_customer" ON "loyalty_transactions"("customer_id");

-- 3. Offline Pending Sync Queue Table (Client/Local Storage Fallback Table)
CREATE TABLE "offline_sync_queue" (
  "id" VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  "business_id" VARCHAR(36) NOT NULL,
  "payload" JSONB NOT NULL,
  "synced" BOOLEAN DEFAULT FALSE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. 🔌 API Endpointlar Jadvali

| Method | Path | Auth? | Request Body | Response | Error Cases |
|---|---|---|---|---|---|
| `POST` | `/api/v1/ai-ocr/scan-invoice` | Yes (JWT) | `{ imageBase64: string }` | `{ status: "SUCCESS", items: [...] }` | 400 Invalid Image, 500 Vision Error |
| `POST` | `/api/v1/loyalty/earn-cashback` | Yes (JWT) | `{ customerId, saleTotal }` | `{ cashbackEarned, newBalance }` | 404 Customer Not Found |
| `POST` | `/api/v1/pos/offline-batch-sync` | Yes (JWT) | `{ sales: [...] }` | `{ syncedCount: number, errors: [] }` | 401 Unauthorized, 400 Bad Schema |
| `GET` | `/api/v1/restaurant/tables/layout` | Yes (JWT) | None | `{ tables: [...] }` | 404 Layout Not Set |

---

## 5. 📱 Ekranlar va Interfeyslar Ro'yxati

1. **AI Vision Invoice Scanner Screen (`/products/ai-import`):** Qog'oz fakturani kamerada tushirish va 1 sekundda mahsulotlar ro'yxatini shakllantirish.
2. **Offline POS Cashier Interface (`/pos`):** Internet uzilganda ham "Offline Mode Active" yashil indikatori bilan 100% ishlaydigan kassa oynasi.
3. **Smart Customer Cashback Modal:** Kassa yakunlanganda xaridor telefon raqamini kiritib, Telegram botiga keshbek va elektron chek yuborish modali.
4. **Interactive Restaurant Tables Drag-and-Drop Map (`/restaurant/tables`):** Stollar o'rnini surib joylashtirish va band qiluvchi visual xarita.

---

## 6. ✅ Qabul Qilish Mezonlari (Acceptance Criteria)

- [ ] **AI OCR Scanner:** Faktura rasmi yuklanganda kamida 90%+ aniqlik bilan mahsulot nomi, miqdori va narxi avtomatik ajratib olinishi kerak.
- [ ] **Offline POS:** Internet `navigator.onLine === false` bo'lganda ham sotuv muvaffaqiyatli amalga oshishi, chek chiqishi va local queue-ga saqlanishi kerak.
- [ ] **Telegram Cashback:** Har bir keshbek to'planganda foydalanuvchining Telegram botiga 1 sekund ichida xabar borishi kerak.
- [ ] **Tables Map:** Stollar xaritasida stol ustiga bosilganda buyurtma biriktirish va statusini (Band / Bo'sh) avtomatik o'zgartirish kerak.

---

## 7. ⚠️ Chetga Chiqish Holatlari (Edge Cases)

1. **Faktura rasmi xira yoki tushunarsiz bo'lsa:** AI OCR xatolik bermasdan, "Iltimos, ravshanroq rasm oling" deb ogohlantirishi va qo'lda tahrirlash imkonini berishi kerak.
2. **Offline rejimda 100+ sotuv yig'ilib qolsa:** Internet kelgach barcha sotuvlar tranzaksiya tartibida (FIFO) ketma-ketlikda bazaga xatosiz sinxronlanishi kerak.
3. **Keshbek ishlatishda mijoz balansi yetarli bo'lmasa:** Kassa ekranida aniq ogohlantirish chiqib, qoldiq mablag'ni naqd yoki karta bilan to'latish kerak.

---

## 8. 📌 Taxminlar va Ochiq Savollar

- `[ASSUMPTION]` AI OCR Scanner uchun Google Cloud Vision API yoki Open-source Tesseract OCR fallback ishlatiladi.
- `[ASSUMPTION]` Telegram bot foydalanuvchi telefon raqami (+998) orqali mijoz profilingiz bilan avtomatik bog'lanadi.

---
*Ushbu Texnik Topshiriq (TZ) Boshqar.uz platformasining AI Development Team Protocol standarti bo'yicha tayyorlandi va darhol ijro etishga yo'naltirildi.*
