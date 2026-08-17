import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../../prisma/prisma.service';

export interface ABCProductItem {
  id: string;
  name: string;
  sku?: string;
  categoryName?: string;
  revenue: number;
  quantitySold: number;
  sharePercentage: number;
  cumulativeShare: number;
  group: 'A' | 'B' | 'C';
}

export interface DeadStockItem {
  id: string;
  name: string;
  categoryName?: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  lockedCapital: number;
  daysWithoutSales: number;
}

export interface RestockPredictionItem {
  id: string;
  name: string;
  currentStock: number;
  dailyVelocity: number;
  daysRemaining: number;
  recommendedOrderQty: number;
  urgency: 'critical' | 'warning' | 'normal';
}

export interface ChurnRiskCustomer {
  id: string;
  fullName: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  daysSinceLastVisit: number;
}

@Injectable()
export class AnalyticsService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getAIInsights(businessId: string, branchId?: string) {
    const cacheKey = `analytics:ai-insights:${businessId}:${branchId || 'all'}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    const [
      abcAnalysis,
      deadStock,
      peakHours,
      restockPredictions,
      churnCustomers,
    ] = await Promise.all([
      this.getABCAnalysis(businessId, branchId),
      this.getDeadStockRadar(businessId, branchId),
      this.getPeakHoursAnalysis(businessId, branchId),
      this.getRestockPredictions(businessId, branchId),
      this.getChurnRiskCustomers(businessId),
    ]);

    // Construct smart AI narrative cards
    const aiCards: Array<{
      id: string;
      type: 'opportunity' | 'warning' | 'critical' | 'success';
      title: string;
      message: string;
      actionLabel?: string;
      actionRoute?: string;
      metric?: string;
    }> = [];

    // 1. ABC Top Stars Card
    if (abcAnalysis.groupA.length > 0) {
      aiCards.push({
        id: 'abc-stars',
        type: 'success',
        title: 'Asosiy Daromad Keltiruvchi Tovarlar (Guruh A)',
        message: `${abcAnalysis.groupA.length} ta yetakchi mahsulot biznesingiz umumiy daromadining ${abcAnalysis.groupAShare.toFixed(1)}% qismini shakllantirmoqda. Ushbu tovarlar doim omborda yetarli bo'lishi shart.`,
        metric: `${abcAnalysis.groupA.length} ta tovar`,
        actionLabel: "Katalogda ko'rish",
        actionRoute: '/products',
      });
    }

    // 2. Dead Stock Card
    if (deadStock.totalLockedCapital > 0) {
      aiCards.push({
        id: 'dead-stock-alert',
        type: 'warning',
        title: 'Muzlagan Qoldiqlar Radari (Dead Stock)',
        message: `Omborda ${deadStock.items.length} ta mahsulot 30 kundan beri sotilmay yotibdi. Unda jami ${Number(deadStock.totalLockedCapital).toLocaleString('uz-UZ')} so'm pul muzlab qolgan. 10-15% chegirma yoki '1+1' aksiya o'tkazish tavsiya etiladi.`,
        metric: `${Number(deadStock.totalLockedCapital).toLocaleString('uz-UZ')} so'm`,
        actionLabel: "Chegirma qo'yish",
        actionRoute: '/products',
      });
    }

    // 3. Restock Prediction Card
    const criticalRestock = restockPredictions.filter((r) => r.urgency === 'critical');
    if (criticalRestock.length > 0) {
      aiCards.push({
        id: 'restock-critical',
        type: 'critical',
        title: 'Tovar Tugash Xavfi (Smart Restock)',
        message: `${criticalRestock.length} ta eng ko'p sotilayotgan mahsulot zaxirasi yaqin 3 kunda tugaydi! Savdo to'xtab qolmasligi uchun zudlik bilan ta'minotchiga buyurtma bering.`,
        metric: `${criticalRestock.length} ta tovar`,
        actionLabel: "Ta'minotchilar",
        actionRoute: '/suppliers',
      });
    }

    // 4. Peak Hours Insight
    if (peakHours.topPeakHour) {
      aiCards.push({
        id: 'peak-hours-card',
        type: 'opportunity',
        title: "Qizg'in Savdo Soatlari (Peak Hours)",
        message: `Do'koningizda eng ko'p sotuv soat ${peakHours.topPeakHour.hour}:00 da (jami ${peakHours.topPeakHour.orderCount} ta chek) kuzatilmoqda. Shu soatlarda xodimlar sonini ko'paytirish navbatlarni kamaytiradi.`,
        metric: `Soat ${peakHours.topPeakHour.hour}:00`,
        actionLabel: 'Xodimlar',
        actionRoute: '/settings',
      });
    }

    // 5. Churn Risk Customers
    if (churnCustomers.length > 0) {
      aiCards.push({
        id: 'churn-radar',
        type: 'warning',
        title: "Yo'qolayotgan Doimiy Mijozlar",
        message: `${churnCustomers.length} nafar faol mijozingiz oxirgi 21 kundan beri do'konga kelmadi. Ularga Telegram/SMS orqali maxsus keshbek yoki chegirma yuborib qaytarish tavsiya etiladi.`,
        metric: `${churnCustomers.length} nafar mijoz`,
        actionLabel: "Mijozlar ro'yxati",
        actionRoute: '/customers',
      });
    }

    const payload = {
      aiCards,
      abcAnalysis,
      deadStock,
      peakHours,
      restockPredictions,
      churnCustomers,
    };

    // Cache for 60 seconds
    await this.cacheManager.set(cacheKey, payload, 60000);
    return payload;
  }

  // 1. ABC Analysis: Pareto 80-15-5 calculation
  async getABCAnalysis(businessId: string, branchId?: string) {
    const where: any = {
      businessId,
      status: 'completed',
    };
    if (branchId) where.branchId = branchId;

    const orderItems = await this.prisma.orderItem.findMany({
      where: {
        order: where,
      },
      select: {
        productId: true,
        product: { select: { id: true, name: true, sku: true, category: { select: { name: true } } } },
        quantity: true,
        unitPrice: true,
        discountAmount: true,
      },
    });

    const productMap = new Map<string, { id: string; name: string; sku?: string; categoryName?: string; revenue: number; quantitySold: number }>();

    for (const item of orderItems) {
      if (!item.productId || !item.product) continue;
      const pid = item.productId;
      const subtotal = Number(item.quantity) * Number(item.unitPrice) - Number(item.discountAmount || 0);
      const qty = Number(item.quantity);

      if (!productMap.has(pid)) {
        productMap.set(pid, {
          id: item.product.id,
          name: item.product.name,
          sku: item.product.sku || undefined,
          categoryName: item.product.category?.name || 'Kategoriyasiz',
          revenue: 0,
          quantitySold: 0,
        });
      }

      const p = productMap.get(pid)!;
      p.revenue += Math.max(0, subtotal);
      p.quantitySold += qty;
    }

    const allProducts = Array.from(productMap.values()).sort((a, b) => b.revenue - a.revenue);
    const totalRevenue = allProducts.reduce((sum, p) => sum + p.revenue, 0);

    let runningSum = 0;
    const classified: ABCProductItem[] = allProducts.map((p) => {
      runningSum += p.revenue;
      const sharePercentage = totalRevenue > 0 ? (p.revenue / totalRevenue) * 100 : 0;
      const cumulativeShare = totalRevenue > 0 ? (runningSum / totalRevenue) * 100 : 0;

      let group: 'A' | 'B' | 'C' = 'C';
      if (cumulativeShare <= 80 || (cumulativeShare - sharePercentage < 80)) {
        group = 'A';
      } else if (cumulativeShare <= 95 || (cumulativeShare - sharePercentage < 95)) {
        group = 'B';
      } else {
        group = 'C';
      }

      return {
        ...p,
        sharePercentage,
        cumulativeShare,
        group,
      };
    });

    const groupA = classified.filter((p) => p.group === 'A');
    const groupB = classified.filter((p) => p.group === 'B');
    const groupC = classified.filter((p) => p.group === 'C');

    const groupARevenue = groupA.reduce((sum, p) => sum + p.revenue, 0);
    const groupBRevenue = groupB.reduce((sum, p) => sum + p.revenue, 0);
    const groupCRevenue = groupC.reduce((sum, p) => sum + p.revenue, 0);

    return {
      totalRevenue,
      totalProductsAnalyzed: classified.length,
      groupA,
      groupB,
      groupC,
      groupAShare: totalRevenue > 0 ? (groupARevenue / totalRevenue) * 100 : 0,
      groupBShare: totalRevenue > 0 ? (groupBRevenue / totalRevenue) * 100 : 0,
      groupCShare: totalRevenue > 0 ? (groupCRevenue / totalRevenue) * 100 : 0,
      groupARevenue,
      groupBRevenue,
      groupCRevenue,
    };
  }

  // 2. Dead Stock Radar: items with stock > 0 and no sales in 30+ days
  async getDeadStockRadar(businessId: string, branchId?: string) {
    const date30DaysAgo = new Date();
    date30DaysAgo.setDate(date30DaysAgo.getDate() - 30);

    const [recentOrderItems, inventoryItems] = await Promise.all([
      this.prisma.orderItem.findMany({
        where: {
          order: {
            businessId,
            status: 'completed',
            completedAt: { gte: date30DaysAgo },
            ...(branchId ? { branchId } : {}),
          },
        },
        select: { productId: true },
      }),
      this.prisma.inventory.findMany({
        where: {
          businessId,
          quantity: { gt: 0 },
          ...(branchId ? { branchId } : {}),
        },
        include: {
          product: {
            include: { category: true },
          },
        },
      }),
    ]);

    const activeProductIds = new Set(recentOrderItems.map((i) => i.productId).filter(Boolean));

    const deadItems: DeadStockItem[] = [];
    let totalLockedCapital = 0;

    for (const inv of inventoryItems) {
      if (!inv.product) continue;
      if (!activeProductIds.has(inv.productId)) {
        const qty = Number(inv.quantity);
        const purchasePrice = Number(inv.product.purchasePrice || 0);
        const salePrice = Number(inv.product.salePrice || 0);
        const lockedCapital = qty * purchasePrice;

        totalLockedCapital += lockedCapital;
        deadItems.push({
          id: inv.product.id,
          name: inv.product.name,
          categoryName: inv.product.category?.name || 'Kategoriyasiz',
          quantity: qty,
          purchasePrice,
          sellingPrice: salePrice,
          lockedCapital,
          daysWithoutSales: 30,
        });
      }
    }

    // Sort dead stock by highest locked capital
    deadItems.sort((a, b) => b.lockedCapital - a.lockedCapital);

    return {
      items: deadItems.slice(0, 50),
      totalLockedCapital,
      totalDeadProductsCount: deadItems.length,
    };
  }

  // 3. Peak Hours & Day of week heatmap
  async getPeakHoursAnalysis(businessId: string, branchId?: string) {
    const date30DaysAgo = new Date();
    date30DaysAgo.setDate(date30DaysAgo.getDate() - 30);

    const orders = await this.prisma.order.findMany({
      where: {
        businessId,
        status: 'completed',
        completedAt: { gte: date30DaysAgo },
        ...(branchId ? { branchId } : {}),
      },
      select: {
        completedAt: true,
        total: true,
      },
    });

    const hoursMap = new Map<number, { hour: number; orderCount: number; totalSales: number }>();
    for (let h = 0; h < 24; h++) {
      hoursMap.set(h, { hour: h, orderCount: 0, totalSales: 0 });
    }

    const weekdays = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
    const daysMap = new Map<number, { dayName: string; dayIndex: number; orderCount: number; totalSales: number }>();
    weekdays.forEach((dayName, idx) => {
      daysMap.set(idx, { dayName, dayIndex: idx, orderCount: 0, totalSales: 0 });
    });

    for (const o of orders) {
      if (!o.completedAt) continue;
      const d = new Date(o.completedAt);
      const h = d.getHours();
      const day = d.getDay();
      const val = Number(o.total || 0);

      const hourObj = hoursMap.get(h)!;
      hourObj.orderCount++;
      hourObj.totalSales += val;

      const dayObj = daysMap.get(day)!;
      dayObj.orderCount++;
      dayObj.totalSales += val;
    }

    const hourlyList = Array.from(hoursMap.values());
    const dailyList = Array.from(daysMap.values());

    const topPeakHour = [...hourlyList].sort((a, b) => b.orderCount - a.orderCount)[0];
    const topPeakDay = [...dailyList].sort((a, b) => b.orderCount - a.orderCount)[0];

    return {
      hourly: hourlyList,
      daily: dailyList,
      topPeakHour,
      topPeakDay,
    };
  }

  // 4. Smart Restock Predictions based on daily sales velocity
  async getRestockPredictions(businessId: string, branchId?: string) {
    const date14DaysAgo = new Date();
    date14DaysAgo.setDate(date14DaysAgo.getDate() - 14);

    const [orderItems14d, inventoryList] = await Promise.all([
      this.prisma.orderItem.findMany({
        where: {
          order: {
            businessId,
            status: 'completed',
            completedAt: { gte: date14DaysAgo },
            ...(branchId ? { branchId } : {}),
          },
        },
        select: {
          productId: true,
          quantity: true,
        },
      }),
      this.prisma.inventory.findMany({
        where: {
          businessId,
          ...(branchId ? { branchId } : {}),
        },
        include: {
          product: { select: { id: true, name: true, minStock: true } },
        },
      }),
    ]);

    const salesVelocityMap = new Map<string, number>();
    for (const item of orderItems14d) {
      if (!item.productId) continue;
      const curr = salesVelocityMap.get(item.productId) || 0;
      salesVelocityMap.set(item.productId, curr + Number(item.quantity));
    }

    const predictions: RestockPredictionItem[] = [];

    for (const inv of inventoryList) {
      if (!inv.product) continue;
      const pid = inv.product.id;
      const currentStock = Number(inv.quantity || 0);
      const totalSold14d = salesVelocityMap.get(pid) || 0;
      const dailyVelocity = totalSold14d / 14;

      if (dailyVelocity > 0) {
        const daysRemaining = Math.floor(currentStock / dailyVelocity);
        let urgency: 'critical' | 'warning' | 'normal' = 'normal';

        if (daysRemaining <= 3 || currentStock === 0) {
          urgency = 'critical';
        } else if (daysRemaining <= 7 || currentStock <= Number(inv.product.minStock || 5)) {
          urgency = 'warning';
        }

        if (urgency !== 'normal') {
          // Recommend 14 days of safety stock
          const recommendedOrderQty = Math.ceil(dailyVelocity * 14 - currentStock);
          predictions.push({
            id: pid,
            name: inv.product.name,
            currentStock,
            dailyVelocity: Number(dailyVelocity.toFixed(1)),
            daysRemaining,
            recommendedOrderQty: Math.max(10, recommendedOrderQty),
            urgency,
          });
        }
      }
    }

    // Sort by most urgent (fewest days remaining)
    return predictions.sort((a, b) => a.daysRemaining - b.daysRemaining).slice(0, 30);
  }

  // 5. Churn Risk Radar: Customers who bought 2+ times before but haven't visited in 21+ days
  async getChurnRiskCustomers(businessId: string) {
    const date21DaysAgo = new Date();
    date21DaysAgo.setDate(date21DaysAgo.getDate() - 21);

    const customers = await this.prisma.customer.findMany({
      where: {
        businessId,
      },
      include: {
        orders: {
          where: { status: 'completed' },
          orderBy: { completedAt: 'desc' },
          take: 1,
          select: { completedAt: true, total: true },
        },
        _count: {
          select: { orders: { where: { status: 'completed' } } },
        },
      },
    });

    const atRisk: ChurnRiskCustomer[] = [];

    for (const c of customers) {
      const orderCount = c._count.orders;
      if (orderCount >= 2 && c.orders.length > 0) {
        const lastOrderDate = new Date(c.orders[0].completedAt || c.createdAt);
        const daysDiff = Math.floor((Date.now() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff >= 21) {
          atRisk.push({
            id: c.id,
            fullName: c.fullName || 'Mijoz',
            phone: c.phone,
            totalOrders: orderCount,
            totalSpent: Number(c.totalSpent || 0),
            daysSinceLastVisit: daysDiff,
          });
        }
      }
    }

    return atRisk.sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 30);
  }
}
