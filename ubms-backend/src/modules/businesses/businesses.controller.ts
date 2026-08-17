import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Headers, BadRequestException } from '@nestjs/common';
import { BusinessesService, CreateBusinessDto } from './businesses.service';
import { CurrentUser } from '../../common/decorators/context.decorator';
import { RequirePermission, Public } from '../../common/decorators/custom.decorator';

@Controller('businesses')
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Public()
  @Get('types')
  getAvailableTypes() {
    return this.businessesService.getAvailableTypes();
  }

  @Public()
  @Get('plans')
  getPublicPlans() {
    return this.businessesService.getPublicPlans();
  }

  @Post()
  create(@CurrentUser('userId') userId: string, @Body() dto: CreateBusinessDto) {
    return this.businessesService.create(userId, dto);
  }

  @Get()
  findAll(@CurrentUser('userId') userId: string) {
    return this.businessesService.findAllForUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.businessesService.findOne(id, userId);
  }

  @Put(':id')
  @RequirePermission('settings.manage')
  updatePut(@Param('id') id: string, @Body() dto: Partial<CreateBusinessDto>) {
    return this.businessesService.update(id, dto);
  }

  @Patch(':id')
  @RequirePermission('settings.manage')
  updatePatch(@Param('id') id: string, @Body() dto: Partial<CreateBusinessDto>) {
    return this.businessesService.update(id, dto);
  }

  @Get(':id/settings')
  getSettings(@Param('id') id: string) {
    return this.businessesService.getSettings(id);
  }

  @Put(':id/settings')
  @RequirePermission('settings.manage')
  updateSettings(@Param('id') id: string, @Body() body: any) {
    const settings = body.posSettings !== undefined ? body.posSettings : body;
    return this.businessesService.updateSettings(id, settings);
  }

  @Delete('current')
  deleteCurrent(
    @Headers('x-business-id') businessId: string,
    @CurrentUser('userId') userId: string,
  ) {
    if (!businessId) throw new BadRequestException('Biznes tanlanmagan');
    return this.businessesService.deleteBusiness(businessId, userId);
  }

  @Delete(':id')
  delete(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.businessesService.deleteBusiness(id, userId);
  }

  @Delete('account/me')
  deleteAccount(@CurrentUser('userId') userId: string) {
    return this.businessesService.deleteAccount(userId);
  }
}
