import { Controller, Get, Param, Post, Body, Patch, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Notification')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  create(@Body() dto: CreateNotificationDto) {
    return this.notificationService.create(dto);
  }

  @Get()
  findAllByUser(@CurrentUser('id') userId: string) {
    return this.notificationService.findAllByUser(userId);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id);
  }
}
