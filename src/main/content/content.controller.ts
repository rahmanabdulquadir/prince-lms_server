import { Express } from 'express';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

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

  @Get('module/:moduleId')
  @ApiOperation({ summary: 'Get all contents under a specific module' })
  findByModule(@Param('moduleId') moduleId: string) {
    return this.contentService.findByModule(moduleId);
  }
}
