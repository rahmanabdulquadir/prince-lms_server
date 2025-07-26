import { IsArray, IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateVideoDto {
  @ApiProperty({ example: 'Build a Portfolio with React and Tailwind' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'This video explains how to build a portfolio.' })
  @IsString()
  description: string;

  // Removed videoUrl and thumbnailUrl from here

  @ApiProperty({ example: 'nextjs, react, tailwind' })
  @IsOptional()
  @IsString()
  tags?: string | string[];

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isFeatured?: boolean | string;

  @ApiProperty({ example: '2025-07-25T12:00:00Z' })
  @IsDateString()
  publishedAt: string;
}
