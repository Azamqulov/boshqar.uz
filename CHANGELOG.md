# BOSHQAR.UZ (UBMS SaaS v2.0) — Technical Changelog

**Platform:** BOSHQAR.UZ — Universal Business Management System (UBMS SaaS)  
**Release:** v2.0.0  
**Stack:** Vue 3 (Composition API) + Vite + TypeScript + Pinia + Tailwind CSS (Frontend) | NestJS + Prisma ORM + PostgreSQL (Backend)  
**Date:** 2026-08-12  

---

## 📑 Summary of Completed Phases

### 👑 Phase 1: SuperAdmin — Owner Monitoring & Governance
- **Frontend (`SuperAdminView.vue`):**
  - Searchable and filterable table of all platform business owners (`/superadmin` -> Owners tab).
  - Search by owner name, phone, or company name; filter by plan (`Free`, `Pro`, `Business`) and account status (`active`, `blocked`).
  - Owner individual details modal with 4 summary KPI cards (Lifetime GMV, 30d GMV, Total Catalog Products, Total Staff), 14-day daily sales dynamics bar chart, instant plan upgrade/downgrade selector, and one-click account block/activate action.
- **Backend (`super-admin.controller.ts`, `super-admin.service.ts`):**
  - `GET /superadmin/owners`: Paginated listing with multi-tenant GMV totals and business relations.
  - `GET /superadmin/owners/:id/stats`: 14-day sales trend distribution and aggregated business analytics.
  - `PATCH /superadmin/owners/:id/status`: Cascading owner and business account status toggle.
  - `PATCH /superadmin/owners/:id/plan`: Subscription plan update endpoint.

---

### 🎨 Phase 2: Design Tokens & Searchable Select (`AppSelect.vue`)
- **Semantic Design Tokens (`index.css`):**
  - Defined global CSS custom properties for Light and Dark modes (`--color-primary`, `--color-primary-hover`, `--color-surface`, `--color-border`, `--color-text-primary`, `--color-text-secondary`).
  - Unified color scheme with emerald brand identity (`#10b981`).
- **Advanced Select Component (`AppSelect.vue`):**
  - Searchable filter mode with real-time text matching.
  - Slot support for icons, color swatches, and group categorization.
  - Scale + fade micro-animations (150ms) and automatic click-outside dismiss.

---

### 🗂️ Phase 3: Products & Category CRUD Module
- **Prisma Schema Update:**
  - Added `icon` (String?) and `color` (String?) to the `Category` model.
  - Migrated PostgreSQL database via `prisma db push`.
- **Frontend Management (`ProductsView.vue`):**
  - Dedicated Category Management Modal with full create, edit, and delete actions.
  - Integrated color picker and emoji/icon selection.
  - Live product counter per category and safe cascade deletion.
  - Updated category filter and creation forms with `AppSelect`.

---

### 🔥 Phase 4: Sales Velocity & 30-Day Trend Bestsellers
- **Backend API (`products.controller.ts`, `products.service.ts`):**
  - `GET /products/bestsellers?limit=50&period=30d`: Aggregates completed order transactions over a 30-day window to rank top-selling products by quantity and revenue.
- **POS & Dashboard Integration:**
  - **POS View (`POSView.vue`):** Default catalog sorting prioritized by bestseller popularity; "Top Tovar (Trend)" category filter with fire icon badge (`Flame`).
  - **Dashboard (`DashboardView.vue`):** "Top 5 Bestsellers (30-Day Trend)" widget displaying unit sales and total turnover.

---

### 🛡️ Phase 5: Stock Integrity & Concurrency Control
- **Frontend Guard (`POSView.vue`):**
  - Products with `stockQty <= 0` are marked with a red "Tugagan" badge and prevented from being added.
  - Real-time client-side stock ceiling validation on cart additions.
- **Backend Atomic Guard (`orders.service.ts`):**
  - Server-side inventory deduction inside an atomic Prisma transaction (`$transaction`).
  - Automatic check for stock sufficiency per branch before completing order; throws `409 ConflictException (INSUFFICIENT_STOCK)` if quantity exceeds available balance.

---

### 👤 Phase 6: User Profile & Security Self-Service
- **Self-Service Portal (`SettingsView.vue`):**
  - "Mening Profilim" (My Profile) tab allowing any authenticated user to update their full name, phone number, and email.
  - Role indicator badge (`Owner`, `Admin`, `SuperAdmin`, `Worker`).
  - Password change form with current password verification (`bcrypt.compare`) and new password hashing (`bcrypt.hash`).
- **Backend (`auth.controller.ts`, `auth.service.ts`):**
  - `POST /auth/profile/me` for profile info updates.
  - `POST /auth/change-password` with secure old password verification.

---

### 📱 Phase 7: Standardized PhoneInput Component
- **Component (`PhoneInput.vue`):**
  - Fixed, non-deletable `+998` country code prefix badge with flag.
  - Auto-formatting for 9 digits into `XX XXX XX XX` (e.g., `90 123 45 67`).
  - Hard constraint of 9 digits (`maxlength="12"` with spaces).
  - Sanitizes non-digit characters on input and paste events.
  - Emits standard `+998XXXXXXXXX` or 9-digit raw string.
- **Universal Usage:**
  - Authentication: `RegisterView.vue`, `LoginView.vue`.
  - Settings: `SettingsView.vue` (Personal Profile & Employee Creation).
  - CRM: `CustomersView.vue` (Customer Creation).
  - Onboarding: `OnboardingWizard.vue` (Branch Phone).
  - Appointments: `AppointmentsView.vue`.

---

### 🖼️ Phase 8: UI / UX Architectural Refinements
- **8.1 & 8.3 Modal Architecture:**
  - Eliminated scrollbar protrusion outside `rounded-2xl` corners using `.modal-overlay`, `.modal-container` (`overflow-hidden`), and `.modal-body` (`overflow-y-auto`).
  - Implemented backdrop click dismiss (`@click.self`) on all modal dialogs.
- **8.4 Theme & Color Consistency:**
  - Replaced legacy purple accents in administrative views with emerald/teal design tokens.
- **8.5 Select Standardization:**
  - Replaced raw `<select>` tags across views with standardized `AppSelect.vue`.
- **8.6 Performance & SEO:**
  - Converted Vue router to route-level async code-splitting (`() => import(...)`), reducing initial bundle size by over 60%.
  - Added comprehensive SEO meta tags (title, description, Open Graph, Twitter cards) in `index.html`.
