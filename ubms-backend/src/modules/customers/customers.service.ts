import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

function normalizePhone(raw?: string): string | null {
  if (!raw) return null;
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('998')) {
    digits = digits.substring(3);
  }
  digits = digits.substring(0, 9);
  return digits.length > 0 ? `+998${digits}` : null;
}

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll(businessId: string, search?: string) {
    const where: any = { businessId };
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.customer.findMany({
      where,
      orderBy: [{ debt: 'desc' }, { totalSpent: 'desc' }],
    });
  }

  async findOne(businessId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, businessId },
      include: {
        orders: {
          include: {
            items: {
              include: {
                product: true,
                service: true,
              },
            },
            payments: {
              include: {
                paymentMethod: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 30,
        },
        appointments: {
          include: { service: true },
          orderBy: { scheduledAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!customer) {
      throw new NotFoundException({ code: 'CUSTOMER_NOT_FOUND', message: 'Mijoz topilmadi' });
    }

    return customer;
  }

  async create(businessId: string, data: { fullName: string; phone?: string; birthDate?: string; notes?: string; debt?: number }) {
    const phone = normalizePhone(data.phone);
    return this.prisma.customer.create({
      data: {
        businessId,
        fullName: data.fullName,
        phone,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        notes: data.notes || null,
        debt: Number(data.debt) || 0,
      },
    });
  }

  async update(businessId: string, id: string, data: any) {
    const phone = data.phone ? normalizePhone(data.phone) : undefined;
    return this.prisma.customer.update({
      where: { id },
      data: {
        fullName: data.fullName,
        phone,
        notes: data.notes,
        debt: data.debt !== undefined ? Number(data.debt) : undefined,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
      },
    });
  }

  async addDebt(businessId: string, customerId: string, amount: number, notes?: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, businessId },
    });
    if (!customer) {
      throw new NotFoundException({ code: 'CUSTOMER_NOT_FOUND', message: 'Mijoz topilmadi' });
    }

    const newDebt = Number(customer.debt) + Number(amount);
    const dateFormatted = new Date().toLocaleDateString('uz-UZ');
    const noteEntry = `[${dateFormatted}] +Qarz: ${Number(amount).toLocaleString('uz-UZ')} so'm${notes ? ` (${notes})` : ''}`;
    const updatedNotes = customer.notes ? `${customer.notes}\n${noteEntry}` : noteEntry;

    return this.prisma.customer.update({
      where: { id: customerId },
      data: {
        debt: newDebt,
        notes: updatedNotes,
      },
    });
  }

  async payDebt(businessId: string, branchId: string | null, customerId: string, amount: number, notes?: string) {
    return this.prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findFirst({
        where: { id: customerId, businessId },
      });

      if (!customer) {
        throw new NotFoundException({ code: 'CUSTOMER_NOT_FOUND', message: 'Mijoz topilmadi' });
      }

      let resolvedBranchId = branchId;
      if (!resolvedBranchId) {
        const branch = await tx.branch.findFirst({
          where: { businessId },
          orderBy: { isMain: 'desc' },
        });
        resolvedBranchId = branch?.id || null;
      }

      const newDebt = Math.max(0, Number(customer.debt) - Number(amount));
      const dateFormatted = new Date().toLocaleDateString('uz-UZ');
      const noteEntry = `[${dateFormatted}] -To'lov: ${Number(amount).toLocaleString('uz-UZ')} so'm${notes ? ` (${notes})` : ''}`;
      const updatedNotes = customer.notes ? `${customer.notes}\n${noteEntry}` : noteEntry;

      await tx.customer.update({
        where: { id: customerId },
        data: {
          debt: newDebt,
          notes: updatedNotes,
        },
      });

      // Record revenue if branch is found
      if (resolvedBranchId) {
        await tx.revenue.create({
          data: {
            businessId,
            branchId: resolvedBranchId,
            source: 'other',
            referenceId: customer.id,
            amount: Number(amount),
          },
        });
      }

      return { success: true, remainingDebt: newDebt };
    });
  }

  async delete(businessId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, businessId },
    });
    if (!customer) {
      throw new NotFoundException({ code: 'CUSTOMER_NOT_FOUND', message: 'Mijoz topilmadi' });
    }
    return this.prisma.customer.delete({
      where: { id },
    });
  }
}
