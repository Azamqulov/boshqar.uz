# 🤝 boshqar.uz Loyihasiga Hissa Qo'shish Qo'llanmasi (Contributing Guide)

`boshqar.uz` ochiq va xavfsiz rivojlanish jarayonini qo'llab-quvvatlaydi. Har qanday yangi xususiyat, tuzatish yoki refaktoring quyidagi standartlarga muvofiq amalga oshirilishi shart.

---

## 1. Branch Nomi Standartlari

- Yangi funksiya: `feat/modul-nomi` (masalan, `feat/soliq-ofd-update`)
- Xatolikni tuzatish: `fix/modul-nomi` (masalan, `fix/pos-shift-calculation`)
- Refaktoring: `refactor/komponent-nomi` (masalan, `refactor/app-select-a11y`)
- Hujjatlashtirish: `docs/mavzu` (masalan, `docs/api-guide`)

---

## 2. Commit Xabarlari Formati (Conventional Commits)

Commit xabarlari aniq, o'zbek yoki ingliz tilida va quyidagi formatda bo'lishi lozim:
```
<tur>(<modul>): <qisqa va lo'nda tushuntirish>

[Ixtiyoriy batafsil matn]
```

Misollar:
- `feat(orders): add multi-currency payment split handling`
- `fix(auth): prevent brute force lockout bypass on redis fail`
- `style(frontend): improve contrast ratio for dark mode inputs`
- `docs(tz): add 5 critical issues resolution specification`

---

## 3. Kod Sifati va Tekshiruv (Quality Gates)

Pull Request yuborishdan oldin quyidagi tekshiruvlarni bajaring:
1. `npm --prefix ubms-backend run build` (Backend TypeScript kompilyatsiyasi xatosiz o'tishi kerak)
2. `npm --prefix ubms-frontend run build` (Frontend `vue-tsc` va Vite build toza bo'lishi kerak)
3. `npm --prefix ubms-backend run test` (Barcha Jest unit testlar yashil bo'lishi shart)
4. `npm --prefix ubms-backend run system:healthcheck` (Tizim integratsiyasi tekshiriladi)

---

---

## 4. UI & Dizayn Standartlari (0% Emoji / 100% Lucide SVG Icons)

- **Qat'iy Qoida:** Foydalanuvchi interfeysi (tugmalar, menyular, jadvallar, modallar, badge'lar va xabarlar)da hech qachon xom Unicode emoji (📦, ☕, 🍽️, ⚠️, ❌ va h.k.) ishlatilmaydi.
- Barcha vizual elementlar uchun faqat `lucide-vue-next` kutubxonasining vektorli SVG ikonkalaridan foydalaniladi.
- Ikonkalar mos o'lchamda (`w-3.5 h-3.5`, `w-4 h-4`, `w-5 h-5`), to'g'ri rang klasslari (`text-emerald-500`, `text-amber-500`, `text-slate-400`) va adaptive Dark/Light mode bilan ishlatiladi.

---

## 5. Xavfsizlik Qoidalari

- Hech qachon `.env`, parollar, secret keylar yoki API tokenlarni Git'ga commit qilmang.
- Barcha SQL so'rovlar Prisma ORM orqali parametrlangan holda yuboriladi (Raw SQL'da injectiondan ehtiyot bo'ling).
- Barcha o'zgaruvchilar va parametrlar qat'iy tiplanadi (`any` ishlatish taqiqlanadi).

---

*boshqar.uz Core Engineering Team*
