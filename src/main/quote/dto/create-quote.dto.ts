import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuoteDto {
  @ApiProperty({
    example: "The only way to do great work is to love what you do.",
    description: 'The content of the quote',
  })
  @IsNotEmpty()
  quote: string;

  @ApiProperty({
    example: 'Steve Jobs',
    description: 'The author of the quote',
  })
  @IsNotEmpty()
  author: string;
}
