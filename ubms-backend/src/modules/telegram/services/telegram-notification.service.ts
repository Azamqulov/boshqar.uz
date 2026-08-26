import { Injectable, Logger } from '@nestjs/common';
import * as https from 'https';
import { PrismaService } from '../../../prisma/prisma.service';
import { TelegramAccountService } from './telegram-account.service';
import { TelegramReportsService } from './telegram-reports.service';
import {
  TelegramOrderNotification,
  TelegramLowStockProduct,
  TelegramShiftCloseData,
  TelegramDailyDispatchResult,
  TelegramDailyDispatchDetail,
  formatTelegramMoney as formatMoney,
} from '../telegram.types';

@Injectable()
export class TelegramNotificationService {
  private readonly logger = new Logger(TelegramNotificationService.name);
  private readonly botToken =
    process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN || '';
  private readonly httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 50 });

  constructor(
    private prisma: PrismaService,
    private accountService: TelegramAccountService,
    private reportsService: TelegramReportsService,
  ) {}

  /**
   * Universal message sender to Telegram Bot API with HTML formatting
   */
  async sendMessage(chatId: string | number, text: string, replyMarkup?: unknown): Promise<boolean> {
    if (!this.botToken) {
      this.logger.warn('TELEGRAM_BOT_TOKEN not configured. Skipping sendMessage.');
      return false;
    }

    const payload = JSON.stringify({
      chat_id: String(chatId),
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
    });

    return new Promise<boolean>((resolve) => {
      const req = https.request(
        `https://api.telegram.org/bot${this.botToken}/sendMessage`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
          },
          agent: this.httpsAgent,
          timeout: 4000,
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              const parsed = JSON.parse(data);
              if (parsed.ok) {
                resolve(true);
              } else {
                this.logger.warn(`Telegram send failed to ${chatId}: ${parsed.description}`);
                resolve(false);
              }
            } catch {
              resolve(false);
            }
          });
        },
      );

      req.on('error', (err) => {
        this.logger.warn(`Telegram HTTP error: ${err.message}`);
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

  /**
   * Send test message to all linked Telegram accounts
   */
  async sendTestMessage(businessId: string, botUsername: string): Promise<{ success: boolean; message: string }> {
    const status = await this.accountService.getStatus(businessId, botUsername);
    if (!status.isConnected) {
      return { success: false, message: 'Telegram bot ulanmagan. Avval botni ulang.' };
    }

    const accounts = status.accounts || [];
    const chatIds = Array.from(
      new Set([...accounts.map((a) => a.chatId), ...(status.chatId ? [status.chatId] : [])]),
    );

    if (chatIds.length === 0) {
      return { success: false, message: 'Telegram bot ulanmagan.' };
    }

    const text =
      `🤖 <b>boshqar.uz — Sinov Xabari!</b>\n\n` +
      `✅ Telegram bildirishnomalari a'lo darajada ishlamoqda!\n` +
      `👥 Ulangan akkauntlar soni: <b>${chatIds.length} ta</b>\n` +
      `⏰ Vaqt: <code>${new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</code>\n\n` +
      `<i>boshqar.uz — Biznesingiz doim nazoratda!</i>`;

    const results = await Promise.allSettled(chatIds.map((cid) => this.sendMessage(cid, text)));
    const sentCount = results.filter((r) => r.status === 'fulfilled' && (r as any).value === true).length;

    if (sentCount > 0) {
      return { success: true, message: `Sinov xabari ${chatIds.length} ta ulangan Telegram akkauntga yuborildi!` };
    } else {
      return { success: false, message: 'Telegramga xabar yuborishda xatolik yuz berdi.' };
    }
  }

  /**
   * Notify on new order created/completed
   */
  async sendOrderNotification(businessId: string, order: TelegramOrderNotification, botUsername: string): Promise<void> {
    try {
      const status = await this.accountService.getStatus(businessId, botUsername);
      if (!status.isConnected || !status.notifyOnOrder) return;

      const accounts = status.accounts || [];
      const chatIds = Array.from(
        new Set([...accounts.map((a) => a.chatId), ...(status.chatId ? [status.chatId] : [])]),
      );

      if (chatIds.length === 0) return;

      const cur = status.currency || 'UZS';
      const itemsList = (order.items || [])
        .slice(0, 5)
        .map(
          (i) =>
            `  • ${i.product?.name || i.name || 'Tovar'} × ${i.quantity} = ${formatMoney(
              Number(i.unitPrice * i.quantity),
              cur,
            )}`,
        )
        .join('\n');

      const extraItems =
        (order.items || []).length > 5 ? `\n  <i>...va yana ${(order.items || []).length - 5} ta tovar</i>` : '';

      const paymentMethodNames: Record<string, string> = {
        cash: '💵 Naqd',
        card: '💳 Karta / Terminal',
        nasiya: '📝 Nasiya',
        transfer: "🏦 O'tkazma",
      };

      const payType = paymentMethodNames[(order as any).paymentMethod || 'cash'] || '💵 Naqd';

      const msg =
        `💰 <b>Yangi Savdo! Chek: #${order.orderNumber || order.id?.slice(-4)}</b>\n\n` +
        `💵 <b>Summa:</b> <b>${formatMoney(Number((order as any).totalAmount || order.total || 0), cur)}</b>\n` +
        `💳 <b>To'lov:</b> ${payType}\n` +
        (order.customer ? `👤 <b>Mijoz:</b> ${order.customer.fullName || (order.customer as any).name}\n` : '') +
        ((order as any).tableName ? `🍽 <b>Stol:</b> ${(order as any).tableName}\n` : '') +
        `\n📦 <b>Tarkibi:</b>\n${itemsList}${extraItems}\n\n` +
        `⏰ <code>${new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</code>`;

      await Promise.allSettled(chatIds.map((cid) => this.sendMessage(cid, msg)));
    } catch (e) {
      this.logger.warn(`Failed to send order notification: ${e}`);
    }
  }

  /**
   * Notify when a product hits low stock
   */
  async sendLowStockNotification(
    businessId: string,
    product: TelegramLowStockProduct,
    currentQty: number,
    botUsername: string,
  ): Promise<void> {
    try {
      const status = await this.accountService.getStatus(businessId, botUsername);
      if (!status.isConnected || !status.notifyOnLowStock) return;

      const accounts = status.accounts || [];
      const chatIds = Array.from(
        new Set([...accounts.map((a) => a.chatId), ...(status.chatId ? [status.chatId] : [])]),
      );

      if (chatIds.length === 0) return;

      const unitName = (product as any).unit?.shortName || 'dona';
      const msg =
        `⚠️ <b>DIQQAT: Mahsulot kam qoldi!</b>\n\n` +
        `📦 <b>Nomi:</b> ${product.name}\n` +
        `📉 <b>Joriy qoldiq:</b> <b>${currentQty} ${unitName}</b>\n` +
        `🚨 <b>Minimal chegara:</b> ${product.minStock || 5} ${unitName}\n\n` +
        `<i>Iltimos, o'z vaqtida omborga kirim qiling!</i>`;

      await Promise.allSettled(chatIds.map((cid) => this.sendMessage(cid, msg)));
    } catch (e) {
      this.logger.warn(`Failed to send low stock notification: ${e}`);
    }
  }

  /**
   * Notify when a cashier closes a POS shift
   */
  async sendShiftCloseNotification(
    businessId: string,
    shift: TelegramShiftCloseData,
    botUsername: string,
  ): Promise<void> {
    try {
      const status = await this.accountService.getStatus(businessId, botUsername);
      if (!status.isConnected || !status.notifyOnShiftClose) return;

      const accounts = status.accounts || [];
      const chatIds = Array.from(
        new Set([...accounts.map((a) => a.chatId), ...(status.chatId ? [status.chatId] : [])]),
      );

      if (chatIds.length === 0) return;

      const cur = status.currency || 'UZS';
      const cashierName = shift.user?.fullName || (shift.user as any)?.phone || 'Kassir';
      const branchName = (shift as any).branch?.name || 'Asosiy filial';
      const openTime = shift.openedAt
        ? new Date(shift.openedAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
        : '--:--';
      const closeTime = shift.closedAt
        ? new Date(shift.closedAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
        : new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });

      const diff = Number(shift.difference || 0);
      const diffText =
        diff === 0
          ? "✅ To'liq mos (Kamomad yo'q)"
          : diff > 0
          ? `🟢 Ortiqcha: +${formatMoney(diff, cur)}`
          : `🔴 Kamomad: ${formatMoney(diff, cur)}`;

      const msg =
        `🔒 <b>Kassa Smenasi Yopildi (X-Z Hisoboti)</b>\n\n` +
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

      await Promise.allSettled(chatIds.map((cid) => this.sendMessage(cid, msg)));
    } catch (e) {
      this.logger.warn(`Failed to send shift close notification: ${e}`);
    }
  }

  /**
   * Dispatch scheduled daily summaries
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

      const accounts = this.accountService.getBusinessAccounts(pos);
      const chatIds = Array.from(
        new Set([...accounts.map((a) => a.chatId), ...(tg.chatId ? [String(tg.chatId)] : [])]),
      );

      if (chatIds.length === 0) continue;

      const scheduleTime = tg.dailySummaryTime || '21:00';
      const isDue = scheduleTime.startsWith(targetHourPrefix) || scheduleTime === tashkentTime;

      if (isDue) {
        try {
          const cur = b.currency || 'UZS';
          const summary = await this.reportsService.getBotSummary(b.id);
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

          await Promise.allSettled(chatIds.map((cid) => this.sendMessage(cid, msg)));
          count++;
          details.push({
            businessId: b.id,
            businessName: b.name,
            scheduleTime,
            recipients: chatIds.length,
            status: 'sent',
          });
        } catch (e) {
          this.logger.warn(`Failed to dispatch daily summary for ${b.name}: ${e}`);
        }
      }
    }

    return { dispatched: count, details };
  }
}
