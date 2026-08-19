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

    // 1. Check if user is asking for real live business metrics / stats
    const metricsAnswer = this.handleBusinessMetricsQuery(normalized, businessContext);
    if (metricsAnswer) {
      return metricsAnswer;
    }

    // 2. Check if user is asking system usage / how-to / troubleshooting questions
    const systemHowToAnswer = this.handleSystemHowToQuery(normalized, businessContext);
    if (systemHowToAnswer) {
      return systemHowToAnswer;
    }

    // 3. Conversational / greetings / general guidance
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
}
