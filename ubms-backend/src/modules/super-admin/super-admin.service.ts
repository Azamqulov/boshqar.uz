import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, UserStatus, BusinessStatus } from '@prisma/client';
import { getBusinessTypesConfig, toggleBusinessTypeConfig } from '../../common/config/business-types.config';

@Injectable()
export class SuperAdminService {
  constructor(private prisma: PrismaService) {}

  // 1. Global Platform Stats
  async getPlatformStats() {
    const [
      totalBusinesses,
      totalUsers,
      totalOrders,
      totalProducts,
      ordersSum,
      businessesByStatus,
      businessesByType,
    ] = await Promise.all([
      this.prisma.business.count(),
      this.prisma.user.count(),
      this.prisma.order.count({ where: { status: 'completed' } }),
      this.prisma.product.count(),
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

    return {
      totalBusinesses,
      totalUsers,
      totalOrders,
      totalProducts,
      totalGMV: Number(ordersSum._sum.total || 0),
      businessesByStatus,
      businessesByType,
    };
  }

  // 2. Owners Monitoring (Phase 1)
  async getOwners(search?: string, planFilter?: string, statusFilter?: string | UserStatus, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: Prisma.UserWhereInput = {
      ownedBusinesses: { some: {} },
    };

    if (statusFilter) {
      where.status = statusFilter as UserStatus;
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
        { ownedBusinesses: { some: { name: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    if (planFilter) {
      where.ownedBusinesses = {
        some: {
          plan: { name: { equals: planFilter, mode: 'insensitive' } },
        },
      };
    }

    const [owners, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: {
          ownedBusinesses: {
            include: {
              plan: true,
              _count: {
                select: { products: true, orders: true, employees: true },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    // Extract business IDs for batch GMV calculation (eliminates N+1 DB roundtrips)
    const businessIds = owners
      .map((o) => o.ownedBusinesses[0]?.id)
      .filter((id): id is string => Boolean(id));

    const gmvMap = new Map<string, number>();
    if (businessIds.length > 0) {
      const gmvGroup = await this.prisma.order.groupBy({
        by: ['businessId'],
        where: {
          businessId: { in: businessIds },
          status: 'completed',
        },
        _sum: { total: true },
      });
      gmvGroup.forEach((g) => {
        gmvMap.set(g.businessId, Number(g._sum.total || 0));
      });
    }

    // Format owners response in memory
    const formattedOwners = owners.map((o) => {
      const business = o.ownedBusinesses[0];
      const lifetimeGMV = business ? (gmvMap.get(business.id) || 0) : 0;

      return {
        id: o.id,
        fullName: o.fullName,
        phone: o.phone,
        email: o.email,
        status: o.status,
        isSuperAdmin: o.isSuperAdmin,
        createdAt: o.createdAt,
        lastLoginAt: o.lastLoginAt,
        business: business
          ? {
              id: business.id,
              name: business.name,
              businessType: business.businessType,
              currency: business.currency,
              status: business.status,
              plan: business.plan?.name || 'Free',
              planId: business.planId,
              productsCount: business._count.products,
              ordersCount: business._count.orders,
              employeesCount: business._count.employees,
              lifetimeGMV,
            }
          : null,
      };
    });

    return {
      items: formattedOwners,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getOwnerStats(ownerId: string) {
    const owner = await this.prisma.user.findUnique({
      where: { id: ownerId },
      include: {
        ownedBusinesses: {
          include: {
            plan: true,
            _count: {
              select: { products: true, orders: true, employees: true, customers: true },
            },
          },
        },
      },
    });

    if (!owner) throw new NotFoundException('Firma egasi topilmadi');
    const business = owner.ownedBusinesses[0];
    if (!business) throw new NotFoundException('Firma egasining biznesi topilmadi');

    // 1. Lifetime GMV
    const lifetimeAgg = await this.prisma.order.aggregate({
      where: { businessId: business.id, status: 'completed' },
      _sum: { total: true },
      _count: { id: true },
    });

    // 2. Last 30 Days GMV
    const date30d = new Date();
    date30d.setDate(date30d.getDate() - 30);
    const last30dAgg = await this.prisma.order.aggregate({
      where: {
        businessId: business.id,
        status: 'completed',
        createdAt: { gte: date30d },
      },
      _sum: { total: true },
      _count: { id: true },
    });

    // 3. 14 Days Daily Chart
    const date14d = new Date();
    date14d.setDate(date14d.getDate() - 14);
    const recentOrders = await this.prisma.order.findMany({
      where: {
        businessId: business.id,
        status: 'completed',
        createdAt: { gte: date14d },
      },
      select: { createdAt: true, total: true },
    });

    const chartMap = new Map<string, number>();
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      chartMap.set(key, 0);
    }
    recentOrders.forEach((o) => {
      const key = o.createdAt.toISOString().slice(0, 10);
      if (chartMap.has(key)) {
        chartMap.set(key, chartMap.get(key)! + Number(o.total));
      }
    });

    const chartData = Array.from(chartMap.entries()).map(([date, sales]) => ({
      date,
      sales,
    }));

    return {
      owner: {
        id: owner.id,
        fullName: owner.fullName,
        phone: owner.phone,
        email: owner.email,
        status: owner.status,
        createdAt: owner.createdAt,
        lastLoginAt: owner.lastLoginAt,
      },
      business: {
        id: business.id,
        name: business.name,
        businessType: business.businessType,
        currency: business.currency,
        status: business.status,
        plan: business.plan?.name || 'Free',
        planId: business.planId,
        productsCount: business._count.products,
        ordersCount: business._count.orders,
        employeesCount: business._count.employees,
        customersCount: business._count.customers,
      },
      stats: {
        lifetimeGMV: Number(lifetimeAgg._sum.total || 0),
        lifetimeOrdersCount: lifetimeAgg._count.id,
        last30dGMV: Number(last30dAgg._sum.total || 0),
        last30dOrdersCount: last30dAgg._count.id,
      },
      chartData,
    };
  }

  async updateOwnerStatus(ownerId: string, status: string | UserStatus) {
    const owner = await this.prisma.user.findUnique({
      where: { id: ownerId },
      include: { ownedBusinesses: true },
    });
    if (!owner) throw new NotFoundException('Firma egasi topilmadi');

    const bizStatus: BusinessStatus = status === 'blocked' ? 'suspended' : 'active';

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: ownerId },
        data: { status: status as UserStatus },
      }),
      this.prisma.business.updateMany({
        where: { ownerId },
        data: { status: bizStatus },
      }),
    ]);

    return { success: true, status };
  }

  async updateOwnerPlan(ownerId: string, planId: string, durationDays = 30) {
    const owner = await this.prisma.user.findUnique({
      where: { id: ownerId },
      include: { ownedBusinesses: true },
    });
    if (!owner) throw new NotFoundException('Firma egasi topilmadi');

    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Tarif rejasi topilmadi');

    const now = new Date();
    const periodEnd = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    await this.prisma.$transaction(async (tx) => {
      await tx.business.updateMany({
        where: { ownerId },
        data: { planId, status: 'active' },
      });

      for (const b of owner.ownedBusinesses) {
        await tx.subscription.create({
          data: {
            businessId: b.id,
            planId,
            status: 'active',
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            cancelAtPeriodEnd: false,
          },
        });
      }
    });

    return { success: true, planId, planName: plan.name, currentPeriodEnd: periodEnd };
  }

  // 2. All Businesses List
  async getAllBusinesses(search?: string, status?: string | BusinessStatus) {
    const where: Prisma.BusinessWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { owner: { fullName: { contains: search, mode: 'insensitive' } } },
        { owner: { phone: { contains: search } } },
      ];
    }
    if (status) {
      where.status = status as BusinessStatus;
    }

    const businesses = await this.prisma.business.findMany({
      where,
      include: {
        owner: {
          select: { id: true, fullName: true, phone: true, email: true },
        },
        plan: {
          select: { id: true, name: true, priceMonthly: true },
        },
        subscriptions: {
          where: { status: 'active' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            branches: true,
            products: true,
            orders: true,
            businessUsers: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();

    return businesses.map((b) => {
      const activeSub = b.subscriptions[0];
      const isFree = b.plan?.name === 'Free';
      let daysLeft: number | null = null;
      let isExpired = false;

      if (!isFree && activeSub?.currentPeriodEnd) {
        const diffMs = new Date(activeSub.currentPeriodEnd).getTime() - now.getTime();
        daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        isExpired = daysLeft <= 0;
      }

      return {
        id: b.id,
        name: b.name,
        businessType: b.businessType,
        currency: b.currency,
        status: b.status,
        createdAt: b.createdAt,
        owner: b.owner,
        plan: b.plan?.name || 'Free',
        planId: b.planId,
        branchesCount: b._count.branches,
        productsCount: b._count.products,
        ordersCount: b._count.orders,
        usersCount: b._count.businessUsers,
        subscription: activeSub
          ? {
              status: activeSub.status,
              currentPeriodEnd: activeSub.currentPeriodEnd,
              daysLeft,
              isExpired,
            }
          : null,
      };
    });
  }

  // 3. Update Business Status (Block / Activate / Suspend)
  async updateBusinessStatus(id: string, status: string | BusinessStatus) {
    const business = await this.prisma.business.findUnique({ where: { id } });
    if (!business) throw new NotFoundException('Biznes topilmadi');

    return this.prisma.business.update({
      where: { id },
      data: { status: status as BusinessStatus },
    });
  }

  // 4. Update Business Plan (Upgrade / Downgrade / Expire)
  async updateBusinessPlan(id: string, planId: string, durationDays = 30) {
    const business = await this.prisma.business.findUnique({ where: { id } });
    if (!business) throw new NotFoundException('Biznes topilmadi');

    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Tarif rejasi topilmadi');

    const now = new Date();
    // Agar durationDays <= 0 bo'lsa, muddatni o'tmishga qo'yib darhol expire qilamiz
    const periodEnd = durationDays <= 0
      ? new Date(now.getTime() - 24 * 60 * 60 * 1000)
      : new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    return this.prisma.$transaction(async (tx) => {
      const updatedBusiness = await tx.business.update({
        where: { id },
        data: { planId, status: 'active' },
        include: { plan: true },
      });

      await tx.subscription.create({
        data: {
          businessId: id,
          planId,
          status: 'active',
          currentPeriodStart: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: false,
        },
      });

      return updatedBusiness;
    });
  }

  // 5. All Users List Across Entire Platform
  async getAllUsers(search?: string, roleFilter?: string) {
    const where: Prisma.UserWhereInput = {};
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const users = await this.prisma.user.findMany({
      where,
      include: {
        ownedBusinesses: { select: { id: true, name: true, status: true } },
        businessUsers: {
          include: {
            business: { select: { id: true, name: true } },
            role: { select: { name: true } },
          },
        },
        _count: { select: { ownedBusinesses: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return users.map((u) => ({
      id: u.id,
      fullName: u.fullName,
      phone: u.phone,
      email: u.email,
      status: u.status,
      isSuperAdmin: u.isSuperAdmin,
      lastLoginAt: u.lastLoginAt,
      createdAt: u.createdAt,
      ownedBusinessesCount: u._count.ownedBusinesses,
      businesses: u.businessUsers.map((bu) => ({
        businessName: bu.business.name,
        roleName: bu.role.name,
      })),
    }));
  }

  // 6. Update User Status (Block / Unblock globally)
  async updateUserStatus(id: string, status: string | UserStatus) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');

    if (user.isSuperAdmin && (status === 'blocked' || status === 'suspended')) {
      throw new BadRequestException("SuperAdmin akkauntini bloklash taqiqlanadi! Tizim boshqaruvsiz qolmasligi uchun SuperAdmin doim faol bo'lishi shart.");
    }

    return this.prisma.user.update({
      where: { id },
      data: { status: status as UserStatus },
    });
  }

  // 7. Toggle SuperAdmin Privilege
  async toggleSuperAdmin(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');

    return this.prisma.user.update({
      where: { id },
      data: { isSuperAdmin: !user.isSuperAdmin },
    });
  }

  // 8. Plans list
  async getPlans() {
    return this.prisma.plan.findMany({ orderBy: { priceMonthly: 'asc' } });
  }

  async updatePlan(id: string, dto: { name?: string; priceMonthly?: number; maxBranches?: number; maxUsers?: number; features?: any }) {
    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.priceMonthly !== undefined) data.priceMonthly = dto.priceMonthly;
    if (dto.maxBranches !== undefined) data.maxBranches = dto.maxBranches === 0 ? null : dto.maxBranches;
    if (dto.maxUsers !== undefined) data.maxUsers = dto.maxUsers === 0 ? null : dto.maxUsers;
    if (dto.features !== undefined) data.features = dto.features;

    return this.prisma.plan.update({
      where: { id },
      data,
    });
  }

  // 9. Global Audit Logs
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

  // 10. Business Types Configuration for SuperAdmin
  async getBusinessTypes() {
    const configs = getBusinessTypesConfig();
    const typeCounts = await this.prisma.business.groupBy({
      by: ['businessType'],
      _count: { id: true },
    });

    const countMap = new Map<string, number>();
    typeCounts.forEach((tc) => {
      countMap.set(tc.businessType, tc._count.id);
    });

    return configs.map((c) => ({
      ...c,
      count: countMap.get(c.type) || 0,
    }));
  }

  async toggleBusinessType(type: string, isEnabled?: boolean) {
    return toggleBusinessTypeConfig(type, isEnabled);
  }

  // 11. Demo Leads Monitoring
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
    return { success: true, message: 'Demo lead muvaffaqiyatli o\'chirildi' };
  }

  // 12. Real-time Live Platform Activity
  async getLivePlatformActivity() {
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

    return {
      recentDemoLeads,
      recentBusinesses,
      recentUsers,
      recentOrders,
      last24Hours: {
        ordersCount: todayOrdersSum._count.id,
        revenueSum: Number(todayOrdersSum._sum.total || 0),
      },
    };
  }
}

