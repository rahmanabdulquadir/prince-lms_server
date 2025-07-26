import { IsArray, IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVideoDto {
  @ApiProperty({ type: 'string', format: 'binary', description: 'Thumbnail image file' })
  thumbnail: any;

  @ApiProperty({ type: 'string', format: 'binary', description: 'Video file upload' })
  video: any;

  @ApiProperty({ example: 'Build a Portfolio with React and Tailwind' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'This video explains how to build a portfolio using React and Tailwind.' })
  @IsString()
  description: string;

  @ApiProperty({ example: ['react', 'portfolio', 'tailwind'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiProperty({ example: '2025-07-25T12:00:00Z' })
  @IsDateString()
  publishedAt: string;
}
