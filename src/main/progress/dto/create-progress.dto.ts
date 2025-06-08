import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateProgressDto {
  @ApiProperty({ minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  percentage: number;

  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  courseId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  contentId?: string;
}
