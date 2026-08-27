import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../decorators/custom.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.getAllAndOverride<string>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const businessId = request.businessId || user?.businessId;

    if (!user) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Foydalanuvchi ma\'lumotlari topilmadi',
      });
    }

    // If no businessId yet (e.g. system level or before business creation), check user
    if (!businessId) {
      return true;
    }

    // 1. SuperAdmins have all permissions
    if (user.isSuperAdmin) {
      return true;
    }

    // 2. Check pre-resolved permissions from JwtStrategy (0ms in-memory verification)
    const userPermissions: string[] = Array.isArray(user.permissions) ? user.permissions : [];
    if (checkPermMatch(userPermissions, requiredPermission)) {
      return true;
    }

    // 3. Check if user is owner of the business in the pre-resolved context
    const isVerifiedOwner = (user as any).isOwner || (user.roleId && ['owner', 'admin'].includes(String(user.roleId).toLowerCase()));
    if (isVerifiedOwner) {
      return true;
    }

    // 4. DB Fallback (only if pre-resolved context was incomplete)
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: { ownerId: true },
    });

    if (business && business.ownerId === user.userId) {
      return true;
    }

    // Check business_user role and permissions from DB
    const businessUser = await this.prisma.businessUser.findUnique({
      where: {
        businessId_userId: {
          businessId,
          userId: user.userId,
        },
      },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!businessUser || businessUser.status !== 'active') {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Ushbu biznesda ishlash uchun ruxsat berilmagan',
      });
    }

    const roleName = businessUser.role?.name?.toLowerCase() || '';
    // Owner, SuperAdmin, Admin have full access to all actions
    if (roleName === 'owner' || roleName === 'superadmin' || roleName === 'admin') {
      return true;
    }

    const dbCodes = (businessUser.role?.rolePermissions || []).map((rp) => rp.permission?.code || '');
    if (checkPermMatch(dbCodes, requiredPermission)) {
      return true;
    }

    throw new ForbiddenException({
      code: 'FORBIDDEN',
      message: `Ushbu amalni bajarish uchun ruxsat yetarli emas (${requiredPermission})`,
    });
  }
}

function checkPermMatch(userPermissions: string[], required: string): boolean {
  if (
    userPermissions.includes('*') ||
    userPermissions.includes('ALL') ||
    userPermissions.includes(required)
  ) {
    return true;
  }

  if (required === 'products.view') {
    return userPermissions.some((p) =>
      [
        'orders.create',
        'orders.view',
        'tables.view',
        'tables.manage',
        'kds.view',
        'kds.manage',
        'inventory.create',
        'inventory.view',
        'pos.create',
        'pos.view',
        'restaurant.manage',
        'restaurant.view',
      ].includes(p),
    );
  }

  if (required === 'restaurant.view' || required === 'tables.view') {
    return userPermissions.some((p) =>
      [
        'tables.view',
        'tables.manage',
        'restaurant.view',
        'restaurant.manage',
        'orders.create',
        'orders.view',
        'kds.view',
        'kds.manage',
      ].includes(p),
    );
  }

  if (required === 'restaurant.manage' || required === 'tables.manage') {
    return userPermissions.some((p) =>
      ['tables.manage', 'restaurant.manage'].includes(p),
    );
  }

  if (required === 'restaurant.order' || required === 'restaurant.pay') {
    return userPermissions.some((p) =>
      [
        'tables.view',
        'tables.manage',
        'restaurant.manage',
        'orders.create',
        'pos.create',
      ].includes(p),
    );
  }

  if (
    required === 'restaurant.kds' ||
    required === 'kds.view' ||
    required === 'kds.manage'
  ) {
    return userPermissions.some((p) =>
      ['kds.view', 'kds.manage', 'restaurant.manage'].includes(p),
    );
  }

  return false;
}
