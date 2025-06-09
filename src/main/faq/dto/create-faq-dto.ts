import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFAQDto {
  @ApiProperty({ example: 'How do I cancel my subscription?' })
  @IsString()
  question: string;

  @ApiProperty({ example: 'You can cancel from the billing section.' })
  @IsString()
  answer: string;

  @ApiProperty({ example: 'category-uuid-here' })
  @IsString()
  categoryId: string;
}
