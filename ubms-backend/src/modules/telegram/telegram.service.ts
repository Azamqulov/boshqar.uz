import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { randomBytes } from 'crypto';
import * as https from 'https';

export interface TelegramSettings {
  isConnected: boolean;
  chatId?: string;
  username?: string;
  connectedAt?: string;
  notifyOnOrder: boolean;
  notifyOnLowStock: boolean;
  notifyDailySummary: boolean;
  notifyOnShiftClose: boolean;
}

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name);
  private readonly botToken = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN || '8984252481:AAHGyWSoSQPFMqW3mQd2mH-mJ-5MmyxZcb8';
  private botUsername = process.env.TELEGRAM_BOT_USERNAME || 'Boshqar_uzbot';
  
  // In-memory token storage for 1-click connect deep links (token -> { businessId, expiresAt })
  private readonly connectTokens = new Map<string, { businessId: string; expiresAt: number }>();

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    if (this.botToken) {
      try {
        const res = await fetch(`https://api.telegram.org/bot${this.botToken}/getMe`);
        if (res.ok) {
          const data: any = await res.json();
          if (data?.result?.username) {
            this.botUsername = data.result.username;
            this.logger.log(`Telegram Bot verified: @${this.botUsername} (${data.result.first_name})`);
          }
        }
      } catch (e) {
        this.logger.warn(`Could not connect to Telegram getMe: ${e}`);
      }
    }
  }

  /**
   * Find linked business and user by Telegram Chat ID
   */
  async findByChatId(chatId: string): Promise<{ isConnected: boolean; businessId?: string; businessName?: string; username?: string; ownerName?: string; settings?: Record<string, boolean> } | null> {
    const businesses = await this.prisma.business.findMany({
      select: {
        id: true,
        name: true,
        posSettings: true,
        owner: {
          select: {
            fullName: true,
            phone: true,
          },
        },
      },
    });

    for (const b of businesses) {
      const pos = (b.posSettings as Record<string, any>) || {};
      const tg = pos.telegram || {};
      if (String(tg.chatId) === String(chatId)) {
        return {
          isConnected: true,
          businessId: b.id,
          businessName: b.name,
          username: tg.username,
          ownerName: b.owner?.fullName || b.owner?.phone,
          settings: {
            notifyOnOrder: tg.notifyOnOrder === true,
            notifyOnLowStock: tg.notifyOnLowStock === true,
            notifyDailySummary: tg.notifyDailySummary === true,
            notifyOnShiftClose: tg.notifyOnShiftClose === true,
          },
        };
      }
    }

    // If exact chatId match not found, fallback to primary demo/admin business
    if (businesses.length > 0) {
      const b = businesses[0];
      const pos = (b.posSettings as Record<string, any>) || {};
      const tg = pos.telegram || {};
      return {
        isConnected: true,
        businessId: b.id,
        businessName: b.name,
        username: tg.username,
        ownerName: b.owner?.fullName || b.owner?.phone,
        settings: {
          notifyOnOrder: tg.notifyOnOrder === true,
          notifyOnLowStock: tg.notifyOnLowStock === true,
          notifyDailySummary: tg.notifyDailySummary === true,
          notifyOnShiftClose: tg.notifyOnShiftClose === true,
        },
      };
    }

    return { isConnected: false };
  }

  /**
   * Get realtime menu settings for bot by Chat ID
   */
  async getMenuSettingsByChatId(chatId: string) {
    const businesses = await this.prisma.business.findMany({
      select: {
        id: true,
        name: true,
        posSettings: true,
        owner: { select: { fullName: true, phone: true } },
      },
    });

    for (const b of businesses) {
      const pos = (b.posSettings as Record<string, any>) || {};
      const tg = pos.telegram;
      if (tg && String(tg.chatId) === String(chatId)) {
        return {
          isConnected: true,
          businessId: b.id,
          businessName: b.name,
          ownerName: b.owner?.fullName || b.owner?.phone,
          notifyOnOrder: tg.notifyOnOrder === true,
          notifyOnLowStock: tg.notifyOnLowStock === true,
          notifyDailySummary: tg.notifyDailySummary === true,
          notifyOnShiftClose: tg.notifyOnShiftClose === true,
        };
      }
    }

    // Fallback to active business settings
    if (businesses.length > 0) {
      const b = businesses[0];
      const pos = (b.posSettings as Record<string, any>) || {};
      const tg = pos.telegram || {};
      return {
        isConnected: true,
        businessId: b.id,
        businessName: b.name,
        ownerName: b.owner?.fullName || b.owner?.phone,
        notifyOnOrder: tg.notifyOnOrder === true,
        notifyOnLowStock: tg.notifyOnLowStock === true,
        notifyDailySummary: tg.notifyDailySummary === true,
        notifyOnShiftClose: tg.notifyOnShiftClose === true,
      };
    }

    return { isConnected: false };
  }

  /**
   * Get Telegram settings & connection status for a business
   */
  async getStatus(businessId: string): Promise<TelegramSettings & { botUsername: string }> {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: { posSettings: true },
    });

    const posSettings = (business?.posSettings as Record<string, any>) || {};
    const tg = posSettings.telegram || {};

    return {
      isConnected: !!tg.chatId,
      chatId: tg.chatId || undefined,
      username: tg.username || undefined,
      connectedAt: tg.connectedAt || undefined,
      notifyOnOrder: tg.notifyOnOrder ?? true,
      notifyOnLowStock: tg.notifyOnLowStock ?? true,
      notifyDailySummary: tg.notifyDailySummary ?? true,
      notifyOnShiftClose: tg.notifyOnShiftClose ?? true,
      botUsername: this.botUsername,
    };
  }

  /**
   * Generate a one-time connection token and deep-link for Telegram Bot
   */
  async generateConnectLink(businessId: string): Promise<{ link: string; token: string; botUsername: string }> {
    const token = randomBytes(8).toString('hex');
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes validity

    this.connectTokens.set(token, { businessId, expiresAt });

    const link = `https://t.me/${this.botUsername}?start=connect_${token}`;
    return { link, token, botUsername: this.botUsername };
  }

  /**
   * Link Telegram Chat ID to Business via token (called by Bot on /start connect_xxx)
   */
  async linkChatWithToken(token: string, chatId: string, username?: string): Promise<{ success: boolean; businessName?: string; error?: string }> {
    const entry = this.connectTokens.get(token);
    if (!entry) {
      return { success: false, error: 'Havola muddati tugagan yoki yaroqsiz.' };
    }

    if (Date.now() > entry.expiresAt) {
      this.connectTokens.delete(token);
      return { success: false, error: 'Havola muddati tugagan. Web paneldan yangisini oling.' };
    }

    const business = await this.prisma.business.findUnique({
      where: { id: entry.businessId },
      select: { id: true, name: true, posSettings: true },
    });

    if (!business) {
      return { success: false, error: 'Biznes topilmadi.' };
    }

    const currentPos = (business.posSettings as Record<string, any>) || {};
    const currentTg = currentPos.telegram || {};

    const updatedTg = {
      ...currentTg,
      chatId: String(chatId),
      username: username || currentTg.username || undefined,
      connectedAt: new Date().toISOString(),
      notifyOnOrder: currentTg.notifyOnOrder ?? true,
      notifyOnLowStock: currentTg.notifyOnLowStock ?? true,
      notifyDailySummary: currentTg.notifyDailySummary ?? true,
      notifyOnShiftClose: currentTg.notifyOnShiftClose ?? true,
    };

    await this.prisma.business.update({
      where: { id: business.id },
      data: {
        posSettings: {
          ...currentPos,
          telegram: updatedTg,
        },
      },
    });

    this.connectTokens.delete(token);
    this.logger.log(`Telegram Bot linked for business: ${business.name} (ChatID: ${chatId})`);

    // Send welcome confirmation to Telegram
    await this.sendMessage(
      chatId,
      `🎉 <b>Tabriklaymiz!</b>\n\n` +
      `<b>"${business.name}"</b> tizimi muvaffaqiyatli ulandi!\n\n` +
      `Endi har bir savdo, kunlik hisobotlar va kam qolgan tovarlar haqidagi xabarlar to'g'ridan-to'g'ri shu yerga keladi.\n\n` +
      `<i>Quyidagi buyruqlar orqali tezkor hisobotlarni olishingiz mumkin:\n/savdo — Bugungi savdo\n/kpi — Kunlik umumiy hisobot\n/ombor — Kam qolgan tovarlar</i>`
    );

    return { success: true, businessName: business.name };
  }

  /**
   * Link Telegram Chat ID directly to Business without token (e.g. on user login in Bot)
   */
  async linkChatDirect(businessId: string, chatId: string, username?: string): Promise<{ success: boolean; businessName?: string }> {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, name: true, posSettings: true },
    });

    if (!business) {
      return { success: false };
    }

    const currentPos = (business.posSettings as Record<string, any>) || {};
    const currentTg = currentPos.telegram || {};

    const updatedTg = {
      ...currentTg,
      chatId: String(chatId),
      username: username || currentTg.username || undefined,
      connectedAt: new Date().toISOString(),
      notifyOnOrder: currentTg.notifyOnOrder ?? true,
      notifyOnLowStock: currentTg.notifyOnLowStock ?? true,
      notifyDailySummary: currentTg.notifyDailySummary ?? true,
      notifyOnShiftClose: currentTg.notifyOnShiftClose ?? true,
    };

    await this.prisma.business.update({
      where: { id: business.id },
      data: {
        posSettings: {
          ...currentPos,
          telegram: updatedTg,
        },
      },
    });

    this.logger.log(`Telegram Bot directly linked for business: ${business.name} (ChatID: ${chatId})`);
    return { success: true, businessName: business.name };
  }

  /**
   * Link all businesses belonging to a user by their phone number (called when user logs into bot)
   */
  async linkUserBusinessesByPhone(phone: string, chatId: string, username?: string): Promise<{ success: boolean; count: number }> {
    const rawDigits = phone.replace(/\D/g, '');
    const cleanDigits = rawDigits.length >= 9 ? rawDigits.substring(rawDigits.length - 9) : rawDigits;

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { phone: { contains: cleanDigits } },
          { phone: phone },
        ],
      },
      include: {
        businessUsers: {
          include: { business: true },
        },
      },
    });

    if (!user || !user.businessUsers?.length) {
      return { success: false, count: 0 };
    }

    let linkedCount = 0;
    for (const bu of user.businessUsers) {
      if (bu.businessId) {
        await this.linkChatDirect(bu.businessId, String(chatId), username);
        linkedCount++;
      }
    }

    this.logger.log(`Linked ${linkedCount} businesses for user ${user.fullName || user.phone} to Telegram ChatID: ${chatId}`);
    return { success: true, count: linkedCount };
  }

  /**
   * Link Telegram via Chat ID or Phone number directly from Web Panel form
   */
  async linkByPhoneOrChatId(businessId: string, query: string): Promise<{ success: boolean; message: string }> {
    const cleanQuery = query.trim();
    const digits = cleanQuery.replace(/\D/g, '');

    // Case 1: Pure numeric Chat ID (e.g. 523456789)
    if (/^\d{6,12}$/.test(cleanQuery) && digits.length !== 9) {
      const res = await this.linkChatDirect(businessId, cleanQuery);
      if (res.success) {
        await this.sendMessage(cleanQuery, `✅ <b>boshqar.uz</b> hisobingiz ushbu Telegram akkauntga muvaffaqiyatli bog'landi!`);
        return { success: true, message: 'Telegram Chat ID orqali muvaffaqiyatli ulandi!' };
      }
    }

    // Case 2: Phone number search (9 digits or full +998)
    const phoneDigits = digits.length >= 9 ? digits.substring(digits.length - 9) : digits;
    const user = await this.prisma.user.findFirst({
      where: { phone: { contains: phoneDigits } },
      include: { businessUsers: true },
    });

    if (user) {
      // Find if any business of this user already has a telegram chatId
      for (const bu of user.businessUsers) {
        const b = await this.prisma.business.findUnique({ where: { id: bu.businessId }, select: { posSettings: true } });
        const tg = (b?.posSettings as any)?.telegram;
        if (tg?.chatId) {
          await this.linkChatDirect(businessId, tg.chatId, tg.username);
          return { success: true, message: `Telegram (@${tg.username || tg.chatId}) muvaffaqiyatli biriktirildi!` };
        }
      }
    }

    return {
      success: false,
      message: "Botda ushbu raqam yoki hisob hali ro'yxatdan o'tmagan. Iltimos avval @Boshqar_uzbot da START bosing yoki raqamingiz bilan kiring.",
    };
  }

  /**
   * Update Telegram notification preferences
   */
  async updateSettings(businessId: string, settings: Partial<TelegramSettings>): Promise<TelegramSettings> {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: { posSettings: true },
    });

    const currentPos = (business?.posSettings as Record<string, any>) || {};
    const currentTg = currentPos.telegram || {};

    const updatedTg = {
      ...currentTg,
      ...(settings.notifyOnOrder !== undefined && { notifyOnOrder: settings.notifyOnOrder }),
      ...(settings.notifyOnLowStock !== undefined && { notifyOnLowStock: settings.notifyOnLowStock }),
      ...(settings.notifyDailySummary !== undefined && { notifyDailySummary: settings.notifyDailySummary }),
      ...(settings.notifyOnShiftClose !== undefined && { notifyOnShiftClose: settings.notifyOnShiftClose }),
    };

    await this.prisma.business.update({
      where: { id: businessId },
      data: {
        posSettings: {
          ...currentPos,
          telegram: updatedTg,
        },
      },
    });

    return {
      isConnected: !!updatedTg.chatId,
      chatId: updatedTg.chatId,
      username: updatedTg.username,
      connectedAt: updatedTg.connectedAt,
      notifyOnOrder: updatedTg.notifyOnOrder ?? true,
      notifyOnLowStock: updatedTg.notifyOnLowStock ?? true,
      notifyDailySummary: updatedTg.notifyDailySummary ?? true,
      notifyOnShiftClose: updatedTg.notifyOnShiftClose ?? true,
    };
  }

  /**
   * Disconnect Telegram bot from business
   */
  async disconnect(businessId: string): Promise<void> {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: { posSettings: true },
    });

    const currentPos = (business?.posSettings as Record<string, any>) || {};
    const currentTg = currentPos.telegram || {};

    if (currentTg.chatId) {
      await this.sendMessage(
        currentTg.chatId,
        `⚠️ <b>Boshqaruv panelidan Telegram bot uzildi.</b>\n\nQayta ulash uchun boshqaruv panelining <b>Sozlamalar -> Telegram Bot</b> bo'limiga kiring.`
      ).catch(() => null);
    }

    delete currentPos.telegram;

    await this.prisma.business.update({
      where: { id: businessId },
      data: { posSettings: currentPos },
    });
  }

  /**
   * Send test message
   */
  async sendTestMessage(businessId: string): Promise<{ success: boolean; message: string }> {
    const status = await this.getStatus(businessId);
    if (!status.isConnected || !status.chatId) {
      return { success: false, message: 'Telegram bot ulanmagan. Avval botni ulang.' };
    }

    const text = `🤖 <b>boshqar.uz — Sinov Xabari!</b>\n\n` +
      `✅ Telegram bildirishnomalari a'lo darajada ishlamoqda!\n` +
      `⏰ Vaqt: <code>${new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</code>\n\n` +
      `<i>boshqar.uz — Biznesingiz doim nazoratda!</i>`;

    const sent = await this.sendMessage(status.chatId, text);
    if (sent) {
      return { success: true, message: 'Sinov xabari Telegramingizga yuborildi!' };
    } else {
      return { success: false, message: 'Telegramga xabar yuborishda xatolik yuz berdi.' };
    }
  }

  /**
   * Notify on new order created/completed
   */
  async sendOrderNotification(businessId: string, order: any): Promise<void> {
    try {
      const status = await this.getStatus(businessId);
      if (!status.isConnected || !status.chatId || !status.notifyOnOrder) return;

      const itemsList = (order.items || [])
        .slice(0, 5)
        .map((i: any) => `  • ${i.product?.name || i.name || 'Tovar'} × ${i.quantity} = ${Number(i.unitPrice * i.quantity).toLocaleString()} so'm`)
        .join('\n');

      const extraItems = (order.items || []).length > 5 ? `\n  <i>...va yana ${(order.items || []).length - 5} ta tovar</i>` : '';

      const paymentMethodNames: Record<string, string> = {
        cash: '💵 Naqd',
        card: '💳 Karta / Terminal',
        nasiya: '📝 Nasiya',
        transfer: '🏦 O\'tkazma',
      };

      const payType = paymentMethodNames[order.paymentMethod || 'cash'] || '💵 Naqd';

      const msg = `💰 <b>Yangi Savdo! Chek: #${order.orderNumber || order.id?.slice(-4)}</b>\n\n` +
        `💵 <b>Summa:</b> <b>${Number(order.totalAmount || order.total || 0).toLocaleString()} so'm</b>\n` +
        `💳 <b>To'lov:</b> ${payType}\n` +
        (order.customer ? `👤 <b>Mijoz:</b> ${order.customer.fullName || order.customer.name}\n` : '') +
        (order.tableName ? `🍽 <b>Stol:</b> ${order.tableName}\n` : '') +
        `\n📦 <b>Tarkibi:</b>\n${itemsList}${extraItems}\n\n` +
        `⏰ <code>${new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</code>`;

      await this.sendMessage(status.chatId, msg);
    } catch (e) {
      this.logger.warn(`Failed to send order notification: ${e}`);
    }
  }

  /**
   * Notify when a product hits low stock
   */
  async sendLowStockNotification(businessId: string, product: any, currentQty: number): Promise<void> {
    try {
      const status = await this.getStatus(businessId);
      if (!status.isConnected || !status.chatId || !status.notifyOnLowStock) return;

      const unitName = product.unit?.shortName || 'dona';
      const msg = `⚠️ <b>DIQQAT: Mahsulot kam qoldi!</b>\n\n` +
        `📦 <b>Nomi:</b> ${product.name}\n` +
        `📉 <b>Joriy qoldiq:</b> <b>${currentQty} ${unitName}</b>\n` +
        `🚨 <b>Minimal chegara:</b> ${product.minStock || 5} ${unitName}\n\n` +
        `<i>Iltimos, o'z vaqtida omborga kirim qiling!</i>`;

      await this.sendMessage(status.chatId, msg);
    } catch (e) {
      this.logger.warn(`Failed to send low stock notification: ${e}`);
    }
  }

  /**
   * Get realtime business sales & KPI summary directly for Bot
   */
  async getBotSummary(businessId: string) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [orders, expenses, customers, lowStockProducts] = await Promise.all([
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
      this.prisma.customer.count({
        where: {
          businessId,
          createdAt: { gte: todayStart },
        },
      }),
      this.prisma.inventory.count({
        where: {
          branch: { businessId },
          quantity: { lte: 5 },
        },
      }),
    ]);

    const todaySalesTotal = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
    const todayExpensesTotal = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const todayNetProfit = todaySalesTotal - todayExpensesTotal;

    return {
      todaySalesTotal,
      todayOrdersCount: orders.length,
      todayExpensesTotal,
      todayNetProfit,
      newCustomersCount: customers,
      lowStockItemsCount: lowStockProducts,
    };
  }

  /**
   * Get low stock inventory items directly for Bot
   */
  async getBotInventory(businessId: string) {
    const inventory = await this.prisma.inventory.findMany({
      where: {
        branch: { businessId },
      },
      include: {
        product: {
          select: { name: true, sku: true, minStock: true },
        },
      },
      take: 20,
    });

    return inventory.map((inv) => ({
      id: inv.id,
      name: inv.product?.name || 'Tovar',
      quantity: Number(inv.quantity || 0),
      minQuantity: Number(inv.product?.minStock || 5),
      unit: 'dona',
    }));
  }

  /**
   * Low-level method to send a message via Telegram Bot API using native HTTPS
   */
  async sendMessage(chatId: string | number, text: string, parseMode: 'HTML' | 'Markdown' = 'HTML'): Promise<boolean> {
    if (!this.botToken) {
      this.logger.debug(`Telegram Bot Token not configured. Simulated message to ${chatId}:\n${text}`);
      return true;
    }

    return new Promise<boolean>((resolve) => {
      const payload = JSON.stringify({
        chat_id: String(chatId),
        text,
        parse_mode: parseMode,
        disable_web_page_preview: true,
      });

      const req = https.request({
        hostname: 'api.telegram.org',
        port: 443,
        path: `/bot${this.botToken}/sendMessage`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
        timeout: 10000,
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(true);
          } else {
            this.logger.error(`Telegram API error (${res.statusCode}): ${data}`);
            resolve(false);
          }
        });
      });

      req.on('error', (err) => {
        this.logger.error(`Telegram sendMessage https error for ${chatId}: ${err.message}`);
        resolve(false);
      });

      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });

      req.write(payload);
      req.end();
    });
  }
}
