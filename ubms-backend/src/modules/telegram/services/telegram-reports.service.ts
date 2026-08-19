import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { TelegramAccountService } from './telegram-account.service';

@Injectable()
export class TelegramReportsService {
  private readonly logger = new Logger(TelegramReportsService.name);

  constructor(
    private prisma: PrismaService,
    private accountService: TelegramAccountService,
  ) {}

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

    if (chatId) {
      const menu = await this.accountService.getMenuSettingsByChatId(chatId);
      if (menu && (menu.role === 'cashier' || menu.role === 'employee') && menu.userId) {
        const cashierOrders = await this.prisma.order.findMany({
          where: {
            businessId,
            status: 'completed',
            createdAt: { gte: todayStart },
            OR: [{ cashier: { userId: menu.userId } }, { shift: { userId: menu.userId } }],
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
      this.prisma.inventory.findMany({
        where: {
          product: { businessId, status: 'active' },
          quantity: { lte: 5 },
        },
        select: { id: true },
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
      lowStockItemsCount: lowStockProducts.length,
      currency: business?.currency || 'UZS',
      isEmployee: false,
    };
  }

  /**
   * Get low stock inventory items for Telegram Bot
   */
  async getBotInventory(businessId: string) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: { currency: true },
    });

    const lowStockInventories = await this.prisma.inventory.findMany({
      where: {
        product: { businessId, status: 'active' },
        quantity: { lte: 5 },
      },
      include: {
        product: {
          include: { unit: true },
        },
        branch: { select: { name: true } },
      },
      take: 20,
    });

    return {
      currency: business?.currency || 'UZS',
      items: lowStockInventories.map((inv) => ({
        id: inv.id,
        name: inv.product.name,
        sku: inv.product.sku,
        barcode: inv.product.barcode,
        quantity: Number(inv.quantity),
        minStock: Number(inv.product.minStock || 5),
        unit: inv.product.unit?.shortName || 'dona',
        branchName: inv.branch?.name || 'Asosiy',
        price: Number(inv.product.salePrice),
      })),
    };
  }

  /**
   * Get debts & customer balances for Telegram Bot
   */
  async getBotDebts(businessId: string) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: { currency: true },
    });

    const customersWithDebt = await this.prisma.customer.findMany({
      where: {
        businessId,
        debt: { gt: 0 },
      },
      orderBy: { debt: 'desc' },
      take: 15,
      select: {
        id: true,
        fullName: true,
        phone: true,
        debt: true,
        updatedAt: true,
      },
    });

    const totalDebt = customersWithDebt.reduce((sum, c) => sum + Number(c.debt || 0), 0);

    return {
      currency: business?.currency || 'UZS',
      totalDebt,
      count: customersWithDebt.length,
      customers: customersWithDebt.map((c) => ({
        id: c.id,
        name: c.fullName,
        phone: c.phone,
        debt: Number(c.debt),
        updatedAt: c.updatedAt,
      })),
    };
  }

  /**
   * Create expense from Telegram Bot
   */
  async createBotExpense(businessId: string, amount: number, description: string, categoryName?: string) {
    let branch = await this.prisma.branch.findFirst({
      where: { businessId, isMain: true },
      select: { id: true },
    });

    if (!branch) {
      branch = await this.prisma.branch.findFirst({
        where: { businessId },
        select: { id: true },
      });
    }

    if (!branch) {
      throw new Error('Filial topilmadi');
    }

    const expense = await this.prisma.expense.create({
      data: {
        businessId,
        branchId: branch.id,
        amount,
        description: description || 'Telegram orqali xarajat',
        category: 'other',
        recordedAt: new Date(),
      },
    });

    return {
      success: true,
      expense: {
        id: expense.id,
        amount: Number(expense.amount),
        description: expense.description,
        recordedAt: expense.recordedAt,
      },
    };
  }

  /**
   * Search products by title or barcode for Telegram Bot
   */
  async searchBotProducts(businessId: string, query: string, chatId?: string) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: { currency: true },
    });

    const cleanQ = (query || '').trim();
    const isEmployee = chatId ? (await this.accountService.getMenuSettingsByChatId(chatId))?.role === 'cashier' : false;

    const products = await this.prisma.product.findMany({
      where: {
        businessId,
        status: 'active',
        ...(cleanQ
          ? {
              OR: [
                { name: { contains: cleanQ, mode: 'insensitive' } },
                { barcode: { contains: cleanQ } },
                { sku: { contains: cleanQ } },
              ],
            }
          : {}),
      },
      include: {
        unit: true,
        category: { select: { name: true } },
        inventory: {
          select: { quantity: true, branch: { select: { name: true } } },
        },
      },
      take: 10,
    });

    return {
      currency: business?.currency || 'UZS',
      products: products.map((p) => {
        const totalStock = p.inventory.reduce((sum, inv) => sum + Number(inv.quantity), 0);
        return {
          id: p.id,
          name: p.name,
          barcode: p.barcode,
          price: Number(p.salePrice),
          costPrice: isEmployee ? undefined : Number(p.purchasePrice || 0),
          category: p.category?.name || 'Umumiy',
          unit: p.unit?.shortName || 'dona',
          totalStock,
          stockByBranch: p.inventory.map((inv) => ({
            branch: inv.branch?.name || 'Asosiy',
            quantity: Number(inv.quantity),
          })),
        };
      }),
    };
  }

  /**
   * Get active cashiers and shifts for Telegram Bot
   */
  async getBotCashiers(businessId: string, chatId?: string) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: { currency: true },
    });

    const activeShifts = await this.prisma.posShift.findMany({
      where: {
        businessId,
        closedAt: null,
      },
      include: {
        user: { select: { id: true, fullName: true, phone: true } },
        branch: { select: { name: true } },
      },
      orderBy: { openedAt: 'desc' },
    });

    return {
      currency: business?.currency || 'UZS',
      activeCount: activeShifts.length,
      shifts: activeShifts.map((s) => ({
        id: s.id,
        cashierName: s.user?.fullName || s.user?.phone || 'Kassir',
        cashierPhone: s.user?.phone,
        branchName: s.branch?.name || 'Asosiy filial',
        openedAt: s.openedAt,
        totalSales: Number(s.totalSales || 0),
        ordersCount: s.ordersCount || 0,
      })),
    };
  }
}
