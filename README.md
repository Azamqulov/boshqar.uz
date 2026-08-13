# boshqar.uz — Universal Biznes Boshqaruv Tizimi (SaaS v2.0)

Universal, multi-tenant SaaS boshqaruv platformasi — turli sohadagi bizneslar (Do'kon, Restoran, Kafe, Sartaroshxona, Konditer, Dorixona, Xizmat ko'rsatish) uchun yagona Core arxitektura va moslashuvchan biznes modullari.

---

## 📁 Ekotizim Strukturasi

Loyiha monorepo formatida quyidagi modullardan iborat:

1. **[`ubms-shared-types/`](./ubms-shared-types)** — Umumiy TypeScript interfeyslar, DTO'lar, barcha 32 ta jadval enumlari va biznes-modullar konfiguratsiyasi.
2. **[`ubms-backend/`](./ubms-backend)** — NestJS + TypeScript + PostgreSQL (Prisma, 32 ta jadval, application-level multi-tenant businessId scoping) + Redis + Socket.IO + JWT REST API backend.
3. **[`ubms-frontend/`](./ubms-frontend)** — Vue 3 + TypeScript + Vite + Pinia + Tailwind CSS boshqaruv paneli va Universal POS kassa tizimi.
4. **[`ubms-desktop/`](./ubms-desktop)** — Tauri 2 (Rust) + Vue 3 Windows Desktop ilovasi (80mm ESC/POS termal printer drayveri va offline kassa).
5. **[`ubms-telegram-bot/`](./ubms-telegram-bot)** — Node.js / Telegraf kunlik 21:00 KPI hisobotlari va on-demand savdo boti.

---

## 🚀 Tezkor Ishga Tushirish

### 1. Backend Server:
```bash
cd ubms-backend
npm install
npx prisma generate
npm run start:dev
```
- API Base: `http://localhost:4000/api/v1`
- Swagger Docs: `http://localhost:4000/docs`

### 2. Frontend Web Panel & POS:
```bash
cd ubms-frontend
npm install
npm run dev
```
- Web App: `http://localhost:5173`

### 3. Desktop POS (Tauri 2):
```bash
cd ubms-desktop
npm install
npm run tauri dev
```

### 4. Telegram Bot:
```bash
cd ubms-telegram-bot
npm install
npm run dev
```
