import { Express } from 'express';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Contents')
@Controller('contents')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post()
  @ApiOperation({ summary: 'Upload new video content' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    description: 'Form data to upload content with video file',
    type: CreateContentDto,
  })
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateContentDto,
  ) {
    return this.contentService.create(dto, file);
  }

  @Patch(':id/view')
  @ApiOperation({ summary: 'Increment view count for a specific content' })
  incrementView(@Param('id') id: string) {
    return this.contentService.incrementViewCount(id);
  }

  @Get('module/:moduleId')
  @ApiOperation({ summary: 'Get all contents under a specific module' })
  findByModule(@Param('moduleId') moduleId: string) {
    return this.contentService.findByModule(moduleId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a specific content by ID' })
  delete(@Param('id') id: string) {
    return this.contentService.delete(id);
  }

  @Get('module/:moduleId/contents')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard) // Your auth guard to get req.user
  async getContentsForModule(
    @Param('moduleId') moduleId: string,
    @Req() req: any,
  ) {
    const userId = req.user.id; // depends on your auth middleware
    return this.contentService.getModuleContentsWithProgress(moduleId, userId);
  }

  @Post('contents/:contentId/complete')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async markAsCompleted(
    @Param('contentId') contentId: string,
    @Req() req: any,
  ) {
    const userId = req.user.id;
  
    return this.contentService.markContentAsCompleted(contentId, userId);
  }
}
