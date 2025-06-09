import { IsEnum, IsNumber, IsOptional, IsString, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlanType, PlanStatus } from '@prisma/client';

export class CreatePlanDto {
  @ApiProperty({
    example: 'Pro Plan',
    description: 'The name of the subscription plan',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'Get access to all premium content and features',
    description: 'A short description of the plan',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 19.99,
    description: 'The price of the plan in USD',
  })
  @IsNumber()
  price: number;

  @ApiProperty({
    example: ['Unlimited content access', 'Priority support', 'Community access'],
    description: 'List of features included in the plan',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  features: string[];

  @ApiProperty({
    enum: PlanType,
    example: PlanType.MONTHLY,
    description: 'Type of the plan (e.g. MONTHLY, YEARLY)',
  })
  @IsEnum(PlanType)
  planType: PlanType;

  @ApiPropertyOptional({
    enum: PlanStatus,
    example: PlanStatus.ACTIVE,
    description: 'Status of the plan (e.g. ACTIVE, INACTIVE)',
  })
  @IsOptional()
  @IsEnum(PlanStatus)
  status?: PlanStatus = PlanStatus.ACTIVE;
}
