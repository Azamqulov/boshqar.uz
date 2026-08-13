import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtPayload {
  sub?: string;
  userId?: string;
  businessId?: string;
  branchId?: string;
  roleId?: string;
  permissions?: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  async validate(payload: JwtPayload) {
    const userId = payload.sub || payload.userId;

    if (!userId) {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Token identifikatori topilmadi',
      });
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.status !== 'active') {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Foydalanuvchi akkaunti faol emas yoki topilmadi',
      });
    }

    return {
      userId: user.id,
      id: user.id,
      sub: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      isSuperAdmin: user.isSuperAdmin,
      businessId: payload.businessId,
      branchId: payload.branchId,
      roleId: payload.roleId,
      permissions: payload.permissions || [],
    };
  }
}
