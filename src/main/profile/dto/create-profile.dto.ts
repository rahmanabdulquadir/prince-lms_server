import { IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';

export class CreateProfileDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  occupation?: string;

  @IsOptional()
  @IsDateString()
  birthday?: string;

//   @IsOptional()
//   @IsEnum(Gender)
//   gender?: Gender;

  @IsOptional()
  @IsString()
  linkedin?: string;

  @IsOptional()
  @IsString()
  twitter?: string;

  @IsOptional()
  @IsString()
  facebook?: string;

  @IsOptional()
  @IsString()
  instagram?: string;
}
