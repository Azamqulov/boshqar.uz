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

function mapInputToPaymentType(input: string): { type: 'cash' | 'card' | 'click' | 'payme' | 'other'; name: string } {
  const clean = (input || '').toLowerCase().trim();
  if (clean === '1' || clean === 'cash' || clean.includes('naqd')) {
    return { type: 'cash', name: 'Naqd pul' };
  }
  if (clean === '2' || clean === 'card' || clean.includes('karta') || clean.includes('plastik') || clean.includes('humo') || clean.includes('uzcard')) {
    return { type: 'card', name: 'Plastik karta' };
  }
  if (clean === '3' || clean === 'click' || clean.includes('click') || clean.includes('payme')) {
    return { type: 'click', name: 'Click / Payme' };
  }
  if (clean === '4' || clean === 'debt' || clean.includes('nasiya') || clean.includes('qarz')) {
    return { type: 'other', name: 'Nasiya / Qarz' };
  }
  return { type: 'other', name: input || 'Boshqa' };
}

import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private telegramService?: TelegramService,
  ) {}

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

    // 1. Fetch item prices and prepare lines
    let subtotal = 0;
    const orderItemsData = [];

    for (const item of dto.items) {
      let unitPrice = item.unitPrice || 0;
      let lineDiscount = item.discountAmount || 0;

      if (item.productId) {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
        });
        if (!product) throw new NotFoundException({ code: 'PRODUCT_NOT_FOUND', message: 'Mahsulot topilmadi' });
        if (!item.unitPrice) unitPrice = Number(product.salePrice);
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
            where: { businessId, name: resolved.name },
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

    // Safely map orderType enum (Prisma enum: 'pos' | 'restaurant' | 'service')
    let validOrderType: OrderType = 'pos';
    const rawType = String(dto.orderType || '').toLowerCase();
    if (rawType === 'restaurant' || rawType === 'dine_in' || rawType === 'takeaway' || rawType === 'delivery') {
      validOrderType = 'restaurant';
    } else if (rawType === 'service') {
      validOrderType = 'service';
    } else {
      validOrderType = 'pos';
    }

    let resolvedTableId = dto.tableId || null;
    if (!resolvedTableId && (dto as any).tableNumber) {
      const foundTable = await this.prisma.table.findFirst({
        where: {
          branchId,
          name: { contains: String((dto as any).tableNumber), mode: 'insensitive' },
        },
      });
      if (foundTable) {
        resolvedTableId = foundTable.id;
      }
    }

    // Check active open shift for this branch (safe lookup)
    let activeShiftId: string | null = null;
    try {
      const activeShift = await this.prisma.posShift.findFirst({
        where: { businessId, branchId, status: 'open' },
      });
      if (activeShift) {
        activeShiftId = activeShift.id;
      }
    } catch (e) {
      activeShiftId = null;
    }

    const result = await this.prisma.$transaction(
      async (tx) => {
        // 2. Create Order
        const order = await tx.order.create({
          data: {
            businessId,
            branchId,
            orderNumber,
            orderType: validOrderType,
            customerId: dto.customerId || null,
            cashierId: employee?.id || null,
            tableId: resolvedTableId,
            shiftId: activeShiftId,
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

        // 3. Atomically update inventory & log transactions inside transaction
        for (const item of dto.items) {
          if (!item.productId) continue;

          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });
          if (!product) continue;

          const isMadeToOrder =
            product.brand === 'dish' ||
            product.brand === 'kitchen' ||
            product.brand === 'service' ||
            product.unitId === '00000000-0000-0000-0000-000000000024';

          const inv = await tx.inventory.findUnique({
            where: {
              branchId_productId: {
                branchId,
                productId: item.productId,
              },
            },
          });

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
            await tx.inventory.update({
              where: { id: inv.id },
              data: { quantity: afterQty },
            });

            await tx.inventoryTransaction.create({
              data: {
                branchId,
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

        const fullOrder = await tx.order.findUnique({
          where: { id: order.id },
          include: {
            items: { include: { product: true, service: true } },
            customer: true,
            cashier: true,
            table: true,
            payments: {
              include: {
                paymentMethod: true,
              },
            },
          },
        });

        return fullOrder || order;
      },
      {
        maxWait: 20000,
        timeout: 30000,
      },
    );

    // Send asynchronous Telegram notification (fire-and-forget)
    if (result && isImmediateComplete) {
      this.telegramService?.sendOrderNotification(businessId, result).catch(() => null);
    }

    return result;
  }

  async completeOrder(businessId: string, branchId: string, userId: string, orderId: string, payments: { paymentMethodId: string; amount: number }[]) {
    const result = await this.prisma.$transaction(
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

        // Save Payments & Complete — fetch or create default payment method once
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

        let totalPaid = 0;
        for (const p of payments) {
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

        if (order.tableId) {
          await tx.table.update({
            where: { id: order.tableId },
            data: { status: 'available' },
          });
        }

        if (order.customerId) {
          const underpaid = Math.max(0, Number(order.total) - totalPaid);
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
            table: true,
          },
        });
      },
      {
        maxWait: 20000,
        timeout: 30000,
      },
    );

    if (result) {
      this.telegramService?.sendOrderNotification(businessId, result).catch(() => null);
    }

    return result;
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
