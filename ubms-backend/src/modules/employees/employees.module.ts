import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesController, RolesController } from './employees.controller';

@Module({
  controllers: [EmployeesController, RolesController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
