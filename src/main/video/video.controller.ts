import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  Body,
  Get,
  Query,
} from '@nestjs/common';
import {
  AnyFilesInterceptor,
  FileFieldsInterceptor,
} from '@nestjs/platform-express';
import { VideoService } from './video.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { ApiBody, ApiConsumes, ApiQuery } from '@nestjs/swagger';

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
        publishedAt: {
          type: 'string',
          format: 'date-time',
          example: '2025-06-21T12:00:00Z',
        },
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
    return this.videoService.findAllVideos(+page, +limit);
  }

  @Get('featured')
  getFeatured() {
    return this.videoService.findFeaturedVideos();
  }

  @Get('recent')
  getRecent() {
    return this.videoService.findRecentVideos(5);
  }
}
