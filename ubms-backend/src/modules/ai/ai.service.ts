import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface AiQueryDto {
  query: string;
  businessId?: string;
  chatHistory?: Array<{ sender: 'bot' | 'user'; text: string }>;
}

export interface AiResponse {
  answer: string;
  actionRoute?: string;
  actionText?: string;
  suggestedFollowUps?: string[];
  metrics?: Record<string, unknown>;
}

export interface ParsedProductItem {
  name: string;
  categoryName?: string;
  unitName?: string;
  purchasePrice?: number;
  salePrice: number;
  initialStock?: number;
  minStock?: number;
  barcode?: string;
  sku?: string;
}

export interface ParseProductsResult {
  success: boolean;
  totalParsed: number;
  summary: string;
  products: ParsedProductItem[];
  detectedCategories: string[];
}

export interface BusinessAiContext {
  businessName: string;
  currency: string;
  todaySales: number;
  todayOrdersCount: number;
  todayExpenseSum: number;
  todayProfit: number;
  lowStockItems: { name: string; qty: number; min: number }[];
  debtors: { name: string; debt: number; phone?: string | null }[];
  totalDebt: number;
  openShifts: string[];
  productsCount: number;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private prisma: PrismaService) {}

  private buildSystemPrompt(ctx: BusinessAiContext | null): string {
    const cur = ctx?.currency || 'UZS';
    let base = `Siz Boshqar.uz (Universal Business Management System) platformasining rasmiy aqlli sun'iy intellekt biznes tahlilchisi va virtual maslahatchisisiz (Boshqar AI).
Sizning asosiy vazifangiz — tadbirkorlar, do'kon va xizmat ko'rsatish sohasidagi biznes egalariga savdoni oshirish, xarajatlarni qisqartirish, omborxona zaxiralarini optimal boshqarish, kassa va qarzlar bo'yicha professional, aniq, tahliliy va amaliy yordam berish.

Javob berish qoidalari:
1. Doim o'zbek tilida (lotin alifbosida), muloyim, tushunarli, aniq va professional ohangda javob bering.
2. Muhim raqamlar va atamalarni **qalin** qilib ajrating.
3. Ro'yxat keltirganda • belgisidan foydalaning.
4. Agar foydalanuvchi platformaning biror bo'limi haqida so'rasa, o'sha bo'lim nomini aniq ko'rsating (Kassa / POS, Mahsulotlar, Omborxona, Mijozlar & Nasiya, Moliya, Restoran / KDS, Xizmatlar, Telegram Bot, Sozlamalar).
5. Keraksiz uzun gaplardan qoching, to'g'ridan-to'g'ri maslahat va yechim bering.`;

    if (ctx) {
      base += `\n\nJoriy Biznes Holati haqida jonli ma'lumotlar:
- Biznes nomi: "${ctx.businessName}"
- Valyuta: ${cur}
- Bugungi jami savdo: ${ctx.todaySales.toLocaleString()} ${cur} (${ctx.todayOrdersCount} ta buyurtma/chek)
- Bugungi jami xarajatlar: ${ctx.todayExpenseSum.toLocaleString()} ${cur}
- Bugungi sof foyda: ${ctx.todayProfit.toLocaleString()} ${cur}
- Kam qolgan tovarlar soni: ${ctx.lowStockItems.length} ta ${ctx.lowStockItems.length > 0 ? `(${ctx.lowStockItems.map((i) => `${i.name}: ${i.qty} dona`).join(', ')})` : ''}
- Jami mijozlar qarzi (nasiya): ${ctx.totalDebt.toLocaleString()} ${cur}
- Jami faol mahsulotlar soni: ${ctx.productsCount} ta
- Ochiq kassa smenalari: ${ctx.openShifts.length > 0 ? ctx.openShifts.join(', ') : 'Ochiq smena yo\'q'}`;
    }

    return base;
  }

  private resolveActionRoute(query: string, answer: string): { actionRoute?: string; actionText?: string } {
    const text = (query + ' ' + answer).toLowerCase();
    if (text.includes('kassa') || text.includes('pos') || text.includes('chek') || text.includes('sotuv')) {
      return { actionRoute: '/pos', actionText: 'Kassa (POS) ga o\'tish' };
    }
    if (text.includes('ombor') || text.includes('kam qol') || text.includes('zaxira') || text.includes('qoldiq')) {
      return { actionRoute: '/inventory', actionText: 'Omborxonaga o\'tish' };
    }
    if (text.includes('moliya') || text.includes('foyda') || text.includes('daromad') || text.includes('xarajat') || text.includes('chiqim')) {
      return { actionRoute: '/finance', actionText: 'Moliya hisobotiga o\'tish' };
    }
    if (text.includes('nasiya') || text.includes('qarz') || text.includes('mijoz')) {
      return { actionRoute: '/customers', actionText: 'Mijozlar & Nasiya' };
    }
    if (text.includes('tovar') || text.includes('mahsulot') || text.includes('shtrix') || text.includes('barkod')) {
      return { actionRoute: '/products', actionText: 'Mahsulotlar katalogi' };
    }
    if (text.includes('telegram') || text.includes('bot')) {
      return { actionRoute: '/settings?tab=telegram', actionText: 'Telegram bot sozlamalari' };
    }
    if (text.includes('xodim') || text.includes('rol') || text.includes('sozlama')) {
      return { actionRoute: '/settings', actionText: 'Sozlamalarga o\'tish' };
    }
    return {};
  }

  private async callLlm(
    query: string,
    ctx: BusinessAiContext | null,
    chatHistory?: Array<{ sender: 'bot' | 'user'; text: string }>,
  ): Promise<string | null> {
    const geminiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!geminiKey && !openaiKey) {
      return null;
    }

    const systemPrompt = this.buildSystemPrompt(ctx);

    if (geminiKey) {
      try {
        const contents = [];
        if (chatHistory && chatHistory.length > 0) {
          for (const item of chatHistory.slice(-4)) {
            contents.push({
              role: item.sender === 'user' ? 'user' : 'model',
              parts: [{ text: item.text }],
            });
          }
        }
        contents.push({
          role: 'user',
          parts: [{ text: query }],
        });

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: systemPrompt }],
            },
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024,
            },
          }),
        });

        if (!res.ok) {
          const errText = await res.text();
          this.logger.warn(`Gemini API error status ${res.status}: ${errText}`);
          return null;
        }

        const data: any = await res.json();
        const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText && typeof candidateText === 'string') {
          return candidateText.trim();
        }
      } catch (err: any) {
        this.logger.warn(`Gemini API call failed: ${err?.message || err}`);
      }
    } else if (openaiKey) {
      try {
        const messages = [{ role: 'system', content: systemPrompt }];
        if (chatHistory && chatHistory.length > 0) {
          for (const item of chatHistory.slice(-4)) {
            messages.push({
              role: item.sender === 'user' ? 'user' : 'assistant',
              content: item.text,
            });
          }
        }
        messages.push({ role: 'user', content: query });

        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages,
            temperature: 0.7,
            max_tokens: 1024,
          }),
        });

        if (res.ok) {
          const data: any = await res.json();
          const answer = data?.choices?.[0]?.message?.content;
          if (answer) return answer.trim();
        }
      } catch (err: any) {
        this.logger.warn(`OpenAI API call failed: ${err?.message || err}`);
      }
    }

    return null;
  }

  /**
   * Main AI reasoning and response engine
   */
  async processQuery(dto: AiQueryDto, currentUserId?: string, currentBusinessId?: string): Promise<AiResponse> {
    const query = dto.query?.trim() || '';
    const normalized = query.toLowerCase();
    const bId = dto.businessId || currentBusinessId;

    // Fetch live business context if businessId exists
    let businessContext: BusinessAiContext | null = null;
    if (bId) {
      businessContext = await this.getLiveBusinessContext(bId, currentUserId);
    }

    // 1. Try real LLM (Gemini / OpenAI) first for intelligent natural reasoning
    const llmAnswer = await this.callLlm(query, businessContext, dto.chatHistory);
    if (llmAnswer) {
      const actions = this.resolveActionRoute(query, llmAnswer);
      return {
        answer: llmAnswer,
        actionRoute: actions.actionRoute,
        actionText: actions.actionText,
        suggestedFollowUps: ['Bugungi savdo va hisobot', 'Qaysi tovarlar kam qoldi?', 'Nasiyalar holati'],
      };
    }

    // 2. Fallback to high-precision live business metrics / stats
    const metricsAnswer = this.handleBusinessMetricsQuery(normalized, businessContext);
    if (metricsAnswer) {
      return metricsAnswer;
    }

    // 3. Fallback to system usage / how-to / troubleshooting questions
    const systemHowToAnswer = this.handleSystemHowToQuery(normalized, businessContext);
    if (systemHowToAnswer) {
      return systemHowToAnswer;
    }

    // 4. Conversational / greetings / general guidance fallback
    return this.handleConversationalQuery(normalized, businessContext);
  }

  /**
   * Fetch real-time live business state for contextual intelligence
   */
  private async getLiveBusinessContext(businessId: string, userId?: string) {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const [business, todayOrders, todayExpenses, lowStockItems, debtors, openShifts, productsCount] = await Promise.all([
        this.prisma.business.findUnique({
          where: { id: businessId },
          select: { id: true, name: true, currency: true },
        }),
        this.prisma.order.findMany({
          where: {
            businessId,
            status: 'completed',
            createdAt: { gte: todayStart },
          },
          select: { total: true },
        }),
        this.prisma.expense.findMany({
          where: {
            businessId,
            recordedAt: { gte: todayStart },
          },
          select: { amount: true },
        }),
        this.prisma.inventory.findMany({
          where: {
            branch: { businessId },
            quantity: { lte: 5 },
          },
          include: {
            product: { select: { name: true, minStock: true } },
          },
          take: 8,
        }),
        this.prisma.customer.findMany({
          where: {
            businessId,
            debt: { gt: 0 },
          },
          orderBy: { debt: 'desc' },
          select: { fullName: true, debt: true, phone: true },
          take: 5,
        }),
        this.prisma.posShift.findMany({
          where: {
            businessId,
            closedAt: null,
          },
          include: {
            user: { select: { fullName: true, phone: true } },
          },
        }),
        this.prisma.product.count({
          where: { businessId, status: 'active' },
        }),
      ]);

      const todaySales = todayOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
      const todayExpenseSum = todayExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
      const todayProfit = todaySales - todayExpenseSum;
      const totalDebt = debtors.reduce((sum, d) => sum + Number(d.debt || 0), 0);

      return {
        businessName: business?.name || 'Do\'koningiz',
        currency: business?.currency || 'UZS',
        todaySales,
        todayOrdersCount: todayOrders.length,
        todayExpenseSum,
        todayProfit,
        lowStockItems: lowStockItems.map((inv) => ({
          name: inv.product?.name || 'Tovar',
          qty: Number(inv.quantity || 0),
          min: Number(inv.product?.minStock || 5),
        })),
        debtors: debtors.map((d) => ({
          name: d.fullName,
          debt: Number(d.debt || 0),
          phone: d.phone,
        })),
        totalDebt,
        openShifts: openShifts.map((s) => s.user?.fullName || 'Kassir'),
        productsCount,
      };
    } catch (e) {
      this.logger.warn(`Could not load business context: ${e}`);
      return null;
    }
  }

  /**
   * Format money helper
   */
  private formatMoney(num: number, cur: string = 'UZS'): string {
    const c = cur.toUpperCase();
    if (c === 'USD') return `$${num.toLocaleString('en-US')}`;
    if (c === 'RUB') return `${num.toLocaleString('ru-RU')} ₽`;
    if (c === 'EUR') return `€${num.toLocaleString('de-DE')}`;
    return `${num.toLocaleString('uz-UZ')} so'm`;
  }

  /**
   * Answer live business metrics questions
   */
  private handleBusinessMetricsQuery(q: string, ctx: BusinessAiContext | null): AiResponse | null {
    if (!ctx) return null;

    const cur = ctx.currency || 'UZS';

    // 1. Sales & Revenue Questions
    if (
      q.includes('savdo') ||
      q.includes('tushum') ||
      q.includes('qancha sotildi') ||
      q.includes('qancha savdo') ||
      q.includes('bugungi savdo') ||
      q.includes('chek')
    ) {
      return {
        answer:
          `**${ctx.businessName} — Bugungi Savdo Holati:**\n\n` +
          `• **Jami Savdo (Kirim):** **${this.formatMoney(ctx.todaySales, cur)}**\n` +
          `• **Cheklar soni:** **${ctx.todayOrdersCount} ta**\n` +
          `• **O'rtacha chek:** ${this.formatMoney(ctx.todayOrdersCount ? Math.round(ctx.todaySales / ctx.todayOrdersCount) : 0, cur)}\n` +
          `• **Faol kassirlar:** ${ctx.openShifts.length > 0 ? ctx.openShifts.join(', ') : 'Ochiq smena yo\'q'}\n\n` +
          `*Savdolarni real vaqtda Kassa yoki Moliya sahifasida to'liq ko'rishingiz mumkin.*`,
        actionRoute: '/finance',
        actionText: 'Moliya hisobotiga o\'tish',
        suggestedFollowUps: ['Bugungi sof foyda qancha?', 'Qaysi tovarlar kam qoldi?', 'Nasiyalar qancha?'],
      };
    }

    // 2. Profit & Expenses Questions
    if (
      q.includes('foyda') ||
      q.includes('daromad') ||
      q.includes('xarajat') ||
      q.includes('chiqim') ||
      q.includes('sof foyda') ||
      q.includes('moliya')
    ) {
      return {
        answer:
          `**${ctx.businessName} — Bugungi Moliyaviy Natija:**\n\n` +
          `• **Kirim (Savdo):** ${this.formatMoney(ctx.todaySales, cur)}\n` +
          `• **Chiqim (Xarajatlar):** ${this.formatMoney(ctx.todayExpenseSum, cur)}\n` +
          `• **Sof Foyda:** **${this.formatMoney(ctx.todayProfit, cur)}**\n\n` +
          `*Eslatma: Xarajatlarni doimiy kiritib borsangiz, hisobotlar 100% aniq sof foydani ko'rsatadi.*`,
        actionRoute: '/finance',
        actionText: 'Moliya & Xarajatlar',
        suggestedFollowUps: ['Xarajat qanday kiritiladi?', 'Bugungi savdo qancha?', 'Kassirlar holati'],
      };
    }

    // 3. Low stock / Inventory Questions
    if (
      q.includes('kam qol') ||
      q.includes('tugay') ||
      q.includes('zaxira') ||
      q.includes('ombor') ||
      q.includes('qoldiq') ||
      q.includes('tovar kam')
    ) {
      if (ctx.lowStockItems.length === 0) {
        return {
          answer:
            `**Ombor holati a'lo darajada!**\n\n` +
            `Jami mahsulotlar soni: **${ctx.productsCount} ta**.\n` +
            `Hozirda minimal chegaradan kam qolgan yoki tugagan tovarlar yo'q.`,
          actionRoute: '/inventory',
          actionText: 'Omborxonaga o\'tish',
        };
      }

      const list = ctx.lowStockItems
        .map((item, i: number) => `  ${i + 1}. **${item.name}** — qoldiq: **${item.qty} dona** (chegara: ${item.min})`)
        .join('\n');

      return {
        answer:
          `**Omborda kam qolgan tovarlar (${ctx.lowStockItems.length} ta):**\n\n` +
          `${list}\n\n` +
          `*Ushbu tovarlar tugab qolmasligi uchun ta'minotchilarga buyurtma berish tavsiya etiladi.*`,
        actionRoute: '/inventory',
        actionText: 'Omborxona va Kirim',
        suggestedFollowUps: ['Omborga qanday kirim qilaman?', 'Yangi tovar qo\'shish', 'Bugungi savdo'],
      };
    }

    // 4. Debts / Nasiya / CRM Questions
    if (
      q.includes('qarz') ||
      q.includes('nasiya') ||
      q.includes('mijoz') ||
      q.includes('kim qarz') ||
      q.includes('qarzdor')
    ) {
      if (ctx.debtors.length === 0) {
        return {
          answer:
            `**Nasiyalar daftari toza!**\n\n` +
            `Hozirda mijozlar tomonidan to'lanmagan qarzlar mavjud emas.`,
          actionRoute: '/customers',
          actionText: 'Mijozlar bazasi',
        };
      }

      const debtorsList = ctx.debtors
        .map((d, i: number) => `  ${i + 1}. **${d.name}** (${d.phone || 'Tel yo\'q'}): **${this.formatMoney(d.debt, cur)}**`)
        .join('\n');

      return {
        answer:
          `**Nasiyalar va Qarzdorlik Holati:**\n\n` +
          `• **Jami Nasiyalar:** **${this.formatMoney(ctx.totalDebt, cur)}**\n\n` +
          `**Eng katta qarzdorlar:**\n${debtorsList}\n\n` +
          `*Mijozlar sahifasiga o'tib, qarz to'lovlarini qabul qilishingiz yoki eslatma yuborishingiz mumkin.*`,
        actionRoute: '/customers',
        actionText: 'Nasiyalar Daftari',
        suggestedFollowUps: ['Nasiyaga tovar qanday beriladi?', 'Bugungi savdo qancha?', 'Moliya hisoboti'],
      };
    }

    // 5. Cashier / Shift monitoring
    if (q.includes('kassir') || q.includes('smena') || q.includes('kassa ochiq') || q.includes('xodim')) {
      const shiftInfo = ctx.openShifts.length > 0
        ? `• **Ochiq smenada ishlayotgan kassirlar:** ${ctx.openShifts.join(', ')}`
        : `• **Hozirda ochiq smenalar mavjud emas.**`;

      return {
        answer:
          `**Kassirlar va Smena Holati:**\n\n` +
          `${shiftInfo}\n\n` +
          `• Bugun urilgan cheklar: **${ctx.todayOrdersCount} ta**\n` +
          `• Jami kassa tushumi: **${this.formatMoney(ctx.todaySales, cur)}**`,
        actionRoute: '/pos',
        actionText: 'Kassa (POS) ga o\'tish',
        suggestedFollowUps: ['Kassa qanday ishlatiladi?', 'Smena qanday yopiladi?', 'Chek chiqarish'],
      };
    }

    return null;
  }

  /**
   * Answer system usage and procedural how-to questions
   */
  private handleSystemHowToQuery(q: string, ctx: BusinessAiContext | null): AiResponse | null {
    // 1. Add Product / Mahsulot qo'shish
    if (
      q.includes('tovar qo\'sh') ||
      q.includes('mahsulot qo\'sh') ||
      q.includes('yangi tovar') ||
      q.includes('tovar kirit') ||
      q.includes('narx qo\'y')
    ) {
      return {
        answer:
          `**Yangi Tovar Qo'shish Bo'yicha Bosqichma-bosqich Ko'rsatma:**\n\n` +
          `1. **Mahsulotlar** bo'limiga o'ting va **"+ Yangi mahsulot"** tugmasini bosing.\n` +
          `2. **Nomi, Kategoriya va O'lchov birligi**ni tanlang (dona, kg, litr).\n` +
          `3. **Tannarx (Kirim narxi)** va **Sotish narxi**ni kiriting — tizim avtomatik foyda marjasini hisoblaydi.\n` +
          `4. **Shtrix-kod**ni skaner qiling yoki avtomatik generatsiya qiling.\n` +
          `5. **Minimal qoldiq**ni belgilang (masalan: 5 dona) va **"Saqlash"**ni bosing.\n\n` +
          `*Tovar darhol Kassa (POS) va Omborxona ro'yxatida paydo bo'ladi!*`,
        actionRoute: '/products',
        actionText: 'Mahsulotlar bo\'limiga o\'tish',
        suggestedFollowUps: ['Shtrix-kodsiz tovar sotish', 'Omborga kirim qilish', 'Kassada tovar qidirish'],
      };
    }

    // 2. POS / Kassa savdosi va chek chiqarish
    if (
      q.includes('chek chiqar') ||
      q.includes('savdo qil') ||
      q.includes('kassa') ||
      q.includes('skaner') ||
      q.includes('sotish')
    ) {
      return {
        answer:
          `**Kassada Savdo Qilish va Chek Chiqarish:**\n\n` +
          `1. **Kassa (POS)** sahifasiga kiring.\n` +
          `2. Tovarni shtrix-kod skaner qiling yoki qidiruv qatoriga nomini yozing.\n` +
          `3. Savatda mahsulot miqdorini ` +
          `**"+" / "-"** yoki klaviaturadagi raqamlar orqali o'zgartiring.\n` +
          `4. **"To'lov" (F9 / Space)** tugmasini bosing va to'lov turini tanlang:\n` +
          `   • **Naqd** — mijoz bergan summani kiritganda, qaytim (sdacha) hisoblanadi.\n` +
          `   • **Karta / Terminal** (Humo, Uzcard)\n` +
          `   • **Nasiya** (Mijozni tanlash shart)\n` +
          `5. **"To'lovni tasdiqlash"**ni bosing — chek printerdan avtomatik chiqadi va ombor qoldig'i kamayadi!`,
        actionRoute: '/pos',
        actionText: 'Kassa (POS) ga o\'tish',
        suggestedFollowUps: ['Chekni qaytarish (refund)', 'Nasiyaga tovar berish', 'Smena qanday yopiladi?'],
      };
    }

    // 3. Telegram Bot Connection
    if (
      q.includes('telegram') ||
      q.includes('bot') ||
      q.includes('telefonda') ||
      q.includes('ulan') ||
      q.includes('xabar kelmayapti')
    ) {
      return {
        answer:
          `**Telegram Botni 1 Clickda Ulash:**\n\n` +
          `1. **Sozlamalar -> Telegram Bot** bo'limiga kiring.\n` +
          `2. **"Telegram Botni Ulash"** tugmasini bosing.\n` +
          `3. Ochilgan maxsus havolani bosing yoki Telegramda **@Boshqar_uzbot** ga kirib **START** bosing.\n` +
          `4. Bot darhol sizning biznesingizga ulanadi va har bir yangi savdo, kam qolgan tovar hamda kunlik hisobotlarni yuborib turadi!\n\n` +
          `*Bitta biznesga bir nechta xodim yoki direktorning Telegram akkauntini ham ulash mumkin!*`,
        actionRoute: '/settings',
        actionText: 'Telegram Sozlamalariga o\'tish',
        suggestedFollowUps: ['Botda qaysi buyruqlar bor?', 'Xodim botdan qanday foydalanadi?', 'Kunlik hisobot vaqti'],
      };
    }

    // 4. Smena ochish va yopish
    if (q.includes('smena') || q.includes('x-hisobot') || q.includes('z-hisobot') || q.includes('kassa yop')) {
      return {
        answer:
          `**Kassa Smenasini Ochish va Yopish (X-Z Hisoboti):**\n\n` +
          `1. **Kassa (POS)** sahifasiga kirganingizda, agar smena yopiq bo'lsa, **"Smena ochish"** oynasi chiqadi.\n` +
          `2. Kassadagi boshlang'ich naqd pulni kiritib, smenani ochasiz.\n` +
          `3. Ish kuni tugagach, yuqoridagi **"Smenani yopish"** tugmasini bosing.\n` +
          `4. Kassadagi haqiqiy naqd pulni sanab kiriting — tizim avtomatik kassa farqini (kamomad yoki ortiqcha) hisoblaydi va Z-hisobot chekini chiqaradi.\n` +
          `5. Smena yopilishi bilan do'kon rahbarining Telegramiga avtomatik to'liq hisobot boradi!`,
        actionRoute: '/pos',
        actionText: 'Kassaga o\'tish',
        suggestedFollowUps: ['Kassada savdo qilish', 'Bugungi savdo qancha?', 'Telegram botni ulash'],
      };
    }

    // 5. Nasiya / Qarz daftari
    if (q.includes('nasiya') || q.includes('qarz berish') || q.includes('qarzni yop')) {
      return {
        answer:
          `**Nasiyaga Tovar Berish va Qarzni Qabul Qilish:**\n\n` +
          `• **Nasiyaga sotish:** Kassada savat yig'ilgach, **"Mijoz tanlash"** orqali xaridorni tanlang va to'lov usuli sifatida **"Nasiya"**ni bosing.\n` +
          `• **Qarzni yopish / To'lov qabul qilish:** **Mijozlar** bo'limiga o'ting, qarzdor mijozni tanlang va **"Qarz to'lash"** tugmasi orqali to'langan pulni kiriting.\n` +
          `• **Telegram Eslatma:** Qarzdor mijoz yonidagi **"Eslatma"** tugmasi orqali uning Telegramiga to'lov eslatmasini yuborish mumkin!`,
        actionRoute: '/customers',
        actionText: 'Mijozlar & Nasiya Daftari',
        suggestedFollowUps: ['Nasiyalar holati qanday?', 'Kassada tovar sotish', 'Moliya hisoboti'],
      };
    }

    // 6. Chekni bekor qilish / Qaytarish (Refund)
    if (q.includes('qaytar') || q.includes('bekor') || q.includes('refund') || q.includes('vozvrat')) {
      return {
        answer:
          `**Kassa Chekini Bekor Qilish va Tovarni Qaytarish (Refund):**\n\n` +
          `1. **Kassa (POS)** sahifasidagi **"Sotuvlar tarixi (Cheklar)"** tugmasini bosing.\n` +
          `2. Qaytarilishi kerak bo'lgan chekni toping va **"Qaytarish (Refund)"** tugmasini bosing.\n` +
          `3. Qaytarilayotgan tovarlar miqdorini belgilang va tasdiqlang.\n` +
          `4. Tovar avtomatik omborga qaytadi, pul kassadan hisobdan chiqariladi va audit jurnaliga qayd etiladi.`,
        actionRoute: '/pos',
        actionText: 'Kassa Tarixiga o\'tish',
      };
    }

    return null;
  }

  /**
   * Conversational fallback
   */
  private handleConversationalQuery(q: string, ctx: BusinessAiContext | null): AiResponse {
    if (q.includes('salom') || q.includes('assalom') || q.includes('privet') || q.includes('qalesan') || q.includes('kimsan')) {
      return {
        answer:
          `Assalomu alaykum! Men **Boshqar AI** — sizning aqlli biznes boshqaruv yordamchingizman.\n\n` +
          (ctx ? `Sizning **"${ctx.businessName}"** biznesingizga ulanganman. ` : '') +
          `Mendan savdo ko'rsatkichlari, ombor qoldig'i, nasiyalar, tovar qo'shish yoki tizimdan foydalanish bo'yicha istalgan savolni so'rashingiz mumkin!`,
        suggestedFollowUps: ['Bugungi savdo qancha?', 'Qaysi tovarlar kam qoldi?', 'Yangi tovar qanday qo\'shiladi?'],
      };
    }

    if (q.includes('rahmat') || q.includes('tashakkur') || q.includes('raxmat') || q.includes('zo\'r')) {
      return {
        answer: `Arzimaydi! Sizga yordam berganimdan xursandman. Yana qanday savollaringiz bo'lsa, bemalol bering!`,
      };
    }

    return {
      answer:
        `Savolingiz bo'yicha quyidagi asosiy bo'limlarga o'tib ma'lumot olishingiz mumkin:\n\n` +
        `• **Kassa (POS)** — Tezkor sotuv, skaner va chek chiqarish\n` +
        `• **Mahsulotlar** — Tovar qo'shish, shtrix-kod va narxlar\n` +
        `• **Omborxona** — Tovar zaxirasi va inventarizatsiya\n` +
        `• **Mijozlar** — Nasiya va qarz daftari\n` +
        `• **Moliya** — Kunlik hisobot, xarajatlar va sof foyda\n` +
        `• **Telegram Bot** — Telefonda real vaqt hisoboti`,
      actionRoute: '/guide',
      actionText: 'Qo\'llanmalar katalogini ochish',
      suggestedFollowUps: ['Bugungi savdo qancha?', 'Yangi tovar qo\'shish', 'Telegram botni ulash'],
    };
  }

  /**
   * Get dynamic smart prompt suggestions
   */
  async getSuggestedPrompts(businessId?: string) {
    if (!businessId) {
      return [
        { text: 'Bugun qancha savdo bo\'ldi?', icon: 'DollarSign' },
        { text: 'Qanday qilib yangi tovar qo\'shaman?', icon: 'Package' },
        { text: 'Kassada chek qanday chiqariladi?', icon: 'ShoppingCart' },
        { text: 'Telegram botni qanday ulayman?', icon: 'Bot' },
        { text: 'Nasiyalar holati qanday?', icon: 'Users' },
      ];
    }

    const ctx = await this.getLiveBusinessContext(businessId);
    const prompts = [];

    prompts.push({ text: 'Bugungi savdo va hisobot qancha?', icon: 'DollarSign' });

    if (ctx && ctx.lowStockItems.length > 0) {
      prompts.push({ text: 'Qaysi tovarlar kam qoldi?', icon: 'Boxes' });
    }

    if (ctx && ctx.totalDebt > 0) {
      prompts.push({ text: 'Nasiyalar va qarzdorlar kimlar?', icon: 'Users' });
    }

    prompts.push({ text: 'Yangi tovar qanday kiritiladi?', icon: 'Package' });
    prompts.push({ text: 'Telegram botni qanday ulayman?', icon: 'Bot' });
    prompts.push({ text: 'Kassada smena qanday yopiladi?', icon: 'Lock' });

    return prompts;
  }

  /**
   * AI-powered unstructured prompt / voice note / raw invoice parser into product catalog
   */
  async parseProductsPrompt(
    dto: { prompt: string; businessType?: string },
    businessId?: string,
  ): Promise<ParseProductsResult> {
    const prompt = dto.prompt?.trim() || '';
    if (!prompt) {
      return {
        success: false,
        totalParsed: 0,
        summary: 'Matn kiritilmadi',
        products: [],
        detectedCategories: [],
      };
    }

    // 1. Try LLM (Gemini / OpenAI) first for high-accuracy reasoning
    const llmProducts = await this.callLlmForProducts(prompt, dto.businessType);
    if (llmProducts && llmProducts.length > 0) {
      const detectedCategories = Array.from(
        new Set(llmProducts.map((p) => p.categoryName || 'Boshqa').filter(Boolean)),
      );
      return {
        success: true,
        totalParsed: llmProducts.length,
        summary: `AI orqali ${llmProducts.length} ta mahsulot muvaffaqiyatli aniqlandi`,
        products: llmProducts,
        detectedCategories,
      };
    }

    // 2. Intelligent Rule-based NLP Parser Fallback (100% reliable without external API)
    const fallbackProducts = this.fallbackNlpProductParser(prompt, dto.businessType);
    const detectedCategories = Array.from(
      new Set(fallbackProducts.map((p) => p.categoryName || 'Boshqa').filter(Boolean)),
    );

    return {
      success: fallbackProducts.length > 0,
      totalParsed: fallbackProducts.length,
      summary:
        fallbackProducts.length > 0
          ? `${fallbackProducts.length} ta mahsulot matndan ajratib olindi`
          : 'Kiritilgan matndan tovarlar aniqlanmadi. Iltimos, namunadagidek kiritib ko\'ring.',
      products: fallbackProducts,
      detectedCategories,
    };
  }

  /**
   * Call Gemini or OpenAI to parse products with JSON schema
   */
  private async callLlmForProducts(prompt: string, businessType?: string): Promise<ParsedProductItem[] | null> {
    const geminiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!geminiKey && !openaiKey) {
      return null;
    }

    const systemInstruction = `Siz O'zbekistondagi do'kon va bizneslar uchun mahsulotlar ro'yxatini shakllantiruvchi aqlli sun'iy intellektsiz.
Foydalanuvchi erkin tilda yozgan (yoki ovoz bilan aytgan) matndan, ta'minotchi fakturasidan barcha tovarlarni aniqlab, faqat toza JSON formatida massiv qaytaring.

Qoidalar:
1. Bloklar va qadoqlar: Agar "5 blok 1.5L kola, har blokda 6 tadan" deyilsa, initialStock = 5 * 6 = 30 dona bo'ladi.
2. Narxlar: "tan narxi 11000, sotish 14000" yoki "11000/14000" deyilsa: purchasePrice = 11000, salePrice = 14000. Agar faqat bitta narx berilsa, uni salePrice deb oling.
3. Kategoriya: Tovar turiga qarab to'g'ri o'zbekcha kategoriya bering (masalan: "Ichimliklar", "Shirinliklar", "Oziq-ovqat", "Fast-Food", "Sut mahsulotlari", "Kiyim-kechak", "Xo'jalik mollari").
4. Birlik: "dona", "kg", "litr", "blok", "porsiya".
5. Shtrixkod: 12-13 xonali tasodifiy EAN-13 shtrixkod generatsiya qiling (masalan "478000000001").
6. Javob formati FAQAT JSON bo'lishi shart:
{
  "products": [
    {
      "name": "Coca-Cola 1.5L",
      "categoryName": "Ichimliklar",
      "unitName": "dona",
      "purchasePrice": 11000,
      "salePrice": 14000,
      "initialStock": 30,
      "minStock": 5,
      "barcode": "478000000001",
      "sku": "PRD-COCA-15L"
    }
  ]
}`;

    if (geminiKey) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemInstruction }] },
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2,
              response_mime_type: 'application/json',
            },
          }),
        });

        if (res.ok) {
          const data: any = await res.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            const list = Array.isArray(parsed) ? parsed : parsed.products || parsed.items;
            if (Array.isArray(list)) return this.sanitizeParsedProducts(list);
          }
        }
      } catch (err: any) {
        this.logger.warn(`Gemini product parsing failed: ${err.message}`);
      }
    } else if (openaiKey) {
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemInstruction },
              { role: 'user', content: prompt },
            ],
            temperature: 0.2,
            response_format: { type: 'json_object' },
          }),
        });

        if (res.ok) {
          const data: any = await res.json();
          const content = data?.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content);
            const list = Array.isArray(parsed) ? parsed : parsed.products || parsed.items;
            if (Array.isArray(list)) return this.sanitizeParsedProducts(list);
          }
        }
      } catch (err: any) {
        this.logger.warn(`OpenAI product parsing failed: ${err.message}`);
      }
    }

    return null;
  }

  /**
   * Fallback rule-based NLP parser for freeform Uzbek / Russian merchant prompts
   */
  private fallbackNlpProductParser(text: string, businessType?: string): ParsedProductItem[] {
    const products: ParsedProductItem[] = [];

    let defaultPackCount = 6;
    const packMatchGlobal =
      text.match(/har\s+blok(?:da)?\s+(\d+)\s*(?:ta)?/i) ||
      text.match(/blok(?:da)?\s+(\d+)\s*tadan/i) ||
      text.match(/(\d+)\s*tadan/i);
    if (packMatchGlobal) {
      defaultPackCount = parseInt(packMatchGlobal[1], 10) || 6;
    }

    // Global price extraction if mentioned like "tan narxi 11000, sotish 14000"
    let globalCost = 0;
    let globalSale = 0;
    const costMatch = text.match(/(?:tan\s*narx[ia]?|kirim|kelish)\s*[:=]?\s*(\d+[\d\s]*)/i);
    if (costMatch) globalCost = parseInt(costMatch[1].replace(/\s+/g, ''), 10) || 0;
    const saleMatch = text.match(/(?:sotish|sotuv|sotiladi)\s*[:=]?\s*(\d+[\d\s]*)/i);
    if (saleMatch) globalSale = parseInt(saleMatch[1].replace(/\s+/g, ''), 10) || 0;

    // Explicit category extraction like "Ichimliklar kategoriyasiga qo'sh"
    let globalCategory = '';
    const catMatch =
      text.match(/([a-zA-Zа-яА-ЯёЁ\s\-]+?)\s+kategoriyas(?:i|iga)?(?:\s+qo'sh|\s+kirit)?/i) ||
      text.match(/kategoriya(?:si)?\s*[:=]?\s*([a-zA-Zа-яА-ЯёЁ\s\-]+)/i);
    if (catMatch) {
      const rawCat = catMatch[1].trim();
      if (rawCat.length > 2 && !/^(tan|sotish|har|menda)/i.test(rawCat)) {
        globalCategory = rawCat.charAt(0).toUpperCase() + rawCat.slice(1);
      }
    }

    // Split text into candidate phrases / lines (avoid breaking decimal volumes like 1.5L)
    const rawChunks = text
      .split(/(?:\n+|;+|,+|\.(?!\d)\s*)/)
      .map((l) => l.trim())
      .filter((l) => l.length > 1);

    let index = 0;
    for (const chunk of rawChunks) {
      // Ignore meta instruction phrases or category directives
      if (
        /kategoriya|bo'limi|qo'sh(?:ish)?$|kirit(?:ish)?$|har\s+blok|tan\s+narxi|sotish\s+narxi|menda\s+bor/i.test(chunk) ||
        /^\d+\s*tadan$/i.test(chunk) ||
        /^\d+\s*(?:so'?m)?$/i.test(chunk) ||
        /^(ichimliklar|shirinliklar|oziq-ovqat|fast-food|kiyim-kechak|kosmetika|go'sht)$/i.test(chunk.trim())
      ) {
        continue;
      }

      // Extract quantity
      let qty = 1;
      const blockMatch = chunk.match(/(\d+)\s*(?:blok|upakovka|yashik|korobka)/i);
      if (blockMatch) {
        qty = (parseInt(blockMatch[1], 10) || 1) * defaultPackCount;
      } else {
        const donaMatch = chunk.match(/(\d+)\s*(?:dona|ta|shtuk|kg|litr)/i);
        if (donaMatch) {
          qty = parseInt(donaMatch[1], 10) || 1;
        }
      }

      // Price pair pattern: 11000/14000 or 11000-14000
      let costPrice = globalCost;
      let salePrice = globalSale;
      const pricePairMatch = chunk.match(/(\d{3,7})\s*[\/\-]\s*(\d{3,7})/);
      if (pricePairMatch) {
        costPrice = parseInt(pricePairMatch[1], 10);
        salePrice = parseInt(pricePairMatch[2], 10);
      } else {
        const singlePriceMatch = chunk.match(/(\d{4,7})\s*(?:so'?m)?/i);
        if (singlePriceMatch) {
          const p = parseInt(singlePriceMatch[1], 10);
          if (p > 0) {
            salePrice = p;
            if (!costPrice) costPrice = Math.round(p * 0.75);
          }
        }
      }

      // Clean item name
      let cleanName = chunk
        .replace(/^(?:menda|bor|yangi|bizda)\s+/gi, '')
        .replace(/(\d+)\s*(?:blok|upakovka|yashik|korobka|dona|ta|shtuk)/gi, '')
        .replace(/(\d+[\d\s]*)\s*[\/\-]\s*(\d+[\d\s]*)/g, '')
        .replace(/(?:tan\s*narxi|sotish\s*narxi|sotish|narxi|so'?m|\bbor\b|\bmenda\b)/gi, '')
        .replace(/(?:kategoriyasiga|kategoriya|bo'limiga|qo'sh|kirit)/gi, '')
        .replace(/[:\-–—]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // Product MUST contain actual letters (not just pure numbers/prices like "14 000")
      if (!/[a-zA-Zа-яА-ЯёЁ]{2,}/.test(cleanName)) continue;
      if (cleanName.length < 2) continue;

      if (/^(ichimliklar|shirinliklar|oziq-ovqat|fast-food|kiyim-kechak|dona|blok|har|tan|sotish|som|somga)$/i.test(cleanName)) {
        continue;
      }

      // Fix leading volumes like "1.5L Kola" -> "Kola 1.5L"
      if (/^(\d+(?:\.\d+)?\s*(?:l|litr|kg|gr|ml))\s+(.+)$/i.test(cleanName)) {
        const m = cleanName.match(/^(\d+(?:\.\d+)?\s*(?:l|litr|kg|gr|ml))\s+(.+)$/i);
        if (m) cleanName = `${m[2]} ${m[1]}`;
      }

      // Capitalize first letter
      cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

      // Auto detect category
      let categoryName = globalCategory || 'Oziq-ovqat';
      const lower = cleanName.toLowerCase();
      if (/kola|cola|pepsi|fanta|sprite|dena|dinay|nestle|chortoq|suv|sharbat|red bull|flash|choy|kofe|qahva|fuse/i.test(lower)) {
        categoryName = 'Ichimliklar';
      } else if (/snickers|twix|bounty|kitkat|mars|shokolad|vafli|pechene|konfet|alpen|lays|chips|pringles|chudo/i.test(lower)) {
        categoryName = 'Shirinliklar va Gazaklar';
      } else if (/lavash|burger|hot-dog|pitsa|pizza|fri|naggets|doner/i.test(lower)) {
        categoryName = 'Fast-Food';
      } else if (/sut|qatiq|sariyog'|pishloq|tvorog|qaymoq/i.test(lower)) {
        categoryName = 'Sut Mahsulotlari';
      } else if (/shampun|sovun|pasta|krem|gel|salfetka/i.test(lower)) {
        categoryName = 'Gigiyena va Kosmetika';
      } else if (/futbolka|shim|krossovka|ko'ylak|kurtka|paypoq/i.test(lower)) {
        categoryName = 'Kiyim-Kechak';
      }

      index++;
      const barcode = `478${String(Date.now()).slice(-6)}${String(index).padStart(3, '0')}`;
      const sku = `PRD-${Date.now().toString().slice(-4)}${index}`;

      if (!salePrice) salePrice = 12000;
      if (!costPrice) costPrice = Math.round(salePrice * 0.75);

      products.push({
        name: cleanName,
        categoryName,
        unitName: 'dona',
        purchasePrice: costPrice,
        salePrice,
        initialStock: qty,
        minStock: Math.max(3, Math.round(qty * 0.2)),
        barcode,
        sku,
      });
    }

    return products;
  }

  /**
   * Clean and sanitize product array
   */
  private sanitizeParsedProducts(list: any[]): ParsedProductItem[] {
    return list
      .map((item, idx) => {
        if (!item || !item.name) return null;
        const name = String(item.name).trim();
        if (name.length < 2) return null;

        const salePrice = Number(item.salePrice) || 10000;
        const purchasePrice = Number(item.purchasePrice) || Math.round(salePrice * 0.75);
        const initialStock = Number(item.initialStock) || 10;
        const minStock = Number(item.minStock) || 3;
        const barcode = item.barcode?.trim() || `478${String(Date.now()).slice(-6)}${String(idx + 1).padStart(3, '0')}`;
        const sku = item.sku?.trim() || `PRD-${Date.now().toString().slice(-4)}${idx + 1}`;

        return {
          name,
          categoryName: item.categoryName?.trim() || 'Umumiy',
          unitName: item.unitName?.trim() || 'dona',
          purchasePrice,
          salePrice,
          initialStock,
          minStock,
          barcode,
          sku,
        };
      })
      .filter(Boolean) as ParsedProductItem[];
  }

  /**
   * Pre-packaged starter catalogs tailored for Uzbekistan market
   */
  getStarterCatalogTemplates(type?: string) {
    const templates = [
      {
        id: 'supermarket_top',
        title: 'Oziq-ovqat & Supermarket (Top 25)',
        description: 'O\'zbekiston bozoridagi eng xaridorgir ichimliklar, shirinliklar va oziq-ovqat to\'plami',
        category: 'retail',
        icon: 'ShoppingCart',
        productsCount: 25,
        products: [
          { name: 'Coca-Cola 1.5L', categoryName: 'Ichimliklar', unitName: 'dona', purchasePrice: 11000, salePrice: 14000, initialStock: 60, minStock: 12, barcode: '5449000000996' },
          { name: 'Coca-Cola 0.5L', categoryName: 'Ichimliklar', unitName: 'dona', purchasePrice: 6000, salePrice: 8000, initialStock: 48, minStock: 12, barcode: '5449000000439' },
          { name: 'Pepsi 1.5L', categoryName: 'Ichimliklar', unitName: 'dona', purchasePrice: 10500, salePrice: 13500, initialStock: 60, minStock: 12, barcode: '4607101510015' },
          { name: 'Pepsi 0.5L', categoryName: 'Ichimliklar', unitName: 'dona', purchasePrice: 5500, salePrice: 7500, initialStock: 48, minStock: 12, barcode: '4607101510022' },
          { name: 'Fanta 1.5L', categoryName: 'Ichimliklar', unitName: 'dona', purchasePrice: 11000, salePrice: 14000, initialStock: 36, minStock: 6, barcode: '5449000011527' },
          { name: 'Sprite 1.5L', categoryName: 'Ichimliklar', unitName: 'dona', purchasePrice: 11000, salePrice: 14000, initialStock: 36, minStock: 6, barcode: '5449000012210' },
          { name: 'Nestle Pure Life 1.5L Gazsiz', categoryName: 'Ichimliklar', unitName: 'dona', purchasePrice: 3500, salePrice: 5000, initialStock: 72, minStock: 18, barcode: '4607005400016' },
          { name: 'Chortoq 0.5L Gazli shisha', categoryName: 'Ichimliklar', unitName: 'dona', purchasePrice: 4200, salePrice: 6000, initialStock: 40, minStock: 10, barcode: '4780083010012' },
          { name: 'Dena 1L Olcha Sharbat', categoryName: 'Ichimliklar', unitName: 'dona', purchasePrice: 11500, salePrice: 15000, initialStock: 24, minStock: 6, barcode: '4780007810019' },
          { name: 'Dinay 1L Olma Sharbat', categoryName: 'Ichimliklar', unitName: 'dona', purchasePrice: 8500, salePrice: 11000, initialStock: 24, minStock: 6, barcode: '4780012510019' },
          { name: 'Red Bull 250ml Energetik', categoryName: 'Ichimliklar', unitName: 'dona', purchasePrice: 17000, salePrice: 22000, initialStock: 24, minStock: 6, barcode: '9002490100070' },
          { name: 'Flash Up Max 0.45L Energetik', categoryName: 'Ichimliklar', unitName: 'dona', purchasePrice: 7000, salePrice: 9500, initialStock: 36, minStock: 12, barcode: '4600680010012' },
          { name: 'Snickers Super 80g', categoryName: 'Shirinliklar', unitName: 'dona', purchasePrice: 9500, salePrice: 12000, initialStock: 48, minStock: 12, barcode: '4607065080014' },
          { name: 'Twix Xtra 75g', categoryName: 'Shirinliklar', unitName: 'dona', purchasePrice: 9500, salePrice: 12000, initialStock: 48, minStock: 12, barcode: '4607065080021' },
          { name: 'Bounty Trio 85g', categoryName: 'Shirinliklar', unitName: 'dona', purchasePrice: 9500, salePrice: 12000, initialStock: 36, minStock: 10, barcode: '4607065080038' },
          { name: 'KitKat 4-Finger 41.5g', categoryName: 'Shirinliklar', unitName: 'dona', purchasePrice: 7500, salePrice: 10000, initialStock: 36, minStock: 10, barcode: '7613035980012' },
          { name: 'Alpen Gold Sutli Shokolad 85g', categoryName: 'Shirinliklar', unitName: 'dona', purchasePrice: 10500, salePrice: 13500, initialStock: 30, minStock: 8, barcode: '7622210080013' },
          { name: 'Lays Qaymoq va Ko\'kat 140g', categoryName: 'Gazaklar', unitName: 'dona', purchasePrice: 15000, salePrice: 19000, initialStock: 28, minStock: 6, barcode: '4607001770014' },
          { name: 'Lays Pishloqli 140g', categoryName: 'Gazaklar', unitName: 'dona', purchasePrice: 15000, salePrice: 19000, initialStock: 28, minStock: 6, barcode: '4607001770021' },
          { name: 'Chudo Shokoladli Sut 200ml', categoryName: 'Sut Mahsulotlari', unitName: 'dona', purchasePrice: 5000, salePrice: 7000, initialStock: 40, minStock: 10, barcode: '4600605010018' },
          { name: 'President Sariyog\' 82% 200g', categoryName: 'Sut Mahsulotlari', unitName: 'dona', purchasePrice: 28000, salePrice: 35000, initialStock: 20, minStock: 5, barcode: '3228020100015' },
          { name: 'Makfa Oliy nav Bug\'doy Uni 2kg', categoryName: 'Oziq-ovqat', unitName: 'dona', purchasePrice: 19000, salePrice: 24000, initialStock: 25, minStock: 5, barcode: '4601445010012' },
          { name: 'Shchedroe Leto Margarin 250g', categoryName: 'Oziq-ovqat', unitName: 'dona', purchasePrice: 7000, salePrice: 9000, initialStock: 30, minStock: 8, barcode: '4600605020015' },
          { name: 'Kunfu Qora Choy 100g', categoryName: 'Choy va Kofe', unitName: 'dona', purchasePrice: 14000, salePrice: 18000, initialStock: 30, minStock: 8, barcode: '4780004510012' },
          { name: 'Nescafe Classic 100g Qahva', categoryName: 'Choy va Kofe', unitName: 'dona', purchasePrice: 26000, salePrice: 33000, initialStock: 20, minStock: 5, barcode: '7613035010014' },
        ],
      },
      {
        id: 'cafe_fastfood',
        title: 'Fast-Food & Kafe Menyu (Top 18)',
        description: 'Lavash, burger, pitsa, fri va ichimliklar standart menyu to\'plami',
        category: 'restaurant',
        icon: 'UtensilsCrossed',
        productsCount: 18,
        products: [
          { name: 'Klassik Lavash (Mol go\'shti)', categoryName: 'Lavashlar', unitName: 'dona', purchasePrice: 22000, salePrice: 32000, initialStock: 50, minStock: 10, barcode: '200000000101' },
          { name: 'Mini Lavash (Mol go\'shti)', categoryName: 'Lavashlar', unitName: 'dona', purchasePrice: 18000, salePrice: 26000, initialStock: 50, minStock: 10, barcode: '200000000102' },
          { name: 'Pishloqli Lavash (Sirli)', categoryName: 'Lavashlar', unitName: 'dona', purchasePrice: 25000, salePrice: 36000, initialStock: 40, minStock: 10, barcode: '200000000103' },
          { name: 'Gamburger Klassik', categoryName: 'Burgerlar', unitName: 'dona', purchasePrice: 17000, salePrice: 25000, initialStock: 40, minStock: 10, barcode: '200000000104' },
          { name: 'Chizburger (Pishloqli)', categoryName: 'Burgerlar', unitName: 'dona', purchasePrice: 19000, salePrice: 28000, initialStock: 40, minStock: 10, barcode: '200000000105' },
          { name: 'Double Burger (2 talik kotlet)', categoryName: 'Burgerlar', unitName: 'dona', purchasePrice: 27000, salePrice: 38000, initialStock: 30, minStock: 8, barcode: '200000000106' },
          { name: 'Klassik Hot-Dog', categoryName: 'Hot-Doglar', unitName: 'dona', purchasePrice: 9000, salePrice: 14000, initialStock: 50, minStock: 12, barcode: '200000000107' },
          { name: 'Frantsuzkiy Hot-Dog', categoryName: 'Hot-Doglar', unitName: 'dona', purchasePrice: 12000, salePrice: 18000, initialStock: 40, minStock: 10, barcode: '200000000108' },
          { name: 'Kartoshka Fri 150g', categoryName: 'Gazaklar', unitName: 'por', purchasePrice: 7000, salePrice: 14000, initialStock: 60, minStock: 15, barcode: '200000000109' },
          { name: 'Qishloqcha Kartoshka (Derevenskiy) 150g', categoryName: 'Gazaklar', unitName: 'por', purchasePrice: 8500, salePrice: 16000, initialStock: 40, minStock: 10, barcode: '200000000110' },
          { name: 'Naggetsy 6 dona', categoryName: 'Gazaklar', unitName: 'por', purchasePrice: 11000, salePrice: 18000, initialStock: 35, minStock: 8, barcode: '200000000111' },
          { name: 'Pitsa Peperoni 30sm', categoryName: 'Pitsalar', unitName: 'dona', purchasePrice: 42000, salePrice: 65000, initialStock: 25, minStock: 5, barcode: '200000000112' },
          { name: 'Pitsa Margarita 30sm', categoryName: 'Pitsalar', unitName: 'dona', purchasePrice: 36000, salePrice: 55000, initialStock: 25, minStock: 5, barcode: '200000000113' },
          { name: 'Coca-Cola Razliv 0.4L', categoryName: 'Ichimliklar', unitName: 'dona', purchasePrice: 3000, salePrice: 7000, initialStock: 100, minStock: 20, barcode: '200000000114' },
          { name: 'Choy Qora / Ko\'k (Choynik)', categoryName: 'Issiq Ichimliklar', unitName: 'dona', purchasePrice: 1500, salePrice: 6000, initialStock: 100, minStock: 20, barcode: '200000000115' },
          { name: 'Amerikano Qahvasi', categoryName: 'Issiq Ichimliklar', unitName: 'dona', purchasePrice: 4000, salePrice: 12000, initialStock: 80, minStock: 15, barcode: '200000000116' },
          { name: 'Kapuchino Qahvasi', categoryName: 'Issiq Ichimliklar', unitName: 'dona', purchasePrice: 6000, salePrice: 16000, initialStock: 80, minStock: 15, barcode: '200000000117' },
          { name: 'Pishloqli Sous Heinz 25g', categoryName: 'Souslar', unitName: 'dona', purchasePrice: 2200, salePrice: 4000, initialStock: 120, minStock: 25, barcode: '200000000118' },
        ],
      },
      {
        id: 'clothing_apparel',
        title: 'Kiyim-Kechak & Poyabzal (Top 15)',
        description: 'Erkaklar va ayollar kiyimlari, jinsilar, futbolkalar va aksessuarlar',
        category: 'clothing',
        icon: 'Shirt',
        productsCount: 15,
        products: [
          { name: 'Erkaklar Paxta Futbolkasi (Basic)', categoryName: 'Futbolkalar', unitName: 'dona', purchasePrice: 45000, salePrice: 85000, initialStock: 40, minStock: 8, barcode: '200000000201' },
          { name: 'Ayollar Oversize Futbolkasi', categoryName: 'Futbolkalar', unitName: 'dona', purchasePrice: 50000, salePrice: 95000, initialStock: 35, minStock: 8, barcode: '200000000202' },
          { name: 'Klassik Erkaklar Ko\'ylagi (Oq)', categoryName: 'Ko\'ylaklar', unitName: 'dona', purchasePrice: 90000, salePrice: 165000, initialStock: 25, minStock: 5, barcode: '200000000203' },
          { name: 'Klassik Jinsi Shim Erkaklar (Moviy)', categoryName: 'Shimlar', unitName: 'dona', purchasePrice: 120000, salePrice: 220000, initialStock: 30, minStock: 6, barcode: '200000000204' },
          { name: 'Ayollar Slim-Fit Jinsi Shimi', categoryName: 'Shimlar', unitName: 'dona', purchasePrice: 110000, salePrice: 210000, initialStock: 30, minStock: 6, barcode: '200000000205' },
          { name: 'Erkaklar Sportivka Shimi', categoryName: 'Sport Kiyimlari', unitName: 'dona', purchasePrice: 75000, salePrice: 140000, initialStock: 25, minStock: 5, barcode: '200000000206' },
          { name: 'Erkaklar Krossovkasi (Kundalik)', categoryName: 'Poyabzallar', unitName: 'dona', purchasePrice: 160000, salePrice: 290000, initialStock: 20, minStock: 4, barcode: '200000000207' },
          { name: 'Ayollar Oq Krossovkasi', categoryName: 'Poyabzallar', unitName: 'dona', purchasePrice: 150000, salePrice: 275000, initialStock: 20, minStock: 4, barcode: '200000000208' },
          { name: 'Kapushonkali Xudi (Unisex)', categoryName: 'Issiq Kiyimlar', unitName: 'dona', purchasePrice: 110000, salePrice: 195000, initialStock: 25, minStock: 5, barcode: '200000000209' },
          { name: 'Qishki Kurtka (Erkaklar)', categoryName: 'Ustki Kiyimlar', unitName: 'dona', purchasePrice: 280000, salePrice: 480000, initialStock: 15, minStock: 3, barcode: '200000000210' },
          { name: 'Paxta Paypoq 1-juft (Erkaklar)', categoryName: 'Aksessuarlar', unitName: 'dona', purchasePrice: 4000, salePrice: 8000, initialStock: 100, minStock: 20, barcode: '200000000211' },
          { name: 'Charm Kamar (Klassik)', categoryName: 'Aksessuarlar', unitName: 'dona', purchasePrice: 35000, salePrice: 70000, initialStock: 30, minStock: 5, barcode: '200000000212' },
          { name: 'Kepka / Beysbolka', categoryName: 'Bosh Kiyimlar', unitName: 'dona', purchasePrice: 25000, salePrice: 55000, initialStock: 30, minStock: 6, barcode: '200000000213' },
          { name: 'Erkaklar Ichki Kiyimi (Boxer 100% paxta)', categoryName: 'Ichki Kiyimlar', unitName: 'dona', purchasePrice: 15000, salePrice: 28000, initialStock: 60, minStock: 12, barcode: '200000000214' },
          { name: 'Yozgi Shlyapa / Panamalari', categoryName: 'Bosh Kiyimlar', unitName: 'dona', purchasePrice: 20000, salePrice: 45000, initialStock: 25, minStock: 5, barcode: '200000000215' },
        ],
      },
    ];

    if (type) {
      return templates.filter((t) => t.category === type || t.id.includes(type));
    }
    return templates;
  }
}

