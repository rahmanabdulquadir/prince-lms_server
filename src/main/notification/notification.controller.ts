import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { RegisterTokenDto } from './dto/register-token.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register (or update) a device token' })
  @ApiBody({ type: RegisterTokenDto })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async register(@Body() dto: RegisterTokenDto, @Req() req: any) {
    return this.service.registerToken(dto.token, dto.platform, req.user?.id, dto.locale);
  }

  @Delete('register/:token')
  @ApiOperation({ summary: 'Unregister a device token' })
  async unregister(@Param('token') token: string) {
    return this.service.unregisterToken(token);
  }

  @Post('broadcast/test')
  @ApiOperation({ summary: 'Send a test broadcast to topic' })
  @UseGuards(JwtAuthGuard) // and AdminGuard in production
  @ApiBearerAuth()
  async testBroadcast() {
    return this.service.broadcastToTopic({
      title: 'Test',
      body: 'This is a test broadcast',
      contentType: 'system',
    });
  }

  @Get('feed')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  async myFeed(@Req() req: any, @Query('page') page = '1', @Query('limit') limit = '20') {
    return this.service.listMyNotifications(req.user.id, +page, +limit);
  }

  @Post(':id/read')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async readOne(@Param('id') id: string, @Req() req: any) {
    return this.service.markRead(req.user.id, id);
  }
}
