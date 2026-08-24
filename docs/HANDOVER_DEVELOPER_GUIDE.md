# 📘 HANDOVER DEVELOPER GUIDE & ONBOARDING RUNBOOK
**Loyiha:** boshqar.uz — Universal Biznes Boshqaruv Tizimi  
**Vazifasi:** Yangi dasturchilarni loyihaga 15 daqiqada kiritish (Onboarding), arxitektura xaritasini taqdim etish hamda Bus Factor riskini yo'qotish.

---

## 1. 🏗️ Arxitektura Xaritasi va Texnologik Stek

```
                    ┌─────────────────────────────────────────┐
                    │            Client Browser               │
                    │   Vue 3 + Vite + TailwindCSS + Pinia    │
                    └────────────────────┬────────────────────┘
                                         │ HTTP / REST / WebSockets
                                         ▼
                    ┌─────────────────────────────────────────┐
                    │               Nginx Proxy               │
                    │       Port 80 (Docker Container)        │
                    └────────────────────┬────────────────────┘
                                         │ Proxy pass /api -> :4000
                                         ▼
                    ┌─────────────────────────────────────────┐
                    │             NestJS Backend              │
                    │   Multi-tenant REST API + Socket.io     │
                    └───────────┬─────────────────┬───────────┘
                                │                 │
                       Prisma   │                 │ Keyv / Ioredis
                       ORM      ▼                 ▼
                    ┌───────────────┐   ┌───────────────────┐
                    │ PostgreSQL 16 │   │      Redis 7      │
                    │  (Port 5432)  │   │    (Port 6379)    │
                    └───────────────┘   └───────────────────┘
```

---

## 2. 📂 Papkalar va Modullar Tuzilishi

- `ubms-backend/src/modules/`
  - `auth/` — JWT autentifikatsiya va RBAC huquqlar nazorati.
  - `users/` — Foydalanuvchilar va xodimlar boshqaruvi.
  - `products/` — Tovar katalogi, o'lchov birliklari, shtrix-kodlar.
  - `inventory/` — Ombor qoldiqlari, kirim/chiqim, filiallararo transfer.
  - `orders/` — Kassa savdolari (POS), cheklar, qaytarishlar (refund).
  - `finance/` — Kirim/chiqim moliya operatsiyalari, hisobotlar.
  - `fiscal/` — Soliq Qo'mitasi OFD fiskal cheklar va QR-kodlar.
  - `terminal/` — Uzcard va Humo POS terminal integratsiyasi.
  - `ai/` — Sun'iy intellekt tahlilchisi (Gemini / OpenAI).
- `ubms-frontend/src/`
  - `views/pos/` — Kassir kassa ekrani (`POSView.vue`).
  - `views/products/` — Tovar va ombor oynalari.
  - `views/settings/` — Tizim sozlamalari, audit va terminallar.
  - `stores/` — Pinia holat saqlagichlari (`cart`, `auth`, `products`).
- `ubms-shared-types/` — Front va Back o'rtasidagi umumiy TypeScript turlari.

---

## 3. ⚡ 15-Daqiqalik Tezkor Onboarding va Setup

1. **Reponi klonlash va papkaga o'tish:**
   ```bash
   git clone <repo-url> boshqar.uz
   cd boshqar.uz
   ```
2. **Konteynerlarni bir tugma bilan ishga tushirish:**
   ```bash
   docker compose up -d --build
   ```
3. **Ma'lumotlar bazasini tayyorlash va demo ma'lumotlar joylash:**
   ```bash
   docker exec boshqar_backend npx prisma db push
   docker exec boshqar_backend npx ts-node -O '{"module":"commonjs"}' prisma/seed.ts
   ```
4. **Tizim diagnostikasini ishga tushirish:**
   ```bash
   docker exec boshqar_backend npm run system:healthcheck
   ```
5. **Brauzerda ochish:**
   - Frontend: [http://localhost](http://localhost)
   - Swagger API Docs: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)
   - Login: `+998770404624` | Parol: `demo123456`

---

## 4. 🚨 Favqulodda Vaziyatlar Yo'riqnomasi (Emergency Runbook)

### Scenario A: Ma'lumotlar bazasi ulanishi uzildi (`P1001 / P1002`)
- **Tashxis:** `docker compose ps` buyrug'ini bering va `boshqar_postgres` holatini ko'ring.
- **Yechim:**
  ```bash
  docker restart boshqar_postgres boshqar_backend
  ```

### Scenario B: Redis kesh bilan aloqa yo'qoldi
- **Yechim:** Redis konteynerini qayta ishga tushirish:
  ```bash
  docker restart boshqar_redis
  ```

### Scenario C: Environment Secrets (JWT kaliti va DB parollari) almashiruvi
1. `docker-compose.yml` va `.env` faylidagi `JWT_SECRET` va `POSTGRES_PASSWORD` qiymatlarini yangilang.
2. Konteynerlarni yangi muhit bilan qayta ko'taring:
   ```bash
   docker compose up -d --force-recreate
   ```

---

## 5. 🛠️ Diagnostika buyruqlari

- **Loglarni jonli kuzatish:** `docker compose logs -f backend`
- **E2E testlarni o'tkazish:** `cd ubms-frontend && npm run test:e2e`
- **Unit testlarni o'tkazish:** `cd ubms-backend && npm test`
