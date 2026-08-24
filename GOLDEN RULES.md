# 🏆 GOLDEN RULES & PROJECT PROTOCOL: boshqar.uz

## 1. 🚀 Master Execution Rule (QAT'IY QOIDA)
- **"Loyihani ishga tushir" / "Ishni boshlaymiz" buyrug'i berilganda:**
  Doimo loyihaning **barcha modullarini (Backend, Frontend, Telegram Bot, PostgreSQL, Redis)** birgalikda, 100% to'liq ishga tushirish ShART. Hech bir qism (masalan bot yoki frontend) o'tkazib yuborilmaydi.
- **"Audit qil" / "Analiz qil" buyrug'i berilganda:**
  Doimo tizimning **barcha qatlamlarini (Backend, Frontend, Telegram Bot, Database, DevOps, UX, Xavfsizlik, SaaS Metrikalari)** 360-daraja to'liq va tanqidiy audit qilish SHART.

## 2. 🏛️ Monorepo Modullari Tuzilmasi
- **`ubms-backend`:** NestJS 10 REST API, Prisma ORM, WebSockets, Soliq OFD, POS Terminal integratsiyalari va Postgres/Redis ulanishlari.
- **`ubms-frontend`:** Vue 3, Vite, TailwindCSS, Pinia — POS Kassa, Admin Panel, Settings, Direct Print.
- **`ubms-telegram-bot`:** Telegram Bot (`@Boshqar_uzbot`), Telegram Mini-App (TMA) hamda bildirishnomalar.
- **`ubms-shared-types`:** Frontend, Backend va Bot o'rtasidagi yagona TypeScript tiplari.
- **`ubms-desktop`:** Tauri / Electron ish stoli dasturi.

## 3. 🧪 Runtime Verification Protocol
- Har bir o'zgarishdan so'ng `docker exec boshqar_backend npm run system:healthcheck` va `docker compose ps` orqali 4 ta konteyner hamda barcha servislar ishlayotgani va salomatligi runtime tekshirilishi shart.
