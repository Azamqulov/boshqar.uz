import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

interface SuperAdminCacheEntry<T> {
  data: T;
  expiresAt: number;
}

let platformStatsCache: SuperAdminCacheEntry<any> | null = null;
let liveActivityCache: SuperAdminCacheEntry<any> | null = null;

export function invalidateAnalyticsCache() {
  platformStatsCache = null;
  liveActivityCache = null;
}

@Injectable()
export class SuperAdminAnalyticsService {
  constructor(private prisma: PrismaService) {}

  // 1. Global Platform Stats (Cached 30s)
  async getPlatformStats() {
    if (platformStatsCache && platformStatsCache.expiresAt > Date.now()) {
      return platformStatsCache.data;
    }

    const [
      totalBusinesses,
      totalUsers,
      totalOrders,
      totalProducts,
      totalLeads,
      totalOwners,
      pendingBillingRequests,
      ordersSum,
      businessesByStatus,
      businessesByType,
    ] = await Promise.all([
      this.prisma.business.count(),
      this.prisma.user.count(),
      this.prisma.order.count({ where: { status: 'completed' } }),
      this.prisma.product.count(),
      this.prisma.demoLead.count(),
      this.prisma.user.count({ where: { ownedBusinesses: { some: {} } } }),
      this.prisma.billingRequest.count({ where: { status: 'pending' } }),
      this.prisma.order.aggregate({
        where: { status: 'completed' },
        _sum: { total: true },
      }),
      this.prisma.business.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      this.prisma.business.groupBy({
        by: ['businessType'],
        _count: { id: true },
      }),
    ]);

    const result = {
      totalBusinesses,
      totalUsers,
      totalOrders,
      totalProducts,
      totalLeads,
      totalOwners,
      pendingBillingRequests,
      totalGMV: Number(ordersSum._sum.total || 0),
      businessesByStatus,
      businessesByType,
    };

    platformStatsCache = {
      data: result,
      expiresAt: Date.now() + 30_000,
    };

    return result;
  }

  // 2. Global Audit Logs
  async getGlobalAuditLogs(limit: number = 50) {
    return this.prisma.auditLog.findMany({
      take: limit,
      include: {
        user: { select: { id: true, fullName: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async cleanupGlobalAuditLogs(period: '1d' | '7d' | '30d' | 'all' = '7d') {
    const where: Prisma.AuditLogWhereInput = {};
    if (period !== 'all') {
      const cutoff = new Date();
      if (period === '1d') {
        cutoff.setDate(cutoff.getDate() - 1);
      } else if (period === '7d') {
        cutoff.setDate(cutoff.getDate() - 7);
      } else if (period === '30d') {
        cutoff.setDate(cutoff.getDate() - 30);
      }
      where.createdAt = { lte: cutoff };
    }

    const result = await this.prisma.auditLog.deleteMany({ where });
    return {
      success: true,
      count: result.count,
      message: `${result.count} ta global audit yozuvi tozalandi`,
    };
  }

  // 3. Demo Leads Monitoring
  async getDemoLeads(search?: string, status?: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const where: Prisma.DemoLeadWhereInput = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { businessType: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [leads, total, stats] = await Promise.all([
      this.prisma.demoLead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.demoLead.count({ where }),
      this.prisma.demoLead.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
    ]);

    const statsMap: Record<string, number> = {
      new: 0,
      contacted: 0,
      converted: 0,
      rejected: 0,
      total: 0,
    };

    let allTotal = 0;
    stats.forEach((s) => {
      statsMap[s.status] = s._count.id;
      allTotal += s._count.id;
    });
    statsMap.total = allTotal;

    return {
      leads,
      total,
      stats: statsMap,
      page,
      limit,
    };
  }

  async updateDemoLead(id: string, dto: { status?: string; notes?: string }) {
    const lead = await this.prisma.demoLead.findUnique({ where: { id } });
    if (!lead) {
      throw new NotFoundException('Demo lead topilmadi');
    }

    return this.prisma.demoLead.update({
      where: { id },
      data: {
        ...(dto.status ? { status: dto.status } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
      },
    });
  }

  async deleteDemoLead(id: string) {
    const lead = await this.prisma.demoLead.findUnique({ where: { id } });
    if (!lead) {
      throw new NotFoundException('Demo lead topilmadi');
    }

    await this.prisma.demoLead.delete({ where: { id } });
    return { success: true, message: "Demo lead muvaffaqiyatli o'chirildi" };
  }

  // 4. Real-time Live Platform Activity (Cached 15s)
  async getLivePlatformActivity() {
    if (liveActivityCache && liveActivityCache.expiresAt > Date.now()) {
      return liveActivityCache.data;
    }
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
      recentDemoLeads,
      recentBusinesses,
      recentUsers,
      recentOrders,
      todayOrdersSum,
    ] = await Promise.all([
      this.prisma.demoLead.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.business.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: { select: { id: true, fullName: true, phone: true } },
          plan: { select: { id: true, name: true } },
        },
      }),
      this.prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: { id: true, fullName: true, phone: true, email: true, createdAt: true, status: true },
      }),
      this.prisma.order.findMany({
        where: { createdAt: { gte: oneDayAgo } },
        take: 15,
        orderBy: { createdAt: 'desc' },
        include: {
          business: { select: { id: true, name: true, businessType: true } },
        },
      }),
      this.prisma.order.aggregate({
        where: {
          status: 'completed',
          createdAt: { gte: oneDayAgo },
        },
        _sum: { total: true },
        _count: { id: true },
      }),
    ]);

    const res = {
      recentDemoLeads,
      recentBusinesses,
      recentUsers,
      recentOrders,
      last24Hours: {
        ordersCount: todayOrdersSum._count.id,
        revenueSum: Number(todayOrdersSum._sum.total || 0),
      },
    };

    liveActivityCache = {
      data: res,
      expiresAt: Date.now() + 15_000,
    };
    return res;
  }
}
