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
    if (userPermissions.includes('*') || userPermissions.includes('ALL') || userPermissions.includes(requiredPermission)) {
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

    const hasPermission = businessUser.role?.rolePermissions?.some(
      (rp) => rp.permission.code === requiredPermission,
    );

    if (!hasPermission) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: `Sizda ushbu amalni bajarish uchun ruxsat (${requiredPermission}) yo'q`,
      });
    }

    return true;
  }
}
