import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrderType, OrderStatus, Prisma } from '@prisma/client';

export interface CreateOrderDto {
  orderType: OrderType;
  customerId?: string;
  tableId?: string;
  items: {
    productId?: string;
    serviceId?: string;
    quantity: number;
    unitPrice?: number;
    discountAmount?: number;
  }[];
  discountAmount?: number;
  taxAmount?: number;
  payments?: {
    paymentMethodId: string;
    amount: number;
  }[];
}

export interface FindOrdersQueryDto {
  status?: OrderStatus;
  orderType?: OrderType;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    businessId: string,
    branchId?: string,
    query?: FindOrdersQueryDto,
  ) {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 30;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = { businessId };
    if (branchId) where.branchId = branchId;
    if (query?.status) where.status = query.status;
    if (query?.orderType) where.orderType = query.orderType;

    if (query?.dateFrom || query?.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) where.createdAt.gte = new Date(query.dateFrom);
      if (query.dateTo) where.createdAt.lte = new Date(query.dateTo);
    }

    if (query?.search) {
      where.OR = [
        { orderNumber: { contains: query.search, mode: 'insensitive' } },
        { customer: { fullName: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          customer: true,
          cashier: true,
          table: true,
          items: {
            include: { product: true, service: true },
          },
          payments: {
            include: { paymentMethod: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(businessId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, businessId },
      include: {
        customer: true,
        cashier: true,
        table: true,
        items: {
          include: { product: true, service: true, kitchenOrder: true },
        },
        payments: {
          include: { paymentMethod: true },
        },
        refunds: {
          include: { items: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundException({ code: 'ORDER_NOT_FOUND', message: 'Buyurtma topilmadi' });
    }

    return order;
  }

  async create(businessId: string, branchId: string, userId: string, dto: CreateOrderDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException({ code: 'EMPTY_ITEMS', message: 'Savatda kamida 1 ta mahsulot yoki xizmat bo\'lishi shart' });
    }

    // Generate readable order number (#000123)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const countToday = await this.prisma.order.count({
      where: {
        businessId,
        createdAt: { gte: todayStart },
      },
    });
    const orderNumber = `#${String(countToday + 1).padStart(4, '0')}`;

    // Find cashier employee
    const employee = await this.prisma.employee.findFirst({
      where: { businessId, userId },
    });

    return this.prisma.$transaction(async (tx) => {
      // 1. Fetch item prices and prepare lines
      let subtotal = 0;
      const orderItemsData = [];

      for (const item of dto.items) {
        let unitPrice = item.unitPrice || 0;
        let lineDiscount = item.discountAmount || 0;

        if (item.productId) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });
          if (!product) throw new NotFoundException({ code: 'PRODUCT_NOT_FOUND', message: 'Mahsulot topilmadi' });
          if (!item.unitPrice) unitPrice = Number(product.salePrice);
        } else if (item.serviceId) {
          const service = await tx.service.findUnique({
            where: { id: item.serviceId },
          });
          if (!service) throw new NotFoundException({ code: 'SERVICE_NOT_FOUND', message: 'Xizmat topilmadi' });
          if (!item.unitPrice) unitPrice = Number(service.price);
        }

        const lineTotal = Number(item.quantity) * unitPrice - lineDiscount;
        subtotal += lineTotal;

        orderItemsData.push({
          productId: item.productId || null,
          serviceId: item.serviceId || null,
          quantity: item.quantity,
          unitPrice,
          discountAmount: lineDiscount,
          total: lineTotal,
          status: 'pending' as const,
        });
      }

      const totalDiscount = (dto.discountAmount || 0);
      const taxAmount = (dto.taxAmount || 0);
      const grandTotal = Math.max(0, subtotal - totalDiscount + taxAmount);

      // 2. Create Order
      const order = await tx.order.create({
        data: {
          businessId,
          branchId,
          orderNumber,
          orderType: dto.orderType || 'pos',
          customerId: dto.customerId || null,
          cashierId: employee?.id || null,
          tableId: dto.tableId || null,
          subtotal,
          discountAmount: totalDiscount,
          taxAmount,
          total: grandTotal,
          status: 'draft',
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: true,
        },
      });

      // If restaurant and table occupied
      if (dto.tableId) {
        await tx.table.update({
          where: { id: dto.tableId },
          data: { status: 'occupied' },
        });

        await tx.restaurantOrder.create({
          data: {
            orderId: order.id,
          },
        });

        // Add to kitchen orders (KDS)
        for (const orderItem of order.items) {
          if (orderItem.productId) {
            await tx.kitchenOrder.create({
              data: {
                orderItemId: orderItem.id,
                status: 'new',
              },
            });
          }
        }
      }

      // If payments provided immediately, complete the order
      if (dto.payments && dto.payments.length > 0) {
        return this.completeOrderInternal(tx, businessId, branchId, userId, order.id, dto.payments);
      }

      return order;
    });
  }

  async completeOrder(businessId: string, branchId: string, userId: string, orderId: string, payments: { paymentMethodId: string; amount: number }[]) {
    return this.prisma.$transaction(async (tx) => {
      return this.completeOrderInternal(tx, businessId, branchId, userId, orderId, payments);
    });
  }

  private async completeOrderInternal(
    tx: Prisma.TransactionClient,
    businessId: string,
    branchId: string,
    userId: string,
    orderId: string,
    payments: { paymentMethodId: string; amount: number }[],
  ) {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: true } },
        customer: true,
      },
    });

    if (!order) {
      throw new NotFoundException({ code: 'ORDER_NOT_FOUND', message: 'Buyurtma topilmadi' });
    }

    if (order.status === 'completed') {
      return order;
    }

    // 1. Check & Decrement Inventory (Skip strict blocking for made-to-order dishes, kitchen items and services)
    for (const item of order.items) {
      if (item.productId) {
        const inv = await tx.inventory.findUnique({
          where: {
            branchId_productId: {
              branchId: order.branchId,
              productId: item.productId,
            },
          },
        });

        const isMadeToOrder =
          item.product?.brand === 'dish' ||
          item.product?.brand === 'kitchen' ||
          item.product?.brand === 'service' ||
          item.product?.unitId === '00000000-0000-0000-0000-000000000024'; // Porsiya

        const currentQty = inv ? Number(inv.quantity) : 0;
        const buyQty = Number(item.quantity);

        // Only enforce strict stock check on tracked physical goods
        if (!isMadeToOrder && inv && currentQty < buyQty) {
          throw new ConflictException({
            code: 'INSUFFICIENT_STOCK',
            message: `"${item.product?.name}" mahsulotidan yetarli qoldiq yo'q (Mavjud: ${currentQty}, So'ralgan: ${buyQty})`,
          });
        }

        if (inv) {
          const afterQty = Math.max(0, currentQty - buyQty);
          await tx.inventory.update({
            where: { id: inv.id },
            data: { quantity: afterQty },
          });

          await tx.inventoryTransaction.create({
            data: {
              branchId: order.branchId,
              productId: item.productId,
              type: 'out',
              reason: 'sale',
              quantity: buyQty,
              quantityBefore: currentQty,
              quantityAfter: afterQty,
              referenceType: 'order',
              referenceId: order.id,
              createdBy: userId,
            },
          });
        }
      }
    }

    // 2. Save Payments
    let totalPaid = 0;
    for (const p of payments) {
      let pm: any = null;
      try {
        pm = await tx.paymentMethod.findFirst({
          where: {
            OR: [
              { id: p.paymentMethodId },
              { type: p.paymentMethodId as any },
              { name: { contains: p.paymentMethodId, mode: 'insensitive' } },
            ],
          },
        });
      } catch (err) {
        pm = null;
      }

      if (!pm) {
        pm = await tx.paymentMethod.findFirst({
          where: { businessId: order.businessId },
        });
      }

      if (!pm) {
        const isCard = p.paymentMethodId === 'card' || p.paymentMethodId === '2';
        pm = await tx.paymentMethod.create({
          data: {
            businessId: order.businessId,
            name: isCard ? 'Plastik karta' : 'Naqd pul',
            type: isCard ? 'card' : 'cash',
            isActive: true,
          },
        });
      }

      await tx.payment.create({
        data: {
          orderId: order.id,
          paymentMethodId: pm.id,
          amount: p.amount,
          status: 'success',
        },
      });
      totalPaid += Number(p.amount);
    }

    // 3. Customer debt calculation if underpaid
    const orderTotal = Number(order.total);
    if (order.customerId) {
      const underpaid = Math.max(0, orderTotal - totalPaid);
      await tx.customer.update({
        where: { id: order.customerId },
        data: {
          totalPurchases: { increment: 1 },
          totalSpent: { increment: totalPaid },
          debt: { increment: underpaid },
          lastPurchaseAt: new Date(),
        },
      });
    }

    // 4. Record Revenue in Finance
    await tx.revenue.create({
      data: {
        businessId: order.businessId,
        branchId: order.branchId,
        source: 'sales',
        referenceId: order.id,
        amount: totalPaid,
      },
    });

    // 5. If Restaurant order, free table
    if (order.tableId) {
      await tx.table.update({
        where: { id: order.tableId },
        data: { status: 'cleaning' },
      });
    }

    // 6. Mark order completed
    const updatedOrder = await tx.order.update({
      where: { id: order.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
      include: {
        items: { include: { product: true, service: true } },
        payments: { include: { paymentMethod: true } },
        customer: true,
      },
    });

    return updatedOrder;
  }

  async cancel(businessId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, businessId },
    });

    if (!order) throw new NotFoundException();

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'cancelled' },
    });
  }
}
