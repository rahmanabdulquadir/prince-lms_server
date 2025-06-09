import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateKeyPointDto {
  @ApiProperty({ example: 'Users cannot redistribute premium content' })
  @IsString()
  point: string;

  @ApiProperty({ example: 'category-uuid' })
  @IsString()
  categoryId: string;
}
