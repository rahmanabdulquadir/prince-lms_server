import { IsArray, IsInt, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContentDto {
  @ApiProperty({ example: 'Intro to NestJS', description: 'The title of the content' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'https://video.cdn.com/nestjs-intro', description: 'The video or resource URL' })
  @IsString()
  url: string;

  @ApiProperty({ example: 120, description: 'Duration of the content in minutes/seconds' })
  @IsInt()
  duration: number;

  @ApiProperty({ example: ['nestjs', 'backend', 'typescript'], description: 'Relevant tags for this content', type: [String] })
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @ApiProperty({ example: 'a9b7d1c2-3f6a-46a3-8917-b0d40c9f5c5a', description: 'Associated module ID' })
  @IsString()
  moduleId: string;
}
