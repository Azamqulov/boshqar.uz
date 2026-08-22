import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Faqat SuperAdmin uchun ruxsat berilgan',
      });
    }

    if (user.isSuperAdmin === true) {
      return true;
    }

    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.userId },
      select: { isSuperAdmin: true, status: true },
    });

    if (!dbUser || !dbUser.isSuperAdmin || dbUser.status !== 'active') {
      throw new ForbiddenException({
        code: 'SUPERADMIN_REQUIRED',
        message: 'Ushbu amalni bajarish uchun SuperAdmin huquqi talab qilinadi',
      });
    }

    return true;
  }
}
