import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  Body,
  Get,
  Query,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  AnyFilesInterceptor,
  FileFieldsInterceptor,
} from '@nestjs/platform-express';
import { VideoService } from './video.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: { id: string }; // Extend based on your JWT payload
}

@Controller('videos')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload video and thumbnail files',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        tags: {
          type: 'string',
          example: 'react,tailwind,portfolio',
          description: 'Comma-separated list of tags',
        },
        isFeatured: { type: 'boolean', example: true },
        video: {
          type: 'string',
          format: 'binary',
        },
        thumbnail: {
          type: 'string',
          format: 'binary',
        },
      },
      required: [
        'title',
        'description',
        'tags',
        'publishedAt',
        'video',
        'thumbnail',
      ],
    },
  })
  async uploadVideo(
    @Body() dto: CreateVideoDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const videoFile = files.find((file) => file.fieldname === 'video');
    const thumbnailFile = files.find((file) => file.fieldname === 'thumbnail');

    if (!videoFile || !thumbnailFile) {
      throw new Error('Both video and thumbnail files are required');
    }

    return this.videoService.create(dto, videoFile, thumbnailFile);
  }

  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  async getAll(@Query('page') page = '1', @Query('limit') limit = '10') {
    return this.videoService.getAllVideos(+page, +limit);
  }

  @Get('featured')
  getFeatured() {
    return this.videoService.findFeaturedVideos();
  }

  @Get('recent')
  getRecent() {
    return this.videoService.findRecentVideos(5);
  }

  @Get(':id/view-count')
  async incrementView(@Param('id') id: string) {
    return this.videoService.incrementViews(id);
  }

  @Delete(':id')
  async deleteVideo(@Param('id') id: string) {
    return this.videoService.delete(id);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async like(@Param('id') videoId: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.videoService.likeVideo(videoId, userId);
  }

  @Delete(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async unlike(@Param('id') videoId: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.videoService.unlikeVideo(videoId, userId);
  }

  @Get(':id/likes')
  async getLikeCount(@Param('id') videoId: string) {
    return this.videoService.getLikeCount(videoId);
  }

  @Get('search')
  async searchVideos(@Query('query') query: string) {
    return this.videoService.searchVideos(query);
  }
}
