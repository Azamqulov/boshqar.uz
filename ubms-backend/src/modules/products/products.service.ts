import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductStatus } from '@prisma/client';
import { resolveTrackInventory } from '../../common/utils/inventory-tracking.util';

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
  // null/undefined = kategoriya default'ini meros qiladi. true/false = aniq override.
  trackInventory?: boolean | null;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

export interface CreateCategoryDto {
  name: string;
  parentId?: string;
  icon?: string;
  color?: string;
  description?: string;
  sortOrder?: number;
  // Ushbu turkumdagi yangi mahsulotlar uchun standart qoldiq kuzatuvi (default: true)
  defaultTrackInventory?: boolean;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}

export interface CreateUnitDto {
  name: string;
  shortName: string;
}

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAllLite(businessId: string, branchId?: string, query?: { search?: string; categoryId?: string; limit?: number }) {
    const limit = Math.min(Number(query?.limit) || 1000, 2000);
    const where: any = {
      businessId,
      status: { not: 'archived' },
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

    const items = await this.prisma.product.findMany({
      where,
      select: {
        id: true,
        businessId: true,
        branchId: true,
        name: true,
        sku: true,
        barcode: true,
        categoryId: true,
        brand: true,
        unitId: true,
        purchasePrice: true,
        salePrice: true,
        taxRate: true,
        minStock: true,
        trackInventory: true,
        imageUrl: true,
        status: true,
        category: { select: { id: true, name: true, color: true, defaultTrackInventory: true } },
        unit: { select: { id: true, name: true, shortName: true } },
        inventory: {
          select: {
            branchId: true,
            quantity: true,
            reservedQty: true,
          },
        },
      },
      take: limit,
      orderBy: { name: 'asc' },
    });

    return items.map((prod) => {
      const isMadeToOrder = !resolveTrackInventory(prod);

      const branchInventories = branchId ? prod.inventory.filter((inv) => inv.branchId === branchId) : prod.inventory;
      const targetInventories = branchInventories.length > 0 ? branchInventories : prod.inventory;

      const stockQty = targetInventories.reduce((acc, curr) => acc + Number(curr.quantity), 0);
      const reservedQty = targetInventories.reduce((acc, curr) => acc + Number(curr.reservedQty), 0);

      const effectiveStockQty = isMadeToOrder ? (prod.status === 'active' ? 9999 : 0) : stockQty;
      const effectiveAvailableQty = isMadeToOrder ? (prod.status === 'active' ? 9999 : 0) : Math.max(0, stockQty - reservedQty);

      return {
        id: prod.id,
        businessId: prod.businessId,
        branchId: prod.branchId,
        name: prod.name,
        sku: prod.sku,
        barcode: prod.barcode,
        categoryId: prod.categoryId,
        category: prod.category,
        brand: prod.brand,
        unitId: prod.unitId,
        unit: prod.unit,
        purchasePrice: Number(prod.purchasePrice),
        salePrice: Number(prod.salePrice),
        taxRate: Number(prod.taxRate),
        minStock: Number(prod.minStock),
        trackInventory: prod.trackInventory, // null = kategoriyadan meros
        imageUrl: prod.imageUrl,
        status: prod.status,
        isMadeToOrder,
        isAvailable: prod.status === 'active',
        stockQty: effectiveStockQty,
        reservedQty,
        availableQty: effectiveAvailableQty,
        isLowStock: !isMadeToOrder && effectiveStockQty <= Number(prod.minStock),
      };
    });
  }

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
          inventory: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    const formattedItems = items.map((prod) => {
      const isMadeToOrder = !resolveTrackInventory(prod);

      const branchInventories = branchId ? prod.inventory.filter((inv) => inv.branchId === branchId) : prod.inventory;
      const targetInventories = branchInventories.length > 0 ? branchInventories : prod.inventory;

      const stockQty = targetInventories.reduce((acc, curr) => acc + Number(curr.quantity), 0);
      const reservedQty = targetInventories.reduce((acc, curr) => acc + Number(curr.reservedQty), 0);

      // Buyurtma asosida tayyorlanadigan mahsulot (trackInventory=false) uchun
      // qoldiq cheksiz deb hisoblanadi, faqat stop-list (status=inactive) qilinsa yopiladi
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
    // Optimize all pre-checks concurrently to minimize round-trip latency
    const [existingSku, existingBarcode, defaultBranch] = await Promise.all([
      data.sku?.trim()
        ? this.prisma.product.findFirst({ where: { businessId, sku: data.sku.trim() } })
        : null,
      data.barcode?.trim()
        ? this.prisma.product.findFirst({ where: { businessId, barcode: data.barcode.trim() } })
        : null,
      !data.branchId && !branchId
        ? this.prisma.branch.findFirst({ where: { businessId, isMain: true } })
        : null,
    ]);

    if (existingSku) {
      throw new ConflictException({ code: 'SKU_EXISTS', message: 'Bunday SKU mavjud' });
    }

    if (existingBarcode) {
      throw new ConflictException({ code: 'BARCODE_EXISTS', message: 'Bunday shtrix-kod mavjud' });
    }

    let sku = data.sku?.trim() || null;
    if (!sku) {
      const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      sku = `PRD-${Date.now().toString().slice(-6)}-${randomSuffix}`;
    }

    // Default unit fallback ID
    const unitId = data.unitId || '00000000-0000-0000-0000-000000000020';
    const effectiveBrand = data.productType || data.brand || (data.isKitchenItem ? 'dish' : 'goods');
    const effectiveImage = data.imageUrl || data.image || null;
    const targetBranchId = data.branchId || branchId || defaultBranch?.id;
    // Eski isKitchenItem/productType='dish' bilan yaratilgan mahsulotlar uchun ham
    // yangi trackInventory maydonini to'g'ridan-to'g'ri false qilib qo'yamiz —
    // shunda kelajakda kategoriyani o'zgartirsalar ham override saqlanib qoladi.
    const explicitTrackInventory =
      data.trackInventory !== undefined
        ? data.trackInventory
        : data.isKitchenItem || data.productType === 'dish'
          ? false
          : null;

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
          trackInventory: explicitTrackInventory,
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
            businessId,
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

      const isMadeToOrder = !resolveTrackInventory(product);

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
    // trackInventory: agar so'rovda aniq kelmasa — eski qiymat saqlanadi (o'zgarmaydi)
    const effectiveTrackInventory =
      data.trackInventory !== undefined ? data.trackInventory : (product as any).trackInventory;

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
          trackInventory: effectiveTrackInventory,
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
              businessId,
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

      const isMadeToOrder = !resolveTrackInventory(updatedProduct);

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
    const where: any = { id };
    if (businessId) {
      where.businessId = businessId;
    }
    const product = await this.prisma.product.findFirst({
      where,
    });
    if (!product) {
      throw new NotFoundException({ code: 'PRODUCT_NOT_FOUND', message: 'Mahsulot topilmadi' });
    }

    // Check if product is in orders, inventory transactions, or stock transfers
    const [hasOrders, hasInventoryTx, hasTransferItems] = await Promise.all([
      this.prisma.orderItem.count({ where: { productId: id } }),
      this.prisma.inventoryTransaction.count({ where: { productId: id } }),
      this.prisma.stockTransferItem.count({ where: { productId: id } }),
    ]);

    if (hasOrders > 0 || hasInventoryTx > 0 || hasTransferItems > 0) {
      // Soft delete / archive so historical reports and receipts stay intact
      return this.prisma.product.update({
        where: { id },
        data: { status: 'archived' },
      });
    }

    // Clean up inventory records before hard deleting product
    await this.prisma.inventory.deleteMany({
      where: { productId: id },
    });

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
          OR: [
            { completedAt: { gte: dateFrom } },
            { completedAt: null, createdAt: { gte: dateFrom } },
            { createdAt: { gte: dateFrom } },
          ],
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
          soldCount: 0,
          salesTotal: 0,
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
          soldCount: Number(item._sum.quantity || 0),
          salesTotal: Number(item._sum.total || 0),
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

  async createCategory(businessId: string, data: { name: string; parentId?: string; icon?: string; color?: string; sortOrder?: number; defaultTrackInventory?: boolean }) {
    return this.prisma.category.create({
      data: {
        businessId,
        name: data.name,
        parentId: data.parentId || null,
        icon: data.icon || null,
        color: data.color || null,
        sortOrder: data.sortOrder || 0,
        defaultTrackInventory: data.defaultTrackInventory !== undefined ? data.defaultTrackInventory : true,
      },
    });
  }

  async updateCategory(businessId: string, id: string, data: { name?: string; parentId?: string; icon?: string; color?: string; sortOrder?: number; defaultTrackInventory?: boolean }) {
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
        defaultTrackInventory:
          data.defaultTrackInventory !== undefined ? data.defaultTrackInventory : existing.defaultTrackInventory,
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

  // Excel / CSV Batch Import
  async batchImport(
    businessId: string,
    branchId: string | undefined,
    userId: string,
    items: Array<{
      name: string;
      salePrice: number;
      purchasePrice?: number;
      sku?: string;
      barcode?: string;
      initialStock?: number;
      minStock?: number;
      categoryName?: string;
      unitName?: string;
    }>,
  ) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new BadRequestException({ code: 'EMPTY_IMPORT', message: 'Import uchun tovarlar ro\'yxati bo\'sh' });
    }

    const [defaultBranch, units, categories] = await Promise.all([
      this.prisma.branch.findFirst({ where: { businessId, isMain: true } }),
      this.prisma.unit.findMany({ where: { OR: [{ businessId }, { businessId: null }] } }),
      this.prisma.category.findMany({ where: { businessId } }),
    ]);

    const targetBranchId = branchId || defaultBranch?.id;
    const defaultUnit = units.find((u) => u.shortName === 'dona' || u.name.toLowerCase().includes('dona')) || units[0];

    const categoryMap = new Map<string, string>();
    categories.forEach((c) => categoryMap.set(c.name.toLowerCase().trim(), c.id));

    const unitMap = new Map<string, string>();
    units.forEach((u) => {
      unitMap.set(u.name.toLowerCase().trim(), u.id);
      unitMap.set(u.shortName.toLowerCase().trim(), u.id);
    });

    let importedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.name?.trim()) {
        skippedCount++;
        continue;
      }

      try {
        const cleanName = item.name.trim();
        const salePrice = Number(item.salePrice || 0);
        const purchasePrice = Number(item.purchasePrice || 0);
        const minStock = Number(item.minStock || 0);
        const initialStock = Number(item.initialStock || 0);
        let sku = item.sku?.trim() || null;
        const barcode = item.barcode?.trim() || null;

        if (!sku) {
          const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
          sku = `IMP-${Date.now().toString().slice(-4)}${i}-${rand}`;
        }

        let categoryId: string | null = null;
        if (item.categoryName?.trim()) {
          const cKey = item.categoryName.trim().toLowerCase();
          if (categoryMap.has(cKey)) {
            categoryId = categoryMap.get(cKey)!;
          } else {
            const newCat = await this.prisma.category.create({
              data: {
                businessId,
                name: item.categoryName.trim(),
              },
            });
            categoryId = newCat.id;
            categoryMap.set(cKey, newCat.id);
          }
        }

        let unitId = defaultUnit?.id || '00000000-0000-0000-0000-000000000020';
        if (item.unitName?.trim()) {
          const uKey = item.unitName.trim().toLowerCase();
          if (unitMap.has(uKey)) {
            unitId = unitMap.get(uKey)!;
          }
        }

        const existingProduct = await this.prisma.product.findFirst({
          where: {
            businessId,
            OR: [
              { sku },
              ...(barcode ? [{ barcode }] : []),
            ],
          },
        });

        if (existingProduct) {
          await this.prisma.product.update({
            where: { id: existingProduct.id },
            data: {
              name: cleanName,
              salePrice,
              purchasePrice,
              ...(categoryId ? { categoryId } : {}),
              minStock,
            },
          });

          if (initialStock > 0 && targetBranchId) {
            await this.prisma.inventory.upsert({
              where: {
                branchId_productId: {
                  branchId: targetBranchId,
                  productId: existingProduct.id,
                },
              },
              create: {
                businessId,
                branchId: targetBranchId,
                productId: existingProduct.id,
                quantity: initialStock,
              },
              update: {
                quantity: initialStock,
              },
            });
          }
        } else {
          const newProduct = await this.prisma.product.create({
            data: {
              businessId,
              branchId: targetBranchId || null,
              name: cleanName,
              sku,
              barcode,
              categoryId,
              unitId,
              purchasePrice,
              salePrice,
              minStock,
              status: 'active',
            },
          });

          if (initialStock > 0 && targetBranchId) {
            await this.prisma.inventory.create({
              data: {
                businessId,
                branchId: targetBranchId,
                productId: newProduct.id,
                quantity: initialStock,
              },
            });
          }
        }

        importedCount++;
      } catch (e: any) {
        errors.push(`Qator ${i + 1} (${item.name}): ${e.message}`);
        skippedCount++;
      }
    }

    return {
      success: true,
      total: items.length,
      imported: importedCount,
      skipped: skippedCount,
      errors,
    };
  }

  // In-memory cache for external image search results (TTL 24 hours)
  private imageSearchCache = new Map<string, { timestamp: number; data: any }>();

  // Google / Unsplash Product Image Search Gallery
  async searchProductImages(query: string = '', categoryName?: string) {
    const rawQuery = `${query || ''} ${categoryName || ''}`.trim();
    const q = rawQuery.toLowerCase();
    const cacheKey = `img_search_${q}`;

    // 1. Check in-memory cache
    const cached = this.imageSearchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
      return cached.data;
    }

    // 2. Attempt Google Custom Search JSON API if credentials are provided
    const googleApiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const googleCx = process.env.GOOGLE_SEARCH_ENGINE_ID;

    if (googleApiKey && googleCx && q.length >= 2) {
      try {
        const googleUrl = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(googleApiKey)}&cx=${encodeURIComponent(googleCx)}&q=${encodeURIComponent(rawQuery)}&searchType=image&num=10&safe=active`;
        const response = await fetch(googleUrl);
        if (response.ok) {
          const data = await response.json();
          if (data && Array.isArray(data.items) && data.items.length > 0) {
            const googleResults = data.items.map((item: any, idx: number) => ({
              id: `google-${idx + 1}-${Date.now()}`,
              title: item.title || rawQuery,
              category: 'Google Qidiruv',
              url: item.link,
            }));

            const resultObj = {
              query: rawQuery,
              source: 'google',
              count: googleResults.length,
              images: googleResults,
            };
            this.imageSearchCache.set(cacheKey, { timestamp: Date.now(), data: resultObj });
            return resultObj;
          }
        }
      } catch (googleErr) {
        console.warn('Google Custom Search API fallback to static db:', googleErr);
      }
    }

    // Comprehensive Categorized Real Product Database for Shops & Supermarkets
    const database: Array<{ id: string; title: string; category: string; url: string; keywords: string[] }> = [
      // 1. Shashlik / Kabob / BBQ
      { id: 'shashlik-1', title: 'Qiyma Shashlik / Kabob', category: 'Taomlar', url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80', keywords: ['shashlik', 'kabob', 'bbq', 'grill', 'shaslik', 'mangal'] },
      { id: 'shashlik-2', title: 'Tovuq Shashlik (Chicken BBQ)', category: 'Taomlar', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80', keywords: ['shashlik', 'kabob', 'tovuq shashlik', 'bbq'] },
      { id: 'shashlik-3', title: 'Grill Shashlik To\'plami', category: 'Taomlar', url: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&auto=format&fit=crop&q=80', keywords: ['shashlik', 'kabob', 'grill'] },
      { id: 'shashlik-4', title: 'Qaburg\'a Shashlik', category: 'Taomlar', url: 'https://images.unsplash.com/photo-1532636875304-0c89119d9b4d?w=600&auto=format&fit=crop&q=80', keywords: ['shashlik', 'kabob', 'barbekyu'] },

      // 2. Lavash / Doner / Shavarma / Wrap
      { id: 'lavash-1', title: 'Katta Go\'shtli Lavash', category: 'Fast-Food', url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80', keywords: ['lavash', 'wrap', 'doner', 'shavarma', 'fastfood'] },
      { id: 'lavash-2', title: 'Tovuqli Mini Lavash', category: 'Fast-Food', url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop&q=80', keywords: ['lavash', 'wrap', 'tovuq lavash'] },
      { id: 'lavash-3', title: 'Pishloqli Lavash (Cheese Wrap)', category: 'Fast-Food', url: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=600&auto=format&fit=crop&q=80', keywords: ['lavash', 'wrap', 'doner'] },

      // 3. Somsa, Osh, Non
      { id: 'somsa-1', title: 'Tandir Somsa (Tandir Samsa)', category: 'Milliy Taom', url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80', keywords: ['somsa', 'samsa', 'tandir somsa'] },
      { id: 'osh-1', title: 'O\'zbek Milliy Oshi (Toy Oshi)', category: 'Milliy Taom', url: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600&auto=format&fit=crop&q=80', keywords: ['osh', 'plov', 'palov', 'toshkent osh'] },
      { id: 'non-1', title: 'O\'zbek Tandir Noni', category: 'Oziq-ovqat', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80', keywords: ['non', 'patir', 'bread'] },

      // 4. Burger va Pizza
      { id: 'burger-1', title: 'Klassik Gamburger', category: 'Fast-Food', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80', keywords: ['burger', 'gamburger', 'cheeseburger'] },
      { id: 'pizza-1', title: 'Pizza Pepperoni', category: 'Fast-Food', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80', keywords: ['pizza', 'pitsa', 'pepperoni'] },

      // 5. Gazli va Gazsiz Ichimliklar (Drinks)
      { id: 'cola-1', title: 'Coca-Cola 1.5L Plastik', category: 'Ichimliklar', url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80', keywords: ['cola', 'kola', 'cocacola', 'coca-cola', 'coca'] },
      { id: 'cola-2', title: 'Coca-Cola Classic Banka', category: 'Ichimliklar', url: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600&auto=format&fit=crop&q=80', keywords: ['cola', 'kola', 'cocacola', 'coca-cola'] },
      { id: 'pepsi-1', title: 'Pepsi 1.5L Plastik', category: 'Ichimliklar', url: 'https://images.unsplash.com/photo-1553456558-aff63285bdd1?w=600&auto=format&fit=crop&q=80', keywords: ['pepsi', 'pepsi-cola', 'pepsicola'] },
      { id: 'fanta-1', title: 'Fanta Orange Apelsin', category: 'Ichimliklar', url: 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=600&auto=format&fit=crop&q=80', keywords: ['fanta', 'orange', 'apelsin'] },
      { id: 'sprite-1', title: 'Sprite Limon', category: 'Ichimliklar', url: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=600&auto=format&fit=crop&q=80', keywords: ['sprite', 'limon'] },
      { id: 'water-1', title: 'Tabiiy Suv (Mineral Water)', category: 'Ichimliklar', url: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600&auto=format&fit=crop&q=80', keywords: ['suv', 'water', 'nestle', 'bonaqua'] },
      { id: 'redbull-1', title: 'Red Bull Energetik', category: 'Ichimliklar', url: 'https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=600&auto=format&fit=crop&q=80', keywords: ['redbull', 'flash', 'gorilla', 'energetik'] },

      // 6. Asosiy Do'kon Mahsulotlari (Un, Guruch, Yog', Shakar, Makaron, Ketchup)
      { id: 'flour-1', title: 'Bug\'doy Uni 1-Nav', category: 'Oziq-ovqat', url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80', keywords: ['un', 'flour', 'muqa'] },
      { id: 'rice-1', title: 'Alanga Guruch / Lazar', category: 'Oziq-ovqat', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80', keywords: ['guruch', 'rice', 'devzira', 'alanga'] },
      { id: 'oil-1', title: 'O\'simlik Yog\'i (Pista Yog\')', category: 'Oziq-ovqat', url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80', keywords: ['yog', 'yogi', 'oil', 'pista yog'] },
      { id: 'sugar-1', title: 'Oq Shakar (Sugar)', category: 'Oziq-ovqat', url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80', keywords: ['shakar', 'sugar', 'sahar'] },
      { id: 'pasta-1', title: 'Makaron / Spagetti', category: 'Oziq-ovqat', url: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=600&auto=format&fit=crop&q=80', keywords: ['makaron', 'spagetti', 'pasta'] },
      { id: 'sauce-1', title: 'Ketchup va Mayonez', category: 'Oziq-ovqat', url: 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?w=600&auto=format&fit=crop&q=80', keywords: ['ketchup', 'mayonez', 'sous', 'tomat'] },

      // 7. Shirinliklar, Shokolad va Chips (Snacks & Chocolates)
      { id: 'snickers-1', title: 'Snickers Shokoladi', category: 'Shirinliklar', url: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?w=600&auto=format&fit=crop&q=80', keywords: ['snickers', 'shokolad', 'batonchik'] },
      { id: 'twix-1', title: 'Twix Batonchik', category: 'Shirinliklar', url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80', keywords: ['twix', 'shokolad'] },
      { id: 'lays-1', title: "Lay's Kartoshka Chipsi", category: 'Sneklar', url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600&auto=format&fit=crop&q=80', keywords: ['lays', 'chips', 'kartoshka'] },
      { id: 'nutella-1', title: 'Nutella Shokolad Pastasi', category: 'Shirinliklar', url: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&auto=format&fit=crop&q=80', keywords: ['nutella', 'pasta', 'shokolad'] },

      // 8. Mevalar va Sabzavotlar
      { id: 'peach-1', title: 'Pishgan Qizil Shaftoli', category: 'Mevalar', url: 'https://images.unsplash.com/photo-1595123550441-d377e017de6a?w=600&auto=format&fit=crop&q=80', keywords: ['shaftoli', 'peach', 'persik'] },
      { id: 'apple-1', title: 'Qizil Olma (Fresh Red Apple)', category: 'Mevalar', url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80', keywords: ['olma', 'apple', 'qizil olma'] },
      { id: 'banana-1', title: 'Banan (Fresh Banana)', category: 'Mevalar', url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80', keywords: ['banan', 'banana'] },
      { id: 'grape-1', title: 'Uzum (Fresh Grapes)', category: 'Mevalar', url: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=600&auto=format&fit=crop&q=80', keywords: ['uzum', 'grape'] },
      { id: 'tomato-1', title: 'Pomidor (Fresh Tomato)', category: 'Sabzavotlar', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80', keywords: ['pomidor', 'tomato'] },
      { id: 'cucumber-1', title: 'Bodring (Fresh Cucumber)', category: 'Sabzavotlar', url: 'https://images.unsplash.com/photo-1447175008436-0841719b8b80?w=600&auto=format&fit=crop&q=80', keywords: ['bodring', 'cucumber'] },

      // 9. Go'sht, Sut va Maishiy Kimyo
      { id: 'meat-1', title: 'Mol Go\'shti (Fresh Beef)', category: 'Go\'sht', url: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600&auto=format&fit=crop&q=80', keywords: ['gosht', 'go\'sht', 'meat', 'beef'] },
      { id: 'milk-1', title: 'Tabiiy Sut 3.2%', category: 'Sut', url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80', keywords: ['sut', 'milk', 'qatiq'] },
      { id: 'ariel-1', title: 'Ariel Avtomat Kir Yuvish Kukuni 3kg', category: 'Maishiy Kimyo', url: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&auto=format&fit=crop&q=80', keywords: ['kukun', 'ariel', 'persil', 'poroshok', 'kimyo', 'xojalik', 'kir'] },
      { id: 'persil-1', title: 'Persil Kir Yuvish Geli (Liquid Detergent)', category: 'Maishiy Kimyo', url: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=600&auto=format&fit=crop&q=80', keywords: ['persil', 'gel', 'kukun', 'detergent', 'yuvish'] },
      { id: 'fairy-1', title: 'Idish Yuvish Suyuqligi (Fairy)', category: 'Maishiy Kimyo', url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80', keywords: ['fairy', 'idish', 'gel'] },
      { id: 'shampoo-1', title: 'Shampun (Head & Shoulders / Pantene)', category: 'Shaxsiy Parvarish', url: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&auto=format&fit=crop&q=80', keywords: ['shampun', 'shampoo', 'pantene', 'head'] },
      { id: 'soap-1', title: 'Sovun (Dove / Duru)', category: 'Shaxsiy Parvarish', url: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=600&auto=format&fit=crop&q=80', keywords: ['sovun', 'soap', 'dove', 'duru'] },
      { id: 'coffee-1', title: 'Qahva (Nescafe / Cold Coffee)', category: 'Ichimliklar', url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80', keywords: ['coffee', 'qahva', 'kofe', 'nescafe'] },
    ];

    let results: Array<{ id: string; title: string; category: string; url: string }> = [];

    if (q) {
      const words = q.split(/\s+/).filter((w) => w.length >= 2);

      // Score matching items in database with high accuracy
      const scored = database
        .map((item) => {
          const titleLower = item.title.toLowerCase();
          const catLower = item.category.toLowerCase();
          let score = 0;

          for (const w of words) {
            if (item.keywords.some((k) => k === w)) {
              score += 25;
            } else if (item.keywords.some((k) => k.startsWith(w) || (w.length >= 4 && k.includes(w)))) {
              score += 12;
            }

            if (titleLower.includes(w)) {
              score += w.length >= 4 ? 15 : 6;
            }
            if (catLower.includes(w)) {
              score += 5;
            }
          }
          return { item, score };
        })
        .filter((r) => r.score >= 10)
        .sort((a, b) => b.score - a.score)
        .map((r) => r.item);

      results = scored;

      // Smart Dynamic Visual Fallback Generator if empty or fewer results:
      // Generates query-tailored HD photos dynamically so NO search turns up empty!
      if (results.length === 0) {
        let themePhotos = [
          'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80',
        ];

        if (q.includes('ariel') || q.includes('kukun') || q.includes('poroshok') || q.includes('persil') || q.includes('tide') || q.includes('kir') || q.includes('kimyo') || q.includes('xojalik')) {
          themePhotos = [
            'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?w=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=600&auto=format&fit=crop&q=80',
          ];
        } else if (q.includes('burg') || q.includes('gamburg') || q.includes('cheeseburg') || q.includes('chizburg') || q.includes('fast')) {
          themePhotos = [
            'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=600&auto=format&fit=crop&q=80',
          ];
        } else if (q.includes('shashlik') || q.includes('kabob') || q.includes('gosht') || q.includes('grill')) {
          themePhotos = [
            'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1532636875304-0c89119d9b4d?w=600&auto=format&fit=crop&q=80',
          ];
        } else if (q.includes('lavash') || q.includes('doner') || q.includes('shavarma') || q.includes('wrap')) {
          themePhotos = [
            'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1561651823-34feb02250e4?w=600&auto=format&fit=crop&q=80',
          ];
        }

        themePhotos.forEach((url, i) => {
          results.push({
            id: `smart-search-${i + 1}-${Date.now()}`,
            title: `${rawQuery} (${i + 1}-rasm)`,
            category: 'Smart Image Search',
            url,
          });
        });
      }
    } else {
      results = database;
    }

    return {
      query,
      count: results.length,
      images: results,
    };
  }
}
