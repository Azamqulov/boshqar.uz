# TEXNIK TOPSHIRIQ (TZ): Boshqar.uz — Multi-Language, Dynamic Lock Screen & Individual Employee PIN System

## 1. LOYIHA UMUMIY TAVSIFI VA MAQSADI
Ushbu Texnik Topshiriq Boshqar.uz savdo va biznes boshqaruv platformasida foydalanuvchilar (do'kon ega va xodimlari) xavfsizligi, foydalanish qulayligi (UX) hamda xalqaro ko'p tillik platforma talablariga mos ravishda quyidagi 8 ta asosiy modul va takomillashtirishlarni amalga oshirishni ko'zda tutadi:

1. **Settings UI Layout Alignment Fix**: Sozlamalar va Xavfsizlik bo'limi elementlari joylashuvini 100% tartibli va mukammal grid shakliga keltirish.
2. **Dynamic Light & Dark Mode Lock Screen**: Ekran qulflanganda ilova rejimiga (Light Mode / Dark Mode) mos ravishda Lock Screen overlay visual temasining avtomatik o'zgarishi.
3. **Real O'zbek Kirillcha Transliteratsiya**: O'zbek Kirillcha yozuvdagi barcha ibora va matnlarni 100% aniq va xatosiz ko'rsatish.
4. **Ko'p Tillik (Multi-Language i18n)**: Platformaga O'zbekcha (Lotin), Ўзбекча (Кирилл), Русский 🇷🇺 va English 🇬🇧 tillarini to'liq kiritish va dinamik almashtirish.
5. **Xodimlarga Individual Quick PIN Kod**: Har bir xodim (Kassir, Sotuvchi, Ofitsiant) uchun shaxsiy Quick Lock PIN kodi o'rnatish va unga mos ravishda ekran ochilishini ta'minlash.
6. **Bir Martalik Cookie & Privacy Consent**: Cookie rozilik banneriga bir marta rozilik berilgach, uni xotirada saqlash va qayta ko'rsatmaslik.
7. **Clean Code & Architecture Refactoring**: Barcha composable va komponentlarni DRY hamda SRP tamoyillari bo'yicha refaktor qilish.
8. **Automated Verification & Build Guarantee**: Yuqoridagi barcha o'zgarishlarni to'liq kompyatsiya va Docker deployment-dan o'tkazish.

---

## 2. DETALIZATSIYA QILINGAN MODULLAR VA FUNKSIONAL TALABLAR

### 2.1. Dynamic Light vs Dark Mode Lock Screen
- **Talab**: Dashboard Light mode-da bo'lsa Lock Screen ham Oq/Tiniq Frosted Glass va qora/slate matn ko'rinishida bo'ladi. Dashboard Dark mode-da bo'lsa Lock Screen to'q slate va neon glass formatda namoyon bo'ladi.
- **Visuals**: Biznes turiga mos (Restoran/Kafe, Supermarket/Do'kon, Barbershop, Farmatsevtika, Texnologik Ofis) HD fon rasmlari va live glow effektlari ikkala rejimda ham mukammal o'qilishini ta'minlash.

### 2.2. Multi-Language i18n (Lotin, Kirill, Ru, En)
- **Tillar va Kodlar**:
  - `uz_latn`: O'zbekcha (Lotin) 🇺🇿
  - `uz_cyrl`: Ўзбекча (Кирилл)
  - `ru`: Русский 🇷🇺
  - `en`: English 🇬🇧
- **Lokalizatsiya mexanizmi**: `useLanguage.ts` composable dynamic dictionary orqali LockScreen, AppHeader, Settings va barcha asosiy navigatsiya tugmalarini lahzada (refresh-siz) tarjima qiladi.

### 2.3. Individual Employee PIN System
- **Tavsif**: `SettingsEmployeesTab.vue` ichida har bir xodimga individual 4 xonali PIN kod biriktirish maydoni qo'shiladi.
- **Lock Screen Auth**: Qulflangan ekranda xodimlardan biri o'zining shaxsiy PIN kodini kiritsa, tizim uni taniydi va tegishli seans bilan ekran ochiladi.

### 2.4. Cookie & Privacy Consent Permanent Suppression
- **Tavsif**: `CookieConsentBanner.vue` da `Roziman` tugmasi bosilganda `localStorage.setItem('ubms_cookie_consent_given', 'true')` yoziladi va qayta ko'rinmaydi.

### 2.5. Settings UI Alignment & Refactoring
- **Tavsif**: `SettingsProfileTab.vue` dagi Xavfsizlik bo'limi grid elementlari to'liq alignment va spacing xatolaridan tozalanadi. `AppSelect.vue` qo'llaniladi.

---

## 3. TEXNIK FAYLLAR O'ZGARISH MATRITSASI

| Fayl | Joylashuvi | O'zgarish Maqsadi |
|---|---|---|
| `useLanguage.ts` | `src/composables/useLanguage.ts` | Kirill, RU, EN lug'atini yaratish va dynamic i18n rejimini boshqarish |
| `LockScreen.vue` | `src/components/LockScreen.vue` | Light/Dark theme dynamic CSS, Multi-language label va auto-unlock |
| `useScreenLock.ts` | `src/composables/useScreenLock.ts` | Individual employee PIN kodlarini tekshirish va lock holati |
| `SettingsProfileTab.vue` | `src/views/settings/components/SettingsProfileTab.vue` | Alignment layout fix, AppSelect integratsiyasi va Language selector |
| `SettingsEmployeesTab.vue` | `src/views/settings/components/SettingsEmployeesTab.vue` | Xodimlarga individual Quick Lock PIN kod biriktirish fieldi |
| `CookieConsentBanner.vue` | `src/components/CookieConsentBanner.vue` | Bir martalik rozilik xotirasi (`ubms_cookie_consent_given`) |
| `AppHeader.vue` | `src/components/AppHeader.vue` | Quick language switcher (4 ta til) va Lock icon |

---

## 4. QABUL QILISH MEZONLARI (ACCEPTANCE CRITERIA)
1. Settings dagi Avto-qulflash va Xavfsizlik qatori mutlaqo buzilmaydi va joylashuvi o'ta ozoda ko'rinadi.
2. Light mode-da Lock Screen tugmasi bosilsa, ekran ham Light theme (oq glass) ko'rinishida ochiladi.
3. Kirill, Rus va Ingliz tili tanlanganda LockScreen, Header va Settings lahzada tegishli tilga o'tadi.
4. Xodimlarga individual PIN kod belgilansa va u kirishda terilsa ekran avtomatik ochiladi.
5. Cookie rozilik tugmasi bir marta bosilsa, keyingi kirishlarda banner qayta chiqmaydi.
6. `npm run build` va Docker container deployment 0 xatolik bilan muvaffaqiyatli yakunlanadi.
