import { IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTermsCategoryDto {
  @ApiProperty({ example: 'Content Policy' })
  @IsString()
  title: string;

  @ApiProperty({ example: '2025-06-08' })
  @IsDateString()
  lastUpdated: string;
}
