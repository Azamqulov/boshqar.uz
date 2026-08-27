import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma, UserStatus, BusinessStatus } from '@prisma/client';
import { getBusinessTypesConfig, toggleBusinessTypeConfig } from '../../../common/config/business-types.config';
import { invalidateUserAuthCache } from '../../auth/jwt.strategy';
import { invalidateSubscriptionCache } from '../../../common/guards/subscription.guard';
import { invalidateAnalyticsCache } from './super-admin-analytics.service';

interface SuperAdminCacheEntry<T> {
  data: T;
  expiresAt: number;
}

let plansCache: SuperAdminCacheEntry<any> | null = null;
let businessTypesCache: SuperAdminCacheEntry<any> | null = null;

export function invalidateTenantsCache() {
  plansCache = null;
  businessTypesCache = null;
  invalidateAnalyticsCache();
}

@Injectable()
export class SuperAdminTenantsService {
  constructor(private prisma: PrismaService) {}

  // 1. Owners Monitoring
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

    const formattedOwners = owners.map((o) => {
      const business = o.ownedBusinesses[0];
      const lifetimeGMV = business ? gmvMap.get(business.id) || 0 : 0;

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

    const lifetimeAgg = await this.prisma.order.aggregate({
      where: { businessId: business.id, status: 'completed' },
      _sum: { total: true },
      _count: { id: true },
    });

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

    invalidateUserAuthCache(ownerId);
    invalidateTenantsCache();
    for (const b of owner.ownedBusinesses) {
      invalidateSubscriptionCache(b.id);
    }

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
    const periodEnd =
      durationDays <= 0
        ? new Date(now.getTime() - 24 * 60 * 60 * 1000)
        : new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

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
            status: durationDays <= 0 ? 'past_due' : 'active',
            currentPeriodStart: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
            currentPeriodEnd: periodEnd,
            cancelAtPeriodEnd: false,
          },
        });
      }
    });

    invalidateUserAuthCache(ownerId);
    invalidateTenantsCache();
    for (const b of owner.ownedBusinesses) {
      invalidateSubscriptionCache(b.id);
    }

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
        daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        isExpired = diffMs <= 0 || activeSub.status === 'past_due' || activeSub.status === 'cancelled';
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

  async updateBusinessStatus(id: string, status: string | BusinessStatus) {
    const business = await this.prisma.business.findUnique({ where: { id } });
    if (!business) throw new NotFoundException('Biznes topilmadi');

    const updated = await this.prisma.business.update({
      where: { id },
      data: { status: status as BusinessStatus },
    });

    invalidateSubscriptionCache(id);
    invalidateTenantsCache();
    return updated;
  }

  async updateBusinessPlan(id: string, planId: string, durationDays = 30) {
    const business = await this.prisma.business.findUnique({ where: { id } });
    if (!business) throw new NotFoundException('Biznes topilmadi');

    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Tarif rejasi topilmadi');

    const now = new Date();
    const periodEnd =
      durationDays <= 0
        ? new Date(now.getTime() - 24 * 60 * 60 * 1000)
        : new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedBusiness = await tx.business.update({
        where: { id },
        data: { planId, status: 'active' },
        include: { plan: true },
      });

      await tx.subscription.create({
        data: {
          businessId: id,
          planId,
          status: durationDays <= 0 ? 'past_due' : 'active',
          currentPeriodStart: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: false,
        },
      });

      return updatedBusiness;
    });

    invalidateSubscriptionCache(id);
    invalidateTenantsCache();
    return updated;
  }

  async getAllUsers(search?: string) {
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

  async updateUserStatus(id: string, status: string | UserStatus) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');

    if (user.isSuperAdmin && (status === 'blocked' || status === 'suspended')) {
      throw new BadRequestException(
        "SuperAdmin akkauntini bloklash taqiqlanadi! Tizim boshqaruvsiz qolmasligi uchun SuperAdmin doim faol bo'lishi shart.",
      );
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { status: status as UserStatus },
    });

    invalidateUserAuthCache(id);
    invalidateTenantsCache();
    return updated;
  }

  async toggleSuperAdmin(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isSuperAdmin: !user.isSuperAdmin },
    });

    invalidateUserAuthCache(id);
    invalidateTenantsCache();
    return updated;
  }

  async getPlans() {
    if (plansCache && plansCache.expiresAt > Date.now()) {
      return plansCache.data;
    }
    const plans = await this.prisma.plan.findMany({ orderBy: { priceMonthly: 'asc' } });
    plansCache = {
      data: plans,
      expiresAt: Date.now() + 120_000,
    };
    return plans;
  }

  async updatePlan(
    id: string,
    dto: { name?: string; priceMonthly?: number; maxBranches?: number; maxUsers?: number; features?: any },
  ) {
    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.priceMonthly !== undefined) data.priceMonthly = dto.priceMonthly;
    if (dto.maxBranches !== undefined) {
      const val = Number(dto.maxBranches);
      data.maxBranches = (!val || val <= 0 || val >= 99999 || isNaN(val)) ? null : Math.min(Math.floor(val), 2147483647);
    }
    if (dto.maxUsers !== undefined) {
      const val = Number(dto.maxUsers);
      data.maxUsers = (!val || val <= 0 || val >= 99999 || isNaN(val)) ? null : Math.min(Math.floor(val), 2147483647);
    }
    if (dto.features !== undefined) data.features = dto.features;

    const res = await this.prisma.plan.update({
      where: { id },
      data,
    });
    invalidateTenantsCache();
    return res;
  }

  async getBusinessTypes() {
    if (businessTypesCache && businessTypesCache.expiresAt > Date.now()) {
      return businessTypesCache.data;
    }
    const configs = getBusinessTypesConfig();
    const typeCounts = await this.prisma.business.groupBy({
      by: ['businessType'],
      _count: { id: true },
    });

    const countMap = new Map<string, number>();
    typeCounts.forEach((tc) => {
      countMap.set(tc.businessType, tc._count.id);
    });

    const res = configs.map((c) => ({
      ...c,
      count: countMap.get(c.type) || 0,
    }));

    businessTypesCache = {
      data: res,
      expiresAt: Date.now() + 120_000,
    };
    return res;
  }

  async toggleBusinessType(type: string, isEnabled?: boolean) {
    invalidateTenantsCache();
    return toggleBusinessTypeConfig(type, isEnabled);
  }

  getMaintenanceStatus() {
    return getMaintenanceConfig();
  }

  updateMaintenanceStatus(dto: Partial<MaintenanceConfig>) {
    return setMaintenanceConfig(dto);
  }
}

export interface MaintenanceConfig {
  isMaintenance: boolean;
  title: string;
  message: string;
  estimatedEndTime?: string;
  updatedAt: string;
}

let maintenanceState: MaintenanceConfig = {
  isMaintenance: false,
  title: 'Texnik profilaktika ishlari olib borilmoqda',
  message: 'Tizimni yangilash va optimallashtirish ishlari ketmoqda. Tez orada barcha xizmatlar to\'liq quvvatda ishga tushadi.',
  estimatedEndTime: '20 daqiqadan so\'ng',
  updatedAt: new Date().toISOString(),
};

export function getMaintenanceConfig(): MaintenanceConfig {
  return maintenanceState;
}

export function setMaintenanceConfig(dto: Partial<MaintenanceConfig>): MaintenanceConfig {
  maintenanceState = {
    ...maintenanceState,
    ...dto,
    updatedAt: new Date().toISOString(),
  };
  return maintenanceState;
}
