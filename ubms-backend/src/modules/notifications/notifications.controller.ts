import { Controller, Get, Put, Param } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CurrentBusinessId, CurrentUser } from '../../common/decorators/context.decorator';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@CurrentBusinessId() businessId: string, @CurrentUser('userId') userId: string) {
    return this.notificationsService.findAll(businessId, userId);
  }

  @Put(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Put('read-all')
  markAllAsRead(@CurrentBusinessId() businessId: string, @CurrentUser('userId') userId: string) {
    return this.notificationsService.markAllAsRead(businessId, userId);
  }
}
