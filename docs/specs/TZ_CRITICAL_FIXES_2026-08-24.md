# 📜 TEXNIK TOPSHIRIQ (TZ): 3 ta Kritik Kamchilikni Tuzatish va Tizimni Barqarorlashtirish

**Sana:** 2026-08-24  
**Loyiha:** boshqar.uz — Universal Biznes Boshqaruv Tizimi  
**Maqsad:** Auditda aniqlangan 3 ta eng kritik muammoni (E2E avtotestlar, Bus Factor xavfini bartaraf etish, Soliq OFD va Uzcard/Humo terminal drayveri) 100% professional darajada hal etish.

---

## 1. Maqsad va qamrov (Purpose & Scope)

Ushbu Texnik Topshiriq (TZ) boshqar.uz tizimining ishonchliligini production-grade darajasiga ko'tarishga qaratilgan:
1. **E2E va Avtomatik Testlash:** `ubms-frontend` va `ubms-backend`da Playwright va Vitest E2E avtotestlarini joriy etish, kassa POS va auth savdo mantiqlarini 100% avtomatik regressiya nazoratiga olish.
2. **Jamoa va Kadrlar Almashinuvi (Bus Factor = 1 Himoyasi):** Loyihaning to'liq arxitekturasini, ERD ma'lumotlar xaritasini, favqulodda vaziyatlar yo'riqnomasini (Runbook) va yangi dasturchini 15 daqiqada ishga tushirish (Onboarding & Healthcheck) vositalarini yaratish.
3. **Fiskal Soliq va To'lov Terminali Moduli:** Soliq Qo'mitasi OFD fiskal modullari (QR-kod, Z-hisobot) va Uzcard/Humo integratsiyasi uchun NestJS `FiscalModule` hamda `TerminalModule` arxitekturasini joriy etish, ma'lumotlar bazasi jadvallari va kassa POS interfeysiga ulash.

---

## 2. Foydalanuvchi Rollari (User Roles)

| Rol nomi | Ko'rish / Bajarish huquqi | Cheklovlar |
|---|---|---|
| **SuperAdmin** | Barcha fiskal qurilmalarni sozlash, E2E testlarni ishga tushirish, Z-hisobotlarni ko'rish | Cheklovsiz |
| **Owner / Boshliq** | Filial fiskal ma'lumotlarini ko'rish, terminal to'lovlar tarixini va E2E auditini tekshirish | Boshqa bizneslar ma'lumotlari |
| **Cashier / Kassir** | POS kassada terminal orqali to'lov yechish, fiskal QR-kodli chek chop etish | Fiskal va terminal sozlamalarini o'zgartirish |
| **DevOps / QA** | E2E testlarni avtomatik ishga tushirish, `system:healthcheck` diagnosini bajarish | Ishlab chiqarish bazasini o'chirish |

---

## 3. Ma'lumotlar Bazasi Sxemasi (DB Schema)

```sql
-- 1. Fiskal Cheklar Jadvali (Soliq Qo'mitasi OFD)
CREATE TABLE "fiscal_receipts" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "business_id" UUID NOT NULL REFERENCES "businesses"("id") ON DELETE CASCADE,
    "branch_id" UUID NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE,
    "order_id" UUID UNIQUE REFERENCES "orders"("id") ON DELETE CASCADE,
    "receipt_seq" INT NOT NULL,
    "fiscal_number" VARCHAR(50) NOT NULL,
    "fiscal_sign" VARCHAR(100) NOT NULL,
    "qr_code_url" TEXT NOT NULL,
    "z_report_id" VARCHAR(50),
    "tax_amount" DECIMAL(14,2) DEFAULT 0,
    "total_amount" DECIMAL(14,2) NOT NULL,
    "status" VARCHAR(20) DEFAULT 'success',
    "created_at" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX "idx_fiscal_receipts_business_branch" ON "fiscal_receipts"("business_id", "branch_id");

-- 2. POS To'lov Terminallari Jadvali (Uzcard / Humo / Multipay)
CREATE TABLE "payment_terminals" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "business_id" UUID NOT NULL REFERENCES "businesses"("id") ON DELETE CASCADE,
    "branch_id" UUID NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE,
    "name" VARCHAR(100) NOT NULL,
    "provider" VARCHAR(30) NOT NULL, -- 'uzcard', 'humo', 'multipay'
    "terminal_id" VARCHAR(50) NOT NULL,
    "merchant_id" VARCHAR(50) NOT NULL,
    "connection_type" VARCHAR(20) DEFAULT 'ethernet', -- 'ethernet', 'usb', 'cloud'
    "ip_address" VARCHAR(45),
    "port" INT,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP DEFAULT NOW(),
    "updated_at" TIMESTAMP DEFAULT NOW()
);

-- 3. Terminal Tranzaksiyalari Jadvali
CREATE TABLE "terminal_transactions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "terminal_id" UUID NOT NULL REFERENCES "payment_terminals"("id") ON DELETE CASCADE,
    "order_id" UUID REFERENCES "orders"("id") ON DELETE SET NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" VARCHAR(3) DEFAULT 'UZS',
    "rrn" VARCHAR(50),
    "stan" VARCHAR(50),
    "response_code" VARCHAR(10),
    "card_mask" VARCHAR(20),
    "status" VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'declined', 'cancelled'
    "created_at" TIMESTAMP DEFAULT NOW()
);
```

---

## 4. API Jadvali (API Table)

| Method | Path | Auth | Request Body | Response | Xatoliklar |
|---|---|---|---|---|---|
| `POST` | `/api/v1/fiscal/receipts/generate` | Bearer JWT | `{ orderId: string }` | `{ success: true, fiscalNumber, qrCodeUrl }` | 400 (Incomplete order), 404 (Not found) |
| `GET` | `/api/v1/fiscal/z-report` | Bearer JWT | Query: `branchId` | `{ zReportId, totalRevenue, totalTax, receiptsCount }` | 403 (Unauthorized) |
| `GET` | `/api/v1/terminals` | Bearer JWT | Query: `branchId` | `[ { id, name, provider, is_active } ]` | 401 (Unauthenticated) |
| `POST` | `/api/v1/terminals` | Bearer JWT | Terminal DTO | `{ id, name, is_active: true }` | 400 (Validation) |
| `POST` | `/api/v1/terminals/:id/charge` | Bearer JWT | `{ amount: number, orderId: string }` | `{ success: true, rrn, stan, cardMask }` | 408 (Timeout), 502 (Terminal error) |
| `POST` | `/api/v1/terminals/:id/cancel` | Bearer JWT | `{ transactionId: string }` | `{ success: true, cancelled: true }` | 400 (Already completed) |

---

## 5. Ekranlar Ro'yxati (Screens List)

- **POS Kassa va Chek Modal (POSView & ReceiptModal):** Terminal orqali to'lov yechish tugmasi va Soliq OFD QR-kodli fiskal chek ko'rinishi.
- **Terminallar va Fiskal Sozlamalar Oynasi (SettingsTerminalTab.vue):** Uzcard/Humo va Fiskal modul parametrlarini sozlash.
- **Playwright Test Dashboard / Report (Local HTML):** Avtomatik E2E testlar natijalari vizual hisoboti.

---

## 6. Qabul Qilish Mezonlari (Acceptance Criteria)

- [ ] **AC-1 (E2E Testlar):** `npx playwright test` buyrug'i berilganda backend va frontend integratsiyasi, Login va Kassa POS jarayonlari 100% muvaffaqiyatli o'tishi kerak.
- [ ] **AC-2 (Bus Factor & Healthcheck):** `npm run system:healthcheck` va `HANDOVER_DEVELOPER_GUIDE.md` orqali yangi dasturchi loyihani 15 daqiqada nol-dan tushunishi va diagnostika qila olishi kerak.
- [ ] **AC-3 (Fiskal & Terminal Moduli):** Prisma schema'da `FiscalReceipt`, `PaymentTerminal`, `TerminalTransaction` modellari paydo bo'lishi va backend integratsiyalar sinovdan o'tishi kerak.

---

## 7. Chetga Chiqish Holatlari (Edge Cases)

- **Terminal ulanish uzilishi (Terminal Timeout):** Agarda POS terminal 30 soniya ichida javob bermasa, tranzaksiya `timeout` holatiga o'tadi va kassa bloklanib qolmaydi.
- **Soliq OFD serveri ishlamasligi:** Soliq API serverida uzilish bo'lsa, chek `pending_sync` holatida saqlanadi va server qayta tiklangach avtomatik sinxronlanadi.

---

## 8. Taxminlar va Ochiq Savollar (Assumptions & Open Questions)

- `[ASSUMPTION]` Soliq OFD test muhiti va Uzcard/Humo mock emulyatori integratsiya sinovlari uchun backendda mock xizmati bilan ta'minlanadi.
