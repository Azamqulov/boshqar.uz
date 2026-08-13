import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateSupplierDto {
  name: string;
  companyName?: string;
  phone?: string;
  address?: string;
  balance?: number;
  notes?: string;
}

export interface UpdateSupplierDto extends Partial<CreateSupplierDto> {}

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async findAll(businessId: string) {
    return this.prisma.supplier.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(businessId: string, id: string) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, businessId },
    });
    if (!supplier) throw new NotFoundException();
    return supplier;
  }

  async create(businessId: string, data: CreateSupplierDto) {
    return this.prisma.supplier.create({
      data: {
        businessId,
        name: data.name,
        companyName: data.companyName || null,
        phone: data.phone || null,
        address: data.address || null,
        balance: data.balance || 0,
        notes: data.notes || null,
      },
    });
  }

  async update(businessId: string, id: string, data: UpdateSupplierDto) {
    const supplier = await this.findOne(businessId, id);
    return this.prisma.supplier.update({
      where: { id: supplier.id },
      data,
    });
  }

  async paySupplier(businessId: string, branchId: string, userId: string, id: string, amount: number) {
    return this.prisma.$transaction(async (tx) => {
      const supplier = await tx.supplier.findUnique({ where: { id } });
      if (!supplier) throw new NotFoundException();

      const newBalance = Number(supplier.balance) - amount;
      await tx.supplier.update({
        where: { id },
        data: { balance: newBalance },
      });

      // Record Expense
      await tx.expense.create({
        data: {
          businessId,
          branchId,
          category: 'purchase',
          amount,
          description: `Ta'minotchi (${supplier.name}) uchun to'lov`,
          createdBy: userId,
        },
      });

      return { success: true, balance: newBalance };
    });
  }
}
