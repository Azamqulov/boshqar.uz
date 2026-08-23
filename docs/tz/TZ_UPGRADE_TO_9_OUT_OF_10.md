# 📜 Texnik Topshiriq (TZ): boshqar.uz Tizimini 9.5/10+ Darajaga Olib Chiqish (Full Upgrade Suite)

## 1. Maqsad va Qamrov (Purpose & Scope)

Ushbu Texnik Topshiriq (TZ) **boshqar.uz** platformasini joriy 7.2/10 audit ko'rsatkichidan **9.5/10+ ultra-enterprise darajaga** olib chiqish uchun mo'ljallangan. Hujjat 12 ta audit yo'nalishidagi barcha zaif tomonlarni (QA Testlar, CI/CD Pipeline, DB Backup, Soliq.uz Virtual Kassa, Telegram Mini-App, Accessibility va IDOR Xavfsizligi) to'liq yopish va tizimni production-ready SaaS mahsulotiga aylantirish talablarini belgilaydi.

---

## 2. Foydalanuvchi Rollari va Ruxsatlar (User Roles & RBAC Matrix)

| Rol nomi | Ko'ra oladi va Bajaradi | Cheklovlar (Qila olmaydi) |
|---|---|---|
| **Super Admin** | Barcha korxonalar, obunalar, tariflar, global loglar, system backup | Boshqa korxonalarning maxfiy mijoz parollarini ko'rish |
| **Owner / Biznes Egasi** | Moliya, xodimlar, filiallar, audit loglar, Soliq.uz sozlamalari, eksport | Boshqa korxona ma'lumotlariga kirish |
| **Store Manager (Omborchi)**| Omborxona, tovar qabuli, inventarizatsiya, yetkazib beruvchilar | Moliyaviy foyda/zarar hisobotlarini o'chirish |
| **Cashier (Kassir)** | POS kassa, sotuv, chek chiqarish, nasiya daftari kiritish | Chekni sababsiz o'chirish, narxlarni qo'lda o'zgartirish |
| **Waiter (Ofitsiant)** | Restoran stollari, buyurtma kiritish, KDS oshxonaga yuborish | Kassani yopish, moliyaviy hisobotlarni ko'rish |

---

## 3. Ma'lumotlar Bazasi Sxemasi Qo'shimchalari (DB Schema - Prisma Migration)

```sql
-- 1. Soliq.uz Fiskal Chek integratsiyasi uchun jadval
CREATE TABLE "soliq_fiscal_receipts" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenant_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL UNIQUE,
    "fiscal_sign" TEXT NOT NULL,
    "qr_code_url" TEXT NOT NULL,
    "terminal_id" TEXT NOT NULL,
    "receipt_seq" BIGINT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUCCESS', -- PENDING, SUCCESS, FAILED
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_soliq_fiscal_tenant" FOREIGN KEY ("tenant_id") REFERENCES "businesses"("id") ON DELETE CASCADE,
    CONSTRAINT "fk_soliq_fiscal_order" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_soliq_fiscal_tenant" ON "soliq_fiscal_receipts"("tenant_id");
CREATE INDEX "idx_soliq_fiscal_status" ON "soliq_fiscal_receipts"("status");

-- 2. System Backup Loglari uchun jadval
CREATE TABLE "system_backup_logs" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "backup_name" TEXT NOT NULL,
    "size_bytes" BIGINT NOT NULL,
    "storage_provider" TEXT NOT NULL, -- S3, CLOUDFLARE_R2, LOCAL
    "status" TEXT NOT NULL, -- SUCCESS, FAILED
    "checksum_sha256" TEXT NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Offline Sync Queue Loglari (PWA uchun)
CREATE TABLE "offline_sync_queues" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenant_id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "payload_json" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, PROCESSED, ERROR
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3)
);
```

---

## 4. API Jadvali (API Endpoints Table)

| Method | Path | Auth? | Request Body | Response | Error Cases |
|---|---|---|---|---|---|
| `POST` | `/api/v1/soliq/fiscalize` | JWT (Owner/Cashier) | `{ orderId: string }` | `{ fiscalSign, qrCodeUrl }` | 400 (Invalid order), 502 (Soliq API timeout) |
| `GET` | `/api/v1/backups` | JWT (SuperAdmin) | None | `{ backups: Array<BackupLog> }` | 403 (Forbidden) |
| `POST` | `/api/v1/backups/trigger` | JWT (SuperAdmin) | `{ provider: 'R2' }` | `{ message: 'Backup started' }` | 500 (Dump error) |
| `POST` | `/api/v1/offline/sync` | JWT (Cashier) | `{ items: Array<OfflineSyncItem> }` | `{ syncedCount, errors }` | 400 (Schema mismatch) |
| `GET` | `/api/v1/health/system` | Public | None | `{ db: 'ok', redis: 'ok', queue: 'ok' }` | 503 (Service unavailable) |
| `POST` | `/api/v1/ai/scan-receipt` | JWT (Manager) | `FormData(file)` | `{ items: Array<ParsedProduct> }` | 422 (Unprocessable image) |

---

## 5. Yangi Modullar va Ekranlar Ro'yxati (Screens & Modules List)

1. **Soliq.uz Virtual Kassa Sozlamalari Ekrani:** Fiskal modul tokeni, terminal ID va MXIK tasnif kodlarini biriktirish paneli.
2. **System Health & CI/CD Status Dashbordi:** Super Admin uchun PostgreSQL backup holati, Redis kesh statistikasi va API server tezligini kuzatish.
3. **Telegram Mini-App POS Kassa Ekrani:** Mobil telefonda Telegram ichida ishlaydigan tezkor POS kassa interfeysi.
4. **Oflayn Sinxronizatsiya Loglari Ekrani:** Internet o'chganda amalga oshirilgan kassa sotuvlarini ko'rish va avto-sync holatini tekshirish.
5. **AI Chek va Tovar Skaner Paneli:** Chek yoki tovar rasmini yuklab, avtomatik bazaga kiritish paneli.

---

## 6. Qabul Qilish Mezonlari (Acceptance Criteria & Test Standards)

### A. Testing Suite (QA Score -> 9.5)
- [ ] Backend uchun Vitest/Jest unit testlar qamrovi (Line coverage) kamida **80%** bo'lishi shart.
- [ ] Frontend kassa va sotuv flowlari uchun Playwright E2E testlari har bir PR-da avtomatik o'tishi kerak.

### B. CI/CD & Backup (DevOps Score -> 9.5)
- [ ] `.github/workflows/ci-cd.yml` har safar `main` branchga push qilinganda lint, build, test va deployni 100% avtomatik bajarishi shart.
- [ ] Har kuni soat 03:00 da PostgreSQL bazasi dump olinib, Cloudflare R2 va S3 ga shifrlangan holda yuklanishi va restore skripti sinalishi kerak.

### C. Security & IDOR (Security Score -> 9.5)
- [ ] Barcha export hamda update API controllerlarida `@UseGuards(TenantResourceGuard)` orqali foydalanuvchi faqat o'z korxonasiga tegishli resursni o'zgartirishi kafolatlanishi kerak.

### D. Soliq.uz Integration (Business Score -> 9.5)
- [ ] POS kassa cheki urilganda 1 soniya ichida Soliq.uz fiskal QR kodi yaratilishi va chekda chop etilishi lozim.

---

## 7. Chetga Chiqish Holatlari (Edge Cases to Handle)

1. **Internet Mutlaqo Yo'qligi (Offline POS):** Internet o'chganda kassa to'xtamasdan IndexedDB ga saqlaydi va internet yongach 100% ziddiyatsiz (conflict-free) bazaga o'tkazadi.
2. **Soliq.uz Serveri Sekinlashishi yoki Jamlanishi:** Soliq.uz API javob bermasa, chek o'z-o'zidan to'xtamaydi — `PENDING_FISCAL` holatga o'tib, fondagi cron-job orqali qayta yuboriladi.
3. **Bir Vaqtda Bir Nechta Kassir Bir Tovarni Sotishi (Race Condition):** Ombor qoldig'i PostgreSQL `SELECT FOR UPDATE` tranzaksiyasi orqali himoyalanadi, minusga kirib ketish taqiqlanadi.
4. **Server Diski To'lib Qolishi:** Automated monitoring Sentry/Telegram bot orqali disk 85% ga yetganda darhol xabar yuboradi va eski loglarni tozalaydi.

---

## 8. Taxminlar va Ochiq Savollar (Assumptions & Open Questions)

- `[ASSUMPTION]` Soliq.uz Virtual Kassa operatori sifatidagi OAuth2 kalitlari korxona egasi tomonidan sozlamalar bo'limida kiritiladi.
- `[ASSUMPTION]` Telegram Mini-App foydalanuvchilari Telegram WebApp authentication tokeni orqali avtomatik tizimga kiradi.
- `[ASSUMPTION]` S3/Cloudflare R2 zaxira nusxa saqlash xarajati oylik $5 dan oshmaydi.

---
*Ushbu TZ boshqar.uz platformasini 9.5/10+ ballga olib chiquvchi rasmiy ijrochi hujjat hisoblanadi.*
