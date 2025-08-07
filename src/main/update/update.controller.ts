import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UpdateService } from './update.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateUpcomingContentDto } from './dto/create-upcoming-content.dto';

@Controller('updates')
export class UpdateController {
  constructor(private readonly updateService: UpdateService) {}

  @Post('upcoming-updates')
  @UseGuards(JwtAuthGuard) // Replace with your admin guard
  createUpcoming(@Body() dto: CreateUpcomingContentDto) {
    return this.updateService.createUpcomingContent(dto);
  }

  @Get('upcoming-updates')
  getUpcomingUpdates() {
    return this.updateService.getUpcomingContent();
  }
}
