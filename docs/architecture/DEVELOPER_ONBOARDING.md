# 🚀 Yangi Dasturchilar Uchun Onboarding Qo'llanmasi

Ushbu qo'llanma **boshqar.uz** loyihasiga yangi qo'shilgan muhandislarning birinchi 24 soat ichida loyihani to'liq tushunib, mustaqil ravishda birinchi vazifasini topshirishiga yordam beradi.

---

## 1. Talab Qilinadigan Dasturiy Vositalar

- **Node.js:** v20.x yoki undan yuqori (LTS tavsiya etiladi).
- **PostgreSQL:** 15 yoki 16 (yoki Supabase/Neon cloud instance).
- **Git:** 2.40+.
- **VSCode / Cursor / Antigravity IDE** (Prisma, Vue Language Features, Tailwind CSS IntelliSense kengaytmalari bilan).

---

## 2. Loyihani Lokal Muhitda O'rnatish (10 Daqiqa)

```bash
# 1. Loyihani klonlash
git clone https://github.com/Azamqulov/boshqar.uz.git
cd boshqar.uz

# 2. Backend sozlash
cd ubms-backend
npm install
cp .env.example .env
# .env ichida DATABASE_URL va JWT_SECRET ni tekshiring

# 3. Prisma client generatsiyasi va DB migratsiyasi
npx prisma generate
# Agar yangi DB bo'lsa: npx prisma migrate dev && npm run prisma:seed

# 4. Backendni ishga tushirish
npm run start:dev

# 5. Frontend sozlash (yangi terminalda)
cd ../ubms-frontend
npm install
npm run dev
```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:4000/api/v1](http://localhost:4000/api/v1)
- **Swagger Docs:** [http://localhost:4000/docs](http://localhost:4000/docs)

---

## 3. Loyiha Qoidalari va Standartlari

1. **Multi-tenant scoping:** Hech qachon `prisma.product.findMany({})` deb chaqirmang. Har doim `where: { businessId }` qat'iy tekshirilishi shart.
2. **Narx va summa yaxlitligi:** Narxlar `Math.round()` va `Decimal/Number` orqali saqlanadi. Klient yuborgan billing summalariga ishonilmaydi — serverda qayta hisoblanadi.
3. **Komponentlar:** Har bir Vue komponent bitta aniq mas'uliyatga ega bo'lishi kerak. 500+ qatorli bitta katta fayl yaratish taqiqlanadi (alohida `components/` papkalariga bo'ling).
4. **Validatsiya:** Backendga keluvchi har bir forma `class-validator` DTO orqali tekshirilishi shart.

---

## 4. Testlash va Git Workflow

Har qanday o'zgarishdan keyin:
```bash
# Backend testlarini yurgizish
cd ubms-backend
npm test

# Frontend buildni tekshirish
cd ../ubms-frontend
npm run build
```

**Git Commit formati:**
- `feat(modul): yangi imkoniyat tavsifi`
- `fix(modul): muammo tuzatilishi`
- `docs(modul): hujjatlashtirish`
- `test(modul): yangi testlar`
