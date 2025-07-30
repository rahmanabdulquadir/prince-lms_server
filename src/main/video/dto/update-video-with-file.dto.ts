// src/video/dto/update-video-with-file.dto.ts
import { PartialType } from '@nestjs/swagger';
import { UpdateVideoDto } from './update-video.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateVideoDtoWithFile extends UpdateVideoDto {
    @ApiPropertyOptional({ type: 'string', format: 'binary' })
    videos?: any;
  
    @ApiPropertyOptional({ type: 'string', format: 'binary' })
    thumbnailUrl?: any;
  }
