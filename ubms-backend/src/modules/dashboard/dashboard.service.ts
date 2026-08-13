import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(businessId: string, branchId?: string) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const whereBase: any = { businessId };
    if (branchId) whereBase.branchId = branchId;

    // Optimized select queries with minimal network payload
    const [todayOrders, todayExpenses, newCustomers, inventoryItems, customers, suppliers] =
      await Promise.all([
        this.prisma.order.findMany({
          where: {
            ...whereBase,
            status: 'completed',
            completedAt: { gte: todayStart, lte: todayEnd },
          },
          select: {
            total: true,
            items: {
              select: {
                quantity: true,
                product: { select: { purchasePrice: true } },
              },
            },
          },
        }),
        this.prisma.expense.findMany({
          where: {
            ...whereBase,
            recordedAt: { gte: todayStart, lte: todayEnd },
          },
          select: { amount: true },
        }),
        this.prisma.customer.count({
          where: {
            businessId,
            createdAt: { gte: todayStart, lte: todayEnd },
          },
        }),
        this.prisma.inventory.findMany({
          where: {
            product: { businessId },
            ...(branchId ? { branchId } : {}),
          },
          select: {
            quantity: true,
            product: { select: { purchasePrice: true, minStock: true } },
          },
        }),
        this.prisma.customer.findMany({
          where: { businessId, debt: { gt: 0 } },
          select: { debt: true },
        }),
        this.prisma.supplier.findMany({
          where: { businessId, balance: { gt: 0 } },
          select: { balance: true },
        }),
      ]);

    const todaySales = todayOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const todayExpenseSum = todayExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

    let todayCogs = 0;
    for (const order of todayOrders) {
      for (const item of order.items) {
        if (item.product) {
          todayCogs += Number(item.quantity) * Number(item.product.purchasePrice);
        }
      }
    }

    const todayProfit = todaySales - todayCogs - todayExpenseSum;

    let totalInventoryValue = 0;
    let lowStockCount = 0;
    for (const inv of inventoryItems) {
      const qty = Number(inv.quantity);
      totalInventoryValue += qty * Number(inv.product.purchasePrice);
      if (qty <= Number(inv.product.minStock)) {
        lowStockCount++;
      }
    }

    const totalCustomerDebt = customers.reduce((sum, c) => sum + Number(c.debt), 0);
    const totalSupplierDebt = suppliers.reduce((sum, s) => sum + Number(s.balance), 0);

    return {
      todaySales,
      todayExpenses: todayExpenseSum,
      todayProfit,
      todayOrdersCount: todayOrders.length,
      newCustomersCount: newCustomers,
      totalInventoryValue,
      lowStockItemsCount: lowStockCount,
      totalCustomerDebt,
      totalSupplierDebt,
    };
  }

  async getChartData(businessId: string, branchId?: string, days = 14) {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const where: any = {
      businessId,
      status: 'completed',
      completedAt: { gte: startDate, lte: today },
    };
    if (branchId) where.branchId = branchId;

    const orders = await this.prisma.order.findMany({
      where,
      select: {
        completedAt: true,
        total: true,
        items: {
          select: {
            quantity: true,
            product: { select: { purchasePrice: true } },
          },
        },
      },
      orderBy: { completedAt: 'asc' },
    });

    const dailyMap = new Map<string, { date: string; sales: number; profit: number; count: number }>();

    for (let i = 0; i <= days; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;
      dailyMap.set(dateKey, { date: dateKey, sales: 0, profit: 0, count: 0 });
    }

    for (const order of orders) {
      if (!order.completedAt) continue;
      const d = new Date(order.completedAt);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;

      const entry = dailyMap.get(dateKey);
      if (entry) {
        const orderSales = Number(order.total);
        let orderCogs = 0;
        for (const item of order.items) {
          if (item.product) {
            orderCogs += Number(item.quantity) * Number(item.product.purchasePrice);
          }
        }
        entry.sales += orderSales;
        entry.profit += orderSales - orderCogs;
        entry.count += 1;
      }
    }

    return Array.from(dailyMap.values());
  }
}
