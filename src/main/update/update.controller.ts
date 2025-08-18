import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UpdateService } from './update.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateUpcomingContentDto } from './dto/create-upcoming-content.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
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

  @Patch('upcoming-updates/:id')
  @ApiOperation({ summary: 'Patch (partial) update for upcoming content' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(FileInterceptor('bannerImage'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CreateUpcomingContentDto,
    description: 'Update upcoming video/course content with optional banner image',
  })
  updateUpcoming(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: Partial<CreateUpcomingContentDto>, // Partial for patch
  ) {
    return this.updateService.updateUpcomingContent(id, dto, file);
  }

  @Delete('upcoming-updates/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  deleteUpcoming(@Param('id') id: string) {
    return this.updateService.deleteUpcomingContent(id);
  }
}
