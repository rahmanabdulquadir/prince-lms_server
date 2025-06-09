import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateSubscriptionDto {
  @ApiProperty({ example: 'plan-uuid' })
  @IsString()
  planId: string;

  @ApiProperty({ example: 'user-uuid' })
  @IsString()
  userId: string;
}
