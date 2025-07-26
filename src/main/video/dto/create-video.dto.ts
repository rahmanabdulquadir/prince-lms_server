import { IsArray, IsBoolean, IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVideoDto {
  @ApiProperty({ example: 'Build a Portfolio with React and Tailwind', description: 'Title of the video' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'This video explains how to build a portfolio using React and Tailwind.', description: 'Description of the video' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'https://example.com/thumbnail.jpg', description: 'URL to the thumbnail image' })
  @IsString()
  thumbnailUrl: string;

  @ApiProperty({ example: 'https://example.com/video.mp4', description: 'URL to the actual video' })
  @IsString()
  videoUrl: string;

  @ApiProperty({ example: 300, description: 'Duration of the video in seconds' })
  @IsNumber()
  duration: number;

  @ApiProperty({ example: ['react', 'portfolio', 'tailwind'], description: 'List of tags related to the video', type: [String] })
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @ApiPropertyOptional({ example: true, description: 'Flag to mark the video as featured' })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiProperty({ example: '2025-07-25T12:00:00Z', description: 'Publish date of the video in ISO format' })
  @IsDateString()
  publishedAt: string; // or Date
}
