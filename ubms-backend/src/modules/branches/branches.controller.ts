import { Controller, Get, Post, Put, Body, Param, Headers } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { CurrentBusinessId } from '../../common/decorators/context.decorator';
import { RequirePermission } from '../../common/decorators/custom.decorator';

@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  @RequirePermission('branches.view')
  findAll(@CurrentBusinessId() businessId: string) {
    return this.branchesService.findAll(businessId);
  }

  @Get(':id')
  @RequirePermission('branches.view')
  findOne(@CurrentBusinessId() businessId: string, @Param('id') id: string) {
    return this.branchesService.findOne(businessId, id);
  }

  @Post()
  @RequirePermission('branches.create')
  create(@CurrentBusinessId() businessId: string, @Body() body: any) {
    return this.branchesService.create(businessId, body);
  }

  @Put(':id')
  @RequirePermission('branches.create')
  update(@CurrentBusinessId() businessId: string, @Param('id') id: string, @Body() body: any) {
    return this.branchesService.update(businessId, id, body);
  }
}
