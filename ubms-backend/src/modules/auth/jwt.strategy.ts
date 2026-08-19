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

// Fast in-memory caching to eliminate redundant remote DB round-trips on every request
interface CachedUserAuth {
  user: any;
  cachedAt: number;
}

const userAuthCache = new Map<string, CachedUserAuth>();
const branchAuthCache = new Map<string, { belongs: boolean; cachedAt: number }>();
const USER_CACHE_TTL_MS = 60 * 1000; // 60 seconds

export function invalidateUserAuthCache(userId?: string) {
  if (userId) {
    userAuthCache.delete(userId);
  } else {
    userAuthCache.clear();
  }
  branchAuthCache.clear();
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

    let user: any = null;
    const cached = userAuthCache.get(userId);
    const now = Date.now();

    if (cached && now - cached.cachedAt < USER_CACHE_TTL_MS) {
      user = cached.user;
    } else {
      try {
        user = await this.prisma.user.findUnique({
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
      } catch (err) {
        // Resilient 1-shot retry for Supabase cloud pooler momentary drops
        try {
          await new Promise((r) => setTimeout(r, 350));
          user = await this.prisma.user.findUnique({
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
        } catch (retryErr) {
          throw new UnauthorizedException({
            code: 'DB_CONNECTION_RETRY_FAILED',
            message: 'Baza bilan vaqtinchalik aloqa uzildi. Iltimos sahifani yangilang.',
          });
        }
      }

      if (user && user.status === 'active') {
        userAuthCache.set(userId, { user, cachedAt: now });
      }
    }

    if (!user || user.status !== 'active') {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Foydalanuvchi akkaunti faol emas yoki topilmadi',
      });
    }

    // Token invalidation check (when password is changed, tokenVersion is incremented)
    if (payload.tokenVersion !== undefined && user.tokenVersion !== undefined) {
      if (payload.tokenVersion !== user.tokenVersion) {
        userAuthCache.delete(userId);
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
        const isOwner = user.ownedBusinesses.some((b: any) => b.id === requestedBizId);
        const memberBiz = user.businessUsers.find((bu: any) => bu.businessId === requestedBizId);

        if (isOwner) {
          verifiedBusinessId = requestedBizId;
        } else if (memberBiz) {
          verifiedBusinessId = requestedBizId;
          effectiveRoleId = memberBiz.roleId;
          if (memberBiz.role?.rolePermissions) {
            effectivePermissions = memberBiz.role.rolePermissions.map((rp: any) => rp.permission.code);
          }
        } else {
          // Attacker sent unauthorized businessId -> Reject or fallback to payload verified business
          if (
            payload.businessId &&
            (user.ownedBusinesses.some((b: any) => b.id === payload.businessId) ||
              user.businessUsers.some((bu: any) => bu.businessId === payload.businessId))
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

    // Strict Branch IDOR validation
    const requestedBranchId = (req.headers?.['x-branch-id'] as string) || payload.branchId;
    let verifiedBranchId: string | undefined = undefined;

    if (requestedBranchId && verifiedBusinessId) {
      if (user.isSuperAdmin) {
        verifiedBranchId = requestedBranchId;
      } else {
        // Fast in-memory check for branch ownership
        const branchKey = `${requestedBranchId}:${verifiedBusinessId}`;
        const cachedBranch = branchAuthCache.get(branchKey);
        let branchBelongs = false;

        if (cachedBranch && now - cachedBranch.cachedAt < USER_CACHE_TTL_MS) {
          branchBelongs = cachedBranch.belongs;
        } else {
          const branchRecord = await this.prisma.branch.findFirst({
            where: { id: requestedBranchId, businessId: verifiedBusinessId },
            select: { id: true },
          });
          branchBelongs = !!branchRecord;
          branchAuthCache.set(branchKey, { belongs: branchBelongs, cachedAt: now });
        }

        if (branchBelongs) {
          const isOwner = user.ownedBusinesses.some((b: any) => b.id === verifiedBusinessId);
          if (payload.branchId && payload.branchId !== requestedBranchId && !isOwner) {
            verifiedBranchId = payload.branchId;
          } else {
            verifiedBranchId = requestedBranchId;
          }
        } else {
          verifiedBranchId = payload.branchId;
        }
      }
    } else {
      verifiedBranchId = payload.branchId;
    }

    if (req) {
      req.businessId = verifiedBusinessId;
      req.branchId = verifiedBranchId;
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
      branchId: verifiedBranchId,
      roleId: effectiveRoleId,
      permissions: effectivePermissions,
    };
  }
}
