import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmployeeStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

function generateTempPassword(): string {
  return randomBytes(4).toString('hex').toUpperCase() + '!A1';
}

function normalizePhone(raw: string): string {
  if (!raw) return '';
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('998')) {
    digits = digits.substring(3);
  }
  digits = digits.substring(0, 9);
  return '+998' + digits;
}

export interface ActionPermissionMap {
  [module: string]: {
    create?: boolean;
    edit?: boolean;
    delete?: boolean;
  };
}

export interface CreateEmployeeDto {
  fullName: string;
  phone: string;
  password?: string;
  role?: string;
  position?: string;
  branchId?: string;
  salary?: number | string;
  allowedModules?: string[];
  actionPermissions?: ActionPermissionMap;
}

export interface UpdateEmployeeDto extends Partial<CreateEmployeeDto> {
  status?: EmployeeStatus;
}

export const UI_MODULE_TO_PERM_MODULES: Record<string, string[]> = {
  pos: ['orders', 'refunds', 'pos'],
  products: ['products'],
  inventory: ['inventory'],
  customers: ['customers'],
  suppliers: ['suppliers'],
  finance: ['finance', 'reports', 'expenses', 'revenues'],
  employees: ['employees'],
  reports: ['reports'],
  restaurant: ['restaurant', 'tables', 'kds'],
  appointments: ['appointments', 'services'],
  settings: ['settings', 'audit'],
};

export function resolvePermissionModules(uiModules: string[]): string[] {
  const dbModules = new Set<string>();
  for (const mod of uiModules) {
    if (UI_MODULE_TO_PERM_MODULES[mod]) {
      UI_MODULE_TO_PERM_MODULES[mod].forEach((m) => dbModules.add(m));
    }
    dbModules.add(mod);
  }
  return Array.from(dbModules);
}

export function extractActionPermissions(
  rolePermissions: any[],
): Record<string, { create: boolean; edit: boolean; delete: boolean }> {
  const codes = new Set(
    rolePermissions.map((rp) => rp.permission?.code || rp.code || rp || ''),
  );
  return {
    pos: {
      create: codes.has('orders.create') || codes.has('pos.create'),
      edit: true,
      delete: codes.has('orders.cancel') || codes.has('pos.delete'),
    },
    products: {
      create: codes.has('products.create'),
      edit: codes.has('products.update') || codes.has('products.edit'),
      delete: codes.has('products.delete'),
    },
    inventory: {
      create: codes.has('inventory.create'),
      edit: codes.has('inventory.create') || codes.has('inventory.transfer'),
      delete: codes.has('inventory.delete'),
    },
    customers: {
      create: codes.has('customers.manage') || codes.has('customers.create'),
      edit: codes.has('customers.manage') || codes.has('customers.edit'),
      delete: codes.has('customers.delete'),
    },
    suppliers: {
      create: codes.has('suppliers.manage') || codes.has('suppliers.create'),
      edit: codes.has('suppliers.manage') || codes.has('suppliers.edit'),
      delete: codes.has('suppliers.delete'),
    },
    finance: {
      create: codes.has('finance.create'),
      edit: true,
      delete: codes.has('finance.delete'),
    },
  };
}

export function filterPermissionsByActions(
  permissions: any[],
  actionPermissions?: ActionPermissionMap,
): any[] {
  if (!actionPermissions) return permissions;
  return permissions.filter((p) => {
    const code = p.code;
    if (code === 'products.create' && actionPermissions.products?.create === false) return false;
    if (code === 'products.update' && actionPermissions.products?.edit === false) return false;
    if (code === 'products.delete' && actionPermissions.products?.delete === false) return false;

    if (code === 'orders.create' && actionPermissions.pos?.create === false) return false;
    if (code === 'orders.cancel' && actionPermissions.pos?.delete === false) return false;

    if (code === 'inventory.create' && actionPermissions.inventory?.create === false) return false;
    if (code === 'inventory.delete' && actionPermissions.inventory?.delete === false) return false;

    if (code === 'customers.delete' && actionPermissions.customers?.delete === false) return false;
    if (code === 'customers.manage' && actionPermissions.customers?.delete === false && actionPermissions.customers?.edit === false) return false;

    if (code === 'suppliers.delete' && actionPermissions.suppliers?.delete === false) return false;
    if (code === 'suppliers.manage' && actionPermissions.suppliers?.delete === false && actionPermissions.suppliers?.edit === false) return false;

    return true;
  });
}

export function mapPermModulesToUiModules(permModules: string[]): string[] {
  const uiModules = new Set<string>();
  const dbSet = new Set(permModules);
  if (dbSet.has('orders') || dbSet.has('refunds') || dbSet.has('pos')) uiModules.add('pos');
  if (dbSet.has('products')) uiModules.add('products');
  if (dbSet.has('inventory')) uiModules.add('inventory');
  if (dbSet.has('customers')) uiModules.add('customers');
  if (dbSet.has('suppliers')) uiModules.add('suppliers');
  if (dbSet.has('finance') || dbSet.has('expenses') || dbSet.has('revenues')) uiModules.add('finance');
  if (dbSet.has('employees')) uiModules.add('employees');
  if (dbSet.has('reports')) uiModules.add('reports');
  if (dbSet.has('restaurant') || dbSet.has('tables') || dbSet.has('kds')) uiModules.add('restaurant');
  if (dbSet.has('appointments') || dbSet.has('services')) uiModules.add('appointments');
  if (dbSet.has('settings') || dbSet.has('audit')) uiModules.add('settings');
  for (const m of permModules) {
    if (UI_MODULE_TO_PERM_MODULES[m]) uiModules.add(m);
  }
  return Array.from(uiModules);
}

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async findAll(businessId: string, branchId?: string) {
    const where: any = { businessId };
    if (branchId) where.branchId = branchId;

    const employees = await this.prisma.employee.findMany({
      where,
      include: {
        branch: true,
        user: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
            status: true,
            businessUsers: {
              where: { businessId },
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
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return employees.map((emp) => {
      const bu = emp.user?.businessUsers?.[0];
      const perms = bu?.role?.rolePermissions?.map((rp) => rp.permission.module) || [];
      const allowedModules = mapPermModulesToUiModules(perms);
      const isOwner = bu?.role?.name === 'Owner';
      const actionPermissions = isOwner
        ? {
            pos: { create: true, edit: true, delete: true },
            products: { create: true, edit: true, delete: true },
            inventory: { create: true, edit: true, delete: true },
            customers: { create: true, edit: true, delete: true },
            suppliers: { create: true, edit: true, delete: true },
            finance: { create: true, edit: true, delete: true },
          }
        : extractActionPermissions(bu?.role?.rolePermissions || []);

      return {
        id: emp.id,
        userId: emp.userId,
        fullName: emp.fullName,
        phone: emp.phone,
        position: emp.position,
        salary: emp.salary,
        branchId: emp.branchId,
        branchName: emp.branch?.name,
        roleName: bu?.role?.name || emp.position,
        allowedModules: isOwner ? ['all'] : (allowedModules.length > 0 ? allowedModules : ['pos']),
        actionPermissions,
        status: emp.status,
        createdAt: emp.createdAt,
      };
    });
  }

  async create(businessId: string, data: CreateEmployeeDto) {
    if (!data.fullName || !data.phone) {
      throw new BadRequestException('Ism va telefon raqam kiritilishi shart');
    }

    const cleanPhone = normalizePhone(data.phone);

    // 1. Check if employee with this phone already exists in this business
    const existingEmp = await this.prisma.employee.findFirst({
      where: {
        businessId,
        OR: [
          { phone: cleanPhone },
          { phone: data.phone },
        ],
      },
    });

    if (existingEmp) {
      throw new BadRequestException(
        `"${cleanPhone}" raqamiga ega xodim ushbu biznesda allaqachon mavjud!`,
      );
    }

    // Check if phone belongs to business owner
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      include: { owner: true },
    });

    if (business?.owner?.phone === cleanPhone) {
      throw new BadRequestException(
        'Ushbu raqam biznes egasiga tegishli. Egasi barcha huquqlarga avtomatik ega.',
      );
    }

    const tempPassword = data.password || generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    const selectedModules: string[] = data.allowedModules || ['pos'];
    const resolvedDbModules = resolvePermissionModules(selectedModules);

    // 2. Pre-fetch permissions and default branch outside transaction for maximum speed
    const [rawPermissions, defaultBranch] = await Promise.all([
      this.prisma.permission.findMany({
        where: {
          module: { in: resolvedDbModules },
        },
      }),
      this.prisma.branch.findFirst({
        where: { businessId },
      }),
    ]);

    const permissions = filterPermissionsByActions(rawPermissions, data.actionPermissions);
    const branchId = data.branchId || defaultBranch?.id;

    // 3. Execute fast writes inside transaction with generous timeout
    return this.prisma.$transaction(
      async (tx) => {
        // Find or create user
        let user = await tx.user.findFirst({
          where: {
            OR: [
              { phone: cleanPhone },
              { phone: data.phone },
            ],
          },
        });

        if (!user) {
          user = await tx.user.create({
            data: {
              fullName: data.fullName,
              phone: cleanPhone,
              passwordHash,
              status: 'active',
            },
          });
        } else {
          // Update password if specified
          await tx.user.update({
            where: { id: user.id },
            data: {
              fullName: data.fullName,
              passwordHash,
            },
          });
        }

        // Create or find custom role for this employee/position
        const roleName = data.position || 'Xodim';
        const role = await tx.role.create({
          data: {
            businessId,
            name: roleName,
            isSystem: false,
          },
        });

        // Associate permissions
        if (permissions.length > 0) {
          await tx.rolePermission.createMany({
            data: permissions.map((p) => ({
              roleId: role.id,
              permissionId: p.id,
            })),
          });
        }

        // Link BusinessUser
        await tx.businessUser.upsert({
          where: {
            businessId_userId: {
              businessId,
              userId: user.id,
            },
          },
          update: {
            roleId: role.id,
            branchId,
            status: 'active',
          },
          create: {
            businessId,
            userId: user.id,
            roleId: role.id,
            branchId,
            status: 'active',
          },
        });

        // Create Employee profile
        const employee = await tx.employee.create({
          data: {
            businessId,
            branchId,
            userId: user.id,
            fullName: data.fullName,
            phone: cleanPhone,
            position: roleName,
            salary: data.salary ? Number(data.salary) : null,
            status: 'active',
          },
          include: { branch: true },
        });

        return {
          ...employee,
          tempPassword: data.password ? undefined : tempPassword,
          allowedModules: selectedModules,
        };
      },
      {
        maxWait: 15000,
        timeout: 30000,
      },
    );
  }

  async update(businessId: string, id: string, data: UpdateEmployeeDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!employee || employee.businessId !== businessId) {
      throw new NotFoundException('Xodim topilmadi');
    }

    if (data.phone) {
      const cleanPhone = normalizePhone(data.phone);
      const duplicate = await this.prisma.employee.findFirst({
        where: {
          businessId,
          phone: cleanPhone,
          id: { not: id },
        },
      });
      if (duplicate) {
        throw new BadRequestException(
          `"${cleanPhone}" raqamiga ega boshqa xodim allaqachon mavjud!`,
        );
      }
    }

    const selectedModules = data.allowedModules;
    let permissions: Array<{ id: string; code: string; module: string; description: string }> = [];
    if (selectedModules) {
      const resolvedDbModules = resolvePermissionModules(selectedModules);
      const rawPermissions = await this.prisma.permission.findMany({
        where: { module: { in: resolvedDbModules } },
      });
      permissions = filterPermissionsByActions(rawPermissions, data.actionPermissions);
    }

    return this.prisma.$transaction(
      async (tx) => {
        const cleanPhone = data.phone ? normalizePhone(data.phone) : employee.phone;

        // Update employee details
        const updated = await tx.employee.update({
          where: { id },
          data: {
            fullName: data.fullName || employee.fullName,
            phone: cleanPhone,
            position: data.position || employee.position,
            salary: data.salary !== undefined ? (data.salary ? Number(data.salary) : null) : employee.salary,
            status: data.status || employee.status,
          },
        });

        // Update User table if employee has linked user
        if (employee.userId) {
          const userUpdateData: any = {
            fullName: data.fullName || employee.fullName,
            phone: cleanPhone,
          };
          if (data.password && data.password.trim()) {
            userUpdateData.passwordHash = await bcrypt.hash(data.password.trim(), 10);
          }
          await tx.user.update({
            where: { id: employee.userId },
            data: userUpdateData,
          });
        }

        // If allowedModules updated, update role permissions
        if (selectedModules && employee.userId) {
          const bu = await tx.businessUser.findUnique({
            where: {
              businessId_userId: {
                businessId,
                userId: employee.userId,
              },
            },
          });

          if (bu) {
            await tx.rolePermission.deleteMany({
              where: { roleId: bu.roleId },
            });

            if (permissions.length > 0) {
              await tx.rolePermission.createMany({
                data: permissions.map((p) => ({
                  roleId: bu.roleId,
                  permissionId: p.id,
                })),
              });
            }
          }
        }

        return updated;
      },
      {
        maxWait: 15000,
        timeout: 30000,
      },
    );
  }

  async delete(businessId: string, id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
    });

    if (!employee || employee.businessId !== businessId) {
      throw new NotFoundException('Xodim topilmadi');
    }

    return this.prisma.$transaction(
      async (tx) => {
        if (employee.userId) {
          await tx.businessUser.deleteMany({
            where: {
              businessId,
              userId: employee.userId,
            },
          });
        }

        await tx.employee.delete({
          where: { id },
        });

        return { success: true, message: 'Xodim o\'chirildi' };
      },
      {
        maxWait: 15000,
        timeout: 30000,
      },
    );
  }

  async getRoles(businessId: string) {
    return this.prisma.role.findMany({
      where: {
        OR: [{ businessId: null }, { businessId }],
      },
      include: {
        rolePermissions: {
          include: { permission: true },
        },
      },
    });
  }

  async getPermissions() {
    return this.prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { code: 'asc' }],
    });
  }
}
