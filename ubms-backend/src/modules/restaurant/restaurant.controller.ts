import { Controller, Get, Post, Patch, Body, Param, Headers, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RestaurantService } from './restaurant.service';
import { TableStatus, KitchenOrderStatus } from '@prisma/client';

@ApiTags('Restoran & KDS (Stollar va Oshxona)')
@ApiBearerAuth()
@Controller('restaurant')
export class RestaurantController {
  constructor(private restaurantService: RestaurantService) {}

  @Get('tables')
  @ApiOperation({ summary: 'Filialdagi stollar xaritasi va faol buyurtmalari' })
  getTables(@Headers('x-branch-id') branchId: string) {
    if (!branchId) throw new BadRequestException('Filial tanlanmagan');
    return this.restaurantService.getTables(branchId);
  }

  @Post('tables')
  @ApiOperation({ summary: 'Yangi stol qo\'shish' })
  createTable(
    @Headers('x-branch-id') branchId: string,
    @Body() body: { name: string; capacity?: number },
  ) {
    if (!branchId) throw new BadRequestException('Filial tanlanmagan');
    return this.restaurantService.createTable(branchId, body);
  }

  @Patch('tables/:id/status')
  @ApiOperation({ summary: 'Stol holatini o\'zgartirish (available, occupied, cleaning)' })
  updateTableStatus(
    @Param('id') id: string,
    @Body('status') status: TableStatus,
  ) {
    return this.restaurantService.updateTableStatus(id, status);
  }

  @Post('tables/:tableId/order')
  @ApiOperation({ summary: 'Afitsiant stolga buyurtma kiritishi / Oshxonaga taomlarni yuborish' })
  submitTableOrder(
    @Headers('x-business-id') businessId: string,
    @Headers('x-branch-id') branchId: string,
    @Param('tableId') tableId: string,
    @Body() body: { waiterId?: string; items: { productId: string; quantity: number; notes?: string }[] },
  ) {
    if (!businessId || !branchId) throw new BadRequestException('Biznes yoki Filial tanlanmagan');
    return this.restaurantService.submitTableOrder(businessId, branchId, tableId, body);
  }

  @Get('tables/:tableId/pre-bill')
  @ApiOperation({ summary: 'Stol uchun Pre-chek (oralik hisob) chiqarish' })
  getTablePreBill(@Param('tableId') tableId: string) {
    return this.restaurantService.getTablePreBill(tableId);
  }

  @Get('kds')
  @ApiOperation({ summary: 'Oshxona (KDS) ekrani: Pishirilishi kerak bo\'lgan taomlar' })
  getKitchenOrders(@Headers('x-branch-id') branchId: string) {
    if (!branchId) throw new BadRequestException('Filial tanlanmagan');
    return this.restaurantService.getKitchenOrders(branchId);
  }

  @Patch('kds/:id/status')
  @ApiOperation({ summary: 'Oshxona taom holatini o\'zgartirish (new -> cooking -> ready -> served)' })
  updateKitchenStatus(
    @Param('id') id: string,
    @Body('status') status: KitchenOrderStatus,
  ) {
    return this.restaurantService.updateKitchenStatus(id, status);
  }
}
