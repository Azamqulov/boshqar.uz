# 🏛️ boshqar.uz — Tizim Arxitekturasi Hujjati (Architecture Blueprint)
> **Versiya:** 2.0.0 | **Oxirgi yangilanish:** 26 Avgust 2026

Ushbu hujjat yangi dasturchi yoki texnik auditorni `boshqar.uz` platformasining butun arxitekturasi, ma'lumotlar oqimi, xavfsizlik modeli va komponentlararo aloqalari bilan tanishtirish uchun mo'ljallangan.

---

## 1. Umumiy Arxitektura Ko'rinishi (High-Level Topology)

`boshqar.uz` — multi-tenant (ko'p mijozli) korxona resurslarini boshqarish (ERP) va savdo/kassa (POS) platformasidir.

```
                  ┌─────────────────────────────────┐
                  │   Mijozlar & Foydalanuvchilar   │
                  └───────────────┬─────────────────┘
                                  │ HTTPS / WSS
                                  ▼
                  ┌─────────────────────────────────┐
                  │    Nginx Reverse Proxy / SSL    │
                  └───────┬─────────────────┬───────┘
                          │                 │
              /api/v1/*   │                 │ Static files / SPA
                          ▼                 ▼
          ┌──────────────────────┐  ┌───────────────────────┐
          │  NestJS Backend API  │  │  Vue 3 / Vite SPA     │
          │  (Port 4000)         │  │  (Port 5173 / 80)     │
          └──────────┬───────────┘  └───────────────────────┘
                     │
        ┌────────────┴────────────┬────────────────────────┐
        ▼                         ▼                        ▼
┌──────────────┐         ┌──────────────────┐    ┌────────────────────┐
│ PostgreSQL 16│         │ Redis 7 Cache &  │    │ Telegram Bot (Telegraf)
│ (Prisma ORM) │         │ Lockout Engine   │    │ & Soliq.uz OFD     │
└──────────────┘         └──────────────────┘    └────────────────────┘
```

---

## 2. Monorepo Tuzilishi (Directory Structure)

```
boshqar.uz/
├── ubms-backend/           # NestJS REST API, Prisma ORM, WebSockets, Cron Jobs
│   ├── prisma/             # schema.prisma, migrations/, seed.ts
│   ├── src/
│   │   ├── common/         # Guards (RBAC), Interceptors, Filters, Decorators
│   │   ├── config/         # Environment validation, configuration
│   │   └── modules/        # 30 ta mustaqil biznes moduli
│   └── scripts/            # Database backups, migration helpers, healthchecks
├── ubms-frontend/          # Vue 3 SPA, Pinia Store, TailwindCSS, PWA
│   ├── src/
│   │   ├── assets/         # Design tokens, logos, illustrations
│   │   ├── components/     # App* qayta ishlatiluvchi komponentlar tizimi
│   │   ├── stores/         # Pinia reaktiv holat boshqaruvi
│   │   ├── views/          # 19 ta funksional bo'lim sahifalari
│   │   └── router/         # Vue Router (barchasi lazy-loaded)
├── ubms-telegram-bot/      # Telegram bot servisi (Telegraf + TypeScript)
├── docs/                   # Texnik topshiriqlar (TZ) va me'moriy hujjatlar
├── docker-compose.yml      # Mahalliy ishlab chiqish infratuzilmasi
└── docker-compose.prod.yml # Production Docker compose konfiguratsiyasi
```

---

## 3. Backend Modullar Xaritasi (30 ta Modul)

| Modul | Mas'uliyati | Asosiy jadvallar / Bog'lanishlar |
|---|---|---|
| **auth** | Registratsiya, login, JWT tokenlar, Telegram OTP, lockout himoyasi | `User`, `users` |
| **businesses** | Tenant (biznes) boshqaruvi, filiallar, sozlamalar | `Business`, `Branch`, `BusinessUser` |
| **branches** | Filiallar hisobi, manzillar, asosiy filial belgilash | `Branch` |
| **employees** | Xodimlar, rollar, permissionlar (RBAC) | `Employee`, `Role`, `Permission`, `RolePermission` |
| **products** | Tovar va xizmatlar katalogi, SKU, shtrix-kod, o'lchov birliklari | `Product`, `Category`, `Unit` |
| **inventory** | Qoldiqlar, kirim-chiqim operatsiyalari, filiallararo transfer | `Inventory`, `InventoryTransaction`, `StockTransfer` |
| **orders** | POS savdolar, restoran buyurtmalari, kassa cheklari | `Order`, `OrderItem`, `RestaurantOrder` |
| **payments** | To'lov turlari (naqd, karta, Click, Payme, nasiya) | `Payment`, `PaymentMethod` |
| **refunds** | Tovarlarni qaytarish (vozvrat) va balansni qayta hisoblash | `Refund`, `RefundItem` |
| **customers** | CRM mijozlar bazasi, sotib olish tarixi, nasiya (qarz) hisobi | `Customer` |
| **suppliers** | Yetkazib beruvchilar va ularga to'lovlar hisobi | `Supplier`, `SupplierPayment` |
| **finance** | Daromadlar, xarajatlar, kassa balansi, foyda tahlili | `Revenue`, `Expense` |
| **shifts** | Kassa smenalari (ochish, yopish, Z-hisobot, naqd pul tafovuti) | `PosShift` |
| **restaurant** | Stol zonalari, ofitsiant ekrani, buyurtmalarni biriktirish | `Table`, `RestaurantOrder` |
| **kds** | Kitchen Display System (Oshxona ekrani, tayyorlash holatlari) | `KitchenOrder` |
| **appointments**| Xizmat ko'rsatish va go'zallik salonlari uchun bron tizimi | `Service`, `Appointment` |
| **billing** | Tariflar, obuna, to'lov so'rovlari va muddatlarni uzaytirish | `Plan`, `Subscription`, `BillingRequest` |
| **soliq** | O'zbekiston Davlat Soliq Qo'mitasi (OFD) virtual kassa fiskal cheklar | `SoliqFiscalReceipt` |
| **terminal** | Bank to'lov terminallari (Humo, Uzcard) integratsiyasi | `PaymentTerminal`, `TerminalTransaction` |
| **telegram** | Bildirishnomalar, kunlik savdo hisobotlari va OTP yuborish | `Notification` |
| **backup** | Avtomatik PostgreSQL zaxira nusxalash (tungi 03:00 cron) | `SystemBackupLog` |
| **super-admin** | Platforma egasi uchun boshqaruv paneli va statistika | Barcha modullar |

---

## 4. Xavfsizlik va Ruxsatlar Tizimi (RBAC)

Har bir HTTP so'rov `JwtAuthGuard` va `PermissionGuard` orqali filtrlanadi:
1. **Token tekshiruvi:** `Authorization: Bearer <token>` dekodlanadi va foydalanuvchi ID, biznes ID hamda ruxsat kodlari olinadi.
2. **Owner / SuperAdmin tekshiruvi:** Agar foydalanuvchi biznes egasi (`isOwner`) yoki tizim superadmini (`isSuperAdmin`) bo'lsa, to'liq ruxsat beriladi.
3. **Rol Ruxsatlari:** Aks holda `RolePermission` jadvali orqali talab qilingan ruxsat (masalan, `products:create`, `finance:view`) mavjudligi 0ms da xotirada yoki DB orqali tekshiriladi.

---

## 5. Tranzaksiyalar va Ma'lumotlar Butunligi

Barcha moliyaviy, ombor va savdo operatsiyalari **Prisma `$transaction`** bloklari ichida bajariladi:
- Buyurtma yaratilganda: Order yaratiladi + OrderItems qo'shiladi + Ombordagi qoldiq kamaytiriladi + `InventoryTransaction` qayd qilinadi + Mijozning `totalSpent` oshiriladi.
- Agar birorta qadam xato bersa, butun tranzaksiya avtomatik `ROLLBACK` qilinadi.

---

*Hujjat tuzuvchi: boshqar.uz Core Engineering Team*
