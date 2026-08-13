import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
      include: {
        _count: { select: { payments: true } },
      },
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
    if (!amount || amount <= 0) {
      throw new BadRequestException('To\'lov summasi 0 dan katta bo\'lishi kerak');
    }

    return this.prisma.$transaction(async (tx) => {
      const supplier = await tx.supplier.findUnique({ where: { id } });
      if (!supplier) throw new NotFoundException();

      const balanceBefore = Number(supplier.balance);
      const newBalance = balanceBefore - amount;

      await tx.supplier.update({
        where: { id },
        data: { balance: newBalance },
      });

      // Record SupplierPayment history
      await tx.supplierPayment.create({
        data: {
          supplierId: id,
          businessId,
          amount,
          balanceBefore,
          balanceAfter: newBalance,
          description: `Ta'minotchi (${supplier.name}) uchun to'lov`,
          createdBy: userId,
        },
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

  async getPayments(businessId: string, supplierId: string) {
    // Verify supplier belongs to this business
    const supplier = await this.prisma.supplier.findFirst({
      where: { id: supplierId, businessId },
    });
    if (!supplier) throw new NotFoundException();

    return this.prisma.supplierPayment.findMany({
      where: { supplierId, businessId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(businessId: string, id: string) {
    const supplier = await this.findOne(businessId, id);
    await this.prisma.supplier.delete({ where: { id: supplier.id } });
    return { success: true };
  }
}
