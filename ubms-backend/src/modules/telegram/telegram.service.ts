import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  TelegramAccount,
  TelegramSettings,
  TelegramOrderNotification,
  TelegramLowStockProduct,
  TelegramShiftCloseData,
  TelegramDailyDispatchResult,
} from './telegram.types';
import { TelegramAccountService } from './services/telegram-account.service';
import { TelegramReportsService } from './services/telegram-reports.service';
import { TelegramNotificationService } from './services/telegram-notification.service';

export { TelegramAccount, TelegramSettings };

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name);
  private readonly botToken =
    process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN || '8984252481:AAHGyWSoSQPFMqW3mQd2mH-mJ-5MmyxZcb8';
  private botUsername = process.env.TELEGRAM_BOT_USERNAME || 'Boshqar_uzbot';

  constructor(
    private prisma: PrismaService,
    private accountService: TelegramAccountService,
    private reportsService: TelegramReportsService,
    private notificationService: TelegramNotificationService,
  ) {}

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

  // --- Account & Settings Delegation ---

  findByChatId(chatId: string) {
    return this.accountService.findByChatId(chatId);
  }

  getMenuSettingsByChatId(chatId: string) {
    return this.accountService.getMenuSettingsByChatId(chatId);
  }

  getStatus(businessId: string): Promise<TelegramSettings & { botUsername: string }> {
    return this.accountService.getStatus(businessId, this.botUsername);
  }

  generateConnectLink(businessId: string) {
    return this.accountService.generateConnectLink(businessId, this.botUsername);
  }

  async linkChatWithToken(token: string, chatId: string, username?: string, firstName?: string) {
    const entry = this.accountService.getConnectToken(token);
    if (!entry) {
      return { success: false, error: 'Havola muddati tugagan yoki yaroqsiz.' };
    }

    if (Date.now() > entry.expiresAt) {
      this.accountService.deleteConnectToken(token);
      return { success: false, error: 'Havola muddati tugagan. Web paneldan yangisini oling.' };
    }

    const res = await this.accountService.linkChatDirect(entry.businessId, chatId, username, firstName);
    this.accountService.deleteConnectToken(token);

    if (res.success) {
      await this.notificationService.sendMessage(
        chatId,
        `🎉 <b>Tabriklaymiz!</b>\n\n` +
          `<b>"${res.businessName || 'Biznesingiz'}"</b> tizimi ushbu akkauntingizga muvaffaqiyatli ulandi!\n\n` +
          `Endi har bir savdo, kunlik hisobotlar va kam qolgan tovarlar haqidagi xabarlar to'g'ridan-to'g'ri shu yerga keladi.\n\n` +
          `<i>Quyidagi buyruqlar orqali tezkor hisobotlarni olishingiz mumkin:\n/savdo — Bugungi savdo\n/hisobot — Kunlik umumiy hisobot\n/ombor — Kam qolgan tovarlar</i>`,
      );
    }

    return res;
  }

  linkChatDirect(
    businessId: string,
    chatId: string,
    username?: string,
    firstName?: string,
    role?: string,
    roleLabel?: string,
    userId?: string,
    phone?: string,
  ) {
    return this.accountService.linkChatDirect(businessId, chatId, username, firstName, role, roleLabel, userId, phone);
  }

  linkUserBusinessesByPhone(phone: string, chatId: string, username?: string, firstName?: string) {
    return this.accountService.linkUserBusinessesByPhone(phone, chatId, username, firstName);
  }

  async linkByPhoneOrChatId(businessId: string, query: string) {
    const cleanQuery = query.trim();
    const digits = cleanQuery.replace(/\D/g, '');

    if (/^\d{6,12}$/.test(cleanQuery) && digits.length !== 9) {
      const res = await this.accountService.linkChatDirect(businessId, cleanQuery);
      if (res.success) {
        await this.notificationService.sendMessage(
          cleanQuery,
          `✅ <b>boshqar.uz</b> hisobingiz ushbu Telegram akkauntga muvaffaqiyatli bog'landi!`,
        );
        return { success: true, message: 'Telegram Chat ID orqali yangi hisob muvaffaqiyatli ulandi!' };
      }
    }

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
          await this.accountService.linkChatDirect(
            businessId,
            tg.chatId,
            tg.username,
            user.fullName,
            bu.role?.name?.toLowerCase(),
            bu.role?.name,
            user.id,
            user.phone,
          );
          return { success: true, message: `Telegram (@${tg.username || tg.chatId}) hisobi biriktirildi!` };
        }
      }
    }

    return {
      success: false,
      message:
        "Botda ushbu raqam yoki hisob hali ro'yxatdan o'tmagan. Iltimos avval @Boshqar_uzbot da START bosing yoki raqamingiz bilan kiring.",
    };
  }

  async disconnectAccount(businessId: string, chatId: string) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, posSettings: true },
    });

    if (!business) {
      throw new Error('Biznes topilmadi');
    }

    const currentPos = (business.posSettings as Record<string, any>) || {};
    const currentTg = currentPos.telegram || {};
    let accounts = this.accountService.getBusinessAccounts(currentPos);

    accounts = accounts.filter((a) => String(a.chatId) !== String(chatId));

    await this.notificationService
      .sendMessage(chatId, `⚠️ <b>Ushbu Telegram akkauntingiz biznes boshqaruv panelidan uzildi.</b>`)
      .catch(() => null);

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

    return this.accountService.getStatus(businessId, this.botUsername);
  }

  async updateSettings(businessId: string, settings: Partial<TelegramSettings>) {
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

    return this.accountService.getStatus(businessId, this.botUsername);
  }

  async disconnect(businessId: string): Promise<void> {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: { posSettings: true },
    });

    const currentPos = (business?.posSettings as Record<string, any>) || {};
    const accounts = this.accountService.getBusinessAccounts(currentPos);

    for (const acc of accounts) {
      await this.notificationService
        .sendMessage(
          acc.chatId,
          `⚠️ <b>Boshqaruv panelidan Telegram bot uzildi.</b>\n\nQayta ulash uchun boshqaruv panelining <b>Sozlamalar -> Telegram Bot</b> bo'limiga kiring.`,
        )
        .catch(() => null);
    }

    delete currentPos.telegram;

    await this.prisma.business.update({
      where: { id: businessId },
      data: { posSettings: currentPos },
    });
  }

  // --- Reports Delegation ---

  getBotSummary(businessId: string, chatId?: string) {
    return this.reportsService.getBotSummary(businessId, chatId);
  }

  getBotInventory(businessId: string) {
    return this.reportsService.getBotInventory(businessId);
  }

  getBotDebts(businessId: string) {
    return this.reportsService.getBotDebts(businessId);
  }

  createBotExpense(businessId: string, amount: number, description: string, categoryName?: string) {
    return this.reportsService.createBotExpense(businessId, amount, description, categoryName);
  }

  searchBotProducts(businessId: string, query: string, chatId?: string) {
    return this.reportsService.searchBotProducts(businessId, query, chatId);
  }

  getBotCashiers(businessId: string, chatId?: string) {
    return this.reportsService.getBotCashiers(businessId, chatId);
  }

  // --- Notification Delegation ---

  sendMessage(chatId: string | number, text: string, replyMarkup?: unknown) {
    return this.notificationService.sendMessage(chatId, text, replyMarkup);
  }

  sendTestMessage(businessId: string) {
    return this.notificationService.sendTestMessage(businessId, this.botUsername);
  }

  sendOrderNotification(businessId: string, order: TelegramOrderNotification) {
    return this.notificationService.sendOrderNotification(businessId, order, this.botUsername);
  }

  sendLowStockNotification(businessId: string, product: TelegramLowStockProduct, currentQty: number) {
    return this.notificationService.sendLowStockNotification(businessId, product, currentQty, this.botUsername);
  }

  sendShiftCloseNotification(businessId: string, shift: TelegramShiftCloseData) {
    return this.notificationService.sendShiftCloseNotification(businessId, shift, this.botUsername);
  }

  dispatchScheduledDailySummaries(): Promise<TelegramDailyDispatchResult> {
    return this.notificationService.dispatchScheduledDailySummaries();
  }
}
