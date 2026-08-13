# BOSHQAR.UZ (UBMS SaaS v2.0) — KEYINGI BOSQICH TZ

**Sana:** 2026-08-11
**Maqsad:** Mavjud tizimdagi kamchiliklarni tuzatish va yangi funksiyalarni qo'shish.
**Stack:** Vue 3 (Composition API) + Vite + TS + Tailwind + Pinia (frontend), NestJS + Prisma + PostgreSQL (backend).

---

## PHASE 1 — SuperAdmin: Owner Monitoring Paneli

**Muammo:** Hozirgi SuperAdmin faqat "biznes holati" filteri bilan cheklangan. Platformadagi barcha owner'larni (firma egalarini) markazlashgan nazorat qilish imkoniyati yo'q.

**Qaror:** Variant A — faqat statistika ko'rish (impersonate/login-as-owner hozircha KIRITILMAYDI, keyingi bosqichga qoldiriladi).

### Talablar

1. **Owner'lar ro'yxati sahifasi** (`/superadmin/owners`)
   - Jadval: Ism, Telefon, Biznes nomi, Biznes turi, Ro'yxatdan o'tgan sana, Tarif rejasi (Free/Pro/Business), Status (Faol/Bloklangan), Oxirgi faollik sanasi
   - Qidiruv (ism/telefon bo'yicha) va filter (tarif rejasi, status bo'yicha)
   - Pagination (20-50 tadan sahifalab)

2. **Owner detail sahifasi** (`/superadmin/owners/:id`)
   - Biznes profili ma'lumotlari
   - Statistika kartalari: jami savdo (umr bo'yi), oxirgi 30 kunlik savdo, xodimlar soni, tovarlar soni, GMV
   - Oxirgi 14 kunlik savdo grafigi (owner darajasida)
   - Amallar: Bloklash/Faollashtirish, Tarif rejasini o'zgartirish (dropdown: Free/Pro/Business)

3. **Backend**
   - Yangi NestJS endpoint'lar: `GET /superadmin/owners` (pagination+filter), `GET /superadmin/owners/:id/stats`, `PATCH /superadmin/owners/:id/status`, `PATCH /superadmin/owners/:id/plan`
   - Faqat SuperAdmin roli uchun guard (mavjud RBAC tizimidan foydalanish)
   - Har bir amal (bloklash, tarif o'zgartirish) audit jurnaliga yoziladi (kim, qachon, nima o'zgardi)

**Eslatma:** Impersonate/"owner sifatida kirish" funksiyasi keyingi alohida bosqichda, audit log va aniq huquq chegarasi bilan qo'shiladi — hozir kiritilmaydi.

---

## PHASE 2 — Dizayn tizimi: Design Tokens + Select komponenti

**Muammo:** Ranglar hardcoded holda turli komponentlarda qaytarilgan, markazlashgan tizim yo'q. `AppSelect.vue` zamonaviy ko'rinmayapti.

### 2.1 Design Tokens

- `theme/tokens.css` (yoki Tailwind config `theme.extend.colors`) yaratish:
  - `--color-primary`, `--color-primary-hover`
  - `--color-success`, `--color-danger`, `--color-warning`, `--color-info`
  - `--color-surface`, `--color-surface-elevated`, `--color-border`
  - `--color-text-primary`, `--color-text-secondary`
  - Har biri uchun Light va Dark qiymatlar
- Barcha komponentlardagi hardcoded hex ranglarni shu tokenlar bilan almashtirish (grep orqali `#[0-9a-fA-F]{3,6}` qidirib topish va tekshirish)

### 2.2 AppSelect.vue yangilanishi

- Qidiruv maydonli (searchable/filterable) rejim — ayniqsa kategoriya va tovar tanlashda
- Option ichida icon/badge render qilish imkoniyati (slot orqali)
- Ochilish/yopilish animatsiyasi: scale + fade, 150-200ms, `transition` bilan
- Grouped options qo'llab-quvvatlash (masalan kategoriya ichida subkategoriya)
- Barcha joylarda (Mahsulotlar, Omborxona, Moliya, SuperAdmin) shu yangilangan komponentga o'tkazish

---

## PHASE 3 — Mahsulotlar: Kategoriya CRUD moduli

**Muammo:** Mahsulot qo'shishda kategoriya tanlash select bor, lekin kategoriyalarni yaratish/tahrirlash/o'chirish joyi yo'q.

### Talablar

1. **Yangi "Kategoriyalar" bo'limi** (Mahsulotlar sahifasi ichida tab yoki alohida modal)
   - Kategoriya qo'shish: nom, ikonka (ixtiyoriy, emoji yoki icon-picker), rang belgisi
   - Tahrirlash, o'chirish (o'chirishda — agar kategoriyaga bog'liq tovarlar bo'lsa ogohlantirish chiqarish, "Umumiy" kategoriyaga ko'chirish taklifi bilan)
   - Ro'yxat: kategoriya nomi + unga tegishli tovarlar soni

2. **Backend**
   - `Category` jadvali (Prisma model): `id`, `businessId`, `name`, `icon`, `color`, `createdAt`
   - `Product` jadvaliga `categoryId` FK (agar hali yo'q bo'lsa)
   - CRUD endpoint'lar: `GET/POST/PATCH/DELETE /categories`
   - Kategoriya o'chirishda bog'liq mahsulotlar tekshiruvi (soft-delete yoki reassign logikasi)

3. Mahsulot qo'shish/tahrirlash modalidagi kategoriya select — endi shu real ma'lumotlar bazasidan keladi (hozir bo'sh/mock bo'lgan joy to'ldiriladi)

---

## PHASE 4 — Algoritm: "Ko'p sotilgan" — trend asosida (30 kunlik)

**Qaror:** Variant B — vaqt oralig'iga asoslangan (oxirgi 30 kun), statik umr-bo'yi hisob emas, balki hozirgi trendni ko'rsatadi.

### 4.1 Backend hisoblash

- Har bir tovar uchun `sales_count_30d` — oxirgi 30 kunlik savdo tranzaksiyalaridan hisoblanadi
- **Optimallashtirish:** har safar so'rov kelganda butun jadvalni scan qilish o'rniga, kunlik cron job (yoki materialized view) orqali oldindan hisoblab, `product_stats` jadvalida saqlash — real-time bo'lmasa ham 1 kunlik kechikish qabul qilinadi
- Endpoint: `GET /products/bestsellers?limit=10&period=30d`

### 4.2 Frontend joylashtirish (bosqichma-bosqich)

1. **POS (kassa)** — tovarlar ro'yxati default holda bestseller tartibida ko'rsatiladi (foydalanuvchi boshqa sort tanlamaguncha)
2. **Dashboard** — "Eng ko'p sotilgan 5 tovar" yangi karta/widget qo'shiladi
3. *(Keyingi bosqichda, hozircha rejalashtiriladi, kod yozilmaydi):* Mahsulotlar katalogida "Populyarlik" sort varianti, Omborda bestseller+kam-qolgan birlashtirilgan ogohlantirish, Moliyada foyda bo'yicha reyting, Restoran taomnomasida "Ommabop" belgisi

---

## PHASE 5 — Xavfsizlik: Ombor qoldig'i nazorati

**Muammo:** Qoldiq tugagan yoki manfiy bo'lgan tovarni sotib bo'lmasligi kerak, hozir bu tekshiruv yo'q/to'liq emas.

### Talablar

1. **Frontend (POS):** Qoldiq 0 yoki undan kam bo'lgan tovar kartasi disabled holatga o'tadi (kulrang, "Tugagan" belgisi bilan), savatga qo'shib bo'lmaydi
2. **Backend (muhim!):** Buyurtma yaratish/chek yopish endpointida **server tomonida** qoldiqni qayta tekshirish — frontend tekshiruviga ishonib qolmaslik kerak (bir vaqtda ikki kassir sotsa race condition bo'lishi mumkin). Transaction ichida `SELECT ... FOR UPDATE` yoki Prisma transaction bilan qoldiqni block qilib kamaytirish
3. Agar backend tekshiruvida qoldiq yetarli bo'lmasa — 409 xatolik qaytarish, frontendda tushunarli xabar ("Ushbu tovardan faqat X dona qoldi")

---

## PHASE 6 — Profil: O'z-o'zini tahrirlash

**Talablar**

- Har bir foydalanuvchi (rolidan qat'i nazar) o'z profilini ko'rish/tahrirlash sahifasi: Ism, Telefon, Parol o'zgartirish (eski parol tasdiqi bilan), Avatar (ixtiyoriy)
- Backend: `PATCH /users/me` endpoint, parol o'zgartirishda `bcrypt` orqali eski parolni tekshirish

---

## QO'SHIMCHA TAVSIYALAR (keyingi bosqichlar uchun, hozircha kod yozilmaydi)

- Excel/PDF eksport (hisobotlar, mijozlar, moliya jurnali)
- Real-time bildirishnoma tizimi (WebSocket allaqachon bor — kam qolgan tovar, yangi buyurtma uchun ishlatish)
- Pagination/lazy loading — mijozlar, audit jurnali, tovarlar ro'yxati ko'payganda
- Chek/hisob-faktura ketma-ket raqamlash tizimi
- Multi-filial (branch) qo'llab-quvvatlash — agar bitta owner bir nechta filial ochsa

---

## BAJARISH TARTIBI

Fazalar mustaqil bo'lgani uchun ketma-ket yoki parallel Antigravity agentlariga berilishi mumkin, lekin tavsiya etilgan tartib:
**Phase 2 (dizayn tizimi) → Phase 3 (kategoriya) → Phase 4 (algoritm) → Phase 5 (xavfsizlik) → Phase 1 (SuperAdmin) → Phase 6 (profil)**

Sababi: Phase 2 barcha keyingi UI ishlariga asos bo'ladi, Phase 3 esa Phase 4 uchun (bestseller sort UI'da kategoriya bilan birga ko'rsatiladi) zarur bo'lishi mumkin.
