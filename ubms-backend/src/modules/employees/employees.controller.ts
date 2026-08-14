import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { EmployeesService, CreateEmployeeDto, UpdateEmployeeDto } from './employees.service';
import { CurrentBusinessId, CurrentBranchId } from '../../common/decorators/context.decorator';
import { RequirePermission } from '../../common/decorators/custom.decorator';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  @RequirePermission('employees.view')
  findAll(
    @CurrentBusinessId() businessId: string,
    @CurrentBranchId() branchId?: string,
  ) {
    if (!businessId) throw new BadRequestException('Biznes tanlanmagan');
    return this.employeesService.findAll(businessId, branchId);
  }

  @Post()
  @RequirePermission('employees.create')
  create(
    @CurrentBusinessId() businessId: string,
    @Body() body: CreateEmployeeDto,
  ) {
    if (!businessId) throw new BadRequestException('Biznes tanlanmagan');
    return this.employeesService.create(businessId, body);
  }

  @Put(':id')
  @RequirePermission('employees.edit')
  update(
    @CurrentBusinessId() businessId: string,
    @Param('id') id: string,
    @Body() body: UpdateEmployeeDto,
  ) {
    if (!businessId) throw new BadRequestException('Biznes tanlanmagan');
    return this.employeesService.update(businessId, id, body);
  }

  @Delete(':id')
  @RequirePermission('employees.delete')
  delete(
    @CurrentBusinessId() businessId: string,
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
  @RequirePermission('employees.view')
  getRoles(@CurrentBusinessId() businessId: string) {
    if (!businessId) throw new BadRequestException('Biznes tanlanmagan');
    return this.employeesService.getRoles(businessId);
  }

  @Get('permissions')
  @RequirePermission('employees.view')
  getPermissions() {
    return this.employeesService.getPermissions();
  }
}
