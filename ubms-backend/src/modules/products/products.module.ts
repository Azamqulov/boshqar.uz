import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController, CategoriesController, UnitsController } from './products.controller';

@Module({
  controllers: [ProductsController, CategoriesController, UnitsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
