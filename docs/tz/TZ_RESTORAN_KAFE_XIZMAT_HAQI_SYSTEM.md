# 📄 TEXNIK TOPSHIRIQ (TZ): Restoran va Kafe uchun Dynamic Xizmat Haqi (Service Charge %) Tizimi

> [!IMPORTANT]
> **Tizim Maqsadi:** Restoran va Kafe (Cafe) biznes turlarida joyida tanovul qilish (Dine-in / Stolda xizmat ko'rsatish) buyurtmalari uchun avtomatik va moslashuvchan Xizmat Haqi (masalan: 5%, 7%, 10%, 15%) hisoblash, sozlamalarda belgilash hamda kassa cheki va hisobotlarda aniq ko'rsatish.  
> **Alohida Qoida:** Olib ketish (Takeaway / С собой) hamda yetkazib berish (Delivery) buyurtmalariga xizmat haqi QO'SHILMAYDI (`serviceFee = 0`).  
> **Sana:** 25-Avgust, 2026-yil  
> **Ishlab Chiquvchi:** Antigravity AI Dev Team & Boshqar.uz Core Team  

---

## 1. 🎯 Maqsad va Qamrov (Purpose & Scope)

Restoran va kafe tarmoqlarida ofitsiant va muassasa xizmat ko'rsatish xarajatlarini avtomatik hisoblash uchun mo'ljallangan. Tizim quyidagilarni o'z ichiga oladi:
- Sozlamalarda (`Settings` -> POS & Business Settings) Xizmat haqi foizini belgilash (`serviceFeePercent`, masalan `10%`).
- Xizmat haqini faqat `BusinessType === 'restaurant' || 'cafe'` va buyurtma turi `Dine-in` (Stolda) bo'lgandagina qo'shish.
- Olib ketish (`Takeaway` / `С собой`) buyurtmalarida xizmat haqini **0%** qilib hisoblash.
- POS Kassa savatida, KDS oshxona ekranida, 58mm POS chekida va Moliya hisobotida Xizmat haqini alohida qator sifatida chiqarish.

---

## 2. 👥 Foydalanuvchi Rollari va Ruxsatlar Matrixi

| Rol Nomi | Xizmat Haqini Sozlash (%) | POS Kassada Ko'rish | Olib Ketishda Bekor Qilish |
|---|---|---|---|
| **Owner / Admin** | ✅ Ha (0% - 30% oralig'ida) | ✅ Ha | ✅ Avtomatik (Takeaway=0%) |
| **Menejer** | ❌ Yo'q (Faqat ko'rish) | ✅ Ha | ✅ Avtomatik |
| **Kassir / Ofitsiant** | ❌ Yo'q | ✅ Ha (Chekda va Savatda) | ✅ Avtomatik |

---

## 3. 🗄️ Ma'lumotlar Bazasi Sxemasi (DB Schema & Settings)

```sql
-- 1. Business / POS Settings Table Update
ALTER TABLE "pos_settings" 
ADD COLUMN "enable_service_fee" BOOLEAN DEFAULT TRUE,
ADD COLUMN "service_fee_percent" DECIMAL(5, 2) DEFAULT 10.00, -- e.g. 10.00%
ADD COLUMN "apply_service_fee_on_takeaway" BOOLEAN DEFAULT FALSE; -- Always FALSE by default

-- 2. Sales / Orders Table Update
ALTER TABLE "sales" 
ADD COLUMN "order_service_type" VARCHAR(20) DEFAULT 'dine_in', -- 'dine_in', 'takeaway', 'delivery'
ADD COLUMN "service_fee_percent" DECIMAL(5, 2) DEFAULT 0.00,
ADD COLUMN "service_fee_amount" DECIMAL(12, 2) DEFAULT 0.00;
```

---

## 4. 🔌 API Endpointlar Jadvali

| Method | Path | Auth? | Request Body | Response | Error Cases |
|---|---|---|---|---|---|
| `GET` | `/api/v1/settings/pos` | Yes | None | `{ enableServiceFee, serviceFeePercent }` | 401 Unauthorized |
| `PATCH` | `/api/v1/settings/pos` | Yes (Admin) | `{ enableServiceFee: true, serviceFeePercent: 10 }` | `{ success: true }` | 403 Forbidden |
| `POST` | `/api/v1/sales` | Yes | `{ items: [...], orderServiceType: "dine_in" }` | `{ subtotal, serviceFeeAmount, grandTotal }` | 400 Bad Payload |

---

## 5. 📱 Ekranlar va Interfeyslar Ro'yxati

1. **Sozlamalar (POS / Restoran Tab):** Admin xizmat haqi foizini kiritadigan (masalan: `10%`) va yoqib-o'chiradigan maxsus kartochka.
2. **POS Kassa Savati (Cart Summary):**
   - Mahsulotlar jami: `100,000 UZS`
   - Xizmat haqi (10% - Stolda): `10,000 UZS`
   - Jami to'lov: `110,000 UZS`
   - *Olib ketish (`С собой`) tanlanganda:* Xizmat haqi: `0 UZS` (Avtomatik 0%).
3. **58mm POS Chek Printer Modali:** Chekda mahsulotlardan so'ng "Xizmat haqi (10%): 10,000 UZS" deb alohida qatorda bosib chiqarish.

---

## 6. ✅ Qabul Qilish Mezonlari (Acceptance Criteria)

- [ ] **Admin Sozlamasi:** Admin sozlamalardan xizmat haqini `7%` qilib o'zgartirsa, keyingi kassa tranzaksiyalarida darhol `7%` hisoblanishi kerak.
- [ ] **Restoran Stolda (Dine-in):** Buyurtma `Stolda` deb tanlanganda Xizmat haqi foizi avtomatik qo'shilishi kerak.
- [ ] **Olib Ketish (Takeaway / С собой):** Buyurtma turi `С собой` bo'lganda Xizmat haqi `0 UZS` bo'lishi va chekda ham `0` ko'rinishi kerak.
- [ ] **Chek Chiqarish:** Kassa chekida va printerda Xizmat haqi alohida ravshan shrift bilan ko'rinishi shart.

---

## 7. ⚠️ Chetga Chiqish Holatlari (Edge Cases)

1. **Biznes turi 'shop' (do'kon) yoki 'barbershop' bo'lsa:** Xizmat haqi sozlamalarda ko'rinmaydi va avtomatik ravishda `0%` bo'ladi.
2. **Chegirma (Discount) qo'llanganda:** Xizmat haqi chegirmadan oldingi subtotalga yoki chegirmadan keyingi sof summaga qo'shilishi sozlamada ko'rsatiladi.

---
*Ushbu Texnik Topshiriq (TZ) Boshqar.uz platformasining AI Development Team Protocol standarti bo'yicha tayyorlandi.*
