import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';

@Injectable()
export class CourseService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateCourseDto) {
    return this.prisma.course.create({ data });
  }

  findAll() {
    return this.prisma.course.findMany({ include: { modules: true } });
  }

  findOne(id: string) {
    return this.prisma.course.findUnique({ where: { id }, include: { modules: true } });
  }
}
