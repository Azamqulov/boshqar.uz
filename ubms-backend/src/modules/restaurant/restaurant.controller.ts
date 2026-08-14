import { Controller, Get, Post, Patch, Delete, Body, Param, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RestaurantService } from './restaurant.service';
import { TableStatus, KitchenOrderStatus } from '@prisma/client';
import { CurrentBusinessId, CurrentBranchId } from '../../common/decorators/context.decorator';
import { RequirePermission } from '../../common/decorators/custom.decorator';

@ApiTags('Restoran & KDS (Stollar va Oshxona)')
@ApiBearerAuth()
@Controller('restaurant')
export class RestaurantController {
  constructor(private restaurantService: RestaurantService) {}

  @Get('tables')
  @RequirePermission('restaurant.view')
  @ApiOperation({ summary: 'Filialdagi stollar xaritasi va faol buyurtmalari' })
  getTables(@CurrentBranchId() branchId: string) {
    if (!branchId) throw new BadRequestException('Filial tanlanmagan');
    return this.restaurantService.getTables(branchId);
  }

  @Post('tables')
  @RequirePermission('restaurant.manage')
  @ApiOperation({ summary: 'Yangi stol qo\'shish' })
  createTable(
    @CurrentBranchId() branchId: string,
    @Body() body: { name: string; capacity?: number },
  ) {
    if (!branchId) throw new BadRequestException('Filial tanlanmagan');
    return this.restaurantService.createTable(branchId, body);
  }

  @Patch('tables/:id')
  @RequirePermission('restaurant.manage')
  @ApiOperation({ summary: 'Stol ma\'lumotlarini tahrirlash' })
  updateTable(
    @Param('id') id: string,
    @Body() body: { name?: string; capacity?: number },
  ) {
    return this.restaurantService.updateTable(id, body);
  }

  @Delete('tables/:id')
  @RequirePermission('restaurant.manage')
  @ApiOperation({ summary: 'Stolni o\'chirish' })
  deleteTable(@Param('id') id: string) {
    return this.restaurantService.deleteTable(id);
  }

  @Patch('tables/:id/status')
  @RequirePermission('restaurant.view')
  @ApiOperation({ summary: 'Stol holatini o\'zgartirish (available, occupied, cleaning)' })
  updateTableStatus(
    @Param('id') id: string,
    @Body('status') status: TableStatus,
  ) {
    return this.restaurantService.updateTableStatus(id, status);
  }

  @Post('tables/:tableId/order')
  @RequirePermission('restaurant.order')
  @ApiOperation({ summary: 'Afitsiant stolga buyurtma kiritishi / Oshxonaga taomlarni yuborish' })
  submitTableOrder(
    @CurrentBusinessId() businessId: string,
    @CurrentBranchId() branchId: string,
    @Param('tableId') tableId: string,
    @Body() body: { waiterId?: string; items: { productId: string; quantity: number; notes?: string }[] },
  ) {
    if (!businessId || !branchId) throw new BadRequestException('Biznes yoki Filial tanlanmagan');
    return this.restaurantService.submitTableOrder(businessId, branchId, tableId, body);
  }

  @Get('tables/:tableId/pre-bill')
  @RequirePermission('restaurant.view')
  @ApiOperation({ summary: 'Stol uchun Pre-chek (oralik hisob) chiqarish' })
  getTablePreBill(@Param('tableId') tableId: string) {
    return this.restaurantService.getTablePreBill(tableId);
  }

  @Post('tables/:tableId/pay')
  @RequirePermission('restaurant.pay')
  @ApiOperation({ summary: 'Stol hisobini yopish va to\'lovni qabul qilish' })
  payTableOrder(
    @CurrentBusinessId() businessId: string,
    @CurrentBranchId() branchId: string,
    @Param('tableId') tableId: string,
    @Body() body: { paymentMethodId: string; amount: number; serviceFee?: number; discountAmount?: number },
  ) {
    if (!businessId || !branchId) throw new BadRequestException('Biznes yoki Filial tanlanmagan');
    return this.restaurantService.payTableOrder(businessId, branchId, tableId, body);
  }

  @Get('kds')
  @RequirePermission('restaurant.kds')
  @ApiOperation({ summary: 'Oshxona (KDS) ekrani: Pishirilishi kerak bo\'lgan taomlar' })
  getKitchenOrders(@CurrentBranchId() branchId: string) {
    if (!branchId) throw new BadRequestException('Filial tanlanmagan');
    return this.restaurantService.getKitchenOrders(branchId);
  }

  @Patch('kds/:id/status')
  @RequirePermission('restaurant.kds')
  @ApiOperation({ summary: 'Oshxona taom holatini o\'zgartirish (new -> cooking -> ready -> served)' })
  updateKitchenStatus(
    @Param('id') id: string,
    @Body('status') status: KitchenOrderStatus,
  ) {
    return this.restaurantService.updateKitchenStatus(id, status);
  }
}
