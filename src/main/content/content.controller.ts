import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';

@Controller('contents')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post()
  create(@Body() dto: CreateContentDto) {
    return this.contentService.create(dto);
  }

  @Get('module/:moduleId')
  findByModule(@Param('moduleId') moduleId: string) {
    return this.contentService.findByModule(moduleId);
  }
}
