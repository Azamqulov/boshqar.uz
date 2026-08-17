import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { EventsGateway } from './events.gateway';
import { PrismaModule } from '../../prisma/prisma.module';

@Global()
@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET!,
    }),
  ],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class WebSocketsModule {}
