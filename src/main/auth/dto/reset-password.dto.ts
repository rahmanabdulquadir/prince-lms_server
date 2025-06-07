import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
   @ApiProperty({
      example: '',
      description: 'Registered user email',
    })
  @IsString()
  token: string;

  @ApiProperty({example: ""})
  @IsString()
  @MinLength(6)
  newPassword: string;
}
