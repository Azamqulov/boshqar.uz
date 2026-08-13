import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {
  ProductsService,
  FindProductsQueryDto,
  CreateProductDto,
  UpdateProductDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateUnitDto,
} from './products.service';
import { CurrentBusinessId, CurrentBranchId, CurrentUser } from '../../common/decorators/context.decorator';
import { RequirePermission } from '../../common/decorators/custom.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @RequirePermission('products.view')
  findAll(
    @CurrentBusinessId() businessId: string,
    @CurrentBranchId() branchId: string,
    @Query() query: FindProductsQueryDto,
  ) {
    return this.productsService.findAll(businessId, branchId, query);
  }

  @Get('barcode/:barcode')
  @RequirePermission('products.view')
  findByBarcode(
    @CurrentBusinessId() businessId: string,
    @Param('barcode') barcode: string,
  ) {
    return this.productsService.findByBarcode(businessId, barcode);
  }

  @Get('bestsellers')
  @RequirePermission('products.view')
  getBestsellers(
    @CurrentBusinessId() businessId: string,
    @Query('limit') limit?: number,
    @Query('period') period?: string,
  ) {
    const limitNum = limit ? Number(limit) : 10;
    const periodDays = period === '30d' ? 30 : 30;
    return this.productsService.getBestsellers(businessId, limitNum, periodDays);
  }

  @Get(':id')
  @RequirePermission('products.view')
  findOne(
    @CurrentBusinessId() businessId: string,
    @Param('id') id: string,
  ) {
    return this.productsService.findOne(businessId, id);
  }

  @Post()
  @RequirePermission('products.create')
  create(
    @CurrentBusinessId() businessId: string,
    @CurrentUser('userId') userId: string,
    @Body() body: CreateProductDto,
  ) {
    return this.productsService.create(businessId, userId, body);
  }

  @Put(':id')
  @RequirePermission('products.update')
  update(
    @CurrentBusinessId() businessId: string,
    @Param('id') id: string,
    @Body() body: UpdateProductDto,
  ) {
    return this.productsService.update(businessId, id, body);
  }

  @Delete(':id')
  @RequirePermission('products.delete')
  remove(
    @CurrentBusinessId() businessId: string,
    @Param('id') id: string,
  ) {
    return this.productsService.remove(businessId, id);
  }
}

@Controller('categories')
export class CategoriesController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @RequirePermission('products.view')
  findAll(@CurrentBusinessId() businessId: string) {
    return this.productsService.getCategories(businessId);
  }

  @Post()
  @RequirePermission('products.create')
  create(@CurrentBusinessId() businessId: string, @Body() body: CreateCategoryDto) {
    return this.productsService.createCategory(businessId, body);
  }

  @Patch(':id')
  @RequirePermission('products.update')
  update(
    @CurrentBusinessId() businessId: string,
    @Param('id') id: string,
    @Body() body: UpdateCategoryDto,
  ) {
    return this.productsService.updateCategory(businessId, id, body);
  }

  @Delete(':id')
  @RequirePermission('products.delete')
  remove(@CurrentBusinessId() businessId: string, @Param('id') id: string) {
    return this.productsService.deleteCategory(businessId, id);
  }
}

@Controller('units')
export class UnitsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@CurrentBusinessId() businessId: string) {
    return this.productsService.getUnits(businessId);
  }

  @Post()
  @RequirePermission('products.create')
  create(@CurrentBusinessId() businessId: string, @Body() body: CreateUnitDto) {
    return this.productsService.createUnit(businessId, body);
  }
}
