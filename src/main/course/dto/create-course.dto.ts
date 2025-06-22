import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateCourseDto {
  @ApiProperty({
    example: 'NestJS Fundamentals',
    description: 'The title of the course',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example:
      'Learn the core features of NestJS like modules, services, and controllers.',
    description: 'A short description of the course content',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: true,
    description: 'Indicates whether the course is paid or free',
  })
  @IsBoolean()
  @Type(() => Boolean)
  isPaid: boolean;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Thumbnail image file',
  })
  @IsOptional()
  thumbnail?: any; // Will receive the file as `Express.Multer.File`

  @ApiProperty({
    example: ['backend', 'nestjs', 'typescript'],
    description: 'Tags or categories associated with the course',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  category: string[] | string;
}
