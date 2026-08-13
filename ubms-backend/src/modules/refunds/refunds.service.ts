import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateRefundDto {
  orderId: string;
  reason: string;
  items: {
    orderItemId: string;
    quantity: number;
  }[];
}

@Injectable()
export class RefundsService {
  constructor(private prisma: PrismaService) {}

  async create(businessId: string, userId: string, dto: CreateRefundDto) {
    const order = await this.prisma.order.findFirst({
      where: { id: dto.orderId, businessId },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException({ code: 'ORDER_NOT_FOUND', message: 'Buyurtma topilmadi' });
    }

    if (order.status !== 'completed') {
      throw new BadRequestException({ code: 'INVALID_STATUS', message: 'Faqat yakunlangan buyurtmalarni qaytarish mumkin' });
    }

    return this.prisma.$transaction(async (tx) => {
      let totalRefundAmount = 0;
      const refundItemsData = [];

      for (const item of dto.items) {
        const orderItem = order.items.find((oi) => oi.id === item.orderItemId);
        if (!orderItem) {
          throw new NotFoundException({ code: 'ITEM_NOT_FOUND', message: 'Buyurtma qatori topilmadi' });
        }

        if (Number(item.quantity) > Number(orderItem.quantity)) {
          throw new BadRequestException({ code: 'INVALID_QTY', message: 'Qaytarilayotgan miqdor buyurtma miqdoridan ko\'p' });
        }

        const refundItemAmount = Number(item.quantity) * Number(orderItem.unitPrice) - Number(orderItem.discountAmount);
        totalRefundAmount += refundItemAmount;

        refundItemsData.push({
          orderItemId: item.orderItemId,
          quantity: item.quantity,
          amount: refundItemAmount,
        });

        // Restore inventory if product
        if (orderItem.productId) {
          const inv = await tx.inventory.findUnique({
            where: {
              branchId_productId: {
                branchId: order.branchId,
                productId: orderItem.productId,
              },
            },
          });

          const currentQty = inv ? Number(inv.quantity) : 0;
          const afterQty = currentQty + Number(item.quantity);

          if (inv) {
            await tx.inventory.update({
              where: { id: inv.id },
              data: { quantity: afterQty },
            });
          }

          await tx.inventoryTransaction.create({
            data: {
              branchId: order.branchId,
              productId: orderItem.productId,
              type: 'in',
              reason: 'refund',
              quantity: item.quantity,
              quantityBefore: currentQty,
              quantityAfter: afterQty,
              referenceType: 'refund',
              createdBy: userId,
            },
          });
        }
      }

      // Create refund record
      const refund = await tx.refund.create({
        data: {
          orderId: order.id,
          processedBy: userId,
          reason: dto.reason,
          totalRefundAmount,
          status: 'completed',
          items: {
            create: refundItemsData,
          },
        },
        include: { items: true },
      });

      // Reverse revenue
      await tx.revenue.create({
        data: {
          businessId: order.businessId,
          branchId: order.branchId,
          source: 'sales',
          referenceId: refund.id,
          amount: -totalRefundAmount,
        },
      });

      // Update order status to refunded or partially_refunded
      const isFullRefund = totalRefundAmount >= Number(order.total);
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: isFullRefund ? 'refunded' : 'partially_refunded',
        },
      });

      return refund;
    });
  }

  async findAll(businessId: string) {
    return this.prisma.refund.findMany({
      where: { order: { businessId } },
      include: {
        order: { select: { orderNumber: true, total: true } },
        user: { select: { id: true, fullName: true } },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
