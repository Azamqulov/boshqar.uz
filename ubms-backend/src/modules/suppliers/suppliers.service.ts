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

export interface UpdateSupplierDto {
  name?: string;
  companyName?: string;
  phone?: string;
  address?: string;
  balance?: number;
  notes?: string;
}

export interface PaySupplierDto {
  amount: number;
  paymentSource?: 'cash' | 'card' | 'bank';
  description?: string;
}

export interface SupplyInvoiceItemDto {
  productId: string;
  quantity: number;
  purchasePrice: number;
  salePrice?: number;
}

export interface CreateSupplyInvoiceDto {
  invoiceNumber?: string;
  items: SupplyInvoiceItemDto[];
  paidAmount?: number;
  notes?: string;
}

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
    if (!supplier) throw new NotFoundException('Ta\'minotchi topilmadi');
    return supplier;
  }

  async create(businessId: string, userId: string, data: CreateSupplierDto) {
    const supplier = await this.prisma.supplier.create({
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

    // Create Audit Log
    await this.prisma.auditLog.create({
      data: {
        businessId,
        userId,
        action: 'SUPPLIER_CREATED',
        entity: 'supplier',
        entityId: supplier.id,
        newValue: {
          name: supplier.name,
          companyName: supplier.companyName,
          initialBalance: Number(supplier.balance),
        },
      },
    });

    return supplier;
  }

  async update(businessId: string, userId: string, id: string, data: UpdateSupplierDto) {
    const supplier = await this.findOne(businessId, id);
    const oldBalance = Number(supplier.balance);

    const updated = await this.prisma.supplier.update({
      where: { id: supplier.id },
      data,
    });

    // Create Audit Log
    await this.prisma.auditLog.create({
      data: {
        businessId,
        userId,
        action: 'SUPPLIER_UPDATED',
        entity: 'supplier',
        entityId: supplier.id,
        oldValue: { name: supplier.name, balance: oldBalance },
        newValue: { name: updated.name, balance: Number(updated.balance) },
      },
    });

    return updated;
  }

  async paySupplier(
    businessId: string,
    branchId: string,
    userId: string,
    id: string,
    dto: PaySupplierDto,
  ) {
    const amount = Number(dto.amount);
    if (!amount || amount <= 0) {
      throw new BadRequestException('To\'lov summasi 0 dan katta bo\'lishi kerak');
    }

    return this.prisma.$transaction(async (tx) => {
      const supplier = await tx.supplier.findUnique({ where: { id } });
      if (!supplier) throw new NotFoundException('Ta\'minotchi topilmadi');

      const balanceBefore = Number(supplier.balance);
      const newBalance = balanceBefore - amount;
      const paymentSource = dto.paymentSource || 'cash';
      const desc = dto.description || `Ta'minotchi (${supplier.name}) uchun to'lov [${paymentSource.toUpperCase()}]`;

      await tx.supplier.update({
        where: { id },
        data: { balance: newBalance },
      });

      // 1. Record SupplierPayment history
      const payment = await tx.supplierPayment.create({
        data: {
          supplierId: id,
          businessId,
          amount,
          balanceBefore,
          balanceAfter: newBalance,
          description: desc,
          createdBy: userId,
        },
      });

      // 2. Record Expense
      await tx.expense.create({
        data: {
          businessId,
          branchId,
          category: 'purchase',
          amount,
          description: desc,
          createdBy: userId,
        },
      });

      // 3. Record Immutable Audit Log
      await tx.auditLog.create({
        data: {
          businessId,
          userId,
          action: 'SUPPLIER_PAYMENT',
          entity: 'supplier_payment',
          entityId: payment.id,
          oldValue: { supplierBalance: balanceBefore },
          newValue: {
            supplierId: id,
            supplierName: supplier.name,
            amountPaid: amount,
            supplierBalanceAfter: newBalance,
            paymentSource,
            description: desc,
          },
        },
      });

      return { success: true, balance: newBalance, payment };
    });
  }

  async getPayments(businessId: string, supplierId: string) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id: supplierId, businessId },
    });
    if (!supplier) throw new NotFoundException('Ta\'minotchi topilmadi');

    return this.prisma.supplierPayment.findMany({
      where: { supplierId, businessId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Solishtirma Dalolatnoma (Reconciliation Statement / Akt Sverka)
  async getStatement(businessId: string, supplierId: string) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id: supplierId, businessId },
    });
    if (!supplier) throw new NotFoundException('Ta\'minotchi topilmadi');

    const payments = await this.prisma.supplierPayment.findMany({
      where: { supplierId, businessId },
      orderBy: { createdAt: 'desc' },
    });

    const auditLogs = await this.prisma.auditLog.findMany({
      where: {
        businessId,
        OR: [
          { entityId: supplierId },
          { entity: 'supplier_payment' },
        ],
      },
      include: {
        user: { select: { fullName: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      supplier,
      currentDebt: Number(supplier.balance),
      totalPaid,
      paymentsCount: payments.length,
      payments,
      auditLogs,
    };
  }

  async remove(businessId: string, userId: string, id: string) {
    const supplier = await this.findOne(businessId, id);

    await this.prisma.auditLog.create({
      data: {
        businessId,
        userId,
        action: 'SUPPLIER_DELETED',
        entity: 'supplier',
        entityId: supplier.id,
        oldValue: { name: supplier.name, balance: Number(supplier.balance) },
      },
    });

    await this.prisma.supplier.delete({ where: { id: supplier.id } });
    return { success: true };
  }
}
