import { IsOptional, IsString, IsArray, IsBoolean, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateVideoDto {
  @ApiPropertyOptional({
    description: 'Title of the video',
    example: 'Intro to NestJS',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Description of the video',
    example: 'This video explains the basics of NestJS framework.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Tags related to the video',
    example: ['nestjs', 'backend', 'typescript'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[] | string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Thumbnail image to upload',
  })
  @IsOptional()
  thumbnail?: Express.Multer.File;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Video file to upload',
  })
  @IsOptional()
  video?: Express.Multer.File;

  @ApiPropertyOptional({
    description: 'Mark the video as featured or not',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  isFeatured?: boolean | string;

  @ApiPropertyOptional({
    description: 'Duration of the video in seconds',
    example: 120,
    type: Number,
  })
  @IsOptional()
  duration?: number;
}
