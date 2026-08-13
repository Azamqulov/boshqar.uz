import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

function normalizePhone(raw: string): string {
  if (!raw) return '';
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('998')) {
    digits = digits.substring(3);
  }
  digits = digits.substring(0, 9);
  return '+998' + digits;
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
      const allowedModules = Array.from(new Set(perms));

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

  async create(businessId: string, data: any) {
    if (!data.fullName || !data.phone) {
      throw new BadRequestException('Ism va telefon raqam kiritilishi shart');
    }

    const cleanPhone = normalizePhone(data.phone);
    const password = data.password || 'Staff12345!';
    const passwordHash = await bcrypt.hash(password, 10);
    const selectedModules: string[] = data.allowedModules || ['pos'];

    // 1. Pre-fetch permissions and default branch outside transaction for maximum speed
    const [permissions, defaultBranch] = await Promise.all([
      this.prisma.permission.findMany({
        where: {
          module: { in: selectedModules },
        },
      }),
      this.prisma.branch.findFirst({
        where: { businessId },
      }),
    ]);

    const branchId = data.branchId || defaultBranch?.id;

    // 2. Execute fast writes inside transaction with generous timeout
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
          allowedModules: selectedModules,
        };
      },
      {
        maxWait: 15000,
        timeout: 30000,
      },
    );
  }

  async update(businessId: string, id: string, data: any) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!employee || employee.businessId !== businessId) {
      throw new NotFoundException('Xodim topilmadi');
    }

    const selectedModules = data.allowedModules;
    let permissions: any[] = [];
    if (selectedModules) {
      permissions = await this.prisma.permission.findMany({
        where: { module: { in: selectedModules } },
      });
    }

    return this.prisma.$transaction(
      async (tx) => {
        // Update employee details
        const updated = await tx.employee.update({
          where: { id },
          data: {
            fullName: data.fullName,
            phone: data.phone ? normalizePhone(data.phone) : employee.phone,
            position: data.position,
            salary: data.salary ? Number(data.salary) : employee.salary,
            status: data.status || employee.status,
          },
        });

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
