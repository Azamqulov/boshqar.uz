import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TableStatus, KitchenOrderStatus } from '@prisma/client';

@Injectable()
export class RestaurantService {
  constructor(private prisma: PrismaService) {}

  async getTables(branchId: string) {
    return this.prisma.table.findMany({
      where: { branchId },
      include: {
        orders: {
          where: { status: { in: ['draft', 'open'] } },
          include: {
            items: {
              include: {
                product: true,
                kitchenOrder: true,
              },
            },
            waiter: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createTable(branchId: string, data: { name: string; capacity?: number }) {
    return this.prisma.table.create({
      data: {
        branchId,
        name: data.name,
        capacity: data.capacity || 4,
        status: 'available',
      },
    });
  }

  async updateTableStatus(tableId: string, status: TableStatus) {
    return this.prisma.table.update({
      where: { id: tableId },
      data: { status },
    });
  }

  // Afitsiant stolga buyurtma kiritishi / Oshxonaga yuborish (Send to Kitchen)
  async submitTableOrder(
    businessId: string,
    branchId: string,
    tableId: string,
    dto: { waiterId?: string; items: { productId: string; quantity: number; notes?: string }[] },
  ) {
    const table = await this.prisma.table.findUnique({ where: { id: tableId } });
    if (!table) throw new NotFoundException('Stol topilmadi');

    return this.prisma.$transaction(async (tx) => {
      // 1. Find existing active order or create new
      let order = await tx.order.findFirst({
        where: {
          tableId,
          status: { in: ['draft', 'open'] },
        },
        include: { items: true },
      });

      if (!order) {
        const count = await tx.order.count({ where: { businessId } });
        const orderNumber = `#RST-${String(count + 1).padStart(5, '0')}`;

        order = await tx.order.create({
          data: {
            businessId,
            branchId,
            tableId,
            waiterId: dto.waiterId || null,
            orderNumber,
            orderType: 'restaurant',
            status: 'open',
            subtotal: 0,
            discountAmount: 0,
            taxAmount: 0,
            total: 0,
          },
          include: { items: true },
        });
      }

      // 2. Add items to order and trigger KDS kitchen orders
      let addedTotal = 0;

      for (const itemDto of dto.items) {
        const product = await tx.product.findUnique({ where: { id: itemDto.productId } });
        if (!product) continue;

        const itemTotal = Number(product.salePrice) * Number(itemDto.quantity);
        addedTotal += itemTotal;

        const orderItem = await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: product.id,
            quantity: itemDto.quantity,
            unitPrice: product.salePrice,
            discountAmount: 0,
            total: itemTotal,
            status: 'preparing',
          },
        });

        // Create kitchen order entry for KDS
        await tx.kitchenOrder.create({
          data: {
            orderItemId: orderItem.id,
            status: 'new',
          },
        });
      }

      // 3. Update order subtotal & total
      const newTotal = Number(order.total) + addedTotal;
      await tx.order.update({
        where: { id: order.id },
        data: {
          subtotal: Number(order.subtotal) + addedTotal,
          total: newTotal,
        },
      });

      // 4. Update table status to occupied
      await tx.table.update({
        where: { id: tableId },
        data: { status: 'occupied' },
      });

      return tx.order.findUnique({
        where: { id: order.id },
        include: {
          table: true,
          waiter: true,
          items: {
            include: {
              product: true,
              kitchenOrder: true,
            },
          },
        },
      });
    });
  }

  // Pre-chek chiqarish (Hisobni ko'rish)
  async getTablePreBill(tableId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        tableId,
        status: { in: ['draft', 'open'] },
      },
      include: {
        table: true,
        waiter: true,
        items: {
          include: { product: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Ushbu stolda faol buyurtma mavjud emas');
    }

    const serviceChargePercent = 10; // Standart 10% xizmat haqi
    const serviceFee = (Number(order.total) * serviceChargePercent) / 100;
    const grandTotal = Number(order.total) + serviceFee;

    return {
      orderNumber: order.orderNumber,
      tableName: order.table?.name,
      waiterName: order.waiter?.fullName || 'Ofitsiant',
      items: order.items.map((i) => ({
        name: i.product?.name,
        quantity: Number(i.quantity),
        price: Number(i.unitPrice),
        total: Number(i.total),
      })),
      subtotal: Number(order.subtotal),
      serviceFee,
      serviceChargePercent,
      grandTotal,
      openedAt: order.createdAt,
    };
  }

  // Oshxona (KDS) buyurtmalarini olish
  async getKitchenOrders(branchId: string) {
    return this.prisma.kitchenOrder.findMany({
      where: {
        orderItem: {
          order: { branchId, status: { in: ['draft', 'open'] } },
        },
        status: { in: ['new', 'cooking', 'ready'] },
      },
      include: {
        orderItem: {
          include: {
            product: true,
            order: {
              include: { table: true, waiter: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  // Oshxona statusini o'zgartirish (new -> cooking -> ready -> served)
  async updateKitchenStatus(kitchenOrderId: string, status: KitchenOrderStatus) {
    const data: any = { status };
    if (status === 'cooking') data.startedAt = new Date();
    if (status === 'ready') data.readyAt = new Date();

    const updated = await this.prisma.kitchenOrder.update({
      where: { id: kitchenOrderId },
      data,
      include: {
        orderItem: {
          include: {
            product: true,
            order: { include: { table: true } },
          },
        },
      },
    });

    // If served, also update orderItem status
    if (status === 'served') {
      await this.prisma.orderItem.update({
        where: { id: updated.orderItemId },
        data: { status: 'served' },
      });
    }

    return updated;
  }
}
