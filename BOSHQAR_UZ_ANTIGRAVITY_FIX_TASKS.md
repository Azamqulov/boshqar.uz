# BOSHQAR.UZ — Xavfsizlik va Sifat Tuzatishlari (Antigravity Task Pack)

**Maqsad:** Repo auditida topilgan 9 ta muammoni tuzatish orqali loyihani production-ready holatga keltirish.
**Tartib:** Ustuvorlik bo'yicha — 1-5 KRITIK (xavfsizlik), 6-7 O'RTA, 8-9 SIFAT.
**Qoida:** Har bir task alohida branch/commitda bajarilsin. Har birida "Qabul mezonlari" bajarilmaguncha keyingisiga o'tilmasin.

---

## TASK 1 — CORS logikasini tuzatish (KRITIK)

**Fayl:** `ubms-backend/src/main.ts`

**Muammo:** `enableCors` ichidagi callback funksiyasi ikkala shart tarmog'ida ham (`allowedOrigins.includes(origin)` va `else`) `callback(null, true)` qaytaradi. Natijada `allowedOrigins` tekshiruvi amalda hech qanday origin'ni rad etmaydi — `credentials: true` bilan birga bu istalgan domendan cookie/token bilan so'rov yuborish imkonini beradi.

**Nima qilish kerak:**
```js
app.enableCors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS: ruxsat etilmagan origin'), false);
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  credentials: true,
});
```
- `allowedOrigins.includes('*')` shartini olib tashlash — wildcard + credentials birga ishlatilmaydi (browser ham buni rad etadi).
- `CORS_ORIGINS` env production uchun aniq domenlar bilan to'ldirilishi kerakligini `.env.example`ga izoh sifatida qo'shish.

**Qabul mezonlari:**
- [ ] Ro'yxatda yo'q origin'dan so'rov yuborilganda CORS xatosi qaytadi (Postman/curl bilan `Origin: https://evil.com` header bilan tekshirish)
- [ ] `localhost:5173`, `tauri://localhost` kabi ruxsat etilgan originlar hali ham ishlayveradi

---

## TASK 2 — JWT_SECRET hardcoded fallback'larni olib tashlash (KRITIK)

**Fayllar:** `ubms-backend/src/modules/auth/auth.module.ts`, `jwt.strategy.ts`, `auth.service.ts` (4 joy)

**Muammo:** `process.env.JWT_SECRET || 'super-secret-jwt-key-ubms-2026'` kabi fallback qiymatlar bor. Bu secret GitHub'da ochiq ko'rinadi — agar deploy paytida env o'rnatilmasa, har kim shu secret bilan o'zi valid JWT token yasab tizimga kirishi mumkin. Qo'shimcha muammo: fallback qiymatlar fayllar orasida bir xil emas (`'super-secret-jwt-key-ubms-2026'` vs `'super-secret-jwt-key'`).

**Nima qilish kerak:**
1. `ubms-backend/src/config/env.validation.ts` (yangi fayl) yarating — bootstrap paytida majburiy env o'zgaruvchilarni tekshiradigan validatsiya:
```ts
export function validateEnv() {
  const required = ['JWT_SECRET', 'DATABASE_URL'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Majburiy environment o'zgaruvchilar topilmadi: ${missing.join(', ')}. ` +
      `.env faylni tekshiring (.env.example asosida).`
    );
  }
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET kamida 32 belgidan iborat bo\'lishi kerak.');
  }
}
```
2. `main.ts`da `bootstrap()` boshida `validateEnv()` chaqiring — env yo'q bo'lsa app umuman ishga tushmasin.
3. 4 ta joydagi `process.env.JWT_SECRET || '...'` qatorlarini `process.env.JWT_SECRET`ga almashtiring (fallback'siz — chunki validateEnv allaqachon borligini kafolatlaydi).
4. `.env.example`da `JWT_SECRET="your-super-secret-jwt-key"` o'rniga misol uchun kamida 32 belgili tasodifiy qiymat namunasi qoldiring va izoh yozing: `# Production uchun: openssl rand -hex 32 orqali generatsiya qiling`.

**Qabul mezonlari:**
- [ ] `.env` faylida `JWT_SECRET` bo'lmasa, `npm run start:dev` xato bilan to'xtaydi, "silent fallback" bo'lmaydi
- [ ] Kodda hech qanday joyda hardcoded secret string qolmagan (`grep -rn "super-secret-jwt-key" src/` bo'sh natija bersin)

---

## TASK 3 — Login formasidagi hardcoded parolni olib tashlash (KRITIK)

**Fayl:** `ubms-frontend/src/views/auth/LoginView.vue`

**Muammo:** `const password = ref('Admin12345!')` — login sahifasi ochilganda parol maydoni avtomatik admin parol bilan to'ldirilgan holda ochiladi.

**Nima qilish kerak:**
```js
const password = ref('');
const phone = ref(''); // agar shunga o'xshash pre-fill bo'lsa, uni ham tekshiring
```
- Fayl bo'ylab boshqa pre-filled credential bor-yo'qligini tekshiring (`grep -n "Admin12345\|Staff12345" ubms-frontend/src -r`).
- Agar dev-rejimda tez test qilish uchun kerak bo'lsa, buni `import.meta.env.DEV` shartiga o'rab qo'ying, productionga hech qachon chiqmasin.

**Qabul mezonlari:**
- [ ] Login sahifasi ochilganda parol/login maydonlari bo'sh
- [ ] Production build'da (`npm run build`) hech qanday hardcoded credential qolmagan

---

## TASK 4 — Login/register uchun qattiqroq rate limit (KRITIK)

**Fayl:** `ubms-backend/src/modules/auth/auth.controller.ts`

**Muammo:** Global throttle 120 so'rov/daqiqa — bu brute-force parol hujumi uchun juda bo'sh limit. Login endpoint alohida cheklanmagan.

**Nima qilish kerak:**
```ts
import { Throttle } from '@nestjs/throttler';

@Public()
@Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 urinish/daqiqa
@Post('login')
async login(@Body() dto: LoginDto) { ... }

@Public()
@Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 urinish/daqiqa
@Post('register')
async register(@Body() dto: RegisterDto) { ... }
```
- Xuddi shu narsani `forgot-password`/`reset-password` endpointlariga ham qo'llang (agar mavjud bo'lsa).
- Ixtiyoriy (keyingi bosqich uchun eslatma sifatida qoldiring, hozir kod yozmang): telefon raqami bo'yicha 5 marta noto'g'ri urinishdan keyin akkauntni vaqtincha bloklash (account lockout) logikasi.

**Qabul mezonlari:**
- [ ] `/api/v1/auth/login`ga 1 daqiqada 6-marta noto'g'ri parol bilan so'rov yuborilsa, 6-chisi 429 (Too Many Requests) qaytaradi
- [ ] To'g'ri login urinishlari limitga ta'sir qilmaydi (yoki throttle konfiguratsiyasi shunga mos)

---

## TASK 5 — Xodim/admin default parollarni xavfsiz qilish (KRITIK)

**Fayllar:** `ubms-backend/prisma/seed.ts`, `ubms-backend/src/modules/employees/employees.service.ts`

**Muammo:** `seed.ts`da `'Admin12345!'`, `employees.service.ts`da `data.password || 'Staff12345!'` — barcha yangi xodimlar parol berilmasa bir xil, oldindan taxmin qilinadigan parolga ega bo'ladi.

**Nima qilish kerak — 2 ta variant, tanlang:**

**Variant A (tavsiya etiladi): Tasodifiy parol + majburiy o'zgartirish**
```ts
import { randomBytes } from 'crypto';

function generateTempPassword(): string {
  return randomBytes(6).toString('base64').slice(0, 8) + '!A1';
}

// employees.service.ts ichida:
const tempPassword = data.password || generateTempPassword();
// User modeliga `mustChangePassword: boolean` field qo'shish kerak (Prisma migration)
// va JwtAuthGuard/keyingi middleware'da mustChangePassword=true bo'lsa
// faqat /auth/change-password endpointiga ruxsat berish.
```

**Variant B (tezroq, lekin kamroq xavfsiz): SMS orqali tasodifiy parol yuborish**
- `generateTempPassword()` bilan tasodifiy parol yaratish, xodimga SMS (Eskiz.uz — sizda SMS app tajribangiz bor) orqali yuborish, birinchi kirishda parolni o'zgartirishga majburlash shart emas, lekin tavsiya etiladi.

Ikkala holatda ham `seed.ts`dagi admin parolini `.env`dan o'qiladigan qilib almashtiring:
```ts
const adminPassword = process.env.SEED_ADMIN_PASSWORD || generateTempPassword();
console.log(`⚠️  Seed admin parol: ${adminPassword} — buni xavfsiz joyga yozib qo'ying, keyin o'zgartiring`);
```

**Qabul mezonlari:**
- [ ] Kodda hech qanday joyda literal `'Admin12345!'` yoki `'Staff12345!'` qolmagan
- [ ] Yangi xodim yaratilganda parol tasodifiy generatsiya qilinadi va console/SMS orqali yetkaziladi
- [ ] (Variant A tanlansa) Birinchi kirishda parol o'zgartirish majburiy

---

## TASK 6 — Swagger docs'ni himoyalash (O'RTA)

**Fayl:** `ubms-backend/src/main.ts`

**Muammo:** `/docs` endpoint hech qanday auth'siz ochiq — butun API sxemasi (barcha endpoint, DTO, permission nomlari) hammaga ko'rinadi.

**Nima qilish kerak:**
```ts
if (process.env.NODE_ENV !== 'production') {
  const config = new DocumentBuilder()
    .setTitle('UBMS API (boshqar.uz)')
    .setVersion('2.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
}
```
Agar productionda ham Swagger kerak bo'lsa (masalan frontend jamoasi uchun), o'rniga basic-auth middleware bilan `/docs` yo'lini himoyalang — bu holatda ikkinchi variant sifatida taklif qiling.

**Qabul mezonlari:**
- [ ] `NODE_ENV=production`da `/docs`ga kirish 404 qaytaradi (yoki basic-auth so'raydi)
- [ ] Dev muhitida Swagger avvalgidek ishlayveradi

---

## TASK 7 — README'dagi RLS da'vosini haqiqatga moslashtirish (O'RTA)

**Fayllar:** `README.md`, ehtimol yangi Prisma migration

**Muammo:** README "PostgreSQL (Prisma, 32 ta jadval, RLS)" deb yozadi, lekin haqiqiy Postgres Row Level Security policy'lari mavjud emas — tenant izolyatsiyasi faqat application-level (`where: { businessId }`) darajasida.

**2 ta variant — tanlang:**

**Variant A (tez, hozircha yetarli):** README matnini to'g'irlash — `"RLS"` so'zini `"application-level multi-tenant isolation (businessId scoping har bir query'da)"` bilan almashtirish. Kod o'zgarmaydi.

**Variant B (mustahkamroq, ko'proq vaqt talab qiladi):** Haqiqiy Postgres RLS qo'shish — har bir tenant-scoped jadvalga (`products`, `orders`, `customers` va h.k.) policy yozish:
```sql
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON products
  USING (business_id = current_setting('app.current_business_id')::uuid);
```
Bu holda Prisma middleware yoki har bir so'rovda `SET app.current_business_id` qo'yish kerak bo'ladi — bu ancha katta refactor, alohida fazaga ajratishni tavsiya qilaman.

**Tavsiya:** Hozircha Variant A bilan boshlang (README to'g'rilash — 5 daqiqa), Variant B'ni keyingi fazaga "defense-in-depth" sifatida rejalashtiring.

**Qabul mezonlari:**
- [ ] README kodning haqiqiy holatini aniq tasvirlaydi
- [ ] (Variant B tanlansa) RLS yoqilgandan keyin barcha mavjud API testlari (agar Task 9 bajarilgan bo'lsa) hali ham o'tadi

---

## TASK 8 — Kritik modullarga testlar yozish (SIFAT)

**Fayllar:** yangi `*.spec.ts` fayllar

**Muammo:** Butun backendda 0 ta test fayli yo'q — 34 jadval, 20+ modulli tizim uchun bu katta risk.

**Nima qilish kerak (ustuvorlik tartibida):**
1. `auth.service.spec.ts` — login/register/refresh token oqimlari, noto'g'ri parol holatlari
2. `permission.guard.spec.ts` — owner bypass, role-permission tekshiruvi, `businessId` yo'q holat
3. `products.service.spec.ts` — tenant scoping (bitta business boshqa business mahsulotini ko'ra olmasligi — bu eng muhim test, cross-tenant leak'ni ushlab qoladi)
4. `super-admin.guard.spec.ts`

Har bir test faylida Prisma'ni mock qiling (`jest-mock-extended` yoki qo'lda mock).

**Qabul mezonlari:**
- [ ] `npm run test` kamida 4 ta yuqoridagi modul uchun ishlaydi va o'tadi
- [ ] Tenant-isolation testi mavjud: "Business A user Business B mahsulotini so'rasa, natija bo'sh/404 qaytishi kerak"

---

## TASK 9 — `any` tiplarni shared-types bilan almashtirish (SIFAT)

**Fayllar:** butun `ubms-backend/src` (57 joy)

**Muammo:** `ubms-shared-types` paketi mavjud bo'lsa-da, backend service metodlarida `data: any` ko'p ishlatilgan — bu type xavfsizligini yo'qqa chiqaradi.

**Nima qilish kerak:**
1. `grep -rn ": any" ubms-backend/src` bilan ro'yxat chiqaring, modul bo'yicha guruhlang.
2. Har bir modul uchun DTO klasslarini (`class-validator` bilan) yoki `ubms-shared-types/src/models.ts`dagi interfeyslarni ishlatib, `any`ni aniq tipga almashtiring.
3. Buni bitta katta PR qilmang — modul-modul bo'yicha alohida (masalan avval `employees`, keyin `products`, keyin `finance`) bajaring, har birida build/test tekshirib boring.

**Qabul mezonlari:**
- [ ] Modul bo'yicha `: any` soni kamayib boradi, har bosqichda `npm run build` xatosiz o'tadi
- [ ] Yangi kod yozishda `any` ishlatilmasligi uchun ESLint qoidasi (`@typescript-eslint/no-explicit-any: warn`) qo'shilgan

---

## Bajarish tartibi bo'yicha eslatma

Antigravity'ga har bir taskni **alohida-alohida** yuboring, avvalgi task tasdiqlanmaguncha keyingisiga o'tmang — ayniqsa 1-5 (xavfsizlik) tasklarida, chunki bular bir-biriga bog'liq (masalan Task 2 JWT bootstrap validatsiyasi Task 4 rate-limit test qilishga ta'sir qilishi mumkin).

1-5 bajarilgach loyiha xavfsizlik jihatidan production-ready bo'ladi. 6-9 esa sifat/mustahkamlik uchun.
