import { ref } from 'vue';

export type ScriptMode = 'latin' | 'cyrillic';

const STORAGE_KEY = 'ubms_script_mode';

// ─── Global singleton state ────────────────────────────────────────────────
const savedScript = (localStorage.getItem(STORAGE_KEY) as ScriptMode) || 'latin';
const scriptMode = ref<ScriptMode>(savedScript);

// ─── Lotin → Kirill xaritasi ──────────────────────────────────────────────
const L2C: [string, string][] = [
  // 3-harf
  ["SHI", "ШИ"], ["Shi", "Ши"], ["shi", "ши"],
  ["CHI", "ЧИ"], ["Chi", "Чи"], ["chi", "чи"],
  // 2-harf (avval)
  ["SH", "Ш"], ["Sh", "Ш"], ["sh", "ш"],
  ["CH", "Ч"], ["Ch", "Ч"], ["ch", "ч"],
  ["NG", "НГ"], ["Ng", "Нг"], ["ng", "нг"],
  ["YO", "Ё"], ["Yo", "Ё"], ["yo", "ё"],
  ["YU", "Ю"], ["Yu", "Ю"], ["yu", "ю"],
  ["YA", "Я"], ["Ya", "Я"], ["ya", "я"],
  ["O'", "Ў"], ["o'", "ў"], ["O'", "Ў"], ["o'", "ў"],
  ["G'", "Ғ"], ["g'", "ғ"], ["G'", "Ғ"], ["g'", "ғ"],
  // 1-harf
  ["A", "А"], ["a", "а"],
  ["B", "Б"], ["b", "б"],
  ["D", "Д"], ["d", "д"],
  ["E", "Е"], ["e", "е"],
  ["F", "Ф"], ["f", "ф"],
  ["G", "Г"], ["g", "г"],
  ["H", "Ҳ"], ["h", "ҳ"],
  ["I", "И"], ["i", "и"],
  ["J", "Ж"], ["j", "ж"],
  ["K", "К"], ["k", "к"],
  ["L", "Л"], ["l", "л"],
  ["M", "М"], ["m", "м"],
  ["N", "Н"], ["n", "н"],
  ["O", "О"], ["o", "о"],
  ["P", "П"], ["p", "п"],
  ["Q", "Қ"], ["q", "қ"],
  ["R", "Р"], ["r", "р"],
  ["S", "С"], ["s", "с"],
  ["T", "Т"], ["t", "т"],
  ["U", "У"], ["u", "у"],
  ["V", "В"], ["v", "в"],
  ["X", "Х"], ["x", "х"],
  ["Y", "Й"], ["y", "й"],
  ["Z", "З"], ["z", "з"],
];

// ─── Kirill → Lotin xaritasi ──────────────────────────────────────────────
const C2L: [string, string][] = [
  ["Ш", "Sh"], ["ш", "sh"],
  ["Ч", "Ch"], ["ч", "ch"],
  ["Ё", "Yo"], ["ё", "yo"],
  ["Ю", "Yu"], ["ю", "yu"],
  ["Я", "Ya"], ["я", "ya"],
  ["Ж", "J"],  ["ж", "j"],
  ["Ғ", "G'"], ["ғ", "g'"],
  ["Қ", "Q"],  ["қ", "q"],
  ["Ҳ", "H"],  ["ҳ", "h"],
  ["Ў", "O'"], ["ў", "o'"],
  ["А", "A"],  ["а", "a"],
  ["Б", "B"],  ["б", "b"],
  ["В", "V"],  ["в", "v"],
  ["Г", "G"],  ["г", "g"],
  ["Д", "D"],  ["д", "d"],
  ["Е", "E"],  ["е", "e"],
  ["З", "Z"],  ["з", "z"],
  ["И", "I"],  ["и", "i"],
  ["Й", "Y"],  ["й", "y"],
  ["К", "K"],  ["к", "k"],
  ["Л", "L"],  ["л", "l"],
  ["М", "M"],  ["м", "m"],
  ["Н", "N"],  ["н", "n"],
  ["НГ", "ng"], ["Нг", "Ng"],
  ["О", "O"],  ["о", "o"],
  ["П", "P"],  ["п", "p"],
  ["Р", "R"],  ["р", "r"],
  ["С", "S"],  ["с", "s"],
  ["Т", "T"],  ["т", "t"],
  ["У", "U"],  ["у", "u"],
  ["Ф", "F"],  ["ф", "f"],
  ["Х", "X"],  ["х", "x"],
  ["Ц", "Ts"], ["ц", "ts"],
  ["Э", "E"],  ["э", "e"],
];

/**
 * Lotin → Kirill
 */
export const latinToCyrillic = (text: string): string => {
  let result = '';
  let i = 0;
  while (i < text.length) {
    let matched = false;
    for (const [lat, cyr] of L2C) {
      if (text.startsWith(lat, i)) {
        result += cyr;
        i += lat.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      result += text[i];
      i++;
    }
  }
  return result;
};

/**
 * Kirill → Lotin
 */
export const cyrillicToLatin = (text: string): string => {
  let result = '';
  let i = 0;
  while (i < text.length) {
    let matched = false;
    for (const [cyr, lat] of C2L) {
      if (text.startsWith(cyr, i)) {
        result += lat;
        i += cyr.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      result += text[i];
      i++;
    }
  }
  return result;
};

// ─── DOM transliterator ────────────────────────────────────────────────────
// Skip these tags — don't touch their text
const SKIP_TAGS = new Set([
  'SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA', 'CODE', 'PRE',
  'SELECT', 'OPTION', 'SVG', 'MATH',
]);

// Attribute da-orig saqlash kaliti
const ORIG_ATTR = 'data-uz-orig';

/**
 * DOM dagi barcha matn tugunlarini transliteratsiya qiladi.
 * Original matn ORIG_ATTR da saqlanadi (tiklash uchun).
 */
const transliterateDOM = (root: Node = document.body) => {
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
        // Skip elements with data-no-transliterate attribute
        if (parent.closest('[data-no-transliterate]')) return NodeFilter.FILTER_REJECT;
        const text = node.textContent?.trim();
        if (!text) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    }
  );

  const nodes: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) {
    nodes.push(node as Text);
  }

  nodes.forEach((textNode) => {
    const parent = textNode.parentElement!;
    const original = parent.getAttribute(ORIG_ATTR) ?? textNode.textContent ?? '';

    if (scriptMode.value === 'cyrillic') {
      if (!parent.hasAttribute(ORIG_ATTR)) {
        parent.setAttribute(ORIG_ATTR, textNode.textContent ?? '');
      }
      textNode.textContent = latinToCyrillic(original);
    } else {
      if (parent.hasAttribute(ORIG_ATTR)) {
        textNode.textContent = parent.getAttribute(ORIG_ATTR) ?? '';
        parent.removeAttribute(ORIG_ATTR);
      }
    }
  });
};

// MutationObserver — DOM o'zgarganda ham transliteratsiya qiladi
let observer: MutationObserver | null = null;

export const startDOMObserver = () => {
  if (observer) observer.disconnect();

  if (scriptMode.value !== 'cyrillic') return;

  observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
            transliterateDOM(node.nodeType === Node.TEXT_NODE ? node.parentElement! : node);
          }
        });
      } else if (mutation.type === 'characterData') {
        const parent = (mutation.target as Text).parentElement;
        if (parent && !SKIP_TAGS.has(parent.tagName)) {
          if (!parent.hasAttribute(ORIG_ATTR)) {
            parent.setAttribute(ORIG_ATTR, mutation.target.textContent ?? '');
          }
          (mutation.target as Text).textContent = latinToCyrillic(
            parent.getAttribute(ORIG_ATTR) ?? mutation.target.textContent ?? ''
          );
        }
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: false, // too noisy, skip
  });
};

export const stopDOMObserver = () => {
  observer?.disconnect();
  observer = null;
};

// ─── Apply script globally ─────────────────────────────────────────────────
export const applyGlobalScript = (mode: ScriptMode) => {
  scriptMode.value = mode;
  localStorage.setItem(STORAGE_KEY, mode);
  document.documentElement.setAttribute('data-script', mode);

  if (typeof document !== 'undefined' && document.body) {
    if (mode === 'cyrillic') {
      transliterateDOM(document.body);
      startDOMObserver();
    } else {
      stopDOMObserver();
      transliterateDOM(document.body); // restore originals
    }
  }
};

// ─── Composable ────────────────────────────────────────────────────────────
export const useLanguage = () => {
  const setScript = (mode: ScriptMode) => {
    applyGlobalScript(mode);
  };

  const toggleScript = () => {
    applyGlobalScript(scriptMode.value === 'latin' ? 'cyrillic' : 'latin');
  };

  return {
    scriptMode,
    setScript,
    toggleScript,
    latinToCyrillic,
    cyrillicToLatin,
  };
};
