# boshqar.uz — Qolgan muammolarni tuzatish rejasi (2026-08-24)

`orders.manualPrice` xavfsizlik masalasi allaqachon yopilgan. Quyida qolgan barcha topilmalar
**muhimlik darajasi bo'yicha 4 faza**ga bo'lingan. Har birida: aniq muammo, qayerda, nima uchun
muhim, va qanday tuzatish kerakligi bor. O'zingiz bittalab, tartib bilan ishlab chiqishingiz mumkin.

---

## 🔴 FAZA 1 — Moliyaviy/ma'lumot izchilligi xavfi (birinchi navbatda)

### 1.1 `suppliers.service.ts` — audit log bilan asosiy amal bir xil tranzaksiyada emas
**Fayl:** `ubms-backend/src/modules/suppliers/suppliers.service.ts`
**Qatorlar:** `create()` (65-78), `update()` (100-106), `remove()` (250-261)

**Muammo:** `paySupplier()` metodida to'g'ri `$transaction` ishlatilgan (133-qator), lekin
`create/update/remove` metodlarida asosiy DB amali (`supplier.create/update/delete`) va undan
keyingi `auditLog.create()` **alohida, tranzaksiyasiz** chaqiriladi. Agar ikkinchi so'rov
(auditLog) muvaffaqiyatsiz tugasa (masalan tarmoq uzilishi, DB timeout) — supplier o'zgargan,
lekin audit izi yo'q qoladi. Moliyaviy nizolarda (kim, qachon, nima o'zgartirgani) bu muammo
bo'ladi.

**Tuzatish:**
```ts
async create(businessId: string, userId: string, data: CreateSupplierDto) {
  return this.prisma.$transaction(async (tx) => {
    const supplier = await tx.supplier.create({ ... });
    await tx.auditLog.create({ ... });
    return supplier;
  });
}
```
Xuddi shu naqshni `update()` va `remove()` ga ham qo'll.

**Vaqt:** ~2 soat (3 metod + tegishli testlarni yangilash)

---

### 1.2 Boshqa modullarda xuddi shu naqsh bormi — tekshirish
Suppliers'da topilgan "asosiy amal + auditLog, tranzaksiyasiz" naqshi boshqa servicelarda ham
bo'lishi mumkin (masalan `employees.service.ts`, `products.service.ts`, `finance` moduli).

**Tuzatish:** quyidagi buyruq bilan barcha shubhali joylarni top:
```bash
cd ubms-backend
grep -rln "auditLog.create" src/modules --include=*.service.ts
```
Har bir topilgan faylda: agar `auditLog.create()` dan oldin bir nechta yozuv/o'zgartirish
operatsiyasi bo'lsa va ular `$transaction` ichida bo'lmasa — Faza 1.1 dagi kabi o'rab chiq.

**Vaqt:** ~4-6 soat (audit + tuzatish, modulga qarab)

---

## 🟠 FAZA 2 — Test qamrovi (ishonchlilik uchun eng muhim)

### 2.1 Frontend unit testlar — hozir juda kam
**Holat:** 214 ta `.vue` fayldan atigi 5 tasi test bilan qoplangan
(`auth.store`, `cart.store`, `AppHeader`, `usePOSCustomer`, `usePOSHeldOrders`).

**Ustuvorlik tartibida qo'shish kerak bo'lgan testlar:**
1. `POS.vue` / `POSView.vue` — savdo oqimi (checkout, chegirma, `isManualPrice` UI logikasi)
2. `cart.store.ts` — qolgan hisoblash logikasi (chegirma, soliq, umumiy summa)
3. `ShiftModal.vue` — smena ochish/yopish (pul bilan bog'liq)
4. Inventory/stock composable'lari — qoldiq hisoblash

**Qanday boshlash:**
```bash
cd ubms-frontend
npx vitest --coverage   # joriy qamrovni ko'rish uchun
```
Har bir yangi test faylini `__tests__/` papkasiga, mavjud 5 ta test bilan bir xil naqshda yoz
(Vitest + `@vue/test-utils`).

**Vaqt:** ~25-35 soat (to'liq emas, kritik yo'llarni qoplash uchun)

---

### 2.2 Backend test qamrovi — 22 spec fayl bor, lekin qamrov to'liq emas
**Tekshirish:**
```bash
cd ubms-backend
npx jest --coverage
```
Qaysi modullarda spec fayl umuman yo'qligini top:
```bash
comm -23 <(find src/modules -maxdepth 1 -type d -exec basename {} \; | sort) \
         <(find src/modules -name "*.spec.ts" -exec dirname {} \; | xargs -n1 basename | sort -u)
```
Bu bo'sh qolgan modullarni ko'rsatadi — ayniqsa `billing`, `finance`, `inventory` kabi pul
bilan bog'liq modullarga birinchi navbatda test yozish kerak.

**Vaqt:** ~15-20 soat

---

## 🟡 FAZA 3 — Ishonchlilik va tayyorgarlik (production uchun)

### 3.1 Offsite DB backup + Disaster Recovery sinovi
**Holat:** `scripts/backup-database.sh`, `scripts/backup-db.sh`, `scripts/restore-db.sh` mavjud,
lekin avtomatik cron va real restore sinovi yo'q.

**Tuzatish qadamlari:**
1. `backup-db.sh`ni cron/systemd timer orqali kunlik ishga tushirish (yoki GitHub Actions
   scheduled workflow, agar server GH Actions runner'ga ulangan bo'lsa)
2. Backup faylni S3/MinIO ga (yoki hech bo'lmasa alohida serverga) avtomatik yuklash qadamini
   qo'shish — hozir faqat local saqlanadi
3. **Eng muhimi:** oyiga kamida 1 marta `restore-db.sh`ni **haqiqatan sinab ko'rish** (staging
   muhitida) — backup borligi kifoya qilmaydi, u ishlashi kerak

**Vaqt:** ~12-16 soat

---

### 3.2 Load testing — 500+ bir vaqtdagi POS session uchun sinov yo'q
**Tuzatish:** k6 yoki Autocannon bilan asosiy endpoint'larni (`POST /orders`,
`GET /inventory`, `POST /orders/:id/complete`) simulyatsiya qil:
```bash
npm install -g autocannon
autocannon -c 100 -d 30 -m POST -H "Authorization: Bearer <token>" \
  -b '{"orderType":"dine_in","items":[...]}' \
  https://your-api/orders
```
Natijada: response time p95/p99, xatolik darajasi, va qaysi endpoint birinchi bo'lib
"bottleneck" bo'lishini aniqlaysiz (ehtimol `inventory` yoki `orders.count` — kunlik order
raqamini hisoblash query'si).

**Vaqt:** ~10-14 soat

---

### 3.3 Staging environment + CI/CD smoke-test
**Holat:** `ci.yml` va `ci-cd.yml` bor, lekin productionga chiqarishdan oldin staging'da
avtomatik smoke-test bosqichi yo'q.

**Tuzatish:** GitHub Actions workflow'ga staging deploy + asosiy endpoint'larni tekshiruvchi
smoke-test job qo'shish (masalan `curl` bilan health-check, login, bitta test order yaratish),
faqat shundan keyin production deploy ruxsat berilsin.

**Vaqt:** ~10-12 soat

---

## 🟢 FAZA 4 — Sifat va tezlik (keyingi navbatda, shoshilinch emas)

### 4.1 Media optimizatsiya
**Aniq topilgan katta fayllar:**
| Fayl | Hajm |
|---|---|
| `topa_olmadingizmi_transparent.png` | 784 KB |
| `topa_olmadingizmi_banner.png` | 784 KB |
| `ai-smart-book.jpg` | 576 KB |
| `ai-smart-analytics.jpg` | 564 KB |
| `logo-dark-full.png` | 552 KB |
| `rocket_3d.png` | 536 KB |
| `help_book_3d.png` | 480 KB |

**Tuzatish:**
```bash
npx @squoosh/cli --webp '{"quality":80}' -d output/ ubms-frontend/public/*.png
```
Yoki `sharp`/`imagemin` orqali build vaqtida avtomatik siqish (Vite plugin:
`vite-plugin-imagemin`). Bu 7 ta faylning o'zi ~4 MB'ni tejaydi.

**Vaqt:** ~4-6 soat

---

### 4.2 Haddan tashqari katta komponent/service fayllarni bo'lish
**Eng katta fayllar (aniq son bilan):**
| Fayl | Qator |
|---|---|
| `POSView.vue` | 905 |
| `SettingsView.vue` | 861 |
| `LandingInteractiveDemo.vue` | 845 |
| `SettingsTelegramTab.vue` | 820 |
| `BoshqarAIAssistant.vue` | 784 |
| `ShiftModal.vue` | 763 |
| `SuperAdminView.vue` | 754 |
| `telegram.service.ts` (backend) | 402 |

**Tuzatish yondashuvi:** har birini funksional qismlarga ajrat — masalan `POSView.vue`ni
`POSCartSidebar.vue` (allaqachon bor), `POSProductGrid.vue`, `POSPaymentModal.vue`,
`usePOSCheckout.ts` composable kabi kichik bo'laklarga. `telegram.service.ts`ni esa
`telegram-notifications.service.ts`, `telegram-webhook.service.ts` kabi ajratish mumkin.

**Vaqt:** ~20-30 soat (barcha fayllar uchun, alohida-alohida qilinsa xavfsizroq)

---

### 4.3 Accessibility (A11y) — modal va POS interfeysida
**Muammo:** modal oynalar va dropdown'larda `aria-expanded`, `aria-label`, keyboard focus
trap to'liq emas.

**Tuzatish:** `POSCartSidebar.vue`, `ShiftModal.vue` kabi modal'larga:
```vue
<div role="dialog" aria-modal="true" :aria-label="modalTitle">
```
va `@keydown.esc="close"` + focus trap (`vue-focus-lock` yoki qo'lda birinchi/oxirgi
fokuslanadigan elementni tutish).

**Vaqt:** ~15-20 soat

---

## 📌 Xulosa — umumiy vaqt taqsimoti

| Faza | Mavzu | Taxminiy vaqt |
|---|---|---|
| 1 | Moliyaviy/audit-log tranzaksiya xavfsizligi | 6-8 soat |
| 2 | Test qamrovi (frontend + backend) | 40-55 soat |
| 3 | Backup/DR, load test, staging | 32-42 soat |
| 4 | Media, katta fayllar, a11y | 39-56 soat |
| **Jami** | | **~117-161 soat** |

**Tavsiya etilgan tartib:** Faza 1 → Faza 2 (hech bo'lmasa 2.1 dagi POS/cart testlari) → Faza 3.1
(backup — bu "hech qachon ishlatilmasin, lekin ishlashi shart" toifasidagi narsa) → qolganlari
navbat bilan, loyihaning haqiqiy foydalanuvchi bosimiga qarab.

Har bir band ustida ishlay boshlaganingizda, aynan o'sha bo'limni menga ko'rsatsangiz —
kod yozib, test qo'shib, tekshirib beraman.
