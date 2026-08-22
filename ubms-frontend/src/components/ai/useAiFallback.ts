import { AI_KNOWLEDGE_BASE, GUIDE_MODULES } from '../../views/guide/guideData';

export const stemUzbek = (word: string): string => {
  return word
    .toLowerCase()
    .replace(/(larimizga|larimizdan|larimizda|larimizning|larimizni|larimiz|laringiz|lariga|larida|laridan|larining|larini|larga|larda|lardan|larning|lar)/g, '')
    .replace(/(imizga|imizdan|imizda|imizning|imizni|imiz|ingizga|ingizdan|ingizda|ingizning|ingizni|ingiz)/g, '')
    .replace(/(iga|ida|idan|ining|ini|imga|imdan|imda|imning|imni|siga|sida|sidan|sining|sini)/g, '')
    .replace(/(ga|ka|qa|da|ta|dan|tan|ning|ni|siz|masmi|mi|chi|dir)/g, '');
};

export const findBestAnswer = (query: string): { text: string; actionRoute?: string; actionText?: string } => {
  const normalized = query.toLowerCase().trim();
  const queryTokens = normalized.split(/[\s,?.!;:—]+/).filter((w) => w.length > 1);
  const stemmedQueryTokens = queryTokens.map(stemUzbek).filter((w) => w.length > 1);

  // 1. Check for Greetings & Conversational queries
  const greetingKeywords = ['salom', 'assalom', 'assalomu', 'privet', 'hello', 'hey', 'qalesiz', 'qalaysiz', 'kimsan', 'yordamchi', 'nima qila olasan'];
  if (greetingKeywords.some((g) => normalized.includes(g))) {
    return {
      text: `**Assalomu alaykum!** Men **Boshqar AI** aqlli yordamchisiman.\n\nBoshqar.uz tizimidan foydalanish bo‘yicha (Kassa, Omborxona, Moliya, Nasiya/Mijozlar, Ta'minotchilar, Smenalar, Restoran, Xizmatlar, Obuna yoki Sozlamalar) istalgan savolingizni bering!`,
      actionRoute: '/pos',
      actionText: 'Kassa (POS) ga o‘tish',
    };
  }

  // 2. Check Module FAQs directly
  for (const mod of GUIDE_MODULES) {
    for (const faq of mod.faq) {
      const qNorm = faq.q.toLowerCase();
      const matchCount = queryTokens.filter((t) => qNorm.includes(t)).length;
      if (matchCount >= 2 || normalized.includes(qNorm) || qNorm.includes(normalized)) {
        return {
          text: `**${faq.q}**\n\n${faq.a}\n\n• *Bo‘lim: ${mod.title}*`,
          actionRoute: mod.route,
          actionText: `${mod.title} sahifasiga o‘tish`,
        };
      }
    }
  }

  // 3. Ranked scoring in AI_KNOWLEDGE_BASE
  let bestKnowledgeItem: any = null;
  let highestKnowledgeScore = 0;

  for (const item of AI_KNOWLEDGE_BASE) {
    let score = 0;
    for (const kw of item.keywords) {
      const kwLower = kw.toLowerCase();
      const kwStemmed = stemUzbek(kwLower);

      // Exact phrase match in query
      if (normalized.includes(kwLower)) {
        score += kwLower.split(/\s+/).length * 8;
      }

      // Stemmed keyword matching
      if (stemmedQueryTokens.includes(kwStemmed)) {
        score += 5;
      }

      // Token inclusion matching
      for (const st of stemmedQueryTokens) {
        if (kwStemmed.includes(st) || st.includes(kwStemmed)) {
          score += 3;
        }
      }
    }

    if (score > highestKnowledgeScore) {
      highestKnowledgeScore = score;
      bestKnowledgeItem = item;
    }
  }

  if (bestKnowledgeItem && highestKnowledgeScore >= 3) {
    return {
      text: bestKnowledgeItem.answer,
      actionRoute: bestKnowledgeItem.actionRoute,
      actionText: bestKnowledgeItem.actionText,
    };
  }

  // 4. Check in GUIDE_MODULES steps
  for (const mod of GUIDE_MODULES) {
    for (const step of mod.steps) {
      const titleLower = step.title.toLowerCase();
      const descLower = step.description.toLowerCase();
      const matchInTitle = stemmedQueryTokens.filter((t) => titleLower.includes(t)).length;
      const matchInDesc = stemmedQueryTokens.filter((t) => descLower.includes(t)).length;

      if (matchInTitle >= 1 || matchInDesc >= 2) {
        return {
          text: `**${mod.title} — ${step.title}**\n\n${step.description}${step.tip ? `\n\n💡 *Maslahat: ${step.tip}*` : ''}`,
          actionRoute: mod.route,
          actionText: `${mod.title} sahifasiga o‘tish`,
        };
      }
    }
  }

  // 5. Fallback smart comprehensive guide
  return {
    text: `Ushbu savol bo‘yicha to‘liq ma’lumot olish uchun quyidagi asosiy bo‘limlardan birini tanlashingiz mumkin:\n\n• **Kassa (POS)** — Tezkor sotuv, skaner va cheklar\n• **Mahsulotlar** — Yangi tovar, narxlar va Excel import\n• **Omborxona** — Qoldiqlar, kirim va inventarizatsiya\n• **Mijozlar & Nasiya** — Qarz daftari va to‘lovlar\n• **Ta'minotchilar** — Xaridlar va hisob-kitoblar\n• **Moliya** — Sof foyda va xarajatlar tahlili\n• **Restoran / Kafe** — Stollar va oshxona KDS\n• **Xizmatlar** — Ustalar va bandlovlar taqvimi\n• **Telegram Bot** — Avtomatik savdo xabarlari\n• **Sozlamalar** — Xodimlar va huquqlar (RBAC)`,
    actionRoute: '/guide',
    actionText: 'To‘liq Qo‘llanmani ochish',
  };
};
