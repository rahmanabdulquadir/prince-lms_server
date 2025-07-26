import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { VideoService } from "./video.service";
import { CreateVideoDto } from "./dto/create-video.dto";

@Controller('videos')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post()
  create(@Body() dto: CreateVideoDto) {
    return this.videoService.createVideo(dto);
  }

  @Get()
  getAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.videoService.getAllVideos(+page, +limit);
  }

  @Get('featured')
  getFeatured() {
    return this.videoService.getFeaturedVideos();
  }

  @Get('recent')
  getRecent(@Query('limit') limit = 6) {
    return this.videoService.getRecentVideos(+limit);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.videoService.getVideoById(id);
  }
}
