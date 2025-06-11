import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateContentDto {
  @ApiProperty({ example: 'Intro to NestJS', description: 'The title of the content' })
  @IsString()
  title: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'The video file to upload',
  })
  file: any; // Will be handled by interceptor, not validated here

  @ApiProperty({ example: 120, description: 'Duration of the content in seconds' })
  @IsInt()
  @Type(() => Number)
  duration: number;

  @ApiProperty({
    example: 'A beginner-friendly introduction to NestJS',
    description: 'Detailed description of the content',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: ['nestjs', 'backend', 'typescript'],
    description: 'Relevant tags for this content',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @ApiProperty({
    example: 'a9b7d1c2-3f6a-46a3-8917-b0d40c9f5c5a',
    description: 'Associated module ID',
  })
  @IsString()
  moduleId: string;

  @ApiProperty({
    example: 0,
    description: 'Number of times the content has been viewed',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  viewCount?: number;
}
