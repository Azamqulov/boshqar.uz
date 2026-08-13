import { Controller, Get, Post, Put, Delete, Body, Param, Headers, BadRequestException } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CurrentBusinessId, CurrentBranchId } from '../../common/decorators/context.decorator';
import { RequirePermission } from '../../common/decorators/custom.decorator';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  findAll(
    @Headers('x-business-id') businessId: string,
    @Headers('x-branch-id') branchId?: string,
  ) {
    if (!businessId) throw new BadRequestException('Biznes tanlanmagan');
    return this.employeesService.findAll(businessId, branchId);
  }

  @Post()
  create(
    @Headers('x-business-id') businessId: string,
    @Body() body: any,
  ) {
    if (!businessId) throw new BadRequestException('Biznes tanlanmagan');
    return this.employeesService.create(businessId, body);
  }

  @Put(':id')
  update(
    @Headers('x-business-id') businessId: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    if (!businessId) throw new BadRequestException('Biznes tanlanmagan');
    return this.employeesService.update(businessId, id, body);
  }

  @Delete(':id')
  delete(
    @Headers('x-business-id') businessId: string,
    @Param('id') id: string,
  ) {
    if (!businessId) throw new BadRequestException('Biznes tanlanmagan');
    return this.employeesService.delete(businessId, id);
  }
}

@Controller('roles')
export class RolesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  getRoles(@Headers('x-business-id') businessId: string) {
    return this.employeesService.getRoles(businessId);
  }

  @Get('permissions')
  getPermissions() {
    return this.employeesService.getPermissions();
  }
}
