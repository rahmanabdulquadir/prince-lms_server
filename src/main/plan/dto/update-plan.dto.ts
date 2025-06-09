import { PartialType } from '@nestjs/swagger';
import { CreatePlanDto } from './create-plan.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PlanStatus } from '@prisma/client';

export class UpdatePlanDto extends PartialType(CreatePlanDto) {
  @ApiPropertyOptional({
    enum: PlanStatus,
    example: PlanStatus.ACTIVE,
    description: 'Status of the plan (e.g. ACTIVE, INACTIVE)',
  })
  @IsOptional()
  @IsEnum(PlanStatus)
  status?: PlanStatus;
}
