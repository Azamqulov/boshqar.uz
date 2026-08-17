import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { randomBytes } from 'crypto';
import * as https from 'https';
import {
  TelegramAccount,
  TelegramSettings,
  TelegramOrderNotification,
  TelegramLowStockProduct,
  TelegramShiftCloseData,
  TelegramDailyDispatchResult,
  TelegramDailyDispatchDetail,
  formatTelegramMoney as formatMoney,
} from './telegram.types';

export { TelegramAccount, TelegramSettings };

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name);
  private readonly botToken = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN || '8984252481:AAHGyWSoSQPFMqW3mQd2mH-mJ-5MmyxZcb8';
  private botUsername = process.env.TELEGRAM_BOT_USERNAME || 'Boshqar_uzbot';
  private readonly httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 50 });
  
  // In-memory token storage for 1-click connect deep links (token -> { businessId, expiresAt })
  private readonly connectTokens = new Map<string, { businessId: string; expiresAt: number }>();

  constructor(private prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    if (this.botToken) {
      try {
        const res = await fetch(`https://api.telegram.org/bot${this.botToken}/getMe`, {
          signal: AbortSignal.timeout(3000),
        });
        if (res.ok) {
          const data = (await res.json()) as { ok: boolean; result?: { username?: string; first_name?: string } };
          if (data?.result?.username) {
            this.botUsername = data.result.username;
            this.logger.log(`Telegram Bot verified: @${this.botUsername} (${data.result.first_name})`);
          }
        }
      } catch (e) {
        this.logger.warn(`Could not connect to Telegram getMe (timeout or network): ${e}`);
      }
    }
  }

  /**
   * Helper to parse and standardize all linked accounts from posSettings
   */
  private getBusinessAccounts(posSettings: Record<string, unknown> | null | undefined): TelegramAccount[] {
    const tg = ((posSettings as Record<string, unknown>)?.telegram as Record<string, any>) || {};
    const accounts: TelegramAccount[] = [];
    const seenChatIds = new Set<string>();

    if (Array.isArray(tg.accounts)) {
      for (const acc of tg.accounts) {
        if (acc?.chatId && !seenChatIds.has(String(acc.chatId))) {
          seenChatIds.add(String(acc.chatId));
          accounts.push({
            chatId: String(acc.chatId),
            userId: acc.userId || undefined,
            role: acc.role || undefined,
            roleLabel: acc.roleLabel || undefined,
            username: acc.username || undefined,
            firstName: acc.firstName || undefined,
            phone: acc.phone || undefined,
            connectedAt: acc.connectedAt || tg.connectedAt || new Date().toISOString(),
          });
        }
      }
    }

    if (tg.chatId && !seenChatIds.has(String(tg.chatId))) {
      seenChatIds.add(String(tg.chatId));
      accounts.push({
        chatId: String(tg.chatId),
        userId: tg.userId || undefined,
        role: tg.role || undefined,
        roleLabel: tg.roleLabel || undefined,
        username: tg.username || undefined,
        firstName: tg.firstName || undefined,
        phone: tg.phone || undefined,
        connectedAt: tg.connectedAt || new Date().toISOString(),
      });
    }

    return accounts;
  }

  /**
   * Find linked business and user by Telegram Chat ID (checks all linked accounts)
   */
  async findByChatId(chatId: string): Promise<{ isConnected: boolean; businessId?: string; businessName?: string; username?: string; ownerName?: string; currency?: string; role?: string; roleLabel?: string; userId?: string; settings?: Record<string, boolean> } | null> {
    const businesses = await this.prisma.business.findMany({
      select: {
        id: true,
        name: true,
        currency: true,
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
      const accounts = this.getBusinessAccounts(pos);
      const matched = accounts.find(a => String(a.chatId) === String(chatId));

      if (matched || String(tg.chatId) === String(chatId)) {
        return {
          isConnected: true,
          businessId: b.id,
          businessName: b.name,
          username: matched?.username || tg.username,
          ownerName: matched?.firstName || b.owner?.fullName || b.owner?.phone,
          currency: b.currency || 'UZS',
          role: matched?.role || 'owner',
          roleLabel: matched?.roleLabel || (matched?.role === 'cashier' ? 'Kassir' : "Do'kon Egasi"),
          userId: matched?.userId,
          settings: {
            notifyOnOrder: tg.notifyOnOrder === true,
            notifyOnLowStock: tg.notifyOnLowStock === true,
            notifyDailySummary: tg.notifyDailySummary === true,
            notifyOnShiftClose: tg.notifyOnShiftClose === true,
          },
        };
      }
    }

    return { isConnected: false };
  }

  /**
   * Get realtime menu settings for bot by Chat ID (includes role & employee identity)
   */
  async getMenuSettingsByChatId(chatId: string) {
    const businesses = await this.prisma.business.findMany({
      select: {
        id: true,
        name: true,
        currency: true,
        posSettings: true,
        owner: { select: { fullName: true, phone: true } },
      },
    });

    for (const b of businesses) {
      const pos = (b.posSettings as Record<string, any>) || {};
      const tg = pos.telegram;
      if (!tg) continue;

      const accounts = this.getBusinessAccounts(pos);
      const matched = accounts.find(a => String(a.chatId) === String(chatId));

      if (matched || String(tg.chatId) === String(chatId)) {
        const role = matched?.role || 'owner';
        const roleLabel = matched?.roleLabel || (role === 'cashier' ? 'Kassir' : role === 'manager' ? 'Menejer' : role === 'stockman' ? 'Omborchi' : "Do'kon Egasi (Admin)");

        return {
          isConnected: true,
          businessId: b.id,
          businessName: b.name,
          ownerName: matched?.firstName || b.owner?.fullName || b.owner?.phone,
          ownerPhone: matched?.phone || b.owner?.phone,
          currency: b.currency || 'UZS',
          role,
          roleLabel,
          userId: matched?.userId,
          notifyOnOrder: tg.notifyOnOrder !== false,
          notifyOnLowStock: tg.notifyOnLowStock !== false,
          notifyDailySummary: tg.notifyDailySummary !== false,
          dailySummaryTime: tg.dailySummaryTime || '21:00',
          notifyOnShiftClose: tg.notifyOnShiftClose !== false,
          allowDebtsInBot: tg.allowDebtsInBot !== false,
          allowExpenseInBot: tg.allowExpenseInBot !== false,
          allowProductSearch: tg.allowProductSearch !== false,
          allowCashierControl: tg.allowCashierControl !== false,
        };
      }
    }

    return { isConnected: false };
  }

  /**
   * Get Telegram settings & connection status for a business
   */
  async getStatus(businessId: string): Promise<TelegramSettings & { botUsername: string }> {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: { posSettings: true, currency: true },
    });

    const posSettings = (business?.posSettings as Record<string, any>) || {};
    const tg = posSettings.telegram || {};
    const accounts = this.getBusinessAccounts(posSettings);
    const isConnected = accounts.length > 0 || !!tg.chatId;

    return {
      isConnected,
      chatId: accounts[0]?.chatId || tg.chatId || undefined,
      username: accounts[0]?.username || tg.username || undefined,
      connectedAt: accounts[0]?.connectedAt || tg.connectedAt || undefined,
      accounts,
      accountsCount: accounts.length,
      notifyOnOrder: tg.notifyOnOrder ?? true,
      notifyOnLowStock: tg.notifyOnLowStock ?? true,
      notifyDailySummary: tg.notifyDailySummary ?? true,
      dailySummaryTime: tg.dailySummaryTime || '21:00',
      notifyOnShiftClose: tg.notifyOnShiftClose ?? true,
      allowDebtsInBot: tg.allowDebtsInBot ?? true,
      allowExpenseInBot: tg.allowExpenseInBot ?? true,
      allowProductSearch: tg.allowProductSearch ?? true,
      allowCashierControl: tg.allowCashierControl ?? true,
      botUsername: this.botUsername,
      currency: business?.currency || 'UZS',
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
  async linkChatWithToken(token: string, chatId: string, username?: string, firstName?: string): Promise<{ success: boolean; businessName?: string; error?: string }> {
    const entry = this.connectTokens.get(token);
    if (!entry) {
      return { success: false, error: 'Havola muddati tugagan yoki yaroqsiz.' };
    }

    if (Date.now() > entry.expiresAt) {
      this.connectTokens.delete(token);
      return { success: false, error: 'Havola muddati tugagan. Web paneldan yangisini oling.' };
    }

    const res = await this.linkChatDirect(entry.businessId, chatId, username, firstName);
    this.connectTokens.delete(token);

    if (res.success) {
      // Send welcome confirmation to Telegram
      await this.sendMessage(
        chatId,
        `🎉 <b>Tabriklaymiz!</b>\n\n` +
        `<b>"${res.businessName || 'Biznesingiz'}"</b> tizimi ushbu akkauntingizga muvaffaqiyatli ulandi!\n\n` +
        `Endi har bir savdo, kunlik hisobotlar va kam qolgan tovarlar haqidagi xabarlar to'g'ridan-to'g'ri shu yerga keladi.\n\n` +
        `<i>Quyidagi buyruqlar orqali tezkor hisobotlarni olishingiz mumkin:\n/savdo — Bugungi savdo\n/hisobot — Kunlik umumiy hisobot\n/ombor — Kam qolgan tovarlar</i>`
      );
    }

    return res;
  }

  /**
   * Link Telegram Chat ID directly to Business (adds to accounts array without replacing others)
   */
  async linkChatDirect(businessId: string, chatId: string, username?: string, firstName?: string, role?: string, roleLabel?: string, userId?: string, phone?: string): Promise<{ success: boolean; businessName?: string }> {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, name: true, ownerId: true, posSettings: true },
    });

    if (!business) {
      return { success: false };
    }

    // Auto-detect role if not provided
    let finalRole = role || 'owner';
    let finalRoleLabel = roleLabel || (finalRole === 'cashier' ? 'Kassir' : "Do'kon Egasi (Admin)");

    if (userId) {
      if (business.ownerId === userId) {
        finalRole = 'owner';
        finalRoleLabel = "Do'kon Egasi (Admin)";
      } else {
        const [emp, bu] = await Promise.all([
          this.prisma.employee.findFirst({ where: { businessId, userId }, select: { position: true } }),
          this.prisma.businessUser.findFirst({ where: { businessId, userId }, include: { role: true } }),
        ]);

        if (emp) {
          const pos = (emp.position || '').toLowerCase();
          if (pos.includes('kassir')) {
            finalRole = 'cashier';
            finalRoleLabel = emp.position || 'Kassir';
          } else if (pos.includes('ombor')) {
            finalRole = 'stockman';
            finalRoleLabel = emp.position || 'Omborchi';
          } else {
            finalRole = 'employee';
            finalRoleLabel = emp.position || 'Xodim';
          }
        } else if (bu) {
          finalRole = bu.role?.name?.toLowerCase() || 'manager';
          finalRoleLabel = bu.role?.name || 'Menejer';
        }
      }
    }

    const currentPos = (business.posSettings as Record<string, any>) || {};
    const currentTg = currentPos.telegram || {};
    const currentAccounts = this.getBusinessAccounts(currentPos);

    const existingIdx = currentAccounts.findIndex(a => String(a.chatId) === String(chatId));
    if (existingIdx >= 0) {
      currentAccounts[existingIdx].username = username || currentAccounts[existingIdx].username;
      currentAccounts[existingIdx].firstName = firstName || currentAccounts[existingIdx].firstName;
      currentAccounts[existingIdx].role = finalRole;
      currentAccounts[existingIdx].roleLabel = finalRoleLabel;
      currentAccounts[existingIdx].userId = userId || currentAccounts[existingIdx].userId;
      currentAccounts[existingIdx].phone = phone || currentAccounts[existingIdx].phone;
    } else {
      currentAccounts.push({
        chatId: String(chatId),
        userId: userId || undefined,
        role: finalRole,
        roleLabel: finalRoleLabel,
        username: username || undefined,
        firstName: firstName || undefined,
        phone: phone || undefined,
        connectedAt: new Date().toISOString(),
      });
    }

    const updatedTg = {
      ...currentTg,
      chatId: String(chatId),
      username: username || currentTg.username || undefined,
      connectedAt: currentTg.connectedAt || new Date().toISOString(),
      accounts: currentAccounts,
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

    this.logger.log(`Telegram Bot linked for business: ${business.name} (ChatID: ${chatId}, Role: ${finalRole}, Total accounts: ${currentAccounts.length})`);
    return { success: true, businessName: business.name };
  }

  /**
   * Link all businesses belonging to a user by their phone number (called when user logs into bot)
   */
  async linkUserBusinessesByPhone(phone: string, chatId: string, username?: string, firstName?: string): Promise<{ success: boolean; count: number }> {
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
          include: { business: true, role: true },
        },
      },
    });

    if (!user || !user.businessUsers?.length) {
      return { success: false, count: 0 };
    }

    let linkedCount = 0;
    for (const bu of user.businessUsers) {
      if (bu.businessId) {
        await this.linkChatDirect(
          bu.businessId,
          String(chatId),
          username,
          firstName || user.fullName,
          bu.role?.name?.toLowerCase(),
          bu.role?.name,
          user.id,
          user.phone
        );
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
        return { success: true, message: 'Telegram Chat ID orqali yangi hisob muvaffaqiyatli ulandi!' };
      }
    }

    // Case 2: Phone number search (9 digits or full +998)
    const phoneDigits = digits.length >= 9 ? digits.substring(digits.length - 9) : digits;
    const user = await this.prisma.user.findFirst({
      where: { phone: { contains: phoneDigits } },
      include: { businessUsers: { include: { role: true } } },
    });

    if (user) {
      for (const bu of user.businessUsers) {
        const b = await this.prisma.business.findUnique({ where: { id: bu.businessId }, select: { posSettings: true } });
        const tg = (b?.posSettings as any)?.telegram;
        if (tg?.chatId) {
          await this.linkChatDirect(
            businessId,
            tg.chatId,
            tg.username,
            user.fullName,
            bu.role?.name?.toLowerCase(),
            bu.role?.name,
            user.id,
            user.phone
          );
          return { success: true, message: `Telegram (@${tg.username || tg.chatId}) hisobi biriktirildi!` };
        }
      }
    }

    return {
      success: false,
      message: "Botda ushbu raqam yoki hisob hali ro'yxatdan o'tmagan. Iltimos avval @Boshqar_uzbot da START bosing yoki raqamingiz bilan kiring.",
    };
  }

  /**
   * Disconnect a specific Telegram account from business
   */
  async disconnectAccount(businessId: string, chatId: string): Promise<TelegramSettings & { botUsername: string }> {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, posSettings: true },
    });

    if (!business) {
      throw new Error('Biznes topilmadi');
    }

    const currentPos = (business.posSettings as Record<string, any>) || {};
    const currentTg = currentPos.telegram || {};
    let accounts = this.getBusinessAccounts(currentPos);

    accounts = accounts.filter(a => String(a.chatId) !== String(chatId));

    await this.sendMessage(
      chatId,
      `⚠️ <b>Ushbu Telegram akkauntingiz biznes boshqaruv panelidan uzildi.</b>`
    ).catch(() => null);

    if (accounts.length === 0) {
      delete currentPos.telegram;
    } else {
      currentPos.telegram = {
        ...currentTg,
        chatId: accounts[0].chatId,
        username: accounts[0].username,
        connectedAt: accounts[0].connectedAt,
        accounts,
      };
    }

    await this.prisma.business.update({
      where: { id: businessId },
      data: { posSettings: currentPos },
    });

    return this.getStatus(businessId);
  }

  /**
   * Update Telegram notification preferences
   */
  async updateSettings(businessId: string, settings: Partial<TelegramSettings>): Promise<TelegramSettings> {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: { posSettings: true, currency: true },
    });

    const currentPos = (business?.posSettings as Record<string, any>) || {};
    const currentTg = currentPos.telegram || {};

    const updatedTg = {
      ...currentTg,
      ...(settings.notifyOnOrder !== undefined && { notifyOnOrder: settings.notifyOnOrder }),
      ...(settings.notifyOnLowStock !== undefined && { notifyOnLowStock: settings.notifyOnLowStock }),
      ...(settings.notifyDailySummary !== undefined && { notifyDailySummary: settings.notifyDailySummary }),
      ...(settings.dailySummaryTime !== undefined && { dailySummaryTime: settings.dailySummaryTime }),
      ...(settings.notifyOnShiftClose !== undefined && { notifyOnShiftClose: settings.notifyOnShiftClose }),
      ...(settings.allowDebtsInBot !== undefined && { allowDebtsInBot: settings.allowDebtsInBot }),
      ...(settings.allowExpenseInBot !== undefined && { allowExpenseInBot: settings.allowExpenseInBot }),
      ...(settings.allowProductSearch !== undefined && { allowProductSearch: settings.allowProductSearch }),
      ...(settings.allowCashierControl !== undefined && { allowCashierControl: settings.allowCashierControl }),
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

    const accounts = this.getBusinessAccounts({ telegram: updatedTg });

    return {
      isConnected: accounts.length > 0,
      chatId: accounts[0]?.chatId || updatedTg.chatId,
      username: accounts[0]?.username || updatedTg.username,
      connectedAt: accounts[0]?.connectedAt || updatedTg.connectedAt,
      accounts,
      accountsCount: accounts.length,
      notifyOnOrder: updatedTg.notifyOnOrder ?? true,
      notifyOnLowStock: updatedTg.notifyOnLowStock ?? true,
      notifyDailySummary: updatedTg.notifyDailySummary ?? true,
      dailySummaryTime: updatedTg.dailySummaryTime || '21:00',
      notifyOnShiftClose: updatedTg.notifyOnShiftClose ?? true,
      allowDebtsInBot: updatedTg.allowDebtsInBot ?? true,
      allowExpenseInBot: updatedTg.allowExpenseInBot ?? true,
      allowProductSearch: updatedTg.allowProductSearch ?? true,
      allowCashierControl: updatedTg.allowCashierControl ?? true,
      currency: business?.currency || 'UZS',
    };
  }

  /**
   * Disconnect all Telegram accounts from business
   */
  async disconnect(businessId: string): Promise<void> {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: { posSettings: true },
    });

    const currentPos = (business?.posSettings as Record<string, any>) || {};
    const accounts = this.getBusinessAccounts(currentPos);

    for (const acc of accounts) {
      await this.sendMessage(
        acc.chatId,
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
   * Send test message to all linked Telegram accounts
   */
  async sendTestMessage(businessId: string): Promise<{ success: boolean; message: string }> {
    const status = await this.getStatus(businessId);
    if (!status.isConnected) {
      return { success: false, message: 'Telegram bot ulanmagan. Avval botni ulang.' };
    }

    const accounts = status.accounts || [];
    const chatIds = Array.from(new Set([
      ...accounts.map(a => a.chatId),
      ...(status.chatId ? [status.chatId] : []),
    ]));

    if (chatIds.length === 0) {
      return { success: false, message: 'Telegram bot ulanmagan.' };
    }

    const text = `🤖 <b>boshqar.uz — Sinov Xabari!</b>\n\n` +
      `✅ Telegram bildirishnomalari a'lo darajada ishlamoqda!\n` +
      `👥 Ulangan akkauntlar soni: <b>${chatIds.length} ta</b>\n` +
      `⏰ Vaqt: <code>${new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</code>\n\n` +
      `<i>boshqar.uz — Biznesingiz doim nazoratda!</i>`;

    const results = await Promise.allSettled(chatIds.map(cid => this.sendMessage(cid, text)));
    const sentCount = results.filter(r => r.status === 'fulfilled' && (r as any).value === true).length;

    if (sentCount > 0) {
      return { success: true, message: `Sinov xabari ${chatIds.length} ta ulangan Telegram akkauntga yuborildi!` };
    } else {
      return { success: false, message: 'Telegramga xabar yuborishda xatolik yuz berdi.' };
    }
  }

  /**
   * Notify on new order created/completed (broadcast to all linked accounts)
   */
  async sendOrderNotification(businessId: string, order: TelegramOrderNotification): Promise<void> {
    try {
      const status = await this.getStatus(businessId);
      if (!status.isConnected || !status.notifyOnOrder) return;

      const accounts = status.accounts || [];
      const chatIds = Array.from(new Set([
        ...accounts.map(a => a.chatId),
        ...(status.chatId ? [status.chatId] : []),
      ]));

      if (chatIds.length === 0) return;

      const cur = status.currency || 'UZS';

      const itemsList = (order.items || [])
        .slice(0, 5)
        .map((i) => `  • ${i.product?.name || i.name || 'Tovar'} × ${i.quantity} = ${formatMoney(Number(i.unitPrice * i.quantity), cur)}`)
        .join('\n');

      const extraItems = (order.items || []).length > 5 ? `\n  <i>...va yana ${(order.items || []).length - 5} ta tovar</i>` : '';

      const paymentMethodNames: Record<string, string> = {
        cash: '💵 Naqd',
        card: '💳 Karta / Terminal',
        nasiya: '📝 Nasiya',
        transfer: '🏦 O\'tkazma',
      };

      const payType = paymentMethodNames[(order as any).paymentMethod || 'cash'] || '💵 Naqd';

      const msg = `💰 <b>Yangi Savdo! Chek: #${order.orderNumber || order.id?.slice(-4)}</b>\n\n` +
        `💵 <b>Summa:</b> <b>${formatMoney(Number((order as any).totalAmount || order.total || 0), cur)}</b>\n` +
        `💳 <b>To'lov:</b> ${payType}\n` +
        (order.customer ? `👤 <b>Mijoz:</b> ${order.customer.fullName || (order.customer as any).name}\n` : '') +
        ((order as any).tableName ? `🍽 <b>Stol:</b> ${(order as any).tableName}\n` : '') +
        `\n📦 <b>Tarkibi:</b>\n${itemsList}${extraItems}\n\n` +
        `⏰ <code>${new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</code>`;

      await Promise.allSettled(chatIds.map(cid => this.sendMessage(cid, msg)));
    } catch (e) {
      this.logger.warn(`Failed to send order notification: ${e}`);
    }
  }

  /**
   * Notify when a product hits low stock (broadcast to all linked accounts)
   */
  async sendLowStockNotification(businessId: string, product: TelegramLowStockProduct, currentQty: number): Promise<void> {
    try {
      const status = await this.getStatus(businessId);
      if (!status.isConnected || !status.notifyOnLowStock) return;

      const accounts = status.accounts || [];
      const chatIds = Array.from(new Set([
        ...accounts.map(a => a.chatId),
        ...(status.chatId ? [status.chatId] : []),
      ]));

      if (chatIds.length === 0) return;

      const unitName = (product as any).unit?.shortName || 'dona';
      const msg = `⚠️ <b>DIQQAT: Mahsulot kam qoldi!</b>\n\n` +
        `📦 <b>Nomi:</b> ${product.name}\n` +
        `📉 <b>Joriy qoldiq:</b> <b>${currentQty} ${unitName}</b>\n` +
        `🚨 <b>Minimal chegara:</b> ${product.minStock || 5} ${unitName}\n\n` +
        `<i>Iltimos, o'z vaqtida omborga kirim qiling!</i>`;

      await Promise.allSettled(chatIds.map(cid => this.sendMessage(cid, msg)));
    } catch (e) {
      this.logger.warn(`Failed to send low stock notification: ${e}`);
    }
  }

  /**
   * Notify when a cashier / manager closes a POS shift (broadcast to all linked accounts)
   */
  async sendShiftCloseNotification(businessId: string, shift: TelegramShiftCloseData): Promise<void> {
    try {
      const status = await this.getStatus(businessId);
      if (!status.isConnected || !status.notifyOnShiftClose) return;

      const accounts = status.accounts || [];
      const chatIds = Array.from(new Set([
        ...accounts.map(a => a.chatId),
        ...(status.chatId ? [status.chatId] : []),
      ]));

      if (chatIds.length === 0) return;

      const cur = status.currency || 'UZS';
      const cashierName = shift.user?.fullName || (shift.user as any)?.phone || 'Kassir';
      const branchName = (shift as any).branch?.name || 'Asosiy filial';
      const openTime = shift.openedAt ? new Date(shift.openedAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) : '--:--';
      const closeTime = shift.closedAt ? new Date(shift.closedAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
      
      const diff = Number(shift.difference || 0);
      const diffText = diff === 0 
        ? '✅ To\'liq mos (Kamomad yo\'q)' 
        : diff > 0 
          ? `🟢 Ortiqcha: +${formatMoney(diff, cur)}` 
          : `🔴 Kamomad: ${formatMoney(diff, cur)}`;

      const msg = `🔒 <b>Kassa Smenasi Yopildi (X-Z Hisoboti)</b>\n\n` +
        `🏢 <b>Filial:</b> ${branchName}\n` +
        `👤 <b>Kassir:</b> ${cashierName}\n` +
        `⏱ <b>Smena:</b> ${openTime} — ${closeTime}\n\n` +
        `💰 <b>Jami Savdo:</b> <b>${formatMoney(Number(shift.totalSales || 0), cur)}</b>\n` +
        `🧾 <b>Cheklar soni:</b> ${(shift as any).ordersCount || 0} ta\n` +
        `💵 <b>Naqd savdo:</b> ${formatMoney(Number(shift.cashSales || 0), cur)}\n` +
        `💳 <b>Karta / Terminal:</b> ${formatMoney(Number(shift.cardSales || 0), cur)}\n` +
        `💸 <b>Kassadan chiqim:</b> ${formatMoney(Number(shift.cashExpenses || 0), cur)}\n` +
        `🪙 <b>Haqiqiy naqd qoldiq:</b> ${formatMoney(Number(shift.actualCash || 0), cur)}\n` +
        `⚖️ <b>Kassa farqi:</b> ${diffText}\n` +
        ((shift as any).notes ? `\n📝 <b>Izoh:</b> <i>${(shift as any).notes}</i>\n` : '') +
        `\n⏰ <code>${new Date().toLocaleDateString('uz-UZ')} ${closeTime}</code>`;

      await Promise.allSettled(chatIds.map(cid => this.sendMessage(cid, msg)));
    } catch (e) {
      this.logger.warn(`Failed to send shift close notification: ${e}`);
    }
  }

  /**
   * Dispatch scheduled daily summary to all configured businesses based on their chosen time (broadcast to all linked accounts)
   */
  async dispatchScheduledDailySummaries(): Promise<TelegramDailyDispatchResult> {
    const now = new Date();
    const tashkentTime = new Intl.DateTimeFormat('uz-UZ', {
      timeZone: 'Asia/Tashkent',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(now);

    const [currentHour] = tashkentTime.split(':');
    const targetHourPrefix = `${currentHour}:`;

    const businesses = await this.prisma.business.findMany({
      select: {
        id: true,
        name: true,
        currency: true,
        posSettings: true,
      },
    });

    let count = 0;
    const details: TelegramDailyDispatchDetail[] = [];

    for (const b of businesses) {
      const pos = (b.posSettings as Record<string, any>) || {};
      const tg = pos.telegram;
      if (!tg || tg.notifyDailySummary === false) continue;

      const accounts = this.getBusinessAccounts(pos);
      const chatIds = Array.from(new Set([
        ...accounts.map(a => a.chatId),
        ...(tg.chatId ? [String(tg.chatId)] : []),
      ]));

      if (chatIds.length === 0) continue;

      const scheduleTime = tg.dailySummaryTime || '21:00';
      const isDue = scheduleTime.startsWith(targetHourPrefix) || scheduleTime === tashkentTime;

      if (isDue) {
        try {
          const cur = b.currency || 'UZS';
          const summary = await this.getBotSummary(b.id);
          const msg =
            `🔔 <b>KUNLIK YAKUNIY HISOBOT (${scheduleTime})</b>\n` +
            `🏢 <b>Biznes:</b> ${b.name}\n` +
            `📅 <b>Sana:</b> ${new Date().toLocaleDateString('uz-UZ')}\n\n` +
            `💰 <b>Kirim (Savdo):</b> <b>${formatMoney(summary.todaySalesTotal, cur)}</b>\n` +
            `💸 <b>Chiqim (Xarajat):</b> ${formatMoney(summary.todayExpensesTotal, cur)}\n` +
            `💎 <b>Sof Foyda:</b> <b>${formatMoney(summary.todayNetProfit, cur)}</b>\n\n` +
            `🧾 <b>Cheklar soni:</b> ${summary.todayOrdersCount} ta\n` +
            `👥 <b>Yangi mijozlar:</b> ${summary.newCustomersCount} ta\n` +
            `📦 <b>Kam qolgan tovarlar:</b> ${summary.lowStockItemsCount} ta\n\n` +
            `<i>boshqar.uz — Tizimli biznes boshqaruvi</i>`;

          await Promise.allSettled(chatIds.map(cid => this.sendMessage(cid, msg)));
          count++;
          details.push({ businessId: b.id, businessName: b.name, scheduleTime, recipients: chatIds.length, status: 'sent' });
        } catch (e) {
          this.logger.warn(`Failed to dispatch daily summary for ${b.name}: ${e}`);
        }
      }
    }

    return { dispatched: count, details };
  }

  /**
   * Get realtime business sales & KPI summary directly for Bot (with Employee/Cashier isolation)
   */
  async getBotSummary(businessId: string, chatId?: string) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: { currency: true },
    });

    // Check if caller is an employee/cashier
    if (chatId) {
      const menu = await this.getMenuSettingsByChatId(chatId);
      if (menu && (menu.role === 'cashier' || menu.role === 'employee') && menu.userId) {
        const cashierOrders = await this.prisma.order.findMany({
          where: {
            businessId,
            status: 'completed',
            createdAt: { gte: todayStart },
            OR: [
              { cashier: { userId: menu.userId } },
              { shift: { userId: menu.userId } },
            ],
          },
          select: { total: true },
        });

        const activeShift = await this.prisma.posShift.findFirst({
          where: {
            businessId,
            userId: menu.userId,
            closedAt: null,
          },
          select: { id: true, openedAt: true, totalSales: true, ordersCount: true },
        });

        const mySalesTotal = cashierOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);

        return {
          todaySalesTotal: mySalesTotal,
          todayOrdersCount: cashierOrders.length,
          todayExpensesTotal: 0,
          todayNetProfit: 0,
          newCustomersCount: 0,
          lowStockItemsCount: 0,
          currency: business?.currency || 'UZS',
          isEmployee: true,
          role: menu.role,
          roleLabel: menu.roleLabel || 'Kassir',
          employeeName: menu.ownerName,
          hasActiveShift: !!activeShift,
          shiftOpenedAt: activeShift?.openedAt,
        };
      }
    }

    // Full business owner summary
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
      currency: business?.currency || 'UZS',
      isEmployee: false,
      role: 'owner',
      roleLabel: "Do'kon Egasi (Admin)",
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
   * Get Debts and Customers with outstanding balances for Bot
   */
  async getBotDebts(businessId: string) {
    const [business, customers] = await Promise.all([
      this.prisma.business.findUnique({
        where: { id: businessId },
        select: { currency: true },
      }),
      this.prisma.customer.findMany({
        where: {
          businessId,
          debt: { gt: 0 },
        },
        orderBy: { debt: 'desc' },
        take: 20,
      }),
    ]);

    const totalDebt = customers.reduce((sum, c) => sum + Number(c.debt || 0), 0);

    return {
      totalDebt,
      debtorsCount: customers.length,
      currency: business?.currency || 'UZS',
      customers: customers.map(c => ({
        id: c.id,
        name: c.fullName,
        phone: c.phone || "Raqam yo'q",
        debt: Number(c.debt || 0),
        lastPurchaseAt: c.lastPurchaseAt,
      })),
    };
  }

  /**
   * Record an Expense directly from Telegram Bot
   */
  async createBotExpense(businessId: string, amount: number, description: string, category: string = 'other') {
    const [business, branch] = await Promise.all([
      this.prisma.business.findUnique({
        where: { id: businessId },
        select: { currency: true },
      }),
      this.prisma.branch.findFirst({
        where: { businessId },
        select: { id: true },
      }),
    ]);

    if (!branch) {
      throw new Error('Faol filial topilmadi');
    }

    const validCategories = ['purchase', 'salary', 'rent', 'utilities', 'advertising', 'transport', 'other'];
    const matchedCategory = validCategories.includes(category.toLowerCase()) ? category.toLowerCase() : 'other';

    const expense = await this.prisma.expense.create({
      data: {
        businessId,
        branchId: branch.id,
        amount,
        description,
        category: matchedCategory as any,
      },
    });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayExpenses = await this.prisma.expense.findMany({
      where: {
        businessId,
        recordedAt: { gte: todayStart },
      },
      select: { amount: true },
    });

    const todayTotalExpenses = todayExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

    return {
      success: true,
      expenseId: expense.id,
      amount: Number(expense.amount),
      description: expense.description,
      recordedAt: expense.recordedAt,
      todayTotalExpenses,
      currency: business?.currency || 'UZS',
    };
  }

  /**
   * Search Products and Stock for Bot (Inline & /narx search) - Hides costPrice from employees
   */
  async searchBotProducts(businessId: string, query: string, chatId?: string) {
    const cleanQuery = query.trim();
    if (!cleanQuery) return [];

    let isEmployee = false;
    if (chatId) {
      const menu = await this.getMenuSettingsByChatId(chatId);
      if (menu && (menu.role === 'cashier' || menu.role === 'employee')) {
        isEmployee = true;
      }
    }

    const [business, products] = await Promise.all([
      this.prisma.business.findUnique({
        where: { id: businessId },
        select: { currency: true },
      }),
      this.prisma.product.findMany({
        where: {
          businessId,
          status: 'active',
          OR: [
            { name: { contains: cleanQuery, mode: 'insensitive' } },
            { sku: { contains: cleanQuery, mode: 'insensitive' } },
            { barcode: { contains: cleanQuery } },
          ],
        },
        include: {
          category: { select: { name: true } },
          unit: { select: { shortName: true } },
          inventory: {
            where: { branch: { businessId } },
            select: { quantity: true },
          },
        },
        take: 10,
      }),
    ]);

    const cur = business?.currency || 'UZS';

    return products.map(p => {
      const totalStock = (p.inventory || []).reduce((sum, inv) => sum + Number(inv.quantity || 0), 0);
      return {
        id: p.id,
        name: p.name,
        sku: p.sku,
        barcode: p.barcode,
        sellingPrice: Number(p.salePrice || 0),
        costPrice: isEmployee ? null : Number(p.purchasePrice || 0),
        category: p.category?.name || 'Umumiy',
        unit: p.unit?.shortName || 'dona',
        stock: totalStock,
        currency: cur,
      };
    });
  }

  /**
   * Get Active Cashiers and Shifts for Bot
   */
  async getBotCashiers(businessId: string, chatId?: string) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [business, openShifts, employees] = await Promise.all([
      this.prisma.business.findUnique({
        where: { id: businessId },
        select: { currency: true },
      }),
      this.prisma.posShift.findMany({
        where: {
          businessId,
          closedAt: null,
        },
        include: {
          user: { select: { fullName: true, phone: true } },
          branch: { select: { name: true } },
        },
      }),
      this.prisma.employee.findMany({
        where: {
          businessId,
          status: 'active',
        },
        include: {
          user: { select: { fullName: true, phone: true } },
          cashierOrders: {
            where: { completedAt: { gte: todayStart } },
            select: { total: true },
          },
        },
      }),
    ]);

    const activeCashiers = employees.map(emp => {
      const todayTotalSales = (emp.cashierOrders || []).reduce((sum, o) => sum + Number(o.total || 0), 0);
      const isOpen = openShifts.some(s => s.userId === emp.userId);
      return {
        id: emp.id,
        name: emp.fullName || emp.user?.fullName || 'Xodim',
        role: emp.position || 'Kassir',
        todaySalesCount: emp.cashierOrders.length,
        todayTotalSales,
        isShiftOpen: isOpen,
      };
    });

    return {
      openShiftsCount: openShifts.length,
      currency: business?.currency || 'UZS',
      cashiers: activeCashiers,
    };
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
        agent: this.httpsAgent,
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
