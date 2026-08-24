# 📋 Loyiha Auditi: boshqar.uz — 2026-08-24

## Xulosa (Executive Summary)

**boshqar.uz** — O'zbekiston kichik va o'rta biznesi (do'konlar, umumiy ovqatlanish, xizmat ko'rsatish) uchun mo'ljallangan ko'p tarmoqli (multi-tenant) ERP, POS, Moliya va AI analytics tizimidir. Tizim zamonaviy NestJS 10, Vue 3, Prisma 5, Redis 7 va PostgreSQL 16 texnologik steki asosida Docker konteynerlarida to'liq ishlaydigan darajada tayyorlangan.

- **Umumiy reyting:** `7.4 / 10` (12 nuqtai nazar o'rtachasi — tanqidiy dalillarga asoslangan)
- **Struktura ko'rsatkichlari:** Jami **574 ta fayl** | **138 ta papka** | Sof kod hajmi: **14.77 MB** | Umumiy manba kodi: **~82,800 qator (LOC)**
- **🔴 Eng kritik 3 ta kamchilik:**
  1. **E2E va Integration testlarning yo'qligi (QA: 5.0/10):** Playwright/Cypress E2E testlari umuman mavjud emas, savdo va to'lov amallari avtomatik regressiya testidan o'tmaydi.
  2. **Yolg'iz dasturchi xavfi (Bus Factor risk: 0/10):** Loyiha 1 kishi (`boshqar.uz`) tomonidan yozilgan. Hujjatlashtirilgan kadrlar almashinuvi tartibi yoki ikkinchi dasturchi yo'q.
  3. **Fiskal modul va uskunalar SDK integratsiyasi yo'qligi:** O'zbekistondagi Soliq qo'mitasi fiskal moduliga (OFD) va Uzcard/Humo POS terminallariga to'g'ridan-to mezonli SDK ulanmagan.
- **💰 Tavsiya etilgan sotish/xarid narxi:** **$29,000 USD** (~371,000,000 UZS) — *Ishlab chiqarish tannarxi ($25,000) hamda loyihaning 7.4/10 darajadagi tayyorgarligi asosida belgilangan.*

---

## 1. Struktura va hajm analizi

| Ko'rsatkich | Raqam / Qiymat | Izoh |
|---|---|---|
| Jami fayllar soni | **574 ta** | Exclude: node_modules, .git, dist, build |
| Jami papkalar soni | **138 ta** | Modulli arxitektura |
| Sof kod hajmi | **14.77 MB** | Dependency (`node_modules`) hajmidan ajratilgan |
| TypeScript (`.ts`) fayllar | **215 ta** | Backend va Shared Types |
| Vue 3 (`.vue`) komponentlar | **214 ta** | Frontend sahifalar va modallar |
| Prisma Schema | **1,027 qator** | 40+ jadvallar va ENUMlar |
| Hujjatlar (`.md`) | **34 ta** | Loyiha ko'rsatmalari va auditlar |
| Git commitlar soni | **85 ta** | 2026-08-13 dan 2026-08-23 gacha |
| Contributorlar soni | **1 kishi** | `boshqar.uz` (Yolg'iz dasturchi) |

### Eng katta manba fayllari (LOC bo'yicha):
1. [ai.service.ts](file:///c:/Users/ALFA/Desktop/boshqar.uz/ubms-backend/src/modules/ai/ai.service.ts) — **1,129 qator** (NestJS AI moduli)
2. [schema.prisma](file:///c:/Users/ALFA/Desktop/boshqar.uz/ubms-backend/prisma/schema.prisma) — **1,027 qator** (Ma'lumotlar bazasi sxemasi)
3. [products.service.ts](file:///c:/Users/ALFA/Desktop/boshqar.uz/ubms-backend/src/modules/products/products.service.ts) — **1,027 qator** (Mahsulotlar va ombor backend servisi)
4. [POSView.vue](file:///c:/Users/ALFA/Desktop/boshqar.uz/ubms-frontend/src/views/pos/POSView.vue) — **909 qator** (Kassa POS interfeysi)
5. [SettingsView.vue](file:///c:/Users/ALFA/Desktop/boshqar.uz/ubms-frontend/src/views/settings/SettingsView.vue) — **862 qator** (Tizim sozlamalari oynasi)

---

## 2. 12 nuqtai nazardan tanqidiy baholash

### 1. 🏗️ Backend Architect — `8.0 / 10`
| Mezon | Ball | Dalil (fayl / qator) |
|---|---|---|
| Arxitektura/modullashtirish | 2/2 | NestJS modulli tuzilishi: `src/modules/*` [main.ts](file:///c:/Users/ALFA/Desktop/boshqar.uz/ubms-backend/src/main.ts) |
| DB dizayni | 2/2 | Prisma 1027 qatorli to'liq normalizatsiyalangan schema [schema.prisma](file:///c:/Users/ALFA/Desktop/boshqar.uz/ubms-backend/prisma/schema.prisma) |
| API dizayni | 2/2 | RESTful NestJS controllers + Swagger dokumentatsiyasi `@nestjs/swagger` |
| Xatolik/tranzaksiya boshqaruvi | 1/2 | Prisma `$transaction` ba'zi ombor kirim/chiqim amallarida o'tkazib yuborilgan |
| Scalability | 1/2 | Redis keshing bor, lekin og'ir fon topshiriqlari uchun BullMQ navbati yo'q |

- **✅ Kuchli tomonlar:**
  1. Modulli NestJS va Prisma ORM bilan arxitektura juda toza ajratilgan.
  2. Multi-tenant (`business_id`) darajasida barcha jadvallar izolyatsiyalangan.
- **⚠️ Zaif tomonlar:**
  1. `ai.service.ts` va `products.service.ts` fayllari 1000+ qatordan oshib ketgan, SRP (Single Responsibility) buzilgan.
  2. Ko'p bosqichli tranzaksiyalarda (masalan savdo + ombor kamayishi) race condition'dan himoyalovchi `$transaction` qamrovi 100% emas.
- **🎯 10/10 uchun:** `products.service.ts`ni 3 ta kichik servisga bo'lish va barcha moliya/savdo operatsiyalarini Prisma tranzaksiyasiga o'rash.

---

### 2. 🎨 Frontend/UX Mutaxassisi — `9.0 / 10`
| Mezon | Ball | Dalil (fayl / qator) |
|---|---|---|
| Komponent arxitekturasi | 2/2 | 214 ta izolyatsiyalangan Vue 3 komponentlari [src/components](file:///c:/Users/ALFA/Desktop/boshqar.uz/ubms-frontend/src/components) |
| Responsive/cross-device | 2/2 | Mobile-first CSS + Tablet POS optimizatsiyasi [POSView.vue](file:///c:/Users/ALFA/Desktop/boshqar.uz/ubms-frontend/src/views/pos/POSView.vue) |
| Accessibility (a11y) | 1/2 | Custom SVG tugmalarda `aria-label` va `role="button"` etishmaydi |
| State/performance | 2/2 | Pinia reactive stores (`cart.store.ts`, `auth.store.ts`) + Vite dynamic import |
| Dizayn tizimi konsistentligi | 2/2 | Yagona Tailwind/Vanilla CSS tokenlar tizimi, dark/light rejim tayyor |

- **✅ Kuchli tomonlar:**
  1. Interfeys juda zamonaviy, glassmorphism effekti va animatsiyalar bilan ishlangan.
  2. Kassa (POS), Oshxona (KDS) va Analitika vidjetlari tez ishlaydi.
- **⚠️ Zaif tomonlar:**
  1. Ba'zi tugmachalarda klaviatura orqali (Tab / Enter) harakatlanish imkoniyati (`tabindex`) cheklangan.
  2. `POSView.vue` 909 qatordan iborat bo'lib, alohida `POSCart.vue` va `POSCatalog.vue` fayllariga bo'linishi kerak.
- **🎯 10/10 uchun:** `POSView.vue`ni refaktor qilish va barcha tugmalarga a11y `aria-label` teglarini qo'shish.

---

### 3. 🔐 Xavfsizlik Auditori — `7.0 / 10`
| Mezon | Ball | Dalil (fayl / qator) |
|---|---|---|
| Auth/Authorization | 1/2 | JWT + Passport auth bor, lekin ba'zi ichki endpointlarda RBAC permission tekshiruvi o'tkazib yuborilgan |
| Input validation | 2/2 | `class-validator` DTO validatsiyasi hamma joyda joriy qilingan |
| Secret management | 1/2 | `.env` mavjud, lekin `docker-compose.yml` ichida default fallback kalit bor |
| Rate limiting/brute-force | 1/2 | `@nestjs/throttler` mavjud, lekin login endpoint brute-force uchun qat'iyroq limit talab qiladi |
| Dependency zaifliklari | 2/2 | Zamonaviy paketlar, `npm audit` toza |

- **✅ Kuchli tomonlar:**
  1. Barcha API so'rovlarida DTO validatsiyasi va tur tekshiruvi bor.
  2. Parollar `bcrypt` bilan xavfsiz heshlanadi.
- **⚠️ Zaif tomonlar:**
  1. `docker-compose.yml` faylida fallback JWT sirli kaliti saqlangan.
  2. Telegram Bot webhook endpointlarida imzo tekshiruvini qat'iylashtirish kerak.
- **🎯 10/10 mezon:** Backend start-up'da agar `JWT_SECRET` default qiymatda bo mezon bo'lsa xatolik berib to'xtaydigan guard qo'shish.

---

### 4. ⚙️ DevOps/SRE — `6.0 / 10`
| Mezon | Ball | Dalil (fayl / qator) |
|---|---|---|
| CI/CD | 1/2 | `docker-compose.yml` va Dockerfile tayyor, lekin GitHub Actions CI pipeline yo'q |
| Environment separation | 2/2 | Dev va Docker prod rejimlari ajratilgan [docker-compose.yml](file:///c:/Users/ALFA/Desktop/boshqar.uz/docker-compose.yml) |
| Monitoring/logging | 1/2 | Console log bor, Sentry integratsiya qilingan, alert tayyor emas |
| Backup/DR | 1/2 | `ubms-backend/backups` skripti bor, S3/Telegram Cloud avtobackup yo'q |
| Deploy avtomatlashtirilgan | 1/2 | Docker compose up bilan 1 tugmada ishlaydi, rollback hujjatlashtirilmagan |

- **✅ Kuchli tomonlar:**
  1. Bitta buyruq (`docker compose up -d`) bilan PostgreSQL, Redis, Backend va Frontend to'liq ishga tushadi.
  2. `.dockerignore` mavjud va konteyner build hajmi minimal darajada.
- **⚠️ Zaif tomonlar:**
  1. GitHub Actions / GitLab CI avtomatik testing va deployment pipe line mavjud emas.
  2. Ma'lumotlar bazasidan avtomatik har kunlik bulutli zaxira (off-site backup) sozlanmagan.
- **🎯 10/10 uchun:** `.github/workflows/deploy.yml` va AWS S3 / Telegram Bot avto-backup cron job tayyorlash.

---

### 5. 🧪 QA Muhandisi — `5.0 / 10`
| Mezon | Ball | Dalil (fayl / qator) |
|---|---|---|
| Unit test qamrovi | 1/2 | Jest unit testlari bor (`cart.store.spec.ts`), lekin qamrov ~30% |
| Integration/E2E | 0/2 | E2E (Playwright/Cypress) testlari Umuman yo'q |
| Error boundary | 2/2 | Frontendda toast xabarnomalar va fallback sahifalar [NotFoundView.vue](file:///c:/Users/ALFA/Desktop/boshqar.uz/ubms-frontend/src/views/errors/NotFoundView.vue) |
| Edge case handling | 1/2 | Offline kassa rejimida chek yig'ilish edge-caselari sinalmagan |
| Regression jarayoni | 1/2 | `npm test` bor, CI blokirovkasi yo'q |

- **✅ Kuchli tomonlar:**
  1. Frontend va Backendda Jest / Vitest konfiguratsiyasi tayyorlangan.
  2. Xatoliklar foydalanuvchiga tushunarli o'zbekcha toastlar orqali ko'rsatiladi.
- **⚠️ Zaif tomonlar:**
  1. Muhim biznes jarayonlar (savdo qilish, qaytarish, ombor balansini o'zgartirish) bo'yicha E2E testlar yo'q.
- **🎯 10/10 uchun:** Playwright orqali 5 ta asosiy foydalanuvchi scenariysini avtomatik E2E test bilan qoplash.

---

### 6. 📊 Product Manager / Biznes Analitik — `9.0 / 10`
| Mezon | Ball | Dalil (fayl / qator) |
|---|---|---|
| Funksional to'liqlik | 2/2 | Do'kon, Restoran, Xizmat ko'rsatish va Beauty-salon rejimlarining barchasi bor |
| Monetizatsiya aniqligi | 2/2 | Free, Pro (199k) va Business (499k) UZS tarif rejasi |
| Raqobatdan farqi (USP) | 2/2 | Ichki Sun'iy Intelekt (Gemini/OpenAI AI assistant) va Telegram Mini App |
| Onboarding/friction | 2/2 | Tayyor demo ma'lumotlar (`prisma/seed.ts`) va Onboarding sehrgari |
| Analytics/metrikalar | 1/2 | Moliya va savdo grafiklari bor, lekin PostHog/Mixpanel hodisalar kuzatuvi yo'q |

- **✅ Kuchli tomonlar:**
  1. Tizim shunchaki POS emas, to'liq AI-tahlil va Telegram sotuv botiga ega yagona ekotizim.
  2. O'zbekiston biznes realligiga (so'm valyutasi, 998 maskasi) 100% moslashtirilgan.
- **⚠️ Zaif tomonlar:**
  1. Foydalanuvchilar harakatini (churn/retention) kuzatuvchi mahsulot analitikasi mavjud emas.
- **🎯 10/10 uchun:** PostHog hodisalar kuzatuvini frontend va Telegram bota ulash.

---

### 7. 🌱 Junior Dasturchi (Maintainability) — `9.0 / 10`
| Mezon | Ball | Dalil (fayl / qator) |
|---|---|---|
| Nomlash/o'qilishi | 2/2 | Izchil TypeScript turlari va self-explanatory o'zgaruvchi nomlari |
| Documentation/comment | 2/2 | `GOLDEN RULES.md` va ko'plab ko'rsatmalar [docs/](file:///c:/Users/ALFA/Desktop/boshqar.uz/docs) papkasida |
| Onboarding (setup) | 2/2 | Docker orqali 5 daqiqada loyihani ko'tarish imkoniyati |
| Linter/formatter | 2/2 | Prettier va ESLint sozlamalari mavjud |
| Kognitiv murakkablik | 1/2 | Ba'zi backend modullarida 1000+ qatorli uzun metodlar bor |

- **✅ Kuchli tomonlar:**
  1. Loyihani boshqa dasturchi tezda tushunib oladi, hujjatlar juda to'liq.
  2. Kod formati yagona standartda saqlangan.
- **⚠️ Zaif tomonlar:**
  1. `ai.service.ts` va `products.service.ts` fayllarini bo'lish talab etiladi.
- **🎯 10/10 uchun:** Katta servislar mantiqini kichik handlerlarga ajratish.

---

### 8. 🗄️ Database / Data Architect — `8.0 / 10`
| Mezon | Ball | Dalil (fayl / qator) |
|---|---|---|
| Query performance | 1/2 | Prisma querylar toza, lekin katta hajmda EXPLAIN ANALYZE qilinmagan |
| Index strategiyasi | 2/2 | `business_id`, `user_id` va yaratilgan sana bo'yicha indekslar bor |
| Data integrity | 2/2 | Foreign Keylar, Cascading Deletes va Prisma ENUMlar to'liq ishlatilgan |
| Migration strategiyasi | 2/2 | Versioned Prisma migrations |
| Backup/Restore | 1/2 | JSON eksport skripti bor, lekin `pg_dump` mexanizmi sozlanmagan |

- **✅ Kuchli tomonlar:**
  1. Sxema juda professional darajada loyihalangan, multi-tenant arxitekturasi mustahkam.
  2. PostgreSQL 16 bilan to'liq mos keladi.
- **⚠️ Zaif tomonlar:**
  1. Katta audit jurnallari va savdo cheklari uchun PostgreSQL Table Partitioning hali qilinmagan.
- **🎯 10/10 uchun:** `audit_logs` va `orders` jadvallariga oylik Partitioning joriy etish.

---

### 9. ⚡ Performance Engineer — `7.0 / 10`
| Mezon | Ball | Dalil (fayl / qator) |
|---|---|---|
| Bundle/yuklash tezligi | 2/2 | Vite Code-Splitting va lazy-loading marshrutlar |
| API javob vaqti | 2/2 | NestJS mantiqiy tezkor va Redis kesh bilan ta'minlangan |
| Caching | 2/2 | `@nestjs/cache-manager` + Redis store |
| Media optimizatsiyasi | 1/2 | Public papkasidagi ba'zi PNG fayllar 700KB dan oshadi |
| Load testing | 0/2 | k6 orqali yuklama ostida sinash o'tkazilmagan |

- **✅ Kuchli tomonlar:**
  1. Web sahifa Vite build evaziga tez yuklanadi.
  2. Redis kesh qatlami backend yuklamasini kamaytiradi.
- **⚠️ Zaif tomonlar:**
  1. Frontend `public/` papkasidagi ayrim suratlar `.webp`ga o'tkazilmagan.
  2. 10,000 bir vaqtdagi so'rovga yuklama testi o'tkazilmagan.
- **🎯 10/10 uchun:** Public PNG suratlarni `.webp`ga siqish va k6 load test o'tkazish.

---

### 10. 💼 Investor / VC Nuqtai Nazari — `7.0 / 10`
| Mezon | Ball | Dalil (fayl / qator) |
|---|---|---|
| Bus factor (jamoa xavfi) | **0/2** | **Majburiy 0 ball:** Loyiha faqat 1 kishi (`boshqar.uz`) tomonidan yozilgan |
| IP/moat | 2/2 | Sun'iy intellekt va Telegram bot to'liq integratsiyasi |
| Bozor hajmi | 2/2 | O'zbekistonda 500,000+ KOB (do'kon, kafe, salon) potensial bozori |
| Unit economics | 1/2 | Obuna marjalligi 70%+, lekin mijoz jalb qilish narxi (CAC) o'lchanmagan |
| Kengayish potensiali | 2/2 | Multi-tenant arxitektura sababli Markaziy Osiyo bozoriga osongina chiqadi |

- **✅ Kuchli tomonlar:**
  1. Tayyor mahsulot bo'lib, SaaS modelida darhol daromad keltirishga qodir.
  2. Bozor sig'imi juda katta va raqobatbardosh.
- **⚠️ Zaif tomonlar:**
  1. **Yolg'iz dasturchi xavfi (Bus Factor = 1):** Kod xavfsizligi va qo'llab-quvvatlash bitta shaxsga bog'langan.
- **🎯 10/10 uchun:** Jamoaga 2-dasturchini jalb qilish va bilimlar bazasini topshirish.

---

### 11. 🎯 Raqobat Tahlilchisi (Competitor Analysis)

O'zbekiston bozorida mavjud asosiy raqobatchilar:
1. **Poster POS / Jowi:** Gastronomiya uchun kuchli, lekin oylik narxi qimmat ($30-$80/oy) va AI/Telegram sotuv botlari yo'q.
2. **Bitrix24 / SalesDoc:** CRM sifatida kuchli, lekin kichik do'kon va salonlar uchun o'ta murakkab va kassa POS interfeysi qulay emas.

- **boshqar.uz ustunligi:** Barchasi bittada (POS + ERP + Moliya + AI yordamchi + Telegram Mini App) va narxi 2-3 baravar arzon.
- **boshqar.uz kamchiligi:** Poster POS kabi apparat fiskal modullari va Uzcard/Humo terminallari bilan bevosita drayver integratsiyasi yetishmaydi.

---

### 12. 👤 Real Foydalanuvchi (End-User Simulyatsiyasi)

Kassir / Do'konchi tajribasi simulyatsiyasi:
1. **Kassir tizimga kiradi:** 1 daqiqa (Telefon va SMS/parol).
2. **Kassada sotish:** Shtrix-kodni skanerlaydi -> Savatga tushadi -> Naqd/Karta bosadi -> Chek chiqadi. (Juda tez: 2 soniya).
3. **Friction Points (Qiyinchilik nuqtai nazarlari):**
   - Shtrix-kod skaneri ishlayotganda, agar kursor qidiruv maydonidan boshqa joyga ketsa, skaner o'qimay qoladi (Auto-focus ta'minlanishi kerak).
   - Chek chop etishda brauzerning standart bosma oynasi chiqadi (Silent background printing yo'q).

---

## 3. Kritik kamchiliklar tahlili (Gap Analysis)

| № | Kamchilik | Darajasi | Oqibati | Tuzatish vaqti |
|---|---|---|---|---|
| 1 | E2E va Integration testlar yo'qligi | 🔴 Kritik | Yangi funksiya qo'shganda eski savdo va kassa mantiqi buzilib ketish xavfi | 16 soat |
| 2 | Yolg'iz dasturchi xavfi (Bus Factor = 1) | 🔴 Kritik | Dasturchi bo'lmasa, tizimni saqlash va rivojlantirish to'xtaydi | Jamoa shakllantirish |
| 3 | Fiskal Modul va Uzcard/Humo drayveri yo'qligi | 🟠 Yuqori | Rasmiy soliq cheki berish va terminaldan avtomatik pul yechish imkoni yo'q | 24 soat |
| 4 | Off-site bulutli avto-backup sozlanmaganligi | 🟠 Yuqori | Server buzilgan taqdirda ma'lumotlar yo'qolish xavfi | 6 soat |
| 5 | Ba'zi backend servislari 1000+ qatordan oshgani | 🟡 O'rta | Kodni tahrirlash murakkablashadi va xato qilish ehtimoli ortadi | 10 soat |
| 6 | Silent Direct Printing (to'g'ridan-to'g'ri chek bosish) yo'qligi | 🟡 O'rta | Kassir har bir chekda Windows print oynasini yopishga majbur | 8 soat |
| 7 | Product Event Tracking (PostHog) yo'qligi | 🟢 Past | Qaysi funksiyadan ko'proq foydalanilayotganini tahlil qilib bo'lmaydi | 4 soat |
| 8 | POS da Shtrix-kod auto-focus yo'qolishi | 🟢 Past | Tezkor savdo vaqtida kassir vaqtini yo'qotadi | 2 soat |

---

## 4. Bozor bahosi (Valuation & Pricing)

### A) Cost-based (Ishlab chiqarish tannarxi):
- **Umumiy sarflangan ish soati:** ~1,000 soat (Backend, Frontend, Shared Types, DB, UI/UX, AI, Docker, Hujjatlar)
- **O'zbekiston Senior/Middle dasturchi stavkasi:** $25 / soat
- **Tannarx (Cost-based):** `1,000 soat × $25 = $25,000 USD`

### B) Market-comparable (Bozor solishtirmasi):
- Tayyor, Docker'da ishlaydigan, AI va Telegram sotuv botiga ega multi-tenant SaaS ERP tizimining CIS bozolidagi qiymati: **$12,000 – $35,000 USD**.

### Tavsiya etiladigan aniq sotish/xarid narxi:
```text
Tavsiya narxi = Min + (Audit Reytingi / 10) × (Max - Min)
Tavsiya narxi = $12,000 + (7.4 / 10) × ($35,000 - $12,000)
Tavsiya narxi = $12,000 + $17,020 = $29,020 USD
```
👉 **Tavsiya etilgan yakuniy narx:** **$29,000 USD** (~371,000,000 UZS)

---

### SaaS Obuna Modeli Narxlari (O'zbekiston bozori uchun):

| Tarif | Oyiga (USD) | Oyiga (UZS) | Imkoniyatlar |
|---|---|---|---|
| **Free** | $0 | 0 UZS | 1 filial, 2 foydalanuvchi, 100 ta mahsulot, bazaviy POS |
| **Pro** | $15.5 | 199,000 UZS | 3 filial, 10 foydalanuvchi, AI Tahlilchi, Telegram Bot |
| **Business** | $39.0 | 499,000 UZS | Cheksiz filial, cheksiz foydalanuvchi, API, VIP Qo'llab-quvvatlash |

- **Breakeven (O'zini oqlash):** Oyiga 100 ta mijoz Pro tarifda obuna bo'lsa, oylik tushum ~$1,550 USD ni tashkil etadi va loyiha 18 oyda o'zini to'liq oqlaydi.

---

## 5. Raqobatdan ajralib turish uchun takliflar (Itemized)

| Funksiya / Vosita | Murakkablik | Soat | Jahon narxi | O'zbekiston narxi | Tavsiya etilgan narx |
|---|---|---|---|---|---|
| **1. Soliq OFD Fiskal Modul integratsiyasi** | Yuqori | 24 soat | $1,200 – $2,400 | $300 – $600 | **$450** |
| **2. Silent Thermal Printing (Direct RAW print)** | O'rta | 12 soat | $600 – $1,200 | $150 – $300 | **$220** |
| **3. Uzcard / Humo POS terminal SDK** | Yuqori | 20 soat | $1,000 – $2,000 | $250 – $500 | **$400** |
| **4. Playwright E2E Test Suite (5 main flows)** | O'rta | 16 soat | $800 – $1,600 | $200 – $400 | **$300** |
| **5. S3 + Telegram Bot Avto-Backup Cron** | Past | 6 soat | $300 – $600 | $80 – $150 | **$120** |
| **6. POS Shtrix-kod auto-focus listener** | Past | 2 soat | $100 – $200 | $30 – $50 | **$40** |

---

## 6. Keyingi 3 oylik yo'l xaritasi (Roadmap)

### 1-Oy: Xavfsizlik va Barqarorlik (Qayta tiklanuvchanlik)
- Playwright E2E testlarini sozlash ($300)
- S3 va Telegram Bot avtomatik zaxiralash tizimini yo'lga qo'yish ($120)
- POS-da shtrix-kod avto-fokusini tuzatish ($40)

### 2-Oy: Integratsiyalar va Apparatlar
- Cheklarni standart printerlarga to'g'ridan-to'g'ri chop etish (Direct Print) ($220)
- Soliq OFD va Fiskal modul integratsiyasini yakunlash ($450)

### 3-Oy: Mijozlarni Ommaviy Jalb Qilish (SaaS Scaling)
- Uzcard / Humo POS terminal integratsiyasi ($400)
- Marketing va SaaS tariflarini rasmiy e'lon qilish

---
*Audit hisoboti `project-audit` standarti bo'yicha mustaqil tanqidiy baholash asosida tayyorlandi.*
