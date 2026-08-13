# UBMS Backend API (ubms-backend)

Universal Business Management System (UBMS / boshqar.uz) tizimi uchun NestJS asosidagi Multi-tenant SaaS REST API.

## Xususiyatlari:
- **Multi-Tenant Architecture**: Shared DB / Shared Schema bilan `business_id` va `branch_id` izolyatsiyasi.
- **Prisma ORM**: 32 ta ma'lumotlar bazasi jadvallari, to'liq munosabatlar va indekslar.
- **RBAC (Role-Based Access Control)**: Modulli permission guardlar.
- **Universal POS Engine**: Do'kon, restoran, kafe va sartaroshxona uchun bitta moslashuvchan sotuv tizimi.
- **Real-time WebSockets**: Buyurtmalar, KDS oshxona ekrani va bildirishnomalar.
- **Audit Logs**: O'zgartirib bo'lmaydigan harakatlar tarixi.

## O'rnatish va Ishga Tushirish:
```bash
# 1. Bog'liqliklarni o'rnatish
npm install

# 2. Ma'lumotlar bazasi migratsiyasi va seed
npx prisma generate
npx prisma migrate dev
npm run prisma:seed

# 3. Serverni ishga tushirish
npm run start:dev
```
- API Base URL: `http://localhost:4000/api/v1`
- Swagger Docs: `http://localhost:4000/docs`
