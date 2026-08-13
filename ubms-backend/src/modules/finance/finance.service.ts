import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  async getSummary(businessId: string, branchId?: string, dateFrom?: string, dateTo?: string) {
    const whereRevenue: any = { businessId };
    const whereExpense: any = { businessId };
    const whereOrders: any = { businessId, status: 'completed' };

    if (branchId) {
      whereRevenue.branchId = branchId;
      whereExpense.branchId = branchId;
      whereOrders.branchId = branchId;
    }

    if (dateFrom || dateTo) {
      const dateFilter: any = {};
      if (dateFrom) dateFilter.gte = new Date(dateFrom);
      if (dateTo) dateFilter.lte = new Date(dateTo);

      whereRevenue.recordedAt = dateFilter;
      whereExpense.recordedAt = dateFilter;
      whereOrders.completedAt = dateFilter;
    }

    const [revenues, expenses, orders] = await Promise.all([
      this.prisma.revenue.findMany({ where: whereRevenue }),
      this.prisma.expense.findMany({ where: whereExpense }),
      this.prisma.order.findMany({
        where: whereOrders,
        include: {
          items: {
            include: { product: true },
          },
        },
      }),
    ]);

    const totalRevenue = revenues.reduce((sum, r) => sum + Number(r.amount), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    // Calculate COGS
    let cogs = 0;
    for (const order of orders) {
      for (const item of order.items) {
        if (item.product) {
          cogs += Number(item.quantity) * Number(item.product.purchasePrice);
        }
      }
    }

    const netProfit = totalRevenue - cogs - totalExpenses;

    // Expenses by category
    const expenseBreakdown: Record<string, number> = {};
    for (const exp of expenses) {
      expenseBreakdown[exp.category] = (expenseBreakdown[exp.category] || 0) + Number(exp.amount);
    }

    return {
      totalRevenue,
      totalExpenses,
      cogs,
      netProfit,
      expenseBreakdown,
    };
  }

  async getExpenses(businessId: string, branchId?: string) {
    const where: any = { businessId };
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
    data: { category: any; amount: number; description?: string },
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
