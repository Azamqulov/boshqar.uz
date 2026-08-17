import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SKIP_SUBSCRIPTION_KEY, IS_PUBLIC_KEY } from '../decorators/custom.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const skipSubscription = this.reflector.getAllAndOverride<boolean>(SKIP_SUBSCRIPTION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skipSubscription) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // SuperAdmins bypass all subscription checks
    if (!user || user.isSuperAdmin) {
      return true;
    }

    const businessId = request.businessId || request.headers['x-business-id'] || user.businessId;

    // If no business context (e.g. creating a business or profile operations before joining one)
    if (!businessId) {
      return true;
    }

    // Whitelist specific paths
    const url = request.originalUrl || request.url || '';
    if (
      url.includes('/auth/') ||
      url.includes('/superadmin/') ||
      url.includes('/billing/') ||
      url.includes('/businesses/types') ||
      url.includes('/businesses/plans') ||
      url.includes('/health')
    ) {
      return true;
    }

    // Check latest subscription for this tenant
    const subscription = await this.prisma.subscription.findFirst({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
      include: {
        plan: {
          select: {
            id: true,
            name: true,
            priceMonthly: true,
          },
        },
      },
    });

    if (!subscription) {
      throw new ForbiddenException({
        code: 'SUBSCRIPTION_EXPIRED',
        message: 'Ushbu biznes uchun faol obuna topilmadi. Davom etish uchun tarifni tanlang yoki administrator bilan bog\'laning.',
      });
    }

    const now = Date.now();
    const currentPeriodEndMs = new Date(subscription.currentPeriodEnd).getTime();
    const isPeriodValid = currentPeriodEndMs > now;

    if (subscription.status === 'active' && isPeriodValid) {
      return true;
    }

    if (subscription.status === 'trialing' && isPeriodValid) {
      return true;
    }

    // If subscription expired or suspended
    throw new ForbiddenException({
      code: 'SUBSCRIPTION_EXPIRED',
      message: 'Obuna yoki sinov muddati (trial) tugagan. Tizimdan to\'liq foydalanishni davom ettirish uchun tarifni faollashtiring.',
      planName: subscription.plan?.name || 'Free',
      currentPeriodEnd: subscription.currentPeriodEnd,
      status: subscription.status,
    });
  }
}
