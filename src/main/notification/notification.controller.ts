import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { RegisterTokenDto } from './dto/register-token.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register (or update) a device token',
    description:
      'Used by the mobile app to register a device token for push notifications.',
  })
  @ApiBody({
    type: RegisterTokenDto,
    examples: {
      example: {
        value: {
          token: 'fcm_device_token_here',
          platform: 'ios', // or "android"
          locale: 'en',
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async register(@Body() dto: RegisterTokenDto, @Req() req: any) {
    return this.service.registerToken(
      dto.token,
      dto.platform,
      req.user?.id,
      dto.locale,
    );
  }

  @Delete('register/:token')
  @ApiOperation({
    summary: 'Unregister a device token',
    description: 'Removes a previously registered device token.',
  })
  @ApiParam({
    name: 'token',
    description: 'The FCM token you want to unregister',
    example: 'fcm_device_token_here',
  })
  async unregister(@Param('token') token: string) {
    return this.service.unregisterToken(token);
  }

  @Post('broadcast/test')
  @ApiOperation({
    summary: 'Send a test broadcast to topic',
    description:
      'Admin-only. Sends a test notification to all users subscribed to the topic.',
  })
  @UseGuards(JwtAuthGuard) // Later you can add AdminGuard here
  @ApiBearerAuth()
  async testBroadcast() {
    return this.service.broadcastToAll({
      title: 'Test',
      body: 'This is a test broadcast',
      contentType: 'system',
    });
  }

  @Get('feed')
  @ApiOperation({
    summary: 'Get my notifications feed',
    description: 'Returns a paginated list of notifications for the logged-in user.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  async myFeed(
    @Req() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.service.listMyNotifications(req.user.id, +page, +limit);
  }

  @Post(':id/read')
  @ApiOperation({
    summary: 'Mark a notification as read',
    description: 'Marks the given notification as read for the logged-in user.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiParam({ name: 'id', description: 'Notification ID', example: 'notif123' })
  async readOne(@Param('id') id: string, @Req() req: any) {
    return this.service.markRead(req.user.id, id);
  }
}
