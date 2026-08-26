# 📜 CHUQUR TEXNIK TOPSHIRIQ (TZ): ubms-shared-types va ubms-telegram-bot Modullarini Mukammallashtirish

**Sana:** 2026-08-24  
**Loyiha:** boshqar.uz — Universal Biznes Boshqaruv Tizimi  
**Qamrov:** `ubms-shared-types` (Yagona TypeScript tiplari) hamda `ubms-telegram-bot` (Telegram Bot & Telegram Mini-App)

---

## 1. Maqsad va Qamrov (Purpose & Scope)

### A) `ubms-shared-types` (Yagona Tip Qatlami)
Backend (NestJS), Frontend (Vue 3) va Telegram Bot (Node.js) o'rtasida ma'lumotlar tuzilmasining 100% konsistentligini ta'minlash. Duplikatsiya tiplarni yo'qotib, yagona `npm` yoki mahalliy monorepo to'plami sifatida eksport qilish.

### B) `ubms-telegram-bot` (Telegram Bot & Mini-App Ekotizimi)
Tizim foydalanuvchilari (do'kon egalari, menejerlar, kassirlar) uchun Telegram ilovasidan chiqmagan holda savdolar monitoringi, Telegram Mini-App (TMA) kassa/ombor paneli, tezkor xarajat kiritish hamda Boshqar AI bilan muloqot qilish imkoniyatini yaratish.

---

## 2. Foydalanuvchi Rollari (User Roles)

| Rol nomi | Telegram Bot / Mini-App Huquqlari | Cheklovlar |
|---|---|---|
| **Business Owner / Boshliq** | Kunlik va oylik hisobotlar, xarajat kiritish, kam qolgan tovarlar, AI yordamchi | Tizim sozlamalarini o'chirish |
| **Store Manager / Menejer** | Ombor qoldiqlarini ko'rish, yangi tovar kirim qilish, mijozlar qarzdorligi | Moliyaviy foyda/zarar statistikasi |
| **Cashier / Kassir** | Telegram Mini-App orqali kassa savdosi qilish, shift ochish/yopish | Admin vakolatlari |

---

## 3. Ma'lumotlar Bazasi va Tiplar Arxitekturasi

### A) `ubms-shared-types` Export Tuzilishi:
```typescript
// 1. Core Model Interfaces
export interface IUser { id: string; phone: string; fullName: string; role: string; status: string; }
export interface IBusiness { id: string; name: string; currency: string; planId: string; }
export interface IProduct { id: string; businessId: string; name: string; price: number; stockQty: number; barcode?: string; sku?: string; }
export interface IOrder { id: string; orderNumber: string; total: number; status: string; createdAt: Date; }

// 2. DTO & API Payloads
export interface CreateOrderDto { branchId: string; items: Array<{ productId: string; quantity: number }>; paymentMethod: string; }
export interface FiscalReceiptDto { orderId: string; fiscalSign: string; qrCodeUrl: string; }
export interface TerminalChargeDto { terminalId: string; amount: number; orderId?: string; }

// 3. System Enums
export enum OrderStatus { COMPLETED = 'completed', DRAFT = 'draft', CANCELLED = 'cancelled' }
export enum PaymentMethodType { CASH = 'cash', CARD = 'card', DEBT = 'debt' }

// 4. API Standard Response Wrapper
export interface ApiResponse<T> { success: boolean; data?: T; message?: string; timestamp: string; }
```

---

## 4. API va Webhook Jadvali (API Table)

| Method | Path / Event | Auth | Payload / Params | Response | Xatoliklar |
|---|---|---|---|---|---|
| `POST` | `/api/v1/telegram/webhook` | Telegram Secret | `TelegramUpdate` JSON | `{ ok: true }` | 401 (Invalid token) |
| `POST` | `/api/v1/telegram/link-chat` | Bearer JWT | `{ token: string, chatId: string }` | `{ success: true, businessName }` | 400 (Expired token) |
| `GET` | `/api/v1/telegram/tma/init` | InitData JWT | Query: `telegramInitData` | `{ user, business, permissions }` | 403 (Unauthorized) |
| `POST` | `/api/v1/telegram/tma/order` | InitData JWT | `CreateOrderDto` | `{ success: true, orderNumber }` | 400 (Stock out) |

---

## 5. Telegram Mini-App (TMA) va Bot Ekranlari

1. **Bot Bosh Menyusi (Inline Keyboard):**
   - 📊 `/savdo` — Bugungi kassa savdosi statistikasi.
   - 📈 `/hisobot` — Kunlik va oylik moliya hisoboti.
   - 📦 `/ombor` — Kam qolgan tovarlar ogohlantirishi.
   - 💸 `/xarajat` — Tezkor xarajat kiritish (masalan: `150000 tushlik`).
   - 🤖 `/ai` — Boshqar AI bilan ovozli yoki matnli savol-javob.
2. **Telegram Mini-App (TMA Dashboard):**
   - Telegram ichida ochiladigan mobile-first Vue 3 interfeysi: Bosh sahifa, Kassa (POS), Tovar izlash va Qoldiqlar.

---

## 6. Qabul Qilish Mezonlari (Acceptance Criteria)

- [ ] **AC-1 (ubms-shared-types):** `npm run build` bajarilganda barcha DTO va Interfeyslar toza `.d.ts` fayllarga kompilyatsiya bo'lishi va Frontend hamda Backendda bexato import qilinishi kerak.
- [ ] **AC-2 (Telegram Bot Polling & Webhook):** Telegram botida `/start`, `/savdo`, `/hisobot`, `/ombor` va `/xarajat` buyruqlari 100% to'g'ri javob berishi kerak.
- [ ] **AC-3 (Telegram Mini-App):** Bot ichidagi "📱 Tizimga kirish (Mini-App)" tugmasi bosilganda Telegram WebApp interfeysi 1 daqiqada ochilib, kassa savdosini bajarishi kerak.

---

## 7. Chetga Chiqish Holatlari (Edge Cases)

- **Mini-App InitData qalbiyligi (Tampering):** Telegram WebApp `initData` hmac-sha256 kaliti orqali backendda tekshiriladi, aks holda so'rov rad etiladi.
- **Telegram Server timeouts:** Xabar yuborishda 3 soniyalik taymaut o'rnatiladi, javob bo'lmasa qayta urinish (retry algorithm with backoff) qo'llaniladi.

---

## 8. Taxminlar va Ochiq Savollar (Assumptions & Open Questions)

- `[ASSUMPTION]` Bot uchun `TELEGRAM_BOT_TOKEN` (`.env` dan olinadi) va `@Boshqar_uzbot` rasmiy botidan foydalaniladi.
