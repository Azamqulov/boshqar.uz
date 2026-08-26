import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { resolveTrackInventory } from '../../common/utils/inventory-tracking.util';

export interface FindInventoryQueryDto {
  lowStockOnly?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface StockInDto {
  productId: string;
  quantity: number;
  reason?: 'purchase' | 'manual';
  supplierId?: string;
  purchasePrice?: number;
  notes?: string;
  branchId?: string;
}

export interface StockOutDto {
  productId: string;
  quantity: number;
  reason: 'damage' | 'expired' | 'manual';
  notes?: string;
  branchId?: string;
}

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async getInventory(businessId: string, branchId?: string, query?: FindInventoryQueryDto) {
    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.min(Math.max(1, Number(query?.limit) || 100), 500);
    const skip = (page - 1) * limit;

    const where: any = {
      businessId,
      product: {
        status: { not: 'archived' },
      },
    };

    if (branchId) {
      where.branchId = branchId;
    }

    if (query?.search) {
      where.product.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { sku: { contains: query.search, mode: 'insensitive' } },
        { barcode: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.inventory.findMany({
        where,
        include: {
          product: {
            include: { category: true, unit: true },
          },
          branch: true,
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.inventory.count({ where }),
    ]);

    const formattedItems = items.map((inv) => {
      const qty = Number(inv.quantity);
      const reserved = Number(inv.reservedQty);
      const minStock = Number(inv.product.minStock);
      // Buyurtma asosida tayyorlanadigan mahsulot (masalan taom) uchun kam-qoldiq
      // ogohlantirishi ko'rsatilmaydi — chunki uning qoldig'i umuman kuzatilmaydi.
      const isLowStock = resolveTrackInventory(inv.product) && qty <= minStock;

      return {
        id: inv.id,
        businessId: inv.businessId,
        branchId: inv.branchId,
        branchName: inv.branch.name,
        productId: inv.productId,
        productName: inv.product.name,
        sku: inv.product.sku,
        barcode: inv.product.barcode,
        category: inv.product.category?.name,
        unit: inv.product.unit?.shortName || '',
        purchasePrice: Number(inv.product.purchasePrice),
        salePrice: Number(inv.product.salePrice),
        quantity: qty,
        reservedQty: reserved,
        availableQty: Math.max(0, qty - reserved),
        minStock,
        isLowStock,
        totalValue: qty * Number(inv.product.purchasePrice),
      };
    });

    const finalItems = query?.lowStockOnly
      ? formattedItems.filter((item) => item.isLowStock)
      : formattedItems;

    return {
      items: finalItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async stockIn(
    businessId: string,
    branchId: string,
    userId: string,
    data: StockInDto,
  ) {
    if (data.quantity <= 0) {
      throw new BadRequestException({ code: 'INVALID_QTY', message: 'Miqdor 0 dan katta bo\'lishi shart' });
    }

    return this.prisma.$transaction(async (tx) => {
      const inv = await tx.inventory.findUnique({
        where: {
          branchId_productId: {
            branchId,
            productId: data.productId,
          },
        },
      });

      const qtyBefore = inv ? Number(inv.quantity) : 0;
      const qtyAfter = qtyBefore + Number(data.quantity);

      if (inv) {
        await tx.inventory.update({
          where: { id: inv.id },
          data: { quantity: qtyAfter },
        });
      } else {
        await tx.inventory.create({
          data: {
            businessId,
            branchId,
            productId: data.productId,
            quantity: qtyAfter,
            reservedQty: 0,
          },
        });
      }

      // If purchasePrice supplied, update product purchase price
      if (data.purchasePrice) {
        await tx.product.update({
          where: { id: data.productId },
          data: { purchasePrice: data.purchasePrice },
        });
      }

      // If supplier purchase, add to supplier balance if debt
      if (data.supplierId && data.reason === 'purchase') {
        const totalCost = Number(data.quantity) * (data.purchasePrice || 0);
        await tx.supplier.update({
          where: { id: data.supplierId },
          data: { balance: { increment: totalCost } },
        });
      }

      // Record transaction
      const transaction = await tx.inventoryTransaction.create({
        data: {
          branchId,
          productId: data.productId,
          type: 'in',
          reason: data.reason || 'manual',
          quantity: data.quantity,
          quantityBefore: qtyBefore,
          quantityAfter: qtyAfter,
          referenceType: data.supplierId ? 'supplier_purchase' : 'manual_in',
          referenceId: data.supplierId || null,
          createdBy: userId,
        },
      });

      return transaction;
    });
  }

  async stockOut(
    businessId: string,
    branchId: string,
    userId: string,
    data: StockOutDto,
  ) {
    if (data.quantity <= 0) {
      throw new BadRequestException({ code: 'INVALID_QTY', message: 'Miqdor 0 dan katta bo\'lishi shart' });
    }

    return this.prisma.$transaction(async (tx) => {
      const inv = await tx.inventory.findUnique({
        where: {
          branchId_productId: {
            branchId,
            productId: data.productId,
          },
        },
      });

      const qtyBefore = inv ? Number(inv.quantity) : 0;
      if (qtyBefore < data.quantity) {
        throw new ConflictException({
          code: 'INSUFFICIENT_STOCK',
          message: 'Omborda yetarli qoldiq mavjud emas',
        });
      }

      const qtyAfter = qtyBefore - Number(data.quantity);

      await tx.inventory.update({
        where: { id: inv.id },
        data: { quantity: qtyAfter },
      });

      const transaction = await tx.inventoryTransaction.create({
        data: {
          branchId,
          productId: data.productId,
          type: 'out',
          reason: data.reason,
          quantity: data.quantity,
          quantityBefore: qtyBefore,
          quantityAfter: qtyAfter,
          referenceType: 'stock_out_manual',
          createdBy: userId,
        },
      });

      return transaction;
    });
  }

  async getTransactions(businessId: string, branchId?: string, productId?: string) {
    const where: any = {
      product: { businessId },
    };

    if (branchId) where.branchId = branchId;
    if (productId) where.productId = productId;

    return this.prisma.inventoryTransaction.findMany({
      where,
      include: {
        product: true,
        branch: true,
        user: { select: { id: true, fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
