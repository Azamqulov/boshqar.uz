export interface GuideStep {
  title: string;
  description: string;
  icon?: string;
  tip?: string;
}

export interface GuideModule {
  id: string;
  title: string;
  shortDesc: string;
  badge: string;
  icon: string;
  route: string;
  color: string;
  roles: string[];
  steps: GuideStep[];
  faq: { q: string; a: string }[];
}

export const GUIDE_MODULES: GuideModule[] = [
  {
    id: 'pos',
    title: 'Kassa va Tezkor Savdo (POS)',
    shortDesc: 'Tovarlarni izlash, shtrix-kod skanerlash, savat yig‘ish, chegirma berish va chek chiqarish.',
    badge: 'Savdo & Kassa',
    icon: 'ShoppingCart',
    route: '/pos',
    color: 'emerald',
    roles: ['Owner', 'Admin', 'Kassir', 'Sotuvchi'],
    steps: [
      {
        title: '1. Tovarlarni tanlash yoki shtrix-kod skaner qilish',
        description: 'Katalogdan tovar kartasini bosing yoki shtrix-kod skaner yordamida tezkor savatga qo\'shing. Qidiruv qatoridan nomi bo\'yicha ham topishingiz mumkin.',
        tip: 'Qidiruv maydoniga tez o\'tish uchun "F3" yoki "/" tugmasini bosing.'
      },
      {
        title: '2. Miqdor va chegirma belgilash',
        description: 'Savatdagi mahsulot sonini "+" / "-" tugmalari orqali o\'zgartiring. Agar kerak bo\'lsa, har bir tovar yoki butun chek uchun foizli/so\'mdagi chegirma kiriting.',
        tip: 'Mijoz tanlangan bo\'lsa, uning shaxsiy chegirmasi avtomatik hisoblanadi.'
      },
      {
        title: '3. To\'lov turini tanlash (Naqd, Karta, Nasiya)',
        description: '"To\'lov" tugmasini bosing. To\'lov turini tanlang (Naqd pul, Plastik karta, Aralash yoki Nasiya). Nasiyaga berish uchun mijozni tanlash majburiydir.',
        tip: 'Naqd to\'lovda berilgan pul summasini kiritsangiz, kassa avtomatik qaytimni (sdacha) hisoblab beradi.'
      },
      {
        title: '4. Chekni tasdiqlash va chop etish',
        description: 'To\'lov muvaffaqiyatli yakunlangach, termoprinter (58mm / 80mm) orqali chek avtomatik chop etiladi va kassa yangi mijoz uchun tozalanadi.',
        tip: 'Ombordan tovar zaxirasi real vaqtda serverda avtomatik kamaytiriladi.'
      }
    ],
    faq: [
      {
        q: 'Omborda tovar tugab qolsa nima bo\'ladi?',
        a: 'Tizim zaxirasi 0 bo\'lgan tovarni sotishga ruxsat bermaydi ("Tugagan" belgisi chiqadi) va ombor hisobi chalkashishining oldi olinadi.'
      },
      {
        q: 'Chekni bekor qilish yoki qaytarish qanday qilinadi?',
        a: 'Sotuvlar tarixidan chekni topib, "Qaytarish (Refund)" tugmasi orqali tovarlarni omborga qaytarish va pulni mijozga qaytarish mumkin.'
      }
    ]
  },
  {
    id: 'products',
    title: 'Mahsulotlar va Kategoriyalar',
    shortDesc: 'Yangi tovarlar kiritish, narxlar, o\'lchov birliklari, shtrix-kodlar va toifalar boshqaruvi.',
    badge: 'Katalog',
    icon: 'Package',
    route: '/products',
    color: 'blue',
    roles: ['Owner', 'Admin', 'Omborchi'],
    steps: [
      {
        title: '1. Yangi mahsulot qo\'shish',
        description: '"Mahsulotlar" sahifasiga o\'ting va "+ Yangi mahsulot" tugmasini bosing.',
        tip: 'Kategoriyalar bo\'limida oldindan kerakli toifalarni ochib olish tavsiya etiladi.'
      },
      {
        title: '2. Asosiy parametrlarni to\'ldirish',
        description: 'Nomi, Kategoriya, Birlik (dona, kg, litr), Tannarx (kirim narxi) va Sotish narxini kiriting.',
        tip: 'Tannarx va Sotish narxi kiritilganda tizim avtomatik sizga daromad marjasini ko\'rsatadi.'
      },
      {
        title: '3. Shtrix-kod va Minimal qoldiq',
        description: 'Mavjud shtrix-kodni skaner qiling yoki "Generatsiya" tugmasini bosing. Minimal qoldiq (Minimum stock) belgilasangiz, tovar oz qolganda tizim sizni ogohlantiradi.',
        tip: 'Shtrix-kodsiz tovarlar ham kassa qidiruvida nomi bo\'yicha oson topiladi.'
      },
      {
        title: '4. Saqlash va Omborga kiritish',
        description: '"Saqlash" tugmasini bosing. Yangi tovar darhol Kassa (POS) va Omborxona ro\'yxatida paydo bo\'ladi.',
      }
    ],
    faq: [
      {
        q: 'Kategoriyalarni qanday tahrirlayman?',
        a: '"Kategoriyalar" sahifasiga o\'tib, istalgan kategoriyani o\'zgartirishingiz, unga chiroyli rang va ikonka berishingiz mumkin.'
      },
      {
        q: 'Bir vaqtning o\'zida ko\'p tovarni o\'zgartirsa bo\'ladimi?',
        a: 'Ha, jadval ko\'rinishida tezkor qidiruv, toifalar bo\'yicha filtrlash va saralash orqali tovarlarni boshqarish mumkin.'
      }
    ]
  },
  {
    id: 'inventory',
    title: 'Omborxona va Qoldiqlar Nazorati',
    shortDesc: 'Ombordagi tovarlar qoldig\'i, inventarizatsiya, kirim-chiqim va tanqislik ogohlantirishlari.',
    badge: 'Ombor',
    icon: 'Boxes',
    route: '/inventory',
    color: 'amber',
    roles: ['Owner', 'Admin', 'Omborchi'],
    steps: [
      {
        title: '1. Ombor holatini tahlil qilish',
        description: 'Jami tovarlar zaxirasi, ombordagi umumiy summa va "Kam qolgan tovarlar" statistikasini ko\'ring.',
        tip: 'Qizil va sariq belgilar bilan ko\'rsatilgan tovarlar zudlik bilan buyurtma berishni talab qiladi.'
      },
      {
        title: '2. Qoldiqni to\'g\'rilash (Inventarizatsiya)',
        description: 'Omborni sanab chiqqaningizdan so\'ng, tovar yonidagi "Qoldiqni tahrirlash" tugmasini bosib, real miqdorni kiriting.',
        tip: 'Har bir to\'g\'rilash sababi (Qayta sanash, Yaroqsiz tovar, Yo\'qotish) audit jurnaliga yoziladi.'
      },
      {
        title: '3. Harakatlar tarixi',
        description: 'Qaysi tovar qachon, kim tomonidan kirim qilingani yoki kassa orqali sotilganini to\'liq ko\'rib boring.',
      }
    ],
    faq: [
      {
        q: 'Minimum qoldiq nima uchun kerak?',
        a: 'Bu chegara tovar tugab qolishidan oldin egasiga xabar berish va do\'konda savdo to\'xtab qolmasligi uchun xizmat qiladi.'
      }
    ]
  },
  {
    id: 'customers',
    title: 'Mijozlar va Nasiya Daftari (CRM)',
    shortDesc: 'Mijozlar bazasi, sotuvlar tarixi, nasiya/qarz hisobi va to\'lovlarni qabul qilish.',
    badge: 'CRM & Nasiya',
    icon: 'Users',
    route: '/customers',
    color: 'indigo',
    roles: ['Owner', 'Admin', 'Kassir'],
    steps: [
      {
        title: '1. Mijoz kiritish',
        description: '"Mijozlar" bo\'limida "+ Yangi mijoz" tugmasini bosing: Ism-familiya, Telefon raqami va ixtiyoriy izoh kiriting.',
        tip: 'Telefon raqamlari xalqaro +998 formatida avtomatik tekshiriladi.'
      },
      {
        title: '2. Nasiyaga savdo qilish',
        description: 'Kassada (POS) tovarlarni tanlagach, ushbu mijozni tanlang va "Nasiya" to\'lov turini bosing. Qarz summasi mijoz profiliga avtomatik yoziladi.',
      },
      {
        title: '3. Qarzni so\'ndirish (To\'lov qabul qilish)',
        description: 'Mijoz profilidagi "Qarz to\'lovi" tugmasini bosing, to\'langan summani (naqd yoki karta) kiriting va kvitansiya bering.',
        tip: 'Qarz to\'langanda bu summa avtomatik Moliya bo\'limidagi kassa tushumiga qo\'shiladi.'
      }
    ],
    faq: [
      {
        q: 'Mijoz qarz limitini cheklash mumkinmi?',
        a: 'Ha, mijoz sozlamalarida maksimal ruxsat etilgan nasiya limitini belgilash mumkin.'
      }
    ]
  },
  {
    id: 'finance',
    title: 'Moliya va Xarajatlar Boshqaruvi',
    shortDesc: 'Kunlik tushum, sof foyda, to\'lov turlari bo\'yicha taqsimot va korxona xarajatlari.',
    badge: 'Buxgalteriya',
    icon: 'DollarSign',
    route: '/finance',
    color: 'emerald',
    roles: ['Owner', 'Admin'],
    steps: [
      {
        title: '1. Moliyaviy ko\'rsatkichlarni kuzatish',
        description: 'Tanlangan davr (Bugun, 7 kun, 30 kun yoki ixtiyoriy sana) bo\'yicha Jami tushum, Xarajatlar va Sof foydani ko\'ring.',
        tip: 'Tushum va xarajat grafigi orqali biznesingiz o\'sish sur\'atini aniqlang.'
      },
      {
        title: '2. Xarajat kiritish',
        description: '"+ Xarajat qo\'shish" tugmasi orqali ijara, xodimlar oyligi, kommunal, ta\'minot yoki boshqa xarajatlarni toifasi bilan kiriting.',
      },
      {
        title: '3. To\'lov turlari auditi',
        description: 'Kassaga qancha naqd pul va qancha karta orqali pul tushgani taqsimotini solishtiring.',
      }
    ],
    faq: [
      {
        q: 'Sof foyda qanday hisoblanadi?',
        a: 'Sof foyda = Jami savdo tushumi - Sotilgan tovarlar tannarxi - Barcha kiritilgan xarajatlar.'
      }
    ]
  },
  {
    id: 'restaurant',
    title: 'Restoran va Kafe (Stollar & KDS)',
    shortDesc: 'Stollar xaritasi, ofitsiant ekrani, taomlarni buyurtma qilish va oshxona ekrani.',
    badge: 'Restoran',
    icon: 'UtensilsCrossed',
    route: '/restaurant/tables',
    color: 'rose',
    roles: ['Owner', 'Admin', 'Ofitsiant', 'Oshpaz'],
    steps: [
      {
        title: '1. Stolni tanlash va buyurtma ochish',
        description: 'Stollar xaritasidan bo\'sh stolni bosing, mehmonlar sonini kiriting va taomlarni qo\'shing.',
        tip: 'Yashil rang — bo\'sh stol, qizil rang — band stol.'
      },
      {
        title: '2. Oshxonaga (KDS) yuborish',
        description: '"Oshxonaga yuborish" tugmasini bosishingiz bilan taomlar oshpazning KDS ekranida real vaqtda paydo bo\'ladi.',
      },
      {
        title: '3. Hisob-kitob va stolni yopish',
        description: 'Mijoz hisobni so\'raganda "Pre-chek" chiqarish, so\'ngra to\'lovni qabul qilib stolni bo\'shatish.',
      }
    ],
    faq: [
      {
        q: 'KDS ekrani qanday ishlaydi?',
        a: 'Oshpazlar /restaurant/kds sahifasidan kelgan taomlarni "Tayyorlanmoqda" va "Tayyor" holatiga o\'tkazishadi, bu ofitsiantga darhol ko\'rinadi.'
      }
    ]
  },
  {
    id: 'appointments',
    title: 'Xizmatlar va Bandlovlar (Salon / Service)',
    shortDesc: 'Go\'zallik salonlari, sartaroshxona va xizmat ko\'rsatish sohalari uchun ustalar navbati.',
    badge: 'Xizmatlar',
    icon: 'Calendar',
    route: '/appointments',
    color: 'purple',
    roles: ['Owner', 'Admin', 'Usta / Admin'],
    steps: [
      {
        title: '1. Xizmatlar narxnomasi',
        description: '"Xizmatlar" bo\'limida har bir xizmat nomi, davomiyligi (minut) va narxini kiritasiz.',
      },
      {
        title: '2. Vaqt jadvalida bron qilish (Timeline Grid)',
        description: 'Taqvim orqali bo\'sh vaqt katakchasini bosing, mijoz va kerakli ustani tanlang.',
        tip: 'Ustalar jadvali vaqtlarning to\'qnash kelishidan saqlaydi.'
      },
      {
        title: '3. Xizmatni yakunlash va to\'lov',
        description: 'Mijoz kelgach, bandlovni "Bajarildi" holatiga o\'tkazing va kassa orqali chek uring.',
      }
    ],
    faq: [
      {
        q: 'Bir nechta xodimga alohida grafik qilsa bo\'ladimi?',
        a: 'Ha, jadval har bir xodim ustuni bo\'yicha alohida ko\'rsatiladi.'
      }
    ]
  },
  {
    id: 'settings',
    title: 'Sozlamalar, Xodimlar va Xavfsizlik',
    shortDesc: 'Xodimlarni boshqarish, ruxsatlar (RBAC), til, interfeys mavzusi va profil xavfsizligi.',
    badge: 'Tizim',
    icon: 'Settings',
    route: '/settings',
    color: 'slate',
    roles: ['Owner', 'Admin'],
    steps: [
      {
        title: '1. Xodimlarni qo\'shish va rol biriktirish',
        description: '"Sozlamalar" -> "Xodimlar" tabida yangi xodim telefon raqami va lavozimini (Kassir, Sotuvchi, Omborchi, Menejer) belgilang.',
        tip: 'Har bir rol faqat o\'ziga tegishli bo\'limlarni ko\'ra oladi.'
      },
      {
        title: '2. Shaxsiy profil va Parol',
        description: '"Profil" tabida ismingiz, telefoningizni o\'zgartirishingiz va yangi xavfsiz parol o\'rnatishingiz mumkin.',
      },
      {
        title: '3. Interfeys mavzusi va Til',
        description: 'Yorug\' (Light) yoki Tungi (Dark) rejimni tanlang. Dastur barcha moslamalarni eslab qoladi.',
      }
    ],
    faq: [
      {
        q: 'Kassir qanday kiradi?',
        a: 'Kassir o\'z telefon raqami va berilgan parol orqali kirganda, unga faqat Kassa va unga ruxsat berilgan oynalar ochiladi.'
      }
    ]
  }
];

export const AI_QUICK_PROMPTS = [
  { text: 'Qanday qilib yangi tovar qo‘shaman?', category: 'products' },
  { text: 'Kassada nasiyaga qanday sotiladi?', category: 'pos' },
  { text: 'Smenani qanday ochaman va yopaman?', category: 'shifts' },
  { text: 'Chek printerni qanday sozlayman?', category: 'printer' },
  { text: 'Ombor qoldig‘ini qanday to‘g‘rilayman?', category: 'inventory' },
  { text: 'Xodimlarga qanday ruxsat va rol beraman?', category: 'settings' },
  { text: 'Kunlik sof foydani qayerdan ko‘raman?', category: 'finance' },
  { text: 'Restoranda taomni oshxonaga qanday yuboraman?', category: 'restaurant' },
  { text: 'Shtrix-kod skaner va tezkor tugmalar (Hotkeys)', category: 'pos' },
  { text: 'Mijoz qarz to‘laganda nima qilish kerak?', category: 'customers' },
  { text: 'Ta’minotchi bilan hisob-kitob qanday qilinadi?', category: 'suppliers' },
  { text: 'Telegram bot orqali hisobot olish qanday ishlaydi?', category: 'telegram' }
];

export const AI_KNOWLEDGE_BASE = [
  // 1. MAHSULOTLAR VA KATALOG
  {
    keywords: ['mahsulot', 'tovar', 'qo\'shish', 'yangi tovar', 'qo‘shish', 'kiritish', 'narx', 'shtrix', 'kategoriya', 'tannarx', 'sotish narxi', 'rasm yuklash'],
    answer: `**Yangi mahsulot qo‘shish va tahrirlash tartibi:**

1. Yon menyudan **Mahsulotlar** bo‘limiga o‘ting.
2. Yuqori o‘ng burchakdagi **"+ Yangi mahsulot"** tugmasini bosing.
3. **Nomi:** Tovar nomini aniq kiriting (masalan: *Coca Cola 1.5L* yoki *Lavash Mini*).
4. **Kategoriya va Birlik:** Tegishli toifani va o‘lchov birligini (*dona, kg, litr, metr*) tanlang.
5. **Narxlar:** **Tannarx** (siz sotib olgan xarajat narxi) va **Sotish narxi**ni kiriting. Tizim avtomatik sizning daromad foizingiz (marja)ni ko‘rsatadi.
6. **Shtrix-kod:** Tovar ustidagi shtrix-kodni skaner qiling yoki **"Generatsiya"** tugmasini bosing.
7. **Minimal zaxira:** Qoldiq me'yorini belgilang (masalan *5 ta*). Tovar kam qolganda tizim ogohlantiradi.
8. **"Saqlash"** tugmasini bosing. Tovar darhol Kassa (POS) va Omborxona ro‘yxatiga tushadi!`,
    actionRoute: '/products',
    actionText: 'Mahsulotlar bo‘limiga o‘tish'
  },

  // 2. KASSA VA POS SOTUV
  {
    keywords: ['kassa', 'pos', 'sotish', 'savat', 'sotuv', 'chek', 'kassir', 'to\'lov', 'skaner', 'tezkor sotuv', 'savdo qilish', 'chek urish'],
    answer: `**Kassa (POS) orqali tezkor savdo qilish:**

1. **Kassa (POS)** oynasiga kiring.
2. **Tovarni savatga qo‘shish:** Shtrix-kod skanerdan o‘tkazing yoki qidiruv satridan nomini yozing (yoki kategoriya panellari orqali bosing).
3. **Miqdorni oshirish:** Klaviaturadagi raqamlar yoki **+ / -** tugmalari bilan tovar sonini belgilang.
4. **Chegirma berish:** Chek summasiga yoki alohida tovarga foizli/so‘mdagi chegirma bering.
5. **To‘lovni qabul qilish:** **"To‘lov" (F9 / Space)** tugmasini bosing:
   - **Naqd pul:** Mijoz bergan summani yozing — kassa avtomatik qaytimni (*sdacha*) chiqaradi.
   - **Plastik karta:** Humo / Uzcard to‘lovini tasdiqlang.
   - **Nasiya:** Xaridorni tanlab, qarzga rasmiylashtiring.
6. **Tasdiqlash:** Chek termoprinterda chop etiladi va ombordan tovar avtomatik kamayadi!`,
    actionRoute: '/pos',
    actionText: 'Kassa (POS) oynasini ochish'
  },

  // 3. SMENALAR VA Z-HISOBOT
  {
    keywords: ['smena', 'smena ochish', 'smena yopish', 'z hisobot', 'x hisobot', 'kassir smenasi', 'kassa qoldig\'i', 'smena hisoboti'],
    answer: `**Kassa Smenasini ochish va yopish tartibi:**

1. **Smena ochish:**
   - Ish kunini boshlashda kassir dasturga kirgach, **"Smena ochish"** oynasi chiqadi.
   - Kassa qutisidagi boshlang‘ich naqd pul qoldig‘ini kiriting va **"Smenani ochish"**ni bosing.

2. **Kun davomida savdo:**
   - Barcha naqd, karta va nasiya to‘lovlari ushbu smenaga biriktirilib boradi.

3. **Smenani yopish (Z-hisobot):**
   - Ish kuni yakunida yuqoridagi **"Smenani yopish"** tugmasini bosing.
   - Tizim kun davomidagi umumiy tushum, naqd pul, karta to‘lovlari va cheklar soni bo‘yicha to‘liq hisobotni chiqaradi va chek printerda Z-hisobotni chop etadi.`,
    actionRoute: '/finance?tab=shifts',
    actionText: 'Smenalar jurnaliga o‘tish'
  },

  // 4. NASIYA VA MIJOZLAR
  {
    keywords: ['nasiya', 'qarz', 'mijoz', 'crm', 'qarz daftar', 'to‘lov qabul', 'so\'ndirish', 'qarz berish', 'qarz yopish', 'nasiya limiti'],
    answer: `**Nasiya daftari va Qarzdorlik bilan ishlash:**

1. **Nasiyaga tovar sotish:**
   - Kassada savat yig‘ilgach, **"Mijoz tanlash"** orqali xaridorni belgilang (agar yangi mijoz bo‘lsa, shu yerni o‘zida tezkor qo‘shish mumkin).
   - To‘lov oynasida **"Nasiya"** turini tanlab, chekni tasdiqlang.

2. **Qarzni qabul qilish (Qarzni yopish):**
   - **Mijozlar (CRM)** sahifasiga o‘ting.
   - Kerakli mijozni topib, uning kartasidagi **"Qarz to‘lovi"** tugmasini bosing.
   - To‘langan summani (Naqd / Karta) kiriting va tasdiqlang.
   - Mijoz balansi bir zumda yangilanadi va bu to‘lov Moliya jurnali va auditga kiritiladi!

3. **Qarz limiti:** Sozlamalarda maksimal qarz limitini belgilab qo‘yishingiz mumkin, shunda belgilangan limitdan ortiq nasiya berilmaydi.`,
    actionRoute: '/customers',
    actionText: 'Mijozlar (CRM) bo‘limiga o‘tish'
  },

  // 5. OMBORXONA VA INVENTARIZATSIYA
  {
    keywords: ['ombor', 'omborxona', 'qoldiq', 'inventarizatsiya', 'kam qolgan', 'zaxira', 'sanash', 'kirim', 'chiqim', 'qoldiq to\'g\'rilash', 'spisaniya'],
    answer: `**Omborxona va Mahsulotlar qoldig‘ini boshqarish:**

1. **Omborxona** bo‘limida tovarlarning amaldagi soni, tannarxi va umumiy moddiy qiymati real vaqtda ko‘rinadi.
2. **Kirim qilish (Tovar qabul qilish):**
   - **"+ Kirim qilish"** tugmasini bosing, ta'minotchidan kelgan tovarlar miqdori va kelish narxini kiriting.
3. **Qoldiqni to‘g‘rilash / Spisaniya:**
   - Tovar yonidagi **"Tahrirlash"** tugmasi orqali real sanab chiqilgan qoldiqni kiritib saqlang.
4. **Ogohlantirish belgilari:**
   - **Sariq uchburchak (!)** — tovar minimal me'yordan kam qolgan.
   - **Qizil belgi** — tovar butunlay tugagan (0 ta). Zudlik bilan yangi kirim qilish kerak.`,
    actionRoute: '/inventory',
    actionText: 'Omborxonani ochish'
  },

  // 6. TA'MINOTCHILAR (SUPPLIERS)
  {
    keywords: ['ta\'minotchi', 'yetkazib beruvchi', 'postavshik', 'supplier', 'ta\'minotchiga to\'lov', 'xarid', 'akt sverka'],
    answer: `**Ta'minotchilar (Yetkazib beruvchilar) hisobi:**

1. **Ta'minotchilar** sahifasiga o‘ting.
2. **"+ Yangi ta'minotchi"** orqali firma/shaxs nomi, telefon raqami va ma'lumotlarini kiriting.
3. **Qarzdorlik hisobi:** Ombordan qilingan kirimlar bo‘yicha ta'minotchiga to‘lanishi kerak bo‘lgan qarz avtomatik yig‘ilib boradi.
4. **To‘lov qilish:** Ta'minotchi qatoridagi **"To‘lov"** tugmasini bosib, naqd yoki bank hisobidan to‘langan summani kiritasiz.
5. **Hisobot / Akt sverka:** Barcha kirimlar va to‘lovlar tarixini alohida ko‘rib chiqishingiz mumkin.`,
    actionRoute: '/suppliers',
    actionText: 'Ta\'minotchilar bo‘limiga o‘tish'
  },

  // 7. MOLIYA VA SOF FOYDA
  {
    keywords: ['moliya', 'foyda', 'xarajat', 'tushum', 'kassa hisobot', 'sof foyda', 'daromad', 'rasxod', 'ijara', 'oylik', 'statistika', 'grafik'],
    answer: `**Moliya, Tushum va Sof Foydani hisoblash:**

1. **Moliya** sahifasiga o‘ting.
2. **Davr filtri:** Yuqoridan *Bugun, Kecha, Shu hafta, Shu oy* yoki o‘zingiz istagan oraliqni tanlang.
3. **Hisobotlar tarkibi:**
   - **Jami Savdo (Tushum):** Barcha sotilgan cheklar summasi.
   - **Sotilgan tovarlar tannarxi:** Tovar uchun ketgan xarajat.
   - **Yalpi foyda:** Tushumdan tovar tannarxini ayirgandagi foyda.
   - **Xarajatlar:** Do‘kon xarajatlari (ijara, maosh, kommunal, boshqa).
   - **Sof Foyda (Net Profit):** Barcha xarajatlar chiqarib tashlangandan keyingi toza daromad.
4. **Xarajat qo‘shish:** **"+ Xarajat"** tugmasini bosib, toifasini va summasini kiritishingiz mumkin.`,
    actionRoute: '/finance',
    actionText: 'Moliya hisobotini ochish'
  },

  // 8. RESTORAN VA STOLLAR
  {
    keywords: ['restoran', 'stol', 'kds', 'oshxona', 'ofitsiant', 'taom', 'kafe', 'prechek', 'stol ochish', 'stol yopish', 'buyurtma'],
    answer: `**Restoran, Kafe va Fast-food tizimi:**

1. **Stollar xaritasi (/restaurant/tables):**
   - Zallar bo‘yicha stollar joylashuvini ko‘ring.
   - Yashil stol — bo‘sh, qizil stol — band, ko‘k stol — hisob kutilmoqda.
2. **Ofitsiant buyurtmasi:**
   - Stolni bosing, mehmonlar sonini tanlang va menyudan taomlarni savatga soling.
   - **"Oshxonaga yuborish"** tugmasini bosing — buyurtma darhol oshpaz ekraniga tushadi.
3. **Oshxona ekrani (KDS - /restaurant/kds):**
   - Oshpaz yangi buyurtmalarni ko‘rib, bitta bosish bilan *Tayyorlanmoqda* yoki *Tayyor* holatiga o‘tkazadi.
4. **Hisob-kitob:** Ofitsiant **"Pre-chek"** chiqarib mehmonga uzatadi, to‘lov olingach stol avtomatik bo‘shaydi.`,
    actionRoute: '/restaurant/tables',
    actionText: 'Stollar xaritasiga o‘tish'
  },

  // 9. SALON VA XIZMATLAR
  {
    keywords: ['salon', 'usta', 'xizmat', 'bandlov', 'navbat', 'vaqt', 'sartaroshxona', 'bron', 'appointment', 'jadval'],
    answer: `**Go‘zallik saloni va Xizmatlar (Bron/Bandlov):**

1. **Xizmatlar katalogi:** Har bir xizmat nomi, davomiyligi (*masalan: 45 daqiqa*) va narxini kiritasiz.
2. **Ustalar jadvali (Timeline):**
   - **Bandlovlar (/appointments)** sahifasida ustalar bo‘yicha kunlik taqvim ochiladi.
   - Bo‘sh soat katakchasini bosing, mijoz ismi, telefon raqami va xizmatni tanlang.
3. **Mijoz qabul qilinganda:**
   - Bandlovni "Bajarildi" holatiga o‘tkazing va Kassa orqali chek uring.
   - Tizim har bir ustaning kunlik ishlagan summasi va foizini aniq hisoblab beradi.`,
    actionRoute: '/appointments',
    actionText: 'Bandlovlar taqvimiga o‘tish'
  },

  // 10. PRINTER VA USKUNALAR
  {
    keywords: ['printer', 'termoprinter', 'chek printer', '58mm', '80mm', 'skaner', 'shtrix kod', 'tarozi', 'chop etish', 'drayver'],
    answer: `**Chek Printer va Shtrix-kod Skaner ulash:**

1. **Termoprinter (58mm / 80mm):**
   - USB, Bluetooth yoki Wi-Fi orqali printerni kompyuter/planshetga ulang.
   - Kassa oynasidagi **Sozlamalar** tugmasi orqali chek enini (58mm yoki 80mm) tanlang.
   - Savdo yakunlanishi bilan chek avtomatik shrift o‘lchamiga moslab chop etiladi.
2. **Shtrix-kod skaner:**
   - USB / Wireless skanerni ulang. Tizim avtomatik *Keyboard Wedge* rejimida ishlaydi — alohida drayver kerak emas.
3. **Qulaylik:** Klaviaturadagi **F9** (To‘lov), **F3** (Qidiruv) va **Enter** tugmalari savdoni yanada tezlashtiradi.`,
    actionRoute: '/pos',
    actionText: 'Kassa oynasini ochish'
  },

  // 11. XODIMLAR VA RUXSATLAR (RBAC)
  {
    keywords: ['xodim', 'rol', 'ruxsat', 'rbac', 'parol', 'kassir qo\'shish', 'admin', 'sozlama', 'huquq', 'menejer'],
    answer: `**Xodimlar rollari va Huquqlarni taqsimlash:**

1. **Sozlamalar (/settings) -> Xodimlar** tabiga kiring.
2. **"+ Yangi xodim"** tugmasini bosing.
3. Xodim ismi, telefon raqami, paroli va lavozimini tanlang:
   - **Kassir / Sotuvchi:** Faqat kassa savdosi va chek urishga ruxsat beriladi (Moliya va Sozlamalarni ko‘ra olmaydi).
   - **Omborchi:** Faqat tovarlar, omborxona va kirim-chiqimga ruxsat.
   - **Admin:** Barcha bo‘limlarni boshqara oladi (faqat biznes egasi sozlamalaridan tashqari).
   - **Ofitsiant / Usta:** Faqat stollar yoki o‘z bandlovlarini ko‘radi.`,
    actionRoute: '/settings?tab=employees',
    actionText: 'Xodimlar sozlamasiga o‘tish'
  },

  // 12. TELEGRAM BOT INTEGRATSIYASI
  {
    keywords: ['telegram', 'bot', 'telegram bot', 'bildirishnoma', 'sms', 'hisobot bot', 'kunlik hisobot bot'],
    answer: `**Telegram Bot orqali Hisobot va Xabarnomalar olish:**

1. **Boshqar.uz Telegram Boti** do‘kon egasiga real vaqtda quyidagi imkoniyatlarni beradi:
   - Kunlik umumiy savdo va tushum hisoboti.
   - Omborda qaysi mahsulotlar tugab qolgani haqida tezkor ogohlantirish.
   - Kassa smenasi yopilganda Z-hisobot xabarnomasi.
2. **Ulash tartibi:** **Sozlamalar** bo‘limidan o‘zingizning Telegram akkauntingizni tizimga biriktiring va botni faollashtiring.`,
    actionRoute: '/settings',
    actionText: 'Sozlamalar bo‘limiga o‘tish'
  },

  // 13. AUDIT JURNALI VA XAVFSIZLIK
  {
    keywords: ['audit', 'tarix', 'kim o\'chirdi', 'xavfsizlik', 'kim kirdi', 'o\'zgarishlar', 'log'],
    answer: `**Audit Jurnali va Tizim Xavfsizligi:**

1. **Sozlamalar -> Audit Jurnali** tabida tizimda sodir bo‘lgan barcha harakatlar qayd etiladi:
   - Qaysi xodim qaysi chekni bekor qildi yoki o‘chirdi.
   - Mahsulot narxi yoki qoldig‘i kim tomonidan o‘zgartirildi.
   - Kirish va chiqish vaqtlari, IP-manzillar.
2. Bu biznes egasiga har qanday noqonuniy o‘zgarish yoki firibgarlikning oldini olishga to‘liq kafolat beradi!`,
    actionRoute: '/settings?tab=audit',
    actionText: 'Audit jurnaliga o‘tish'
  },

  // 14. TEZKOR TUGMALAR (HOTKEYS)
  {
    keywords: ['hotkey', 'klaviatura', 'tezkor tugma', 'tugmalar', 'f1', 'f2', 'f3', 'f4', 'f9', 'f10', 'space'],
    answer: `**Kassa va Tizim Tezkor Klaviatura Tugmalari (Hotkeys):**

• **F3 yoki /** — Tovar qidiruv maydoniga tezkor o‘tish.
• **F9 yoki Space** — To‘lov oynasini ochish.
• **F2** — Yangi mijoz tanlash / CRM oynasi.
• **F4** — Chek uchun umumiy chegirma kiritish.
• **F10** — Chekni to‘xtatib turish (Hold order / Navbatga qo‘yish).
• **Escape (Esc)** — Ochiq oynalarni yopish / bekor qilish.
• **Enter** — Tanlangan tovarni savatga kiritish yoki to‘lovni tasdiqlash.`,
    actionRoute: '/pos',
    actionText: 'Kassa (POS) da sinab ko‘rish'
  },

  // 15. CHEGIRMA VA AKSIYALAR
  {
    keywords: ['chegirma', 'aksiya', 'skidka', 'discount', 'foiz', 'bonus', 'mijoz chegirmasi'],
    answer: `**Chegirmalar va Aksiyalarni qo‘llash:**

1. **Tovarga alohida chegirma:** Kassada savatdagi tovar ustiga bosib, unga foizli (*masalan: 10%*) yoki naqd summadagi chegirma belgilang.
2. **Butun chekka chegirma:** Savat ostidagi **"Chegirma"** tugmasini bosing va butun savdo uchun umumiy chegirma kiriting.
3. **Mijozning doimiy chegirmasi:** Agar mijoz kartasida shaxsiy chegirma foizi kiritilgan bo‘lsa, uni tanlashingiz bilan barcha tovarlarga avtomatik chegirma qo‘llanadi.`,
    actionRoute: '/pos',
    actionText: 'Kassada sinab ko‘rish'
  }
];

