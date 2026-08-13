import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductStatus } from '@prisma/client';

export interface FindProductsQueryDto {
  search?: string;
  categoryId?: string;
  status?: ProductStatus | string;
  page?: number;
  limit?: number;
}

export interface CreateProductDto {
  name: string;
  sku?: string;
  barcode?: string;
  categoryId?: string;
  unitId?: string;
  branchId?: string;
  salePrice: number;
  purchasePrice?: number;
  minStockLevel?: number;
  initialStock?: number;
  status?: ProductStatus;
  description?: string;
  image?: string;
  imageUrl?: string;
  brand?: string;
  productType?: 'goods' | 'dish' | 'service';
  isKitchenItem?: boolean;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

export interface CreateCategoryDto {
  name: string;
  parentId?: string;
  icon?: string;
  sortOrder?: number;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}

export interface CreateUnitDto {
  name: string;
  shortName: string;
}

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(businessId: string, branchId?: string, query?: FindProductsQueryDto) {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 50;
    const skip = (page - 1) * limit;

    const where: any = {
      businessId,
      status: query?.status ? query.status : { not: 'archived' },
    };

    if (query?.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query?.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { sku: { contains: query.search, mode: 'insensitive' } },
        { barcode: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
          unit: true,
          inventory: branchId ? { where: { branchId } } : true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    const formattedItems = items.map((prod) => {
      const stockQty = prod.inventory.reduce((acc, curr) => acc + Number(curr.quantity), 0);
      const reservedQty = prod.inventory.reduce((acc, curr) => acc + Number(curr.reservedQty), 0);
      return {
        ...prod,
        stockQty,
        availableQty: stockQty - reservedQty,
      };
    });

    return {
      items: formattedItems,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(businessId: string, id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, businessId },
      include: {
        category: true,
        unit: true,
        inventory: true,
      },
    });

    if (!product) {
      throw new NotFoundException({ code: 'PRODUCT_NOT_FOUND', message: 'Mahsulot topilmadi' });
    }

    return product;
  }

  async findByBarcode(businessId: string, barcode: string) {
    const product = await this.prisma.product.findFirst({
      where: { businessId, barcode, status: 'active' },
      include: {
        category: true,
        unit: true,
        inventory: true,
      },
    });

    if (!product) {
      throw new NotFoundException({ code: 'BARCODE_NOT_FOUND', message: 'Shtrix-kod bo\'yicha mahsulot topilmadi' });
    }

    return product;
  }

  async create(businessId: string, userId: string, data: CreateProductDto) {
    // Generate SKU if not provided
    let sku = data.sku;
    if (!sku) {
      const count = await this.prisma.product.count({ where: { businessId } });
      sku = `PRD-${String(count + 1).padStart(6, '0')}`;
    } else {
      const existingSku = await this.prisma.product.findFirst({
        where: { businessId, sku },
      });
      if (existingSku) {
        throw new ConflictException({ code: 'SKU_EXISTS', message: 'Bunday SKU mavjud' });
      }
    }

    // Check Barcode uniqueness if provided
    if (data.barcode) {
      const existingBarcode = await this.prisma.product.findFirst({
        where: { businessId, barcode: data.barcode },
      });
      if (existingBarcode) {
        throw new ConflictException({ code: 'BARCODE_EXISTS', message: 'Bunday shtrix-kod mavjud' });
      }
    }

    // Default unit if not supplied
    let unitId = data.unitId;
    if (!unitId) {
      const defaultUnit = await this.prisma.unit.findFirst({ where: { shortName: 'dona' } });
      unitId = defaultUnit?.id || '00000000-0000-0000-0000-000000000020';
    }

    const effectiveBrand = data.productType || data.brand || (data.isKitchenItem ? 'dish' : 'goods');
    const effectiveImage = data.imageUrl || data.image || null;

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          businessId,
          branchId: data.branchId || null,
          name: data.name,
          sku,
          barcode: data.barcode || null,
          categoryId: data.categoryId || null,
          brand: effectiveBrand,
          unitId,
          purchasePrice: data.purchasePrice || 0,
          salePrice: data.salePrice,
          minStock: data.minStockLevel || 0,
          imageUrl: effectiveImage,
          description: data.description || null,
          status: data.status || 'active',
        },
        include: { category: true, unit: true },
      });

      // If initial stock provided, initialize inventory
      if (data.initialStock && Number(data.initialStock) > 0 && data.branchId) {
        await tx.inventory.create({
          data: {
            branchId: data.branchId,
            productId: product.id,
            quantity: Number(data.initialStock),
            reservedQty: 0,
          },
        });

        await tx.inventoryTransaction.create({
          data: {
            branchId: data.branchId,
            productId: product.id,
            type: 'in',
            reason: 'manual',
            quantity: Number(data.initialStock),
            quantityBefore: 0,
            quantityAfter: Number(data.initialStock),
            referenceType: 'initial_stock',
            createdBy: userId,
          },
        });
      }

      return product;
    });
  }

  async update(businessId: string, id: string, data: UpdateProductDto) {
    const product = await this.findOne(businessId, id);
    const effectiveBrand = data.productType || data.brand || product.brand;
    const effectiveImage = data.imageUrl !== undefined ? data.imageUrl : data.image !== undefined ? data.image : product.imageUrl;

    return this.prisma.product.update({
      where: { id: product.id },
      data: {
        name: data.name,
        categoryId: data.categoryId,
        brand: effectiveBrand,
        unitId: data.unitId,
        purchasePrice: data.purchasePrice,
        salePrice: data.salePrice,
        minStock: data.minStockLevel,
        imageUrl: effectiveImage,
        description: data.description,
        status: data.status,
      },
      include: { category: true, unit: true },
    });
  }

  async remove(businessId: string, id: string) {
    // Check if product is in orders or inventory transactions
    const [hasOrders, hasInventoryTx] = await Promise.all([
      this.prisma.orderItem.count({ where: { productId: id } }),
      this.prisma.inventoryTransaction.count({ where: { productId: id } }),
    ]);

    if (hasOrders > 0 || hasInventoryTx > 0) {
      // Soft delete / archive
      return this.prisma.product.update({
        where: { id },
        data: { status: 'archived' },
      });
    }

    return this.prisma.product.delete({
      where: { id },
    });
  }

  // Bestsellers (Last 30 days)
  async getBestsellers(businessId: string, limit = 10, periodDays = 30) {
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - periodDays);

    const items = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        productId: { not: null },
        order: {
          businessId,
          status: 'completed',
          createdAt: { gte: dateFrom },
        },
      },
      _sum: {
        quantity: true,
        total: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: limit,
    });

    const productIds = items.map((i) => i.productId).filter(Boolean) as string[];
    
    // If no sales yet, return top products by creation/order
    if (productIds.length === 0) {
      const topProducts = await this.prisma.product.findMany({
        where: { businessId, status: 'active' },
        include: {
          category: true,
          unit: true,
          inventory: true,
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
      return topProducts.map((p) => {
        const stockQty = p.inventory.reduce((acc, curr) => acc + Number(curr.quantity), 0);
        const reservedQty = p.inventory.reduce((acc, curr) => acc + Number(curr.reservedQty), 0);
        return {
          ...p,
          stockQty,
          availableQty: stockQty - reservedQty,
          soldCount30d: 0,
          salesTotal30d: 0,
        };
      });
    }

    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, businessId },
      include: {
        category: true,
        unit: true,
        inventory: true,
      },
    });

    const productsMap = new Map(products.map((p) => [p.id, p]));

    return items
      .map((item) => {
        const prod = productsMap.get(item.productId!);
        if (!prod) return null;
        const stockQty = prod.inventory.reduce((acc, curr) => acc + Number(curr.quantity), 0);
        const reservedQty = prod.inventory.reduce((acc, curr) => acc + Number(curr.reservedQty), 0);
        return {
          ...prod,
          stockQty,
          availableQty: stockQty - reservedQty,
          soldCount30d: Number(item._sum.quantity || 0),
          salesTotal30d: Number(item._sum.total || 0),
        };
      })
      .filter(Boolean);
  }

  // Categories
  async getCategories(businessId: string) {
    const categories = await this.prisma.category.findMany({
      where: { businessId },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    // Build category tree
    const rootCategories = categories.filter((c) => !c.parentId);
    const categoryMap = new Map();
    categories.forEach((c) =>
      categoryMap.set(c.id, {
        ...c,
        productsCount: c._count.products,
        children: [],
      })
    );

    categories.forEach((c) => {
      if (c.parentId && categoryMap.has(c.parentId)) {
        categoryMap.get(c.parentId).children.push(categoryMap.get(c.id));
      }
    });

    return rootCategories.map((rc) => categoryMap.get(rc.id));
  }

  async createCategory(businessId: string, data: { name: string; parentId?: string; icon?: string; color?: string; sortOrder?: number }) {
    return this.prisma.category.create({
      data: {
        businessId,
        name: data.name,
        parentId: data.parentId || null,
        icon: data.icon || null,
        color: data.color || null,
        sortOrder: data.sortOrder || 0,
      },
    });
  }

  async updateCategory(businessId: string, id: string, data: { name?: string; parentId?: string; icon?: string; color?: string; sortOrder?: number }) {
    const existing = await this.prisma.category.findFirst({
      where: { id, businessId },
    });
    if (!existing) {
      throw new NotFoundException({ code: 'CATEGORY_NOT_FOUND', message: 'Kategoriya topilmadi' });
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        name: data.name !== undefined ? data.name : existing.name,
        parentId: data.parentId !== undefined ? data.parentId : existing.parentId,
        icon: data.icon !== undefined ? data.icon : existing.icon,
        color: data.color !== undefined ? data.color : existing.color,
        sortOrder: data.sortOrder !== undefined ? data.sortOrder : existing.sortOrder,
      },
    });
  }

  async deleteCategory(businessId: string, id: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, businessId },
    });
    if (!category) {
      throw new NotFoundException({ code: 'CATEGORY_NOT_FOUND', message: 'Kategoriya topilmadi' });
    }

    const hasChildren = await this.prisma.category.count({ where: { parentId: id } });
    if (hasChildren > 0) {
      throw new BadRequestException({
        code: 'CATEGORY_HAS_CHILDREN',
        message: 'Ost-kategoriyalari mavjud bo\'lgan kategoriyani o\'chirib bo\'lmaydi',
      });
    }

    // Reassign associated products to null (or general)
    await this.prisma.product.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    });

    return this.prisma.category.delete({ where: { id } });
  }

  // Units
  async getUnits(businessId: string) {
    return this.prisma.unit.findMany({
      where: {
        OR: [{ businessId: null }, { businessId }],
      },
      orderBy: { name: 'asc' },
    });
  }

  async createUnit(businessId: string, data: { name: string; shortName: string; allowDecimal?: boolean }) {
    return this.prisma.unit.create({
      data: {
        businessId,
        name: data.name,
        shortName: data.shortName,
        allowDecimal: data.allowDecimal || false,
      },
    });
  }
}
