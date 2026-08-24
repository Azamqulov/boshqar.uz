# 📋 Texnik Topshiriq (TZ): Boshqar.uz Landing Page & Subpage Platformasi

---

## 1. Maqsad va Qamrov (Purpose & Scope)
Ushbu Texnik Topshiriq (TZ) **Boshqar.uz** savdo, ombor, restoran va biznes boshqaruv SaaS platformasining bosh landing sahifasi (`/`), ixcham teaser bo'limlari, "Batafsil ➔" yo'naltirish mexanizmi, 7 ta alohida va birlashtirilgan sub-sahifalari (`/telegram-bot`, `/sohalar`, `/tahlil`, `/tariflar`, `/yordam`, `/aloqa`) hamda qat'iy UI/UX standartlarini (Auto-Capitalize ism-familiya, `+998` telefon avtomaskasi, 0% emoji / 100% Lucide ikonkalar) to'liq belgilab beradi. Ushbu tizim chakana va ulgurji savdo do'konlari, restoranlar, dorixonalar va xizmat ko'rsatish shoxobchalari egalarini 14 kunlik bepul sinov muddatiga jalb qilishga va konversiyani oshirishga xizmat qiladi.

---

## 2. Foydalanuvchi Rollari (User Roles)

| Rol nomi | Ko'rish va bajarish huquqlari | Cheklovlar |
|---|---|---|
| **Mehmon (Tadbirkor / Tashrifchi)** | Bosh sahifadagi teaserlar, 7 ta sub-sahifa, ROI kalkulyatori, taqqoslash matritsasi, tariflar, sharhlar, FAQ va aloqa formasidan foydalana oladi. 14 kunlik bepul ro'yxatdan o'tishi yoki Jonli Demoni ochishi mumkin. | Dashboard yoki kassa ichki ma'lumotlariga ruxsatsiz kira olmaydi. |
| **Ro'yxatdan o'tgan Foydalanuvchi** | Tizimga kirgan bo'lsa, navbarda avtomatik "Boshqaruv Paneli" tugmasi chiqadi va `/dashboard` sahifasiga o'tadi. | Landing sahifada qayta ro'yxatdan o'tish talab etilmaydi. |
| **Boshqar.uz Operator / Support** | `/aloqa` sahifasidan va Telegram botdan kelgan murojaat va konsultatsiya so'rovlarini qabul qiladi. | N/A |

---

## 3. Ma'lumotlar Bazasi Sxemasi (DB Schema)

Murojaatlar va konsultatsiya so'rovlarini saqlash uchun backend ma'lumotlar bazasi jadvali:

```sql
CREATE TABLE public.lead_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL, -- Auto-capitalized name (e.g. Alisher Qodirov)
    phone VARCHAR(20) NOT NULL,     -- Masked phone (+998 90 123-45-67)
    sector VARCHAR(50) NOT NULL DEFAULT 'retail', -- Business sector
    message TEXT NULL,              -- Optional note/question
    status VARCHAR(20) NOT NULL DEFAULT 'NEW', -- NEW, CONTACTED, CONVERTED, CLOSED
    source VARCHAR(50) NOT NULL DEFAULT 'landing_contact',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lead_requests_phone ON public.lead_requests(phone);
CREATE INDEX idx_lead_requests_created_at ON public.lead_requests(created_at DESC);
```

---

## 4. API Jadvali (API Table)

| Method | Path | Auth required? | Request Body | Response | Error Cases |
|---|---|---|---|---|---|
| `POST` | `/api/v1/leads` | No | `{ fullName: string, phone: string, sector: string, message?: string }` | `{ success: true, leadId: string, message: "Murojaat qabul qilindi" }` | 400 Bad Request (Invalid phone format), 429 Too Many Requests |
| `GET` | `/api/v1/health` | No | None | `{ status: "OK", timestamp: string }` | 500 Server Error |

---

## 5. Ekranlar va Bo'limlar Ro'yxati (Screens List)

1. **Bosh Sahifa Teaserlari (`/` - `LandingView.vue`):**
   - **Hero Header:** Asosiy taklif, Jonli Demo va 14 Kun Bepul tugmalari.
   - **Interactive Mockup Teaser:** 4s avto-slider va `"Batafsil Tizim Mockup ➔"` tugmasi.
   - **Sohalar Teaser:** 6 ta soha kartasi, 4s avto-slider va `"Barcha Sohalar ➔"` (`/sohalar`) tugmasi.
   - **Telegram Bot Teaser:** Jonli telefon simulyatori, yozmoqda... animatsiyasi va `"Telegram Bot Imkoniyatlari ➔"` (`/telegram-bot`) tugmasi.
   - **ROI Kalkulyator Teaser:** Sliderlar va `"Tahlil va Taqqoslash ➔"` (`/tahlil`) tugmasi.
   - **Taqqoslash Teaser:** Ixcham jadval va `"Batafsil Taqqoslash ➔"` (`/tahlil`) tugmasi.
   - **Tariflar Teaser:** 3 ta plan, yillik -20% va `"Barcha Tariflar ➔"` (`/tariflar`) tugmasi.
   - **Sharhlar & FAQ Teaser:** Top sharhlar va `"Barcha Sharhlar & FAQ ➔"` (`/yordam`) tugmasi.

2. **Xizmatlar & Yechimlar Dropdown Menyusi (`LandingHeader.vue`):**
   - `Telegram Bot` -> `/telegram-bot`
   - `Sohalar & Biznes Modullari` -> `/sohalar`
   - `Kalkulyator & Taqqoslash` -> `/tahlil`

3. **Sub-Sahifalar:**
   - **`/telegram-bot` (`TelegramBotView.vue`):** Real-time cheklar, 21:00 kunlik hisobot, ASCII bars, kam qolgan tovar signal va TMA POS.
   - **`/sohalar` (`SectorsView.vue`):** 6 ta soha (Do'kon, Restoran, Fast-Food, Dorixona, Salon, Avtoservis) batafsil moduli.
   - **`/tahlil` (`AnalysisView.vue`):** `Kalkulyator` va `Taqqoslash` segmented tab-switcher (User screenshot 2 mos).
   - **`/tariflar` (`PricingView.vue`):** Starter, PRO, Enterprise planlar, yillik chegirma switcher va Soliq OFD ma'lumotlari.
   - **`/yordam` (`HelpAndReviewsView.vue`):** `Sharhlar (12)` va `FAQ Javoblar` segmented tab-switcher.
   - **`/aloqa` (`ContactView.vue`):** Murojaat formasi (Auto-Capitalize + Phone Mask), 24/7 Telegram link, Call-center va Ofis manzili.

---

## 6. UI/UX va Validatsiya Standartlari (Strict UI/UX Rules)

### 6.1. Input Validatsiyasi va Avto-Formatlash
- **Ism va Familiya Inputi (`fullName`):**
  - Foydalanuvchi harf kiritganida har bir so'zning birinchi harfi avtomatik KATTA harfga o'tkazilishi shart (`capitalizeWords` funksiyasi). Misol: `alisher qodirov` -> `Alisher Qodirov`.
- **Telefon Raqam Inputi (`phone`):**
  - O'zbekiston raqam formati uchun `+998 (XX) XXX-XX-XX` shaklida avto-maska va faqat raqamlar qabul qilinishi shart.
- **Select Maydonlari (`sector`):**
  - Standart brauzer select'i o'rniga zamonaviy tailwind styled select va default qiymat (`Do'kon / Supermarket`) o'rnatilishi shart.

### 6.2. Ikonka Standarti (0% Emoji Rule)
- Tizim interfeysida hech qanday xom emoji qo'llanilmaydi.
- Barcha ikonkalar faqat **`lucide-vue-next`** vektor SVG ikonkalari bo'lishi shart (`<Send />`, `<CheckCircle2 />`, `<XCircle />`, `<Calculator />`, `<Layers />`, `<Star />`).

### 6.3. Navigatsiya va "Batafsil" Yo'naltirish
- Bosh sahifadagi har bir bo'lim oxirida ko'zga tashlanadigan va bosiladigan `"Batafsil ➔"` tugmasi joylashtirilib, tegishli sub-sahifaga yo'naltiradi.

---

## 7. Qabul Qilish Mezonlari (Acceptance Criteria)

- [x] **Criterion 1:** Bosh sahifadagi har bir bo'limda "Batafsil ➔" tugmasi mavjud bo'lishi va bosilganda to'g'ri sub-sahifaga o'tishi.
- [x] **Criterion 2:** Formadagi ism-familiya inputi har bir so'zning birinchi harfini avtomatik katta harf qilishi (`Alisher Qodirov`).
- [x] **Criterion 3:** Telefon inputiga `+998` kodi bilan avto-maska o'rnatilgan bo'lishi.
- [x] **Criterion 4:** Navbarda "Xizmatlar & Yechimlar ▾" dropdown menyusi ishlashi.
- [x] **Criterion 5:** All icons use Lucide SVG components (zero emojis).
- [x] **Criterion 6:** `/tahlil` sahifasida `Kalkulyator` va `Taqqoslash` tablar bilan almashishi.
- [x] **Criterion 7:** `/yordam` sahifasida `Sharhlar` va `FAQ` tablar bilan almashishi.
- [x] **Criterion 8:** `/aloqa` sahifasi orqali murojaat qoldirish imkoniyati va 100% muvaffaqiyatli toast bildirishnoma ko'rinishi.

---

## 8. Chetga Chiqish Holatlari (Edge Cases to Handle)

1. **Tarmoq sekinlashishi yoki oflayn holat:**
   - Murojaat formasi yuborilayotganda tugma `disabled` bo'lib, "Yuborilmoqda..." indikatori yonadi.
2. **Telefon raqami noto'g'ri kiritilishi:**
   - Raqam 9 ta raqamdan kam bo'lsa formani yuborishga yo'l qo'yilmaydi.
3. **Kichik mobil ekranlar:**
   - Menyu va tab-switcher mobil ekranda sig'uvchan va barmoq bilan bosishga qulay (touch-friendly min 44px) bo'ladi.

---

## 9. Taxminlar va Ochiq Savollar (Assumptions & Open Questions)

- `[ASSUMPTION]` Landing sahifasidagi barcha kontent O'zbekiston biznes kontekstiga to'la mos holda o'zbek tilida tayyorlandi.
- `[ASSUMPTION]` Formadan kelgan murojaatlar Telegram boti va ma'lumotlar bazasiga sinxron tushadi.
