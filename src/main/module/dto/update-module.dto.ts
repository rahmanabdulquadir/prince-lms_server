import { PartialType } from '@nestjs/swagger';
import { CreateModuleDto } from './create-module.dto';

export class UpdateModuleDto extends PartialType(CreateModuleDto) {}
