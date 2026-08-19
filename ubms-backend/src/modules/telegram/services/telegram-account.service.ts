import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { randomBytes } from 'crypto';
import { TelegramAccount, TelegramSettings } from '../telegram.types';

@Injectable()
export class TelegramAccountService {
  private readonly logger = new Logger(TelegramAccountService.name);
  private readonly connectTokens = new Map<string, { businessId: string; expiresAt: number }>();

  constructor(private prisma: PrismaService) {}

  /**
   * Helper to parse and standardize all linked accounts from posSettings
   */
  getBusinessAccounts(posSettings: Record<string, unknown> | null | undefined): TelegramAccount[] {
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
   * Find linked business and user by Telegram Chat ID
   */
  async findByChatId(chatId: string) {
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
      const matched = accounts.find((a) => String(a.chatId) === String(chatId));

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
   * Get realtime menu settings for bot by Chat ID
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
      const matched = accounts.find((a) => String(a.chatId) === String(chatId));

      if (matched || String(tg.chatId) === String(chatId)) {
        const role = matched?.role || 'owner';
        const roleLabel =
          matched?.roleLabel ||
          (role === 'cashier'
            ? 'Kassir'
            : role === 'manager'
            ? 'Menejer'
            : role === 'stockman'
            ? 'Omborchi'
            : "Do'kon Egasi (Admin)");

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
   * Get Telegram settings & status for a business
   */
  async getStatus(businessId: string, botUsername: string): Promise<TelegramSettings & { botUsername: string }> {
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
      botUsername,
      currency: business?.currency || 'UZS',
    };
  }

  /**
   * Generate a one-time connection token and deep-link for Telegram Bot
   */
  async generateConnectLink(businessId: string, botUsername: string) {
    const token = randomBytes(8).toString('hex');
    const expiresAt = Date.now() + 15 * 60 * 1000;

    this.connectTokens.set(token, { businessId, expiresAt });
    const link = `https://t.me/${botUsername}?start=connect_${token}`;
    return { link, token, botUsername };
  }

  getConnectToken(token: string) {
    return this.connectTokens.get(token);
  }

  deleteConnectToken(token: string) {
    this.connectTokens.delete(token);
  }

  /**
   * Link Telegram Chat ID directly to Business
   */
  async linkChatDirect(
    businessId: string,
    chatId: string,
    username?: string,
    firstName?: string,
    role?: string,
    roleLabel?: string,
    userId?: string,
    phone?: string,
  ): Promise<{ success: boolean; businessName?: string }> {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, name: true, ownerId: true, posSettings: true },
    });

    if (!business) {
      return { success: false };
    }

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

    const existingIdx = currentAccounts.findIndex((a) => String(a.chatId) === String(chatId));
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

    this.logger.log(
      `Telegram Bot linked for business: ${business.name} (ChatID: ${chatId}, Role: ${finalRole}, Total accounts: ${currentAccounts.length})`,
    );
    return { success: true, businessName: business.name };
  }

  /**
   * Link all businesses belonging to a user by their phone number
   */
  async linkUserBusinessesByPhone(phone: string, chatId: string, username?: string, firstName?: string) {
    const rawDigits = phone.replace(/\D/g, '');
    const cleanDigits = rawDigits.length >= 9 ? rawDigits.substring(rawDigits.length - 9) : rawDigits;

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ phone: { contains: cleanDigits } }, { phone: phone }],
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
          user.phone,
        );
        linkedCount++;
      }
    }

    this.logger.log(`Linked ${linkedCount} businesses for user ${user.fullName || user.phone} to Telegram ChatID: ${chatId}`);
    return { success: true, count: linkedCount };
  }
}
