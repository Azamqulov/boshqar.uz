# 🎯 TEXNIK TOPSHIRIQ (TZ): CAFE VA CHAKANA DO'KONLAR UCHUN MUKAMMAL BOSHQARUV TIZIMI
**Loyiha:** boshqar.uz (Fokus: Kafe/Fast-Food va Do'konlar)  
**Holat:** Ishlab chiqishga tayyor (Ready for Dev Pipeline)  
**Sana:** 26 Avgust 2026  
**Muallif:** AI Dev Architect & Product Strategist  

---

## 1. Maqsad va Qamrov (Purpose & Scope)

Ushbu texnik topshiriq **boshqar.uz** platformasini faqat 2 ta eng daromadli va ommabop vertikalga — **1) Kafe, Fast-Food, Kofexona** va **2) Oziq-ovqat va Kiyim-kechak Do'konlari (Chakana savdo)** ga 100% moslashtirish, ulardagi barcha amaliy to'siqlarni (friction) olib tashlash va O'zbekiston bozorida Billz, Jowi, Poster kabi tizimlardan ustun bo'lgan tayyor mahsulotga aylantirishni maqsad qiladi.

### Asosiy qamrov:
1. **Kafe/Fast-Food:** Stollar va zonalar, ofitsiant rejimi, modifikatorlar (shakarli/sousli), retseptura bo'yicha ingredientlarni ombordan hisobdan chiqarish (kalkulyatsiya), KDS oshxona ekrani, xizmat haqi va hisobni bo'lish (Split bill).
2. **Do'konlar (Retail):** Tezkor shtrix-kod skaneri, narx yorlig'i (cennik) chop etish, tarozili tovarlar (kg/kasr), mijozlar nasiya (qarz) daftari + Telegram eslatmasi, 1-klikda faktura (prikhod) qabuli va 100% oflayn kassa chidamliligi.

---

## 2. Foydalanuvchi Rollari (User Roles)

| Rol nomi | Ko'ra oladi / Bajaradi | Ruxsat etilmagan (Cheklovlar) |
|---|---|---|
| 👑 **Biznes Egasi (Admin)** | Barcha moliyaviy hisobotlar, sof foyda, xodimlar maoshi, tannarx, narxlarni o'zgartirish, barcha filiallar. | Cheklov yo'q. |
| 🧑‍💼 **Menejer / Bosh Kassir** | Ombor kirimi (prikhod), tovar qo'shish, inventarizatsiya, smena hisoboti, nasiya qabul qilish. | Xodimlarni o'chirish, biznes sozlamalarini o'zgartirish. |
| ⚡ **Kassir (Do'kon / Fast-food)** | POS kassada sotuv qilish, chek chiqarish, qaytarish (refund), mijoz tanlash, o'z smenasini ochish/yopish. | Mahsulot tannarxini ko'rish, qoldiqni qo'lda to'g'irlash, umumiy foydani ko'rish. |
| 🍽️ **Ofitsiant (Kafe/Restoran)** | O'ziga biriktirilgan stollarni ko'rish, yangi buyurtma olish, oshxonaga jo'natish, hisob chiqarish (pre-check). | Chekni bekor qilish (faqat adminga), chegirma berish, qarzga yozish. |
| 👨‍🍳 **Oshpaz / Barista (KDS)** | Oshxona ekrani (KDS) da tushgan buyurtmalarni ko'rish, "Tayyorlanmoqda" va "Tayyor" statusiga o'tkazish. | Narxlar, to'lovlar va boshqa bo'limlar. |

---

## 3. Ma'lumotlar Bazasi Sxemasi (DB Schema)

```sql
-- 1. Restoran & Kafe Zonalari va Stollari
CREATE TABLE restaurant_zones (
    id VARCHAR(36) PRIMARY KEY,
    business_id VARCHAR(36) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- 'Asosiy zal', 'Terassa', 'VIP xona'
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE restaurant_tables (
    id VARCHAR(36) PRIMARY KEY,
    business_id VARCHAR(36) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    zone_id VARCHAR(36) REFERENCES restaurant_zones(id) ON DELETE SET NULL,
    table_number VARCHAR(50) NOT NULL, -- 'Stol #1', 'VIP-2'
    seats INT DEFAULT 4,
    status VARCHAR(20) DEFAULT 'available', -- 'available', 'occupied', 'bill_printed', 'reserved'
    assigned_waiter_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    current_order_id VARCHAR(36) REFERENCES orders(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Modifikatorlar va Retseptura (Kalkulyatsiya kartasi)
CREATE TABLE product_modifier_groups (
    id VARCHAR(36) PRIMARY KEY,
    business_id VARCHAR(36) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- 'Shakar miqdori', 'Sous turi', 'Hajmi'
    is_required BOOLEAN DEFAULT FALSE,
    min_selection INT DEFAULT 0,
    max_selection INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE product_modifiers (
    id VARCHAR(36) PRIMARY KEY,
    group_id VARCHAR(36) NOT NULL REFERENCES product_modifier_groups(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- 'Shakarsiz', 'Pishloqli (+3,000 UZS)'
    price_delta DECIMAL(12, 2) DEFAULT 0.00,
    sort_order INT DEFAULT 0
);

CREATE TABLE product_recipes (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    ingredient_product_id VARCHAR(36) NOT NULL REFERENCES products(id) ON DELETE RESTRICT, -- Xom ashyo tovari
    quantity DECIMAL(10, 4) NOT NULL, -- 0.250 kg go'sht, 0.050 l sut
    unit VARCHAR(20) DEFAULT 'kg',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Nasiya va Qarz Tranzaksiyalari (Customer Debt Ledger)
CREATE TABLE customer_debt_logs (
    id VARCHAR(36) PRIMARY KEY,
    business_id VARCHAR(36) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    customer_id VARCHAR(36) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    order_id VARCHAR(36) REFERENCES orders(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL, -- 'debt_given' (qarz berildi), 'debt_paid' (qarz to'landi)
    amount DECIMAL(14, 2) NOT NULL,
    balance_after DECIMAL(14, 2) NOT NULL,
    due_date DATE,
    notes TEXT,
    created_by_user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Narx Yorliqlari Shablonlari (Barcode Label Config)
CREATE TABLE barcode_label_templates (
    id VARCHAR(36) PRIMARY KEY,
    business_id VARCHAR(36) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- '40x25mm Termo', '58x40mm Supermarket'
    width_mm INT DEFAULT 40,
    height_mm INT DEFAULT 25,
    show_price BOOLEAN DEFAULT TRUE,
    show_barcode BOOLEAN DEFAULT TRUE,
    show_store_name BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 4. API Jadvali (API Table)

| Metod | Yo'l (Path) | Auth? | Request Body | Response | Xato holatlari |
|---|---|---|---|---|---|
| `GET` | `/api/v1/restaurant/zones` | Ha | - | `Zone[]` + ichidagi stollar | 401 Unauthorized |
| `POST` | `/api/v1/restaurant/tables` | Ha (`admin/manager`) | `{ zoneId, tableNumber, seats }` | `Table` | 400 Bad Request (Dublikat stol) |
| `PATCH` | `/api/v1/restaurant/tables/:id/status` | Ha | `{ status, waiterId? }` | `Table` | 404 Topilmadi |
| `POST` | `/api/v1/restaurant/orders/split` | Ha | `{ orderId, splitItems: [{ itemId, quantity }] }` | `{ originalOrder, newOrder }` | 400 Miqdor xato |
| `POST` | `/api/v1/products/:id/recipe` | Ha (`admin`) | `{ ingredients: [{ ingredientId, quantity, unit }] }` | `Recipe[]` | 404 Mahsulot yo'q |
| `GET` | `/api/v1/kds/orders` | Ha (`kitchen/admin`) | `?status=pending,cooking` | `KdsOrder[]` | 401 Unauthorized |
| `POST` | `/api/v1/kds/orders/:id/status` | Ha | `{ status: 'cooking' \| 'ready' \| 'served' }` | `KdsOrder` | 404 Topilmadi |
| `POST` | `/api/v1/customers/:id/debt-payment` | Ha | `{ amount, paymentMethod: 'cash'\|'card', notes? }` | `DebtLog` | 400 To'lov summasi noto'g'ri |
| `POST` | `/api/v1/customers/send-debt-reminder` | Ha | `{ customerId }` | `{ success: true, messageId }` | 400 Telefon/Telegram yo'q |
| `POST` | `/api/v1/inventory/print-labels` | Ha | `{ productIds: string[], templateId?: string }` | `{ pdfBase64 \| escPosCommands }` | 400 Tovar tanlanmagan |

---

## 5. Ekranlar Ro'yxati (Screens List)

1. 🍽️ **Kafe Stol Xaritasi (Table Layout View):** Zallar bo'yicha stollar to'ri (grid/canvas), stolda o'tirgan vaqt, hisob summasi va ofitsiant ismi ko'rsatiladi.
2. 📱 **Ofitsiant Mobil Ekrani (Waiter Quick Screen):** Mobil telefonga moslashgan, stol tanlab tezkor taom va ichimliklarni modifikatorlari bilan qo'shish ekrani.
3. 👨‍🍳 **KDS Oshxona Ekrani (Kitchen Display Screen):** Katta ekran yoki planshet uchun, buyurtma kelgan vaqt taymer bilan (yashil -> sariq -> qizil kechikish) ko'rinadi.
4. 🏷️ **Shtrix-kod va Narx Yorlig'i Chop Ekrani (Barcode Printer Studio):** Tovarlar ro'yxatidan tanlab, 40x25mm yoki 58x40mm o'lchamda printerga to'g'ridan-to'g'ri chiqarish.
5. 💳 **Nasiya va Qarz Daftari (Customer Debt Ledger Modal):** Mijozning qarz tarixi, to'lovlar grafigi va Telegram orqali 1-klikda SMS/Telegram eslatma yuborish.
6. ⚡ **Tezkor Chakana Kassa (Retail Fast POS View):** Skaner bilan to'xtovsiz ishlash, F1-F12 tezkor tugmalar, tarozidan avtomatik og'irlik olish.

---

## 6. Qabul Qilish Mezonlari (Acceptance Criteria)

### Kafe & Fast-Food bo'yicha:
- [ ] Stolda buyurtma yopilmaguncha uning holati `occupied` (band) bo'lib turishi va boshqa ofitsiant adashib yangi chek ocholmasligi kerak.
- [ ] Taom sotilganda retseptura kartasidagi ingredientlar (masalan: 1 ta Lavash = 1 dona non + 0.150kg go'sht + 0.030kg sous) ombor zaxirasidan avtomatik chegirilishi shart.
- [ ] "Olib ketish" (Takeaway) da xizmat haqi 0 UZS, "Stolda o'tirish" (Dine-in) da esa belgilangan 10-15% xizmat haqi avtomatik qo'shilishi kerak.
- [ ] Oshxonadagi KDS ekranida taom "Tayyor" deb bosilganda ofitsiant ekraniga/telefoniga darhol ovozli bildirishnoma borishi kerak.

### Do'konlar (Retail) bo'yicha:
- [ ] Skaner bilan shtrix-kod o'qitilganda savatga tovar qo'shilish tezligi 50ms dan oshmasligi kerak.
- [ ] Nasiyaga savdo qilinganda mijozning umumiy qarzi avtomatik ko'payishi va chekda "Nasiya qoldig'i: XXX so'm" ko'rsatilishi kerak.
- [ ] Internet uzilganda (Oflayn) kassa to'xtab qolmasdan chek chiqarishi, internet kelishi bilan serverga bazaga sinxron bo'lishi kerak.
- [ ] 1-klikda Excel fayldan 1,000 ta mahsulot va narxlarni xatosiz import qilish imkoniyati bo'lishi kerak.

---

## 7. Chetga Chiqish Holatlari (Edge Cases)

1. **Omborda ingredient tugab qolsa:** Retseptura bo'yicha ingredient yetishmasa, taom sotuviga ruxsat beriladi, lekin admin panelda minus qoldiq va qizil ogohlantirish ko'rsatiladi.
2. **Bir vaqtda bir stolga buyurtma urish:** Ikkita ofitsiant bir vaqtda bitta stolga taom qo'shsa, tranzaksiya lock orqali buyurtmalar birlashtiriladi (overwrite bo'lmaydi).
3. **Nasiya limiti oshib ketishi:** Agar mijozga belgilangan maksimal qarz limiti (masalan 1,000,000 UZS) oshsa, kassirga ogohlantirish chiqadi va faqat menejer paroli bilan ruxsat beriladi.
4. **Tarozidan noto'g'ri vazn kelishi:** Skaner 0.000 yoki manfiy vazn o'qisa, forma bloklanadi va qo'lda to'g'rilash so'raladi.

---

## 8. Taxminlar va Ochiq Savollar (Assumptions & Open Questions)

- `[ASSUMPTION]` Kafe va do'konlar uchun ESC/POS termal printerlar 58mm va 80mm formatda USB/LAN orqali ulanadi.
- `[ASSUMPTION]` Nasiya eslatmalari mijozning Telegram profiliga `@Boshqar_uzbot` orqali yoki Eskiz.uz SMS shlyuzi orqali yuboriladi.
- `[ASSUMPTION]` Qolgan barcha sohalar (dorixona, mehmonxona, avtoservis) asosiy menyudan yashiriladi va tizim faqat shu 2 yo'nalishga optimallashadi.

---
*Ushbu TZ `ai-development-team-protocol` (Dev → QA → Team-Lead → Senior-QA) bo'yicha amalga oshirishga to'liq tayyor.*
