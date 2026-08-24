# 📜 CHUQUR TEXNIK TOPSHIRIQ (TZ): `@Boshqar_uzbot` Telegram Botini 100% Interaktiv va Real-Vaqt Rejimiga O'tkazish

**Sana:** 2026-08-24  
**Loyiha:** boshqar.uz — Telegram Bot Ekotizimi (`ubms-telegram-bot` & `TelegramPollingService`)  
**Maqsad:** `@Boshqar_uzbot` Telegram botidagi barcha 6 ta asosiy menyu tugmalari (`Nasiya & Qarzlar`, `Xarajat Kiritish`, `Tovar Qidiruv`, `Kassa & Xodimlar`, `Sozlamalar`, `Kunlik Hisobot`) bosilganda ma'lumotlar bazasidan (PostgreSQL Prisma) real ma'lumotlarni tortib, interaktiv inline tugmalar bilan javob berishini ta'minlash.

---

## 1. Maqsad va Qamrov (Purpose & Scope)

Telegram Bot foydalanuvchilar (biznes egalari va kassirlar) uchun veb-panelga kirmasdan turib Telegram ichidan to'liq biznes boshqaruv vositasiga aylantiriladi:
1. **Nasiya & Qarzlar (`/nasiya`):** Qarzdor mijozlar ro'yxati, umumiy qarz summasi hamda Telegram orqali 1-click eslatma yuborish.
2. **Xarajat Kiritish (`/xarajat`):** Telegram orqali summani yozish bilan bazaga real xarajat (`Expense`) kiritish.
3. **Tovar Qidiruv & Ombor (`/narx`):** Mahsulot nomi yoki shtrix-kodi bo'yicha narx va ombor qoldig'ini izlash (Inline Query `@Boshqar_uzbot` ham qo'llab-quvvatlanadi).
4. **Kassa & Xodimlar (`/kassa`):** Ochiq smena holati, kassir ismi, g'aznadagi naqd va karta balansini ko'rish hamda smena yopish.
5. **Sozlamalar (`/sozlamalar`):** Ulingan biznes rekvizitlari, bildirishnoma sozlamalari va 1-click WebApp havolasi.
6. **Kunlik Hisobot (`/hisobot`):** Bugungi haqiqiy savdolar, tushum, xarajatlar va sof foyda hisobi.

---

## 2. Foydalanuvchi Rollari va Interaktiv Muloqot

| Tugma / Buyruq | Mantiqiy Amal | Real DB So'rovi |
|---|---|---|
| `💳 Nasiya & Qarzlar` | Qarzdorlar ro'yxati + SMS/Telegram eslatma yuborish | `prisma.customer.findMany({ where: { debt: { gt: 0 } } })` |
| `💸 Xarajat Kiritish` | Kategoriya tanlash -> Summa va izoh kiritish | `prisma.expense.create()` |
| `🔍 Tovar Qidiruv` | Nomi yoki shtrix-kodi bo'yicha ombor qoldig'ini ko'rish | `prisma.product.findMany({ where: { OR: [name, barcode, sku] } })` |
| `🏪 Kassa & Xodimlar` | Ochiq smena, kassada mavjud pul va smena holati | `prisma.posShift.findFirst({ where: { status: 'open' } })` |
| `⚙️ Sozlamalar` | Bildirishnomalarni yoqish/o'chirish, akkauntni uzish | `prisma.business.update()` |
| `📊 Kunlik Hisobot` | Bugungi tushum, naqd/karta taqsimoti, xarajat va foyda | `prisma.order.aggregate()` & `prisma.expense.aggregate()` |

---

## 3. API va Telegram Message Routing

```typescript
// Telegram Message Routing Rules
switch (commandOrButton) {
  case '💳 Nasiya & Qarzlar': return handleDebts(ctx);
  case '💸 Xarajat Kiritish': return handleExpensePrompt(ctx);
  case '🔍 Tovar Qidiruv': return handleSearchPrompt(ctx);
  case '🏪 Kassa & Xodimlar': return handleShiftStatus(ctx);
  case '⚙️ Sozlamalar': return handleSettingsMenu(ctx);
  case '📊 Kunlik Hisobot': return handleDailyReport(ctx);
}
```

---

## 4. Qabul Qilish Mezonlari (Acceptance Criteria)

- [ ] **AC-1 (Nasiya & Qarzlar):** Tugma bosilganda bazadagi haqiqiy qarzdor mijozlar ismi va summasi ko'rinishi hamda inline tugma orqali eslatma yuborilishi kerak.
- [ ] **AC-2 (Xarajat Kiritish):** Foydalanuvchi `150000 tushlik` deb yozganda backend `Expense` jadvaliga yangi 150,000 so'mlik xarajat qo'shilishi kerak.
- [ ] **AC-3 (Kassa & Xodimlar):** Smena ochiq bo'lsa kassir ismi va tushum summasi ko'rinishi kerak.
- [ ] **AC-4 (Kunlik Hisobot):** Bugungi kun davomida kiritilgan real orderlar va xarajatlar avtomatik yig'ilib jami hisobot shakllanishi kerak.

---

## 5. Chetga Chiqish Holatlari (Edge Cases)

- **Akkaunt ulanmagan bo'lsa:** Foydalanuvchi Telegram akkaunti biznesga ulanmagan bo'lsa, bot avtomatik `1-Click ulanish havolasi` yoki telefon raqamini yuborish tugmasini chiqaradi.
- **Nasiya mavjud bo'lmaganda:** Qarzdor mijozlar bo'lmasa, "🎉 Hozirda qarzdor mijozlar mavjud emas" xabari ko'rsatiladi.
