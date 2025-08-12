import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UpdateService } from './update.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateUpcomingContentDto } from './dto/create-upcoming-content.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from 'src/common/guard/AdminGuard';

@ApiTags('Updates')
@Controller('updates')
export class UpdateController {
  constructor(private readonly updateService: UpdateService) {}

  @Post('upcoming-updates')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard) // You can replace this with AdminGuard if needed
  @UseInterceptors(FileInterceptor('bannerImage'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CreateUpcomingContentDto,
    description: 'Create upcoming video/course content with banner image', 
  })
  createUpcoming(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateUpcomingContentDto,
  ) {
    return this.updateService.createUpcomingContent(dto, file);
  }

  @Get('upcoming-updates')
  getUpcomingUpdates() {
    return this.updateService.getUpcomingContent();
  }

  
}
