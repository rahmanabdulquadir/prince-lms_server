import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFiles,
    Body,
    Get,
    Query,
  } from '@nestjs/common';
  import { AnyFilesInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
  import { VideoService } from './video.service';
  import { CreateVideoDto } from './dto/create-video.dto';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
  
  @Controller('videos')
  export class VideoController {
    constructor(private readonly videoService: VideoService) {}
  
    @Post()
    @UseInterceptors(FileFieldsInterceptor([
      { name: 'thumbnail', maxCount: 1 },
      { name: 'video', maxCount: 1 },
    ]))
    @ApiConsumes('multipart/form-data')
    @ApiBody({ type: CreateVideoDto })
    createVideo(
      @UploadedFiles()
      files: {
        thumbnail?: Express.Multer.File[];
        video?: Express.Multer.File[];
      },
      @Body() body: CreateVideoDto,
    ) {
      const thumbnail = files.thumbnail?.[0];
      const video = files.video?.[0];
  
      // Example response
      return {
        message: 'Video uploaded successfully',
        data: {
          title: body.title,
          description: body.description,
          tags: body.tags,
          isFeatured: body.isFeatured,
          publishedAt: body.publishedAt,
          thumbnail: thumbnail?.originalname,
          video: video?.originalname,
        },
      };
    }
  
    @Get()
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
  