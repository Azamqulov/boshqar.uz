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
  color?: string;
  description?: string;
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
      const isMadeToOrder =
        prod.brand === 'dish' ||
        prod.brand === 'kitchen' ||
        prod.brand === 'service' ||
        prod.unit?.shortName === 'por' ||
        prod.unitId === '00000000-0000-0000-0000-000000000024';

      const stockQty = prod.inventory.reduce((acc, curr) => acc + Number(curr.quantity), 0);
      const reservedQty = prod.inventory.reduce((acc, curr) => acc + Number(curr.reservedQty), 0);

      // For made-to-order items (food/dishes/services), stock is virtually unlimited unless marked inactive (stop-list)
      const effectiveStockQty = isMadeToOrder ? (prod.status === 'active' ? 9999 : 0) : stockQty;
      const effectiveAvailableQty = isMadeToOrder ? (prod.status === 'active' ? 9999 : 0) : Math.max(0, stockQty - reservedQty);

      return {
        ...prod,
        isMadeToOrder,
        isAvailable: prod.status === 'active',
        stockQty: effectiveStockQty,
        availableQty: effectiveAvailableQty,
        rawInventoryQty: stockQty,
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

  async create(businessId: string, branchId: string | undefined, userId: string, data: CreateProductDto) {
    // Generate SKU if not provided — use random suffix to avoid race conditions
    let sku = data.sku?.trim() || null;
    if (!sku) {
      const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      const count = await this.prisma.product.count({ where: { businessId } });
      sku = `PRD-${String(count + 1).padStart(6, '0')}-${randomSuffix}`;
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

    // Resolve target branch for stock tracking
    let targetBranchId = data.branchId || branchId;
    if (!targetBranchId) {
      const defaultBranch = await this.prisma.branch.findFirst({
        where: { businessId, isMain: true },
      }) || await this.prisma.branch.findFirst({
        where: { businessId },
      });
      targetBranchId = defaultBranch?.id;
    }

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          businessId,
          branchId: targetBranchId || null,
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

      const initialQty = Number(data.initialStock) || 0;

      // If initial stock provided, initialize inventory in target branch
      if (initialQty > 0 && targetBranchId) {
        await tx.inventory.upsert({
          where: {
            branchId_productId: {
              branchId: targetBranchId,
              productId: product.id,
            },
          },
          update: {
            quantity: initialQty,
          },
          create: {
            branchId: targetBranchId,
            productId: product.id,
            quantity: initialQty,
            reservedQty: 0,
          },
        });

        await tx.inventoryTransaction.create({
          data: {
            branchId: targetBranchId,
            productId: product.id,
            type: 'in',
            reason: 'manual',
            quantity: initialQty,
            quantityBefore: 0,
            quantityAfter: initialQty,
            referenceType: 'initial_stock',
            createdBy: userId || 'system',
          },
        });
      }

      const isMadeToOrder =
        product.brand === 'dish' ||
        product.brand === 'kitchen' ||
        product.brand === 'service' ||
        product.unit?.shortName === 'por' ||
        product.unitId === '00000000-0000-0000-0000-000000000024';

      const effectiveStockQty = isMadeToOrder ? (product.status === 'active' ? 9999 : 0) : initialQty;

      return {
        ...product,
        isMadeToOrder,
        isAvailable: product.status === 'active',
        stockQty: effectiveStockQty,
        availableQty: effectiveStockQty,
        rawInventoryQty: initialQty,
        inventory: targetBranchId ? [{ branchId: targetBranchId, quantity: initialQty, reservedQty: 0 }] : [],
      };
    });
  }

  async update(businessId: string, branchId: string | undefined, userId: string, id: string, data: UpdateProductDto) {
    const product = await this.findOne(businessId, id);
    const effectiveBrand = data.productType || data.brand || product.brand;
    const effectiveImage = data.imageUrl !== undefined ? data.imageUrl : data.image !== undefined ? data.image : product.imageUrl;

    let targetBranchId = data.branchId || branchId;
    if (!targetBranchId) {
      const defaultBranch = await this.prisma.branch.findFirst({
        where: { businessId, isMain: true },
      }) || await this.prisma.branch.findFirst({
        where: { businessId },
      });
      targetBranchId = defaultBranch?.id;
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
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

      if (data.initialStock !== undefined && data.initialStock !== null && Number(data.initialStock) >= 0 && targetBranchId) {
        const newQty = Number(data.initialStock);
        const existingInv = await tx.inventory.findUnique({
          where: {
            branchId_productId: {
              branchId: targetBranchId,
              productId: id,
            },
          },
        });

        const oldQty = existingInv ? Number(existingInv.quantity) : 0;
        if (!existingInv || newQty !== oldQty) {
          await tx.inventory.upsert({
            where: {
              branchId_productId: {
                branchId: targetBranchId,
                productId: id,
              },
            },
            update: { quantity: newQty },
            create: {
              branchId: targetBranchId,
              productId: id,
              quantity: newQty,
              reservedQty: 0,
            },
          });

          await tx.inventoryTransaction.create({
            data: {
              branchId: targetBranchId,
              productId: id,
              type: newQty >= oldQty ? 'in' : 'out',
              reason: 'manual',
              quantity: Math.abs(newQty - oldQty),
              quantityBefore: oldQty,
              quantityAfter: newQty,
              referenceType: 'stock_adjustment',
              createdBy: userId || 'system',
            },
          });
        }
      }

      // Re-fetch all inventory for accurate stock count
      const currentInventories = await tx.inventory.findMany({
        where: { productId: id },
      });
      const stockQty = currentInventories.reduce((acc, curr) => acc + Number(curr.quantity), 0);
      const reservedQty = currentInventories.reduce((acc, curr) => acc + Number(curr.reservedQty), 0);

      const isMadeToOrder =
        updatedProduct.brand === 'dish' ||
        updatedProduct.brand === 'kitchen' ||
        updatedProduct.brand === 'service' ||
        updatedProduct.unit?.shortName === 'por' ||
        updatedProduct.unitId === '00000000-0000-0000-0000-000000000024';

      const effectiveStockQty = isMadeToOrder ? (updatedProduct.status === 'active' ? 9999 : 0) : stockQty;
      const effectiveAvailableQty = isMadeToOrder ? (updatedProduct.status === 'active' ? 9999 : 0) : Math.max(0, stockQty - reservedQty);

      return {
        ...updatedProduct,
        isMadeToOrder,
        isAvailable: updatedProduct.status === 'active',
        stockQty: effectiveStockQty,
        availableQty: effectiveAvailableQty,
        rawInventoryQty: stockQty,
        inventory: currentInventories,
      };
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

  async toggleAvailability(businessId: string, id: string, targetStatus?: ProductStatus) {
    const product = await this.findOne(businessId, id);
    const newStatus: ProductStatus = targetStatus ? targetStatus : (product.status === 'active' ? 'inactive' : 'active');

    return this.prisma.product.update({
      where: { id: product.id },
      data: { status: newStatus },
      include: { category: true, unit: true },
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
