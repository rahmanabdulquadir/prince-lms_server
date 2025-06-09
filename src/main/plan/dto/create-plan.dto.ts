import { IsEnum, IsNumber, IsOptional, IsString, IsArray } from 'class-validator';
import { PlanType, PlanStatus } from '@prisma/client';

export class CreatePlanDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  price: number;

  @IsArray()
  @IsString({ each: true })
  features: string[];

  @IsEnum(PlanType)
  planType: PlanType;

  @IsOptional()
  @IsEnum(PlanStatus)
  status?: PlanStatus = PlanStatus.ACTIVE;
}
