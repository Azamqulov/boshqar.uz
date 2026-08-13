import { SuperAdminGuard } from './super-admin.guard';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';

describe('SuperAdminGuard', () => {
  let guard: SuperAdminGuard;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
      },
    };
    guard = new SuperAdminGuard(prisma);
  });

  function createMockContext(user: any): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as any;
  }

  it('should allow access if user is active SuperAdmin', async () => {
    const context = createMockContext({ userId: 'sa-1' });
    prisma.user.findUnique.mockResolvedValue({ isSuperAdmin: true, status: 'active' });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should throw ForbiddenException if user is not superadmin', async () => {
    const context = createMockContext({ userId: 'regular-user' });
    prisma.user.findUnique.mockResolvedValue({ isSuperAdmin: false, status: 'active' });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if user status is blocked', async () => {
    const context = createMockContext({ userId: 'blocked-sa' });
    prisma.user.findUnique.mockResolvedValue({ isSuperAdmin: true, status: 'blocked' });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });
});
