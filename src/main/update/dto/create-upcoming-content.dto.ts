import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ContentType {
  VIDEO = 'video',
  COURSE = 'course',
}

export class CreateUpcomingContentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ type: 'string', format: 'binary' }) // File upload
  bannerImage: any;

  @ApiProperty({ required: false })
  @IsOptional()
  releaseDate?: Date;

  @ApiProperty({ enum: ContentType })
  @IsEnum(ContentType)
  contentType: ContentType;
}
