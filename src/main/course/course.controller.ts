import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { CourseService } from './course.service';

@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.courseService.create(createCourseDto);
  }

  @Get()
  findAll() {
    return this.courseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courseService.findOne(id);
  }
}
