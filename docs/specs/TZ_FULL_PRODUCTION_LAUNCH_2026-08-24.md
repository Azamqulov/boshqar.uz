# 📜 CHUQUR TEXNIK TOPSHIRIQ (TZ): boshqar.uz Tizimini 100% Production Rejimiga O'tkazish

**Sana:** 2026-08-24  
**Loyiha:** boshqar.uz — Universal Biznes Boshqaruv Tizimi  
**Maqsad:** Loyihani tijoriy (SaaS) foydalanishga to'liq shay holatga keltirish uchun qolgan barcha 5 ta funksional va texnik talablarni chuqur tahlil qilish, arxitekturasini belgilash va amalga oshirish.

---

## 1. Maqsad va qamrov (Purpose & Scope)

Ushbu Texnik Topshiriq boshqar.uz tizimining quyidagi 5 ta yo'nalishi bo'yicha to'liq ishlarni qamrab oladi:
1. **Avtomatik Bulutli Zaxiralash (Auto-Backup & Disaster Recovery):** Ma'lumotlar bazasini har kuni tunda avtomatik `pg_dump` qilib, Telegram admin kanaliga hamda S3 bulutli xotirasiga yuborish.
2. **Kassada Global Shtrix-kod Auto-focus:** USB/Bluetooth skanerlardan o'qilganda kursor qayerda bo mezonli bo'lishidan qat'i nazar tovar shakllanib savatga tushishi.
3. **Cheklarni To'g'ridan-to'g'ri Chop Etish (Direct Thermal Print):** 58mm va 80mm termal printerlarga brauzer muloqot oynasisiz (ESC/POS Direct RAW) tezon chop etish.
4. **Backend Katta Servislarini Refaktor Qilish:** `ai.service.ts` va `products.service.ts` fayllarini Single Responsibility (SRP) tamoyiliga ko'ra modullarga bo'lish.
5. **Mahsulot Analitikasi va Event Tracking (PostHog):** Foydalanuvchilar harakatini va funksiyalardan foydalanish chastotasini kuzatish.

---

## 2. Foydalanuvchi Rollari (User Roles)

| Rol nomi | Ko'rish / Bajarish huquqi | Cheklovlar |
|---|---|---|
| **SuperAdmin / DevOps** | Backup loglarini ko'rish, qo'lda zaxira olish, PostHog metrikalarini kuzatish | Cheklovsiz |
| **Owner / Boshliq** | Kassir printer va shtrix-kod skaneri sozlamalarini belgilash | Zaxira fayllarini o'chirish |
| **Cashier / Kassir** | Shtrix-kod skanerini ishlatish, 1 soniyada to'g'ridan-to'g'ri chek chiqarish | Tizim sozlamalari |

---

## 3. Ma'lumotlar Bazasi Sxemasi (DB Schema)

```sql
-- 1. Zaxira Jurnallari Jadvali (Automated Backup Logs)
CREATE TABLE "system_backup_logs" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "backup_name" VARCHAR(255) NOT NULL,
    "size_bytes" BIGINT NOT NULL,
    "storage_provider" VARCHAR(50) NOT NULL, -- 'telegram', 's3', 'local'
    "checksum_sha256" VARCHAR(128) NOT NULL,
    "status" VARCHAR(30) NOT NULL, -- 'SUCCESS', 'FAILED'
    "error_message" TEXT,
    "completed_at" TIMESTAMP DEFAULT NOW()
);

-- 2. Printer va Kassa Qurilmalari Sozlamalari Jadvali
CREATE TABLE "pos_device_settings" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "business_id" UUID NOT NULL REFERENCES "businesses"("id") ON DELETE CASCADE,
    "branch_id" UUID NOT NULL REFERENCES "branches"("id") ON DELETE CASCADE,
    "printer_type" VARCHAR(30) DEFAULT 'thermal_80mm', -- 'thermal_58mm', 'thermal_80mm', 'standard_a4'
    "print_mode" VARCHAR(30) DEFAULT 'direct_raw', -- 'direct_raw', 'browser_dialog'
    "auto_print_on_checkout" BOOLEAN DEFAULT true,
    "barcode_scanner_prefix" VARCHAR(10) DEFAULT '',
    "created_at" TIMESTAMP DEFAULT NOW(),
    "updated_at" TIMESTAMP DEFAULT NOW()
);
```

---

## 4. API Jadvali (API Table)

| Method | Path | Auth | Request Body | Response | Xatoliklar |
|---|---|---|---|---|---|
| `POST` | `/api/v1/backup/trigger` | SuperAdmin JWT | `{ provider: 'telegram' \| 's3' }` | `{ success: true, backupName, sizeBytes }` | 500 (Backup error) |
| `GET` | `/api/v1/backup/logs` | SuperAdmin JWT | Query: `limit=20` | `[ { id, backupName, sizeBytes, status } ]` | 403 (Forbidden) |
| `GET` | `/api/v1/pos/device-settings` | Bearer JWT | Query: `branchId` | `{ printerType, printMode, autoPrintOnCheckout }` | 401 (Unauthenticated) |
| `PUT` | `/api/v1/pos/device-settings` | Bearer JWT | DeviceSettings DTO | `{ success: true, updated: true }` | 400 (Validation) |

---

## 5. Ekranlar Ro'yxati (Screens List)

- **POS Kassa Ekrani (POSView.vue):** Global Barcode Keyboard Listener hamda Direct ESC/POS Print tugmalari.
- **Printer va Skaner Sozlamalari (SettingsPrinterTab.vue):** Printer modelini, 58mm/80mm kengligini va to'g'ridan-to'g'ri chop etish rejimini sozlash.
- **SuperAdmin Zaxira Loglari (SuperAdminBackupTab.vue):** Tizim zaxiralarini ko'rish va tugmani bosib darhol zaxiralash.

---

## 6. Qabul Qilish Mezonlari (Acceptance Criteria)

- [ ] **AC-1 (Auto-Backup):** Har kuni soat 03:00 da avtomatik database zaxira fayli yaratilishi va Telegram bot hamda DB logiga yozilishi kerak.
- [ ] **AC-2 (Barcode Auto-Focus):** Kassir qidiruv maydonida bo'lmasa ham, skaner tugmasini bossa, 50ms ichida tovar topilib savatga tushishi kerak.
- [ ] **AC-3 (Direct Print):** Chek chop etish tugmasi bosilganda brauzer dialogisiz termal printegga ma'lumot uzatilishi kerak.
- [ ] **AC-4 (SRP Refactoring):** `ai.service.ts` va `products.service.ts` fayllari 400 qatordan oshmagan sub-servislarga ajratilishi kerak.

---

## 7. Chetga Chiqish Holatlari (Edge Cases)

- **Skaner sekin o'qiganda:** Inson klaviaturadan sekin terishi va skaner tezkor kiritishini ajratuvchi timer (threshold < 50ms per char) o'rnatiladi.
- **Printer qog'ozi tugaganda:** WebUSB/WebSerial ulanishi xato bersa, tizim avtomatik standart brauzer chop etish rejimiga o'tadi (`fallback`).

---

## 8. Taxminlar va Ochiq Savollar (Assumptions & Open Questions)

- `[ASSUMPTION]` S3 zaxirasi uchun AWS S3 yoki Cloudflare R2 / Telegram Bot API kalitlari `.env` orqali taqdim etiladi.
