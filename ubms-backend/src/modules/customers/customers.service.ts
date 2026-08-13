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
      orderBy: { totalSpent: 'desc' },
    });
  }

  async findOne(businessId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, businessId },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 20,
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

  async create(businessId: string, data: { fullName: string; phone?: string; birthDate?: string; notes?: string }) {
    const phone = normalizePhone(data.phone);
    return this.prisma.customer.create({
      data: {
        businessId,
        fullName: data.fullName,
        phone,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        notes: data.notes || null,
      },
    });
  }

  async update(businessId: string, id: string, data: any) {
    return this.prisma.customer.update({
      where: { id },
      data: {
        fullName: data.fullName,
        phone: data.phone,
        notes: data.notes,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
      },
    });
  }

  async payDebt(businessId: string, branchId: string, customerId: string, amount: number) {
    return this.prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({
        where: { id: customerId },
      });

      if (!customer) throw new NotFoundException();

      const newDebt = Math.max(0, Number(customer.debt) - amount);

      await tx.customer.update({
        where: { id: customerId },
        data: { debt: newDebt },
      });

      // Record revenue
      await tx.revenue.create({
        data: {
          businessId,
          branchId,
          source: 'other',
          amount,
        },
      });

      return { success: true, remainingDebt: newDebt };
    });
  }
}
