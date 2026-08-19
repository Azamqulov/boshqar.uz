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
  // 1. KASSA VA SAVDO (POS)
  {
    id: 'pos',
    title: 'Kassa va Tezkor Savdo (POS)',
    shortDesc: 'Tovarlarni shtrix-kod bilan skanerlash, savat yig‘ish, chegirma, to‘lov turlari va chek chiqarish.',
    badge: 'Kassa & Savdo',
    icon: 'ShoppingCart',
    route: '/pos',
    color: 'emerald',
    roles: ['Owner', 'Admin', 'Kassir', 'Sotuvchi'],
    steps: [
      {
        title: '1. Tovarlarni tanlash yoki shtrix-kod skaner qilish',
        description: 'Katalogdan tovar kartasini bosing yoki shtrix-kod skanerni tovar shtrix-kodiga qarating. Nomi yoki kodi bo‘yicha qidirish ham mumkin.',
        tip: 'Qidiruv maydoniga tez o‘tish uchun "F3" yoki "/" tugmasini bosing.'
      },
      {
        title: '2. Miqdor va chegirma belgilash',
        description: 'Savatdagi mahsulot sonini "+" / "-" tugmalari orqali o‘zgartiring. Agar kerak bo‘lsa, alohida tovar yoki butun chek uchun foizli/so‘mdagi chegirma kiriting.',
        tip: 'Mijoz tanlangan bo‘lsa, uning shaxsiy chegirmasi avtomatik hisoblanadi.'
      },
      {
        title: '3. To‘lov turini tanlash (Naqd, Karta, Nasiya, Aralash)',
        description: '"To‘lov" (F9 / Space) tugmasini bosing. To‘lov turini tanlang (Naqd pul, Humo / Uzcard, Nasiya yoki Bo‘lib to‘lash).',
        tip: 'Naqd to‘lovda berilgan pul summasini kiritsangiz, kassa avtomatik qaytimni (sdacha) hisoblab beradi.'
      },
      {
        title: '4. Chekni tasdiqlash va chop etish',
        description: 'To‘lov yakunlangach, termoprinter (58mm / 80mm) orqali chek avtomatik chop etiladi va kassa yangi mijoz uchun tozalanadi.',
        tip: 'Ombordan tovar zaxirasi real vaqtda serverda avtomatik kamaytiriladi.'
      },
      {
        title: '5. Savatni navbatga qo‘yish (Hold Order)',
        description: 'Agar xaridor qo‘shimcha tovar olishga ketsa, "Navbatga qo‘yish" (F10) tugmasini bosib, keyingi mijozga xizmat ko‘rsatishingiz mumkin.',
        tip: 'Keyinchalik "Kutilayotgan savdolar" ro‘yxatidan ushbu savatni 1-klikda qayta tiklaysiz.'
      }
    ],
    faq: [
      {
        q: 'Omborda tovar tugab qolsa nima bo‘ladi?',
        a: 'Tizim zaxirasi 0 bo‘lgan tovarni sotishga ruxsat bermaydi ("Tugagan" belgisi chiqadi) va ombor hisobi chalkashishining oldi olinadi.'
      },
      {
        q: 'Chekni bekor qilish yoki qaytarish qanday qilinadi?',
        a: 'Sotuvlar tarixidan chekni topib, "Qaytarish (Refund)" tugmasi orqali tovarlarni omborga qaytarish va pulni mijozga qaytarish mumkin.'
      },
      {
        q: 'Internet uzilib qolsa kassa ishlaydimi?',
        a: 'Ha! Boshqar.uz POS tizimi Offline rejimni qo‘llab-quvvatlaydi. Internet kelishi bilan barcha savdolar serverga avtomatik sinxronlanadi.'
      }
    ]
  },

  // 2. MAHSULOTLAR VA KATALOG
  {
    id: 'products',
    title: 'Mahsulotlar, Narxlar va Kategoriyalar',
    shortDesc: 'Yangi tovarlar kiritish, tannarx va sotish narxlari, shtrix-kodlar, o‘lchov birliklari va toifalar.',
    badge: 'Katalog',
    icon: 'Package',
    route: '/products',
    color: 'blue',
    roles: ['Owner', 'Admin', 'Omborchi'],
    steps: [
      {
        title: '1. Yangi mahsulot qo‘shish',
        description: '"Mahsulotlar" sahifasiga o‘ting va "+ Yangi mahsulot" tugmasini bosing.',
        tip: 'Oldindan Kategoriyalar bo‘limida kerakli toifalarni ochib olish tavsiya etiladi.'
      },
      {
        title: '2. Asosiy parametrlarni to‘ldirish',
        description: 'Nomi, Kategoriya, Birlik (dona, kg, litr, metr, pachka), Tannarx va Sotish narxini kiriting.',
        tip: 'Tannarx va Sotish narxi kiritilganda tizim sizning foyda marjangizni avtomatik hisoblab ko‘rsatadi.'
      },
      {
        title: '3. Shtrix-kod va Minimal qoldiq',
        description: 'Mavjud shtrix-kodni skaner qiling yoki "Generatsiya" tugmasini bosing. Minimal me\'yor (Minimum stock) belgilang.',
        tip: 'Minimal qoldiq — do‘konda tovar tugashidan oldin ogohlantirish berish uchun ishlatiladi.'
      },
      {
        title: '4. Excel orqali ommaviy import/eksport',
        description: 'Minglab mahsulotlarni bitta Excel fayl orqali tizimga bir zumda yuklash yoki mavjud bazani yuklab olish mumkin.',
        tip: 'Namuna shablonini "Import" oynasidan yuklab olib to‘ldirishingiz mumkin.'
      }
    ],
    faq: [
      {
        q: 'Kategoriyalarni qanday tartiblayman?',
        a: '"Kategoriyalar" sahifasiga o‘tib, har bir toifaga chiroyli rang, ikonka va tartib raqami berishingiz mumkin.'
      },
      {
        q: 'Bir nechta narx turini belgilasa bo‘ladimi?',
        a: 'Ha, ulgurji (optom) va chakana narxlarni mahsulot kartasida kiritish mumkin.'
      }
    ]
  },

  // 3. OMBORXONA VA ZAXIRALAR
  {
    id: 'inventory',
    title: 'Omborxona va Zaxiralar Nazorati',
    shortDesc: 'Ombordagi tovarlar qoldig‘i, inventarizatsiya, kirim-chiqim harakatlari va tanqislik ogohlantirishlari.',
    badge: 'Omborxona',
    icon: 'Store',
    route: '/inventory',
    color: 'amber',
    roles: ['Owner', 'Admin', 'Omborchi'],
    steps: [
      {
        title: '1. Ombor holatini tahlil qilish',
        description: 'Jami tovarlar zaxirasi, ombordagi umumiy tannarx qiymati va "Kam qolgan tovarlar" statistikasini real vaqtda ko‘ring.',
        tip: 'Qizil va sariq belgilar bilan ko‘rsatilgan tovarlar zudlik bilan buyurtma berishni talab qiladi.'
      },
      {
        title: '2. Qoldiqni to‘g‘rilash (Inventarizatsiya)',
        description: 'Omborni sanab chiqqaningizdan so‘ng, tovar yonidagi "Qoldiqni tahrirlash" tugmasini bosib, sanalgan real miqdorni kiriting.',
        tip: 'Har bir to‘g‘rilash sababi (Qayta sanash, Yaroqsiz tovar, Yo‘qotish) audit jurnaliga yoziladi.'
      },
      {
        title: '3. Harakatlar tarixi (Audit)',
        description: 'Qaysi tovar qachon, kim tomonidan kirim qilingani yoki kassa orqali sotilganini to‘liq ko‘rib boring.',
      }
    ],
    faq: [
      {
        q: 'Minimum qoldiq nima uchun kerak?',
        a: 'Bu chegara tovar tugab qolishidan oldin egasiga xabar berish va do‘konda savdo to‘xtab qolmasligi uchun xizmat qiladi.'
      }
    ]
  },

  // 4. MIJOZLAR VA NASIYA CRM
  {
    id: 'customers',
    title: 'Mijozlar va Nasiya Daftari (CRM)',
    shortDesc: 'Mijozlar bazasi, xaridlar tarixi, nasiya/qarz hisobi, qarz limitlari va to‘lovlarni qabul qilish.',
    badge: 'CRM & Nasiya',
    icon: 'Users',
    route: '/customers',
    color: 'purple',
    roles: ['Owner', 'Admin', 'Kassir'],
    steps: [
      {
        title: '1. Yangi mijoz kiritish',
        description: '"Mijozlar" bo‘limida "+ Yangi mijoz" tugmasini bosing: Ism-familiya, Telefon raqami va ixtiyoriy izoh kiriting.',
        tip: 'Telefon raqamlari xalqaro +998 formatida avtomatik tekshiriladi.'
      },
      {
        title: '2. Nasiyaga savdo qilish',
        description: 'Kassada (POS) tovarlarni tanlagach, mijozni tanlang va "Nasiya" to‘lov turini bosing. Qarz summasi mijoz profiliga avtomatik yoziladi.',
      },
      {
        title: '3. Qarzni so‘ndirish (To‘lov qabul qilish)',
        description: 'Mijoz profilidagi "Qarz to‘lovi" tugmasini bosing, to‘langan summani (naqd yoki karta) kiriting va kvitansiya bering.',
        tip: 'Qarz to‘langanda bu summa avtomatik Moliya bo‘limidagi kassa tushumiga qo‘shiladi.'
      }
    ],
    faq: [
      {
        q: 'Mijoz qarz limitini cheklash mumkinmi?',
        a: 'Ha, mijoz sozlamalarida maksimal ruxsat etilgan nasiya limitini belgilash mumkin.'
      },
      {
        q: 'Mijozga qarz eslatmasini yuborish mumkinmi?',
        a: 'Ha, mijoz kartasidagi "Telegram/SMS eslatma" tugmasi orqali tayyor eslatma matnini yuborish mumkin.'
      }
    ]
  },

  // 5. TA'MINOTCHILAR VA XARIDLAR
  {
    id: 'suppliers',
    title: 'Ta\'minotchilar va Xaridlar Boshqaruvi',
    shortDesc: 'Yetkazib beruvchilar bazasi, tovar qabul qilish (kirim), ta\'minotchi qarzlari va akt-sverka.',
    badge: 'Ta\'minot',
    icon: 'Truck',
    route: '/suppliers',
    color: 'cyan',
    roles: ['Owner', 'Admin', 'Omborchi'],
    steps: [
      {
        title: '1. Yangi ta\'minotchi kiritish',
        description: '"Ta\'minotchilar" bo‘limida "+ Yangi ta\'minotchi" tugmasi orqali yetkazib beruvchi kompaniya yoki shaxs ma\'lumotlarini saqlang.',
      },
      {
        title: '2. Tovar kirim qilish va qarz hisobi',
        description: 'Ta\'minotchidan kelgan tovarlar bo‘yicha hisob-faktura kiritiladi. To‘lanmagan qism ta\'minotchi oldidagi qarzimiz sifatida qayd etiladi.',
      },
      {
        title: '3. Ta\'minotchiga to‘lov qilish',
        description: '"To‘lov qilish" tugmasini bosib, naqd pul yoki bank hisob raqamidan o‘tkazilgan summani kiriting.',
        tip: 'Barcha o‘zaro hisob-kitoblar tarixi akt-sverka formatida saqlanadi.'
      }
    ],
    faq: [
      {
        q: 'Ta\'minotchi oldidagi qarzimizni qayerda ko‘raman?',
        a: 'Ta\'minotchilar sahifasining yuqori qismidagi umumiy balans kartasida barcha qarzlar ko‘rsatiladi.'
      }
    ]
  },

  // 6. MOLIYA VA HISOBOTLAR
  {
    id: 'finance',
    title: 'Moliya, Xarajatlar va Sof Foyda',
    shortDesc: 'Kunlik tushum, xarajatlar tahlili, sof foyda (P&L), to‘lov turlari balansi va moliyaviy audit.',
    badge: 'Buxgalteriya',
    icon: 'DollarSign',
    route: '/finance',
    color: 'emerald',
    roles: ['Owner', 'Admin'],
    steps: [
      {
        title: '1. Moliyaviy ko‘rsatkichlarni kuzatish',
        description: 'Tanlangan davr (Bugun, 7 kun, 30 kun yoki ixtiyoriy sana) bo‘yicha Jami tushum, Xarajatlar va Sof foydani ko‘ring.',
        tip: 'Tushum va xarajat grafigi orqali biznesingiz o‘sish sur\'atini aniqlang.'
      },
      {
        title: '2. Xarajat kiritish (Chiqim)',
        description: '"+ Xarajat qo‘shish" tugmasi orqali ijara, xodimlar oyligi, kommunal, ta\'minot yoki boshqa xarajatlarni toifasi bilan kiriting.',
      },
      {
        title: '3. To‘lov turlari balansi',
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

  // 7. SMENALAR VA Z-HISOBOT
  {
    id: 'shifts',
    title: 'Kassa Smenalari va Z-Hisobot',
    shortDesc: 'Kassa smenasini ochish, kun davomida naqd pul qoldig‘i nazorati, smenani yopish va Z-hisobot.',
    badge: 'Smenalar',
    icon: 'Clock',
    route: '/finance?tab=shifts',
    color: 'orange',
    roles: ['Owner', 'Admin', 'Kassir'],
    steps: [
      {
        title: '1. Smenani ochish',
        description: 'Kassir ish kunini boshlashda kassadagi dastlabki naqd pul miqdorini kiritib "Smena ochish"ni tasdiqlaydi.',
      },
      {
        title: '2. Kun davomida savdolar',
        description: 'Barcha cheklar va to‘lovlar aynan shu ochilgan smenaga va kassir profiliga biriktirilib boradi.',
      },
      {
        title: '3. Smenani yopish va Z-hisobot',
        description: 'Ish kuni yakunida "Smenani yopish" tugmasi bosiladi, real kassa sanaladi va Z-hisobot termoprinterda chop etiladi.',
        tip: 'Tizim kassa farqini (kamomad yoki ortiqcha pul) avtomatik aniqlaydi.'
      }
    ],
    faq: [
      {
        q: 'Smena yopilmasa nima bo‘ladi?',
        a: 'Kassa to‘g‘ri hisoblanishi uchun har bir ish kuni yakunida smenani yopish qat\'iy tavsiya etiladi.'
      }
    ]
  },

  // 8. RESTORAN VA KAFE
  {
    id: 'restaurant',
    title: 'Restoran, Kafe va Fast-food (Stollar & KDS)',
    shortDesc: 'Interaktiv stollar xaritasi, ofitsiant ekrani, taomlar menyusi, pre-chek va oshxona ekrani (KDS).',
    badge: 'Restoran',
    icon: 'UtensilsCrossed',
    route: '/restaurant/tables',
    color: 'rose',
    roles: ['Owner', 'Admin', 'Ofitsiant', 'Oshpaz'],
    steps: [
      {
        title: '1. Stolni tanlash va buyurtma ochish',
        description: 'Stollar xaritasidan bo‘sh stolni bosing, mehmonlar sonini kiriting va taomlarni qo‘shing.',
        tip: 'Yashil rang — bo‘sh stol, qizil rang — band stol, ko‘k rang — hisob kutilmoqda.'
      },
      {
        title: '2. Oshxonaga (KDS) yuborish',
        description: '"Oshxonaga yuborish" tugmasini bosishingiz bilan taomlar oshpazning KDS ekranida real vaqtda paydo bo‘ladi.',
      },
      {
        title: '3. Hisob-kitob va stolni yopish',
        description: 'Mijoz hisobni so‘raganda "Pre-chek" chiqarish, so‘ngra to‘lovni qabul qilib stolni bo‘shatish.',
      }
    ],
    faq: [
      {
        q: 'KDS ekrani qanday ishlaydi?',
        a: 'Oshpazlar /restaurant/kds sahifasidan kelgan taomlarni "Tayyorlanmoqda" va "Tayyor" holatiga o‘tkazishadi, bu ofitsiantga darhol ko‘rinadi.'
      }
    ]
  },

  // 9. XIZMATLAR VA BANDLOVLAR (SALON / SERVICE)
  {
    id: 'appointments',
    title: 'Xizmatlar va Bandlovlar (Salon / Service)',
    shortDesc: 'Go‘zallik salonlari, sartaroshxona va xizmat ko‘rsatish sohalari uchun ustalar navbati va taqvim.',
    badge: 'Xizmatlar',
    icon: 'Calendar',
    route: '/appointments',
    color: 'purple',
    roles: ['Owner', 'Admin', 'Usta / Admin'],
    steps: [
      {
        title: '1. Xizmatlar narxnomasi',
        description: '"Xizmatlar" bo‘limida har bir xizmat nomi, davomiyligi (minut) va narxini kiritasiz.',
      },
      {
        title: '2. Vaqt jadvalida bron qilish (Timeline Grid)',
        description: 'Taqvim orqali bo‘sh vaqt katakchasini bosing, mijoz va kerakli ustani tanlang.',
        tip: 'Ustalar jadvali vaqtlarning to‘qnash kelishidan saqlaydi.'
      },
      {
        title: '3. Xizmatni yakunlash va to‘lov',
        description: 'Mijoz kelgach, bandlovni "Bajarildi" holatiga o‘tkazing va kassa orqali chek uring.',
      }
    ],
    faq: [
      {
        q: 'Bir nechta xodimga alohida grafik qilsa bo‘ladimi?',
        a: 'Ha, jadval har bir xodim ustuni bo‘yicha alohida ko‘rsatiladi.'
      }
    ]
  },

  // 10. BOSHQARUV PANELI VA ANALITIKA
  {
    id: 'dashboard',
    title: 'Boshqaruv Paneli va Biznes Analitika',
    shortDesc: 'Kunlik savdo, eng ko‘p sotilgan tovarlar, mijozlar oqimi va biznes ko‘rsatkichlari grafigi.',
    badge: 'Dashboard',
    icon: 'LayoutDashboard',
    route: '/dashboard',
    color: 'indigo',
    roles: ['Owner', 'Admin'],
    steps: [
      {
        title: '1. Asosiy KPI ko‘rsatkichlari',
        description: 'Kunlik va oylik tushum, cheklar soni, o‘rtacha chek summasi va foyda dinamikasini kuzating.',
      },
      {
        title: '2. Top tovarlar va Toifalar tahlili',
        description: 'Qaysi tovar eng ko‘p daromad keltirayotganini aniqlang va zaxirasini oldindan to‘ldiring.',
      },
      {
        title: '3. Savdo soatlari grafigi',
        description: 'Mijozlar oqimi kunning qaysi soatlarida eng yuqori bo‘lishini ko‘rib, xodimlar ish grafigini optimallashtiring.',
      }
    ],
    faq: [
      {
        q: 'Ma\'lumotlar qanchalik tez yangilanadi?',
        a: 'Kassada har bir chek urilishi bilan boshqaruv panelidagi statistika real vaqtda (1 soniyada) yangilanadi.'
      }
    ]
  },

  // 11. TELEGRAM BOT VA AVTO-XABARLAR
  {
    id: 'telegram',
    title: 'Telegram Bot va Avtomatik Xabarnomalar',
    shortDesc: 'Do‘kon egasi uchun Telegram orqali har bir savdo xabarnomasi, kunlik KPI va ombor tanqisligi.',
    badge: 'Telegram Bot',
    icon: 'Bot',
    route: '/settings?tab=telegram',
    color: 'sky',
    roles: ['Owner', 'Admin'],
    steps: [
      {
        title: '1. Telegram botni ulash',
        description: 'Sozlamalar -> Telegram Bot sahifasidan "1-klikda ulash" tugmasini bosing va @Boshqar_uzbot da Start bosing.',
      },
      {
        title: '2. Xabarnomalarni sozlash',
        description: 'Har bir chek uchun xabarnoma, kunlik hisobot vaqti va kam qolgan tovarlar ogohlantirishini yoqing.',
      },
      {
        title: '3. Bot orqali tezkor buyruqlar',
        description: 'Telegram botda /savdo, /hisobot, /ombor va /qarz buyruqlari orqali istalgan joydan biznesingizni kuzatib boring.',
      }
    ],
    faq: [
      {
        q: 'Bir nechta Telegram akkaunt ulash mumkinmi?',
        a: 'Ha, xo‘jayin va direktor uchun bir nechta Telegram akkauntlarini biriktirish mumkin.'
      }
    ]
  },

  // 12. SOZLAMALAR VA XAVFSIZLIK
  {
    id: 'settings',
    title: 'Sozlamalar, Xodimlar (RBAC) va Audit',
    shortDesc: 'Kassirlar va xodimlar qo‘shish, chek rekvizitlari, audit tarixi, xavfsizlik va mavzular.',
    badge: 'Tizim',
    icon: 'Settings',
    route: '/settings',
    color: 'slate',
    roles: ['Owner', 'Admin'],
    steps: [
      {
        title: '1. Xodimlarni qo‘shish va huquqlar (RBAC)',
        description: '"Sozlamalar" -> "Xodimlar" tabida yangi xodim telefon raqami va lavozimini (Kassir, Sotuvchi, Omborchi, Menejer) belgilang.',
        tip: 'Har bir rol faqat o‘ziga tegishli bo‘limlarni ko‘ra oladi.'
      },
      {
        title: '2. Chek dizayni va Rekvizitlar',
        description: 'Chekda chiqadigan do‘kon nomi, telefon raqami, manzil, tabrik so‘zlari va QR-kodni sozlang.',
      },
      {
        title: '3. Audit Jurnali',
        description: 'Kim qachon tizimga kirdi, qaysi mahsulot narxi yoki qoldig‘i o‘zgartirildi — barchasini sekundigacha kuzatib boring.',
      }
    ],
    faq: [
      {
        q: 'Kassir qanday kiradi?',
        a: 'Kassir o‘z telefon raqami va berilgan parol orqali kirganda, unga faqat Kassa va unga ruxsat berilgan oynalar ochiladi.'
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
    keywords: ['mahsulot', 'tovar', 'tovarlar', 'mahsulotlar', 'qo\'shish', 'yangi tovar', 'qo‘shish', 'kiritish', 'narx', 'narxi', 'shtrix', 'shtrix-kod', 'kategoriya', 'tannarx', 'sotish narxi', 'rasm yuklash', 'toifa'],
    answer: `**Yangi mahsulot qo‘shish va tahrirlash tartibi:**

1. Yon menyudan **Mahsulotlar** bo‘limiga o‘ting.
2. Yuqori o‘ng burchakdagi **"+ Yangi mahsulot"** tugmasini bosing.
3. **Nomi:** Tovar nomini aniq kiriting (masalan: *Coca Cola 1.5L* yoki *Lavash Mini*).
4. **Kategoriya va Birlik:** Tegishli toifani va o‘lchov birligini (*dona, kg, litr, metr, pachka*) tanlang.
5. **Narxlar:** **Tannarx** (siz sotib olgan xarajat narxi) va **Sotish narxi**ni kiriting. Tizim avtomatik sizning daromad foizingiz (marja)ni ko‘rsatadi.
6. **Shtrix-kod:** Tovar ustidagi shtrix-kodni skaner qiling yoki **"Generatsiya"** tugmasini bosing.
7. **Minimal zaxira:** Qoldiq me'yorini belgilang (masalan *5 ta*). Tovar kam qolganda tizim ogohlantiradi.
8. **"Saqlash"** tugmasini bosing. Tovar darhol Kassa (POS) va Omborxona ro‘yxatiga tushadi!`,
    actionRoute: '/products',
    actionText: 'Mahsulotlar bo‘limiga o‘tish'
  },

  // 1.1 EXCEL IMPORT VA EKSPORT
  {
    keywords: ['excel', 'import', 'eksport', 'export', 'ommoviy', 'baza yuklash', 'fayl orqali', 'shablon', 'excel tovar'],
    answer: `**Excel orqali tovarlarni ommaviy yuklash va yuklab olish:**

1. **Mahsulotlar** sahifasidagi **"Excel Import"** tugmasini bosing.
2. **Shablonni yuklab olish:** Namuna Excel faylini yuklab oling va unga tovarlar nomi, shtrix-kodi, narxi va qoldiqlarini kiriting.
3. **Faylni yuklash:** To‘ldirilgan faylni yuklang va tizim avtomatik barcha tovarlarni bazaga kiritadi.
4. **Eksport:** Istalgan vaqtda **"Excel Eksport"** orqali barcha mahsulotlar jadvalini kompyuteringizga yuklab olishingiz mumkin.`,
    actionRoute: '/products',
    actionText: 'Mahsulotlar bo‘limiga o‘tish'
  },

  // 2. KASSA VA POS SOTUV
  {
    keywords: ['kassa', 'pos', 'sotish', 'savat', 'sotuv', 'chek', 'kassir', 'to\'lov', 'skaner', 'tezkor sotuv', 'savdo qilish', 'chek urish', 'sotish tartibi'],
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

  // 2.1 QAYTIM VA CHEGIRMALAR
  {
    keywords: ['qaytim', 'sdacha', 'chegirma', 'skidka', 'discount', 'foiz', 'bonus', 'aralash to\'lov', 'bo\'lib to\'lash'],
    answer: `**Qaytim (Sdacha) va Chegirmalar bilan ishlash:**

• **Qaytim:** To‘lov oynasida mijoz uzatgan naqd pulni kiritishingiz bilan tizim qaytarilishi kerak bo‘lgan summani katta va qulay ko‘rinishda hisoblab beradi.
• **Tovarga chegirma:** Savatdagi istalgan tovar ustiga bosib, aynan shu mahsulotga foizli yoki so‘mdagi chegirma belgilash mumkin.
• **Chekka umumiy chegirma:** "Chegirma" (F4) tugmasi orqali butun savdo uchun umumiy chegirma beriladi.
• **Aralash to‘lov:** Bir vaqtning o‘zida bir qismini naqd, qolgan qismini karta orqali to‘lash imkoniyati mavjud.`,
    actionRoute: '/pos',
    actionText: 'Kassada sinab ko‘rish'
  },

  // 2.2 CHEKNI BEKOR QILISH VA REFUND
  {
    keywords: ['qaytarish', 'refund', 'chek bekor qilish', 'vozvrat', 'pulni qaytarish', 'xato chek'],
    answer: `**Chekni bekor qilish va Tovarni qaytarib olish (Refund):**

1. Kassa oynasidagi **"Sotuvlar tarixi"** yoki Moliya bo‘limiga o‘ting.
2. Xaridor qaytarmoqchi bo‘lgan chekni toping.
3. **"Qaytarish (Refund)"** tugmasini bosing:
   - Qaytarilayotgan tovar miqdorini belgilang;
   - Tovar zaxirasi avtomatik omborga qayta qo‘shiladi;
   - Kassa tushumidan pul kamaytiriladi va qaytarish cheki chiqariladi.`,
    actionRoute: '/pos',
    actionText: 'Kassa tarixiga o‘tish'
  },

  // 2.3 NAVBATGA QO‘YISH (HOLD ORDER)
  {
    keywords: ['navbat', 'hold order', 'kutilayotgan', 'to\'xtatib turish', 'f10', 'savatni saqlash'],
    answer: `**Savatni navbatga qo‘yish (Hold Order):**

1. Agar mijoz qo‘shimcha tovar olishga ketsa yoki to‘lovga tayyor bo‘lmasa, **F10** yoki **"Navbatga qo‘yish"** tugmasini bosing.
2. Savat xavfsiz saqlanadi va kassa yangi mijoz uchun bo‘shaydi.
3. Mijoz qaytib kelgach, **"Kutilayotgan savdolar"** tugmasini bosib, savatni 1-klikda qayta tiklaysiz!`,
    actionRoute: '/pos',
    actionText: 'Kassada sinab ko‘rish'
  },

  // 3. SMENALAR VA Z-HISOBOT
  {
    keywords: ['smena', 'smena ochish', 'smena yopish', 'z hisobot', 'x hisobot', 'kassir smenasi', 'kassa qoldig\'i', 'smena hisoboti', 'kamomad', 'ortiqcha'],
    answer: `**Kassa Smenasini ochish va yopish tartibi:**

1. **Smena ochish:**
   - Ish kunini boshlashda kassir dasturga kirgach, **"Smena ochish"** oynasi chiqadi.
   - Kassa qutisidagi boshlang‘ich naqd pul qoldig‘ini kiriting va **"Smenani ochish"**ni bosing.
2. **Kun davomida savdo:**
   - Barcha naqd, karta va nasiya to‘lovlari ushbu smenaga biriktirilib boradi.
3. **Smenani yopish (Z-hisobot):**
   - Ish kuni yakunida yuqoridagi **"Smenani yopish"** tugmasini bosing.
   - Real sanalgan naqd pulni kiriting. Tizim farqni (kamomad yoki ortiqcha pul) aniqlab, Z-hisobotni chop etadi.`,
    actionRoute: '/finance?tab=shifts',
    actionText: 'Smenalar jurnaliga o‘tish'
  },

  // 4. NASIYA VA MIJOZLAR (CRM)
  {
    keywords: ['nasiya', 'qarz', 'mijoz', 'crm', 'qarz daftar', 'to‘lov qabul', 'so\'ndirish', 'qarz berish', 'qarz yopish', 'nasiya limiti', 'mijozlar', 'xaridor'],
    answer: `**Nasiya daftari va Qarzdorlik bilan ishlash:**

1. **Nasiyaga tovar sotish:**
   - Kassada tovarlar tanlangach, **"Mijoz tanlash"** orqali xaridorni belgilang.
   - To‘lov oynasida **"Nasiya"** turini tanlab, chekni tasdiqlang.
2. **Qarzni qabul qilish (Qarzni yopish):**
   - **Mijozlar (CRM)** sahifasiga o‘ting.
   - Kerakli mijozni topib, uning kartasidagi **"Qarz to‘lovi"** tugmasini bosing.
   - To‘langan summani (Naqd / Karta) kiriting va tasdiqlang.
   - Mijoz balansi bir zumda yangilanadi va bu to‘lov Moliya jurnali va auditga kiritiladi!
3. **Qarz limiti:** Sozlamalarda maksimal qarz limitini belgilab qo‘yishingiz mumkin.`,
    actionRoute: '/customers',
    actionText: 'Mijozlar (CRM) bo‘limiga o‘tish'
  },

  // 5. OMBORXONA VA INVENTARIZATSIYA
  {
    keywords: ['ombor', 'omborxona', 'qoldiq', 'inventarizatsiya', 'kam qolgan', 'zaxira', 'sanash', 'kirim', 'chiqim', 'qoldiq to\'g\'rilash', 'spisaniya', 'brak'],
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
    keywords: ['ta\'minotchi', 'yetkazib beruvchi', 'postavshik', 'supplier', 'ta\'minotchiga to\'lov', 'xarid', 'akt sverka', 'xaridlar'],
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
    keywords: ['moliya', 'foyda', 'xarajat', 'tushum', 'kassa hisobot', 'sof foyda', 'daromad', 'rasxod', 'ijara', 'oylik', 'statistika', 'grafik', 'p&l'],
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
    keywords: ['restoran', 'stol', 'kds', 'oshxona', 'ofitsiant', 'taom', 'kafe', 'prechek', 'stol ochish', 'stol yopish', 'buyurtma', 'fast food'],
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
    keywords: ['salon', 'usta', 'xizmat', 'bandlov', 'navbat', 'vaqt', 'sartaroshxona', 'bron', 'appointment', 'jadval', 'xizmatlar'],
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
    keywords: ['printer', 'termoprinter', 'chek printer', '58mm', '80mm', 'skaner', 'shtrix kod', 'tarozi', 'chop etish', 'drayver', 'printer ishlamayapti'],
    answer: `**Chek Printer va Shtrix-kod Skaner ulash:**

1. **Termoprinter (58mm / 80mm):**
   - USB, Bluetooth yoki Wi-Fi orqali printerni kompyuter/planshetga ulang.
   - Kassa oynasidagi **Sozlamalar** tugmasi orqali chek enini (58mm yoki 80mm) tanlang.
   - Savdo yakunlanishi bilan chek avtomatik shrift o‘lchamiga moslab chop etiladi.
2. **Shtrix-kod skaner:**
   - USB / Wireless skanerni ulang. Tizim avtomatik *Keyboard Wedge* rejimida ishlaydi — alohida drayver kerak emas.
3. **Printer chop etmasa nima qilish kerak?**
   - Printer qog‘ozi to‘g‘ri qo‘yilganini va USB kabeli ulanganini tekshiring, brauzerda chek oynasidagi "Avtomatik chop etish"ni faollashtiring.`,
    actionRoute: '/pos',
    actionText: 'Kassa oynasini ochish'
  },

  // 11. XODIMLAR VA RUXSATLAR (RBAC)
  {
    keywords: ['xodim', 'rol', 'ruxsat', 'rbac', 'parol', 'kassir qo\'shish', 'admin', 'sozlama', 'huquq', 'menejer', 'xodimlar'],
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
    keywords: ['telegram', 'bot', 'telegram bot', 'bildirishnoma', 'sms', 'hisobot bot', 'kunlik hisobot bot', 'boshqar bot'],
    answer: `**Telegram Bot orqali Hisobot va Xabarnomalar olish:**

1. **Boshqar.uz Telegram Boti** do‘kon egasiga real vaqtda quyidagi imkoniyatlarni beradi:
   - Kunlik umumiy savdo va tushum hisoboti.
   - Omborda qaysi mahsulotlar tugab qolgani haqida tezkor ogohlantirish.
   - Kassa smenasi yopilganda Z-hisobot xabarnomasi.
2. **Ulash tartibi:** **Sozlamalar -> Telegram Bot** bo‘limidan o‘zingizning Telegram akkauntingizni tizimga biriktiring va botni faollashtiring.`,
    actionRoute: '/settings?tab=telegram',
    actionText: 'Sozlamalar bo‘limiga o‘tish'
  },

  // 13. AUDIT JURNALI VA XAVFSIZLIK
  {
    keywords: ['audit', 'tarix', 'kim o\'chirdi', 'xavfsizlik', 'kim kirdi', 'o\'zgarishlar', 'log', 'parol o\'zgartirish'],
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
    keywords: ['hotkey', 'klaviatura', 'tezkor tugma', 'tugmalar', 'f1', 'f2', 'f3', 'f4', 'f9', 'f10', 'space', 'esc'],
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

  // 15. OBUNA VA TARIFLAR
  {
    keywords: ['obuna', 'tarif', 'narx', 'to\'lov qilish', 'click', 'payme', 'uzum', 'bepul', 'tariflar', 'billing', 'necha pul'],
    answer: `**Boshqar.uz Tariflari va Obuna to‘lovlari:**

1. **14 kunlik bepul sinov:** Yangi ochilgan har bir hisob uchun barcha imkoniyatlar 14 kun davomida mutlaqo bepul taqdim etiladi.
2. **Tariflar:**
   - **Start (Chakana do‘kon):** Bitta filial, kassa, ombor va asosiy hisobotlar.
   - **Biznes (Kengaytirilgan):** Cheksiz tovarlar, nasiya CRM, Telegram bot va audit.
   - **Premium (Tarmoq / Restoran):** Ko‘p filiallar, stollar xaritasi, KDS va VIP qo‘llab-quvvatlash.
3. **To‘lov usullari:** Click, Payme yoki bank o‘tkazmasi orqali 1-klikda to‘lov amalga oshiriladi.`,
    actionRoute: '/billing',
    actionText: 'Tariflar va Obunani ko‘rish'
  },

  // 16. OFFLINE REJIM VA INTERNET
  {
    keywords: ['offline', 'internet', 'aloqa yo\'q', 'oflayn', 'sinxronizatsiya', 'internet uzilsa'],
    answer: `**Offline (Internetsiz) ishlash imkoniyati:**

• Agar do‘konda internet uzilib qolsa, Kassa (POS) to‘xtab qolmaydi!
• Kassir savdo qilish, chek chiqarish va to‘lovlarni qabul qilishda davom eta oladi.
• Barcha ma'lumotlar lokal xotirada saqlanadi va internet paydo bo‘lishi bilan avtomatik serverga yuklanadi.`,
    actionRoute: '/pos',
    actionText: 'Kassani ochish'
  }
];
