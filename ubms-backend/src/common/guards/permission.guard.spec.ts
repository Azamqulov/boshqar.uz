import { Reflector } from '@nestjs/core';
import { PermissionGuard } from './permission.guard';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';

describe('PermissionGuard', () => {
  let guard: PermissionGuard;
  let reflector: Reflector;
  let prisma: any;

  beforeEach(() => {
    reflector = new Reflector();
    prisma = {
      business: {
        findUnique: jest.fn(),
      },
      businessUser: {
        findUnique: jest.fn(),
      },
    };
    guard = new PermissionGuard(reflector, prisma);
  });

  function createMockContext(user: any, requiredPermission?: string): ExecutionContext {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredPermission);

    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          user,
          businessId: user?.businessId || 'biz-1',
          headers: {},
        }),
      }),
    } as any;
  }

  it('should allow access if no permission is required', async () => {
    const context = createMockContext({ userId: 'user-1' }, undefined);
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should throw ForbiddenException if user is not in request', async () => {
    const context = createMockContext(null, 'products:create');
    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('should allow access if user is the business owner (owner bypass)', async () => {
    const context = createMockContext({ userId: 'owner-1', businessId: 'biz-1' }, 'products:create');
    prisma.business.findUnique.mockResolvedValue({ id: 'biz-1', ownerId: 'owner-1' });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should deny access if employee does not have the required permission', async () => {
    const context = createMockContext({ userId: 'emp-1', businessId: 'biz-1' }, 'products:delete');
    prisma.business.findUnique.mockResolvedValue({ id: 'biz-1', ownerId: 'owner-1' });
    prisma.businessUser.findUnique.mockResolvedValue({
      role: {
        name: 'cashier',
        rolePermissions: [
          { permission: { module: 'pos', action: 'create' } },
        ],
      },
    });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });
});
