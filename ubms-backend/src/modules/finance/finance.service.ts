import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, ExpenseCategory } from '@prisma/client';

export interface CreateExpenseDto {
  category: ExpenseCategory;
  amount: number;
  description?: string;
  branchId?: string;
}

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  async getSummary(businessId: string, branchId?: string, dateFrom?: string, dateTo?: string) {
    const whereRevenue: Prisma.RevenueWhereInput = { businessId };
    const whereExpense: Prisma.ExpenseWhereInput = { businessId };
    const whereOrders: Prisma.OrderWhereInput = { businessId, status: 'completed' };

    if (branchId) {
      whereRevenue.branchId = branchId;
      whereExpense.branchId = branchId;
      whereOrders.branchId = branchId;
    }

    if (dateFrom || dateTo) {
      const dateFilter: Prisma.DateTimeFilter = {};
      if (dateFrom) dateFilter.gte = new Date(dateFrom);
      if (dateTo) dateFilter.lte = new Date(dateTo);

      whereRevenue.recordedAt = dateFilter;
      whereExpense.recordedAt = dateFilter;
      whereOrders.completedAt = dateFilter;
    }

    const [revenues, expenses, orders] = await Promise.all([
      this.prisma.revenue.findMany({
        where: whereRevenue,
        orderBy: { recordedAt: 'desc' },
      }),
      this.prisma.expense.findMany({
        where: whereExpense,
        orderBy: { recordedAt: 'desc' },
      }),
      this.prisma.order.findMany({
        where: whereOrders,
        include: {
          cashier: true,
          customer: true,
          items: {
            include: { product: true, service: true },
          },
          payments: {
            include: { paymentMethod: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const totalRevenue = revenues.reduce((sum, r) => sum + Number(r.amount), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    // Calculate COGS and group sold products
    let cogs = 0;
    const productStatsMap = new Map<
      string,
      {
        id: string;
        name: string;
        sku?: string;
        barcode?: string;
        quantitySold: number;
        revenue: number;
        cogs: number;
        profit: number;
      }
    >();

    for (const order of orders) {
      for (const item of order.items) {
        const itemQty = Number(item.quantity) || 0;
        const itemRevenue = Number(item.total) || (itemQty * Number(item.unitPrice || 0));
        let itemCogs = 0;

        if (item.product) {
          itemCogs = itemQty * Number(item.product.purchasePrice || 0);
          cogs += itemCogs;

          const prodKey = item.productId || item.product.id;
          const existing = productStatsMap.get(prodKey) || {
            id: prodKey,
            name: item.product.name,
            sku: item.product.sku || undefined,
            barcode: item.product.barcode || undefined,
            quantitySold: 0,
            revenue: 0,
            cogs: 0,
            profit: 0,
          };

          existing.quantitySold += itemQty;
          existing.revenue += itemRevenue;
          existing.cogs += itemCogs;
          existing.profit = existing.revenue - existing.cogs;
          productStatsMap.set(prodKey, existing);
        } else if (item.service) {
          const servKey = item.serviceId || item.service.id;
          const existing = productStatsMap.get(servKey) || {
            id: servKey,
            name: item.service.name + ' (Xizmat)',
            quantitySold: 0,
            revenue: 0,
            cogs: 0,
            profit: 0,
          };
          existing.quantitySold += itemQty;
          existing.revenue += itemRevenue;
          existing.profit = existing.revenue;
          productStatsMap.set(servKey, existing);
        }
      }
    }

    const netProfit = totalRevenue - cogs - totalExpenses;
    const profitMargin = totalRevenue > 0 ? Number(((netProfit / totalRevenue) * 100).toFixed(1)) : 0;
    const salesCount = orders.length;
    const averageTicket = salesCount > 0 ? Math.round(totalRevenue / salesCount) : 0;

    // Expenses by category
    const expenseBreakdown: Record<string, number> = {};
    for (const exp of expenses) {
      expenseBreakdown[exp.category] = (expenseBreakdown[exp.category] || 0) + Number(exp.amount);
    }

    // Payment methods breakdown
    const paymentBreakdown = {
      cash: 0,
      card: 0,
      other: 0,
    };

    for (const order of orders) {
      for (const pay of order.payments) {
        const type = pay.paymentMethod?.type || 'other';
        const amt = Number(pay.amount) || 0;
        if (type === 'cash') paymentBreakdown.cash += amt;
        else if (type === 'card') paymentBreakdown.card += amt;
        else paymentBreakdown.other += amt;
      }
    }

    // Top sold products sorted by quantity
    const soldProducts = Array.from(productStatsMap.values()).sort(
      (a, b) => b.quantitySold - a.quantitySold,
    );

    return {
      totalRevenue,
      totalExpenses,
      cogs,
      netProfit,
      profitMargin,
      salesCount,
      averageTicket,
      expenseBreakdown,
      paymentBreakdown,
      soldProducts,
      recentOrders: orders.slice(0, 50),
    };
  }

  async getExpenses(businessId: string, branchId?: string) {
    const where: Prisma.ExpenseWhereInput = { businessId };
    if (branchId) where.branchId = branchId;

    return this.prisma.expense.findMany({
      where,
      orderBy: { recordedAt: 'desc' },
      take: 100,
    });
  }

  async createExpense(
    businessId: string,
    branchId: string,
    userId: string,
    data: CreateExpenseDto,
  ) {
    return this.prisma.expense.create({
      data: {
        businessId,
        branchId,
        category: data.category,
        amount: data.amount,
        description: data.description || null,
        createdBy: userId,
      },
    });
  }
}
