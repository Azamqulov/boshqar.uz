# 🤝 Boshqar.uz — Dasturchilar uchun Qo'llanma (Contributor & Architecture Guide)

Ushbu qo'llanma yangi dasturchilar uchun loyihaning arxitekturasi, ishga tushirish jarayoni va qat'iy standartlarini 15 daqiqada o'zlashtirish uchun xizmat qiladi.

---

## 🏛 1. Loyiha Arxitekturasi

Boshqar.uz ko'p ijarachili (Multi-tenant) SaaS platformasi bo'lib, quyidagi modullardan iborat:

- **`ubms-frontend` (Vue 3, Pinia, TypeScript, TailwindCSS):** Foydalanuvchi interfeysi, POS kassa, Ombor, Moliya, KDS va SuperAdmin boshqaruvi.
- **`ubms-backend` (NestJS, Prisma ORM, PostgreSQL):** REST API, JWT autentifikatsiyasi, RBAC huquqlar tizimi, ACID tranzaksiyalar va to'lovlar monitoringi.
- **`ubms-telegram-bot` (Telegraf, TypeScript):** Savdo hisobotlari va xabarnomalar yuboruvchi Telegram boti.
- **`ubms-shared-types` (TypeScript):** Frontend va Backend o'rtasidagi umumiy interfeyslar va DTO tiplari.

---

## ⚡ 2. Tezkor Ishga Tushirish (Quickstart)

```bash
# 1. Bog'liqliklarni o'rnatish
cd ubms-backend && npm install
cd ../ubms-frontend && npm install
cd ../ubms-telegram-bot && npm install

# 2. Ma'lumotlar bazasi migratsiyasi va Seed
cd ubms-backend
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# 3. Loyihani dev rejimida ko'tarish
# Terminal 1 (Backend):
cd ubms-backend && npm run start:dev

# Terminal 2 (Frontend):
cd ubms-frontend && npm run dev
```

---

## 💎 3. Qat'iy Dasturlash Standartlari (Golden Rules)

1. **TypeScript Strictness:** Kodda hech qachon `any` ishlatilmaydi. Har bir DTO va API javobi tiplangan bo'lishi shart.
2. **ACID Tranzaksiyalar:** Kassa savdosi, qoldiq kamayishi yoki obuna tasdiqlash kabi ko'p jadvalli o'zgarishlar doimo `prisma.$transaction` bilan bajariladi.
3. **UI Standartlari:** Brauzerning oddiy `<select>` yoki xom spinnerlari o'rniga `@/components/AppSelect.vue` va `@/components/SkeletonLoader.vue` ishlatiladi.
4. **Test Qamrovi:** Yangi yozilgan har qanday backend xizmati uchun `service.spec.ts` unit testi qo'shilishi shart.

---

## 🧪 4. Testlarni Yurgizish

```bash
# Backend testlari:
cd ubms-backend && npm test

# Frontend tiplarini tekshirish va build qilish:
cd ubms-frontend && npm run build
```
