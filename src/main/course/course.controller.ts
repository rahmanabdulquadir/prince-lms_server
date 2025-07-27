import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { CourseService } from './course.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiBody, ApiTags, ApiQuery } from '@nestjs/swagger';
import { UpdateCourseDto } from './dto/update-course.dto';

@ApiTags('Courses')
@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('thumbnail'))
  @ApiBody({
    type: CreateCourseDto,
    description: 'Create course with optional thumbnail image upload',
  })
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createCourseDto: CreateCourseDto,
  ) {
    return this.courseService.create(createCourseDto, file);
  }

  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  findAll(@Query('page') page = '1', @Query('limit') limit = '10') {
    return this.courseService.findAll(+page, +limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courseService.findOne(id);
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('thumbnail'))
  @ApiBody({
    type: UpdateCourseDto,
    description: 'Update course with optional thumbnail image upload',
  })
  update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.courseService.update(id, updateCourseDto, file);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.courseService.delete(id);
  }

  @Get('search')
  search(@Query('query') query: string) {
    console.log('🔔 Controller Hit. Query:', query); // <-- ADD THIS LOG
    return this.courseService.searchCourses(query);
  }
}
