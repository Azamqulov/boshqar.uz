# 📜 CHUQUR TEXNIK TOPSHIRIQ (TZ): `@Boshqar_uzbot` Telegram Botini Enterprise va Yuksaltirilgan Bosqichga O'tkazish

**Sana:** 2026-08-24  
**Loyiha:** boshqar.uz — Telegram Enterprise Bot Ekotizimi  
**Maqsad:** `@Boshqar_uzbot` Telegram botini jahon andozalaridagi Enterprise darajasiga ko'tarish: Telegram Mini-App (TMA) 1-click tugmasi, interaktiv Inline Keyboard tugmalari, AI Audio/Matn yordamchisi, vizual savdo grafik progress bar'lari hamda qarzdorlarga avtomatik Telegram/SMS eslatma yuborish mexanizmini yo'lga qo'yish.

---

## 1. Maqsad va Yuksaltirilgan Imkoniyatlar (Enterprise Features)

1. **📱 Telegram Mini-App (TMA) Integratsiyasi:**
   - Bot pastki menyusiga persistent WebApp tugmasi `📱 POS Kassa & Mini-App` joylashtiriladi. Telegram ichida 1ms da mobil kassa va ombor paneli ochiladi.
2. **🎛️ Interaktiv Inline Keyboards & Dynamic Callbacks:**
   - Har bir hisobot va ma'lumot ostida dynamic inline tugmalar (`🔄 Qayta yangilash`, `📩 Qarzdorga Eslatma Yuborish`, `📊 Grafik Hisobot`, `📥 Hisobotni Ulashish`).
3. **🤖 Boshqar AI Ovozli va Matnli Assistent (`/ai`):**
   - Telegram'ga ovozli xabar yoki matn yuborilganda, Boshqar AI ma'lumotlar bazasini tahlil qilib, ovozli/matnli javob va tavsiyalar beradi.
4. **📊 Vizual Grafik va Progress Bar'lar (HTML Formatting & ASCII Charts):**
   - Kunlik savdo rejasining bajarilishini grafik progress bar shaklida ko'rsatish: `[████████░░] 80% (1,450,000 / 1,800,000 so'm)`.
5. **📩 Nasiyador Mijozlarga 1-Click Eslatma Yuborish:**
   - Har bir qarzdor mijoz yonidagi `📩 Eslatma` tugmasi bosilganda mijozning Telegram'iga yoki SMS markaziga to'lov eslatmasi yuboriladi.

---

## 2. Telegram Bot Menyu va Tugmalar Arxitekturasi

```text
+-------------------------------------------------------------+
| 📱 POS Kassa & Mini-App (WebApp Launch)                      |
+------------------------------------+------------------------+
| 📊 Bugungi Savdo                    | 📈 Kunlik Hisobot      |
+------------------------------------+------------------------+
| 💳 Nasiya & Qarzlar                | 💸 Xarajat Kiritish    |
+------------------------------------+------------------------+
| 🔍 Tovar & Ombor Qoldig'i           | 🏪 Kassa & Xodimlar    |
+------------------------------------+------------------------+
| 🤖 Boshqar AI Yordamchi            | ⚙️ Sozlamalar & Profil |
+-------------------------------------------------------------+
```

---

## 3. Qabul Qilish Mezonlari (Acceptance Criteria)

- [ ] **AC-1 (Mini-App Launch):** Bot menyusidagi `📱 POS Kassa & Mini-App` tugmasi bosilganda Telegram ichida `https://boshqar.uz` veb-paneli oyna bo'lib ochilishi kerak.
- [ ] **AC-2 (Progress Bar & Inline Refresh):** Kunlik hisobot yuborilganda progress bar grafik shaklida ko'rinishi va `🔄 Yangilash` inline tugmasi bosilganda xabar joyida yangilanishi kerak.
- [ ] **AC-3 (Boshqar AI Assistent):** Foydalanuvchi `/ai bugungi eng ko'p sotilgan tovar qaysi?` deb yozganda AI javob qaytarishi kerak.
- [ ] **AC-4 (Interactive Debt Reminder):** Nasiyadorlar ro'yxatida mijoz tugmasi bosilganda eslatma xabari shakllanib yuborilishi kerak.

---

## 4. Chetga Chiqish Holatlari (Edge Cases)

- **Mini-App Internet yo'qligida:** Kesh va PWA servis-vorker orqali Mini-App offline rejimda ham ochilishi ta'minlanadi.
