# 🏛️ TEXNIK TOPSHIRIQ (TZ): Restoran Stollarini Zonalar Bo'yicha Ajratish va Xodimlarga (Ofitsiantlarga) Biriktirish Tizimi

> [!IMPORTANT]
> **Tizim Maqsadi:** Restoran va kafe biznes turlarida stollarni zonalar bo'yicha guruhlash (masalan: *Zal, 2-qavat, VIP zonalar, Yozgi veranda*) hamda har bir ofitsiantga faqat unga ajratilgan zonalar/stollarni ko'rsatish va xizmat ko'rsatish imkonini berish.  
> **Sana:** 25-Avgust, 2026-yil  
> **Ishlab Chiquvchi:** Antigravity AI Dev Team & Boshqar.uz Core Team  

---

## 1. 🎯 Maqsad va Qamrov (Purpose & Scope)

Katta kafe va restoranlarda stollar tartibini ta'minlash va ofitsiantlar o'rtasida mas'uliyatni aniq bo'lish uchun mo'ljallangan. Tizim quyidagilarni o'z ichiga oladi:
- **Zonalar (Table Zones):** Stollar uchun zonalar yaratish (Zal, 2-qavat, VIP, Terasa, Kabinet).
- **Stolga Zona biriktirish:** Har bir stolni yaratishda yoki tahrirlashda muayyan zonaga tegishli deb belgilash (`zoneName`).
- **Ofitsiantga Stollarni / Zonalarni Biriktirish (Waitress Table Assignment):** Xodimlar tahrirlash oynasida ofitsiantga muayyan stollar yoki zonalar ruxsatini berish (`assignedTableIds`, `assignedZones`).
- **POS Kassa va Stollar Xaritasida Filtr:** Ofitsiant kirganda faqat unga biriktirilgan stollarni ko'rishi hamda zallarni tablar shaklida tezkor filtrlashi.

---

## 2. 👥 Foydalanuvchi Rollari va Ruxsatlar Matrixi

| Rol Nomi | Zonalarni Yaratish | Stollarni Xodimlarga Biriktirish | Qaysi Stollarni Ko'radi? |
|---|---|---|---|
| **Owner / Admin** | ✅ Ha | ✅ Ha | 🌐 Barcha zallar va barcha stollar |
| **Menejer** | ✅ Ha | ✅ Ha | 🌐 Barcha zallar va barcha stollar |
| **Ofitsiant / Kassir** | ❌ Yo'q | ❌ Yo'q | 🎯 **Faqat o'ziga biriktirilgan stollar (Masalan: Faqat VIP)** |

---

## 3. 🗄️ Ma'lumotlar Bazasi Sxemasi (DB Schema)

```sql
-- 1. Table Zones Table
CREATE TABLE "restaurant_zones" (
  "id" VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  "business_id" VARCHAR(36) NOT NULL REFERENCES "businesses"("id") ON DELETE CASCADE,
  "name" VARCHAR(100) NOT NULL, -- e.g. "Asosiy Zal", "2-qavat", "VIP Zonalar", "Terrasa"
  "color" VARCHAR(30) DEFAULT '#10b981',
  "sort_order" INT DEFAULT 0,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Update Tables Schema (Add Zone & Capacity)
ALTER TABLE "tables" 
ADD COLUMN "zone_id" VARCHAR(36) REFERENCES "restaurant_zones"("id") ON DELETE SET NULL,
ADD COLUMN "zone_name" VARCHAR(100) DEFAULT 'Asosiy Zal',
ADD COLUMN "capacity" INT DEFAULT 4;

-- 3. Employee Table Assignment Table (Ofitsiantga stol biriktirish)
CREATE TABLE "employee_table_assignments" (
  "id" VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  "employee_id" VARCHAR(36) NOT NULL REFERENCES "employees"("id") ON DELETE CASCADE,
  "table_id" VARCHAR(36) REFERENCES "tables"("id") ON DELETE CASCADE,
  "zone_id" VARCHAR(36) REFERENCES "restaurant_zones"("id") ON DELETE CASCADE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. 🔌 API Endpointlar Jadvali

| Method | Path | Auth? | Request Body | Response | Error Cases |
|---|---|---|---|---|---|
| `GET` | `/api/v1/restaurant/zones` | Yes | None | `[{ id, name, color }]` | 401 Unauthorized |
| `POST` | `/api/v1/restaurant/zones` | Yes (Admin) | `{ name: "VIP Zonalar", color: "#8b5cf6" }` | `{ zoneId, name }` | 400 Duplicate Name |
| `PATCH` | `/api/v1/employees/:id/tables` | Yes (Admin) | `{ tableIds: ["t1", "t2"], zoneIds: ["z1"] }` | `{ success: true }` | 404 Employee Not Found |

---

## 5. 📱 Ekranlar va Interfeyslar Ro'yxati

1. **Restoran Stollar Xaritasi (`/restaurant/tables`):** Zonalarga ajratilgan Visual Tab bar (*Barchasi, Asosiy Zal, 2-Qavat, VIP Zonalar*).
2. **Xodimlar Sozlamasi (`/settings -> Xodimlar`):** Ofitsiant qo'shayotganda/tahrirlayotganda "Biriktirilgan Stollar va Zonalar" checkbox modal bloki.
3. **Kassa Stollar Modali:** Ofitsiant kirganda "Mening Stollarm" maxsus filtri bilan faqat unga tegishli stollarning ko'rinishi.

---

## 6. ✅ Qabul Qilish Mezonlari (Acceptance Criteria)

- [ ] **Admin Sozlamalari:** Admin yangi "VIP Zonasi"ni yaratib, 5- va 6-stollarni VIP ga o'tkaza olishi kerak.
- [ ] **Ofitsiant Ruxsati:** Admin "Eshmat" ismli ofitsiantga faqat VIP zonani biriktirsa, Eshmat kirganda faqat VIP stollar ko'rinishi va boshqa stollar qulflanishi kerak.
- [ ] **Zonalar bo'yicha filtr:** Stollar xaritasida "2-qavat" tab bosilganda faqat 2-qavat stollari ko'rinishi shart.

---

## 7. ⚠️ Chetga Chiqish Holatlari (Edge Cases)

1. **Ofitsiantga hech qaysi stol biriktirilmagan bo'lsa:** Odatiy ravishda barcha bo'sh stollar ochiq bo'ladi yoki "Sizga hali stol biriktirilmagan" deb ogohlantiradi.
2. **Admin/Owner kurganda:** Har doim barcha zonalar va stollar to'liq va cheklovlarsiz ko'rinadi.

---
*Ushbu Texnik Topshiriq (TZ) Boshqar.uz platformasining AI Development Team Protocol standarti bo mezonida tayyorlandi.*
