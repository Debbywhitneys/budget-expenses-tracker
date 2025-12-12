import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AccessTokenGuard } from '../auth/guards/access-token.guards';

@Controller('notifications')
@UseGuards(AccessTokenGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@Request() req, @Query('unread_only') unread_only?: string) {
    return this.notificationsService.findAll(
      req.user.user_id,
      unread_only === 'true',
    );
  }

  @Get('unread-count')
  getUnreadCount(@Request() req) {
    return this.notificationsService.getUnreadCount(req.user.user_id);
  }

  @Patch(':id/read')
  markAsRead(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.markAsRead(req.user.user_id, id);
  }

  @Patch('read-all')
  markAllAsRead(@Request() req) {
    return this.notificationsService.markAllAsRead(req.user.user_id);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.remove(req.user.user_id, id);
  }
}
