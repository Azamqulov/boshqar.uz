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
  tokenVersion?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: JwtPayload) {
    const userId = payload.sub || payload.userId;

    if (!userId) {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Token identifikatori topilmadi',
      });
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        businessUsers: {
          where: { status: 'active' },
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
        ownedBusinesses: true,
      },
    });

    if (!user || user.status !== 'active') {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Foydalanuvchi akkaunti faol emas yoki topilmadi',
      });
    }

    // Token invalidation check (when password is changed, tokenVersion is incremented)
    if (payload.tokenVersion !== undefined && user.tokenVersion !== undefined) {
      if (payload.tokenVersion !== user.tokenVersion) {
        throw new UnauthorizedException({
          code: 'TOKEN_REVOKED',
          message: 'Parol o\'zgarganligi sababli seans bekor qilingan. Iltimos, qaytadan kiring.',
        });
      }
    }

    // Strict Multi-Tenant IDOR validation
    const requestedBizId = (req.headers?.['x-business-id'] as string) || payload.businessId;
    let verifiedBusinessId: string | undefined = undefined;
    let effectiveRoleId: string | undefined = payload.roleId;
    let effectivePermissions: string[] = payload.permissions || [];

    if (requestedBizId) {
      if (user.isSuperAdmin) {
        verifiedBusinessId = requestedBizId;
      } else {
        const isOwner = user.ownedBusinesses.some((b) => b.id === requestedBizId);
        const memberBiz = user.businessUsers.find((bu) => bu.businessId === requestedBizId);

        if (isOwner) {
          verifiedBusinessId = requestedBizId;
        } else if (memberBiz) {
          verifiedBusinessId = requestedBizId;
          effectiveRoleId = memberBiz.roleId;
          if (memberBiz.role?.rolePermissions) {
            effectivePermissions = memberBiz.role.rolePermissions.map((rp) => rp.permission.code);
          }
        } else {
          // Attacker sent unauthorized businessId -> Reject or fallback to payload verified business
          if (
            payload.businessId &&
            (user.ownedBusinesses.some((b) => b.id === payload.businessId) ||
              user.businessUsers.some((bu) => bu.businessId === payload.businessId))
          ) {
            verifiedBusinessId = payload.businessId;
          } else if (user.ownedBusinesses.length > 0) {
            verifiedBusinessId = user.ownedBusinesses[0].id;
          } else if (user.businessUsers.length > 0) {
            verifiedBusinessId = user.businessUsers[0].businessId;
          }
        }
      }
    } else {
      if (user.isSuperAdmin) {
        verifiedBusinessId = undefined;
      } else if (user.ownedBusinesses.length > 0) {
        verifiedBusinessId = user.ownedBusinesses[0].id;
      } else if (user.businessUsers.length > 0) {
        verifiedBusinessId = user.businessUsers[0].businessId;
      }
    }

    if (req) {
      req.businessId = verifiedBusinessId;
    }

    return {
      userId: user.id,
      id: user.id,
      sub: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      isSuperAdmin: user.isSuperAdmin,
      businessId: verifiedBusinessId,
      branchId: payload.branchId,
      roleId: effectiveRoleId,
      permissions: effectivePermissions,
    };
  }
}
