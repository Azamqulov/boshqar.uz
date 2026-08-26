import { ref, computed, watch, onMounted } from 'vue';

export type LanguageCode = 'uz_latn' | 'uz_cyrl' | 'ru' | 'en';

const STORAGE_KEY = 'ubms_language_code';

// Default: uz_latn (O'zbekcha Lotin)
const getInitialLanguage = (): LanguageCode => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'uz_cyrl' || saved === 'ru' || saved === 'en' || saved === 'uz_latn') {
      return saved as LanguageCode;
    }
  }
  return 'uz_latn';
};

const currentLanguage = ref<LanguageCode>(getInitialLanguage());

/**
 * Uzbek Latin to Cyrillic Transliteration Engine
 */
export const latinToCyrillic = (text: string): string => {
  if (!text) return '';
  let res = text;
  
  // Double letter rules
  res = res.replace(/Sh/g, 'Ш').replace(/sh/g, 'ш');
  res = res.replace(/Ch/g, 'Ч').replace(/ch/g, 'ч');
  res = res.replace(/Yo/g, 'Ё').replace(/yo/g, 'ё');
  res = res.replace(/Yu/g, 'Ю').replace(/yu/g, 'ю');
  res = res.replace(/Ya/g, 'Я').replace(/ya/g, 'я');
  res = res.replace(/Ye/g, 'Е').replace(/ye/g, 'е');
  res = res.replace(/O['`ʻ’]/g, 'Ў').replace(/o['`ʻ’]/g, 'ў');
  res = res.replace(/G['`ʻ’]/g, 'Ғ').replace(/g['`ʻ’]/g, 'ғ');

  const map: Record<string, string> = {
    A: 'А', a: 'а', B: 'Б', b: 'б', V: 'В', v: 'в', G: 'Г', g: 'г', D: 'Д', d: 'д',
    E: 'Э', e: 'э', J: 'Ж', j: 'ж', Z: 'З', z: 'з', I: 'И', i: 'и', Y: 'Й', y: 'й',
    K: 'К', k: 'к', L: 'Л', l: 'л', M: 'М', m: 'м', N: 'Н', n: 'н', O: 'О', o: 'о',
    P: 'П', p: 'п', R: 'Р', r: 'р', S: 'С', s: 'с', T: 'Т', t: 'т', U: 'У', u: 'у',
    F: 'Ф', f: 'ф', X: 'Х', x: 'х', Q: 'Қ', q: 'қ', H: 'Ҳ', h: 'ҳ',
  };

  return res.split('').map(char => map[char] || char).join('');
};

// Global Translation Replacer Terms (Uzbek -> Russian / English)
const wordMapRU: Record<string, string> = {
  "Boshqaruv": "Панель",
  "Dashboard": "Дашборд",
  "Mahsulotlar": "Товары",
  "Kassa": "Касса (POS)",
  "Tezkor Sotuv": "Быстрая продажа",
  "Mijozlar": "Клиенты",
  "Taminotchilar": "Поставщики",
  "Ombor": "Склад",
  "Moliya": "Финансы",
  "Tahlil": "Аналитика",
  "Sozlamalar": "Настройки",
  "Xodimlar": "Сотрудники",
  "Kategoriyalar": "Категории",
  "Buyurtmalar": "Заказы",
  "To'lov": "Оплата",
  "Naqd": "Наличные",
  "Karta": "Карта",
  "Chek": "Чек",
  "Chiqish": "Выход",
  "Saqlash": "Сохранить",
  "Bekor qilish": "Отмена",
  "Izlash": "Поиск",
  "Tozalash": "Очистить",
  "Tahrirlash": "Изменить",
  "O'chirish": "Удалить",
  "Yangi": "Новый",
  "Faol": "Активный",
  "Nofaol": "Неактивный",
  "Xavfsizlik": "Безопасность",
  "Parol": "Пароль",
  "Biznes": "Бизнес",
  "Valyuta": "Валюта",
  "Telefon": "Телефон",
  "Ism": "Имя",
};

const wordMapEN: Record<string, string> = {
  "Boshqaruv": "Dashboard",
  "Dashboard": "Dashboard",
  "Mahsulotlar": "Products",
  "Kassa": "POS Checkout",
  "Tezkor Sotuv": "Quick Sale",
  "Mijozlar": "Customers",
  "Taminotchilar": "Suppliers",
  "Ombor": "Inventory",
  "Moliya": "Finance",
  "Tahlil": "Analytics",
  "Sozlamalar": "Settings",
  "Xodimlar": "Employees",
  "Kategoriyalar": "Categories",
  "Buyurtmalar": "Orders",
  "To'lov": "Payment",
  "Naqd": "Cash",
  "Karta": "Card",
  "Chek": "Receipt",
  "Chiqish": "Logout",
  "Saqlash": "Save",
  "Bekor qilish": "Cancel",
  "Izlash": "Search",
  "Tozalash": "Clear",
  "Tahrirlash": "Edit",
  "O'chirish": "Delete",
  "Yangi": "New",
  "Faol": "Active",
  "Nofaol": "Inactive",
  "Xavfsizlik": "Security",
  "Parol": "Password",
  "Biznes": "Business",
  "Valyuta": "Currency",
  "Telefon": "Phone",
  "Ism": "Name",
};

// Keyed i18n Dictionary
const translations: Record<string, Record<LanguageCode, string>> = {
  // Sidebar Navigation Keys
  'sidebar.group_ombor': {
    uz_latn: 'OMBOR',
    uz_cyrl: 'ОМБОР',
    ru: 'СКЛАД',
    en: 'INVENTORY',
  },
  'sidebar.group_restaurant': {
    uz_latn: 'RESTORAN',
    uz_cyrl: 'РЕСТОРАН',
    ru: 'РЕСТОРАН',
    en: 'RESTAURANT',
  },
  'sidebar.group_service': {
    uz_latn: 'XIZMATLAR',
    uz_cyrl: 'ХИЗМАТЛАР',
    ru: 'УСЛУГИ',
    en: 'SERVICES',
  },
  'sidebar.group_crm': {
    uz_latn: 'MIJOZLAR',
    uz_cyrl: 'МИЖОЗЛАР',
    ru: 'КЛИЕНТЫ',
    en: 'CUSTOMERS',
  },
  'sidebar.group_hisob': {
    uz_latn: 'HISOB',
    uz_cyrl: 'ҲИСОБ',
    ru: 'УЧЕТ И ФИНАНСЫ',
    en: 'ACCOUNTING',
  },
  'sidebar.group_sozlamalar': {
    uz_latn: 'SOZLAMALAR',
    uz_cyrl: 'СОЗЛАМАЛАР',
    ru: 'НАСТРОЙКИ',
    en: 'SETTINGS',
  },

  'sidebar.dashboard': {
    uz_latn: 'Boshqaruv Paneli',
    uz_cyrl: 'Бошқарув Панели',
    ru: 'Панель управления',
    en: 'Dashboard',
  },
  'sidebar.pos': {
    uz_latn: 'Kassa (POS)',
    uz_cyrl: 'Касса (POS)',
    ru: 'Кассовый модуль',
    en: 'POS Checkout',
  },
  'sidebar.products': {
    uz_latn: 'Mahsulotlar',
    uz_cyrl: 'Маҳсулотлар',
    ru: 'Товары',
    en: 'Products',
  },
  'sidebar.categories': {
    uz_latn: 'Kategoriyalar',
    uz_cyrl: 'Категориялар',
    ru: 'Категории',
    en: 'Categories',
  },
  'sidebar.inventory': {
    uz_latn: 'Omborxona',
    uz_cyrl: 'Омборхона',
    ru: 'Складской учет',
    en: 'Inventory',
  },
  'sidebar.suppliers': {
    uz_latn: 'Ta\'minotchilar',
    uz_cyrl: 'Таъминотчилар',
    ru: 'Поставщики',
    en: 'Suppliers',
  },
  'sidebar.tables': {
    uz_latn: 'Stollar xaritasi',
    uz_cyrl: 'Столлар харитаси',
    ru: 'Карта столов',
    en: 'Tables Map',
  },
  'sidebar.kds': {
    uz_latn: 'Oshxona (KDS)',
    uz_cyrl: 'Ошхона (KDS)',
    ru: 'Кухня (KDS)',
    en: 'Kitchen (KDS)',
  },
  'sidebar.appointments': {
    uz_latn: 'Bandlovlar',
    uz_cyrl: 'Бандловлар',
    ru: 'Записи и Брони',
    en: 'Appointments',
  },
  'sidebar.services': {
    uz_latn: 'Xizmatlar',
    uz_cyrl: 'Хизматлар',
    ru: 'Услуги',
    en: 'Services',
  },
  'sidebar.customers': {
    uz_latn: 'Mijozlar (CRM)',
    uz_cyrl: 'Мижозлар (CRM)',
    ru: 'Клиенты (CRM)',
    en: 'Customers (CRM)',
  },
  'sidebar.finance': {
    uz_latn: 'Moliya & Hisobot',
    uz_cyrl: 'Молия & Ҳисобот',
    ru: 'Финансы и Отчеты',
    en: 'Finance & Reports',
  },
  'sidebar.billing': {
    uz_latn: 'Obuna & Tariflar',
    uz_cyrl: 'Обуна & Тарифлар',
    ru: 'Тарифы и Подписка',
    en: 'Pricing & Billing',
  },
  'sidebar.guide': {
    uz_latn: 'Qo\'llanma & AI',
    uz_cyrl: 'Қўлланма & AI',
    ru: 'Инструкции и ИИ',
    en: 'Guides & AI',
  },
  'sidebar.settings': {
    uz_latn: 'Sozlamalar',
    uz_cyrl: 'Созламалар',
    ru: 'Настройки',
    en: 'Settings',
  },
  'sidebar.superadmin': {
    uz_latn: 'SuperAdmin',
    uz_cyrl: 'SuperAdmin',
    ru: 'СуперАдмин',
    en: 'SuperAdmin',
  },

  // Lock Screen
  lock_title: {
    uz_latn: 'Boshqar.uz Quick Lock Protection System',
    uz_cyrl: 'Boshqar.uz Tezkor Qulflash Tizimi',
    ru: 'Система быстрой блокировки Boshqar.uz',
    en: 'Boshqar.uz Quick Lock Protection System',
  },

  lock_hint: {
    uz_latn: 'Ochish uchun bosing yoki ENTER bosing',
    uz_cyrl: 'Очиш учун босинг ёки ENTER босинг',
    ru: 'Нажмите или ENTER чтобы открыть',
    en: 'Click or press ENTER to unlock',
  },
  enter_pin: {
    uz_latn: 'PIN Kodni kiriting',
    uz_cyrl: 'PIN Кодни киритинг',
    ru: 'Введите PIN код',
    en: 'Enter PIN Code',
  },
  unlock: {
    uz_latn: 'Ochish',
    uz_cyrl: 'Очиш',
    ru: 'Открыть',
    en: 'Unlock',
  },
  clear: {
    uz_latn: "O'chirish",
    uz_cyrl: 'Ўчириш',
    ru: 'Стереть',
    en: 'Clear',
  },
  back: {
    uz_latn: 'Orqaga',
    uz_cyrl: 'Орқага',
    ru: 'Назад',
    en: 'Back',
  },
  invalid_pin: {
    uz_latn: "PIN-kod noto'g'ri!",
    uz_cyrl: 'PIN-код нотўғри!',
    ru: 'Неверный PIN-код!',
    en: 'Incorrect PIN code!',
  },
  unlocking: {
    uz_latn: 'Ochilmoqda...',
    uz_cyrl: 'Очилмоқда...',
    ru: 'Открытие...',
    en: 'Unlocking...',
  },
  auto_unlock_hint: {
    uz_latn: 'PIN kiritilgach avtomatik ochiladi',
    uz_cyrl: 'PIN киритилгач автоматик очилади',
    ru: 'Авто-открытие при вводе PIN',
    en: 'Auto-unlocks on valid PIN',
  },

  // Settings
  quick_lock_pin: {
    uz_latn: 'Tezkor Qulflash PIN Kobi (Quick Lock)',
    uz_cyrl: 'Тезкор Қулфлаш PIN Коди (Quick Lock)',
    ru: 'ПИН-код быстрой блокировки (Quick Lock)',
    en: 'Quick Lock PIN Code',
  },
  auto_lock_timer: {
    uz_latn: 'Avto-qulflash Taymeri',
    uz_cyrl: 'Авто-қулфлаш Таймери',
    ru: 'Таймер автоблокировки',
    en: 'Auto-lock Timer',
  },
  auto_lock_off: {
    uz_latn: "O'chirilgan (Faqat Ctrl+L / Tugma)",
    uz_cyrl: 'Ўчирилган (Фақат Ctrl+L / Тугма)',
    ru: 'Отключено (Только Ctrl+L / Кнопка)',
    en: 'Disabled (Only Ctrl+L / Button)',
  },
  min_5: {
    uz_latn: "5 daqiqa harakatsizlikdan so'ng",
    uz_cyrl: '5 дақиқа ҳаракатсизликдан сўнг',
    ru: 'Через 5 минут бездействия',
    en: 'After 5 minutes of inactivity',
  },
  min_10: {
    uz_latn: "10 daqiqa harakatsizlikdan so'ng",
    uz_cyrl: '10 дақиқа ҳаракатсизликдан сўнг',
    ru: 'Через 10 минут бездействия',
    en: 'After 10 minutes of inactivity',
  },
  min_15: {
    uz_latn: "15 daqiqa harakatsizlikdan so'ng",
    uz_cyrl: '15 дақиқа ҳаракатсизликдан сўнг',
    ru: 'Через 15 минут бездействия',
    en: 'After 15 minutes of inactivity',
  },
  min_30: {
    uz_latn: "30 daqiqa harakatsizlikdan so'ng",
    uz_cyrl: '30 дақиқа ҳаракатсизликдан сўнг',
    ru: 'Через 30 минут бездействия',
    en: 'After 30 minutes of inactivity',
  },
};

/**
 * Global DOM Translation & Transliteration Processor
 */
export const processDOMTranslation = () => {
  if (typeof document === 'undefined') return;

  const lang = currentLanguage.value;
  document.documentElement.setAttribute('lang', lang);

  // Helper to translate single text node
  const translateText = (text: string): string => {
    if (!text || text.trim().length === 0) return text;

    if (lang === 'uz_cyrl') {
      return latinToCyrillic(text);
    }

    if (lang === 'ru') {
      let res = text;
      Object.entries(wordMapRU).forEach(([latin, ru]) => {
        const regex = new RegExp(`\\b${latin}\\b`, 'gi');
        res = res.replace(regex, ru);
      });
      return res;
    }

    if (lang === 'en') {
      let res = text;
      Object.entries(wordMapEN).forEach(([latin, en]) => {
        const regex = new RegExp(`\\b${latin}\\b`, 'gi');
        res = res.replace(regex, en);
      });
      return res;
    }

    return text;
  };

  // Traverses element child nodes safely
  const walkNodes = (element: Node) => {
    if (element.nodeType === Node.TEXT_NODE && element.nodeValue) {
      const parent = element.parentElement;
      if (
        parent &&
        !parent.closest('script, style, [data-no-transliterate], code, pre, input, textarea')
      ) {
        if (!parent.hasAttribute('data-original-text')) {
          parent.setAttribute('data-original-text', element.nodeValue);
        }

        const orig = parent.getAttribute('data-original-text') || element.nodeValue;
        element.nodeValue = translateText(orig);
      }
    } else {
      element.childNodes.forEach((child) => walkNodes(child));
    }
  };

  walkNodes(document.body || document.documentElement);
};

export const setLanguage = (lang: LanguageCode) => {
  currentLanguage.value = lang;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, lang);
  }
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('lang', lang);
  }
  processDOMTranslation();
};

export const t = (key: string, fallback = ''): string => {
  const dict = translations[key];
  if (dict && dict[currentLanguage.value]) {
    return dict[currentLanguage.value];
  }
  if (currentLanguage.value === 'uz_cyrl' && fallback) {
    return latinToCyrillic(fallback);
  }
  return fallback || key;
};

// Global MutationObserver to handle dynamic Vue route & DOM changes
let domObserver: MutationObserver | null = null;

export const startDOMObserver = () => {
  if (typeof document === 'undefined') return;
  
  processDOMTranslation();

  if (!domObserver) {
    domObserver = new MutationObserver(() => {
      processDOMTranslation();
    });

    domObserver.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: false,
    });
  }
};

export function useLanguage() {
  onMounted(() => {
    startDOMObserver();
  });

  watch(currentLanguage, () => {
    processDOMTranslation();
  });

  return {
    currentLanguage,
    setLanguage,
    t,
    latinToCyrillic,

    // Backward compatibility getters
    scriptMode: computed(() => (currentLanguage.value === 'uz_cyrl' ? 'cyrillic' : 'latin')),
    setScript: (mode: 'latin' | 'cyrillic') => {
      setLanguage(mode === 'cyrillic' ? 'uz_cyrl' : 'uz_latn');
    },
  };
}
