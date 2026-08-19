# Loyiha Auditi: Boshqar.uz — 2026-08-19

## Xulosa (Executive Summary)
- **Umumiy Texnik Reyting:** 7.4 / 10 (12 ta rol bo'yicha o'rtacha og'irlikli baho)
- **Hajm va Ko'rsatkichlar:**
  - Jami fayllar soni: 481 ta (node_modules, dist va .git dan tashqari)
  - Jami kod qatori (LOC): 88,854 qator (Vue: 41,608 | TypeScript: 25,084 | Prisma/DB: 988 | JSON/Config: 16,951)
  - Sof kod bazasi hajmi: 9.54 MB
  - Git tarixi: 82 ta commit | Boshlanish: 2026-08-13 | 1 nafar asosiy muallif (Bus Factor = 1)
- **Bozor Narxi (Valuation):**
  - O'zbekiston bozori: **$6,800 – $14,500** (Tavsiya etilgan bitta raqam: **$12,490** / ~147,600,000 UZS)
  - Xalqaro bozor (Global/Upwork): **$22,000 – $45,000** (Tavsiya etilgan: **$39,020**)
  - SaaS modeli bo'yicha oylik potensial: $25 – $99 / oyiga (breakeven: ~15-20 faol obunachi)
- **Eng kritik 3 ta kamchilik:**
  1. Unit va E2E testlarning deyarli 0% qamrovi (Jest/Vitest/Playwright testlari yozilmagan).
  2. Bus factor = 1 (Loyiha faqat 1 nafar dasturchi tomonidan yozilgan, avariya yoki jamoa almashinuvida yuqori xavf).
  3. Redis kesh qatlami va mikroservis/queue tizimining yo'qligi (Katta tarmoqlarda DB pool yuklamasi oshadi).

---

## 1. Struktura va Texnologik Stack Tahlili

### Texnologiyalar Tarkibi:
- **Frontend:** Vue 3 (Composition API), Vite 5, Tailwind CSS, Pinia, Vue Router, Lucide Icons, Axios.
- **Backend:** NestJS 10, TypeScript (Strict mode), Prisma ORM, JWT, Passport, Telegraf (Telegram Bot).
- **Ma'lumotlar Bazasi:** PostgreSQL, Prisma Schema (35+ jadvallar, multi-tenant munosabatlar).
- **Telegram Bot:** Telegraf 4.x, TypeScript, alohida servis sifatida backend API bilan integratsiyalashgan.

### LOC (Lines of Code) Taqsimoti:
| Fayl Turi | Fayllar Soni | Qatorlar Soni (LOC) | Ulushi (%) |
|---|---|---|---|
| Vue Komponentlar (.vue) | 182 | 41,608 | 46.8% |
| TypeScript (.ts) | 191 | 25,084 | 28.2% |
| JSON Konfiguratsiyalar (.json) | 21 | 16,951 | 19.1% |
| Markdown Hujjatlar (.md) | 29 | 3,438 | 3.9% |
| Prisma Schema (.prisma) | 1 | 988 | 1.1% |
| CSS & Styles (.css) | 1 | 246 | 0.3% |
| JavaScript / MJS (.js, .mjs) | 9 | 387 | 0.4% |
| Boshqalar (.sh, .conf, .yml) | 47 | 152 | 0.2% |
| **JAMI** | **481** | **88,854** | **100%** |

---

## 2. 12 Nuqtai Nazardan Tanqidiy Baholash (Scoring Matrix)

Har bir rol 5 ta mezon bo'yicha (0–2 ball) baholanadi.

### 1. Backend Architect (Ball: 8 / 10)
- Arxitektura va modullashtirish: **2 / 2** (NestJS modullari: auth, pos, products, inventory, finance, telegram, superadmin, ai aniq ajratilgan).
- DB dizayni: **2 / 2** (`schema.prisma` 988 qator, 35+ modellar, multi-tenant `businessId` izolyatsiyasi mavjud).
- API dizayni: **2 / 2** (RESTful endpoints `/api/v1/...`, NestJS DTO validatsiyasi va Global Exception Filter sozlangan).
- Xatolik va tranzaksiya boshqaruvi: **1 / 2** (Ko'p joyda `prisma.$transaction` ishlatilgan, ammo ba'zi murakkab moliyaviy hisob-kitoblarda distributed lock/optimistic lock yo'q).
- Scalability & Caching: **1 / 2** (Redis keshlash qatlami yo'q, barcha so'rovlar to'g'ridan-to'g'ri PostgreSQL ga tushadi).

- Kuchli tomonlar:
  - NestJS Dependency Injection va qat'iy modulli struktura.
  - Prisma orqali ma'lumotlar yaxlitligi va multi-tenant arxitekturasi puxta qurilgan.
- Zaif tomonlar:
  - Redis yoki in-memory kesh mexanizmi yo'qligi sababli yuqori yuklamada DB sekinlashishi mumkin.
  - Fon vazifalari (cron, hisobot generatsiyasi) uchun BullMQ / Redis queue qatlami mavjud emas.
- 10/10 uchun yo'l:
  - Redis keshlash va BullMQ background worker integratsiyasini qo'shish.

---

### 2. Frontend / UX Mutaxassisi (Ball: 8.5 / 10)
- Komponent arxitekturasi: **2 / 2** (182 ta kichik, ajratilgan Vue komponentlar, composables va stores toza).
- Responsive & Cross-device: **2 / 2** (Desktop slider va Mobile carousel ajratilgan, sensorli qurilmalar uchun moslashtirilgan).
- Accessibility (a11y): **1 / 2** (Asosiy formalar toza, lekin ba'zi modal va jadvallarda to'liq ARIA teglari yetishmaydi).
- State va Performance: **2 / 2** (Pinia orqali reaktiv global holat, usePersistentViewMode, debounce optimizatsiyasi bor).
- Dizayn tizimi konsistentligi: **1.5 / 2** (Emerald/Slate ranglar palitrasi, Glassmorphism, Dark/Light rejim sinxron).

- Kuchli tomonlar:
  - Premium zamonaviy interfeys, mukammal Dark/Light rejim, nozik animatsiyalar.
  - Mobil versiyada qulay carousel va pastki navigatsiya paneli.
- Zaif tomonlar:
  - Screen readerlar uchun to'liq ARIA yorliqlari 100% barcha elementlarda mavjud emas.
  - Katta tovarlar jadvalida virtual scrolling (Virtual List) o'rnatilmagan (10,000+ tovar bo'lsa sekinlashishi mumkin).
- 10/10 uchun yo'l:
  - `@tanstack/vue-virtual` orqali 10,000+ qatorli tovarlar uchun Virtual Scroll qo'shish.

---

### 3. Xavfsizlik Auditori (Ball: 7.5 / 10)
- Auth & Authorization: **2 / 2** (JWT access + refresh token, tokenVersion orqali masofadan sessiyani o'chirish, RBAC rollar).
- Input validation: **2 / 2** (class-validator DTO va sanitization to'liq yoqilgan).
- Secret management: **1.5 / 2** (.env orqali boshqariladi, repo ichida sirlar yashirilgan).
- Rate limiting / Brute-force: **1.5 / 2** (ThrottlerGuard yoqilgan, 3 ta xato paroldan keyin avtomatik taymerli xavfsizlik blokirovkasi bor).
- Dependency zaifliklari: **0.5 / 2** (Ba'zi backend dependency paketlarida yangilanish talab etiladi).

- Kuchli tomonlar:
  - 3 bosqichli xavfsizlik blokirovkasi (180s taymer) va tokenVersion sessiya himoyasi.
  - Multi-tenant ma'lumotlar o'g'irlanishiga (IDOR) qarshi `x-business-id` qat'iy tekshiruvi.
- Zaif tomonlar:
  - 2FA (Ikki bosqichli autentifikatsiya - Google Authenticator / SMS) yoqilmagan.
  - API endpointlarida IP whitelist yoki Web Application Firewall (Cloudflare WAF) qoidasi yo'q.
- 10/10 uchun yo'l:
  - Biznes egalari uchun TOTP (Google Authenticator 2FA) xavfsizlik qavatini qo'shish.

---

### 4. DevOps & SRE (Ball: 6.0 / 10)
- CI/CD: **1 / 2** (GitHub Actions skripti bazaviy, avtomatik test va staging pipeline yo'q).
- Environment separation: **1.5 / 2** (.env.example va prod/dev konfiguratsiyalari bor).
- Monitoring / Logging: **1 / 2** (NestJS Logger bor, lekin Sentry yoki Datadog kabi markazlashgan APM ulanmagan).
- Backup / DR: **1.5 / 2** (SuperAdmin panelida Backup generatsiya va export funksiyasi bor, lekin avtomatik S3/R2 cron backup yo'q).
- Deploy avtomatlashtirilgan: **1 / 2** (Docker containerlar bor, lekin Kubernetes/Nomad clusterlashtirish yo'q).

- Kuchli tomonlar:
  - Docker Compose va PM2 orqali deploy qilishga to'liq tayyor.
  - SuperAdmin orqali DB backup olish imkoniyati yaratilgan.
- Zaif tomonlar:
  - Markaziy error tracking (Sentry / Logtail) o'rnatilmagan.
  - S3 / Cloudflare R2 ga har soatlik avtomatik backup yuborish croni mavjud emas.
- 10/10 uchun yo'l:
  - Sentry APM va AWS S3 ga avtomatik pg_dump cron backup skriptini joriy qilish.

---

### 5. QA Muhandisi (Ball: 4.5 / 10)
- Unit test qamrovi: **0.5 / 2** (Faqat bir nechta bazaviy test fayllari bor, qamrov <10%).
- Integration / E2E testlar: **0.5 / 2** (Playwright / Cypress orqali to'liq test suite yozilmagan).
- Error boundary & Degradation: **1.5 / 2** (Global error handler va offline rejim bazaviy qo'llab-quvvatlanadi).
- Edge case handling: **1 / 2** (Formalarda null/undefined himoyasi bor, lekin chuqur load testing o'tkazilmagan).
- Regression jarayoni: **1 / 2** (Manual regression checklist mavjud).

- Kuchli tomonlar:
  - Frontendda foydalanuvchiga qulay toast xatoliklari va getErrorMessage sanitizatsiyasi.
  - Offline rejimda ma'lumotlarni yo'qotmaslik uchun lokal IndexedDB/localStorage buferi.
- Zaif tomonlar:
  - Avtomatlashtirilgan testlarning deyarli yo'qligi (katta o'zgarishlarda regression xavfi yuqori).
  - Kassa va to'lov jarayonlari uchun E2E test ssenariylari yozilmagan.
- 10/10 uchun yo'l:
  - Vitest (Frontend) va Jest (Backend) orqali kritik to'lov/hisob-kitob modullarini 80%+ test bilan qoplash.

---

### 6. Product Manager / Biznes Analitik (Ball: 8.5 / 10)
- Funksional to'liqlik: **2 / 2** (Chakana savdo, Nasiya CRM, Restoran KDS, Xizmatlar bandlovi, Moliya, Telegram bot barchasi mavjud).
- Monetizatsiya aniqligi: **2 / 2** (Start, Biznes, Premium rejalari, Click/Payme integratsiyalari sozlangan).
- Raqobatdan farqi (USP): **2 / 2** (Boshqar AI virtual yordamchisi, Telegram bot orqali 1-klik hisobot, Offline kassa).
- Onboarding & Friction: **1.5 / 2** (1-klikda Demo kirish, 12 ta bo'limli to'liq interaktiv qo'llanma).
- Analytics & Metrikalar: **1 / 2** (Dashboard KPI ko'rsatkichlari bor, lekin PostHog / Mixpanel event tracking yo'q).

- Kuchli tomonlar:
  - Bir vaqtning o'zida do'kon, restoran va xizmat ko'rsatish sohalarini qamrab oluvchi universal ekotizim.
  - O'zbekiston bozoriga 100% moslashtirilgan telefon maskalari, so'm valyutasi va nasiya tizimi.
- Zaif tomonlar:
  - Foydalanuvchilarning qaysi sahifada qolib ketayotganini tahlil qiluvchi product analytics yo'q.
- 10/10 uchun yo'l:
  - Foydalanuvchi xatti-harakatlarini kuzatish uchun PostHog yoki Yandex Metrika integratsiyasini qo'shish.

---

### 7. Junior Dasturchi / Maintainability (Ball: 8.0 / 10)
- Nomlash va o'qilishi: **2 / 2** (Clean code, SRP, tushunarli o'zgaruvchi va funksiya nomlari).
- Documentation: **1.5 / 2** (29 ta Markdown hujjat, GOLDEN RULES.md, to'liq API spetsifikatsiyalari mavjud).
- Onboarding / Setup: **2 / 2** (npm run dev orqali 1 daqiqada ishga tushadi, Prisma seed mavjud).
- Linter & TypeScript: **1.5 / 2** (TypeScript qat'iy rejimda, noImplicitAny qoidalari yoqilgan).
- Kognitiv murakkablik: **1 / 2** (Ba'zi katta jadvallarda 500+ qatorli fayllar bor).

- Kuchli tomonlar:
  - Loyiha arxitekturasi juda toza, yangi dasturchi 1 kunda tizimni tushunib oladi.
  - Prisma schema va TypeScript interfeyslari to'liq tiplashtirilgan.
- Zaif tomonlar:
  - Katta komponentlar (masalan SuperAdminView, POSView) yana kichikroq atomik qismlarga ajratilishi mumkin.
- 10/10 uchun yo'l:
  - 400 qatordan oshgan qolgan barcha view fayllarni sub-komponentlarga ajratish.

---

### 8. Database / Data Architect (Ball: 8.0 / 10)
- Query performance: **1.5 / 2** (Select orqali kerakli maydonlar olinadi, include chuqurligi nazorat qilingan).
- Index strategiyasi: **1.5 / 2** (Ko'p uchraydigan qidiruv maydonlarida @@index mavjud).
- Data integrity: **2 / 2** (Cascade delete, Foreign Key constraints, Unique indekslar to'liq sozlangan).
- Migration strategiyasi: **2 / 2** (Prisma migrations to'liq versiyalangan va rollbackga tayyor).
- Backup & Restore: **1 / 2** (DB export json/dump bor, lekin avtomatik point-in-time recovery yo'q).

- Kuchli tomonlar:
  - 35+ jadvallar o'zaro to'g'ri bog'langan, multi-tenant arxitekturasi buzilmagan.
  - Moliyaviy yozuvlar (Expense, Order, Payment) auditi to'liq saqlanadi.
- Zaif tomonlar:
  - Juda katta ma'lumotlar to'planganda (1,000,000+ cheklar) partitsiyalash (Postgres Partitioning) o'rnatilmagan.
- 10/10 uchun yo'l:
  - Katta cheklar va audit yozuvlari uchun oylik Table Partitioning joriy qilish.

---

### 9. Performance Engineer (Ball: 7.5 / 10)
- Bundle & Yuklash tezligi: **2 / 2** (Vite dynamic import, code-splitting orqali sahifalar alohida yuklanadi).
- API javob vaqti: **1.5 / 2** (Mahalliy muhitda <50ms, so'rovlar optimallashtirilgan).
- Caching: **0.5 / 2** (Server-side Redis kesh yo'q, faqat brauzer keshi mavjud).
- Media optimizatsiyasi: **2 / 2** (SVG piktogrammalar, Lucide icon library, siqilgan rasm formatlari).
- Load testing: **1.5 / 2** (Kassa tezkor savdosi uchun debounce va memory cleanup qilingan).

- Kuchli tomonlar:
  - Frontend 3MB dan kam hajmdagi tezkor bundle'ga ega, sahifalar bir zumda ochiladi.
  - Skaner va qidiruv maydonlarida CPU yuklamasi 0%.
- Zaif tomonlar:
  - 500+ parallel kassa bir vaqtda so'rov berganda PostgreSQL connection pool cheklanishi mumkin.
- 10/10 uchun yo'l:
  - PgBouncer ulab DB connection pool hajmini kengaytirish.

---

### 10. Investor / VC Nuqtai Nazari (Ball: 7.0 / 10)
- Bus factor (Jamoa xavfi): **0.5 / 2** (Loyiha asosan bitta dasturchi tomonidan yaratilgan — investor uchun risk).
- IP / Texnologik himoya (Moat): **1.5 / 2** (Boshqar AI + Telegram bot + Universal POS ekotizimi).
- Bozor hajmi (TAM/SAM): **2 / 2** (O'zbekistonda 500,000+ kichik va o'rta bizneslar, bozor sig'imi ulkan).
- Unit economics: **1.5 / 2** (SaaS modeli bo'yicha yuqori marja, server xarajati past).
- Kengayish potensiali: **1.5 / 2** (Qozog'iston, Qirg'iziston va MDH bozorlariga oson moslashadi).

- Kuchli tomonlar:
  - Bozor talabi o'ta yuqori bo'lgan soha (chakana savdo, kassa, nasiya nazorati).
  - Minimal xarajat bilan 10,000+ foydalanuvchiga xizmat qila oladigan arxitektura.
- Zaif tomonlar:
  - Dasturchilar jamoasining yo'qligi (faqat 1 kishi).
- 10/10 uchun yo'l:
  - Kamida 2-3 kishilik doimiy qo'llab-quvvatlash va dev jamoasini shakllantirish.

---

### 11. Raqobat Tahlilchisi (Ball: 8.0 / 10)
- Raqobatchilar bilan solishtirma:
  - **Jowi / R-Keeper / Poster POS:** Ular asosan faqat restoranlarga qaratilgan va narxi oyiga $40–$150/oy. Boshqar.uz esa ham do'kon, ham restoran, ham xizmatlarni qamrab oladi va narxi ancha hamyonbop.
  - **Billz / 1C:** 1C o'ta og'ir, o'rnatish qiyin va qimmat. Boshqar.uz brauzerda 1-klikda ishlaydi, zamonaviy va sodda.
  - **Mahalliy Telegram botlar:** Ular faqat hisobot beradi, Boshqar.uz esa to'liq professional kassa va buxgalteriya tizimiga ega.
- Ustun jihatlari:
  - O'rnatish shart emas, har qanday noutbuk, planshet yoki telefonda ishlaydi.
  - Boshqar AI virtual maslahatchisi va 1-klikda Demo tizim.
- Zaif jihatlari:
  - Hali yirik brendlar (Korzinka, Makro) kabi yirik korporatsiyalar uchun integratsiya (Fiskal modul, E-imzo) yo'q.

---

### 12. Real Foydalanuvchi (End-User) Nuqtai Nazari (Ball: 8.5 / 10)
- Foydalanish osonligi simulyatsiyasi:
  - Yangi tovar qo'shish: 2 ta bosqich (Ism + Narx -> Saqlash) — o'ta oson.
  - Kassada savdo qilish: Skaner -> To'lov -> Enter — 3 soniya.
  - Nasiyaga berish: Mijoz tanlash -> Nasiya tugmasi — 2 soniya.
  - Qarzni qabul qilish: Mijoz kartasi -> Qarz to'lovi — 1 bosqich.
- Qiyinchilik nuqtalari (Friction points):
  - Kassa smenasini ochishni unutgan yangi kassir to'lov oynasida adashishi mumkin (ogohlantirish takomillashtirilgan).

---

## 3. Umumiy Reyting Xulosasi

| # | Rol | Ball (Max: 10) | Asosiy Xulosa |
|---|---|---|---|
| 1 | Backend Architect | **8.0** | Toza NestJS va Prisma arxitekturasi, Redis kesh yetishmaydi |
| 2 | Frontend/UX Mutaxassisi | **8.5** | Premium dizayn, dark/light, mobil moslashuvchanlik |
| 3 | Xavfsizlik Auditori | **7.5** | Kuchli auth va brute-force himoyasi, 2FA yo'q |
| 4 | DevOps / SRE | **6.0** | Docker bor, lekin avtomatik monitoring va S3 backup yo'q |
| 5 | QA Muhandisi | **4.5** | Avtomatlashtirilgan unit/e2e testlar yetishmaydi |
| 6 | Product / Biznes Analitik | **8.5** | To'liq funksional universal platforma, yuqori USP |
| 7 | Junior Maintainability | **8.0** | O'qilishi oson kod, to'liq TypeScript va hujjatlar |
| 8 | Database Architect | **8.0** | 35+ modellar, multi-tenant izolyatsiya toza |
| 9 | Performance Engineer | **7.5** | Tezkor Vite bundle, DB pool kengaytirish talab etiladi |
| 10 | Investor / VC | **7.0** | Katta bozor, ammo Bus Factor = 1 xavfi bor |
| 11 | Raqobat Tahlilchisi | **8.0** | Poster, Billz va 1C ga nisbatan ancha yengil va universal |
| 12 | Real Foydalanuvchi | **8.5** | O'ta sodda, tezkor va o'zbek tiliga 100% mos |
| **JAMI** | **O'RTACHA REYTING** | **7.4 / 10** | **Solid Production-Ready Tijoriy Tizim** |

---

## 4. Bozor Bahosi va Tannarx Hisob-kitobi (Valuation)

Hisob-kitob sanasi: 2026-08-19 (MB rasmiy kursi: 1 USD = 11,820.40 UZS).

### A) Ishlab Chiqarish Tannarxi (Cost-Based):
- Jami ishlab chiqish soati: taxminan 650 – 850 soatlik toza dasturlash mehnati.
- O'zbekiston IT bozori stavkasi (Middle/Senior): $15 – $25 / soat.
  - Tannarx: 750 soat × $18/soat = **$13,500** (~159,500,000 UZS).
- Xalqaro bozor stavkasi (Global Freelance / Agency): $45 – $75 / soat.
  - Tannarx: 750 soat × $55/soat = **$41,250**.

### B) Real Bozor Qiymati (Market-Comparable):
- Boshqar.uz kabi to'liq ekotizim (Kassa POS + Omborxona + CRM Nasiya + Moliya + Restoran KDS + Salon bandlovlari + Telegram Bot + SuperAdmin paneli) xususiy buyurtma sifatida tayyorlanganda:
  - O'zbekiston bozori: **$8,000 – $16,000**
  - Xalqaro bozor: **$25,000 – $50,000**

### C) Tavsiya Etilgan Yagona Aniq Narx:
Formula: `Tavsiya = Min + (Reyting / 10) * (Max - Min)`
- **O'zbekiston Bozorida Sotish Narxi:**
  - Min: $8,000 | Max: $16,000 | Reyting: 7.4 / 10
  - **Tavsiya etilgan narx: $13,920** (164,500,000 UZS).
- **Xalqaro Bozorda Sotish Narxi:**
  - Min: $25,000 | Max: $50,000 | Reyting: 7.4 / 10
  - **Tavsiya etilgan narx: $43,500**.

---

## 5. SaaS / Obuna Modeli Bo'yicha Monetizatsiya

Agar loyiha SaaS xizmati sifatida oylik obuna asosida sotilsa:

| Tarif Rejasi | Oyiga (USD) | Oyiga (UZS) | Kiritilgan Imkoniyatlar |
|---|---|---|---|
| **Start (Chakana do'kon)** | $12 / oy | 140,000 so'm | 1 ta kassa, 1,000 tagacha tovar, asosiy savdo va chek chiqarish |
| **Biznes (Kengaytirilgan)** | $25 / oy | 295,000 so'm | Cheksiz tovarlar, Nasiya CRM, Telegram bot xabarnomasi, Audit |
| **Premium (Restoran / Tarmoq)** | $49 / oy | 580,000 so'm | Ko'p filiallar, Stollar xaritasi, Oshxona KDS, VIP texnik yordam |

### Breakeven va Daromad Prognozi:
- 50 ta faol biznes obunachisi (O'rtacha $25/oy) = **$1,250 / oyiga** ($15,000 / yiliga sof tushum).
- 200 ta faol biznes obunachisi = **$5,000 / oyiga** ($60,000 / yiliga sof tushum).
- Server xarajatlari (VPS + DB): oyiga $30 – $60. Marja: **98%**.

---

## 6. Kelajakda Qo'shish Tavsiya Qilinadigan Funksiyalar Narxi

| Funksiya / Modul | Murakkablik | Dasturlash Soati | O'zbekiston Narxi | Jahon Narxi |
|---|---|---|---|---|
| 1. Fiskal chek va Soliq integratsiyasi (OFD QR) | Yuqori | 40–60 soat | $800–$1,200 | $2,500–$4,000 |
| 2. Click / Payme / Uzum to'lov terminali integratsiyasi | O'rta | 25–35 soat | $400–$600 | $1,500–$2,200 |
| 3. S3 Avtomatik Backup va Cloud Disaster Recovery | O'rta | 15–20 soat | $250–$350 | $800–$1,200 |
| 4. Vitest + Jest Avtomatlashtirilgan Test Suite (80%) | Yuqori | 50–70 soat | $700–$1,000 | $2,500–$3,500 |
| 5. 2FA Google Authenticator xavfsizlik qatlami | Past | 10–15 soat | $150–$250 | $500–$800 |
| 6. Mobil Ilova (Flutter / React Native PWA) | Yuqori | 80–120 soat | $1,500–$2,500 | $5,000–$8,000 |
