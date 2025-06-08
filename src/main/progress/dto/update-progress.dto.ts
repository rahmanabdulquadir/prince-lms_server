import { PartialType } from '@nestjs/mapped-types';
import { CreateProgressDto } from './create-progress.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateProgressDto extends PartialType(CreateProgressDto) {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}
