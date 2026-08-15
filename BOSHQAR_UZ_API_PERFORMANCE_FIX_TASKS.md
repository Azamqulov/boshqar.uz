# boshqar.uz — API Performance Fix Tasks (Antigravity)

> **DIQQAT, Antigravity:** Bu safar "ishladi, bo'ldi" deb ketaverma. Har bir task pastda ko'rsatilgan **aniq root cause** asosida yozilgan — production'da real o'lchandi (`vite build`, Prisma schema, service kodlari o'qib chiqildi). Har bir taskdan keyin **"Qanday tekshirish kerak"** bo'limida yozilgan tarzda o'zing tekshir, keyin keyingisiga o't. Pagination/limit/index masalasida "keyinroq to'g'rilarmiz" degan bahona ishlamaydi — bu tasklar aynan shuning uchun yozilgan.

**Muammo:** Frontend tez ochiladi, lekin login qilingandan keyin (`/dashboard`, `/pos`, `/products` va h.k.) data juda sekin keladi va UI qayta-qayta "loading" holatida qotib qoladi.

**Root cause (tasdiqlangan):**
1. `/inventory` endpoint'ida **pagination umuman yo'q** — biznesning barcha inventory qatorlari, har birida `product→category, unit` + `branch` include bilan, HAR SO'ROVDA to'liq qaytariladi.
2. `/products` default `limit=1000`, va frontend har doim shu limit bilan chaqiradi (`ubms-frontend/src/stores/data.store.ts`) — 1000 qator × 3 ta relation include.
3. `Inventory` jadvalida `businessId` ustuni yo'q, `product.businessId` orqali JOIN qilib filtrlanadi — to'g'ridan-to'g'ri indekslangan ustun mavjud emas.
4. Backend'da Redis/cache-manager hech qayerda ishlatilmagan (`package.json`da bor deb yozilgan, lekin kodda yo'q) — har bir so'rov to'g'ridan-to'g'ri Postgres'ga uradi.
5. `DefaultLayout.vue` mount bo'lganda `dataStore.prefetchAll()` 6-7 ta so'rovni **parallel** yuboradi (`Promise.allSettled`), eng sekin so'rov (`/inventory`) hammasini orqada ushlab turadi — foydalanuvchi bir vaqtning o'zida bir nechta skeleton/loading holatini ko'radi.

---

## TASK 1 — `/inventory` endpointiga pagination qo'shish (KRITIK, birinchi bajarilsin)

**Fayl:** `ubms-backend/src/modules/inventory/inventory.service.ts`

**Nima noto'g'ri:** `getInventory()` metodida `findMany` chaqiriladi, lekin `skip`/`take` yo'q — butun jadval bitta so'rovda qaytadi.

**Nima qilish kerak:**
- `getInventory(businessId, branchId?, query?)` signature'iga `page` va `limit` query parametrlarini qo'sh (default: `page=1`, `limit=100`).
- `findMany`ga `skip`/`take` qo'sh, `count()` bilan birga `Promise.all` qilib total sonni ham qaytar (`FindProductsQueryDto`dagi patternga o'xshab, `products.service.ts`dagi `findAll()` namunasidan foydalan — u yerda bu allaqachon to'g'ri qilingan).
- Frontend chaqiruvchi joyda (`InventoryView.vue`, `data.store.ts`ning `fetchInventory`) infinite-scroll yoki oddiy paginatsiya UI qo'shish kerak bo'lsa — avval backendni tugat, keyin menga xabar ber, frontend UI o'zgarishini alohida ko'rib chiqamiz.
- `dashboard.service.ts`dagi `getSummary()` ichida ham `inventory.findMany` chaqirilgan — **bu yerga pagination KERAK EMAS**, chunki u faqat aggregatsiya (jami qiymat, low-stock hisoblash) uchun, lekin `select` bilan faqat kerakli fieldlarni olish (`quantity`, `product.purchasePrice`, `product.minStock`) — bu allaqachon to'g'ri qilingan, qo'lingni tegizma.

**Qanday tekshirish kerak:** 500+ inventory qatori bo'lgan test biznesda `/inventory?limit=50` chaqirilganda response vaqti va payload hajmini solishtir (avval/keyin). Backend logda so'rov vaqtini o'lchash uchun oddiy `console.time`/`console.timeEnd` yoki NestJS interceptor qo'shsa bo'ladi.

---

## TASK 2 — `Inventory` jadvaliga `businessId` ustuni va index qo'shish

**Fayl:** `ubms-backend/prisma/schema.prisma`

**Nima noto'g'ri:**
```prisma
model Inventory {
  id          String   @id @default(uuid()) @db.Uuid
  branchId    String   @map("branch_id") @db.Uuid
  productId   String   @map("product_id") @db.Uuid
  ...
  @@unique([branchId, productId])
}
```
`businessId` yo'q — har bir so'rov `product: { businessId: ... }` orqali nested filter qiladi, bu Postgres'ni `Product` jadvali bilan JOIN qilib filtrlashga majbur qiladi, to'g'ridan-to'g'ri indeks ishlamaydi.

**Nima qilish kerak:**
1. `Inventory` modeliga `businessId String @map("business_id") @db.Uuid` ustuni qo'sh.
2. `@@index([businessId])` qo'sh (kerak bo'lsa `@@index([businessId, branchId])`).
3. Migration yoz: `npx prisma migrate dev --name add_business_id_to_inventory`.
4. **Backfill script yoz** — mavjud qatorlar uchun `businessId`ni `product.businessId`dan to'ldirish kerak (`Product` orqali JOIN qilib UPDATE). Bo'sh qoldirib ketma — production DB'da eski qatorlar bo'lishi mumkin.
5. Inventory yaratiladigan barcha joylarda (`inventory.service.ts`, `products.service.ts`dagi transaction ichida yangi inventory yaratilganda) endi `businessId`ni ham yozish kerak — hamma create/upsert joylarini top va yangila.
6. Shundan keyin `getInventory()` va `getSummary()`dagi `where: { product: { businessId } }` ni `where: { businessId }` ga almashtir — endi to'g'ridan-to'g'ri indeks ishlaydi, JOIN kerak emas.

**Qanday tekshirish kerak:** Migration'dan keyin `EXPLAIN ANALYZE` bilan eski va yangi query planlarini solishtir — `Seq Scan` yoki nested loop join emas, `Index Scan`/`Bitmap Index Scan` ko'rinishi kerak.

---

## TASK 3 — `/products` default limitini kamaytirish

**Fayllar:** `ubms-backend/src/modules/products/products.service.ts`, `ubms-frontend/src/stores/data.store.ts`

**Nima qilish kerak:**
- Backend'da `const limit = Number(query?.limit) || 1000;` — default `1000`ni `50` yoki `100`ga tush.
- Frontend'dagi `api.get('/products?limit=1000')` chaqiruvini olib tashla — endi default limit ishlatiladi, kerak bo'lsa `search`/`categoryId` filter bilan sahifalab chaqiriladigan qilib qayta ishla.
- **Agar frontend haqiqatan barcha mahsulotlarni bitta ro'yxatda ko'rsatishi shart bo'lsa** (masalan POS ekranida tez qidiruv uchun) — bu holatda `limit=1000`ni saqlab qolish mumkin, LEKIN unda albatta `select` bilan faqat kerakli fieldlarni qaytarish kerak (masalan `unit`ning to'liq obyektini emas, faqat `shortName`ni), va `include`ni `select`ga almashtirish kerak. Bu holatni tanlasang — menga qaysi ekranlarda to'liq ro'yxat kerakligini aniqlab, o'sha joy uchun alohida "lightweight" endpoint yoz (masalan `/products/lite`), qolgan joylarda paginatsiyalangan to'liq endpoint ishlatilsin.

**Qanday tekshirish kerak:** Network tab'da `/products` response hajmini (KB) va vaqtini avval/keyin solishtir.

---

## TASK 4 — Redisni haqiqatan ulash (cache-manager)

**Fayl:** yangi — `ubms-backend/src/common/cache/` yoki mavjud `config/` ichida

**Nima noto'g'ri:** `package.json`/README'da Redis bor deyilgan, lekin butun backend kodida `@nestjs/cache-manager` yoki `ioredis` import qilingan joy yo'q (tekshirildi — `grep -rn "redis" src` bo'sh natija berdi).

**Nima qilish kerak:**
1. `@nestjs/cache-manager` + `cache-manager-redis-store` (yoki `@keyv/redis`) o'rnat.
2. `AppModule`ga `CacheModule.registerAsync()` qo'sh, Redis connection'ni `.env`dagi `REDIS_URL`dan ol.
3. Eng ko'p chaqiriladigan va nisbatan kam o'zgaruvchi endpointlarga kesh qo'sh (TTL bilan):
   - `/dashboard/summary` — TTL ~30s
   - `/dashboard/charts` — TTL ~60s
   - `/categories` — TTL ~5min (kam o'zgaradi)
4. Cache key'da albatta `businessId` (va kerak bo'lsa `branchId`) bo'lishi shart — multi-tenant loyihada bitta bizneing keshi boshqa biznesga chiqib ketmasin.
5. Product/Inventory/Order create-update-delete bo'lganda tegishli cache key'larni invalidate qilishni unutma (masalan `CACHE_MANAGER.del()`).

**Qanday tekshirish kerak:** Ikki marta ketma-ket `/dashboard/summary` chaqir — ikkinchisi sezilarli tez qaytishi kerak (Redis'dan). Boshqa `businessId` bilan chaqirilganda ESKI biznesning ma'lumoti chiqmasligini tekshir (bu eng muhim — multi-tenant xatosi bo'lsa darhol menga xabar ber).

---

## TASK 5 — `prefetchAll()`ni kritik/nokritik so'rovlarga ajratish

**Fayl:** `ubms-frontend/src/stores/data.store.ts`, `ubms-frontend/src/layouts/DefaultLayout.vue`

**Nima noto'g'ri:** `prefetchAll()` categories, products, customers, suppliers, inventory, finance'ni bir vaqtda `Promise.allSettled` bilan yuboradi. UI esa umumiy "loading" holatini kutadi, shu sabab eng sekin so'rov (hozircha `/inventory`) hammasini orqada ushlaydi.

**Nima qilish kerak:**
- `prefetchAll()`ni ikkiga bo'l:
  - **Critical**: `fetchCategories()`, `fetchProducts()` — sahifa render bo'lishi uchun zarur, darhol chaqiriladi.
  - **Background**: `fetchCustomers()`, `fetchSuppliers()`, `fetchInventory()`, `fetchFinance()` — sahifa allaqachon ko'rinib turgan holda orqa fonda yuklanadi, har biri **mustaqil** loading holatiga ega bo'lsin (masalan Suppliers sahifasi o'zi ochilganda o'z skeletonini ko'rsatadi, boshqa hamma narsani kutmaydi).
- Har bir View componentida (`SuppliersView.vue`, `FinanceView.vue` va h.k.) faqat o'ziga kerakli data uchun loading state ko'rsat, global "hammasi tayyor bo'lguncha kutish" pattern'idan voz kech.

**Qanday tekshirish kerak:** Login qilgandan keyin Dashboard darhol (categories/products kelgach) ko'rinishi kerak, Inventory/Finance data orqa fonda asta-sekin to'ldirilishi kerak — foydalanuvchi hech qachon bo'sh oq ekranda uzoq kutmasligi kerak.

---

## Bajarish tartibi

1. TASK 1 (inventory pagination) — eng katta ta'sir, birinchi.
2. TASK 2 (businessId index) — TASK 1 bilan bir vaqtda yoki keyin, chunki ikkalasi ham `inventory.service.ts`ga tegadi.
3. TASK 3 (products limit).
4. TASK 5 (prefetch split) — foydalanuvchi darhol sezadigan tezlik.
5. TASK 4 (Redis) — eng oxirida, chunki bu infratuzilma o'zgarishi, boshqa tasklar tugagach test qilish osonroq.

Har bir task tugagach **build/migration muvaffaqiyatli o'tganini va yuqoridagi "tekshirish" bo'limidagi natijani** menga qaytarib ber — "ishladi" deb yozib qo'yib ketma, real o'lchov raqamini yoz.
