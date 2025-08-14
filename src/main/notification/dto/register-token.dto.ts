import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class RegisterTokenDto {
  @ApiProperty({ example: 'fcm_device_token_here' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'android', enum: ['ios','android','web'] })
  @IsIn(['ios','android','web'])
  platform: 'ios' | 'android' | 'web';

  @ApiProperty({ example: 'en-US', required: false })
  @IsOptional()
  @IsString()
  locale?: string;
}
