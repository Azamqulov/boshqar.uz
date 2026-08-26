# 🚀 boshqar.uz — Yangi Dasturchilar Uchun Onboarding Qo'llanmasi
> **Maqsad:** Loyihani toza kompyuterda 10-15 daqiqa ichida to'liq ishga tushirish.

---

## 1. Talab Qilinadigan Dasturlar (Prerequisites)

- **Node.js:** `v20.x` yoki undan yuqori (`node -v`)
- **NPM:** `v10.x` yoki undan yuqori
- **Docker & Docker Desktop:** PostgreSQL va Redis uchun (yoki lokal Postgres/Redis)
- **Git:** versiya nazorati uchun

---

## 2. Qadam-baqadam Ishga Tushirish (Quick Start)

### 1-qadam: Repozitoriyni klonlash va bog'liqliklarni o'rnatish
```bash
git clone https://github.com/Azamqulov/boshqar.uz.git
cd boshqar.uz
npm install
```

### 2-qadam: Muhit o'zgaruvchilarini (.env) sozlash
Backend papkasida `.env` faylini yarating:
```bash
cd ubms-backend
cp .env.example .env
```
`.env` faylida quyidagi asosiy o'zgaruvchilarni to'ldiring:
```env
PORT=4000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/boshqar_db?schema=public"
DIRECT_URL="postgresql://postgres:postgres123@localhost:5432/boshqar_db?schema=public"
JWT_SECRET="boshqar_uz_development_jwt_secret_key_minimum_32_characters_long"
REDIS_URL="redis://localhost:6379"
```

### 3-qadam: Ma'lumotlar bazasi va Redis'ni ko'tarish
Ildiz papkada Docker orqali bazani ishga tushiring:
```bash
docker compose up -d postgres redis
```

### 4-qadam: Prisma migratsiyalari va dastlabki ma'lumotlar (Seed)
```bash
cd ubms-backend
npx prisma generate
npx prisma db push
npm run prisma:seed
```
*Bu buyruq tizimga boshqaruvchi (SuperAdmin), demo korxona, tariflar va barcha ruxsatnomalarni (permissions) kiritadi.*

### 5-qadam: Tizimni to'liq ishga tushirish
Ildiz papkadan bir vaqtning o'zida barcha servislarni ishga tushirishingiz mumkin:
```bash
# Terminal 1 (Backend API - Port 4000):
npm run dev:backend

# Terminal 2 (Frontend SPA - Port 5173):
npm run dev:frontend

# Terminal 3 (Telegram Bot):
npm run dev:bot
```

Brauzerda oching:
- 🖥️ **Frontend:** [http://localhost:5173](http://localhost:5173)
- ⚙️ **Backend API / Swagger:** [http://localhost:4000/docs](http://localhost:4000/docs)
- 🏥 **Health Check:** [http://localhost:4000/api/v1/health](http://localhost:4000/api/v1/health)

---

## 3. Asosiy Test Buyruqlari

```bash
# Backend unit & integration testlari:
npm --prefix ubms-backend run test

# Frontend vitest testlari:
npm --prefix ubms-frontend run test

# Tizim umumiy salomatlik tekshiruvi:
npm --prefix ubms-backend run system:healthcheck
```

---

## 4. Dasturchi Qoidalari va Standartlar

1. **GOLDEN RULES:** Barcha ishlar ildiz papkadagi `GOLDEN RULES.md` qoidalari asosida bajariladi.
2. **Kritik o'zgarishlar:** DB ga o'zgartirish kiritganda doim `npx prisma generate` qiling va `seed.ts` ni sinxronlashtiring.
3. **Commit formati:** `feat(module): tavsif`, `fix(module): tavsif`, `refactor(module): tavsif`.

Savollar yoki yordam uchun: boshqar.uz Lead Developer & DevOps Team
