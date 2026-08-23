# 📋 Loyiha Auditi: boshqar.uz — 2026-08-23

## Xulosa (Executive Summary)

* **Umumiy reyting:** **7.75 / 10** (12 nuqtai nazar o'rtachasi)
* **Jami fayllar:** 558 ta | **Sof kod hajmi:** 14.31 MB (dependency hajmi `node_modules`: 922.47 MB alohida ajratilgan) | **Jami kod qatori (LOC):** 108,676 qator (Vue: 46,404, TS: 27,671, JSON: 28,388, MD: 4,009, Prisma: 1,026)
* **🔴 Eng kritik 3 ta kamchilik:**
  1. **Bus Factor Risk (Faqat 1 dasturchi):** Git auditida 84 ta commitning barchasi 1 kishi (`boshqar.uz`) tomonidan bajarilgan.
  2. **Frontend Avtomatik Testlar Nol Darajada:** `ubms-frontend` loyihasida unit yoki E2E testlar mavjud emas (0 spec fayl).
  3. **Avtomatik Off-site DB Backup va Disaster Recovery (DR) Sinalmaganligi:** Zira avtomatik S3 backup va restore testi avtomatlashtirilmagan.
* **💰 Tavsiya etilgan bozor narxi:** **$38,250 USD** (453,147,750 UZS) — NestJS/Prisma multi-tenant backend va 4-in-1 biznes modulining yuqori arxitekturasi va testlanmagan frontend risklari muvozanatiga asoslangan.

---

## 1. Struktura va hajm

* **Ish katalogi:** `c:\Users\ALFA\Desktop\boshqar.uz`
* **Jami manba fayllari:** 558 ta fayl, 143 ta papka
* **Hajm manbai:**
  * **Sof ilova kodi (Source Code):** 14.31 MB
  * **Kutubxonalar (node_modules):** 922.47 MB
* **Git statistikasi:**
  * Jami commitlar: 84 ta
  * Birinchi commit: 2026-08-13
  * Oxirgi commit: 2026-08-22
  * Contributorlar soni: 1 (`boshqar.uz`)
* **Kengaytma bo'yicha fayllar va kod qatorlari:**
  * `.vue`: 214 fayl (46,404 qator)
  * `.ts`: 209 fayl (27,671 qator)
  * `.prisma`: 1 fayl (1,026 qator)
  * `.json`: 23 fayl (28,388 qator)
  * `.md`: 32 fayl (4,009 qator)
  * Boshqa (`.sh`, `.yml`, `.css`, `.html`): 1,000+ qator

---

## 2. 12 nuqtai nazardan baholash

| # | Rol | Ball | ✅ Kuchli tomonlar | ⚠️ Zaif tomonlar | 🎯 10/10 uchun yo'l xaritasi |
|---|---|---|---|---|---|
| 1 | 🏗️ Backend Architect | **9.0 / 10** | NestJS 29 ta modular architecture (`app.module.ts`), Prisma 1,027 qatorli to'liq DB normalizatsiyasi, `TenantMiddleware` izolyatsiyasi. | Ba'zi servislarda (`suppliers.service.ts`) ko'p qadamli DB amallari Prisma `$transaction`siz bajarilmoqda. | `src/modules/suppliers` va `inventory`dagi barcha o'zgarishlarni `$transaction` bilan o'rang. |
| 2 | 🎨 Frontend/UX Mutaxassisi | **9.0 / 10** | Vue 3 Composition API + TypeScript, Tailwind CSS responsive dizayn, Lucide iconlar va izchil tokenlar (`index.css`). | Ba'zi modal va slayderlarda keyboard trap va ARIA atributlari to'liq kiritilmagan. | Modal overlay va dropdown komponentlariga `aria-expanded`, `aria-label` va Keyboard focus trap qo'shing. |
| 3 | 🔐 Xavfsizlik Auditori | **9.0 / 10** | JWT auth token versioning, RBAC (`PermissionGuard`), Global NestJS `ValidationPipe`, `@nestjs/throttler` brute-force himoyasi. | `npm audit` bo'yicha dependency zaifliklari to'liq avtomatik skan qilinmaydi. | CI/CD pipeline'ga `npm audit --audit-level=high` bosqichini majburiy qilib kiriting. |
| 4 | ⚙️ DevOps/SRE | **7.0 / 10** | GitHub Actions CI/CD (`ci.yml` & `ci-cd.yml`), Docker Compose production (`docker-compose.prod.yml`), Sentry log monitoring. | Staging environment va 1-click zero-downtime rollback avtomatlashtirilmagan. | GitHub Actions'ga Staging environment deploy va zero-downtime blue-green script qo'shing. |
| 5 | 🧪 QA Muhandisi | **5.0 / 10** | Backendda 22 ta `.spec.ts` unit test fayllari bor (`auth.service.spec.ts`, `orders.service.spec.ts`). | Frontendda unit testlar va E2E automation testlar umuman mavjud emas (0 spec fayl). | `ubms-frontend` uchun Vitest + Playwright E2E test qamrovini kamida 50% ga yetkazing. |
| 6 | 📊 Product Manager / Biznes Analitik | **10.0 / 10** | 4-in-1 multi-industry platforma (Chakana savdo POS + Restoran KDS + Xizmat ko'rsatish + Soliq.uz fiskallash + Telegram bot). | Hali Uzum Market / Wildberries kabi marketplace'lar bilan avto-sync integratsiyasi yo'q. | Uzum Market va Wildberries sotuvchilari uchun tovar qoldig'i avto-sync modulini ishlab chiqing. |
| 7 | 🌱 Junior Dasturchi | **9.0 / 10** | Tushunarli nomlash, 32 ta chuqur Markdown hujjatlar, `start-all.ps1` orqali 1-click ishga tushirish, Swagger API hujjatlari. | Ba'zi POS composable va view fayllari (`POS.vue`) 500+ qatordan oshib ketgan. | `POS.vue` va `DefaultLayout.vue` fayllarini kichikroq atomik komponentlarga ajrating. |
| 8 | 🗄️ Database Architect | **9.0 / 10** | Clean UUID PKs, FK constraints, Decimal financial precision, 25+ indekslar (`@@index([businessId, branchId, createdAt])`). | Avtomatik snapshot backup va point-in-time restore testi mavjud emas. | PostgreSQL pg_dump avto-cron va Amazon S3'ga shifrlangan backup yuklash modulini sozlang. |
| 9 | ⚡ Performance Engineer | **7.0 / 10** | Redis Cache integration (`CacheModule`), NestJS Gzip compression, Vite code splitting, indexlangan tezkor query'lar. | Ba mezon rasmlar (banner va landing PNG/JPG fayllar) 780KB - 1.1MB o'lchamda uncompressed turibdi. | Media resurslarni WebP formatiga o'tkazib, sharp/imagemin orqali 80% siqing. |
| 10 | 💼 Investor / VC Nuqtai Nazari | **7.0 / 10** | O'zbekiston kichik va o'rta biznesi uchun ulkan bozor, multi-tenant SaaS arxitektura, Soliq.uz legal tayyorlik. | **Bus Factor Risk:** Loyihani 1 kishi (`boshqar.uz`) yozgan, jamoaviy bog'liqlik xavfi yuqori. | Jamoaga ikkinchi core dasturchini qo'shing va bus-factor xavfini kamaytiring. |
| 11 | 🎯 Raqobat Tahlilchisi | **8.0 / 10** | Billz, Poster va MoySklad'dan farqli ravishda bitta platformada 4 xil biznes turini Soliq.uz bilan integratsiyalagan. | Billz kabi brend taniqliligi va marketpleyslar bilan tayyor ekotizimi yetishmaydi. | Bepul onboarding va 14 kunlik trial bilan tajovuzkor marketing strategiyasini yo'lga qo'ying. |
| 12 | 👤 Real Foydalanuvchi Nuqtai Nazari | **8.0 / 10** | Kassa va POS interfeysi qulay, tezkor barcode qidiruv va Telegram bot orqali bildirishnomalar mavjud. | Chek ajratish (split bill) va kassa skaneri tezkor bosilganda modal oyna chalg'itishi mumkin. | Restoran rejimida 1-click split-bill funksiyasini va barcode hotkey izolyatsiyasini qo mezon. |

**Umumiy o'rtacha ball:** `(9+9+9+7+5+10+9+9+7+7+8+8) / 12 = 7.75 / 10`

---

## 3. Kritik kamchiliklar (Gap Analysis)

1. 🔴 **Faqat bitta dasturchiga bog'liqlik (Bus Factor Risk):** Git commitlarining 100% qismi 1 ta akkauntdan bajarilgan. Dasturchi yo'qolgan taqdirda loyihani ushlab turish xavfi yuqori.
   * *Tuzatish vaqti:* 2-3 hafta (yangi dasturchiga onboarding o'tkazish).
2. 🟠 **Frontend Avtomatik Testlar Nol Darajada:** `ubms-frontend` papkasida birorta ham unit yoki E2E test yo'q. Kodga o'zgarish kiritilganda kassa/POS buzilib qolish riski bor.
   * *Tuzatish vaqti:* 40 soat.
3. 🟠 **Avtomatik Off-site DB Backup va Disaster Recovery (DR) Yo'qligi:** Bazaning kunlik cloud (S3/MinIO) backup va avtomatik qayta tiklash testi mavjud emas.
   * *Tuzatish vaqti:* 16 soat.
4. 🟡 **Media Resurslar Optimallashtirilmagan:** `public` va `assets` papkasidagi PNG/JPG rasmlar 780KB - 1.1MB bo'lib, mobil internetda sahifa yuklanishini sekinlashtiradi.
   * *Tuzatish vaqti:* 6 soat.
5. 🟡 **Accessibility (A11y) Kamchiliklari:** Modal oynalar va POS interfeysida keyboard navigation hamda ARIA label'lar yetarsiz.
   * *Tuzatish vaqti:* 20 soat.
6. 🟡 **Load Testing (Yuklama Sinovi) O'tkazilmagan:** 500+ bir vaqtda ishlovchi kassalar uchun K6/Autocannon stress testi o'tkazilmagan.
   * *Tuzatish vaqti:* 16 soat.
7. 🟡 **Marketplace Sync Integratsiyasi Yo'qligi:** Uzum Market va Wildberries bilan tovar qoldiqlari avto-sync rejimi yo'q.
   * *Tuzatish vaqti:* 60 soat.
8. 🟢 **Staging Environment CI/CD Avtomatizatsiyasi Yo'qligi:** Prod ga chiqarishdan oldin avtomatik staging smoke-test bosqichi kiritilmagan.
   * *Tuzatish vaqti:* 12 soat.

---

## 4. Bozor bahosi (Valuation)

Joriy valyuta kursi (Markaziy Bank, 2026-avgust): **1 USD = 11,847 UZS**

### A) Cost-based (Ishlab chiqarish tannarxi)
* Jami ishlab chiqarish soati: **~1,000 soat** (Backend: 350h, Frontend: 450h, Bot & Desktop: 120h, DevOps/Infra: 80h)
* O'zbekiston bozoridagi Senior/Team stavkasi: $20 – $35 / soat -> **$20,000 – $35,000 USD**
* Xalqaro bozordagi Senior/Team stavkasi: $50 – $100 / soat -> **$50,000 – $100,000 USD**

### B) Market-comparable (Real Bozor Solishtirmasi)
* MIN (Boshlang'ich/Testlanmagan holat): **$15,000 USD** (177.7 mln UZS)
* MAX (To'liq mukammal, E2E testlangan, jamoali holat): **$45,000 USD** (533.1 mln UZS)

### 🎯 Tavsiya etilgan aniq narx
$$\text{Narx} = \text{Min} + \left(\frac{\text{Audit Score}}{10}\right) \times (\text{Max} - \text{Min})$$
$$\text{Narx} = \$15,000 + (0.775 \times \$30,000) = \mathbf{\$38,250\text{ USD}} \quad (\mathbf{453,147,750\text{ UZS}})$$

*Asos:* Loyiha backend va database arxitekturasi NestJS multi-tenant darajasida o'ta yuqori yozilgani, 4 xil tarmoqni Soliq.uz bilan qamragani, biroq frontend testlari yo'qligi hamda 1 dasturchi xavfi borligi sababli joriy bahosi **$38,250 USD** deb baholandi.

### 💳 SaaS Obuna Modeli Narxlari

| Tarif | Oyiga (USD) | Oyiga (UZS) | Kiritilgan funksiyalar |
|---|---|---|---|
| **Basic** | $19 / oy | 225,000 UZS | 1 do'kon/kafe, 2 kassa, Soliq.uz fiskallash, Ombor hisobi |
| **Pro** | $35 / oy | 415,000 UZS | 3 filial, Telegram Bot bildirishnomalari, Restoran KDS + Jadval bron qilish |
| **Enterprise** | $79 / oy | 935,000 UZS | Cheksiz filiallar, Multi-currency, Dedicated server, 24/7 SLA qo'llab-quvvatlash |

*Breakeven:* O'rtacha ARPU $30/oy bo'lganda, 100 ta faol obunachi bilan yillik daromad $36,000 USD ni tashkil etadi va 13 oy ichida ilovaning custom ishlab chiqarish tannarxini to'liq oqlaydi.

---

## 5. Raqobatdan ajralib turish uchun takliflar

| Funksiya / Modul | Murakkablik | Soat | Jahon narxi | O'zbekiston narxi | Tavsiya etilgan narx | Nega ajralib turadi |
|---|---|---|---|---|---|---|
| **Uzum & Wildberries Auto-Sync** | Yuqori | 60 | $3,000–$6,000 | $700–$1,500 | $1,200 | Billz va Poster faqat o'z kassa va saytini sinxronlaydi, Uzum Market qoldiqlarini real-vaqtda sinxronlay olmaydi. |
| **AI Demand Forecasting** | O'rta | 40 | $2,000–$4,000 | $500–$1,000 | $800 | Qaysi tovar qachon tugashini va qancha zakaz berish kerakligini AI bashorat qiladi. |
| **Face ID Staff Clock-in** | O'rta | 35 | $1,750–$3,500 | $400–$800 | $650 | Kassa smenasini ochishda xodimlarning yuzini planshet kamerasida avto-tanish. |
| **Offline PWA & SQLite Sync** | Yuqori | 70 | $3,500–$7,000 | $800–$1,800 | $1,400 | Internet uzilganda ham POS kassa to'xtamaydi, SQLite'ga saqlab internet kelganda sync qiladi. |
| **Telegram Mini App Loyalty** | O'rta | 45 | $2,250–$4,500 | $500–$1,100 | $900 | Xaridorlar plastik kartasiz Telegram bot ichida keshbek va xarid tarixini ko'radi. |

---

## 6. Keyingi 3 oylik yo'l xaritasi (Roadmap)

### 1-oy: Barqarorlik va Xavfsizlik (Kritik Kamchiliklarni Yopish)
* `ubms-frontend` uchun Vitest va Playwright testlarini joriy etish ($800)
* Avtomatik PostgreSQL S3 Backup va Restore kron jarayonini sozlash ($300)
* Rasmlarni WebP ga o'tkazish va bundle o'lchamini siqish ($150)

### 2-oy: Marketpleys va AI Integratsiyalari
* Uzum Market va Wildberries avto-sync modulini ishlab chiqish ($1,200)
* AI sun'iy intellekt ombor bashorati modulini ulash ($800)

### 3-oy: Offline PWA va Telegram Mini App
* Offline PWA SQLite sync kassani yaratish ($1,400)
* Telegram Mini App mijozlar sodiqlik dasturini ishga tushirish ($900)
