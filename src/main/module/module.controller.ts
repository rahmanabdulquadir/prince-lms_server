import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ModuleService } from './module.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('modules')
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @Post()
  create(@Body() dto: CreateModuleDto) {
    return this.moduleService.create(dto);
  }

@Get('/course/:courseId')
 @ApiBearerAuth()
@UseGuards(JwtAuthGuard)
async getCourseModules(@Param('courseId') courseId: string, @Request() req) {
  const userId = req.user.id;
  return this.moduleService.getCourseModulesWithProgress(courseId, userId);
}
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.moduleService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateModuleDto) {
    return this.moduleService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.moduleService.delete(id);
  }
}
