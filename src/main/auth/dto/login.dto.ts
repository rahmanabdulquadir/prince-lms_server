import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'rahmanaq777@gmail.com',
    description: 'Registered user email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'user123',
    description: 'Password used during registration',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;
}
