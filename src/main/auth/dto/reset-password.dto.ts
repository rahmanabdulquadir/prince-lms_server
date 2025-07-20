import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

// export class ResetPasswordDto {
//    @ApiProperty({
//       example: '',
//       description: 'Registered user email',
//     })
//   @IsString()
//   token: string;

//   @ApiProperty({example: ""})
//   @IsString()
//   @MinLength(6)
//   newPassword: string;
// }


import {  IsEmail } from 'class-validator';

export class VerifyPasswordOtpDto {
  @ApiProperty()
  userId: string

  @ApiProperty()
  @IsString()
  otp: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  userId: string

  @ApiProperty()
  @IsString()
  @MinLength(6)
  newPassword: string;
}