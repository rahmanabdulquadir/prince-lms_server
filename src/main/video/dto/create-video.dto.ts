import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateVideoDto {
    @IsString()
    title: string;
  
    @IsString()
    description: string;
  
    @IsString()
    thumbnail: string;
  
    @IsString()
    videoUrl: string;
  
    @IsNumber()
    duration: number;
  
    @IsArray()
    @IsString({ each: true })
    tags: string[];
  
    @IsOptional()
    @IsBoolean()
    isFeatured?: boolean;
  }
  