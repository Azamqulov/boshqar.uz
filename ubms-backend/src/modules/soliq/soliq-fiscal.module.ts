import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { SoliqFiscalController } from './soliq-fiscal.controller';
import { SoliqFiscalService } from './soliq-fiscal.service';

@Module({
  imports: [PrismaModule],
  controllers: [SoliqFiscalController],
  providers: [SoliqFiscalService],
  exports: [SoliqFiscalService],
})
export class SoliqFiscalModule {}
