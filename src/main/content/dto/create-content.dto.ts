import { IsArray, IsInt, IsString } from 'class-validator';

export class CreateContentDto {
  @IsString()
  title: string;

  @IsString()
  url: string;

  @IsInt()
  duration: number;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsString()
  moduleId: string;
}
