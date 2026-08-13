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

export interface CreateEmployeeDto {
  fullName: string;
  phone: string;
  password?: string;
  role?: string;
  position?: string;
  branchId?: string;
  salary?: number | string;
  allowedModules?: string[];
}

export interface UpdateEmployeeDto extends Partial<CreateEmployeeDto> {
  status?: EmployeeStatus;
}

const UI_MODULE_TO_PERM_MODULES: Record<string, string[]> = {
  pos: ['orders', 'refunds', 'products', 'inventory', 'customers'],
  products: ['products', 'inventory'],
  inventory: ['inventory', 'products'],
  customers: ['customers'],
  suppliers: ['suppliers'],
  finance: ['finance', 'reports'],
  employees: ['employees'],
  reports: ['reports'],
  restaurant: ['restaurant', 'orders'],
  appointments: ['appointments', 'orders'],
  settings: ['settings', 'audit'],
};

function resolvePermissionModules(uiModules: string[]): string[] {
  const dbModules = new Set<string>();
  for (const mod of uiModules) {
    if (UI_MODULE_TO_PERM_MODULES[mod]) {
      UI_MODULE_TO_PERM_MODULES[mod].forEach((m) => dbModules.add(m));
    } else {
      dbModules.add(mod);
    }
  }
  return Array.from(dbModules);
}

function mapPermModulesToUiModules(permModules: string[]): string[] {
  const uiModules = new Set<string>();
  const dbSet = new Set(permModules);
  if (dbSet.has('orders') || dbSet.has('refunds')) uiModules.add('pos');
  if (dbSet.has('products')) uiModules.add('products');
  if (dbSet.has('inventory')) uiModules.add('inventory');
  if (dbSet.has('customers')) uiModules.add('customers');
  if (dbSet.has('suppliers')) uiModules.add('suppliers');
  if (dbSet.has('finance')) uiModules.add('finance');
  if (dbSet.has('employees')) uiModules.add('employees');
  if (dbSet.has('reports')) uiModules.add('reports');
  if (dbSet.has('restaurant')) uiModules.add('restaurant');
  if (dbSet.has('appointments')) uiModules.add('appointments');
  if (dbSet.has('settings')) uiModules.add('settings');
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
        allowedModules: bu?.role?.name === 'Owner' ? ['all'] : (allowedModules.length > 0 ? allowedModules : ['pos']),
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
    const [permissions, defaultBranch] = await Promise.all([
      this.prisma.permission.findMany({
        where: {
          module: { in: resolvedDbModules },
        },
      }),
      this.prisma.branch.findFirst({
        where: { businessId },
      }),
    ]);

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
      permissions = await this.prisma.permission.findMany({
        where: { module: { in: resolvedDbModules } },
      });
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
