import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateModuleDto {
  @ApiProperty({
    example: 'Authentication Module',
    description: 'Title of the module',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'This module covers login, registration, and JWT authentication.',
    description: 'Detailed description of what this module includes',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: 'fe79a77e-6df9-4b93-aee8-8363b1e81693',
    description: 'The ID of the course this module belongs to',
  })
  @IsString()
  courseId: string;
}
