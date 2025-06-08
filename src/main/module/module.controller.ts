import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ModuleService } from './module.service';
import { CreateModuleDto } from './dto/create-module.dto';

@Controller('modules')
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @Post()
  create(@Body() dto: CreateModuleDto) {
    return this.moduleService.create(dto);
  }

  @Get('course/:courseId')
  findByCourse(@Param('courseId') courseId: string) {
    return this.moduleService.findByCourse(courseId);
  }
}
