import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFAQCategoryDto {
  @ApiProperty({ example: 'Subscription' })
  @IsString()
  name: string;
}
