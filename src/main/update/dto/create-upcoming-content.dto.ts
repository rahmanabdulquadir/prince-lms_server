import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export enum ContentType {
  VIDEO = 'video',
  COURSE = 'course',
}

export class CreateUpcomingContentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsUrl()
  bannerImage: string;

  @IsOptional()
  releaseDate?: Date;

  @IsEnum(ContentType)
  contentType: ContentType;
}
