import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsBoolean()
  isPaid: boolean;

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsArray()
  @IsString({ each: true })
  category: string[];
}
