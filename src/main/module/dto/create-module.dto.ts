import { IsString } from 'class-validator';

export class CreateModuleDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  courseId: string;
}
