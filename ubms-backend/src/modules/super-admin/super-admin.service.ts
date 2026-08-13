import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

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
  async getOwners(search?: string, planFilter?: string, statusFilter?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: any = {
      ownedBusinesses: { some: {} },
    };

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
        { ownedBusinesses: { some: { name: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    if (statusFilter) {
      where.status = statusFilter;
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

    // Calculate GMV for each owner's businesses
    const formattedOwners = await Promise.all(
      owners.map(async (o) => {
        const business = o.ownedBusinesses[0];
        let lifetimeGMV = 0;
        if (business) {
          const gmvAgg = await this.prisma.order.aggregate({
            where: { businessId: business.id, status: 'completed' },
            _sum: { total: true },
          });
          lifetimeGMV = Number(gmvAgg._sum.total || 0);
        }

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
      })
    );

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

  async updateOwnerStatus(ownerId: string, status: any) {
    const owner = await this.prisma.user.findUnique({
      where: { id: ownerId },
      include: { ownedBusinesses: true },
    });
    if (!owner) throw new NotFoundException('Firma egasi topilmadi');

    const bizStatus = status === 'blocked' ? 'suspended' : 'active';

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: ownerId },
        data: { status },
      }),
      this.prisma.business.updateMany({
        where: { ownerId },
        data: { status: bizStatus as any },
      }),
    ]);

    return { success: true, status };
  }

  async updateOwnerPlan(ownerId: string, planId: string) {
    const owner = await this.prisma.user.findUnique({
      where: { id: ownerId },
      include: { ownedBusinesses: true },
    });
    if (!owner) throw new NotFoundException('Firma egasi topilmadi');

    await this.prisma.business.updateMany({
      where: { ownerId },
      data: { planId },
    });

    return { success: true, planId };
  }

  // 2. All Businesses List
  async getAllBusinesses(search?: string, status?: string) {
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { owner: { fullName: { contains: search, mode: 'insensitive' } } },
        { owner: { phone: { contains: search } } },
      ];
    }
    if (status) {
      where.status = status;
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

    return businesses.map((b) => ({
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
    }));
  }

  // 3. Update Business Status (Block / Activate / Suspend)
  async updateBusinessStatus(id: string, status: any) {
    const business = await this.prisma.business.findUnique({ where: { id } });
    if (!business) throw new NotFoundException('Biznes topilmadi');

    return this.prisma.business.update({
      where: { id },
      data: { status },
    });
  }

  // 4. Update Business Plan (Upgrade / Downgrade)
  async updateBusinessPlan(id: string, planId: string) {
    const business = await this.prisma.business.findUnique({ where: { id } });
    if (!business) throw new NotFoundException('Biznes topilmadi');

    return this.prisma.business.update({
      where: { id },
      data: { planId },
      include: { plan: true },
    });
  }

  // 5. All Users List Across Entire Platform
  async getAllUsers(search?: string, roleFilter?: string) {
    const where: any = {};
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
        businessUsers: {
          include: {
            business: { select: { id: true, name: true, businessType: true } },
            role: { select: { id: true, name: true } },
          },
        },
        _count: {
          select: { ownedBusinesses: true },
        },
      },
      orderBy: { createdAt: 'desc' },
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
  async updateUserStatus(id: string, status: any) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');

    return this.prisma.user.update({
      where: { id },
      data: { status },
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
}
