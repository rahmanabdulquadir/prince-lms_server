import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: '' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ example: '' })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
