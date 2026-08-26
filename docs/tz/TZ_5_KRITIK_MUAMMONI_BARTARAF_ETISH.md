# 📋 TEXNIK TOPSHIRIQ (TZ): 5 TA KRITIK MUAMMONI BARTARAF ETISH
**Loyiha:** boshqar.uz — Universal Biznes Boshqaruv Tizimi
**Hujjat kodi:** `TZ-CRITICAL-5-FIX-2026`
**Holat:** TASDIQLANGAN / AMALGA OSHIRILMOQDA
**Sana:** 26 Avgust 2026

---

## 1. Maqsad va qamrov (Purpose & Scope)

Ushbu texnik topshiriqning maqsadi — `boshqar.uz` tizimining 12-rol auditi natijasida aniqlangan eng yuqori xavf darajasidagi 5 ta kritik texnik va operatsion zaiflikni to'liq bartaraf etish, tizim xavfsizligini ta'minlash, investor va jamoa xavfini (Bus Factor) minimallashtirish, qulaylik/accessibility (a11y) standartlarini xalqaro darajaga olib chiqish hamda to'liq avtomatlashtirilgan CI/CD deploy tizimini yo'lga qo'yishdir.

### Qamrab olinuvchi 5 ta vazifa:
1. **Muammo 1 (Bus Factor = 1):** Tizimni yagona dasturchiga bog'liqlikdan chiqarish — `CONTRIBUTING.md`, `docs/ARCHITECTURE.md`, `docs/ONBOARDING.md`, tizim xaritasi va to'liq arxitektura/dependency qo'llanmasini yaratish.
2. **Muammo 2 (JWT_SECRET hardcoded fallback):** `docker-compose.yml`, `docker-compose.prod.yml` va NestJS muhit validatsiyasidan barcha xavfli default kalitlarni olib tashlash, kamida 32 belgili kuchli secret majburiyligini runtime darajasida ta'minlash.
3. **Muammo 3 (28 ta backend npm zaifligi):** Backend va Frontend dependency daraxtini tozalash, `package.json` overrides orqali barcha HIGH/CRITICAL CVE'larni (Multer, Lodash, Picomatch, Glob, QS, Tmp) bartaraf etish.
4. **Muammo 4 (Accessibility / a11y = 0):** Barcha asosiy UI komponentlar (`AppButton`, `AppSelect`, `AppInput`, `ThemeToggle`, `AppHeader`, `AppSidebar`) ga WCAG 2.1 AA standartlariga mos `aria-*` atributlari, `role`, klaviatura navigatsiyasi (Focus ring, Escape, Arrow keys) ni joriy qilish.
5. **Muammo 5 (CD Pipeline yo'q):** `.github/workflows/deploy.yml` orqali to'liq avtomatlashtirilgan Continuous Deployment (CD) pipeline yaratish — test/build tekshiruvi, Docker build, SSH orqali serverga xavfsiz deploy, avtomatik health check va xatolikda rollback.

---

## 2. Foydalanuvchi rollari va ta'sir doirasi (User Roles & Impact)

| Rol | Ko'ra oladi / Bajaradi | Cheklovlar / Xavflar bartaraf etilishi |
|---|---|---|
| **Yangi Dasturchi (Junior/Middle)** | Onboarding qo'llanmasi orqali loyihani 15 daqiqada ishga tushiradi, arxitektura diagrammalari va modul xaritasidan foydalanadi | Bosh dasturchisiz mustaqil modul qo'sha oladi (Bus factor xavfi yo'qoladi) |
| **DevOps / SysAdmin** | CI/CD pipeline orqali birgina `git push origin main` orqali production serverga deploy qiladi, avtomatik rollback ishlaydi | Qo'lda SSH orqali buyruqlar yozish zarurati va insoniy xatolar bartaraf etiladi |
| **Xavfsizlik Auditori / Admin** | Tizim faqat kuchli JWT secret bilan ishga tushishini, barcha npm zaifliklar yopilganini tekshiradi | Default static parollar orqali token soxtalashtirish (token spoofing) xavfi 0 ga tushadi |
| **Ko'zi ojiz / Klaviatura foydalanuvchisi (End-User)** | Screen reader (NVDA, TalkBack, VoiceOver) orqali barcha tugmalar, selectlar va formalarni eshitadi va Tab/Enter/Arrow bilan to'liq boshqaradi | Qora quti interfeys, ko'rinmas tugmalar va klaviaturada qotib qolish muammolari yo'qoladi |

---

## 3. Ma'lumotlar bazasi va muhit sxemasi (DB & Environment Schema)

### 3.1. Environment Configuration Schema
```ts
// Majburiy va qat'iy tekshiriladigan o'zgaruvchilar:
DATABASE_URL: string (Valid PostgreSQL connection string)
JWT_SECRET: string (Kamida 32 belgi, default fallbacksiz, mustaqil generatsiya qilinadigan kalit)
REDIS_URL: string (Valid Redis URL)
PORT: number (Default: 4000)
NODE_ENV: 'development' | 'test' | 'production'
CORS_ORIGINS: string (Ruxsat etilgan domenlar ro'yxati)
```

---

## 4. Qadamlar va Komponentlar bo'yicha Texnik Yechimlar

### 4.1. Muammo 1: Bus Factor = 1 yechimi
- `docs/ARCHITECTURE.md` — Monorepo arxitekturasi, 30 ta backend modulning bog'liqlik xaritasi, Prisma relational diagrammasi, WebSocket va Redis voqealar oqimi.
- `docs/ONBOARDING.md` — Yangi kelgan dasturchi uchun kompyuterni sozlashdan tortib, birinchi pull-request'gacha bo'lgan 5 ta qadam.
- `CONTRIBUTING.md` — Kodlash qoidalari, Git branch & commit konvensiyasi, testlarni yozish standarti.

### 4.2. Muammo 2: JWT_SECRET Hardcoded Fallback xavfini yo'qotish
- `docker-compose.yml` va `docker-compose.prod.yml` fayllaridagi `${JWT_SECRET:-boshqar-super-secret-jwt-key...}` fallback matnlarini to'liq olib tashlash.
- `ubms-backend/src/config/env.validation.ts` da quyidagi xavfsizlik tekshiruvlarini qo'shish:
  - `JWT_SECRET` bo'sh emasligi;
  - Uzunligi kamida 32 belgi bo'lishi;
  - `boshqar-super-secret`, `secret`, `123456`, `jwt_secret` kabi zaif va ma'lum default kalitlarni aniqlab, darhol server startini to'xtatish (Fail-Fast pattern).

### 4.3. Muammo 3: npm zaifliklarini bartaraf etish
- `ubms-backend/package.json` ga `overrides` orqali xavfli sub-dependency versiyalarini xavfsiz relizlarga yo'naltirish:
  - `glob >= 10.4.5`, `picomatch >= 4.0.3`, `multer >= 2.1.2` (yoki secure stream), `tmp >= 0.2.6`, `qs >= 6.14.0`, `lodash >= 4.17.21`.
- Frontend `package.json` dagi zaifliklarni tozalash.

### 4.4. Muammo 4: Accessibility (WCAG 2.1 AA) joriy etish
- **`AppButton.vue`**:
  - `aria-label` va `aria-describedby` props qo'llab-quvvatlashi;
  - `role="button"` va `type="button|submit|reset"`;
  - Loading holatida `aria-busy="true"` va screen-reader uchun yashirin yuklanish matni (`sr-only: Yuklanmoqda...`).
- **`AppSelect.vue`**:
  - Trigger tugmasiga `role="combobox"`, `aria-expanded="isOpen"`, `aria-haspopup="listbox"`, `aria-controls="select-dropdown-list"`;
  - Dropdown ro'yxatiga `role="listbox"`, har bir optionga `role="option"`, `aria-selected="true/false"`;
  - Klaviatura navigatsiyasi: `Escape` yopish, `ArrowDown`/`ArrowUp` tanlash, `Enter` tasdiqlash.
- **`AppInput.vue`**:
  - Input va Label o'rtasida avtomatik `id` / `for` bog'lanishi;
  - Xatolik holatida `aria-invalid="true"` va `aria-errormessage="input-error-id"`.
- **`ThemeToggle.vue`**:
  - `role="switch"`, `aria-checked="isDark"`, `aria-label="Tungi/Kunduzgi rejimni almashtirish"`.
- **`AppHeader.vue` / `AppSidebar.vue`**:
  - Semantik teglar: `<header role="banner">`, `<nav aria-label="Asosiy menyu">`, faol sahifaga `aria-current="page"`.

### 4.5. Muammo 5: CD Pipeline (Continuous Deployment)
- `.github/workflows/deploy.yml` faylini yaratish:
  - Trigger: `push` faqat `main` branchga;
  - 1-bosqich: Lint, Typecheck, Unit testlar muvaffaqiyatli o'tishi;
  - 2-bosqich: Docker container build va push;
  - 3-bosqich: SSH orqali Production serverga ulanish, yangi tasvirlarni tortish (`docker compose pull`), migratsiyalarni yurgizish (`prisma migrate deploy`) va zero-downtime qayta ishga tushirish;
  - 4-bosqich: Healthcheck tekshiruvi (`curl -f http://localhost:4000/api/v1/health`), agar 30 soniyada javob kelmasa avtomatik rollback qilish.

---

## 5. Qabul qilish mezonlari (Acceptance Criteria)

- [ ] **AC-1 (Bus Factor):** `docs/ARCHITECTURE.md` va `docs/ONBOARDING.md` fayllari yaratilgan va undagi buyruqlar orqali toza tizimda loyihani 0 dan ishga tushirish mumkin.
- [ ] **AC-2 (JWT Xavfsizlik):** `docker-compose.yml` va `.env.validation.ts` da hardcoded default kalit yo'q, zaif secret berilganda backend xato bilan o'chadi.
- [ ] **AC-3 (npm Audit):** `npm audit` buyrug'ida 0 ta HIGH va 0 ta CRITICAL zaiflik qolishi kerak.
- [ ] **AC-4 (a11y):** Barcha asosiy UI komponentlar (`AppButton`, `AppSelect`, `AppInput`, `ThemeToggle`) screen reader va klaviatura yordamida to'liq boshqarilishi tasdiqlanishi kerak.
- [ ] **AC-5 (CD Pipeline):** `.github/workflows/deploy.yml` yaratilgan va sintaksisi to'g'ri.

---

*Texnik topshiriq tasdiqlandi. Amalga oshirishga o'tilmoqda.*
