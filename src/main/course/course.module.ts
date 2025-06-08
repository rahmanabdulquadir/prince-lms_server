import { Module } from '@nestjs/common';
import { CourseService } from './course.service';

@Module({
  providers: [CourseService]
})
export class CourseModule {}
