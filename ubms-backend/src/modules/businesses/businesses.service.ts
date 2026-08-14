import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BusinessType } from '@prisma/client';
import { getBusinessTypesConfig } from '../../common/config/business-types.config';
import { mapPermModulesToUiModules } from '../employees/employees.service';

export interface CreateBusinessDto {
  name: string;
  businessType: BusinessType;
  branchName?: string;
  branchAddress?: string;
  branchPhone?: string;
  currency?: string;
  timezone?: string;
}

@Injectable()
export class BusinessesService {
  constructor(private prisma: PrismaService) {}

  getAvailableTypes() {
    const configs = getBusinessTypesConfig();
    return configs.filter((c) => c.isEnabled);
  }

  async create(userId: string, dto: CreateBusinessDto) {
    // 0. Verify Business Type is enabled by SuperAdmin
    const configs = getBusinessTypesConfig();
    const typeConfig = configs.find((c) => c.type === dto.businessType);
    if (typeConfig && !typeConfig.isEnabled) {
      throw new ForbiddenException(`"${typeConfig.label}" biznes turi hozirda tizimda ro'yxatdan o'tish uchun vaqtincha to'xtatilgan.`);
    }

    // 1. Get Free Plan
    const defaultPlan = await this.prisma.plan.findFirst({
      where: { name: 'Free' },
    });

    // 2. Get Owner Role
    const ownerRole = await this.prisma.role.findFirst({
      where: { name: 'Owner', isSystem: true },
    });

    // 3. Create Business, default branch, business_user in transaction
    return this.prisma.$transaction(async (tx) => {
      const business = await tx.business.create({
        data: {
          name: dto.name,
          businessType: dto.businessType,
          ownerId: userId,
          planId: defaultPlan?.id || '00000000-0000-0000-0000-000000000001',
          currency: dto.currency || 'UZS',
          timezone: dto.timezone || 'Asia/Tashkent',
          status: 'active',
        },
      });

      const branch = await tx.branch.create({
        data: {
          businessId: business.id,
          name: dto.branchName || 'Bosh filial',
          address: dto.branchAddress || null,
          phone: dto.branchPhone || null,
          isMain: true,
          status: 'active',
        },
      });

      await tx.businessUser.create({
        data: {
          businessId: business.id,
          userId,
          roleId: ownerRole?.id || '00000000-0000-0000-0000-000000000010',
          branchId: null, // Owner has access to all branches
          status: 'active',
        },
      });

      // Add default payment methods for this business
      await tx.paymentMethod.createMany({
        data: [
          { businessId: business.id, name: 'Naqd pul', type: 'cash', isActive: true },
          { businessId: business.id, name: 'Plastik karta', type: 'card', isActive: true },
          { businessId: business.id, name: 'Click', type: 'click', isActive: true },
          { businessId: business.id, name: 'Payme', type: 'payme', isActive: true },
        ],
      });

      // If restaurant or cafe, create default tables
      if (['restaurant', 'cafe'].includes(dto.businessType)) {
        await tx.table.createMany({
          data: [
            { branchId: branch.id, name: 'Stol #1', capacity: 4, status: 'available' },
            { branchId: branch.id, name: 'Stol #2', capacity: 4, status: 'available' },
            { branchId: branch.id, name: 'Stol #3', capacity: 6, status: 'available' },
            { branchId: branch.id, name: 'Stol #4', capacity: 2, status: 'available' },
            { branchId: branch.id, name: 'VIP Stol', capacity: 8, status: 'available' },
          ],
        });
      }

      // If barbershop or service, create demo services
      if (['barbershop', 'service'].includes(dto.businessType)) {
        await tx.service.createMany({
          data: [
            { businessId: business.id, name: 'Soch turmaklash', price: 60000, durationMinutes: 30, status: 'active' },
            { businessId: business.id, name: 'Soqol olish va shakl berish', price: 40000, durationMinutes: 20, status: 'active' },
            { businessId: business.id, name: 'Kompleks xizmat (Soch + Soqol)', price: 90000, durationMinutes: 50, status: 'active' },
          ],
        });
      }

      return {
        business,
        branch,
      };
    });
  }

  async findAllForUser(userId: string) {
    const businessUsers = await this.prisma.businessUser.findMany({
      where: { userId, status: 'active' },
      include: {
        business: {
          include: {
            branches: true,
          },
        },
        role: {
          include: {
            rolePermissions: {
              include: { permission: true },
            },
          },
        },
        branch: true,
      },
    });

    return businessUsers.map((bu) => {
      const perms = bu.role?.rolePermissions?.map((rp) => rp.permission.module) || [];
      const allowedModules = bu.role?.name === 'Owner' ? ['all'] : mapPermModulesToUiModules(perms);
      return {
        id: bu.business.id,
        name: bu.business.name,
        businessType: bu.business.businessType,
        currency: bu.business.currency,
        timezone: bu.business.timezone,
        status: bu.business.status,
        role: bu.role.name,
        branches: bu.business.branches,
        allowedModules: allowedModules.length > 0 ? allowedModules : ['pos'],
      };
    });
  }

  async findOne(id: string, userId: string) {
    const business = await this.prisma.business.findUnique({
      where: { id },
      include: {
        branches: true,
        plan: true,
      },
    });

    if (!business) {
      throw new NotFoundException({
        code: 'BUSINESS_NOT_FOUND',
        message: 'Biznes topilmadi',
      });
    }

    return business;
  }

  async update(id: string, data: Partial<CreateBusinessDto>) {
    return this.prisma.business.update({
      where: { id },
      data: {
        name: data.name,
        currency: data.currency,
        timezone: data.timezone,
      },
    });
  }

  // Delete business and all associated data
  async deleteBusiness(businessId: string, userId: string) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Biznes topilmadi');
    }

    // Verify user is owner or superadmin
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (business.ownerId !== userId && !user?.isSuperAdmin) {
      throw new ForbiddenException('Faqat biznes egasi yoki SuperAdmin bu jamoani o\'chira oladi');
    }

    // Cascade delete business
    await this.prisma.business.delete({
      where: { id: businessId },
    });

    return { success: true, message: 'Biznes va barcha ma\'lumotlar muvaffaqiyatli o\'chirildi' };
  }

  // Delete user personal account
  async deleteAccount(userId: string) {
    // Delete any businesses owned exclusively by user
    const ownedBusinesses = await this.prisma.business.findMany({
      where: { ownerId: userId },
    });

    for (const b of ownedBusinesses) {
      await this.prisma.business.delete({ where: { id: b.id } }).catch(() => {});
    }

    await this.prisma.user.delete({
      where: { id: userId },
    });

    return { success: true, message: 'Hisobingiz to\'liq o\'chirildi' };
  }
}
