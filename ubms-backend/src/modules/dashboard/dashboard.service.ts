import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getSummary(businessId: string, branchId?: string) {
    const cacheKey = `dashboard:summary:${businessId}:${branchId || 'all'}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

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
            OR: [
              { completedAt: { gte: todayStart, lte: todayEnd } },
              { completedAt: null, createdAt: { gte: todayStart, lte: todayEnd } },
              { createdAt: { gte: todayStart, lte: todayEnd } },
            ],
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
            businessId,
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

    const result = {
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

    await this.cacheManager.set(cacheKey, result, 30000);
    return result;
  }

  async getChartData(businessId: string, branchId?: string, days = 14) {
    const cacheKey = `dashboard:charts:${businessId}:${branchId || 'all'}:${days}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    const where: any = {
      businessId,
      status: 'completed',
      OR: [
        { completedAt: { gte: startDate, lte: today } },
        { completedAt: null, createdAt: { gte: startDate, lte: today } },
        { createdAt: { gte: startDate, lte: today } },
      ],
    };
    if (branchId) where.branchId = branchId;

    const [orders, expenses] = await Promise.all([
      this.prisma.order.findMany({
        where,
        select: {
          completedAt: true,
          createdAt: true,
          total: true,
          discountAmount: true,
          items: {
            select: {
              quantity: true,
              total: true,
              product: {
                select: {
                  name: true,
                  purchasePrice: true,
                  category: { select: { name: true } },
                },
              },
            },
          },
          payments: {
            select: {
              amount: true,
              paymentMethod: { select: { type: true, name: true } },
            },
          },
        },
        orderBy: { completedAt: 'asc' },
      }),
      this.prisma.expense.findMany({
        where: {
          businessId,
          ...(branchId ? { branchId } : {}),
          recordedAt: { gte: startDate, lte: today },
        },
        select: {
          amount: true,
          category: true,
          recordedAt: true,
        },
      }),
    ]);

    interface DailyItem {
      date: string;
      sales: number;
      profit: number;
      cogs: number;
      expenses: number;
      discount: number;
      count: number;
      payments: { [key: string]: number };
      categories: { [key: string]: { name: string; amount: number; count: number } };
    }

    const dailyMap = new Map<string, DailyItem>();

    const baseTime = startDate.getTime();
    for (let i = 0; i < days; i++) {
      const d = new Date(baseTime + i * 86400000);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;
      dailyMap.set(dateKey, {
        date: dateKey,
        sales: 0,
        profit: 0,
        cogs: 0,
        expenses: 0,
        discount: 0,
        count: 0,
        payments: { cash: 0, card: 0, click: 0, other: 0 },
        categories: {},
      });
    }

    // Process expenses
    for (const exp of expenses) {
      if (!exp.recordedAt) continue;
      const d = new Date(exp.recordedAt);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const entry = dailyMap.get(dateKey);
      if (entry) {
        entry.expenses += Number(exp.amount) || 0;
      }
    }

    // Process orders
    for (const order of orders) {
      const orderDate = order.completedAt || (order as any).createdAt;
      if (!orderDate) continue;
      const d = new Date(orderDate);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      const entry = dailyMap.get(dateKey);
      if (entry) {
        const orderSales = Number(order.total) || 0;
        let orderCogs = 0;

        for (const item of order.items) {
          const itemQty = Number(item.quantity) || 0;
          const itemTotal = Number(item.total) || 0;
          if (item.product) {
            orderCogs += itemQty * (Number(item.product.purchasePrice) || 0);
            const catName = item.product.category?.name || 'Boshqa';
            if (!entry.categories[catName]) {
              entry.categories[catName] = { name: catName, amount: 0, count: 0 };
            }
            entry.categories[catName].amount += itemTotal;
            entry.categories[catName].count += itemQty;
          }
        }

        entry.sales += orderSales;
        entry.cogs += orderCogs;
        entry.discount += Number(order.discountAmount) || 0;
        entry.count += 1;

        // Process payments
        for (const p of order.payments) {
          const pAmount = Number(p.amount) || 0;
          const pType = p.paymentMethod?.type || 'cash';
          if (entry.payments[pType] !== undefined) {
            entry.payments[pType] += pAmount;
          } else {
            entry.payments.other += pAmount;
          }
        }
      }
    }

    // Finalize profits and format categories as array
    const chartResult = Array.from(dailyMap.values()).map((entry) => {
      const grossProfit = entry.sales - entry.cogs;
      const netProfit = Math.max(0, grossProfit - entry.expenses);
      return {
        date: entry.date,
        sales: entry.sales,
        profit: netProfit,
        grossProfit,
        cogs: entry.cogs,
        expenses: entry.expenses,
        discount: entry.discount,
        count: entry.count,
        avgCheck: entry.count > 0 ? Math.round(entry.sales / entry.count) : 0,
        payments: entry.payments,
        categories: Object.values(entry.categories).sort((a, b) => b.amount - a.amount),
      };
    });

    await this.cacheManager.set(cacheKey, chartResult, 60000);
    return chartResult;
  }
}
