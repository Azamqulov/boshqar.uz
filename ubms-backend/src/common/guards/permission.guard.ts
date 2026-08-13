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
    const businessId = request.businessId || request.headers['x-business-id'] || user?.businessId;

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

    // Check if user is owner of the business (Owner has all permissions)
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });

    if (business && business.ownerId === user.userId) {
      return true;
    }

    // Check business_user role and permissions
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

    const hasPermission = businessUser.role.rolePermissions.some(
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
