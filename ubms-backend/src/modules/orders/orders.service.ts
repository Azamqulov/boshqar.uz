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

function mapInputToPaymentType(input: string): { type: 'cash' | 'card' | 'other'; name: string } {
  const clean = (input || '').toLowerCase().trim();
  if (clean === '1' || clean === 'cash' || clean.includes('naqd')) {
    return { type: 'cash', name: 'Naqd pul' };
  }
  if (clean === '2' || clean === 'card' || clean.includes('karta') || clean.includes('plastik') || clean.includes('humo') || clean.includes('uzcard')) {
    return { type: 'card', name: 'Plastik karta' };
  }
  if (clean === '3' || clean === 'click' || clean === 'payme' || clean === 'transfer' || clean.includes('click') || clean.includes('payme')) {
    return { type: 'other', name: 'Click / Payme' };
  }
  return { type: 'other', name: input || 'Boshqa' };
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

    // 1. Fetch item prices and prepare lines outside transaction
    let subtotal = 0;
    const orderItemsData = [];
    const inventoryUpdates: { invId: string; productId: string; beforeQty: number; afterQty: number; buyQty: number }[] = [];

    for (const item of dto.items) {
      let unitPrice = item.unitPrice || 0;
      let lineDiscount = item.discountAmount || 0;

      if (item.productId) {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
        });
        if (!product) throw new NotFoundException({ code: 'PRODUCT_NOT_FOUND', message: 'Mahsulot topilmadi' });
        if (!item.unitPrice) unitPrice = Number(product.salePrice);

        // Pre-check inventory
        const inv = await this.prisma.inventory.findUnique({
          where: {
            branchId_productId: {
              branchId,
              productId: item.productId,
            },
          },
        });

        const isMadeToOrder =
          product.brand === 'dish' ||
          product.brand === 'kitchen' ||
          product.brand === 'service' ||
          product.unitId === '00000000-0000-0000-0000-000000000024';

        const currentQty = inv ? Number(inv.quantity) : 0;
        const buyQty = Number(item.quantity);

        if (!isMadeToOrder && inv && currentQty < buyQty) {
          throw new ConflictException({
            code: 'INSUFFICIENT_STOCK',
            message: `"${product.name}" mahsulotidan yetarli qoldiq yo'q (Mavjud: ${currentQty}, So'ralgan: ${buyQty})`,
          });
        }

        if (inv) {
          const afterQty = Math.max(0, currentQty - buyQty);
          inventoryUpdates.push({
            invId: inv.id,
            productId: item.productId,
            beforeQty: currentQty,
            afterQty,
            buyQty,
          });
        }
      } else if (item.serviceId) {
        const service = await this.prisma.service.findUnique({
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

    // Pre-resolve payment methods if immediate payments provided
    const preparedPayments: { paymentMethodId: string; amount: number }[] = [];
    if (dto.payments && dto.payments.length > 0) {
      for (const p of dto.payments) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(p.paymentMethodId);
        const resolved = mapInputToPaymentType(p.paymentMethodId);

        let pm: any = null;
        if (isUuid) {
          pm = await this.prisma.paymentMethod.findFirst({
            where: { id: p.paymentMethodId, businessId },
          });
        }

        if (!pm) {
          pm = await this.prisma.paymentMethod.findFirst({
            where: { businessId, type: resolved.type },
          });
        }

        if (!pm) {
          pm = await this.prisma.paymentMethod.create({
            data: {
              businessId,
              name: resolved.name,
              type: resolved.type,
              isActive: true,
            },
          });
        }

        preparedPayments.push({
          paymentMethodId: pm.id,
          amount: Number(p.amount),
        });
      }
    }

    const isImmediateComplete = preparedPayments.length > 0;

    return this.prisma.$transaction(
      async (tx) => {
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
            status: isImmediateComplete ? 'completed' : 'draft',
            completedAt: isImmediateComplete ? new Date() : null,
            items: {
              create: orderItemsData,
            },
          },
          include: {
            items: { include: { product: true, service: true } },
            customer: true,
          },
        });

        // 3. Update inventory & log transactions
        for (const up of inventoryUpdates) {
          await tx.inventory.update({
            where: { id: up.invId },
            data: { quantity: up.afterQty },
          });

          await tx.inventoryTransaction.create({
            data: {
              branchId,
              productId: up.productId,
              type: 'out',
              reason: 'sale',
              quantity: up.buyQty,
              quantityBefore: up.beforeQty,
              quantityAfter: up.afterQty,
              referenceType: 'order',
              referenceId: order.id,
              createdBy: userId,
            },
          });
        }

        // 4. Save Payments & Revenue
        if (isImmediateComplete) {
          let totalPaid = 0;
          for (const p of preparedPayments) {
            await tx.payment.create({
              data: {
                orderId: order.id,
                paymentMethodId: p.paymentMethodId,
                amount: p.amount,
                status: 'success',
              },
            });
            totalPaid += p.amount;
          }

          if (order.customerId) {
            const underpaid = Math.max(0, grandTotal - totalPaid);
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

          await tx.revenue.create({
            data: {
              businessId,
              branchId,
              source: 'sales',
              referenceId: order.id,
              amount: totalPaid,
            },
          });
        }

        // 5. If Restaurant order
        if (dto.tableId) {
          await tx.table.update({
            where: { id: dto.tableId },
            data: { status: isImmediateComplete ? 'cleaning' : 'occupied' },
          });

          await tx.restaurantOrder.create({
            data: { orderId: order.id },
          });
        }

        return order;
      },
      {
        maxWait: 20000,
        timeout: 30000,
      },
    );
  }

  async completeOrder(businessId: string, branchId: string, userId: string, orderId: string, payments: { paymentMethodId: string; amount: number }[]) {
    return this.prisma.$transaction(
      async (tx) => {
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

        // Save Payments & Complete
        let totalPaid = 0;
        for (const p of payments) {
          let pm = await tx.paymentMethod.findFirst({
            where: { businessId: order.businessId },
          });

          if (!pm) {
            pm = await tx.paymentMethod.create({
              data: {
                businessId: order.businessId,
                name: 'Naqd pul',
                type: 'cash',
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

        return tx.order.update({
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
      },
      {
        maxWait: 20000,
        timeout: 30000,
      },
    );
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
